import { PerspectiveCamera, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';

import { HUDManager3D } from './hud/HUDManager';

export default function Starship(props: any) {
  // 1. Spatial Realism: Cinematic, wide panoramic cockpit
  const windowRadius = 4.5;
  const windowCenterZ = -0.5;
  const windowAngle = 1.3; // Much wider wrap

  // Left and right strut world positions
  const leftX = Math.sin(Math.PI - windowAngle) * windowRadius;
  const leftZ = windowCenterZ + Math.cos(Math.PI - windowAngle) * windowRadius;
  const leftRotY = Math.PI - windowAngle;

  const rightX = Math.sin(Math.PI + windowAngle) * windowRadius;
  const rightZ = windowCenterZ + Math.cos(Math.PI + windowAngle) * windowRadius;
  const rightRotY = Math.PI + windowAngle;

  const cameraGroupRef = useRef<THREE.Group>(null);
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame(() => {
    if (!cameraGroupRef.current) return;
    
    // Parallax effect based on face position
    const targetCamRot = new THREE.Vector3(0, 0, 0);
    const targetCamPos = new THREE.Vector3(0, 1.4, 0.5); // Moved camera forward into the center seat
    
    if (props.facePos) {
      targetCamRot.y = props.facePos.x * 0.3; // Look left/right
      targetCamRot.x = props.facePos.y * 0.3; // Look up/down
      
      targetCamPos.x = props.facePos.x * 0.2; // Lean left/right
      targetCamPos.y = 1.4 + props.facePos.y * 0.2; // Lean up/down
    }

    cameraGroupRef.current.rotation.x = THREE.MathUtils.lerp(cameraGroupRef.current.rotation.x, targetCamRot.x, 0.1);
    cameraGroupRef.current.rotation.y = THREE.MathUtils.lerp(cameraGroupRef.current.rotation.y, targetCamRot.y, 0.1);
    cameraGroupRef.current.position.x = THREE.MathUtils.lerp(cameraGroupRef.current.position.x, targetCamPos.x, 0.1);
    cameraGroupRef.current.position.y = THREE.MathUtils.lerp(cameraGroupRef.current.position.y, targetCamPos.y, 0.1);
  });

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    
    // Altitude Simulation via Ref to avoid 60fps React state update choking
    if (props.flightState === 'launching') {
      props.altitudeRef.current += delta * 1000;
      if (props.altitudeRef.current >= 5000) {
        props.altitudeRef.current = 5000;
        if (props.onFlightStateChange) props.onFlightStateChange('orbiting');
      }
    } else if (props.flightState === 'descending') {
      props.altitudeRef.current -= delta * 1000;
      if (props.altitudeRef.current <= 0) {
        props.altitudeRef.current = 0;
        if (props.onFlightStateChange) props.onFlightStateChange('landed');
      }
    }
    
    // Bind the physical Y position to the altitude
    groupRef.current.position.y = 0.4 + props.altitudeRef.current;
  });

  return (
    <group ref={groupRef} position={[0, 0.4, 0]}> {/* Raised by 0.4 so the floor clears the terrain at y=0 */}
      {/* Eye level at 1.4 units. Camera pushed forward to z=0.5 to sit in the pilot seat. */}
      <group ref={cameraGroupRef} position={[0, 1.4, 0.5]}>
        <PerspectiveCamera makeDefault position={[0, 0, 0]} fov={60} near={0.5} far={25000} />
      </group>

      {/* Fallback mouse navigation for users without webcam enabled */}
      {!props.facePos && (
        <OrbitControls 
          target={[0, 1.4, 0]} 
          minAzimuthAngle={-Math.PI / 3} 
          maxAzimuthAngle={Math.PI / 3} 
          minPolarAngle={Math.PI / 3} 
          maxPolarAngle={Math.PI / 1.5} 
          enableZoom={false} 
          enablePan={false} 
        />
      )}

      <group name="cockpit-interior">
        {/* ----- 4. Lighting Realism ----- */}
        <ambientLight intensity={0.5} color="#e0f2fe" />

        {/* Ambient interior fill */}
        <pointLight position={[0, 1.8, 1.0]} intensity={2.0} color="#3b82f6" distance={10} decay={2} />

        {/* Subtle Console glow highlights */}
        <rectAreaLight width={6.0} height={0.5} color="#38bdf8" intensity={5.0} position={[0, 0.7, -1.5]} rotation={[-Math.PI / 2, 0, 0]} />

        {/* Directional light from outside (Sunlight through window) */}
        <directionalLight position={[-15, 8, -20]} intensity={1.5} color="#ffffff" castShadow shadow-bias={-0.0001} />

        {/* ----- Architecture & Console Frame ----- */}
        {/* We remove the giant boxy floor/ceiling and replace with a sleek curved dashboard sill */}
        
        {/* Sleek, wide, low-profile curved dashboard */}
        <mesh position={[0, 0.3, -2.2]} rotation={[0, 0, 0]}>
          <cylinderGeometry args={[4.0, 4.2, 0.8, 64, 1, false, Math.PI - 1.2, 2.4]} />
          <meshStandardMaterial color="#0f172a" metalness={0.3} roughness={0.8} />
        </mesh>

        {/* Console upper rim highlight */}
        <mesh position={[0, 0.72, -2.18]}>
          <cylinderGeometry args={[3.95, 4.0, 0.05, 64, 1, false, Math.PI - 1.2, 2.4]} />
          <meshStandardMaterial color="#1e293b" metalness={0.5} roughness={0.5} />
        </mesh>

        {/* ----- Pilot Seat & Foreground Elements ----- */}
        {/* Single Center Seat - pushed back so the camera doesn't clip into it */}
        <group position={[0, 0, 1.2]}>
          <mesh position={[0, 0.3, 0]}>
            <boxGeometry args={[0.9, 0.6, 1.0]} />
            <meshStandardMaterial color="#0f172a" roughness={0.9} />
          </mesh>
          <mesh position={[0, 0.8, 0.4]} rotation={[-0.15, 0, 0]}>
            <boxGeometry args={[0.8, 1.2, 0.2]} />
            <meshStandardMaterial color="#1e293b" roughness={0.8} />
          </mesh>
        </group>
        
        {/* Main Center Console / Joystick Base */}
        <mesh position={[0, 0.7, -0.6]}>
          <boxGeometry args={[0.6, 0.4, 0.5]} />
          <meshStandardMaterial color="#334155" metalness={0.6} roughness={0.4} />
        </mesh>

        {/* ----- 3. Window Realism ----- */}
        {/* Top Arch Frame */}
        <mesh position={[0, 2.5, windowCenterZ]}>
          <cylinderGeometry args={[windowRadius + 0.1, windowRadius + 0.1, 0.3, 64, 1, true, Math.PI - windowAngle - 0.05, windowAngle * 2 + 0.1]} />
          <meshStandardMaterial color="#0f172a" metalness={0.8} roughness={0.3} side={THREE.DoubleSide} />
        </mesh>

        {/* Bottom Arch Frame */}
        <mesh position={[0, 0.6, windowCenterZ]}>
          <cylinderGeometry args={[windowRadius + 0.1, windowRadius + 0.1, 0.3, 64, 1, true, Math.PI - windowAngle - 0.05, windowAngle * 2 + 0.1]} />
          <meshStandardMaterial color="#0f172a" metalness={0.8} roughness={0.3} side={THREE.DoubleSide} />
        </mesh>

        {/* Vertical Struts - Pushed out wide to match panoramic view */}
        <mesh position={[leftX, 1.55, leftZ]} rotation={[0, leftRotY, 0]}>
          <boxGeometry args={[0.3, 2.0, 0.3]} />
          <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.3} />
        </mesh>
        <mesh position={[rightX, 1.55, rightZ]} rotation={[0, rightRotY, 0]}>
          <boxGeometry args={[0.3, 2.0, 0.3]} />
          <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.3} />
        </mesh>

        {/* Outer Glass Layer removed to prevent massive specular glare */}

        {/* ----- 5. Cockpit Enclosure (Back walls, Floor, Ceiling) ----- */}
        {/* Rear Hull Wall */}
        <mesh position={[0, 1.55, windowCenterZ]}>
           <cylinderGeometry args={[windowRadius, windowRadius, 3.8, 64, 1, false, Math.PI + windowAngle, Math.PI * 2 - windowAngle * 2]} />
           <meshStandardMaterial color="#0f172a" side={THREE.DoubleSide} metalness={0.8} roughness={0.4} />
        </mesh>
        
        {/* Floor */}
        <mesh position={[0, -0.35, windowCenterZ]} rotation={[-Math.PI/2, 0, 0]}>
           <circleGeometry args={[windowRadius, 64]} />
           <meshStandardMaterial color="#0b1121" metalness={0.1} roughness={0.9} side={THREE.DoubleSide} />
        </mesh>

        {/* Ceiling */}
        <mesh position={[0, 3.45, windowCenterZ]} rotation={[Math.PI/2, 0, 0]}>
           <circleGeometry args={[windowRadius, 64]} />
           <meshStandardMaterial color="#0b1121" metalness={0.9} roughness={0.2} side={THREE.DoubleSide} />
        </mesh>

        {/* HUDManager inside the cockpit perfectly tracks the ship */}
        {props.active && props.handState && (
          <HUDManager3D 
            handState={props.handState} 
            facePos={props.facePos} 
            isFaceTracking={props.isFaceTracking} 
            userData={props.userData}
            currentPlanetId={props.currentPlanetId}
            flightState={props.flightState}
            onLaunch={() => props.onFlightStateChange('launching')}
            onDescend={() => props.onFlightStateChange('descending')}
            onWarp={(planetId: string) => {
              props.onPlanetChange(planetId);
              props.onFlightStateChange('orbiting');
            }}
          />
        )}
      </group>
    </group>
  );
}
