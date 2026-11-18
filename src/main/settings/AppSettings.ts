import { Rectangle } from 'electron';
import { Profile } from '../../shared/types';
import { existsSync, mkdirSync, readFileSync, renameSync, rmSync, writeFileSync } from 'fs';
import { getDataPath } from '../utils';
import { dirname } from 'path';

const tryParseJson = (json: string) => {
  try {
    return JSON.parse(json);
  } catch {
    return undefined;
  }
};

export type WindowState = { bounds: Rectangle; isMaximized: boolean };

const isValidWindowState = (value: any): value is WindowState =>
  typeof value?.isMaximized === 'boolean' &&
  ['x', 'y', 'width', 'height'].every((key) => Number.isFinite(value?.bounds?.[key]));

export const isValidProfiles = (value: any): value is Profile[] =>
  Array.isArray(value) && value.every((p) => typeof p?.profile?.id === 'string');

class AppSettings {
  private static SETTINGS_FILE_PATH = getDataPath('settings.json');
  private static instance: AppSettings;
  private savedJson: string = '';
  private profiles: Profile[] = [];
  private windowState?: WindowState;

  private constructor() {
    if (!AppSettings.instance) {
      AppSettings.instance = this;
    }

    return AppSettings.instance;
  }

  public static getInstance() {
    if (!AppSettings.instance) {
      const appSettings = new AppSettings();
      appSettings.init();
    }

    return AppSettings.instance;
  }

  public init() {
    const filePath = AppSettings.SETTINGS_FILE_PATH;
    if (!existsSync(filePath)) return;

    try {
      this.savedJson = readFileSync(filePath, { encoding: 'utf-8' });
    } catch (e) {
      console.error('Unable to read settings file', e);
      return;
    }

    const settings = tryParseJson(this.savedJson);
    const profiles = settings?.profiles;
    if (isValidProfiles(profiles)) {
      this.profiles = profiles;
      if (isValidWindowState(settings.windowState)) this.windowState = settings.windowState;
      return;
    }

    // Settings file is damaged: keep a copy for the user and start from defaults instead of crashing.
    console.error('Settings file is invalid, starting with default settings');
    try {
      renameSync(filePath, `${filePath}.${Date.now()}.bak`);
    } catch (e) {
      console.error('Unable to back up invalid settings file', e);
    }
    this.savedJson = '';
  }

  public writeSaveFile() {
    const { savedJson, ...appSettings } = this;

    const updatedJson = JSON.stringify(appSettings, undefined, 2);
    if (updatedJson === this.savedJson) return;

    const filePath = AppSettings.SETTINGS_FILE_PATH;
    mkdirSync(dirname(filePath), { recursive: true });

    // Write to a temp file first so a crash mid-write never leaves a truncated settings.json.
    const tempPath = `${filePath}.tmp`;
    writeFileSync(tempPath, updatedJson, { encoding: 'utf-8' });
    try {
      renameSync(tempPath, filePath);
    } catch (e) {
      // Windows refuses to replace a file that's briefly locked (antivirus, search indexer, Explorer preview),
      // which would lose the session's settings. Fall back to writing in place, which those locks usually allow.
      console.error('Unable to replace settings file, writing it in place instead', e);
      writeFileSync(filePath, updatedJson, { encoding: 'utf-8' });
      rmSync(tempPath, { force: true });
    }
    this.savedJson = updatedJson;
  }

  public getWindowState() {
    return this.windowState;
  }
  public setWindowState(windowState: WindowState) {
    this.windowState = windowState;
  }

  public getProfiles() {
    return this.profiles;
  }
  public getProfile(id: string) {
    return this.profiles.find((p) => p.profile.id === id);
  }
  public getSelectedProfile() {
    return this.profiles.find((p) => p.profile.selected);
  }
  /** The selected profile, selecting the first one if none is (e.g. settings from an older version). */
  public getActiveProfile() {
    const profile = this.getSelectedProfile() ?? this.profiles[0];
    if (profile) this.selectProfile(profile.profile.id);
    return profile;
  }

  /** Replace all profiles, e.g. when importing settings from a previous version. */
  public replaceProfiles(profiles: Profile[]) {
    this.profiles = profiles;
  }

  public selectProfile(id: string) {
    this.profiles.forEach((p) => (p.profile.selected = p.profile.id === id));
  }

  public saveProfile(value: Profile) {
    const profile = this.getProfile(value.profile.id);
    if (!profile) {
      this.profiles.push(value);
    } else {
      // Copy every key from the incoming profile so settings added in newer versions are saved too.
      // Names are changed only through renameProfile, so keep the stored one over the renderer's (possibly older) copy.
      Object.assign(profile, value, { profile: { ...value.profile, name: profile.profile.name } });
    }

    this.selectProfile(value.profile.id);
  }

  public renameProfile(id: string, name: string) {
    const profile = this.getProfile(id);
    if (profile) profile.profile.name = name;
  }

  /** Remove a profile and return it, or undefined if there's no such profile. */
  public removeProfile(id: string) {
    const profile = this.getProfile(id);
    this.profiles = this.profiles.filter((p) => p.profile.id !== id);
    return profile;
  }
}

const appSettings = AppSettings.getInstance();
export { AppSettings, appSettings };
