import React, { useRef, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, RoundedBox, Torus, Icosahedron, Octahedron, Sphere, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { motion, useScroll, useTransform, MotionValue } from 'framer-motion';

/* ─── Scene 1: Energy Core Assembling ─── */
const CoreConnecting = ({ progress }: { progress: number }) => {
  const groupRef = useRef<THREE.Group>(null!);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    groupRef.current.rotation.y = t * 0.5;
    groupRef.current.rotation.x = Math.sin(t * 0.3) * 0.2;
  });

  const opacity = progress < 0.35 ? 1 : Math.max(0, 1 - (progress - 0.35) * 5);

  return (
    <group ref={groupRef} scale={opacity > 0 ? 1 : 0}>
      <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
        <Sphere args={[0.3, 32, 32]}>
          <MeshDistortMaterial
            color="#c084fc"
            emissive="#a855f7"
            emissiveIntensity={1.5}
            distort={0.4}
            speed={2}
            roughness={0.2}
            transparent
            opacity={opacity}
          />
        </Sphere>
        {/* Orbital Rings */}
        <Torus args={[0.5, 0.015, 16, 64]} rotation={[Math.PI / 2, 0.2, 0]}>
          <meshStandardMaterial color="#f0abfc" emissive="#f0abfc" emissiveIntensity={2} transparent opacity={opacity * 0.8} />
        </Torus>
        <Torus args={[0.6, 0.015, 16, 64]} rotation={[0.2, Math.PI / 2, 0]}>
          <meshStandardMaterial color="#67e8f9" emissive="#67e8f9" emissiveIntensity={2} transparent opacity={opacity * 0.5} />
        </Torus>
      </Float>
    </group>
  );
};

/* ─── Scene 2: Crystal Constellation Processing ─── */
const CoreProcessing = ({ progress }: { progress: number }) => {
  const groupRef = useRef<THREE.Group>(null!);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    groupRef.current.rotation.y = t * 0.4;
    groupRef.current.rotation.z = Math.sin(t * 0.2) * 0.3;
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
          <Float key={i} speed={3} rotationIntensity={2} floatIntensity={2}>
            <group
              position={[Math.cos(angle) * radius, Math.sin(angle * 2) * 0.3, Math.sin(angle) * radius]}
              rotation={[Math.random(), Math.random(), angle]}
            >
              <Icosahedron args={[0.15, 0]}>
                <meshPhysicalMaterial
                  color="#ffffff"
                  roughness={0.1}
                  metalness={0.8}
                  transmission={0.9}
                  ior={1.5}
                  thickness={0.5}
                  clearcoat={1}
                  transparent
                  opacity={opacity}
                />
              </Icosahedron>
              {/* Inner glowing core of each crystal */}
              <Sphere args={[0.05]} position={[0,0,0]}>
                 <meshStandardMaterial color={i % 2 === 0 ? "#c084fc" : "#67e8f9"} emissive={i % 2 === 0 ? "#c084fc" : "#67e8f9"} emissiveIntensity={3} transparent opacity={opacity} />
              </Sphere>
            </group>
          </Float>
        );
      })}
    </group>
  );
};

/* ─── Scene 3: Success Diamond ─── */
const CoreComplete = ({ progress }: { progress: number }) => {
  const groupRef = useRef<THREE.Group>(null!);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    groupRef.current.rotation.y = t * 0.8;
    groupRef.current.position.y = Math.sin(t * 2) * 0.1;
  });

  const opacity = progress > 0.65 ? Math.min(1, (progress - 0.65) * 4) : 0;

  return (
    <group ref={groupRef} scale={opacity > 0 ? 1 : 0}>
      <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
        <Octahedron args={[0.4, 0]}>
          <meshPhysicalMaterial
            color="#a7f3d0"
            roughness={0.1}
            metalness={0.5}
            transmission={0.8}
            ior={1.2}
            clearcoat={1}
            transparent
            opacity={opacity}
          />
        </Octahedron>
        <Octahedron args={[0.2, 0]}>
           <meshStandardMaterial color="#34d399" emissive="#10b981" emissiveIntensity={3} transparent opacity={opacity} />
        </Octahedron>
        
        {/* Success Rings */}
        <Torus args={[0.7, 0.02, 16, 64]} rotation={[Math.PI/2, 0, 0]}>
          <meshStandardMaterial color="#6ee7b7" emissive="#34d399" emissiveIntensity={2} transparent opacity={opacity} />
        </Torus>
      </Float>
    </group>
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

      <CoreConnecting progress={scrollProgress} />
      <CoreProcessing progress={scrollProgress} />
      <CoreComplete progress={scrollProgress} />
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
    offset: ['start start', 'end end'],
  });

  // Labels for each phase
  const labelOpacity1 = useTransform(scrollYProgress, [0, 0.15, 0.3], [1, 1, 0]);
  const labelOpacity2 = useTransform(scrollYProgress, [0.25, 0.4, 0.6, 0.7], [0, 1, 1, 0]);
  const labelOpacity3 = useTransform(scrollYProgress, [0.6, 0.75, 1], [0, 1, 1]);

  return (
    <div className="relative w-full h-[400px]">
      {/* 3D Canvas */}
      <div className="absolute inset-0">
        <Suspense fallback={null}>
          <ScrollSceneCanvas progress={scrollYProgress} />
        </Suspense>
      </div>

      {/* Phase labels */}
      <div className="absolute inset-0 flex items-end justify-center pb-4 pointer-events-none">
        <motion.span style={{ opacity: labelOpacity1 }} className="absolute text-xs font-bold text-[var(--accent)] uppercase tracking-widest">
          ✍️ Writing by Hand...
        </motion.span>
        <motion.span style={{ opacity: labelOpacity2 }} className="absolute text-xs font-bold text-fuchsia-400 uppercase tracking-widest">
          📦 Courier Dispatched...
        </motion.span>
        <motion.span style={{ opacity: labelOpacity3 }} className="absolute text-xs font-bold text-emerald-400 uppercase tracking-widest">
          🚪 Delivered to Door!
        </motion.span>
      </div>
    </div>
  );
};

export default ScrollScene;
