import { Profile } from '../../shared/types';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { getDataPath } from '../utils';

const tryParseJson = (json: string) => {
  try {
    return JSON.parse(json);
  } catch {
    return undefined;
  }
};

class AppSettings {
  private static SETTINGS_FILE_PATH = getDataPath('settings.json');
  private static instance: AppSettings;
  private savedJson: string = '';
  private profiles: Profile[] = [];

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
    const settingFileExists = existsSync(AppSettings.SETTINGS_FILE_PATH);
    if (settingFileExists) {
      this.savedJson = readFileSync(AppSettings.SETTINGS_FILE_PATH, { encoding: 'utf-8' });
      const settings = tryParseJson(this.savedJson);
      this.profiles = settings.profiles;
    }
  }

  public writeSaveFile() {
    const { savedJson, ...appSettings } = this;

    const updatedJson = JSON.stringify(appSettings, undefined, 2);
    if (updatedJson === this.savedJson) return;

    writeFileSync(AppSettings.SETTINGS_FILE_PATH, updatedJson, {
      encoding: 'utf-8',
    });
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

  public selectProfile(id: string) {
    this.profiles.forEach((p) => (p.profile.selected = p.profile.id === id));
  }

  public saveProfile(value: Profile) {
    const profile = this.getProfile(value.profile.id);
    if (!profile) {
      this.profiles.push(value);
    } else {
      Object.keys(profile).forEach((key) => {
        if (key in value) profile[key] = value[key];
      });
    }

    this.selectProfile(value.profile.id);
  }
}

const appSettings = AppSettings.getInstance();
export { AppSettings, appSettings };
