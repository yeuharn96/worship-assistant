import { FC, useState, useEffect } from 'react';
import InputNumber from '../ui/input-number';
import { ToggleGroup, ToggleGroupItem } from '../ui/toggle-group';
import { TextSetting } from 'src/shared/types';
import { cn } from '@renderer/lib/utils';

type BaseProps = {
  name: string;
  color: string;
  size: number;
  font: string;
  extended?: boolean;
  onChange?: (value: Partial<Omit<TextSetting, 'show'>>) => void;
};

type ExtendedProps = BaseProps & {
  extended: true;
  bold: boolean;
  italic: boolean;
  underline: boolean;
};

type Props = BaseProps | ExtendedProps;

const TextSettingItem: FC<Props> = ({ name, color, size, font, onChange, extended, ...props }) => {
  const { bold, italic, underline } = extended ? props : ({} as any);

  const [fontOptions, setFontOptions] = useState<string[]>([]);

  useEffect(() => {
    (async () => {
      setFontOptions(await window.api.getSystemFonts());
    })();
  }, []);

  return (
    <div className='flex my-2 items-center'>
      <div className={cn('flex-[1] pr-1', extended && 'text-center font-bold')}>{name}</div>
      {extended && (
        <div className='flex-[1] px-1'>
          <ToggleGroup
            variant='default'
            type='multiple'
            className='justify-end'
            value={[...(bold ? ['bold'] : []), ...(italic ? ['italic'] : []), ...(underline ? ['underline'] : [])]}
            onValueChange={(val) => {
              onChange &&
                onChange({
                  bold: val.includes('bold'),
                  italic: val.includes('italic'),
                  underline: val.includes('underline'),
                });
            }}
          >
            <ToggleGroupItem value='bold' aria-label='Toggle Bold' className='border-2 border-gray-400 w-12'>
              B
            </ToggleGroupItem>
            <ToggleGroupItem value='italic' aria-label='Toggle EN' className='border-2 border-gray-400 w-12'>
              I
            </ToggleGroupItem>
            <ToggleGroupItem value='underline' aria-label='Toggle title' className='border-2 border-gray-400 w-12'>
              U
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      )}
      <div className='flex-[1] px-1'>
        <input
          type='color'
          className='px-0.5 rounded focus:outline-blue-400 w-full'
          value={color}
          onChange={(e) => onChange && onChange({ color: e.target.value })}
        />
      </div>
      <div className='flex-[1] px-1'>
        <InputNumber value={size} min={1} max={999} onChange={(newSize) => onChange && onChange({ size: newSize })} />
      </div>
      <div className='flex-[2] pl-1'>
        <select className='input-primary' value={font} onChange={(e) => onChange && onChange({ font: e.target.value })}>
          {fontOptions.map((_font) => (
            <option key={`${name}-${_font}`} value={_font}>
              {_font}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default TextSettingItem;
