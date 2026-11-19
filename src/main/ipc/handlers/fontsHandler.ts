import { getFonts } from 'font-list';
import { listCustomFonts, readCustomFontFile } from '../../fonts/customFonts';

let SYSTEM_FONTS: string[];
(async () => {
  SYSTEM_FONTS = await getFonts({ disableQuoting: true });
})();

export const fontsHandler = {
  getSystemFonts: async () => {
    if (!SYSTEM_FONTS) {
      return await getFonts({ disableQuoting: true });
    }
    return SYSTEM_FONTS;
  },
  /** The fonts the user added (one entry per file, so a family can have several weights and styles). */
  getCustomFonts: () => listCustomFonts(),
  getCustomFontFile: (file: string) => readCustomFontFile(file),
};
