import { BrowserWindow, Menu, MenuItemConstructorOptions, shell } from 'electron';
import { existsSync } from 'fs';
import { getDataFolder, getDataPath } from '../utils';
import { ControlPanelEventListeners, WebContentEventListeners } from '../../shared/types';
import { appSettings } from '../settings/AppSettings';
import { isOutputShowing, setMenuRefresher } from '../appState';
import { importSettingsFromPreviousVersion } from '../settings/importSettings';
import { hasImportedBibleText, importBibleText, removeBibleText, showBibleFileFormatHelp } from '../bible/importBible';

/** On Windows `&` marks a menu item's access key, so double it to show it as typed. */
const escapeLabel = (label: string) => label.replaceAll('&', '&&');

/** Lists the profiles to switch between; the menu's title shows the active one. */
const createProfileMenu = (mainWindow: BrowserWindow): MenuItemConstructorOptions => {
  const active = appSettings.getActiveProfile();
  const outputShowing = isOutputShowing();
  // Switching goes through the control panel, which holds the active profile's unsaved changes.
  const send = <T extends keyof ControlPanelEventListeners>(
    channel: T,
    ...args: Parameters<ControlPanelEventListeners[T]>
  ) => mainWindow.webContents.send(channel, ...args);

  return {
    label: escapeLabel(active ? `Profile: ${active.profile.name}` : 'Profile'),
    submenu: [
      ...(outputShowing
        ? ([
            { label: 'Hide the output to switch profiles', enabled: false },
            { type: 'separator' },
          ] as MenuItemConstructorOptions[])
        : []),
      ...appSettings.getProfiles().map(({ profile }): MenuItemConstructorOptions => ({
        label: escapeLabel(profile.name),
        type: 'radio',
        checked: profile.selected,
        enabled: !outputShowing,
        click: () => send('switchProfileRequested', profile.id),
      })),
      { type: 'separator' },
      { label: 'Manage Profiles…', click: () => send('openProfilesManager') },
    ],
  };
};

const createMenu = (mainWindow: BrowserWindow) => {
  setMenuRefresher(() => createMenu(mainWindow));
  const profile = appSettings.getActiveProfile();
  const lang = profile?.lang ?? 'en';

  // Create the menu
  const menu = Menu.buildFromTemplate([
    createProfileMenu(mainWindow),
    {
      label: 'Language',
      submenu: [
        {
          label: 'English (EN)',
          type: 'radio',
          checked: lang === 'en',
          click: () => setLanguage(mainWindow, 'en'),
        },
        {
          label: 'Mandarin (ZH)',
          type: 'radio',
          checked: lang === 'zh',
          click: () => setLanguage(mainWindow, 'zh'),
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

/**
 * Also update the main process's copy of the active profile, which the menu is rebuilt from (e.g. when the output is
 * shown); otherwise the menu would tick the previous language until the profile is next saved.
 */
const setLanguage = (mainWindow: BrowserWindow, lang: 'en' | 'zh') => {
  const profile = appSettings.getActiveProfile();
  if (profile) profile.lang = lang;
  publishWebContentEvent(mainWindow, 'setBookTitleLanguage', lang);
};

const publishWebContentEvent = (
  mainWindow: BrowserWindow,
  eventName: keyof WebContentEventListeners,
  lang: 'en' | 'zh',
) => mainWindow.webContents.send(eventName, lang);

export default createMenu;
