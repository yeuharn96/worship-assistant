import { Play, Pause, Square, RotateCcw, RotateCw, SkipBack, SkipForward } from 'lucide-react';
import { Button } from '../ui/button';
import { VideoPlayState } from 'src/shared/types';
import useProfileStore from '@renderer/store/profile';
import { FC, useEffect, useMemo, useState } from 'react';
import useOutputStore from '@renderer/store/output';
import { useIpcListeners } from '@renderer/lib/ipc';

type Props = {
  playState: VideoPlayState;
};
const VideoControl: FC<Props> = ({ playState }) => {
  const { playlist, skipSeconds, loop, playNext } = useProfileStore();
  const { playingVideo, setOutput } = useOutputStore();

  const [playlistIndex, setPlaylistIndex] = useState<number>();

  useIpcListeners(
    {
      signalVideoEnded: () => {
        if (loop && !playNext) {
          window.api.sendVideoCommand({ play: true });
          return;
        }

        handleChangeVideo(true, true);
      },
    },
    [loop, playNext, playlistIndex, playlist],
  );

  useEffect(() => {
    const currentIndex = playlist.findIndex((videoPath) => videoPath === playingVideo);
    if (currentIndex > -1) setPlaylistIndex(currentIndex);
    else setPlaylistIndex(undefined);
  }, [playingVideo]);

  const handleChangeVideo = (next: boolean, autoPlay = false) => {
    if (playlistIndex === undefined) return;

    if (next && hasNextVideo) {
      const nextVideo = playlist[playlistIndex + 1] ?? playlist[0];
      setOutput({ playingVideo: nextVideo });
      window.api.setOutputVideo(nextVideo, autoPlay);
      return;
    }

    if (!next && hasPrevVideo) {
      const prevVideo = playlist[playlistIndex - 1] ?? playlist.at(-1);
      setOutput({ playingVideo: prevVideo });
      window.api.setOutputVideo(prevVideo, autoPlay);
    }
  };

  const hasNextVideo = useMemo(() => {
    return (loop && playNext) || (playlistIndex !== undefined && playlist[playlistIndex + 1] !== undefined);
  }, [loop, playNext, playlist, playlistIndex]);
  const hasPrevVideo = useMemo(() => {
    return (loop && playNext) || (playlistIndex !== undefined && playlist[playlistIndex - 1] !== undefined);
  }, [loop, playNext, playlist, playlistIndex]);

  return (
    <div className='pt-[4vh] w-[50vw] flex [&>*]:border-gray-600'>
      <div className='flex-[1] flex'>
        <Button
          variant='border'
          className='mr-1'
          title='Play'
          onClick={() => window.api.sendVideoCommand({ play: true })}
        >
          <Play className='h-8 w-8' />
        </Button>
        <Button
          variant='border'
          className='mx-1'
          title='Pause'
          onClick={() => window.api.sendVideoCommand({ pause: true })}
        >
          <Pause className='h-8 w-8' />
        </Button>
        <Button
          variant='border'
          className='ml-1'
          title='Stop'
          onClick={() => window.api.sendVideoCommand({ pause: true, currentTime: 0 })}
        >
          <Square className='h-8 w-8' />
        </Button>
      </div>
      <div className='flex-[1] flex justify-center'>
        <Button
          variant='border'
          className='mr-1'
          title={`Skip back ${skipSeconds} second(s)`}
          onClick={() => window.api.sendVideoCommand({ currentTime: playState.currentTime - skipSeconds })}
        >
          <RotateCcw className='h-8 w-8' />
        </Button>
        <Button
          variant='border'
          className='ml-1'
          title={`Skip forward ${skipSeconds} second(s)`}
          onClick={() => window.api.sendVideoCommand({ currentTime: playState.currentTime + skipSeconds })}
        >
          <RotateCw className='h-8 w-8' />
        </Button>
      </div>
      <div className='flex-[1] flex justify-end'>
        <Button
          variant='border'
          className='mr-1 disabled:cursor-not-allowed'
          title={hasPrevVideo ? 'Previous Video' : 'This is the first video'}
          onClick={() => handleChangeVideo(false)}
          disabled={!hasPrevVideo}
        >
          <SkipBack className='h-8 w-8' />
        </Button>
        <Button
          variant='border'
          className='ml-1 disabled:cursor-not-allowed'
          title={hasNextVideo ? 'Next Video' : 'This is the last video'}
          onClick={() => handleChangeVideo(true)}
          disabled={!hasNextVideo}
        >
          <SkipForward className='h-8 w-8' />
        </Button>
      </div>
    </div>
  );
};

export default VideoControl;
