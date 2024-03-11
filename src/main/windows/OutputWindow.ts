import { BrowserWindow, Display } from 'electron';
import { join } from 'path';
import { is } from '@electron-toolkit/utils';

export const createOutputWindow = (display: Display) => {
  const outputWindow = new BrowserWindow({
    width: display.size.width,
    height: display.size.height,
    x: display.bounds.x,
    y: display.bounds.y,
    frame: false,
    show: false,
    autoHideMenuBar: true,
    transparent: true,
    movable: false,
    resizable: false,
    skipTaskbar: true,
    fullscreen: true,
    icon: join(__dirname, '../../resources/ico.ico'),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
    },
  });

  outputWindow.webContents.setWindowOpenHandler(() => {
    return { action: 'deny' };
  });

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    outputWindow.loadURL(`${process.env['ELECTRON_RENDERER_URL']}/output.html`);
  } else {
    outputWindow.loadFile(join(__dirname, '../renderer/output.html'));
  }

  return outputWindow;
};
