export type Size = { width: number; height: number };
export type Scale = { x: number; y: number };
export type ReturnPromise<T extends Record<string, (...args: any[]) => any>> = {
  [K in keyof T]: (...args: Parameters<T[K]>) => Promise<ReturnType<T[K]>>;
};
export type ReturnVoid<T extends Record<string, (...args: any[]) => any>> = {
  [K in keyof T]: (...args: Parameters<T[K]>) => void;
};

export type BibleData = Record<BookName, Book>;
export type BookName = string;
export type Book = Record<ChapterNum, Chapter>;
export type ChapterNum = string;
export type Chapter = Record<VerseNum, VerseText>;
export type VerseNum = string;
export type VerseText = string;
export type ScriptureLocation = {
  book: string;
  chapter: string;
  verse: string;
};

export type TextSetting = { size: number; color: string; font: string; show: boolean };
export type Adjustment = { top: number; bottom: number; left: number; right: number };
export type Profile = {
  profile: { id: string; name: string; selected: boolean };
  adjustment: Adjustment;
  mode: 'bible' | 'video';

  // bible
  lang: 'zh' | 'en';
  bgColor: string;
  bgImage?: string;
  spacing: number;
  title: TextSetting;
  num: Omit<TextSetting, 'show'>;
  zh: TextSetting;
  en: TextSetting;
  scrollUnit: number;

  // video
  playlist: string[];
  volume: number;
  // fadeOutSeconds: number;
  loop: boolean;
  playNext: boolean;
  skipSeconds: number;
};

export type Video = { path: string; name: string };
export type VideoMetadata = Size & { duration: number };
export type VideoCommand = Partial<{
  play: boolean;
  pause: boolean;
  currentTime: number;
  volume: number;
}>;
export type VideoPlayState = {
  currentTime: number;
  duration: number;
};

export type WebContentEventListeners = {
  hideOutput: () => void;
  applyOutputSettings: (settings: Profile) => void;
  monitorOutput: (sourceId?: string) => void;

  // bible
  setOutputBibleText: (loc: ScriptureLocation) => void;
  scrollOutputOffset: (offset: number) => void;
  syncOutputScroll: (
    scrollHeight: number,
    scrollTop: number,
    versePos: Array<{ verse: string; scrollTop: number }>,
  ) => void;

  // video
  setOutputVideo: (videoPath: string, autoPlay?: boolean) => void;
  sendVideoCommand: (cmd: VideoCommand) => void;
  syncVideoPlayState: (playState: VideoPlayState) => void;
  signalVideoEnded: () => void;
};
