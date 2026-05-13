class Entity {
    constructor(id, x, y) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.baseX = x;
        this.baseY = y;
        this.radius = 20;
        this.visible = true;
        this.isStatic = false; 
        this.interactable = true;
        this.isFake = false;
    }
    
    interact(player, levelManager) {}
}

class Clue extends Entity {
    constructor(id, x, y, orderValue) {
        super(id, x, y);
        this.orderValue = orderValue;
        this.collected = false;
        this.burstTime = 0;
        this.hue = Math.random() * 360; 
        this.isClue = true;
    }

    interact(player, levelManager) {
        if (!this.visible || this.collected) return;
        this.collected = true;
        this.burstTime = performance.now();
        
        if (window.AudioSys && window.AudioSys.playChime) {
            window.AudioSys.playChime();
        } else if (window.AudioSys) {
            window.AudioSys.playToggle(true); 
        }
        levelManager.onClueFound(this.orderValue);
        
        setTimeout(() => { this.visible = false; }, 600);
    }
    
    drawCustom(ctx) {
        const time = performance.now();
        ctx.save();
        ctx.translate(this.x, this.y);

        if (this.collected) {
            const dt = time - this.burstTime;
            if (dt < 600) {
                const p = dt / 600;
                const radius = 20 + p * 150;
                const alpha = 1 - p;
                
                let grad = ctx.createRadialGradient(0, 0, 0, 0, 0, radius);
                grad.addColorStop(0, `hsla(${this.hue}, 100%, 80%, ${alpha})`);
                grad.addColorStop(0.5, `hsla(${(this.hue + 50) % 360}, 100%, 60%, ${alpha * 0.8})`);
                grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
                
                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.arc(0, 0, radius, 0, Math.PI * 2);
                ctx.fill();
                
                for(let i=0; i<8; i++) {
                    const angle = (Math.PI * 2 / 8) * i + p * 2;
                    const r = radius * 0.8;
                    const px = Math.cos(angle) * r;
                    const py = Math.sin(angle) * r;
                    ctx.fillStyle = `hsla(${this.hue + i*40}, 100%, 80%, ${alpha})`;
                    ctx.beginPath();
                    ctx.arc(px, py, 6, 0, Math.PI*2);
                    ctx.fill();
                }
            }
        } else {
            const baseGlow = 35; 
            const pulseGlow = baseGlow + Math.sin(time * 0.005) * 15;
            
            let grad = ctx.createRadialGradient(0, 0, 0, 0, 0, pulseGlow);
            const currentHue = (this.hue + time * 0.05) % 360; 
            grad.addColorStop(0, `hsla(${currentHue}, 100%, 70%, 0.8)`); 
            grad.addColorStop(0.5, `hsla(${currentHue}, 100%, 50%, 0.4)`);
            grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
            
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(0, 0, pulseGlow, 0, Math.PI * 2);
            ctx.fill();

            ctx.rotate(Math.sin(time * 0.002) * 0.15); 
            
            ctx.beginPath();
            ctx.moveTo(0, -12);
            ctx.lineTo(8, -2);
            ctx.lineTo(5, 12);
            ctx.lineTo(-6, 8);
            ctx.lineTo(-10, -3);
            ctx.closePath();
            
            ctx.fillStyle = `hsla(${currentHue}, 100%, 90%, ${0.9 + 0.1 * Math.sin(time*0.01)})`;
            ctx.fill();
            
            ctx.lineWidth = 2;
            ctx.strokeStyle = `rgba(255, 255, 255, 1)`;
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(-5, -2);
            ctx.lineTo(0, -10);
            ctx.lineTo(2, -3);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            ctx.fill();
        }
        
        ctx.restore();
    }
}

class FakeObject extends Clue {
    constructor(id, x, y) {
        super(id, x, y, 0);
        this.isFake = true;
        this.revealed = false;
        this.revealTime = 0;
    }

    interact(player, levelManager) {
        if(this.revealed || !this.visible) return;
        this.revealed = true;
        this.revealTime = performance.now();
        
        // Penalize player sanity heavily
        player.sanity -= 0.25;
        AudioSys.updateSanity(player.sanity);
        AudioSys.playToggle(false); // Harsh buzz
        
        levelManager.playerPerformance.mistakes++;
        
        // Illusion Threshold Rule: 3 strikes triggers instant game over
        if (levelManager.playerPerformance.mistakes > 2) {
            levelManager.hasTimer = false;
            levelManager.showInterstitial("GAME OVER", "Too many fractured illusions...");
            setTimeout(() => {
                window.hasLostBefore = true;
                window.resetToMainMenu();
            }, 4000);
        } else {
            levelManager.showToast(`An illusion... Strikes: ${levelManager.playerPerformance.mistakes}/3`);
        }
        
        // Hide completely after a short glitch
        setTimeout(() => { this.visible = false; }, 800);
    }

