import { CSSProperties } from 'react';
import { TextSetting, Profile, Size, Scale } from 'src/shared/types';

export const getTextSettingStyle = (setting: Omit<TextSetting, 'show'>): CSSProperties => ({
  color: setting.color,
  fontSize: `${setting.size}pt`,
  fontFamily: setting.font,
});

export const getElementHeights = (titleSetting: TextSetting) => {
  const { size: fontSize, show: showTitle } = titleSetting;
  const title: CSSProperties = { height: `${fontSize * 1.95}pt` };
  const body: CSSProperties = showTitle ? { height: `calc(100% - ${fontSize * 1.95}pt)` } : { height: '100%' };

  return { title, body };
};

export const getCanvasStyle = (profile: Profile, outputSize: Size, scale?: Scale): CSSProperties => {
  const { top, bottom, left, right } = profile.adjustment;

  const scaleX = scale?.x ?? 1;
  const scaleY = scale?.y ?? 1;
  return {
    top: `${top * scaleY}px`,
    bottom: `${bottom * scaleY}px`,
    left: `${left * scaleX}px`,
    right: `${right * scaleX}px`,
    width: `${outputSize.width - left - right}px`,
    height: `${outputSize.height - top - bottom}px`,
    backgroundColor: profile.bgColor,
    ...(profile.bgImage && {
      backgroundImage: `url("image:///${profile.bgImage}")`,
      backgroundRepeat: 'no-repeat',
      backgroundSize: 'cover',
    }),
    ...(scale && { transform: `scale(${scaleX}, ${scaleY})` }),
    transformOrigin: 'top left',
  };
};
