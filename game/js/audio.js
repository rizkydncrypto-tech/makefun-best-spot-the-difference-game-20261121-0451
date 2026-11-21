// Tiny WebAudio sound engine for Twin Worlds — no audio files at all.
// Every effect is a few oscillators through one gain node, created lazily on
// the first user gesture (browsers block audio before that).

export class SoundEngine {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.muted = false;
  }

  ensure() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return false;
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.22;
      this.master.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') void this.ctx.resume();
    return true;
  }

  setMuted(muted) {
    this.muted = muted;
    if (this.master) this.master.gain.value = muted ? 0 : 0.22;
  }

  tone(freq, startAt, dur, type = 'sine', vol = 1) {
    if (this.muted || !this.ctx || !this.master) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    const t = this.ctx.currentTime + startAt;
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.9 * vol, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(gain);
    gain.connect(this.master);
    osc.start(t);
    osc.stop(t + dur + 0.05);
  }

  // Short ascending jingle when a level starts.
  start() {
    if (!this.ensure()) return;
    [392, 523, 659].forEach((f, i) => this.tone(f, i * 0.09, 0.22, 'triangle', 0.7));
  }

  // Happy two-note chime when a difference is found.
  found() {
    if (!this.ensure()) return;
    this.tone(660, 0, 0.16, 'sine', 0.9);
    this.tone(990, 0.09, 0.28, 'sine', 0.9);
    this.tone(1320, 0.18, 0.3, 'triangle', 0.5);
  }

  // Low buzz for a wrong click.
  wrong() {
    if (!this.ensure()) return;
    this.tone(160, 0, 0.22, 'sawtooth', 0.5);
    this.tone(110, 0.05, 0.25, 'sawtooth', 0.4);
  }

  // Soft blip when a hint fires.
  hint() {
    if (!this.ensure()) return;
    this.tone(880, 0, 0.12, 'triangle', 0.7);
    this.tone(1174, 0.08, 0.18, 'triangle', 0.6);
  }

  // Little click for buttons.
  click() {
    if (!this.ensure()) return;
    this.tone(520, 0, 0.07, 'square', 0.35);
  }

  // Rising arpeggio for a cleared level.
  levelClear() {
    if (!this.ensure()) return;
    [523, 659, 784, 1046].forEach((f, i) => this.tone(f, i * 0.11, 0.3, 'triangle', 0.8));
  }

  // Fanfare for winning the whole game.
  win() {
    if (!this.ensure()) return;
    [523, 659, 784, 1046, 784, 1046, 1318].forEach((f, i) =>
      this.tone(f, i * 0.13, 0.34, 'triangle', 0.8),
    );
  }

  // Short tick when the timer drops under ten seconds.
  tick() {
    if (!this.ensure()) return;
    this.tone(1200, 0, 0.05, 'square', 0.25);
  }
}
