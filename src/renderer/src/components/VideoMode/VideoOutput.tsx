import { useIpcListeners } from '@renderer/lib/ipc';
import waitElementRendered from '@renderer/lib/waitElementRendered';
import useOutputStore from '@renderer/store/output';
import useProfileStore from '@renderer/store/profile';
import { SyntheticEvent, useEffect, useRef } from 'react';

const VideoOutput = () => {
  const { volume } = useProfileStore();
  const { setOutput } = useOutputStore();
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useIpcListeners({
    sendVideoCommand: ({ play, pause, currentTime, volume }) => {
      const video = videoRef.current;
      if (!video) return;

      if (play) video.play();
      if (pause) video.pause();
      if (currentTime !== undefined) video.currentTime = currentTime;
      if (volume !== undefined) video.volume = volume / 100;
    },
    setOutputVideo: (videoPath, autoPlay = false) => {
      setOutput({ playingVideo: videoPath });
      if (videoRef.current) {
        videoRef.current.src = `video:///${videoPath}`;
        videoRef.current.autoplay = autoPlay;
      }
    },
  });

  const updateVideoPlayState = (e: SyntheticEvent<HTMLVideoElement, Event>) => {
    const videoEl = e.currentTarget;
    const { currentTime, duration } = videoEl;
    window.api.syncVideoPlayState({ currentTime, duration });
  };

  useEffect(() => {
    (async () => {
      const videoEl = await waitElementRendered<HTMLVideoElement>('#video-output');
      if (!videoRef.current) {
        videoRef.current = videoEl;
      }
    })();
  }, []);

  useEffect(() => {
    if (videoRef.current) videoRef.current.volume = volume / 100;
  }, [volume]);

  return (
    <div className='w-full h-full bg-black'>
      <video
        id='video-output'
        className='w-full h-full'
        onTimeUpdate={updateVideoPlayState}
        onCanPlay={updateVideoPlayState}
        onEnded={() => window.api.signalVideoEnded()}
      />
    </div>
  );
};

export default VideoOutput;
