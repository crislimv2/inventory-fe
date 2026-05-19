"use client";
import { useEffect, useRef } from "react";

type Options = {
  onScan: (code: string) => void;
  minLength?: number;
  maxInterKeyMs?: number;
  enabled?: boolean;
};

/**
 * Detects a USB barcode-scanner burst: 6+ chars typed within ~30ms each,
 * terminated by Enter. Falls through normal typing into focused inputs.
 */
export function useBarcodeScanner({
  onScan,
  minLength = 4,
  maxInterKeyMs = 60,
  enabled = true,
}: Options) {
  const bufferRef = useRef("");
  const lastKeyAtRef = useRef(0);
  const onScanRef = useRef(onScan);

  useEffect(() => {
    onScanRef.current = onScan;
  }, [onScan]);

  useEffect(() => {
    if (!enabled) return;

    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isEditable =
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable);

      const now = performance.now();
      const sinceLast = now - lastKeyAtRef.current;

      if (e.key === "Enter") {
        if (bufferRef.current.length >= minLength) {
          const code = bufferRef.current;
          bufferRef.current = "";
          lastKeyAtRef.current = 0;
          if (!isEditable) e.preventDefault();
          onScanRef.current(code);
          return;
        }
        bufferRef.current = "";
        lastKeyAtRef.current = 0;
        return;
      }

      if (e.key.length !== 1) return;

      if (sinceLast > maxInterKeyMs) {
        bufferRef.current = "";
      }
      bufferRef.current += e.key;
      lastKeyAtRef.current = now;
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [enabled, minLength, maxInterKeyMs]);
}
