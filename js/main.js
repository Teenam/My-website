// Main Logic
let isModalOpen = false;
let targetCameraZ = 5;

document.addEventListener('DOMContentLoaded', () => {
    initThreeJS();
    loadContent();
});

async function loadContent() {
    try {
        const response = await fetch('content.json');
        const data = await response.json();
        renderFolders(data);
    } catch (error) {
        console.error('Error loading content:', error);
        document.querySelector('.folders-grid').innerHTML = '<p>Error loading content. Please run build script.</p>';
    }
}

function renderFolders(folders) {
    const container = document.querySelector('.folders-grid');
    container.innerHTML = '';

    folders.forEach(folder => {
        const card = document.createElement('div');
        card.className = 'folder-card';

        // Get up to 3 preview items
        const previewFiles = folder.files.slice(0, 3);
        let previewHTML = '';

        previewFiles.forEach(file => {
            const ext = file.split('.').pop().toLowerCase();
            const filePath = `content/${folder.name}/${file}`;

            if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) {
                previewHTML += `<div class="preview-item" style="background-image: url('${filePath}'); background-size: cover; background-position: center;"></div>`;
            } else {
                // For non-image files, show a generic glass block or icon
                previewHTML += `<div class="preview-item" style="display: flex; align-items: center; justify-content: center;"><i class="fas fa-file" style="color: rgba(255,255,255,0.5);"></i></div>`;
            }
        });

        // Fill remaining slots if less than 3 files
        for (let i = previewFiles.length; i < 3; i++) {
            previewHTML += `<div class="preview-item"></div>`;
        }

        card.innerHTML = `
            <div class="folder-back glass-panel"></div>
            <div class="folder-preview-items">
                ${previewHTML}
            </div>
            <div class="folder-front glass-panel">
                <div class="folder-name">${folder.name.replace(/_/g, ' ')}</div>
            </div>
        `;

        card.addEventListener('click', () => openFolder(folder));
        container.appendChild(card);
    });
}

function openFolder(folder) {
    const modal = document.getElementById('file-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalGrid = document.getElementById('modal-grid');

    modalTitle.textContent = folder.name.replace(/_/g, ' ');
    modalGrid.innerHTML = '';

    folder.files.forEach(file => {
        const item = document.createElement('div');
        item.className = 'file-item';

        const ext = file.split('.').pop().toLowerCase();
        const filePath = `content/${folder.name}/${file}`;

        if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) {
            // Image
            item.innerHTML = `<img src="${filePath}" loading="lazy" alt="${file}">`;
        } else if (['mp4', 'webm', 'ogg'].includes(ext)) {
            // Video
            item.innerHTML = `
                <video controls preload="metadata">
                    <source src="${filePath}" type="video/${ext}">
                    Your browser does not support the video tag.
                </video>
                <div class="file-name">${file}</div>
            `;
        } else if (['mp3', 'wav', 'mpeg'].includes(ext)) {
            // Audio
            item.innerHTML = `
                <div class="file-icon-card">
                    <i class="fas fa-music"></i>
                    <audio controls>
                        <source src="${filePath}" type="audio/${ext}">
                    </audio>
                    <div class="file-name">${file}</div>
                </div>
            `;
        } else {
            // Other Documents (PDF, DOC, etc.)
            let iconClass = 'fa-file';
            if (ext === 'pdf') iconClass = 'fa-file-pdf';
            else if (['doc', 'docx'].includes(ext)) iconClass = 'fa-file-word';
            else if (['xls', 'xlsx'].includes(ext)) iconClass = 'fa-file-excel';
            else if (['ppt', 'pptx'].includes(ext)) iconClass = 'fa-file-powerpoint';
            else if (['txt', 'md'].includes(ext)) iconClass = 'fa-file-alt';
            else if (['zip', 'rar'].includes(ext)) iconClass = 'fa-file-archive';
            else if (['html', 'css', 'js'].includes(ext)) iconClass = 'fa-file-code';

            item.innerHTML = `
                <a href="${filePath}" target="_blank" class="file-icon-card">
                    <i class="fas ${iconClass}"></i>
                    <div class="file-name">${file}</div>
                </a>
            `;
        }

        modalGrid.appendChild(item);
    });

    modal.classList.add('active');
    isModalOpen = true; // Trigger 3D reaction
}

