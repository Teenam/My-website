import React, { useState, useRef, useEffect } from 'react';

interface CustomAudioPlayerProps {
    src: string;
    name: string;
}

const CustomAudioPlayer: React.FC<CustomAudioPlayerProps> = ({ src, name }) => {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [currentTime, setCurrentTime] = useState('0:00');
    const [duration, setDuration] = useState('0:00');

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const formatTime = (time: number) => {
            const minutes = Math.floor(time / 60);
            const seconds = Math.floor(time % 60);
            return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
        };

        const updateProgress = () => {
            if (audio.duration) {
                setProgress((audio.currentTime / audio.duration) * 100);
                setCurrentTime(formatTime(audio.currentTime));
            }
        };

        const handleLoadedMetadata = () => {
            setDuration(formatTime(audio.duration));
        };

        const handleEnded = () => setIsPlaying(false);

        audio.addEventListener('timeupdate', updateProgress);
        audio.addEventListener('loadedmetadata', handleLoadedMetadata);
        audio.addEventListener('ended', handleEnded);

        return () => {
            audio.removeEventListener('timeupdate', updateProgress);
            audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
            audio.removeEventListener('ended', handleEnded);
        };
    }, []);

    const togglePlay = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newProgress = parseFloat(e.target.value);
        if (audioRef.current) {
            const newTime = (newProgress / 100) * audioRef.current.duration;
            audioRef.current.currentTime = newTime;
            setProgress(newProgress);
        }
    };

    return (
        <div className="custom-audio-player">
            <audio ref={audioRef} src={src} />

            <div className={`vinyl-record ${isPlaying ? 'spinning' : ''}`}>
                <div className="vinyl-grooves"></div>
                <div className="vinyl-label">
                    <i className="fas fa-music"></i>
                </div>
            </div>

            <div className="audio-info">
                <div className="track-name">{name}</div>

                <div className="audio-controls-row">
                    <button onClick={togglePlay} className="audio-play-btn">
                        <i className={`fas ${isPlaying ? 'fa-pause' : 'fa-play'}`}></i>
                    </button>

                    <div className="audio-progress-container">
                        <span className="time-current">{currentTime}</span>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={progress}
                            onChange={handleProgressChange}
                            className="audio-progress-slider"
                            style={{ backgroundSize: `${progress}% 100%` }}
                        />
                        <span className="time-duration">{duration}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomAudioPlayer;
