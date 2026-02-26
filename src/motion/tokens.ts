import type { Transition } from 'framer-motion';

export const MOTION_DURATION = {
  micro: 0.16,
  fast: 0.22,
  base: 0.30,
  slow: 0.42,
} as const;

export const REDUCED_MOTION_DURATION = 0.12;

export const MOTION_EASE = {
  enter: [0.22, 1, 0.36, 1] as const,
  exit: [0.4, 0, 1, 1] as const,
} as const;

export const MOTION_SPRING = {
  snappy: {
    type: 'spring',
    stiffness: 360,
    damping: 30,
    mass: 0.8,
  } as const,
  card: {
    type: 'spring',
    stiffness: 260,
    damping: 26,
    mass: 1,
  } as const,
} as const;

export function durationFor(reducedMotion: boolean, normalDuration: number): number {
  return reducedMotion ? REDUCED_MOTION_DURATION : normalDuration;
}

export function tweenFor(
  reducedMotion: boolean,
  duration: number,
  phase: 'enter' | 'exit' = 'enter',
): Transition {
  return {
    duration: durationFor(reducedMotion, duration),
    ease: phase === 'enter' ? MOTION_EASE.enter : MOTION_EASE.exit,
  };
}

export function springFor(
  reducedMotion: boolean,
  spring: 'snappy' | 'card' = 'card',
): Transition {
  if (reducedMotion) {
    return tweenFor(true, REDUCED_MOTION_DURATION);
  }
  return MOTION_SPRING[spring];
}
