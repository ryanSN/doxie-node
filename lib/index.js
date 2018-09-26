const fetch = require('node-fetch');

const _handleError = response => {
  if (!response.ok) {
    new Promise(reject => reject(response.statusText));
  }
  return response;
};

const _getHeaders = (username, password) => {
  const headers = {};
  if (username && password) {
    headers.Authorization =
      'Basic ' +
      new Buffer.from(this.username + ':' + this.password, 'utf8').toString(
        'base64'
      );
  }
};

const timeout = (ms, promise) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      reject(new Error('The action has timed out'));
    }, ms);
    promise.then(resolve, reject);
  });
};

class doxieNode {
  constructor({ username = 'doxie', password, doxieURL, doxiePort = 8080 }) {
    this.username = username;
    this.password = password || process.env.DOXIE_PASSWORD || null;
    this.doxieURL = doxieURL || process.env.DOXIE_URL;
    this.doxiePort = doxiePort || process.env.DOXIE_PORT;

    if (!this.doxieURL) {
      console.error(
        'No doxieURL found! ' +
          'supply it as an argument or use the DOXIE_URL env variable. '
      );
    }
    if (!this.doxiePort) {
      console.error(
        'No doxiePort found! ' +
          'supply it as an argument or use the DOXIE_PORT env variable. '
      );
    }
  }

  getBaseURL() {
    return `${this.doxieURL}:${this.doxiePort}`;
  }

  async handleRequest(url, options) {
    return timeout(300, fetch(`${this.getBaseURL()}${url}`, options))
      .then(_handleError)
      .then(response => response.json())
      .catch(error => {
        throw Error(error);
      });
  }

  async get(url) {
    return this.handleRequest(url, {
      method: 'get'
    });
  }

  async post(url, data, headers) {
    return this.handleRequest(url, {
      method: 'post',
      body: data,
      headers: headers
    });
  }

  async delete(url, data, headers) {
    return this.handleRequest(url, {
      method: 'delete',
      body: data,
      headers: headers
    });
  }

  /**
   *
   *
   * @returns {object} status information
   * @memberof doxieNode
   */
  async hello() {
    return this.get(`/hello.json`);
  }

  /**
   * returns additional status values
   * @returns {object} {firmware: "0.26", connectedToExternalPower: true}
   * @memberof doxieNode
   */
  async scanner_status() {
    return this.get(`/hello_extra.json`);
  }

  /**
   *
   * restarts the scanner's Wi-Fi system
   * @returns 204 No Content
   * @memberof doxieNode
   */
  async restart() {
    return this.get(`/restart.json`);
  }

  /**
   *
   * Calling this function immediately after scanning may
   * return a blank result recommended to retry if
   * successful HTTP status code but blank body.
   * @returns {array} of all current scans in scanners memory
   * @memberof doxieNode
   */
  async list_all_scans() {
    return this.get(`/scans.json`);
  }

  // returns the path to the last scan available
  async most_recent_scan() {
    const url = '/scans/recent.json';
  }

  /**
   *
   *
   * @param {string} scanPath
   * @returns JPG
   * @memberof doxieNode
   */
  async get_scan(scanPath) {
    const url = `/scans${scanPath}`;
    return this.post(url);
  }

  /**
   *
   * thumbnails are constrained to fit 240x240 pixels
   * thumbnails for new scans are not generated until
   * after the scan has been made available in /scans.json
   * Retrying after delay recommended.
   * @param {string} scanPath
   * @returns thumbnail of the scan
   * @memberof doxieNode
   */
  async get_thumbnail(scanPath) {
    const url = `/thumbnails${scanPath}`;
    return this.post(url);
  }

  /**
   *
   * Deletes the scan at the specified path
   * @param {string} scanPath
   * @returns 204 No Content  || 403 Forbidden on error
   * @memberof doxieNode
   */
  async delete_scan(scanPath) {
    const url = `/scans${scanPath}`;
    return this.delete(url);
  }

  /**
   *
   * deletes multiple scans in a single op.
   * @param {Array<string>} scanPaths
   * @returns 204 No Content
   * @memberof doxieNode
   */
  async delete_multiple_scans(scanPaths) {
    // scanPaths should POST an array of paths
    const url = `/scans/delete.json`;
    return this.post(url, scanPaths);
  }
}

module.exports = doxieNode;
