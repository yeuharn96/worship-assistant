import { app, BrowserWindow, ipcMain, Rectangle, screen } from 'electron';
import { join } from 'path';
import { is } from '@electron-toolkit/utils';
import { appSettings } from '../settings/AppSettings';
import { Profile } from '../../shared/types';
import createMenu from './createMenu';

const MIN_WIDTH = 1280;
const MIN_HEIGHT = 720;

/** Saved bounds fitted to the screen they're on, or undefined if they'd be (mostly) off-screen now. */
const getRestorableBounds = (saved: Rectangle): Rectangle | undefined => {
  const { workArea } = screen.getDisplayMatching(saved);
  const visibleWidth = Math.min(saved.x + saved.width, workArea.x + workArea.width) - Math.max(saved.x, workArea.x);
  const visibleHeight = Math.min(saved.y + saved.height, workArea.y + workArea.height) - Math.max(saved.y, workArea.y);
  // Require enough of the window (incl. the title bar) on screen to grab it, e.g. after a monitor was unplugged.
  if (visibleWidth < 200 || visibleHeight < 100 || saved.y < workArea.y) return undefined;

  return {
    x: saved.x,
    y: saved.y,
    width: Math.min(Math.max(saved.width, MIN_WIDTH), workArea.width),
    height: Math.min(Math.max(saved.height, MIN_HEIGHT), workArea.height),
  };
};

export const createWindow = () => {
  const savedState = appSettings.getWindowState();
  const savedBounds = savedState && getRestorableBounds(savedState.bounds);

  // Without an explicit size Electron opens at 800x600, and some window managers (Linux) don't enforce
  // minWidth/minHeight on the initial size, so default to the minimum size (or the work area on a smaller screen).
  const { workArea } = screen.getPrimaryDisplay();
  const mainWindow = new BrowserWindow({
    ...(savedBounds ?? {
      width: Math.min(MIN_WIDTH, workArea.width),
      height: Math.min(MIN_HEIGHT, workArea.height),
      center: true,
    }),
    minWidth: MIN_WIDTH,
    minHeight: MIN_HEIGHT,
    show: false,
    icon: join(__dirname, '../../resources/ico.ico'),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
    },
  });
  createMenu(mainWindow);

  mainWindow.on('ready-to-show', () => {
    if (savedState?.isMaximized) mainWindow.maximize();
    mainWindow.show();
    is.dev && mainWindow.webContents.openDevTools();
  });

  ipcMain.on('window-closing', (_, profile: Profile) => {
    appSettings.saveProfile(profile);
  });

  // Remember where the window was; normal bounds are what it returns to when un-maximized.
  mainWindow.on('close', () => {
    appSettings.setWindowState({ bounds: mainWindow.getNormalBounds(), isMaximized: mainWindow.isMaximized() });
  });

  mainWindow.on('closed', () => {
    try {
      !is.dev && appSettings.writeSaveFile();
    } catch (e) {
      console.error('Unable to save settings', e);
    } finally {
      // Always quit, otherwise the hidden output window keeps the process alive.
      app.quit();
    }
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
