import type { CapacitorConfig } from '@capacitor/cli';

/**
 * Change `appId` before your first Play Store upload if you want a different
 * package name — it cannot be changed after publishing. The same value must be
 * used in android/app/build.gradle (applicationId) and the Play secrets.
 */
const config: CapacitorConfig = {
  appId: 'app.tavern.dm',
  appName: 'Tavern',
  webDir: 'dist',
  backgroundColor: '#0b0a10',
  android: {
    allowMixedContent: false,
    backgroundColor: '#0b0a10',
  },
  plugins: {
    StatusBar: { style: 'DARK', backgroundColor: '#0b0a10', overlaysWebView: false },
  },
};

export default config;