// Close Modal Logic
document.querySelector('.close-modal').addEventListener('click', closeModal);

document.getElementById('file-modal').addEventListener('click', (e) => {
    if (e.target.id === 'file-modal') {
        closeModal();
    }
});

function closeModal() {
    document.getElementById('file-modal').classList.remove('active');
    isModalOpen = false; // Trigger 3D reaction
}

// Three.js Background
function initThreeJS() {
    const container = document.getElementById('canvas-container');
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio); // High DPI for smoothness
    container.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6); // Slightly brighter
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 1.5);
    pointLight.position.set(20, 20, 20);
    scene.add(pointLight);

    const pointLight2 = new THREE.PointLight(0xa8c0ff, 1.0);
    pointLight2.position.set(-20, -10, -10);
    scene.add(pointLight2);

    // Floating Objects (Smooth Pearls)
    // Increased segments for smoothness
    const geometry = new THREE.SphereGeometry(1.5, 128, 128);
    const material = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        metalness: 0.1,
        roughness: 0.05, // Very smooth
        transmission: 0.6, // More translucent
        thickness: 2.0,
        clearcoat: 1.0,
        clearcoatRoughness: 0.0,
        reflectivity: 1.0,
        ior: 1.5,
        iridescence: 1.0, // Add iridescence if supported (newer Three.js) or fallback
        iridescenceIOR: 1.3,
        iridescenceThicknessRange: [100, 400]
    });

    const objects = [];
    for (let i = 0; i < 15; i++) {
        const mesh = new THREE.Mesh(geometry, material);

        // Random positions spread out
        mesh.position.x = (Math.random() - 0.5) * 35;
        mesh.position.y = (Math.random() - 0.5) * 35;
        mesh.position.z = (Math.random() - 0.5) * 20 - 10;

        const scale = Math.random() * 1.0 + 0.5; // Slightly larger variation
        mesh.scale.set(scale, scale, scale);

        scene.add(mesh);
        objects.push({
            mesh: mesh,
            initialPos: mesh.position.clone(),
            speedX: (Math.random() - 0.5) * 0.003,
            speedY: (Math.random() - 0.5) * 0.003,
            rotSpeed: (Math.random() - 0.5) * 0.001,
            phase: Math.random() * Math.PI * 2
        });
    }

    camera.position.z = 5;

    // Animation Loop
    function animate() {
        requestAnimationFrame(animate);

        const time = Date.now() * 0.001;

        // Camera Zoom Reaction
        // If modal is open, zoom out (increase Z). If closed, return to 5.
        const targetZ = isModalOpen ? 15 : 5;
        camera.position.z += (targetZ - camera.position.z) * 0.05;

        objects.forEach((obj, i) => {
            // Gentle floating
            obj.mesh.position.y += Math.sin(time + obj.phase) * 0.002;
            obj.mesh.rotation.x += obj.rotSpeed;
            obj.mesh.rotation.y += obj.rotSpeed;

            // Reactivity: When modal is open, push objects slightly further apart or just let camera zoom handle it.
            // Let's add a subtle "expansion" effect
            const expansionFactor = isModalOpen ? 1.5 : 1.0;

            // Smoothly interpolate positions
            const targetX = obj.initialPos.x * expansionFactor;
            const targetY = obj.initialPos.y * expansionFactor;

            obj.mesh.position.x += (targetX - obj.mesh.position.x) * 0.05;
            obj.mesh.position.y += (targetY - obj.mesh.position.y) * 0.05;
        });

        renderer.render(scene, camera);
    }

    animate();

    // Handle Resize
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}
