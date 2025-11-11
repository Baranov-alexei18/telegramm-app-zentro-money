import { ReactNode, useEffect } from 'react';
import cn from 'classnames';
import { animate, AnimatePresence, motion, useMotionValue, useTransform } from 'framer-motion';

import { useAppStore } from '@/store/appStore';

import styles from './styles.module.css';

type Props = {
  id: string;
  triggerComponent: ReactNode;
  children: ReactNode;
  classNameWrapperTrigger?: string;
};

export const BottomSheet = ({ id, triggerComponent, children, classNameWrapperTrigger }: Props) => {
  const { bottomSheets, openBottomSheet, closeTopBottomSheet, isTopSheet } = useAppStore();

  const isOpen = bottomSheets.some((s) => s.id === id);
  const top = isTopSheet(id);

  const sheetHeight = typeof window !== 'undefined' ? window.innerHeight - 100 : 600;
  const y = useMotionValue(sheetHeight);
  const overlayOpacity = useTransform(y, [0, sheetHeight], [0.5, 0]);

  const handleDragEnd = (_: any, info: { offset: { y: number }; velocity: { y: number } }) => {
    const threshold = sheetHeight * 0.25;
    if (info.offset.y > threshold || info.velocity.y > 500) {
      closeTopBottomSheet();
    } else {
      animate(y, 0, { type: 'spring', stiffness: 300, damping: 30 });
    }
  };

  useEffect(() => {
    if (isOpen) animate(y, 0, { type: 'spring', stiffness: 300, damping: 30 });
  }, [isOpen]);

  return (
    <>
      <div
        className={cn(styles.triggerContent, classNameWrapperTrigger)}
        onClick={() => openBottomSheet(id)}
      >
        {triggerComponent}
      </div>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              className={styles.overlay}
              style={{ opacity: overlayOpacity, zIndex: 100 + bottomSheets.length * 2 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => top && closeTopBottomSheet()}
            />

            <motion.div
              className={styles.sheet}
              style={{
                y,
                zIndex: 101 + bottomSheets.length * 2,
              }}
              initial={{ y: sheetHeight }}
              animate={{ y: 0 }}
              exit={{ y: sheetHeight }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              drag="y"
              dragConstraints={{ top: 0, bottom: sheetHeight }}
              onDrag={(event, info) => {
                if (info.offset.y < 0) y.set(0);
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
