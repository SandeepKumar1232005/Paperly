import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';

/* ─── Animated page that flips open ─── */
const FlippingPage: React.FC<{ index: number; total: number }> = ({ index, total }) => {
  const groupRef = useRef<THREE.Group>(null!);
  const delay = index * 0.6;

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;

    // Each page flips at a staggered interval
    const cycle = ((t - delay) % (total * 1.8 + 3)); // total cycle
    const flipProgress = Math.max(0, Math.min(1, (cycle - index * 0.5) * 0.6));
    const angle = flipProgress * Math.PI * 0.85; // 0 → ~153°

    groupRef.current.rotation.y = -angle;
  });

  const pageColor = '#ffffff';

  return (
    <group ref={groupRef} position={[0, 0, 0.005 * index]}>
      {/* pivot at left edge */}
      <mesh position={[0.55, 0, 0]}>
        <boxGeometry args={[1.1, 1.55, 0.008]} />
        <meshStandardMaterial color={pageColor} roughness={0.4} side={THREE.DoubleSide} />
      </mesh>
      {/* Faint text lines */}
      {[...Array(6)].map((_, i) => (
        <mesh key={i} position={[0.55, 0.5 - i * 0.2, 0.005]}>
          <boxGeometry args={[0.7 - (i % 3) * 0.1, 0.015, 0.001]} />
          <meshStandardMaterial
            color={'#d4d4d4'}
            roughness={0.9}
            transparent
            opacity={0.6}
          />
        </mesh>
      ))}
    </group>
  );
};

/* ─── Book covers ─── */
const BookCover = ({ isBack }: { isBack?: boolean }) => {
  return (
    <RoundedBox
      args={[1.2, 1.65, 0.06]}
      radius={0.02}
      smoothness={4}
      position={isBack ? [0.55, 0, -0.04] : [0.55, 0, 0.16]}
    >
      <meshStandardMaterial
        color={isBack ? '#6d28d9' : '#7c3aed'}
        roughness={0.35}
        metalness={0.3}
      />
    </RoundedBox>
  );
};

/* ─── Book spine ─── */
const BookSpine = () => {
  return (
    <mesh position={[0, 0, 0.06]} rotation={[0, 0, 0]}>
      <boxGeometry args={[0.08, 1.65, 0.26]} />
      <meshStandardMaterial color="#5b21b6" roughness={0.4} metalness={0.2} />
    </mesh>
  );
};

/* ─── Title on cover ─── */
const CoverTitle = () => {
  return (
    <group position={[0.55, 0.15, 0.195]}>
      {/* "A+" badge */}
      <mesh position={[0, 0.25, 0]}>
        <boxGeometry args={[0.35, 0.2, 0.005]} />
        <meshStandardMaterial color="#fbbf24" roughness={0.3} metalness={0.5} />
      </mesh>
      {/* Decorative lines */}
      {[0, -0.15, -0.3, -0.45].map((y, i) => (
        <mesh key={i} position={[0, y, 0]}>
          <boxGeometry args={[0.6 - i * 0.08, 0.025, 0.003]} />
          <meshStandardMaterial color="#e9d5ff" roughness={0.5} transparent opacity={0.8} />
        </mesh>
      ))}
    </group>
  );
};

/* ─── Floating paper sheets around the book ─── */
const FloatingPaper = ({ position, rotation, delay }: { position: [number, number, number]; rotation: [number, number, number]; delay: number }) => {
  const meshRef = useRef<THREE.Mesh>(null!);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime + delay;
    meshRef.current.position.y = position[1] + Math.sin(t * 0.8) * 0.15;
    meshRef.current.rotation.z = rotation[2] + Math.sin(t * 0.5) * 0.1;
    meshRef.current.rotation.x = rotation[0] + Math.cos(t * 0.6) * 0.08;
  });

  return (
    <Float speed={1.2} rotationIntensity={0.2} floatIntensity={0.4}>
      <mesh ref={meshRef} position={position} rotation={rotation}>
        <planeGeometry args={[0.5, 0.65]} />
        <meshStandardMaterial
          color="#ffffff"
          roughness={0.5}
          side={THREE.DoubleSide}
          transparent
          opacity={0.8}
        />
      </mesh>
    </Float>
  );
};

