import { is } from '@electron-toolkit/utils';
import { app } from 'electron';
import { existsSync, mkdirSync } from 'fs';
import { dirname, isAbsolute, relative, resolve } from 'path';

// https://www.electronjs.org/docs/latest/api/app#appgetapppath
export const getDataFolder = () => {
  const dataPath = is.dev ? resolve(__dirname, '../../data') : resolve(dirname(app.getPath('exe')), './data');
  if (!existsSync(dataPath)) mkdirSync(dataPath, { recursive: true });
  return dataPath;
};
export const getDataPath = (path: string) => resolve(getDataFolder(), path);
export const isInDataFolder = (filePath: string) => {
  const rel = relative(getDataFolder(), resolve(filePath));
  return rel !== '' && !rel.startsWith('..') && !isAbsolute(rel);
};
export const getResourcePath = (path: string) => resolve(__dirname, '../../resources/', path);
