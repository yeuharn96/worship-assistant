import * as Slider from '@radix-ui/react-slider';
import { cn } from '@renderer/lib/utils';
import { Menu } from 'lucide-react';
import { FC, ReactNode, WheelEventHandler } from 'react';

type Props = {
  volume: number;
  onVolumnChange?: (vol: number) => void;
};

const VolumeSlider: FC<Props> = ({ volume, onVolumnChange }) => {
  const renderTicks = (side: 'left' | 'right') => {
    const totalTicks = 20;
    const ticks: ReactNode[] = [];
    for (let i = 0; i <= totalTicks; i++) {
      ticks.push(
        <div
          key={`${side}-${i}`}
          className='absolute h-fit leading-[1vh] right-0 -translate-y-1/2'
          style={{
            top: `${(i / totalTicks) * 100}%`,
            ...(side === 'right' && { right: 0 }),
            ...(side === 'left' && { left: 0 }),
          }}
        >
          {i % 5 === 0 ? <hr className='w-[1.5vw]' /> : <div>-</div>}
        </div>,
      );
    }

    return ticks;
  };

  const handleWheel: WheelEventHandler<HTMLDivElement> = (e) => {
    let newVol = volume - e.deltaY / 50;
    if (newVol > 100) newVol = 100;
    else if (newVol < 0) newVol = 0;

    onVolumnChange && onVolumnChange(newVol);
  };

  return (
    <Slider.Root
      className={cn(
        'relative flex items-center cursor-pointer ',
        'data-[orientation=vertical]:flex-col',
        'data-[orientation=vertical]:w-[8vw]',
        'data-[orientation=vertical]:h-[55vh]',
      )}
      orientation='vertical'
      min={0}
      max={100}
      value={[volume]}
      onValueChange={([vol]) => onVolumnChange && onVolumnChange(vol)}
      onWheel={handleWheel}
    >
      <Slider.Track className={cn('relative grow bg-gray-500 rounded-full', 'data-[orientation=vertical]:w-[1vw]')} />
      <Slider.Thumb
        title='Volume'
        className={cn(
          'z-10 relative block h-[5vh] rounded-lg w-[8vw] px-2 cursor-pointer',
          'shadow-[0_4px_3px_3px_rgba(0,0,0,0.85)] bg-gray-200 text-gray-900',
          'flex justify-between items-center text-xl',
        )}
      >
        <Menu className='w-[1vw]' /> {volume} <Menu className='w-[1vw]' />
      </Slider.Thumb>
      <div className='absolute h-full right-[1.5vw] -z-10'>{renderTicks('left')}</div>
      <div className='absolute h-full left-[1.5vw] -z-10'>{renderTicks('right')}</div>
    </Slider.Root>
  );
};

export default VolumeSlider;
