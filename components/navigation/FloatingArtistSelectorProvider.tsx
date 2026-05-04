'use client';

import { createContext, useContext, type ReactNode } from 'react';
import {
  DEFAULT_FLOATING_ARTIST_CONFIG,
  type FloatingArtistSelectorConfig,
} from '@/lib/floating-artist-config';

const FloatingArtistSelectorContext = createContext<FloatingArtistSelectorConfig>(DEFAULT_FLOATING_ARTIST_CONFIG);

export function FloatingArtistSelectorProvider({
  config,
  children,
}: {
  config: FloatingArtistSelectorConfig;
  children: ReactNode;
}) {
  return (
    <FloatingArtistSelectorContext.Provider value={config}>{children}</FloatingArtistSelectorContext.Provider>
  );
}

export function useFloatingArtistSelectorConfig(): FloatingArtistSelectorConfig {
  return useContext(FloatingArtistSelectorContext);
}
