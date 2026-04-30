const LevelManager = {
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
    
    playerPerformance: { timeTaken: 0, mistakes: 0 },
    
    init() {
        this.toastEl = document.getElementById('toast');
        this.timerEl = document.getElementById('timer-display');
        this.interstitialEl = document.getElementById('interstitial-screen');
        this.titleEl = document.getElementById('interstitial-title');
        this.subtitleEl = document.getElementById('interstitial-subtitle');
        this.iconEls = document.querySelectorAll('.symbol-icon');
        
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
                    PhysicsSys.antiGravityActive = true;
                    PhysicsSys.speedMultiplier = 1.0; // Base drift speed
                    const maze = Graph.generateMaze(5, 5);
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
            }
        ];
    },

    loadLevel(index) {
        this.currentIndex = index;
        let levelConfig;
        
        if (index < this.levels.length) {
            levelConfig = this.levels[index];
        } else {
            // Infinite Mode Procedural Generation
            const scaledDifficulty = index - this.levels.length; // 0, 1, 2...
            
            // Pool of infinite modifiers (guarantee at least 2 modes selected at minimum)
            const pool = ['HiddenTimer', 'FakeObjects', 'AntiGravity'];
            pool.sort(() => Math.random() - 0.5); // Shuffle array randomly
            const pickCount = Math.random() > 0.5 ? 3 : 2; // Enforce ALWAYS 2 or 3 modes
            let activeMods = pool.slice(0, pickCount);
            
            const hasTimer = activeMods.includes('HiddenTimer');
            const hasFakes = activeMods.includes('FakeObjects');
            const hasAntiGrav = activeMods.includes('AntiGravity');

            levelConfig = {
                name: `Descent Layer ${index + 1}`,
                modifiers: activeMods,
                timeLimit: hasTimer ? Math.max(15, 35 - (scaledDifficulty * 3)) : null,
                setup: () => {
                    const e = [];
                    // Generate based on AntiGrav (Maze) or standard arena
                    if (hasAntiGrav) {
                        PhysicsSys.antiGravityActive = true;
                        PhysicsSys.speedMultiplier = 1.0 + (scaledDifficulty * 0.4); // Scale entity velocity
                        // Grow maze dimensions slowly, max out at 8x8
                        const dims = Math.min(8, 4 + Math.floor(scaledDifficulty / 2));
                        const maze = Graph.generateMaze(dims, dims);
                        let id = 0;
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
                         PhysicsSys.speedMultiplier = 1.0 + (scaledDifficulty * 0.4);
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
                    return e;
                }
            };
        }

        // Apply Configuration
        if (levelConfig.modifiers) {
            PhysicsSys.antiGravityActive = levelConfig.modifiers.includes('AntiGravity');
        } else {
            PhysicsSys.antiGravityActive = (levelConfig.modifier === 'AntiGravity');
        }

        if (levelConfig.timeLimit) {
            this.hasTimer = true;
            this.timeRemaining = levelConfig.timeLimit;
        } else {
            this.hasTimer = false;
        }
        
        this.currentEntities = levelConfig.setup();
        this.playerPerformance = { timeTaken: 0, mistakes: 0 };
        
        if (this.iconEls) {
            this.iconEls.forEach(icon => {
                const mod = icon.getAttribute('data-modifier');
                if (levelConfig.modifiers) {
                    if (levelConfig.modifiers.includes(mod)) icon.classList.add('active');
                    else icon.classList.remove('active');
                } else {
                    if (mod === levelConfig.modifier) icon.classList.add('active');
                    else icon.classList.remove('active');
                }
            });
        }
        
        this.showInterstitial(`LEVEL ${index + 1}`, levelConfig.name);
    },

    onClueFound(orderValue) {
        const remaining = this.currentEntities.filter(e => e instanceof Clue && !e.isFake && e.visible).length;
        const total = this.currentEntities.filter(e => e instanceof Clue && !e.isFake).length;
        const collected = total - remaining;
        
        if (remaining > 0) {
            this.showToast(`Fragment recovered... ${collected}/${total}`);
        } else {
            const exit = this.currentEntities.find(e => e instanceof ExitDoor);
            if (exit) {
                exit.visible = true;
                exit.isOpen = true;
                AudioSys.playToggle(true); 
                this.showToast("A pathway has opened in the darkness.");
            }
        }
    },
    
    nextLevel() {
        // Immediately start the next level to prevent disappearing delay 
        this.loadLevel(this.currentIndex + 1);
    },

    update(dt) {
        if(this.currentIndex >= this.levels.length) return;
        
        this.playerPerformance.timeTaken += dt / 1000;
        
        if (this.hasTimer) {
            this.timeRemaining -= dt / 1000;
            
            if (this.timerEl) {
                this.timerEl.style.display = 'block';
                this.timerEl.innerText = Math.ceil(this.timeRemaining) + "s";
            }
            
            if (this.timeRemaining <= 0) {
                this.hasTimer = false; 
                player.sanity -= 0.5;
                AudioSys.updateSanity(player.sanity);
                
                this.showInterstitial("GAME OVER", "The darkness consumed you.");
                
                setTimeout(() => {
                    // Set global flag so next "START EXPERIENCE" selects a random level
                    window.hasLostBefore = true;
                    window.resetToMainMenu();
                }, 4000);
            }
        } else {
            if (this.timerEl) {
                this.timerEl.style.display = 'none';
            }
        }
    },

    showInterstitial(title, subtitle) {
        this.titleEl.innerText = title;
        this.subtitleEl.innerText = subtitle;
        this.interstitialEl.style.display = 'flex';
        this.interstitialEl.style.opacity = 1;
        
        // Force torch off during transition to hide the map loading
        if(player) player.torchOn = false;
        if(InputSys) InputSys.torchOn = false;
        
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
        this.toastEl.innerText = msg;
        this.toastEl.classList.add('show');
        if (this.toastTimeout) clearTimeout(this.toastTimeout);
        this.toastTimeout = setTimeout(() => {
            this.toastEl.classList.remove('show');
        }, 3000);
    }
};
