document.addEventListener('DOMContentLoaded', () => {
    const background = document.querySelector('.ocean-background');
    const contentSections = document.querySelectorAll('.content-section');
    const contentBoxes = document.querySelectorAll('.content-box');
    
    // Scroll-basierter Hintergrund-Parallax
    let ticking = false;
    
    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                updateBackground();
                ticking = false;
            });
            ticking = true;
        }
    });
    
    function updateBackground() {
        const scrollPercent = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
        const backgroundOffset = scrollPercent * 100;
        
        // Bewege den Hintergrund beim Scrollen durch alle 5 Zonen
        background.style.backgroundPosition = `center ${backgroundOffset}%`;
    }
    
    // Intersection Observer für Fade-In Effekte
    const observerOptions = {
        threshold: 0.2,
        rootMargin: '0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);
    
    // Alle Content-Boxen beobachten
    contentBoxes.forEach(box => {
        observer.observe(box);
    });
    
    // Zeige die aktuelle Zone im Konsole (für Entwicklung)
    let currentZone = 1;
    window.addEventListener('scroll', () => {
        contentSections.forEach((section, index) => {
            const rect = section.getBoundingClientRect();
            if (rect.top <= window.innerHeight / 2 && rect.bottom >= window.innerHeight / 2) {
                if (currentZone !== index + 1) {
                    currentZone = index + 1;
                    console.log(`Aktuelle Zone: ${currentZone}`);
                }
            }
        });
    });
});