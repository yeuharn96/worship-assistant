import { Profile, ScriptureLocation } from '../../../shared/types';
import { getBibleData } from '../../bible/bible.data';
import VERSE_COUNT from '../../bible/verse-count.json';

export const bibleHandler = {
  getChpCount: (book: string) => Object.keys(VERSE_COUNT[book]).length,
  getVerseCount: (book: string, chp: string) => VERSE_COUNT[book][chp],
  getChpText: (lang: Profile['lang'], book: string, chp: string) => getBibleData()[lang][book][chp],
  getVerseText: (lang: Profile['lang'], { book, chapter, verse }: ScriptureLocation) =>
    getBibleData()[lang][book][chapter][verse],
  // reloadBible: () => reloadBible(),
};
