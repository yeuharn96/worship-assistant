import { ipcMain } from 'electron';
import invokeHandlers from './handlers/invokeHandlers';
import sendHandlers from './handlers/sendHandlers';

const setupMainHandlers = () => {
  Object.keys(invokeHandlers).forEach((key) => {
    ipcMain.handle(key, (_, ...args) => invokeHandlers[key](...args));
  });

  Object.keys(sendHandlers).forEach((key) => {
    ipcMain.on(key, (_, ...args) => sendHandlers[key](...args));
  });
};

export default setupMainHandlers;
