/**
 * secureStorage.ts
 *
 * A Supabase-compatible storage adapter backed by expo-secure-store.
 *
 * Why chunking?
 * expo-secure-store has a 2 048-byte limit per key on iOS (Keychain).
 * Supabase stores the full session JSON (access_token + refresh_token +
 * user object) which routinely exceeds this limit. We split large values
 * into numbered chunks and reassemble them on read.
 *
 * Chunk key scheme:  <key>          – stores the total number of chunks
 *                    <key>.chunk.0  – first 1 800 bytes
 *                    <key>.chunk.1  – next 1 800 bytes, etc.
 */

import * as SecureStore from "expo-secure-store";

// iOS Keychain limit is 2 048 bytes; stay comfortably under it.
const CHUNK_SIZE = 1800;

/** Split a long string into CHUNK_SIZE pieces. */
function toChunks(value: string): string[] {
  const chunks: string[] = [];
  for (let i = 0; i < value.length; i += CHUNK_SIZE) {
    chunks.push(value.slice(i, i + CHUNK_SIZE));
  }
  return chunks;
}

export const secureStorage = {
  async getItem(key: string): Promise<string | null> {
    try {
      // Try reading as a plain (non-chunked) value first.
      const countRaw = await SecureStore.getItemAsync(key);

      // If the stored value is a numeric string it's a chunk-count marker.
      const chunkCount = countRaw !== null ? parseInt(countRaw, 10) : NaN;

      if (!isNaN(chunkCount) && chunkCount > 1) {
        // Reassemble chunked value.
        const parts: string[] = [];
        for (let i = 0; i < chunkCount; i++) {
          const chunk = await SecureStore.getItemAsync(`${key}.chunk.${i}`);
          if (chunk === null) return null; // incomplete — treat as missing
          parts.push(chunk);
        }
        return parts.join("");
      }

      // Single chunk written as a plain string (chunkCount === 1 or non-numeric).
      if (chunkCount === 1) {
        return SecureStore.getItemAsync(`${key}.chunk.0`);
      }

      // Legacy / non-chunked entry (written before this adapter was in use).
      return countRaw;
    } catch {
      return null;
    }
  },

  async setItem(key: string, value: string): Promise<void> {
    try {
      const chunks = toChunks(value);

      // Store each chunk under its own key.
      await Promise.all(
        chunks.map((chunk, i) =>
          SecureStore.setItemAsync(`${key}.chunk.${i}`, chunk),
        ),
      );

      // Store the count under the primary key so getItem knows how many to read.
      await SecureStore.setItemAsync(key, String(chunks.length));
    } catch (err) {
      console.error("[secureStorage] setItem failed:", err);
    }
  },

  async removeItem(key: string): Promise<void> {
    try {
      const countRaw = await SecureStore.getItemAsync(key);
      const chunkCount = countRaw !== null ? parseInt(countRaw, 10) : NaN;

      if (!isNaN(chunkCount)) {
        await Promise.all(
          Array.from({ length: chunkCount }, (_, i) =>
            SecureStore.deleteItemAsync(`${key}.chunk.${i}`),
          ),
        );
      }

      await SecureStore.deleteItemAsync(key);
    } catch (err) {
      console.error("[secureStorage] removeItem failed:", err);
    }
  },
};
