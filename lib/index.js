const axios = require('axios');
const retryPromise = require('./retryPromise');

class doxieNode {
  constructor({
    username = 'doxie',
    password,
    token = null,
    doxieURL,
    doxiePort = 8080
  }) {
    this.username = username;
    this.password = password || process.env.DOXIE_PASSWORD || null;
    this.doxieURL = doxieURL || process.env.DOXIE_URL;
    this.doxiePort = doxiePort || process.env.DOXIE_PORT;
    this.token = token;
    this.axiosInstance = null;

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

    if (this.username && this.password && !this.token) {
      this.token = `Basic ${Buffer.from(
        `${this.username} :'${this.password}`
      ).toString('base64')} `;
    }
  }

  getBaseURL() {
    return `${this.doxieURL}:${this.doxiePort}`;
  }

  getInitializedApi() {
    if (this.axiosInstance) return this.axiosInstance;
    let axiosDefault = {
      baseURL: this.getBaseURL()
    };
    if (this.token) axiosDefault.headers = { Authorization: this.token };
    return (this.axiosInstance = axios.create(axiosDefault));
  }

  async get(url, responseType = 'application/json', ...args) {
    return this.getInitializedApi().get(url, { responseType, ...args });
  }

  async post(url, data, ...args) {
    return this.getInitializedApi().post(url, { data, ...args });
  }

  async delete(url, data, headers) {
    return this.getInitializedApi().delete(url, {
      body: data,
      headers: headers
    });
  }

  /**
   * Returns All available status information
   * Note: Doxie Q and Doxie Go SE this call includes firmware version
   * @returns {Object} status information
   * @memberof doxieNode
   */
  async hello() {
    return this.get(`/hello.json`);
  }

  /**
   * returns additional status values
   * Note: Deprecated for Doxie Q and Doxie Go SE
   * @returns {Object} {firmware: "0.26", connectedToExternalPower: true}
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
    return this.get(url);
  }

  /**
   *
   *
   * @param {String} scanPath
   * @returns stream for image
   * @memberof doxieNode
   */
  async get_scan(scanPath, retries = 2) {
    const url = `/scans${scanPath}`;
    return retryPromise(
      bail => {
        return this.get(url, 'stream').then(res => {
          return res;
        });
      },
      { retries: retries }
    );
  }

  /**
   *
   * thumbnails are constrained to fit 240x240 pixels
   * thumbnails for new scans are not generated until
   * after the scan has been made available in /scans.json
   * Retrying after delay recommended.
   * @param {String} scanPath
   * @param {Number} retries - number of retries to attempt (default: 3)
   * @returns stream of thumbnail for the scan
   * @memberof doxieNode
   */
  async get_thumbnail(scanPath, retries = 2) {
    const url = `/thumbnails${scanPath}`;
    return retryPromise(
      bail => {
        return this.get(url, 'stream').then(res => {
          return res;
        });
      },
      { retries: retries }
    );
  }

  /**
   *
   * Deletes the scan at the specified path
   * @param {String} scanPath
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
   * @param {Array<String>} scanPaths
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
