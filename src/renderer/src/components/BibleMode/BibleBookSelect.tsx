import { Button } from '../ui/button';
import { bible_meta } from '../../../../main/bible/bible.metadata.json';
import useOutputStore from '@renderer/store/output';
import { Input } from '../ui/input';
import { Search } from 'lucide-react';
import { useState } from 'react';
import useLanguageStore from '@renderer/store/language';

type BookMeta = (typeof bible_meta)[0];

const BibleBookSelect = () => {
  const { displayLanguage } = useLanguageStore();
  const { book: outputBook, setOutput } = useOutputStore();

  const [searchText, setSearchText] = useState('');
  const searchFilter = (book: BookMeta) => {
    if (!searchText) return true;

    return (
      book.eng.toLowerCase().includes(searchText) ||
      book._eng.toLowerCase().includes(searchText) ||
      book.chi.includes(searchText)
    );
  };

  const handleSelectBook = (book: string) => {
    setSearchText('');
    setOutput({ book });
  };

  const getFilteredDecorator = (book: BookMeta) => {
    if (!searchText) return '';

    return searchFilter(book) ? 'border-2 border-gray-400' : 'text-gray-600';
  };

  return (
    <>
      <div className='flex'>
        <h3 className='font-semibold tracking-tight underline text-xl'>Old Testament</h3>
        <div className='relative flex items-center ml-auto'>
          <Search className='absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 transform' />
          <Input
            placeholder='Search'
            className='pl-8 py-0 h-[4vh] border-gray-400 border-2 bg-transparent'
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>
      </div>
      <div className='flex flex-wrap justify-start'>
        {bible_meta
          .filter((book) => book.testament === 'old')
          .map((book) => (
            <Button
              key={book._eng}
              variant={outputBook === book._eng ? 'secondary' : 'ghost'}
              className={`my-[0.35vh] basis-1/5 text-base h-[calc(0.05*100vh)] ${getFilteredDecorator(book)}`}
              disabled={!searchFilter(book)}
              onClick={() => handleSelectBook(book._eng)}
            >
              {displayLanguage === 'zh' ? book.chi : book.eng}
            </Button>
          ))}
      </div>
      <hr />
      <h3 className='font-semibold tracking-tight underline pt-1 text-xl'>New Testament</h3>
      <div className='flex flex-wrap justify-start'>
        {bible_meta
          .filter((book) => book.testament === 'new')
          .map((book) => (
            <Button
              key={book._eng}
              variant={outputBook === book._eng ? 'secondary' : 'ghost'}
              className={`my-1 basis-1/5 text-base h-[calc(0.05*100vh)] ${getFilteredDecorator(book)}`}
              disabled={!searchFilter(book)}
              onClick={() => handleSelectBook(book._eng)}
            >
              {displayLanguage === 'zh' ? book.chi : book.eng}
            </Button>
          ))}
      </div>
    </>
  );
};

export default BibleBookSelect;
