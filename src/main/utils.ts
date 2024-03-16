import { is } from '@electron-toolkit/utils';
import { app } from 'electron';
import { existsSync, mkdirSync } from 'fs';
import { dirname, resolve } from 'path';

// https://www.electronjs.org/docs/latest/api/app#appgetapppath
export const getDataPath = (path: string) => {
  if (is.dev) return resolve(__dirname, '../../data', path);

  const dataPath = resolve(dirname(app.getPath('exe')), './data');
  if (!existsSync(dataPath)) mkdirSync(dataPath, { recursive: true });
  return resolve(dataPath, path);
};
export const getResourcePath = (path: string) => resolve(__dirname, '../../resources/', path);
