// reference: https://stackoverflow.com/a/61511955
const waitElementRendered = <T extends HTMLElement>(selector) => {
  return new Promise<T>((resolve) => {
    if (document.querySelector(selector)) {
      return resolve(document.querySelector(selector));
    }

    const observer = new MutationObserver((mutations) => {
      if (document.querySelector(selector)) {
        observer.disconnect();
        resolve(document.querySelector(selector));
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
  });
};

export default waitElementRendered;
