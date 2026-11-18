import { create } from 'zustand';

/** The video playlist, shared by all profiles. */
interface PlaylistState {
  playlist: string[];
  /** Load the saved playlist, e.g. at startup or after importing settings. */
  load: () => Promise<void>;
  setPlaylist: (playlist: string[]) => void;
  addPlaylistItems: (items: string[]) => void;
  removePlaylistItem: (item: string) => void;
}

const usePlaylistStore = create<PlaylistState>()((set) => ({
  playlist: [],

  load: async () => set({ playlist: await window.api.getPlaylist() }),
  setPlaylist: (playlist) => set({ playlist }),
  addPlaylistItems: (items) => set((state) => ({ playlist: [...new Set([...state.playlist, ...items])] })),
  removePlaylistItem: (item) => set((state) => ({ playlist: state.playlist.filter((i) => i !== item) })),
}));

// Keep the main process's copy current, so it's saved with the other settings (on close or when profiles change).
usePlaylistStore.subscribe((state, prev) => {
  if (state.playlist !== prev.playlist) window.api.savePlaylist(state.playlist);
});

export default usePlaylistStore;
