import { WorldDefinition } from '@/lib/worlds';
import { Stars, ContactShadows } from '@react-three/drei';

interface Props {
  world: WorldDefinition;
}

export default function EarthWorld({ world }: Props) {
  return (
    <group name="earth-world">
      {/* Sci-Fi Launch Pad */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial color={world.terrain?.groundColor} metalness={0.8} roughness={0.4} />
      </mesh>

      {/* Grid lines on the launch pad */}
      <gridHelper args={[200, 50, world.terrain?.padColor, '#111111']} position={[0, -1.99, 0]} />

      {/* Glowing Launch Pad Ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.98, 0]}>
        <ringGeometry args={[8, 9, 64]} />
        <meshBasicMaterial color={world.terrain?.padColor} transparent opacity={0.5} />
      </mesh>

      <ContactShadows position={[0, -1.99, 0]} opacity={0.6} scale={20} blur={1} far={4} />
      
      {/* Deep Space Background for when atmosphere fades out */}
      <Stars radius={300} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
    </group>
  );
}
