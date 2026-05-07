import { useState, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { WORLDS } from '@/lib/worlds';
import { Stars } from '@react-three/drei';
import TransitionController from './TransitionController';
import EarthWorld from './environments/EarthWorld';
import MarsWorld from './environments/MarsWorld';
import MoonWorld from './environments/MoonWorld';
import SpaceWorld from './environments/SpaceWorld';

interface Props {
  currentWorldId: string;
  altitudeRef: React.MutableRefObject<number>;
}

export default function WorldManager({ currentWorldId, altitudeRef }: Props) {
  // We keep track of the *actually rendered* world, which only updates when the transition hits the middle
  const [renderedWorldId, setRenderedWorldId] = useState(currentWorldId);
  
  const activeWorld = WORLDS[renderedWorldId] || WORLDS.earth;

  const handleTransitionMiddle = (worldId: string) => {
    setRenderedWorldId(worldId);
  };

  const starsRef = useRef<THREE.Group>(null);
  const skyMatRef = useRef<THREE.MeshBasicMaterial>(null);
  const planetRef = useRef<THREE.Group>(null);
  const groundRef = useRef<THREE.Group>(null);

  useFrame(({ scene }) => {
    const alt = altitudeRef.current;
    if (starsRef.current) starsRef.current.position.y = alt;
    
    if (skyMatRef.current) {
      const opacity = activeWorld.atmosphere.hasAtmosphere 
        ? Math.max(0, 1 - alt / 500) * activeWorld.atmosphere.density
        : 0;
      skyMatRef.current.opacity = opacity;

      // Handle Distance Fog to blend ground edges into the skybox seamlessly
      if (activeWorld.atmosphere.hasAtmosphere && opacity > 0) {
        if (!scene.fog) scene.fog = new THREE.Fog(activeWorld.atmosphere.color, 100, 2500);
        const fog = scene.fog as THREE.Fog;
        fog.color.set(activeWorld.atmosphere.color);
        fog.near = 100 + (alt * 4); // Push fog away as we ascend to clear the view
        fog.far = 2500;
      } else {
        scene.fog = null;
      }
    }
    
    if (planetRef.current) planetRef.current.visible = alt > 100;
    if (groundRef.current) groundRef.current.visible = alt < 2000;
  });

  return (
    <group name="world-manager">
      {/* 1. Transition Controller handles seamless fades when target world changes */}
      <TransitionController 
        targetWorldId={currentWorldId} 
        onTransitionMiddle={handleTransitionMiddle} 
        altitudeRef={altitudeRef}
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

      {/* 3. Atmosphere Sphere (fades with altitude) */}
      <mesh scale={10000} renderOrder={-10}>
        <sphereGeometry args={[1, 128, 128]} />
        <meshBasicMaterial 
          ref={skyMatRef}
          color={activeWorld.atmosphere.color} 
          side={THREE.BackSide} 
          transparent 
          opacity={activeWorld.atmosphere.hasAtmosphere ? activeWorld.atmosphere.density : 0}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>

      {/* 4. Active World Geometry (Massive Planet Spheres in the Background) */}
      <group ref={planetRef} position={[0, -18022, 0]} visible={false}>
        {renderedWorldId === 'earth' && (
          <mesh scale={18000}>
            <sphereGeometry args={[1, 256, 256]} />
            <meshStandardMaterial color="#3b82f6" roughness={0.7} metalness={0.1} />
          </mesh>
        )}
        {renderedWorldId === 'moon' && (
          <mesh scale={18000}>
            <sphereGeometry args={[1, 256, 256]} />
            <meshStandardMaterial color="#d4d4d8" roughness={0.9} metalness={0.1} />
          </mesh>
        )}
        {renderedWorldId === 'mars' && (
          <mesh scale={18000}>
            <sphereGeometry args={[1, 256, 256]} />
            <meshStandardMaterial color="#ef4444" roughness={0.9} metalness={0.1} />
          </mesh>
        )}
      </group>

      {/* 5. Deep Space Background (Always renders, revealed when atmosphere fades) */}
      <group ref={starsRef} position={[0, 0, 0]}>
        <Stars radius={300} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      </group>

      {/* Render environment layers (launch pads) only when close to the ground */}
      <group ref={groundRef} position={[0, 0, 0]} visible={true}>
        {renderedWorldId === 'earth' && <EarthWorld world={WORLDS.earth} />}
        {renderedWorldId === 'moon' && <MoonWorld world={WORLDS.moon} />}
        {renderedWorldId === 'mars' && <MarsWorld world={WORLDS.mars} />}
      </group>
      {renderedWorldId === 'space' && <SpaceWorld world={activeWorld} />}
    </group>
  );
}
