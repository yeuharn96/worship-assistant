import BibleTextSettingsModal from './BibleTextSettingsModal';
import OutputAdjustmentModal from './OutputAdjustmentModal/OutputAdjustmentModal';
import ProfilesModal from './ProfilesModal';

const modals = {
  'bible-text-settings': BibleTextSettingsModal,
  'output-adjustment': OutputAdjustmentModal,
  profiles: ProfilesModal,
};

export type ModalName = keyof typeof modals;
export type ModalContext = Record<string, unknown>;

export default modals;
