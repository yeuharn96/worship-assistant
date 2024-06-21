import * as SliderPrimitive from '@radix-ui/react-slider';
import { FC, ReactNode } from 'react';
import { SliderProps } from '@radix-ui/react-slider';
import { cn } from '@renderer/lib/utils';

type Props = SliderProps & {
  thumbContent?: ReactNode;
};

const Slider: FC<Props> = ({ className, thumbContent, ...props }) => (
  <SliderPrimitive.Root
    className={cn(
      'slider-root',
      'relative flex items-center opacity-70',
      'data-[orientation=vertical]:flex-col',
      'data-[orientation=vertical]:w-[20px]',
      'data-[orientation=vertical]:h-[100px]',
      className,
    )}
    defaultValue={[0]}
    step={1}
    {...props}
  >
    <SliderPrimitive.Track
      className={cn('slider-track', 'relative flex-grow bg-slate-400 h-[5px]', 'data-[orientation=vertical]:w-[5px]')}
    >
      <SliderPrimitive.Range
        className={cn(
          'slider-range',
          'absolute h-[5px] bg-[#f3f3f3]',
          'data-[orientation=vertical]:w-full',
          'data-[orientation=vertical]:h-auto',
        )}
      />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb
      className={cn(
        'slider-thumb',
        'block w-[25px] h-[15px] rounded-[20%] bg-white cursor-pointer',
        'data-[orientation=vertical]:w-[15px]',
        'data-[orientation=vertical]:h-[25px]',
      )}
    >
      {thumbContent}
    </SliderPrimitive.Thumb>
  </SliderPrimitive.Root>
);

export default Slider;
