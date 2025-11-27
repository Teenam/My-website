import React, { useEffect, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Environment } from '@react-three/drei';
import * as THREE from 'three';
import './StarfieldBackground.css';

// Single white 3D object
const WhiteSphere: React.FC = () => {
    const meshRef = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.rotation.y = state.clock.elapsedTime * 0.2;
            meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.2;

            // Constrained wandering movement (stays on right side)
            meshRef.current.position.x = 3 + Math.sin(state.clock.elapsedTime * 0.5) * 1.5;
            meshRef.current.position.y = Math.cos(state.clock.elapsedTime * 0.3) * 1.2;
        }
    });

    return (
        <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.4}>
            <mesh ref={meshRef} position={[3, 0, 0]}>
                <icosahedronGeometry args={[0.8, 2]} />
                <meshStandardMaterial
                    color="#ffffff"
                    emissive="#ffffff"
                    emissiveIntensity={0.3}
                    roughness={0.1}
                    metalness={0.8}
                />
            </mesh>
        </Float>
    );
};

const StarfieldBackground: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Set canvas size
        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resize();
        window.addEventListener('resize', resize);

        // Create stars
        const stars: { x: number; y: number; size: number; opacity: number; twinkleSpeed: number }[] = [];
        for (let i = 0; i < 200; i++) {
            stars.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                size: Math.random() * 2,
                opacity: Math.random(),
                twinkleSpeed: 0.001 + Math.random() * 0.003
            });
        }

        // Animation
        let frame = 0;
        const animate = () => {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            stars.forEach(star => {
                star.opacity += star.twinkleSpeed;
                if (star.opacity > 1 || star.opacity < 0) {
                    star.twinkleSpeed *= -1;
                }

                ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0, Math.min(1, star.opacity))})`;
                ctx.beginPath();
                ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
                ctx.fill();
            });

            frame++;
            requestAnimationFrame(animate);
        };
        animate();

        return () => {
            window.removeEventListener('resize', resize);
        };
    }, []);

    return (
        <div className="starfield-background">
            <canvas ref={canvasRef} className="starfield-canvas"></canvas>
            <div className="holographic-container">
                <Canvas camera={{ position: [0, 0, 8], fov: 35 }} gl={{ alpha: true, antialias: true }}>
                    <ambientLight intensity={0.5} />
                    <pointLight position={[10, 10, 10]} intensity={1.5} />
                    <Environment preset="city" />
                    <WhiteSphere />
                </Canvas>
            </div>
        </div>
    );
};

export default StarfieldBackground;
