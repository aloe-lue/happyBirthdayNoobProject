import _ from "lodash";
import "./style.css";
import SliceOfCakesSpriteSheet from "./Spritesheet_Cakes_WITH_OUTLINE.png";
import CakeTileset from "./cake-tileset.png";
import AppleIcon from "./apple-touch-icon.png";
import AndroidIcon from "./favicon-32x32.png";
import SandroidIcon from "./favicon-16x16.png";
import Webmanifest from "./site.webmanifest";

const canvas = document.getElementById('birthdayCanvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// --- ASSETS CONFIGURATION ---
const cakeSheet = new Image();
cakeSheet.src = SliceOfCakesSpriteSheet; // Yung cake slice file mo kanina

const cakeTileset = new Image();
cakeTileset.src = CakeTileset; // Yung cake slice file mo kanina

// Cake Config
const totalSlices = 12; 
const cakeWidth = 32;  
const cakeHeight = 32; 

const confettiParticles = [];
const activeCakes = [];
const MAX_CAKES = 128;
const MAX_CONFETTI = 256;

// --- FLOATING CAKE PHYSICS CLASS ---
class FloatingCake {
    constructor() {
        this.spriteIndex = Math.floor(Math.random() * totalSlices);
        this.baseSize = 70 + Math.random() * 50; 
        this.scale = 1.0;
        this.radius = (this.baseSize * this.scale) / 2; 
        
        this.x = 0;
        this.y = 0;
        this.vx = (Math.random() - 0.5) * 2; 
        this.vy = (Math.random() - 0.5) * 2; 
        
        this.angle = Math.random() * Math.PI * 2; 
        this.spinSpeed = (Math.random() - 0.5) * 0.03; 
        this.scaleSpeed = 0.0006 + Math.random() * 0.001; 

        this.findInitialPosition();
    }

    findInitialPosition() {
        let attempts = 0;
        let valid = false;
        while (!valid && attempts < 200) {
            this.x = this.radius + Math.random() * (canvas.width - this.radius * 2);
            // Floating primarily over the middle-bottom world area
            this.y = this.radius + Math.random() * (canvas.height - this.radius * 2);
            valid = true;
            for (let other of activeCakes) {
                let dist = Math.hypot(this.x - other.x, this.y - other.y);
                if (dist < (this.radius + other.radius + 15)) {
                    valid = false;
                    break;
                }
            }
            attempts++;
        }
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.angle += this.spinSpeed; 
        this.scale -= this.scaleSpeed; 
        this.radius = (this.baseSize * this.scale) / 2; 

        // Bounce boundaries
        if (this.x - this.radius < 0 || this.x + this.radius > canvas.width) this.vx *= -1;
        if (this.y - this.radius < 0 || this.y + this.radius > canvas.height) this.vy *= -1;
    }

    draw() {
        if (this.scale <= 0) return;
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        
        // Draw cake slice
        ctx.drawImage(
            cakeSheet,
            this.spriteIndex * cakeWidth, 0, 
            cakeWidth, cakeHeight,         
            -(this.baseSize * this.scale) / 2, 
            -(this.baseSize * this.scale) / 2, 
            this.baseSize * this.scale,        
            this.baseSize * this.scale         
        );
        ctx.restore();
    }
}


// --- CAKE COLLISION DETECTION RESOLUTION ---
function handleCakeCollisions() {
    for (let i = 0; i < activeCakes.length; i++) {
        for (let j = i + 1; j < activeCakes.length; j++) {
            let c1 = activeCakes[i];
            let c2 = activeCakes[j];
            let dx = c2.x - c1.x;
            let dy = c2.y - c1.y;
            let distance = Math.hypot(dx, dy);
            let minDist = c1.radius + c2.radius;

            if (distance < minDist) {
                let overlap = minDist - distance;
                let nx = dx / distance;
                let ny = dy / distance;

                c1.x -= nx * (overlap / 2);
                c1.y -= ny * (overlap / 2);
                c2.x += nx * (overlap / 2);
                c2.y += ny * (overlap / 2);

                let kx = c1.vx - c2.vx;
                let ky = c1.vy - c2.vy;
                let p = 2 * (nx * kx + ny * ky) / 2;

                c1.vx -= p * nx;
                c1.vy -= p * ny;
                c2.vx += p * nx;
                c2.vy += p * ny;
            }
        }
    }
}

// --- CONFETTI BACKGROUND ---
class Confetti {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height - canvas.height;
        this.size = 4 + Math.random() * 6;
        this.color = `hsl(${Math.random() * 360}, 100%, 60%)`;
        this.speedX = (Math.random() - 0.5) * 2;
        this.speedY = 1.5 + Math.random() * 3;
        this.rotation = Math.random() * 360;
        this.rotationSpeed = Math.random() * 4;
    }
    update() {
        this.y += this.speedY;
        this.x += this.speedX;
        this.rotation += this.rotationSpeed;
        if (this.y > canvas.height) {
            this.y = -10;
            this.x = Math.random() * canvas.width;
        }
    }
    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation * Math.PI / 180);
        ctx.fillStyle = this.color;
        ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
        ctx.restore();
    }
}

for (let i = 0; i < MAX_CONFETTI; i++) {
    confettiParticles.push(new Confetti());
}

const tileHeight = 60;
const tileWidth = 30;


