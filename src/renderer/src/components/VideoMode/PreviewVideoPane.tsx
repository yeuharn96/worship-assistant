import useOutputStore from '@renderer/store/output';
import { CSSProperties, DOMAttributes, useEffect, useRef, useState } from 'react';
import { MonitorPlay } from 'lucide-react';
import { useIpcListeners } from '@renderer/lib/ipc';
import { VideoPlayState } from 'src/shared/types';
import { cn, formatDuration } from '@renderer/lib/utils';
import useProfileStore from '@renderer/store/profile';
import VolumeSlider from './VolumeSlider';
import MuteButton from './MuteButton';
import VideoControl from './VideoControl';

const PreviewVideoPane = () => {
  const { volume, loop, playNext, setProfile } = useProfileStore();
  const { dimension, setOutput, isShowing, playingVideo } = useOutputStore();
  const outputWrapperRef = useRef<HTMLDivElement>(null);
  const monitorRef = useRef<HTMLVideoElement>(null);

  const [playState, setPlayState] = useState<VideoPlayState>({ currentTime: 0, duration: 0 });
  const [nowPlayingTitle, setNowPlayingTitle] = useState<string>();

  useIpcListeners({
    hideOutput: () => {
      if (monitorRef.current?.srcObject) {
        (monitorRef.current.srcObject as MediaStream).getTracks()[0].stop();
        monitorRef.current.srcObject = null;
      }
    },
    monitorOutput: async (sourceId) => {
      try {
        const constraints = {
          audio: false,
          video: {
            mandatory: {
              chromeMediaSource: 'desktop',
              chromeMediaSourceId: sourceId,
            },
          },
        };
        const stream = await navigator.mediaDevices.getUserMedia(constraints as any);

        if (monitorRef.current && !monitorRef.current.srcObject) {
          monitorRef.current.srcObject = stream;
          monitorRef.current.onloadedmetadata = () => monitorRef.current?.play();
        }
      } catch (e) {
        console.error(e);
      }
    },
    syncVideoPlayState: (state) => {
      setPlayState(state);
    },
  });

  useEffect(() => {
    (async () => {
      if (dimension) return;
      const d = await window.api.getOutputDimension();
      setOutput({ dimension: d });
    })();
  }, []);

  useEffect(() => {
    if (!playingVideo) return;

    (async () => {
      setNowPlayingTitle(await window.api.getFileName(playingVideo));
    })();
  }, [playingVideo]);

  const getDimensionStyle = (): CSSProperties => {
    if (!dimension) return {};

    const { width, height } = dimension;
    return { aspectRatio: width / height };
  };

  const handleMousePeekTimestamp: DOMAttributes<HTMLInputElement>['onMouseMove'] = (e) => {
    const timelineWrapper = e.currentTarget.parentElement;
    const peek = timelineWrapper?.querySelector<HTMLDivElement>('#div-peek-timestamp');
    const timestamp = timelineWrapper?.querySelector<HTMLSpanElement>('#div-peek-timestamp span');
    if (timelineWrapper && peek && timestamp) {
      const peekCenter = peek.clientWidth / 2;
      const peekPos = e.clientX - timelineWrapper.offsetLeft;
      peek.style.left = `${peekPos - peekCenter}px`;
      timestamp.innerText = formatDuration(
        (peekPos / timelineWrapper.offsetWidth) * playState.duration,
        playState.duration < 3600,
      );
    }
  };

  const renderHoverTimestamp = () => {
    const borderWidth = 5;

    return (
      <div
        id='div-peek-timestamp'
        className={cn(
          'px-2 rounded cursor-pointer absolute whitespace-nowrap',
          'text-gray-800 bg-gray-300 shadow-[0_1px_3px_2px_rgba(0,0,0,0.5)]',
        )}
      >
        <span>asdasdasd</span>
        <div
          className='absolute top-full left-1/2 border-solid border-[#DDD] border-transparent border-t-gray-300'
          style={{
            borderWidth: `${borderWidth}px`,
            marginLeft: `-${borderWidth}px`,
          }}
        />
      </div>
    );
  };

  const setVolume = (vol: number) => {
    setProfile({ volume: vol });
    window.api.sendVideoCommand({ volume: vol });
  };

  return (
    <div className='w-full h-[90vh] flex'>
      <div className='flex flex-col pl-[1vw]'>
        <div className='w-[50vw] pb-[1vh] overflow-hidden text-ellipsis text-nowrap'>
          <span className='font-bold italic text-yellow-400'>
            <MonitorPlay className='inline-block h-5 w-5' /> Now Playing:
          </span>{' '}
          <span title={nowPlayingTitle}>{nowPlayingTitle}</span>
        </div>
        <div
          ref={outputWrapperRef}
          className='outline max-w-[50vw] max-h-[50vh] min-w-[50vh] min-h-[50vh] relative'
          style={getDimensionStyle()}
        >
          <video ref={monitorRef} className='absolute h-full w-full' />
        </div>

        <div className='pt-[4vh] w-[50vw]'>
          <div className='relative w-full'>
            <input
              type='range'
              className='w-full cursor-pointer peer'
              max={playState.duration || 0}
              value={playState.currentTime}
              onChange={(e) => {
                const seekTime = Number(e.target.value);
                if (!isNaN(seekTime)) {
                  window.api.sendVideoCommand({ currentTime: seekTime });
                }
              }}
              onMouseMove={handleMousePeekTimestamp}
            />
            <div className='hidden peer-hover:block absolute -top-full -mt-[5px]'>{renderHoverTimestamp()}</div>
          </div>
          <div className='flex justify-between'>
            <span>{formatDuration(playState.currentTime, playState.duration < 3600)}</span>
            <span>{formatDuration(playState.duration, playState.duration < 3600)}</span>
          </div>
        </div>

        {isShowing && <VideoControl playState={playState} />}
      </div>
      <div className='grow px-[2vw] py-[1vh]'>
        <div className='border rounded-xl pt-[1vh] pb-[3vh] flex flex-col items-center'>
          <div className='text-2xl mb-[2vh] w-full px-[1vw] flex'>
            <span className='block w-1/3'>Volume</span>
            <div className='w-1/3 text-center'>
              <MuteButton
                currentVolume={volume}
                onMutedChange={(muted, prevVolume) => {
                  if (muted) setVolume(0);
                  else if (prevVolume !== undefined) setVolume(prevVolume);
                }}
              />
            </div>
          </div>
          <VolumeSlider volume={volume} onVolumnChange={setVolume} />
          {/* <div className='pt-[3vh] px-[1vw] w-full'>
            <FadeAudioButton
              fadeOutSeconds={fadeOutSeconds}
              volume={volume}
              onFadeAudio={(vol, interval) => {
                setVolume(vol, false);
                if (stopFadeOut) {
                  clearInterval(interval);
                  setIsFadingOut(false);
                  setStopFadeOut(false);
                } else {
                  setIsFadingOut(true);
                }
              }}
            />
          </div> */}
        </div>
        <div className='py-[1vh]'>
          After playback:{' '}
          <span className='font-bold text-yellow-300'>
            {loop && !playNext && 'Loop single video'}
            {loop && playNext && 'Loop entire playlist'}
            {!loop && playNext && 'Play next video'}
            {!loop && !playNext && 'Do nothing'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default PreviewVideoPane;
