// Module-level settings — persist across game resets without React re-renders
let _muted = false
let _speed = 1  // 0.5 | 1 | 2

export const settings = {
  get muted() { return _muted },
  setMuted(v: boolean) { _muted = v },
  get speed() { return _speed },
  setSpeed(v: number) { _speed = v },
}
