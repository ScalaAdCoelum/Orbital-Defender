// === ORBITAL DEFENDER GAME ===
// A space-themed arcade shooter with orbital physics, juicy effects, and tower defense elements

// === GAME INITIALIZATION ===
document.addEventListener('DOMContentLoaded', init);
setupFullscreenAuto();

// Global variables
let game = {
    canvas: null,
    ctx: null,
    width: 0,
    height: 0,
    centerX: 0,
    centerY: 0,
    lastTime: 0,
    deltaTime: 0,
    fps: 0,
    frameCount: 0,
    frameTime: 0,
    running: false,
    paused: false,
    isMobile: false,
    score: 0,
    wave: 1,
    enemiesDestroyed: 0,
    resources: 0,
    specialReady: true,
    specialCooldown: 0,
    specialCooldownTime: 10000, // 10 seconds
    highScore: 0,
    achievements: {
        firstBlood: false,       // Destroy first enemy
        wavemaster: false,       // Reach wave 5
        defender: false,         // Place 3 defense towers
        survivor: false,         // Survive 5 minutes
        sharpshooter: false,     // Destroy 10 enemies without taking damage
        resourceful: false,      // Collect 5 powerups
        bossKiller: false,       // Defeat a boss
        orbitalKing: false       // Score 10,000 points
    },
    startTime: 0,
    currentKillStreak: 0,
    powerupsCollected: 0,
    debugMode: false,
    placingTower: false,
    selectedTowerType: null,
    towerCosts: {
        laser: 100,
        missile: 250,
        shield: 150
    }
};

let input = {
    mouse: { x: 0, y: 0 },
    keys: {},
    touch: { active: false, x: 0, y: 0 },
    joystick: { active: false, x: 0, y: 0, baseX: 0, baseY: 0, maxDistance: 40 }
};

let stars = [];
let planets = [];
let player = null;
let centralBody = null;
let bullets = [];
let enemies = [];
let explosions = [];
let particles = [];
let powerups = [];
let floatingTexts = [];
let defenseTowers = [];
let bosses = [];
let drone = null;

// Sound system using Howler.js
let sounds = {
    music: null,
    laser: null,
    explosion: null,
    powerup: null,
    click: null,
    gameOver: null,
    towerPlace: null,
    bossWarning: null,
    achievement: null,
    volumes: {
        music: 0.3,
        sfx: 0.7
    }
};

// Game settings and constants
const GRAVITY_CONSTANT = 9000;
const MAX_PLAYER_SPEED = 350;
const MAX_ENEMY_SPEED = 180;
const BULLET_SPEED = 700;
const PLAYER_FIRE_RATE = 200; // ms between shots
const PLAYER_HEALTH = 100;
const WAVE_DURATION = 25000; // 25 seconds
const WAVE_ENEMY_MULTIPLIER = 1.5;
const INITIAL_ENEMIES = 5;
const POWERUP_CHANCE = 0.2;
const RESOURCE_REWARD = 25;
const BOSS_WAVE_INTERVAL = 5; // Boss every 5 waves
const COLORS = {
    playerTrail: '#4e54ff',
    bulletTrail: '#38b6ff',
    enemyTrail: '#ff5e78',
    explosion1: '#ff5e78',
    explosion2: '#ffbd69',
    powerupTrail: '#50c878',
    towerRange: 'rgba(255, 255, 255, 0.15)',
    star: '#ffffff',
    laser: '#38b6ff',
    shield: '#50c878',
    missile: '#ffbd69'
};
const achievementData = {
    firstBlood: {
        name: "First Blood",
        description: "Destroy your first enemy spacecraft",
        icon: "fa-meteor"
    },
    wavemaster: {
        name: "Wave Master",
        description: "Reach wave 5 and beyond",
        icon: "fa-water"
    },
    defender: {
        name: "Orbital Defender",
        description: "Place 3 defense towers",
        icon: "fa-tower-observation"
    },
    survivor: {
        name: "Survivor",
        description: "Survive for 5 minutes in a single game",
        icon: "fa-shield-halved"
    },
    sharpshooter: {
        name: "Sharpshooter",
        description: "Destroy 10 enemies without taking damage",
        icon: "fa-bullseye"
    },
    resourceful: {
        name: "Resourceful",
        description: "Collect 5 power-ups in a single game",
        icon: "fa-gem"
    },
    bossKiller: {
        name: "Boss Slayer",
        description: "Defeat a boss enemy",
        icon: "fa-skull"
    },
    orbitalKing: {
        name: "Orbital King",
        description: "Score 10,000 points in a single game",
        icon: "fa-crown"
    }
};

// Default ship customization settings
let shipCustomization = {
    color: '#4e54ff',
    design: 'fighter',
    trail: 'standard'
};

// Ship design templates
const shipDesigns = {
    fighter: {
        // Default triangular ship
        draw: function(ctx, radius, color) {
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.moveTo(radius + 5, 0);
            ctx.lineTo(-radius, radius);
            ctx.lineTo(-radius * 0.5, 0);
            ctx.lineTo(-radius, -radius);
            ctx.closePath();
            ctx.fill();
        }
    },
    scout: {
        // Sleeker, more aerodynamic design
        draw: function(ctx, radius, color) {
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.moveTo(radius + 8, 0);
            ctx.lineTo(-radius, radius * 0.6);
            ctx.lineTo(-radius * 0.7, 0);
            ctx.lineTo(-radius, -radius * 0.6);
            ctx.closePath();
            ctx.fill();
            
            // Additional details
            ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
            ctx.beginPath();
            ctx.arc(radius * 0.2, 0, radius * 0.2, 0, Math.PI * 2);
            ctx.fill();
        }
    },
    cruiser: {
        // Bulkier, more powerful-looking ship
        draw: function(ctx, radius, color) {
            ctx.fillStyle = color;
            
            // Main body
            ctx.beginPath();
            ctx.moveTo(radius, 0);
            ctx.lineTo(radius * 0.5, radius * 0.7);
            ctx.lineTo(-radius * 0.8, radius * 0.7);
            ctx.lineTo(-radius, 0);
            ctx.lineTo(-radius * 0.8, -radius * 0.7);
            ctx.lineTo(radius * 0.5, -radius * 0.7);
            ctx.closePath();
            ctx.fill();
            
            // Cockpit
            ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.beginPath();
            ctx.arc(radius * 0.3, 0, radius * 0.3, 0, Math.PI * 2);
            ctx.fill();
        }
    }
};

const cursor = document.getElementById('custom-cursor');

document.addEventListener('mousemove', (e) => {
    cursor.style.left = `${e.clientX}px`;
    cursor.style.top = `${e.clientY}px`;

    const target = document.elementFromPoint(e.clientX, e.clientY);
    if (target && (target.tagName === 'BUTTON' || target.classList.contains('hover-target'))) {
        cursor.classList.add('hover');
    } else {
        cursor.classList.remove('hover');
    }
});

// Click animation
document.addEventListener('mousedown', () => {
    cursor.classList.add('click');
});

document.addEventListener('mouseup', () => {
    cursor.classList.remove('click');
});

// Trail effect templates
const trailEffects = {
    standard: {
        // Default line trail
        color: function(baseColor) {
            return baseColor;
        },
        width: 2,
        length: 20,
        alpha: function(i, length) {
            return 1 - (i / length);
        }
    },
    flames: {
        // Fire-like trail
        color: function(baseColor) {
            return '#ff5e78';
        },
        width: 3,
        length: 15,
        alpha: function(i, length) {
            return 0.8 - (i / length) * 0.8;
        }
    },
    energy: {
        // Energy/plasma trail
        color: function(baseColor) {
            // Create a pulsing effect
            const time = Date.now() * 0.001;
            const pulseFactor = Math.sin(time * 3) * 0.3 + 0.7;
            
            if (baseColor === '#4e54ff' || baseColor === '#38b6ff') {
                return '#38b6ff';
            } else if (baseColor === '#50c878') {
                return '#50c878';
            } else {
                return '#ffbd69';
            }
        },
        width: 4,
        length: 25,
        alpha: function(i, length) {
            // Create a wavy, energy-like fade
            return (0.8 - (i / length) * 0.8) * (0.8 + Math.sin(i * 0.5) * 0.2);
        }
    }
};

// === INITIALIZATION FUNCTION ===
function init() {
    detectMobile();
    setupCanvas();
    setupEventListeners();
    setupSounds();
    loadHighScore();
    loadShipCustomization(); // Load saved ship customization
    
    // Start screen is already visible in HTML
    document.getElementById('start-button').addEventListener('click', startGame);
    
    // Setup Achievements Menu
    setupAchievementsMenu();
    
    // Setup Ship Customization
    setupShipCustomization();
    
    // Create stars background
    createStars();
    
    // Start rendering the background animation
    requestAnimationFrame(renderStartScreen);
}

// === LOAD/SAVE GAME DATA ===
function loadHighScore() {
    const savedHighScore = localStorage.getItem('orbitalDefender_highScore');
    if (savedHighScore) {
        game.highScore = parseInt(savedHighScore);
    }
    
    // Load achievements
    const savedAchievements = localStorage.getItem('orbitalDefender_achievements');
    if (savedAchievements) {
        game.achievements = JSON.parse(savedAchievements);
    }
}

function saveHighScore() {
    if (game.score > game.highScore) {
        game.highScore = game.score;
        localStorage.setItem('orbitalDefender_highScore', game.score.toString());
    }
}

function saveAchievements() {
    localStorage.setItem('orbitalDefender_achievements', JSON.stringify(game.achievements));
}

function setupAchievementsMenu() {
    // Add achievements button to start screen
    const startScreen = document.getElementById('start-screen');
    const instructionsDiv = document.querySelector('.instructions');
    
    const achievementsButton = document.createElement('button');
    achievementsButton.id = 'achievements-button';
    achievementsButton.className = 'pulse-button';
    achievementsButton.innerHTML = '<i class="fas fa-trophy"></i> ACHIEVEMENTS';
    
    startScreen.insertBefore(achievementsButton, instructionsDiv);
    
    // Add event listeners
    achievementsButton.addEventListener('click', showAchievementsScreen);
    document.getElementById('achievements-back-button').addEventListener('click', hideAchievementsScreen);
    
    // Initialize achievements display
    updateAchievementsDisplay();
}

function showAchievementsScreen() {
    playSound(sounds.click);
    document.getElementById('start-screen').classList.add('hidden');
    document.getElementById('achievements-screen').classList.remove('hidden');
    
    // Update achievements in case they've changed
    updateAchievementsDisplay();
}

function hideAchievementsScreen() {
    playSound(sounds.click);
    document.getElementById('achievements-screen').classList.add('hidden');
    document.getElementById('start-screen').classList.remove('hidden');
}

function updateAchievementsDisplay() {
    const container = document.getElementById('achievements-container');
    container.innerHTML = ''; // Clear existing items
    
    // Create an achievement item for each achievement
    Object.keys(achievementData).forEach(id => {
        const achievement = achievementData[id];
        const unlocked = game.achievements[id];
        
        const item = document.createElement('div');
        item.className = `achievement-item ${unlocked ? 'achievement-unlocked' : 'achievement-locked'}`;
        
        item.innerHTML = `
            <div class="achievement-icon">
                <i class="fas ${achievement.icon}"></i>
            </div>
            <div class="achievement-name">${achievement.name}</div>
            <div class="achievement-description">${achievement.description}</div>
        `;
        
        container.appendChild(item);
    });
}

function setupShipCustomization() {
    // Add customization button to start screen
    const startScreen = document.getElementById('start-screen');
    const achievementsButton = document.getElementById('achievements-button');
    
    const customizationButton = document.createElement('button');
    customizationButton.id = 'customization-button';
    customizationButton.className = 'pulse-button';
    customizationButton.innerHTML = '<i class="fas fa-paint-brush"></i> CUSTOMIZE SHIP';
    
    startScreen.insertBefore(customizationButton, achievementsButton.nextSibling);
    
    // Add event listeners
    customizationButton.addEventListener('click', showCustomizationScreen);
    document.getElementById('customization-back-button').addEventListener('click', hideCustomizationScreen);
    document.getElementById('customization-save-button').addEventListener('click', saveShipCustomization);
    
    // Set up color selection
    const colorOptions = document.querySelectorAll('.color-option');
    colorOptions.forEach(option => {
        option.addEventListener('click', () => {
            // Remove selected class from all options
            colorOptions.forEach(opt => opt.classList.remove('selected'));
            // Add selected class to clicked option
            option.classList.add('selected');
            // Update ship preview
            shipCustomization.color = option.dataset.color;
            updateShipPreview();
        });
        
        // Set initial selection
        if (option.dataset.color === shipCustomization.color) {
            option.classList.add('selected');
        }
    });
    
    // Set up design selection
    const designOptions = document.querySelectorAll('.design-option');
    designOptions.forEach(option => {
        option.addEventListener('click', () => {
            // Remove selected class from all options
            designOptions.forEach(opt => opt.classList.remove('selected'));
            // Add selected class to clicked option
            option.classList.add('selected');
            // Update ship preview
            shipCustomization.design = option.dataset.design;
            updateShipPreview();
        });
        
        // Set initial selection
        if (option.dataset.design === shipCustomization.design) {
            option.classList.add('selected');
        }
    });
    
    // Set up trail selection
    const trailOptions = document.querySelectorAll('.trail-option');
    trailOptions.forEach(option => {
        option.addEventListener('click', () => {
            // Remove selected class from all options
            trailOptions.forEach(opt => opt.classList.remove('selected'));
            // Add selected class to clicked option
            option.classList.add('selected');
            // Update ship preview
            shipCustomization.trail = option.dataset.trail;
            updateShipPreview();
        });
        
        // Set initial selection
        if (option.dataset.trail === shipCustomization.trail) {
            option.classList.add('selected');
        }
    });
    
    // Initialize ship preview
    updateShipPreview();
}

function setupFullscreenAuto() {
    const enterFullscreen = () => {
        const el = document.documentElement;
        if (el.requestFullscreen) el.requestFullscreen();
        else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
        else if (el.msRequestFullscreen) el.msRequestFullscreen();

        document.removeEventListener('click', enterFullscreen);
        document.removeEventListener('keydown', enterFullscreen);
    };

    document.addEventListener('click', enterFullscreen);
    document.addEventListener('keydown', enterFullscreen);
}

function showCustomizationScreen() {
    playSound(sounds.click);
    document.getElementById('start-screen').classList.add('hidden');
    document.getElementById('customization-screen').classList.remove('hidden');
    updateShipPreview();
}

function hideCustomizationScreen() {
    playSound(sounds.click);
    document.getElementById('customization-screen').classList.add('hidden');
    document.getElementById('start-screen').classList.remove('hidden');
}

function updateShipPreview() {
    const canvas = document.getElementById('preview-canvas');
    const ctx = canvas.getContext('2d');
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw background stars
    for (let i = 0; i < 50; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const size = Math.random() * 1.5;
        
        ctx.fillStyle = `rgba(255, 255, 255, ${0.3 + Math.random() * 0.7})`;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Draw ship
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    
    // Draw trail preview
    const trailConfig = trailEffects[shipCustomization.trail];
    const trailLength = trailConfig.length;
    const angle = Math.PI; // Trail goes left
    
    ctx.strokeStyle = trailConfig.color(shipCustomization.color);
    ctx.lineWidth = trailConfig.width;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    for (let i = 0; i < trailLength; i += 2) {
        const distance = i * 3;
        const x = Math.cos(angle) * distance;
        const y = Math.sin(angle) * distance;
        
        ctx.globalAlpha = trailConfig.alpha(i, trailLength);
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + 5, y);
        ctx.stroke();
    }
    
    // Reset alpha
    ctx.globalAlpha = 1;
    
    // Draw ship based on selected design
    const design = shipDesigns[shipCustomization.design];
    design.draw(ctx, 25, shipCustomization.color);
    
    // Draw engine glow
    ctx.fillStyle = 'rgba(255, 94, 120, 0.7)';
    ctx.beginPath();
    ctx.moveTo(-25 * 0.5, 25 * 0.3);
    ctx.lineTo(-25 - 15, 0);
    ctx.lineTo(-25 * 0.5, -25 * 0.3);
    ctx.closePath();
    ctx.fill();
    
    ctx.restore();
}

function saveShipCustomization() {
    localStorage.setItem('orbitalDefender_shipCustomization', JSON.stringify(shipCustomization));
    playSound(sounds.powerup);
    createFloatingText(
        document.getElementById('preview-canvas').width / 2,
        document.getElementById('preview-canvas').height / 2,
        "SHIP CUSTOMIZATION SAVED!",
        '#50c878',
        20
    );
}

function loadShipCustomization() {
    const savedCustomization = localStorage.getItem('orbitalDefender_shipCustomization');
    if (savedCustomization) {
        shipCustomization = JSON.parse(savedCustomization);
    }
}

// === DEVICE DETECTION ===
function detectMobile() {
    game.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768;
    
    if (game.isMobile) {
        document.getElementById('mobile-controls').classList.remove('hidden');
        setupMobileControls();
    }
}

// === CANVAS SETUP ===
function setupCanvas() {
    game.canvas = document.getElementById('game-canvas');
    game.ctx = game.canvas.getContext('2d');
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
}

function resizeCanvas() {
    game.width = window.innerWidth;
    game.height = window.innerHeight;
    game.centerX = game.width / 2;
    game.centerY = game.height / 2;
    
    game.canvas.width = game.width;
    game.canvas.height = game.height;
    
    // Update joystick position if on mobile
    if (game.isMobile) {
        const joystickBase = document.getElementById('joystick-base');
        if (joystickBase) {
            const joystickArea = document.getElementById('joystick-area');
            const baseWidth = joystickBase.offsetWidth;
            const baseHeight = joystickBase.offsetHeight;
            input.joystick.baseX = baseWidth / 2;
            input.joystick.baseY = baseHeight / 2;
        }
    }
}

