import { useState, useEffect, useMemo, useCallback } from 'react';
import Header from './components/Header';
import LoadingScreen from './components/LoadingScreen';
import FolderGrid from './components/FolderGrid';
import FolderCarousel from './components/FolderCarousel';
import FileModal from './components/FileModal';
import StarfieldBackground from './components/StarfieldBackground';
import type { FileData, FolderData, ConfigData, ContentData } from './types';
import './App.css';

// Utility: Transform API data to internal format
const transformContentData = (data: any[]): FolderData[] => {
  const IMAGE_EXTS = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
  const VIDEO_EXTS = ['mp4', 'webm', 'ogg'];
  const AUDIO_EXTS = ['mp3', 'wav', 'mpeg'];

  return data.map((folder) => ({
    name: folder.name,
    files: folder.files.map((file: string) => {
      const ext = file.split('.').pop()?.toLowerCase() || '';
      let type: FileData['type'] = 'other';
      if (IMAGE_EXTS.includes(ext)) type = 'image';
      else if (VIDEO_EXTS.includes(ext)) type = 'video';
      else if (AUDIO_EXTS.includes(ext)) type = 'audio';

      return {
        name: file,
        type,
        url: `/My-website/content/${folder.name}/${file}`
      };
    })
  }));
};

function App() {
  const [content, setContent] = useState<ContentData | null>(null);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [originRect, setOriginRect] = useState<DOMRect | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'carousel'>('grid');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [config, setConfig] = useState<ConfigData>({
    title: "PORTFOLIO",
    subtitle: "COLLECTION 2025",
    version: "v1.0.0",
    socials: []
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [contentRes, configRes] = await Promise.all([
          fetch('/My-website/content.json'),
          fetch(`/My-website/config.json?t=${Date.now()}`)
        ]);

        const [contentData, configData] = await Promise.all([
          contentRes.json(),
          configRes.json()
        ]);

        setContent({ folders: transformContentData(contentData) });
        setConfig(configData);

        // Minimum loading time for smooth transition
        setTimeout(() => setIsLoading(false), 1000);
      } catch (err) {
        console.error("Failed to load data:", err);
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Prevent body scroll when carousel is active
  useEffect(() => {
    if (viewMode === 'carousel') {
      document.body.classList.add('carousel-active');
    } else {
      document.body.classList.remove('carousel-active');
    }
    return () => {
      document.body.classList.remove('carousel-active');
    };
  }, [viewMode]);

  const handleFolderClick = useCallback((folderName: string, rect: DOMRect) => {
    setOriginRect(rect);
    setSelectedFolder(folderName);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedFolder(null);
  }, []);

  // Memoize folders with injected Socials
  const displayFolders = useMemo(() => {
    if (!content) return [];
    const folders = [...content.folders];
    if (config.socials?.length) {
      folders.push({
        name: "Socials",
        files: config.socials.map(social => ({
          name: social.icon,
          type: 'social' as const,
          url: social.link
        }))
      });
    }
    return folders;
  }, [content, config.socials]);

  const modalFiles = useMemo(() =>
    selectedFolder ? displayFolders.find(f => f.name === selectedFolder)?.files || [] : [],
    [selectedFolder, displayFolders]
  );

  if (!config || !content) return <LoadingScreen isLoading={true} />;

  return (
    <div className="app">
      <LoadingScreen isLoading={isLoading} />
      <StarfieldBackground />

      <div className={`app-content ${!isLoading ? 'visible' : ''}`}>
        <Header
          title={config.title}
          subtitle={config.subtitle}
          version={config.version}
        />

        {/* View Toggle Button */}
        <button
          className={`view-toggle ${viewMode === 'carousel' ? 'carousel-mode' : ''}`}
          onClick={() => {
            setIsTransitioning(true);
            setTimeout(() => {
              setViewMode(prev => prev === 'grid' ? 'carousel' : 'grid');
              setTimeout(() => setIsTransitioning(false), 50);
            }, 200);
          }}
          title={viewMode === 'grid' ? "Switch to Carousel" : "Switch to Grid"}
        >
          <i className={`fas ${viewMode === 'grid' ? 'fa-circle-notch' : 'fa-th-large'}`}></i>
        </button>

        <div className={`view-container ${isTransitioning ? 'transitioning' : ''} ${viewMode}`}>
          {viewMode === 'grid' ? (
            <FolderGrid
              folders={displayFolders}
              onFolderClick={handleFolderClick}
            />
          ) : (
            <FolderCarousel
              folders={displayFolders}
              onFolderClick={handleFolderClick}
            />
          )}
        </div>
      </div>

      <FileModal
        isOpen={!!selectedFolder}
        folderName={selectedFolder || ''}
        files={modalFiles}
        onClose={handleCloseModal}
        originRect={originRect}
      />

      {/* Footer Removed */}
    </div>
  );
}

export default App;
