import React, { useEffect, useRef } from 'react';
import './CSSBackground.css';

const CSSBackground: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        // Create floating pearls
        const pearlCount = 12;
        for (let i = 0; i < pearlCount; i++) {
            const pearl = document.createElement('div');
            pearl.className = 'pearl';

            // Random size
            const size = 40 + Math.random() * 120;
            pearl.style.width = `${size}px`;
            pearl.style.height = `${size}px`;

            // Random position
            pearl.style.left = `${Math.random() * 100}%`;
            pearl.style.top = `${Math.random() * 100}%`;

            // Random animation duration and delay
            pearl.style.animationDuration = `${15 + Math.random() * 15}s`;
            pearl.style.animationDelay = `${Math.random() * -20}s`;

            container.appendChild(pearl);
        }

        return () => {
            container.innerHTML = '';
        };
    }, []);

    return <div ref={containerRef} className="css-background"></div>;
};

export default CSSBackground;
