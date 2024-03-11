import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatDuration = (duration: number, dynamicShowHours = false) => {
  const padZero = (num: number) => (num < 10 ? `0${num}` : `${num}`);

  const hours = Math.floor(duration / 3600);
  const minutes = Math.floor((duration % 3600) / 60);
  const seconds = Math.floor(duration % 60);

  let hourStr = '';
  if (!dynamicShowHours || hours > 0) hourStr = `${padZero(hours)}:`;

  return hourStr + `${padZero(minutes)}:${padZero(seconds)}`;
};