// === EVENT LISTENERS ===
function setupEventListeners() {
    // Mouse movement
    game.canvas.addEventListener('mousemove', (e) => {
        input.mouse.x = e.clientX;
        input.mouse.y = e.clientY;
    });
    
    // Mouse click for shooting and tower placement
    game.canvas.addEventListener('mousedown', (e) => {
        if (e.button === 0 && game.running && !game.paused) { // Left click
            if (game.placingTower) {
                placeTower(input.mouse.x, input.mouse.y);
            } else if (player) {
                player.isShooting = true;
            }
        }
    });
    
    game.canvas.addEventListener('mouseup', (e) => {
        if (e.button === 0) { // Left click
            if (player) {
                player.isShooting = false;
            }
        }
    });
    
    // Keyboard controls
    window.addEventListener('keydown', (e) => {
        input.keys[e.key.toLowerCase()] = true;
        
        // Pause game with Escape key
        if (e.key === 'Escape' && game.running) {
            if (game.placingTower) {
                cancelTowerPlacement();
            } else {
                togglePause();
            }
        }
        
        // Special ability with Space
        if (e.key === ' ' && game.running && !game.paused && !game.placingTower) {
            activateSpecial();
        }
        
        // Tower hotkeys
        if (game.running && !game.paused) {
            if (e.key === '1') selectTowerType('laser');
            if (e.key === '2') selectTowerType('missile');
            if (e.key === '3') selectTowerType('shield');
        }
    });
    
    window.addEventListener('keyup', (e) => {
        input.keys[e.key.toLowerCase()] = false;
    });
    
    // Button event listeners
    document.getElementById('restart-button').addEventListener('click', startGame);
    document.getElementById('pause-button').addEventListener('click', togglePause);
    document.getElementById('resume-button').addEventListener('click', resumeGame);
    document.getElementById('quit-button').addEventListener('click', quitGame);
    document.getElementById('special-button').addEventListener('click', activateSpecial);
    
    // Volume controls
    document.getElementById('music-volume').addEventListener('input', (e) => {
        sounds.volumes.music = parseFloat(e.target.value);
        if (sounds.music) {
            sounds.music.volume = sounds.volumes.music;
        }
    });
    
    document.getElementById('sfx-volume').addEventListener('input', (e) => {
        sounds.volumes.sfx = parseFloat(e.target.value);
    });
}

// === MOBILE CONTROLS SETUP ===
function setupMobileControls() {
    const joystickThumb = document.getElementById('joystick-thumb');
    const joystickBase = document.getElementById('joystick-base');
    
    // Joystick controls
    joystickBase.addEventListener('touchstart', (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        const rect = joystickBase.getBoundingClientRect();
        
        input.joystick.active = true;
        input.joystick.baseX = rect.width / 2;
        input.joystick.baseY = rect.height / 2;
        updateJoystickPosition(touch);
    }, { passive: false });
    
    joystickBase.addEventListener('touchmove', (e) => {
        e.preventDefault();
        if (input.joystick.active) {
            updateJoystickPosition(e.touches[0]);
        }
    }, { passive: false });
    
    joystickBase.addEventListener('touchend', (e) => {
        e.preventDefault();
        input.joystick.active = false;
        input.joystick.x = 0;
        input.joystick.y = 0;
        joystickThumb.style.transform = `translate(0px, 0px)`;
    }, { passive: false });
    
    function updateJoystickPosition(touch) {
        const rect = joystickBase.getBoundingClientRect();
        let dx = touch.clientX - (rect.left + input.joystick.baseX);
        let dy = touch.clientY - (rect.top + input.joystick.baseY);
        
        // Calculate distance
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Limit distance
        if (distance > input.joystick.maxDistance) {
            dx = (dx / distance) * input.joystick.maxDistance;
            dy = (dy / distance) * input.joystick.maxDistance;
        }
        
        // Update joystick visual position
        joystickThumb.style.transform = `translate(${dx}px, ${dy}px)`;
        
        // Normalize for input values (between -1 and 1)
        input.joystick.x = dx / input.joystick.maxDistance;
        input.joystick.y = dy / input.joystick.maxDistance;
    }
    
    // Auto-firing for mobile
    setInterval(() => {
        if (game.running && !game.paused && player && game.isMobile) {
            player.isShooting = true;
        }
    }, PLAYER_FIRE_RATE);
}

// === SOUND SETUP ===
function setupSounds() {
    // Using the HTML5 Audio elements defined in index.html
    sounds.music = document.getElementById('bg-music');
    sounds.laser = document.getElementById('laser-sound');
    sounds.explosion = document.getElementById('explosion-sound');
    sounds.powerup = document.getElementById('powerup-sound');
    sounds.click = document.getElementById('click-sound');
    sounds.gameOver = document.getElementById('game-over-sound');
    sounds.towerPlace = sounds.click; // Reuse click sound for tower placement
    sounds.bossWarning = sounds.explosion; // Reuse explosion sound for boss warning
    sounds.achievement = sounds.powerup; // Reuse powerup sound for achievements
    
    // Set initial volumes
    sounds.music.volume = sounds.volumes.music;
    
    // Set volume for other sounds
    [sounds.laser, sounds.explosion, sounds.powerup, sounds.click, sounds.gameOver].forEach(sound => {
        sound.volume = sounds.volumes.sfx;
    });
}

function playSound(sound) {
    if (!sound) return;
    
    // Clone and play for overlapping sounds
    if (sound !== sounds.music) {
        const clone = sound.cloneNode();
        clone.volume = sounds.volumes.sfx;
        clone.play();
        // Remove cloned node after playing
        clone.addEventListener('ended', () => clone.remove());
    } else {
        sound.play();
    }
}

// === START SCREEN ANIMATION ===
function renderStartScreen(timestamp) {
    if (game.running) return;
    
    game.ctx.clearRect(0, 0, game.width, game.height);
    
    // Draw stars with twinkling
    for (let star of stars) {
        star.twinkle += star.twinkleSpeed;
        const alpha = 0.3 + Math.abs(Math.sin(star.twinkle) * 0.7);
        game.ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        game.ctx.beginPath();
        game.ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        game.ctx.fill();
    }
    
    // Continue animation
    requestAnimationFrame(renderStartScreen);
}

// === GAME OBJECTS CREATION ===
function createStars() {
    stars = [];
    const starCount = Math.floor(game.width * game.height / 4000);
    
    for (let i = 0; i < starCount; i++) {
        stars.push({
            x: Math.random() * game.width,
            y: Math.random() * game.height,
            size: Math.random() * 2,
            twinkle: Math.random() * Math.PI * 2,
            twinkleSpeed: 0.01 + Math.random() * 0.03
        });
    }
}

function createPlanets() {
    planets = [];
    
    // Create 1-3 random background planets
    const planetCount = 1 + Math.floor(Math.random() * 3);
    
    for (let i = 0; i < planetCount; i++) {
        // Ensure planets are in the background and not in the center
        let x, y, distToCenter;
        do {
            x = Math.random() * game.width;
            y = Math.random() * game.height;
            distToCenter = distance(x, y, game.centerX, game.centerY);
        } while (distToCenter < 200 || distToCenter > Math.min(game.width, game.height) * 0.4);
        
        planets.push({
            x,
            y,
            radius: 30 + Math.random() * 70,
            color: randomPlanetColor(),
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() * 0.001) * (Math.random() > 0.5 ? 1 : -1)
        });
    }
}

function randomPlanetColor() {
    const colors = [
        '#2c698d', // Blue
        '#4b8e8d', // Teal
        '#ba6375', // Pink
        '#4e4d5c', // Dark Gray
        '#7c677f', // Purple
        '#5fb0b7', // Light Blue
        '#734046', // Brown
        '#4c5b5c'  // Gray-Green
    ];
    
    return colors[Math.floor(Math.random() * colors.length)];
}

function createPlayer() {
    player = {
        x: game.centerX,
        y: game.centerY + 150,
        radius: 15,
        color: shipCustomization.color,
        design: shipCustomization.design,
        trail: shipCustomization.trail,
        velocity: { x: 0, y: 0 },
        thrust: { x: 0, y: 0 },
        angle: 0,
        health: PLAYER_HEALTH,
        isShooting: false,
        lastShot: 0,
        invulnerable: false,
        invulnerableTime: 0,
        trail: []
    };

    drone = {
        x: player.x + 30,
        y: player.y - 30,
        radius: 8,
        color: '#c0ffee', // 🌟 cozy sci-fi
        zapCooldown: 1.5,
        zapTimer: 0
    };
    
}

function createCentralBody() {
    centralBody = {
        x: game.centerX,
        y: game.centerY,
        radius: 50,
        color: '#38b6ff',
        glow: 0,
        glowDirection: 1
    };
}

function createEnemy(type = 'regular') {
    // Spawn enemies from outside the visible area
    const spawnDistance = Math.max(game.width, game.height) * 0.6;
    const angle = Math.random() * Math.PI * 2;
    
    let enemyProperties;
    
    switch (type) {
        case 'fast':
            enemyProperties = {
                radius: 12,
                color: '#ff8a5e',
                health: 15,
                damage: 15,
                scoreValue: 150,
                maxSpeed: MAX_ENEMY_SPEED * 1.5
            };
            break;
        case 'tank':
            enemyProperties = {
                radius: 25,
                color: '#7a3b2e',
                health: 100,
                damage: 30,
                scoreValue: 300,
                maxSpeed: MAX_ENEMY_SPEED * 0.7
            };
            break;
        case 'regular':
        default:
            enemyProperties = {
                radius: 18,
                color: '#ff5e78',
                health: 30,
                damage: 20,
                scoreValue: 100,
                maxSpeed: MAX_ENEMY_SPEED
            };
    }
    
    const x = game.centerX + Math.cos(angle) * spawnDistance;
    const y = game.centerY + Math.sin(angle) * spawnDistance;
    
    // Direct enemies towards the central body with slight orbital velocity
    const dirToCenterX = game.centerX - x;
    const dirToCenterY = game.centerY - y;
    const distToCenter = Math.sqrt(dirToCenterX * dirToCenterX + dirToCenterY * dirToCenterY);
    
    // Normalize direction
    const normalizedDirX = dirToCenterX / distToCenter;
    const normalizedDirY = dirToCenterY / distToCenter;
    
    // Initial velocity - mostly towards center with slight orbital component
    const directSpeed = enemyProperties.maxSpeed * 0.6;
    const orbitalSpeed = enemyProperties.maxSpeed * 0.4;
    
    // Direct component
    let velocityX = normalizedDirX * directSpeed;
    let velocityY = normalizedDirY * directSpeed;
    
    // Add orbital component (perpendicular to direction to center)
    velocityX += normalizedDirY * orbitalSpeed * (Math.random() > 0.5 ? 1 : -1);
    velocityY += -normalizedDirX * orbitalSpeed * (Math.random() > 0.5 ? 1 : -1);
    
    enemies.push({
        x,
        y,
        ...enemyProperties,
        velocity: { x: velocityX, y: velocityY },
        trail: [],
        targetPlayer: Math.random() < 0.7, // 70% chance to directly target player
        lastDirectionChange: 0,
        directionChangeInterval: 2000 + Math.random() * 3000 // Random interval between direction changes
    });
}

function createWave() {
    // Check if this is a boss wave
    if (game.wave > 1 && game.wave % BOSS_WAVE_INTERVAL === 0) {
        createBoss();
        return;
    }
    
    const enemyCount = Math.floor(INITIAL_ENEMIES * Math.pow(WAVE_ENEMY_MULTIPLIER, game.wave - 1));
    
    for (let i = 0; i < enemyCount; i++) {
        let type = 'regular';
        
        // Add more variety in later waves
        if (game.wave > 3) {
            const rand = Math.random();
            if (rand < 0.2) {
                type = 'fast';
            } else if (rand < 0.3 && game.wave > 5) {
                type = 'tank';
            }
        }
        
        setTimeout(() => {
            if (game.running && !game.paused) {
                createEnemy(type);
            }
        }, i * 1000); // Stagger enemy spawns
    }
    
    // Display wave announcement
    createFloatingText(
        game.centerX, 
        game.centerY - 100, 
        `WAVE ${game.wave}`, 
        '#ffbd69', 
        40
    );
}

function createBoss() {
    // Play boss warning sound
    playSound(sounds.bossWarning);
    
    // Create a boss announcement
    createFloatingText(
        game.centerX, 
        game.centerY - 100, 
        `BOSS WAVE!`, 
        '#ff3054', 
        60
    );
    
    // Determine boss type and properties based on game wave
    const bossType = Math.floor((game.wave / BOSS_WAVE_INTERVAL) - 1) % 3;
    let bossProperties;
    
    switch (bossType) {
        case 0: // First boss type - Destroyer
            bossProperties = {
                name: "Destroyer",
                radius: 45,
                color: '#ff3054',
                health: 1000,
                maxHealth: 1000,
                damage: 40,
                scoreValue: 2000,
                maxSpeed: MAX_ENEMY_SPEED * 0.5,
                fireRate: 1500, // ms between shots
                lastShot: 0,
                shotCount: 3, // Number of shots at once
                special: 'multishot'
            };
            break;
        case 1: // Second boss type - Harbinger
            bossProperties = {
                name: "Harbinger",
                radius: 55,
                color: '#7a3b2e',
                health: 1500,
                maxHealth: 1500,
                damage: 35,
                scoreValue: 3000,
                maxSpeed: MAX_ENEMY_SPEED * 0.4,
                fireRate: 5000, // ms between shots
                lastShot: 0,
                special: 'summon',
                lastSummon: 0,
                summonRate: 7000, // ms between summons
                summonCount: 3 // Enemies to summon at once
            };
            break;
        default: // Third boss type - Annihilator
            bossProperties = {
                name: "Annihilator",
                radius: 65,
                color: '#9932cc',
                health: 2000,
                maxHealth: 2000,
                damage: 50,
                scoreValue: 5000,
                maxSpeed: MAX_ENEMY_SPEED * 0.3,
                fireRate: 3000, // ms between shots
                lastShot: 0,
                special: 'beam',
                beamCharging: false,
                beamChargeDuration: 1500,
                beamFireDuration: 2000,
                beamDamage: 5, // Damage per frame
                beamWidth: 20,
                beamColor: '#ff00ff'
            };
    }
    
    // Pick a random spawn angle
    const angle = Math.random() * Math.PI * 2;
    const spawnDistance = Math.max(game.width, game.height) * 0.7;
    
    const x = game.centerX + Math.cos(angle) * spawnDistance;
    const y = game.centerY + Math.sin(angle) * spawnDistance;
    
    // Calculate velocity towards the center
    const dirToCenterX = game.centerX - x;
    const dirToCenterY = game.centerY - y;
    const distToCenter = Math.sqrt(dirToCenterX * dirToCenterX + dirToCenterY * dirToCenterY);
    
    // Normalize direction
    const normalizedDirX = dirToCenterX / distToCenter;
    const normalizedDirY = dirToCenterY / distToCenter;
    
    // Set velocity to slowly move towards center
    const velocity = {
        x: normalizedDirX * bossProperties.maxSpeed * 0.5,
        y: normalizedDirY * bossProperties.maxSpeed * 0.5
    };
    
    // Create the boss
    bosses.push({
        ...bossProperties,
        x,
        y,
        velocity,
        trail: [],
        phase: 1, // Boss phases for behavior changes
        phaseSwitchThreshold: 0.5, // Switch phase at 50% health
        targetPlayer: true,
        healthBarAlpha: 1,
        angleToPlayer: 0
    });
}

function createBullet(x, y, targetX, targetY, isEnemy = false, speed = BULLET_SPEED, damage = null) {
    const dirX = targetX - x;
    const dirY = targetY - y;
    const length = Math.sqrt(dirX * dirX + dirY * dirY);
    
    // Default damages if not specified
    if (damage === null) {
        damage = isEnemy ? 10 : 15;
    }
    
    bullets.push({
        x,
        y,
        velocity: {
            x: (dirX / length) * speed,
            y: (dirY / length) * speed
        },
        radius: isEnemy ? 5 : 4,
        color: isEnemy ? '#ff5e78' : '#38b6ff',
        isEnemy,
        damage,
        trail: []
    });
    
    playSound(sounds.laser);
}

function createExplosion(x, y, size = 1, color = COLORS.explosion1) {
    explosions.push({
        x,
        y,
        radius: 5,
        maxRadius: 30 * size,
        growSpeed: 70 * size,
        shrinkSpeed: 50 * size,
        color,
        alpha: 1,
        growing: true
    });
    
    // Create particles for additional effect
    const particleCount = Math.floor(15 * size);
    for (let i = 0; i < particleCount; i++) {
        createParticle(x, y, color);
    }
    
    playSound(sounds.explosion);
}

function createParticle(x, y, color) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 50 + Math.random() * 150;
    
    particles.push({
        x,
        y,
        velocity: {
            x: Math.cos(angle) * speed,
            y: Math.sin(angle) * speed
        },
        radius: 1 + Math.random() * 3,
        color,
        life: 1,
        decay: 0.01 + Math.random() * 0.03
    });
}

function createPowerup(x, y) {
    let powerupTypes = [
        { type: 'health', color: '#50c878', effect: "Health +30" },
        { type: 'speed', color: '#38b6ff', effect: "Speed +25%" },
        { type: 'damage', color: '#ff5e78', effect: "Damage +50%" },
        { type: 'special', color: '#ffbd69', effect: "Special Ready" },
        { type: 'resources', color: '#c0c0c0', effect: "Resources +50" }
    ];
    
    const selectedPowerup = powerupTypes[Math.floor(Math.random() * powerupTypes.length)];
    
    powerups.push({
        x,
        y,
        radius: 12,
        color: selectedPowerup.color,
        type: selectedPowerup.type,
        effect: selectedPowerup.effect,
        velocity: {
            x: (Math.random() - 0.5) * 50,
            y: (Math.random() - 0.5) * 50
        },
        pulse: 0,
        pulseDir: 1,
        trail: []
    });
}

function createFloatingText(x, y, text, color = '#ffffff', size = 20) {
    floatingTexts.push({
        x,
        y,
        text,
        color,
        size,
        alpha: 1,
        velocity: {
            x: (Math.random() - 0.5) * 10,
            y: -50 - Math.random() * 30
        },
        life: 1
    });
}

