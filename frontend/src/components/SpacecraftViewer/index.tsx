import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";
import * as THREE from "three";

function ApolloModel() {
  const group = useRef<THREE.Group>(null!);
  useFrame((_, d) => { group.current.rotation.y += d * 0.3; });

  return (
    <group ref={group}>
      {/* Command Module (cone) */}
      <mesh position={[0, 1.1, 0]}>
        <coneGeometry args={[0.45, 0.9, 12]} />
        <meshStandardMaterial color="#c0c8d0" metalness={0.6} roughness={0.4} />
      </mesh>
      {/* Service Module (cylinder) */}
      <mesh position={[0, 0.2, 0]}>
        <cylinderGeometry args={[0.42, 0.42, 1.4, 16]} />
        <meshStandardMaterial color="#8a9aaa" metalness={0.5} roughness={0.5} />
      </mesh>
      {/* Engine nozzle */}
      <mesh position={[0, -0.65, 0]}>
        <cylinderGeometry args={[0.15, 0.35, 0.5, 12]} />
        <meshStandardMaterial color="#666" metalness={0.8} roughness={0.3} />
      </mesh>
      {/* Solar panels */}
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * 0.9, 0.2, 0]}>
          <boxGeometry args={[0.9, 0.06, 0.5]} />
          <meshStandardMaterial color="#1a3a6e" metalness={0.3} roughness={0.6} emissive="#0a1a3a" emissiveIntensity={0.3} />
        </mesh>
      ))}
    </group>
  );
}

function LunarModuleModel() {
  const group = useRef<THREE.Group>(null!);
  useFrame((_, d) => { group.current.rotation.y += d * 0.25; });

  return (
    <group ref={group}>
      {/* Ascent stage */}
      <mesh position={[0, 0.55, 0]}>
        <boxGeometry args={[0.8, 0.6, 0.8]} />
        <meshStandardMaterial color="#d4aa44" metalness={0.3} roughness={0.7} />
      </mesh>
      {/* Descent stage */}
      <mesh position={[0, -0.1, 0]}>
        <cylinderGeometry args={[0.55, 0.65, 0.7, 8]} />
        <meshStandardMaterial color="#8a8060" metalness={0.2} roughness={0.8} />
      </mesh>
      {/* Landing legs */}
      {[0, 1, 2, 3].map((i) => {
        const angle = (i / 4) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(angle) * 0.7, -0.55, Math.sin(angle) * 0.7]}
            rotation={[0, 0, Math.cos(angle) * 0.5]}>
            <cylinderGeometry args={[0.03, 0.03, 0.7, 6]} />
            <meshStandardMaterial color="#888" metalness={0.5} roughness={0.5} />
          </mesh>
        );
      })}
    </group>
  );
}

function YutuRoverModel() {
  const group = useRef<THREE.Group>(null!);
  useFrame((_, d) => { group.current.rotation.y += d * 0.25; });

  return (
    <group ref={group}>
      {/* Body */}
      <mesh>
        <boxGeometry args={[0.9, 0.3, 0.7]} />
        <meshStandardMaterial color="#f0c830" metalness={0.2} roughness={0.5} />
      </mesh>
      {/* Solar panels - folded back */}
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * 0.75, 0.1, 0]} rotation={[0, 0, side * 0.3]}>
          <boxGeometry args={[0.5, 0.04, 0.65]} />
          <meshStandardMaterial color="#2a5aaa" emissive="#1a3a7a" emissiveIntensity={0.6} />
        </mesh>
      ))}
      {/* Mast / camera */}
      <mesh position={[0.2, 0.35, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 0.45, 6]} />
        <meshStandardMaterial color="#aaa" metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[0.2, 0.6, 0]}>
        <boxGeometry args={[0.15, 0.1, 0.15]} />
        <meshStandardMaterial color="#555" metalness={0.5} roughness={0.5} />
      </mesh>
      {/* Wheels */}
      {[-0.35, 0, 0.35].flatMap((x) =>
        [-0.42, 0.42].map((z) => (
          <mesh key={`${x}-${z}`} position={[x, -0.22, z]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.12, 0.12, 0.08, 12]} />
            <meshStandardMaterial color="#333" metalness={0.4} roughness={0.8} />
          </mesh>
        ))
      )}
    </group>
  );
}

function OrionModel() {
  const group = useRef<THREE.Group>(null!);
  useFrame((_, d) => { group.current.rotation.y += d * 0.2; });

  return (
    <group ref={group}>
      {/* Crew module */}
      <mesh position={[0, 0.9, 0]}>
        <coneGeometry args={[0.55, 1.0, 12]} />
        <meshStandardMaterial color="#c8d0d8" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* European Service Module */}
      <mesh position={[0, -0.1, 0]}>
        <cylinderGeometry args={[0.5, 0.5, 1.6, 16]} />
        <meshStandardMaterial color="#7a8a9a" metalness={0.5} roughness={0.5} />
      </mesh>
      {/* Large solar arrays (4 panels) */}
      {[0, 1, 2, 3].map((i) => {
        const angle = (i / 4) * Math.PI * 2;
        return (
          <mesh key={i}
            position={[Math.cos(angle) * 1.3, -0.1, Math.sin(angle) * 1.3]}
            rotation={[0, angle, 0]}>
            <boxGeometry args={[1.2, 0.05, 0.45]} />
            <meshStandardMaterial color="#1a3a6e" emissive="#0a1a3a" emissiveIntensity={0.3} />
          </mesh>
        );
      })}
    </group>
  );
}

function GenericProbeModel() {
  const group = useRef<THREE.Group>(null!);
  useFrame((_, d) => { group.current.rotation.y += d * 0.3; });

  return (
    <group ref={group}>
      <mesh>
        <octahedronGeometry args={[0.5]} />
        <meshStandardMaterial color="#8a9aaa" metalness={0.6} roughness={0.4} wireframe={false} />
      </mesh>
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * 0.9, 0, 0]}>
          <boxGeometry args={[0.8, 0.05, 0.4]} />
          <meshStandardMaterial color="#1a3a6e" emissive="#0a1a3a" emissiveIntensity={0.4} />
        </mesh>
      ))}
    </group>
  );
}

const MODEL_MAP: Record<string, () => JSX.Element> = {
  apollo: LunarModuleModel,
  apollo_rover: LunarModuleModel,
  yutu: YutuRoverModel,
  yutu2: YutuRoverModel,
  orion: OrionModel,
  starship_hls: GenericProbeModel,
  orbiter: GenericProbeModel,
  orbiter_cn: GenericProbeModel,
  probe: GenericProbeModel,
  lander: GenericProbeModel,
  change5: GenericProbeModel,
  change7: GenericProbeModel,
};

export default function SpacecraftViewer({ modelType }: { modelType: string }) {
  const ModelComponent = MODEL_MAP[modelType] ?? GenericProbeModel;

  return (
    <Canvas
      camera={{ position: [0, 0.5, 3.5], fov: 40 }}
      gl={{ alpha: true }}
      style={{ background: "transparent" }}
    >
      <ambientLight intensity={1.8} />
      <directionalLight position={[4, 6, 4]} intensity={2.0} color="#ffffff" />
      <directionalLight position={[-4, 2, -3]} intensity={1.0} color="#c8d8ff" />
      <directionalLight position={[0, -4, 2]} intensity={0.5} color="#ffffff" />
      <ModelComponent />
      <OrbitControls enableZoom={true} minDistance={1.5} maxDistance={8} enableDamping autoRotate={false} />
    </Canvas>
  );
}
