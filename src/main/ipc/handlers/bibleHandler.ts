import { Profile, ScriptureLocation } from '../../../shared/types';
import { getBibleData, getBibleStatus } from '../../bible/bible.data';
import VERSE_COUNT from '../../bible/verse-count.json';

export const bibleHandler = {
  getChpCount: (book: string) => Object.keys(VERSE_COUNT[book]).length,
  getVerseCount: (book: string, chp: string) => VERSE_COUNT[book][chp],
  // A loaded Bible text file may not have every book, chapter or verse (or no file may be loaded for a language).
  getChpText: (lang: Profile['lang'], book: string, chp: string) => getBibleData()[lang][book]?.[chp],
  getVerseText: (lang: Profile['lang'], { book, chapter, verse }: ScriptureLocation) =>
    getBibleData()[lang][book]?.[chapter]?.[verse] ?? '',
  getBibleStatus: () => getBibleStatus(),
};
