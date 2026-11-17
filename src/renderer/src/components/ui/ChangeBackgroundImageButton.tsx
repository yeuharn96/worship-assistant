import { FC } from 'react';
import { FilePlus, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { localFileUrl } from '@renderer/lib/utils';
import { Button } from '../ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';

type Props = {
  bgImage?: string;
  /** Called with the new image's path inside the data folder, or `undefined` when the image is removed. */
  onChange: (image?: string) => void;
};
const ChangeBackgroundImageButton: FC<Props> = ({ bgImage, onChange }) => {
  const replaceImage = async (newImage?: string) => {
    let copiedImage: string | undefined;
    if (newImage) {
      try {
        copiedImage = await window.api.copyToDataFolder(newImage);
      } catch (e) {
        // Keep the current background untouched if the copy failed.
        toast.error('Unable to change background image', {
          description: (e as Error).message,
          closeButton: true,
          duration: 10 * 1000,
        });
        return;
      }
    }

    if (bgImage) window.api.removeFromDataFolder(bgImage);
    onChange(copiedImage);
  };

  const handleChangeBackgroundImage = async () => {
    const image = await window.api.askImageDialog();
    if (image) replaceImage(image);
  };

  if (bgImage) {
    const src = localFileUrl('image', bgImage);
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant='border'
              className='py-1 px-0 w-full leading-none h-7'
              onClick={handleChangeBackgroundImage}
            >
              <img src={src} className='max-w-full max-h-full' />
            </Button>
          </TooltipTrigger>
          <TooltipContent className='bg-gray-800 max-w-[20vw] max-h-[20vh] px-[1vw] py-[1vh] relative'>
            <div title='Remove background image' onClick={() => replaceImage(undefined)}>
              <XCircle className='text-red-700 bg-gray-200 rounded-full absolute right-[0vw] top-[0vh] cursor-pointer' />
            </div>
            <img src={src} className='max-w-[18vw] max-h-[18vh]' />
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <Button
      variant='border'
      className='py-1 px-0 w-full leading-none h-7'
      title='Select an image as background'
      onClick={handleChangeBackgroundImage}
    >
      <FilePlus className='max-h-full max-w-full inline-block' />
    </Button>
  );
};

export default ChangeBackgroundImageButton;
