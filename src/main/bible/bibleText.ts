import { BibleData } from '../../shared/types';
import BIBLE_META from './bible.metadata.json';
import VERSE_COUNT from './verse-count.json';

/** Book names other than the ones in bible.metadata.json that people commonly use in Bible text files. */
const EXTRA_BOOK_NAMES: Record<string, string[]> = {
  Gen: ['Gn'],
  Exo: ['Exod', 'Ex'],
  Lev: ['Lv'],
  Num: ['Nm', 'Nb'],
  Deu: ['Deut', 'Dt'],
  Jos: ['Josh'],
  Jug: ['Judg', 'Jdg'],
  Rut: ['Ruth', 'Rth'],
  '1Sa': ['1Sam', '1Sm'],
  '2Sa': ['2Sam', '2Sm'],
  '1Ki': ['1Kgs', '1Kin'],
  '2Ki': ['2Kgs', '2Kin'],
  '1Ch': ['1Chr', '1Chron'],
  '2Ch': ['2Chr', '2Chron'],
  Ezr: ['Ezra'],
  Est: ['Esth'],
  Psm: ['Ps', 'Psa', 'Pss', 'Psalm'],
  Pro: ['Prov', 'Prv'],
  Ecc: ['Eccl', 'Eccles', 'Qoh'],
  Son: ['Song', 'Sng', 'Song of Solomon', 'Canticles'],
  Eze: ['Ezek', 'Ezk'],
  Dan: ['Dn'],
  Joe: ['Joel', 'Jl'],
  Amo: ['Amos'],
  Oba: ['Obad', 'Ob'],
  Jon: ['Jonah', 'Jnh'],
  Zep: ['Zeph'],
  Zec: ['Zech'],
  Mat: ['Matt', 'Mt'],
  Mak: ['Mark', 'Mrk', 'Mk'],
  Luk: ['Luke', 'Lk'],
  Jhn: ['John', 'Jn', 'Joh'],
  Act: ['Acts'],
  '1Co': ['1Cor'],
  '2Co': ['2Cor'],
  Phl: ['Phil', 'Php'],
  '1Ts': ['1Thess', '1Thes', '1Th'],
  '2Ts': ['2Thess', '2Thes', '2Th'],
  '1Ti': ['1Tim'],
  '2Ti': ['2Tim'],
  Tit: ['Titus'],
  Phm: ['Phlm', 'Philem'],
  Jas: ['Jam', 'Jms'],
  '1Pe': ['1Pet', '1Pt'],
  '2Pe': ['2Pet', '2Pt'],
  '1Jn': ['1John', '1Jhn', '1Jo'],
  '2Jn': ['2John', '2Jhn', '2Jo'],
  '3Jn': ['3John', '3Jhn', '3Jo'],
  Jud: ['Jude', 'Jde'],
  Rev: ['Revelations', 'Rv'],
};

const normalizeBookName = (name: string) => name.toLowerCase().replace(/[\s._]/g, '');

/** Every accepted book name (normalized) → the book code the app uses, e.g. 'genesis' → 'Gen'. */
const BOOK_CODES = new Map<string, string>();
BIBLE_META.bible_meta.forEach(({ _eng, eng, chi, _chi }) => {
  [_eng, eng, chi, _chi, ...(EXTRA_BOOK_NAMES[_eng] ?? [])].forEach((name) =>
    BOOK_CODES.set(normalizeBookName(name), _eng),
  );
});

const BOOK_TITLES = new Map(BIBLE_META.bible_meta.map(({ _eng, eng }) => [_eng, eng]));

export const EXPECTED_VERSE_COUNT = Object.values(VERSE_COUNT as Record<string, Record<string, number>>).reduce(
  (total, chapters) => total + Object.values(chapters).reduce((sum, count) => sum + count, 0),
  0,
);

/** `<book> <chapter>:<verse> <text>`, e.g. `Gen 1:1 In the beginning…` or `1 Samuel 3:10	Then the LORD came…`. */
const VERSE_LINE = /^(.+?)\s+(\d+)\s*:\s*(\d+)(?:\s+(.*))?$/;

export const BIBLE_FILE_FORMAT_HELP = [
  'A Bible text file is a UTF-8 text file with one verse per line, written as:',
  '    <book> <chapter>:<verse> <text>',
  '',
  'For example:',
  '    Gen 1:1 In the beginning, God created the heavens and the earth.',
  '    Genesis 1:2 The earth was without form and void…',
  '',
  'Books can be written as full English names (Genesis, 1 Samuel), common abbreviations (Gen, 1Sam, Ps, Matt) or Chinese names (创世纪, 创). Lines that are not verses, such as a title, are skipped.',
].join('\n');

export type ParsedBibleText = {
  bible: BibleData;
  /** Verses read from the file. */
  verseCount: number;
  /** Verses the app expects that the file does not have. */
  missingVerseCount: number;
  /** Titles of books the file has no verses for. */
  missingBooks: string[];
  /** Book names in the file that aren't recognized, so those verses were skipped. */
  unknownBookNames: string[];
};

export const parseBibleText = (content: string): ParsedBibleText => {
  const bible: BibleData = {};
  let verseCount = 0;
  /** Unrecognized book name → number of lines using it. */
  const unknownBookNames = new Map<string, number>();

  content
    .replace(/^\uFEFF/, '')
    .split(/\r?\n/)
    .forEach((line) => {
      const match = VERSE_LINE.exec(line.trim());
      if (!match) return;

      const [, bookName, chp, vrs, txt = ''] = match;
      const book = BOOK_CODES.get(normalizeBookName(bookName));
      if (!book) {
        unknownBookNames.set(bookName, (unknownBookNames.get(bookName) ?? 0) + 1);
        return;
      }

      // Strip leading zeros so '01' matches the chapter and verse numbers the app looks up.
      const chapter = String(Number(chp));
      const verse = String(Number(vrs));
      bible[book] ??= {};
      bible[book][chapter] ??= {};
      if (bible[book][chapter][verse] === undefined) verseCount++;
      bible[book][chapter][verse] = txt.trim();
    });

  let missingVerseCount = 0;
  const missingBooks: string[] = [];
  Object.entries(VERSE_COUNT as Record<string, Record<string, number>>).forEach(([book, chapters]) => {
    if (!bible[book]) missingBooks.push(BOOK_TITLES.get(book) ?? book);
    Object.entries(chapters).forEach(([chapter, count]) => {
      for (let verse = 1; verse <= count; verse++) {
        if (bible[book]?.[chapter]?.[verse] === undefined) missingVerseCount++;
      }
    });
  });

  // A title line such as "Holy Bible 2001: 3:16 …" can look like a verse of an unknown book. Real book names appear on
  // many lines, so only report names seen more than once (or all of them when no verse was recognized at all).
  const reportedBookNames = [...unknownBookNames].filter(([, lines]) => lines > 1 || verseCount === 0);
  return {
    bible,
    verseCount,
    missingVerseCount,
    missingBooks,
    unknownBookNames: reportedBookNames.map(([name]) => name),
  };
};
