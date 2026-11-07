import * as SecureStore from 'expo-secure-store';

import { AUTH_SESSION_KEY } from '@/constants/storage';
import { AppError } from '@/errors/app-error';
import type { StoredSession } from '@/types/auth';
import { asNonEmptyString, asStringArray, isRecord } from '@/utils/guards';

export interface SessionStorage {
  read(): Promise<StoredSession | null>;
  write(session: StoredSession): Promise<void>;
  clear(): Promise<void>;
}

function parseStoredSession(raw: string | null): StoredSession | null {
  if (!raw) {
    return null;
  }

  try {
    const parsed: unknown = JSON.parse(raw);

    if (!isRecord(parsed)) {
      return null;
    }

    const accessToken = asNonEmptyString(parsed.accessToken);

    if (!accessToken) {
      return null;
    }

    return {
      accessToken,
      roles: asStringArray(parsed.roles),
    };
  } catch {
    return null;
  }
}

/**
 * Persists the access token and cached role names in the platform secure store.
 * Profile details are never persisted; they are re-fetched on restore.
 */
export function createSessionStorage(key: string = AUTH_SESSION_KEY): SessionStorage {
  return {
    async read() {
      try {
        const raw = await SecureStore.getItemAsync(key);
        const session = parseStoredSession(raw);

        if (raw && !session) {
          try {
            await SecureStore.deleteItemAsync(key);
          } catch {
            // Best-effort cleanup; the invalid value is treated as signed out.
          }
        }

        return session;
      } catch {
        throw new AppError('STORAGE', 'Unable to read the stored session', {
          userMessage: 'Unable to access secure storage on this device.',
        });
      }
    },

    async write(session: StoredSession) {
      try {
        await SecureStore.setItemAsync(key, JSON.stringify(session));
      } catch {
        throw new AppError('STORAGE', 'Unable to write the session to secure storage', {
          userMessage: 'Unable to save your session on this device.',
        });
      }
    },

    async clear() {
      try {
        await SecureStore.deleteItemAsync(key);
      } catch {
        throw new AppError('STORAGE', 'Unable to clear the stored session', {
          userMessage: 'Unable to clear your session on this device.',
        });
      }
    },
  };
}
