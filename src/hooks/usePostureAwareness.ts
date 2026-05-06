import { useState, useEffect } from 'react';

export type PostureState = 'seated' | 'standing' | 'unknown';

interface Props {
  facePos?: { x: number; y: number };
  isTracking: boolean;
}

export function usePostureAwareness({ facePos, isTracking }: Props): PostureState {
  const [posture, setPosture] = useState<PostureState>('unknown');

  useEffect(() => {
    if (!isTracking || !facePos) {
      setPosture('unknown');
      return;
    }

    // In Mediapipe, y goes from 0 (top) to 1 (bottom).
    // If the face is high in the frame (y < 0.35), we assume standing.
    // If lower (y > 0.45), we assume seated.
    // The gap creates hysteresis to prevent flickering.
    if (facePos.y < 0.35 && posture !== 'standing') {
      setPosture('standing');
    } else if (facePos.y > 0.45 && posture !== 'seated') {
      setPosture('seated');
    }
  }, [facePos, isTracking, posture]);

  return posture;
}
