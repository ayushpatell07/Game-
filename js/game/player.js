class Player {
    constructor() {
        this.x = window.innerWidth / 2;
        this.y = window.innerHeight / 2;
        this.torchOn = false;
        
        this.baseRadius = 150;
        this.maxRadius = 150;
        this.currentRadius = 0;
        
        this.sanity = 1.0; 
        this.flickerList = new LinkedList();
        this.flickerTimer = 0;
    }

    update(dt) {
        // Smoothly follow the input cursor (interpolation for weight/lag effect)
        const lagFactor = 0.1 + (this.sanity * 0.15); // ranges 0.1 to 0.25 (higher sanity = faster follow)
        
        let targetX = InputSys.x;
        let targetY = InputSys.y;

        this.x += (targetX - this.x) * lagFactor;
        this.y += (targetY - this.y) * lagFactor;
        
        // Handle Input
        if (InputSys.justToggled) {
            this.torchOn = InputSys.torchOn;
            AudioSys.playToggle(this.torchOn);
        }

        // Handle Radius Interpolation & Flickering
        let targetRadius = this.torchOn ? this.maxRadius : 0;
        
        // Add flickering logic if sanity is low or level modifier triggers it
        if (this.torchOn && Math.random() > (0.95 + this.sanity * 0.04)) {
            // Low sanity means more frequent flickers
            this.flickerList.enqueue(Math.random() * targetRadius * 0.5);
        }
        
        if (this.flickerList.length > 0) {
            this.flickerTimer += dt;
            if (this.flickerTimer > 50) { // change flicker every 50ms
                targetRadius = this.flickerList.dequeue() || targetRadius;
                this.flickerTimer = 0;
                this.currentRadius = targetRadius; // FIX: Apply the flicker radius!
            }
        } else {
            // normal interpolation
            if (this.currentRadius !== targetRadius) {
                this.currentRadius += (targetRadius - this.currentRadius) * 0.15;
                if (Math.abs(this.currentRadius - targetRadius) < 1) {
                    this.currentRadius = targetRadius;
                }
            }
        }
        
        // Clamp sanity
        this.sanity = Math.max(0, Math.min(1, this.sanity));
    }
}
