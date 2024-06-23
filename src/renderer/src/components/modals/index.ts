import BibleTextSettingsModal from './BibleTextSettingsModal';
import OutputAdjustmentModal from './OutputAdjustmentModal/OutputAdjustmentModal';

const modals = {
  'bible-text-settings': BibleTextSettingsModal,
  'output-adjustment': OutputAdjustmentModal,
};

export type ModalName = keyof typeof modals;
export type ModalContext = Record<string, unknown>;

export default modals;
