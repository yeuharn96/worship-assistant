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
export type BibleLang = 'zh' | 'en';
/** Where a language's Bible text comes from: a file the user loaded, the one shipped with the app, or nothing. */
export type BibleSource = 'imported' | 'built-in' | 'none';
export type BibleStatus = Record<BibleLang, BibleSource>;
export type ScriptureLocation = {
  book: string;
  chapter: string;
  verse: string;
};

export type TextSetting = {
  size: number;
  color: string;
  font: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  show: boolean;
};
export type Adjustment = { top: number; bottom: number; left: number; right: number };
export type Profile = {
  profile: { id: string; name: string; selected: boolean };
  mode: 'bible' | 'video';

  // bible
  lang: BibleLang;
  bgColor: string;
  bgImage?: string;
  spacing: number;
  title: TextSetting;
  num: Omit<TextSetting, 'show'>;
  zh: TextSetting;
  en: TextSetting;
  scrollUnit: number;
  smoothScrolling: boolean;

  // video
  playlist: string[];
  volume: number;
  // fadeOutSeconds: number;
  loop: boolean;
  playNext: boolean;
  skipSeconds: number;

  // adjustment
  showGrid: boolean;
  splitAdjBg: boolean;
  previewAdjBg: boolean;
  adjustment: Adjustment;
  adjustmentBg: Adjustment; // will use this when `splitAdjBg` === true
};

/** A profile's identity, without its settings: enough to list and pick profiles. */
export type ProfileInfo = Profile['profile'];
/** `profile` is set by actions that make another profile active (switch, create). */
export type ProfileActionResult = { ok: true; profile?: Profile } | { ok: false; error: string };

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

export type VersePos = { verse: string; scrollTop: number };

/** Events the main process sends to the control panel only (e.g. from the menu). */
export type ControlPanelEventListeners = {
  /** The user picked a profile in the menu. */
  switchProfileRequested: (id: string) => void;
  openProfilesManager: () => void;
};

export type WebContentEventListeners = {
  hideOutput: () => void;
  applyOutputSettings: (settings: Profile) => void;
  /** Replace the control panel's profile, e.g. after importing settings. */
  loadProfile: (profile: Profile) => void;
  monitorOutput: (sourceId?: string) => void;
  setOutputDimension: (size: Size) => void;

  // bible
  setBookTitleLanguage: (lang: 'en' | 'zh') => void;
  /** A Bible text file was loaded or removed, so Bible text must be fetched again. */
  bibleTextChanged: () => void;
  setOutputBibleText: (loc: ScriptureLocation) => void;
  /** Scroll the output by a relative amount (px). */
  scrollOutputOffset: (offset: number) => void;
  /** Scroll the output to an absolute position (px). */
  scrollOutputTo: (top: number) => void;
  /** Scroll the output to the next (1) or previous (-1) verse. */
  scrollOutputVerse: (direction: 1 | -1) => void;
  /** `versePos` is only sent when verse positions changed. */
  syncOutputScroll: (scrollHeight: number, scrollTop: number, versePos?: VersePos[]) => void;

  // video
  setOutputVideo: (videoPath: string, autoPlay?: boolean) => void;
  sendVideoCommand: (cmd: VideoCommand) => void;
  syncVideoPlayState: (playState: VideoPlayState) => void;
  signalVideoEnded: () => void;
};
