import { describe, expect, it } from 'vitest';

import { createApiClient } from '@/services/api/api-client';
import { parseServerErrors } from '@/services/api/error-payload';

describe('parseServerErrors', () => {
  it('reads a list of error strings', () => {
    expect(parseServerErrors({ status: false, errors: ['Bad token', '  Bad   token '] })).toEqual({
      messages: ['Bad token'],
      fields: {},
    });
  });

  it('reads field errors and keeps the first message per field', () => {
    const result = parseServerErrors({
      errors: { email: ['Already taken', 'Invalid'], password: ['Too short'] },
    });

    expect(result.fields).toEqual({ email: 'Already taken', password: 'Too short' });
    expect(result.messages).toEqual(['Already taken', 'Invalid', 'Too short']);
  });

  it('falls back to message or error and ignores non-string values', () => {
    expect(parseServerErrors({ message: 'Nope' }).messages).toEqual(['Nope']);
    expect(parseServerErrors({ error: 'Down' }).messages).toEqual(['Down']);
    expect(parseServerErrors({ errors: [1, null, {}] }).messages).toEqual([]);
    expect(parseServerErrors('oops')).toEqual({ messages: [], fields: {} });
  });

  it('caps the number and length of messages', () => {
    const long = 'x'.repeat(500);
    const result = parseServerErrors({ errors: [long, 'a', 'b', 'c', 'd', 'e'] });

    expect(result.messages).toHaveLength(4);
    expect(result.messages[0]).toHaveLength(200);
  });
});

describe('api client error bodies', () => {
  const clientFor = (status: number, body: unknown) =>
    createApiClient({
      baseUrl: 'https://api.example.com',
      fetchImpl: (async () =>
        new Response(JSON.stringify(body), { status })) as unknown as typeof fetch,
    });

  it('attaches server messages to 4xx errors', async () => {
    const client = clientFor(422, { errors: { email: ['Taken'] } });

    await expect(client.request({ path: '/x', method: 'POST', body: {} })).rejects.toMatchObject({
      status: 422,
      serverMessages: ['Taken'],
      fieldErrors: { email: 'Taken' },
    });
  });

  it('never surfaces server messages for 5xx errors', async () => {
    const client = clientFor(500, { message: 'SQLSTATE[HY000] stack trace' });

    await expect(client.request({ path: '/x' })).rejects.toMatchObject({
      status: 500,
      serverMessages: [],
    });
  });
});
