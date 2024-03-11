import { FC } from 'react';
import { Button } from './button';

export type ListBoxItem = {
  label?: React.ReactNode;
  value: string;
};

type Props = {
  items: ListBoxItem[];
  selected?: string;
  onSelect: (selected: string) => void;
};

const ListBox: FC<Props> = ({ items, selected, onSelect }) => {
  return (
    <div className='relative h-full w-full'>
      <div className='absolute overflow-auto h-full w-full border-gray-400 border-2'>
        <div className='flex flex-col'>
          {items.map((item) => (
            <Button
              key={item.value}
              variant={item.value === selected ? 'secondary' : 'ghost'}
              className='rounded-none text-base'
              onClick={() => onSelect(item.value)}
            >
              {item.label ?? item.value}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ListBox;
