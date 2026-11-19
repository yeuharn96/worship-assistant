import { FC, useEffect, useRef, useState } from 'react';
import useOutputStore from '@renderer/store/output';
import useProfileStore from '@renderer/store/profile';
import useFontsStore from '@renderer/store/fonts';
import OutputPane, { OutputPaneHandle } from '@renderer/components/BibleMode/OutputPane';
import { useIpcListeners } from '@renderer/lib/ipc';
import VideoOutput from '@renderer/components/VideoMode/VideoOutput';
import { getCanvasStyle } from '@renderer/lib/getCssStyles';

const OutputWindow: FC = () => {
  const profile = useProfileStore();
  const { book, chapter, verse, dimension, setOutput } = useOutputStore();
  const loadFonts = useFontsStore((s) => s.load);

  const outputPaneRef = useRef<OutputPaneHandle>(null);
  const [scrollToVerseRequest, setScrollToVerseRequest] = useState(0);

  // Scroll commands go straight to the pane so bursts (wheel, slider drag) are never merged or dropped.
  useIpcListeners({
    applyOutputSettings: (settings) => profile.setProfile(settings),
    setOutputDimension: (dimension) => setOutput({ dimension }),
    setOutputBibleText: (loc) => {
      setOutput(loc);
      setScrollToVerseRequest((n) => n + 1);
    },
    scrollOutputOffset: (offset) => outputPaneRef.current?.scrollBy(offset),
    scrollOutputTo: (top) => outputPaneRef.current?.scrollTo(top),
    scrollOutputVerse: (direction) => outputPaneRef.current?.scrollVerse(direction),
    customFontsChanged: () => loadFonts(),
  });

  useEffect(() => {
    (async () => {
      const dimension = await window.api.getOutputDimension();
      setOutput({ dimension });
    })();
    loadFonts();
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
              ref={outputPaneRef}
              selectedPassage={{ book, chapter, verse }}
              profile={profile}
              scrollToVerseRequest={scrollToVerseRequest}
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
