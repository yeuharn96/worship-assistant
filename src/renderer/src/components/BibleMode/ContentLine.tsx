import { FC } from 'react';
import { Profile } from 'src/shared/types';
import { getTextSettingStyle } from '@renderer/lib/getCssStyles';

type ContentLineProps = {
  profile: Profile;
  verseNum: string;
  zhText?: string;
  enText?: string;
};
const ContentLine: FC<ContentLineProps> = ({ profile, verseNum, zhText, enText }) => {
  const showZh = profile.zh.show;
  const showEn = profile.en.show;

  return (
    <div className={`verse-num-${verseNum}`}>
      <span className='verse-num mr-2' style={getTextSettingStyle(profile.num)}>
        {verseNum}
      </span>
      {showZh && zhText && (
        <span className='content-zh' style={getTextSettingStyle(profile.zh)}>
          {zhText}
        </span>
      )}
      {showZh && showEn && <br />}
      {showEn && enText && (
        <span className='content-en' style={getTextSettingStyle(profile.en)}>
          {enText}
        </span>
      )}
    </div>
  );
};

export default ContentLine;
