import React from 'react';
import Folder from './Folder';

interface FileData {
    name: string;
    type: 'image' | 'video' | 'audio' | 'other';
    url: string;
}

interface FolderData {
    name: string;
    files: FileData[];
}

interface FolderGridProps {
    folders: FolderData[];
    onFolderClick: (folder: FolderData, e: React.MouseEvent) => void;
}

const FolderGrid: React.FC<FolderGridProps> = ({ folders, onFolderClick }) => {
    return (
        <div className="folders-grid">
            {folders.map((folder) => (
                <Folder
                    key={folder.name}
                    name={folder.name}
                    files={folder.files}
                    onClick={(e) => onFolderClick(folder, e)}
                />
            ))}
        </div>
    );
};

export default FolderGrid;
