import RangeSlider from '@renderer/components/ui/range-slider';
import Slider from '@renderer/components/ui/slider';
import { cn } from '@renderer/lib/utils';
import { MoveVertical, MoveHorizontal } from 'lucide-react';
import { FC } from 'react';
import { Adjustment, Size } from 'src/shared/types';

type Props = {
  selectedRect: 'output' | 'bg';
  adjustment: Adjustment;
  rectInfo: { centerPosY: number; centerPosX: number };
  dimension: Size;
  previewScale: number;
  setAdjustment: (adj: Partial<Adjustment>) => void;
  movePos: (pos: { posX?: number; posY?: number }) => void;
};
const AdjustmentSliders: FC<Props> = ({
  selectedRect,
  rectInfo,
  adjustment,
  dimension,
  previewScale,
  setAdjustment,
  movePos,
}) => {
  return (
    <>
      <div className='absolute -top-6 w-full'>
        <RangeSlider
          orientation='horizontal'
          min={0}
          max={dimension.width}
          step={1}
          value={[adjustment.left, dimension.width - adjustment.right]}
          onValueChange={([left, right]) => setAdjustment({ left, right: dimension.width - right })}
          className={cn(
            selectedRect === 'output' && '[&_.slider-range]:bg-blue-400',
            selectedRect === 'bg' && '[&_.slider-range]:bg-green-400',
          )}
          startThumbContent={<div className='absolute -top-6 left-1/2 -translate-x-1/2'>{adjustment.left}</div>}
          endThumbContent={<div className='absolute -top-6 left-1/2 -translate-x-1/2'>{adjustment.right}</div>}
        />
      </div>
      <div className='absolute -left-8'>
        <RangeSlider
          orientation='vertical'
          min={0}
          max={dimension.height}
          step={1}
          inverted
          value={[adjustment.top, dimension.height - adjustment.bottom]}
          onValueChange={([top, bottom]) => setAdjustment({ top, bottom: dimension.height - bottom })}
          className={cn(
            selectedRect === 'output' && '[&_.slider-range]:bg-blue-400',
            selectedRect === 'bg' && '[&_.slider-range]:bg-green-400',
          )}
          style={{ height: dimension.height * previewScale }}
          startThumbContent={<div className='absolute right-5 flex justify-end'>{adjustment.top}</div>}
          endThumbContent={<div className='absolute right-5 flex justify-end'>{adjustment.bottom}</div>}
        />
      </div>
      <div className='absolute -right-8'>
        <Slider
          orientation='vertical'
          min={0}
          max={dimension.height}
          inverted
          value={[rectInfo.centerPosY]}
          className='[&_.slider-range]:bg-transparent'
          style={{ height: dimension.height * previewScale }}
          onValueChange={([val]) => movePos({ posY: val })}
          thumbContent={
            <div className='absolute -right-6 top-1/2 -translate-y-1/2'>
              <MoveVertical />
            </div>
          }
        />
      </div>
      <div className='absolute -bottom-6 w-full'>
        <Slider
          orientation='horizontal'
          min={0}
          max={dimension.width}
          value={[rectInfo.centerPosX]}
          className='[&_.slider-range]:bg-transparent'
          onValueChange={([val]) => movePos({ posX: val })}
          thumbContent={
            <div className='absolute -bottom-6 left-1/2 -translate-x-1/2'>
              <MoveHorizontal />
            </div>
          }
        />
      </div>
    </>
  );
};

export default AdjustmentSliders;
