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

    // Nur die Wellen-Bewegung, NICHT die horizontale Position (wird von GSAP gesteuert)
    function updateSubmarineWave() {
        const scrollPercent = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
        const minTop = 40;
        const maxTop = 80;
        const topPosition = minTop + (scrollPercent * (maxTop - minTop));
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

    // GSAP Animation für Zone 1 -> Schildkröte
    let zone1AnimationPlayed = false;
    let zone1AnimationReversed = false;
    let turtleFixed = false;

    if (zone1Section && turtleContainer) {
        window.addEventListener('scroll', () => {
            const zone1Rect = zone1Section.getBoundingClientRect();
            const zone1Height = zone1Section.offsetHeight;
            const zone1ScrolledIn = zone1Height - zone1Rect.top;
            const zone1Progress = zone1ScrolledIn / zone1Height;

            const zone1Box = zone1Section.querySelector('.content-box');

            // Animation startet ERST bei 85% Scroll in Zone 1
            if (zone1Progress > 0.85 && zone1Progress < 2.0) {
                if (!zone1AnimationPlayed) {
                    zone1AnimationPlayed = true;
                    zone1AnimationReversed = false;

                    const tl = gsap.timeline({
                        onComplete: () => {
                            // Nach Animation: Schildkröte bleibt stehen
                            turtleFixed = true;
                        }
                    });

                    // 1. Text gleitet nach links raus
                    if (zone1Box) {
                        tl.to(zone1Box, {
                            x: '-200%',
                            duration: 1.2,
                            ease: 'power2.inOut'
                        }, 0);
                    }

                    // 2. Schildkröte + Blase schwimmen GEMEINSAM von RECHTS herein
                    tl.fromTo(turtleContainer, 
                        {
                            right: '-1000px',
                            left: 'auto'
                        },
                        {
                            right: 'auto',
                            left: '50%',
                            x: '-50%',
                            duration: 1.8,
                            ease: 'power2.out'
                        }, 0);

                    // 3. U-Boot taucht nach links
                    tl.to(submarine, {
                        left: '220px',
                        right: 'auto',
                        duration: 1.2,
                        ease: 'power2.inOut'
                    }, 0);
                }
            } else if (zone1Progress <= 0.85 && !turtleFixed) {
                if (zone1AnimationPlayed && !zone1AnimationReversed) {
                    zone1AnimationReversed = true;
                    zone1AnimationPlayed = false;

                    const tlBack = gsap.timeline();

                    if (zone1Box) {
                        tlBack.to(zone1Box, {
                            x: 0,
                            duration: 1.2,
                            ease: 'power2.inOut'
                        }, 0);
                    }

                    tlBack.to(turtleContainer, {
                        right: '-1000px',
                        left: 'auto',
                        x: 0,
                        duration: 1.5,
                        ease: 'power2.in'
                    }, 0);

                    tlBack.to(submarine, {
                        left: 'auto',
                        right: '8%',
                        duration: 1.2,
                        ease: 'power2.inOut'
                    }, 0);
                }
            }
        });
    }

    // GSAP Animation für Zone 2
    let zone2AnimationPlayed = false;

    if (zone2Section) {
        window.addEventListener('scroll', () => {
            const zone2Rect = zone2Section.getBoundingClientRect();
            const zone2Height = zone2Section.offsetHeight;
            const zone2ScrolledIn = zone2Height - zone2Rect.top;
            const zone2Progress = zone2ScrolledIn / zone2Height;

            const zone2Box = zone2Section.querySelector('.content-box');

            // Erst bei 30% in Zone 2
            if (zone2Progress > 0.3 && !zone2AnimationPlayed) {
                zone2AnimationPlayed = true;
                turtleFixed = false;

                const tl2 = gsap.timeline();

                // U-Boot taucht ZURÜCK nach rechts
                tl2.to(submarine, {
                    left: 'auto',
                    right: '8%',
                    duration: 1.2,
                    ease: 'power2.inOut'
                }, 0);

                // Schildkröte verschwindet nach rechts raus
                tl2.to(turtleContainer, {
                    right: '-1000px',
                    left: 'auto',
                    x: 0,
                    duration: 1.5,
                    ease: 'power2.in'
                }, 0);

                // Text Zone 2 erscheint
                if (zone2Box && !zone2Box.classList.contains('visible')) {
                    zone2Box.classList.add('visible');
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
    updateSubmarineWave();
    updateDepthMeter();
    updateMeterScroll();
});