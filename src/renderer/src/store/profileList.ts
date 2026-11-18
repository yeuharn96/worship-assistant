import { Profile, ProfileActionResult, ProfileInfo } from 'src/shared/types';
import { create } from 'zustand';
import useProfileStore, { createDefaultProfile } from './profile';

/** Each action resolves to an error message to show, or undefined if it succeeded. */
interface ProfileListState {
  profiles: ProfileInfo[];
  refresh: () => Promise<void>;
  switchTo: (id: string) => Promise<string | undefined>;
  /** Create a profile and make it active. It starts as a copy of the active profile, or with default settings. */
  create: (name: string, startFrom: 'current' | 'default') => Promise<string | undefined>;
  rename: (id: string, name: string) => Promise<string | undefined>;
  remove: (id: string) => Promise<string | undefined>;
}

/** Show `profile` in the control panel. */
const activate = (profile: Profile) => useProfileStore.getState().loadProfile(profile);

const useProfileListStore = create<ProfileListState>()((set, get) => {
  /** Apply a result's newly active profile (if any) and reload the list. */
  const handleResult = async (result: ProfileActionResult) => {
    if (!result.ok) return result.error;
    if (result.profile) activate(result.profile);
    await get().refresh();
    return undefined;
  };

  return {
    profiles: [],

    refresh: async () => set({ profiles: await window.api.listProfiles() }),

    switchTo: async (id) => {
      const current = useProfileStore.getState().getProfile();
      if (id === current.profile.id) return undefined;
      return handleResult(await window.api.switchProfile(current, id));
    },

    create: async (name, startFrom) => {
      const current = useProfileStore.getState().getProfile();
      const base = startFrom === 'current' ? current : createDefaultProfile();
      return handleResult(await window.api.createProfile(current, name, base));
    },

    rename: async (id, name) => {
      const result = await window.api.renameProfile(id, name);
      if (result.ok) {
        // Keep the control panel's copy in step, though the main process keeps the name when saving it.
        const { profile, setProfile } = useProfileStore.getState();
        if (profile.id === id) setProfile({ profile: { ...profile, name: name.trim() } });
      }
      return handleResult(result);
    },

    remove: async (id) => handleResult(await window.api.deleteProfile(id)),
  };
});

export default useProfileListStore;
