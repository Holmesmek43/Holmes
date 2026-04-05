const Audio = (() => {
  let ctx = null;
  let muted = false;

  function ensure() {
    if (!ctx) {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
  }

  function playTone(freq, type, startTime, duration, gainStart, gainEnd) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = type;
    osc.frequency.setValueAtTime(freq, startTime);
    gain.gain.setValueAtTime(gainStart, startTime);
    gain.gain.exponentialRampToValueAtTime(Math.max(gainEnd, 0.0001), startTime + duration);
    osc.start(startTime);
    osc.stop(startTime + duration + 0.01);
  }

  function playFreqRamp(freqStart, freqEnd, type, startTime, duration, gainStart, gainEnd) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = type;
    osc.frequency.setValueAtTime(freqStart, startTime);
    osc.frequency.exponentialRampToValueAtTime(freqEnd, startTime + duration);
    gain.gain.setValueAtTime(gainStart, startTime);
    gain.gain.exponentialRampToValueAtTime(Math.max(gainEnd, 0.0001), startTime + duration);
    osc.start(startTime);
    osc.stop(startTime + duration + 0.01);
  }

  // Eat normal food: pleasant rising chirp
  function playEat() {
    if (muted) return;
    ensure();
    const t = ctx.currentTime;
    playFreqRamp(320, 560, 'sine', t, 0.07, 0.18, 0.001);
    playFreqRamp(480, 720, 'sine', t + 0.03, 0.06, 0.10, 0.001);
  }

  // Eat golden food: double sparkle
  function playGolden() {
    if (muted) return;
    ensure();
    const t = ctx.currentTime;
    playFreqRamp(440, 880, 'sine', t, 0.08, 0.22, 0.001);
    playFreqRamp(660, 1320, 'sine', t + 0.06, 0.07, 0.16, 0.001);
    playTone(1100, 'sine', t + 0.12, 0.06, 0.10, 0.001);
  }

  // Collect power-up: ascending 3-note arpeggio
  function playPowerUp() {
    if (muted) return;
    ensure();
    const t = ctx.currentTime;
    playTone(330, 'sine', t,        0.12, 0.20, 0.001);
    playTone(415, 'sine', t + 0.10, 0.12, 0.18, 0.001);
    playTone(523, 'sine', t + 0.20, 0.15, 0.22, 0.001);
  }

  // Game over: descending dark sequence
  function playGameOver() {
    if (muted) return;
    ensure();
    const t = ctx.currentTime;
    playTone(330, 'sawtooth', t,        0.18, 0.25, 0.001);
    playTone(277, 'sawtooth', t + 0.16, 0.18, 0.22, 0.001);
    playTone(220, 'sawtooth', t + 0.32, 0.20, 0.20, 0.001);
    playTone(165, 'sawtooth', t + 0.50, 0.30, 0.25, 0.001);
  }

  // Countdown tick: metronome click
  function playTick() {
    if (muted) return;
    ensure();
    const t = ctx.currentTime;
    playFreqRamp(800, 400, 'square', t, 0.05, 0.12, 0.001);
  }

  // Urgent tick (last 10s): higher pitch
  function playUrgentTick() {
    if (muted) return;
    ensure();
    const t = ctx.currentTime;
    playFreqRamp(1100, 600, 'square', t, 0.06, 0.18, 0.001);
  }

  // Shield absorbed a hit: metallic clang
  function playShield() {
    if (muted) return;
    ensure();
    const t = ctx.currentTime;
    playTone(880, 'square', t, 0.04, 0.30, 0.001);
    playTone(660, 'sine',   t + 0.04, 0.12, 0.22, 0.001);
    playFreqRamp(440, 220, 'sine', t + 0.10, 0.15, 0.15, 0.001);
  }

  // Ghost mode active: ethereal whoosh
  function playGhost() {
    if (muted) return;
    ensure();
    const t = ctx.currentTime;
    playFreqRamp(200, 800, 'sine', t, 0.10, 0.15, 0.001);
    playFreqRamp(300, 1200, 'sine', t + 0.05, 0.10, 0.10, 0.001);
  }

  // New high score: triumphant fanfare
  function playNewRecord() {
    if (muted) return;
    ensure();
    const t = ctx.currentTime;
    const notes = [523, 659, 784, 1047];
    notes.forEach((freq, i) => {
      playTone(freq, 'sine', t + i * 0.12, 0.14, 0.25, 0.001);
    });
  }

  function toggleMute() {
    muted = !muted;
    return muted;
  }

  function isMuted() {
    return muted;
  }

  return {
    playEat,
    playGolden,
    playPowerUp,
    playGameOver,
    playTick,
    playUrgentTick,
    playShield,
    playGhost,
    playNewRecord,
    toggleMute,
    isMuted,
  };
})();
