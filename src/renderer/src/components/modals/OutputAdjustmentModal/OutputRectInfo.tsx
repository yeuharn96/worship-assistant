import { Minus, Plus, RotateCcw } from 'lucide-react';
import { Button } from '@renderer/components/ui/button';
import InputNumber from '@renderer/components/ui/input-number';
import { FC } from 'react';
import { Adjustment, Size } from 'src/shared/types';

type Props = {
  adjustment: Adjustment;
  rectInfo: Size;
  dimension: Size;
  setAdjustment: (adj: Partial<Adjustment>) => void;
};

const OutputRectInfo: FC<Props> = ({ adjustment, rectInfo, dimension, setAdjustment }) => {
  return (
    <div>
      <div className='text-xl text-gray-300 font-bold'>
        <div className='flex mb-3 opacity-75'>
          <span className='w-1/3'>Top:</span>
          <InputNumber
            className='w-1/3'
            value={adjustment.top}
            min={0}
            max={dimension.height}
            onChange={(value) => setAdjustment({ top: value })}
          />
          <Plus
            className='ml-2 cursor-pointer'
            onClick={() => setAdjustment({ top: Math.min(adjustment.top + 1, dimension.height) })}
          />
          <Minus
            className='ml-2 cursor-pointer'
            onClick={() => setAdjustment({ top: Math.max(adjustment.top - 1, 0) })}
          />
        </div>
        <div className='flex mb-3 opacity-75'>
          <span className='w-1/3'>Bottom:</span>
          <InputNumber
            className='w-1/3'
            value={adjustment.bottom}
            min={0}
            max={dimension.height}
            onChange={(value) => setAdjustment({ bottom: value })}
          />
          <Plus
            className='ml-2 cursor-pointer'
            onClick={() => setAdjustment({ bottom: Math.min(adjustment.bottom + 1, dimension.height) })}
          />
          <Minus
            className='ml-2 cursor-pointer'
            onClick={() => setAdjustment({ bottom: Math.max(adjustment.bottom - 1, 0) })}
          />
        </div>
        <div className='flex mb-3 opacity-75'>
          <span className='w-1/3'>Left:</span>
          <InputNumber
            className='w-1/3'
            value={adjustment.left}
            min={0}
            max={dimension.width}
            onChange={(value) => setAdjustment({ left: value })}
          />
          <Plus
            className='ml-2 cursor-pointer'
            onClick={() => setAdjustment({ left: Math.min(adjustment.left + 1, dimension.width) })}
          />
          <Minus
            className='ml-2 cursor-pointer'
            onClick={() => setAdjustment({ left: Math.max(adjustment.left - 1, 0) })}
          />
        </div>
        <div className='flex mb-3 opacity-75'>
          <span className='w-1/3'>Right:</span>
          <InputNumber
            className='w-1/3'
            value={adjustment.right}
            min={0}
            max={dimension.width}
            onChange={(value) => setAdjustment({ right: value })}
          />
          <Plus
            className='ml-2 cursor-pointer'
            onClick={() => setAdjustment({ right: Math.min(adjustment.right + 1, dimension.width) })}
          />
          <Minus
            className='ml-2 cursor-pointer'
            onClick={() => setAdjustment({ right: Math.max(adjustment.right - 1, 0) })}
          />
        </div>
        <div className='flex'>
          <div className='flex-1'>
            <div className='mb-3 opacity-75'>Width: {rectInfo.width}</div>
            <div className='mb-3 opacity-75'>Height: {rectInfo.height}</div>
          </div>
          <div className='flex-1'>
            <Button
              variant='border'
              className='py-1 h-fit'
              onClick={() => setAdjustment({ top: 0, bottom: 0, left: 0, right: 0 })}
            >
              Reset <RotateCcw className='ml-2 w-4' />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OutputRectInfo;
