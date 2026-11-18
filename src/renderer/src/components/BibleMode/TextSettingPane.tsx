import { ToggleGroup, ToggleGroupItem } from '../ui/toggle-group';
import InputNumber from '../ui/input-number';
import useProfileStore from '@renderer/store/profile';
import { Button } from '../ui/button';
import useModalStore from '@renderer/store/modal';
import TextSettingItem from './TextSettingItem';
import ChangeBackgroundImageButton from '../ui/ChangeBackgroundImageButton';
import { useBibleText } from '@renderer/hooks/useBibleText';

const TextSettingPane = () => {
  const profile = useProfileStore();
  const { openGlobalModal } = useModalStore();
  const { setProfile, setTextSetting, setBackgroundImage } = profile;
  const { title, num, zh, en } = profile;
  const { status: bibleStatus } = useBibleText();
  // Only mention languages that are switched on, so a church using one language isn't nagged about the other.
  const missingLangs = [
    ...(zh.show && bibleStatus?.zh === 'none' ? ['Chinese'] : []),
    ...(en.show && bibleStatus?.en === 'none' ? ['English'] : []),
  ];

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
      <Button
        variant='border'
        className='block py-0.5 w-full h-auto mb-2'
        onClick={() => openGlobalModal({ name: 'bible-text-settings' })}
      >
        More Settings...
      </Button>
      <div className='border-b-2 border-gray-600 mb-2' />
      <div className='flex mb-2'>
        <div className='flex-[1] pr-2'>Background</div>
        <div className='flex-[1] pr-2'>
          <ChangeBackgroundImageButton bgImage={profile.bgImage} onChange={setBackgroundImage} />
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
      {missingLangs.length > 0 && (
        <p className='mt-2 text-sm text-yellow-400'>
          No {missingLangs.join(' or ')} Bible text is loaded. Use Bible › Load {missingLangs[0]} Bible Text… in the
          menu.
        </p>
      )}
    </div>
  );
};

export default TextSettingPane;
