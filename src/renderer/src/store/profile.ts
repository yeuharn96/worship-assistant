import { ZH_FONTS } from '@renderer/lib/constants';
import { Adjustment, Profile, TextSetting } from 'src/shared/types';
import { create } from 'zustand';

export interface ProfileState extends Profile {
  getProfile: () => Profile;

  setProfile: (p: Partial<Profile>) => void;
  /** Replace every setting with `p`'s, using defaults for settings it doesn't have (e.g. saved by an older version). */
  loadProfile: (p: Profile) => void;
  /**
   * Change the background image and save the profile. The old image file is deleted right away, so the saved settings
   * must not keep pointing to it (they're written when profiles change, not only on close).
   */
  setBackgroundImage: (bgImage?: string) => void;
  setAdjustment: (adj: Partial<Adjustment>) => void;
  setAdjustmentBg: (adj: Partial<Adjustment>) => void;

  // bible
  setTextSetting: (field: 'title' | 'num' | 'zh' | 'en', setting: Partial<TextSetting>) => void;
}

export const createDefaultProfile = (): Profile => ({
  profile: { id: crypto.randomUUID(), name: 'Default', selected: true },
  mode: 'bible',

  // bible
  lang: 'en',
  bgColor: '#000000',
  bgImage: undefined,
  spacing: 8,
  title: { size: 56, color: '#ffff00', font: ZH_FONTS[0], underline: true, show: true },
  num: { size: 54, color: '#ffff00', font: 'Verdana' },
  zh: { size: 18, color: '#ffffff', font: ZH_FONTS[0], show: true },
  en: { size: 56, color: '#ffff00', font: 'Yu Gothic', show: true },
  scrollUnit: 100,
  smoothScrolling: false,

  // video
  volume: 100,
  loop: false,
  playNext: false,
  skipSeconds: 5,

  // adjustment
  showGrid: true,
  splitAdjBg: false,
  previewAdjBg: false,
  adjustment: { top: 0, bottom: 0, left: 0, right: 0 },
  adjustmentBg: { top: 0, bottom: 0, left: 0, right: 0 },
});

const useProfileStore = create<ProfileState>()((set, get) => ({
  ...createDefaultProfile(),

  getProfile: () => {
    const {
      setProfile,
      loadProfile,
      setBackgroundImage,
      setAdjustment,
      setAdjustmentBg,
      setTextSetting,
      getProfile,
      ...profile
    } = get();
    return profile;
  },

  setProfile: (p) => set((state) => ({ ...state, ...p })),
  loadProfile: (p) => set((state) => ({ ...state, ...createDefaultProfile(), ...p })),
  setBackgroundImage: (bgImage) => {
    set((state) => ({ ...state, bgImage }));
    window.api.saveProfile(get().getProfile());
  },
  setAdjustment: (adj) => set((state) => ({ ...state, adjustment: { ...state.adjustment, ...adj } })),
  setAdjustmentBg: (adj) => set((state) => ({ ...state, adjustmentBg: { ...state.adjustmentBg, ...adj } })),
  setTextSetting: (field, setting) => set((state) => ({ ...state, [field]: { ...state[field], ...setting } })),
}));

export default useProfileStore;
