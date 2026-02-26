import type { Variants } from 'framer-motion';
import { MOTION_DURATION, durationFor, tweenFor } from './tokens';

export function fadeSlideY(
  reducedMotion: boolean,
  offset = 12,
  duration: number = MOTION_DURATION.base,
): Variants {
  const yOffset = reducedMotion ? 0 : offset;
  return {
    hidden: {
      opacity: 0,
      y: yOffset,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: tweenFor(reducedMotion, duration, 'enter'),
    },
    exit: {
      opacity: 0,
      y: yOffset * 0.5,
      transition: tweenFor(reducedMotion, Math.min(duration, MOTION_DURATION.fast), 'exit'),
    },
  };
}

export function fadeSlideX(
  reducedMotion: boolean,
  offset = 16,
  duration: number = MOTION_DURATION.base,
): Variants {
  const xOffset = reducedMotion ? 0 : offset;
  return {
    hidden: {
      opacity: 0,
      x: xOffset,
    },
    visible: {
      opacity: 1,
      x: 0,
      transition: tweenFor(reducedMotion, duration, 'enter'),
    },
    exit: {
      opacity: 0,
      x: xOffset * 0.5,
      transition: tweenFor(reducedMotion, Math.min(duration, MOTION_DURATION.fast), 'exit'),
    },
  };
}

export function staggerContainer(
  reducedMotion: boolean,
  staggerChildren = 0.06,
  delayChildren = 0,
): Variants {
  return {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: durationFor(reducedMotion, MOTION_DURATION.micro),
        staggerChildren: reducedMotion ? 0 : staggerChildren,
        delayChildren: reducedMotion ? 0 : delayChildren,
      },
    },
  };
}
