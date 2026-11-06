import { render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';

import { ErrorBoundary } from '@/components/common/ErrorBoundary';

function ThrowingChild(): never {
  throw new Error('render failure');
}

describe('ErrorBoundary', () => {
  let consoleError: jest.SpyInstance;

  beforeEach(() => {
    consoleError = jest.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    consoleError.mockRestore();
  });

  it('renders the default fallback and reports the error', async () => {
    const onError = jest.fn();

    await render(
      <ErrorBoundary onError={onError}>
        <ThrowingChild />
      </ErrorBoundary>,
    );

    expect(screen.getByText('Something went wrong.')).toBeTruthy();
    expect(onError).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'render failure' }),
      expect.anything(),
    );
  });

  it('renders a custom fallback', async () => {
    await render(
      <ErrorBoundary fallback={<Text>Custom fallback</Text>}>
        <ThrowingChild />
      </ErrorBoundary>,
    );

    expect(screen.getByText('Custom fallback')).toBeTruthy();
  });
});
