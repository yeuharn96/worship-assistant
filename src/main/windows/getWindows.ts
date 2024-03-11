import { BrowserWindow, WebContents } from 'electron';
import { WebContentEventListeners } from '../../shared/types';

interface AppWindow extends BrowserWindow {
  webContents: AppWebContents;
}
interface AppWebContents extends WebContents {
  send<T extends keyof WebContentEventListeners>(channel: T, ...args: Parameters<WebContentEventListeners[T]>): void;
}

export const getMainWindow = (): AppWindow | null => BrowserWindow.fromId(Number(process.env['MAIN_WINDOW_ID']));
export const getOutputWindow = (): AppWindow | null => BrowserWindow.fromId(Number(process.env['OUTPUT_WINDOW_ID']));
