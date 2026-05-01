'use client';

import { useRef, useState, useEffect, useCallback } from 'react';

export interface WebcamStream {
  videoEl: HTMLVideoElement | null;
  isReady: boolean;
  error: string | null;
}

/**
 * Opens the webcam once and returns the shared video element.
 * Both hand tracker and face tracker consume the same stream.
 */
export function useWebcam(enabled: boolean): WebcamStream {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) {
      // Stop stream and cleanup
      streamRef.current?.getTracks().forEach(t => t.stop());
      streamRef.current = null;
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      setIsReady(false);
      setError(null);
      return;
    }

    let cancelled = false;

    async function openCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480, facingMode: 'user' },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach(t => t.stop());
          return;
        }
        streamRef.current = stream;

        // Create a hidden video element if needed
        if (!videoRef.current) {
          const vid = document.createElement('video');
          vid.autoplay = true;
          vid.muted = true;
          vid.playsInline = true;
          vid.style.cssText = 'position:absolute;width:1px;height:1px;opacity:0;pointer-events:none;';
          document.body.appendChild(vid);
          videoRef.current = vid;
        }

        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setIsReady(true);
        setError(null);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Camera error';
        setError(msg);
      }
    }

    openCamera();

    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach(t => t.stop());
      streamRef.current = null;
      videoRef.current?.remove();
      videoRef.current = null;
      setIsReady(false);
    };
  }, [enabled]);

  return { videoEl: videoRef.current, isReady, error };
}
