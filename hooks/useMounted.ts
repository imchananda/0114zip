'use client';

import { useSyncExternalStore } from 'react';

const emptySubscribe = () => () => {};

/** True after client hydration; false on the server and during SSR markup. */
export function useMounted(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}
