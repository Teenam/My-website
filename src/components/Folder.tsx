import React, { memo } from 'react';
import type { FileData } from '../types';

interface FolderProps {
    name: string;
    files: FileData[];
    onClick: (e: React.MouseEvent) => void;
}

const Folder: React.FC<FolderProps> = ({ name, files, onClick }) => {
    const previewFiles = files.slice(0, 3);

    return (
        <div className="folder-card" onClick={onClick}>
            <div className="folder-back glass-panel"></div>

            <div className="folder-preview-items">
                {previewFiles.map((file, index) => (
                    <div
                        key={index}
                        className="preview-item"
                        style={{
                            backgroundImage: file.type === 'image' ? `url(${file.url})` : undefined
                        }}
                    >
                        {file.type === 'video' && <span className="preview-icon">🎥</span>}
                        {file.type === 'audio' && <span className="preview-icon">🎵</span>}
                        {file.type === 'other' && <span className="preview-icon">📄</span>}
                        {file.type === 'social' && (
                            <i className={`${file.name} preview-icon-fa`}></i>
                        )}
                    </div>
                ))}
                {/* Fill empty slots */}
                {Array.from({ length: Math.max(0, 3 - previewFiles.length) }).map((_, i) => (
                    <div key={`empty-${i}`} className="preview-item"></div>
                ))}
            </div>

            <div className="folder-front glass-panel">
                <div className="folder-name">{name.replace(/_/g, ' ')}</div>
            </div>
        </div>
    );
};

export default memo(Folder);
