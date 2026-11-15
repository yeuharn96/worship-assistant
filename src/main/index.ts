import { app, protocol, screen } from 'electron';
import { electronApp, optimizer } from '@electron-toolkit/utils';
import { createWindow } from './windows/ControlPanelWindow';
import { createOutputWindow, moveOutputWindow } from './windows/OutputWindow';
import { getOutputDisplay } from './windows/outputDisplay';
import { getOutputWindow } from './windows/getWindows';
import setupMainHandlers from './ipc/setupMainHandlers';
import sendHandlers from './ipc/sendHandlers';

// Renderer builds these URLs as `<scheme>:///<encodeURIComponent(path)>` (see renderer lib/utils localFileUrl).
const getLocalFilePath = (url: string, scheme: string) => {
  const raw = url.slice(`${scheme}:///`.length);
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
};

app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.yeuharn96.worship-assistant');

  app.on('browser-window-created', (_, window) => {
    // Default open or close DevTools by F12 in development
    // and ignore CommandOrControl + R in production.
    // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
    optimizer.watchWindowShortcuts(window);
  });

  const mainWindow = createWindow();
  process.env.MAIN_WINDOW_ID = mainWindow.id.toString();

  const outputWindow = createOutputWindow(getOutputDisplay());
  process.env.OUTPUT_WINDOW_ID = outputWindow.id.toString();

  // Follow the projector when displays are connected, disconnected or change resolution.
  // display-metrics-changed also fires for taskbar, DPI and work-area changes, so only notify on a new size.
  let lastSize = getOutputDisplay().size;
  const handleDisplayChanged = () => {
    const win = getOutputWindow();
    if (!win) return;
    const display = getOutputDisplay();
    const current = win.getBounds();
    const { x, y, width, height } = display.bounds;
    if (current.x !== x || current.y !== y || current.width !== width || current.height !== height) {
      moveOutputWindow(win, display);
    }
    if (display.size.width === lastSize.width && display.size.height === lastSize.height) return;
    lastSize = display.size;
    sendHandlers.setOutputDimension(display.size);
  };
  screen.on('display-added', handleDisplayChanged);
  screen.on('display-removed', handleDisplayChanged);
  screen.on('display-metrics-changed', handleDisplayChanged);

  protocol.registerFileProtocol('video', (request, callback) => {
    callback(getLocalFilePath(request.url, 'video'));
  });
  protocol.registerFileProtocol('image', (request, callback) => {
    callback(getLocalFilePath(request.url, 'image'));
  });

  setupMainHandlers();
});

app.on('window-all-closed', () => {
  app.quit();
});
