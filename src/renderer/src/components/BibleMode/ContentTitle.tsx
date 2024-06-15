import { Profile } from 'src/shared/types';
import { bible_meta } from '../../../../main/bible/bible.metadata.json';
import { getElementHeights, getTextSettingStyle } from '@renderer/lib/getCssStyles';
import { FC } from 'react';

type Props = {
  profile: Profile;
  book: string;
  chapter: string;
};
const ContentTitle: FC<Props> = ({ profile, book, chapter }) => {
  const { chi: zhTitle, eng: engTitle } = bible_meta.find((meta) => meta._eng === book) ?? {};

  const style = getTextSettingStyle(profile.title);
  return (
    <div className='flex items-center justify-center' style={getElementHeights(profile.title).title}>
      <div className='w-fit' style={{ ...style }}>
        <span>{profile.zh.show && zhTitle}</span> {profile.zh.show && <span>第 {chapter} 章</span>}{' '}
        <span>{profile.en.show && engTitle}</span> {profile.en.show && <span>Chapter {chapter}</span>}
      </div>
    </div>
  );
};

export default ContentTitle;
