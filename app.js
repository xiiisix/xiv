const canvas = document.getElementById('playground');
const ctx = canvas.getContext('2d');

let particles = [];
const mouse = { x: null, y: null, targetX: null, targetY: null, radius: 100 };

// Lava Lamp Gradient Configuration Trackers
let hueShift = 0;
const liquidNodes = [
    { x: 0, y: 0, vx: 0.002, vy: 0.003, t: 0 },
    { x: 0, y: 0, vx: 0.004, vy: 0.001, t: Math.PI },
    { x: 0, y: 0, vx: 0.001, vy: 0.005, t: Math.PI / 2 }
];

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

window.addEventListener('mousemove', (e) => {
    mouse.targetX = e.x;
    mouse.targetY = e.y;
});

window.addEventListener('mouseout', () => {
    mouse.targetX = null;
    mouse.targetY = null;
    mouse.x = null;
    mouse.y = null;
});

// Parallax Particle Logic
class Particle {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 3 + 0.5;
        this.baseX = this.x;
        this.baseY = this.y;
        this.density = (Math.random() * 30) + 1;
        
        // Define depth layers and opacity based on size
        if (this.size < 1.5) {
            this.depth = 0.25; 
            this.color = 'rgba(0, 255, 200, 0.25)';
        } else if (this.size < 2.5) {
            this.depth = 0.65;  
            this.color = 'rgba(0, 255, 200, 0.55)';
        } else {
            this.depth = 1.4;  
            this.color = 'rgba(0, 255, 200, 0.85)';
        }
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
    }

    update() {
        let parallaxX = 0;
        let parallaxY = 0;
        
        if (mouse.x !== null) {
            let screenCenterX = canvas.width / 2;
            let screenCenterY = canvas.height / 2;
            parallaxX = (mouse.x - screenCenterX) * this.depth * 0.045;
            parallaxY = (mouse.y - screenCenterY) * this.depth * 0.045;
        }

        let targetX = this.baseX + parallaxX;
        let targetY = this.baseY + parallaxY;

        let dx = mouse.x - this.x;
        let dy = mouse.y - this.y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < mouse.radius && mouse.x !== null) {
            let forceDirectionX = dx / distance;
            let forceDirectionY = dy / distance;
            let force = (mouse.radius - distance) / mouse.radius;
            let directionX = forceDirectionX * force * this.density;
            let directionY = forceDirectionY * force * this.density;
            
            this.x -= directionX;
            this.y -= directionY;
        } else {
            if (this.x !== targetX) {
                let dx = this.x - targetX;
                this.x -= dx / 12;
            }
            if (this.y !== targetY) {
                let dy = this.y - targetY;
                this.y -= dy / 12;
            }
        }
    }
}

function init() {
    particles = [];
    const numberOfParticles = (canvas.width * canvas.height) / 7500;
    for (let i = 0; i < numberOfParticles; i++) {
        particles.push(new Particle());
    }
}

// Generate the undulating lava fluid gradient backplate
function drawLavaLampBackground() {
    hueShift += 0.12;
    
    // Animate fluid center positions using trig waves
    liquidNodes.forEach(node => {
        node.t += 0.004;
        node.x = canvas.width / 2 + Math.sin(node.t * 1.1) * (canvas.width * 0.28);
        node.y = canvas.height / 2 + Math.cos(node.t * 0.7) * (canvas.height * 0.28);
    });

    // Create a dynamic radial gradient mapping across coordinates
    let gradient = ctx.createRadialGradient(
        liquidNodes[0].x, liquidNodes[0].y, 20,
        liquidNodes[1].x, liquidNodes[1].y, Math.max(canvas.width, canvas.height)
    );

    // Deep lava fluid color configurations shifting over time
    gradient.addColorStop(0, `hsl(${(hueShift + 140) % 360}, 65%, 7%)`);
    gradient.addColorStop(0.35, `hsl(${(hueShift + 190) % 360}, 60%, 4%)`);
    gradient.addColorStop(0.75, `hsl(${(hueShift + 240) % 360}, 45%, 2%)`);
    gradient.addColorStop(1, '#030508');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function animate() {
    // 1. Render the liquid fluid background first
    drawLavaLampBackground();
    
    if (mouse.targetX !== null) {
        if (mouse.x === null) {
            mouse.x = mouse.targetX;
            mouse.y = mouse.targetY;
        } else {
            mouse.x += (mouse.targetX - mouse.x) * 0.07;
            mouse.y += (mouse.targetY - mouse.y) * 0.07;
        }
    }

    // 2. Render particles over the gradient mesh
    for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();
    }
    requestAnimationFrame(animate);
}

init();
animate();


// --- Music Player Core Logic ---
const audioEngine = document.getElementById('audio-engine');
const playTrigger = document.getElementById('play-trigger');
const playIcon = document.getElementById('play-icon');
const progressBar = document.getElementById('progress-bar');
const progressContainer = document.getElementById('progress-container');

let isPlaying = false;

function togglePlayback() {
    if (isPlaying) {
        audioEngine.pause();
        playIcon.className = 'fa-solid fa-play';
        isPlaying = false;
    } else {
        if(audioEngine.src && audioEngine.src !== window.location.href) {
            audioEngine.play().catch(err => console.log("Audio file missing."));
        }
        playIcon.className = 'fa-solid fa-pause';
        isPlaying = true;
    }
}

playTrigger.addEventListener('click', togglePlayback);

audioEngine.addEventListener('timeupdate', () => {
    if (audioEngine.duration) {
        const progressPercentage = (audioEngine.currentTime / audioEngine.duration) * 100;
        progressBar.style.width = `${progressPercentage}%`;
        
        let currentMin = Math.floor(audioEngine.currentTime / 60);
        let currentSec = Math.floor(audioEngine.currentTime % 60);
        if (currentSec < 10) currentSec = `0${currentSec}`;
        document.getElementById('current-time').innerText = `${currentMin}:${currentSec}`;
    }
});

progressContainer.addEventListener('click', (e) => {
    const width = progressContainer.clientWidth;
    const clickX = e.offsetX;
    const duration = audioEngine.duration;
    if (duration) {
        audioEngine.currentTime = (clickX / width) * duration;
    }
});


// --- Dynamic Matrix Title Static ---
function randomTitleStatic() {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;':\",./<>?";
    let randomTitle = "";
    for (let i = 0; i < 12; i++) {
        randomTitle += characters[Math.floor(Math.random() * characters.length)];
    }
    document.title = randomTitle;
}
setInterval(randomTitleStatic, 10);
