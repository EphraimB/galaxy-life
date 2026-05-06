import { WorldDefinition } from '@/lib/worlds';
import { Stars } from '@react-three/drei';

interface Props {
  world: WorldDefinition;
}

export default function SpaceWorld({ world }: Props) {
  return (
    <group name="space-world">
      {/* Deep Space Background */}
      <Stars radius={300} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
    </group>
  );
}
