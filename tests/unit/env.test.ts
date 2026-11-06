import { ConfigError, parseEnv } from '@/config/envSchema';

describe('parseEnv', () => {
  it('applies development defaults', () => {
    expect(parseEnv({ apiBaseUrl: 'https://api.example.test' })).toEqual({
      appEnv: 'development',
      isProduction: false,
      apiBaseUrl: 'https://api.example.test',
      apiVersion: '/v1',
      requestTimeoutMs: 60000,
      logLevel: 'warn',
    });
  });

  it('normalizes environment, URL, version, timeout, and log level', () => {
    expect(
      parseEnv({
        appEnv: ' PRODUCTION ',
        apiBaseUrl: 'https://api.example.test/',
        apiVersion: 'v2/',
        requestTimeoutMs: '2500',
        logLevel: 'DEBUG',
      }),
    ).toEqual({
      appEnv: 'production',
      isProduction: true,
      apiBaseUrl: 'https://api.example.test',
      apiVersion: '/v2',
      requestTimeoutMs: 2500,
      logLevel: 'debug',
    });
  });

  it('requires an API base URL', () => {
    expect(() => parseEnv({})).toThrow(ConfigError);
    expect(() => parseEnv({ apiBaseUrl: '   ' })).toThrow('EXPO_PUBLIC_API_BASE_URL is required.');
  });

  it('rejects invalid values', () => {
    expect(() => parseEnv({ apiBaseUrl: 'ftp://api.example.test' })).toThrow(ConfigError);
    expect(() => parseEnv({ apiBaseUrl: 'https://api.example.test', appEnv: 'qa' })).toThrow(
      ConfigError,
    );
    expect(() =>
      parseEnv({ apiBaseUrl: 'https://api.example.test', requestTimeoutMs: '0' }),
    ).toThrow(ConfigError);
    expect(() => parseEnv({ apiBaseUrl: 'https://api.example.test', logLevel: 'verbose' })).toThrow(
      ConfigError,
    );
  });
});