    drawCustom(ctx) {
        if (!this.revealed) {
            // Draw identically to a clue to trick the player!
            super.drawCustom(ctx);
        } else {
            // Glitch effect while fading out
            const dt = performance.now() - this.revealTime;
            if (dt < 800) {
                ctx.fillStyle = `rgba(255, 0, 0, ${Math.random()})`;
                ctx.fillRect(this.x - 20 + Math.random()*10, this.y - 20 + Math.random()*10, 40, 40);
                // Draw jagged lines
                ctx.strokeStyle = '#f00';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(this.x - 30, this.y);
                ctx.lineTo(this.x + 30, this.y + (Math.random()*20 - 10));
                ctx.stroke();
            }
        }
    }
}

class ExitDoor extends Entity {
    constructor(id, x, y) {
        super(id, x, y);
        this.radius = 40;
        this.isOpen = false; 
    }
    
    interact(player, levelManager) {
        if(!this.visible) return;
        
        if (this.isOpen) {
            this.visible = false; // Prevent multiple clicks from breaking transition
            levelManager.nextLevel();
        } else {
            AudioSys.playToggle(false); // locked error noise
        }
    }
    
    drawCustom(ctx) {
        if (!this.visible) return;
        
        ctx.save();
        ctx.translate(this.x, this.y);
        
        if (this.isOpen) {
            // Swirling rift down to the next level
            const t = performance.now() * 0.001;
            ctx.rotate(t);
            
            const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, this.radius);
            grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
            grad.addColorStop(0.2, 'rgba(100, 200, 255, 0.8)');
            grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
            
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
            ctx.fill();
            
            // Draw particles rotating
            for(let i=0; i<5; i++) {
                ctx.fillStyle = '#fff';
                ctx.beginPath();
                ctx.arc(Math.cos(i + t*2) * 20, Math.sin(i + t*2) * 20, 2, 0, Math.PI*2);
                ctx.fill();
            }
        }
        ctx.restore();
    }
}

class SanityCrystal extends Entity {
    constructor(id, x, y) {
        super(id, x, y);
    }

    interact(player, levelManager) {
        if (!this.visible) return;
        this.visible = false;
        player.sanity = Math.min(1.0, player.sanity + 0.25);
        if (window.AudioSys) window.AudioSys.updateSanity(player.sanity);
        if (window.AudioSys) window.AudioSys.playToggle(true); 
        levelManager.showToast("Sanity Restored.");
    }
    
    drawCustom(ctx) {
        const time = performance.now();
        const pulseGlow = 20 + Math.sin(time * 0.005) * 5;
        
        ctx.save();
        ctx.translate(this.x, this.y);

        let grad = ctx.createRadialGradient(0, 0, 0, 0, 0, pulseGlow);
        grad.addColorStop(0, 'rgba(50, 255, 100, 0.4)');
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(0, 0, pulseGlow, 0, Math.PI * 2);
        ctx.fill();

        ctx.rotate(Math.sin(time * 0.002) * 0.15); 
        
        ctx.beginPath();
        ctx.moveTo(0, -10);
        ctx.lineTo(6, 0);
        ctx.lineTo(0, 10);
        ctx.lineTo(-6, 0);
        ctx.closePath();
        
        ctx.fillStyle = `rgba(150, 255, 150, ${0.8 + 0.2 * Math.sin(time*0.01)})`;
        ctx.fill();
        
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = `rgba(255, 255, 255, 0.95)`;
        ctx.stroke();

        ctx.restore();
    }
}

class Stalker extends Entity {
    constructor(id, x, y) {
        super(id, x, y);
        this.speed = 60; // Fairly fast, but freezes on light
        this.visible = true;
    }

    update(player, dt) {
        if (!this.visible) return;
        
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        
        if (player.isIlluminating && player.isIlluminating(this.x, this.y)) {
            return; // Frozen by light
        }
        
        if (dist > 0) {
            this.x += (dx / dist) * this.speed * (dt / 1000);
            this.y += (dy / dist) * this.speed * (dt / 1000);
        }
        
        // Drain sanity heavily if close
        if (dist < 40) {
            player.sanity -= 0.1 * (dt / 1000); // 10% sanity drain per second
            if (window.AudioSys) window.AudioSys.updateSanity(player.sanity);
        }
    }

    drawCustom(ctx) {
        if (!this.visible) return;
        const time = performance.now();
        
        ctx.save();
        ctx.translate(this.x, this.y);
        
        ctx.translate((Math.random()-0.5)*4, (Math.random()-0.5)*4);
        
        const pulse = 25 + Math.sin(time * 0.01) * 5;
        let grad = ctx.createRadialGradient(0, 0, 0, 0, 0, pulse);
        grad.addColorStop(0, 'rgba(255, 0, 0, 0.8)');
        grad.addColorStop(1, 'rgba(50, 0, 0, 0)');
        
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(0, 0, pulse, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = `rgba(0, 0, 0, 0.9)`;
        ctx.beginPath();
        ctx.arc(0, 0, 10, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.strokeStyle = 'rgba(255, 0, 0, 0.9)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(-15, (Math.random()-0.5)*20);
        ctx.lineTo(15, (Math.random()-0.5)*20);
        ctx.stroke();
        
        ctx.restore();
    }
}

window.Entity = Entity;

window.Clue = Clue;

window.FakeObject = FakeObject;

window.ExitDoor = ExitDoor;

window.SanityCrystal = SanityCrystal;

window.Stalker = Stalker;

window.SanityCrystal = SanityCrystal;

window.Stalker = Stalker;
