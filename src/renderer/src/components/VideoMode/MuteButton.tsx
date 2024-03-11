import { Volume, Volume1, Volume2, VolumeX } from 'lucide-react';
import { FC, useState } from 'react';
import { Button } from '../ui/button';

type MuteButtonProps = {
  currentVolume: number;
  onMutedChange: (muted: boolean, prevVolume?: number) => void;
};
const MuteButton: FC<MuteButtonProps> = ({ currentVolume, onMutedChange }) => {
  const [prevVolume, setPrevVolume] = useState<number>();
  const [isMuted, setIsMuted] = useState(false);

  const toggleMute = () => {
    if (!isMuted) setPrevVolume(currentVolume);
    onMutedChange(!isMuted, prevVolume);
    setIsMuted(!isMuted);
  };

  const renderVolumeIcon = () => {
    if (currentVolume < 30) return <Volume />;
    if (currentVolume < 60) return <Volume1 />;
    return <Volume2 />;
  };

  return (
    <Button variant={isMuted ? 'secondary' : 'border'} onClick={toggleMute}>
      {isMuted && <VolumeX />}
      {!isMuted && renderVolumeIcon()}
    </Button>
  );
};

export default MuteButton;
