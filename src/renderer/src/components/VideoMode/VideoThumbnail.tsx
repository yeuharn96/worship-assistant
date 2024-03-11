import { FC, useRef, useState } from 'react';
import { VideoMetadata } from 'src/shared/types';

type Props = { src: string; onVideoDataLoaded?: (metadata: VideoMetadata) => void } & React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLDivElement>,
  HTMLDivElement
>;

const VideoThumbnail: FC<Props> = ({ src, onVideoDataLoaded, ...props }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imgSrc, setImgSrc] = useState('');

  const onLoadedData = () => {
    const canvasEl = canvasRef.current;
    const videoEl = videoRef.current;
    if (!canvasEl || !videoEl) return;

    canvasEl.height = videoEl.videoHeight;
    canvasEl.width = videoEl.videoWidth;

    const ctx = canvasEl.getContext('2d');
    ctx?.drawImage(videoEl, 0, 0, canvasEl.width, canvasEl.height);

    const dataUrl = canvasEl.toDataURL();
    setImgSrc(dataUrl);

    const { duration, videoHeight, videoWidth } = videoEl;
    onVideoDataLoaded && onVideoDataLoaded({ duration, height: videoHeight, width: videoWidth });
  };

  return (
    <div {...props}>
      {!imgSrc && (
        <div className='w-full h-full flex justify-center items-center'>
          <div className='border-gray-300 h-10 w-10 animate-spin rounded-full border-4 border-t-blue-600' />
        </div>
      )}
      {imgSrc && <img src={imgSrc} className='w-full h-full object-contain' />}
      {!imgSrc && (
        <>
          <video ref={videoRef} src={src} hidden onLoadedData={onLoadedData} preload='auto' />
          <canvas ref={canvasRef} hidden />
        </>
      )}
    </div>
  );
};

export default VideoThumbnail;
