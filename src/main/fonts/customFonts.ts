import { BrowserWindow, dialog } from 'electron';
import { existsSync, mkdirSync, readdirSync, readFileSync, renameSync, rmSync, writeFileSync } from 'fs';
import { basename, extname, join, parse } from 'path';
import { CustomFont } from '../../shared/types';
import { isOutputShowing } from '../appState';
import sendHandlers from '../ipc/sendHandlers';
import { getDataPath } from '../utils';
import { describeStyle, FontInfo, readFontInfo } from './fontInfo';

const FONT_EXTENSIONS = ['ttf', 'otf'];
const isFontFile = (file: string) => FONT_EXTENSIONS.includes(extname(file).slice(1).toLowerCase());

export const getFontsFolder = () => {
  const folder = getDataPath('fonts');
  if (!existsSync(folder)) mkdirSync(folder, { recursive: true });
  return folder;
};

const sortFonts = (fonts: CustomFont[]) =>
  fonts.sort((a, b) => a.family.localeCompare(b.family) || a.weight - b.weight || a.style.localeCompare(b.style));

const isSameStyle = (a: FontInfo, b: FontInfo) =>
  a.family.toLowerCase() === b.family.toLowerCase() && a.weight === b.weight && a.style === b.style;

/** Read the font files in `folder`, skipping any that aren't TrueType or OpenType fonts. */
const readFontsIn = (folder: string): CustomFont[] =>
  readdirSync(folder)
    .filter(isFontFile)
    .flatMap((file) => {
      try {
        const info = readFontInfo(readFileSync(join(folder, file)));
        return info ? [{ file, ...info }] : [];
      } catch {
        return [];
      }
    });

let fonts: CustomFont[] | undefined;

/** The fonts the user added: one entry per file, so a family can have several weights and styles. */
export const listCustomFonts = (): CustomFont[] => (fonts ??= sortFonts(readFontsIn(getFontsFolder())));

export const getCustomFamilies = () => [...new Set(listCustomFonts().map((f) => f.family))];

/** A font file's contents, for the windows to register. Only files in the fonts folder can be read. */
export const readCustomFontFile = (file: string) => {
  if (basename(file) !== file || !listCustomFonts().some((f) => f.file === file)) {
    throw new Error(`Unknown font file: ${file}`);
  }
  return readFileSync(join(getFontsFolder(), file));
};

/** A file name in the fonts folder that isn't taken, based on `name`. */
const freeFileName = (name: string) => {
  const folder = getFontsFolder();
  const { name: stem, ext } = parse(name);
  let candidate = name;
  for (let i = 2; existsSync(join(folder, candidate)); i++) candidate = `${stem} (${i})${ext}`;
  return candidate;
};

/**
 * Save a font to the fonts folder. A font with the same family, weight and style is replaced, e.g. by a newer version
 * of the same font.
 */
const saveFont = (data: Buffer, fileName: string, info: FontInfo) => {
  const folder = getFontsFolder();
  // Write the new file before removing the one it replaces, so a failed copy doesn't lose the font.
  let file = freeFileName(fileName);
  writeFileSync(join(folder, file), data);
  const replaced = listCustomFonts().filter((f) => isSameStyle(f, info));
  replaced.forEach((f) => rmSync(join(folder, f.file), { force: true }));
  // Keep the original file name if the replaced file had it.
  if (file !== fileName && !existsSync(join(folder, fileName))) {
    renameSync(join(folder, file), join(folder, fileName));
    file = fileName;
  }
  fonts = sortFonts([...listCustomFonts().filter((f) => !replaced.includes(f)), { file, ...info }]);
};