function createTower(x, y, type) {
    // Ensure we're not placing on top of another tower or the central body
    for (const tower of defenseTowers) {
        if (distance(x, y, tower.x, tower.y) < tower.radius * 2) {
            createFloatingText(x, y, "Too close to another tower!", "#ff3054");
            return false;
        }
    }
    
    if (distance(x, y, centralBody.x, centralBody.y) < centralBody.radius + 30) {
        createFloatingText(x, y, "Too close to central body!", "#ff3054");
        return false;
    }
    
    // Ensure we can afford the tower
    const cost = game.towerCosts[type];
    if (game.resources < cost) {
        createFloatingText(x, y, "Not enough resources!", "#ff3054");
        return false;
    }
    
    // Deduct resources
    game.resources -= cost;
    
    // Tower properties based on type
    let towerProperties;
    switch (type) {
        case 'laser':
            towerProperties = {
                radius: 15,
                color: COLORS.laser,
                range: 250,
                fireRate: 800, // ms between shots
                damage: 25,
                lastShot: 0,
                health: 100,
                maxHealth: 100,
                level: 1,
                upgradeCost: 75,
                maxLevel: 3
            };
            break;
        case 'missile':
            towerProperties = {
                radius: 18,
                color: COLORS.missile,
                range: 350,
                fireRate: 2000, // ms between shots
                damage: 60,
                lastShot: 0,
                health: 80,
                maxHealth: 80,
                level: 1,
                upgradeCost: 150,
                maxLevel: 3,
                areaEffect: true,
                areaRadius: 60
            };
            break;
        case 'shield':
            towerProperties = {
                radius: 20,
                color: COLORS.shield,
                range: 180,
                health: 200,
                maxHealth: 200,
                level: 1,
                upgradeCost: 100,
                maxLevel: 3,
                shieldStrength: 0.5, // Damage reduction for player
                pulseRate: 3000, // ms between shield pulses
                lastPulse: 0,
                pulseSize: 0
            };
            break;
    }
    
    defenseTowers.push({
        x,
        y,
        type,
        ...towerProperties,
        angle: 0,
        targetEnemy: null,
        placementTime: timestamp(),
        showRange: true // Show range initially, will fade out
    });
    
    // Play sound and create visual effect
    playSound(sounds.towerPlace);
    createExplosion(x, y, 0.8, towerProperties.color);
    
    // Show success message
    createFloatingText(x, y, `${type.charAt(0).toUpperCase() + type.slice(1)} tower placed!`, "#50c878");
    
    // Check achievement
    checkTowerAchievement();
    
    return true;
}

function upgradeTower(tower) {
    if (tower.level >= tower.maxLevel) {
        createFloatingText(tower.x, tower.y, "Max level reached!", "#ff3054");
        return false;
    }
    
    if (game.resources < tower.upgradeCost) {
        createFloatingText(tower.x, tower.y, "Not enough resources!", "#ff3054");
        return false;
    }
    
    // Deduct resources
    game.resources -= tower.upgradeCost;
    
    // Upgrade tower
    tower.level++;
    
    // Improve tower properties based on type
    switch (tower.type) {
        case 'laser':
            tower.damage += 15;
            tower.range += 50;
            tower.fireRate *= 0.8; // 20% faster firing
            tower.maxHealth += 50;
            tower.health = tower.maxHealth;
            tower.upgradeCost *= 1.5;
            break;
        case 'missile':
            tower.damage += 30;
            tower.range += 75;
            tower.areaRadius += 20;
            tower.maxHealth += 30;
            tower.health = tower.maxHealth;
            tower.upgradeCost *= 1.5;
            break;
        case 'shield':
            tower.shieldStrength += 0.15;
            tower.range += 30;
            tower.maxHealth += 100;
            tower.health = tower.maxHealth;
            tower.upgradeCost *= 1.5;
            break;
    }
    
    // Visual effect
    createExplosion(tower.x, tower.y, 0.5, tower.color);
    createFloatingText(tower.x, tower.y, `Upgraded to level ${tower.level}!`, "#50c878");
    
    return true;
}

// === TOWER PLACEMENT SYSTEM ===
function selectTowerType(type) {
    if (!game.running || game.paused) return;
    
    // Cancel existing placement if selecting same type
    if (game.placingTower && game.selectedTowerType === type) {
        cancelTowerPlacement();
        return;
    }
    
    // Start tower placement mode
    game.placingTower = true;
    game.selectedTowerType = type;
    
    // Show resource cost info
    const cost = game.towerCosts[type];
    createFloatingText(
        game.centerX, 
        game.height - 100, 
        `Place ${type} tower (${cost} resources)`, 
        game.resources >= cost ? "#50c878" : "#ff3054"
    );
    
    playSound(sounds.click);
}

function placeTower(x, y) {
    if (!game.placingTower || !game.selectedTowerType) return;
    
    const success = createTower(x, y, game.selectedTowerType);
    
    if (success) {
        // Exit placement mode if successful
        game.placingTower = false;
        game.selectedTowerType = null;
    }
}

function cancelTowerPlacement() {
    game.placingTower = false;
    game.selectedTowerType = null;
    playSound(sounds.click);
}

// === GAME START/RESTART ===
function startGame() {
    playSound(sounds.click);
    
    // Hide start/game over screens and show HUD
    document.getElementById('start-screen').classList.add('hidden');
    document.getElementById('game-over').classList.add('hidden');
    document.getElementById('hud').classList.remove('hidden');
    document.getElementById('pause-button').classList.remove('hidden');
    
    // Reset game state
    game.running = true;
    game.paused = false;
    game.score = 0;
    game.wave = 1; // Ensure wave starts at 1
    game.enemiesDestroyed = 0;
    game.resources = 100; // Starting resources
    game.specialReady = true;
    game.currentKillStreak = 0;
    game.powerupsCollected = 0;
    game.startTime = Date.now();
    game.placingTower = false;
    game.selectedTowerType = null;
    updateHUD();
    
    // Start music
    playSound(sounds.music);
    
    // Initialize game objects
    createStars();
    createPlanets();
    createPlayer();
    createCentralBody();
    bullets = [];
    enemies = [];
    explosions = [];
    particles = [];
    powerups = [];
    floatingTexts = [];
    defenseTowers = [];
    bosses = [];
    
    // Create first wave - BUT DON'T CHECK FOR NEXT WAVE YET
    // This is where the bug might be occurring
    createWave(); // This creates wave 1
    
    // Start game loop
    game.lastTime = performance.now();
    requestAnimationFrame(gameLoop);
}

// === GAME LOOP ===
function gameLoop(timestamp) {
    if (!game.running) return;
    
    // Calculate delta time (in seconds)
    game.deltaTime = (timestamp - game.lastTime) / 1000;
    game.lastTime = timestamp;
    
    // Cap delta time in case of large gaps (e.g., tab switching)
    if (game.deltaTime > 0.1) game.deltaTime = 0.1;
    
    // Calculate FPS
    game.frameCount++;
    game.frameTime += game.deltaTime;
    if (game.frameTime >= 1) {
        game.fps = Math.round(game.frameCount / game.frameTime);
        game.frameCount = 0;
        game.frameTime = 0;
        
        if (game.debugMode) {
            document.getElementById('fps-counter').textContent = `FPS: ${game.fps}`;
            document.getElementById('fps-counter').classList.remove('hidden');
        }
    }
    
    if (!game.paused) {
        update();
    }
    
    render();
    
    requestAnimationFrame(gameLoop);
}

// === UPDATE FUNCTIONS ===
function update() {
    updatePlayer();
    updateCentralBody();
    updateBullets();
    updateEnemies();
    updateBosses();
    updateTowers();
    updateExplosions();
    updateParticles();
    updatePowerups();
    updateFloatingTexts();
    updateSpecial();
    checkAchievements();
    updateDrone();
    
    // Check for next wave ONLY when all enemies and bosses are defeated
    // Make sure we're not incrementing the wave counter too early
    if (enemies.length === 0 && bosses.length === 0 && game.running && !game.paused) {
        // Add a small delay before starting the next wave
        if (!game.waveChangeTimer) {
            game.waveChangeTimer = timestamp() + 2000; // 2-second delay between waves
        } else if (timestamp() > game.waveChangeTimer) {
            game.wave++;
            game.waveChangeTimer = null; // Reset the timer
            updateHUD();
            createWave();
        }
    } else {
        game.waveChangeTimer = null; // Reset if enemies appear
    }
}

function updateDrone() {
    if (!player || !drone) return;

    // Smooth follow
    const dx = player.x - drone.x;
    const dy = player.y - drone.y;
    drone.x += dx * 5 * game.deltaTime;
    drone.y += dy * 5 * game.deltaTime;

    // Attack logic
    drone.zapTimer -= game.deltaTime;
    if (drone.zapTimer <= 0) {
        let target = enemies.find(e => distance(drone.x, drone.y, e.x, e.y) < 150);
        if (target) {
            target.health -= 10;
            createExplosion(target.x, target.y, 0.3, '#c0ffee');
            createFloatingText(target.x, target.y, '-10 ⚡', '#c0ffee', 12);
            playSound(sounds.laser);
            drone.zapTimer = drone.zapCooldown;
        }
    }
}

function updatePlayer() {
    if (!player) return;
    
    // Apply thrust based on input
    player.thrust = { x: 0, y: 0 };
    
    if (game.isMobile) {
        // Mobile joystick controls
        if (input.joystick.active) {
            player.thrust.x = input.joystick.x * 350;
            player.thrust.y = input.joystick.y * 350;
        }
    } else {
        // Keyboard controls
        if (input.keys['w'] || input.keys['arrowup']) player.thrust.y = -350;
        if (input.keys['s'] || input.keys['arrowdown']) player.thrust.y = 350;
        if (input.keys['a'] || input.keys['arrowleft']) player.thrust.x = -350;
        if (input.keys['d'] || input.keys['arrowright']) player.thrust.x = 350;
    }
    
    // Apply gravity from central body
    const gravityForce = calculateGravity(player, centralBody);
    player.velocity.x += gravityForce.x * game.deltaTime;
    player.velocity.y += gravityForce.y * game.deltaTime;
    
    // Apply thrust
    player.velocity.x += player.thrust.x * game.deltaTime;
    player.velocity.y += player.thrust.y * game.deltaTime;
    
    // Check if player is in a shield tower range and apply damage reduction
    let inShieldRange = false;
    let maxShieldStrength = 0;
    
    for (const tower of defenseTowers) {
        if (tower.type === 'shield' && distance(player.x, player.y, tower.x, tower.y) <= tower.range) {
            inShieldRange = true;
            if (tower.shieldStrength > maxShieldStrength) {
                maxShieldStrength = tower.shieldStrength;
            }
        }
    }
    
    player.shielded = inShieldRange;
    player.shieldStrength = maxShieldStrength;
    
    // Limit speed
    const speed = Math.sqrt(player.velocity.x * player.velocity.x + player.velocity.y * player.velocity.y);
    if (speed > MAX_PLAYER_SPEED) {
        player.velocity.x = (player.velocity.x / speed) * MAX_PLAYER_SPEED;
        player.velocity.y = (player.velocity.y / speed) * MAX_PLAYER_SPEED;
    }
    
    // Update position
    player.x += player.velocity.x * game.deltaTime;
    player.y += player.velocity.y * game.deltaTime;
    
    // Prevent player from going off screen with bounce effect
    if (player.x < player.radius) {
        player.x = player.radius;
        player.velocity.x *= -0.5;
    } else if (player.x > game.width - player.radius) {
        player.x = game.width - player.radius;
        player.velocity.x *= -0.5;
    }
    
    if (player.y < player.radius) {
        player.y = player.radius;
        player.velocity.y *= -0.5;
    } else if (player.y > game.height - player.radius) {
        player.y = game.height - player.radius;
        player.velocity.y *= -0.5;
    }
    
    // Update player trail
    player.trail.unshift({ x: player.x, y: player.y });
    if (player.trail.length > 20) player.trail.pop();
    
    // Update player angle to face mouse/touch
    if (game.isMobile) {
        // Auto aim at closest enemy on mobile
        let closestEnemy = null;
        let closestDistance = Infinity;
        
        for (const enemy of enemies) {
            const dist = distance(player.x, player.y, enemy.x, enemy.y);
            if (dist < closestDistance) {
                closestDistance = dist;
                closestEnemy = enemy;
            }
        }
        
        // Also check bosses
        for (const boss of bosses) {
            const dist = distance(player.x, player.y, boss.x, boss.y);
            if (dist < closestDistance) {
                closestDistance = dist;
                closestEnemy = boss;
            }
        }
        
        if (closestEnemy) {
            const dx = closestEnemy.x - player.x;
            const dy = closestEnemy.y - player.y;
            player.angle = Math.atan2(dy, dx);
        }
    } else {
        // Mouse aiming
        const dx = input.mouse.x - player.x;
        const dy = input.mouse.y - player.y;
        player.angle = Math.atan2(dy, dx);
    }
    
    // Player shooting
    if (player.isShooting && timestamp() - player.lastShot > PLAYER_FIRE_RATE) {
        const bulletSpawnX = player.x + Math.cos(player.angle) * (player.radius + 5);
        const bulletSpawnY = player.y + Math.sin(player.angle) * (player.radius + 5);
        
        if (game.isMobile && (enemies.length > 0 || bosses.length > 0)) {
            // Auto-aim at closest enemy on mobile
            let closestEnemy = null;
            let closestDistance = Infinity;
            
            for (const enemy of enemies) {
                const dist = distance(player.x, player.y, enemy.x, enemy.y);
                if (dist < closestDistance) {
                    closestDistance = dist;
                    closestEnemy = enemy;
                }
            }
            
            // Also check bosses
            for (const boss of bosses) {
                const dist = distance(player.x, player.y, boss.x, boss.y);
                if (dist < closestDistance) {
                    closestDistance = dist;
                    closestEnemy = boss;
                }
            }
            
            if (closestEnemy) {
                createBullet(bulletSpawnX, bulletSpawnY, closestEnemy.x, closestEnemy.y);
            }
        } else {
            // Shoot toward mouse on desktop
            const targetX = input.mouse.x;
            const targetY = input.mouse.y;
            createBullet(bulletSpawnX, bulletSpawnY, targetX, targetY);
        }
        
        player.lastShot = timestamp();
    }
    
    // Update invulnerability
    if (player.invulnerable) {
        player.invulnerableTime -= game.deltaTime;
        if (player.invulnerableTime <= 0) {
            player.invulnerable = false;
        }
    }
}

function updateCentralBody() {
    // Update glow effect
    centralBody.glow += 0.01 * centralBody.glowDirection;
    if (centralBody.glow >= 1 || centralBody.glow <= 0.5) {
        centralBody.glowDirection *= -1;
    }
}

function updateBullets() {
    for (let i = bullets.length - 1; i >= 0; i--) {
        const bullet = bullets[i];
        
        // Update position
        bullet.x += bullet.velocity.x * game.deltaTime;
        bullet.y += bullet.velocity.y * game.deltaTime;
        
        // Update trail
        bullet.trail.unshift({ x: bullet.x, y: bullet.y });
        if (bullet.trail.length > 10) bullet.trail.pop();
        
        // Remove bullets that go off screen
        if (
            bullet.x < -bullet.radius || 
            bullet.x > game.width + bullet.radius || 
            bullet.y < -bullet.radius || 
            bullet.y > game.height + bullet.radius
        ) {
            bullets.splice(i, 1);
            continue;
        }
        
        // Collision with central body
        if (distance(bullet.x, bullet.y, centralBody.x, centralBody.y) < centralBody.radius + bullet.radius) {
            createExplosion(bullet.x, bullet.y, 0.5);
            bullets.splice(i, 1);
            continue;
        }
        
        // Collision with enemies (only for player bullets)
        if (!bullet.isEnemy) {
            let hitEnemy = false;
            
            // Check regular enemies
            for (let j = enemies.length - 1; j >= 0; j--) {
                const enemy = enemies[j];
                if (distance(bullet.x, bullet.y, enemy.x, enemy.y) < enemy.radius + bullet.radius) {
                    // Damage enemy
                    enemy.health -= bullet.damage;
                    
                    // Create small explosion at bullet impact
                    createExplosion(bullet.x, bullet.y, 0.3);
                    
                    // Remove bullet
                    bullets.splice(i, 1);
                    hitEnemy = true;
                    
                    // Check if enemy is destroyed
                    if (enemy.health <= 0) {
                        game.score += enemy.scoreValue;
                        game.enemiesDestroyed++;
                        game.currentKillStreak++;
                        game.resources += RESOURCE_REWARD;
                        updateHUD();
                        
                        // Create larger explosion
                        createExplosion(enemy.x, enemy.y, 1.5, COLORS.explosion1);
                        setTimeout(() => {
                            if (game.running && !game.paused) {
                                createExplosion(enemy.x, enemy.y, 0.8, COLORS.explosion2);
                            }
                        }, 100);
                        
                        // Chance to spawn powerup
                        if (Math.random() < POWERUP_CHANCE) {
                            createPowerup(enemy.x, enemy.y);
                        }
                        
                        // Show score text
                        createFloatingText(enemy.x, enemy.y, `+${enemy.scoreValue}`, '#ffbd69');
                        
                        // Remove enemy
                        enemies.splice(j, 1);
                        
                        // First kill achievement check
                        if (!game.achievements.firstBlood) {
                            unlockAchievement('firstBlood', 'First Blood!');
                        }
                    }
                    
                    break;
                }
            }
            
            // If already hit an enemy, skip boss check
            if (hitEnemy) continue;
            
            // Check bosses
            for (let j = bosses.length - 1; j >= 0; j--) {
                const boss = bosses[j];
                if (distance(bullet.x, bullet.y, boss.x, boss.y) < boss.radius + bullet.radius) {
                    // Damage boss
                    boss.health -= bullet.damage;
                    
                    // Create small explosion at bullet impact
                    createExplosion(bullet.x, bullet.y, 0.4);
                    
                    // Remove bullet
                    bullets.splice(i, 1);
                    
                    // Check if boss phase should change
                    if (boss.health / boss.maxHealth <= boss.phaseSwitchThreshold && boss.phase === 1) {
                        boss.phase = 2;
                        createFloatingText(boss.x, boss.y, `${boss.name} is enraged!`, '#ff3054', 30);
                        createExplosion(boss.x, boss.y, 2, '#ff3054');
                    }
                    
                    // Check if boss is destroyed
                    if (boss.health <= 0) {
                        game.score += boss.scoreValue;
                        game.enemiesDestroyed++;
                        game.resources += RESOURCE_REWARD * 4; // 4x resources for boss
                        updateHUD();
                        
                        // Create larger explosion
                        createExplosion(boss.x, boss.y, 3, COLORS.explosion1);
                        setTimeout(() => {
                            if (game.running && !game.paused) {
                                createExplosion(boss.x, boss.y, 2.5, COLORS.explosion2);
                            }
                        }, 100);
                        setTimeout(() => {
                            if (game.running && !game.paused) {
                                createExplosion(boss.x, boss.y, 2, '#ffffff');
                            }
                        }, 200);
                        
                        // Guaranteed powerup from boss
                        createPowerup(boss.x, boss.y);
                        
                        // Show score text
                        createFloatingText(boss.x, boss.y, `+${boss.scoreValue}`, '#ffbd69', 30);
                        createFloatingText(boss.x + 20, boss.y - 30, `${boss.name} defeated!`, '#ff3054', 25);
                        
                        // Remove boss
                        bosses.splice(j, 1);
                        
                        // Boss killer achievement
                        if (!game.achievements.bossKiller) {
                            unlockAchievement('bossKiller', 'Boss Killer!');
                        }
                    }
                    
                    break;
                }
            }
        }
        
        // Collision with player (only for enemy bullets)
        if (bullet.isEnemy && player && !player.invulnerable) {
            if (distance(bullet.x, bullet.y, player.x, player.y) < player.radius + bullet.radius) {
                // Calculate damage (reduced if player is in shield tower range)
                let damage = bullet.damage;
                if (player.shielded) {
                    damage *= (1 - player.shieldStrength);
                }
                
                // Damage player
                player.health -= damage;
                updateHUD();
                
                // Reset kill streak
                game.currentKillStreak = 0;
                
                // Create explosion at bullet impact
                createExplosion(bullet.x, bullet.y, 0.5);
                
                // Shake screen effect
                document.body.classList.add('shake');
                setTimeout(() => {
                    document.body.classList.remove('shake');
                }, 500);
                
                // Remove bullet
                bullets.splice(i, 1);
                
                // Player invulnerability after hit
                player.invulnerable = true;
                player.invulnerableTime = 1;
                
                // Check if player is destroyed
                if (player.health <= 0) {
                    gameOver();
                }
                
                break;
            }
        }
        
        // Collision with defense towers (only for enemy bullets)
        if (bullet.isEnemy) {
            for (let j = defenseTowers.length - 1; j >= 0; j--) {
                const tower = defenseTowers[j];
                if (distance(bullet.x, bullet.y, tower.x, tower.y) < tower.radius + bullet.radius) {
                    // Damage tower
                    tower.health -= bullet.damage;
                    
                    // Create explosion at bullet impact
                    createExplosion(bullet.x, bullet.y, 0.4);
                    
                    // Remove bullet
                    bullets.splice(i, 1);
                    
                    // Check if tower is destroyed
                    if (tower.health <= 0) {
                        createExplosion(tower.x, tower.y, 1.2, tower.color);
                        createFloatingText(tower.x, tower.y, "Tower destroyed!", "#ff3054");
                        defenseTowers.splice(j, 1);
                    }
                    
                    break;
                }
            }
        }
    }
}

