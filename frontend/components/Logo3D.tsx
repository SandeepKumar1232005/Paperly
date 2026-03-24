import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';

const LetterP = () => {
  const groupRef = useRef<THREE.Group>(null!);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.8;
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 1.2) * 0.03;
    }
  });

  // P shape using extruded geometry
  const pShape = new THREE.Shape();
  // Vertical bar
  pShape.moveTo(-0.25, -0.45);
  pShape.lineTo(-0.08, -0.45);
  pShape.lineTo(-0.08, 0.45);
  pShape.lineTo(-0.25, 0.45);
  pShape.lineTo(-0.25, -0.45);

  // Bump/curve of the P
  const bumpShape = new THREE.Shape();
  bumpShape.moveTo(-0.08, 0.45);
  bumpShape.lineTo(0.15, 0.45);
  bumpShape.quadraticCurveTo(0.4, 0.45, 0.4, 0.2);
  bumpShape.quadraticCurveTo(0.4, -0.02, 0.15, -0.02);
  bumpShape.lineTo(-0.08, -0.02);
  bumpShape.lineTo(-0.08, 0.12);
  bumpShape.lineTo(0.1, 0.12);
  bumpShape.quadraticCurveTo(0.22, 0.12, 0.22, 0.22);
  bumpShape.quadraticCurveTo(0.22, 0.32, 0.1, 0.32);
  bumpShape.lineTo(-0.08, 0.32);

  return (
    <Float speed={3} rotationIntensity={0.1} floatIntensity={0.3}>
      <group ref={groupRef} scale={0.9}>
        {/* Main vertical stroke */}
        <mesh>
          <extrudeGeometry args={[pShape, { depth: 0.15, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.02, bevelSegments: 2 }]} />
          <meshStandardMaterial color="#8b5cf6" roughness={0.2} metalness={0.6} />
        </mesh>
        {/* Bump of P */}
        <mesh>
          <extrudeGeometry args={[bumpShape, { depth: 0.15, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.02, bevelSegments: 2 }]} />
          <meshStandardMaterial color="#a855f7" roughness={0.2} metalness={0.6} />
        </mesh>
      </group>
    </Float>
  );
};

const Logo3D: React.FC = () => {
  return (
    <div className="w-10 h-10 relative">
      <Canvas
        camera={{ position: [0, 0, 1.8], fov: 40 }}
        dpr={[1, 2]}
        gl={{ alpha: true, antialias: true }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[2, 2, 3]} intensity={1.2} color="#f0abfc" />
        <pointLight position={[-1, -1, 2]} intensity={0.4} color="#818cf8" />
        <LetterP />
      </Canvas>
    </div>
  );
};

export default Logo3D;
