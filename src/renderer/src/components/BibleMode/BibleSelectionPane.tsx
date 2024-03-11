import useOutputStore from '@renderer/store/output';
import BibleBookSelect from './BibleBookSelect';
import ListBox from '../ui/listbox';
import { useEffect, useState } from 'react';

const BibleSelectionPane = () => {
  const { book, chapter, verse, setOutput } = useOutputStore();

  const [totalChp, setTotalChp] = useState(0);
  const [totalVerse, setTotalVerse] = useState(0);

  useEffect(() => {
    (async () => {
      const count = await window.api.getChpCount(book);
      setTotalChp(count);
      setOutput({ chapter: '1', verse: '1' });
    })();
  }, [book]);

  useEffect(() => {
    (async () => {
      const count = await window.api.getVerseCount(book, chapter);
      setTotalVerse(count);
    })();
  }, [chapter]);

  return (
    <div className='flex h-[90vh] [&>*]:h-full'>
      <div className='flex-[6] px-2 py-0'>
        <BibleBookSelect />
      </div>
      <div className='flex-[2] flex'>
        <div className='flex-[1] text-center mx-3 py-1 flex flex-col'>
          <h3 className='text-xl font-bold mb-1'>Chapter</h3>
          <div className='h-full'>
            <ListBox
              items={Array(totalChp)
                .fill(0)
                .map((_, i) => ({ value: (i + 1).toString() }))}
              selected={chapter}
              onSelect={(selected) => {
                if (chapter !== selected) setOutput({ chapter: selected, verse: '1' });
              }}
            />
          </div>
        </div>
        <div className='flex-[1] text-center mx-3 py-1 flex flex-col'>
          <h3 className='text-xl font-bold mb-1'>Verse</h3>
          <div className='h-full'>
            <ListBox
              items={Array(totalVerse)
                .fill(0)
                .map((_, i) => ({ value: (i + 1).toString() }))}
              selected={verse}
              onSelect={(selected) => {
                if (verse !== selected) setOutput({ verse: selected });
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BibleSelectionPane;
