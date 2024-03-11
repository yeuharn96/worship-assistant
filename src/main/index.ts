import { app, protocol, screen } from 'electron';
import { electronApp, optimizer } from '@electron-toolkit/utils';
import { createWindow } from './windows/ControlPanelWindow';
import { createOutputWindow } from './windows/OutputWindow';
import { setupHandlers } from './ipc';
import path from 'path';

const initDirPath = () => {
  process.env.RESOURCE_DIR = path.resolve(__dirname, '../../resources');
  process.env.DATA_DIR = path.resolve(__dirname, '../../data');
};

app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.yeuharn96.worship-assistant');

  app.on('browser-window-created', (_, window) => {
    // Default open or close DevTools by F12 in development
    // and ignore CommandOrControl + R in production.
    // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
    optimizer.watchWindowShortcuts(window);
  });

  initDirPath();

  const mainWindow = createWindow();
  process.env.MAIN_WINDOW_ID = mainWindow.id.toString();

  const displays = screen.getAllDisplays();
  const outputWindow = createOutputWindow(displays.length > 1 ? displays[1] : displays[0]);
  process.env.OUTPUT_WINDOW_ID = outputWindow.id.toString();

  protocol.registerFileProtocol('video', (request, callback) => {
    const pathname = decodeURI(request.url.replace('video:///', ''));
    callback(pathname);
  });
  protocol.registerFileProtocol('image', (request, callback) => {
    const pathname = decodeURI(request.url.replace('image:///', ''));
    callback(pathname);
  });

  setupHandlers();
});

app.on('window-all-closed', () => {
  app.quit();
});
