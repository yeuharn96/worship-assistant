import { ModalContext, ModalName } from '@renderer/components/modals';
import { create } from 'zustand';

interface ModalState {
  modal: { name?: ModalName; context?: ModalContext };
  openGlobalModal: (payload: { name: ModalName; context?: ModalContext }) => void;
  closeGlobalModal: () => void;
}

const defaultModalState = {
  modal: { name: undefined, context: undefined },
};

const useModalStore = create<ModalState>()((set) => ({
  ...defaultModalState,

  openGlobalModal: (modal) => set({ modal }),
  closeGlobalModal: () => set({ modal: defaultModalState.modal }),
}));

export default useModalStore;
