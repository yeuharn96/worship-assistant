import useProfileStore from '@renderer/store/profile';
import ContentLine from '../BibleMode/ContentLine';
import { FC, useEffect, useMemo, useState } from 'react';
import { getCanvasBackground, getCanvasStyle } from '@renderer/lib/getCssStyles';
import { Button } from '../ui/button';
import useModalStore from '@renderer/store/modal';
import useOutputStore from '@renderer/store/output';
import { useOutputDimension } from '@renderer/hooks/useOutputDimension';

import { cn } from '@renderer/lib/utils';
import RangeSlider from '../ui/range-slider';
import Slider from '../ui/slider';
import {
  AlignCenterHorizontal,
  AlignCenterVertical,
  AlignEndHorizontal,
  AlignEndVertical,
  AlignStartHorizontal,
  AlignStartVertical,
  Move,
  MoveHorizontal,
  MoveVertical,
} from 'lucide-react';
import InputNumber from '../ui/input-number';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';

const OutputAdjustmentModal = () => {
  const { dimension = { width: 0, height: 0 } } = useOutputDimension();
  const { getProfile, adjustment, setAdjustment } = useProfileStore();
  const { closeGlobalModal } = useModalStore();
  const { isShowing } = useOutputStore();

  const [previewScale, setPreviewScale] = useState(1);

  const rectInfo = useMemo(() => {
    const { left, right, top, bottom } = adjustment;
    const width = dimension.width - left - right;
    const height = dimension.height - top - bottom;
    const centerPosX = width / 2 + left;
    const centerPosY = height / 2 + top;
    const calcFontSize = Math.min(width, height) * previewScale;
    return { ...adjustment, width, height, centerPosX, centerPosY, calcFontSize };
  }, [dimension, adjustment, previewScale]);

  return (
    <div className='w-[95vw] h-[90vh] flex flex-col'>
      <div className='text-2xl font-bold ml-6 mt-3'>Output Adjustment</div>
      <div className='pt-14 flex'>
        <div
          ref={(el) => {
            if (el?.clientWidth && dimension?.width) {
              setPreviewScale(el.clientWidth / dimension.width);
            }
          }}
          className='w-[50vw] mx-24 border relative drop-shadow-[10_1px_1px_rgba(0,0,0,1)]'
          style={{ aspectRatio: dimension.width / dimension.height }}
        >
          <div className='absolute -top-6 w-full'>
            <RangeSlider
              orientation='horizontal'
              min={0}
              max={dimension.width}
              step={1}
              value={[adjustment.left, dimension.width - adjustment.right]}
              onValueChange={([left, right]) => setAdjustment({ left, right: dimension.width - right })}
              className='[&_.slider-range]:bg-blue-400'
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
              className='[&_.slider-range]:bg-blue-400'
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
              onValueChange={([val]) => {
                const { top, bottom } = adjustment;
                let offset = Math.round(val - rectInfo.centerPosY);
                if (top + offset < 0) offset = Math.max(-top, offset);
                else if (bottom - offset < 0) offset = Math.min(bottom, offset);

                if (top + offset >= 0 && bottom - offset >= 0) {
                  setAdjustment({ top: top + offset, bottom: bottom - offset });
                }
              }}
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
              onValueChange={([val]) => {
                const { left, right } = adjustment;
                let offset = Math.round(val - rectInfo.centerPosX);
                if (left + offset < 0) offset = Math.max(-left, offset);
                else if (right - offset < 0) offset = Math.min(right, offset);

                if (left + offset >= 0 && right - offset >= 0) {
                  setAdjustment({ left: left + offset, right: right - offset });
                }
              }}
              thumbContent={
                <div className='absolute -bottom-6 left-1/2 -translate-x-1/2'>
                  <MoveHorizontal />
                </div>
              }
            />
          </div>
          <div
            className='absolute flex justify-center items-center font-bold text-gray-400 text-6xl'
            style={{
              ...getCanvasStyle(getProfile(), dimension, { x: previewScale, y: previewScale }),
              backgroundColor: '#373C66',
              border: '5px solid darkblue',
              fontSize: `${rectInfo.calcFontSize * 0.75}px`,
            }}
          >
            Output
          </div>
          <div
            className={cn(
              'absolute -z-10 flex justify-center items-center top-0 bottom-0 left-0 right-0',
              'text-8xl font-bold opacity-20',
            )}
          >
            Screen
          </div>
        </div>
        <div>
          <div className='text-xl text-gray-300 opacity-75 font-bold'>
            <div className='flex mb-3'>
              <span className='w-1/3'>Top:</span>
              <InputNumber
                className='w-1/3'
                value={rectInfo.top}
                min={0}
                max={dimension.height}
                onChange={(value) => setAdjustment({ top: value })}
              />
            </div>
            <div className='flex mb-3'>
              <span className='w-1/3'>Bottom:</span>
              <InputNumber
                className='w-1/3'
                value={rectInfo.bottom}
                min={0}
                max={dimension.height}
                onChange={(value) => setAdjustment({ bottom: value })}
              />
            </div>
            <div className='flex mb-3'>
              <span className='w-1/3'>Left:</span>
              <InputNumber
                className='w-1/3'
                value={rectInfo.left}
                min={0}
                max={dimension.width}
                onChange={(value) => setAdjustment({ left: value })}
              />
            </div>
            <div className='flex mb-3'>
              <span className='w-1/3'>Right:</span>
              <InputNumber
                className='w-1/3'
                value={rectInfo.right}
                min={0}
                max={dimension.width}
                onChange={(value) => setAdjustment({ right: value })}
              />
            </div>
            <div className='mb-3'>Width: {rectInfo.width}</div>
            <div className='mb-3'>Height: {rectInfo.height}</div>
          </div>
          <hr />
          <div className='mt-3'>
            <div className='mb-2'>Quick align:</div>
            <div>
              <QuickAlignButton tooltip='Align Left'>
                <AlignStartVertical />
              </QuickAlignButton>
              <QuickAlignButton tooltip='Align Center'>
                <AlignCenterVertical />
              </QuickAlignButton>
              <QuickAlignButton tooltip='Align Right'>
                <AlignEndVertical />
              </QuickAlignButton>
              <QuickAlignButton tooltip='Align Top'>
                <AlignStartHorizontal />
              </QuickAlignButton>
              <QuickAlignButton tooltip='Align Middle'>
                <AlignCenterHorizontal />
              </QuickAlignButton>
              <QuickAlignButton tooltip='Align Bottom'>
                <AlignEndHorizontal />
              </QuickAlignButton>
            </div>
          </div>
        </div>
      </div>

      <div className='flex mt-auto mb-4 justify-center'>
        <Button variant='secondary' className='px-20' onClick={closeGlobalModal}>
          Close
        </Button>
      </div>
    </div>
  );
};

const QuickAlignButton: FC<{
  children: React.ReactNode;
  tooltip: string;
  onClick: () => void;
}> = ({ children, tooltip, onClick }) => {
  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger>
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

export default OutputAdjustmentModal;
