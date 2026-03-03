import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
    appId: 'ai.dayone.factory',
    appName: 'DayOne',
    webDir: 'out',
    server: {
        // Points to the Vercel deployment for live updates
        url: 'https://dayone-beta.vercel.app',
        cleartext: true,
    },
    ios: {
        scheme: 'DayOne',
        contentInset: 'always',
        backgroundColor: '#0a0a1a',
        preferredContentMode: 'mobile',
        limitsNavigationsToAppBoundDomains: true,
    },
    plugins: {
        SplashScreen: {
            launchShowDuration: 2000,
            launchAutoHide: true,
            backgroundColor: '#0a0a1a',
            showSpinner: false,
            androidScaleType: 'CENTER_CROP',
            splashFullScreen: true,
        },
        StatusBar: {
            style: 'DARK',
            backgroundColor: '#0a0a1a',
        },
        Keyboard: {
            resize: 'body',
            style: 'dark',
        },
    },
};

export default config;
