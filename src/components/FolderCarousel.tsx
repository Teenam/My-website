import React, { useRef, useState, useEffect } from 'react';
import Folder from './Folder';

interface FolderData {
    name: string;
    files: any[];
}

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
    const requestRef = useRef<number | undefined>(undefined);
    const lastTimeRef = useRef<number | undefined>(undefined);
    const lastYRef = useRef<number>(0);
    const lastTimeStampRef = useRef<number>(0);

    const [radius, setRadius] = useState(400);

    useEffect(() => {
        const handleResize = () => {
            setRadius(window.innerWidth < 768 ? 250 : 400);
        };
        handleResize(); // Set initial
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // const radius = 400; // Radius of the wheel
    const angleStep = 360 / folders.length;

    const lastVelocityRef = useRef<number>(0);
    const velocityBufferRef = useRef<number[]>([]);
    const VELOCITY_BUFFER_SIZE = 5;

    // Inertia animation with improved smoothing
    const animate = (time: number) => {
        if (lastTimeRef.current !== undefined) {
            if (!isDragging && Math.abs(velocity) > 0.05) {
                setRotation(prev => prev + velocity);
                setVelocity(prev => prev * 0.96); // Slightly increased friction for smoother feel
            } else if (!isDragging && Math.abs(velocity) <= 0.05) {
                // Stop animation when velocity is too low
                setVelocity(0);
            }
        }
        lastTimeRef.current = time;
        requestRef.current = requestAnimationFrame(animate);
    };

    useEffect(() => {
        requestRef.current = requestAnimationFrame(animate);
        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, [isDragging, velocity]);

    // Handle wheel/trackpad scroll
    const handleWheel = (e: WheelEvent) => {
        e.preventDefault();
        // Desktop: Positive delta moves forward (down/right) - Reverted to original
        const delta = e.deltaY * 0.2;
        setRotation(prev => prev + delta);
        setVelocity(delta * 0.1);
    };

    useEffect(() => {
        const container = containerRef.current;
        if (container) {
            container.addEventListener('wheel', handleWheel, { passive: false });
            return () => {
                container.removeEventListener('wheel', handleWheel);
            };
        }
    }, []);

    const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
        setIsDragging(true);
        const y = 'touches' in e ? e.touches[0].clientY : e.clientY;
        setStartY(y);
        setStartRotation(rotation);
        setVelocity(0);
        lastYRef.current = y;
        lastTimeStampRef.current = Date.now();
        lastVelocityRef.current = 0;
    };

    const handleMouseMove = (e: MouseEvent | TouchEvent) => {
        if (!isDragging) return;
        const y = 'touches' in e ? e.touches[0].clientY : e.clientY;
        const deltaY = y - startY;

        // Mobile/Drag: Dragging UP (negative deltaY) -> Rotate Forward (positive rotation)
        const deltaRotation = -deltaY * 0.5;
        setRotation(startRotation + deltaRotation);

        // Calculate instantaneous velocity
        const now = Date.now();
        const timeDiff = now - lastTimeStampRef.current;
        const distDiff = y - lastYRef.current;

        if (timeDiff > 0) {
            // Calculate velocity: distance / time
            // Reversed direction for drag velocity too
            const v = (-distDiff / timeDiff) * 15;

            // Add to velocity buffer for averaging
            velocityBufferRef.current.push(v);
            if (velocityBufferRef.current.length > VELOCITY_BUFFER_SIZE) {
                velocityBufferRef.current.shift();
            }

            // Average velocity over buffer for smoother result
            const avgVelocity = velocityBufferRef.current.reduce((a, b) => a + b, 0) / velocityBufferRef.current.length;
            lastVelocityRef.current = avgVelocity;
        }

        lastYRef.current = y;
        lastTimeStampRef.current = now;
    };

    const handleMouseUp = () => {
        if (!isDragging) return;
        setIsDragging(false);

        // Apply the averaged velocity from movement buffer
        setVelocity(lastVelocityRef.current * 0.8);

        // Clear velocity buffer for next interaction
        velocityBufferRef.current = [];
    };

    useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
            window.addEventListener('touchmove', handleMouseMove, { passive: false });
            window.addEventListener('touchend', handleMouseUp);
        } else {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
            window.removeEventListener('touchmove', handleMouseMove);
            window.removeEventListener('touchend', handleMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
            window.removeEventListener('touchmove', handleMouseMove);
            window.removeEventListener('touchend', handleMouseUp);
        };
    }, [isDragging]);

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

                    // Calculate depth-based effects using Cosine for robust "closest to viewer" logic
                    // 0 degrees is front (closest), 180 is back (farthest)
                    // Cosine(0) = 1, Cosine(180) = -1
                    const rad = (angle + rotation) * Math.PI / 180;
                    const cosVal = Math.cos(rad);

                    // Map cosVal (-1 to 1) to opacity/brightness
                    // We want front (1) to be fully visible, back (-1) to be dim
                    // Normalize to 0-1 range where 1 is front
                    const normalizedDepth = (cosVal + 1) / 2; // 0 (back) to 1 (front)

                    // Apply fading: front = 1.0, back = 0.3
                    const opacity = 0.3 + (normalizedDepth * 0.7);

                    // Apply brightness: front = 1.0, back = 0.4
                    const brightness = 0.4 + (normalizedDepth * 0.6);

                    return (
                        <div
                            key={index}
                            className="carousel-item"
                            style={{
                                transform: `rotateX(${-angle}deg) translateZ(${radius}px) rotateX(${angle - rotation}deg)`,
                                opacity: opacity,
                                filter: `brightness(${brightness})`,
                                transition: 'opacity 0.1s, filter 0.1s'
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
