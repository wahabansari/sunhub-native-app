import { randomUUID } from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';

import { GUEST_OWNER_KEY } from '@/constants/storage';
import { AppError } from '@/errors/app-error';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export interface GuestOwnerStore {
  /** The id that owns this device's guest cart, created on first use. */
  getOrCreate(): Promise<string>;
  /** The existing id, or null when this device never had a guest cart. */
  peek(): Promise<string | null>;
  clear(): Promise<void>;
}

function storageError(message: string): AppError {
  return new AppError('STORAGE', message, {
    userMessage: 'Could not access secure storage on this device.',
  });
}

/**
 * The guest cart is keyed by a random id kept in secure storage. Anyone holding the id can read
 * the cart, so it is never logged, shown, or placed in a URL; a malformed stored value is replaced.
 */
export function createGuestOwnerStore(): GuestOwnerStore {
  async function peek(): Promise<string | null> {
    try {
      const value = await SecureStore.getItemAsync(GUEST_OWNER_KEY);
      return value && UUID_PATTERN.test(value) ? value : null;
    } catch {
      throw storageError('Failed to read the guest cart id');
    }
  }

  return {
    peek,

    async getOrCreate(): Promise<string> {
      const existing = await peek();
      if (existing) return existing;

      const created = randomUUID();
      try {
        await SecureStore.setItemAsync(GUEST_OWNER_KEY, created);
      } catch {
        throw storageError('Failed to save the guest cart id');
      }
      return created;
    },

    async clear(): Promise<void> {
      try {
        await SecureStore.deleteItemAsync(GUEST_OWNER_KEY);
      } catch {
        throw storageError('Failed to clear the guest cart id');
      }
    },
  };
}
