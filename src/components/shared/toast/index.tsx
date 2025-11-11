import {
  Button,
  Text,
  UNSTABLE_Toast as Toast,
  UNSTABLE_ToastContent as ToastContent,
  UNSTABLE_ToastRegion as ToastRegion,
} from 'react-aria-components';
import cn from 'classnames';

import { notificationManager } from './utils';

import styles from './styles.module.css';

export const Toasts = () => {
  return (
    <ToastRegion className={styles.wrapper} queue={notificationManager}>
      {({ toast }) => (
        <Toast
          style={{ viewTransitionName: toast.key }}
          className={cn(styles.toast, {
            [styles.ok]: toast.content.type === 'ok',
            [styles.error]: toast.content.type === 'error',
            [styles.warn]: toast.content.type === 'warn',
          })}
          toast={toast}
        >
          <ToastContent className={styles.toastContent}>
            <Text slot="title">{toast.content.title}</Text>
            {toast.content.content && <Text slot="description">{toast.content.content}</Text>}
          </ToastContent>
          <Button className={styles.button} slot="close">
            ×
          </Button>
        </Toast>
      )}
    </ToastRegion>
  );
};
