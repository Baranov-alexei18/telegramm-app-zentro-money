import { useEffect, useState } from 'react';

import styles from './styles.module.css';

export const AuthPage = () => {
  const [tgData, setTgData] = useState<any>(null);

  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp;
    if (tg) {
      const data = {
        version: tg.version,
        initData: tg.initData,
        initDataUnsafe: tg.initDataUnsafe,
        viewportHeight: tg.viewportHeight,
        viewportStableHeight: tg.viewportStableHeight,
        themeParams: tg.themeParams,
      };
      setTgData(data);
    }
  }, []);

  return (
    <div className={styles.wrapper}>
      <h2>AuthPage</h2>
      {tgData ? <pre>{JSON.stringify(tgData, null, 2)}</pre> : <p>Telegram WebApp не найден</p>}
    </div>
  );
};
