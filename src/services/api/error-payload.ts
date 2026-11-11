export interface ServerErrors {
  messages: string[];
  fields: Record<string, string>;
}

const MAX_MESSAGES = 4;
const MAX_MESSAGE_LENGTH = 200;

function clean(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const text = value.replace(/\s+/g, ' ').trim();
  return text ? text.slice(0, MAX_MESSAGE_LENGTH) : null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function stringsFrom(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map(clean).filter((entry): entry is string => entry !== null);
  }
  const single = clean(value);
  return single ? [single] : [];
}

/**
 * Reads the error messages a Sunhub API response carries. The backend uses `errors` as either a list
 * of strings or a map of field name to list of strings, plus an optional `message`/`error` string.
 * Only short plain strings are kept, so the result is safe to show to the user.
 */
export function parseServerErrors(payload: unknown): ServerErrors {
  const result: ServerErrors = { messages: [], fields: {} };
  if (!isRecord(payload)) return result;

  const { errors } = payload;
  if (Array.isArray(errors)) {
    result.messages.push(...stringsFrom(errors));
  } else if (isRecord(errors)) {
    for (const [field, value] of Object.entries(errors)) {
      const [first, ...rest] = stringsFrom(value);
      if (first) {
        result.fields[field] = first;
        result.messages.push(first, ...rest);
      }
    }
  }

  if (!result.messages.length) {
    result.messages.push(...stringsFrom(payload.message), ...stringsFrom(payload.error));
  }

  result.messages = Array.from(new Set(result.messages)).slice(0, MAX_MESSAGES);
  return result;
}
