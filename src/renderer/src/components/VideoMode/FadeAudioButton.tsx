import { FC, useState, useRef } from 'react';
import { Button } from '../ui/button';

type Props = {
  volume: number;
  fadeOutSeconds: number;
  onFadeAudio: (vol: number, interval?: NodeJS.Timeout) => void;
};

const FadeAudioButton: FC<Props> = ({ volume: currentVolume, fadeOutSeconds, onFadeAudio }) => {
  const [fadeVol, setFadeVol] = useState(currentVolume);
  const interval = useRef<NodeJS.Timeout>();

  const handleFadeAudio = () => {
    if (currentVolume === 0) return;

    setFadeVol(currentVolume);

    const fadeOutInterval = (fadeOutSeconds / currentVolume) * 1000; // seconds
    console.log(fadeOutInterval);
    interval.current = setInterval(() => {
      setFadeVol((vol) => {
        const newVol = Math.floor(vol - 1);
        if (newVol < 0) {
          clearInterval(interval.current);
          onFadeAudio(0);
          return 0;
        }

        onFadeAudio(newVol, interval.current);
        return newVol;
      });
    }, fadeOutInterval);
  };

  return (
    <Button variant='border' className='w-full' onClick={handleFadeAudio}>
      Fade Out Audio within ({fadeOutSeconds}) seconds
    </Button>
  );
};

export default FadeAudioButton;
