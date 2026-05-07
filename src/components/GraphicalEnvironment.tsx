import { Canvas } from '@react-three/fiber';
import { Environment, OrbitControls } from '@react-three/drei';
import { Suspense, useState } from 'react';
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
  const [altitude, setAltitude] = useState(0);
  const [currentPlanetId, setCurrentPlanetId] = useState('earth');
  const [flightState, setFlightState] = useState<FlightState>('landed');

  return (
    <>
    <Canvas shadows={{ type: THREE.PCFShadowMap }}>
      <Suspense fallback={null}>
        {/* Environment map to provide reflections for high-metalness materials */}
        <Environment preset="city" />
        
        {/* World Manager handles the dynamic external environment layers and transitions */}
        <WorldManager currentWorldId={currentPlanetId} altitude={altitude} />
        
        {/* Starship is the static first-person cockpit overlay */}
        <Starship 
          active={!!userData} 
          userData={userData} 
          altitude={altitude}
          onAltitudeChange={setAltitude} 
          currentPlanetId={currentPlanetId}
          onPlanetChange={setCurrentPlanetId}
          flightState={flightState}
          onFlightStateChange={setFlightState}
          facePos={facePos}
        />

        {/* Adaptive Interaction System HUD Layer (3D) */}
        {userData && handState && (
          <HUDManager3D 
            handState={handState} 
            facePos={facePos} 
            isFaceTracking={!!isFaceTracking} 
          />
        )}
      </Suspense>
    </Canvas>
    {/* 2D Overlay outside Canvas */}
    {userData && handState && (
      <HUDOverlay2D 
        userData={userData}
        onSelectPlanet={setCurrentPlanetId}
        currentPlanetId={currentPlanetId}
        flightState={flightState}
        onLaunch={() => setFlightState('launching')}
        onDescend={() => setFlightState('descending')}
        onWarp={(planetId: string) => {
          setCurrentPlanetId(planetId);
          setFlightState('orbiting');
        }}
      />
    )}
    </>
  );
}
