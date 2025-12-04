import React, { memo } from 'react';
import Folder from './Folder';
import type { FolderData } from '../types';

interface FolderGridProps {
    folders: FolderData[];
    onFolderClick: (folderName: string, rect: DOMRect) => void;
}

const FolderGrid: React.FC<FolderGridProps> = ({ folders, onFolderClick }) => {
    return (
        <div className="folders-grid">
            {folders.map((folder) => (
                <Folder
                    key={folder.name}
                    name={folder.name}
                    files={folder.files}
                    onClick={(e) => onFolderClick(folder.name, (e.target as HTMLElement).getBoundingClientRect())}
                />
            ))}
        </div>
    );
};

export default memo(FolderGrid);