function updateEnemies() {
    for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];
        
        // New AI logic: Target decisions
        const timeNow = timestamp();
        if (timeNow - enemy.lastDirectionChange > enemy.directionChangeInterval) {
            // Decide whether to target player or central body
            if (player) {
                enemy.targetPlayer = Math.random() < 0.7; // 70% chance to target player
            } else {
                enemy.targetPlayer = false; // Default to central body if player is null
            }
            enemy.lastDirectionChange = timeNow;
            enemy.directionChangeInterval = 2000 + Math.random() * 3000;
        }
        
        // Apply forces toward target
        let targetX, targetY;
        
        if (enemy.targetPlayer && player) {
            targetX = player.x;
            targetY = player.y;
        } else {
            targetX = centralBody.x;
            targetY = centralBody.y;
        }
        
        // Calculate direction to target
        const dirX = targetX - enemy.x;
        const dirY = targetY - enemy.y;
        const dist = Math.sqrt(dirX * dirX + dirY * dirY);
        
        // Only apply targeting force if not too close
        if (dist > (enemy.targetPlayer ? 150 : 100)) {
            const normalizedDirX = dirX / dist;
            const normalizedDirY = dirY / dist;
            
            // Apply gradual force toward target
            const targetForce = enemy.maxSpeed * 0.5;
            enemy.velocity.x += normalizedDirX * targetForce * game.deltaTime;
            enemy.velocity.y += normalizedDirY * targetForce * game.deltaTime;
        }
        
        // Apply gravity from central body (weaker for smarter AI)
        const gravityForce = calculateGravity(enemy, centralBody, 0.7);
        enemy.velocity.x += gravityForce.x * game.deltaTime;
        enemy.velocity.y += gravityForce.y * game.deltaTime;
        
        // Limit speed
        const speed = Math.sqrt(enemy.velocity.x * enemy.velocity.x + enemy.velocity.y * enemy.velocity.y);
        if (speed > enemy.maxSpeed) {
            enemy.velocity.x = (enemy.velocity.x / speed) * enemy.maxSpeed;
            enemy.velocity.y = (enemy.velocity.y / speed) * enemy.maxSpeed;
        }
        
        // Update position
        enemy.x += enemy.velocity.x * game.deltaTime;
        enemy.y += enemy.velocity.y * game.deltaTime;
        
        // Update trail
        enemy.trail.unshift({ x: enemy.x, y: enemy.y });
        if (enemy.trail.length > 15) enemy.trail.pop();
        
        // Remove enemies that go far off screen
        const screenMargin = 300;
        if (
            enemy.x < -screenMargin || 
            enemy.x > game.width + screenMargin || 
            enemy.y < -screenMargin || 
            enemy.y > game.height + screenMargin
        ) {
            enemies.splice(i, 1);
            continue;
        }
        
        // Enemy shooting at player (more accurate and more frequent than before)
        if (player && Math.random() < 0.005 + (game.wave * 0.001)) { // Increases with wave number
            const dirX = player.x - enemy.x;
            const dirY = player.y - enemy.y;
            const angle = Math.atan2(dirY, dirX);
            
            // Less randomness in aiming for harder gameplay
            const randomFactor = Math.max(0.1, 0.5 - game.wave * 0.05); // Decreases with wave
            const randomAngle = angle + (Math.random() - 0.5) * randomFactor;
            const targetX = enemy.x + Math.cos(randomAngle) * 1000;
            const targetY = enemy.y + Math.sin(randomAngle) * 1000;
            
            createBullet(enemy.x, enemy.y, targetX, targetY, true);
        }
        
        // Collision with central body
        if (distance(enemy.x, enemy.y, centralBody.x, centralBody.y) < centralBody.radius + enemy.radius) {
            createExplosion(enemy.x, enemy.y, 1.2);
            enemies.splice(i, 1);
            continue;
        }
        
        // Collision with player
        if (player && !player.invulnerable && distance(enemy.x, enemy.y, player.x, player.y) < player.radius + enemy.radius) {
            // Calculate damage (reduced if player is in shield tower range)
            let damage = enemy.damage;
            if (player.shielded) {
                damage *= (1 - player.shieldStrength);
            }
            
            // Damage player
            player.health -= damage;
            updateHUD();
            
            // Reset kill streak
            game.currentKillStreak = 0;
            
            // Create explosion
            createExplosion(player.x, player.y, 1.2);
            
            // Shake screen effect
            document.body.classList.add('shake');
            setTimeout(() => {
                document.body.classList.remove('shake');
            }, 500);
            
            // Player invulnerability after hit
            player.invulnerable = true;
            player.invulnerableTime = 1.5;
            
            // Check if player is destroyed
            if (player.health <= 0) {
                gameOver();
            }
            
            // Destroy enemy
            game.score += enemy.scoreValue / 2; // Half score for collision
            game.enemiesDestroyed++;
            updateHUD();
            
            enemies.splice(i, 1);
            continue;
        }
        
        // Collision with defense towers
        for (let j = defenseTowers.length - 1; j >= 0; j--) {
            const tower = defenseTowers[j];
            if (distance(enemy.x, enemy.y, tower.x, tower.y) < tower.radius + enemy.radius) {
                // Damage tower
                tower.health -= enemy.damage;
                
                // Create explosion
                createExplosion(enemy.x, enemy.y, 1);
                
                // Check if tower is destroyed
                if (tower.health <= 0) {
                    createExplosion(tower.x, tower.y, 1.2, tower.color);
                    createFloatingText(tower.x, tower.y, "Tower destroyed!", "#ff3054");
                    defenseTowers.splice(j, 1);
                }
                
                // Destroy enemy
                game.score += enemy.scoreValue / 3; // 1/3 score for tower collision
                game.enemiesDestroyed++;
                updateHUD();
                
                enemies.splice(i, 1);
                break;
            }
        }
    }
}

