'use client';

import { useRef, useEffect } from 'react';

interface UseGestureInteractionOptions {
  /** Normalized 0-1 finger position (MediaPipe coords: x mirrored) */
  fingerPos: { x: number; y: number } | null;
  isPinching: boolean;
  enabled: boolean;
}

const CLICK_COOLDOWN_MS = 400;

/**
 * Converts normalized MediaPipe finger coordinates (0-1) to pixel screen coords,
 * then fires a synthetic pointerdown/click on any DOM element at that position.
 *
 * MediaPipe returns mirrored x (0 = right edge of video).
 * We un-mirror: screenX = (1 - x) * window.innerWidth
 */
export function useGestureInteraction({
  fingerPos,
  isPinching,
  enabled,
}: UseGestureInteractionOptions) {
  const lastPinch = useRef(false);
  const lastClickTime = useRef(0);
  const lastPinchPos = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (!enabled || !fingerPos) {
      lastPinch.current = false;
      return;
    }

    const wasPinching = lastPinch.current;
    lastPinch.current = isPinching;

    // Fire on pinch leading edge (was open, now pinching)
    if (isPinching && !wasPinching) {
      const now = performance.now();
      if (now - lastClickTime.current < CLICK_COOLDOWN_MS) return;
      lastClickTime.current = now;

      // Un-mirror the x coordinate
      const screenX = (1 - fingerPos.x) * window.innerWidth;
      const screenY = fingerPos.y * window.innerHeight;
      lastPinchPos.current = { x: screenX, y: screenY };

      // Find element at that position and dispatch synthetic events
      const target = document.elementFromPoint(screenX, screenY);
      if (target) {
        // Pointer events first (for React synthetic handlers)
        target.dispatchEvent(
          new PointerEvent('pointerdown', { bubbles: true, clientX: screenX, clientY: screenY })
        );
        target.dispatchEvent(
          new PointerEvent('pointerup', { bubbles: true, clientX: screenX, clientY: screenY })
        );
        target.dispatchEvent(
          new MouseEvent('click', { bubbles: true, clientX: screenX, clientY: screenY })
        );
      }
    }
  }, [fingerPos, isPinching, enabled]);
}
