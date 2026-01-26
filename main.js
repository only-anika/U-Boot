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

// Scroll-basierter Hintergrund-Parallax und U-Boot-Bewegung
let ticking = false;
window.addEventListener('scroll', () => {
if (!ticking) {
window.requestAnimationFrame(() => {
updateBackground();
updateSubmarine();
updateDepthMeter();
updateMeterScroll(); // DAS MASSTBAND SCROLLT MIT
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
const minTop = 15;
const maxTop = 75;
const topPosition = minTop + (scrollPercent * (maxTop - minTop));
const horizontalWave = Math.sin(scrollPercent * Math.PI * 4) * 8;
const baseLeft = 8;
const rotation = Math.sin(scrollPercent * Math.PI * 6) * 8;

submarine.style.top = `${topPosition}%`;
submarine.style.left = `${baseLeft + horizontalWave}%`;
submarine.style.transform = `rotate(${rotation}deg)`;
}

// DAS MASSTBAND SCROLLT NACH UNTEN
function updateMeterScroll() {
const scrollPercent = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
// Das Maßband bewegt sich nach unten (von 0 bis -2500px)
const meterTop = -(scrollPercent * 2500);
depthMeter.style.top = `${meterTop}px`;
}

function updateDepthMeter() {
const scrollPercent = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);

// Berechne aktuelle Tiefe basierend auf Scroll-Position
let currentDepth = 0;
const totalZones = depthRanges.length;
const zoneProgress = scrollPercent * totalZones;
const currentZoneIndex = Math.min(Math.floor(zoneProgress), totalZones - 1);
const zoneLocalProgress = zoneProgress - currentZoneIndex;
const currentRange = depthRanges[currentZoneIndex];
currentDepth = currentRange.start + (currentRange.end - currentRange.start) * zoneLocalProgress;

// Animiere die Tiefenzahl mit GSAP
gsap.to(depthValue, {
innerText: Math.round(currentDepth),
duration: 0.2,
snap: { innerText: 1 },
ease: "power1.out"
});

// Ändere Marker-Farbe basierend auf Tiefe
let markerColor = '#4db8ff';
if (currentDepth > 6000) {
markerColor = '#8b0000';
} else if (currentDepth > 4000) {
markerColor = '#ff4444';
} else if (currentDepth > 1000) {
markerColor = '#ff8844';
} else if (currentDepth > 200) {
markerColor = '#ffaa44';
}

gsap.to(meterMarker, {
background: markerColor,
boxShadow: `0 0 20px ${markerColor}`,
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
console.log(`Aktuelle Zone: ${currentZone}`);
}
}
});
});

// Initiale Updates
updateSubmarine();
updateDepthMeter();
updateMeterScroll();
});
