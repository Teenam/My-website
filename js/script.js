//git add . && git commit -m "Add js interaction" && git push origin main

document.addEventListener('DOMContentLoaded', function () {
    const folders = document.querySelectorAll('.folder');
    const imagesContainer = document.getElementById('images-container');
    const toTopButton = document.getElementById('to-top');

    folders.forEach(folder => {
        folder.addEventListener('click', () => {
            folders.forEach(f => f.classList.remove('active'));
            folder.classList.add('active');
            const year = folder.getAttribute('data-year');
            loadImages(year);
        });
    });

    function loadImages(year) {
        imagesContainer.style.display = 'flex';
        imagesContainer.innerHTML = '';
        const yearHeading = document.createElement('h2');
        yearHeading.textContent = year;
        yearHeading.classList.add('sticky');
        imagesContainer.appendChild(yearHeading);
        fetchImages(year);
    }

    function fetchImages(year) {
        const imagesPath = `${year}/`;
        const images = ['image1.jpg', 'image2.jpg']; // Add all image names here
        images.forEach(image => {
            const img = document.createElement('img');
            img.src = `${imagesPath}${image}`;
            img.alt = `Image ${image}`;
            imagesContainer.appendChild(img);
        });
    }

    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            toTopButton.style.display = 'block';
        } else {
            toTopButton.style.display = 'none';
        }
    });

    toTopButton.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
});
