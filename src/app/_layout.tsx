import '../../global.css';

import { Inter_400Regular } from '@expo-google-fonts/inter/400Regular';
import { Inter_500Medium } from '@expo-google-fonts/inter/500Medium';
import { Inter_600SemiBold } from '@expo-google-fonts/inter/600SemiBold';
import { Inter_700Bold } from '@expo-google-fonts/inter/700Bold';
import { Poppins_400Regular } from '@expo-google-fonts/poppins/400Regular';
import { Poppins_500Medium } from '@expo-google-fonts/poppins/500Medium';
import { Poppins_600SemiBold } from '@expo-google-fonts/poppins/600SemiBold';
import { Poppins_700Bold } from '@expo-google-fonts/poppins/700Bold';
import { useFonts } from 'expo-font';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { Stack } from 'expo-router';
import { hideAsync, preventAutoHideAsync, setOptions } from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useMemo, useState } from 'react';
import { LogBox } from 'react-native';

import { AnimatedSplash } from '@/components/splash/animated-splash';
import { AppReadyContext } from '@/contexts/app-ready/app-ready-context';
import { AppProviders } from '@/providers/app-providers';
import { logger } from '@/services/logging';

// ImageBackground is used internally by a bundled dependency on this SDK version.
// The warning is harmless and unfixable without patching the package.
LogBox.ignoreLogs(['ImageBackground is deprecated']);

// Keep the native splash up until the animated splash has taken over, so there is no white flash.
preventAutoHideAsync().catch((error: unknown) => {
  logger.warn('Could not hold the native splash screen', {
    message: error instanceof Error ? error.message : 'unknown error',
  });
});
// Expo Go cannot customise the splash screen; development and release builds can.
if (Constants.executionEnvironment !== ExecutionEnvironment.StoreClient) {
  setOptions({ duration: 250, fade: true });
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });
  const [homeReady, setHomeReady] = useState(false);
  const [homeActive, setHomeActive] = useState(false);
  const [splashDone, setSplashDone] = useState(false);

  const reportHomeReady = useCallback(() => setHomeReady(true), []);
  const handleExitStart = useCallback(() => setHomeActive(true), []);
  const handleSplashDone = useCallback(() => setSplashDone(true), []);
  const handleSplashShown = useCallback(() => {
    hideAsync().catch((error: unknown) => {
      logger.warn('Could not hide the native splash screen', {
        message: error instanceof Error ? error.message : 'unknown error',
      });
    });
  }, []);
  const readyValue = useMemo(
    () => ({ homeActive, reportHomeReady }),
    [homeActive, reportHomeReady],
  );

  if (!fontsLoaded) return null;

  return (
    <AppProviders>
      <StatusBar style="dark" />
      <AppReadyContext.Provider value={readyValue}>
        <Stack
          screenOptions={{
            headerShown: false,
            // Screens underneath stop re-rendering while another screen is on top of them.
            freezeOnBlur: true,
            animation: 'slide_from_right',
            contentStyle: { backgroundColor: '#FFFFFF' },
          }}
        />
      </AppReadyContext.Provider>
      {splashDone ? null : (
        <AnimatedSplash
          canExit={homeReady}
          onShown={handleSplashShown}
          onExitStart={handleExitStart}
          onDone={handleSplashDone}
        />
      )}
    </AppProviders>
  );
}
