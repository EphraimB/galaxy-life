import { useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface Props {
  targetWorldId: string;
  onTransitionMiddle: (worldId: string) => void;
}

export default function TransitionController({ targetWorldId, onTransitionMiddle }: Props) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.MeshBasicMaterial>(null);
  
  const [phase, setPhase] = useState<'idle' | 'fading_out' | 'fading_in'>('idle');
  const [currentWorldId, setCurrentWorldId] = useState(targetWorldId);

  useEffect(() => {
    if (targetWorldId !== currentWorldId && phase === 'idle') {
      setPhase('fading_out');
    }
  }, [targetWorldId, currentWorldId, phase]);

  useFrame((_, delta) => {
    if (!materialRef.current) return;

    const speed = 2.0; // Fade speed

    if (phase === 'fading_out') {
      materialRef.current.opacity += delta * speed;
      if (materialRef.current.opacity >= 1) {
        materialRef.current.opacity = 1;
        setPhase('fading_in');
        setCurrentWorldId(targetWorldId);
        onTransitionMiddle(targetWorldId);
      }
    } else if (phase === 'fading_in') {
      materialRef.current.opacity -= delta * speed;
      if (materialRef.current.opacity <= 0) {
        materialRef.current.opacity = 0;
        setPhase('idle');
      }
    }
  });

  return (
    <mesh ref={meshRef} renderOrder={999}>
      {/* A sphere just outside the cockpit (radius ~5) to block the view of the environment during transition */}
      {/* Using BackSide so it is visible from the inside */}
      <sphereGeometry args={[4.5, 32, 32]} />
      <meshBasicMaterial 
        ref={materialRef}
        color="#000000" 
        side={THREE.BackSide} 
        transparent 
        opacity={0} 
        depthTest={false}
        depthWrite={false}
      />
    </mesh>
  );
}
