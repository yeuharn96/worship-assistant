import { FC } from 'react';
import { Button } from '@renderer/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@renderer/components/ui/tooltip';

const QuickAlignButton: FC<{
  children: React.ReactNode;
  tooltip: string;
  onClick: () => void;
}> = ({ children, tooltip, onClick }) => {
  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant='border' className='px-2 mx-1' onClick={onClick}>
            {children}
          </Button>
        </TooltipTrigger>
        <TooltipContent className='bg-gray-900 border-none text-gray-300' side='bottom'>
          {tooltip}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default QuickAlignButton;
