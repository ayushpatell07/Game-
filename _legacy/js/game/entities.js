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
    }

    interact(player, levelManager) {
        if (!this.visible) return;
        this.visible = false; // "Collect" it
        AudioSys.playToggle(true); 
        levelManager.onClueFound(this.orderValue);
    }
    
    drawCustom(ctx) {
        const time = performance.now();
        // Highly realistic fractured glowing crystal shard
        const baseGlow = 25;
        const pulseGlow = baseGlow + Math.sin(time * 0.005) * 10;
        
        ctx.save();
        ctx.translate(this.x, this.y);

        // Render Outer Ethereal Aura (No solid white circle!)
        let grad = ctx.createRadialGradient(0, 0, 0, 0, 0, pulseGlow);
        grad.addColorStop(0, 'rgba(100, 150, 255, 0.4)'); // Dim blue core only
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(0, 0, pulseGlow, 0, Math.PI * 2);
        ctx.fill();

        // Render Realistic Jagged Floating Piece (Polygon Shard)
        ctx.rotate(Math.sin(time * 0.002) * 0.15); // subtle floating drop wobble
        
        ctx.beginPath();
        ctx.moveTo(0, -12);
        ctx.lineTo(8, -2);
        ctx.lineTo(5, 12);
        ctx.lineTo(-6, 8);
        ctx.lineTo(-10, -3);
        ctx.closePath();
        
        ctx.fillStyle = `rgba(220, 240, 255, ${0.8 + 0.2 * Math.sin(time*0.01)})`;
        ctx.fill();
        
        // Shard Outline
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = `rgba(255, 255, 255, 0.95)`;
        ctx.stroke();

        // Specular Highlight (Inner reflection of the crystal)
        ctx.beginPath();
        ctx.moveTo(-5, -2);
        ctx.lineTo(0, -10);
        ctx.lineTo(2, -3);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.fill();
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
