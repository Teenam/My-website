import React from 'react';

interface FileData {
    name: string;
    type: 'image' | 'video' | 'audio' | 'other';
    url: string;
}

interface FolderProps {
    name: string;
    files: FileData[];
    onClick: () => void;
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
                            backgroundImage: file.type === 'image' ? `url(${file.url})` : undefined,
                            display: file.type !== 'image' ? 'flex' : undefined,
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        {file.type !== 'image' && (
                            <span style={{ fontSize: '1.5rem', opacity: 0.5 }}>📄</span>
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

export default Folder;
