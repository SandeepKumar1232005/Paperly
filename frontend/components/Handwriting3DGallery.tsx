import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, RoundedBox, Text, Environment, ContactShadows, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

interface PaperProps {
    url: string;
    position: [number, number, number];
    rotation: [number, number, number];
    index: number;
}

const SamplePaper: React.FC<PaperProps> = ({ url, position, rotation, index }) => {
    const meshRef = useRef<THREE.Mesh>(null!);
    const texture = useMemo(() => new THREE.TextureLoader().load(url), [url]);

    useFrame((state) => {
        if (!meshRef.current) return;
        const t = state.clock.elapsedTime + index * 0.5;
        // Subtle floating movement
        meshRef.current.position.y = position[1] + Math.sin(t * 0.8) * 0.1;
        meshRef.current.rotation.z = rotation[2] + Math.sin(t * 0.3) * 0.05;
    });

    return (
        <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
            <mesh ref={meshRef} position={position} rotation={rotation} castShadow>
                <boxGeometry args={[1, 1.4, 0.01]} />
                {/* Front side with texture, back side plain white */}
                <meshStandardMaterial attach="material-4" map={texture} roughness={0.4} />
                <meshStandardMaterial attach="material-5" color="#ffffff" roughness={0.4} />
                <meshStandardMaterial attach="material-0" color="#ffffff" />
                <meshStandardMaterial attach="material-1" color="#ffffff" />
                <meshStandardMaterial attach="material-2" color="#ffffff" />
                <meshStandardMaterial attach="material-3" color="#ffffff" />
            </mesh>
        </Float>
    );
};

interface Handwriting3DGalleryProps {
    samples: string[];
}

const Handwriting3DGallery: React.FC<Handwriting3DGalleryProps> = ({ samples }) => {
    if (!samples || samples.length === 0) return null;

    return (
        <div className="w-full h-[400px] rounded-2xl overflow-hidden glass shadow-inner relative">
            <Canvas
                shadows
                camera={{ position: [0, 0, 4], fov: 45 }}
                dpr={[1, 2]}
            >
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1} castShadow />
                <spotLight position={[-10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
                
                <group position={[0, -0.2, 0]}>
                    {samples.slice(0, 5).map((url, i) => (
                        <SamplePaper 
                            key={url} 
                            url={url} 
                            index={i}
                            position={[(i - (samples.length - 1) / 2) * 1.2, 0, 0]}
                            rotation={[0, -0.2 + i * 0.1, 0]}
                        />
                    ))}
                </group>

                <ContactShadows 
                    position={[0, -1.5, 0]} 
                    opacity={0.4} 
                    scale={10} 
                    blur={2.5} 
                    far={4} 
                />
                
                <Environment preset="city" />
                <OrbitControls enableZoom={false} enablePan={false} />
            </Canvas>

            {/* Overlay Instructions */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-1.5 rounded-full glass-card text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest pointer-events-none">
                <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                Drag to rotate samples
            </div>
        </div>
    );
};

export default Handwriting3DGallery;
