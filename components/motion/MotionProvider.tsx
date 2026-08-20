"use client";

import type { ReactNode } from "react";
import { MotionConfig } from "framer-motion";

/** Makes every Framer Motion animation honour the user's reduced-motion setting. */
export function MotionProvider({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
