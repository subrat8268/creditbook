/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * KREDBOOK OFFLINE-FIRST ARCHITECTURE — React Query MMKV Persister
 * ═══════════════════════════════════════════════════════════════════════════════
 * Adapter that bridges TanStack Query's persist API to MMKV storage.
 * This enables React Query cache to persist across app restarts.
 * 
 * Architecture: ARCHITECTURE.md §4.1 Read Strategy
 * Package: @tanstack/react-query-persist-client
 */

import { createMMKV, type MMKV } from 'react-native-mmkv';
import type { PersistedClient, Persister } from '@tanstack/react-query-persist-client';

// ═══════════════════════════════════════════════════════════════════════════════
// MMKV STORAGE
// ═══════════════════════════════════════════════════════════════════════════════

const storage: MMKV = createMMKV({
  id: 'kredbook-react-query-cache',
});

const CACHE_KEY = 'react_query_cache';

// ═══════════════════════════════════════════════════════════════════════════════
// PERSISTER API
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Create a TanStack Query persister that uses MMKV as the storage backend.
 * 
 * @returns Persister object compatible with PersistQueryClientProvider
 */
export function createMMKVPersister(): Persister {
  return {
    /**
     * Persist the entire React Query cache to MMKV.
     * Called automatically when cache updates.
     * 
     * @param client - The serialized query client state
     */
    persistClient: async (client: PersistedClient) => {
      try {
        storage.set(CACHE_KEY, JSON.stringify(client));
        console.log('[MMKVPersister] Cache persisted successfully');
      } catch (error) {
        console.error('[MMKVPersister] Failed to persist cache:', error);
      }
    },

    /**
     * Restore the React Query cache from MMKV.
     * Called on app startup (cold boot).
     * 
     * @returns The cached query client state, or undefined if no cache exists
     */
    restoreClient: async (): Promise<PersistedClient | undefined> => {
      try {
        const cached = storage.getString(CACHE_KEY);
        if (!cached) {
          console.log('[MMKVPersister] No cached data found');
          return undefined;
        }

        const parsed = JSON.parse(cached) as PersistedClient;
        console.log('[MMKVPersister] Cache restored successfully');
        return parsed;
      } catch (error) {
        console.error('[MMKVPersister] Failed to restore cache:', error);
        return undefined;
      }
    },

    /**
     * Remove the React Query cache from MMKV.
     * Called on logout or manual cache clear.
     */
    removeClient: async () => {
      try {
        storage.remove(CACHE_KEY);
        console.log('[MMKVPersister] Cache removed successfully');
      } catch (error) {
        console.error('[MMKVPersister] Failed to remove cache:', error);
      }
    },
  };
}

/**
 * Get the raw MMKV storage instance for debugging.
 * NOT exposed in production.
 */
export const __DEV_ONLY__ = {
  storage,
  CACHE_KEY,
};
