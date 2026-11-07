import type { AuthUser } from '@/types/auth';

export type AuthStatus = 'initializing' | 'authenticated' | 'unauthenticated';

export interface AuthState {
  status: AuthStatus;
  user: AuthUser | null;
  error: string | null;
  isSubmitting: boolean;
}

export const initialAuthState: AuthState = {
  status: 'initializing',
  user: null,
  error: null,
  isSubmitting: false,
};

export type AuthAction =
  | { type: 'RESTORE_SUCCEEDED'; user: AuthUser | null }
  | { type: 'RESTORE_FAILED'; message: string }
  | { type: 'SIGN_IN_STARTED' }
  | { type: 'SIGN_IN_SUCCEEDED'; user: AuthUser }
  | { type: 'SIGN_IN_FAILED'; message: string }
  | { type: 'SIGN_OUT_STARTED' }
  | { type: 'SIGN_OUT_SUCCEEDED' }
  | { type: 'SIGN_OUT_FAILED'; message: string }
  | { type: 'CLEAR_ERROR' };

export function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'RESTORE_SUCCEEDED':
      return {
        ...state,
        status: action.user ? 'authenticated' : 'unauthenticated',
        user: action.user,
        error: null,
        isSubmitting: false,
      };

    case 'RESTORE_FAILED':
      return {
        ...state,
        status: 'unauthenticated',
        user: null,
        error: action.message,
        isSubmitting: false,
      };

    case 'SIGN_IN_STARTED':
      return {
        ...state,
        error: null,
        isSubmitting: true,
      };

    case 'SIGN_IN_SUCCEEDED':
      return {
        status: 'authenticated',
        user: action.user,
        error: null,
        isSubmitting: false,
      };

    case 'SIGN_IN_FAILED':
      return {
        ...state,
        status: 'unauthenticated',
        user: null,
        error: action.message,
        isSubmitting: false,
      };

    case 'SIGN_OUT_STARTED':
      return {
        ...state,
        error: null,
        isSubmitting: true,
      };

    case 'SIGN_OUT_SUCCEEDED':
      return {
        status: 'unauthenticated',
        user: null,
        error: null,
        isSubmitting: false,
      };

    case 'SIGN_OUT_FAILED':
      return {
        ...state,
        error: action.message,
        isSubmitting: false,
      };

    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };

    default:
      return state;
  }
}
