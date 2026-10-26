import { Canvas, useFrame } from "@react-three/fiber";
import { Sparkles, Stars, Float } from "@react-three/drei";
import { useMemo, useRef } from "react";
import * as THREE from "three";

type Props = { scroll: { current: number }; mouse: { current: { x: number; y: number } } };

function glowTexture(inner: string, outer: string) {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const g = c.getContext("2d")!;
  const grad = g.createRadialGradient(128, 128, 0, 128, 128, 128);
  grad.addColorStop(0, inner);
  grad.addColorStop(0.4, outer);
  grad.addColorStop(1, "rgba(0,0,0,0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, 256, 256);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function Nebula({ scroll }: Pick<Props, "scroll">) {
  const group = useRef<THREE.Group>(null);
  const textures = useMemo(
    () => [
      glowTexture("rgba(120,170,255,0.55)", "rgba(60,90,200,0.18)"),
      glowTexture("rgba(150,230,240,0.45)", "rgba(40,120,160,0.15)"),
      glowTexture("rgba(200,180,255,0.4)", "rgba(80,60,160,0.12)"),
    ],
    [],
  );
  const clouds = useMemo(
    () => [
      { p: [-14, 6, -40], s: 40, t: 0 },
      { p: [16, -8, -50], s: 50, t: 1 },
      { p: [0, -30, -45], s: 45, t: 2 },
      { p: [-20, -50, -55], s: 55, t: 0 },
      { p: [18, -70, -40], s: 42, t: 1 },
    ] as const,
    [],
  );
  useFrame((s) => {
    if (!group.current) return;
    group.current.rotation.z = s.clock.elapsedTime * 0.01 + scroll.current * 0.6;
    group.current.position.x = Math.sin(scroll.current * Math.PI) * 4;
  });
  return (
    <group ref={group}>
      {clouds.map((c, i) => (
        <sprite key={i} position={c.p as unknown as THREE.Vector3Tuple} scale={[c.s, c.s, 1]}>
          <spriteMaterial map={textures[c.t] ?? null} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
        </sprite>
      ))}
    </group>
  );
}

function Planet({ pos, r, color, ring, speed }: { pos: THREE.Vector3Tuple; r: number; color: string; ring?: boolean; speed: number }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, d) => {
    if (ref.current) ref.current.rotation.y += d * speed;
  });
  return (
    <Float speed={0.6} floatIntensity={1.5} rotationIntensity={0.2}>
      <group ref={ref} position={pos}>
        <mesh>
          <sphereGeometry args={[r, 48, 48]} />
          <meshStandardMaterial color={color} roughness={0.75} metalness={0.1} emissive={color} emissiveIntensity={0.08} />
        </mesh>
        <mesh scale={1.12}>
          <sphereGeometry args={[r, 32, 32]} />
          <meshBasicMaterial color={color} transparent opacity={0.08} side={THREE.BackSide} />
        </mesh>
        {ring && (
          <mesh rotation={[Math.PI / 2.4, 0, 0]}>
            <ringGeometry args={[r * 1.4, r * 2.1, 96]} />
            <meshBasicMaterial color={color} transparent opacity={0.25} side={THREE.DoubleSide} />
          </mesh>
        )}
      </group>
    </Float>
  );
}

