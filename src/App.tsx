import { useState, useEffect } from 'react';
import BackgroundCanvas from './components/BackgroundCanvas';
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

function App() {
  const [folders, setFolders] = useState<FolderData[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<FolderData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetch('/content.json')
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
              url: `/content/${folder.name}/${file}`
            };
          })
        }));
        setFolders(transformedData);
      })
      .catch(err => console.error("Failed to load content:", err));
  }, []);

  const handleFolderClick = (folder: FolderData) => {
    setSelectedFolder(folder);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedFolder(null), 300); // Wait for animation
  };

  return (
    <>
      <BackgroundCanvas />

      <main style={{ position: 'relative', zIndex: 1, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <header>
          <div className="header-content">
            <h1>PORTFOLIO</h1>
            <div className="decorative-bar"></div>
            <p className="subtitle">COLLECTION 2025</p>
          </div>
        </header>

        <FolderGrid folders={folders} onFolderClick={handleFolderClick} />

        <Footer />
      </main>

      {selectedFolder && (
        <FileModal
          isOpen={isModalOpen}
          folderName={selectedFolder.name}
          files={selectedFolder.files}
          onClose={handleCloseModal}
        />
      )}
    </>
  );
}

export default App;
