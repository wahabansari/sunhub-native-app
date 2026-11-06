import { buildApiUrl, createApiClient } from '@/services/api/client';

function jsonResponse(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    text: async () => (typeof body === 'string' ? body : JSON.stringify(body)),
  } as Response;
}

describe('API client', () => {
  it('builds URLs without duplicate slashes', () => {
    expect(buildApiUrl('https://api.example.test/', '/v1/', '/client/login')).toBe(
      'https://api.example.test/v1/client/login',
    );
    expect(buildApiUrl('https://api.example.test', '', 'client/logout')).toBe(
      'https://api.example.test/client/logout',
    );
  });

  it('sends JSON, auth, and parses the response', async () => {
    const fetchImpl = jest.fn(async (_input: RequestInfo | URL, _init?: RequestInit) =>
      jsonResponse({ status: true }),
    );
    const client = createApiClient({
      baseUrl: 'https://api.example.test',
      apiVersion: '/v1',
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });

    const result = await client.request<{ status: boolean }>({
      method: 'POST',
      path: '/client/login',
      token: 'access-token',
      body: { email: 'person@example.test' },
    });

    expect(result).toEqual({ status: true });
    expect(fetchImpl).toHaveBeenCalledWith(
      'https://api.example.test/v1/client/login',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ email: 'person@example.test' }),
        headers: expect.objectContaining({
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: 'Bearer access-token',
        }),
      }),
    );
  });

  it('maps HTTP failures without exposing the response body', async () => {
    const fetchImpl = jest.fn(async (_input: RequestInfo | URL, _init?: RequestInit) =>
      jsonResponse({ message: 'internal detail' }, 503),
    );
    const client = createApiClient({
      baseUrl: 'https://api.example.test',
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });

    await expect(client.request({ path: '/client/profile' })).rejects.toMatchObject({
      code: 'HTTP',
      status: 503,
      userMessage: 'The server is unavailable right now. Please try again later.',
    });
  });

  it('maps invalid JSON to a parse error', async () => {
    const fetchImpl = jest.fn(async (_input: RequestInfo | URL, _init?: RequestInit) =>
      jsonResponse('not-json'),
    );
    const client = createApiClient({
      baseUrl: 'https://api.example.test',
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });

    await expect(client.request({ path: '/client/profile' })).rejects.toMatchObject({
      code: 'PARSE',
    });
  });

  it('times out slow requests', async () => {
    const fetchImpl = jest.fn(
      (_input: RequestInfo | URL, init?: RequestInit) =>
        new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener('abort', () => reject(new Error('aborted')));
        }),
    );
    const client = createApiClient({
      baseUrl: 'https://api.example.test',
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });

    await expect(client.request({ path: '/slow', timeoutMs: 10 })).rejects.toMatchObject({
      code: 'TIMEOUT',
    });
  });

  it('maps external cancellation to an aborted error', async () => {
    const controller = new AbortController();
    const fetchImpl = jest.fn(
      (_input: RequestInfo | URL, init?: RequestInit) =>
        new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener('abort', () => reject(new Error('aborted')));
          controller.abort();
        }),
    );
    const client = createApiClient({
      baseUrl: 'https://api.example.test',
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });

    await expect(
      client.request({ path: '/slow', signal: controller.signal }),
    ).rejects.toMatchObject({ code: 'ABORTED' });
  });
});
