export type OfflineQueueEvent = {
  entity: string;
  operation: string;
};

type Listener = (event: OfflineQueueEvent) => void;

const listeners = new Set<Listener>();

export function onOfflineQueued(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function emitOfflineQueued(event: OfflineQueueEvent): void {
  listeners.forEach((listener) => listener(event));
}
