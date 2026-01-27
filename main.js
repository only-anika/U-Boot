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

// Tiefenwerte für jede Zone (in Metern)
const depthRanges = [
{ start: 0, end: 200 },
{ start: 200, end: 1000 },
{ start: 1000, end: 4000 },
{ start: 4000, end: 6000 },
{ start: 6000, end: 11000 }
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
const minTop = 50;
const maxTop = 80;
const topPosition = minTop + (scrollPercent * (maxTop - minTop));
const horizontalWave = Math.sin(scrollPercent * Math.PI * 4) * 8;
const baseRight = 8;
const rotation = Math.sin(scrollPercent * Math.PI * 6) * 8;

submarine.style.top = `${topPosition}%`;
submarine.style.right = `${baseRight + horizontalWave}%`;
submarine.style.transform = `rotate(${rotation}deg)`;
}

// KORRIGIERT: Tiefenmeter scrollt richtig
function updateMeterScroll() {
const scrollPercent = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
const windowHeight = window.innerHeight;
// 0m startet bei 50vh (Mitte = Wellen)
// Bei scrollPercent = 0: top = 50vh (0m ist in der Mitte)
// Bei scrollPercent = 1: top = 50vh - 5500px (11000m ist in der Mitte)
const meterTop = (windowHeight * 0.5) - (scrollPercent * 5500);
depthMeter.style.top = `${meterTop}px`;
}

function updateDepthMeter() {
const scrollPercent = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);

// Berechne aktuelle Tiefe
let currentDepth = 0;
const totalZones = depthRanges.length;
const zoneProgress = scrollPercent * totalZones;
const currentZoneIndex = Math.min(Math.floor(zoneProgress), totalZones - 1);
const zoneLocalProgress = zoneProgress - currentZoneIndex;
const currentRange = depthRanges[currentZoneIndex];
currentDepth = currentRange.start + (currentRange.end - currentRange.start) * zoneLocalProgress;

// Zeige die aktuelle Tiefe
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

// Intersection Observer
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
