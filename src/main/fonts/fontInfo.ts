import { CustomFont } from '../../shared/types';

/** What a font file says about itself, used to register it under the right family, weight and style. */
export type FontInfo = Omit<CustomFont, 'file'>;

const SFNT_VERSIONS = [0x00010000, 0x4f54544f /* OTTO */, 0x74727565 /* true */];
const WINDOWS_ENGLISH_US = 0x0409;

const decodeUtf16Be = (buf: Buffer) => {
  let s = '';
  for (let i = 0; i + 1 < buf.length; i += 2) s += String.fromCharCode(buf.readUInt16BE(i));
  return s;
};

const findTable = (buf: Buffer, tag: string) => {
  const numTables = buf.readUInt16BE(4);
  for (let i = 0; i < numTables; i++) {
    const record = 12 + i * 16;
    if (record + 16 > buf.length) break;
    if (buf.toString('latin1', record, record + 4) === tag) {
      const offset = buf.readUInt32BE(record + 8);
      const length = buf.readUInt32BE(record + 12);
      if (offset + length > buf.length) return undefined;
      return buf.subarray(offset, offset + length);
    }
  }
  return undefined;
};

/** Read a name from the `name` table, preferring US English Windows names, then any Windows name, then Mac Roman. */
const readName = (name: Buffer, nameId: number) => {
  const count = name.readUInt16BE(2);
  const stringOffset = name.readUInt16BE(4);
  const candidates: { rank: number; value: string }[] = [];
  for (let i = 0; i < count; i++) {
    const r = 6 + i * 12;
    if (r + 12 > name.length) break;
    if (name.readUInt16BE(r + 6) !== nameId) continue;
    const platform = name.readUInt16BE(r);
    const encoding = name.readUInt16BE(r + 2);
    const language = name.readUInt16BE(r + 4);
    const length = name.readUInt16BE(r + 8);
    const start = stringOffset + name.readUInt16BE(r + 10);
    if (start + length > name.length) continue;
    const raw = name.subarray(start, start + length);
    if (platform === 3 && (encoding === 0 || encoding === 1 || encoding === 10)) {
      candidates.push({ rank: language === WINDOWS_ENGLISH_US ? 0 : 1, value: decodeUtf16Be(raw) });
    } else if (platform === 0) {
      candidates.push({ rank: 2, value: decodeUtf16Be(raw) });
    } else if (platform === 1 && encoding === 0 && language === 0) {
      candidates.push({ rank: 3, value: raw.toString('latin1') });
    }
  }
  return candidates
    .sort((a, b) => a.rank - b.rank)
    .map((c) => c.value.replace(/\0/g, '').trim())
    .find(Boolean);
};

/** Read the family name, weight and style of a TrueType or OpenType font. Returns undefined if it isn't one. */
export const readFontInfo = (buf: Buffer): FontInfo | undefined => {
  try {
    if (buf.length < 12 || !SFNT_VERSIONS.includes(buf.readUInt32BE(0))) return undefined;
    const name = findTable(buf, 'name');
    if (!name || name.length < 6) return undefined;
    // The typographic family (16) groups styles like "Light" and "Black" under one name; older fonts only have 1.
    const family = readName(name, 16) ?? readName(name, 1);
    if (!family) return undefined;

    const subfamily = (readName(name, 17) ?? readName(name, 2) ?? '').toLowerCase();
    const os2 = findTable(buf, 'OS/2');
    const weightClass = os2 && os2.length >= 6 ? os2.readUInt16BE(4) : 0;
    const italicBit = os2 && os2.length >= 64 ? (os2.readUInt16BE(62) & 1) === 1 : false;
    const weight = weightClass >= 1 && weightClass <= 1000 ? weightClass : subfamily.includes('bold') ? 700 : 400;
    const italic = italicBit || subfamily.includes('italic') || subfamily.includes('oblique');
    return { family, weight, style: italic ? 'italic' : 'normal' };
  } catch {
    return undefined;
  }
};

const WEIGHT_NAMES: Record<number, string> = {
  100: 'Thin',
  200: 'Extra Light',
  300: 'Light',
  400: 'Regular',
  500: 'Medium',
  600: 'Semi Bold',
  700: 'Bold',
  800: 'Extra Bold',
  900: 'Black',
};

/** e.g. "Bold Italic", for messages. */
export const describeStyle = ({ weight, style }: FontInfo) => {
  const weightName = WEIGHT_NAMES[Math.round(weight / 100) * 100] ?? `Weight ${weight}`;
  if (style !== 'italic') return weightName;
  return weightName === 'Regular' ? 'Italic' : `${weightName} Italic`;
};
