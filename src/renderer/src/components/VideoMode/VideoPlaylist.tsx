import { useEffect, useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { DragDropContext, OnDragEndResponder } from 'react-beautiful-dnd';
import { Video } from 'src/shared/types';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import useProfileStore from '@renderer/store/profile';
import useOutputStore from '@renderer/store/output';
import VideoPlaylistItem from './VideoPlaylistItem';
import { StrictModeDroppable } from '../ui/StrictModeDroppable';
import { toast } from 'sonner';

// https://egghead.io/lessons/react-persist-list-reordering-with-react-beautiful-dnd-using-the-ondragend-callback
const VideoPlaylist = () => {
  const { playlist, addPlaylistItems, removePlaylistItem, setProfile } = useProfileStore();
  const { playingVideo, isShowing, setOutput } = useOutputStore();
  // Lookup of every video found so far. Missing files are never cached, so they're checked again if re-added.
  const [videoInfo, setVideoInfo] = useState<Record<string, Video>>({});

  // The profile's playlist is the single source of truth; this resolves names for new paths and drops missing files
  // from the playlist, so Next/Prev and auto-advance never land on a video that can't play.
  useEffect(() => {
    const unknownPaths = playlist.filter((videoPath) => !(videoPath in videoInfo));
    if (unknownPaths.length === 0) return;

    const getValidVideo = async (videoPath: string): Promise<Video | null> => {
      const exists = await window.api.checkFileExists(videoPath);
      if (!exists) return null;
      return { path: videoPath, name: await window.api.getFileName(videoPath) };
    };
    (async () => {
      const results = await Promise.all(unknownPaths.map(async (p) => [p, await getValidVideo(p)] as const));
      const found = results.filter((r): r is [string, Video] => r[1] !== null);
      const missing = results.filter(([, video]) => video === null).map(([p]) => p);

      if (found.length > 0) setVideoInfo((prev) => ({ ...prev, ...Object.fromEntries(found) }));
      if (missing.length > 0) {
        // Read the latest playlist: it may have changed while the files were being checked.
        const latest = useProfileStore.getState().playlist;
        setProfile({ playlist: latest.filter((p) => !missing.includes(p)) });
        toast.warning(`${missing.length} video(s) could not be found and were removed from the playlist`, {
          description: (
            <ul>
              {missing.map((p) => (
                <li key={p} className='break-all'>
                  {p}
                </li>
              ))}
            </ul>
          ),
          closeButton: true,
          duration: 10 * 1000,
        });
      }
    })();
  }, [playlist]);

  const playlistItems = useMemo(
    () => [...new Set(playlist)].map((videoPath) => videoInfo[videoPath]).filter((v): v is Video => Boolean(v)),
    [playlist, videoInfo],
  );

  const handleAddVideo = async () => {
    const selected = await window.api.askVideosDialog();
    const newVideos = [] as Video[];
    selected.forEach((vid) => {
      if (!playlist.includes(vid.path) && newVideos.every((v) => v.path !== vid.path)) {
        newVideos.push(vid);
      } else {
        toast.error('Duplicate video', {
          description: (
            <div>
              <span className='font-bold'>{vid.name}</span> already exists in playlist
            </div>
          ),
          closeButton: true,
          duration: 8 * 1000,
        });
      }
    });

    if (newVideos.length > 0) {
      setVideoInfo((prev) => ({ ...prev, ...Object.fromEntries(newVideos.map((vid) => [vid.path, vid])) }));
      addPlaylistItems(newVideos.map((vid) => vid.path));
    }
  };
  const handlePlayVideo = (item: Video) => {
    setOutput({ playingVideo: item.path });
    if (isShowing) window.api.setOutputVideo(item.path);
  };
  const handleRemoveVideo = (item: Video) => {
    removePlaylistItem(item.path);
    if (playingVideo === item.path) setOutput({ playingVideo: undefined });
  };

  const handleDragEnd: OnDragEndResponder = (res) => {
    const { destination, source } = res;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const reordered = playlistItems.map((i) => i.path);
    const [moved] = reordered.splice(source.index, 1);
    reordered.splice(destination.index, 0, moved);
    // Keep paths that are still being checked; the check above removes them if they turn out to be missing.
    const pending = playlist.filter((videoPath) => !(videoPath in videoInfo));
    setProfile({ playlist: [...reordered, ...pending] });
  };

  return (
    <div className='flex flex-col h-[90vh]'>
      <div className='flex items-center mb-2'>
        <span className='font-bold'>Playlist</span>{' '}
        <Button variant='border' className='ml-4' onClick={handleAddVideo}>
          <Plus className='w-6 h-6' /> Add Video
        </Button>
      </div>

      <ScrollArea className='border-gray-400 rounded border-2 px-2 py-1 h-full relative'>
        <DragDropContext onDragEnd={handleDragEnd}>
          <StrictModeDroppable key='playlist' droppableId='playlist'>
            {(provided) => (
              <div ref={provided.innerRef} {...provided.droppableProps}>
                {playlistItems.map((item, idx) => (
                  <VideoPlaylistItem
                    key={`${item.path}`}
                    index={idx}
                    item={item}
                    isSelected={item.path === playingVideo}
                    onPlayItem={handlePlayVideo}
                    onRemoveItem={handleRemoveVideo}
                  />
                ))}

                {provided.placeholder}
              </div>
            )}
          </StrictModeDroppable>
        </DragDropContext>

        {playlistItems.length === 0 && (
          <div className='absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 text-center'>
            <div className='text-2xl italic text-gray-500'>The playlist is empty.</div>
            <Button variant='border' className='mt-4' onClick={handleAddVideo}>
              <Plus className='w-6 h-6' /> Add Video
            </Button>
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

export default VideoPlaylist;
