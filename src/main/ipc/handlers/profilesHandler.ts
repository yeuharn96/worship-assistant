import { randomUUID } from 'crypto';
import { existsSync } from 'fs';
import { is } from '@electron-toolkit/utils';
import { appSettings } from '../../settings/AppSettings';
import { Profile, ProfileActionResult, ProfileInfo } from '../../../shared/types';
import { fileHandler } from './fileHandler';
import { isOutputShowing, refreshMenu } from '../../appState';

const MAX_NAME_LENGTH = 40;
const OUTPUT_SHOWING_ERROR = 'Hide the output to change profile, since that changes what is on the screen.';

const fail = (error: string): ProfileActionResult => ({ ok: false, error });

/** An error message if `name` can't be used, ignoring the profile being renamed. */
const validateName = (name: string, renamingId?: string) => {
  if (!name) return 'Enter a name for the profile.';
  if (name.length > MAX_NAME_LENGTH) return `Profile names can be up to ${MAX_NAME_LENGTH} characters.`;
  const taken = appSettings
    .getProfiles()
    .find((p) => p.profile.id !== renamingId && p.profile.name.toLowerCase() === name.toLowerCase());
  if (taken) return `There is already a profile called “${taken.profile.name}”.`;
  return undefined;
};

/** Settings are otherwise only saved on close, so save now to keep profile changes if the app doesn't close cleanly. */
const persist = () => {
  try {
    !is.dev && appSettings.writeSaveFile();
  } catch (e) {
    console.error('Unable to save settings', e);
  }
};

/** Give the new profile its own copy of the image, so replacing or deleting one profile's image never affects another. */
const copyBackgroundImage = (bgImage?: string) => {
  if (!bgImage || !existsSync(bgImage)) return undefined;
  try {
    return fileHandler.copyToDataFolder(bgImage);
  } catch (e) {
    console.error('Unable to copy background image', e);
    return undefined;
  }
};

export const profilesHandler = {
  listProfiles: (): ProfileInfo[] => appSettings.getProfiles().map(({ profile }) => ({ ...profile })),
  getProfile: (id: string) => appSettings.getProfile(id),
  getCurrentProfile: () => appSettings.getActiveProfile(),
  getPlaylist: () => appSettings.getPlaylist(),
  /** Kept in memory and saved to disk with the rest of the settings. */
  savePlaylist: (playlist: string[]) => appSettings.setPlaylist(playlist),

  /** Save the active profile, e.g. on first run or after its background image changed. */
  saveProfile: (profile: Profile) => {
    appSettings.saveProfile(profile);
    persist();
    refreshMenu();
  },

  /** Save `current` (the renderer's unsaved copy of the active profile) and make profile `id` active. */
  switchProfile: (current: Profile, id: string): ProfileActionResult => {
    const result = ((): ProfileActionResult => {
      if (isOutputShowing()) return fail(OUTPUT_SHOWING_ERROR);
      const target = appSettings.getProfile(id);
      if (!target) return fail('This profile no longer exists.');

      appSettings.saveProfile(current);
      appSettings.selectProfile(id);
      persist();
      return { ok: true, profile: target };
    })();
    // Also on failure: Electron ticks a menu's radio item when it's clicked, before the switch is attempted.
    refreshMenu();
    return result;
  },

  /** Save `current`, then add a profile with `base`'s settings and make it active. */
  createProfile: (current: Profile, name: string, base: Profile): ProfileActionResult => {
    if (isOutputShowing()) return fail(OUTPUT_SHOWING_ERROR);
    const trimmed = name.trim();
    const error = validateName(trimmed);
    if (error) return fail(error);

    appSettings.saveProfile(current);
    const profile: Profile = {
      ...structuredClone(base),
      profile: { id: randomUUID(), name: trimmed, selected: true },
      bgImage: copyBackgroundImage(base.bgImage),
    };
    appSettings.saveProfile(profile);
    persist();
    refreshMenu();
    return { ok: true, profile };
  },

  renameProfile: (id: string, name: string): ProfileActionResult => {
    if (!appSettings.getProfile(id)) return fail('This profile no longer exists.');
    const trimmed = name.trim();
    const error = validateName(trimmed, id);
    if (error) return fail(error);

    appSettings.renameProfile(id, trimmed);
    persist();
    refreshMenu();
    return { ok: true };
  },

  deleteProfile: (id: string): ProfileActionResult => {
    const profile = appSettings.getProfile(id);
    if (!profile) return { ok: true };
    if (appSettings.getProfiles().length <= 1) return fail('The last profile can’t be deleted.');
    if (profile.profile.selected) return fail('Switch to another profile before deleting this one.');

    appSettings.removeProfile(id);
    const { bgImage } = profile;
    if (bgImage && appSettings.getProfiles().every((p) => p.bgImage !== bgImage)) {
      fileHandler.removeFromDataFolder(bgImage);
    }
    persist();
    refreshMenu();
    return { ok: true };
  },
};
