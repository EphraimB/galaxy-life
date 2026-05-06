import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { HandState } from '@/hooks/useHandTracker';

interface Props {
  facePos?: { x: number; y: number };
  handState: HandState;
}

export default function HUDMirror({ facePos, handState }: Props) {
  const headRef = useRef<THREE.Mesh>(null);
  const leftHandRef = useRef<THREE.Mesh>(null);
  const rightHandRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    // Animate abstract head
    if (headRef.current && facePos) {
      // facePos is 0 to 1. Map to spatial coordinates roughly
      // Invert x because it's a mirror
      const targetX = (0.5 - facePos.x) * 1.5;
      const targetY = (0.5 - facePos.y) * 1.5;
      
      headRef.current.position.x = THREE.MathUtils.lerp(headRef.current.position.x, targetX, 0.1);
      headRef.current.position.y = THREE.MathUtils.lerp(headRef.current.position.y, targetY, 0.1);
      headRef.current.visible = true;
    } else if (headRef.current) {
      headRef.current.visible = false;
    }

    // Animate abstract hands
    if (handState.hands && handState.hands.length > 0) {
      const primary = handState.hands[0];
      if (rightHandRef.current) {
        const tx = (0.5 - primary.fingerPos.x) * 2.0;
        const ty = (0.5 - primary.fingerPos.y) * 2.0;
        rightHandRef.current.position.x = THREE.MathUtils.lerp(rightHandRef.current.position.x, tx, 0.2);
        rightHandRef.current.position.y = THREE.MathUtils.lerp(rightHandRef.current.position.y, ty, 0.2);
        rightHandRef.current.visible = true;
        
        // Scale down if pinching
        const scale = primary.isPinching ? 0.05 : 0.08;
        rightHandRef.current.scale.setScalar(THREE.MathUtils.lerp(rightHandRef.current.scale.x, scale, 0.2));
      }
      
      if (handState.hands.length > 1 && leftHandRef.current) {
        const secondary = handState.hands[1];
        const tx = (0.5 - secondary.fingerPos.x) * 2.0;
        const ty = (0.5 - secondary.fingerPos.y) * 2.0;
        leftHandRef.current.position.x = THREE.MathUtils.lerp(leftHandRef.current.position.x, tx, 0.2);
        leftHandRef.current.position.y = THREE.MathUtils.lerp(leftHandRef.current.position.y, ty, 0.2);
        leftHandRef.current.visible = true;
        
        const scale = secondary.isPinching ? 0.05 : 0.08;
        leftHandRef.current.scale.setScalar(THREE.MathUtils.lerp(leftHandRef.current.scale.x, scale, 0.2));
      } else if (leftHandRef.current) {
        leftHandRef.current.visible = false;
      }
    } else {
      if (rightHandRef.current) rightHandRef.current.visible = false;
      if (leftHandRef.current) leftHandRef.current.visible = false;
    }
  });

  return (
    <group position={[-2.2, 1.4, -1.0]} rotation={[0, Math.PI / 6, 0]}>
      {/* Glass panel backing for the mirror */}
      <mesh position={[0, 0, -0.05]}>
        <planeGeometry args={[1.5, 2]} />
        <meshPhysicalMaterial 
          color="#0f172a" 
          transparent 
          opacity={0.4} 
          roughness={0.1} 
          metalness={0.8}
        />
      </mesh>
      
      <group scale={0.6}>
        {/* Abstract Head */}
        <mesh ref={headRef} visible={false}>
          <boxGeometry args={[0.3, 0.4, 0.1]} />
          <meshBasicMaterial color="#38bdf8" transparent opacity={0.6} wireframe />
        </mesh>

        {/* Abstract Right Hand */}
        <mesh ref={rightHandRef} visible={false}>
          <octahedronGeometry args={[1, 1]} />
          <meshBasicMaterial color="#4ade80" transparent opacity={0.8} wireframe />
        </mesh>

        {/* Abstract Left Hand */}
        <mesh ref={leftHandRef} visible={false}>
          <octahedronGeometry args={[1, 1]} />
          <meshBasicMaterial color="#4ade80" transparent opacity={0.8} wireframe />
        </mesh>
      </group>
    </group>
  );
}