/** Ask for font files and add them. Returns true if any were added. */
export const addFonts = async (mainWindow: BrowserWindow) => {
  const title = 'Add Fonts';
  const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
    title: 'Select font files',
    properties: ['openFile', 'multiSelections'],
    filters: [{ name: 'Fonts (TrueType, OpenType)', extensions: FONT_EXTENSIONS }],
  });
  if (canceled || filePaths.length === 0) return false;

  const added: string[] = [];
  const skipped: string[] = [];
  const failed: string[] = [];
  for (const filePath of filePaths) {
    let data: Buffer;
    try {
      data = readFileSync(filePath);
    } catch {
      failed.push(basename(filePath));
      continue;
    }
    const info = isFontFile(filePath) ? readFontInfo(data) : undefined;
    if (!info) {
      skipped.push(basename(filePath));
      continue;
    }
    try {
      saveFont(data, basename(filePath), info);
      added.push(`${info.family} (${describeStyle(info)})`);
    } catch (e) {
      console.error('Unable to save font', e);
      failed.push(basename(filePath));
    }
  }

  if (added.length > 0) sendHandlers.customFontsChanged();

  const details = [
    added.length > 0 ? `Added:\n${added.map((f) => `• ${f}`).join('\n')}` : '',
    added.length > 0 ? 'Choose a font from the font list next to each text setting.' : '',
    skipped.length > 0
      ? `These files are not TrueType or OpenType fonts and were skipped:\n${skipped.map((f) => `• ${f}`).join('\n')}`
      : '',
    failed.length > 0
      ? `These files could not be copied to the app’s data folder:\n${failed.map((f) => `• ${f}`).join('\n')}`
      : '',
  ];
  await dialog.showMessageBox(mainWindow, {
    type: added.length > 0 ? 'info' : 'error',
    title,
    message:
      added.length > 0 ? (added.length === 1 ? 'Font added.' : `${added.length} fonts added.`) : 'No fonts were added.',
    detail: details.filter(Boolean).join('\n\n'),
  });
  return added.length > 0;
};

/** Remove all the files of a font family. Returns true if removed. */
export const removeFont = async (mainWindow: BrowserWindow, family: string) => {
  const title = 'Remove Font';
  const blockIfOutputShowing = async () => {
    if (!isOutputShowing()) return false;
    await dialog.showMessageBox(mainWindow, {
      type: 'warning',
      title,
      message: 'Hide the output before removing a font.',
      detail: 'Fonts can’t be removed while the output is showing, because it could change what is on the screen.',
    });
    return true;
  };
  if (await blockIfOutputShowing()) return false;

  const files = listCustomFonts().filter((f) => f.family === family);
  if (files.length === 0) return false;
  const { response } = await dialog.showMessageBox(mainWindow, {
    type: 'question',
    title,
    buttons: ['Remove', 'Cancel'],
    defaultId: 1,
    cancelId: 1,
    message: `Remove the font “${family}”?`,
    detail: `Text set to use it will be shown in the default font instead.\n\n${
      files.length === 1 ? 'Its file' : `Its ${files.length} files (${files.map(describeStyle).join(', ')})`
    } will be deleted from the app’s data folder.`,
  });
  if (response !== 0) return false;
  if (await blockIfOutputShowing()) return false;

  const folder = getFontsFolder();
  files.forEach((f) => rmSync(join(folder, f.file), { force: true }));
  fonts = listCustomFonts().filter((f) => !files.includes(f));
  sendHandlers.customFontsChanged();
  return true;
};

/** Copy the fonts added in another version's data folder. Fonts already here are kept. Returns how many were copied. */
export const copyFontsFrom = (oldDataFolder: string) => {
  const oldFolder = join(oldDataFolder, 'fonts');
  if (!existsSync(oldFolder)) return 0;
  let copied = 0;
  for (const font of readFontsIn(oldFolder)) {
    if (listCustomFonts().some((f) => isSameStyle(f, font))) continue;
    try {
      saveFont(readFileSync(join(oldFolder, font.file)), font.file, font);
      copied++;
    } catch (e) {
      console.error('Unable to copy font', e);
    }
  }
  if (copied > 0) sendHandlers.customFontsChanged();
  return copied;
};

/** Whether another version's data folder has fonts to copy. */
export const hasFontsIn = (oldDataFolder: string) => {
  const oldFolder = join(oldDataFolder, 'fonts');
  return existsSync(oldFolder) && readdirSync(oldFolder).some(isFontFile);
};
