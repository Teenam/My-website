import React, { useEffect, useState, useRef } from 'react';
import CustomVideoPlayer from './CustomVideoPlayer';
import CustomAudioPlayer from './CustomAudioPlayer';

interface FileData {
    name: string;
    type: 'image' | 'video' | 'audio' | 'other' | 'social';
    url: string;
}


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
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen && originRect) {
            setIsAnimating(true);
            // Small delay to allow render before transition
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    setIsAnimating(false);
                    setTimeout(() => setShowContent(true), 300);
                });
            });
        } else {
            setShowContent(false);
        }
    }, [isOpen, originRect]);

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
                <div className={`folder-cover ${showContent ? 'open' : ''}`}>
                    {/* Folder name removed from here to prevent rotation */}
                </div>

                {/* Floating Title Animation */}
                <div className={`floating-title ${showContent ? 'animate-to-header' : ''}`}>
                    {folderName.replace(/_/g, ' ')}
                </div>

                <div className={`modal-inner-content ${showContent ? 'visible' : ''}`}>
                    <button className="close-modal" onClick={onClose}>&times;</button>

                    {/* Mobile Back Arrow */}
                    <button className="mobile-back-arrow" onClick={onClose}>
                        <i className="fas fa-arrow-left"></i>
                    </button>

                    {/* h2 removed as floating-title takes its place */}
                    <div style={{ height: '2rem', marginBottom: '2rem' }}></div>

                    <div className="file-grid">
                        {files.map((file, index) => (
                            <div key={index} className="file-item">
                                {file.type === 'image' && (
                                    <img src={file.url} alt={file.name} loading="lazy" />
                                )}
                                {file.type === 'video' && (
                                    <CustomVideoPlayer src={file.url} />
                                )}
                                {file.type === 'audio' && (
                                    <CustomAudioPlayer src={file.url} name={file.name} />
                                )}
                                {file.type === 'other' && (
                                    <a href={file.url} target="_blank" rel="noopener noreferrer" className="file-icon-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2rem', color: 'white', textDecoration: 'none' }}>
                                        <i className="fas fa-file" style={{ fontSize: '4rem', marginBottom: '1rem' }}></i>
                                        <div className="file-name">{file.name}</div>
                                    </a>
                                )}
                                {file.type === 'social' && (
                                    <a href={file.url} target="_blank" rel="noopener noreferrer" className="file-icon-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', color: 'white', textDecoration: 'none', transition: 'transform 0.3s' }}>
                                        <i className={file.name} style={{ fontSize: '5rem', marginBottom: '1rem', filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.3))' }}></i>
                                        <div className="file-name" style={{ fontSize: '1.2rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                            {file.name.replace('fab fa-', '').replace('fas fa-', '').replace('far fa-', '')}
                                        </div>
                                    </a>
                                )}
                                {(file.type === 'image') && (
                                    <div className="file-name">{file.name}</div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FileModal;
