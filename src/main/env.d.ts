import { InvokeHandlers } from './ipc/invokeHandlers';
import { SendHandlers } from './ipc/sendHandlers';

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      MAIN_WINDOW_ID: string;
      OUTPUT_WINDOW_ID: string;
    }
  }

  namespace App {
    interface IpcRendererApi {
      invoke: Required<{ [K in keyof InvokeHandlers]: true }>;
      send: Required<{ [K in keyof SendHandlers]: true }>;
    }
  }
}

export {};
