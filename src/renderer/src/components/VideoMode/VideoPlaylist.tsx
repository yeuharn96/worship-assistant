import { useEffect, useState } from 'react';
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
  const [playlistItems, setPlaylistItems] = useState<Video[]>([]);
  const [initLoaded, setInitLoaded] = useState(false);

  useEffect(() => {
    if (!initLoaded) {
      const getValidVideo = async (videoPath: string) => {
        const name = await window.api.getFileName(videoPath);
        const exists = await window.api.checkFileExists(videoPath);
        if (!exists) {
          // toast.error('Invalid video', {
          //   description: (
          //     <div>
          //       <span className='font-bold'>{name}</span> video not found.
          //     </div>
          //   ),
          //   closeButton: true,
          //   duration: 10 * 1000,
          // });
          return;
        }

        return { path: videoPath, name };
      };
      (async () => {
        const tasks = playlist.map((videoPath) => getValidVideo(videoPath));
        const items = (await Promise.all(tasks)).filter((res) => Boolean(res)) as Video[];
        setPlaylistItems(items);
        setInitLoaded(true);
      })();
    }
  }, [playlist]);

  const handleAddVideo = async () => {
    const selected = await window.api.askVideosDialog();
    const newVideos = [] as Video[];
    selected.forEach((vid) => {
      if (!playlist.includes(vid.path)) {
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
      setPlaylistItems((prev) => prev.concat(newVideos));
      addPlaylistItems(newVideos.map((vid) => vid.path));
    }
  };
  const handlePlayVideo = (item: Video) => {
    setOutput({ playingVideo: item.path });
    if (isShowing) window.api.setOutputVideo(item.path);
  };
  const handleRemoveVideo = (item: Video) => {
    setPlaylistItems((prev) => prev.filter((i) => i.path !== item.path));
    removePlaylistItem(item.path);
    if (playingVideo === item.path) setOutput({ playingVideo: undefined });
  };

  const handleDragEnd: OnDragEndResponder = (res) => {
    const { destination, source } = res;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const updatedItems = [...playlistItems];
    updatedItems.splice(source.index, 1);
    updatedItems.splice(destination.index, 0, playlistItems[source.index]);
    setPlaylistItems(updatedItems);
    setTimeout(() => setProfile({ playlist: updatedItems.map((i) => i.path) }), 100);
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