function AICore({ mouse }: Props) {
  const outer = useRef<THREE.Mesh>(null);
  const inner = useRef<THREE.Mesh>(null);
  const rings = useRef<THREE.Group>(null);
  const halo = useMemo(() => glowTexture("rgba(255,255,255,0.9)", "rgba(110,180,255,0.35)"), []);
  const haloRef = useRef<THREE.Sprite>(null);
  useFrame((s, d) => {
    const t = s.clock.elapsedTime;
    if (outer.current) {
      outer.current.rotation.x += d * 0.15 + mouse.current.y * d * 0.6;
      outer.current.rotation.y += d * 0.2 + mouse.current.x * d * 0.6;
    }
    if (inner.current) {
      const p = 1 + Math.sin(t * 2) * 0.06;
      inner.current.scale.setScalar(p);
    }
    if (rings.current) {
      rings.current.rotation.z += d * 0.3;
      rings.current.rotation.x = 1.2 + mouse.current.y * 0.3;
      rings.current.rotation.y = mouse.current.x * 0.3;
    }
    if (haloRef.current) {
      const h = 7 + Math.sin(t * 2) * 0.5;
      haloRef.current.scale.set(h, h, 1);
    }
  });
  return (
    <group position={[2.6, 0, 0]}>
      <sprite ref={haloRef}>
        <spriteMaterial map={halo} transparent depthWrite={false} blending={THREE.AdditiveBlending} opacity={0.9} />
      </sprite>
      <mesh ref={inner}>
        <icosahedronGeometry args={[0.9, 4]} />
        <meshStandardMaterial color="#bcd9ff" emissive="#3f86ff" emissiveIntensity={1.4} roughness={0.2} />
      </mesh>
      <mesh ref={outer}>
        <icosahedronGeometry args={[1.6, 1]} />
        <meshStandardMaterial color="#2f6fe0" wireframe transparent opacity={0.45} emissive="#5aa8ff" emissiveIntensity={0.6} />
      </mesh>
      <group ref={rings}>
        {[2.2, 2.7, 3.2].map((r, i) => (
          <mesh key={r} rotation={[0, i * 0.5, 0]}>
            <torusGeometry args={[r, 0.008, 8, 160]} />
            <meshBasicMaterial color="#3a78e0" transparent opacity={0.6 - i * 0.12} />
          </mesh>
        ))}
      </group>
      <Sparkles count={60} scale={5} size={2.5} speed={0.6} color="#4f8fff" />
    </group>
  );
}

function Rig({ mouse, scroll }: Props) {
  useFrame((s, d) => {
    const cam = s.camera;
    const k = 1 - Math.exp(-3 * Math.min(d, 0.05));
    const targetY = -scroll.current * 80;
    cam.position.x += (mouse.current.x * 1.2 - cam.position.x) * k;
    cam.position.y += (targetY + mouse.current.y * 0.8 - cam.position.y) * k;
    cam.position.z = 10 - Math.sin(scroll.current * Math.PI) * 2;
    cam.lookAt(mouse.current.x * 0.3, targetY, -10);
  });
  return null;
}

function StarField({ scroll }: Pick<Props, "scroll">) {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, d) => {
    if (!ref.current) return;
    ref.current.rotation.y += d * 0.008;
    ref.current.rotation.x = scroll.current * 0.8;
  });
  return (
    <group ref={ref}>
      <Stars radius={120} depth={80} count={4000} factor={4} saturation={0} fade speed={0.6} />
    </group>
  );
}

export default function Universe(props: Props) {
  return (
    <Canvas
      dpr={[1, 1.75]}
      camera={{ position: [0, 0, 10], fov: 55 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
    >
      <ambientLight intensity={0.35} />
      <pointLight position={[2.6, 0, 2]} intensity={30} color="#9fd2ff" distance={20} />
      <directionalLight position={[10, 10, 5]} intensity={1.2} color="#ffffff" />
      <Rig {...props} />
      <StarField scroll={props.scroll} />
      <Nebula scroll={props.scroll} />
      <AICore {...props} />
      <Sparkles count={250} scale={[40, 120, 20]} position={[0, -40, -5]} size={1.6} speed={0.25} color="#cfe6ff" opacity={0.6} />
      <Planet pos={[-9, -14, -12]} r={2.2} color="#6f9dff" ring speed={0.08} />
      <Planet pos={[10, -32, -18]} r={3.2} color="#3a5fb8" speed={0.05} />
      <Planet pos={[-11, -52, -14]} r={1.6} color="#a7e3ea" speed={0.12} />
      <Planet pos={[9, -70, -10]} r={2.6} color="#8a7fd6" ring speed={0.06} />
    </Canvas>
  );
}
