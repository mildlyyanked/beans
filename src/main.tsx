import React from 'react';
import ReactDOM from 'react-dom/client';
import '@fontsource-variable/cinzel';
import '@fontsource-variable/crimson-pro';
import './styles/global.css';
import { App } from './App';
import { registerSW } from 'virtual:pwa-register';
import { initNative, isNative } from './native';

if (!isNative) registerSW({ immediate: true });
void initNative();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
