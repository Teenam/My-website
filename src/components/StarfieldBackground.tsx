import React, { useEffect, useRef, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { Float, Environment } from '@react-three/drei';
import './StarfieldBackground.css';

// Optimized 3D objects with reduced count
const RandomObjects: React.FC = () => {
    const objects = useMemo(() => {
        const shapes = ['box', 'tetrahedron', 'octahedron', 'dodecahedron'];
        return Array.from({ length: 12 }, () => ({
            position: [
                (Math.random() - 0.5) * 14,
                (Math.random() - 0.5) * 8,
                (Math.random() - 0.5) * 4
            ] as [number, number, number],
            rotation: [
                Math.random() * Math.PI,
                Math.random() * Math.PI,
                Math.random() * Math.PI
            ] as [number, number, number],
            scale: 0.2 + Math.random() * 0.4,
            shape: shapes[Math.floor(Math.random() * shapes.length)],
            speed: 0.5 + Math.random() * 1
        }));
    }, []);

    return (
        <>
            {objects.map((obj, i) => (
                <Float key={i} speed={obj.speed} rotationIntensity={1} floatIntensity={1}>
                    <mesh position={obj.position} rotation={obj.rotation} scale={obj.scale}>
                        {obj.shape === 'box' && <boxGeometry args={[1, 1, 1]} />}
                        {obj.shape === 'tetrahedron' && <tetrahedronGeometry args={[1]} />}
                        {obj.shape === 'octahedron' && <octahedronGeometry args={[1]} />}
                        {obj.shape === 'dodecahedron' && <dodecahedronGeometry args={[1]} />}
                        <meshStandardMaterial
                            color="#ffffff"
                            roughness={0.4}
                            metalness={0.2}
                            emissive="#ffffff"
                            emissiveIntensity={0.1}
                        />
                    </mesh>
                </Float>
            ))}
        </>
    );
};

const StarfieldBackground: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Optimized starfield with reduced count
    const stars = useMemo(() =>
        Array.from({ length: 150 }, () => ({
            x: Math.random(),
            y: Math.random(),
            size: Math.random() * 2,
            opacity: Math.random(),
            twinkleSpeed: 0.001 + Math.random() * 0.003
        })),
        []
    );

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resize();
        window.addEventListener('resize', resize);

        // Normalized star positions
        const normalizedStars = stars.map(star => ({
            ...star,
            x: star.x * canvas.width,
            y: star.y * canvas.height
        }));

        let rafId: number;
        const animate = () => {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            normalizedStars.forEach(star => {
                star.opacity += star.twinkleSpeed;
                if (star.opacity > 1 || star.opacity < 0) {
                    star.twinkleSpeed *= -1;
                }

                const clampedOpacity = Math.max(0, Math.min(1, star.opacity));
                ctx.fillStyle = `rgba(255, 255, 255, ${clampedOpacity})`;
                ctx.beginPath();
                ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
                ctx.fill();
            });

            rafId = requestAnimationFrame(animate);
        };
        animate();

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(rafId);
        };
    }, [stars]);

    return (
        <div className="starfield-background">
            <canvas ref={canvasRef} className="starfield-canvas"></canvas>
            <div className="holographic-container">
                <Canvas camera={{ position: [0, 0, 8], fov: 35 }} gl={{ alpha: true, antialias: true }}>
                    <ambientLight intensity={0.5} />
                    <pointLight position={[10, 10, 10]} intensity={1.5} />
                    <Environment preset="city" />
                    <RandomObjects />
                </Canvas>
            </div>
        </div>
    );
};

export default StarfieldBackground;
