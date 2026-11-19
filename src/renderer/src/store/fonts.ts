import { create } from 'zustand';

/** The fonts registered in this window from the files the user added, so they can be removed again. */
let registered: FontFace[] = [];

/** Register the fonts the user added with this window, replacing any registered before. Returns their families. */
const registerCustomFonts = async () => {
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
    const [customFonts, systemFonts] = await Promise.all([registerCustomFonts(), window.api.getSystemFonts()]);
    set({ customFonts, systemFonts, loaded: true });
  },
}));

export default useFontsStore;
