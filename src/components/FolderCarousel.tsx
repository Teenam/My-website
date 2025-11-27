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

    const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
        setIsDragging(true);
        const y = 'touches' in e ? e.touches[0].clientY : e.clientY;
        setStartY(y);
        setStartRotation(rotation);
        setVelocity(0);
    };

    const handleMouseMove = (e: MouseEvent | TouchEvent) => {
        if (!isDragging) return;
        const y = 'touches' in e ? e.touches[0].clientY : e.clientY;
        const deltaY = y - startY;
        const deltaRotation = deltaY * 0.5; // Sensitivity
        setRotation(startRotation + deltaRotation);
    };

    const handleMouseUp = (e: MouseEvent | TouchEvent) => {
        if (!isDragging) return;
        setIsDragging(false);
        const y = 'touches' in e ? e.changedTouches[0].clientY : e.clientY;
        const deltaY = y - startY;
        setVelocity(deltaY * 0.05); // Initial velocity based on drag
    };

    useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
            window.addEventListener('touchmove', handleMouseMove);
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
