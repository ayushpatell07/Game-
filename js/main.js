let lastTime = 0;
let player;
let gameStarted = false;
let hasLostBefore = false;

window.resetToMainMenu = function() {
    gameStarted = false;
    document.getElementById('start-screen').style.display = 'flex';
    document.getElementById('interstitial-screen').style.display = 'none';
    document.getElementById('persistent-ui').style.display = 'none';
    if(player) {
        player.torchOn = false;
        InputSys.torchOn = false;
    }
    RenderSys.clear(player);
};

function init() {
    RenderSys.init();
    RenderSys.clear(player); // Draw initial black screen

    const startBtn = document.getElementById('start-btn');
    if(startBtn) {
        startBtn.addEventListener('click', startGame);
    }
    
    const muteBtn = document.getElementById('mute-btn');
    if (muteBtn) {
        muteBtn.addEventListener('click', () => {
            const muted = AudioSys.toggleMute();
            document.getElementById('icon-unmuted').style.display = muted ? 'none' : 'block';
            document.getElementById('icon-muted').style.display = muted ? 'block' : 'none';
        });
    }
}

function startGame() {
    document.getElementById('start-screen').style.display = 'none';
    
    AudioSys.init();
    InputSys.init();
    
    player = new Player();
    
    // If they lost before, load a random level upon starting again!
    let startIndex = 0;
    if (hasLostBefore && LevelManager.levels && LevelManager.levels.length > 1) {
        startIndex = Math.floor(Math.random() * (LevelManager.levels.length - 1)) + 1;
    } else {
        LevelManager.init();
    }
    
    if (LevelManager.levels && LevelManager.levels.length > 0 && hasLostBefore) {
        LevelManager.loadLevel(startIndex);
    }
    
    document.getElementById('persistent-ui').style.display = 'block';
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
    LevelManager.update(dt);
    PhysicsSys.update(LevelManager.currentEntities, dt);

    const instructionEl = document.getElementById('top-right-ui');
    if (instructionEl) {
        instructionEl.style.display = player.torchOn ? 'none' : 'block';
    }

    // Handle Interactions
    if (InputSys.justToggled && InputSys.torchOn) {
        // Player clicked while torch is on -> check if they clicked an interactable
        // Convert to spatial hash for optimization later, but simple loop for now
        const interactRange = 50;
        for (const e of LevelManager.currentEntities) {
            const dx = e.x - InputSys.x;
            const dy = e.y - InputSys.y;
            if (dx*dx + dy*dy < interactRange*interactRange) {
                e.interact(player, LevelManager);
            }
        }
    }

    InputSys.resetFrame();
}

function render() {
    RenderSys.clear(player);
    RenderSys.drawEntities(LevelManager.currentEntities, player);
    RenderSys.drawTorchMask(player);
}

// Start game
window.onload = init;
