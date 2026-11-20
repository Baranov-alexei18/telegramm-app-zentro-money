import cn from 'classnames';
import { motion } from 'framer-motion';

import LogoSmall from '@/assets/images/logo-small.png';

import {
  LOGO_BOUNCE_DURATION,
  LOGO_BOUNCE_EASES,
  LOGO_BOUNCE_SCALE_X,
  LOGO_BOUNCE_SCALE_Y,
  LOGO_BOUNCE_TIMES,
  LOGO_BOUNCE_Y,
  LOGO_SHADOW_OPACITY,
  LOGO_SHADOW_SCALE,
} from './constants';

import styles from './styles.module.css';

type Props = {
  size?: number;
  className?: string;
};

export const LogoLoader = ({ size = 64, className }: Props) => {
  return (
    <div className={cn(styles.container, className)} role="status" aria-label="Загрузка">
      <motion.div
        className={styles.bounceStage}
        animate={{
          y: LOGO_BOUNCE_Y,
          scaleX: LOGO_BOUNCE_SCALE_X,
          scaleY: LOGO_BOUNCE_SCALE_Y,
        }}
        transition={{
          duration: LOGO_BOUNCE_DURATION,
          times: LOGO_BOUNCE_TIMES,
          ease: LOGO_BOUNCE_EASES,
          repeat: Infinity,
        }}
      >
        <motion.img
          src={LogoSmall}
          alt=""
          width={size}
          height={size}
          className={styles.logoImage}
          animate={{ rotate: [0, 720, 720] }}
          transition={{
            duration: LOGO_BOUNCE_DURATION,
            times: [0, 0.8, 1],
            ease: ['easeOut', 'linear'],
            repeat: Infinity,
          }}
        />
      </motion.div>

      <motion.span
        aria-hidden="true"
        className={styles.shadow}
        style={{ width: size * 0.7 }}
        animate={{
          scaleX: LOGO_SHADOW_SCALE,
          opacity: LOGO_SHADOW_OPACITY,
        }}
        transition={{
          duration: LOGO_BOUNCE_DURATION,
          times: LOGO_BOUNCE_TIMES,
          ease: LOGO_BOUNCE_EASES,
          repeat: Infinity,
        }}
      />
    </div>
  );
};
