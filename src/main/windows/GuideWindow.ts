import { BrowserWindow, shell } from 'electron';
import { join } from 'path';
import { is } from '@electron-toolkit/utils';

let guideWindow: BrowserWindow | null = null;

/** Links to websites open in the browser, since the guide window has no back button. */
const openInBrowser = (url: string) => {
  if (/^https?:\/\//i.test(url)) shell.openExternal(url);
};

/**
 * Open the user guide in its own window, so it can stay open beside the control panel. `lang` picks the guide it opens
 * with; the window has a switch for the other one.
 */
const showUserGuide = (lang: 'en' | 'zh') => {
  if (guideWindow && !guideWindow.isDestroyed()) {
    if (guideWindow.isMinimized()) guideWindow.restore();
    guideWindow.focus();
    return;
  }

  const win = new BrowserWindow({
    width: 1100,
    height: 800,
    minWidth: 480,
    minHeight: 400,
    show: false,
    icon: join(__dirname, '../../resources/ico.ico'),
    webPreferences: { sandbox: true },
  });
  guideWindow = win;
  // Otherwise Windows gives it the control panel's menu, whose items act on the control panel.
  win.setMenu(null);

  win.on('ready-to-show', () => win.show());
  win.on('closed', () => (guideWindow = null));

  win.webContents.setWindowOpenHandler(({ url }) => {
    openInBrowser(url);
    return { action: 'deny' };
  });
  // Links within the guide only change the #section, which isn't a navigation.
  win.webContents.on('will-navigate', (e, url) => {
    if (url.split('#')[0] === win.webContents.getURL().split('#')[0]) return;
    e.preventDefault();
    openInBrowser(url);
  });

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    win.loadURL(`${process.env['ELECTRON_RENDERER_URL']}/guide.html?lang=${lang}`);
  } else {
    win.loadFile(join(__dirname, '../renderer/guide.html'), { query: { lang } });
  }
};

export default showUserGuide;
