import { useState, useEffect } from 'react';
import Header from './components/Header';
import LoadingScreen from './components/LoadingScreen';
import FolderGrid from './components/FolderGrid';
import FolderCarousel from './components/FolderCarousel';
import FileModal from './components/FileModal';
// import Footer from './components/Footer'; // Removed
import StarfieldBackground from './components/StarfieldBackground';
import './App.css';

interface FileData {
  name: string;
  type: 'image' | 'video' | 'audio' | 'other' | 'social';
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
        // Load Content
        const contentRes = await fetch('/My-website/content.json');
        const contentData = await contentRes.json();

        const transformedFolders = contentData.map((folder: any) => ({
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

        // Load Config
        const configRes = await fetch(`/My-website/config.json?t=${Date.now()}`);
        const configData = await configRes.json();
        console.log("Loaded config:", configData);
        setConfig(configData);

        // Minimum loading time for smooth transition
        setTimeout(() => {
          setIsLoading(false);
        }, 1000);

      } catch (err) {
        console.error("Failed to load data:", err);
        // Ensure loading screen goes away even on error
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

  if (!config || !content) return <LoadingScreen isLoading={true} />;

  const currentFolderFiles = selectedFolder
    ? content.folders.find(f => f.name === selectedFolder)?.files || []
    : [];


  // Inject Socials Folder
  const displayFolders = [...content.folders];
  if (config.socials && config.socials.length > 0) {
    displayFolders.push({
      name: "Socials",
      files: config.socials.map(social => ({
        name: social.icon, // Store icon class in name
        type: 'social',
        url: social.link
      }))
    });
  }

  // If selected folder is Socials, use the generated files
  const modalFiles = selectedFolder === "Socials"
    ? displayFolders.find(f => f.name === "Socials")?.files || []
    : currentFolderFiles;

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
