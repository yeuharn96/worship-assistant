import { app, BrowserWindow, ipcMain } from 'electron';
import { join } from 'path';
import { is } from '@electron-toolkit/utils';
import { appSettings } from '../api/AppSettings';
import { Profile } from '../../shared/types';
import createMenu from './createMenu';

export const createWindow = () => {
  const mainWindow = new BrowserWindow({
    minWidth: 1280,
    minHeight: 720,
    show: false,
    icon: join(__dirname, '../../resources/ico.ico'),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
    },
  });
  createMenu(mainWindow);

  mainWindow.on('ready-to-show', () => {
    mainWindow.show();
    is.dev && mainWindow.webContents.openDevTools();
  });

  ipcMain.on('window-closing', (_, profile: Profile) => {
    appSettings.saveProfile(profile);
  });

  mainWindow.on('closed', () => {
    !is.dev && appSettings.writeSaveFile();
    app.quit();
  });

  mainWindow.webContents.setWindowOpenHandler(() => {
    return { action: 'deny' };
  });

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL']);
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
  }

  return mainWindow;
};
