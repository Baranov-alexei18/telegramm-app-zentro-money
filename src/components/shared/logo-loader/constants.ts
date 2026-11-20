import { Easing } from 'framer-motion';

export const LOGO_BOUNCE_DURATION = 2.1;

export const LOGO_BOUNCE_TIMES = [0, 0.14, 0.28, 0.39, 0.5, 0.59, 0.68, 0.74, 0.8, 1];

export const LOGO_BOUNCE_Y = [0, -60, 0, -36, 0, -18, 0, -7, 0, 0];

export const LOGO_BOUNCE_SCALE_X = [1.06, 0.96, 1.08, 0.97, 1.05, 0.98, 1.03, 0.99, 1, 1];

export const LOGO_BOUNCE_SCALE_Y = [0.94, 1.04, 0.92, 1.03, 0.95, 1.02, 0.97, 1.01, 1, 1];

export const LOGO_BOUNCE_EASES: Easing[] = [
  'easeOut',
  'easeIn',
  'easeOut',
  'easeIn',
  'easeOut',
  'easeIn',
  'easeOut',
  'easeIn',
  'linear',
];

export const LOGO_SHADOW_SCALE = [1, 0.45, 1.05, 0.6, 1.02, 0.75, 1, 0.88, 1, 1];

export const LOGO_SHADOW_OPACITY = [0.32, 0.1, 0.34, 0.15, 0.3, 0.2, 0.28, 0.24, 0.26, 0.26];
