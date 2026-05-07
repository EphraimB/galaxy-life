import { useState } from 'react';
import * as THREE from 'three';
import { WORLDS } from '@/lib/worlds';
import TransitionController from './TransitionController';
import EarthWorld from './environments/EarthWorld';
import MarsWorld from './environments/MarsWorld';
import MoonWorld from './environments/MoonWorld';
import SpaceWorld from './environments/SpaceWorld';

interface Props {
  currentWorldId: string;
  altitude: number;
}

export default function WorldManager({ currentWorldId, altitude }: Props) {
  // We keep track of the *actually rendered* world, which only updates when the transition hits the middle
  const [renderedWorldId, setRenderedWorldId] = useState(currentWorldId);
  
  const activeWorld = WORLDS[renderedWorldId] || WORLDS.earth;

  const handleTransitionMiddle = (worldId: string) => {
    setRenderedWorldId(worldId);
  };

  // Fading atmosphere logic based exactly on altitude (as requested)
  // At altitude 0, opacity is 1. At altitude 500, opacity is 0.
  const skyOpacity = activeWorld.atmosphere.hasAtmosphere 
    ? Math.max(0, 1 - altitude / 500) * activeWorld.atmosphere.density
    : 0;

  return (
    <group name="world-manager">
      {/* 1. Transition Controller handles seamless fades when target world changes */}
      <TransitionController 
        targetWorldId={currentWorldId} 
        onTransitionMiddle={handleTransitionMiddle} 
      />

      {/* 2. World Lighting (independent from the cockpit interior lighting) */}
      <ambientLight 
        color={activeWorld.lighting.ambientColor} 
        intensity={activeWorld.lighting.ambientIntensity} 
      />
      <directionalLight 
        position={activeWorld.lighting.directionalPosition} 
        color={activeWorld.lighting.directionalColor} 
        intensity={activeWorld.lighting.directionalIntensity} 
        castShadow
      />

      {/* 3. Atmosphere Sphere (fades with altitude, exact logic preserved) */}
      <mesh scale={1000} renderOrder={-1}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial 
          color={activeWorld.atmosphere.color} 
          side={THREE.BackSide} 
          transparent 
          opacity={skyOpacity} 
          depthWrite={false}
        />
      </mesh>

      {/* 4. Active World Geometry (Massive Planet Spheres in the Background) */}
      <group position={[0, -18002, 0]}>
        {renderedWorldId === 'earth' && (
          <mesh scale={18000}>
            <sphereGeometry args={[1, 64, 64]} />
            <meshStandardMaterial color="#3b82f6" roughness={0.7} metalness={0.1} />
          </mesh>
        )}
        {renderedWorldId === 'mars' && (
          <mesh scale={18000}>
            <sphereGeometry args={[1, 64, 64]} />
            <meshStandardMaterial color="#ef4444" roughness={0.9} metalness={0.2} />
          </mesh>
        )}
        {renderedWorldId === 'moon' && (
          <mesh scale={18000}>
            <sphereGeometry args={[1, 64, 64]} />
            <meshStandardMaterial color="#9ca3af" roughness={1.0} metalness={0.1} />
          </mesh>
        )}
      </group>

      {/* Render environment layers (stars, etc) from the world components */}
      {renderedWorldId === 'earth' && <EarthWorld world={activeWorld} />}
      {renderedWorldId === 'mars' && <MarsWorld world={activeWorld} />}
      {renderedWorldId === 'moon' && <MoonWorld world={activeWorld} />}
      {renderedWorldId === 'space' && <SpaceWorld world={activeWorld} />}
    </group>
  );
}
