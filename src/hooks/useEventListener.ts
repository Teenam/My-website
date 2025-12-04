import { useEffect, useRef } from 'react';

/**
 * Custom hook for managing event listeners
 * Automatically handles cleanup and prevents memory leaks
 */
export function useEventListener<K extends keyof WindowEventMap>(
    eventName: K,
    handler: (event: WindowEventMap[K]) => void,
    element: Window | HTMLElement | null = window,
    options?: boolean | AddEventListenerOptions
) {
    const savedHandler = useRef(handler);
    const savedOptions = useRef(options);

    useEffect(() => {
        savedHandler.current = handler;
    }, [handler]);

    useEffect(() => {
        savedOptions.current = options;
    }, [options]);

    useEffect(() => {
        if (!element) return;

        const eventListener = (event: Event) => savedHandler.current(event as WindowEventMap[K]);

        element.addEventListener(eventName, eventListener, savedOptions.current);

        return () => {
            element.removeEventListener(eventName, eventListener, savedOptions.current);
        };
    }, [eventName, element]);
}
