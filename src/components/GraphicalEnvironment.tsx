import { Canvas } from '@react-three/fiber';
import { Suspense, useState } from 'react';
import { UserData } from './OnboardingForm';
import Starship from './Starship';
import WorldManager from './worlds/WorldManager';

interface Props {
  userData: UserData | null;
  facePos?: { x: number; y: number };
}

export default function GraphicalEnvironment({ userData, facePos }: Props) {
  const [altitude, setAltitude] = useState(0);
  const [currentPlanetId, setCurrentPlanetId] = useState('earth');

  return (
    <Canvas shadows>
      <Suspense fallback={null}>
        {/* World Manager handles the dynamic external environment layers and transitions */}
        <WorldManager currentWorldId={currentPlanetId} altitude={altitude} />
        
        {/* Starship is the static first-person cockpit overlay */}
        <Starship 
          active={!!userData} 
          userData={userData} 
          onAltitudeChange={setAltitude} 
          onPlanetChange={setCurrentPlanetId}
          facePos={facePos}
        />
      </Suspense>
    </Canvas>
  );
}
