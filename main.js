document.addEventListener('DOMContentLoaded', () => {
    const background = document.querySelector('.ocean-background');
    const submarine = document.querySelector('.submarine');
    const contentSections = document.querySelectorAll('.content-section');
    const contentBoxes = document.querySelectorAll('.content-box');
    const depthValue = document.querySelector('.depth-value');
    const depthDisplay = document.querySelector('.depth-display');
    const depthMeter = document.querySelector('.depth-meter');
    const turtleContainer = document.querySelector('.turtle-container');
    const zone1Section = document.querySelector('.zone-1');
    const zone2Section = document.querySelector('.zone-2');

    // GSAP ScrollTrigger registrieren
    gsap.registerPlugin(ScrollTrigger);

    let ticking = false;

    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                updateBackground();
                updateSubmarineWave();
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

    // U-Boot bewegt sich von unten nach oben beim Scrollen
    function updateSubmarineWave() {
        const scrollPercent = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
        const minTop = 40;  // Endet ein bisschen höher
        const maxTop = 55;  // Startet nicht zu weit unten
        const topPosition = maxTop - (scrollPercent * (maxTop - minTop));  // Kleine Bewegung
        const rotation = Math.sin(scrollPercent * Math.PI * 6) * 8;

        submarine.style.top = `${topPosition}%`;
        submarine.style.transform = `rotate(${rotation}deg)`;
    }

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

    // Intersection Observer für Content Boxes
    const observerOptions = {
        threshold: 0.1,
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

    // Initiale Position der Schildkröte sicherstellen - RECHTS außerhalb
    gsap.set(turtleContainer, {
        left: '100vw',
        right: 'auto',
        x: 0,
        y: '-50%',
        opacity: 1
    });

    // Schildkröten-Animation
    // Schildkröte kommt bei 2500m rein
    // Verschwindet komplett bei Zone 2
    
    let textPushedOut = false;
    let turtleVisible = false;

    if (zone1Section && zone2Section && turtleContainer) {
        window.addEventListener('scroll', () => {
            const scrollPercent = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
            const currentDepth = scrollPercent * 11000;

            const zone2Rect = zone2Section.getBoundingClientRect();
            const zone2Height = zone2Section.offsetHeight;
            const zone2ScrolledIn = zone2Height - zone2Rect.top;
            const zone2Progress = zone2ScrolledIn / zone2Height;

            const zone1Box = zone1Section.querySelector('.content-box');
            const zone2Box = zone2Section.querySelector('.content-box');

            // Bei 2000m: Text-Kästchen wird nach links rausgeschoben
            if (currentDepth >= 2000 && !textPushedOut) {
                textPushedOut = true;

                const tl = gsap.timeline();

                // Text gleitet nach links raus
                if (zone1Box) {
                    tl.to(zone1Box, {
                        x: '-200%',
                        opacity: 0,
                        duration: 1.2,
                        ease: 'power2.inOut'
                    }, 0);
                }

                // Schildkröte schwimmt GLEICHZEITIG von RECHTS rein
                turtleVisible = true;
                tl.fromTo(turtleContainer, 
                    {
                        left: '100vw',
                        right: 'auto',
                        x: 0,
                        y: '-50%',
                        opacity: 1
                    },
                    {
                        left: '50%',
                        right: 'auto',
                        x: '-50%',
                        y: '-50%',
                        opacity: 1,
                        duration: 1.2,
                        ease: 'power2.out'
                    }, 0);
            }

            // Wenn Zone 2 WIRKLICH im Sichtbereich ist: Schildkröte verschwindet
            if (zone2Progress > 0.3 && turtleVisible) {
                turtleVisible = false;

                const tl3 = gsap.timeline();

                // Schildkröte verschwindet SOFORT komplett (unsichtbar + nach links)
                tl3.to(turtleContainer, {
                    left: '-1000px',
                    right: 'auto',
                    x: 0,
                    opacity: 0,
                    duration: 1.5,
                    ease: 'power2.in',
                    display: 'none'
                }, 0);

                // Zone 2 Text erscheint
                if (zone2Box && !zone2Box.classList.contains('visible')) {
                    setTimeout(() => {
                        zone2Box.classList.add('visible');
                    }, 200);
                }
            }

            // Reset wenn zurückgescrollt wird (unter 2000m)
            if (currentDepth < 2000 && textPushedOut) {
                textPushedOut = false;
                turtleVisible = false;

                const tlBack = gsap.timeline();

                // Text kommt zurück
                if (zone1Box) {
                    tlBack.to(zone1Box, {
                        x: 0,
                        opacity: 1,
                        duration: 1.2,
                        ease: 'power2.inOut'
                    }, 0);
                }

                // Schildkröte zurück nach RECHTS außerhalb (versteckt)
                tlBack.to(turtleContainer, {
                    left: '100vw',
                    right: 'auto',
                    x: 0,
                    y: '-50%',
                    opacity: 1,
                    display: 'flex',
                    duration: 0.8,
                    ease: 'power2.in'
                }, 0);
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
    updateSubmarineWave();
    updateDepthMeter();
    updateMeterScroll();
});