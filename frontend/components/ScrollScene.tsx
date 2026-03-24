import React, { useRef, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import { useScroll, useTransform, motion, MotionValue } from 'framer-motion';
import * as THREE from 'three';

/* ─── Scene 1: Pen Writing ─── */
const PenWriting = ({ progress }: { progress: number }) => {
  const groupRef = useRef<THREE.Group>(null!);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    // Write motion
    groupRef.current.position.x = Math.sin(t * 1.5) * 0.3;
    groupRef.current.position.y = Math.cos(t * 2) * 0.1;
    groupRef.current.rotation.z = Math.sin(t * 1.5) * 0.1 - 0.3;
  });

  const opacity = progress < 0.3 ? 1 : Math.max(0, 1 - (progress - 0.3) * 5);

  return (
    <group ref={groupRef} scale={opacity > 0 ? 1 : 0}>
      {/* Pen body */}
      <mesh rotation={[0, 0, -0.4]} position={[0, 0.2, 0]}>
        <cylinderGeometry args={[0.04, 0.02, 1.2, 8]} />
        <meshStandardMaterial
          color="#6d28d9"
          roughness={0.2}
          metalness={0.6}
          transparent
          opacity={opacity}
        />
      </mesh>
      {/* Pen tip */}
      <mesh rotation={[0, 0, -0.4]} position={[-0.22, -0.17, 0]}>
        <coneGeometry args={[0.04, 0.15, 8]} />
        <meshStandardMaterial
          color="#fbbf24"
          roughness={0.1}
          metalness={0.9}
          transparent
          opacity={opacity}
        />
      </mesh>
      {/* Writing lines appearing */}
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[-0.3 + i * 0.05, -0.5 - i * 0.15, 0]}>
          <boxGeometry args={[0.8 - i * 0.15, 0.02, 0.01]} />
          <meshStandardMaterial
            color="#e9d5ff"
            transparent
            opacity={opacity * 0.6}
          />
        </mesh>
      ))}
    </group>
  );
};

/* ─── Scene 2: Papers Flying ─── */
const PapersFlying = ({ progress }: { progress: number }) => {
  const groupRef = useRef<THREE.Group>(null!);

  useFrame((state) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y = state.clock.elapsedTime * 0.3;
  });

  const visibility = progress > 0.25 && progress < 0.75;
  const opacity = visibility
    ? progress < 0.4
      ? (progress - 0.25) * 6.67
      : progress > 0.6
        ? (0.75 - progress) * 6.67
        : 1
    : 0;

  return (
    <group ref={groupRef} scale={visibility ? 1 : 0}>
      {[...Array(5)].map((_, i) => {
        const angle = (i / 5) * Math.PI * 2;
        const radius = 0.6;
        return (
          <Float key={i} speed={2 + i * 0.3} rotationIntensity={0.5} floatIntensity={0.8}>
            <mesh
              position={[Math.cos(angle) * radius, Math.sin(angle) * radius * 0.5, Math.sin(angle) * 0.3]}
              rotation={[Math.random() * 0.5, Math.random() * 0.5, angle + Math.PI / 4]}
            >
              <planeGeometry args={[0.4, 0.55]} />
              <meshStandardMaterial
                color="#ffffff"
                roughness={0.5}
                side={THREE.DoubleSide}
                transparent
                opacity={opacity * 0.85}
              />
            </mesh>
          </Float>
        );
      })}
    </group>
  );
};

