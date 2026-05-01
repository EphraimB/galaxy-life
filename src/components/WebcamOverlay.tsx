'use client';

import { useState, useEffect, useRef } from 'react';
import { useWebcam } from '@/hooks/useWebcam';
import { useHandTracker, HandState } from '@/hooks/useHandTracker';
import { useFaceTracker, FaceState } from '@/hooks/useFaceTracker';
import { useGestureInteraction } from '@/lib/gestureInteraction';

interface Props {
  onFacePos: (pos: { x: number; y: number }) => void;
}

export default function WebcamOverlay({ onFacePos }: Props) {
  const [webcamEnabled, setWebcamEnabled] = useState(false);
  const [handEnabled, setHandEnabled] = useState(false);
  const [faceEnabled, setFaceEnabled] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const pinchFeedbackRef = useRef(false);
  const [showPinch, setShowPinch] = useState(false);

  const { videoEl, isReady, error } = useWebcam(webcamEnabled);

  const { fingerPos, isPinching, swipe, isTracking: handTracking } = useHandTracker({
    videoEl: isReady ? videoEl : null,
    enabled: handEnabled && webcamEnabled,
  });

  const { facePos, isTracking: faceTracking } = useFaceTracker({
    videoEl: isReady ? videoEl : null,
    enabled: faceEnabled && webcamEnabled,
  });

  // Forward face position to parent (for camera parallax)
  useEffect(() => {
    if (faceTracking) {
      onFacePos(facePos);
    }
  }, [facePos, faceTracking, onFacePos]);

  // Wire gesture interaction (synthetic clicks on pinch)
  useGestureInteraction({ fingerPos, isPinching, enabled: handEnabled && webcamEnabled });

  // Pinch visual feedback
  useEffect(() => {
    if (isPinching && !pinchFeedbackRef.current) {
      pinchFeedbackRef.current = true;
      setShowPinch(true);
      setTimeout(() => setShowPinch(false), 300);
    } else if (!isPinching) {
      pinchFeedbackRef.current = false;
    }
  }, [isPinching]);

  // Enable webcam whenever either tracker is enabled
  useEffect(() => {
    setWebcamEnabled(handEnabled || faceEnabled);
  }, [handEnabled, faceEnabled]);

  const cursorX = fingerPos ? (1 - fingerPos.x) * window.innerWidth : -100;
  const cursorY = fingerPos ? fingerPos.y * window.innerHeight : -100;

  return (
    <>
      {/* Hand cursor dot */}
      {handEnabled && fingerPos && (
        <div
          style={{
            position: 'fixed',
            left: cursorX - 16,
            top: cursorY - 16,
            width: 32,
            height: 32,
            borderRadius: '50%',
            background: isPinching
              ? 'rgba(74, 222, 128, 0.6)'
              : 'rgba(139, 92, 246, 0.5)',
            border: `2px solid ${isPinching ? '#4ade80' : '#a78bfa'}`,
            boxShadow: isPinching
              ? '0 0 20px rgba(74,222,128,0.8)'
              : '0 0 12px rgba(139,92,246,0.6)',
            pointerEvents: 'none',
            zIndex: 9999,
            transition: 'background 0.1s, box-shadow 0.1s, transform 0.1s',
            transform: isPinching ? 'scale(0.7)' : 'scale(1)',
          }}
        />
      )}

      {/* Pinch ripple feedback */}
      {showPinch && fingerPos && (
        <div
          style={{
            position: 'fixed',
            left: cursorX - 30,
            top: cursorY - 30,
            width: 60,
            height: 60,
            borderRadius: '50%',
            border: '2px solid #4ade80',
            pointerEvents: 'none',
            zIndex: 9998,
            animation: 'pinchRipple 0.3s ease-out forwards',
          }}
        />
      )}

      {/* Control panel */}
      <div
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 9997,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: 8,
          fontFamily: 'monospace',
        }}
      >
        {/* Expanded controls */}
        {expanded && (
          <div
            style={{
              background: 'rgba(10, 15, 30, 0.85)',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: 12,
              padding: '12px 16px',
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
              backdropFilter: 'blur(12px)',
              minWidth: 200,
            }}
          >
            <p style={{ color: '#9ca3af', fontSize: '0.75rem', margin: 0, letterSpacing: 1 }}>
              VISION CONTROLS
            </p>

            {/* Head tracking toggle */}
            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
              <span style={{ color: faceTracking ? '#60a5fa' : '#6b7280', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                <span>👁</span>
                <span>Head Tracking</span>
                {faceTracking && <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#60a5fa', display: 'inline-block', boxShadow: '0 0 6px #60a5fa' }} />}
              </span>
              <div
                onClick={() => setFaceEnabled(v => !v)}
                style={{
                  width: 36,
                  height: 20,
                  borderRadius: 10,
                  background: faceEnabled ? 'rgba(96,165,250,0.4)' : 'rgba(255,255,255,0.1)',
                  border: `1px solid ${faceEnabled ? '#60a5fa' : 'rgba(255,255,255,0.2)'}`,
                  position: 'relative',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                <div style={{
                  position: 'absolute',
                  top: 2,
                  left: faceEnabled ? 18 : 2,
                  width: 14,
                  height: 14,
                  borderRadius: '50%',
                  background: faceEnabled ? '#60a5fa' : '#6b7280',
                  transition: 'left 0.2s',
                }} />
              </div>
            </label>

            {/* Hand tracking toggle */}
            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
              <span style={{ color: handTracking ? '#a78bfa' : '#6b7280', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                <span>✋</span>
                <span>Hand Interaction</span>
                {handTracking && <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#a78bfa', display: 'inline-block', boxShadow: '0 0 6px #a78bfa' }} />}
              </span>
              <div
                onClick={() => setHandEnabled(v => !v)}
                style={{
                  width: 36,
                  height: 20,
                  borderRadius: 10,
                  background: handEnabled ? 'rgba(167,139,250,0.4)' : 'rgba(255,255,255,0.1)',
                  border: `1px solid ${handEnabled ? '#a78bfa' : 'rgba(255,255,255,0.2)'}`,
                  position: 'relative',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                <div style={{
                  position: 'absolute',
                  top: 2,
                  left: handEnabled ? 18 : 2,
                  width: 14,
                  height: 14,
                  borderRadius: '50%',
                  background: handEnabled ? '#a78bfa' : '#6b7280',
                  transition: 'left 0.2s',
                }} />
              </div>
            </label>

            {error && (
              <p style={{ color: '#ef4444', fontSize: '0.75rem', margin: 0 }}>⚠ {error}</p>
            )}

            {webcamEnabled && !isReady && !error && (
              <p style={{ color: '#f59e0b', fontSize: '0.75rem', margin: 0 }}>⏳ Loading camera…</p>
            )}

            {swipe && (
              <p style={{ color: '#4ade80', fontSize: '0.75rem', margin: 0 }}>
                Swipe {swipe} detected
              </p>
            )}
          </div>
        )}

        {/* Toggle button */}
        <button
          onClick={() => setExpanded(v => !v)}
          style={{
            background: webcamEnabled
              ? 'linear-gradient(135deg, rgba(96,165,250,0.3), rgba(167,139,250,0.3))'
              : 'rgba(10,15,30,0.8)',
            border: `1px solid ${webcamEnabled ? 'rgba(167,139,250,0.5)' : 'rgba(255,255,255,0.15)'}`,
            borderRadius: 10,
            padding: '8px 14px',
            color: webcamEnabled ? '#c4b5fd' : '#9ca3af',
            fontSize: '0.8rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            backdropFilter: 'blur(12px)',
            boxShadow: webcamEnabled ? '0 0 15px rgba(139,92,246,0.3)' : 'none',
            transition: 'all 0.2s',
            letterSpacing: 1,
          }}
        >
          {webcamEnabled ? '🟢' : '⚫'} VISION {expanded ? '▲' : '▼'}
        </button>
      </div>

      {/* Keyframe for pinch ripple */}
      <style>{`
        @keyframes pinchRipple {
          0%   { transform: scale(1); opacity: 1; }
          100% { transform: scale(2.5); opacity: 0; }
        }
      `}</style>
    </>
  );
}
