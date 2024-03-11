import { Folder, Menu, Play, Trash2 } from 'lucide-react';
import { Button } from '../ui/button';
import { FC, useState } from 'react';
import VideoThumbnail from './VideoThumbnail';
import { Video, VideoMetadata } from 'src/shared/types';
import { cn, formatDuration } from '@renderer/lib/utils';
import { Draggable } from 'react-beautiful-dnd';

type Props = {
  index: number;
  item: Video;
  isSelected: boolean;
  onPlayItem: (item: Video) => void;
  onRemoveItem: (item: Video) => void;
};

const VideoPlaylistItem: FC<Props> = ({ index, item, isSelected, onPlayItem, onRemoveItem }) => {
  const [metadata, setMetadata] = useState<VideoMetadata>();
  const [draggable, setDraggable] = useState(false);

  return (
    <Draggable key={item.path} draggableId={item.path} index={index} isDragDisabled={!draggable}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={cn(
            'border-b border-gray-500 last:border-0',
            'p-2 flex relative hover:bg-gray-600 hover:text-gray-200',
            'active:border-0 group',
            isSelected && 'hover:bg-[#243A82] bg-[#172554]',
          )}
        >
          {metadata && (
            <div
              className='w-[4vw] pr-[1vw] flex justify-center items-center hover:cursor-grab active:cursor-grabbing'
              onMouseEnter={() => setDraggable(true)}
              onMouseLeave={() => setDraggable(false)}
            >
              <Menu className='w-[2.5vw] h-auto' />
            </div>
          )}
          <div className='w-1/6 min-w-[16.67%] h-[14vh] relative'>
            <VideoThumbnail
              src={`video:///${item.path}`}
              className='w-full h-full bg-black rounded-xl overflow-hidden'
              onVideoDataLoaded={setMetadata}
            />
            {isSelected && (
              <div className='absolute top-0 left-0 flex justify-center items-center rounded-xl whitespace-nowrap bg-[#000A] w-full h-full'>
                <span>
                  <span className='h-2 w-2 ml-2 mr-1 rounded-full animate-pulse inline-block bg-red-600'></span>
                  <span className='text-red-500'>Now Playing</span>
                </span>
              </div>
            )}
          </div>
          {metadata && (
            <div className='px-2 w-8/12'>
              <div
                title={item.name}
                className={cn(
                  'max-w-[45vw] text-ellipsis overflow-hidden whitespace-nowrap',
                  isSelected && 'font-bold text-[yellow]',
                )}
              >
                {item.name}
              </div>
              <div
                title={item.path}
                className={cn(
                  'max-w-[45vw] text-ellipsis overflow-hidden whitespace-nowrap',
                  'text-gray-500 group-hover:text-gray-400',
                )}
              >
                Location: {item.path}
              </div>
              <div className='text-gray-500 group-hover:text-gray-400'>
                Resolution: {metadata.width}x{metadata.height}
              </div>
              <div className='text-gray-500 group-hover:text-gray-400'>
                Duration: {metadata && formatDuration(metadata.duration)}
              </div>
            </div>
          )}
          {metadata && (
            <div className='w-1/6 min-w-[16.67%] flex justify-around items-center px-2'>
              <Button
                variant='link'
                title='Play'
                className='text-gray-400 hover:bg-blue-50 hover:text-primary rounded-full w-10 relative'
                onClick={() => onPlayItem(item)}
              >
                <Play className='absolute' />
              </Button>
              <Button
                variant='link'
                title='Show in folder'
                className='text-gray-400 hover:bg-blue-50 hover:text-primary rounded-full w-10 relative'
                onClick={() => window.api.showFileInFolder(item.path)}
              >
                <Folder className='absolute' />
              </Button>
              <Button
                variant='link'
                title='Remove from playlist'
                className='text-red-600 hover:bg-blue-50 rounded-full w-10 relative disabled:cursor-not-allowed'
                onClick={() => onRemoveItem(item)}
              >
                <Trash2 className='absolute' />
              </Button>
            </div>
          )}
        </div>
      )}
    </Draggable>
  );
};

export default VideoPlaylistItem;
