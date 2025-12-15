// Smooth Scrolling Effekte und Animationen

document.addEventListener('DOMContentLoaded', () => {
    // Elemente für Animationen
    const seaweedStrands = document.querySelectorAll('.seaweed-strand');
    
    // Algen-Animation
    function animateSeaweed() {
        seaweedStrands.forEach((strand, index) => {
            const delay = index * 0.2;
            const duration = 2 + (index * 0.3);
            
            strand.style.animation = `sway ${duration}s ease-in-out ${delay}s infinite`;
        });
    }
    
    // CSS Animation für Algen hinzufügen
    const style = document.createElement('style');
    style.textContent = `
        @keyframes sway {
            0%, 100% { transform: rotate(-10deg); }
            50% { transform: rotate(10deg); }
        }
    `;
    document.head.appendChild(style);
    
    animateSeaweed();
    
    // Scroll-basierte Fade-In Effekte
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Alle Content-Boxen beobachten
    document.querySelectorAll('.content-box').forEach(box => {
        box.style.opacity = '0';
        box.style.transform = 'translateY(30px)';
        box.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
        observer.observe(box);
    });
    
    // Scroll-Fortschritt Logger (optional, für Entwicklung)
    let ticking = false;
    
    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
                console.log(`Scroll: ${scrollPercent.toFixed(2)}%`);
                ticking = false;
            });
            ticking = true;
        }
    });
});