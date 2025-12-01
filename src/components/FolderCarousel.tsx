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

    const radius = 400; // Radius of the wheel
    const angleStep = 360 / folders.length;

    // Inertia animation
    const animate = (time: number) => {
        if (lastTimeRef.current !== undefined) {
            if (!isDragging && Math.abs(velocity) > 0.01) {
                setRotation(prev => prev + velocity);
                setVelocity(prev => prev * 0.95); // Friction
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
        // Reversed direction: negative delta moves forward (up)
        const delta = -e.deltaY * 0.2;
        setRotation(prev => prev + delta);
        setVelocity(delta * 0.15); // Increased inertia slightly
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
    };

    const handleMouseMove = (e: MouseEvent | TouchEvent) => {
        if (!isDragging) return;
        const y = 'touches' in e ? e.touches[0].clientY : e.clientY;
        const deltaY = y - startY;
        // Reversed direction for drag: dragging up (negative deltaY) should rotate forward (positive rotation)
        const deltaRotation = -deltaY * 0.5;
        setRotation(startRotation + deltaRotation);

        // Update for velocity calculation
        lastYRef.current = y;
        lastTimeStampRef.current = Date.now();
    };

    const handleMouseUp = (e: MouseEvent | TouchEvent) => {
        if (!isDragging) return;
        setIsDragging(false);
        const y = 'touches' in e ? e.changedTouches[0].clientY : e.clientY;
        const deltaY = y - lastYRef.current;
        const deltaTime = Date.now() - lastTimeStampRef.current;

        // Calculate velocity based on the last movement (flick)
        // Reversed direction for flick
        const speed = deltaTime > 0 ? (-deltaY / deltaTime) * 15 : 0; // Increased multiplier for more momentum
        setVelocity(speed * 0.8); // Increased retention
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
                    return (
                        <div
                            key={index}
                            className="carousel-item"
                            style={{
                                transform: `rotateX(${-angle}deg) translateZ(${radius}px)`
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
