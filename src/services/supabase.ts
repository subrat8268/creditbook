import { secureStorage } from "@/src/lib/secureStorage";
import { createClient } from "@supabase/supabase-js";
import * as syncQueue from '@/src/lib/syncQueue';
import type { QueuedMutation } from '@/src/lib/syncQueue';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY as string;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: secureStorage, // JWT persisted in the OS secure enclave / Keychain
    autoRefreshToken: true, // silently refresh before expiry
    persistSession: true, // survive Metro hot-reloads
    detectSessionInUrl: false, // not a web browser
  },
});

// ═══════════════════════════════════════════════════════════════════════════════
// OFFLINE-FIRST ARCHITECTURE — Network Error Detection & Queue Wrapper
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Detect if an error is a network-related error (offline, timeout, DNS failure).
 * Used to determine whether to queue a mutation for later replay.
 * 
 * @param error - Error object from Supabase or fetch
 * @returns true if error indicates network failure
 */
export function isNetworkError(error: any): boolean {
  if (!error) return false;

  // Check error message patterns
  const message = error.message?.toLowerCase() || '';
  const networkPatterns = [
    'network request failed',
    'network error',
    'failed to fetch',
    'timeout',
    'no internet',
    'offline',
    'enotfound', // DNS resolution failed
    'econnrefused', // Connection refused
    'etimedout', // Connection timed out
  ];

  if (networkPatterns.some(pattern => message.includes(pattern))) {
    return true;
  }

  // Check error code (fetch API error codes)
  if (error.code === 'NETWORK_ERROR' || error.code === 'ENOTFOUND') {
    return true;
  }

  // Check if error is a TypeError (common for network failures in fetch)
  if (error instanceof TypeError && message.includes('failed')) {
    return true;
  }

  return false;
}

/**
 * Execute a mutation with offline queue fallback.
 * If the mutation succeeds → return result immediately.
 * If network error → queue mutation to MMKV → return success (optimistic).
 * If other error → re-throw (validation errors, auth errors, etc.).
 * 
 * @param mutationFn - Async function that performs the mutation (API call)
 * @param queuePayload - Metadata for queueing (entity, operation, payload)
 * @returns Result from mutationFn if online, or optimistic success if queued
 * 
 * @example
 * ```ts
 * await executeWithOfflineQueue(
 *   () => supabase.from('orders').insert([orderData]),
 *   { entity: 'order', operation: 'CREATE', payload: orderData }
 * );
 * ```
 */
export async function executeWithOfflineQueue<T>(
  mutationFn: () => Promise<T>,
  queuePayload: Omit<QueuedMutation, 'id' | 'timestamp' | 'retryCount'>
): Promise<T> {
  try {
    // Attempt to execute mutation
    const result = await mutationFn();
    return result;
  } catch (error) {
    // If network error → queue for later replay
    if (isNetworkError(error)) {
      console.log(`[OfflineQueue] Network error detected, queueing ${queuePayload.operation} ${queuePayload.entity}`);
      syncQueue.enqueue(queuePayload);
      
      // Return optimistic success (mutation will replay when online)
      // Cast to T to satisfy TypeScript (caller expects result type)
      return {} as T;
    }

    // If other error (validation, auth, etc.) → re-throw
    console.error(`[OfflineQueue] Non-network error in ${queuePayload.operation} ${queuePayload.entity}:`, error);
    throw error;
  }
}

