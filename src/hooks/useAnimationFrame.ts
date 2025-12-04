import { useEffect, useRef } from 'react';

/**
 * Custom hook for requestAnimationFrame loops
 * Automatically handles cleanup and provides stable callback reference
 */
export function useAnimationFrame(callback: (time: number) => void, deps: React.DependencyList = []) {
    const requestRef = useRef<number | undefined>(undefined);
    const previousTimeRef = useRef<number | undefined>(undefined);
    const callbackRef = useRef(callback);

    // Update callback ref when it changes
    useEffect(() => {
        callbackRef.current = callback;
    }, [callback]);

    useEffect(() => {
        const animate = (time: number) => {
            if (previousTimeRef.current !== undefined) {
                callbackRef.current(time);
            }
            previousTimeRef.current = time;
            requestRef.current = requestAnimationFrame(animate);
        };

        requestRef.current = requestAnimationFrame(animate);

        return () => {
            if (requestRef.current) {
                cancelAnimationFrame(requestRef.current);
            }
        };
    }, deps);
}
