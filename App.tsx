import './global.css';

import { StatusBar } from 'expo-status-bar';
import { Text, View } from 'react-native';

import { APP_NAME } from '@/constants/app';
import { useAuth } from '@/hooks/useAuth';
import { AppProviders } from '@/providers/AppProviders';

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
      <Text className="text-title font-semibold text-text">{APP_NAME}</Text>
      <Text className="mt-sm text-body text-muted">React Native foundation</Text>
      <Text className="mt-lg text-body text-primary">{statusLabel}</Text>
      {state.error ? (
        <Text className="mt-md text-center text-caption text-danger">{state.error}</Text>
      ) : null}
    </View>
  );
}

export default function App() {
  return (
    <AppProviders>
      <View className="flex-1 bg-background">
        <StatusBar style="auto" />
        <BootstrapStatus />
      </View>
    </AppProviders>
  );
}
