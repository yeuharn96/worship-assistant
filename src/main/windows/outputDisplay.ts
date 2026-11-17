import { screen } from 'electron';

/** The display the output goes to: the first non-primary display, or the primary one if there is only one. */
export const getOutputDisplay = () => {
  const primary = screen.getPrimaryDisplay();
  return screen.getAllDisplays().find((d) => d.id !== primary.id) ?? primary;
};
