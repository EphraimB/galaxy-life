'use client';

import { useState, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import OnboardingForm, { UserData } from '@/components/OnboardingForm';
import GraphicalEnvironment from '@/components/GraphicalEnvironment';
import WebcamOverlay from '@/components/WebcamOverlay';
import { HandState } from '@/hooks/useHandTracker';
import styles from './page.module.css';

export default function Home() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [facePos, setFacePos] = useState<{ x: number; y: number } | undefined>(undefined);
  const [handState, setHandState] = useState<HandState | null>(null);
  const [isFaceTracking, setIsFaceTracking] = useState(false);

  const handleFacePos = useCallback((pos: { x: number; y: number }) => {
    setFacePos(pos);
  }, []);

  return (
    <main className={styles.main}>
      {/* 3D Environment - always mounted for seamless transition */}
      <div className={`${styles.canvasContainer} ${!userData ? styles.blurred : ''}`}>
        <GraphicalEnvironment 
          userData={userData} 
          facePos={facePos} 
          handState={handState}
          isFaceTracking={isFaceTracking}
        />
      </div>

      {/* UI Overlay for Onboarding */}
      <div className={styles.uiOverlay}>
        <AnimatePresence mode="wait">
          {!userData && (
            <div className={styles.centered} key="onboarding">
              <OnboardingForm onSubmit={setUserData} />
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Vision controls overlay (hand + face tracking) */}
      {userData && (
        <WebcamOverlay 
          onFacePos={handleFacePos} 
          onHandState={setHandState} 
          onFaceTracking={setIsFaceTracking}
        />
      )}
    </main>
  );
}
