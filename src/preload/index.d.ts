import { ElectronAPI } from '@electron-toolkit/preload';
import { InvokeHandlers } from '../main/ipc/invokeHandlers';
import { SendHandlers } from '../main/ipc/sendHandlers';

declare global {
  interface Window {
    electron: ElectronAPI;
    api: InvokeHandlers & SendHandlers;
  }
}