/* ─── Sparkle particles ─── */
const Sparkles = () => {
  const count = 40;
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.3) * 4;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 3;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 3;
    }
    return pos;
  }, []);

  const geom = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return g;
  }, [positions]);

  const pointsRef = useRef<THREE.Points>(null!);

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.elapsedTime * 0.03;
    }
  });

  return (
    <points ref={pointsRef} geometry={geom}>
      <pointsMaterial size={0.025} color="#c084fc" transparent opacity={0.6} sizeAttenuation />
    </points>
  );
};

/* ─── Mouse-tracking light ─── */
const MouseLight = () => {
  const lightRef = useRef<THREE.PointLight>(null!);
  const { viewport } = useThree();

  useFrame((state) => {
    if (lightRef.current) {
      lightRef.current.position.x = (state.pointer.x * viewport.width) / 2;
      lightRef.current.position.y = (state.pointer.y * viewport.height) / 2;
    }
  });

  return <pointLight ref={lightRef} intensity={2} color="#e9d5ff" distance={6} />;
};

/* ─── Full book assembly that rotates with the mouse ─── */
const BookAssembly = () => {
  const groupRef = useRef<THREE.Group>(null!);

  useFrame((state) => {
    if (!groupRef.current) return;
    // Gentle idle rotation
    const t = state.clock.elapsedTime;
    const idleY = Math.sin(t * 0.3) * 0.08;
    const idleX = Math.cos(t * 0.25) * 0.04;

    // Mouse influence
    const mouseX = state.pointer.x * 0.15;
    const mouseY = state.pointer.y * 0.1;

    groupRef.current.rotation.y = 0.4 + idleY + mouseX;
    groupRef.current.rotation.x = -0.1 + idleX + mouseY;
  });

  return (
    <Float speed={1} rotationIntensity={0.1} floatIntensity={0.5}>
      <group ref={groupRef} rotation={[0, 0.4, 0]} position={[0.3, 0, 0]}>
        {/* Book */}
        <BookSpine />
        <BookCover isBack />
        {[0, 1, 2, 3].map((i) => (
          <FlippingPage key={i} index={i} total={4} />
        ))}
        <BookCover />
        <CoverTitle />

        {/* Floating papers */}
        <FloatingPaper position={[1.8, 0.6, 0.5]} rotation={[0.2, -0.3, 0.15]} delay={0} />
        <FloatingPaper position={[-0.8, -0.5, 0.8]} rotation={[-0.1, 0.2, -0.2]} delay={1.5} />
        <FloatingPaper position={[1.5, -0.7, -0.5]} rotation={[0.15, 0.4, 0.1]} delay={3} />
      </group>
    </Float>
  );
};

/* ─── Main Canvas ─── */
const BookScene: React.FC = () => {
  return (
    <div className="w-full h-full absolute inset-0" style={{ minHeight: '400px' }}>
      <Canvas
        camera={{ position: [0, 0, 4], fov: 45 }}
        dpr={[1, 1.5]}
        gl={{ alpha: true, antialias: true }}
      >
        {/* Lighting */}
        <ambientLight intensity={0.5} />
        <directionalLight position={[3, 4, 5]} intensity={1.2} color="#f0abfc" castShadow />
        <directionalLight position={[-3, -2, 3]} intensity={0.5} color="#818cf8" />
        <pointLight position={[0, 2, 3]} intensity={0.8} color="#ddd6fe" distance={8} />
        <MouseLight />

        {/* Book */}
        <BookAssembly />

        {/* Sparkles */}
        <Sparkles />
      </Canvas>
    </div>
  );
};

export default BookScene;
