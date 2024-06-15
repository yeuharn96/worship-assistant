import useOutputStore from '@renderer/store/output';
import { useEffect } from 'react';

export const useOutputDimension = () => {
  const { dimension, setOutput } = useOutputStore();

  useEffect(() => {
    (async () => {
      if (dimension) return;
      setOutput({ dimension: await window.api.getOutputDimension() });
    })();
  }, []);

  return { dimension };
};
