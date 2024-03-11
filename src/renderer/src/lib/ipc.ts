import { DependencyList, useEffect } from 'react';
import { WebContentEventListeners } from 'src/shared/types';

export const useIpcListeners = (handler: Partial<WebContentEventListeners>, deps = [] as DependencyList) => {
  useEffect(() => {
    const removeListener = {};

    Object.keys(handler).forEach((key) => {
      const listener = (_, ...args) => handler[key](...args);
      removeListener[key] = window.electron.ipcRenderer.on(key, listener);
    });

    return () => {
      Object.keys(handler).forEach((key) => {
        removeListener[key]();
      });
    };
  }, [...deps]);
};
