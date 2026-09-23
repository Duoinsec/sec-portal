import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'in.edu.sec.portal',
  appName: 'SEC Portal',
  webDir: 'public',
  server: {
    androidScheme: 'https',
    cleartext: true,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#1468D5',
      showSpinner: false,
    },
  },
};

export default config;
