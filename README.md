# doxie-node

[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/ryanSN/doxie-node/blob/master/LICENSE)
[![npm](https://img.shields.io/npm/v/doxie-node.svg)](https://npmjs.com/package/doxie-node)
[![Build Status](https://travis-ci.org/ryanSN/doxie-node.svg?branch=master)](https://travis-ci.org/ryanSN/doxie-node)
[![Coverage Status](https://coveralls.io/repos/github/ryanSN/doxie-node/badge.svg?branch=master)](https://coveralls.io/github/ryanSN/doxie-node?branch=master) 

#### Node.js library for Doxie go Wi-fi, Doxie Q, and Doxie Go SE

This is a Node js wrapper library/SDK for the API provided from the [Doxie series of Wi-Fi document scanners.](http://www.getdoxie.com/)

### Documentation

See [Doxie's offical API documentation](http://help.getdoxie.com/doxiego/advanced/wifi/api/)

### installation

`yarn add doxie-node`

or

`npm install doxie-node --save`

### Usage / Initialize

This requires knowing your Doxie's IP address on your network.
All methods return a promise.

```js
import doxieNode from 'doxie-node';
const doxie = new doxieNode({ doxieURL: 'http://192.168.1.3' });
```

#### Available options

doxie-node can take the following options:

- `username` **optional** - defaults:`doxie`
- `password` **optional**
- `token` **optional** - base64 encoded username and password token (ie. Basic [token]) if username and password provided, this token is created for you.
- `doxieURL` **required**
- `doxiePort` **optional** - default:`8080`

## Methods

### `hello`

Used to check the status of your Doxie.
If calling on a Doxie go SE or Doxie Q the return will include the `firmware` and `connectedToExternalPower`.

```js
return doxie.hello().then(response);
```

#### returns

```js
{
  model: 'DX250',
  name: 'Doxie_042D6A',
  firmwareWiFi: '1.29',
  hasPassword: false,
  MAC: '00:11:E5:04:2D:6A',
  mode: 'AP'
}
```

### `scanner_status` (Only for Doxie Go Wi-Fi)

This method was deprecated for Doxie go SE, Doxie Q

#### returns

```js
{
 "firmware": "0.26",
 "connectedToExternalPower": true
}
```

### `restart`

returns 204 No Content and then restarts the scanner's Wi-Fi
system. The scanner's status light blinks blue during the restart.

```js
return doxie.restart().then(response);
```

### `list_all_scans`

returns an array of all scans currently in the scanner’s memory. After
scanning a document, the scan will available via the API several second later

```js
return doxie.list_all_scans().then(response);
```

#### returns

```js
[
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
```

### `most_recent_scan`

returns the path to the last scan if available. Monitoring this value
for changes provides a simple way to detect new scans without having to fetch the entire list of
scans.

```js
return doxie.most_recent_scan().then(response);
```

#### returns

```js
{
 "path":"/DOXIE/JPEG/IMG_0003.JPG"
}
```

### `get_scan`

returns the scan at the specified path or 404 Not Found
This method also will retry (`default: 3`) when a 404 is not found assuming the image
is not ready.

#### params

- `scanPath` **required** - String (ie. `'/DOXIE/JPEG/IMG_0001.JPG'`)
- `retries` **optional** - `default: 3` - Number of retires to attempt when image is not ready

```js
return doxie.get_scan('/DOXIE/JPEG/IMG_0001.JPG').then(response);
```

### `get_thumbnail`

Thumbnails are constrained to fit within 240x240 pixels. Thumbnails for new scans are not
generated until after the scan has been made available in `get_scan()` and `most_recent_scan()`.
This function will return 404 Not Found if the thumbnail has not yet been
generated. This method also will retry (`default: 3`) when a 404 is not found assuming
the image is not ready.

#### params

- `scanPath` **required** - String (ie. `'/DOXIE/JPEG/IMG_0001.JPG'`)
- `retries` **optional** - `default: 3` - Number of retires to attempt when image is not ready

```js
return doxie.get_thumbnail('/DOXIE/JPEG/IMG_0001.JPG').then(response);
```

#### returns on success the stream of the thumbnail

`200`

#### returns on failure

`404 Not Found`

### `delete_scan`

deletes the scan at the specified path

```js
return doxie.delete_scan('/DOXIE/JPEG/IMG_0001.JPG').then(response);
```

#### returns on success

`204 No Content`

when deleteing multiple scans use `delete_mutiple_scans` for the best performance.

### `delete_multiple_scans`

deletes multiple scans in a single operation. This is much faster
than deleting each scan individually. Multiple scans are referenced using a JSON array of paths

```js
const scans = [
  '/DOXIE/JPEG/IMG_0001.JPG',
  '/DOXIE/JPEG/IMG_0002.JPG',
  '/DOXIE/JPEG/IMG_0003.JPG'
];
return doxie.delete_multiple_scans(scans).then(response);
```

#### returns on success

`204 No Content`

### Development

- `yarn install`
- `yarn test` to run tests

## deployment

- `npm version [minor, patch, major]`
- `git push origin master --tag`
  Auto publishes on tag commit to master.
  or
- `git push --follow-tags`

This library is released under the [MIT License](LICENSE)
