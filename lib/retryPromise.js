const retrier = require('retry');

const retryPromise = (fn, opts) => {
  const run = (resolve, reject) => {
    const options = opts || {};
    const op = retrier.operation(options);

    const bail = err => {
      reject(err || new Error('Aborted'));
    };

    const onError = (err, num) => {
      if (err.bail) {
        bail(err);
        return;
      }

      if (!op.retry(err)) {
        reject(op.mainError());
      }
    };

    const runAttempt = num => {
      let val;

      try {
        val = fn(bail, num);
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
