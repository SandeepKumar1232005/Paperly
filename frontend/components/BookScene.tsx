import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, Icosahedron, Torus, Sphere, Environment, MeshTransmissionMaterial } from '@react-three/drei';
import * as THREE from 'three';

/* ─── Central Glass Crystal ─── */
const Crystal = () => {
  const meshRef = useRef<THREE.Mesh>(null!);
  
  useFrame((state) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.x = state.clock.elapsedTime * 0.15;
    meshRef.current.rotation.y = state.clock.elapsedTime * 0.2;
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
      <Icosahedron ref={meshRef} args={[1.3, 0]} position={[0, 0, 0]}>
        <MeshTransmissionMaterial 
          backside
          samples={4}
          thickness={1.5}
          chromaticAberration={0.2}
          anisotropy={0.3}
          distortion={0.2}
          distortionScale={0.3}
          temporalDistortion={0.1}
          ior={1.5}
          color="#d8b4fe"
          resolution={512}
        />
      </Icosahedron>
      {/* Inner solid core for contrast */}
      <Icosahedron args={[0.7, 1]} position={[0, 0, 0]}>
        <meshStandardMaterial 
          color="#6d28d9" 
          metalness={0.8} 
          roughness={0.2} 
          emissive="#4c1d95"
          emissiveIntensity={0.5}
        />
      </Icosahedron>
    </Float>
  );
};

/* ─── Orbiting Neon Rings ─── */
const OrbitingRings = () => {
  const groupRef1 = useRef<THREE.Group>(null!);
  const groupRef2 = useRef<THREE.Group>(null!);

  useFrame((state) => {
    if (groupRef1.current) {
      groupRef1.current.rotation.y = state.clock.elapsedTime * 0.3;
      groupRef1.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.5;
    }
    if (groupRef2.current) {
      groupRef2.current.rotation.x = state.clock.elapsedTime * 0.2;
      groupRef2.current.rotation.z = Math.cos(state.clock.elapsedTime * 0.3) * 0.5;
    }
  });

  return (
    <>
      <group ref={groupRef1}>
        <Torus args={[2.2, 0.015, 16, 100]} rotation={[Math.PI / 2, 0, 0]}>
          <meshStandardMaterial color="#f0abfc" metalness={0.9} roughness={0.1} emissive="#d8b4fe" emissiveIntensity={0.5} />
        </Torus>
      </group>
      <group ref={groupRef2}>
        <Torus args={[2.8, 0.015, 16, 100]} rotation={[0, Math.PI / 2, 0]}>
          <meshStandardMaterial color="#818cf8" metalness={0.9} roughness={0.1} emissive="#818cf8" emissiveIntensity={0.5} />
        </Torus>
      </group>
    </>
  );
};

/* ─── Floating Glowing Orbs ─── */
const FloatingOrbs = () => {
  const orbs = useMemo(() => {
    return Array.from({ length: 8 }).map(() => ({
      position: [
        (Math.random() - 0.5) * 6,
        (Math.random() - 0.5) * 6,
        (Math.random() - 0.5) * 6
      ] as [number, number, number],
      scale: Math.random() * 0.15 + 0.05,
      speed: Math.random() * 2 + 1,
      color: Math.random() > 0.5 ? "#c084fc" : "#60a5fa"
    }));
  }, []);

  return (
    <>
      {orbs.map((orb, i) => (
        <Float key={i} speed={orb.speed} rotationIntensity={1} floatIntensity={2}>
          <Sphere args={[orb.scale, 16, 16]} position={orb.position}>
            <meshStandardMaterial 
              color={orb.color} 
              emissive={orb.color} 
              emissiveIntensity={1} 
              toneMapped={false} 
            />
          </Sphere>
        </Float>
      ))}
    </>
  );
};

/* ─── Mouse-tracking light ─── */
const MouseLight = () => {
  const lightRef = useRef<THREE.PointLight>(null!);
  const { viewport } = useThree();

  useFrame((state) => {
    if (lightRef.current) {
      // Smoothly interpolate light position towards mouse
      lightRef.current.position.x = THREE.MathUtils.lerp(lightRef.current.position.x, (state.pointer.x * viewport.width) / 2, 0.1);
      lightRef.current.position.y = THREE.MathUtils.lerp(lightRef.current.position.y, (state.pointer.y * viewport.height) / 2, 0.1);
    }
  });

  return <pointLight ref={lightRef} intensity={3} color="#ffffff" distance={10} position={[0, 0, 2]} />;
};

/* ─── Main Scene Assembly ─── */
const SceneAssembly = () => {
  const groupRef = useRef<THREE.Group>(null!);

  useFrame((state) => {
    if (!groupRef.current) return;
    const mouseX = state.pointer.x * 0.2;
    const mouseY = state.pointer.y * 0.2;
    
    // Rotate the entire scene slightly based on mouse
    groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, mouseX, 0.05);
    groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, -mouseY, 0.05);
  });

  return (
    <group ref={groupRef}>
      <Crystal />
      <OrbitingRings />
      <FloatingOrbs />
    </group>
  );
};

/* ─── Main Canvas ─── */
const BookScene: React.FC = () => {
  return (
    <div className="w-full h-full absolute inset-0" style={{ minHeight: '500px' }}>
      <Canvas
        camera={{ position: [0, 0, 6], fov: 45 }}
        dpr={[1, 2]}
        gl={{ alpha: true, antialias: true }}
      >
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 5, 5]} intensity={1.5} color="#e9d5ff" castShadow />
        <directionalLight position={[-5, -5, -5]} intensity={0.8} color="#818cf8" />
        <pointLight position={[0, 0, 0]} intensity={2} color="#a855f7" distance={5} />
        
        <MouseLight />
        <SceneAssembly />
      </Canvas>
    </div>
  );
};

export default BookScene;
