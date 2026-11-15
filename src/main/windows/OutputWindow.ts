import { app, BrowserWindow, Display } from 'electron';
import { join } from 'path';
import { is } from '@electron-toolkit/utils';
import sendHandlers from '../ipc/sendHandlers';

let isQuitting = false;
app.on('before-quit', () => (isQuitting = true));

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

  // The output window lives for the whole session: closing it (e.g. Alt+F4) only hides it.
  outputWindow.on('close', (e) => {
    if (isQuitting) return;
    e.preventDefault();
    sendHandlers.hideOutput();
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

/** Move the fullscreen output window onto `display` (e.g. after a projector is plugged in). */
export const moveOutputWindow = (outputWindow: BrowserWindow, display: Display) => {
  outputWindow.setFullScreen(false);
  outputWindow.setBounds(display.bounds);
  outputWindow.setFullScreen(true);
};
