const InputSys = {
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
    isDown: false,
    justToggled: false,
    torchOn: false,

    init() {
        // Track pointer movement
        window.addEventListener('pointermove', (e) => {
            this.x = e.clientX;
            this.y = e.clientY;
        });

        // Track clicks for holding or interacting
        window.addEventListener('pointerdown', (e) => {
            this.isDown = true;
        });

        window.addEventListener('pointerup', (e) => {
            if (this.isDown) { // Count as a click/tap
                this.justToggled = true;
                this.torchOn = !this.torchOn;
            }
            this.isDown = false;
        });
        
        // Prevent default touch interactions
        document.addEventListener('touchstart', e => e.preventDefault(), {passive: false});
    },

    resetFrame() {
        this.justToggled = false;
    }
};
