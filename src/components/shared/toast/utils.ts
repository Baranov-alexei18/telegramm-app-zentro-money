import { UNSTABLE_ToastQueue as ToastQueue } from 'react-aria-components';
import { flushSync } from 'react-dom';

export type ToastType = 'ok' | 'error' | 'warn';

type ToastContentType = {
  title: string;
  content?: string;
  type: ToastType;
};

export const notificationManager = new ToastQueue<ToastContentType>({
  wrapUpdate(fn) {
    if ('startViewTransition' in document) {
      document.startViewTransition(() => {
        flushSync(fn);
      });
    } else {
      fn();
    }
  },
});
