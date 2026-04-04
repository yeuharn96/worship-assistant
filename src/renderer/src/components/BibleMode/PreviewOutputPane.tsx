import useOutputStore from '@renderer/store/output';
import { CSSProperties, FC, useEffect, useRef, useState } from 'react';
import useProfileStore from '@renderer/store/profile';
import { Button } from '../ui/button';
import { CheckSquare, ChevronDown, ChevronUp } from 'lucide-react';
import { useIpcListeners } from '@renderer/lib/ipc';
import { cn } from '@renderer/lib/utils';
import { Checkbox } from '../ui/checkbox';

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
    versePos: [] as Array<{ verse: string; scrollTop: number }>,
  });

  useIpcListeners({
    hideOutput: () => {
      if (monitorRef.current?.srcObject) {
        (monitorRef.current.srcObject as MediaStream).getTracks()[0].stop();
        monitorRef.current.srcObject = null;
      }
    },
    monitorOutput: async (sourceId) => {
      try {
        const constraints = {
          audio: false,
          video: {
            mandatory: {
              chromeMediaSource: 'desktop',
              chromeMediaSourceId: sourceId,
            },
          },
        };
        const stream = await navigator.mediaDevices.getUserMedia(constraints as any);

        if (monitorRef.current && !monitorRef.current.srcObject) {
          monitorRef.current.srcObject = stream;
          monitorRef.current.onloadedmetadata = () => monitorRef.current?.play();
        }
      } catch (e) {
        console.error(e);
      }
    },
    syncOutputScroll: (scrollHeight, scrollTop, versePos) => {
      setOutputScrollInfo({ scrollHeight, scrollTop, versePos });
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

  const scrollToPos = (pos: number) => {
    window.api.scrollOutputOffset(pos - outputScrollInfo.scrollTop, smoothScrolling ? 'smooth' : 'auto');
  };

  const scrollOffset = (offset: number) => {
    window.api.scrollOutputOffset(offset, smoothScrolling ? 'smooth' : 'auto');
  };

  const scrollToNextVerse = (next: boolean) => {
    const { scrollTop, versePos } = outputScrollInfo ?? {};
    const verseIdx = versePos?.findLastIndex((pos) => scrollTop >= pos.scrollTop) ?? -1;
    if (verseIdx === -1) return;

    if (verseIdx === 0 && !next) {
      scrollToPos(versePos[0].scrollTop);
      return;
    }
    if (verseIdx === versePos.length - 1 && next) {
      scrollToPos(versePos[versePos.length - 1].scrollTop);
      return;
    }

    scrollToPos(versePos[verseIdx + (next ? 1 : -1)].scrollTop);
  };

  const renderVerseTooltip = () => {
    const lastVerse = outputScrollInfo.versePos.at(-1);
    if (!lastVerse) return;

    const borderWidth = 5;

    return outputScrollInfo.versePos.map((vp) => {
      const placementPos = (vp.scrollTop / lastVerse.scrollTop) * 100;
      return (
        <div
          key={`${book}-${chapter}-${vp.verse}`}
          className={cn(
            'group group-hover:border-gray-700 group-hover:bg-gray-700 hover:bg-white hover:z-50',
            'px-2 rounded cursor-pointer shadow-[0_1px_3px_2px_rgba(0,0,0,0.5)] absolute text-gray-800 bg-gray-300 whitespace-nowrap',
          )}
          style={{ top: `${placementPos}%` }}
          onClick={() => scrollToPos(vp.scrollTop)}
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
  };

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
                value={outputScrollInfo.scrollTop}
                onChange={(e) => {
                  const value = Number(e.target.value);
                  !isNaN(value) && scrollToPos(value);
                }}
                className='w-[50vh]'
              />
            </div>
            <div className='absolute h-full top-0 -right-[12vh]'>{renderVerseTooltip()}</div>
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
              onClick={() => scrollOffset(-scrollUnit)}
            >
              <ChevronUp className='h-10 w-10' /> Scroll Up
            </Button>
            <Button
              variant='border'
              size='lg'
              className='pl-6 flex-1'
              title='Scroll Down'
              onClick={() => scrollOffset(scrollUnit)}
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
              onClick={() => scrollToNextVerse(false)}
            >
              <ChevronUp className='h-10 w-10' /> Prev Verse
            </Button>
            <Button
              variant='border'
              size='lg'
              className='pl-6 flex-1'
              title='Scroll To Next Verse'
              onClick={() => scrollToNextVerse(true)}
            >
              <ChevronDown className='h-10 w-10' /> Next Verse
            </Button>
            <label 
              className={cn(
                'absolute w-auto h-auto left-full translate-y-1/2',
                'flex items-center cursor-pointer'
              )}
            >
                <Checkbox
                  className={cn(
                    'border-white mr-2 w-6 h-6',
                    'data-[state=checked]:bg-white data-[state=checked]:text-primary'
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
