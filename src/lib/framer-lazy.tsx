"use client";

import { domAnimation, LazyMotion } from "framer-motion";
import type { ReactNode } from "react";

export function LazyMotionProvider({ children }: { children: ReactNode }) {
  return <LazyMotion features={domAnimation}>{children}</LazyMotion>;
}
