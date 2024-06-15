import BibleTextSettingsModal from './BibleTextSettingsModal';

const modals = {
  'bible-text-settings': BibleTextSettingsModal,
};

export type ModalName = keyof typeof modals;
export type ModalContext = Record<string, unknown>;

export default modals;
