"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { canEncodeWebp } from "./image-codec";

/** Returns `value` once it has stopped changing for `delay` ms (use with primitives). */
export function useDebounced<T>(value: T, delay: number) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

let webpSupport: boolean | undefined;
const noopSubscribe = () => () => {};

/** Whether canvas can encode WebP here. Assumes yes during SSR/hydration, then checks once. */
export function useWebpEncodeSupport() {
  return useSyncExternalStore(
    noopSubscribe,
    () => (webpSupport ??= canEncodeWebp()),
    () => true,
  );
}
