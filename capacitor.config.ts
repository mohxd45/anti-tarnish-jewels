import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.antitarnishjewels.app',
  appName: 'Anti Tarnish Jewels',
  webDir: 'public',
  server: {
    url: 'https://lonajewels.com/',
    cleartext: false
  }
};

export default config;
