// Web Audio API sound effects — no external files needed

let ctx: AudioContext | null = null

function getCtx(): AudioContext {
  if (!ctx) ctx = new AudioContext()
  return ctx
}

function resumeCtx() {
  const c = getCtx()
  if (c.state === 'suspended') c.resume()
  return c
}

function playTone(freq: number, duration: number, type: OscillatorType = 'sine', gain = 0.3) {
  const c = resumeCtx()
  const osc = c.createOscillator()
  const g = c.createGain()
  osc.connect(g)
  g.connect(c.destination)
  osc.type = type
  osc.frequency.setValueAtTime(freq, c.currentTime)
  g.gain.setValueAtTime(gain, c.currentTime)
  g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration)
  osc.start()
  osc.stop(c.currentTime + duration)
}

function playNoise(duration: number, gain = 0.15) {
  const c = resumeCtx()
  const bufSize = c.sampleRate * duration
  const buf = c.createBuffer(1, bufSize, c.sampleRate)
  const data = buf.getChannelData(0)
  for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1
  const src = c.createBufferSource()
  src.buffer = buf
  const g = c.createGain()
  src.connect(g)
  g.connect(c.destination)
  g.gain.setValueAtTime(gain, c.currentTime)
  g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration)
  src.start()
  src.stop(c.currentTime + duration)
}

export const sounds = {
  dice() {
    // Rattling dice: short noise bursts
    playNoise(0.08, 0.2)
    setTimeout(() => playNoise(0.06, 0.18), 80)
    setTimeout(() => playNoise(0.07, 0.15), 150)
    setTimeout(() => playTone(220, 0.1, 'square', 0.15), 200)
  },

  ladder() {
    // Ascending arpeggio
    const notes = [330, 440, 550, 660, 880]
    notes.forEach((freq, i) => setTimeout(() => playTone(freq, 0.15, 'sine', 0.25), i * 80))
  },

  chute() {
    // Descending glide
    const c = resumeCtx()
    const osc = c.createOscillator()
    const g = c.createGain()
    osc.connect(g)
    g.connect(c.destination)
    osc.type = 'sawtooth'
    osc.frequency.setValueAtTime(600, c.currentTime)
    osc.frequency.exponentialRampToValueAtTime(80, c.currentTime + 0.5)
    g.gain.setValueAtTime(0.2, c.currentTime)
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.5)
    osc.start()
    osc.stop(c.currentTime + 0.5)
  },

  move() {
    playTone(440, 0.06, 'sine', 0.12)
  },

  win() {
    // Fanfare
    const melody = [523, 659, 784, 1047, 784, 1047]
    const times  = [0,   150, 300,  450,  550,  650]
    melody.forEach((freq, i) => setTimeout(() => playTone(freq, 0.25, 'sine', 0.3), times[i]))
    setTimeout(() => playTone(1047, 0.6, 'sine', 0.35), 700)
  },

  click() {
    playTone(660, 0.05, 'sine', 0.1)
  },

  turn() {
    playTone(550, 0.08, 'sine', 0.15)
    setTimeout(() => playTone(660, 0.08, 'sine', 0.15), 100)
  },
}
