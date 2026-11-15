import { ReturnPromise } from '../../shared/types';
import { bibleHandler } from './handlers/bibleHandler';
import { dialogHandler } from './handlers/dialogHandler';
import { fileHandler } from './handlers/fileHandler';
import { profilesHandler } from './handlers/profilesHandler';
import { fontsHandler } from './handlers/fontsHandler';
import { getOutputDisplay } from '../windows/outputDisplay';

const invokeHandlers = {
  ...profilesHandler,
  ...bibleHandler,
  ...fileHandler,
  ...dialogHandler,
  ...fontsHandler,

  getOutputDimension: () => getOutputDisplay().size,
};

export type InvokeHandlers = ReturnPromise<typeof invokeHandlers>;
export default invokeHandlers;
