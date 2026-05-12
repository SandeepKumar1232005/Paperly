import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';

/* ─── 3D Clock icon ─── */
const Clock3D = () => {
  const groupRef = useRef<THREE.Group>(null!);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.8) * 0.3;
      groupRef.current.rotation.x = Math.cos(state.clock.elapsedTime * 0.6) * 0.15;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.3} floatIntensity={0.5}>
      <group ref={groupRef}>
        {/* Clock face */}
        <mesh>
          <cylinderGeometry args={[0.7, 0.7, 0.12, 32]} />
          <meshStandardMaterial color="#3b82f6" roughness={0.3} metalness={0.6} />
        </mesh>
        {/* Inner face */}
        <mesh position={[0, 0.065, 0]}>
          <cylinderGeometry args={[0.55, 0.55, 0.01, 32]} />
          <meshStandardMaterial color="#dbeafe" roughness={0.4} />
        </mesh>
        {/* Hour hand */}
        <mesh position={[0, 0.08, 0.15]} rotation={[Math.PI / 2, 0, 0]}>
          <boxGeometry args={[0.06, 0.3, 0.02]} />
          <meshStandardMaterial color="#1e40af" roughness={0.3} />
        </mesh>
        {/* Minute hand */}
        <mesh position={[0.2, 0.08, 0]} rotation={[Math.PI / 2, 0, Math.PI / 2]}>
          <boxGeometry args={[0.04, 0.38, 0.02]} />
          <meshStandardMaterial color="#1e40af" roughness={0.3} />
        </mesh>
        {/* Center dot */}
        <mesh position={[0, 0.09, 0]}>
          <sphereGeometry args={[0.06, 16, 16]} />
          <meshStandardMaterial color="#60a5fa" roughness={0.2} metalness={0.8} />
        </mesh>
      </group>
    </Float>
  );
};

/* ─── 3D Shield icon ─── */
const Shield3D = () => {
  const groupRef = useRef<THREE.Group>(null!);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.7) * 0.25;
      groupRef.current.rotation.x = Math.cos(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });

  // Shield shape using extrude
  const shieldShape = new THREE.Shape();
  shieldShape.moveTo(0, 0.7);
  shieldShape.quadraticCurveTo(0.6, 0.5, 0.55, 0);
  shieldShape.quadraticCurveTo(0.5, -0.5, 0, -0.75);
  shieldShape.quadraticCurveTo(-0.5, -0.5, -0.55, 0);
  shieldShape.quadraticCurveTo(-0.6, 0.5, 0, 0.7);

  return (
    <Float speed={1.8} rotationIntensity={0.25} floatIntensity={0.6}>
      <group ref={groupRef}>
        <mesh>
          <extrudeGeometry args={[shieldShape, { depth: 0.15, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.03, bevelSegments: 3 }]} />
          <meshStandardMaterial color="#8b5cf6" roughness={0.25} metalness={0.5} />
        </mesh>
        {/* Checkmark on shield */}
        <mesh position={[-0.1, -0.05, 0.18]} rotation={[0, 0, -0.3]}>
          <boxGeometry args={[0.3, 0.08, 0.03]} />
          <meshStandardMaterial color="#fbbf24" roughness={0.3} metalness={0.4} />
        </mesh>
        <mesh position={[0.12, 0.12, 0.18]} rotation={[0, 0, 0.7]}>
          <boxGeometry args={[0.45, 0.08, 0.03]} />
          <meshStandardMaterial color="#fbbf24" roughness={0.3} metalness={0.4} />
        </mesh>
      </group>
    </Float>
  );
};

/* ─── 3D Trophy icon ─── */
const Trophy3D = () => {
  const groupRef = useRef<THREE.Group>(null!);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.5;
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.4) * 0.1;
    }
  });

  return (
    <Float speed={2.2} rotationIntensity={0.35} floatIntensity={0.4}>
      <group ref={groupRef}>
        {/* Cup body */}
        <mesh position={[0, 0.15, 0]}>
          <cylinderGeometry args={[0.45, 0.3, 0.6, 16, 1, true]} />
          <meshStandardMaterial color="#f59e0b" roughness={0.2} metalness={0.7} side={THREE.DoubleSide} />
        </mesh>
        {/* Cup bottom */}
        <mesh position={[0, -0.15, 0]}>
          <cylinderGeometry args={[0.3, 0.3, 0.02, 16]} />
          <meshStandardMaterial color="#f59e0b" roughness={0.2} metalness={0.7} />
        </mesh>
        {/* Stem */}
        <mesh position={[0, -0.35, 0]}>
          <cylinderGeometry args={[0.06, 0.06, 0.4, 8]} />
          <meshStandardMaterial color="#d97706" roughness={0.3} metalness={0.6} />
        </mesh>
        {/* Base */}
        <mesh position={[0, -0.55, 0]}>
          <cylinderGeometry args={[0.35, 0.35, 0.08, 16]} />
          <meshStandardMaterial color="#f59e0b" roughness={0.2} metalness={0.7} />
        </mesh>
        {/* Star decoration */}
        <mesh position={[0, 0.25, 0.32]}>
          <octahedronGeometry args={[0.12, 0]} />
          <meshStandardMaterial color="#fde68a" roughness={0.1} metalness={0.9} emissive="#fde68a" emissiveIntensity={0.3} />
        </mesh>
      </group>
    </Float>
  );
};

/* ─── Wrapper component for each 3D icon ─── */
interface FeatureIcon3DProps {
  type: 'clock' | 'shield' | 'trophy';
}

const FeatureIcon3D: React.FC<FeatureIcon3DProps> = ({ type }) => {
  return (
    <div className="w-14 h-14 relative">
      <Canvas
        camera={{ position: [0, 0, 2.5], fov: 40 }}
        dpr={[1, 2]}
        gl={{ alpha: true, antialias: true }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[2, 3, 4]} intensity={1} />
        <pointLight position={[-2, -1, 2]} intensity={0.5} color="#c084fc" />

        {type === 'clock' && <Clock3D />}
        {type === 'shield' && <Shield3D />}
        {type === 'trophy' && <Trophy3D />}
      </Canvas>
    </div>
  );
};

export default FeatureIcon3D;
