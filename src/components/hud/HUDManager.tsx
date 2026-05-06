import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { HandState } from '@/hooks/useHandTracker';
import { useGestureEngine } from '@/hooks/useGestureEngine';
import { usePostureAwareness } from '@/hooks/usePostureAwareness';
import HUDMirror from './HUDMirror';
import PlanetHoloMap from './PlanetHoloMap';

interface Props {
  handState: HandState;
  facePos?: { x: number; y: number };
  isFaceTracking: boolean;
  onSelectPlanet: (worldId: string) => void;
}

export default function HUDManager({ handState, facePos, isFaceTracking, onSelectPlanet }: Props) {
  const groupRef = useRef<THREE.Group>(null);
  
  const gesture = useGestureEngine(handState);
  const posture = usePostureAwareness({ facePos, isTracking: isFaceTracking });

  useFrame(() => {
    if (!groupRef.current) return;

    // Ergonomic shift based on posture
    // If standing, tilt HUD up slightly so they can look down at it or see it clearly
    // If seated, keep it neutral
    const targetRotX = posture === 'standing' ? -Math.PI / 16 : 0;
    const targetPosY = posture === 'standing' ? 0.2 : 0;
    
    groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetRotX, 0.05);
    groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetPosY, 0.05);
  });

  return (
    <group ref={groupRef}>
      {/* Abstract mirror/silhouette */}
      <HUDMirror facePos={facePos} handState={handState} />
      
      {/* Interactive holographic map */}
      <PlanetHoloMap gesture={gesture} onSelectPlanet={onSelectPlanet} />
      
      {/* Gestural UI Debug/Status text in 3D */}
      <mesh position={[0, 0.5, -1.2]} rotation={[-Math.PI/16, 0, 0]}>
        <boxGeometry args={[1.5, 0.02, 0.01]} />
        <meshBasicMaterial color={gesture.type !== 'idle' ? '#4ade80' : '#475569'} />
      </mesh>
    </group>
  );
}
