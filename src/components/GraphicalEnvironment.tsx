import { Canvas, useFrame } from '@react-three/fiber';
import { Suspense, useState, useRef } from 'react';
import { Sky, Stars, ContactShadows } from '@react-three/drei';
import { UserData } from './OnboardingForm';
import Starship from './Starship';
import { PLANETS, PlanetConfig } from '@/lib/planets';
import * as THREE from 'three';

interface Props {
  userData: UserData | null;
  facePos?: { x: number; y: number };
}

// Custom Sky/Atmosphere that fades based on altitude
function Atmosphere({ altitude, planet }: { altitude: number, planet: PlanetConfig }) {
  // At altitude 0, opacity is 1. At altitude 500, opacity is 0.
  const skyOpacity = Math.max(0, 1 - altitude / 500);
  
  return (
    <group>
      {/* We use a large sphere with basic material for the sky to easily control opacity */}
      <mesh scale={1000} renderOrder={-1}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial 
          color={planet.skyColor} 
          side={THREE.BackSide} 
          transparent 
          opacity={skyOpacity} 
          depthWrite={false}
        />
      </mesh>
      
      {/* Sun */}
      <pointLight position={[100, 100, -50]} intensity={2 * skyOpacity} color="#ffffee" />
      <ambientLight intensity={0.5 * skyOpacity + 0.1} /> {/* Keeps a minimum ambient light for space */}

      {/* Stars fade in as sky fades out */}
      <Stars 
        radius={300} 
        depth={50} 
        count={5000} 
        factor={4} 
        saturation={0} 
        fade 
        speed={1} 
      />
    </group>
  );
}

function PlanetEnvironment({ active, planet }: { active: boolean, planet: PlanetConfig }) {
  return (
    <group>
      {/* Sci-Fi Launch Pad */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial color={planet.groundColor} metalness={0.8} roughness={0.4} />
      </mesh>

      {/* Grid lines on the launch pad */}
      <gridHelper args={[200, 50, planet.padColor, '#111111']} position={[0, -1.99, 0]} />

      {/* Glowing Launch Pad Ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.98, 0]}>
        <ringGeometry args={[8, 9, 64]} />
        <meshBasicMaterial color={planet.padColor} transparent opacity={0.5} />
      </mesh>

      {/* Earth orbiting (visible once in space) */}
      <mesh position={[0, -2000, 0]}>
        <sphereGeometry args={[1900, 64, 64]} />
        <meshStandardMaterial color="#1e3a8a" roughness={0.8} metalness={0.1} />
      </mesh>

      <ContactShadows position={[0, -1.99, 0]} opacity={0.6} scale={20} blur={1} far={4} />
    </group>
  );
}

export default function GraphicalEnvironment({ userData, facePos }: Props) {
  const [altitude, setAltitude] = useState(0);
  const [currentPlanetId, setCurrentPlanetId] = useState('earth');
  
  const planet = PLANETS[currentPlanetId];

  return (
    <Canvas shadows>
      <Suspense fallback={null}>
        <Atmosphere altitude={altitude} planet={planet} />
        <PlanetEnvironment active={!!userData} planet={planet} />
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