/* ─── Scene 3: Checkmark ─── */
const Checkmark = ({ progress }: { progress: number }) => {
  const groupRef = useRef<THREE.Group>(null!);

  useFrame((state) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y = state.clock.elapsedTime * 0.5;
    groupRef.current.scale.setScalar(progress > 0.65 ? Math.min(1, (progress - 0.65) * 4) : 0);
  });

  const opacity = progress > 0.65 ? Math.min(1, (progress - 0.65) * 4) : 0;

  return (
    <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.6}>
      <group ref={groupRef}>
        {/* Circle */}
        <mesh>
          <torusGeometry args={[0.6, 0.06, 16, 32]} />
          <meshStandardMaterial
            color="#22c55e"
            roughness={0.2}
            metalness={0.7}
            transparent
            opacity={opacity}
            emissive="#22c55e"
            emissiveIntensity={0.3}
          />
        </mesh>
        {/* Check stroke 1 */}
        <mesh position={[-0.1, -0.05, 0]} rotation={[0, 0, -0.5]}>
          <boxGeometry args={[0.35, 0.08, 0.08]} />
          <meshStandardMaterial
            color="#4ade80"
            roughness={0.2}
            metalness={0.5}
            transparent
            opacity={opacity}
          />
        </mesh>
        {/* Check stroke 2 */}
        <mesh position={[0.2, 0.15, 0]} rotation={[0, 0, 0.7]}>
          <boxGeometry args={[0.5, 0.08, 0.08]} />
          <meshStandardMaterial
            color="#4ade80"
            roughness={0.2}
            metalness={0.5}
            transparent
            opacity={opacity}
          />
        </mesh>
      </group>
    </Float>
  );
};

/* ─── Animated scene controller ─── */
const SceneContent = ({ scrollProgress }: { scrollProgress: number }) => {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[3, 4, 5]} intensity={1} color="#f0abfc" />
      <directionalLight position={[-3, -2, 3]} intensity={0.4} color="#818cf8" />
      <pointLight position={[0, 0, 3]} intensity={0.6} color="#e9d5ff" />

      <PenWriting progress={scrollProgress} />
      <PapersFlying progress={scrollProgress} />
      <Checkmark progress={scrollProgress} />
    </>
  );
};

/* ─── Main ScrollScene component ─── */
interface ScrollSceneProps {
  containerRef: React.RefObject<HTMLElement | null>;
}

const ScrollSceneCanvas: React.FC<{ progress: MotionValue<number> }> = ({ progress }) => {
  const [scrollVal, setScrollVal] = React.useState(0);

  React.useEffect(() => {
    const unsubscribe = progress.on('change', (v) => setScrollVal(v));
    return unsubscribe;
  }, [progress]);

  return (
    <Canvas
      camera={{ position: [0, 0, 2.5], fov: 45 }}
      dpr={[1, 1.5]}
      gl={{ alpha: true, antialias: true }}
    >
      <SceneContent scrollProgress={scrollVal} />
    </Canvas>
  );
};

const ScrollScene: React.FC<ScrollSceneProps> = ({ containerRef }) => {
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  // Labels for each phase
  const labelOpacity1 = useTransform(scrollYProgress, [0, 0.15, 0.3], [1, 1, 0]);
  const labelOpacity2 = useTransform(scrollYProgress, [0.25, 0.4, 0.6, 0.7], [0, 1, 1, 0]);
  const labelOpacity3 = useTransform(scrollYProgress, [0.6, 0.75, 1], [0, 1, 1]);

  return (
    <div className="relative w-full h-[300px]">
      {/* 3D Canvas */}
      <div className="absolute inset-0">
        <Suspense fallback={null}>
          <ScrollSceneCanvas progress={scrollYProgress} />
        </Suspense>
      </div>

      {/* Phase labels */}
      <div className="absolute inset-0 flex items-end justify-center pb-4 pointer-events-none">
        <motion.span style={{ opacity: labelOpacity1 }} className="absolute text-xs font-bold text-[var(--accent)] uppercase tracking-widest">
          ✍️ Writing...
        </motion.span>
        <motion.span style={{ opacity: labelOpacity2 }} className="absolute text-xs font-bold text-fuchsia-400 uppercase tracking-widest">
          📄 Reviewing...
        </motion.span>
        <motion.span style={{ opacity: labelOpacity3 }} className="absolute text-xs font-bold text-emerald-400 uppercase tracking-widest">
          ✅ Delivered!
        </motion.span>
      </div>
    </div>
  );
};

export default ScrollScene;
