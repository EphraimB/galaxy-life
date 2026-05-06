import { useState, useEffect, useRef } from 'react';
import { HandState } from './useHandTracker';

export type GestureType = 'idle' | 'pinch' | 'hold' | 'drag' | 'twoHandPinch';

export interface GestureEvent {
  type: GestureType;
  primaryPos: { x: number; y: number } | null;
  dragDelta: { x: number; y: number } | null;
}

export function useGestureEngine(handState: HandState): GestureEvent {
  const [gesture, setGesture] = useState<GestureEvent>({
    type: 'idle',
    primaryPos: null,
    dragDelta: null,
  });

  const pinchStartTime = useRef<number | null>(null);
  const dragStartPos = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (!handState.isTracking || !handState.fingerPos) {
      setGesture({ type: 'idle', primaryPos: null, dragDelta: null });
      pinchStartTime.current = null;
      dragStartPos.current = null;
      return;
    }

    const hands = handState.hands || [];
    const isTwoHandPinching = hands.length >= 2 && hands[0].isPinching && hands[1].isPinching;

    if (isTwoHandPinching) {
      setGesture({ type: 'twoHandPinch', primaryPos: handState.fingerPos, dragDelta: null });
      pinchStartTime.current = null;
      dragStartPos.current = null;
      return;
    }

    if (handState.isPinching) {
      const now = performance.now();
      
      if (!pinchStartTime.current) {
        // Just started pinching
        pinchStartTime.current = now;
        dragStartPos.current = handState.fingerPos;
        setGesture({ type: 'pinch', primaryPos: handState.fingerPos, dragDelta: null });
      } else {
        const holdDuration = now - pinchStartTime.current;
        
        // Calculate drag delta from start of pinch
        let dx = 0;
        let dy = 0;
        if (dragStartPos.current) {
          dx = handState.fingerPos.x - dragStartPos.current.x;
          dy = handState.fingerPos.y - dragStartPos.current.y;
        }
        
        // If moved significantly, it's a drag
        if (Math.abs(dx) > 0.05 || Math.abs(dy) > 0.05) {
           setGesture({ type: 'drag', primaryPos: handState.fingerPos, dragDelta: { x: dx, y: dy } });
        } 
        // If held long enough without moving, it's a hold
        else if (holdDuration > 500) {
           setGesture({ type: 'hold', primaryPos: handState.fingerPos, dragDelta: null });
        } 
        // Otherwise still just a pinch
        else {
           setGesture({ type: 'pinch', primaryPos: handState.fingerPos, dragDelta: null });
        }
      }
    } else {
      // Open hand (not pinching)
      pinchStartTime.current = null;
      dragStartPos.current = null;
      setGesture({ type: 'idle', primaryPos: handState.fingerPos, dragDelta: null });
    }

  }, [handState]);

  return gesture;
}
