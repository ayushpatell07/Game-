const PhysicsSys = {
    antiGravityActive: false,
    speedMultiplier: 1,
    time: 0,

    update(entities, dt) {
        this.time += dt;

        if (this.antiGravityActive) {
            const speedScale = this.speedMultiplier || 1;
            
            for (const e of entities) {
                if (e.isStatic) continue;
                
                // Initialize high-speed random vectors if undefined
                if (e.vx === undefined) {
                    const angle = Math.random() * Math.PI * 2;
                    e.vx = Math.cos(angle) * (150 + Math.random() * 150) * speedScale;
                    e.vy = Math.sin(angle) * (150 + Math.random() * 150) * speedScale;
                }
                
                // Drift dynamically based on velocity
                e.x += e.vx * (dt / 1000);
                e.y += e.vy * (dt / 1000);
                
                // Asteroids-style wall bounce to keep them inside the window
                if (e.x < 30 || e.x > window.innerWidth - 30) {
                    e.vx *= -1;
                    e.x = Math.max(30, Math.min(e.x, window.innerWidth - 30));
                }
                if (e.y < 30 || e.y > window.innerHeight - 30) {
                    e.vy *= -1;
                    e.y = Math.max(30, Math.min(e.y, window.innerHeight - 30));
                }
            }
        }
    }
};
