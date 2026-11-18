import { BrowserWindow, Menu, shell } from 'electron';
import { existsSync } from 'fs';
import { getDataFolder, getDataPath } from '../utils';
import { WebContentEventListeners } from '../../shared/types';
import { appSettings } from '../settings/AppSettings';
import { importSettingsFromPreviousVersion } from '../settings/importSettings';
import { hasImportedBibleText, importBibleText, removeBibleText, showBibleFileFormatHelp } from '../bible/importBible';

const createMenu = (mainWindow: BrowserWindow) => {
  const profile = appSettings.getSelectedProfile();
  const lang = profile?.lang ?? 'en';

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
    {
      label: 'Language',
      submenu: [
        {
          label: 'English (EN)',
          type: 'radio',
          checked: lang === 'en',
          click: () => publishWebContentEvent(mainWindow, 'setBookTitleLanguage', 'en'),
        },
        {
          label: 'Mandarin (ZH)',
          type: 'radio',
          checked: lang === 'zh',
          click: () => publishWebContentEvent(mainWindow, 'setBookTitleLanguage', 'zh'),
        },
      ],
    },
    {
      label: 'Bible',
      submenu: [
        {
          label: 'Load English Bible Text…',
          click: async () => {
            if (await importBibleText(mainWindow, 'en')) createMenu(mainWindow);
          },
        },
        {
          label: 'Remove English Bible Text',
          enabled: hasImportedBibleText('en'),
          click: async () => {
            if (await removeBibleText(mainWindow, 'en')) createMenu(mainWindow);
          },
        },
        { type: 'separator' },
        {
          label: 'Load Chinese Bible Text…',
          click: async () => {
            if (await importBibleText(mainWindow, 'zh')) createMenu(mainWindow);
          },
        },
        {
          label: 'Use Built-in Chinese Text',
          enabled: hasImportedBibleText('zh'),
          click: async () => {
            if (await removeBibleText(mainWindow, 'zh')) createMenu(mainWindow);
          },
        },
        { type: 'separator' },
        { label: 'About Bible Text Files…', click: () => showBibleFileFormatHelp(mainWindow) },
      ],
    },
    {
      label: 'Settings',
      submenu: [
        {
          label: 'Import from Previous Version…',
          click: async () => {
            // Rebuild so the Language menu reflects the imported settings.
            if (await importSettingsFromPreviousVersion(mainWindow)) createMenu(mainWindow);
          },
        },
        {
          label: 'Show Settings File in Folder',
          click: () => {
            // settings.json only exists once settings have been saved (on close); otherwise open its folder.
            const settingsFile = getDataPath('settings.json');
            if (existsSync(settingsFile)) shell.showItemInFolder(settingsFile);
            else shell.openPath(getDataFolder());
          },
        },
      ],
    },
  ]);

  // Set the menu
  Menu.setApplicationMenu(menu);
};

const publishWebContentEvent = (
  mainWindow: BrowserWindow,
  eventName: keyof WebContentEventListeners,
  lang: 'en' | 'zh',
) => mainWindow.webContents.send(eventName, lang);

export default createMenu;
