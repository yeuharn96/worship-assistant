import { dialog, screen } from 'electron';
import VERSE_COUNT from '../../bible/verse-count.json';
import { BIBLE_DATA } from '../../bible/bible.data';
import { Profile, ReturnPromise, ScriptureLocation, Video } from '../../../shared/types';
import { appSettings } from '../../api/AppSettings';
import path, { extname } from 'path';
import { copyFileSync, existsSync, unlinkSync } from 'fs';
import crypto from 'crypto';
import { getDataPath } from '../../utils';

const invokeHandlers = {
  listProfiles: () => appSettings.getProfiles(),
  getProfile: (id: string) => appSettings.getProfile(id),
  getCurrentProfile: () => appSettings.getSelectedProfile() ?? appSettings.getProfiles()[0],
  saveProfile: (profile: Profile) => appSettings.saveProfile(profile),
  getOutputDimension: () => {
    const displays = screen.getAllDisplays();
    return (displays.length > 1 ? displays[1] : displays[0]).size;
  },
  // reloadBible: () => reloadBible(),

  getChpCount: (book: string) => Object.keys(VERSE_COUNT[book]).length,
  getVerseCount: (book: string, chp: string) => VERSE_COUNT[book][chp],
  getChpText: (lang: Profile['lang'], book: string, chp: string) => BIBLE_DATA[lang][book][chp],
  getVerseText: (lang: Profile['lang'], { book, chapter, verse }: ScriptureLocation) =>
    BIBLE_DATA[lang][book][chapter][verse],
  askImageDialog: () => {
    const [imageFile] =
      dialog.showOpenDialogSync({
        properties: ['openFile'],
        filters: [
          { name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'bmp', 'svg', 'tif', 'tiff', 'webp'] },
          { name: 'All Files', extensions: ['*'] },
        ],
      }) ?? [];

    if (!imageFile) return;

    return imageFile.replaceAll('\\', '/');
  },
  copyToDataFolder: (filePath: string) => {
    if (!existsSync(filePath)) throw new Error('File does not exists.');

    const dest = getDataPath(`${crypto.randomUUID()}${extname(filePath)}`);
    copyFileSync(filePath, dest);
    return dest.replaceAll('\\', '/');
  },
  removeFromDataFolder: (filePath: string) => {
    if (!existsSync(filePath)) return;

    unlinkSync(filePath);
    return true;
  },

  askVideosDialog: () => {
    const videoFiles = dialog.showOpenDialogSync({
      properties: ['openFile', 'multiSelections'],
      filters: [
        { name: 'Videos', extensions: ['mp4', 'avi', 'mkv', 'mov', 'wmv', 'flv', 'webm'] },
        { name: 'All Files', extensions: ['*'] },
      ],
    });

    if (!videoFiles) return [];

    return videoFiles.map((filePath) => ({ path: filePath, name: path.basename(filePath) })) as Video[];
  },
  getFileName: (filePath: string) => path.basename(filePath),
  checkFileExists: (filePath: string) => existsSync(filePath),
};

export type InvokeHandlers = ReturnPromise<typeof invokeHandlers>;
export default invokeHandlers;
