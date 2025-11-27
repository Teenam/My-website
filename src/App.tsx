import { useState, useEffect } from 'react';
import StarfieldBackground from './components/StarfieldBackground';
import FolderGrid from './components/FolderGrid';
import Footer from './components/Footer';
import FileModal from './components/FileModal';
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

function App() {
  const [folders, setFolders] = useState<FolderData[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<FolderData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [originRect, setOriginRect] = useState<DOMRect | null>(null);
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
        // Transform the legacy data format if necessary
        // Assuming legacy content.json structure is compatible or we map it
        // Legacy structure: [{ name: "Folder", files: ["file.jpg", ...] }]
        // We need to map files to objects with type and url

        const transformedData = data.map((folder: any) => ({
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
        setFolders(transformedData);
      })
      .catch(err => console.error("Failed to load content:", err));

    // Load Config
    fetch('/My-website/config.json')
      .then(res => res.json())
      .then(data => setConfig(data))
      .catch(err => console.error("Failed to load config:", err));
  }, []);

  const handleFolderClick = (folder: FolderData, e: React.MouseEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setOriginRect(rect);
    setSelectedFolder(folder);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    const overlay = document.querySelector('.modal-overlay');
    if (overlay) {
      overlay.classList.add('closing');
      overlay.classList.remove('active');
    }

    setTimeout(() => {
      setIsModalOpen(false);
      setSelectedFolder(null);
      const overlay = document.querySelector('.modal-overlay');
      if (overlay) {
        overlay.classList.remove('closing');
      }
    }, 600); // Match animation duration
  };

  return (
    <>
      <StarfieldBackground />

      <main style={{ position: 'relative', zIndex: 1, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <header>
          <div className="header-content">
            <h1>{config.title}</h1>
            <div className="decorative-bar"></div>
            <p className="subtitle">{config.subtitle}</p>
          </div>
        </header>

        <FolderGrid folders={folders} onFolderClick={handleFolderClick} />

        <Footer socials={config.socials} version={config.version} />
      </main>

      {selectedFolder && (
        <FileModal
          isOpen={isModalOpen}
          folderName={selectedFolder.name}
          files={selectedFolder.files}
          onClose={handleCloseModal}
          originRect={originRect}
        />
      )}
    </>
  );
}

export default App;
