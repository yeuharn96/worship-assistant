import useModalStore from '@renderer/store/modal';
import { Dialog, DialogContent } from './ui/dialog';
import modals from './modals';

const GlobalModal = () => {
  const { modal, closeGlobalModal } = useModalStore();
  const ModalContent = modals[modal.name as string];

  return (
    <Dialog open={Boolean(modal.name)} onOpenChange={(open) => !open && closeGlobalModal()}>
      <DialogContent className='max-w-[fit-content] p-0 text-gray-300 bg-gray-800'>
        {ModalContent && <ModalContent />}
      </DialogContent>
    </Dialog>
  );
};

export default GlobalModal;
