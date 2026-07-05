/**
 * Генератор звуков
 * @module SoundGenerator
 */

 var SoundGenerator = {
    audioContext: null,
    isInitialized: false,
    enabled: true,
    
    init: function() {
        if (this.isInitialized) return;
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.isInitialized = true;
        } catch (error) {
            // Игнорируем ошибки аудио
        }
    },
    
    activate: function() {
        this.enabled = true;
        if (!this.audioContext) this.init();
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    },
    
    _createSound: function(options) {
        options = options || {};
        if (!this.audioContext || !this.enabled) return;
        var type = options.type || 'sine';
        var frequency = options.frequency || 440;
        var duration = options.duration || 0.1;
        var volume = options.volume || 0.3;
        var startTime = options.startTime || this.audioContext.currentTime;
        try {
            var oscillator = this.audioContext.createOscillator();
            var gainNode = this.audioContext.createGain();
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            oscillator.type = type;
            oscillator.frequency.setValueAtTime(frequency, startTime);
            gainNode.gain.setValueAtTime(volume, startTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
            oscillator.start(startTime);
            oscillator.stop(startTime + duration);
        } catch (e) {
            // Игнорируем ошибки звука
        }
    },
    
    playAttack: function() {
        var now = this.audioContext ? this.audioContext.currentTime : 0;
        this._createSound({ type: 'sawtooth', frequency: 200, duration: 0.1, volume: 0.2, startTime: now });
        this._createSound({ type: 'square', frequency: 100, duration: 0.15, volume: 0.15, startTime: now + 0.02 });
    },
    
    playVictory: function() {
        var now = this.audioContext ? this.audioContext.currentTime : 0;
        this._createSound({ type: 'sine', frequency: 523.25, duration: 0.2, volume: 0.25, startTime: now });
        this._createSound({ type: 'sine', frequency: 659.25, duration: 0.2, volume: 0.25, startTime: now + 0.2 });
        this._createSound({ type: 'sine', frequency: 783.99, duration: 0.3, volume: 0.3, startTime: now + 0.4 });
    },
    
    playPokemonCry: function() {
        var now = this.audioContext ? this.audioContext.currentTime : 0;
        var baseFreq = Math.random() * 300 + 200;
        for (var i = 0; i < 3; i++) {
            this._createSound({
                type: i % 2 === 0 ? 'sawtooth' : 'square',
                frequency: baseFreq * (1 + i * 0.2),
                duration: 0.1,
                volume: 0.15,
                startTime: now + i * 0.1
            });
        }
    },
    
    playAddToTeam: function() {
        var now = this.audioContext ? this.audioContext.currentTime : 0;
        this._createSound({ type: 'triangle', frequency: 600, duration: 0.1, volume: 0.2, startTime: now });
        this._createSound({ type: 'triangle', frequency: 800, duration: 0.15, volume: 0.2, startTime: now + 0.1 });
    }
};

window.SoundGenerator = SoundGenerator;