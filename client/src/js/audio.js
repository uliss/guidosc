function AudioToneGenerator(freq) {
    var AudioContext = window.AudioContext || window.webkitAudioContext || false;

    if (AudioContext) {
        this.context = new AudioContext();
    } else {
        alert("Sorry, but the Web Audio API is not supported by your browser. Please, consider upgrading to the latest version or downloading Google Chrome or Mozilla Firefox");
    }

    this.osc = null;
    this.freq = 442;
}

AudioToneGenerator.prototype.play = function() {
    this.osc = this.context.createOscillator();
    if (this.osc.noteOn) this.osc.start = this.osc.noteOn;
    if (this.osc.noteOff) this.osc.stop = this.osc.noteOff;
    this.osc.type = 'sine';
    this.osc.frequency.value = this.freq;
    this.osc.start(0);
    this.osc.connect(this.context.destination); // connect it to the destination
};

AudioToneGenerator.prototype.stop = function() {
    if(this.osc === null) return;
    this.osc.stop(0);
    this.osc = null;
};

AudioToneGenerator.prototype.setFreq = function(f) {
    this.freq = f;
    if(this.isPlaying())
        this.osc.frequency.value = this.freq;
};

AudioToneGenerator.prototype.isPlaying = function() {
    return this.osc !== null;
};

module.exports.AudioToneGenerator = AudioToneGenerator;
