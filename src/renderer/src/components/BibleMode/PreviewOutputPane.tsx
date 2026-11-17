import useOutputStore from '@renderer/store/output';
import { CSSProperties, FC, useEffect, useMemo, useRef, useState } from 'react';
import useProfileStore from '@renderer/store/profile';
import { Button } from '../ui/button';
import { CheckSquare, ChevronDown, ChevronUp } from 'lucide-react';
import { useIpcListeners } from '@renderer/lib/ipc';
import { cn } from '@renderer/lib/utils';
import { Checkbox } from '../ui/checkbox';
import { useOutputMonitor } from '@renderer/hooks/useOutputMonitor';
import { VersePos } from 'src/shared/types';

type Props = {
  show: boolean;
};

const PreviewOutputPane: FC<Props> = () => {
  const { scrollUnit, zh, en, smoothScrolling, setProfile } = useProfileStore();
  const { dimension, setOutput, isShowing, book, chapter, verse } = useOutputStore();
  const outputWrapperRef = useRef<HTMLDivElement>(null);
  const monitorRef = useRef<HTMLVideoElement>(null);

  const [selectedZhVerse, setSelectedZhVerse] = useState('');
  const [selectedEnVerse, setSelectedEnVerse] = useState('');

  const [outputScrollInfo, setOutputScrollInfo] = useState({
    scrollHeight: 0,
    scrollTop: 0,
    versePos: [] as VersePos[],
  });
  // Slider position while the user is dragging it, so the thumb doesn't jump back to the lagging output position.
  const [sliderValue, setSliderValue] = useState<number | null>(null);

  useOutputMonitor(monitorRef);
  useIpcListeners({
    syncOutputScroll: (scrollHeight, scrollTop, versePos) => {
      setOutputScrollInfo((prev) => ({ scrollHeight, scrollTop, versePos: versePos ?? prev.versePos }));
    },
  });

  useEffect(() => {
    (async () => {
      if (dimension) return;
      const d = await window.api.getOutputDimension();
      setOutput({ dimension: d });
    })();
  }, []);

  useEffect(() => {
    (async () => {
      const zhVrs = await window.api.getVerseText('zh', { book, chapter, verse });
      const enVrs = await window.api.getVerseText('en', { book, chapter, verse });
      setSelectedZhVerse(zhVrs);
      setSelectedEnVerse(enVrs);
    })();
  }, [book, chapter, verse]);

  const getDimensionStyle = (): CSSProperties => {
    if (!dimension) return {};

    const { width, height } = dimension;
    return { aspectRatio: width / height };
  };

  const verseTooltips = useMemo(() => {
    const { versePos } = outputScrollInfo;
    const lastVerse = versePos.at(-1);
    if (!lastVerse) return;

    const borderWidth = 5;

    return versePos.map((vp) => {
      const placementPos = lastVerse.scrollTop > 0 ? (vp.scrollTop / lastVerse.scrollTop) * 100 : 0;
      return (
        <div
          key={`${book}-${chapter}-${vp.verse}`}
          className={cn(
            'group group-hover:border-gray-700 group-hover:bg-gray-700 hover:bg-white hover:z-50',
            'px-2 rounded cursor-pointer shadow-[0_1px_3px_2px_rgba(0,0,0,0.5)] absolute text-gray-800 bg-gray-300 whitespace-nowrap',
          )}
          style={{ top: `${placementPos}%` }}
          onClick={() => window.api.scrollOutputTo(vp.scrollTop)}
          title={`Jump to Verse ${vp.verse}`}
        >
          <span className='hidden group-hover:inline'>Verse</span>{' '}
          <span className='group-hover:font-bold'>{vp.verse}</span>
          <div
            className='absolute top-1/2 left-0 border-solid border-[#DDD] border-transparent border-r-gray-300 group-hover:border-r-white'
            style={{
              borderWidth: `${borderWidth}px`,
              marginTop: `-${borderWidth}px`,
              marginLeft: `-${borderWidth * 2}px`,
            }}
          />
        </div>
      );
    });
  }, [outputScrollInfo.versePos, book, chapter]);

  return (
    <div className='w-full h-[90vh] flex flex-col items-center'>
      <div className='mb-[2vh] mr-auto w-[75vw] flex text-nowrap'>
        <span className='font-bold mr-1'>
          <CheckSquare className='inline-block h-5 w-5' /> Verse:
        </span>
        <div className='flex flex-col text-ellipsis overflow-hidden'>
          {zh.show && (
            <span title={selectedZhVerse} className='text-ellipsis text-nowrap whitespace-nowrap overflow-hidden'>
              <span className='italic text-yellow-400'>
                {book} {chapter}:{verse}
              </span>{' '}
              <span className='italic text-white'>{selectedZhVerse}</span>
            </span>
          )}
          {en.show && (
            <span title={selectedEnVerse} className='text-ellipsis text-nowrap whitespace-nowrap overflow-hidden'>
              <span className='italic text-yellow-400'>
                {book} {chapter}:{verse}
              </span>{' '}
              <span className='italic text-white'>{selectedEnVerse}</span>
            </span>
          )}
        </div>
      </div>
      <div
        ref={outputWrapperRef}
        className='outline max-w-[50vw] max-h-[50vh] min-w-[50vh] min-h-[50vh] relative'
        style={getDimensionStyle()}
      >
        <video
          ref={monitorRef}
          className='absolute h-full w-full'
          onWheel={(e) => window.api.scrollOutputOffset(e.deltaY)}
        />

        {isShowing && outputScrollInfo.scrollHeight > 0 && (
          <>
            <div className='absolute -right-[60vh] rotate-90 origin-top-left'>
              <input
                type='range'
                min={0}
                max={outputScrollInfo.scrollHeight}
                value={sliderValue ?? outputScrollInfo.scrollTop}
                onChange={(e) => {
                  const value = Number(e.target.value);
                  if (isNaN(value)) return;
                  setSliderValue(value);
                  window.api.scrollOutputTo(value);
                }}
                onPointerUp={() => setSliderValue(null)}
                onKeyUp={() => setSliderValue(null)}
                onBlur={() => setSliderValue(null)}
                className='w-[50vh]'
              />
            </div>
            <div className='absolute h-full top-0 -right-[12vh]'>{verseTooltips}</div>
          </>
        )}
      </div>

      {isShowing && (
        <>
          <div className='pt-[4vh] w-[30vw] flex space-x-4'>
            <Button
              variant='border'
              size='lg'
              className='pl-6 flex-1'
              title='Scroll Up'
              onClick={() => window.api.scrollOutputOffset(-scrollUnit)}
            >
              <ChevronUp className='h-10 w-10' /> Scroll Up
            </Button>
            <Button
              variant='border'
              size='lg'
              className='pl-6 flex-1'
              title='Scroll Down'
              onClick={() => window.api.scrollOutputOffset(scrollUnit)}
            >
              <ChevronDown className='h-10 w-10' /> Scroll Down
            </Button>
          </div>
          <div className='pt-[4vh] w-[30vw] flex space-x-4 relative'>
            <Button
              variant='border'
              size='lg'
              className='pl-6 flex-1'
              title='Scroll To Previous Verse'
              onClick={() => window.api.scrollOutputVerse(-1)}
            >
              <ChevronUp className='h-10 w-10' /> Prev Verse
            </Button>
            <Button
              variant='border'
              size='lg'
              className='pl-6 flex-1'
              title='Scroll To Next Verse'
              onClick={() => window.api.scrollOutputVerse(1)}
            >
              <ChevronDown className='h-10 w-10' /> Next Verse
            </Button>
            <label
              className={cn('absolute w-auto h-auto left-full translate-y-1/2', 'flex items-center cursor-pointer')}
            >
              <Checkbox
                className={cn(
                  'border-white mr-2 w-6 h-6',
                  'data-[state=checked]:bg-white data-[state=checked]:text-primary',
                )}
                checked={smoothScrolling}
                onCheckedChange={(checked) => setProfile({ smoothScrolling: Boolean(checked) })}
              />
              <span className={cn('text-nowrap', smoothScrolling && 'font-bold')}>Smooth Scrolling</span>
            </label>
          </div>
        </>
      )}
    </div>
  );
};

export default PreviewOutputPane;