const myMap = [
    [4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4], 
    [4, 4, 4, 4, 4, 4, 4, 4, 9, 4, 4, 9, 9, 9, 4, 4], 
    [4, 4, 4, 4, 4, 13, 4, 4, 9, 4, 4, 9, 4, 9, 4, 4], 
    [4, 4, 4, 4, 4, 13, 4, 4, 9, 4, 4, 4, 4, 9, 4, 4], 
    [4, 4, 4, 4, 4, 12, 4, 4, 9, 9, 9, 9, 9, 9, 4, 4], 
    [4, 4, 4, 4, 4, 13, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4], 
    [4, 13, 13, 10, 13, 12, 4, 4, 2, 2, 2, 2, 2, 2, 4, 4], 
    [4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 2, 4, 4, 4, 4], 
    [4, 15, 15, 14, 15, 15, 4, 4, 4, 4, 2, 4, 4, 4, 4, 4], 
    [4, 15, 4, 4, 4, 14, 4, 4, 4, 2, 4, 4, 4, 4, 4, 4], 
    [4, 15, 14, 15, 15, 15, 4, 4, 2, 2, 2, 2, 2, 2, 4, 4], 
    [4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4,4, 4], 
    [4, 4, 4, 4, 4, 7, 4, 4, 12, 4, 4, 4, 4, 12, 4, 4], 
    [4, 4, 4, 4, 4, 5, 4, 4, 12, 4, 12, 4, 4, 12, 4, 4], 
    [4, 4, 4, 4, 8, 5, 4, 4, 12, 4, 12, 4, 4, 12, 4, 4], 
    [4, 5, 6, 5, 6, 5, 4, 4, 12, 12, 12, 12, 12, 12, 4, 4], 
    [4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4], 
];
// Dynamic precision splitting para sa 16 na magkakaibang tiles
const totalSprites = 16;
const srcW = 963 / totalSprites; // ~60.18px bawat block frame
const srcH = 52;                 // Buong taas ng sheet

// Screen Display Scales (Perfect 2:1 Isometric Ratio)
const tileW = 60; 
const tileH = 30; 

        // --- ISOMETRIC RENDERING SYSTEM ---
function drawCustomWorld() {
    const rows = myMap.length;
    const cols = myMap[0].length;

    // Dito i-aadjust ang pwesto ng mapa para laging nasa gitna ng kahit anong screen size
    const offsetX = canvas.width / 2;
    const offsetY = canvas.height / 4;

    // Nested loops na nag-rerender mula Likod-Paharap (Back-to-Front / Row-by-Row)
    // para tama ang pag-overlap ng mga 3D blocks
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            // Kunin ang tile ID mula sa iyong grid array
            const tileId = myMap[r][c];

            // Kalkulahin ang X position ng tile sa horizontal strip sheet mo
            const sheetX = tileId * srcW;

            // Isometric Coordinate Math Matrix
            // ISO X = (Col - Row) * (Width / 2)
            // ISO Y = (Col + Row) * (Height / 2)
            const isoX = (c - r) * (tileW / 2) + offsetX;
            const isoY = (c + r) * (tileH / 2) + offsetY;

            ctx.drawImage(
                cakeTileset,
                sheetX, 0, srcW, srcH,          // Clip ang eksaktong tile index base sa ID
                isoX - tileW / 2, isoY - 36,    // -36 offset para i-lock ang selyo ng 3D wall gap
                tileW, tileH * (srcH / 30)      // Preserved aspect scale ratio ng blocks mo
            );
        }
    }
}



function animate() {
    window.ticks++;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for(let star of bgStars) {
        star.update();
        star.draw();
    }

	drawCustomWorld();

    // 1. Draw Confetti Background
    for (let particle of confettiParticles) {
        particle.update();
        particle.draw();
    }

    // 2. Spawn Cake items cleanly
    if (activeCakes.length < MAX_CAKES && Math.random() < 0.04) {
        activeCakes.push(new FloatingCake());
    }

    // 3. Keep cakes bouncing cleanly without sticking
    handleCakeCollisions();

    // 4. Update and display cake frames floating above world floors
    for (let i = activeCakes.length - 1; i >= 0; i--) {
        activeCakes[i].update();
        activeCakes[i].draw();

        if (activeCakes[i].scale <= 0.05) {
            activeCakes.splice(i, 1);
        }
    }


    requestAnimationFrame(animate);
}

// Ilagay ito sa tabi ng "activeCakes" array configurations mo
const bgStars = [];
const MAX_STARS = 40;

class BackgroundStar {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = 1 + Math.random() * 2;
        this.alpha = Math.random();
        this.speed = 0.01 + Math.random() * 0.02;
    }
    update() {
        // Dynamic fading logic for subtle glowing twinkling effects
        this.alpha += this.speed;
        if (this.alpha > 1 || this.alpha < 0) this.speed *= -1;
    }
    draw() {
        ctx.fillStyle = `rgba(255, 255, 230, ${Math.abs(this.alpha)})`;
        ctx.fillRect(this.x, this.y, this.size, this.size);
    }
}

// I-initialize sa umpisa ng running loop mo
for(let i=0; i<MAX_STARS; i++) bgStars.push(new BackgroundStar());



function favicons()
{
	const link0= document.createElement("link");
	link0.rel = "apple-touch-icon";
	link0.sizes = "180x180";
	link0.href = AppleIcon;

	const link1= document.createElement("link");
	link1.rel = "icon";
	link1.sizes = "32x32";
	link1.href = AndroidIcon;

	const link2= document.createElement("link");
	link2.rel = "icon";
	link2.sizes = "16x16";
	link2.href = SandroidIcon;

	const link3= document.createElement("link");
	link3.rel = "manifest";
	link3.href = Webmanifest;

	return [link0, link1, link2, link3];
}


(function Main()
{
	let loaded = 0;
	function loader()
	{
		loaded++;
		if (loaded === 2) animate();
	}

	for (let i = 0; i < 4; i++) {
		document.head.appendChild(favicons()[i]);
	}

	cakeSheet.onload = loader;
	cakeTileset.onload = loader;
})();

