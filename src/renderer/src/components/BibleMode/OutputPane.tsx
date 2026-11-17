import { forwardRef, useEffect, useImperativeHandle, useLayoutEffect, useRef, useState } from 'react';
import { Chapter, Profile, ScriptureLocation, VersePos, WebContentEventListeners } from 'src/shared/types';
import { getElementHeights } from '@renderer/lib/getCssStyles';
import ContentLine from './ContentLine';
import ContentTitle from './ContentTitle';

export type OutputPaneHandle = {
  /** Scroll to an absolute position (px). */
  scrollTo: (top: number) => void;
  /** Scroll by a relative amount (px), continuing from any smooth scroll still in progress. */
  scrollBy: (offset: number) => void;
  /** Scroll to the next (1) or previous (-1) verse. */
  scrollVerse: (direction: 1 | -1) => void;
};

type Props = {
  selectedPassage: ScriptureLocation;
  profile: Profile;
  /** Increment to jump to `selectedPassage.verse` once that chapter's text has loaded. */
  scrollToVerseRequest?: number;
  scrollbar?: boolean;
  onScrollInfoChanged?: WebContentEventListeners['syncOutputScroll'];
};

type ChapterText = { key: string; zh?: Chapter; en?: Chapter };

const OutputPane = forwardRef<OutputPaneHandle, Props>(
  ({ selectedPassage, profile, scrollToVerseRequest = 0, scrollbar = false, onScrollInfoChanged }, ref) => {
    const contentRef = useRef<HTMLDivElement>(null);
    const versesRef = useRef<HTMLDivElement>(null);

    const [text, setText] = useState<ChapterText>();

    const { book, chapter, verse } = selectedPassage;
    const passageKey = `${book}-${chapter}`;
    const verseNums = Object.keys(text?.zh ?? text?.en ?? {});
    const behavior: ScrollBehavior = profile.smoothScrolling ? 'smooth' : 'auto';

    const versePosRef = useRef<VersePos[]>([]);
    /** Where a smooth scroll in progress will end, so follow-up scrolls build on it rather than a mid-animation position. */
    const targetRef = useRef<number | null>(null);
    const handledVerseRequestRef = useRef(0);
    const scrollFrameRef = useRef(0);
    const onScrollInfoChangedRef = useRef(onScrollInfoChanged);
    onScrollInfoChangedRef.current = onScrollInfoChanged;

    useEffect(() => {
      let cancelled = false;
      (async () => {
        const [zh, en] = await Promise.all([
          profile.zh.show ? window.api.getChpText('zh', book, chapter) : undefined,
          profile.en.show ? window.api.getChpText('en', book, chapter) : undefined,
        ]);
        if (!cancelled) setText({ key: passageKey, zh, en });
      })();
      return () => {
        cancelled = true;
      };
    }, [book, chapter, profile.zh.show, profile.en.show]);

    const measureVersePos = (): VersePos[] => {
      const verseEls = Array.from(versesRef.current?.children ?? []) as HTMLElement[];
      const firstTop = verseEls[0]?.offsetTop ?? 0;
      return verseEls.map((el) => ({ verse: el.dataset.verse ?? '', scrollTop: el.offsetTop - firstTop }));
    };

    const sendScrollInfo = (withVersePos: boolean) => {
      const el = contentRef.current;
      const callback = onScrollInfoChangedRef.current;
      if (!el || !callback) return;
      callback(el.scrollHeight - el.offsetHeight, el.scrollTop, withVersePos ? versePosRef.current : undefined);
    };

    const updateLayout = () => {
      versePosRef.current = measureVersePos();
      sendScrollInfo(true);
    };

    const scrollTo = (top: number, scrollBehavior = behavior) => {
      const el = contentRef.current;
      if (!el) return;

      const target = Math.max(0, Math.min(top, el.scrollHeight - el.clientHeight));
      targetRef.current = scrollBehavior === 'smooth' && Math.abs(target - el.scrollTop) >= 1 ? target : null;
      el.scrollTo({ top: target, behavior: scrollBehavior });
    };
    const currentTop = () => targetRef.current ?? contentRef.current?.scrollTop ?? 0;

    useImperativeHandle(ref, () => ({
      scrollTo,
      scrollBy: (offset) => scrollTo(currentTop() + offset),
      scrollVerse: (direction) => {
        const versePos = versePosRef.current;
        if (versePos.length === 0) return;

        const top = currentTop();
        const verseIdx = Math.max(
          0,
          versePos.findLastIndex((pos) => top >= pos.scrollTop - 1),
        );
        const nextIdx = Math.min(versePos.length - 1, Math.max(0, verseIdx + direction));
        scrollTo(versePos[nextIdx].scrollTop);
      },
    }));

    // Re-measure whenever the content or the settings that affect layout change, and jump to the requested verse once
    // the requested chapter's text is on screen.
    useLayoutEffect(() => {
      versePosRef.current = measureVersePos();

      if (scrollToVerseRequest !== handledVerseRequestRef.current && text?.key === passageKey) {
        handledVerseRequestRef.current = scrollToVerseRequest;
        const pos = versePosRef.current.find((vp) => vp.verse === verse);
        scrollTo(pos?.scrollTop ?? 0, 'auto');
      }

      sendScrollInfo(true);
    }, [text, profile, passageKey, verse, scrollToVerseRequest]);

    // Layout can also change later, e.g. when a web font finishes loading or the window is resized.
    useEffect(() => {
      const observer = new ResizeObserver(updateLayout);
      if (contentRef.current) observer.observe(contentRef.current);
      if (versesRef.current) observer.observe(versesRef.current);
      return () => observer.disconnect();
    }, []);

    useEffect(() => {
      const el = contentRef.current;
      if (!el) return;

      const handleScrollEnd = () => {
        targetRef.current = null;
        sendScrollInfo(false);
      };
      el.addEventListener('scrollend', handleScrollEnd);
      return () => {
        el.removeEventListener('scrollend', handleScrollEnd);
        cancelAnimationFrame(scrollFrameRef.current);
      };
    }, []);

    // Report scroll position at most once per frame.
    const handleScroll = () => {
      if (scrollFrameRef.current) return;
      scrollFrameRef.current = requestAnimationFrame(() => {
        scrollFrameRef.current = 0;
        sendScrollInfo(false);
      });
    };

    return (
      <>
        {profile.title.show && <ContentTitle profile={profile} book={book} chapter={chapter} />}
        <div
          ref={contentRef}
          className={`overflow-auto px-2 ${!scrollbar && 'no-scrollbar'}`}
          style={getElementHeights(profile.title).body}
          onScroll={handleScroll}
        >
          <div ref={versesRef}>
            {verseNums.map((verseNum) => (
              <div key={`${text?.key}-${verseNum}`} data-verse={verseNum}>
                <ContentLine
                  profile={profile}
                  verseNum={verseNum}
                  zhText={text?.zh && text.zh[verseNum]}
                  enText={text?.en && text.en[verseNum]}
                />
                <div style={{ height: `${profile.spacing}pt` }}></div>
              </div>
            ))}
          </div>
        </div>
      </>
    );
  },
);

OutputPane.displayName = 'OutputPane';

export default OutputPane;
