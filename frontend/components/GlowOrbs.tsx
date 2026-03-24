import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';

const GlowOrb = ({
  position,
  color,
  size = 0.5,
  speed = 1,
  emissiveIntensity = 0.6,
}: {
  position: [number, number, number];
  color: string;
  size?: number;
  speed?: number;
  emissiveIntensity?: number;
}) => {
  const meshRef = useRef<THREE.Mesh>(null!);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime * speed;
    meshRef.current.position.y = position[1] + Math.sin(t * 0.6) * 0.4;
    meshRef.current.position.x = position[0] + Math.cos(t * 0.4) * 0.2;
    meshRef.current.scale.setScalar(size + Math.sin(t * 1.2) * 0.08);
  });

  return (
    <Float speed={speed * 1.5} rotationIntensity={0.1} floatIntensity={0.3}>
      <mesh ref={meshRef} position={position}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial
          color={color}
          roughness={0.1}
          metalness={0.2}
          transparent
          opacity={0.35}
          emissive={color}
          emissiveIntensity={emissiveIntensity}
        />
      </mesh>
      {/* Outer glow ring */}
      <mesh position={position}>
        <sphereGeometry args={[1.4, 24, 24]} />
        <meshStandardMaterial
          color={color}
          transparent
          opacity={0.08}
          emissive={color}
          emissiveIntensity={0.3}
          side={THREE.BackSide}
        />
      </mesh>
    </Float>
  );
};

const GlowOrbs: React.FC = () => {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden" style={{ minHeight: '100%' }}>
      <Canvas
        camera={{ position: [0, 0, 6], fov: 50 }}
        dpr={[1, 1.5]}
        gl={{ alpha: true, antialias: true }}
      >
        <ambientLight intensity={0.2} />
        <pointLight position={[0, 0, 5]} intensity={0.5} color="#c084fc" />

        {/* Large background orbs */}
        <GlowOrb position={[-2.5, 0.5, -2]} color="#8b5cf6" size={0.7} speed={0.6} emissiveIntensity={0.5} />
        <GlowOrb position={[2.8, -0.3, -1.5]} color="#d946ef" size={0.5} speed={0.8} emissiveIntensity={0.4} />
        <GlowOrb position={[0, 1.2, -3]} color="#6366f1" size={0.9} speed={0.4} emissiveIntensity={0.3} />
        <GlowOrb position={[-1.5, -1, -2.5]} color="#c084fc" size={0.4} speed={1} emissiveIntensity={0.6} />
        <GlowOrb position={[1.8, 0.8, -1]} color="#a855f7" size={0.35} speed={0.9} emissiveIntensity={0.7} />

        {/* Small accent orbs */}
        <GlowOrb position={[-3, 1.5, -1]} color="#f0abfc" size={0.2} speed={1.2} emissiveIntensity={0.8} />
        <GlowOrb position={[3.2, -1.2, -2]} color="#818cf8" size={0.25} speed={1.1} emissiveIntensity={0.5} />
      </Canvas>
    </div>
  );
};

export default GlowOrbs;
