import { useEffect, useState } from 'react';
import { stringify } from 'flatted';

import styles from './styles.module.css';

export const AuthPage = () => {
  const [windowStr, setWindowStr] = useState<string>('');
  const [windowTelegramm, setWindowTelegramm] = useState<string>('');

  useEffect(() => {
    const str = stringify(window);
    setWindowStr(str);

    const str2 = stringify((window as any)?.Telegram);
    setWindowTelegramm(str2);
  }, []);

  return (
    <div className={styles.wrapper}>
      <h2>AuthPage</h2>
      <pre>{windowStr.slice(0, 10000)}</pre>
      <pre>{windowTelegramm.slice(0, 1000)}</pre>
    </div>
  );
};
