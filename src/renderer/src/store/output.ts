import { ScriptureLocation, Size } from 'src/shared/types';
import { create } from 'zustand';

export type Output = {
  isShowing: boolean;
  dimension?: Size;
  playingVideo?: string;
} & ScriptureLocation;

interface OutputState extends Output {
  setOutput: (o: Partial<Output>) => void;
}

const defaultOutput: Output = {
  book: 'Gen',
  chapter: '1',
  verse: '1',
  isShowing: false,
};

const useOutputStore = create<OutputState>()((set) => ({
  ...defaultOutput,

  setOutput: (o) => set((state) => ({ ...state, ...o })),
}));

export default useOutputStore;
