import { FC, useEffect, useRef, useState } from 'react';
import { Chapter, Profile, ScriptureLocation, WebContentEventListeners } from 'src/shared/types';
import { getElementHeights } from '@renderer/lib/getCssStyles';
import ContentLine from './ContentLine';
import ContentTitle from './ContentTitle';

type Props = {
  selectedPassage: ScriptureLocation;
  profile: Profile;
  scrollToVerse?: boolean;
  onScrollToVerse?: () => void;
  scrollOffset?: { top: number; behavior: ScrollBehavior };
  onScrollOffset?: () => void;
  scrollbar?: boolean;
  onScrollInfoChanged?: WebContentEventListeners['syncOutputScroll'];
};

const OutputPane: FC<Props> = ({
  selectedPassage,
  profile,
  scrollToVerse = false,
  onScrollToVerse,
  scrollOffset,
  onScrollOffset,
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
    if (scrollOffset == undefined) return;

    const behavior = scrollOffset.behavior || 'auto';
    contentRef.current?.scrollBy({ top: scrollOffset.top, behavior });
    onScrollOffset && onScrollOffset();
    scrollChangeEvent();
  }, [scrollOffset]);

  return (
    <>
      {profile.title.show && <ContentTitle profile={profile} book={book} chapter={chapter} />}
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
    </>
  );
};

export default OutputPane;
