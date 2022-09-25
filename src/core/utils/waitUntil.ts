export const waitUntil = (condition: () => boolean, timeout: number = 1000, interval: number = 100) => {
  return new Promise((resolve, reject) => {
    const timer = setInterval(() => {
      if (condition()) {
        clearInterval(timer);
        resolve(true)
      }
    }, interval);

    setTimeout(() => {
      clearInterval(timer);
      reject();
    }, timeout);
  });
}