function updateBosses() {
    for (let i = bosses.length - 1; i >= 0; i--) {
        const boss = bosses[i];
        
        // Boss movement - slower, more deliberate
        let targetX, targetY;
        
        if (boss.targetPlayer && player) {
            targetX = player.x;
            targetY = player.y;
            
            // Calculate angle to player (used for beam attacks and visual)
            const dx = player.x - boss.x;
            const dy = player.y - boss.y;
            boss.angleToPlayer = Math.atan2(dy, dx);
        } else {
            targetX = centralBody.x;
            targetY = centralBody.y;
        }
        
        // Calculate direction to target
        const dirX = targetX - boss.x;
        const dirY = targetY - boss.y;
        const dist = Math.sqrt(dirX * dirX + dirY * dirY);
        
        // Bosses maintain distance in phase 2
        const keepDistance = boss.phase === 2 ? 250 : 200;
        
        if (dist > keepDistance) {
            // Move toward target
            const normalizedDirX = dirX / dist;
            const normalizedDirY = dirY / dist;
            
            // Apply gradual force toward target
            const targetForce = boss.maxSpeed * 0.7;
            boss.velocity.x += normalizedDirX * targetForce * game.deltaTime;
            boss.velocity.y += normalizedDirY * targetForce * game.deltaTime;
        } else if (dist < keepDistance * 0.8) {
            // Back away from target when too close
            const normalizedDirX = dirX / dist;
            const normalizedDirY = dirY / dist;
            
            // Apply gradual repulsion force
            const repulsionForce = boss.maxSpeed * 0.5;
            boss.velocity.x -= normalizedDirX * repulsionForce * game.deltaTime;
            boss.velocity.y -= normalizedDirY * repulsionForce * game.deltaTime;
        }
        
        // Apply weak gravity from central body
        const gravityForce = calculateGravity(boss, centralBody, 0.3);
        boss.velocity.x += gravityForce.x * game.deltaTime;
        boss.velocity.y += gravityForce.y * game.deltaTime;
        
        // Limit speed (slower in phase 2)
        const speedLimit = boss.phase === 2 ? boss.maxSpeed * 1.2 : boss.maxSpeed;
        const speed = Math.sqrt(boss.velocity.x * boss.velocity.x + boss.velocity.y * boss.velocity.y);
        if (speed > speedLimit) {
            boss.velocity.x = (boss.velocity.x / speed) * speedLimit;
            boss.velocity.y = (boss.velocity.y / speed) * speedLimit;
        }
        
        // Update position
        boss.x += boss.velocity.x * game.deltaTime;
        boss.y += boss.velocity.y * game.deltaTime;
        
        // Update trail
        boss.trail.unshift({ x: boss.x, y: boss.y });
        if (boss.trail.length > 20) boss.trail.pop();
        
        // Ensure boss doesn't go off screen
        const margin = boss.radius;
        if (boss.x < margin) boss.x = margin;
        if (boss.x > game.width - margin) boss.x = game.width - margin;
        if (boss.y < margin) boss.y = margin;
        if (boss.y > game.height - margin) boss.y = game.height - margin;
        
        // Boss special abilities
        const currentTime = timestamp();
        
        switch (boss.special) {
            case 'multishot':
                // Multishot attack
                if (currentTime - boss.lastShot > boss.fireRate) {
                    if (player) {
                        const shotCount = boss.phase === 2 ? boss.shotCount + 2 : boss.shotCount;
                        const spreadAngle = Math.PI / 4; // 45 degree spread
                        
                        // Calculate base angle toward player
                        const dirX = player.x - boss.x;
                        const dirY = player.y - boss.y;
                        const baseAngle = Math.atan2(dirY, dirX);
                        
                        // Fire shots in a spread pattern
                        for (let j = 0; j < shotCount; j++) {
                            const angle = baseAngle - spreadAngle/2 + (spreadAngle * j / (shotCount - 1));
                            const targetX = boss.x + Math.cos(angle) * 1000;
                            const targetY = boss.y + Math.sin(angle) * 1000;
                            
                            // Add slight randomness in phase 1, accurate in phase 2
                            const randomFactor = boss.phase === 1 ? 0.1 : 0.03;
                            const randomAngle = angle + (Math.random() - 0.5) * randomFactor;
                            
                            createBullet(
                                boss.x, boss.y,
                                boss.x + Math.cos(randomAngle) * 1000,
                                boss.y + Math.sin(randomAngle) * 1000,
                                true,
                                BULLET_SPEED * 0.9,
                                boss.damage / 2
                            );
                        }
                        
                        boss.lastShot = currentTime;
                    }
                }
                break;
                
            case 'summon':
                // Summon minions
                if (currentTime - boss.lastSummon > boss.summonRate) {
                    const summonCount = boss.phase === 2 ? boss.summonCount + 1 : boss.summonCount;
                    
                    createFloatingText(boss.x, boss.y, "Summoning minions!", "#ff3054");
                    createExplosion(boss.x, boss.y, 1.5, "#7a3b2e");
                    
                    // Summon enemies in a circular pattern around the boss
                    for (let j = 0; j < summonCount; j++) {
                        const angle = (j / summonCount) * Math.PI * 2;
                        const spawnX = boss.x + Math.cos(angle) * 100;
                        const spawnY = boss.y + Math.sin(angle) * 100;
                        
                        // Create minion (fast enemy with reduced health)
                        enemies.push({
                            x: spawnX,
                            y: spawnY,
                            radius: 12,
                            color: '#ff8a5e',
                            health: 10,
                            damage: 10,
                            scoreValue: 50,
                            maxSpeed: MAX_ENEMY_SPEED * 1.5,
                            velocity: {
                                x: Math.cos(angle) * MAX_ENEMY_SPEED * 0.5,
                                y: Math.sin(angle) * MAX_ENEMY_SPEED * 0.5
                            },
                            trail: [],
                            targetPlayer: true,
                            lastDirectionChange: currentTime,
                            directionChangeInterval: 2000
                        });
                    }
                    
                    // After summoning, also shoot at player
                    if (player) {
                        const dirX = player.x - boss.x;
                        const dirY = player.y - boss.y;
                        const angle = Math.atan2(dirY, dirX);
                        
                        createBullet(
                            boss.x, boss.y,
                            boss.x + Math.cos(angle) * 1000,
                            boss.y + Math.sin(angle) * 1000,
                            true,
                            BULLET_SPEED * 0.8,
                            boss.damage
                        );
                    }
                    
                    boss.lastSummon = currentTime;
                    boss.lastShot = currentTime; // Reset shot timer to prevent immediate shooting
                }
                
                // Regular shots between summons
                if (currentTime - boss.lastShot > boss.fireRate && player) {
                    const dirX = player.x - boss.x;
                    const dirY = player.y - boss.y;
                    const angle = Math.atan2(dirY, dirX);
                    
                    // More accurate in phase 2
                    const randomFactor = boss.phase === 1 ? 0.1 : 0.03;
                    const randomAngle = angle + (Math.random() - 0.5) * randomFactor;
                    
                    createBullet(
                        boss.x, boss.y,
                        boss.x + Math.cos(randomAngle) * 1000,
                        boss.y + Math.sin(randomAngle) * 1000,
                        true,
                        BULLET_SPEED * 0.8,
                        boss.damage
                    );
                    
                    boss.lastShot = currentTime;
                }
                break;
                
            case 'beam':
                // Phase 1: Regular shots with occasional small beam
                if (boss.phase === 1) {
                    if (!boss.beamCharging && currentTime - boss.lastShot > boss.fireRate && player) {
                        // Decide whether to use beam or regular shots
                        if (Math.random() < 0.2) { // 20% chance for beam
                            boss.beamCharging = true;
                            boss.beamChargeStart = currentTime;
                            createFloatingText(boss.x, boss.y, "Charging beam...", "#ff00ff");
                        } else {
                            // Regular triple shot
                            const dirX = player.x - boss.x;
                            const dirY = player.y - boss.y;
                            const angle = Math.atan2(dirY, dirX);
                            
                            for (let j = -1; j <= 1; j++) {
                                const shotAngle = angle + j * 0.1;
                                createBullet(
                                    boss.x, boss.y,
                                    boss.x + Math.cos(shotAngle) * 1000,
                                    boss.y + Math.sin(shotAngle) * 1000,
                                    true,
                                    BULLET_SPEED * 0.8,
                                    boss.damage
                                );
                            }
                            
                            boss.lastShot = currentTime;
                        }
                    }
                    
                    // Handle beam charging and firing
                    if (boss.beamCharging) {
                        const chargeTime = currentTime - boss.beamChargeStart;
                        
                        if (chargeTime < boss.beamChargeDuration) {
                            // Charging - create visual effect
                            if (Math.random() < 0.2) {
                                createParticle(
                                    boss.x + (Math.random() - 0.5) * boss.radius,
                                    boss.y + (Math.random() - 0.5) * boss.radius,
                                    boss.beamColor
                                );
                            }
                        } else if (chargeTime < boss.beamChargeDuration + boss.beamFireDuration) {
                            // Firing beam - check for collision with player
                            if (player) {
                                // Update angle to player
                                const dx = player.x - boss.x;
                                const dy = player.y - boss.y;
                                boss.angleToPlayer = Math.atan2(dy, dx);
                                
                                // Line-circle collision check
                                const beamLength = 500;
                                const beamEndX = boss.x + Math.cos(boss.angleToPlayer) * beamLength;
                                const beamEndY = boss.y + Math.sin(boss.angleToPlayer) * beamLength;
                                
                                const playerDistToBeamLine = pointToLineDistance(
                                    player.x, player.y,
                                    boss.x, boss.y,
                                    beamEndX, beamEndY
                                );
                                
                                if (playerDistToBeamLine < player.radius + boss.beamWidth/2 && !player.invulnerable) {
                                    // Player hit by beam
                                    let damage = boss.beamDamage;
                                    if (player.shielded) {
                                        damage *= (1 - player.shieldStrength);
                                    }
                                    
                                    player.health -= damage;
                                    updateHUD();
                                    
                                    if (player.health <= 0) {
                                        gameOver();
                                    }
                                }
                            }
                        } else {
                            // Beam finished
                            boss.beamCharging = false;
                            boss.lastShot = currentTime;
                        }
                    }
                }
                // Phase 2: More frequent beams with faster charging
                else {
                    if (!boss.beamCharging && currentTime - boss.lastShot > boss.fireRate * 0.7 && player) {
                        // Higher chance for beam
                        if (Math.random() < 0.4) { // 40% chance for beam
                            boss.beamCharging = true;
                            boss.beamChargeStart = currentTime;
                            boss.beamChargeDuration *= 0.7; // 30% faster charging
                            boss.beamWidth *= 1.5; // 50% wider beam
                            boss.beamDamage *= 1.5; // 50% more damage
                            createFloatingText(boss.x, boss.y, "Charging MEGA beam!", "#ff00ff");
                        } else {
                            // Regular quad shot with spread
                            const dirX = player.x - boss.x;
                            const dirY = player.y - boss.y;
                            const angle = Math.atan2(dirY, dirX);
                            
                            for (let j = -1.5; j <= 1.5; j += 1) {
                                const shotAngle = angle + j * 0.1;
                                createBullet(
                                    boss.x, boss.y,
                                    boss.x + Math.cos(shotAngle) * 1000,
                                    boss.y + Math.sin(shotAngle) * 1000,
                                    true,
                                    BULLET_SPEED * 0.9,
                                    boss.damage
                                );
                            }
                            
                            boss.lastShot = currentTime;
                        }
                    }
                    
                    // Handle beam charging and firing - same as phase 1 but with updated properties
                    if (boss.beamCharging) {
                        const chargeTime = currentTime - boss.beamChargeStart;
                        
                        if (chargeTime < boss.beamChargeDuration) {
                            // More intense charging effects in phase 2
                            if (Math.random() < 0.4) {
                                createParticle(
                                    boss.x + (Math.random() - 0.5) * boss.radius * 1.5,
                                    boss.y + (Math.random() - 0.5) * boss.radius * 1.5,
                                    boss.beamColor
                                );
                            }
                        } else if (chargeTime < boss.beamChargeDuration + boss.beamFireDuration) {
                            // Firing beam - check for collision with player
                            if (player) {
                                // Update angle to player
                                const dx = player.x - boss.x;
                                const dy = player.y - boss.y;
                                boss.angleToPlayer = Math.atan2(dy, dx);
                                
                                // Line-circle collision check
                                const beamLength = 600; // Longer beam in phase 2
                                const beamEndX = boss.x + Math.cos(boss.angleToPlayer) * beamLength;
                                const beamEndY = boss.y + Math.sin(boss.angleToPlayer) * beamLength;
                                
                                const playerDistToBeamLine = pointToLineDistance(
                                    player.x, player.y,
                                    boss.x, boss.y,
                                    beamEndX, beamEndY
                                );
                                
                                if (playerDistToBeamLine < player.radius + boss.beamWidth/2 && !player.invulnerable) {
                                    // Player hit by beam
                                    let damage = boss.beamDamage;
                                    if (player.shielded) {
                                        damage *= (1 - player.shieldStrength);
                                    }
                                    
                                    player.health -= damage;
                                    updateHUD();
                                    
                                    if (player.health <= 0) {
                                        gameOver();
                                    }
                                }
                                
                                // In phase 2, beam also damages towers
                                for (let j = defenseTowers.length - 1; j >= 0; j--) {
                                    const tower = defenseTowers[j];
                                    const towerDistToBeamLine = pointToLineDistance(
                                        tower.x, tower.y,
                                        boss.x, boss.y,
                                        beamEndX, beamEndY
                                    );
                                    
                                    if (towerDistToBeamLine < tower.radius + boss.beamWidth/2) {
                                        // Tower hit by beam
                                        tower.health -= boss.beamDamage * 0.5;
                                        
                                        // Check if tower is destroyed
                                        if (tower.health <= 0) {
                                            createExplosion(tower.x, tower.y, 1.2, tower.color);
                                            createFloatingText(tower.x, tower.y, "Tower destroyed!", "#ff3054");
                                            defenseTowers.splice(j, 1);
                                        }
                                    }
                                }
                            }
                        } else {
                            // Beam finished
                            boss.beamCharging = false;
                            boss.lastShot = currentTime;
                        }
                    }
                }
                break;
        }
        
        // Collision with central body (bosses take damage but don't die immediately)
        if (distance(boss.x, boss.y, centralBody.x, centralBody.y) < centralBody.radius + boss.radius) {
            boss.health -= 50 * game.deltaTime; // Continuous damage
            createExplosion(
                centralBody.x + (Math.random() - 0.5) * centralBody.radius,
                centralBody.y + (Math.random() - 0.5) * centralBody.radius,
                0.8
            );
            
            // Move away from central body
            const dirX = boss.x - centralBody.x;
            const dirY = boss.y - centralBody.y;
            const dist = Math.sqrt(dirX * dirX + dirY * dirY);
            
            boss.velocity.x = (dirX / dist) * boss.maxSpeed * 2;
            boss.velocity.y = (dirY / dist) * boss.maxSpeed * 2;
            
            // Check if boss is destroyed
            if (boss.health <= 0) {
                game.score += boss.scoreValue;
                game.enemiesDestroyed++;
                game.resources += RESOURCE_REWARD * 4; // 4x resources for boss
                updateHUD();
                
                // Create larger explosion
                createExplosion(boss.x, boss.y, 3, COLORS.explosion1);
                setTimeout(() => {
                    if (game.running && !game.paused) {
                        createExplosion(boss.x, boss.y, 2.5, COLORS.explosion2);
                    }
                }, 100);
                
                // Guaranteed powerup from boss
                createPowerup(boss.x, boss.y);
                
                // Show score text
                createFloatingText(boss.x, boss.y, `+${boss.scoreValue}`, '#ffbd69', 30);
                createFloatingText(boss.x, boss.y - 30, `${boss.name} defeated!`, '#ff3054', 25);
                
                // Remove boss
                bosses.splice(i, 1);
                
                // Boss killer achievement
                if (!game.achievements.bossKiller) {
                    unlockAchievement('bossKiller', 'Boss Killer!');
                }
            }
            
            continue;
        }
        
        // Collision with player
        if (player && !player.invulnerable && distance(boss.x, boss.y, player.x, player.y) < player.radius + boss.radius) {
            // Calculate damage (reduced if player is in shield tower range)
            let damage = boss.damage * 1.5; // Bosses deal extra damage on collision
            if (player.shielded) {
                damage *= (1 - player.shieldStrength);
            }
            
            // Damage player
            player.health -= damage;
            updateHUD();
            
            // Reset kill streak
            game.currentKillStreak = 0;
            
            // Create explosion
            createExplosion(player.x, player.y, 1.5);
            
            // Shake screen effect
            document.body.classList.add('shake');
            setTimeout(() => {
                document.body.classList.remove('shake');
            }, 600); // Longer shake for boss collision
            
            // Player invulnerability after hit
            player.invulnerable = true;
            player.invulnerableTime = 2; // Longer invulnerability for boss collision
            
            // Check if player is destroyed
            if (player.health <= 0) {
                gameOver();
            }
            
            // Bosses don't die from collision but take damage and get pushed back
            boss.health -= PLAYER_HEALTH * 0.2; // Damage based on player's max health
            
            // Push boss away
            const dirX = boss.x - player.x;
            const dirY = boss.y - player.y;
            const dist = Math.sqrt(dirX * dirX + dirY * dirY);
            
            boss.velocity.x = (dirX / dist) * boss.maxSpeed * 2;
            boss.velocity.y = (dirY / dist) * boss.maxSpeed * 2;
            
            // Check if boss is destroyed
            if (boss.health <= 0) {
                game.score += boss.scoreValue;
                game.enemiesDestroyed++;
                game.resources += RESOURCE_REWARD * 4; // 4x resources for boss
                updateHUD();
                
                // Create larger explosion
                createExplosion(boss.x, boss.y, 3, COLORS.explosion1);
                setTimeout(() => {
                    if (game.running && !game.paused) {
                        createExplosion(boss.x, boss.y, 2.5, COLORS.explosion2);
                    }
                }, 100);
                
                // Guaranteed powerup from boss
                createPowerup(boss.x, boss.y);
                
                // Show score text
                createFloatingText(boss.x, boss.y, `+${boss.scoreValue}`, '#ffbd69', 30);
                createFloatingText(boss.x, boss.y - 30, `${boss.name} defeated!`, '#ff3054', 25);
                
                // Remove boss
                bosses.splice(i, 1);
                
                // Boss killer achievement
                if (!game.achievements.bossKiller) {
                    unlockAchievement('bossKiller', 'Boss Killer!');
                }
            }
            
            continue;
        }
        
        // Update health bar alpha (make it fade out over time, but show on damage)
        boss.healthBarAlpha = Math.max(0.3, boss.healthBarAlpha - 0.2 * game.deltaTime);
    }
}

function updateTowers() {
    const currentTime = timestamp();
    
    for (let i = defenseTowers.length - 1; i >= 0; i--) {
        const tower = defenseTowers[i];
        
        // Fade out range indicator after placement
        if (tower.showRange && currentTime - tower.placementTime > 2000) {
            tower.showRange = false;
        }
        
        // Tower behaviors based on type
        switch (tower.type) {
            case 'laser':
                // Find closest enemy in range
                let closestEnemy = null;
                let closestBoss = null;
                let closestEnemyDist = Infinity;
                let closestBossDist = Infinity;
                
                // Check regular enemies
                for (const enemy of enemies) {
                    const dist = distance(tower.x, tower.y, enemy.x, enemy.y);
                    if (dist < tower.range && dist < closestEnemyDist) {
                        closestEnemy = enemy;
                        closestEnemyDist = dist;
                    }
                }
                
                // Check bosses
                for (const boss of bosses) {
                    const dist = distance(tower.x, tower.y, boss.x, boss.y);
                    if (dist < tower.range && dist < closestBossDist) {
                        closestBoss = boss;
                        closestBossDist = dist;
                    }
                }
                
                // Prioritize based on distance and type
                if (closestEnemy && closestBoss) {
                    // If boss is significantly closer, target boss
                    // Otherwise prefer regular enemies
                    tower.targetEnemy = closestBossDist < closestEnemyDist * 0.7 ? closestBoss : closestEnemy;
                } else {
                    tower.targetEnemy = closestEnemy || closestBoss;
                }
                
                // If we have a target, aim and shoot
                if (tower.targetEnemy && currentTime - tower.lastShot > tower.fireRate) {
                    const dirX = tower.targetEnemy.x - tower.x;
                    const dirY = tower.targetEnemy.y - tower.y;
                    tower.angle = Math.atan2(dirY, dirX);
                    
                    // Create bullet from tower to enemy
                    createBullet(
                        tower.x, tower.y,
                        tower.targetEnemy.x, tower.targetEnemy.y,
                        false, // Not enemy bullet
                        BULLET_SPEED * 1.2, // Faster than player bullets
                        tower.damage
                    );
                    
                    tower.lastShot = currentTime;
                }
                break;
                
            case 'missile':
                // Similar to laser but with different targeting and firing logic
                let furthestEnemy = null;
                let furthestDist = 0;
                
                // For missile towers, target the enemy furthest along its path to the center/player
                for (const enemy of enemies) {
                    const dist = distance(tower.x, tower.y, enemy.x, enemy.y);
                    if (dist < tower.range) {
                        // Calculate how far along the enemy is (distance from spawn edge)
                        const distFromEdge = Math.min(
                            enemy.x, game.width - enemy.x,
                            enemy.y, game.height - enemy.y
                        );
                        
                        if (distFromEdge > furthestDist) {
                            furthestEnemy = enemy;
                            furthestDist = distFromEdge;
                        }
                    }
                }
                
                // Also check bosses (always high priority)
                for (const boss of bosses) {
                    const dist = distance(tower.x, tower.y, boss.x, boss.y);
                    if (dist < tower.range) {
                        // Bosses are high priority
                        furthestEnemy = boss;
                        break;
                    }
                }
                
                tower.targetEnemy = furthestEnemy;
                
                // If we have a target, aim and shoot missile
                if (tower.targetEnemy && currentTime - tower.lastShot > tower.fireRate) {
                    const dirX = tower.targetEnemy.x - tower.x;
                    const dirY = tower.targetEnemy.y - tower.y;
                    tower.angle = Math.atan2(dirY, dirX);
                    
                    // Create missile effect (special bullet with area damage)
                    const missile = {
                        x: tower.x,
                        y: tower.y,
                        targetEnemy: tower.targetEnemy,
                        velocity: {
                            x: Math.cos(tower.angle) * (BULLET_SPEED * 0.7),
                            y: Math.sin(tower.angle) * (BULLET_SPEED * 0.7)
                        },
                        radius: 6,
                        color: COLORS.missile,
                        isEnemy: false,
                        damage: tower.damage,
                        trail: [],
                        areaEffect: true,
                        areaRadius: tower.areaRadius
                    };
                    
                    bullets.push(missile);
                    playSound(sounds.laser); // Reuse laser sound for now
                    
                    tower.lastShot = currentTime;
                }
                break;
                
            case 'shield':
                // Shield tower - periodically pulses a protective shield
                if (currentTime - tower.lastPulse > tower.pulseRate) {
                    // Start new pulse
                    tower.pulseSize = 0;
                    tower.lastPulse = currentTime;
                }
                
                // Animate existing pulse
                if (tower.pulseSize < tower.range) {
                    tower.pulseSize += tower.range * game.deltaTime; // Expand over 1 second
                }
                break;
        }
    }
}

function updateExplosions() {
    for (let i = explosions.length - 1; i >= 0; i--) {
        const explosion = explosions[i];
        
        if (explosion.growing) {
            explosion.radius += explosion.growSpeed * game.deltaTime;
            if (explosion.radius >= explosion.maxRadius) {
                explosion.growing = false;
            }
        } else {
            explosion.radius -= explosion.shrinkSpeed * game.deltaTime;
            explosion.alpha -= 2 * game.deltaTime;
            
            if (explosion.radius <= 0 || explosion.alpha <= 0) {
                explosions.splice(i, 1);
            }
        }
    }
}

function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        const particle = particles[i];
        
        // Apply gravity from central body (weak effect)
        const gravityForce = calculateGravity(particle, centralBody, 0.3);
        particle.velocity.x += gravityForce.x * game.deltaTime;
        particle.velocity.y += gravityForce.y * game.deltaTime;
        
        // Update position
        particle.x += particle.velocity.x * game.deltaTime;
        particle.y += particle.velocity.y * game.deltaTime;
        
        // Update life
        particle.life -= particle.decay * game.deltaTime;
        
        // Remove dead particles
        if (particle.life <= 0) {
            particles.splice(i, 1);
        }
    }
}

function updatePowerups() {
    for (let i = powerups.length - 1; i >= 0; i--) {
        let powerup = powerups[i];
        
        // Apply gravity from central body (weak effect)
        const gravityForce = calculateGravity(powerup, centralBody, 0.5);
        powerup.velocity.x += gravityForce.x * game.deltaTime;
        powerup.velocity.y += gravityForce.y * game.deltaTime;
        
        // Limit speed
        const speed = Math.sqrt(powerup.velocity.x * powerup.velocity.x + powerup.velocity.y * powerup.velocity.y);
        if (speed > 100) {
            powerup.velocity.x = (powerup.velocity.x / speed) * 100;
            powerup.velocity.y = (powerup.velocity.y / speed) * 100;
        }
        
        // Update position
        powerup.x += powerup.velocity.x * game.deltaTime;
        powerup.y += powerup.velocity.y * game.deltaTime;
        
        // Update trail
        powerup.trail.unshift({ x: powerup.x, y: powerup.y });
        if (powerup.trail.length > 10) powerup.trail.pop();
        
        // Update pulse animation
        powerup.pulse += 0.05 * powerup.pulseDir;
        if (powerup.pulse >= 1 || powerup.pulse <= 0) {
            powerup.pulseDir *= -1;
        }
        
        // Collision with player
        if (player && distance(powerup.x, powerup.y, player.x, player.y) < player.radius + powerup.radius) {
            // Apply powerup effect
            applyPowerup(powerup);
            
            // Remove powerup
            powerups.splice(i, 1);
            
            // Play sound
            playSound(sounds.powerup);
            
            // Increment powerup counter for achievement
            game.powerupsCollected++;
            
            continue;
        }
        
        // Remove powerups that go off screen
        if (
            powerup.x < -50 || 
            powerup.x > game.width + 50 || 
            powerup.y < -50 || 
            powerup.y > game.height + 50
        ) {
            powerups.splice(i, 1);
        }
    }
}

function updateFloatingTexts() {
    for (let i = floatingTexts.length - 1; i >= 0; i--) {
        const text = floatingTexts[i];
        
        // Update position
        text.x += text.velocity.x * game.deltaTime;
        text.y += text.velocity.y * game.deltaTime;
        
        // Slow down velocity
        text.velocity.y += 50 * game.deltaTime; // Gravity effect
        
        // Update life/alpha
        text.life -= 0.7 * game.deltaTime;
        text.alpha = text.life;
        
        // Remove dead texts
        if (text.life <= 0) {
            floatingTexts.splice(i, 1);
        }
    }
}

