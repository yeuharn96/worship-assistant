import { BrowserWindow, Menu } from 'electron';
import { WebContentEventListeners } from '../../shared/types';
import { appSettings } from '../settings/AppSettings';

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
    { label: 'Exit', role: 'quit' },
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
