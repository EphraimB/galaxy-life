'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import {
  FaceLandmarker,
  FilesetResolver,
} from '@mediapipe/tasks-vision';

export interface FaceState {
  /** Normalized –1 to +1. Positive x = looking right, positive y = looking down */
  facePos: { x: number; y: number };
  isTracking: boolean;
}

interface UseFaceTrackerOptions {
  videoEl: HTMLVideoElement | null;
  enabled: boolean;
}

const WASM_PATH =
  'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm';
const MODEL_PATH =
  'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task';

const LERP_ALPHA = 0.08; // very smooth for camera movement

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

export function useFaceTracker({ videoEl, enabled }: UseFaceTrackerOptions): FaceState {
  const landmarkerRef = useRef<FaceLandmarker | null>(null);
  const animFrameRef = useRef<number>(0);
  const smoothedPos = useRef({ x: 0, y: 0 });
  const lastDetectMs = useRef(0);

  const [state, setState] = useState<FaceState>({
    facePos: { x: 0, y: 0 },
    isTracking: false,
  });

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;

    async function loadModel() {
      const vision = await FilesetResolver.forVisionTasks(WASM_PATH);
      const landmarker = await FaceLandmarker.createFromOptions(vision, {
        baseOptions: { modelAssetPath: MODEL_PATH, delegate: 'GPU' },
        runningMode: 'VIDEO',
        numFaces: 1,
        minFaceDetectionConfidence: 0.5,
        minFacePresenceConfidence: 0.5,
        minTrackingConfidence: 0.5,
        outputFaceBlendshapes: false,
        outputFacialTransformationMatrixes: false,
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
    const nowMs = performance.now();

    // Run face detection at ~15fps to save compute (hand tracking gets the rest)
    if (nowMs - lastDetectMs.current < 66) {
      animFrameRef.current = requestAnimationFrame(detect);
      return;
    }
    lastDetectMs.current = nowMs;

    if (!landmarker || !videoEl || videoEl.readyState < 2) {
      animFrameRef.current = requestAnimationFrame(detect);
      return;
    }

    let result;
    try {
      result = landmarker.detectForVideo(videoEl, nowMs);
    } catch {
      animFrameRef.current = requestAnimationFrame(detect);
      return;
    }

    if (!result.faceLandmarks || result.faceLandmarks.length === 0) {
      setState(prev => ({ ...prev, isTracking: false }));
      animFrameRef.current = requestAnimationFrame(detect);
      return;
    }

    // Nose tip = landmark 1
    const noseTip = result.faceLandmarks[0][1];
    // Camera is mirrored: x=0 is right side of video → map to +1 = looking right
    const rawX = (0.5 - noseTip.x) * 2; // mirror and normalize to -1..1
    const rawY = (noseTip.y - 0.5) * 2; // 0.5=center, map to -1..1

    smoothedPos.current.x = lerp(smoothedPos.current.x, rawX, LERP_ALPHA);
    smoothedPos.current.y = lerp(smoothedPos.current.y, rawY, LERP_ALPHA);

    setState({
      facePos: { x: smoothedPos.current.x, y: smoothedPos.current.y },
      isTracking: true,
    });

    animFrameRef.current = requestAnimationFrame(detect);
  }, [videoEl]);

  useEffect(() => {
    if (!enabled || !videoEl) {
      cancelAnimationFrame(animFrameRef.current);
      setState({ facePos: { x: 0, y: 0 }, isTracking: false });
      return;
    }
    animFrameRef.current = requestAnimationFrame(detect);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [enabled, videoEl, detect]);

  return state;
}
