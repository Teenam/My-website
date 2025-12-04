// Centralized type definitions for the portfolio application
// This eliminates duplicate interfaces across components

export interface FileData {
    name: string;
    type: 'image' | 'video' | 'audio' | 'other' | 'social';
    url: string;
}

export interface FolderData {
    name: string;
    files: FileData[];
}

export interface ConfigData {
    title: string;
    subtitle: string;
    version: string;
    socials: { icon: string; link: string }[];
}

export interface ContentData {
    folders: FolderData[];
}
