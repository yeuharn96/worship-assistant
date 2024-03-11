import { ZH_FONTS } from '@renderer/lib/constants';
import { Adjustment, Profile, TextSetting } from 'src/shared/types';
import { create } from 'zustand';

export interface ProfileState extends Profile {
  getProfile: () => Profile;

  setProfile: (p: Partial<Profile>) => void;
  setAdjustment: (adj: Partial<Adjustment>) => void;

  // bible
  setTextSetting: (field: 'title' | 'num' | 'zh' | 'en', setting: Partial<TextSetting>) => void;

  // video
  addPlaylistItems: (items: string[]) => void;
  removePlaylistItem: (item: string) => void;
}

const defaultProfile: Profile = {
  profile: { id: crypto.randomUUID(), name: 'default', selected: true },
  adjustment: { top: 0, bottom: 0, left: 0, right: 0 },
  mode: 'bible',

  // bible
  lang: 'zh',
  bgColor: '#000000',
  bgImage: undefined,
  spacing: 8,
  title: { size: 56, color: '#ffff00', font: ZH_FONTS[0], show: true },
  num: { size: 54, color: '#ffff00', font: 'Verdana' },
  zh: { size: 18, color: '#ffffff', font: ZH_FONTS[0], show: true },
  en: { size: 56, color: '#ffff00', font: 'Yu Gothic', show: true },
  scrollUnit: 100,

  // video
  playlist: [],
  volume: 100,
  loop: false,
  playNext: false,
  skipSeconds: 5,
};

const useProfileStore = create<ProfileState>()((set, get) => ({
  ...defaultProfile,

  getProfile: () => {
    const { setProfile, setAdjustment, setTextSetting, addPlaylistItems, removePlaylistItem, getProfile, ...profile } =
      get();
    return profile;
  },

  setProfile: (p) => set((state) => ({ ...state, ...p })),
  setAdjustment: (adj) => set((state) => ({ ...state, adjustment: { ...state.adjustment, ...adj } })),
  setTextSetting: (field, setting) => set((state) => ({ ...state, [field]: { ...state[field], ...setting } })),
  addPlaylistItems: (items) => set((state) => ({ ...state, playlist: [...state.playlist, ...items] })),
  removePlaylistItem: (item) => set((state) => ({ ...state, playlist: state.playlist.filter((i) => i !== item) })),
}));

export default useProfileStore;
