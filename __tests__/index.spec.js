const doxieNode = require('../lib');
const nock = require('nock');
const fs = require('fs');

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

    it('should handle 404 error if scan not found', done => {
      const spy = jest.spyOn(doxie, 'getInitializedApi');
      const scan = '/DOXIE/JPEG/IMG_0003.JPG';
      const data = '';
      nock(`${baseApiUrl}:${basePort}`)
        .get(`/scans${scan}`)
        .reply(404, data);

      return doxie.get_scan(scan).catch(err => {
        expect(spy).toHaveBeenCalledTimes(3);
        expect(err.status).toEqual(404);
        done();
      });
    });

    it('should handle 404 error if scan not found', done => {
      const spy = jest.spyOn(doxie, 'getInitializedApi');
      const scanPath = '/DOXIE/JPEG/IMG_0003.JPG';
      nock(`${baseApiUrl}:${basePort}`)
        .get(`/thumbnails${scanPath}`)
        .reply(404, '');

      return doxie.get_thumbnail(scanPath).catch(err => {
        expect(spy).toHaveBeenCalledTimes(3);
        expect(err.status).toEqual(404);
        done();
      });
    });

    it('should handle retrying till scan found', done => {
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
        done();
      });
    });
  });
});
