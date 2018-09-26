const doxieNode = require('./lib');

const doxie = new doxieNode({ doxieURL: 'http://localhost' });

return doxie.hello().then(res => {
  console.log(res);
});
