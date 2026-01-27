document.addEventListener('DOMContentLoaded', () => {
    const background = document.querySelector('.ocean-background');
    const submarine = document.querySelector('.submarine');
    const contentSections = document.querySelectorAll('.content-section');
    const contentBoxes = document.querySelectorAll('.content-box');
    const depthValue = document.querySelector('.depth-value');
    const depthDisplay = document.querySelector('.depth-display');
    const depthMeter = document.querySelector('.depth-meter');

    // GSAP ScrollTrigger registrieren
    gsap.registerPlugin(ScrollTrigger);

    let ticking = false;

    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                updateBackground();
                updateSubmarine();
                updateDepthMeter();
                updateMeterScroll();
                ticking = false;
            });
            ticking = true;
        }
    });

    function updateBackground() {
        const scrollPercent = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
        const backgroundOffset = scrollPercent * 100;
        background.style.backgroundPosition = `center ${backgroundOffset}%`;
    }

    function updateSubmarine() {
        const scrollPercent = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
        const minTop = 30;
        const maxTop = 80;
        const topPosition = minTop + (scrollPercent * (maxTop - minTop));
        const horizontalWave = Math.sin(scrollPercent * Math.PI * 4) * 8;
        const baseRight = 8;
        const rotation = Math.sin(scrollPercent * Math.PI * 6) * 8;

        submarine.style.top = `${topPosition}%`;
        submarine.style.right = `${baseRight + horizontalWave}%`;
        submarine.style.transform = `rotate(${rotation}deg)`;
    }

    // Tiefenmeter scrollt von 0m bis 11.000m
    function updateMeterScroll() {
        const scrollPercent = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
        const windowHeight = window.innerHeight;
        const meterTop = (windowHeight * 0.5) - (scrollPercent * 11000);
        depthMeter.style.top = `${meterTop}px`;
    }

    function updateDepthMeter() {
        const scrollPercent = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
        const currentDepth = scrollPercent * 11000;
        depthValue.textContent = Math.round(currentDepth);

        // Farben basierend auf Tiefe
        let color = '#4db8ff';
        if (currentDepth > 6000) {
            color = '#8b0000';
        } else if (currentDepth > 4000) {
            color = '#ff4444';
        } else if (currentDepth > 1000) {
            color = '#ff8844';
        } else if (currentDepth > 200) {
            color = '#ffaa44';
        }

        // Ändere Anzeige-Farbe
        gsap.to(depthDisplay, {
            borderColor: color,
            boxShadow: `0 0 25px ${color}`,
            duration: 0.5
        });

        gsap.to(depthValue, {
            color: color,
            textShadow: `0 0 15px ${color}`,
            duration: 0.5
        });
    }

    // Intersection Observer für normale Content Boxes
    const observerOptions = {
        threshold: 0.3,
        rootMargin: '0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    contentBoxes.forEach(box => {
        observer.observe(box);
    });

    // Schildkröten-Animation - triggert beim WEITERSCROLLEN nach dem Text
    const turtleContainer = document.querySelector('.turtle-container');
    const zone1Section = document.querySelector('.zone-1');

    const turtleObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Prüfe Scroll-Fortschritt in Zone 1
                const rect = entry.target.getBoundingClientRect();
                const sectionHeight = entry.target.offsetHeight;
                const scrolledInSection = sectionHeight - rect.top;
                const scrollProgress = scrolledInSection / sectionHeight;

                // Schildkröte erscheint erst nach 60% Scroll-Fortschritt in Zone 1
                if (scrollProgress > 0.6) {
                    turtleContainer.classList.add('visible');

                    const zone1Box = zone1Section.querySelector('.content-box');
                    if (zone1Box) {
                        // Text verschwindet KOMPLETT
                        gsap.to(zone1Box, {
                            opacity: 0,
                            x: '-150%',
                            duration: 1,
                            ease: 'power2.inOut'
                        });
                    }

                    // U-Boot taucht nach rechts (rechts neben Tiefenmeter, ohne Überlappung mit Schildkröte)
                    gsap.to(submarine, {
                        left: '220px',
                        right: 'auto',
                        duration: 1,
                        ease: 'power2.inOut'
                    });
                }
            } else {
                // Wenn Zone 1 verlassen wird, zurücksetzen
                turtleContainer.classList.remove('visible');

                const zone1Box = zone1Section.querySelector('.content-box');
                if (zone1Box && zone1Box.classList.contains('visible')) {
                    gsap.to(zone1Box, {
                        opacity: 1,
                        x: 0,
                        duration: 1,
                        ease: 'power2.inOut'
                    });
                }

                // U-Boot zurück nach rechts
                gsap.to(submarine, {
                    left: 'auto',
                    right: '8%',
                    duration: 1,
                    ease: 'power2.inOut'
                });
            }
        });
    }, {
        threshold: [0, 0.2, 0.4, 0.6, 0.8, 1],
        rootMargin: '0px'
    });

    if (zone1Section) {
        turtleObserver.observe(zone1Section);

        // Zusätzlicher Scroll-Listener für feinere Kontrolle
        window.addEventListener('scroll', () => {
            const rect = zone1Section.getBoundingClientRect();
            const sectionHeight = zone1Section.offsetHeight;
            const scrolledInSection = sectionHeight - rect.top;
            const scrollProgress = scrolledInSection / sectionHeight;

            // Schildkröte erscheint erst nach 60% Scroll in Zone 1
            if (scrollProgress > 0.6 && scrollProgress < 1.5) {
                if (!turtleContainer.classList.contains('visible')) {
                    turtleContainer.classList.add('visible');

                    const zone1Box = zone1Section.querySelector('.content-box');
                    if (zone1Box) {
                        gsap.to(zone1Box, {
                            opacity: 0,
                            x: '-150%',
                            duration: 1,
                            ease: 'power2.inOut'
                        });
                    }

                    gsap.to(submarine, {
                        left: '220px',
                        right: 'auto',
                        duration: 1,
                        ease: 'power2.inOut'
                    });
                }
            } else {
                if (turtleContainer.classList.contains('visible')) {
                    turtleContainer.classList.remove('visible');

                    const zone1Box = zone1Section.querySelector('.content-box');
                    if (zone1Box) {
                        gsap.to(zone1Box, {
                            opacity: 1,
                            x: 0,
                            duration: 1,
                            ease: 'power2.inOut'
                        });
                    }

                    gsap.to(submarine, {
                        left: 'auto',
                        right: '8%',
                        duration: 1,
                        ease: 'power2.inOut'
                    });
                }
            }
        });
    }

    // Zeige Zone
    let currentZone = 1;
    window.addEventListener('scroll', () => {
        contentSections.forEach((section, index) => {
            const rect = section.getBoundingClientRect();
            if (rect.top <= window.innerHeight / 2 && rect.bottom >= window.innerHeight / 2) {
                if (currentZone !== index + 1) {
                    currentZone = index + 1;
                    console.log(`Zone ${currentZone} - ${Math.round(parseFloat(depthValue.textContent))}m`);
                }
            }
        });
    });

    // Initiale Updates
    updateSubmarine();
    updateDepthMeter();
    updateMeterScroll();
});