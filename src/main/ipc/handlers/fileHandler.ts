import { copyFileSync, existsSync, unlinkSync } from 'fs';
import crypto from 'crypto';
import path, { extname } from 'path';
import { getDataPath } from '../../utils';

export const fileHandler = {
  copyToDataFolder: (filePath: string) => {
    if (!existsSync(filePath)) throw new Error('File does not exist.');

    const dest = getDataPath(`${crypto.randomUUID()}${extname(filePath)}`);
    copyFileSync(filePath, dest);
    return dest.replaceAll('\\', '/');
  },
  removeFromDataFolder: (filePath: string) => {
    if (!existsSync(filePath)) return;

    unlinkSync(filePath);
    return true;
  },
  getFileName: (filePath: string) => path.basename(filePath),
  checkFileExists: (filePath: string) => existsSync(filePath),
};
