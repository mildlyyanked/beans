import React from 'react';
import ReactDOM from 'react-dom/client';
import '@fontsource-variable/cinzel';
import '@fontsource-variable/crimson-pro';
import './styles/global.css';
import { App } from './App';
import { registerSW } from 'virtual:pwa-register';
import { initNative, isNative } from './native';
import { useUI } from './store/ui';

window.addEventListener('unhandledrejection', (e) => { const m = (e.reason as Error)?.message ?? String(e.reason); useUI.getState().toast(m.slice(0, 200), 'error'); });
window.addEventListener('error', (e) => { if (e.message) useUI.getState().toast(e.message.slice(0, 200), 'error'); });

if (!isNative) registerSW({ immediate: true });
void initNative();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
