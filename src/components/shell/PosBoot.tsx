"use client";
import { useEffect } from "react";
import { usePos } from "@/lib/store/usePos";

/**
 * Mounted once at the app shell. Triggers a single store hydration on the
 * client without rendering anything. Safe to mount inside SSR layouts.
 */
export function PosBoot() {
  const hydrate = usePos((s) => s.hydrate);
  useEffect(() => {
    hydrate();
  }, [hydrate]);
  return null;
}
