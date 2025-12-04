import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import Folder from './Folder';
import { useEventListener } from '../hooks/useEventListener';
import type { FolderData } from '../types';

interface FolderCarouselProps {
    folders: FolderData[];
    onFolderClick: (folderName: string, rect: DOMRect) => void;
}

const FolderCarousel: React.FC<FolderCarouselProps> = ({ folders, onFolderClick }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [rotation, setRotation] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [startY, setStartY] = useState(0);
    const [startRotation, setStartRotation] = useState(0);
    const [velocity, setVelocity] = useState(0);
    const [radius, setRadius] = useState(400);

    const angleStep = 360 / folders.length;
    const lastYRef = useRef(0);
    const lastTimeRef = useRef(0);

    // Responsive radius
    useEffect(() => {
        const handleResize = () => {
            setRadius(window.innerWidth < 768 ? 250 : 400);
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Inertia animation loop
    useEffect(() => {
        let rafId: number;
        const animate = () => {
            if (!isDragging && Math.abs(velocity) > 0.05) {
                setRotation(prev => prev + velocity);
                setVelocity(prev => prev * 0.96);
            } else if (!isDragging) {
                setVelocity(0);
            }
            rafId = requestAnimationFrame(animate);
        };
        rafId = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(rafId);
    }, [isDragging, velocity]);

    // Wheel/trackpad scroll handler
    const handleWheel = useCallback((e: WheelEvent) => {
        e.preventDefault();
        const delta = e.deltaY * 0.2;
        setRotation(prev => prev + delta);
        setVelocity(delta * 0.1);
    }, []);

    // Memoize options to prevent infinite re-renders
    const wheelOptions = useMemo(() => ({ passive: false }), []);

    useEventListener('wheel', handleWheel, containerRef.current, wheelOptions);

    // Unified pointer start (mouse/touch)
    const handlePointerStart = useCallback((y: number) => {
        setIsDragging(true);
        setStartY(y);
        setStartRotation(rotation);
        setVelocity(0);
        lastYRef.current = y;
        lastTimeRef.current = Date.now();
    }, [rotation]);

    const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
        const y = 'touches' in e ? e.touches[0].clientY : e.clientY;
        handlePointerStart(y);
    };

    // Unified pointer move
    const handlePointerMove = useCallback((y: number) => {
        if (!isDragging) return;

        const deltaY = y - startY;
        setRotation(startRotation - deltaY * 0.5);

        // Calculate velocity for momentum
        const now = Date.now();
        const timeDiff = now - lastTimeRef.current;
        if (timeDiff > 0) {
            const dist = y - lastYRef.current;
            const v = (-dist / timeDiff) * 15;
            setVelocity(v * 0.8); // Apply directly with damping
        }

        lastYRef.current = y;
        lastTimeRef.current = now;
    }, [isDragging, startY, startRotation]);

    const handleMouseMove = useCallback((e: MouseEvent | TouchEvent) => {
        const y = 'touches' in e ? e.touches[0].clientY : e.clientY;
        handlePointerMove(y);
    }, [handlePointerMove]);

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
    }, []);

    // Event listener management
    useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
            window.addEventListener('touchmove', handleMouseMove, { passive: false });
            window.addEventListener('touchend', handleMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
            window.removeEventListener('touchmove', handleMouseMove);
            window.removeEventListener('touchend', handleMouseUp);
        };
    }, [isDragging, handleMouseMove, handleMouseUp]);

    return (
        <div
            className="carousel-container"
            ref={containerRef}
            onMouseDown={handleMouseDown}
            onTouchStart={handleMouseDown}
        >
            <div className="carousel-wheel" style={{ transform: `rotateX(${rotation}deg)` }}>
                {folders.map((folder, index) => {
                    const angle = index * angleStep;
                    const rad = (angle + rotation) * Math.PI / 180;
                    const cosVal = Math.cos(rad);
                    const normalizedDepth = (cosVal + 1) / 2;
                    const zIndex = Math.round(normalizedDepth * 1000);

                    return (
                        <div
                            key={folder.name}
                            className="carousel-item"
                            style={{
                                transform: `rotateX(${-angle}deg) translateZ(${radius}px) rotateX(${angle - rotation}deg)`,
                                zIndex
                            }}
                        >
                            <Folder
                                name={folder.name}
                                files={folder.files}
                                onClick={(e) => onFolderClick(folder.name, (e.target as HTMLElement).getBoundingClientRect())}
                            />
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default FolderCarousel;
