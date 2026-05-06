import { PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';

export default function Starship(props: any) {
  // 1. Spatial Realism: Tighten cockpit scale for a believable human fit
  const windowRadius = 2.8; 
  const windowCenterZ = -0.2;
  const windowAngle = 1.1; // Narrower wrap for a more intimate, realistic cabin
  
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
        2. Camera Refinement
        Eye level at 1.4 units. 
        Reduced FOV to 50 for a cinematic, 50mm lens feel (avoids fisheye/gamey look).
      */}
      <PerspectiveCamera makeDefault position={[0, 1.4, 0]} fov={50} near={0.1} far={1000} />

      <group name="cockpit-interior">
        {/* ----- 4. Lighting Realism ----- */}
        {/* Greatly reduced flat ambient lighting to enhance shadow depth */}
        <ambientLight intensity={0.02} color="#8ab4f8" />
        
        {/* Physically motivated dashboard instrument glow with accurate falloff (decay) */}
        <pointLight position={[0, 0.8, -1.2]} intensity={1.5} color="#4ade80" distance={3} decay={2} />
        
        {/* Subtle interior overhead fill, cast slightly behind pilot */}
        <pointLight position={[0, 2.2, 0.5]} intensity={0.8} color="#e0f2fe" distance={4} decay={2} />
        
        {/* Strong directional light from outside (e.g. a distant star) to cast dramatic window shadows into the cockpit */}
        <directionalLight position={[-8, 3, -10]} intensity={1.5} color="#ffffff" castShadow />

        {/* ----- Architecture ----- */}
        <mesh position={[0, -0.05, -1]} receiveShadow>
          <boxGeometry args={[6, 0.1, 6]} />
          {/* 5. Material Realism: Matte, scuffed-looking floor */}
          <meshStandardMaterial color="#080808" metalness={0.4} roughness={0.8} />
        </mesh>

        <mesh position={[-2.8, 1.4, -1]} receiveShadow>
          <boxGeometry args={[0.2, 3, 6]} />
          <meshStandardMaterial color="#111111" metalness={0.6} roughness={0.6} />
        </mesh>

        <mesh position={[2.8, 1.4, -1]} receiveShadow>
          <boxGeometry args={[0.2, 3, 6]} />
          <meshStandardMaterial color="#111111" metalness={0.6} roughness={0.6} />
        </mesh>

        <mesh position={[0, 1.4, 2.0]} receiveShadow>
          <boxGeometry args={[6, 3, 0.2]} />
          <meshStandardMaterial color="#0f0f0f" metalness={0.5} roughness={0.7} />
        </mesh>

        <mesh position={[0, 2.8, -1]} receiveShadow>
          <boxGeometry args={[6, 0.2, 6]} />
          <meshStandardMaterial color="#0a0a0a" metalness={0.7} roughness={0.5} />
        </mesh>

        {/* ----- Front Control Area ----- */}
        {/* Pulled slightly closer to pilot for reachability */}
        <mesh position={[0, 0.65, -1.4]} rotation={[-Math.PI / 16, 0, 0]} receiveShadow castShadow>
          <boxGeometry args={[4.2, 1.2, 1.2]} />
          <meshStandardMaterial color="#141414" metalness={0.85} roughness={0.4} />
        </mesh>

        <mesh position={[-1.8, 0.8, -1.0]} rotation={[-Math.PI / 12, Math.PI / 8, 0]} receiveShadow castShadow>
          <boxGeometry args={[1.2, 1.0, 1.2]} />
          <meshStandardMaterial color="#111111" metalness={0.8} roughness={0.4} />
        </mesh>
        <mesh position={[1.8, 0.8, -1.0]} rotation={[-Math.PI / 12, -Math.PI / 8, 0]} receiveShadow castShadow>
          <boxGeometry args={[1.2, 1.0, 1.2]} />
          <meshStandardMaterial color="#111111" metalness={0.8} roughness={0.4} />
        </mesh>

        {/* ----- Pilot Seat ----- */}
        <group position={[0, 0, 0.2]}>
          <mesh position={[0, 0.3, 0]} receiveShadow castShadow>
            <boxGeometry args={[0.8, 0.6, 0.9]} />
            <meshStandardMaterial color="#0c0c0c" roughness={0.85} />
          </mesh>
          <mesh position={[0, 0.65, 0.05]} receiveShadow castShadow>
            <boxGeometry args={[0.7, 0.1, 0.7]} />
            <meshStandardMaterial color="#141414" roughness={0.9} />
          </mesh>
          <mesh position={[0, 1.0, 0.4]} rotation={[-0.15, 0, 0]} receiveShadow castShadow>
            <boxGeometry args={[0.75, 1.0, 0.2]} />
            <meshStandardMaterial color="#0c0c0c" roughness={0.85} />
          </mesh>
          <mesh position={[0, 1.55, 0.48]} rotation={[-0.1, 0, 0]} receiveShadow castShadow>
            <boxGeometry args={[0.5, 0.25, 0.15]} />
            <meshStandardMaterial color="#141414" roughness={0.9} />
          </mesh>
          <mesh position={[-0.45, 0.7, 0]} receiveShadow castShadow>
            <boxGeometry args={[0.15, 0.08, 0.7]} />
            <meshStandardMaterial color="#0a0a0a" metalness={0.6} roughness={0.5} />
          </mesh>
          <mesh position={[0.45, 0.7, 0]} receiveShadow castShadow>
            <boxGeometry args={[0.15, 0.08, 0.7]} />
            <meshStandardMaterial color="#0a0a0a" metalness={0.6} roughness={0.5} />
          </mesh>
        </group>

        {/* ----- 3. Window Realism ----- */}
        {/* Top Arch Frame */}
        <mesh position={[0, 2.3, windowCenterZ]} receiveShadow castShadow>
          <cylinderGeometry args={[windowRadius + 0.05, windowRadius + 0.05, 0.2, 64, 1, true, Math.PI - windowAngle - 0.05, windowAngle * 2 + 0.1]} />
          <meshStandardMaterial color="#141414" metalness={0.9} roughness={0.3} side={THREE.DoubleSide} />
        </mesh>
        
        {/* Bottom Arch Frame */}
        <mesh position={[0, 0.6, windowCenterZ]} receiveShadow castShadow>
          <cylinderGeometry args={[windowRadius + 0.05, windowRadius + 0.05, 0.2, 64, 1, true, Math.PI - windowAngle - 0.05, windowAngle * 2 + 0.1]} />
          <meshStandardMaterial color="#141414" metalness={0.9} roughness={0.3} side={THREE.DoubleSide} />
        </mesh>
        
        {/* Vertical Struts */}
        <mesh position={[leftX, 1.45, leftZ]} rotation={[0, leftRotY, 0]} receiveShadow castShadow>
          <boxGeometry args={[0.2, 1.8, 0.2]} />
          {/* Brushed metal feel */}
          <meshStandardMaterial color="#141414" metalness={0.9} roughness={0.3} />
        </mesh>
        <mesh position={[rightX, 1.45, rightZ]} rotation={[0, rightRotY, 0]} receiveShadow castShadow>
          <boxGeometry args={[0.2, 1.8, 0.2]} />
          <meshStandardMaterial color="#141414" metalness={0.9} roughness={0.3} />
        </mesh>

        {/* Outer Glass Layer */}
        <mesh position={[0, 1.45, windowCenterZ]}>
          <cylinderGeometry args={[windowRadius + 0.03, windowRadius + 0.03, 1.6, 64, 1, true, Math.PI - windowAngle, windowAngle * 2]} />
          <meshPhysicalMaterial 
            color="#ffffff"
            transparent={true}
            opacity={0.1}
            roughness={0}
            metalness={0.8}
            side={THREE.DoubleSide}
          />
        </mesh>
        
        {/* Inner Glass Layer (Volumetric properties) */}
        <mesh position={[0, 1.45, windowCenterZ]}>
          <cylinderGeometry args={[windowRadius - 0.03, windowRadius - 0.03, 1.6, 64, 1, true, Math.PI - windowAngle, windowAngle * 2]} />
          <meshPhysicalMaterial 
            color="#dbeafe"
            transparent={true}
            opacity={0.15}
            transmission={0.98}
            thickness={0.15} // Increased thickness for heavier physical refraction
            ior={1.5} // Accurate index of refraction for glass
            roughness={0.03} // Slight roughness so it's not perfectly invisible
            metalness={0.1}
            clearcoat={1.0}
            clearcoatRoughness={0.05}
            side={THREE.DoubleSide}
          />
        </mesh>

      </group>
    </group>
  );
}
