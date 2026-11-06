import { authReducer, initialAuthState, type AuthState } from '@/contexts/auth/authReducer';
import { makeUser } from '../fixtures/auth';

function authenticatedState(): AuthState {
  return {
    status: 'authenticated',
    user: makeUser(),
    error: null,
    isSubmitting: false,
  };
}

describe('authReducer', () => {
  it('starts initializing', () => {
    expect(initialAuthState).toEqual({
      status: 'initializing',
      user: null,
      error: null,
      isSubmitting: false,
    });
  });

  it('handles restore results', () => {
    expect(
      authReducer(initialAuthState, { type: 'RESTORE_SUCCEEDED', user: makeUser() }).status,
    ).toBe('authenticated');
    expect(authReducer(initialAuthState, { type: 'RESTORE_SUCCEEDED', user: null }).status).toBe(
      'unauthenticated',
    );
    expect(
      authReducer(initialAuthState, { type: 'RESTORE_FAILED', message: 'Restore failed.' }),
    ).toMatchObject({
      status: 'unauthenticated',
      user: null,
      error: 'Restore failed.',
    });
  });

  it('tracks sign-in progress and failure', () => {
    const started = authReducer(initialAuthState, { type: 'SIGN_IN_STARTED' });
    expect(started.isSubmitting).toBe(true);
    expect(started.error).toBeNull();

    const failed = authReducer(started, {
      type: 'SIGN_IN_FAILED',
      message: 'Invalid credentials.',
    });
    expect(failed).toMatchObject({
      status: 'unauthenticated',
      isSubmitting: false,
      error: 'Invalid credentials.',
    });

    const succeeded = authReducer(started, {
      type: 'SIGN_IN_SUCCEEDED',
      user: makeUser(),
    });
    expect(succeeded).toMatchObject({ status: 'authenticated', isSubmitting: false });
  });

  it('clears the session after sign-out', () => {
    const state = authReducer(authenticatedState(), { type: 'SIGN_OUT_STARTED' });
    expect(state.isSubmitting).toBe(true);

    expect(authReducer(state, { type: 'SIGN_OUT_SUCCEEDED' })).toEqual({
      status: 'unauthenticated',
      user: null,
      error: null,
      isSubmitting: false,
    });
  });

  it('keeps the user when sign-out fails', () => {
    const state = authReducer(authenticatedState(), {
      type: 'SIGN_OUT_FAILED',
      message: 'Storage failed.',
    });

    expect(state.status).toBe('authenticated');
    expect(state.user).not.toBeNull();
    expect(state.error).toBe('Storage failed.');
  });

  it('clears errors', () => {
    const state = authReducer(initialAuthState, {
      type: 'RESTORE_FAILED',
      message: 'Restore failed.',
    });

    expect(authReducer(state, { type: 'CLEAR_ERROR' }).error).toBeNull();
  });
});
