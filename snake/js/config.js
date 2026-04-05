const CONFIG = {
  GRID_SIZE: 20,
  WRAP_WALLS: false,
  TIMED_MODE_SECONDS: 60,

  DIFFICULTY: {
    easy:   { TICK_MS: 200, MIN_TICK_MS: 100, SPEED_INCREMENT: 2 },
    medium: { TICK_MS: 150, MIN_TICK_MS:  60, SPEED_INCREMENT: 4 },
    hard:   { TICK_MS: 100, MIN_TICK_MS:  40, SPEED_INCREMENT: 6 },
  },

  FOOD_TYPES: {
    normal:  { points: 1, color: '#e53e3e', glowColor: 'rgba(229,62,62,0.6)',   chance: 1.00, label: '🍎' },
    golden:  { points: 2, color: '#f6e05e', glowColor: 'rgba(246,224,94,0.7)',  chance: 0.20, label: '⭐' },
    speedup: { points: 1, color: '#f6ad55', glowColor: 'rgba(246,173,85,0.6)',  chance: 0.15, label: '⚡' },
    slowmo:  { points: 1, color: '#63b3ed', glowColor: 'rgba(99,179,237,0.6)',  chance: 0.15, label: '❄️' },
    ghost:   { points: 1, color: '#4fd1c5', glowColor: 'rgba(79,209,197,0.6)',  chance: 0.12, label: '👻' },
    shield:  { points: 1, color: '#fc8181', glowColor: 'rgba(252,129,129,0.6)', chance: 0.10, label: '🛡️' },
  },

  POWERUP_DURATION_MS: {
    speedup: 5000,
    slowmo:  5000,
    ghost:   8000,
    shield:  5000,
  },

  COLORS: {
    BG:              '#0a1408',
    GRID:            '#1a2f1a',
    SNAKE_HEAD:      '#7ac945',
    SNAKE_TAIL:      '#1e4d0f',
    SNAKE_GLOW:      'rgba(122,201,69,0.55)',
    FOOD:            '#e53e3e',
    FOOD_GLOW:       'rgba(229,62,62,0.5)',
    OVERLAY:         'rgba(8,18,8,0.90)',
  },
};
