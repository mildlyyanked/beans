/**
 * Native (Capacitor) integration. Everything here is a no-op in the browser.
 */
import { Capacitor } from '@capacitor/core';
import { useUI } from '@/store/ui';
import { useCampaign } from '@/store/campaign';

export const isNative = Capacitor.isNativePlatform();

export async function initNative(): Promise<void> {
  if (!isNative) return;
  try {
    const { App } = await import('@capacitor/app');
    App.addListener('backButton', ({ canGoBack }) => {
      const ui = useUI.getState();
      if (ui.screen.name === 'play' && ui.playTab !== 'story') { ui.setPlayTab('story'); return; }
      if (ui.stack.length > 0) { ui.back(); return; }
      if (ui.screen.name === 'play') { useCampaign.getState().close(); ui.replace({ name: 'home' }); return; }
      if (!canGoBack) App.minimizeApp();
    });
    App.addListener('pause', () => { void useCampaign.getState().flush(); });
  } catch (e) { console.warn('native app plugin unavailable', e); }
  try {
    const { StatusBar, Style } = await import('@capacitor/status-bar');
    await StatusBar.setStyle({ style: Style.Dark });
    await StatusBar.setBackgroundColor({ color: '#0b0a10' });
  } catch { /* iOS or plugin missing */ }
}
