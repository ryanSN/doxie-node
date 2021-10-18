const doxieNode = require('../lib');
const nock = require('nock');
const fs = require('fs');

describe('doxie go initialize', () => {
  let spy = {};

  beforeEach(() => {
    spy.console = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    spy.console.mockRestore();
  });

  it('should console.error is missing url', () => {
    doxie = new doxieNode({ doxiePort: 8080 });
    expect(console.error).toHaveBeenCalled();
    expect(spy.console.mock.calls[0][0]).toContain(
      'No doxieURL found! supply it as an argument or use the DOXIE_URL env variable.'
    );
  });

  it('should console.error if missing port', () => {
    doxie = new doxieNode({
      doxieURL: 'https://www.fake.url',
      doxiePort: null
    });
    expect(console.error).toHaveBeenCalled();
    expect(spy.console.mock.calls[0][0]).toContain(
      'No doxiePort found! supply it as an argument or use the DOXIE_PORT env variable.'
    );
  });

  it('should create token if username password passed', () => {
    doxie = new doxieNode({
      username: 'doxie',
      password: 'password1',
      doxieURL: 'https://www.fake.url',
      doxiePort: null
    });
    expect(doxie.token).not.toBeNull();
  });
});

describe('doxie go JSON API', () => {
  const baseApiUrl = 'https://www.fake.url';
  const basePort = 8080;
  let doxie;

  beforeEach(() => {
    // https://github.com/nock/nock#disabling-requests
    nock.disableNetConnect();
    doxie = new doxieNode({ doxieURL: baseApiUrl, doxiePort: basePort });
  });

  afterEach(() => {
    nock.cleanAll();
    jest.restoreAllMocks();
  });

  describe('hello', () => {
    it('should return /hello.json on existing network', async () => {
      const spy = jest.spyOn(doxie, 'getInitializedApi');
      const data = {
        model: 'DX250',
        name: 'Doxie_042D6A',
        firmwareWiFi: '1.29',
        hasPassword: false,
        MAC: '00:11:E5:04:2D:6A',
        mode: 'AP'
      };
      nock(`${baseApiUrl}:${basePort}`)
        .defaultReplyHeaders({
          'Content-Type': 'application/json'
        })
        .get('/hello.json')
        .reply(200, data);

      return doxie.hello().then(res => {
        expect(spy).toHaveBeenCalled();
        expect(res.data).toEqual(data);
      });
    });
    it('should return /hello.json on own network', async () => {
      const spy = jest.spyOn(doxie, 'getInitializedApi');
      const data = {
        model: 'DX250',
        name: 'Doxie_042D6A',
        firmwareWiFi: '1.29',
        hasPassword: false,
        MAC: '00:11:E5:04:2D:6A',
        mode: 'Client',
        network: 'Apparent',
        ip: '10.0.0.100'
      };
      nock(`${baseApiUrl}:${basePort}`)
        .defaultReplyHeaders({
          'Content-Type': 'application/json'
        })
        .get('/hello.json')
        .reply(200, data);

      return doxie.hello().then(res => {
        expect(spy).toHaveBeenCalled();
        expect(res.data).toEqual(data);
      });
    });
  });

  describe('scanner_status', () => {
    it('should return scanner status', () => {
      const spy = jest.spyOn(doxie, 'getInitializedApi');
      const data = {
        firmware: '0.26',
        connectedToExternalPower: true
      };
      nock(`${baseApiUrl}:${basePort}`)
        .defaultReplyHeaders({
          'Content-Type': 'application/json'
        })
        .get('/hello_extra.json')
        .reply(200, data);

      return doxie.scanner_status().then(res => {
        expect(spy).toHaveBeenCalled();
        expect(res.data).toEqual(data);
      });
    });
  });

  describe('restart', () => {
    it('should return 204 status', () => {
      const spy = jest.spyOn(doxie, 'getInitializedApi');
      nock(`${baseApiUrl}:${basePort}`)
        .defaultReplyHeaders({
          'Content-Type': 'application/json'
        })
        .get('/restart.json')
        .reply(204);

      return doxie.restart().then(res => {
        expect(spy).toHaveBeenCalled();
        expect(res.data).toEqual('');
      });
    });
  });

  describe('list_all_scans', () => {
    it('should return a list of scans', () => {
      const spy = jest.spyOn(doxie, 'getInitializedApi');
      const data = [
        {
          name: '/DOXIE/JPEG/IMG_0001.JPG',
          size: 241220,
          modified: '2010-05-01 00:10:06'
        },
        {
          name: '/DOXIE/JPEG/IMG_0002.JPG',
          size: 265085,
          modified: '2010-05-01 00:09:26'
        },
        {
          name: '/DOXIE/JPEG/IMG_0003.JPG',
          size: 273522,
          modified: '2010-05-01 00:09:44'
        }
      ];
      nock(`${baseApiUrl}:${basePort}`)
        .defaultReplyHeaders({
          'Content-Type': 'application/json'
        })
        .get('/scans.json')
        .reply(200, data);

      return doxie.list_all_scans().then(res => {
        expect(spy).toHaveBeenCalled();
        expect(res.data).toEqual(data);
      });
    });
  });

  describe('most_recent_scan', () => {
    it('should return a most recent scan', () => {
      const spy = jest.spyOn(doxie, 'getInitializedApi');
      const data = { path: '/DOXIE/JPEG/IMG_0003.JPG' };
      nock(`${baseApiUrl}:${basePort}`)
        .defaultReplyHeaders({
          'Content-Type': 'application/json'
        })
        .get('/scans/recent.json')
        .reply(200, data);

      return doxie.most_recent_scan().then(res => {
        expect(spy).toHaveBeenCalled();
        expect(res.data).toEqual(data);
      });
    });
  });

  describe('get_scan', () => {
    it('should return a file stream', () => {
      const spy = jest.spyOn(doxie, 'getInitializedApi');
      const scan = '/DOXIE/JPEG/IMG_0003.JPG';
      nock(`${baseApiUrl}:${basePort}`)
        .get(`/scans${scan}`)
        .reply(200, fs.createReadStream(__filename));

      return doxie.get_scan(scan).then(res => {
        expect(spy).toHaveBeenCalled();
        expect(res.status).toEqual(200);
        let stream = res.data;
        let string = '';
        stream.on('data', chunk => {
          string += chunk.toString('utf8');
        });
        stream.on('end', () => {
          expect(string).toEqual(fs.readFileSync(__filename, 'utf8'));
        });
      });
    });

    it('should handle 404 error if scan not found', () => {
      const spy = jest.spyOn(doxie, 'getInitializedApi');
      const scan = '/DOXIE/JPEG/IMG_0003.JPG';
      const data = '';
      nock(`${baseApiUrl}:${basePort}`)
        .get(`/scans${scan}`)
        .reply(404, data);

      return doxie.get_scan(scan).catch(err => {
        expect(spy).toHaveBeenCalledTimes(3);
        expect(err.status).toEqual(404);
      });
    });
  });

  describe('get_thumbnail', () => {
    it('should handle 404 error if scan not found', () => {
      const spy = jest.spyOn(doxie, 'getInitializedApi');
      const scanPath = '/DOXIE/JPEG/IMG_0003.JPG';
      nock(`${baseApiUrl}:${basePort}`)
        .get(`/thumbnails${scanPath}`)
        .reply(404, '');

      return doxie.get_thumbnail(scanPath).catch(err => {
        expect(spy).toHaveBeenCalledTimes(3);
        expect(err.status).toEqual(404);
      });
    });

    it('should handle error', () => {
      const spy = jest.spyOn(doxie, 'getInitializedApi');
      const scanPath = '/DOXIE/JPEG/IMG_0003.JPG';
      nock(`${baseApiUrl}:${basePort}`)
        .get(`/thumbnails${scanPath}`)
        .reply(404, '');

      return doxie.get_thumbnail(scanPath).catch(err => {
        expect(spy).toHaveBeenCalledTimes(3);
        expect(err.status).toEqual(404);
      });
    });

    it('should handle retrying till scan found', () => {
      const spy = jest.spyOn(doxie, 'getInitializedApi');
      const scanPath = '/DOXIE/JPEG/IMG_0003.JPG';
      nock(`${baseApiUrl}:${basePort}`)
        .get(`/thumbnails${scanPath}`)
        .reply(404, '')
        .get(`/thumbnails${scanPath}`)
        .reply(200, fs.createReadStream(__filename));

      return doxie.get_thumbnail(scanPath).then(res => {
        expect(spy).toHaveBeenCalledTimes(2);
        expect(res.status).toEqual(200);
        let stream = res.data;
        let string = '';
        stream.on('data', chunk => {
          string += chunk.toString('utf8');
        });
        stream.on('end', () => {
          expect(string).toEqual(fs.readFileSync(__filename, 'utf8'));
        });
      });
    });
  });

  describe('delete_scan', () => {
    it('should delete a scan', () => {
      const spy = jest.spyOn(doxie, 'getInitializedApi');
      const data = '/DOXIE/JPEG/IMG_0001.JPG';
      nock(`${baseApiUrl}:${basePort}`)
        .defaultReplyHeaders({
          'Content-Type': 'application/json'
        })
        .delete(`/scans${data}`)
        .reply(204);

      return doxie.delete_scan(data).then(res => {
        expect(spy).toHaveBeenCalled();
        expect(res.status).toEqual(204);
      });
    });
  });

  describe('delete_multiple_scans', () => {
    it('should delete a list of scans', () => {
      const spy = jest.spyOn(doxie, 'getInitializedApi');
      const data = [
        '/DOXIE/JPEG/IMG_0001.JPG',
        '/DOXIE/JPEG/IMG_0002.JPG',
        '/DOXIE/JPEG/IMG_0003.JPG'
      ];
      nock(`${baseApiUrl}:${basePort}`)
        .defaultReplyHeaders({
          'Content-Type': 'application/json'
        })
        .post('/scans/delete.json')
        .reply(204);

      return doxie.delete_multiple_scans(data).then(res => {
        expect(spy).toHaveBeenCalled();
        expect(res.status).toEqual(204);
      });
    });
  });

  describe('axios_instance', () => {
    const baseApiUrl = 'https://www.fake.url';
    const basePort = 8080;
    let doxie;

    beforeEach(() => {
      // https://github.com/nock/nock#disabling-requests
      nock.disableNetConnect();
      doxie = new doxieNode({
        username: 'doxie',
        password: 'password1',
        doxieURL: baseApiUrl,
        doxiePort: basePort
      });
    });

    afterEach(() => {
      nock.cleanAll();
      jest.restoreAllMocks();
    });

    it('should set Authorization header on instance if token exists', () => {
      doxie.getInitializedApi();
      expect(doxie.axiosInstance).not.toBeNull();
      expect(
        doxie.axiosInstance.defaults.headers.Authorization
      ).not.toBeUndefined();
    });

    it('should include Authorization header on requests if present', () => {
      let authHeader;
      nock(`${baseApiUrl}:${basePort}`, {
        reqheaders: {
          Authorization: headerValue => (authHeader = headerValue)
        }
      })
        .get('/hello.json')
        .reply(200);

      return doxie.hello().then(() => {
        expect(authHeader).not.toBeNull();
        expect(authHeader).not.toBeUndefined();
      });
    });
  });
});
