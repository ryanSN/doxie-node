const retrier = require('retry');

const retryPromise = (fn, opts) => {
  const run = (resolve, reject) => {
    const options = opts || {};
    const op = retrier.operation(options);

    const onError = err => {
      if (!op.retry(err)) {
        reject(op.mainError());
      }
    };

    const runAttempt = num => {
      let val;

      try {
        val = fn(num);
      } catch (err) {
        onError(err, num);
        return;
      }

      return Promise.resolve(val)
        .then(resolve)
        .catch(err => {
          onError(err, num);
        });
    };

    op.attempt(runAttempt);
  };

  return new Promise(run);
};

module.exports = retryPromise;
