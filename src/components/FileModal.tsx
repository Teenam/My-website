import React, { useEffect, useState, useRef, useCallback, memo } from 'react';
import CustomVideoPlayer from './CustomVideoPlayer';
import CustomAudioPlayer from './CustomAudioPlayer';
import { useEventListener } from '../hooks/useEventListener';
import type { FileData } from '../types';

interface ModalProps {
    isOpen: boolean;
    folderName: string;
    files: FileData[];
    onClose: () => void;
    originRect: DOMRect | null;
}

const FileModal: React.FC<ModalProps> = ({ isOpen, folderName, files, onClose, originRect }) => {
    const [isAnimating, setIsAnimating] = useState(false);
    const [showContent, setShowContent] = useState(false);
    const [inspectingIndex, setInspectingIndex] = useState<number | null>(null);
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen && originRect) {
            setIsAnimating(true);
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    setIsAnimating(false);
                    setTimeout(() => setShowContent(true), 300);
                });
            });
        } else {
            setShowContent(false);
            setInspectingIndex(null);
        }
    }, [isOpen, originRect]);

    // ESC key handler via custom hook
    useEventListener(
        'keydown',
        useCallback((e: KeyboardEvent) => {
            if (e.key === 'Escape' && inspectingIndex !== null) {
                setInspectingIndex(null);
            }
        }, [inspectingIndex])
    );

    const handleSocialClick = useCallback((e: React.MouseEvent, index: number, url: string) => {
        if (inspectingIndex === index) {
            window.open(url, '_blank');
        } else {
            e.preventDefault();
            setInspectingIndex(index);
        }
    }, [inspectingIndex]);

    if (!isOpen) return null;

    const style = isAnimating && originRect ? {
        top: `${originRect.top}px`,
        left: `${originRect.left}px`,
        width: `${originRect.width}px`,
        height: `${originRect.height}px`,
        transform: 'none',
        borderRadius: '20px'
    } : {};

    return (
        <div className={`modal-overlay ${isOpen ? 'active' : ''}`} onClick={onClose}>
            <div
                ref={modalRef}
                className={`modal-content ${isAnimating ? 'expanding' : 'expanded'}`}
                onClick={(e) => e.stopPropagation()}
                style={style}
            >
                <div className={`folder-cover ${showContent ? 'open' : ''}`}></div>

                <div className={`floating-title ${showContent ? 'animate-to-header' : ''}`}>
                    {folderName.replace(/_/g, ' ')}
                </div>

                <div className={`modal-inner-content ${showContent ? 'visible' : ''}`}>
                    <button className="mobile-back-arrow" onClick={onClose}>
                        <i className="fas fa-arrow-left"></i>
                    </button>

                    <div style={{ height: '2rem', marginBottom: '2rem' }}></div>

                    <div className="file-grid">
                        {files.map((file, index) => (
                            <div key={index} className="file-item">
                                {file.type === 'image' && (
                                    <>
                                        <img src={file.url} alt={file.name} loading="lazy" />
                                        <div className="file-name">{file.name}</div>
                                    </>
                                )}
                                {file.type === 'video' && <CustomVideoPlayer src={file.url} />}
                                {file.type === 'audio' && <CustomAudioPlayer src={file.url} name={file.name} />}
                                {file.type === 'other' && (
                                    <a href={file.url} target="_blank" rel="noopener noreferrer" className="file-icon-card">
                                        <i className="fas fa-file file-icon-large"></i>
                                        <div className="file-name">{file.name}</div>
                                    </a>
                                )}
                                {file.type === 'social' && (
                                    <div
                                        className={`social-icon-card ${inspectingIndex === index ? 'inspecting' : ''}`}
                                        onClick={(e) => handleSocialClick(e, index, file.url)}
                                    >
                                        <i className={`${file.name} social-icon-large`}></i>
                                        <div className="social-name">
                                            {file.name.replace('fab fa-', '').replace('fas fa-', '').replace('far fa-', '')}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default memo(FileModal);
