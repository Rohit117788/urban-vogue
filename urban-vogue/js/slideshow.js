// Slideshow functionality
let currentSlide = 0;
let slideInterval;

function initSlideshow() {
    const slides = document.querySelectorAll('.slide');
    const indicators = document.getElementById('slideshowIndicators');
    
    if (!slides.length || !indicators) return;

    // Create indicators
    slides.forEach((_, index) => {
        const indicator = document.createElement('div');
        indicator.className = 'slideshow-indicator';
        if (index === 0) indicator.classList.add('active');
        indicator.addEventListener('click', () => goToSlide(index));
        indicators.appendChild(indicator);
    });

    // Start slideshow
    startSlideshow();
}

function startSlideshow() {
    slideInterval = setInterval(() => {
        nextSlide();
    }, 5000); // 5 seconds
}

function nextSlide() {
    const slides = document.querySelectorAll('.slide');
    const indicators = document.querySelectorAll('.slideshow-indicator');
    
    if (slides.length === 0) return;

    slides[currentSlide].classList.remove('active');
    if (indicators[currentSlide]) {
        indicators[currentSlide].classList.remove('active');
    }

    currentSlide = (currentSlide + 1) % slides.length;

    slides[currentSlide].classList.add('active');
    if (indicators[currentSlide]) {
        indicators[currentSlide].classList.add('active');
    }
}

function goToSlide(index) {
    const slides = document.querySelectorAll('.slide');
    const indicators = document.querySelectorAll('.slideshow-indicator');
    
    if (index < 0 || index >= slides.length) return;

    slides[currentSlide].classList.remove('active');
    if (indicators[currentSlide]) {
        indicators[currentSlide].classList.remove('active');
    }

    currentSlide = index;

    slides[currentSlide].classList.add('active');
    if (indicators[currentSlide]) {
        indicators[currentSlide].classList.add('active');
    }

    // Reset interval
    clearInterval(slideInterval);
    startSlideshow();
}

// Load slideshow images from server
async function loadSlideshowImages() {
    try {
        const token = localStorage.getItem('authToken');
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
        
        const response = await fetch(`${API_BASE_URL}/slideshow/images`, { headers });
        
        if (response.ok) {
            const images = await response.json();
            updateSlideshowImages(images);
        }
    } catch (error) {
        console.error('Error loading slideshow images:', error);
    }
}

function updateSlideshowImages(images) {
    const slides = document.querySelectorAll('.slide');
    if (images.length === 0) return;

    images.forEach((image, index) => {
        if (slides[index]) {
            const img = slides[index].querySelector('img');
            if (img) {
                img.src = image.url || image;
                img.alt = image.alt || `Slideshow Image ${index + 1}`;
            }
        }
    });
}

document.addEventListener('DOMContentLoaded', function() {
    initSlideshow();
    loadSlideshowImages();
});

