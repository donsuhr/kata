const wait = (ms = 1000) => new Promise(resolve => {
  setTimeout(() => {
    resolve();
  }, ms);
});
const formatDollars = price => {
  const USDollar = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  });
  return USDollar.format(price);
};
const debouncePromise = (callback, delay = 1000) => {
  // https://gist.github.com/ca0v/73a31f57b397606c9813472f7493a940
  let timer;
  return (...args) => {
    const promise = new Promise((resolve, reject) => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        try {
          const output = callback(...args);
          resolve(output);
        } catch (err) {
          if (err instanceof Error) {
            reject(err);
          }
          reject(new Error(`An error has occurred: ${String(err)}`));
        }
      }, delay);
    });
    return promise;
  };
};
export { wait, formatDollars, debouncePromise };