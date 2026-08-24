"use client";

import { useSyncExternalStore } from "react";

/** Nothing to subscribe to: the value only differs between server and client. */
const subscribe = () => () => {};

/** True only after the component has mounted in the browser. */
export function useMounted(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  );
}
