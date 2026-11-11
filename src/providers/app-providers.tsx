import type { ErrorInfo, ReactNode } from 'react';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ErrorBoundary } from '@/components/common/error-boundary';
import { AuthProvider } from '@/contexts/auth';
import { authService } from '@/services/auth';
import { logger } from '@/services/logging';

import { QueryProvider } from './query-provider';

function handleUiError(error: Error, _info: ErrorInfo): void {
  logger.error('Unhandled UI error', { message: error.message });
}

const styles = StyleSheet.create({ root: { flex: 1 } });

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary onError={handleUiError}>
      <GestureHandlerRootView style={styles.root}>
        <SafeAreaProvider>
          <QueryProvider>
            <AuthProvider service={authService}>{children}</AuthProvider>
          </QueryProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}
