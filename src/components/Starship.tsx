import { PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';

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

  return (
    <group position={[0, 0, 0]}>
      {/* Eye level at 1.4 units. Camera pulled back to z=1.5 to see the pilot seats. Cinematic wide lens. */}
      <PerspectiveCamera makeDefault position={[0, 1.4, 1.5]} fov={60} near={0.5} far={50000} />

      <group name="cockpit-interior">
        {/* ----- 4. Lighting Realism ----- */}
        <ambientLight intensity={0.5} color="#e0f2fe" />

        {/* Ambient interior fill */}
        <pointLight position={[0, 1.8, 1.0]} intensity={2.0} color="#3b82f6" distance={10} decay={2} />

        {/* Subtle Console glow highlights */}
        <rectAreaLight width={6.0} height={0.5} color="#38bdf8" intensity={5.0} position={[0, 0.7, -1.5]} rotation={[-Math.PI / 2, 0, 0]} />

        {/* Strong directional light from outside */}
        <directionalLight position={[-15, 8, -20]} intensity={4.0} color="#ffffff" castShadow shadow-bias={-0.0001} />

        {/* ----- Architecture & Console Frame ----- */}
        {/* We remove the giant boxy floor/ceiling and replace with a sleek curved dashboard sill */}
        
        {/* Sleek, wide, low-profile curved dashboard */}
        <mesh position={[0, 0.3, -2.2]} rotation={[0, 0, 0]} receiveShadow castShadow>
          <cylinderGeometry args={[4.0, 4.2, 0.8, 64, 1, false, Math.PI - 1.2, 2.4]} />
          <meshStandardMaterial color="#0f172a" metalness={0.8} roughness={0.2} />
        </mesh>

        {/* Console upper rim highlight */}
        <mesh position={[0, 0.72, -2.18]} receiveShadow>
          <cylinderGeometry args={[3.95, 4.0, 0.05, 64, 1, false, Math.PI - 1.2, 2.4]} />
          <meshStandardMaterial color="#1e293b" metalness={0.9} roughness={0.1} />
        </mesh>

        {/* ----- Pilot Seats & Foreground Elements ----- */}
        {/* Left Seat Frame */}
        <group position={[-1.0, 0, 0.2]}>
          <mesh position={[0, 0.3, 0]} receiveShadow castShadow>
            <boxGeometry args={[0.9, 0.6, 1.0]} />
            <meshStandardMaterial color="#0f172a" roughness={0.9} />
          </mesh>
          <mesh position={[0, 0.8, 0.3]} rotation={[-0.15, 0, 0]} receiveShadow castShadow>
            <boxGeometry args={[0.8, 1.2, 0.2]} />
            <meshStandardMaterial color="#1e293b" roughness={0.8} />
          </mesh>
          {/* Left Joystick Base */}
          <mesh position={[0, 0.7, -0.6]} receiveShadow castShadow>
            <boxGeometry args={[0.3, 0.4, 0.5]} />
            <meshStandardMaterial color="#334155" metalness={0.6} roughness={0.4} />
          </mesh>
        </group>

        {/* Right Seat Frame */}
        <group position={[1.0, 0, 0.2]}>
          <mesh position={[0, 0.3, 0]} receiveShadow castShadow>
            <boxGeometry args={[0.9, 0.6, 1.0]} />
            <meshStandardMaterial color="#0f172a" roughness={0.9} />
          </mesh>
          <mesh position={[0, 0.8, 0.3]} rotation={[-0.15, 0, 0]} receiveShadow castShadow>
            <boxGeometry args={[0.8, 1.2, 0.2]} />
            <meshStandardMaterial color="#1e293b" roughness={0.8} />
          </mesh>
          {/* Right Joystick Base */}
          <mesh position={[0, 0.7, -0.6]} receiveShadow castShadow>
            <boxGeometry args={[0.3, 0.4, 0.5]} />
            <meshStandardMaterial color="#334155" metalness={0.6} roughness={0.4} />
          </mesh>
        </group>

        {/* Camera is at [0, 1.4, 0] so it sits perfectly between the two seats! */}

        {/* ----- 3. Window Realism ----- */}
        {/* Top Arch Frame */}
        <mesh position={[0, 2.5, windowCenterZ]} receiveShadow castShadow>
          <cylinderGeometry args={[windowRadius + 0.1, windowRadius + 0.1, 0.3, 64, 1, true, Math.PI - windowAngle - 0.05, windowAngle * 2 + 0.1]} />
          <meshStandardMaterial color="#0f172a" metalness={0.8} roughness={0.3} side={THREE.DoubleSide} />
        </mesh>

        {/* Bottom Arch Frame */}
        <mesh position={[0, 0.6, windowCenterZ]} receiveShadow castShadow>
          <cylinderGeometry args={[windowRadius + 0.1, windowRadius + 0.1, 0.3, 64, 1, true, Math.PI - windowAngle - 0.05, windowAngle * 2 + 0.1]} />
          <meshStandardMaterial color="#0f172a" metalness={0.8} roughness={0.3} side={THREE.DoubleSide} />
        </mesh>

        {/* Vertical Struts - Pushed out wide to match panoramic view */}
        <mesh position={[leftX, 1.55, leftZ]} rotation={[0, leftRotY, 0]} receiveShadow castShadow>
          <boxGeometry args={[0.3, 2.0, 0.3]} />
          <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.3} />
        </mesh>
        <mesh position={[rightX, 1.55, rightZ]} rotation={[0, rightRotY, 0]} receiveShadow castShadow>
          <boxGeometry args={[0.3, 2.0, 0.3]} />
          <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.3} />
        </mesh>

        {/* Outer Glass Layer */}
        <mesh position={[0, 1.55, windowCenterZ]}>
          <cylinderGeometry args={[windowRadius, windowRadius, 1.8, 64, 1, true, Math.PI - windowAngle, windowAngle * 2]} />
          <meshPhysicalMaterial
            color="#ffffff"
            transmission={0.9}
            thickness={0.5}
            roughness={0.1}
            metalness={0.1}
            transparent={true}
            opacity={1}
            side={THREE.DoubleSide}
          />
        </mesh>



      </group>
    </group>
  );
}
