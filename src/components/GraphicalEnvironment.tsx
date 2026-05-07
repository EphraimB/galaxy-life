import { Canvas } from '@react-three/fiber';
import { Environment, OrbitControls } from '@react-three/drei';
import { Suspense, useState, useRef } from 'react';
import { UserData } from './OnboardingForm';
import Starship from './Starship';
import WorldManager from './worlds/WorldManager';
import { HUDManager3D, HUDOverlay2D } from './hud/HUDManager';
import { HandState } from '@/hooks/useHandTracker';

export type FlightState = 'landed' | 'launching' | 'orbiting' | 'descending' | 'warping';

interface Props {
  userData: UserData | null;
  facePos?: { x: number; y: number };
  handState?: HandState | null;
  isFaceTracking?: boolean;
}

import * as THREE from 'three';

export default function GraphicalEnvironment({ userData, facePos, handState, isFaceTracking }: Props) {
  const altitudeRef = useRef(0);
  const [currentPlanetId, setCurrentPlanetId] = useState('earth');
  const [flightState, setFlightState] = useState<FlightState>('landed');

  return (
    <>
    <Canvas shadows={{ type: THREE.PCFShadowMap }}>
      <Suspense fallback={null}>
        {/* Removed Environment map to prevent it from blowing out the lighting or causing white skies */}
        
        {/* World Manager handles the dynamic external environment layers and transitions */}
        <WorldManager currentWorldId={currentPlanetId} altitudeRef={altitudeRef} />
        
        {/* Starship is the static first-person cockpit overlay */}
        <Starship 
          active={!!userData} 
          userData={userData} 
          altitudeRef={altitudeRef}
          currentPlanetId={currentPlanetId}
          onPlanetChange={setCurrentPlanetId}
          flightState={flightState}
          onFlightStateChange={setFlightState}
          facePos={facePos}
          handState={handState}
          isFaceTracking={!!isFaceTracking}
        />
      </Suspense>
    </Canvas>
    </>
  );
}
