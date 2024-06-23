import { useEffect, useMemo, useState } from 'react';
import {
  AlignCenterHorizontal,
  AlignCenterVertical,
  AlignEndHorizontal,
  AlignEndVertical,
  AlignStartHorizontal,
  AlignStartVertical,
} from 'lucide-react';
import { getCanvasStyle } from '@renderer/lib/getCssStyles';
import { useOutputDimension } from '@renderer/hooks/useOutputDimension';
import useProfileStore from '@renderer/store/profile';
import useModalStore from '@renderer/store/modal';
import { Button } from '../../ui/button';
import { Adjustment } from 'src/shared/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import OutputRectInfo from './OutputRectInfo';
import AdjustmentSliders from './AdjustmentSliders';
import { Checkbox } from '@renderer/components/ui/checkbox';
import QuickAlignButton from './QuickAlignButton';
import ChangeBackgroundImageButton from '@renderer/components/ui/ChangeBackgroundImageButton';
import { toast } from 'sonner';

const OutputAdjustmentModal = () => {
  const { dimension = { width: 0, height: 0 } } = useOutputDimension();
  const {
    adjustment,
    adjustmentBg,
    showGrid,
    splitAdjBg,
    previewAdjBg,
    bgColor,
    bgImage,
    setAdjustment,
    setAdjustmentBg,
    setProfile,
  } = useProfileStore();
  const { closeGlobalModal } = useModalStore();

  const [previewScale, setPreviewScale] = useState(1);
  const [selectedRect, setSelectedRect] = useState<'output' | 'bg'>('output');

  const calcRectInfo = (adj: Adjustment) => {
    const { left, right, top, bottom } = adj;
    const width = dimension.width - left - right;
    const height = dimension.height - top - bottom;
    const centerPosX = width / 2 + left;
    const centerPosY = height / 2 + top;
    const calcFontSize = Math.min(width, height) * previewScale;
    return { ...adjustment, width, height, centerPosX, centerPosY, calcFontSize };
  };

  const outputRectInfo = useMemo(() => {
    return calcRectInfo(adjustment);
  }, [dimension, adjustment, previewScale]);

  const bgRectInfo = useMemo(() => {
    return calcRectInfo(adjustmentBg);
  }, [dimension, adjustmentBg, previewScale]);

  const rectInfo = {
    output: { ...outputRectInfo, setAdj: setAdjustment },
    bg: { ...bgRectInfo, setAdj: setAdjustmentBg },
  };

  useEffect(() => {
    if (!splitAdjBg) setSelectedRect('output');
  }, [splitAdjBg]);

  const movePos = ({ posX, posY }: { posX?: number; posY?: number }) => {
    const getOffset = (offset: number, start: number, end: number) => {
      if (start + offset < 0) return -start;
      if (end - offset < 0) return end;
      return offset;
    };

    const { top, bottom, left, right } = selectedRect === 'bg' ? adjustmentBg : adjustment;
    const offsetX =
      posX === undefined ? 0 : getOffset(Math.round(posX - rectInfo[selectedRect].centerPosX), left, right);
    const offsetY =
      posY === undefined ? 0 : getOffset(Math.round(posY - rectInfo[selectedRect].centerPosY), top, bottom);

    rectInfo[selectedRect].setAdj({
      top: top + offsetY,
      bottom: bottom - offsetY,
      left: left + offsetX,
      right: right - offsetX,
    });
  };

  return (
    <div className='w-[95vw] h-[90vh] flex flex-col select-none'>
      <div className='text-2xl font-bold ml-6 mt-3'>Output Adjustment</div>
      <div className='pt-14 flex pr-6'>
        <div>
          <div
            ref={(el) => {
              if (el?.clientWidth && dimension?.width) {
                setPreviewScale(el.clientWidth / dimension.width);
              }
            }}
            className='w-[50vw] mx-24 border relative drop-shadow-[10_1px_1px_rgba(0,0,0,1)]'
            style={{ aspectRatio: dimension.width / dimension.height }}
          >
            <AdjustmentSliders
              selectedRect={selectedRect}
              dimension={dimension}
              movePos={movePos}
              previewScale={previewScale}
              rectInfo={rectInfo[selectedRect]}
              adjustment={selectedRect === 'bg' ? adjustmentBg : adjustment}
              setAdjustment={rectInfo[selectedRect].setAdj}
            />
            <div
              className='absolute flex justify-center items-center font-bold text-gray-400 text-6xl z-10'
              style={{
                ...getCanvasStyle({
                  adjustment,
                  outputSize: dimension,
                  scale: { x: previewScale, y: previewScale },
                  bgColor: !splitAdjBg && previewAdjBg ? bgColor : '#373C66',
                  ...(!splitAdjBg && previewAdjBg && { bgImage }),
                }),
                border: '5px solid darkblue',
                fontSize: `${rectInfo.output.calcFontSize * 0.5}px`,
              }}
            >
              {splitAdjBg ? 'Foreground' : 'Output'}
            </div>
            {splitAdjBg && (
              <div
                className='absolute flex justify-center items-center font-bold text-gray-400 text-6xl'
                style={{
                  ...getCanvasStyle({
                    adjustment: adjustmentBg,
                    outputSize: dimension,
                    scale: { x: previewScale, y: previewScale },
                    bgColor: previewAdjBg ? bgColor : '#345725',
                    ...(previewAdjBg && { bgImage }),
                  }),
                  border: '5px solid darkgreen',
                  fontSize: `${rectInfo.bg.calcFontSize * 0.5}px`,
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
        <div className='-mt-10'>
          <div className='text-lg text-gray-300 font-bold mb-2 opacity-90'>
            <Tabs value={selectedRect} onValueChange={(val: any) => setSelectedRect(val)} className='w-full'>
              <TabsList className='w-full bg-transparent border-b-2 rounded-none p-0 justify-start border-gray-400 [&>*]:w-1/2 [&>*]:text-gray-300 [&>*]:bg-gray-700 [&>*[data-state="inactive"]:hover]:bg-gray-600'>
                <TabsTrigger value='output'>{splitAdjBg && 'Foreground'} Rect Info</TabsTrigger>
                {splitAdjBg && <TabsTrigger value='bg'>Background Rect Info</TabsTrigger>}
              </TabsList>
              <TabsContent value='output'>
                <OutputRectInfo
                  dimension={dimension}
                  adjustment={adjustment}
                  rectInfo={rectInfo.output}
                  setAdjustment={rectInfo.output.setAdj}
                />
              </TabsContent>
              <TabsContent value='bg'>
                <OutputRectInfo
                  dimension={dimension}
                  adjustment={adjustmentBg}
                  rectInfo={rectInfo.bg}
                  setAdjustment={rectInfo.bg.setAdj}
                />
              </TabsContent>
            </Tabs>
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
              <label className='flex items-center cursor-pointer'>
                Show grid:
                <Checkbox
                  className='border-white ml-2 data-[state=checked]:bg-white data-[state=checked]:text-primary'
                  checked={showGrid}
                  onCheckedChange={(checked) => setProfile({ showGrid: Boolean(checked) })}
                />
              </label>
              <div className='underline mb-1'>Background:</div>
              <div className='flex'>
                <div className='flex-[1] pr-2'>
                  <ChangeBackgroundImageButton
                    bgImage={bgImage}
                    onChange={async (img) => {
                      if (img) {
                        try {
                          img = await window.api.copyToDataFolder(img);
                        } catch (e) {
                          toast.error('Unable to change background image', {
                            description: (e as Error).message,
                            closeButton: true,
                            duration: 10 * 1000,
                          });
                        }
                      }

                      if (bgImage) {
                        window.api.removeFromDataFolder(bgImage);
                      }
                      setProfile({ bgImage: img });
                    }}
                  />
                </div>
                <div className='flex-[1]'>
                  <input
                    type='color'
                    className='w-full px-0.5 rounded focus:outline-blue-400'
                    value={bgColor}
                    onChange={(e) => setProfile({ bgColor: e.target.value })}
                  />
                </div>
              </div>
              <label className='flex items-center cursor-pointer'>
                Split background:
                <Checkbox
                  className='border-white ml-2 data-[state=checked]:bg-white data-[state=checked]:text-primary'
                  checked={splitAdjBg}
                  onCheckedChange={(checked) => setProfile({ splitAdjBg: Boolean(checked) })}
                />
              </label>

              <label className='flex items-center cursor-pointer'>
                Preview background:
                <Checkbox
                  className='border-white ml-2 data-[state=checked]:bg-white data-[state=checked]:text-primary'
                  checked={previewAdjBg}
                  onCheckedChange={(checked) => setProfile({ previewAdjBg: Boolean(checked) })}
                />
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

export default OutputAdjustmentModal;
