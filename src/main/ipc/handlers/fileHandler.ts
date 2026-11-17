import { copyFileSync, existsSync, unlinkSync } from 'fs';
import crypto from 'crypto';
import path, { extname } from 'path';
import { getDataPath, isInDataFolder } from '../../utils';

export const fileHandler = {
  copyToDataFolder: (filePath: string) => {
    if (!existsSync(filePath)) throw new Error('File does not exist.');

    const dest = getDataPath(`${crypto.randomUUID()}${extname(filePath)}`);
    copyFileSync(filePath, dest);
    return dest.replaceAll('\\', '/');
  },
  removeFromDataFolder: (filePath: string) => {
    // Never delete anything outside the app's own data folder (e.g. the user's original image).
    if (!isInDataFolder(filePath) || !existsSync(filePath)) return false;

    unlinkSync(filePath);
    return true;
  },
  getFileName: (filePath: string) => path.basename(filePath),
  checkFileExists: (filePath: string) => existsSync(filePath),
};
