document.addEventListener('DOMContentLoaded', () => {

const background = document.querySelector('.ocean-background');
const submarine = document.querySelector('.submarine');
const contentSections = document.querySelectorAll('.content-section');
const contentBoxes = document.querySelectorAll('.content-box');
const depthValue = document.querySelector('.depth-value');
const meterMarker = document.querySelector('.meter-marker');
const depthMeter = document.querySelector('.depth-meter');

// GSAP ScrollTrigger registrieren
gsap.registerPlugin(ScrollTrigger);

// Tiefenwerte für jede Zone (in Metern)
const depthRanges = [
{ start: 0, end: 200 }, // Zone 1: Epipelagial
{ start: 200, end: 1000 }, // Zone 2: Mesopelagial
{ start: 1000, end: 4000 }, // Zone 3: Bathypelagial
{ start: 4000, end: 6000 }, // Zone 4: Abyssopelagial
{ start: 6000, end: 11000 } // Zone 5: Hadopelagial
];

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
// U-Boot bewegt sich von oben (bei den Wellen) nach unten
const minTop = 35; // Startet bei den Wellen
const maxTop = 75;
const topPosition = minTop + (scrollPercent * (maxTop - minTop));
const horizontalWave = Math.sin(scrollPercent * Math.PI * 4) * 8;
const baseRight = 8;
const rotation = Math.sin(scrollPercent * Math.PI * 6) * 8;

submarine.style.top = `${topPosition}%`;
submarine.style.right = `${baseRight + horizontalWave}%`;
submarine.style.transform = `rotate(${rotation}deg)`;
}

// WICHTIG: Das Maßband scrollt so, dass 0m bei den Wellen (Mitte) beginnt
function updateMeterScroll() {
const scrollPercent = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
// Berechnung: 
// - Bei scrollPercent = 0 (ganz oben): 0m ist in der Bildschirmmitte (50vh)
// - Marker ist bei 50vh
// - Maßband muss so positioniert sein, dass 0m (=top des Maßbands) bei 50vh ist
// - Also: top des Maßbands = 50vh bei Start
// - Beim Scrollen bewegt sich das Maßband nach oben (negativ)

const windowHeight = window.innerHeight;
const meterStart = windowHeight * 0.5; // 0m beginnt bei 50vh (Mitte = Wellen)
const totalScroll = 4500; // Wie weit das Maßband nach oben scrollt

// top Position: Startet bei +50vh und geht bis -4000px
const meterTop = meterStart - (scrollPercent * totalScroll);
depthMeter.style.top = `${meterTop}px`;
}

function updateDepthMeter() {
const scrollPercent = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);

// Berechne aktuelle Tiefe: 0m bei scrollPercent = 0, 11000m bei scrollPercent = 1
let currentDepth = 0;
const totalZones = depthRanges.length;
const zoneProgress = scrollPercent * totalZones;
const currentZoneIndex = Math.min(Math.floor(zoneProgress), totalZones - 1);
const zoneLocalProgress = zoneProgress - currentZoneIndex;
const currentRange = depthRanges[currentZoneIndex];
currentDepth = currentRange.start + (currentRange.end - currentRange.start) * zoneLocalProgress;

// Zeige die aktuelle Tiefe in der Anzeige
depthValue.textContent = Math.round(currentDepth);

// Ändere Farben basierend auf Tiefe
let markerColor = '#4db8ff';
if (currentDepth > 6000) {
markerColor = '#8b0000'; // Dunkelrot
} else if (currentDepth > 4000) {
markerColor = '#ff4444'; // Rot
} else if (currentDepth > 1000) {
markerColor = '#ff8844'; // Orange
} else if (currentDepth > 200) {
markerColor = '#ffaa44'; // Gelb-Orange
}

// Ändere Marker-Farbe
gsap.to(meterMarker, {
background: markerColor,
boxShadow: `0 0 20px ${markerColor}`,
duration: 0.5
});

// Ändere Anzeige-Farbe
gsap.to('.depth-display', {
borderColor: markerColor,
boxShadow: `0 0 30px ${markerColor}`,
duration: 0.5
});

gsap.to('.depth-value', {
color: markerColor,
textShadow: `0 0 15px ${markerColor}`,
duration: 0.5
});
}

// Intersection Observer für Fade-In Effekte der Content-Boxen
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

contentBoxes.forEach(box => {
observer.observe(box);
});

// Zeige die aktuelle Zone in der Konsole
let currentZone = 1;
window.addEventListener('scroll', () => {
contentSections.forEach((section, index) => {
const rect = section.getBoundingClientRect();
if (rect.top <= window.innerHeight / 2 && rect.bottom >= window.innerHeight / 2) {
if (currentZone !== index + 1) {
currentZone = index + 1;
console.log(`Aktuelle Zone: ${currentZone} - Tiefe: ${Math.round(parseFloat(depthValue.textContent))}m`);
}
}
});
});

// INITIALE UPDATES
updateSubmarine();
updateDepthMeter();
updateMeterScroll();
});