function updateSpecial() {
    // Update cooldown
    if (!game.specialReady) {
        game.specialCooldown -= game.deltaTime * 1000;
        
        // Update cooldown visual
        const cooldownElement = document.getElementById('special-cooldown');
        if (cooldownElement) {
            const progress = 1 - (game.specialCooldown / game.specialCooldownTime);
            cooldownElement.style.transform = `scale(${1 - progress})`;
        }
        
        if (game.specialCooldown <= 0) {
            game.specialReady = true;
            document.getElementById('special-button').classList.add('pulse-button');
        }
    }
}

function checkAchievements() {
    // Check for time-based achievements
    const gameTime = (Date.now() - game.startTime) / 1000; // seconds
    
    // Survivor achievement - 5 minutes
    if (!game.achievements.survivor && gameTime >= 300) {
        unlockAchievement('survivor', 'Survivor!');
    }
    
    // Wave master achievement - reach wave 5
    if (!game.achievements.wavemaster && game.wave >= 5) {
        unlockAchievement('wavemaster', 'Wave Master!');
    }
    
    // Sharpshooter achievement - 10 enemies without taking damage
    if (!game.achievements.sharpshooter && game.currentKillStreak >= 10) {
        unlockAchievement('sharpshooter', 'Sharpshooter!');
    }
    
    // Resourceful achievement - collect 5 powerups
    if (!game.achievements.resourceful && game.powerupsCollected >= 5) {
        unlockAchievement('resourceful', 'Resourceful!');
    }
    
    // Orbital King achievement - score 10,000 points
    if (!game.achievements.orbitalKing && game.score >= 10000) {
        unlockAchievement('orbitalKing', 'Orbital King!');
    }
}

function checkTowerAchievement() {
    // Defender achievement - place 3 defense towers
    if (!game.achievements.defender && defenseTowers.length >= 3) {
        unlockAchievement('defender', 'Defender!');
    }
}

function unlockAchievement(id, title) {
    game.achievements[id] = true;
    saveAchievements();
    
    // Create achievement notification
    createFloatingText(
        game.centerX,
        game.height * 0.25,
        `ACHIEVEMENT UNLOCKED: ${title}`,
        '#ffbd69',
        30
    );
    
    // Play achievement sound
    playSound(sounds.achievement);
    
    // Update achievements display if it's visible
    if (!document.getElementById('achievements-screen').classList.contains('hidden')) {
        updateAchievementsDisplay();
    }
}

function updateHUD() {
    if (!player) return;
    
    document.getElementById('score').textContent = game.score;
    document.getElementById('wave').textContent = game.wave;
    document.getElementById('health').textContent = Math.max(0, Math.floor(player.health));
    
    // Update health bar
    const healthPercent = Math.max(0, player.health / PLAYER_HEALTH * 100);
    document.getElementById('health-fill').style.width = `${healthPercent}%`;
    
    // Change health bar color based on health
    if (healthPercent < 30) {
        document.getElementById('health-fill').style.background = 'linear-gradient(to right, #ff0000, #ff5e5e)';
    } else if (healthPercent < 60) {
        document.getElementById('health-fill').style.background = 'linear-gradient(to right, #ffaa00, #ffcc5e)';
    } else {
        document.getElementById('health-fill').style.background = 'linear-gradient(to right, #ff5e78, #ff8a5e)';
    }
    
    // Update resources display if it exists
    const resourcesElement = document.getElementById('resources');
    if (resourcesElement) {
        resourcesElement.textContent = game.resources;
    } else {
        // Create resources display if it doesn't exist
        const scoreContainer = document.getElementById('score-container');
        const resourcesContainer = document.createElement('div');
        resourcesContainer.id = 'resources-container';
        resourcesContainer.classList.add('hud-container');
        resourcesContainer.innerHTML = `<i class="fas fa-cog"></i> <span id="resources">${game.resources}</span>`;
        scoreContainer.parentNode.insertBefore(resourcesContainer, scoreContainer.nextSibling);
    }
}

// === SPECIAL ABILITY ===
function activateSpecial() {
    if (!game.running || game.paused || !game.specialReady || !player) return;
    
    game.specialReady = false;
    game.specialCooldown = game.specialCooldownTime;
    
    // Update cooldown visual
    document.getElementById('special-button').classList.remove('pulse-button');
    
    // Create pulse wave effect
    createExplosion(player.x, player.y, 5, '#4e54ff');
    
    // Damage all enemies in range
    const specialRange = 300;
    for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];
        const dist = distance(player.x, player.y, enemy.x, enemy.y);
        
        if (dist < specialRange) {
            // Damage or destroy enemy based on distance
            const damageMultiplier = 1 - (dist / specialRange);
            const damage = 100 * damageMultiplier;
            
            enemy.health -= damage;
            
            // Check if enemy is destroyed
            if (enemy.health <= 0) {
                game.score += enemy.scoreValue;
                game.enemiesDestroyed++;
                game.currentKillStreak++;
                game.resources += RESOURCE_REWARD;
                
                // Create explosion
                createExplosion(enemy.x, enemy.y, 1.5);
                
                // Chance to spawn powerup (reduced for balance)
                if (Math.random() < POWERUP_CHANCE * 0.5) {
                    createPowerup(enemy.x, enemy.y);
                }
                
                // Show score text
                createFloatingText(enemy.x, enemy.y, `+${enemy.scoreValue}`, '#ffbd69');
                
                // Remove enemy
                enemies.splice(i, 1);
            }
        }
    }
    
    // Damage bosses in range (less effective)
    for (let i = bosses.length - 1; i >= 0; i--) {
        const boss = bosses[i];
        const dist = distance(player.x, player.y, boss.x, boss.y);
        
        if (dist < specialRange) {
            // Damage boss based on distance (less effective than on regular enemies)
            const damageMultiplier = 1 - (dist / specialRange);
            const damage = 200 * damageMultiplier * 0.5; // 50% effectiveness
            
            boss.health -= damage;
            createExplosion(boss.x, boss.y, 1.0, '#4e54ff');
            
            // Check if boss phase should change
            if (boss.health / boss.maxHealth <= boss.phaseSwitchThreshold && boss.phase === 1) {
                boss.phase = 2;
                createFloatingText(boss.x, boss.y, `${boss.name} is enraged!`, '#ff3054', 30);
                createExplosion(boss.x, boss.y, 2, '#ff3054');
            }
            
            // Check if boss is destroyed
            if (boss.health <= 0) {
                game.score += boss.scoreValue;
                game.enemiesDestroyed++;
                game.resources += RESOURCE_REWARD * 4; // 4x resources for boss
                
                // Create larger explosion
                createExplosion(boss.x, boss.y, 3, COLORS.explosion1);
                setTimeout(() => {
                    if (game.running && !game.paused) {
                        createExplosion(boss.x, boss.y, 2.5, COLORS.explosion2);
                    }
                }, 100);
                
                // Guaranteed powerup from boss
                createPowerup(boss.x, boss.y);
                
                // Show score text
                createFloatingText(boss.x, boss.y, `+${boss.scoreValue}`, '#ffbd69', 30);
                createFloatingText(boss.x, boss.y - 30, `${boss.name} defeated!`, '#ff3054', 25);
                
                // Remove boss
                bosses.splice(i, 1);
                
                // Boss killer achievement
                if (!game.achievements.bossKiller) {
                    unlockAchievement('bossKiller', 'Boss Killer!');
                }
            }
        }
    }
    
    // Clear enemy bullets in range
    for (let i = bullets.length - 1; i >= 0; i--) {
        const bullet = bullets[i];
        if (bullet.isEnemy) {
            const dist = distance(player.x, player.y, bullet.x, bullet.y);
            if (dist < specialRange) {
                createParticle(bullet.x, bullet.y, '#4e54ff');
                bullets.splice(i, 1);
            }
        }
    }
    
    // Heal defense towers in range
    for (const tower of defenseTowers) {
        const dist = distance(player.x, player.y, tower.x, tower.y);
        if (dist < specialRange) {
            const healAmount = tower.maxHealth * 0.3; // Heal 30% of max health
            tower.health = Math.min(tower.maxHealth, tower.health + healAmount);
            createFloatingText(tower.x, tower.y, `+${Math.floor(healAmount)} HP`, '#50c878');
        }
    }
    
    // Update HUD
    updateHUD();
}

// === POWERUP EFFECTS ===
function applyPowerup(powerup) {
    switch (powerup.type) {
        case 'health':
            player.health = Math.min(PLAYER_HEALTH, player.health + 30);
            createFloatingText(player.x, player.y - 30, powerup.effect, '#50c878');
            break;
        case 'speed':
            // Speed boost effect lasts for 10 seconds
            const originalMaxSpeed = MAX_PLAYER_SPEED;
            MAX_PLAYER_SPEED *= 1.25;
            createFloatingText(player.x, player.y - 30, powerup.effect, '#38b6ff');
            
            setTimeout(() => {
                if (game.running) {
                    MAX_PLAYER_SPEED = originalMaxSpeed;
                }
            }, 10000);
            break;
        case 'damage':
            // Damage boost effect lasts for 15 seconds
            const originalBulletDamage = 15;
            createFloatingText(player.x, player.y - 30, powerup.effect, '#ff5e78');
            
            // Store original values
            const bulletDamageMultiplier = 1.5;
            
            // Apply boost to future bullets
            // Bullet damage is set per-bullet, so no need to reset later
            
            setTimeout(() => {
                if (game.running) {
                    // Reset will happen automatically for new bullets
                }
            }, 15000);
            break;
        case 'special':
            game.specialReady = true;
            game.specialCooldown = 0;
            document.getElementById('special-button').classList.add('pulse-button');
            createFloatingText(player.x, player.y - 30, powerup.effect, '#ffbd69');
            break;
        case 'resources':
            game.resources += 50;
            updateHUD();
            createFloatingText(player.x, player.y - 30, powerup.effect, '#c0c0c0');
            break;
    }
}

// === PHYSICS & UTILITY FUNCTIONS ===
function calculateGravity(obj1, obj2, strengthMultiplier = 1) {
    const dx = obj2.x - obj1.x;
    const dy = obj2.y - obj1.y;
    const distSq = dx * dx + dy * dy;
    const dist = Math.sqrt(distSq);
    
    // Prevent division by zero and extreme forces when very close
    if (dist < 1) {
        return { x: 0, y: 0 };
    }
    
    // Calculate force magnitude using inverse square law
    const forceMagnitude = (GRAVITY_CONSTANT * strengthMultiplier) / distSq;
    
    // Calculate force components
    return {
        x: (dx / dist) * forceMagnitude,
        y: (dy / dist) * forceMagnitude
    };
}

function distance(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
}

function pointToLineDistance(px, py, x1, y1, x2, y2) {
    // Calculate distance from point (px, py) to line segment (x1, y1) -> (x2, y2)
    const A = px - x1;
    const B = py - y1;
    const C = x2 - x1;
    const D = y2 - y1;
    
    const dot = A * C + B * D;
    const len_sq = C * C + D * D;
    let param = -1;
    
    if (len_sq !== 0) param = dot / len_sq;
    
    let xx, yy;
    
    if (param < 0) {
        xx = x1;
        yy = y1;
    } else if (param > 1) {
        xx = x2;
        yy = y2;
    } else {
        xx = x1 + param * C;
        yy = y1 + param * D;
    }
    
    const dx = px - xx;
    const dy = py - yy;
    
    return Math.sqrt(dx * dx + dy * dy);
}

