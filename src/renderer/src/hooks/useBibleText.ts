import { useEffect, useState } from 'react';
import { BibleStatus } from 'src/shared/types';
import { useIpcListeners } from '@renderer/lib/ipc';

/**
 * `revision` changes whenever a Bible text file is loaded or removed: add it to the dependencies of effects that fetch
 * Bible text. `status` says which languages have Bible text.
 */
export const useBibleText = () => {
  const [revision, setRevision] = useState(0);
  const [status, setStatus] = useState<BibleStatus>();

  useIpcListeners({ bibleTextChanged: () => setRevision((r) => r + 1) });

  useEffect(() => {
    let cancelled = false;
    window.api.getBibleStatus().then((s) => !cancelled && setStatus(s));
    return () => {
      cancelled = true;
    };
  }, [revision]);

  return { revision, status };
};
