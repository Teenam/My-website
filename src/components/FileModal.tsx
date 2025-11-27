import React, { useEffect, useState, useRef } from 'react';
import CustomVideoPlayer from './CustomVideoPlayer';
import CustomAudioPlayer from './CustomAudioPlayer';

interface FileData {
    name: string;
    type: 'image' | 'video' | 'audio' | 'other';
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
                    <div className="folder-name">{folderName.replace(/_/g, ' ')}</div>
                </div>

                <div className={`modal-inner-content ${showContent ? 'visible' : ''}`}>
                    <button className="close-modal" onClick={onClose}>&times;</button>
                    <h2>{folderName.replace(/_/g, ' ')}</h2>

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
