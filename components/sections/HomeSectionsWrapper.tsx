'use client';

import { ViewStateProvider } from '@/context/ViewStateContext';

export function HomeSectionsWrapper({ children }: { children: React.ReactNode }) {
  return <ViewStateProvider initialState="both">{children}</ViewStateProvider>;
}
