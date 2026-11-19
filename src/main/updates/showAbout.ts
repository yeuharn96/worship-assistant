import { app, BrowserWindow, clipboard, dialog, shell } from 'electron';
import { getDataFolder } from '../utils';
import { REPO_URL } from './checkForUpdates';

/** Show the app's version and the details useful when reporting a problem. */
const showAbout = async (mainWindow: BrowserWindow) => {
  const version = app.getVersion();
  const details = [
    `Version: ${version}`,
    `Electron: ${process.versions.electron}`,
    `Chromium: ${process.versions.chrome}`,
    `Node.js: ${process.versions.node}`,
    `Data folder: ${getDataFolder()}`,
  ];

  const { response } = await dialog.showMessageBox(mainWindow, {
    type: 'info',
    title: 'About Worship Assistant',
    message: `Worship Assistant ${version}`,
    detail: [
      'A simple app to assist worship service presentations.',
      details.join('\n'),
      `By yeuharn96\n${REPO_URL}`,
    ].join('\n\n'),
    buttons: ['OK', 'Copy Details', 'Open GitHub Page'],
    defaultId: 0,
    cancelId: 0,
    noLink: true,
  });
  if (response === 1) clipboard.writeText(`Worship Assistant\n${details.join('\n')}`);
  if (response === 2) shell.openExternal(REPO_URL);
};

export default showAbout;
