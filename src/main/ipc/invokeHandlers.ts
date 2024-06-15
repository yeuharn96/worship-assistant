import { screen } from 'electron';
import { ReturnPromise } from '../../shared/types';
import { bibleHandler } from './handlers/bibleHandler';
import { dialogHandler } from './handlers/dialogHandler';
import { fileHandler } from './handlers/fileHandler';
import { profilesHandler } from './handlers/profilesHandler';
import { fontsHandler } from './handlers/fontsHandler';

const invokeHandlers = {
  ...profilesHandler,
  ...bibleHandler,
  ...fileHandler,
  ...dialogHandler,
  ...fontsHandler,

  getOutputDimension: () => {
    const displays = screen.getAllDisplays();
    return (displays.length > 1 ? displays[1] : displays[0]).size;
  },
};

export type InvokeHandlers = ReturnPromise<typeof invokeHandlers>;
export default invokeHandlers;
