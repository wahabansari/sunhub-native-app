import './global.css';

import {
  useFonts,
  Inter_400Regular,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import { StatusBar } from 'expo-status-bar';
import { LogBox, Text, View } from 'react-native';

import { APP_NAME } from '@/constants/app';
import { useAuth } from '@/hooks/use-auth';
import { AppProviders } from '@/providers/app-providers';

// ImageBackground is used internally by a bundled dependency on this SDK version.
// The warning is harmless and unfixable without patching the package.
LogBox.ignoreLogs(['ImageBackground is deprecated']);

function BootstrapStatus() {
  const { state } = useAuth();
  const statusLabel =
    state.status === 'initializing'
      ? 'Restoring session...'
      : state.status === 'authenticated'
        ? 'Session active'
        : 'No active session';

  return (
    <View className="flex-1 items-center justify-center p-lg">
      <Text className="text-title font-semibold text-ink">{APP_NAME}</Text>
      <Text className="mt-sm text-body text-ink/70">React Native foundation</Text>
      <Text className="mt-lg text-body text-primary">{statusLabel}</Text>
      {state.error ? (
        <Text className="mt-md text-center text-caption text-price">{state.error}</Text>
      ) : null}
    </View>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({ Inter_400Regular, Inter_600SemiBold, Inter_700Bold });

  if (!fontsLoaded) return null;

  return (
    <AppProviders>
      <View className="flex-1 bg-surface">
        <StatusBar style="auto" />
        <BootstrapStatus />
      </View>
    </AppProviders>
  );
}
