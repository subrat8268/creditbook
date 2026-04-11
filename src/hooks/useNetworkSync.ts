/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * KREDBOOK OFFLINE-FIRST ARCHITECTURE — Network Sync Hook
 * ═══════════════════════════════════════════════════════════════════════════════
 * Listens for network connectivity changes and automatically replays queued
 * mutations when connection is restored.
 * 
 * Architecture: ARCHITECTURE.md §4.2 Write Strategy
 * Flow:
 *   1. NetInfo detects online → start replay
 *   2. Dequeue mutation (FIFO) → call API function
 *   3. If success → invalidate queries → remove from queue
 *   4. If failure → increment retry → re-enqueue or drop
 *   5. Repeat until queue empty → set status "synced"
 */

import NetInfo, { type NetInfoState } from '@react-native-community/netinfo';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useState } from 'react';
import * as syncQueue from '@/src/lib/syncQueue';
import { getOrCreateSyncQueueKey } from '@/src/lib/syncQueueStorage';
import type { QueuedMutation } from '@/src/lib/syncQueue';
import { createOrder } from '@/src/api/orders';
import { recordPayment } from '@/src/api/orders';
import { addPerson } from '@/src/api/customers';
import { addProduct, updateProduct, deleteProduct } from '@/src/api/products';
import { addSupplier, recordDelivery, recordPaymentMade } from '@/src/api/suppliers';

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export type SyncStatus = 'offline' | 'syncing' | 'synced';

interface UseNetworkSyncReturn {
  /** Current sync status (offline/syncing/synced) */
  syncStatus: SyncStatus;
  /** Number of mutations in queue */
  queueLength: number;
  /** Whether device is connected to internet */
  isConnected: boolean;
  /** Whether last sync had failures */
  hasSyncError: boolean;
  /** Manually trigger sync (for "Retry" button) */
  triggerSync: () => Promise<void>;
}

// ═══════════════════════════════════════════════════════════════════════════════
// MUTATION REPLAY LOGIC
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Replay a single queued mutation by calling the appropriate API function.
 * This is where we map mutation entity types to actual API calls.
 * 
 * @param mutation - The queued mutation to replay
 * @param queryClient - TanStack Query client for cache invalidation
 * @returns true if mutation succeeded, false if failed
 */
