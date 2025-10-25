import { ReactNode, useState } from 'react';
import { animate, AnimatePresence, motion, useMotionValue, useTransform } from 'framer-motion';

import { useAppStore } from '@/store/appStore';

import styles from './styles.module.css';

type Props = {
  children: ReactNode;
  triggerComponent: ReactNode;
};

export const BottonSheet = ({ triggerComponent, children }: Props) => {
  const { bottonSheetOpen, setBottonSheetOpen } = useAppStore();

  const sheetHeight = window.innerHeight - 100;
  const y = useMotionValue(sheetHeight);

  const overlayOpacity = useTransform(y, [0, sheetHeight], [0.5, 0]);

  const handleDragEnd = (_: any, info: { offset: { y: number }; velocity: { y: number } }) => {
    const threshold = sheetHeight * 0.25;
    if (info.offset.y > threshold || info.velocity.y > 500) {
      setBottonSheetOpen(false);
    } else {
      animate(y, 0, { type: 'spring', stiffness: 300, damping: 30 });
    }
  };

  return (
    <>
      <div className={styles.triggerContent} onClick={() => setBottonSheetOpen(true)}>
        {triggerComponent}
      </div>

      <AnimatePresence>
        {bottonSheetOpen && (
          <>
            <motion.div
              className={styles.overlay}
              style={{ opacity: overlayOpacity }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setBottonSheetOpen(false)}
            />

            <motion.div
              className={styles.sheet}
              style={{ y }}
              initial={{ y: sheetHeight }}
              animate={{ y: 0 }}
              exit={{ y: sheetHeight }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              drag="y"
              dragConstraints={{ top: 0, bottom: sheetHeight }}
              onDrag={(event, info) => {
                if (info.offset.y < 0) {
                  y.set(0);
                }
              }}
              onDragEnd={handleDragEnd}
            >
              <div className={styles.dragHandle} />
              {children}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
