import { getFonts } from 'font-list';

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
};
