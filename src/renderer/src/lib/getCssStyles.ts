import { CSSProperties } from 'react';
import { TextSetting, Size, Scale, Adjustment } from 'src/shared/types';

export const getTextSettingStyle = (setting: Omit<TextSetting, 'show'>): CSSProperties => ({
  color: setting.color,
  fontSize: `${setting.size}pt`,
  fontFamily: setting.font,
  ...(setting.bold && { fontWeight: 'bold' }),
  ...(setting.italic && { fontStyle: 'italic' }),
  ...(setting.underline && { textDecorationLine: 'underline' }),
});

export const getElementHeights = (titleSetting: TextSetting) => {
  const { size: fontSize, show: showTitle } = titleSetting;
  const title: CSSProperties = { height: `${fontSize * 1.95}pt` };
  const body: CSSProperties = showTitle ? { height: `calc(100% - ${fontSize * 1.95}pt)` } : { height: '100%' };

  return { title, body };
};

export const getCanvasStyle = (canvasProps: {
  adjustment: Adjustment;
  bgColor?: string;
  bgImage?: string;
  outputSize?: Size;
  scale?: Scale;
}): CSSProperties => {
  const { adjustment, bgColor, bgImage, outputSize, scale } = canvasProps;
  const { top, bottom, left, right } = adjustment;

  const scaleX = scale?.x ?? 1;
  const scaleY = scale?.y ?? 1;
  return {
    top: `${top * scaleY}px`,
    bottom: `${bottom * scaleY}px`,
    left: `${left * scaleX}px`,
    right: `${right * scaleX}px`,
    ...(outputSize && {
      width: `${outputSize.width - left - right}px`,
      height: `${outputSize.height - top - bottom}px`,
    }),
    ...(bgColor && getCanvasBackground(bgColor, bgImage)),
    ...(scale && { transform: `scale(${scaleX}, ${scaleY})`, transformOrigin: 'top left' }),
  };
};

export const getCanvasBackground = (bgColor: string, bgImage?: string): CSSProperties => ({
  backgroundColor: bgColor,
  ...(bgImage && {
    backgroundImage: `url("image:///${bgImage}")`,
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'cover',
  }),
});
