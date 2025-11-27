import { useState, useEffect } from 'react';
import Header from './components/Header';
import FolderGrid from './components/FolderGrid';
import FolderCarousel from './components/FolderCarousel';
import FileModal from './components/FileModal';
import Footer from './components/Footer';
import StarfieldBackground from './components/StarfieldBackground';
import './App.css';

interface FileData {
  name: string;
  type: 'image' | 'video' | 'audio' | 'other';
  url: string;
}

interface FolderData {
  name: string;
  files: FileData[];
}

interface ConfigData {
  title: string;
  subtitle: string;
  version: string;
  socials: { icon: string; link: string }[];
}

interface ContentData {
  folders: FolderData[];
}

function App() {
  const [content, setContent] = useState<ContentData | null>(null);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [originRect, setOriginRect] = useState<DOMRect | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'carousel'>('grid');
  const [config, setConfig] = useState<ConfigData>({
    title: "PORTFOLIO",
    subtitle: "COLLECTION 2025",
    version: "v1.0.0",
    socials: []
  });

  useEffect(() => {
    // Load Content
    fetch('/My-website/content.json')
      .then(res => res.json())
      .then(data => {
        const transformedFolders = data.map((folder: any) => ({
          name: folder.name,
          files: folder.files.map((file: string) => {
            const ext = file.split('.').pop()?.toLowerCase() || '';
            let type: FileData['type'] = 'other';
            if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) type = 'image';
            else if (['mp4', 'webm', 'ogg'].includes(ext)) type = 'video';
            else if (['mp3', 'wav', 'mpeg'].includes(ext)) type = 'audio';

            return {
              name: file,
              type,
              url: `/My-website/content/${folder.name}/${file}`
            };
          })
        }));
        setContent({ folders: transformedFolders });
      })
      .catch(err => console.error("Failed to load content:", err));

    // Load Config
    fetch(`/My-website/config.json?t=${Date.now()}`)
      .then(res => res.json())
      .then(data => {
        console.log("Loaded config:", data);
        setConfig(data);
      })
      .catch(err => console.error("Failed to load config:", err));
  }, []);

  const handleFolderClick = (folderName: string, rect: DOMRect) => {
    setOriginRect(rect);
    setSelectedFolder(folderName);
  };

  const handleCloseModal = () => {
    const overlay = document.querySelector('.modal-overlay');
    if (overlay) {
      overlay.classList.add('closing');
      overlay.classList.remove('active');
    }

    setTimeout(() => {
      setSelectedFolder(null);
      const overlay = document.querySelector('.modal-overlay');
      if (overlay) {
        overlay.classList.remove('closing');
      }
    }, 600); // Match animation duration
  };

  if (!config || !content) return <div className="loading">Loading...</div>;

  const currentFolderFiles = selectedFolder
    ? content.folders.find(f => f.name === selectedFolder)?.files || []
    : [];

  return (
    <div className="app">
      <StarfieldBackground />

      <Header
        title={config.title}
        subtitle={config.subtitle}
      />

      {/* View Toggle Button */}
      <button
        className="view-toggle"
        onClick={() => setViewMode(prev => prev === 'grid' ? 'carousel' : 'grid')}
        title={viewMode === 'grid' ? "Switch to Carousel" : "Switch to Grid"}
      >
        <i className={`fas ${viewMode === 'grid' ? 'fa-circle-notch' : 'fa-th-large'}`}></i>
      </button>

      {viewMode === 'grid' ? (
        <FolderGrid
          folders={content.folders}
          onFolderClick={handleFolderClick}
        />
      ) : (
        <FolderCarousel
          folders={content.folders}
          onFolderClick={handleFolderClick}
        />
      )}

      <FileModal
        isOpen={!!selectedFolder}
        folderName={selectedFolder || ''}
        files={currentFolderFiles}
        onClose={handleCloseModal}
        originRect={originRect}
      />

      <Footer
        socials={config.socials}
        version={config.version}
      />
    </div>
  );
}

export default App;