async function replayMutation(
  mutation: QueuedMutation,
  queryClient: ReturnType<typeof useQueryClient>
): Promise<boolean> {
  const { entity, operation, payload } = mutation;

  try {
    console.log(`[NetworkSync] Replaying ${operation} ${entity}...`);

    // ── Order Mutations ──────────────────────────────────────────────────
    if (entity === 'order' && operation === 'CREATE') {
      const vendorId = payload.vendorId || payload.vendor_id;
      const customerId = payload.customerId || payload.customer_id;
      if (!vendorId || !customerId) throw new Error('Missing vendorId/customerId in order payload');
      
      await createOrder(
        vendorId,
        customerId,
        payload.items,
        payload.amountPaid || payload.amount_paid || 0,
        payload.paymentMode || payload.payment_mode,
        payload.loadingCharge || payload.loading_charge || 0,
        payload.taxPercent || payload.tax_percent || 0,
        payload.billNumberPrefix || payload.bill_number_prefix || 'INV'
      );
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      return true;
    }

    // ── Payment Mutations ────────────────────────────────────────────────
    if (entity === 'payment' && operation === 'CREATE') {
      const vendorId = payload.vendorId || payload.vendor_id;
      const orderId = payload.orderId || payload.order_id;
      const amount = payload.amount;
      const paymentMode = payload.paymentMode || payload.payment_mode;
      const markFull = payload.markFull || payload.mark_full || false;
      const notes = payload.notes;
      
      if (!vendorId || !orderId) throw new Error('Missing vendorId/orderId in payment payload');
      
      await recordPayment(orderId, vendorId, amount, paymentMode, markFull, notes);
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order', orderId] });
      queryClient.invalidateQueries({ queryKey: ['payments', orderId] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      return true;
    }

    // ── Person Mutations ───────────────────────────────────────────────
    if (entity === 'customer' && operation === 'CREATE') {
      const vendorId = payload.vendorId || payload.vendor_id;
      if (!vendorId) throw new Error('Missing vendorId in customer payload');
      
      // Remove vendorId/vendor_id from payload and pass the rest as customer data
      const { vendorId: _, vendor_id: __, ...customerData } = payload;
      await addPerson(vendorId, customerData as any);
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      return true;
    }

    // ── Product Mutations ────────────────────────────────────────────────
    if (entity === 'product') {
      const vendorId = payload.vendorId || payload.vendor_id;
      const productId = payload.productId || payload.id;

      if (operation === 'CREATE') {
        if (!vendorId) throw new Error('Missing vendorId in product payload');
        const { vendorId: _, vendor_id: __, ...productData } = payload;
        await addProduct(vendorId, productData as any);
        queryClient.invalidateQueries({ queryKey: ['products'] });
        return true;
      }

      if (operation === 'UPDATE') {
        if (!productId) throw new Error('Missing productId in product payload');
        await updateProduct(productId, payload as any);
        queryClient.invalidateQueries({ queryKey: ['products'] });
        return true;
      }

      if (operation === 'DELETE') {
        if (!productId) throw new Error('Missing productId in product payload');
        await deleteProduct(productId);
        queryClient.invalidateQueries({ queryKey: ['products'] });
        return true;
      }
    }

    // ── Supplier Mutations ───────────────────────────────────────────────
    if (entity === 'supplier' && operation === 'CREATE') {
      const vendorId = payload.vendorId || payload.vendor_id;
      if (!vendorId) throw new Error('Missing vendorId in supplier payload');
      
      const { vendorId: _, vendor_id: __, ...supplierData } = payload;
      await addSupplier(vendorId, supplierData as any);
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      return true;
    }

    // ── Delivery Mutations ───────────────────────────────────────────────
    if (entity === 'delivery' && operation === 'CREATE') {
      const vendorId = payload.vendorId || payload.vendor_id;
      const supplierId = payload.supplierId || payload.supplier_id;
      if (!vendorId || !supplierId) throw new Error('Missing vendorId/supplierId in delivery payload');
      
      const { vendorId: _, vendor_id: __, supplierId: ___, supplier_id: ____, ...deliveryData } = payload;
      await recordDelivery(vendorId, supplierId, deliveryData as any);
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      queryClient.invalidateQueries({ queryKey: ['supplier', supplierId] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      return true;
    }

    // ── Payment Made Mutations ───────────────────────────────────────────
    if (entity === 'payment_made' && operation === 'CREATE') {
      const vendorId = payload.vendorId || payload.vendor_id;
      const supplierId = payload.supplierId || payload.supplier_id;
      const amount = payload.amount;
      const paymentMode = payload.paymentMode || payload.payment_mode;
      const notes = payload.notes;
      
      if (!vendorId || !supplierId) throw new Error('Missing vendorId/supplierId in payment_made payload');
      
      await recordPaymentMade(vendorId, supplierId, amount, paymentMode, notes);
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      queryClient.invalidateQueries({ queryKey: ['supplier', supplierId] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      return true;
    }

    // ── Unsupported Mutation ─────────────────────────────────────────────
    console.warn(`[NetworkSync] Unknown mutation type: ${operation} ${entity}`);
    return false;

  } catch (error) {
    console.error(`[NetworkSync] Failed to replay ${operation} ${entity}:`, error);
    return false;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// SYNC HOOK
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Hook that listens for network changes and syncs queued mutations.
 * 
 * @returns {UseNetworkSyncReturn} Sync status, queue length, and trigger function
 */
export function useNetworkSync(): UseNetworkSyncReturn {
  const queryClient = useQueryClient();
  
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('offline');
  const [queueLength, setQueueLength] = useState(syncQueue.size());
  const [isConnected, setIsConnected] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [hasSyncError, setHasSyncError] = useState(false);

  useEffect(() => {
    const ensureQueueReady = async () => {
      if (syncQueue.isInitialized()) return;
      const key = await getOrCreateSyncQueueKey();
      syncQueue.initializeSyncQueue(key);
    };

    ensureQueueReady().catch((error) => {
      console.error('[NetworkSync] Failed to initialize sync queue:', error);
    });
  }, []);

  /**
   * Process the entire mutation queue (FIFO).
   * Replays each mutation sequentially until queue is empty.
   */
  const processQueue = useCallback(async () => {
    if (isSyncing) {
      console.log('[NetworkSync] Sync already in progress, skipping...');
      return;
    }

    if (!syncQueue.isInitialized()) {
      console.warn('[NetworkSync] Sync queue not initialized yet');
      return;
    }

    const queue = syncQueue.list();
    if (queue.length === 0) {
      console.log('[NetworkSync] Queue is empty, nothing to sync');
      setSyncStatus('synced');
      // Auto-dismiss "synced" status after 2 seconds
      setTimeout(() => {
        if (syncQueue.isEmpty()) {
          setSyncStatus('offline');
        }
      }, 2000);
      return;
    }

    setIsSyncing(true);
    setSyncStatus('syncing');
    console.log(`[NetworkSync] Starting sync of ${queue.length} mutations...`);

    let successCount = 0;
    let failureCount = 0;

    // Process mutations sequentially (FIFO)
    for (const mutation of queue) {
      const success = await replayMutation(mutation, queryClient);

      if (success) {
        // Mutation succeeded → remove from queue
        syncQueue.remove(mutation.id);
        successCount++;
      } else {
        // Mutation failed → increment retry count
        const shouldRetry = syncQueue.incrementRetry(mutation);
        if (!shouldRetry) {
          // Max retries exceeded → mutation dropped
          failureCount++;
        }
      }

      // Update queue length UI in real-time
      setQueueLength(syncQueue.size());
    }

    console.log(`[NetworkSync] Sync complete. Success: ${successCount}, Failed: ${failureCount}`);
    setHasSyncError(failureCount > 0);

    // Update final status
    const remainingQueue = syncQueue.list();
    if (remainingQueue.length === 0) {
      setSyncStatus('synced');
      // Auto-dismiss after 2s
      setTimeout(() => {
        if (syncQueue.isEmpty()) {
          setSyncStatus('offline');
        }
      }, 2000);
    } else {
      // Some mutations still in queue (failed retries)
      setSyncStatus('offline');
    }

    setIsSyncing(false);
  }, [isSyncing, queryClient]);

  /**
   * Manual sync trigger (for "Retry" button in UI).
   */
  const triggerSync = useCallback(async () => {
    if (!isConnected) {
      console.warn('[NetworkSync] Cannot sync while offline');
      return;
    }
    await processQueue();
  }, [isConnected, processQueue]);

  /**
   * Effect: Listen for network state changes.
   * When network returns, auto-trigger sync.
   */
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      const connected = state.isConnected === true && state.isInternetReachable === true;
      setIsConnected(connected);

      if (connected) {
        console.log('[NetworkSync] Network detected, triggering sync...');
        // Small delay to ensure connection is stable
        setTimeout(() => processQueue(), 500);
      } else {
        console.log('[NetworkSync] Offline detected');
        setSyncStatus('offline');
      }
    });

    return () => unsubscribe();
  }, [processQueue]);

  /**
   * Effect: Update queue length when it changes.
   * Useful for showing real-time count in SyncStatusBanner.
   */
  useEffect(() => {
    const interval = setInterval(() => {
      const currentSize = syncQueue.size();
      if (currentSize !== queueLength) {
        setQueueLength(currentSize);
      }
    }, 1000); // Poll every second

    return () => clearInterval(interval);
  }, [queueLength]);

  return {
    syncStatus,
    queueLength,
    isConnected,
    hasSyncError,
    triggerSync,
  };
}
