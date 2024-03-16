import { ElectronAPI } from '@electron-toolkit/preload';
import { InvokeHandlers } from '../main/ipc/handlers/invokeHandlers';
import { SendHandlers } from '../main/ipc/handlers/sendHandlers';

declare global {
  interface Window {
    electron: ElectronAPI;
    api: InvokeHandlers & SendHandlers;
  }
}
