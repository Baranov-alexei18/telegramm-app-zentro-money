import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';

import { App } from './app.tsx';

import './global.css';

const intervalMS = 60 * 60 * 1000; // 1 час

const updateSW = registerSW({
  onRegistered(r) {
    if (r) {
      setInterval(() => {
        r.update();
      }, intervalMS);
    }
  },
  onNeedRefresh() {
    if (confirm('Доступно новое обновление c исправлениями. Обновить сейчас?')) {
      updateSW(true);
    }
  },
  onOfflineReady() {
    console.log('Приложение закэшировано и готово к работе без интернета');
  },
});
createRoot(document.getElementById('root')!).render(<App />);
