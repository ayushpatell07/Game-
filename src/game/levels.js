window.LevelManager = {
    currentIndex: 0,
    levels: [],
    currentEntities: [],
    toastEl: null,
    interstitialEl: null,
    titleEl: null,
    subtitleEl: null,
    timerEl: null,
    timeRemaining: 0,
    hasTimer: false,
    toastTimeout: null,
    totalTimeTaken: 0,
    
    playerPerformance: { timeTaken: 0, mistakes: 0 },
    
    init() {
        this.toastEl = document.getElementById('toast');
        this.timerEl = document.getElementById('timer-display');
        this.interstitialEl = document.getElementById('interstitial-screen');
        this.titleEl = document.getElementById('interstitial-title');
        this.subtitleEl = document.getElementById('interstitial-subtitle');
        this.iconEls = document.querySelectorAll('.symbol-icon');
        
        this.totalTimeTaken = 0;
        this.buildLevels();
        this.loadLevel(0);
    },
    
    buildLevels() {
        const cx = window.innerWidth / 2;
        const cy = window.innerHeight / 2;
        
        this.levels = [
            {
                name: "Gather the Fragments",
                modifier: 'None',
                setup: () => {
                    const e = [];
                    e.push(new Clue(1, cx + (Math.random()*600 - 300), cy + (Math.random()*400 - 200), 1));
                    e.push(new Clue(2, cx + (Math.random()*600 - 300), cy + (Math.random()*400 - 200), 2));
                    e.push(new Clue(3, cx + (Math.random()*600 - 300), cy + (Math.random()*400 - 200), 3));
                    
                    const exit = new ExitDoor(99, cx, cy);
                    exit.visible = false; 
                    e.push(exit);
                    return e;
                }
            },
            {
                name: "Hastened Minds",
                modifier: 'HiddenTimer',
                timeLimit: 45,
                setup: () => {
                    const e = [];
                    for(let i=0; i<4; i++) {
                        let rx = Math.random() * window.innerWidth * 0.8 + window.innerWidth*0.1;
                        let ry = Math.random() * window.innerHeight * 0.8 + window.innerHeight*0.1;
                        e.push(new Clue(i, rx, ry, i));
                    }
                    const exit = new ExitDoor(100, cx, cy);
                    exit.visible = false;
                    e.push(exit);
                    return e;
                }
            },
            {
                name: "Fractured Trust",
                modifier: 'FakeObjects',
                setup: () => {
                    const e = [];
                    for(let i=0; i<7; i++) {
                        const rx = Math.random() * window.innerWidth * 0.8 + window.innerWidth*0.1;
                        const ry = Math.random() * window.innerHeight * 0.8 + window.innerHeight*0.1;
                        if(i < 3) e.push(new Clue(i, rx, ry, 0));
                        else e.push(new FakeObject(i, rx, ry));
                    }
                    const exit = new ExitDoor(99, cx, cy);
                    exit.visible = false; 
                    e.push(exit);
                    return e;
                }
            },
            {
                name: "The Void Maze",
                modifier: 'AntiGravity',
                setup: () => {
                    window.PhysicsSys.antiGravityActive = true;
                    window.PhysicsSys.speedMultiplier = 1.0; 
                    const maze = window.Graph.generateMaze(5, 5);
                    const e = [];
                    let id=0;
                    for (const [key, neighbors] of maze.adjList.entries()) {
                        const [xg, yg] = key.split(',').map(Number);
                        if (Math.random() > 0.7) e.push(new Clue(id++, xg * 150 + 100, yg * 150 + 100, 0));
                    }
                    if(e.length === 0) e.push(new Clue(id++, 200, 200, 0));
                    
                    const exit = new ExitDoor(999, window.innerWidth-100, window.innerHeight-100);
                    exit.visible = false;
                    e.push(exit);
                    return e;
                }
            },
            {
                name: "The Hunted",
                modifier: 'Hunted',
                setup: () => {
                    const e = [];
                    let id=0;
                    for(let i=0; i<3; i++) {
                        e.push(new Clue(id++, cx + (Math.random()*600 - 300), cy + (Math.random()*400 - 200), i));
                    }
                    e.push(new Stalker(id++, cx + 400, cy + 400));
                    e.push(new SanityCrystal(id++, cx - 300, cy - 300));
                    
                    const exit = new ExitDoor(100, cx, cy);
                    exit.visible = false;
                    e.push(exit);
                    return e;
                }
            }
        ];
    },

    loadLevel(index) {
        this.currentIndex = index;
        let levelConfig;
        
        // Notify React of depth change
        if (window.onDepthChange) {
            window.onDepthChange(index + 1);
        }
        
        if (index < this.levels.length) {
            levelConfig = this.levels[index];
        } else {
            const scaledDifficulty = index - this.levels.length; 
            const pool = ['HiddenTimer', 'FakeObjects', 'AntiGravity', 'Hunted'];
            pool.sort(() => Math.random() - 0.5); 
            const pickCount = Math.random() > 0.5 ? 3 : 2; 
            let activeMods = pool.slice(0, pickCount);
            
            const hasTimer = activeMods.includes('HiddenTimer');
            const hasFakes = activeMods.includes('FakeObjects');
            const hasAntiGrav = activeMods.includes('AntiGravity');
            const hasHunted = activeMods.includes('Hunted');

            levelConfig = {
                name: `Descent Layer ${index + 1}`,
                modifiers: activeMods,
                timeLimit: hasTimer ? Math.max(15, 35 - (scaledDifficulty * 3)) : null,
                setup: () => {
                    const e = [];
                    let id = 0;
                    if (hasAntiGrav) {
                        window.PhysicsSys.antiGravityActive = true;
                        window.PhysicsSys.speedMultiplier = 1.0 + (scaledDifficulty * 0.4);
                        const dims = Math.min(8, 4 + Math.floor(scaledDifficulty / 2));
                        const maze = window.Graph.generateMaze(dims, dims);
                        
                        for (const [key, neighbors] of maze.adjList.entries()) {
                            const [xg, yg] = key.split(',').map(Number);
                            if (Math.random() > 0.6) {
                                if (hasFakes && Math.random() > 0.5) {
                                    e.push(new FakeObject(id++, xg * 150 + 100, yg * 150 + 100));
                                } else {
                                    e.push(new Clue(id++, xg * 150 + 100, yg * 150 + 100, 0));
                                }
                            }
                        }
                        if(e.filter(el => el instanceof Clue && !el.isFake).length === 0) e.push(new Clue(id++, 200, 200, 0));
                        const exit = new ExitDoor(999, window.innerWidth-100, window.innerHeight-100);
                        exit.visible = false;
                        e.push(exit);
                    } else {
                         window.PhysicsSys.speedMultiplier = 1.0 + (scaledDifficulty * 0.4);
                        const cx = window.innerWidth / 2;
                        const cy = window.innerHeight / 2;
                        const numClues = Math.min(15, 3 + scaledDifficulty * 2);
                        
                        for(let i=0; i<numClues; i++) {
                            const rx = Math.random() * window.innerWidth * 0.8 + window.innerWidth*0.1;
                            const ry = Math.random() * window.innerHeight * 0.8 + window.innerHeight*0.1;
                            if (hasFakes && Math.random() > 0.4) {
                                e.push(new FakeObject(i, rx, ry));
                            } else {
                                e.push(new Clue(i, rx, ry, 0));
                            }
                        }
                        if(e.filter(el => el instanceof Clue && !el.isFake).length === 0) e.push(new Clue(9999, cx, cy, 0));
                        
                        const exit = new ExitDoor(999, cx, cy);
                        exit.visible = false;
                        e.push(exit);
                    }
                    
                    if (hasHunted) {
                        e.push(new Stalker(id++, window.innerWidth * Math.random(), window.innerHeight * Math.random()));
                    }
                    if (Math.random() > 0.4) {
                        e.push(new SanityCrystal(id++, window.innerWidth * Math.random(), window.innerHeight * Math.random()));
                    }
                    
                    return e;
                }
            };
        }

        if (levelConfig.modifiers) {
            window.PhysicsSys.antiGravityActive = levelConfig.modifiers.includes('AntiGravity');
        } else {
            window.PhysicsSys.antiGravityActive = (levelConfig.modifier === 'AntiGravity');
        }

        this.currentEntities = levelConfig.setup();
        this.playerPerformance = { timeTaken: 0, mistakes: 0 };
        
        const isTimerLevel = (levelConfig.modifiers && levelConfig.modifiers.includes('HiddenTimer')) || levelConfig.modifier === 'HiddenTimer';
        if (isTimerLevel) {
            this.hasTimer = true;
            const numFragments = this.currentEntities.filter(e => e.constructor.name === 'Clue' && !e.isFake).length;
            this.timeRemaining = numFragments * 10;
        } else {
            this.hasTimer = false;
        }
        
        // Let React handle the UI icons! We update them via DOM purely for fallback if React doesn't catch them,
        // but since we render the HUD via React, the iconEls might not exist yet if they just mounted.
        // It's better to update React State.
        if (window.onModifierChange) {
            window.onModifierChange(levelConfig.modifiers || [levelConfig.modifier]);
        }
        
        this.showInterstitial(`LEVEL ${index + 1}`, levelConfig.name);
    },

    onClueFound(orderValue) {
        const remaining = this.currentEntities.filter(e => e.constructor.name === 'Clue' && !e.isFake && !e.collected).length;
        const total = this.currentEntities.filter(e => e.constructor.name === 'Clue' && !e.isFake).length;
        const collected = total - remaining;
        
        if (remaining > 0) {
            this.showToast(`Fragment recovered... ${collected}/${total}`);
        } else {
            if (window.AudioSys) window.AudioSys.playToggle(true); 
            this.showToast("Level Complete!");
            // Automatically move to the next level after a brief delay
            setTimeout(() => {
                this.nextLevel();
            }, 1500);
        }
    },
    
    nextLevel() {
        this.loadLevel(this.currentIndex + 1);
    },

    update(dt, player) {
        this.playerPerformance.timeTaken += dt / 1000;
        this.totalTimeTaken += dt / 1000;
        
        // Update any entities that need ticking (e.g. Stalker)
        for (const e of this.currentEntities) {
            if (e.update) e.update(player, dt);
        }
        
        if (this.hasTimer) {
            this.timeRemaining -= dt / 1000;
            
            if (!this.timerEl) {
                this.timerEl = document.getElementById('timer-display');
            }
            
            if (this.timerEl) {
                this.timerEl.style.display = 'block';
                this.timerEl.innerText = Math.ceil(this.timeRemaining) + "s";
            }
            
            if (this.timeRemaining <= 0) {
                this.hasTimer = false; 
                player.sanity -= 0.5;
                if (window.AudioSys) window.AudioSys.updateSanity(player.sanity);
                
                this.showInterstitial("GAME OVER", "The darkness consumed you.");
                this.handleDeath();
            }
        } else {
            if (this.timerEl) {
                this.timerEl.style.display = 'none';
            }
        }
        
        // Instant Game Over check if sanity <= 0
        if (player.sanity <= 0) {
             this.hasTimer = false; 
             player.sanity = 0.01; // prevent infinite loops
             this.showInterstitial("GAME OVER", "Your sanity has shattered.");
             this.handleDeath();
        }
    },

    handleDeath() {
        setTimeout(() => {
            window.hasLostBefore = true;
            const depth = this.currentIndex + 1;
            const score = Math.max(0, Math.floor((depth * 1000) - (this.totalTimeTaken * 10)));
            if (window.triggerGameOver) window.triggerGameOver(score);
            else if (window.resetToMainMenu) window.resetToMainMenu();
        }, 4000);
    },

    showInterstitial(title, subtitle) {
        if (!this.titleEl || !this.interstitialEl) return;
        this.titleEl.innerText = title;
        this.subtitleEl.innerText = subtitle;
        this.interstitialEl.style.display = 'flex';
        this.interstitialEl.style.opacity = 1;
        
        if(window.InputSys) window.InputSys.torchOn = false;
        
        setTimeout(() => {
            let op = 1;
            let fade = setInterval(() => {
                op -= 0.05;
                this.interstitialEl.style.opacity = op;
                if (op <= 0) {
                    clearInterval(fade);
                    this.interstitialEl.style.display = 'none';
                }
            }, 50);
        }, 2000);
    },
    
    showToast(msg) {
        if (!this.toastEl) return;
        this.toastEl.innerText = msg;
        this.toastEl.classList.add('show');
        if (this.toastTimeout) clearTimeout(this.toastTimeout);
        this.toastTimeout = setTimeout(() => {
            this.toastEl.classList.remove('show');
        }, 3000);
    }
};
