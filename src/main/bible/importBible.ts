import { BrowserWindow, dialog } from 'electron';
import { existsSync, readFileSync, renameSync, rmSync, writeFileSync } from 'fs';
import { BibleLang } from '../../shared/types';
import sendHandlers from '../ipc/sendHandlers';
import { getOutputWindow } from '../windows/getWindows';
import { getImportedBiblePath, reloadBible } from './bible.data';
import { BIBLE_FILE_FORMAT_HELP, EXPECTED_VERSE_COUNT, parseBibleText } from './bibleText';

const LANG_NAMES: Record<BibleLang, string> = { en: 'English', zh: 'Chinese' };

const formatList = (items: string[], max = 5) =>
  items.length > max ? `${items.slice(0, max).join(', ')} and ${items.length - max} more` : items.join(', ');

// Changing the Bible text would change what's on the projector mid-service.
const blockIfOutputShowing = async (mainWindow: BrowserWindow, title: string) => {
  if (!getOutputWindow()?.isVisible()) return false;
  await dialog.showMessageBox(mainWindow, {
    type: 'warning',
    title,
    message: 'Hide the output before changing the Bible text.',
    detail:
      'The Bible text can’t be changed while the output is showing, because it would change what is on the screen.',
  });
  return true;
};

const applyBibleChange = (lang: BibleLang) => {
  reloadBible([lang]);
  sendHandlers.bibleTextChanged();
};

export const showBibleFileFormatHelp = (mainWindow: BrowserWindow) =>
  dialog.showMessageBox(mainWindow, {
    type: 'info',
    title: 'Bible Text Files',
    message: 'Bible text files',
    detail: `${BIBLE_FILE_FORMAT_HELP}\n\nThe app copies the file you load into its "data" folder, so you can move or delete the original afterwards.\n\nOnly load a translation you are allowed to use. Many modern translations are copyrighted and need permission from their publisher.`,
  });

/** Ask for a Bible text file and use it for `lang`. Returns true if loaded. */
export const importBibleText = async (mainWindow: BrowserWindow, lang: BibleLang) => {
  const title = `Load ${LANG_NAMES[lang]} Bible Text`;
  const showError = async (message: string, detail?: string) => {
    await dialog.showMessageBox(mainWindow, { type: 'error', title, message, detail });
    return false;
  };

  if (await blockIfOutputShowing(mainWindow, title)) return false;

  const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
    title: `Select a ${LANG_NAMES[lang]} Bible text file`,
    properties: ['openFile'],
    filters: [
      { name: 'Text Files', extensions: ['txt'] },
      { name: 'All Files', extensions: ['*'] },
    ],
  });
  const filePath = filePaths[0];
  if (canceled || !filePath) return false;

  let content: string;
  try {
    content = readFileSync(filePath, { encoding: 'utf-8' });
  } catch {
    return showError('The file could not be read.', filePath);
  }

  // Text that isn't UTF-8 (e.g. Chinese saved as GB2312/GBK) decodes to replacement characters.
  if (content.includes('�')) {
    return showError(
      'This file is not saved as UTF-8 text.',
      'Open it in Notepad, choose File › Save As, set Encoding to "UTF-8" and load the saved file.',
    );
  }

  const parsed = parseBibleText(content);
  if (parsed.verseCount === 0) {
    const unknown =
      parsed.unknownBookNames.length > 0
        ? `\n\nThese book names were not recognized: ${formatList(parsed.unknownBookNames)}.`
        : '';
    return showError('No Bible verses were found in this file.', `${BIBLE_FILE_FORMAT_HELP}${unknown}`);
  }

  if (parsed.missingVerseCount > 0 || parsed.unknownBookNames.length > 0) {
    const found = Math.max(0, EXPECTED_VERSE_COUNT - parsed.missingVerseCount);
    const details = [
      `${found.toLocaleString()} of ${EXPECTED_VERSE_COUNT.toLocaleString()} verses were found. Missing verses will be left blank.`,
      parsed.missingBooks.length > 0 ? `Books with no verses: ${formatList(parsed.missingBooks)}.` : '',
      parsed.unknownBookNames.length > 0
        ? `These book names were not recognized and their verses were skipped: ${formatList(parsed.unknownBookNames)}.`
        : '',
    ];
    const { response } = await dialog.showMessageBox(mainWindow, {
      type: 'warning',
      title,
      buttons: ['Load Anyway', 'Cancel'],
      defaultId: 1,
      cancelId: 1,
      message: 'Some verses are missing from this file.',
      detail: details.filter(Boolean).join('\n\n'),
    });
    if (response !== 0) return false;
  }

  if (await blockIfOutputShowing(mainWindow, title)) return false;

  // Write to a temp file first so a failed copy never leaves a truncated Bible text file.
  const destPath = getImportedBiblePath(lang);
  const tempPath = `${destPath}.tmp`;
  try {
    writeFileSync(tempPath, content, { encoding: 'utf-8' });
    renameSync(tempPath, destPath);
  } catch (e) {
    console.error('Unable to save Bible text file', e);
    rmSync(tempPath, { force: true });
    return showError('The Bible text could not be saved to the app’s data folder.', String(e));
  }

  applyBibleChange(lang);
  await dialog.showMessageBox(mainWindow, {
    type: 'info',
    title,
    message: `${LANG_NAMES[lang]} Bible text loaded.`,
    detail: `${parsed.verseCount.toLocaleString()} verses loaded.`,
  });
  return true;
};

/** Stop using the Bible text file the user loaded for `lang`. Returns true if removed. */
export const removeBibleText = async (mainWindow: BrowserWindow, lang: BibleLang) => {
  const title = `Remove ${LANG_NAMES[lang]} Bible Text`;
  if (await blockIfOutputShowing(mainWindow, title)) return false;

  const { response } = await dialog.showMessageBox(mainWindow, {
    type: 'question',
    title,
    buttons: ['Remove', 'Cancel'],
    defaultId: 1,
    cancelId: 1,
    message: `Remove the ${LANG_NAMES[lang]} Bible text you loaded?`,
    detail:
      lang === 'zh'
        ? 'The built-in Chinese Union Version will be used instead.'
        : 'No English text will be shown until you load another Bible text file.',
  });
  if (response !== 0) return false;
  if (await blockIfOutputShowing(mainWindow, title)) return false;

  try {
    rmSync(getImportedBiblePath(lang), { force: true });
  } catch (e) {
    console.error('Unable to remove Bible text file', e);
    await dialog.showMessageBox(mainWindow, {
      type: 'error',
      title,
      message: 'The Bible text file could not be removed.',
      detail: String(e),
    });
    return false;
  }

  applyBibleChange(lang);
  return true;
};

/** Checks the file rather than whether it loaded, so a damaged file can still be removed. */
export const hasImportedBibleText = (lang: BibleLang) => existsSync(getImportedBiblePath(lang));
