import { existsSync, readFileSync } from 'fs';
import { BibleData, BibleLang, BibleSource, BibleStatus } from '../../shared/types';
import { getDataPath, getResourcePath } from '../utils';
import { parseBibleText } from './bibleText';

export const BIBLE_LANGS: BibleLang[] = ['zh', 'en'];

/**
 * Bible texts that may be shipped with the app. Only public domain translations belong here; other translations are
 * loaded by the user (Bible menu) and kept in the data folder.
 */
const BUILT_IN_BIBLE_FILES: Partial<Record<BibleLang, string>> = {
  zh: 'hgb-utf8.txt', // Chinese Union Version (1919), public domain
};

export const getBibleFileName = (lang: BibleLang) => `bible-${lang}.txt`;
export const getImportedBiblePath = (lang: BibleLang) => getDataPath(getBibleFileName(lang));

const loadBible = (lang: BibleLang): { bible: BibleData; source: BibleSource } => {
  const builtInFile = BUILT_IN_BIBLE_FILES[lang];
  const candidates: [string, BibleSource][] = [[getImportedBiblePath(lang), 'imported']];
  if (builtInFile) candidates.push([getResourcePath(builtInFile), 'built-in']);

  for (const [filePath, source] of candidates) {
    if (!existsSync(filePath)) continue;
    try {
      const { bible, verseCount } = parseBibleText(readFileSync(filePath, { encoding: 'utf-8' }));
      if (verseCount > 0) return { bible, source };
      console.error(`No verses found in Bible text file ${filePath}`);
    } catch (e) {
      console.error(`Unable to read Bible text file ${filePath}`, e);
    }
  }
  return { bible: {}, source: 'none' };
};

const BIBLE_DATA = {} as Record<BibleLang, BibleData>;
const BIBLE_STATUS = {} as BibleStatus;

/** (Re)load the Bible text of the given languages, or all of them. */
const reloadBible = (langs = BIBLE_LANGS) => {
  langs.forEach((lang) => {
    const { bible, source } = loadBible(lang);
    BIBLE_DATA[lang] = bible;
    BIBLE_STATUS[lang] = source;
  });
};
const getBibleData = () => BIBLE_DATA;
const getBibleStatus = (): BibleStatus => ({ ...BIBLE_STATUS });

reloadBible();

export { getBibleData, getBibleStatus, reloadBible };
