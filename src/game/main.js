import '../engine/math.js';
import '../engine/audio.js';
import '../engine/input.js';
import '../engine/render.js';
import '../engine/physics.js';
import './entities.js';
import './levels.js';
import './player.js';

let lastTime = 0;
let player;
export let gameStarted = false;
export let hasLostBefore = false;

// Callbacks to React
let onStateChange = null;

export function setGameStateCallback(cb) {
    onStateChange = cb;
}

export function resetToMainMenu() {
    gameStarted = false;
    if (onStateChange) onStateChange('START_SCREEN');
    if (player) {
        player.torchOn = false;
        window.InputSys.torchOn = false;
    }
    if (window.RenderSys) window.RenderSys.clear(player);
}

export function triggerGameOver(score) {
    gameStarted = false;
    if (onStateChange) onStateChange('GAME_OVER', score);
    if (player) {
        player.torchOn = false;
        window.InputSys.torchOn = false;
    }
    if (window.RenderSys) window.RenderSys.clear(player);
}
window.triggerGameOver = triggerGameOver;

export function showDisclaimer() {
    if (onStateChange) onStateChange('DISCLAIMER');
}

export function showLeaderboard() {
    if (onStateChange) onStateChange('LEADERBOARD');
}

export function returnToStart() {
    if (onStateChange) onStateChange('START_SCREEN');
}

export function initGame() {
    window.RenderSys.init();
    window.RenderSys.clear(player); // Draw initial black screen
}

export function startGame() {
    if (onStateChange) onStateChange('PLAYING');

    window.AudioSys.init();
    window.InputSys.init();

    player = new window.Player();

    // If they lost before, load a random level upon starting again!
    let startIndex = 0;
    if (hasLostBefore && window.LevelManager.levels && window.LevelManager.levels.length > 1) {
        startIndex = Math.floor(Math.random() * (window.LevelManager.levels.length - 1)) + 1;
    } else {
        window.LevelManager.init();
    }

    if (window.LevelManager.levels && window.LevelManager.levels.length > 0 && hasLostBefore) {
        window.LevelManager.loadLevel(startIndex);
    }

    gameStarted = true;
    requestAnimationFrame(gameLoop);
}

function gameLoop(timestamp) {
    if (!gameStarted) return;
    if (!lastTime) lastTime = timestamp;
    const dt = timestamp - lastTime;
    lastTime = timestamp;

    update(dt);
    render();

    requestAnimationFrame(gameLoop);
}

function update(dt) {
    player.update(dt);
    window.LevelManager.update(dt, player);
    window.PhysicsSys.update(window.LevelManager.currentEntities, dt);

    const instructionEl = document.getElementById('initial-activation-prompt');
    if (instructionEl && player.torchOn) {
        instructionEl.classList.add('playing-mode');
    }

    // Handle Interactions
    if (window.InputSys.justToggled && window.InputSys.torchOn) {
        const interactRange = 100;
        for (const e of window.LevelManager.currentEntities) {
            const dx = e.x - window.InputSys.x;
            const dy = e.y - window.InputSys.y;
            if (dx * dx + dy * dy < interactRange * interactRange) {
                e.interact(player, window.LevelManager);
            }
        }
    }

    window.InputSys.resetFrame();
}

function render() {
    window.RenderSys.clear(player);
    window.RenderSys.drawEntities(window.LevelManager.currentEntities, player);
    window.RenderSys.drawTorchMask(player);
}

// Intercept window.resetToMainMenu calls from the vanilla game code
window.resetToMainMenu = resetToMainMenu;
