import * as Slider from '@radix-ui/react-slider';
import { FC, ReactNode } from 'react';
import { SliderProps } from '@radix-ui/react-slider';
import { cn } from '@renderer/lib/utils';

type Props = SliderProps & {
  startThumbContent?: ReactNode;
  endThumbContent?: ReactNode;
};

const RangeSlider: FC<Props> = ({ className, startThumbContent, endThumbContent, ...props }) => (
  <Slider.Root
    className={cn(
      'slider-root',
      'relative flex items-center opacity-70',
      'data-[orientation=vertical]:flex-col',
      'data-[orientation=vertical]:w-[20px]',
      'data-[orientation=vertical]:h-[100px]',
      className,
    )}
    defaultValue={[25, 75]}
    step={1}
    minStepsBetweenThumbs={1}
    {...props}
  >
    <Slider.Track
      className={cn('slider-track', 'relative flex-grow bg-slate-400 h-[5px]', 'data-[orientation=vertical]:w-[5px]')}
    >
      <Slider.Range
        className={cn(
          'slider-range',
          'absolute h-[5px] bg-[#f3f3f3]',
          'data-[orientation=vertical]:w-full',
          'data-[orientation=vertical]:h-auto',
        )}
      />
    </Slider.Track>
    <Slider.Thumb
      className={cn(
        'slider-thumb slider-thumb-left',
        'block w-[25px] h-[15px] rounded-[20%] bg-white cursor-pointer',
        'data-[orientation=vertical]:w-[15px]',
        'data-[orientation=vertical]:h-[25px]',
      )}
    >
      {startThumbContent}
    </Slider.Thumb>
    <Slider.Thumb
      className={cn(
        'slider-thumb slider-thumb-right',
        'block w-[25px] h-[15px] rounded-[20%] bg-white cursor-pointer',
        'data-[orientation=vertical]:w-[15px]',
        'data-[orientation=vertical]:h-[25px]',
      )}
    >
      {endThumbContent}
    </Slider.Thumb>
  </Slider.Root>
);

export default RangeSlider;
