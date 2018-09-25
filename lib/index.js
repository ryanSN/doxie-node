const fetch = require('node-fetch');

const handleError = err => new Promise(reject => reject(err));

class doxieNode {
  constructor({ username = 'doxie', password, doxieURL, doxiePort }) {
    this.username = username;
    this.password = password;
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

  async handleRequest(config, selector) {}

  async hello() {
    const res = await fetch(`${this.getBaseURL()}/hello.json`);
    return await res.json();
  }

  async scanner_status() {
    const res = await fetch(`${this.getBaseURL()}/hello_extra.json`);
    return await res.json();
  }

  async restart({ username, password } = {}) {}

  async list_all_scans({ username, password } = {}) {}

  // returns the path to the last scan available
  async most_recent_scan({ username, password } = {}) {
    const url = '/scans/recent.json';
  }

  async get_scan(scanPath) {
    const url = `/scans${scanPath}`;
  }

  async get_thumbnail(scanPath) {
    const url = `/thumbnails${scanPath}`;
  }

  async delete_scan(scanPath) {
    const url = `/scans${scanPath}`;
  }

  async delete_mutiple_scans(scanPaths) {
    // scanPaths should POST an array of paths
    const url = `/scans/delete.json`;
  }
}

module.exports = doxieNode;
