"use client";
import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};

/**
 * Returns false during SSR and the first client render (hydration pass),
 * then true. Use to gate rendering of client-only / theme-dependent UI so
 * the markup matches what the server produced.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}
