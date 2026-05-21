'use client';

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useSyncExternalStore,
} from 'react';
import { ViewState } from '@/types';
import { announceToScreenReader } from '@/lib/utils';
import { actors } from '@/data/actors';

interface ViewStateContextType {
  state: ViewState;
  setState: (state: ViewState) => void;
  transitionTo: (state: ViewState) => void;
  isTransitioning: boolean;
  hoveredActor: 'namtan' | 'film' | null;
  setHoveredActor: (actor: 'namtan' | 'film' | null) => void;
  reducedMotion: boolean;
}

export const ViewStateContext = createContext<ViewStateContextType | null>(null);

function subscribeReducedMotion(onStoreChange: () => void): () => void {
  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  mediaQuery.addEventListener('change', onStoreChange);
  return () => mediaQuery.removeEventListener('change', onStoreChange);
}

function getReducedMotionSnapshot(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function getReducedMotionServerSnapshot(): boolean {
  return false;
}

const announcements: Record<ViewState, string> = {
  both: `กำลังแสดงผลงานคู่ของ ${actors.namtan.nameThai} และ ${actors.film.nameThai}`,
  namtan: `กำลังแสดงผลงานของ ${actors.namtan.nameThai}`,
  film: `กำลังแสดงผลงานของ ${actors.film.nameThai}`,
  lunar: 'Lunar Space',
};

export function ViewStateProvider({
  children,
  initialState = 'both',
}: {
  children: React.ReactNode;
  initialState?: ViewState;
}) {
  const [state, setStateInternal] = useState<ViewState>(initialState);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [hoveredActor, setHoveredActor] = useState<'namtan' | 'film' | null>(null);
  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot,
  );

  const transitionTo = useCallback((newState: ViewState) => {
    if (state === newState || isTransitioning) return;

    setIsTransitioning(true);
    announceToScreenReader(announcements[newState]);

    const exitDelay = reducedMotion ? 0 : 150;
    const transitionDuration = reducedMotion ? 0 : 400;

    setTimeout(() => {
      setStateInternal(newState);
      setTimeout(() => setIsTransitioning(false), transitionDuration);
    }, exitDelay);
  }, [state, isTransitioning, reducedMotion]);

  const value = useMemo(() => ({
    state,
    setState: setStateInternal,
    transitionTo,
    isTransitioning,
    hoveredActor,
    setHoveredActor,
    reducedMotion,
  }), [state, transitionTo, isTransitioning, hoveredActor, reducedMotion]);

  return (
    <ViewStateContext.Provider value={value}>
      {children}
    </ViewStateContext.Provider>
  );
}

export function useViewState() {
  const context = useContext(ViewStateContext);
  if (!context) {
    throw new Error('useViewState must be used within ViewStateProvider');
  }
  return context;
}

/** Returns null when called outside a ViewStateProvider (safe for shared components). */
export function useViewStateSafe() {
  return useContext(ViewStateContext);
}
