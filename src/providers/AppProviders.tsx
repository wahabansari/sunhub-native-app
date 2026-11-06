import type { ErrorInfo, ReactNode } from 'react';

import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { AuthProvider } from '@/contexts/auth';
import { authService } from '@/services/auth';
import { logger } from '@/services/logging';

function handleUiError(error: Error, _info: ErrorInfo): void {
  logger.error('Unhandled UI error', { message: error.message });
}

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary onError={handleUiError}>
      <AuthProvider service={authService}>{children}</AuthProvider>
    </ErrorBoundary>
  );
}
