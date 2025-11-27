import React from 'react';

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
}

const FileModal: React.FC<ModalProps> = ({ isOpen, folderName, files, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className={`modal-overlay ${isOpen ? 'active' : ''}`} onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="close-modal" onClick={onClose}>&times;</button>
                <h2>{folderName.replace(/_/g, ' ')}</h2>

                <div className="file-grid">
                    {files.map((file, index) => (
                        <div key={index} className="file-item">
                            {file.type === 'image' && (
                                <img src={file.url} alt={file.name} loading="lazy" />
                            )}
                            {file.type === 'video' && (
                                <video controls>
                                    <source src={file.url} />
                                    Your browser does not support the video tag.
                                </video>
                            )}
                            {file.type === 'audio' && (
                                <div className="file-icon-card">
                                    <i className="fas fa-music" style={{ fontSize: '4rem', marginBottom: '1rem' }}></i>
                                    <audio controls style={{ width: '90%' }}>
                                        <source src={file.url} />
                                    </audio>
                                    <div className="file-name">{file.name}</div>
                                </div>
                            )}
                            {file.type === 'other' && (
                                <a href={file.url} target="_blank" rel="noopener noreferrer" className="file-icon-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2rem', color: 'white', textDecoration: 'none' }}>
                                    <i className="fas fa-file" style={{ fontSize: '4rem', marginBottom: '1rem' }}></i>
                                    <div className="file-name">{file.name}</div>
                                </a>
                            )}
                            {(file.type === 'image' || file.type === 'video') && (
                                <div className="file-name">{file.name}</div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default FileModal;
