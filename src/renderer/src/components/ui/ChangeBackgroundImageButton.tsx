import { FC } from 'react';
import { FilePlus, XCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';

type Props = {
  bgImage?: string;
  onChange: (image?: string) => void;
};
const ChangeBackgroundImageButton: FC<Props> = ({ bgImage, onChange }) => {
  const handleChangeBackgroundImage = async () => {
    const image = await window.api.askImageDialog();

    if (image) onChange(image);
  };

  if (bgImage) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant='border'
              className='py-1 px-0 w-full leading-none h-7'
              title={!bgImage ? 'Select an image as background' : ''}
              onClick={handleChangeBackgroundImage}
            >
              <img src={`image:///${bgImage}`} className='max-w-full max-h-full' />
            </Button>
          </TooltipTrigger>
          <TooltipContent className='bg-gray-800 max-w-[20vw] max-h-[20vh] px-[1vw] py-[1vh] relative'>
            <div title='Remove background image' onClick={() => onChange(undefined)}>
              <XCircle className='text-red-700 bg-gray-200 rounded-full absolute right-[0vw] top-[0vh] cursor-pointer' />
            </div>
            <img src={`image:///${bgImage}`} className='max-w-[18vw] max-h-[18vh]' />
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
