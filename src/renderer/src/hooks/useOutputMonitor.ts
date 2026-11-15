import { RefObject, useEffect, useRef } from 'react';
import { useIpcListeners } from '@renderer/lib/ipc';

const stopStream = (stream?: MediaStream | null) => stream?.getTracks().forEach((track) => track.stop());

/** Mirrors the output window into `monitorRef` while it is showing, with at most one capture stream alive. */
export const useOutputMonitor = (monitorRef: RefObject<HTMLVideoElement>) => {
  // Bumped on every stop so a capture that resolves after the output was hidden is discarded.
  const sessionRef = useRef(0);

  const stopMonitor = () => {
    sessionRef.current++;
    const video = monitorRef.current;
    if (!video) return;
    stopStream(video.srcObject as MediaStream | null);
    video.srcObject = null;
  };

  useIpcListeners({
    hideOutput: stopMonitor,
    monitorOutput: async (sourceId) => {
      if (monitorRef.current?.srcObject) return; // already monitoring

      const session = sessionRef.current;
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
        const stream = await navigator.mediaDevices.getUserMedia(constraints as MediaStreamConstraints);

        const video = monitorRef.current;
        if (session !== sessionRef.current || !video || video.srcObject) {
          stopStream(stream);
          return;
        }
        video.srcObject = stream;
        video.onloadedmetadata = () => video.play();
      } catch (e) {
        console.error(e);
      }
    },
  });

  useEffect(() => stopMonitor, []);
};
