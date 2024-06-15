import useProfileStore from '@renderer/store/profile';
import ContentLine from '../BibleMode/ContentLine';
import { useEffect, useState } from 'react';
import { getCanvasBackground } from '@renderer/lib/getCssStyles';
import TextSettingItem from '../BibleMode/TextSettingItem';
import { Button } from '../ui/button';
import useModalStore from '@renderer/store/modal';
import ContentTitle from '../BibleMode/ContentTitle';
import useOutputStore from '@renderer/store/output';
import { useOutputDimension } from '@renderer/hooks/useOutputDimension';

const BibleTextSettingsModal = () => {
  const { dimension } = useOutputDimension();
  const { getProfile, setTextSetting } = useProfileStore();
  const { closeGlobalModal } = useModalStore();
  const { isShowing } = useOutputStore();
  const profile = getProfile();

  const [previewText, setPreviewText] = useState({
    zhText: '',
    enText: '',
  });
  const [previewScale, setPreviewScale] = useState(1);

  useEffect(() => {
    (async () => {
      const scripture = { book: 'Gen', chapter: '1', verse: '1' };
      setPreviewText({
        zhText: await window.api.getVerseText('zh', scripture),
        enText: await window.api.getVerseText('en', scripture),
      });
    })();
  }, []);

  const handleTextSettingChange = (...args: Parameters<typeof setTextSetting>) => {
    setTextSetting(...args);
    isShowing && window.api.applyOutputSettings(getProfile());
  };

  return (
    <div className='w-[95vw] h-[90vh] flex flex-col'>
      <div className='text-2xl font-bold ml-6 mt-3'>More Settings</div>
      <div
        ref={(el) => {
          if (el?.clientWidth && dimension?.width) {
            setPreviewScale(el.clientWidth / dimension.width);
          }
        }}
        className='w-[90vw] mt-4 mx-auto h-[30vh] overflow-auto'
        style={getCanvasBackground(profile)}
      >
        {profile.title.show && (
          <ContentTitle
            profile={{
              ...profile,
              title: { ...profile.title, size: profile.title.size * previewScale },
            }}
            book='Gen'
            chapter='1'
          />
        )}
        <ContentLine
          profile={{
            ...profile,
            num: { ...profile.num, size: profile.num.size * previewScale },
            zh: { ...profile.zh, size: profile.zh.size * previewScale },
            en: { ...profile.en, size: profile.en.size * previewScale },
          }}
          verseNum='1'
          {...previewText}
        />
      </div>
      <div className='w-[90vw] mx-auto mt-4'>
        <div className='flex text-center font-medium border-b-2 border-gray-600 mb-2'>
          <div className='flex-[1] pr-2'></div>
          <div className='flex-[1] px-1'>Show/Hide</div>
          <div className='flex-[1] px-1'>Style</div>
          <div className='flex-[1] px-1'>Color</div>
          <div className='flex-[1] px-1'>Size</div>
          <div className='flex-[2] pl-2'>Font</div>
        </div>
        <TextSettingItem
          {...profile.title}
          name='Title'
          extended
          onChange={(value) => handleTextSettingChange('title', value)}
        />
        <TextSettingItem
          {...profile.num}
          name='No.'
          extended
          hideShowToggle
          onChange={(value) => handleTextSettingChange('num', value)}
        />
        <TextSettingItem
          {...profile.zh}
          name='ZH'
          extended
          onChange={(value) => handleTextSettingChange('zh', value)}
        />
        <TextSettingItem
          {...profile.en}
          name='EN'
          extended
          onChange={(value) => handleTextSettingChange('en', value)}
        />
      </div>
      <div className='flex mt-auto mb-4 justify-center'>
        <Button variant='secondary' className='px-20' onClick={closeGlobalModal}>
          Close
        </Button>
      </div>
    </div>
  );
};

export default BibleTextSettingsModal;
