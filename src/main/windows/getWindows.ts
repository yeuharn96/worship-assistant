import { BrowserWindow, WebContents } from 'electron';
import { ControlPanelEventListeners, WebContentEventListeners } from '../../shared/types';

type EventListeners = WebContentEventListeners & ControlPanelEventListeners;

interface AppWindow extends BrowserWindow {
  webContents: AppWebContents;
}
interface AppWebContents extends WebContents {
  send<T extends keyof EventListeners>(channel: T, ...args: Parameters<EventListeners[T]>): void;
}

export const getMainWindow = (): AppWindow | null => BrowserWindow.fromId(Number(process.env['MAIN_WINDOW_ID']));
export const getOutputWindow = (): AppWindow | null => BrowserWindow.fromId(Number(process.env['OUTPUT_WINDOW_ID']));
