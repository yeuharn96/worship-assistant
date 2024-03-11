import { FC } from 'react';
import { ToggleGroup, ToggleGroupItem } from '../ui/toggle-group';
import { EN_FONTS, ZH_FONTS } from '@renderer/lib/constants';
import InputNumber from '../ui/input-number';
import useProfileStore from '@renderer/store/profile';
import { FilePlus, XCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { toast } from 'sonner';

const TextSettingPane = () => {
  const profile = useProfileStore();
  const { setProfile, setTextSetting } = profile;
  const { title, num, zh, en } = profile;

  return (
    <div>
      <div className='flex text-center font-medium border-b-2 border-gray-600 mb-2'>
        <div className='flex-[1] pr-2'></div>
        <div className='flex-[1] px-1'>Color</div>
        <div className='flex-[1] px-1'>Size</div>
        <div className='flex-[2] pl-2'>Font</div>
      </div>
      <TextSettingItem
        name='Title'
        color={title.color}
        size={title.size}
        font={title.font}
        onChange={(value) => setTextSetting('title', value)}
      />
      <TextSettingItem
        name='No.'
        color={num.color}
        size={num.size}
        font={num.font}
        onChange={(value) => setTextSetting('num', value)}
      />
      <TextSettingItem
        name='ZH'
        color={zh.color}
        size={zh.size}
        font={zh.font}
        onChange={(value) => setTextSetting('zh', value)}
      />
      <TextSettingItem
        name='EN'
        color={en.color}
        size={en.size}
        font={en.font}
        onChange={(value) => setTextSetting('en', value)}
      />
      <div className='border-b-2 border-gray-600 mb-2' />
      <div className='flex mb-2'>
        <div className='flex-[1] pr-2'>Background</div>
        <div className='flex-[1] pr-2'>
          <ChangeBackgroundImageButton
            bgImage={profile.bgImage}
            onChange={async (bgImage) => {
              if (bgImage) {
                try {
                  bgImage = await window.api.copyToDataFolder(bgImage);
                } catch (e) {
                  toast.error('Unable to change background image', {
                    description: (e as Error).message,
                    closeButton: true,
                    duration: 10 * 1000,
                  });
                }
              }

              if (profile.bgImage) {
                window.api.removeFromDataFolder(profile.bgImage);
              }
              setProfile({ bgImage });
            }}
          />
        </div>
        <div className='flex-[1]'>
          <input
            type='color'
            className='w-full px-0.5 rounded focus:outline-blue-400'
            value={profile.bgColor}
            onChange={(e) => setProfile({ bgColor: e.target.value })}
          />
        </div>
      </div>
      <div className='flex mb-2'>
        <div className='flex-[2] pr-2'>Line spacing</div>
        <div className='flex-[1]'>
          <InputNumber value={profile.spacing} min={0} max={999} onChange={(value) => setProfile({ spacing: value })} />
        </div>
      </div>
      <div className='flex items-center'>
        <div>Show</div>
        <div className='flex-grow'>
          <ToggleGroup
            variant='default'
            type='multiple'
            className='justify-end'
            value={[
              ...(profile.title.show ? ['title'] : []),
              ...(profile.zh.show ? ['zh'] : []),
              ...(profile.en.show ? ['en'] : []),
            ]}
            onValueChange={(val) => {
              setTextSetting('title', { show: val.includes('title') });
              setTextSetting('zh', { show: val.includes('zh') });
              setTextSetting('en', { show: val.includes('en') });
            }}
          >
            <ToggleGroupItem value='zh' aria-label='Toggle ZH' className='border-2 border-gray-400'>
              ZH
            </ToggleGroupItem>
            <ToggleGroupItem value='en' aria-label='Toggle EN' className='border-2 border-gray-400'>
              EN
            </ToggleGroupItem>
            <ToggleGroupItem value='title' aria-label='Toggle title' className='border-2 border-gray-400'>
              Title
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>
    </div>
  );
};

type TextSettingItemProps = {
  name: string;
  color: string;
  size: number;
  font: string;
  onChange?: (value: { color: string; size: number; font: string }) => void;
};
const TextSettingItem: FC<TextSettingItemProps> = ({ name, color, size, font, onChange }) => {
  return (
    <div className='flex my-2'>
      <div className='flex-[1] pr-1'>{name}</div>
      <div className='flex-[1] px-1'>
        <input
          type='color'
          className='px-0.5 rounded focus:outline-blue-400 w-full'
          value={color}
          onChange={(e) => onChange && onChange({ color: e.target.value, size, font })}
        />
      </div>
      <div className='flex-[1] px-1'>
        <InputNumber
          value={size}
          min={1}
          max={999}
          onChange={(newSize) => onChange && onChange({ color, size: newSize, font })}
        />
      </div>
      <div className='flex-[2] pl-1'>
        <select
          className='input-primary'
          value={font}
          onChange={(e) => onChange && onChange({ color, size, font: e.target.value })}
        >
          <optgroup label='ZH'>
            {ZH_FONTS.map((_font) => (
              <option key={`${name}-${_font}`} value={_font}>
                {_font}
              </option>
            ))}
          </optgroup>
          <optgroup label='EN'>
            {EN_FONTS.map((_font) => (
              <option key={`${name}-${_font}`} value={_font}>
                {_font}
              </option>
            ))}
          </optgroup>
        </select>
      </div>
    </div>
  );
};

type ChangeBackgroundImageButtonProps = {
  bgImage?: string;
  onChange: (image?: string) => void;
};
const ChangeBackgroundImageButton: FC<ChangeBackgroundImageButtonProps> = ({ bgImage, onChange }) => {
  const handleChangeBackgroundImage = async () => {
    const image = await window.api.askImageDialog();
    if (image) onChange(image);
  };

  if (bgImage) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant='border'
              className='py-1 px-0 w-full leading-none h-7'
              title={!bgImage ? 'Select an image as background' : ''}
              onClick={handleChangeBackgroundImage}
            >
              <img src={`image:///${bgImage}`} className='max-w-full max-h-full' />
            </Button>
          </TooltipTrigger>
          <TooltipContent className='bg-gray-800 max-w-[20vw] max-h-[20vh] px-[1vw] py-[1vh] relative'>
            <div title='Remove background image' onClick={() => onChange(undefined)}>
              <XCircle className='text-red-700 bg-gray-200 rounded-full absolute right-[0vw] top-[0vh] cursor-pointer' />
            </div>
            <img src={`image:///${bgImage}`} className='max-w-[18vw] max-h-[18vh]' />
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <Button
      variant='border'
      className='py-1 px-0 w-full leading-none h-7'
      title='Select an image as background'
      onClick={handleChangeBackgroundImage}
    >
      <FilePlus className='max-h-full max-w-full inline-block' />
    </Button>
  );
};

export default TextSettingPane;
