import { useCallback, useRef } from "react";

export function useInfiniteScroll(onLoadMore: () => void, deps: any[] = []) {
  const lastCall = useRef(0);
  return useCallback(() => {
    const now = Date.now();
    if (now - lastCall.current < 500) return;
    lastCall.current = now;
    onLoadMore();
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps
}