function hexToRGBA(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function timestamp() {
    return performance.now();
}

// === GAME STATE FUNCTIONS ===
function togglePause() {
    game.paused = !game.paused;
    
    if (game.paused) {
        document.getElementById('pause-screen').classList.remove('hidden');
        sounds.music.pause();
    } else {
        document.getElementById('pause-screen').classList.add('hidden');
        sounds.music.play();
    }
    
    playSound(sounds.click);
}

function resumeGame() {
    if (game.paused) {
        togglePause();
    }
}

function quitGame() {
    game.running = false;
    game.paused = false;
    
    document.getElementById('pause-screen').classList.add('hidden');
    document.getElementById('hud').classList.add('hidden');
    document.getElementById('pause-button').classList.add('hidden');
    document.getElementById('start-screen').classList.remove('hidden');
    
    // Save high score
    saveHighScore();
    
    // Stop music
    sounds.music.pause();
    sounds.music.currentTime = 0;
    
    playSound(sounds.click);
}

function gameOver() {
    // Save high score
    saveHighScore();
    
    // Update final stats
    document.getElementById('final-score').textContent = game.score;
    document.getElementById('final-wave').textContent = game.wave;
    document.getElementById('enemies-destroyed').textContent = game.enemiesDestroyed;
    
    // Add high score display
    const statsDiv = document.querySelector('.stats');
    const highScoreElement = document.createElement('p');
    highScoreElement.innerHTML = `HIGH SCORE: <span>${game.highScore}</span>`;
    statsDiv.appendChild(highScoreElement);
    
    // Show game over screen
    document.getElementById('game-over').classList.remove('hidden');
    
    // Stop music and play game over sound
    sounds.music.pause();
    playSound(sounds.gameOver);
    
    // Continue running for visual effects but disable player
    player = null;
}

// === RENDERING FUNCTIONS ===
function render() {
    // Clear the canvas
    game.ctx.clearRect(0, 0, game.width, game.height);
    
    // Draw stars with twinkling
    drawStars();
    
    // Draw background planets
    drawPlanets();
    
    // Draw particle effects
    drawParticles();
    
    // Draw trails
    drawTrails();
    
    // Draw tower ranges
    drawTowerRanges();
    
    // Draw central body
    drawCentralBody();
    
    // Draw shield pulses
    drawShieldPulses();
    
    // Draw bullets
    drawBullets();
    
    // Draw powerups
    drawPowerups();
    
    // Draw player
    drawPlayer();
    
    // Draw enemies
    drawEnemies();
    
    // Draw bosses
    drawBosses();
    
    // Draw defense towers
    drawTowers();
    
    // Draw boss beams
    drawBossBeams();
    
    // Draw explosions
    drawExplosions();
    
    // Draw floating text
    drawFloatingTexts();
    
    drawDrone();
    // Draw tower placement guide
    if (game.placingTower) {
        drawTowerPlacementGuide();
    }
}

function drawDrone() {
    if (!drone) return;
    game.ctx.fillStyle = drone.color;
    game.ctx.beginPath();
    game.ctx.arc(drone.x, drone.y, drone.radius, 0, Math.PI * 2);
    game.ctx.fill();

    // Optionally: draw a line to player
    game.ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    game.ctx.beginPath();
    game.ctx.moveTo(drone.x, drone.y);
    game.ctx.lineTo(player.x, player.y);
    game.ctx.stroke();
}

function drawStars() {
    for (let star of stars) {
        star.twinkle += star.twinkleSpeed;
        const alpha = 0.3 + Math.abs(Math.sin(star.twinkle) * 0.7);
        
        game.ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        game.ctx.beginPath();
        game.ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        game.ctx.fill();
    }
}

function drawPlanets() {
    for (let planet of planets) {
        // Draw planet
        game.ctx.fillStyle = planet.color;
        game.ctx.beginPath();
        game.ctx.arc(planet.x, planet.y, planet.radius, 0, Math.PI * 2);
        game.ctx.fill();
        
        // Add simple surface details
        planet.rotation += planet.rotationSpeed;
        
        game.ctx.save();
        game.ctx.translate(planet.x, planet.y);
        game.ctx.rotate(planet.rotation);
        
        game.ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
        
        // Surface patterns
        for (let i = 0; i < 3; i++) {
            const patternRadius = planet.radius * (0.3 + i * 0.2);
            const patternWidth = planet.radius * (0.1 + i * 0.05);
            
            game.ctx.beginPath();
            game.ctx.arc(0, 0, patternRadius, 0, Math.PI);
            game.ctx.lineWidth = patternWidth;
            game.ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
            game.ctx.stroke();
        }
        
        game.ctx.restore();
    }
}

function drawCentralBody() {
    // Draw glow effect
    const glowSize = centralBody.radius * (1.5 + centralBody.glow * 0.5);
    const gradient = game.ctx.createRadialGradient(
        centralBody.x, centralBody.y, centralBody.radius * 0.8,
        centralBody.x, centralBody.y, glowSize
    );
    gradient.addColorStop(0, centralBody.color);
    gradient.addColorStop(0.5, `rgba(56, 182, 255, ${0.5 * centralBody.glow})`);
    gradient.addColorStop(1, 'rgba(56, 182, 255, 0)');
    
    game.ctx.fillStyle = gradient;
    game.ctx.beginPath();
    game.ctx.arc(centralBody.x, centralBody.y, glowSize, 0, Math.PI * 2);
    game.ctx.fill();
    
    // Draw central body
    game.ctx.fillStyle = centralBody.color;
    game.ctx.beginPath();
    game.ctx.arc(centralBody.x, centralBody.y, centralBody.radius, 0, Math.PI * 2);
    game.ctx.fill();
    
    // Draw surface details
    game.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    game.ctx.lineWidth = 2;
    game.ctx.beginPath();
    game.ctx.arc(centralBody.x, centralBody.y, centralBody.radius * 0.7, 0, Math.PI * 2);
    game.ctx.stroke();
    
    game.ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    game.ctx.lineWidth = 3;
    game.ctx.beginPath();
    game.ctx.arc(centralBody.x, centralBody.y, centralBody.radius * 0.4, 0, Math.PI * 2);
    game.ctx.stroke();
}

function drawTowerRanges() {
    // Draw tower ranges during placement or when towers are selected
    if (game.placingTower) return; // Handled in drawTowerPlacementGuide
    
    // Draw range indicators for recently placed towers
    for (const tower of defenseTowers) {
        if (tower.showRange) {
            game.ctx.fillStyle = COLORS.towerRange;
            game.ctx.beginPath();
            game.ctx.arc(tower.x, tower.y, tower.range, 0, Math.PI * 2);
            game.ctx.fill();
        }
    }
}

function drawShieldPulses() {
    // Draw shield tower pulse effects
    for (const tower of defenseTowers) {
        if (tower.type === 'shield' && tower.pulseSize > 0) {
            const alpha = 1 - (tower.pulseSize / tower.range);
            
            game.ctx.strokeStyle = `${tower.color}${Math.floor(alpha * 255).toString(16).padStart(2, '0')}`;
            game.ctx.lineWidth = 3;
            game.ctx.beginPath();
            game.ctx.arc(tower.x, tower.y, tower.pulseSize, 0, Math.PI * 2);
            game.ctx.stroke();
        }
    }
}

function drawTrails() {
    // Draw player trail
    if (player && player.trail.length > 1) {
        game.ctx.strokeStyle = COLORS.playerTrail;
        game.ctx.lineWidth = 2;
        game.ctx.lineCap = 'round';
        game.ctx.lineJoin = 'round';
        
        game.ctx.beginPath();
        game.ctx.moveTo(player.trail[0].x, player.trail[0].y);
        
        for (let i = 1; i < player.trail.length; i++) {
            const point = player.trail[i];
            const alpha = 1 - (i / player.trail.length);
            game.ctx.strokeStyle = `rgba(78, 84, 255, ${alpha})`;
            game.ctx.lineTo(point.x, point.y);
            game.ctx.stroke();
            game.ctx.beginPath();
            game.ctx.moveTo(point.x, point.y);
        }
    }
    
    // Draw bullet trails
    for (const bullet of bullets) {
        if (bullet.trail.length > 1) {
            const color = bullet.isEnemy ? COLORS.enemyTrail : bullet.color;
            
            game.ctx.strokeStyle = color;
            game.ctx.lineWidth = 1.5;
            game.ctx.lineCap = 'round';
            game.ctx.lineJoin = 'round';
            
            game.ctx.beginPath();
            game.ctx.moveTo(bullet.trail[0].x, bullet.trail[0].y);
            
            for (let i = 1; i < bullet.trail.length; i++) {
                const point = bullet.trail[i];
                const alpha = 1 - (i / bullet.trail.length);
                game.ctx.strokeStyle = hexToRGBA(color, alpha);
                game.ctx.lineTo(point.x, point.y);
                game.ctx.stroke();
                game.ctx.beginPath();
                game.ctx.moveTo(point.x, point.y);
            }
        }
    }
    
    // Draw enemy trails
    for (const enemy of enemies) {
        if (enemy.trail.length > 1) {
            game.ctx.strokeStyle = enemy.color;
            game.ctx.lineWidth = 1.5;
            game.ctx.lineCap = 'round';
            game.ctx.lineJoin = 'round';
            
            game.ctx.beginPath();
            game.ctx.moveTo(enemy.trail[0].x, enemy.trail[0].y);
            
            for (let i = 1; i < enemy.trail.length; i++) {
                const point = enemy.trail[i];
                const alpha = 0.7 - (i / enemy.trail.length) * 0.7;
                game.ctx.strokeStyle = hexToRGBA(enemy.color, alpha);
                game.ctx.lineTo(point.x, point.y);
                game.ctx.stroke();
                game.ctx.beginPath();
                game.ctx.moveTo(point.x, point.y);
            }
        }
    }
    
    // Draw boss trails
    for (const boss of bosses) {
        if (boss.trail.length > 1) {
            game.ctx.strokeStyle = boss.color;
            game.ctx.lineWidth = 2.5;
            game.ctx.lineCap = 'round';
            game.ctx.lineJoin = 'round';
            
            game.ctx.beginPath();
            game.ctx.moveTo(boss.trail[0].x, boss.trail[0].y);
            
            for (let i = 1; i < boss.trail.length; i++) {
                const point = boss.trail[i];
                const alpha = 0.7 - (i / boss.trail.length) * 0.7;
                game.ctx.strokeStyle = hexToRGBA(boss.color, alpha);
                game.ctx.lineTo(point.x, point.y);
                game.ctx.stroke();
                game.ctx.beginPath();
                game.ctx.moveTo(point.x, point.y);
            }
        }
    }
    
    // Draw powerup trails
    for (let powerup of powerups) {
        if (powerup.trail.length > 1) {
            game.ctx.strokeStyle = powerup.color;
            game.ctx.lineWidth = 2;
            game.ctx.lineCap = 'round';
            game.ctx.lineJoin = 'round';
            
            game.ctx.beginPath();
            game.ctx.moveTo(powerup.trail[0].x, powerup.trail[0].y);
            
            for (let i = 1; i < powerup.trail.length; i++) {
                const point = powerup.trail[i];
                const alpha = 0.5 - (i / powerup.trail.length) * 0.5;
                game.ctx.strokeStyle = hexToRGBA(powerup.color, alpha);
                game.ctx.lineTo(point.x, point.y);
                game.ctx.stroke();
                game.ctx.beginPath();
                game.ctx.moveTo(point.x, point.y);
            }
        }
    }
}

function drawPlayer() {
    if (!player) return;
    
    // Skip drawing if player is invulnerable and flashing
    if (player.invulnerable && Math.floor(game.frameCount * 0.1) % 2 === 0) {
        return;
    }
    
    // Draw player glow
    const glowSize = player.radius * 1.8;
    const gradient = game.ctx.createRadialGradient(
        player.x, player.y, player.radius * 0.5,
        player.x, player.y, glowSize
    );
    gradient.addColorStop(0, player.color);
    gradient.addColorStop(0.5, hexToRGBA(player.color, 0.5));
    gradient.addColorStop(1, 'rgba(78, 84, 255, 0)');
    
    game.ctx.fillStyle = gradient;
    game.ctx.beginPath();
    game.ctx.arc(player.x, player.y, glowSize, 0, Math.PI * 2);
    game.ctx.fill();
    
    // Draw player
    game.ctx.save();
    game.ctx.translate(player.x, player.y);
    game.ctx.rotate(player.angle);
    
    // Draw ship based on selected design
    const shipDesign = shipDesigns[player.design];
    shipDesign.draw(game.ctx, player.radius, player.color);
    
    // Draw engine glow if moving
    if (player.thrust.x !== 0 || player.thrust.y !== 0) {
        const thrustLength = player.radius * (0.7 + Math.random() * 0.5);
        
        game.ctx.fillStyle = 'rgba(255, 94, 120, 0.7)';
        game.ctx.beginPath();
        game.ctx.moveTo(-player.radius * 0.5, player.radius * 0.3);
        game.ctx.lineTo(-player.radius - thrustLength, 0);
        game.ctx.lineTo(-player.radius * 0.5, -player.radius * 0.3);
        game.ctx.closePath();
        game.ctx.fill();
    }
    
    // Draw shield if invulnerable or in shield tower range
    if (player.invulnerable) {
        game.ctx.strokeStyle = 'rgba(56, 182, 255, 0.7)';
        game.ctx.lineWidth = 2;
        game.ctx.beginPath();
        game.ctx.arc(0, 0, player.radius * 1.5, 0, Math.PI * 2);
        game.ctx.stroke();
    } else if (player.shielded) {
        game.ctx.strokeStyle = `rgba(80, 200, 120, ${0.3 + player.shieldStrength * 0.6})`;
        game.ctx.lineWidth = 2;
        game.ctx.beginPath();
        game.ctx.arc(0, 0, player.radius * 1.5, 0, Math.PI * 2);
        game.ctx.stroke();
    }
    
    game.ctx.restore();
}
 
 function drawBullets() {
     for (const bullet of bullets) {
         // Special rendering for missile type bullets
         if (bullet.areaEffect) {
             // Draw missile glow
             const gradient = game.ctx.createRadialGradient(
                 bullet.x, bullet.y, 0,
                 bullet.x, bullet.y, bullet.radius * 2.5
             );
             gradient.addColorStop(0, bullet.color);
             gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
             
             game.ctx.fillStyle = gradient;
             game.ctx.beginPath();
             game.ctx.arc(bullet.x, bullet.y, bullet.radius * 2.5, 0, Math.PI * 2);
             game.ctx.fill();
             
             // Draw missile body (elongated)
             if (bullet.velocity.x !== 0 || bullet.velocity.y !== 0) {
                 const angle = Math.atan2(bullet.velocity.y, bullet.velocity.x);
                 
                 game.ctx.save();
                 game.ctx.translate(bullet.x, bullet.y);
                 game.ctx.rotate(angle);
                 
                 game.ctx.fillStyle = bullet.color;
                 game.ctx.beginPath();
                 game.ctx.moveTo(bullet.radius * 1.5, 0);
                 game.ctx.lineTo(-bullet.radius, bullet.radius * 0.7);
                 game.ctx.lineTo(-bullet.radius, -bullet.radius * 0.7);
                 game.ctx.closePath();
                 game.ctx.fill();
                 
                 // Draw fire trail
                 game.ctx.fillStyle = 'rgba(255, 200, 50, 0.7)';
                 game.ctx.beginPath();
                 game.ctx.moveTo(-bullet.radius, bullet.radius * 0.3);
                 game.ctx.lineTo(-bullet.radius * 3, 0);
                 game.ctx.lineTo(-bullet.radius, -bullet.radius * 0.3);
                 game.ctx.closePath();
                 game.ctx.fill();
                 
                 game.ctx.restore();
             }
         } else {
             // Standard bullet rendering
             // Draw glow
             const gradient = game.ctx.createRadialGradient(
                 bullet.x, bullet.y, 0,
                 bullet.x, bullet.y, bullet.radius * 2
             );
             gradient.addColorStop(0, bullet.color);
             gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
             
             game.ctx.fillStyle = gradient;
             game.ctx.beginPath();
             game.ctx.arc(bullet.x, bullet.y, bullet.radius * 2, 0, Math.PI * 2);
             game.ctx.fill();
             
             // Draw bullet
             game.ctx.fillStyle = bullet.isEnemy ? '#ff3054' : '#4e9aff';
             game.ctx.beginPath();
             game.ctx.arc(bullet.x, bullet.y, bullet.radius, 0, Math.PI * 2);
             game.ctx.fill();
         }
     }
 }
 
 function drawEnemies() {
     for (const enemy of enemies) {
         // Draw enemy glow
         const glowSize = enemy.radius * 1.5;
         const gradient = game.ctx.createRadialGradient(
             enemy.x, enemy.y, enemy.radius * 0.5,
             enemy.x, enemy.y, glowSize
         );
         gradient.addColorStop(0, enemy.color);
         gradient.addColorStop(0.5, `rgba(255, 94, 120, 0.5)`);
         gradient.addColorStop(1, 'rgba(255, 94, 120, 0)');
         
         game.ctx.fillStyle = gradient;
         game.ctx.beginPath();
         game.ctx.arc(enemy.x, enemy.y, glowSize, 0, Math.PI * 2);
         game.ctx.fill();
         
         // Draw enemy shape based on type
         game.ctx.fillStyle = enemy.color;
         
         if (enemy.color === '#ff8a5e') {
             // Fast enemy - triangle
             const angle = Math.atan2(enemy.velocity.y, enemy.velocity.x);
             
             game.ctx.save();
             game.ctx.translate(enemy.x, enemy.y);
             game.ctx.rotate(angle);
             
             game.ctx.beginPath();
             game.ctx.moveTo(enemy.radius + 5, 0);
             game.ctx.lineTo(-enemy.radius, enemy.radius * 0.7);
             game.ctx.lineTo(-enemy.radius, -enemy.radius * 0.7);
             game.ctx.closePath();
             game.ctx.fill();
             
             game.ctx.restore();
         } else if (enemy.color === '#7a3b2e') {
             // Tank enemy - hexagon
             game.ctx.beginPath();
             game.ctx.arc(enemy.x, enemy.y, enemy.radius, 0, Math.PI * 2);
             game.ctx.fill();
             
             // Add tank details
             game.ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
             game.ctx.lineWidth = 3;
             game.ctx.beginPath();
             
             for (let i = 0; i < 6; i++) {
                 const angle = i * Math.PI / 3;
                 const x = enemy.x + Math.cos(angle) * enemy.radius * 0.7;
                 const y = enemy.y + Math.sin(angle) * enemy.radius * 0.7;
                 
                 if (i === 0) {
                     game.ctx.moveTo(x, y);
                 } else {
                     game.ctx.lineTo(x, y);
                 }
             }
             
             game.ctx.closePath();
             game.ctx.stroke();
         } else {
             // Regular enemy - circle with details
             game.ctx.beginPath();
             game.ctx.arc(enemy.x, enemy.y, enemy.radius, 0, Math.PI * 2);
             game.ctx.fill();
             
             // Add details
             game.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
             game.ctx.beginPath();
             game.ctx.arc(enemy.x + enemy.radius * 0.3, enemy.y - enemy.radius * 0.3, enemy.radius * 0.4, 0, Math.PI * 2);
             game.ctx.fill();
         }
     }
 }
 
 function drawBosses() {
     for (const boss of bosses) {
         // Draw boss glow
         const glowSize = boss.radius * 1.8;
         const glowIntensity = boss.phase === 2 ? 0.7 : 0.5; // Stronger glow in phase 2
         
         const gradient = game.ctx.createRadialGradient(
             boss.x, boss.y, boss.radius * 0.7,
             boss.x, boss.y, glowSize
         );
         gradient.addColorStop(0, boss.color);
         gradient.addColorStop(0.5, hexToRGBA(boss.color, glowIntensity));
         gradient.addColorStop(1, hexToRGBA(boss.color, 0));
         
         game.ctx.fillStyle = gradient;
         game.ctx.beginPath();
         game.ctx.arc(boss.x, boss.y, glowSize, 0, Math.PI * 2);
         game.ctx.fill();
         
         // Draw boss body (depends on boss type)
         game.ctx.fillStyle = boss.color;
         
         // Base boss shape
         game.ctx.beginPath();
         game.ctx.arc(boss.x, boss.y, boss.radius, 0, Math.PI * 2);
         game.ctx.fill();
         
         // Add unique details based on boss type and phase
         switch (boss.special) {
             case 'multishot':
                 // Destroyer - multiple cannon-like protrusions
                 for (let i = 0; i < (boss.phase === 2 ? 8 : 6); i++) {
                     const angle = (i / (boss.phase === 2 ? 8 : 6)) * Math.PI * 2;
                     
                     game.ctx.save();
                     game.ctx.translate(boss.x, boss.y);
                     game.ctx.rotate(angle);
                     
                     // Draw cannon
                     game.ctx.fillStyle = '#ff3054';
                     game.ctx.beginPath();
                     game.ctx.moveTo(boss.radius, 0);
                     game.ctx.lineTo(boss.radius + 15, 10);
                     game.ctx.lineTo(boss.radius + 15, -10);
                     game.ctx.closePath();
                     game.ctx.fill();
                     
                     game.ctx.restore();
                 }
                 break;
                 
             case 'summon':
                 // Harbinger - central eye with surrounding pattern
                 // Draw eye
                 game.ctx.fillStyle = '#ffbd69';
                 game.ctx.beginPath();
                 game.ctx.arc(boss.x, boss.y, boss.radius * 0.5, 0, Math.PI * 2);
                 game.ctx.fill();
                 
                 // Draw pupil
                 game.ctx.fillStyle = '#7a3b2e';
                 game.ctx.beginPath();
                 game.ctx.arc(boss.x, boss.y, boss.radius * 0.25, 0, Math.PI * 2);
                 game.ctx.fill();
                 
                 // Draw orbital patterns
                 game.ctx.strokeStyle = '#7a3b2e';
                 game.ctx.lineWidth = 4;
                 
                 for (let i = 0; i < (boss.phase === 2 ? 3 : 2); i++) {
                     const rotation = timestamp() * 0.0005 * (i % 2 === 0 ? 1 : -1);
                     
                     game.ctx.save();
                     game.ctx.translate(boss.x, boss.y);
                     game.ctx.rotate(rotation);
                     
                     game.ctx.beginPath();
                     game.ctx.arc(0, 0, boss.radius * 0.7 + i * 10, 0, Math.PI * 2);
                     game.ctx.stroke();
                     
                     // Draw orbs in phase 2
                     if (boss.phase === 2) {
                         for (let j = 0; j < 5; j++) {
                             const orbAngle = (j / 5) * Math.PI * 2 + rotation;
                             const orbX = Math.cos(orbAngle) * (boss.radius * 0.7 + i * 10);
                             const orbY = Math.sin(orbAngle) * (boss.radius * 0.7 + i * 10);
                             
                             game.ctx.fillStyle = '#ff8a5e';
                             game.ctx.beginPath();
                             game.ctx.arc(orbX, orbY, 5, 0, Math.PI * 2);
                             game.ctx.fill();
                         }
                     }
                     
                     game.ctx.restore();
                 }
                 break;
                 
             case 'beam':
                 // Annihilator - central crystal with spikes
                 // Draw central crystal
                 game.ctx.fillStyle = '#9932cc';
                 
                 if (boss.beamCharging) {
                     // Pulsing effect when charging beam
                     const chargeTime = timestamp() - boss.beamChargeStart;
                     const chargePulse = Math.sin(chargeTime * 0.01) * 0.2 + 0.8;
                     
                     game.ctx.fillStyle = boss.beamColor;
                     game.ctx.save();
                     game.ctx.translate(boss.x, boss.y);
                     game.ctx.scale(chargePulse, chargePulse);
                     
                     // Draw crystal shape
                     game.ctx.beginPath();
                     for (let i = 0; i < 8; i++) {
                         const angle = (i / 8) * Math.PI * 2;
                         const radius = i % 2 === 0 ? boss.radius * 0.5 : boss.radius * 0.7;
                         const x = Math.cos(angle) * radius;
                         const y = Math.sin(angle) * radius;
                         
                         if (i === 0) {
                             game.ctx.moveTo(x, y);
                         } else {
                             game.ctx.lineTo(x, y);
                         }
                     }
                     game.ctx.closePath();
                     game.ctx.fill();
                     
                     game.ctx.restore();
                 } else {
                     // Normal crystal shape
                     game.ctx.save();
                     game.ctx.translate(boss.x, boss.y);
                     
                     game.ctx.beginPath();
                     for (let i = 0; i < 8; i++) {
                         const angle = (i / 8) * Math.PI * 2;
                         const radius = i % 2 === 0 ? boss.radius * 0.5 : boss.radius * 0.7;
                         const x = Math.cos(angle) * radius;
                         const y = Math.sin(angle) * radius;
                         
                         if (i === 0) {
                             game.ctx.moveTo(x, y);
                         } else {
                             game.ctx.lineTo(x, y);
                         }
                     }
                     game.ctx.closePath();
                     game.ctx.fill();
                     
                     game.ctx.restore();
                 }
                 
                 // Draw spikes
                 const spikeCount = boss.phase === 2 ? 12 : 8;
                 for (let i = 0; i < spikeCount; i++) {
                     const angle = (i / spikeCount) * Math.PI * 2;
                     
                     game.ctx.save();
                     game.ctx.translate(boss.x, boss.y);
                     game.ctx.rotate(angle);
                     
                     game.ctx.fillStyle = '#9932cc';
                     game.ctx.beginPath();
                     game.ctx.moveTo(boss.radius, 0);
                     game.ctx.lineTo(boss.radius + 20, 8);
                     game.ctx.lineTo(boss.radius + 20, -8);
                     game.ctx.closePath();
                     game.ctx.fill();
                     
                     game.ctx.restore();
                 }
                 break;
         }
         
         // Draw boss health bar
         const healthPercent = boss.health / boss.maxHealth;
         const barWidth = boss.radius * 2.5;
         const barHeight = 8;
         const barX = boss.x - barWidth / 2;
         const barY = boss.y + boss.radius + 15;
         
         // Health bar background
         game.ctx.fillStyle = `rgba(0, 0, 0, ${boss.healthBarAlpha * 0.7})`;
         game.ctx.fillRect(barX, barY, barWidth, barHeight);
         
         // Health bar fill
         let barColor = '#ff3054';
         if (healthPercent > 0.6) barColor = '#50c878';
         else if (healthPercent > 0.3) barColor = '#ffbd69';
         
         game.ctx.fillStyle = hexToRGBA(barColor, boss.healthBarAlpha);
         game.ctx.fillRect(barX, barY, barWidth * healthPercent, barHeight);
         
         // Phase indicator
         if (boss.phase === 2) {
             game.ctx.fillStyle = hexToRGBA('#ff3054', boss.healthBarAlpha);
             game.ctx.beginPath();
             game.ctx.arc(barX + barWidth + 10, barY + barHeight/2, 5, 0, Math.PI * 2);
             game.ctx.fill();
         }
         
         // Boss name
         game.ctx.fillStyle = hexToRGBA('#ffffff', boss.healthBarAlpha);
         game.ctx.font = 'bold 14px "Exo 2"';
         game.ctx.textAlign = 'center';
         game.ctx.fillText(boss.name, boss.x, barY - 5);
     }
 }
 
 function drawBossBeams() {
     // Draw beam attack for bosses with beam special
     for (const boss of bosses) {
         if (boss.special === 'beam' && boss.beamCharging) {
             const chargeTime = timestamp() - boss.beamChargeStart;
             
             // Only draw beam during firing phase
             if (chargeTime > boss.beamChargeDuration && chargeTime < boss.beamChargeDuration + boss.beamFireDuration) {
                 const beamLength = boss.phase === 2 ? 600 : 500;
                 const beamEndX = boss.x + Math.cos(boss.angleToPlayer) * beamLength;
                 const beamEndY = boss.y + Math.sin(boss.angleToPlayer) * beamLength;
                 
                 // Draw beam glow
                 const gradient = game.ctx.createLinearGradient(
                     boss.x, boss.y,
                     beamEndX, beamEndY
                 );
                 gradient.addColorStop(0, boss.beamColor);
                 gradient.addColorStop(1, 'rgba(255, 0, 255, 0)');
                 
                 game.ctx.strokeStyle = gradient;
                 game.ctx.lineWidth = boss.beamWidth + 10;
                 game.ctx.lineCap = 'round';
                 game.ctx.globalAlpha = 0.7;
                 game.ctx.beginPath();
                 game.ctx.moveTo(boss.x, boss.y);
                 game.ctx.lineTo(beamEndX, beamEndY);
                 game.ctx.stroke();
                 
                 // Draw beam core
                 game.ctx.strokeStyle = '#ffffff';
                 game.ctx.lineWidth = boss.beamWidth * 0.5;
                 game.ctx.globalAlpha = 0.9;
                 game.ctx.beginPath();
                 game.ctx.moveTo(boss.x, boss.y);
                 game.ctx.lineTo(beamEndX, beamEndY);
                 game.ctx.stroke();
                 
                 // Reset global alpha
                 game.ctx.globalAlpha = 1;
             }
         }
     }
 }
 
 function drawTowers() {
     for (const tower of defenseTowers) {
         // Draw tower base
         game.ctx.fillStyle = tower.color;
         game.ctx.beginPath();
         game.ctx.arc(tower.x, tower.y, tower.radius, 0, Math.PI * 2);
         game.ctx.fill();
         
         // Draw tower details based on type
         switch (tower.type) {
             case 'laser':
                 // Draw turret
                 game.ctx.save();
                 game.ctx.translate(tower.x, tower.y);
                 game.ctx.rotate(tower.angle || 0);
                 
                 // Turret base
                 game.ctx.fillStyle = '#38b6ff';
                 game.ctx.beginPath();
                 game.ctx.arc(0, 0, tower.radius * 0.7, 0, Math.PI * 2);
                 game.ctx.fill();
                 
                 // Cannon
                 game.ctx.fillStyle = '#4e54ff';
                 game.ctx.fillRect(0, -3, tower.radius + 5, 6);
                 
                 // Barrel tip
                 game.ctx.fillStyle = '#ffffff';
                 game.ctx.beginPath();
                 game.ctx.arc(tower.radius + 5, 0, 3, 0, Math.PI * 2);
                 game.ctx.fill();
                 
                 game.ctx.restore();
                 break;
                 
             case 'missile':
                 // Draw missile launcher
                 game.ctx.save();
                 game.ctx.translate(tower.x, tower.y);
                 game.ctx.rotate(tower.angle || 0);
                 
                 // Launcher base
                 game.ctx.fillStyle = '#d2691e';
                 game.ctx.beginPath();
                 game.ctx.arc(0, 0, tower.radius * 0.7, 0, Math.PI * 2);
                 game.ctx.fill();
                 
                 // Missile tubes (2 or 4 depending on level)
                 const tubeCount = tower.level >= 3 ? 4 : 2;
                 const tubeSpacing = 6;
                 
                 for (let i = 0; i < tubeCount; i++) {
                     const yOffset = tubeCount === 2 ? 
                         (i === 0 ? -tubeSpacing : tubeSpacing) : 
                         (i - 1.5) * tubeSpacing;
                     
                     game.ctx.fillStyle = '#ffbd69';
                     game.ctx.fillRect(0, yOffset - 2, tower.radius + 8, 4);
                     
                     // Missile visible when not recently fired
                     if (timestamp() - tower.lastShot > tower.fireRate * 0.7) {
                         game.ctx.fillStyle = '#ff5e78';
                         game.ctx.beginPath();
                         game.ctx.moveTo(tower.radius + 8, yOffset);
                         game.ctx.lineTo(tower.radius + 3, yOffset + 3);
                         game.ctx.lineTo(tower.radius + 3, yOffset - 3);
                         game.ctx.closePath();
                         game.ctx.fill();
                     }
                 }
                 
                 game.ctx.restore();
                 break;
                 
             case 'shield':
                 // Draw shield generator
                 // Central crystal
                 game.ctx.fillStyle = '#50c878';
                 game.ctx.beginPath();
                 game.ctx.arc(tower.x, tower.y, tower.radius * 0.7, 0, Math.PI * 2);
                 game.ctx.fill();
                 
                 // Draw emitter spikes
                 for (let i = 0; i < 4; i++) {
                     const angle = (i / 4) * Math.PI * 2;
                     
                     game.ctx.save();
                     game.ctx.translate(tower.x, tower.y);
                     game.ctx.rotate(angle);
                     
                     game.ctx.fillStyle = '#38b6ff';
                     game.ctx.beginPath();
                     game.ctx.arc(tower.radius - 5, 0, 5, 0, Math.PI * 2);
                     game.ctx.fill();
                     
                     game.ctx.restore();
                 }
                 
                 // Draw active shield radius indicator (faint)
                 game.ctx.strokeStyle = hexToRGBA('#50c878', 0.2);
                 game.ctx.lineWidth = 2;
                 game.ctx.setLineDash([5, 5]);
                 game.ctx.beginPath();
                 game.ctx.arc(tower.x, tower.y, tower.range, 0, Math.PI * 2);
                 game.ctx.stroke();
                 game.ctx.setLineDash([]);
                 break;
         }
         
         // Draw tower level indicator
         for (let i = 0; i < tower.level; i++) {
             const angle = Math.PI / 4 + (i * Math.PI / 2);
             const x = tower.x + Math.cos(angle) * (tower.radius + 5);
             const y = tower.y + Math.sin(angle) * (tower.radius + 5);
             
             game.ctx.fillStyle = '#ffffff';
             game.ctx.beginPath();
             game.ctx.arc(x, y, 2, 0, Math.PI * 2);
             game.ctx.fill();
         }
         
         // Draw tower health bar (only if damaged)
         if (tower.health < tower.maxHealth) {
             const healthPercent = tower.health / tower.maxHealth;
             const barWidth = tower.radius * 2;
             const barHeight = 4;
             const barX = tower.x - barWidth / 2;
             const barY = tower.y - tower.radius - 10;
             
             // Health bar background
             game.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
             game.ctx.fillRect(barX, barY, barWidth, barHeight);
             
             // Health bar fill
             let barColor = '#ff3054';
             if (healthPercent > 0.6) barColor = '#50c878';
             else if (healthPercent > 0.3) barColor = '#ffbd69';
             
             game.ctx.fillStyle = barColor;
             game.ctx.fillRect(barX, barY, barWidth * healthPercent, barHeight);
         }
     }
 }
 function drawTowerPlacementGuide() {
    // Get mouse position
    const x = input.mouse.x;
    const y = input.mouse.y;
    
    // Determine tower color based on selected type
    let towerColor;
    let towerRadius;
    let towerRange;
    
    switch (game.selectedTowerType) {
        case 'laser':
            towerColor = COLORS.laser;
            towerRadius = 15;
            towerRange = 250;
            break;
        case 'missile':
            towerColor = COLORS.missile;
            towerRadius = 18;
            towerRange = 350;
            break;
        case 'shield':
            towerColor = COLORS.shield;
            towerRadius = 20;
            towerRange = 180;
            break;
    }
    
    // Check if placement is valid
    let canPlace = true;
    
    // Check distance from other towers
    for (const tower of defenseTowers) {
        if (distance(x, y, tower.x, tower.y) < tower.radius * 2) {
            canPlace = false;
            break;
        }
    }
    
    // Check distance from central body
    if (distance(x, y, centralBody.x, centralBody.y) < centralBody.radius + 30) {
        canPlace = false;
    }
    
    // Check if can afford
    if (game.resources < game.towerCosts[game.selectedTowerType]) {
        canPlace = false;
    }
    
    // Draw range indicator
    game.ctx.fillStyle = hexToRGBA(towerColor, 0.1);
    game.ctx.strokeStyle = hexToRGBA(towerColor, 0.3);
    game.ctx.lineWidth = 2;
    game.ctx.beginPath();
    game.ctx.arc(x, y, towerRange, 0, Math.PI * 2);
    game.ctx.fill();
    game.ctx.stroke();
    
    // Draw tower placeholder
    game.ctx.fillStyle = hexToRGBA(towerColor, canPlace ? 0.7 : 0.3);
    game.ctx.strokeStyle = canPlace ? '#ffffff' : '#ff3054';
    game.ctx.lineWidth = 2;
    game.ctx.beginPath();
    game.ctx.arc(x, y, towerRadius, 0, Math.PI * 2);
    game.ctx.fill();
    game.ctx.stroke();
    
    // Draw cost indicator
    game.ctx.fillStyle = game.resources >= game.towerCosts[game.selectedTowerType] ? '#ffffff' : '#ff3054';
    game.ctx.font = 'bold 14px "Exo 2"';
    game.ctx.textAlign = 'center';
    game.ctx.fillText(`${game.towerCosts[game.selectedTowerType]}`, x, y + towerRadius + 20);
}

function drawExplosions() {
    for (const explosion of explosions) {
        // Create gradient
        const gradient = game.ctx.createRadialGradient(
            explosion.x, explosion.y, 0,
            explosion.x, explosion.y, explosion.radius
        );
        gradient.addColorStop(0, `rgba(255, 255, 255, ${explosion.alpha})`);
        gradient.addColorStop(0.4, hexToRGBA(explosion.color, explosion.alpha));
        gradient.addColorStop(1, `rgba(0, 0, 0, 0)`);
        
        game.ctx.fillStyle = gradient;
        game.ctx.beginPath();
        game.ctx.arc(explosion.x, explosion.y, explosion.radius, 0, Math.PI * 2);
        game.ctx.fill();
    }
}

function drawParticles() {
    for (const particle of particles) {
        game.ctx.fillStyle = hexToRGBA(particle.color, particle.life);
        game.ctx.beginPath();
        game.ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        game.ctx.fill();
    }
}

function drawPowerups() {
    for (let powerup of powerups) {
        // Draw glow
        const glowRadius = powerup.radius * (1.5 + powerup.pulse * 0.5);
        const gradient = game.ctx.createRadialGradient(
            powerup.x, powerup.y, 0,
            powerup.x, powerup.y, glowRadius
        );
        gradient.addColorStop(0, powerup.color);
        gradient.addColorStop(0.5, hexToRGBA(powerup.color, 0.5));
        gradient.addColorStop(1, hexToRGBA(powerup.color, 0));
        
        game.ctx.fillStyle = gradient;
        game.ctx.beginPath();
        game.ctx.arc(powerup.x, powerup.y, glowRadius, 0, Math.PI * 2);
        game.ctx.fill();
        
        // Draw powerup icon based on type
        game.ctx.fillStyle = '#ffffff';
        game.ctx.beginPath();
        
        switch (powerup.type) {
            case 'health':
                // Plus sign
                const crossSize = powerup.radius * 0.7;
                game.ctx.fillRect(powerup.x - crossSize / 4, powerup.y - crossSize, crossSize / 2, crossSize * 2);
                game.ctx.fillRect(powerup.x - crossSize, powerup.y - crossSize / 4, crossSize * 2, crossSize / 2);
                break;
            case 'speed':
                // Arrow
                game.ctx.save();
                game.ctx.translate(powerup.x, powerup.y);
                game.ctx.beginPath();
                game.ctx.moveTo(powerup.radius * 0.7, 0);
                game.ctx.lineTo(-powerup.radius * 0.5, powerup.radius * 0.6);
                game.ctx.lineTo(-powerup.radius * 0.5, -powerup.radius * 0.6);
                game.ctx.closePath();
                game.ctx.fill();
                game.ctx.restore();
                break;
            case 'damage':
                // Star
                game.ctx.save();
                game.ctx.translate(powerup.x, powerup.y);
                
                const spikes = 5;
                const outerRadius = powerup.radius * 0.7;
                const innerRadius = powerup.radius * 0.3;
                
                game.ctx.beginPath();
                for (let i = 0; i < spikes * 2; i++) {
                    const radius = i % 2 === 0 ? outerRadius : innerRadius;
                    const angle = (Math.PI / spikes) * i;
                    const x = Math.cos(angle) * radius;
                    const y = Math.sin(angle) * radius;
                    
                    if (i === 0) {
                        game.ctx.moveTo(x, y);
                    } else {
                        game.ctx.lineTo(x, y);
                    }
                }
                game.ctx.closePath();
                game.ctx.fill();
                game.ctx.restore();
                break;
            case 'special':
                // Atom/swirl
                game.ctx.save();
                game.ctx.translate(powerup.x, powerup.y);
                
                // Draw center
                game.ctx.beginPath();
                game.ctx.arc(0, 0, powerup.radius * 0.3, 0, Math.PI * 2);
                game.ctx.fill();
                
                // Draw orbits
                game.ctx.strokeStyle = '#ffffff';
                game.ctx.lineWidth = powerup.radius * 0.15;
                
                for (let i = 0; i < 3; i++) {
                    const angle = (i * Math.PI) / 1.5;
                    
                    game.ctx.beginPath();
                    game.ctx.ellipse(
                        0, 0,
                        powerup.radius * 0.6, powerup.radius * 0.6,
                        angle, 0, Math.PI * 2
                    );
                    game.ctx.stroke();
                }
                
                game.ctx.restore();
                break;
            case 'resources':
                // Resource icon (cog/gear)
                game.ctx.save();
                game.ctx.translate(powerup.x, powerup.y);
                
                const toothCount = 8;
                const outerR = powerup.radius * 0.7;
                const innerR = powerup.radius * 0.4;
                const midR = powerup.radius * 0.55;
                
                game.ctx.beginPath();
                for (let i = 0; i < toothCount * 2; i++) {
                    const angle = (i * Math.PI) / toothCount;
                    const r = i % 2 === 0 ? outerR : midR;
                    const x = Math.cos(angle) * r;
                    const y = Math.sin(angle) * r;
                    
                    if (i === 0) {
                        game.ctx.moveTo(x, y);
                    } else {
                        game.ctx.lineTo(x, y);
                    }
                }
                game.ctx.closePath();
                game.ctx.fill();
                
                // Center hole
                game.ctx.fillStyle = powerup.color;
                game.ctx.beginPath();
                game.ctx.arc(0, 0, innerR, 0, Math.PI * 2);
                game.ctx.fill();
                
                game.ctx.restore();
                break;
        }
    }
}

function drawFloatingTexts() {
    for (const text of floatingTexts) {
        game.ctx.fillStyle = hexToRGBA(text.color, text.alpha);
        game.ctx.font = `bold ${text.size}px 'Exo 2', sans-serif`;
        game.ctx.textAlign = 'center';
        game.ctx.textBaseline = 'middle';
        game.ctx.fillText(text.text, text.x, text.y);
    }
}

// Initialize the game when the page loads
// init() is called from the DOMContentLoaded event handler at the top of this file 