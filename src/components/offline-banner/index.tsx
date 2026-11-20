import { PointerEvent as ReactPointerEvent, useEffect, useState } from 'react';
import { Icon } from '@iconify/react';
import { AnimatePresence, motion, PanInfo } from 'framer-motion';

import { Button } from '@/components/shared/button';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';

import {
  BannerExitDirection,
  OFFLINE_BANNER_VARIANTS,
  SWIPE_VELOCITY_THRESHOLD,
  SWIPE_X_THRESHOLD,
  SWIPE_Y_THRESHOLD,
} from './constants';

import styles from './styles.module.css';

export const OfflineBanner = () => {
  const isOnline = useOnlineStatus();
  const [isDismissed, setIsDismissed] = useState(false);
  const [exitDirection, setExitDirection] = useState<BannerExitDirection>('up');

  useEffect(() => {
    if (isOnline) {
      setIsDismissed(false);
      setExitDirection('up');
    }
  }, [isOnline]);

  const handleStopDragPropagation = (e: ReactPointerEvent<HTMLSpanElement>) => {
    e.stopPropagation();
  };

  const handleClose = () => {
    setExitDirection('up');
    setIsDismissed(true);
  };

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const swipedHorizontally =
      Math.abs(info.offset.x) > SWIPE_X_THRESHOLD ||
      Math.abs(info.velocity.x) > SWIPE_VELOCITY_THRESHOLD;
    const swipedUp =
      info.offset.y < SWIPE_Y_THRESHOLD || info.velocity.y < -SWIPE_VELOCITY_THRESHOLD;

    if (swipedHorizontally) {
      const horizontalSignal =
        Math.abs(info.offset.x) > SWIPE_X_THRESHOLD ? info.offset.x : info.velocity.x;
      setExitDirection(horizontalSignal < 0 ? 'left' : 'right');
      setIsDismissed(true);
      return;
    }

    if (swipedUp) {
      setExitDirection('up');
      setIsDismissed(true);
    }
  };

  const isVisible = !isOnline && !isDismissed;

  return (
    <AnimatePresence custom={exitDirection}>
      {isVisible && (
        <div className={styles.overlayContainer}>
          <motion.div
            role="status"
            aria-live="polite"
            className={styles.banner}
            custom={exitDirection}
            variants={OFFLINE_BANNER_VARIANTS}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.22, ease: 'easeOut' }}
            drag
            dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
            dragElastic={{ left: 0.75, right: 0.75, top: 0.75, bottom: 0.08 }}
            onDragEnd={handleDragEnd}
          >
            <span className={styles.iconWrapper} aria-hidden="true">
              <Icon icon="mingcute:wifi-off-line" width={20} height={20} />
            </span>

            <div className={styles.textBlock}>
              <strong className={styles.title}>Офлайн-режим</strong>
              <span className={styles.subtitle}>Изменения сохранятся локально</span>
            </div>

            <span className={styles.closeWrapper} onPointerDown={handleStopDragPropagation}>
              <Button
                aria-label="Закрыть уведомление об офлайн-режиме"
                className={styles.closeBtn}
                onClick={handleClose}
              >
                <Icon icon="mingcute:close-line" width={16} height={16} />
              </Button>
            </span>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
