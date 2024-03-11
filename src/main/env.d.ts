declare global {
  namespace NodeJS {
    interface ProcessEnv {
      MAIN_WINDOW_ID: string;
      OUTPUT_WINDOW_ID: string;
      RESOURCE_DIR: string;
      DATA_DIR: string;
    }
  }
}

export {};
