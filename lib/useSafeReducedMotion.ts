'use client';

import { useReducedMotion as useReducedMotionRaw } from 'framer-motion';
import { useEffect, useState } from 'react';

/**
 * Hydration-safe wrapper around framer-motion's `useReducedMotion`.
 *
 * The raw hook reads `prefers-reduced-motion` synchronously on the client,
 * which can return `true` during the first client render while the server
 * always sees `null`. When that value is used to branch on `motion.*`
 * `initial`/`animate` props (or any inline style), the produced HTML differs
 * between SSR and CSR and React throws a hydration mismatch.
 *
 * This wrapper always returns `false` on the server and on the very first
 * client render, then resolves to the real preference after mount. The
 * trade-off is that motion-disabled users may see one frame of the default
 * animation before it stops; this is the standard, no-flicker pattern used
 * by libraries like `next-themes` for the same class of problem.
 */
export function useSafeReducedMotion(): boolean {
  const reduce = useReducedMotionRaw();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- first client paint must match SSR
    setMounted(true);
  }, []);

  return mounted ? Boolean(reduce) : false;
}
