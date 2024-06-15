import { dialog } from 'electron';
import path from 'path';
import { Video } from '../../../shared/types';

export const dialogHandler = {
  askImageDialog: () => {
    const [imageFile] =
      dialog.showOpenDialogSync({
        properties: ['openFile'],
        filters: [
          { name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'bmp', 'svg', 'tif', 'tiff', 'webp'] },
          { name: 'All Files', extensions: ['*'] },
        ],
      }) ?? [];

    if (!imageFile) return;

    return imageFile.replaceAll('\\', '/');
  },
  askVideosDialog: () => {
    const videoFiles = dialog.showOpenDialogSync({
      properties: ['openFile', 'multiSelections'],
      filters: [
        { name: 'Videos', extensions: ['mp4', 'avi', 'mkv', 'mov', 'wmv', 'flv', 'webm'] },
        { name: 'All Files', extensions: ['*'] },
      ],
    });

    if (!videoFiles) return [];

    return videoFiles.map((filePath) => ({ path: filePath, name: path.basename(filePath) })) as Video[];
  },
};
