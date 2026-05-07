import { WorldDefinition } from '@/lib/worlds';

interface Props {
  world: WorldDefinition;
}

export default function EarthWorld({ world }: Props) {
  return (
    <group name="earth-world">
      {/* Sci-Fi Launch Pad */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
        <planeGeometry args={[5000, 5000]} />
        <meshStandardMaterial color={world.terrain?.groundColor} metalness={0.1} roughness={0.9} />
      </mesh>

      {/* Grid lines on the launch pad */}
      <gridHelper args={[200, 50, world.terrain?.padColor, '#111111']} position={[0, -1.0, 0]} />

      {/* Glowing Launch Pad Ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.98, 0]}>
        <ringGeometry args={[8, 9, 64]} />
        <meshBasicMaterial color={world.terrain?.padColor} transparent opacity={0.5} />
      </mesh>
      
    </group>
  );
}
