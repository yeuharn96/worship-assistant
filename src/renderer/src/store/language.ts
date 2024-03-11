import { create } from 'zustand';
import { zh } from '@renderer/translations/zh';

export type Language = {
  displayLanguage: 'en' | 'zh';
  translations: typeof zh | Record<string, string>;
};

interface LanguageState extends Language {
  setLanguage: (displayLanguage: Language['displayLanguage']) => void;
  lang: (langKey: string, defaultText?: string) => string;
}

const useLanguageStore = create<LanguageState>()((set, get) => ({
  displayLanguage: 'en',
  translations: {},

  setLanguage: (displayLanguage) => set(() => ({ displayLanguage, translations: displayLanguage === 'zh' ? zh : {} })),
  lang: (key, defaultText) => get().translations[key] ?? defaultText ?? key,
}));

export default useLanguageStore;
