import { useRef, useState, useMemo, Suspense } from "react";
import { Canvas, useFrame, ThreeEvent } from "@react-three/fiber";
import { OrbitControls, Html, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import type { Mission } from "../../types/mission";

interface LandingSite {
  mission: Mission;
  position: THREE.Vector3;
}

// NASA's Moon GLB model has radius ~1737 units — we normalise to r=1
const MODEL_SCALE = 1 / 1737;

function latLonToVec3(lat: number, lon: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}

function LandingMarker({
  site,
  onSelect,
  selected,
}: {
  site: LandingSite;
  onSelect: (m: Mission | null) => void;
  selected: boolean;
}) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const [hovered, setHovered] = useState(false);
  const isUS = site.mission.country === "US";

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.scale.setScalar(
        1 + Math.sin(Date.now() * 0.003) * (selected || hovered ? 0.4 : 0.15)
      );
    }
  });

  return (
    <group position={site.position}>
      <mesh
        ref={meshRef}
        onPointerEnter={(e: ThreeEvent<PointerEvent>) => { e.stopPropagation(); setHovered(true); }}
        onPointerLeave={() => setHovered(false)}
        onClick={(e: ThreeEvent<MouseEvent>) => { e.stopPropagation(); onSelect(selected ? null : site.mission); }}
      >
        <sphereGeometry args={[0.025, 8, 8]} />
        <meshStandardMaterial
          color={isUS ? "#3b82f6" : "#ef4444"}
          emissive={isUS ? "#1d4ed8" : "#b91c1c"}
          emissiveIntensity={selected || hovered ? 2 : 0.8}
        />
      </mesh>
      {(hovered || selected) && (
        <Html distanceFactor={6} style={{ pointerEvents: "none" }}>
          <div className={`px-2 py-1 rounded text-xs whitespace-nowrap font-medium ${
            isUS
              ? "bg-blue-900/90 text-blue-100 border border-blue-500/50"
              : "bg-red-900/90 text-red-100 border border-red-500/50"
          }`}>
            {site.mission.name}
          </div>
        </Html>
      )}
    </group>
  );
}

function NasaMoon() {
  const groupRef = useRef<THREE.Group>(null!);
  const { scene } = useGLTF("/moon.glb");

  useFrame((_, delta) => {
    groupRef.current.rotation.y += delta * 0.03;
  });

  return (
    <group ref={groupRef} scale={[MODEL_SCALE, MODEL_SCALE, MODEL_SCALE]}>
      <primitive object={scene} />
    </group>
  );
}

function FallbackMoon() {
  const ref = useRef<THREE.Mesh>(null!);
  useFrame((_, delta) => { ref.current.rotation.y += delta * 0.03; });
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[1, 48, 48]} />
      <meshStandardMaterial color="#7a7a78" roughness={0.95} metalness={0.0} />
    </mesh>
  );
}

function Moon({ missions, onSelect, selectedId }: {
  missions: Mission[];
  onSelect: (m: Mission | null) => void;
  selectedId: string | null;
}) {
  const sites: LandingSite[] = useMemo(() =>
    missions
      .filter((m) => m.landing_coords)
      .map((m) => ({
        mission: m,
        position: latLonToVec3(m.landing_coords!.lat, m.landing_coords!.lon, 1.02),
      })),
    [missions]
  );

  return (
    <>
      <ambientLight intensity={0.2} />
      <directionalLight position={[5, 3, 5]} intensity={1.4} color="#fff5e0" />
      <directionalLight position={[-8, -2, -5]} intensity={0.08} color="#4488ff" />

      <Suspense fallback={<FallbackMoon />}>
        <NasaMoon />
      </Suspense>

      {sites.map((site) => (
        <LandingMarker
          key={site.mission.id}
          site={site}
          onSelect={onSelect}
          selected={selectedId === site.mission.id}
        />
      ))}
    </>
  );
}

export default function MoonGlobe({
  missions,
  onMissionSelect,
}: {
  missions: Mission[];
  onMissionSelect?: (m: Mission | null) => void;
}) {
  const [selected, setSelected] = useState<Mission | null>(null);

  const handleSelect = (m: Mission | null) => {
    setSelected(m);
    onMissionSelect?.(m);
  };

  return (
    <div className="relative w-full h-full">
      <Canvas camera={{ position: [0, 0, 2.4], fov: 45 }}>
        <Moon missions={missions} onSelect={handleSelect} selectedId={selected?.id ?? null} />
        <OrbitControls
          enableZoom
          minDistance={1.5}
          maxDistance={6}
          autoRotate={!selected}
          autoRotateSpeed={0.4}
          enableDamping
        />
      </Canvas>

      <div className="absolute bottom-4 left-4 flex gap-4 text-xs text-slate-400">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" /> 美国任务
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-red-500 inline-block" /> 中国任务
        </span>
        <span className="text-slate-500">拖动旋转 · 滚轮缩放</span>
      </div>
    </div>
  );
}
