import { Variants } from 'framer-motion';

export type BannerExitDirection = 'up' | 'left' | 'right';

export const SWIPE_X_THRESHOLD = 70;
export const SWIPE_Y_THRESHOLD = -30;
export const SWIPE_VELOCITY_THRESHOLD = 320;

export const OFFLINE_BANNER_VARIANTS: Variants = {
  initial: {
    opacity: 0,
    x: 0,
    y: -36,
    scale: 0.96,
  },
  animate: {
    opacity: 1,
    x: 0,
    y: 0,
    scale: 1,
  },
  exit: (direction: BannerExitDirection = 'up') => {
    if (direction === 'left') {
      return { opacity: 0, x: -280, scale: 0.95 };
    }

    if (direction === 'right') {
      return { opacity: 0, x: 280, scale: 0.95 };
    }

    return { opacity: 0, x: 0, y: -40, scale: 0.95 };
  },
};
