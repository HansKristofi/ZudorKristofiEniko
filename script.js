/* ═══════════════════════════════════════════════════════════════
   LOADER  (2.5s then fade out)
═══════════════════════════════════════════════════════════════ */
window.addEventListener('load', () => {
    const loader = document.getElementById('loader');
    if (!loader) return;

    setTimeout(() => {
        loader.style.opacity = '0';
        setTimeout(() => { loader.style.display = 'none'; }, 1000);
    }, 4400);
});

/* ═══════════════════════════════════════════════════════════════
   NAVBAR  – scroll effect
═══════════════════════════════════════════════════════════════ */
window.addEventListener('scroll', () => {
    const nav = document.querySelector('.navbar');
    if (!nav) return;
    nav.classList.toggle('nav-scrolled', window.scrollY > 50);
});

/* ═══════════════════════════════════════════════════════════════
   SLIDESHOW  (index.html)
═══════════════════════════════════════════════════════════════ */
let slideIndex  = 0;
let slideTimer  = null;

function buildDots(count) {
    const container = document.querySelector('.slide-dots');
    if (!container) return;
    container.innerHTML = '';
    for (let i = 0; i < count; i++) {
        const dot = document.createElement('span');
        if (i === 0) dot.classList.add('active');
        dot.addEventListener('click', () => goToSlide(i));
        container.appendChild(dot);
    }
}

function updateDots() {
    const dots = document.querySelectorAll('.slide-dots span');
    dots.forEach((d, i) => d.classList.toggle('active', i === slideIndex));
}

function goToSlide(index) {
    const slides = document.querySelectorAll('#slide-holder img');
    if (!slides.length) return;
    slides[slideIndex].classList.remove('active');
    slideIndex = (index + slides.length) % slides.length;
    slides[slideIndex].classList.add('active');
    updateDots();
}

function changeSlide(dir) {
    const slides = document.querySelectorAll('#slide-holder img');
    if (!slides.length) return;
    clearInterval(slideTimer);
    goToSlide(slideIndex + dir);
    startAutoPlay();
}

function startAutoPlay() {
    clearInterval(slideTimer);
    slideTimer = setInterval(() => goToSlide(slideIndex + 1), 5000);
}

if (document.getElementById('slide-holder')) {
    fetch('data.json')
        .then(r => r.json())
        .then(data => {
            const holder = document.getElementById('slide-holder');

            data.featured.forEach((src, i) => {
                const img = document.createElement('img');
                img.src = src;
                img.alt = `Featured painting ${i + 1} – Zudor Kristófi Enikő`;
                if (i === 0) img.classList.add('active');
                holder.appendChild(img);
            });

            buildDots(data.featured.length);
            startAutoPlay();
        });
}

/* ═══════════════════════════════════════════════════════════════
   GALLERY  (gallery.html)
═══════════════════════════════════════════════════════════════ */
let allImages    = [];   // flat array for lightbox
let allTitles    = [];   // matching titles
let allAlbums    = [];   // matching album name
let currentIndex = 0;

if (document.getElementById('album-container')) {
    fetch('data.json')
        .then(r => r.json())
        .then(data => {
            const container = document.getElementById('album-container');

            data.albums.forEach((album, albumIdx) => {
                const section = document.createElement('div');
                section.className = 'album-section';

                const header = document.createElement('div');
                header.className = 'album-header';
                header.innerHTML = `
                    <div class="album-header-left">
                        <h2>${album.title}</h2>
                        <span class="album-count">${album.images.length} works</span>
                    </div>
                    <span class="album-toggle">+</span>
                `;

                const grid = document.createElement('div');
                grid.className = 'album-grid';
                // First album open by default
                grid.style.display = albumIdx === 0 ? 'grid' : 'none';
                if (albumIdx === 0) header.querySelector('.album-toggle').classList.add('open');

                // Build figures
                album.images.forEach((src, imgIdx) => {
                    // Collect for lightbox
                    const globalIdx = allImages.length;
                    allImages.push(src);

                    // Use title from data if present, otherwise generate one
                    const title = (album.titles && album.titles[imgIdx]) || `${album.title} No. ${imgIdx + 1}`;
                    const year  = (album.years  && album.years[imgIdx])  || '';
                    allTitles.push(title);
                    allAlbums.push(album.title);

                    const figure = document.createElement('figure');

                    const img = document.createElement('img');
                    img.src = src;
                    img.alt = title;
                    img.loading = 'lazy';

                    const overlay = document.createElement('div');
                    overlay.className = 'img-overlay';
                    overlay.innerHTML = `
                        <div class="painting-title">${title}</div>
                        ${year ? `<div class="painting-year">${year}</div>` : ''}
                    `;

                    figure.appendChild(img);
                    figure.appendChild(overlay);
                    figure.addEventListener('click', (e) => {
                        e.stopPropagation();
                        openLightbox(globalIdx);
                    });

                    grid.appendChild(figure);
                });

                // Toggle accordion
                header.addEventListener('click', () => {
                    const isOpen = grid.style.display !== 'none';
                    grid.style.display = isOpen ? 'none' : 'grid';
                    header.querySelector('.album-toggle').classList.toggle('open', !isOpen);
                });

                section.appendChild(header);
                section.appendChild(grid);
                container.appendChild(section);
            });
        });
}

/* ─── Lightbox ────────────────────────────────────────────────── */
function openLightbox(index) {
    currentIndex = index;
    const lb = document.getElementById('lightbox');
    if (!lb) return;

    lb.style.display = 'flex';
    _renderLightbox();
}

function _renderLightbox() {
    const img     = document.getElementById('lightbox-img');
    const title   = document.getElementById('lb-title');
    const album   = document.getElementById('lb-album');
    const counter = document.getElementById('lb-counter');

    img.style.opacity = '0';
    img.src = allImages[currentIndex];
    img.onload = () => { img.style.opacity = '1'; };

    if (title)   title.textContent   = allTitles[currentIndex] || '';
    if (album)   album.textContent   = allAlbums[currentIndex] || '';
    if (counter) counter.textContent = `${currentIndex + 1} / ${allImages.length}`;
}

function navigateLightbox(dir) {
    currentIndex = (currentIndex + dir + allImages.length) % allImages.length;
    _renderLightbox();
}

function closeLightbox() {
    const lb = document.getElementById('lightbox');
    if (lb) lb.style.display = 'none';
}

// Keyboard navigation
document.addEventListener('keydown', (e) => {
    const lb = document.getElementById('lightbox');
    if (!lb || lb.style.display === 'none') return;

    if (e.key === 'ArrowRight') navigateLightbox(1);
    if (e.key === 'ArrowLeft')  navigateLightbox(-1);
    if (e.key === 'Escape')     closeLightbox();
});

// Click backdrop to close
document.addEventListener('click', (e) => {
    const lb = document.getElementById('lightbox');
    if (lb && e.target === lb) closeLightbox();
});

