const RenderSys = {
    canvas: null,
    ctx: null,
    width: 0,
    height: 0,

    init() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.resize();
        window.addEventListener('resize', () => this.resize());
    },

    resize() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
    },

    clear(player) {
        this.ctx.fillStyle = '#010101'; // Slightly lifted black
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // Draw the base flashlight beam so the room isn't 100% pitch black when empty
        if (player && player.torchOn) {
            const radius = player.currentRadius;
            const grad = this.ctx.createRadialGradient(player.x, player.y, 0, player.x, player.y, radius);
            grad.addColorStop(0, 'rgba(20, 25, 30, 0.4)'); // Dim moonlight blue
            grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
            this.ctx.fillStyle = grad;
            this.ctx.fillRect(player.x - radius, player.y - radius, radius*2, radius*2);
        }
    },

    drawEntities(entities, player) {
        // Draw all objects first
        for (const e of entities) {
            if (e.visible) {
                // If it's a fake object, maybe glitch its color or draw weakly
                this.ctx.fillStyle = e.isFake ? `rgba(200,200,200,${Math.random() * 0.5 + 0.1})` : '#fff';
                this.ctx.beginPath();
                this.ctx.arc(e.x, e.y, e.radius, 0, Math.PI * 2);
                this.ctx.fill();
                
                // Draw trailing/drifting effects if any
                if(e.drawCustom) e.drawCustom(this.ctx);
            }
        }
    },

    drawTorchMask(player) {
        if (!player.torchOn) {
            // Screen is completely pitch black
            this.ctx.fillStyle = '#000';
            this.ctx.fillRect(0, 0, this.width, this.height);
            return;
        }

        // Create a radial gradient at the player's torch position
        const radius = player.currentRadius;
        // Outer box covers the screen with black, leaving a gradient 'hole' in the middle
        const grad = this.ctx.createRadialGradient(player.x, player.y, 0, player.x, player.y, radius);
        
        // Inner circle is fully transparent (reveals entities beneath)
        grad.addColorStop(0, 'rgba(0,0,0,0)');
        // Edge is fully black
        grad.addColorStop(1, 'rgba(0,0,0,1)');

        this.ctx.fillStyle = grad;
        this.ctx.fillRect(0, 0, this.width, this.height);
    }
};
