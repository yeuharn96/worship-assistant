import { ipcRenderer } from 'electron';

const invokeEvents: App.IpcRendererApi['invoke'] = {
  listProfiles: true,
  getProfile: true,
  getCurrentProfile: true,
  saveProfile: true,
  getOutputDimension: true,
  getChpCount: true,
  getVerseCount: true,
  getChpText: true,
  getVerseText: true,
  askImageDialog: true,
  copyToDataFolder: true,
  removeFromDataFolder: true,
  askVideosDialog: true,
  getFileName: true,
  checkFileExists: true,
};

const sendEvents: App.IpcRendererApi['send'] = {
  showOutput: true,
  showFileInFolder: true,
  hideOutput: true,
  applyOutputSettings: true,
  monitorOutput: true,
  setOutputBibleText: true,
  scrollOutputOffset: true,
  syncOutputScroll: true,
  setOutputVideo: true,
  sendVideoCommand: true,
  syncVideoPlayState: true,
  signalVideoEnded: true,
};

const setupRendererApi = () => {
  const rendererApi = {};
  Object.keys(invokeEvents).forEach((key) => {
    rendererApi[key] = (...args) => ipcRenderer.invoke(key, ...args);
  });

  Object.keys(sendEvents).forEach((key) => {
    rendererApi[key] = (...args) => ipcRenderer.send(key, ...args);
  });

  return rendererApi;
};

export default setupRendererApi;
