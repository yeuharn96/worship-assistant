import { RefObject, useEffect, useRef } from 'react';
import { useIpcListeners } from '@renderer/lib/ipc';

/** Mirrors the output window into `monitorRef` while it is showing, with at most one capture stream alive. */
export const useOutputMonitor = (monitorRef: RefObject<HTMLVideoElement>) => {
  // Bumped on every stop so a capture that resolves after the output was hidden is discarded.
  const sessionRef = useRef(0);
  // Kept apart from the <video> element: React clears DOM refs before unmount cleanups run,
  // so the element can't be relied on to find the stream that needs stopping.
  const streamRef = useRef<MediaStream | null>(null);

  const stopMonitor = () => {
    sessionRef.current++;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (monitorRef.current) monitorRef.current.srcObject = null;
  };

  useIpcListeners({
    hideOutput: stopMonitor,
    monitorOutput: async (sourceId) => {
      if (streamRef.current) return; // already monitoring

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
        if (session !== sessionRef.current || !video || streamRef.current) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        streamRef.current = stream;
        video.srcObject = stream;
        video.onloadedmetadata = () => video.play();
      } catch (e) {
        console.error(e);
      }
    },
  });

  useEffect(() => stopMonitor, []);
};
