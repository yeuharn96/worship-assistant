import { app, BrowserWindow, ipcMain, Menu } from 'electron';
import { join } from 'path';
import { is } from '@electron-toolkit/utils';
import { appSettings } from '../api/AppSettings';
import { Profile } from '../../shared/types';

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
  createMenu();

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

const createMenu = () => {
  // Create the menu
  const menu = Menu.buildFromTemplate([
    // {
    //   label: 'Profile',
    //   submenu: [
    //     { label: 'Manage' },
    //     {
    //       label: 'Switch Profile',
    //       submenu: [{ label: 'profile 1' }, { label: 'profile 2' }],
    //     },
    //   ],
    // },
    // {
    //   label: 'Language',
    //   submenu: [
    //     { label: 'English (EN)', type: 'radio', checked: true },
    //     { label: 'Mandarin (ZH)', type: 'radio' },
    //   ],
    // },
    { label: 'Exit', role: 'quit' },
  ]);

  // Set the menu
  Menu.setApplicationMenu(menu);
};
