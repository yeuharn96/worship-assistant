import { BrowserWindow, dialog } from 'electron';
import { copyFileSync, existsSync, readFileSync } from 'fs';
import { basename, dirname, join, resolve } from 'path';
import { is } from '@electron-toolkit/utils';
import { Profile } from '../../shared/types';
import { getDataPath } from '../utils';
import { fileHandler } from '../ipc/handlers/fileHandler';
import sendHandlers from '../ipc/sendHandlers';
import { getOutputWindow } from '../windows/getWindows';
import { appSettings, isValidProfiles, takePlaylist } from './AppSettings';
import { copyFontsFrom, hasFontsIn } from '../fonts/customFonts';
import { BIBLE_LANGS, getBibleFileName, getImportedBiblePath, reloadBible } from '../bible/bible.data';

const TITLE = 'Import Settings';

/** Accepts the previous version's app folder (with `data/` inside) or its `data` folder itself. */
const findSettingsFile = (folder: string) =>
  [join(folder, 'data', 'settings.json'), join(folder, 'settings.json')].find((p) => existsSync(p));

/**
 * Copy a profile's background image into this version's data folder. Saved paths are absolute and may point into an
 * even older version's folder, so also look for the file by name in the selected version's data folder.
 */
const copyBackgroundImage = (bgImage: string, oldDataFolder: string) => {
  const source = [bgImage, join(oldDataFolder, basename(bgImage))].find((p) => existsSync(p));
  if (!source) return undefined;

  try {
    return fileHandler.copyToDataFolder(source);
  } catch (e) {
    console.error('Unable to copy background image', e);
    return undefined;
  }
};

/** Ask for a previous version's folder and replace the current settings with its settings. Returns true if imported. */
export const importSettingsFromPreviousVersion = async (mainWindow: BrowserWindow) => {
  const showError = async (message: string, detail?: string) => {
    await dialog.showMessageBox(mainWindow, { type: 'error', title: TITLE, message, detail });
    return false;
  };

  // Importing replaces the mode, background and text settings, which would change what's on the projector mid-service.
  const blockIfOutputShowing = async () => {
    if (!getOutputWindow()?.isVisible()) return false;
    await dialog.showMessageBox(mainWindow, {
      type: 'warning',
      title: TITLE,
      message: 'Hide the output before importing settings.',
      detail: 'Settings can’t be imported while the output is showing, because it would change what is on the screen.',
    });
    return true;
  };
  if (await blockIfOutputShowing()) return false;

  const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
    title: 'Select the folder of your previous Worship Assistant version',
    properties: ['openDirectory'],
  });
  if (canceled || !filePaths[0]) return false;

  const settingsFile = findSettingsFile(filePaths[0]);
  if (!settingsFile) {
    return showError(
      'No saved settings were found in this folder.',
      'Select the folder of your previous version that contains "Worship Assistant.exe" (or its "data" folder).',
    );
  }
  if (resolve(settingsFile) === resolve(getDataPath('settings.json'))) {
    return showError('This is the folder of the version you are running now.', 'Select the previous version’s folder.');
  }

  let profiles: Profile[];
  let savedPlaylist: unknown;
  try {
    const settings = JSON.parse(readFileSync(settingsFile, { encoding: 'utf-8' }));
    profiles = settings?.profiles;
    savedPlaylist = settings?.playlist;
  } catch {
    return showError('The saved settings in this folder could not be read.', settingsFile);
  }
  if (!isValidProfiles(profiles) || profiles.length === 0) {
    return showError('The saved settings in this folder could not be read.', settingsFile);
  }

  const oldDataFolder = dirname(settingsFile);
  const bibleLangs = BIBLE_LANGS.filter((lang) => existsSync(join(oldDataFolder, getBibleFileName(lang))));
  const hasFonts = hasFontsIn(oldDataFolder);

  const { response } = await dialog.showMessageBox(mainWindow, {
    type: 'question',
    title: TITLE,
    buttons: ['Import', 'Cancel'],
    defaultId: 0,
    cancelId: 1,
    message: 'Replace your current settings?',
    detail: [
      `All your profiles (text settings and background images) and the video playlist will be replaced with the ones from:\n${oldDataFolder}`,
      bibleLangs.length > 0 ? 'The Bible text files you loaded in that version will also be copied.' : '',
      hasFonts ? 'The fonts you added in that version will also be copied. Fonts you added here are kept.' : '',
    ]
      .filter(Boolean)
      .join('\n\n'),
  });
  if (response !== 0) return false;
  if (await blockIfOutputShowing()) return false;

  let missingBibleTexts = 0;
  bibleLangs.forEach((lang) => {
    try {
      copyFileSync(join(oldDataFolder, getBibleFileName(lang)), getImportedBiblePath(lang));
    } catch (e) {
      console.error('Unable to copy Bible text file', e);
      missingBibleTexts++;
    }
  });
  if (bibleLangs.length > 0) {
    reloadBible(bibleLangs);
    sendHandlers.bibleTextChanged();
  }

  if (hasFonts) copyFontsFrom(oldDataFolder);

  let missingImages = 0;
  const importedProfiles = profiles.map((profile) => {
    if (!profile.bgImage) return profile;
    const bgImage = copyBackgroundImage(profile.bgImage, oldDataFolder);
    if (!bgImage) missingImages++;
    return { ...profile, bgImage };
  });

  // Background images of the replaced settings are no longer used. One picked during this session is only known to
  // the renderer, which removes it when it receives the imported profile.
  appSettings.getProfiles().forEach((p) => p.bgImage && fileHandler.removeFromDataFolder(p.bgImage));

  appSettings.replaceProfiles(importedProfiles, takePlaylist(importedProfiles, savedPlaylist));
  try {
    !is.dev && appSettings.writeSaveFile();
  } catch (e) {
    console.error('Unable to save imported settings', e);
  }

  sendHandlers.loadProfile(appSettings.getActiveProfile());

  await dialog.showMessageBox(mainWindow, {
    type: 'info',
    title: TITLE,
    message: 'Settings imported.',
    detail:
      [
        missingImages > 0
          ? 'The background image could not be found in the previous version’s folder, so it was removed. You can set it again under Background.'
          : '',
        missingBibleTexts > 0
          ? 'A Bible text file could not be copied. You can load it again from the Bible menu.'
          : '',
      ]
        .filter(Boolean)
        .join('\n\n') || undefined,
  });
  return true;
};
