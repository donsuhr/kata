const wait = (ms = 1000) =>
  new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve();
    }, ms);
  });

const formatDollars = (price: number) => {
  const USDollar = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  });
  return USDollar.format(price);
};

const debouncePromise = <F extends (...args: Parameters<F>) => ReturnType<F>>(
  callback: F,
  delay = 1000,
) => {
  // https://gist.github.com/ca0v/73a31f57b397606c9813472f7493a940
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<F>) => {
    const promise = new Promise<ReturnType<F> | Error>((resolve, reject) => {
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
