import { PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';

export default function Starship(props: any) {
  // Calculate strut positions based on the window curve
  const windowRadius = 4.0;
  const windowCenterZ = -0.5;
  const windowAngle = 1.25; // How far the window wraps around each side from center
  
  // Left and right strut world positions
  const leftX = Math.sin(Math.PI - windowAngle) * windowRadius;
  const leftZ = windowCenterZ + Math.cos(Math.PI - windowAngle) * windowRadius;
  const leftRotY = Math.PI - windowAngle;

  const rightX = Math.sin(Math.PI + windowAngle) * windowRadius;
  const rightZ = windowCenterZ + Math.cos(Math.PI + windowAngle) * windowRadius;
  const rightRotY = Math.PI + windowAngle;

  return (
    <group position={[0, 0, 0]}>
      {/* 
        Camera positioned at seated pilot eye level. 
        Assuming origin [0,0,0] is the base of the seat/floor in the center.
        Eye level ~ 1.4 units from floor.
        Fixed position (no orbit controls), centered, facing the window.
      */}
      <PerspectiveCamera makeDefault position={[0, 1.4, 0]} fov={65} near={0.1} far={1000} />

      <group name="cockpit-interior">
        {/* ----- Lighting ----- */}
        {/* Soft interior ambient lighting */}
        <ambientLight intensity={0.2} color="#8ab4f8" />
        
        {/* Subtle cool-toned ship lighting (non-UI dependent) */}
        <pointLight position={[0, 2.5, 0]} intensity={0.5} color="#e0f2fe" distance={5} />
        
        {/* One directional light for depth (simulating a distant star or ambient environment light entering) */}
        <directionalLight position={[2, 4, -3]} intensity={0.6} color="#ffffff" castShadow />

        {/* ----- Architecture ----- */}
        {/* Cockpit floor */}
        <mesh position={[0, -0.05, -1]} receiveShadow>
          <boxGeometry args={[7, 0.1, 8]} />
          <meshStandardMaterial color="#0a0a0a" metalness={0.7} roughness={0.6} />
        </mesh>

        {/* Side Panels (Left/Right Walls) */}
        <mesh position={[-3.4, 1.4, -1]} receiveShadow>
          <boxGeometry args={[0.2, 3, 8]} />
          <meshStandardMaterial color="#141414" metalness={0.6} roughness={0.5} />
        </mesh>

        <mesh position={[3.4, 1.4, -1]} receiveShadow>
          <boxGeometry args={[0.2, 3, 8]} />
          <meshStandardMaterial color="#141414" metalness={0.6} roughness={0.5} />
        </mesh>

        {/* Back Wall */}
        <mesh position={[0, 1.4, 2.5]} receiveShadow>
          <boxGeometry args={[7, 3, 0.2]} />
          <meshStandardMaterial color="#111111" metalness={0.5} roughness={0.7} />
        </mesh>

        {/* Ceiling/Roof */}
        <mesh position={[0, 2.8, -1]} receiveShadow>
          <boxGeometry args={[7, 0.2, 8]} />
          <meshStandardMaterial color="#0f0f0f" metalness={0.8} roughness={0.4} />
        </mesh>

        {/* ----- Front Control Area (Minimal Geometry) ----- */}
        {/* Main Dashboard Base (stretching across the bottom of the window) */}
        <mesh position={[0, 0.65, -1.8]} rotation={[-Math.PI / 16, 0, 0]}>
          <boxGeometry args={[5.2, 1.3, 1.4]} />
          <meshStandardMaterial color="#1a1a1a" metalness={0.85} roughness={0.3} />
        </mesh>

        {/* Angled Side Consoles */}
        <mesh position={[-2.4, 0.8, -1.2]} rotation={[-Math.PI / 12, Math.PI / 8, 0]}>
          <boxGeometry args={[1.5, 1.0, 1.5]} />
          <meshStandardMaterial color="#141414" metalness={0.8} roughness={0.3} />
        </mesh>
        <mesh position={[2.4, 0.8, -1.2]} rotation={[-Math.PI / 12, -Math.PI / 8, 0]}>
          <boxGeometry args={[1.5, 1.0, 1.5]} />
          <meshStandardMaterial color="#141414" metalness={0.8} roughness={0.3} />
        </mesh>

        {/* ----- Pilot Seat (Foreground) ----- */}
        <group position={[0, 0, 0.3]}>
          {/* Seat Base */}
          <mesh position={[0, 0.3, 0]}>
            <boxGeometry args={[0.8, 0.6, 0.9]} />
            <meshStandardMaterial color="#0f0f0f" roughness={0.8} />
          </mesh>
          {/* Seat Cushion */}
          <mesh position={[0, 0.65, 0.05]}>
            <boxGeometry args={[0.7, 0.1, 0.7]} />
            <meshStandardMaterial color="#1a1a1a" roughness={0.9} />
          </mesh>
          {/* Backrest */}
          <mesh position={[0, 1.0, 0.4]} rotation={[-0.15, 0, 0]}>
            <boxGeometry args={[0.75, 1.0, 0.2]} />
            <meshStandardMaterial color="#0f0f0f" roughness={0.8} />
          </mesh>
          {/* Headrest */}
          <mesh position={[0, 1.55, 0.48]} rotation={[-0.1, 0, 0]}>
            <boxGeometry args={[0.5, 0.25, 0.15]} />
            <meshStandardMaterial color="#1a1a1a" roughness={0.9} />
          </mesh>
          {/* Left Armrest */}
          <mesh position={[-0.45, 0.7, 0]}>
            <boxGeometry args={[0.15, 0.08, 0.7]} />
            <meshStandardMaterial color="#111111" metalness={0.6} roughness={0.4} />
          </mesh>
          {/* Right Armrest */}
          <mesh position={[0.45, 0.7, 0]}>
            <boxGeometry args={[0.15, 0.08, 0.7]} />
            <meshStandardMaterial color="#111111" metalness={0.6} roughness={0.4} />
          </mesh>
        </group>

        {/* ----- Panoramic Curved Window ----- */}
        {/* Main Top Arch Frame */}
        <mesh position={[0, 2.3, windowCenterZ]}>
          <cylinderGeometry args={[4.05, 4.05, 0.2, 64, 1, true, Math.PI - windowAngle - 0.05, windowAngle * 2 + 0.1]} />
          <meshStandardMaterial color="#1a1a1a" metalness={0.9} roughness={0.4} side={THREE.DoubleSide} />
        </mesh>
        
        {/* Main Bottom Arch Frame */}
        <mesh position={[0, 0.6, windowCenterZ]}>
          <cylinderGeometry args={[4.05, 4.05, 0.2, 64, 1, true, Math.PI - windowAngle - 0.05, windowAngle * 2 + 0.1]} />
          <meshStandardMaterial color="#1a1a1a" metalness={0.9} roughness={0.4} side={THREE.DoubleSide} />
        </mesh>
        
        {/* Vertical Struts bounding the glass (Sides) */}
        <mesh position={[leftX, 1.45, leftZ]} rotation={[0, leftRotY, 0]}>
          <boxGeometry args={[0.2, 1.8, 0.2]} />
          <meshStandardMaterial color="#1a1a1a" metalness={0.9} roughness={0.4} />
        </mesh>
        <mesh position={[rightX, 1.45, rightZ]} rotation={[0, rightRotY, 0]}>
          <boxGeometry args={[0.2, 1.8, 0.2]} />
          <meshStandardMaterial color="#1a1a1a" metalness={0.9} roughness={0.4} />
        </mesh>

        {/* Large Curved Panoramic Window Mesh */}
        {/* We use two offset cylinder geometries to create true structural thickness for the glass */}
        {/* Outer Glass Layer */}
        <mesh position={[0, 1.45, windowCenterZ]}>
          <cylinderGeometry args={[4.03, 4.03, 1.6, 64, 1, true, Math.PI - windowAngle, windowAngle * 2]} />
          <meshPhysicalMaterial 
            color="#ffffff"
            transparent={true}
            opacity={0.15}
            roughness={0}
            metalness={0.6}
            side={THREE.DoubleSide}
          />
        </mesh>
        
        {/* Inner Glass Layer */}
        <mesh position={[0, 1.45, windowCenterZ]}>
          <cylinderGeometry args={[3.97, 3.97, 1.6, 64, 1, true, Math.PI - windowAngle, windowAngle * 2]} />
          <meshPhysicalMaterial 
            color="#dbeafe"
            transparent={true}
            opacity={0.2}
            transmission={0.98}
            thickness={0.06} // Refraction thickness for volumetric realism
            roughness={0.05}
            metalness={0.1}
            clearcoat={1.0}
            clearcoatRoughness={0.1}
            side={THREE.DoubleSide}
          />
        </mesh>

      </group>
    </group>
  );
}
