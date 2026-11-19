import { create } from 'zustand';
import { quoteFontFamily } from '@renderer/lib/getCssStyles';

/** The fonts registered in this window from the files the user added, so they can be removed again. */
let registered: FontFace[] = [];
/** Counts loads, so an older load that finishes late doesn't undo a newer one. */
let loadCount = 0;

/** Register the fonts the user added with this window, replacing any registered before. Returns their families. */
const registerCustomFonts = async (load: number) => {
  const fonts = await window.api.getCustomFonts();
  const loaded = await Promise.all(
    fonts.map(async ({ file, family, weight, style }) => {
      try {
        const data = await window.api.getCustomFontFile(file);
        const face = await new FontFace(family, data, { weight: String(weight), style }).load();
        return { family, face };
      } catch (e) {
        console.error(`Unable to load font ${file}`, e);
        return undefined;
      }
    }),
  ).then((results) => results.filter((r): r is { family: string; face: FontFace } => !!r));
  if (load !== loadCount) return undefined;
  registered.forEach((face) => document.fonts.delete(face));
  registered = loaded.map(({ face }) => face);
  registered.forEach((face) => document.fonts.add(face));
  return [...new Set(loaded.map(({ family }) => family))];
};

interface FontsState {
  /** Families of the fonts the user added. */
  customFonts: string[];
  /** Fonts installed on the computer. */
  systemFonts: string[];
  /** Whether the font lists have been fetched. */
  loaded: boolean;
  /** Register the added fonts and list all fonts, e.g. at startup or after fonts were added or removed. */
  load: () => Promise<void>;
}

const useFontsStore = create<FontsState>()((set) => ({
  customFonts: [],
  systemFonts: [],
  loaded: false,
  load: async () => {
    const load = ++loadCount;
    const [customFonts, systemFonts] = await Promise.all([registerCustomFonts(load), window.api.getSystemFonts()]);
    if (load !== loadCount || !customFonts) return;
    availability.clear();
    set({ customFonts, systemFonts, loaded: true });
  },
}));

const availability = new Map<string, boolean>();
const SAMPLE_TEXT = 'mmmmmmmmmmlli 永和 0123';
const FALLBACKS = ['monospace', 'serif', 'sans-serif'];

/**
 * Whether this window can draw `family`. The font lists can't tell: on Windows they name some fonts in Chinese (e.g.
 * 楷体) while a setting may use the English name (KaiTi), which draws just the same. If the font is missing, text in it
 * is drawn in the fallback font, so it measures exactly the same as the fallback on its own.
 */
export const isFontAvailable = (family: string) => {
  let available = availability.get(family);
  if (available === undefined) {
    const ctx = document.createElement('canvas').getContext('2d');
    const measure = (font: string) => {
      if (!ctx) return 0;
      ctx.font = `72px ${font}`;
      return ctx.measureText(SAMPLE_TEXT).width;
    };
    available =
      !ctx || FALLBACKS.some((fallback) => measure(`${quoteFontFamily(family)}, ${fallback}`) !== measure(fallback));
    availability.set(family, available);
  }
  return available;
};

export default useFontsStore;
