// Main Logic
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

        // Find a preview image (first image file)
        const previewFile = folder.files.find(f => f.match(/\.(jpg|jpeg|png|gif|webp)$/i));
        const previewHtml = previewFile
            ? `<div class="folder-preview"><img src="content/${folder.name}/${previewFile}" alt="Preview"></div>`
            : '<div class="folder-preview" style="background: rgba(255,255,255,0.1); display: flex; align-items: center; justify-content: center;"><span>No Preview</span></div>';

        card.innerHTML = `
            <div class="folder-icon"><i class="fas fa-folder-open"></i></div>
            <div class="folder-name">${folder.name.replace(/_/g, ' ')}</div>
            ${previewHtml}
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
        if (file.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
            const item = document.createElement('div');
            item.className = 'file-item';
            item.innerHTML = `<img src="content/${folder.name}/${file}" loading="lazy" alt="${file}">`;
            modalGrid.appendChild(item);
        }
        // Add more file types here if needed
    });

    modal.classList.add('active');
}

// Close Modal Logic
document.querySelector('.close-modal').addEventListener('click', () => {
    document.getElementById('file-modal').classList.remove('active');
});

document.getElementById('file-modal').addEventListener('click', (e) => {
    if (e.target.id === 'file-modal') {
        document.getElementById('file-modal').classList.remove('active');
    }
});

// Three.js Background
function initThreeJS() {
    const container = document.getElementById('canvas-container');
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });

    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(10, 10, 10);
    scene.add(pointLight);

    const pointLight2 = new THREE.PointLight(0xa8c0ff, 1);
    pointLight2.position.set(-10, -10, -10);
    scene.add(pointLight2);

    // Floating Objects (Pearlescent Blobs)
    const geometry = new THREE.IcosahedronGeometry(1, 1); // Low poly for performance, or higher for smooth
    const material = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        metalness: 0.1,
        roughness: 0.1,
        transmission: 0.6, // Glass-like
        thickness: 0.5,
        clearcoat: 1,
        clearcoatRoughness: 0.1,
    });

    const objects = [];
    for (let i = 0; i < 15; i++) {
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.x = (Math.random() - 0.5) * 20;
        mesh.position.y = (Math.random() - 0.5) * 20;
        mesh.position.z = (Math.random() - 0.5) * 10 - 5;
        mesh.rotation.x = Math.random() * Math.PI;
        mesh.rotation.y = Math.random() * Math.PI;

        const scale = Math.random() * 1 + 0.5;
        mesh.scale.set(scale, scale, scale);

        scene.add(mesh);
        objects.push({
            mesh: mesh,
            speedX: (Math.random() - 0.5) * 0.01,
            speedY: (Math.random() - 0.5) * 0.01,
            rotSpeed: (Math.random() - 0.5) * 0.02
        });
    }

    camera.position.z = 5;

    // Animation Loop
    function animate() {
        requestAnimationFrame(animate);

        objects.forEach(obj => {
            obj.mesh.position.x += obj.speedX;
            obj.mesh.position.y += obj.speedY;
            obj.mesh.rotation.x += obj.rotSpeed;
            obj.mesh.rotation.y += obj.rotSpeed;

            // Boundary check to keep them in view
            if (Math.abs(obj.mesh.position.x) > 12) obj.speedX *= -1;
            if (Math.abs(obj.mesh.position.y) > 8) obj.speedY *= -1;
        });

        // Mouse interaction (subtle parallax)
        // camera.position.x += (mouseX - camera.position.x) * 0.05;
        // camera.position.y += (-mouseY - camera.position.y) * 0.05;

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
