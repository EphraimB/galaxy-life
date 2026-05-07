'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import {
  HandLandmarker,
  FilesetResolver,
  type HandLandmarkerResult,
} from '@mediapipe/tasks-vision';

export interface HandState {
  fingerPos: { x: number; y: number } | null; // 0-1 normalized screen coords
  isPinching: boolean;
  swipe: 'left' | 'right' | 'up' | 'down' | null;
  isTracking: boolean;
  hands?: { fingerPos: { x: number; y: number }; isPinching: boolean }[];
}

interface UseHandTrackerOptions {
  videoEl: HTMLVideoElement | null;
  enabled: boolean;
}

const WASM_PATH =
  'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm';
const MODEL_PATH =
  'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task';

const LERP_ALPHA = 0.25; // smoothing (lower = smoother but laggier)
const PINCH_THRESHOLD = 0.07; // normalized distance between thumb & index tips
const CONFIDENCE_THRESHOLD = 0.7;
const SWIPE_MIN_DISTANCE = 0.15; // normalized screen units
const SWIPE_MAX_TIME_MS = 500;

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

export function useHandTracker({ videoEl, enabled }: UseHandTrackerOptions): HandState {
  const landmarkerRef = useRef<HandLandmarker | null>(null);
  const animFrameRef = useRef<number>(0);
  const smoothedPos = useRef<{ x: number; y: number }>({ x: 0.5, y: 0.5 });
  const swipeStart = useRef<{ x: number; y: number; time: number } | null>(null);

  const [state, setState] = useState<HandState>({
    fingerPos: null,
    isPinching: false,
    swipe: null,
    isTracking: false,
    hands: [],
  });

  // Load the model once
  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;

    async function loadModel() {
      const vision = await FilesetResolver.forVisionTasks(WASM_PATH);
      const landmarker = await HandLandmarker.createFromOptions(vision, {
        baseOptions: { modelAssetPath: MODEL_PATH, delegate: 'GPU' },
        runningMode: 'VIDEO',
        numHands: 2,
        minHandDetectionConfidence: CONFIDENCE_THRESHOLD,
        minHandPresenceConfidence: CONFIDENCE_THRESHOLD,
        minTrackingConfidence: CONFIDENCE_THRESHOLD,
      });
      if (!cancelled) {
        landmarkerRef.current = landmarker;
      }
    }

    loadModel().catch(console.error);
    return () => {
      cancelled = true;
      landmarkerRef.current?.close();
      landmarkerRef.current = null;
    };
  }, [enabled]);

  const detect = useCallback(() => {
    const landmarker = landmarkerRef.current;
    if (!landmarker || !videoEl || videoEl.readyState < 2) {
      animFrameRef.current = requestAnimationFrame(detect);
      return;
    }

    const nowMs = performance.now();
    let result: HandLandmarkerResult;
    try {
      result = landmarker.detectForVideo(videoEl, nowMs);
    } catch {
      animFrameRef.current = requestAnimationFrame(detect);
      return;
    }

    if (!result.landmarks || result.landmarks.length === 0) {
      setState(prev => {
        if (!prev.isTracking && !prev.fingerPos && prev.hands?.length === 0) return prev;
        return { ...prev, fingerPos: null, isPinching: false, swipe: null, isTracking: false, hands: [] };
      });
      swipeStart.current = null;
      animFrameRef.current = requestAnimationFrame(detect);
      return;
    }

    const newHands = result.landmarks.map(landmarks => {
      const indexTip = landmarks[8];
      const thumbTip = landmarks[4];
      const dx = indexTip.x - thumbTip.x;
      const dy = indexTip.y - thumbTip.y;
      const dz = indexTip.z - thumbTip.z;
      const pinchDist = Math.sqrt(dx * dx + dy * dy + dz * dz);
      return {
        fingerPos: { x: indexTip.x, y: indexTip.y },
        isPinching: pinchDist < PINCH_THRESHOLD
      };
    });

    const primaryHand = newHands[0];

    // Smooth the primary position
    smoothedPos.current.x = lerp(smoothedPos.current.x, primaryHand.fingerPos.x, LERP_ALPHA);
    smoothedPos.current.y = lerp(smoothedPos.current.y, primaryHand.fingerPos.y, LERP_ALPHA);

    const screenX = smoothedPos.current.x; // 0=left, 1=right (mirrored by camera)
    const screenY = smoothedPos.current.y; // 0=top, 1=bottom
    const isPinching = primaryHand.isPinching;

    // Swipe detection (only for primary hand)
    let swipe: HandState['swipe'] = null;
    if (!isPinching) {
      if (!swipeStart.current) {
        swipeStart.current = { x: screenX, y: screenY, time: nowMs };
      } else {
        const elapsed = nowMs - swipeStart.current.time;
        const deltaX = screenX - swipeStart.current.x;
        const deltaY = screenY - swipeStart.current.y;
        if (elapsed < SWIPE_MAX_TIME_MS) {
          if (Math.abs(deltaX) > SWIPE_MIN_DISTANCE && Math.abs(deltaX) > Math.abs(deltaY)) {
            swipe = deltaX < 0 ? 'left' : 'right';
            swipeStart.current = null;
          } else if (Math.abs(deltaY) > SWIPE_MIN_DISTANCE) {
            swipe = deltaY < 0 ? 'up' : 'down';
            swipeStart.current = null;
          }
        } else {
          swipeStart.current = { x: screenX, y: screenY, time: nowMs };
        }
      }
    } else {
      swipeStart.current = null;
    }

    setState(prev => {
      if (
        prev.isTracking &&
        prev.isPinching === isPinching &&
        prev.swipe === swipe &&
        prev.hands?.length === newHands.length &&
        prev.fingerPos &&
        Math.abs(prev.fingerPos.x - screenX) < 0.001 &&
        Math.abs(prev.fingerPos.y - screenY) < 0.001
      ) {
        return prev;
      }
      return {
        fingerPos: { x: screenX, y: screenY },
        isPinching,
        swipe,
        isTracking: true,
        hands: newHands,
      };
    });

    animFrameRef.current = requestAnimationFrame(detect);
  }, [videoEl]);

  // Start/stop detection loop
  useEffect(() => {
    if (!enabled || !videoEl) {
      cancelAnimationFrame(animFrameRef.current);
      setState({ fingerPos: null, isPinching: false, swipe: null, isTracking: false });
      return;
    }
    animFrameRef.current = requestAnimationFrame(detect);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [enabled, videoEl, detect]);

  return state;
}
