import * as SecureStore from 'expo-secure-store';

const SYNC_QUEUE_KEY = 'kredbook.syncQueue.encryptionKey.v1';
const SECURE_STORE_OPTIONS: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY,
};

function generateKey(length: number = 64): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i += 1) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function getOrCreateSyncQueueKey(): Promise<string> {
  const existing = await SecureStore.getItemAsync(SYNC_QUEUE_KEY);
  if (existing) return existing;

  const newKey = generateKey();
  await SecureStore.setItemAsync(SYNC_QUEUE_KEY, newKey, SECURE_STORE_OPTIONS);
  return newKey;
}
