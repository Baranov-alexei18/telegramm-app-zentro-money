import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';

import { App } from './app.tsx';

import './global.css';

const updateSW = registerSW({
  onNeedRefresh() {
    if (confirm('Доступно обновление. Обновить?')) {
      updateSW(true);
    }
  },
  onOfflineReady() {
    console.log('Приложение готово к работе оффлайн');
  },
});

createRoot(document.getElementById('root')!).render(<App />);
