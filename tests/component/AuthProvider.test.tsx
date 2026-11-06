import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { Pressable, Text, View } from 'react-native';

import { AuthProvider } from '@/contexts/auth';
import { useAuth } from '@/hooks/useAuth';
import { AppError } from '@/errors/AppError';

import { createFakeAuthService, makeUser } from '../fixtures/auth';

function Probe() {
  const { state, signIn, signOut, clearError } = useAuth();

  return (
    <View>
      <Text>{`status:${state.status}`}</Text>
      <Text>{`email:${state.user?.email ?? 'none'}`}</Text>
      <Text>{`error:${state.error ?? 'none'}`}</Text>
      <Text>{`submitting:${String(state.isSubmitting)}`}</Text>
      <Pressable onPress={() => void signIn({ email: 'person@example.test', password: 'x' })}>
        <Text>sign-in</Text>
      </Pressable>
      <Pressable onPress={() => void signOut()}>
        <Text>sign-out</Text>
      </Pressable>
      <Pressable onPress={() => clearError()}>
        <Text>clear-error</Text>
      </Pressable>
    </View>
  );
}

async function renderProvider(service = createFakeAuthService()) {
  await render(
    <AuthProvider service={service}>
      <Probe />
    </AuthProvider>,
  );

  return service;
}

describe('AuthProvider', () => {
  it('restores an existing session', async () => {
    const service = createFakeAuthService({
      restoreSession: jest.fn(async () => makeUser()),
    });

    await renderProvider(service);

    expect(await screen.findByText('status:authenticated')).toBeTruthy();
    expect(screen.getByText('email:tester@example.test')).toBeTruthy();
  });

  it('reports a signed-out state when no session exists', async () => {
    await renderProvider();

    expect(await screen.findByText('status:unauthenticated')).toBeTruthy();
    expect(screen.getByText('email:none')).toBeTruthy();
  });

  it('reports restore failures', async () => {
    const service = createFakeAuthService({
      restoreSession: jest.fn(async () => {
        throw new AppError('NETWORK', 'offline', {
          userMessage: 'Unable to restore your session.',
        });
      }),
    });

    await renderProvider(service);

    expect(await screen.findByText('error:Unable to restore your session.')).toBeTruthy();
  });

  it('signs in and exposes the authenticated user', async () => {
    const service = createFakeAuthService({
      signIn: jest.fn(async () => makeUser({ email: 'signed-in@example.test' })),
    });

    await renderProvider(service);
    await screen.findByText('status:unauthenticated');

    await fireEvent.press(screen.getByText('sign-in'));

    expect(await screen.findByText('email:signed-in@example.test')).toBeTruthy();
    expect(service.signIn).toHaveBeenCalledWith({
      email: 'person@example.test',
      password: 'x',
    });
  });

  it('displays sign-in failures and can clear them', async () => {
    const service = createFakeAuthService({
      signIn: jest.fn(async () => {
        throw new AppError('AUTH_FAILED', 'rejected', {
          userMessage: 'Invalid email or password.',
        });
      }),
    });

    await renderProvider(service);
    await screen.findByText('status:unauthenticated');

    await fireEvent.press(screen.getByText('sign-in'));
    expect(await screen.findByText('error:Invalid email or password.')).toBeTruthy();

    await fireEvent.press(screen.getByText('clear-error'));
    await waitFor(() => expect(screen.getByText('error:none')).toBeTruthy());
  });

  it('signs out and clears the user', async () => {
    const service = createFakeAuthService({
      restoreSession: jest.fn(async () => makeUser()),
    });

    await renderProvider(service);
    await screen.findByText('status:authenticated');

    await fireEvent.press(screen.getByText('sign-out'));

    expect(await screen.findByText('status:unauthenticated')).toBeTruthy();
    expect(service.signOut).toHaveBeenCalledTimes(1);
  });

  it('keeps the user visible when sign-out fails', async () => {
    const service = createFakeAuthService({
      restoreSession: jest.fn(async () => makeUser()),
      signOut: jest.fn(async () => {
        throw new AppError('STORAGE', 'clear failed', {
          userMessage: 'Unable to clear your session.',
        });
      }),
    });

    await renderProvider(service);
    await screen.findByText('status:authenticated');

    await fireEvent.press(screen.getByText('sign-out'));

    expect(await screen.findByText('error:Unable to clear your session.')).toBeTruthy();
    expect(screen.getByText('status:authenticated')).toBeTruthy();
  });
});
