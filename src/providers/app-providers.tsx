import { StripeProvider } from '@stripe/stripe-react-native';
import type { ErrorInfo, ReactNode } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ErrorBoundary } from '@/components/common/error-boundary';
import { ToastProvider } from '@/components/feedback/toast';
import { env } from '@/config/env';
import { AuthProvider } from '@/contexts/auth';
import { authService } from '@/services/auth';
import { logger } from '@/services/logging';

import { CartSync } from './cart-sync';
import { QueryProvider } from './query-provider';

function handleUiError(error: Error, _info: ErrorInfo): void {
  logger.error('Unhandled UI error', { message: error.message });
}

/** Card entry is only available when a Stripe publishable key is configured. */
function Payments({ children }: { children: ReactNode }) {
  if (!env.stripePublishableKey) return <>{children}</>;
  return (
    <StripeProvider publishableKey={env.stripePublishableKey}>
      <>{children}</>
    </StripeProvider>
  );
}

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary onError={handleUiError}>
      <SafeAreaProvider>
        <QueryProvider>
          <AuthProvider service={authService}>
            <Payments>
              <ToastProvider>
                <CartSync />
                {children}
              </ToastProvider>
            </Payments>
          </AuthProvider>
        </QueryProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}
