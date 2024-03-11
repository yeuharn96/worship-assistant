import { FC, useEffect, useRef, useState } from 'react';
import { Chapter, Profile, Scale, ScriptureLocation, Size, WebContentEventListeners } from 'src/shared/types';
import { bible_meta } from '../../../../main/bible/bible.metadata.json';
import { getTextSettingStyle, getElementHeights, getCanvasStyle } from '@renderer/lib/getCssStyles';
import ContentLine from './ContentLine';

type Props = {
  selectedPassage: ScriptureLocation;
  profile: Profile;
  outputSize: Size;
  scrollToVerse?: boolean;
  onScrollToVerse?: () => void;
  scrollOffset?: number;
  onScrollOffset?: () => void;
  scale?: Scale;
  scrollbar?: boolean;
  onScrollInfoChanged?: WebContentEventListeners['syncOutputScroll'];
};

const OutputPane: FC<Props> = ({
  selectedPassage,
  profile,
  outputSize,
  scrollToVerse = false,
  onScrollToVerse,
  scrollOffset,
  onScrollOffset,
  scale,
  scrollbar = false,
  onScrollInfoChanged,
}) => {
  const contentRef = useRef<HTMLDivElement>(null);

  const [zhText, setZhText] = useState<Chapter>();
  const [enText, setEnText] = useState<Chapter>();

  const { book, chapter, verse } = selectedPassage;

  const getVerseNum = () => Object.keys(zhText ?? enText ?? {});
  const getVerseElement = (verseNum) =>
    contentRef.current?.querySelector(`.verse-num-${verseNum}`) as HTMLElement | null;

  useEffect(() => {
    (async () => {
      const { zh, en } = profile;
      if (zh.show) {
        const zhText = await window.api.getChpText('zh', book, chapter);
        setZhText(zhText);
      } else {
        setZhText(undefined);
      }

      if (en.show) {
        const enText = await window.api.getChpText('en', book, chapter);
        setEnText(enText);
      } else {
        setEnText(undefined);
      }
    })();
  }, [book, chapter]);

  const scrollChangeEvent = () => {
    if (contentRef.current == undefined || !onScrollInfoChanged) return;

    const { scrollHeight, scrollTop, offsetHeight } = contentRef.current;
    const verseNums = getVerseNum();
    const titleHeight = Number(getVerseElement(verseNums[0])?.offsetTop ?? 0);

    const versePos = verseNums.map((verseNum) => {
      const scrollTop = getVerseElement(verseNum)?.offsetTop;
      return {
        verse: verseNum,
        scrollTop: scrollTop ? scrollTop - titleHeight : 0,
      };
    });
    onScrollInfoChanged(scrollHeight - offsetHeight, scrollTop, versePos);
  };

  useEffect(() => {
    if (!contentRef.current) return;

    const observer = new MutationObserver(scrollChangeEvent);
    observer.observe(contentRef.current, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [contentRef.current]);

  useEffect(() => {
    if (scrollToVerse) {
      getVerseElement(verse)?.scrollIntoView();
      onScrollToVerse && onScrollToVerse();
      scrollChangeEvent();
    }
  }, [scrollToVerse]);

  useEffect(() => {
    if (scrollOffset != undefined) {
      contentRef.current?.scrollBy({ top: scrollOffset });
      onScrollOffset && onScrollOffset();
      scrollChangeEvent();
    }
  }, [scrollOffset]);

  const renderTitle = () => {
    const { chi: zhTitle, eng: engTitle } = bible_meta.find((meta) => meta._eng === book) ?? {};

    const style = getTextSettingStyle(profile.title);
    return (
      <div className='flex items-center justify-center' style={getElementHeights(profile.title).title}>
        <div className='w-fit border-b-2' style={{ ...style, borderColor: profile.title.color }}>
          <span>{profile.zh.show && zhTitle}</span> {profile.zh.show && <span>第 {chapter} 章</span>}{' '}
          <span>{profile.en.show && engTitle}</span> {profile.en.show && <span>Chapter {chapter}</span>}
        </div>
      </div>
    );
  };

  return (
    <div className='relative'>
      <div className='absolute' style={getCanvasStyle(profile, outputSize, scale)}>
        {profile.title.show && renderTitle()}
        <div
          ref={contentRef}
          className={`overflow-auto px-2 ${!scrollbar && 'no-scrollbar'}`}
          style={getElementHeights(profile.title).body}
          onScroll={scrollChangeEvent}
        >
          {getVerseNum().map((verseNum) => (
            <div key={`${book}-${chapter}-${verseNum}`}>
              <ContentLine
                profile={profile}
                verseNum={verseNum}
                zhText={zhText && zhText[verseNum]}
                enText={enText && enText[verseNum]}
              />
              <div style={{ height: `${profile.spacing}pt` }}></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OutputPane;
