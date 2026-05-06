import { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { GestureEvent } from '@/hooks/useGestureEngine';

interface Props {
  gesture: GestureEvent;
  onSelectPlanet: (worldId: string) => void;
}

const PLANETS = [
  { id: 'earth', name: 'EARTH', color: '#3b82f6', posX: -0.6 },
  { id: 'moon', name: 'MOON', color: '#9ca3af', posX: 0 },
  { id: 'mars', name: 'MARS', color: '#ef4444', posX: 0.6 },
];

export default function PlanetHoloMap({ gesture, onSelectPlanet }: Props) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [lockedId, setLockedId] = useState<string | null>(null);
  const hoveredIdRef = useRef<string | null>(null);
  const lockedIdRef = useRef<string | null>(null);
  const groupRef = useRef<THREE.Group>(null);
  
  // Previous gesture type to detect release
  const prevGestureRef = useRef(gesture.type);

  useFrame(() => {
    if (!gesture.primaryPos) {
      setHoveredId(null);
      return;
    }

    // Map 0-1 finger coordinates to the -1 to 1 local space roughly
    // Finger X = 0 (left) to 1 (right). Inverted for mirror:
    const fingerX = (0.5 - gesture.primaryPos.x) * 3.0;
    const fingerY = (0.5 - gesture.primaryPos.y) * 2.0;

    // Check distances
    let closestId = null;
    let minDistance = 0.4; // Threshold

    for (const p of PLANETS) {
      const dist = Math.sqrt(Math.pow(fingerX - p.posX, 2) + Math.pow(fingerY - 0, 2));
      if (dist < minDistance) {
        minDistance = dist;
        closestId = p.id;
      }
    }

    if (hoveredIdRef.current !== closestId) {
      hoveredIdRef.current = closestId;
      setHoveredId(closestId);
    }

    // Handle gesture state transitions
    if (gesture.type === 'pinch' && closestId && !lockedIdRef.current) {
      lockedIdRef.current = closestId;
      setLockedId(closestId);
    }
    
    // Release trigger
    if (prevGestureRef.current !== 'idle' && gesture.type === 'idle') {
      if (lockedIdRef.current) {
        onSelectPlanet(lockedIdRef.current);
        lockedIdRef.current = null;
        setLockedId(null);
      }
    }

    if (gesture.type === 'idle' && lockedIdRef.current) {
      // Cancel lock if moved away and released
      lockedIdRef.current = null;
      setLockedId(null);
    }

    prevGestureRef.current = gesture.type;
  });

  return (
    <group ref={groupRef} position={[0, 0.9, -1.2]} rotation={[-Math.PI / 8, 0, 0]}>
      {/* Base holographic projector plate */}
      <mesh position={[0, -0.2, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.9, 1.0, 32]} />
        <meshBasicMaterial color="#38bdf8" transparent opacity={0.2} side={THREE.DoubleSide} />
      </mesh>

      {PLANETS.map((p) => {
        const isHovered = hoveredId === p.id;
        const isLocked = lockedId === p.id;
        const isPreviewing = isLocked && gesture.type === 'hold';
        
        const scale = isPreviewing ? 1.5 : (isLocked ? 1.2 : (isHovered ? 1.1 : 0.8));
        const opacity = isPreviewing ? 1.0 : (isLocked ? 0.9 : (isHovered ? 0.8 : 0.4));

        return (
          <group key={p.id} position={[p.posX, 0, 0]}>
            <mesh scale={scale}>
              <sphereGeometry args={[0.15, 16, 16]} />
              <meshBasicMaterial color={p.color} transparent opacity={opacity} wireframe />
            </mesh>
            
            {/* Selection ring */}
            {(isHovered || isLocked) && (
              <mesh scale={scale * 1.3} rotation={[Math.PI / 2, 0, 0]}>
                <ringGeometry args={[0.16, 0.18, 32]} />
                <meshBasicMaterial color={isLocked ? '#4ade80' : '#ffffff'} transparent opacity={0.8} side={THREE.DoubleSide} />
              </mesh>
            )}
            
            {/* Holographic text simulation (simple floating line representing text) */}
            {isPreviewing && (
              <mesh position={[0, 0.3, 0]}>
                <boxGeometry args={[0.4, 0.05, 0.01]} />
                <meshBasicMaterial color="#ffffff" />
              </mesh>
            )}
          </group>
        );
      })}
    </group>
  );
}
