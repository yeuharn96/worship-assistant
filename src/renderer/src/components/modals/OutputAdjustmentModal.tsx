import { FC, useEffect, useMemo, useState } from 'react';
import {
  AlignCenterHorizontal,
  AlignCenterVertical,
  AlignEndHorizontal,
  AlignEndVertical,
  AlignStartHorizontal,
  AlignStartVertical,
  Minus,
  MoveHorizontal,
  MoveVertical,
  Plus,
  RotateCcw,
} from 'lucide-react';
import { getCanvasBackground, getCanvasStyle } from '@renderer/lib/getCssStyles';
import { useOutputDimension } from '@renderer/hooks/useOutputDimension';
import useProfileStore from '@renderer/store/profile';
import useModalStore from '@renderer/store/modal';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import InputNumber from '../ui/input-number';
import RangeSlider from '../ui/range-slider';
import Slider from '../ui/slider';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';

const OutputAdjustmentModal = () => {
  const { dimension = { width: 0, height: 0 } } = useOutputDimension();
  const { getProfile, adjustment, setAdjustment, showGrid, splitAdjBg, setProfile } = useProfileStore();
  const { closeGlobalModal } = useModalStore();

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

  const movePos = ({ posX, posY }: { posX?: number; posY?: number }) => {
    const getOffset = (offset: number, start: number, end: number) => {
      if (start + offset < 0) return -start;
      if (end - offset < 0) return end;
      return offset;
    };

    const { top, bottom, left, right } = adjustment;
    const offsetX = posX === undefined ? 0 : getOffset(Math.round(posX - rectInfo.centerPosX), left, right);
    const offsetY = posY === undefined ? 0 : getOffset(Math.round(posY - rectInfo.centerPosY), top, bottom);

    setAdjustment({
      top: top + offsetY,
      bottom: bottom - offsetY,
      left: left + offsetX,
      right: right - offsetX,
    });
  };

  return (
    <div className='w-[95vw] h-[90vh] flex flex-col'>
      <div className='text-2xl font-bold ml-6 mt-3'>Output Adjustment</div>
      <div className='pt-14 flex'>
        <div>
          <div
            ref={(el) => {
              if (el?.clientWidth && dimension?.width) {
                setPreviewScale(el.clientWidth / dimension.width);
              }
            }}
            className='w-[50vw] select-none mx-24 border relative drop-shadow-[10_1px_1px_rgba(0,0,0,1)]'
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
            <div
              className='absolute flex justify-center items-center font-bold text-gray-400 text-6xl z-10'
              style={{
                ...getCanvasStyle(getProfile(), dimension, { x: previewScale, y: previewScale }),
                backgroundColor: '#373C66',
                border: '5px solid darkblue',
                fontSize: `${rectInfo.calcFontSize * 0.5}px`,
              }}
            >
              {splitAdjBg ? 'Foreground' : 'Output'}
            </div>
            {splitAdjBg && (
              <div
                className='absolute flex justify-center items-center font-bold text-gray-400 text-6xl'
                style={{
                  ...getCanvasStyle(getProfile(), dimension, { x: previewScale, y: previewScale }),
                  backgroundColor: '#345725',
                  border: '5px solid darkgreen',
                  fontSize: `${rectInfo.calcFontSize * 0.5}px`,
                }}
              >
                Background
              </div>
            )}
            <div className='absolute flex justify-center items-center top-0 bottom-0 left-0 right-0'>
              <span className='opacity-20 text-8xl font-bold -z-10'>Screen</span>
              {showGrid && (
                <>
                  <div className='absolute w-3/4 h-3/4 border-2 opacity-50 z-50'></div>
                  <hr className='absolute h-[2px] w-full bg-white opacity-60 z-50' />
                  <hr
                    className='absolute h-[2px] bg-white opacity-60 rotate-90 z-50'
                    style={{ width: dimension.height * previewScale }}
                  />
                </>
              )}
            </div>
          </div>
        </div>
        <div>
          <div className='text-xl text-gray-300 font-bold select-none'>
            <div className='flex mb-3 opacity-75'>
              <span className='w-1/3'>Top:</span>
              <InputNumber
                className='w-1/3'
                value={rectInfo.top}
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
                value={rectInfo.bottom}
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
                value={rectInfo.left}
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
                value={rectInfo.right}
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
          <hr />
          <div className='mt-3 flex'>
            <div className='flex-1'>
              <div className='mb-2'>Quick align:</div>
              <div className='mb-2'>
                <QuickAlignButton tooltip='Align Left' onClick={() => movePos({ posX: 0 })}>
                  <AlignStartVertical />
                </QuickAlignButton>
                <QuickAlignButton tooltip='Align Center' onClick={() => movePos({ posX: dimension.width / 2 })}>
                  <AlignCenterVertical />
                </QuickAlignButton>
                <QuickAlignButton tooltip='Align Right' onClick={() => movePos({ posX: dimension.width })}>
                  <AlignEndVertical />
                </QuickAlignButton>
              </div>
              <div>
                <QuickAlignButton tooltip='Align Top' onClick={() => movePos({ posY: 0 })}>
                  <AlignStartHorizontal />
                </QuickAlignButton>
                <QuickAlignButton tooltip='Align Middle' onClick={() => movePos({ posY: dimension.height / 2 })}>
                  <AlignCenterHorizontal />
                </QuickAlignButton>
                <QuickAlignButton tooltip='Align Bottom' onClick={() => movePos({ posY: dimension.height })}>
                  <AlignEndHorizontal />
                </QuickAlignButton>
              </div>
            </div>
            <div className='flex-1'>
              <label className='flex items-center cursor-pointer select-none'>
                Show grid:
                <Checkbox
                  className='border-white ml-2 data-[state=checked]:bg-white data-[state=checked]:text-primary'
                  checked={showGrid}
                  onCheckedChange={(checked) => setProfile({ showGrid: Boolean(checked) })}
                />
              </label>
              <label className='flex items-center cursor-pointer select-none'>
                Split background:
                <Checkbox
                  className='border-white ml-2 data-[state=checked]:bg-white data-[state=checked]:text-primary'
                  checked={splitAdjBg}
                  onCheckedChange={(checked) => setProfile({ splitAdjBg: Boolean(checked) })}
                />
              </label>
              <label className='flex items-center cursor-pointer select-none'>
                Preview background:
                <Checkbox className='border-white ml-2 data-[state=checked]:bg-white data-[state=checked]:text-primary' />
              </label>
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

export default OutputAdjustmentModal;
