/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * KREDBOOK OFFLINE-FIRST ARCHITECTURE — Mutation Queue Manager
 * ═══════════════════════════════════════════════════════════════════════════════
 * MMKV-backed FIFO queue for storing failed mutations when offline.
 * Mutations are replayed in order when network connectivity returns.
 * 
 * Architecture: ARCHITECTURE.md §4.2 Write Strategy
 * Design System: design-system.md §4 System States & Sync Tokens
 */

import { createMMKV, type MMKV } from 'react-native-mmkv';
import uuid from 'react-native-uuid';

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export type MutationOperation = 'CREATE' | 'UPDATE' | 'DELETE';

export type MutationEntity = 
  | 'order' 
  | 'customer' 
  | 'payment' 
  | 'product' 
  | 'supplier' 
  | 'delivery'
  | 'payment_made';

export interface QueuedMutation {
  id: string;                           // UUID
  operation: MutationOperation;         // CREATE | UPDATE | DELETE
  entity: MutationEntity;               // Table/resource name
  payload: Record<string, any>;         // API request payload
  timestamp: string;                    // ISO 8601 datetime
  retryCount: number;                   // Number of sync attempts (max 3)
}

// ═══════════════════════════════════════════════════════════════════════════════
// MMKV STORAGE
// ═══════════════════════════════════════════════════════════════════════════════

const storage = createMMKV({
  id: 'kredbook-sync-queue',
  encryptionKey: 'kredbook-offline-queue-v1', // Basic encryption for queue data
});

const QUEUE_KEY = 'mutation_queue';
const MAX_QUEUE_SIZE = 100; // Prevent unbounded growth

// ═══════════════════════════════════════════════════════════════════════════════
// QUEUE OPERATIONS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Read the current queue from MMKV storage.
 * Returns empty array if queue doesn't exist.
 */
function readQueue(): QueuedMutation[] {
  try {
    const raw = storage.getString(QUEUE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as QueuedMutation[];
  } catch (error) {
    console.error('[SyncQueue] Failed to read queue:', error);
    return [];
  }
}

/**
 * Write the queue to MMKV storage.
 * Synchronous operation - no await needed.
 */
function writeQueue(queue: QueuedMutation[]): void {
  try {
    storage.set(QUEUE_KEY, JSON.stringify(queue));
  } catch (error) {
    console.error('[SyncQueue] Failed to write queue:', error);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// PUBLIC API
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Add a mutation to the queue (FIFO).
 * Called when a mutation fails due to network error.
 * 
 * @param mutation - Partial mutation (id and timestamp will be auto-generated)
 * @returns The full queued mutation with generated ID
 */
export function enqueue(
  mutation: Omit<QueuedMutation, 'id' | 'timestamp' | 'retryCount'>
): QueuedMutation {
  const queue = readQueue();
  
  // Prevent queue from growing indefinitely
  if (queue.length >= MAX_QUEUE_SIZE) {
    console.warn(
      `[SyncQueue] Queue size limit reached (${MAX_QUEUE_SIZE}). Dropping oldest mutation.`
    );
    queue.shift(); // Remove oldest (FIFO)
  }

  const fullMutation: QueuedMutation = {
    ...mutation,
    id: uuid.v4() as string,
    timestamp: new Date().toISOString(),
    retryCount: 0,
  };

  queue.push(fullMutation);
  writeQueue(queue);

  console.log(
    `[SyncQueue] Enqueued ${mutation.operation} ${mutation.entity} (queue size: ${queue.length})`
  );

  return fullMutation;
}

/**
 * Remove the oldest mutation from the queue (FIFO).
 * Called after successful sync or after max retry attempts.
 * 
 * @returns The dequeued mutation, or undefined if queue is empty
 */
export function dequeue(): QueuedMutation | undefined {
  const queue = readQueue();
  if (queue.length === 0) return undefined;

  const mutation = queue.shift()!; // Remove first item (FIFO)
  writeQueue(queue);

  console.log(
    `[SyncQueue] Dequeued ${mutation.operation} ${mutation.entity} (remaining: ${queue.length})`
  );

  return mutation;
}

/**
 * Remove a specific mutation by ID.
 * Used when a mutation succeeds during batch replay.
 * 
 * @param id - UUID of the mutation to remove
 */
export function remove(id: string): void {
  const queue = readQueue();
  const filtered = queue.filter((m) => m.id !== id);
  
  if (filtered.length === queue.length) {
    console.warn(`[SyncQueue] Mutation ${id} not found in queue`);
    return;
  }

  writeQueue(filtered);
  console.log(`[SyncQueue] Removed mutation ${id} (remaining: ${filtered.length})`);
}

/**
 * Increment retry count for a mutation and re-enqueue it.
 * If retry count exceeds 3, the mutation is dropped.
 * 
 * @param mutation - The mutation that failed to sync
 * @returns true if re-enqueued, false if dropped (max retries exceeded)
 */
export function incrementRetry(mutation: QueuedMutation): boolean {
  const queue = readQueue();
  const index = queue.findIndex((m) => m.id === mutation.id);

  if (index === -1) {
    console.warn(`[SyncQueue] Mutation ${mutation.id} not found for retry increment`);
    return false;
  }

  const updatedMutation = { ...mutation, retryCount: mutation.retryCount + 1 };

  if (updatedMutation.retryCount >= 3) {
    // Max retries exceeded - remove from queue
    queue.splice(index, 1);
    writeQueue(queue);
    console.warn(
      `[SyncQueue] Max retries (3) exceeded for ${mutation.operation} ${mutation.entity}. Dropping mutation.`
    );
    return false;
  }

  // Re-enqueue with incremented retry count
  queue[index] = updatedMutation;
  writeQueue(queue);
  console.log(
    `[SyncQueue] Retry ${updatedMutation.retryCount}/3 for ${mutation.operation} ${mutation.entity}`
  );

  return true;
}

/**
 * Get all queued mutations (read-only).
 * Used by SyncStatusBanner to show queue length.
 * 
 * @returns Array of all queued mutations (oldest first)
 */
export function list(): QueuedMutation[] {
  return readQueue();
}

/**
 * Get the current queue size.
 * 
 * @returns Number of mutations in the queue
 */
export function size(): number {
  return readQueue().length;
}

/**
 * Clear the entire queue.
 * Called on user logout or manual "Clear Queue" action.
 */
export function clear(): void {
  storage.remove(QUEUE_KEY);
  console.log('[SyncQueue] Queue cleared');
}

/**
 * Check if the queue is empty.
 * 
 * @returns true if queue has no mutations
 */
export function isEmpty(): boolean {
  return readQueue().length === 0;
}

// ═══════════════════════════════════════════════════════════════════════════════
// DEBUG UTILITIES
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Get queue statistics for debugging.
 * 
 * @returns Object with queue stats
 */
export function getStats() {
  const queue = readQueue();
  return {
    size: queue.length,
    oldestTimestamp: queue[0]?.timestamp,
    newestTimestamp: queue[queue.length - 1]?.timestamp,
    operations: queue.reduce((acc, m) => {
      acc[m.operation] = (acc[m.operation] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    entities: queue.reduce((acc, m) => {
      acc[m.entity] = (acc[m.entity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
  };
}

/**
 * Export for testing/debugging.
 * NOT exposed in production - only for dev console access.
 */
export const __DEV_ONLY__ = {
  readQueue,
  writeQueue,
  storage,
};
