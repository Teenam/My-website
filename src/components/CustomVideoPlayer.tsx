import React, { useState, useRef, useEffect } from 'react';

interface CustomVideoPlayerProps {
    src: string;
    poster?: string;
}

const CustomVideoPlayer: React.FC<CustomVideoPlayerProps> = ({ src, poster }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showControls, setShowControls] = useState(true);
    const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const updateProgress = () => {
            if (video.duration) {
                setProgress((video.currentTime / video.duration) * 100);
            }
        };

        const handleEnded = () => setIsPlaying(false);

        video.addEventListener('timeupdate', updateProgress);
        video.addEventListener('ended', handleEnded);

        return () => {
            video.removeEventListener('timeupdate', updateProgress);
            video.removeEventListener('ended', handleEnded);
        };
    }, []);

    const togglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newProgress = parseFloat(e.target.value);
        if (videoRef.current) {
            const newTime = (newProgress / 100) * videoRef.current.duration;
            videoRef.current.currentTime = newTime;
            setProgress(newProgress);
        }
    };

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newVolume = parseFloat(e.target.value);
        if (videoRef.current) {
            videoRef.current.volume = newVolume;
            setVolume(newVolume);
            setIsMuted(newVolume === 0);
        }
    };

    const toggleMute = () => {
        if (videoRef.current) {
            const newMutedState = !isMuted;
            videoRef.current.muted = newMutedState;
            setIsMuted(newMutedState);
            if (newMutedState) {
                setVolume(0);
            } else {
                setVolume(1);
                videoRef.current.volume = 1;
            }
        }
    };

    const toggleFullscreen = () => {
        const video = videoRef.current;
        if (!video) return;

        // iOS Safari detection and handling
        const isIOSSafari = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;

        if (isIOSSafari) {
            // iOS uses webkitEnterFullscreen on the video element
            if ((video as any).webkitEnterFullscreen) {
                try {
                    (video as any).webkitEnterFullscreen();
                } catch (e) {
                    console.error('iOS fullscreen error:', e);
                }
            }
        } else {
            // Standard Fullscreen API for other browsers
            if (!document.fullscreenElement) {
                video.parentElement?.requestFullscreen();
                setIsFullscreen(true);
            } else {
                document.exitFullscreen();
                setIsFullscreen(false);
            }
        }
    };

    const handleMouseMove = () => {
        setShowControls(true);
        if (controlsTimeoutRef.current) {
            clearTimeout(controlsTimeoutRef.current);
        }
        controlsTimeoutRef.current = setTimeout(() => {
            if (isPlaying) {
                setShowControls(false);
            }
        }, 2500);
    };

    return (
        <div
            className="custom-video-player"
            onMouseMove={handleMouseMove}
            onMouseLeave={() => isPlaying && setShowControls(false)}
        >
            <video
                ref={videoRef}
                src={src}
                poster={poster}
                onClick={togglePlay}
                playsInline
            />

            {/* Centered Play Button Overlay */}
            {!isPlaying && (
                <div className="play-overlay" onClick={togglePlay}>
                    <i className="fas fa-play"></i>
                </div>
            )}

            {/* Controls Bar */}
            <div className={`video-controls ${showControls ? 'visible' : ''}`}>
                <div className="progress-bar-container">
                    <input
                        type="range"
                        min="0"
                        max="100"
                        value={progress}
                        onChange={handleProgressChange}
                        className="progress-slider"
                        style={{ backgroundSize: `${progress}% 100%` }}
                    />
                </div>

                <div className="controls-row">
                    <div className="left-controls">
                        <button onClick={togglePlay} className="control-btn">
                            <i className={`fas ${isPlaying ? 'fa-pause' : 'fa-play'}`}></i>
                        </button>

                        <div className="volume-control">
                            <button onClick={toggleMute} className="control-btn">
                                <i className={`fas ${isMuted || volume === 0 ? 'fa-volume-mute' : volume < 0.5 ? 'fa-volume-down' : 'fa-volume-up'}`}></i>
                            </button>
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.05"
                                value={isMuted ? 0 : volume}
                                onChange={handleVolumeChange}
                                className="volume-slider"
                                style={{ backgroundSize: `${(isMuted ? 0 : volume) * 100}% 100%` }}
                            />
                        </div>
                    </div>

                    <div className="right-controls">
                        <button onClick={toggleFullscreen} className="control-btn">
                            <i className={`fas ${isFullscreen ? 'fa-compress' : 'fa-expand'}`}></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomVideoPlayer;
