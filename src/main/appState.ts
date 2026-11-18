// Shared main-process state. Kept free of imports so any module can use it without creating import cycles.

let outputShowing = false;
let menuRefresher = () => {};

/** Whether the output is showing. Tracked here because a hidden fullscreen window can report itself visible on Linux. */
export const isOutputShowing = () => outputShowing;
export const setOutputShowing = (showing: boolean) => {
  if (outputShowing === showing) return;
  outputShowing = showing;
  refreshMenu();
};

export const setMenuRefresher = (refresher: () => void) => (menuRefresher = refresher);
/** Rebuild the application menu, e.g. after the profiles or the active profile changed. */
export const refreshMenu = () => menuRefresher();
