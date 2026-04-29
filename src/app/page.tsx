'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import OnboardingForm, { UserData } from '@/components/OnboardingForm';
import GraphicalEnvironment from '@/components/GraphicalEnvironment';
import styles from './page.module.css';

export default function Home() {
  const [userData, setUserData] = useState<UserData | null>(null);

  return (
    <main className={styles.main}>
      {/* 3D Environment - always mounted for seamless transition */}
      <div className={`${styles.canvasContainer} ${!userData ? styles.blurred : ''}`}>
        <GraphicalEnvironment userData={userData} />
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
    </main>
  );
}
