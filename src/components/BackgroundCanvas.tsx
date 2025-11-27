import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { MeshTransmissionMaterial, Environment, Float } from '@react-three/drei';
import * as THREE from 'three';

const Sphere = ({ position, scale, speed, phase }: { position: [number, number, number], scale: number, speed: number, phase: number }) => {
    const meshRef = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        if (!meshRef.current) return;
        const time = state.clock.getElapsedTime();

        // Gentle floating animation
        meshRef.current.position.y = position[1] + Math.sin(time * speed + phase) * 0.5;
        meshRef.current.rotation.x = time * speed * 0.5;
        meshRef.current.rotation.y = time * speed * 0.3;
    });

    return (
        <Float speed={speed * 2} rotationIntensity={0.5} floatIntensity={0.5}>
            <mesh ref={meshRef} position={position} scale={scale}>
                <sphereGeometry args={[1.5, 32, 32]} /> {/* Lower poly for performance */}
                <MeshTransmissionMaterial
                    backside={false}
                    samples={2}
                    resolution={256}
                    transmission={1}
                    thickness={3}
                    chromaticAberration={0.3}
                    anisotropy={0.3}
                    distortion={0.2}
                    distortionScale={0.2}
                    temporalDistortion={0.1}
                    iridescence={1}
                    iridescenceIOR={1.5}
                    iridescenceThicknessRange={[0, 1400]}
                    roughness={0.1}
                    clearcoat={1}
                    color="#ffffff"
                    envMapIntensity={1}
                />
            </mesh>
        </Float>
    );
};

const BackgroundCanvas = () => {
    // Generate random spheres
    const spheres = useMemo(() => {
        return Array.from({ length: 8 }).map(() => ({
            position: [
                (Math.random() - 0.5) * 35,
                (Math.random() - 0.5) * 35,
                (Math.random() - 0.5) * 20 - 10
            ] as [number, number, number],
            scale: Math.random() * 1.0 + 0.5,
            speed: Math.random() * 0.5 + 0.2,
            phase: Math.random() * Math.PI * 2
        }));
    }, []);

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: -1, background: 'radial-gradient(circle at 50% 50%, #1a1a1a 0%, #000000 100%)' }}>
            <Canvas camera={{ position: [0, 0, 15], fov: 45 }} gl={{ alpha: true, antialias: true }}>
                <ambientLight intensity={0.5} />
                <pointLight position={[20, 20, 20]} intensity={1.5} />
                <pointLight position={[-20, -10, -10]} intensity={1} color="#a8c0ff" />

                <Environment preset="city" />

                {spheres.map((props, i) => (
                    <Sphere key={i} {...props} />
                ))}
            </Canvas>
        </div>
    );
};

export default BackgroundCanvas;
