import { ElectronAPI } from '@electron-toolkit/preload';
import { MainIpcHandler } from '../main/ipc/index';

declare global {
  interface Window {
    electron: ElectronAPI;
    api: MainIpcHandler;
  }
}
