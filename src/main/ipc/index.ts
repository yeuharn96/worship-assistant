import { ipcMain, ipcRenderer } from 'electron';
import invokeHandlers, { InvokeHandlers } from './invokeHandlers';
import sendHandlers, { SendHandlers } from './sendHandlers';

export const setupRendererApi = () => {
  const rendererApi = {};
  Object.keys(invokeHandlers).forEach((key) => {
    rendererApi[key] = (...args) => ipcRenderer.invoke(key, ...args);
  });

  Object.keys(sendHandlers).forEach((key) => {
    rendererApi[key] = (...args) => ipcRenderer.send(key, ...args);
  });

  return rendererApi;
};

export const setupHandlers = () => {
  Object.keys(invokeHandlers).forEach((key) => {
    ipcMain.handle(key, (_, ...args) => invokeHandlers[key](...args));
  });

  Object.keys(sendHandlers).forEach((key) => {
    ipcMain.on(key, (_, ...args) => sendHandlers[key](...args));
  });
};

export type MainIpcHandler = SendHandlers & InvokeHandlers;
