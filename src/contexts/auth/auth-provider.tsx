import { useCallback, useEffect, useMemo, useReducer, type ReactNode } from 'react';

import { toErrorCode, toUserMessage } from '@/errors';
import type { AuthService, SignInCredentials } from '@/types/auth';

import { AuthContext } from './auth-context';
import { authReducer, initialAuthState } from './auth-reducer';

export interface AuthProviderProps {
  service: AuthService;
  children: ReactNode;
}

export function AuthProvider({ service, children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, initialAuthState);

  useEffect(() => {
    let cancelled = false;

    service
      .restoreSession()
      .then((user) => {
        if (!cancelled) {
          dispatch({ type: 'RESTORE_SUCCEEDED', user });
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          dispatch({ type: 'RESTORE_FAILED', message: toUserMessage(error) });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [service]);

  const signIn = useCallback(
    async (credentials: SignInCredentials): Promise<boolean> => {
      dispatch({ type: 'SIGN_IN_STARTED' });

      try {
        const user = await service.signIn(credentials);
        dispatch({ type: 'SIGN_IN_SUCCEEDED', user });
        return true;
      } catch (error) {
        dispatch({
          type: 'SIGN_IN_FAILED',
          message: toUserMessage(error),
          code: toErrorCode(error),
        });
        return false;
      }
    },
    [service],
  );

  const signOut = useCallback(async (): Promise<void> => {
    dispatch({ type: 'SIGN_OUT_STARTED' });

    try {
      await service.signOut();
      dispatch({ type: 'SIGN_OUT_SUCCEEDED' });
    } catch (error) {
      dispatch({ type: 'SIGN_OUT_FAILED', message: toUserMessage(error) });
    }
  }, [service]);

  const clearError = useCallback((): void => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  const value = useMemo(
    () => ({ state, signIn, signOut, clearError }),
    [state, signIn, signOut, clearError],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
