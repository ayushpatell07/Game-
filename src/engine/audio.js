window.AudioSys = {
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

    playChime() {
        if (!this.ctx) return;
        this.resume();
        
        const time = this.ctx.currentTime;
        
        let osc1 = this.ctx.createOscillator();
        let gain1 = this.ctx.createGain();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(880, time); 
        gain1.gain.setValueAtTime(0.3, time);
        gain1.gain.exponentialRampToValueAtTime(0.01, time + 0.5);
        osc1.connect(gain1);
        gain1.connect(this.masterGain);
        osc1.start(time);
        osc1.stop(time + 0.5);
        
        let osc2 = this.ctx.createOscillator();
        let gain2 = this.ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(1108.73, time + 0.1); 
        gain2.gain.setValueAtTime(0.3, time + 0.1);
        gain2.gain.exponentialRampToValueAtTime(0.01, time + 0.6);
        osc2.connect(gain2);
        gain2.connect(this.masterGain);
        osc2.start(time + 0.1);
        osc2.stop(time + 0.6);

        let osc3 = this.ctx.createOscillator();
        let gain3 = this.ctx.createGain();
        osc3.type = 'sine';
        osc3.frequency.setValueAtTime(1318.51, time + 0.2); 
        gain3.gain.setValueAtTime(0.4, time + 0.2);
        gain3.gain.exponentialRampToValueAtTime(0.01, time + 1.0);
        osc3.connect(gain3);
        gain3.connect(this.masterGain);
        osc3.start(time + 0.2);
        osc3.stop(time + 1.0);
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
