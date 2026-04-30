const AudioSys = {
    ctx: null,
    masterGain: null,
    sanity: 1.0,
    isMuted: false,

    init() {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioContext();
        
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = this.isMuted ? 0 : 1.0;
        this.masterGain.connect(this.ctx.destination);
    },

    resume() {
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    },

    playToggle(isOn) {
        if (!this.ctx) return;
        this.resume();
        
        // Play an electrical 'click/buzz'
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = isOn ? 'square' : 'sawtooth';
        osc.frequency.setValueAtTime(isOn ? 800 : 200, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(isOn ? 1200 : 50, this.ctx.currentTime + 0.1);
        
        gain.gain.setValueAtTime(0.5, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);
        
        osc.connect(gain);
        gain.connect(this.masterGain);
        
        osc.start();
        osc.stop(this.ctx.currentTime + 0.1);
    },

    updateSanity(sanityLevel) {
        // Sanity 1.0 = normal, 0.0 = completely insane
        this.sanity = sanityLevel;
    },
    
    toggleMute() {
        this.isMuted = !this.isMuted;
        if (this.ctx && this.masterGain) {
            this.masterGain.gain.value = this.isMuted ? 0 : 1.0;
        }
        return this.isMuted;
    }
};
