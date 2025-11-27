document.addEventListener("DOMContentLoaded", function() {
    const folders = document.querySelectorAll('.folder');
    const imagesContainer = document.getElementById('images-container');
    const toTopButton = document.getElementById('to-top');

    folders.forEach(folder => {
        folder.addEventListener('click', function() {
            const year = folder.getAttribute('data-year');
            displayImages(year);
            updateBackgroundText(year);
        });
    });

    window.addEventListener('scroll', function() {
        if (window.scrollY > 200) {
            toTopButton.style.display = 'block';
        } else {
            toTopButton.style.display = 'none';
        }
    });

    toTopButton.addEventListener('click', function() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    function displayImages(year) {
        imagesContainer.innerHTML = '';
        for (let i = 1; i <= 5; i++) {
            const img = document.createElement('img');
            img.src = `images/${year}_${i}.jpg`;
            img.alt = `Image from ${year}`;
            imagesContainer.appendChild(img);
        }
    }

    function updateBackgroundText(text) {
        const encodedText = encodeURIComponent(text);
        const patternWidth = getComputedStyle(document.documentElement).getPropertyValue('--pattern-width').trim();
        const patternHeight = getComputedStyle(document.documentElement).getPropertyValue('--pattern-height').trim();
        const patternGapX = getComputedStyle(document.documentElement).getPropertyValue('--pattern-gap-x').trim();
        const patternGapY = getComputedStyle(document.documentElement).getPropertyValue('--pattern-gap-y').trim();
        document.body.style.backgroundImage = `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' width='${patternWidth}' height='${patternHeight}'%3e%3ctext x='0' y='25' font-family='Arial' font-size='20' fill='%23000000'%3e${encodedText}%3c/text%3e%3c/svg%3e")`;
        document.body.style.backgroundSize = `calc(${patternWidth} + ${patternGapX}) calc(${patternHeight} + ${patternGapY})`;
    }
});
