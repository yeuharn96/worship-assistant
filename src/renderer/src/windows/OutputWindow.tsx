import { FC, useEffect, useState } from 'react';
import useOutputStore from '@renderer/store/output';
import useProfileStore from '@renderer/store/profile';
import OutputPane from '@renderer/components/BibleMode/OutputPane';
import { useIpcListeners } from '@renderer/lib/ipc';
import VideoOutput from '@renderer/components/VideoMode/VideoOutput';
import { getCanvasStyle } from '@renderer/lib/getCssStyles';

const OutputWindow: FC = () => {
  const profile = useProfileStore();
  const { book, chapter, verse, dimension, setOutput } = useOutputStore();

  const [scrollToVerse, setScrollToVerse] = useState(false);
  const [scrollOffset, setScrollOffset] = useState<{ top: number; behavior: ScrollBehavior }>();

  useIpcListeners({
    applyOutputSettings: (settings) => profile.setProfile(settings),
    setOutputBibleText: (loc) => {
      setOutput(loc);
      setScrollToVerse(true);
    },
    scrollOutputOffset: (offset, behavior = 'auto') => {
      setScrollOffset({ top: offset, behavior });
    },
  });

  useEffect(() => {
    (async () => {
      const dimension = await window.api.getOutputDimension();
      setOutput({ dimension });
    })();
  }, []);

  useEffect(() => {
    const handleKeyDown = (ev) => {
      if (ev.key === 'Escape') {
        ev.preventDefault();
        ev.stopPropagation();
        window.api.hideOutput();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className='overflow-hidden fixed top-0 bottom-0 left-0 right-0 cursor-none'>
      <div className='relative'>
        {profile.splitAdjBg && (
          <div
            className='div-bg absolute'
            style={getCanvasStyle({
              adjustment: profile.adjustmentBg,
              bgColor: profile.bgColor,
              bgImage: profile.bgImage,
              outputSize: dimension,
            })}
          />
        )}
        <div
          className='div-output absolute'
          style={getCanvasStyle({
            adjustment: profile.adjustment,
            bgColor: profile.splitAdjBg ? 'transparent' : profile.bgColor,
            ...(!profile.splitAdjBg && { bgImage: profile.bgImage }),
            outputSize: dimension,
          })}
        >
          {profile.mode === 'bible' && (
            <OutputPane
              selectedPassage={{ book, chapter, verse }}
              profile={profile}
              scrollToVerse={scrollToVerse}
              onScrollToVerse={() => setScrollToVerse(false)}
              scrollOffset={scrollOffset}
              onScrollOffset={() => setScrollOffset(undefined)}
              onScrollInfoChanged={window.api.syncOutputScroll}
            />
          )}
          {profile.mode === 'video' && <VideoOutput />}
        </div>
      </div>
    </div>
  );
};

export default OutputWindow;
