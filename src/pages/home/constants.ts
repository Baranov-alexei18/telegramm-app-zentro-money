import { Variants } from 'framer-motion';

import { PluralFormsType } from '@/lib/pluralize-ru';

export type HomeStepType = {
  icon: string;
  title: string;
};

export const HOME_STEPS: HomeStepType[] = [
  { icon: 'proicons:home', title: 'Создайте комнату' },
  { icon: 'glyphs:users-1-bold', title: 'Пригласите участников' },
  { icon: 'mingcute:wallet-4-fill', title: 'Ведите общий бюджет' },
  { icon: 'glyphs:chart-pie-slice-bold', title: 'Анализируйте статистику' },
];

export const PARTICIPANT_PLURAL_FORMS: PluralFormsType = ['участник', 'участника', 'участников'];

export const GREETING_CONTAINER_VARIANTS: Variants = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: {
      delayChildren: 0.12,
      staggerChildren: 0.045,
    },
  },
};

export const GREETING_CHAR_VARIANTS: Variants = {
  hidden: {
    opacity: 0,
    x: -12,
    filter: 'blur(4px)',
  },
  visible: {
    opacity: 1,
    x: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.45,
      ease: 'easeOut',
    },
  },
};
