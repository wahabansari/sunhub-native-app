import { createContext } from 'react';

import type { SignInCredentials } from '@/types/auth';

import type { AuthState } from './auth-reducer';

export interface AuthContextValue {
  state: AuthState;
  signIn(credentials: SignInCredentials): Promise<boolean>;
  signOut(): Promise<void>;
  clearError(): void;
}

/**
 * The access token is deliberately not part of this context. Only the
 * authenticated user snapshot and actions are exposed to consumers.
 */
export const AuthContext = createContext<AuthContextValue | null>(null);
