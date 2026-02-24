// Hide loader
window.addEventListener('load', () => {
    const loader = document.getElementById('loader');
    // We wait for the video to play out, then fade opacity
    setTimeout(() => {
        loader.style.opacity = '0';
        // Completely remove after the 1s transition finishes
        setTimeout(() => {
            loader.style.display = 'none';
        }, 1000); 
    }, 4500); 
});

let allImages = []; // Global list for lightbox navigation
let currentIndex = 0;

// nav scroll effect   
window.onscroll = function() {
    const nav = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        nav.classList.add('nav-scrolled');
    } else {
        nav.classList.remove('nav-scrolled');
    }
};

// Load Gallery Data
if (document.getElementById('album-container')) {
    fetch('data.json')
        .then(res => res.json())
        .then(data => {
            const container = document.getElementById('album-container');
            // FIND THIS SECTION IN YOUR SCRIPT:
    data.albums.forEach(album => {
    const section = document.createElement('div');
    section.className = 'album-section';
    
    // REPLACE THIS INNERHTML:
    section.innerHTML = `
        <div class="album-header">
            <h2>${album.title}</h2>
            <span>+</span>
        </div>
        <div class="album-grid" style="display: none;"></div>
    `;
    
    const grid = section.querySelector('.album-grid');
    const header = section.querySelector('.album-header');

    // Updated toggle logic to handle the new DIV structure
    header.onclick = () => {
        const isHidden = grid.style.display === 'none';
        grid.style.display = isHidden ? 'grid' : 'none';
        header.querySelector('span').innerText = isHidden ? '-' : '+';
    };

    album.images.forEach(src => {
        const img = document.createElement('img');
        img.src = src;
        img.onclick = (e) => {
            e.stopPropagation(); 
            openLightbox(src, album.images); // This still opens the full image
        };
        grid.appendChild(img);
    });
    container.appendChild(section);
});
        });
}

function openLightbox(src, albumArray) {
    allImages = albumArray;
    currentIndex = allImages.indexOf(src);
    document.getElementById('lightbox').style.display = 'flex';
    document.getElementById('lightbox-img').src = src;
}

function navigateLightbox(dir) {
    currentIndex = (currentIndex + dir + allImages.length) % allImages.length;
    document.getElementById('lightbox-img').src = allImages[currentIndex];
}

function closeLightbox() {
    document.getElementById('lightbox').style.display = 'none';
}

// --- Slideshow Logic for index.html ---
let slideIndex = 0;

if (document.getElementById('slide-holder')) {
    fetch('data.json')
        .then(res => res.json())
        .then(data => {
            const holder = document.getElementById('slide-holder');
            
            data.featured.forEach((src, index) => {
                const img = document.createElement('img');
                img.src = src;
                // Make the first image visible by default
                if (index === 0) img.classList.add('active');
                holder.appendChild(img);
            });
        });
}

// Function for the arrows
function changeSlide(dir) {
    const slides = document.querySelectorAll('#slide-holder img');
    if (slides.length === 0) return;

    // Hide current slide
    slides[slideIndex].classList.remove('active');

    // Calculate next index
    slideIndex = (slideIndex + dir + slides.length) % slides.length;

    // Show next slide
    slides[slideIndex].classList.add('active');
}