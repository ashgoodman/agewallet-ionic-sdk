import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.agewallet.sdk.demo.ionic',
  appName: 'AgeWallet SDK Demo',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    App: {
      // Deep link configuration handled in native projects
    }
  }
};

export default config;
