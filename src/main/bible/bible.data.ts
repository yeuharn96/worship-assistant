import fs from 'fs';
import path from 'path';
import { BibleData } from '../../shared/types';

const DEFAULT_EN_BIBLE_PATH = '../../resources/esv-utf8.txt';
const DEFAULT_ZH_BIBLE_PATH = '../../resources/hgb-utf8.txt';

const loadBible = (filePath: string) => {
  let data = fs.readFileSync(filePath, { encoding: 'utf-8' });
  data = data.substring(data.indexOf('Gen 1:1')).trim();
  const lines = data.split('\n');

  const bible: BibleData = {};
  lines.forEach((line) => {
    line = line.trim();
    const sep1 = line.indexOf(' ');
    const sep2 = line.indexOf(' ', sep1 + 1);

    const book = line.substring(0, sep1); // 'Gen'
    const [chp, vrs] = line.substring(sep1 + 1, sep2).split(':'); // '1:1'
    const txt = line.substring(sep2 + 1); // 'In the beginning, ...'

    if (!bible[book]) bible[book] = {};
    if (!bible[book][chp]) bible[book][chp] = {};
    bible[book][chp][vrs] = txt;
  });

  return bible;
};

const reloadBible = () => {
  BIBLE_DATA = {
    zh: loadBible(path.resolve(__dirname, DEFAULT_ZH_BIBLE_PATH)),
    en: loadBible(path.resolve(__dirname, DEFAULT_EN_BIBLE_PATH)),
  };
};

let BIBLE_DATA: { zh: BibleData; en: BibleData };

reloadBible();

export { BIBLE_DATA, reloadBible };
