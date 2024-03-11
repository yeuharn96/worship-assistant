import { spawn } from 'child_process';
import { WebContentEventListeners } from '../../shared/types';
import { getMainWindow, getOutputWindow } from '../windows/getWindows';

const sendHandlers = {
  showOutput: () => {
    const outputWindow = getOutputWindow();
    outputWindow?.show();
    outputWindow?.moveTop();
    outputWindow?.focus();
  },
  showFileInFolder: (filePath: string) => {
    const cmd = spawn(`explorer`, ['/select,', filePath]);
    cmd.on('error', (err) => {
      cmd.kill();
      console.error(err);
    });
  },
};

const webContentEventHandlers: WebContentEventListeners = {
  hideOutput: () => {
    getOutputWindow()?.hide();
    const mainWindow = getMainWindow();
    mainWindow?.moveTop();
    mainWindow?.focus();
    mainWindow?.webContents.send('hideOutput');
  },
  applyOutputSettings: (...args) => {
    getOutputWindow()?.webContents.send('applyOutputSettings', ...args);
  },
  monitorOutput: () => {
    const srcId = getOutputWindow()?.getMediaSourceId();
    if (srcId) getMainWindow()?.webContents.send('monitorOutput', srcId);
  },

  // bible
  setOutputBibleText: (...args) => {
    getOutputWindow()?.webContents.send('setOutputBibleText', ...args);
  },
  scrollOutputOffset: (...args) => {
    getOutputWindow()?.webContents.send('scrollOutputOffset', ...args);
  },
  syncOutputScroll: (...args) => {
    getMainWindow()?.webContents.send('syncOutputScroll', ...args);
  },

  // video
  setOutputVideo: (...args) => {
    getOutputWindow()?.webContents.send('setOutputVideo', ...args);
  },
  sendVideoCommand: (...args) => {
    getOutputWindow()?.webContents.send('sendVideoCommand', ...args);
  },
  syncVideoPlayState: (...args) => {
    getMainWindow()?.webContents.send('syncVideoPlayState', ...args);
  },
  signalVideoEnded: () => {
    getMainWindow()?.webContents.send('signalVideoEnded');
  },
};

export type SendHandlers = typeof sendHandlers & typeof webContentEventHandlers;
export default { ...sendHandlers, ...webContentEventHandlers };
