const Game = (() => {
  const STATE = { IDLE: 'IDLE', PLAYING: 'PLAYING', PAUSED: 'PAUSED', GAMEOVER: 'GAMEOVER' };
  const DIR_VEC = {
    UP:    { x:  0, y: -1 },
    DOWN:  { x:  0, y:  1 },
    LEFT:  { x: -1, y:  0 },
    RIGHT: { x:  1, y:  0 },
  };

  let state, tickTimer, timerInterval;
  let selectedDifficulty = 'medium';
  let selectedMode       = 'classic';

  // ─── DOM refs ────────────────────────────────────────────────────────────────
  const elScore      = document.getElementById('score-display');
  const elHighScore  = document.getElementById('high-score-display');
  const elFinalScore = document.getElementById('final-score');
  const elNewRecord  = document.getElementById('new-high-score');
  const elTimer      = document.getElementById('timer-display');
  const elPowerBar   = document.getElementById('powerup-bar');
  const elStats      = document.getElementById('gameover-stats');
  const btnPause     = document.getElementById('btn-pause');
  const btnMute      = document.getElementById('btn-mute');
  const container    = document.getElementById('game-container');

  const screens = {
    start:    document.getElementById('screen-start'),
    pause:    document.getElementById('screen-pause'),
    gameover: document.getElementById('screen-gameover'),
  };

  // ─── Persistence ─────────────────────────────────────────────────────────────
  function getHighScore() {
    return parseInt(localStorage.getItem('snakeHighScore') || '0', 10);
  }
  function saveHighScore(s) {
    localStorage.setItem('snakeHighScore', String(s));
  }

  // ─── Screen management ───────────────────────────────────────────────────────
  function showScreen(name) {
    Object.values(screens).forEach(el => el.classList.add('hidden'));
    btnPause.classList.add('hidden');
    elTimer.classList.add('hidden');
    elPowerBar.innerHTML = '';
    if (name) {
      screens[name].classList.remove('hidden');
    } else {
      btnPause.classList.remove('hidden');
      if (selectedMode === 'timed') elTimer.classList.remove('hidden');
    }
  }

  // ─── Food placement ──────────────────────────────────────────────────────────
  function randomFood(snake) {
    const occupied = new Set(snake.map(s => `${s.x},${s.y}`));
    const gs = CONFIG.GRID_SIZE;
    let pos;
    do {
      pos = { x: Math.floor(Math.random() * gs), y: Math.floor(Math.random() * gs) };
    } while (occupied.has(`${pos.x},${pos.y}`));
    return pos;
  }

  function rollFoodType() {
    const types  = Object.entries(CONFIG.FOOD_TYPES);
    const roll   = Math.random();
    // Weighted pick: for each special type, independently check its chance
    // (only one special type at a time, checked in order)
    for (const [type, cfg] of types) {
      if (type === 'normal') continue;
      if (roll < cfg.chance) return type;
    }
    return 'normal';
  }

  // ─── Particles ───────────────────────────────────────────────────────────────
  function spawnParticles(cx, cy, color, count) {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.4;
      const speed = 1.2 + Math.random() * 2.2;
      state.particles.push({
        x:       cx,
        y:       cy,
        vx:      Math.cos(angle) * speed,
        vy:      Math.sin(angle) * speed,
        life:    28 + Math.floor(Math.random() * 14),
        maxLife: 40,
        color:   color,
        size:    2 + Math.random() * 3,
      });
    }
  }

  function spawnConfetti() {
    const colors = ['#f6e05e','#68d391','#fc8181','#63b3ed','#f6ad55','#b794f4','#4fd1c5'];
    for (let i = 0; i < 70; i++) {
      state.confetti.push({
        x:       Math.random() * (document.getElementById('game-canvas').width),
        y:       -10 - Math.random() * 80,
        vx:      (Math.random() - 0.5) * 2,
        vy:      1.5 + Math.random() * 2.5,
        angle:   Math.random() * Math.PI * 2,
        vAngle:  (Math.random() - 0.5) * 0.15,
        color:   colors[Math.floor(Math.random() * colors.length)],
        size:    6 + Math.random() * 8,
        life:    120 + Math.floor(Math.random() * 60),
        maxLife: 180,
      });
    }
  }

  function updateParticles() {
    state.particles = state.particles.filter(p => {
      p.x    += p.vx;
      p.y    += p.vy;
      p.vy   += 0.08;   // slight gravity
      p.life -= 1;
      return p.life > 0;
    });
    state.confetti = state.confetti.filter(c => {
      c.x     += c.vx;
      c.y     += c.vy;
      c.angle += c.vAngle;
      c.life  -= 1;
      return c.life > 0;
    });
  }

  // ─── Floating score texts ────────────────────────────────────────────────────
  function spawnFloatingText(cx, cy, text, color) {
    state.floatingTexts.push({ x: cx, y: cy, text, color, life: 38, maxLife: 38 });
  }

  function updateFloatingTexts() {
    state.floatingTexts = state.floatingTexts.filter(ft => {
      ft.life -= 1;
      return ft.life > 0;
    });
  }

  // ─── Power-up HUD ────────────────────────────────────────────────────────────
  const POWERUP_ICONS = { speedup: '⚡', slowmo: '❄️', ghost: '👻', shield: '🛡️' };

  function updatePowerUpBar() {
    elPowerBar.innerHTML = '';
    const now = Date.now();
    state.activePowerUps.forEach(pu => {
      const remaining = Math.ceil((pu.expiresAt - now) / 1000);
      if (remaining <= 0) return;
      const chip = document.createElement('div');
      chip.className = `powerup-chip ${pu.type}`;
      chip.textContent = `${POWERUP_ICONS[pu.type] || '?'} ${remaining}s`;
      elPowerBar.appendChild(chip);
    });
  }

  // ─── Power-up activation ─────────────────────────────────────────────────────
  function activatePowerUp(type) {
    const duration  = CONFIG.POWERUP_DURATION_MS[type];
    const expiresAt = Date.now() + duration;
    const diff      = CONFIG.DIFFICULTY[state.difficulty];

    // Remove any existing same-type power-up (refresh it)
    state.activePowerUps = state.activePowerUps.filter(p => p.type !== type);
    state.activePowerUps.push({ type, expiresAt });

    switch (type) {
      case 'speedup':
        state.tickMs = Math.max(diff.MIN_TICK_MS, Math.round(state.tickMs / 1.5));
        break;
      case 'slowmo':
        state.tickMs = Math.min(500, Math.round(state.tickMs * 1.6));
        break;
      case 'ghost':
        state.ghostMode = true;
        Audio.playGhost();
        break;
      case 'shield':
        state.shieldActive = true;
        Audio.playPowerUp();
        break;
    }

    if (type !== 'ghost' && type !== 'shield') Audio.playPowerUp();
  }

  function expirePowerUps() {
    const now  = Date.now();
    const diff = CONFIG.DIFFICULTY[state.difficulty];
    let changed = false;
    state.activePowerUps = state.activePowerUps.filter(pu => {
      if (now < pu.expiresAt) return true;
      // Expire it
      changed = true;
      if (pu.type === 'ghost')  state.ghostMode    = false;
      if (pu.type === 'shield') state.shieldActive = false;
      // Restore speed if speedup/slowmo expired
      if (pu.type === 'speedup' || pu.type === 'slowmo') {
        state.tickMs = diff.TICK_MS - (state.score * diff.SPEED_INCREMENT);
        state.tickMs = Math.max(diff.MIN_TICK_MS, state.tickMs);
      }
      return false;
    });
    if (changed) updatePowerUpBar();
  }

  // ─── Score ───────────────────────────────────────────────────────────────────
  function updateScore(s) {
    state.score = s;
    elScore.textContent = s;
  }

  // ─── Timer (timed mode) ──────────────────────────────────────────────────────
  function startTimer() {
    state.timerSeconds = CONFIG.TIMED_MODE_SECONDS;
    elTimer.textContent = state.timerSeconds;
    elTimer.classList.remove('urgent');

    timerInterval = setInterval(() => {
      state.timerSeconds -= 1;
      elTimer.textContent = state.timerSeconds;

      if (state.timerSeconds <= 10) {
        elTimer.classList.add('urgent');
        Audio.playUrgentTick();
      } else {
        Audio.playTick();
      }

      if (state.timerSeconds <= 0) {
        clearInterval(timerInterval);
        endGame();
      }
    }, 1000);
  }

  function stopTimer() {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
  }

  // ─── Game state init ─────────────────────────────────────────────────────────
  function initState() {
    const mid  = Math.floor(CONFIG.GRID_SIZE / 2);
    const diff = CONFIG.DIFFICULTY[selectedDifficulty];
    const snake = [
      { x: mid,     y: mid },
      { x: mid - 1, y: mid },
      { x: mid - 2, y: mid },
    ];
    return {
      phase:        STATE.PLAYING,
      difficulty:   selectedDifficulty,
      mode:         selectedMode,
      snake,
      dir:          Input.DIR.RIGHT,
      nextDir:      Input.DIR.RIGHT,
      food:         randomFood(snake),
      foodType:     'normal',
      score:        0,
      tickMs:       diff.TICK_MS,
      foodPulse:    0,
      pulseDir:     1,
      growing:      false,
      activePowerUps: [],
      ghostMode:    false,
      shieldActive: false,
      particles:    [],
      confetti:     [],
      floatingTexts:[],
      timerSeconds: CONFIG.TIMED_MODE_SECONDS,
    };
  }

  // ─── Screen-shake ────────────────────────────────────────────────────────────
  function triggerScreenShake() {
    container.classList.remove('screen-shake');
    // Force reflow to restart animation
    void container.offsetWidth;
    container.classList.add('screen-shake');
    container.addEventListener('animationend', () => {
      container.classList.remove('screen-shake');
    }, { once: true });
  }

  // ─── Main tick ───────────────────────────────────────────────────────────────
  function tick() {
    if (state.phase !== STATE.PLAYING) return;

    // Food pulse animation
    state.foodPulse += 0.07 * state.pulseDir;
    if (state.foodPulse >= 1) { state.foodPulse = 1; state.pulseDir = -1; }
    if (state.foodPulse <= 0) { state.foodPulse = 0; state.pulseDir = 1; }

    // Expire power-ups
    expirePowerUps();

    // Apply queued direction
    const queued = Input.dequeue();
    if (queued) state.dir = queued;

    const vec  = DIR_VEC[state.dir];
    const head = state.snake[0];
    let nx = head.x + vec.x;
    let ny = head.y + vec.y;

    // Wall collision
    const outOfBounds = nx < 0 || nx >= CONFIG.GRID_SIZE || ny < 0 || ny >= CONFIG.GRID_SIZE;
    if (outOfBounds) {
      if (state.ghostMode) {
        // Wrap through walls
        nx = (nx + CONFIG.GRID_SIZE) % CONFIG.GRID_SIZE;
        ny = (ny + CONFIG.GRID_SIZE) % CONFIG.GRID_SIZE;
      } else if (state.shieldActive) {
        state.shieldActive = false;
        state.activePowerUps = state.activePowerUps.filter(p => p.type !== 'shield');
        Audio.playShield();
        updatePowerUpBar();
        Renderer.draw(state);
        tickTimer = setTimeout(tick, state.tickMs);
        return;
      } else {
        endGame();
        return;
      }
    }

    // Self collision
    const checkBody = state.growing ? state.snake : state.snake.slice(0, -1);
    if (checkBody.some(s => s.x === nx && s.y === ny)) {
      if (state.ghostMode) {
        // Ghost: pass through self — skip
      } else if (state.shieldActive) {
        state.shieldActive = false;
        state.activePowerUps = state.activePowerUps.filter(p => p.type !== 'shield');
        Audio.playShield();
        updatePowerUpBar();
        Renderer.draw(state);
        tickTimer = setTimeout(tick, state.tickMs);
        return;
      } else {
        endGame();
        return;
      }
    }

    const newHead = { x: nx, y: ny };
    state.snake.unshift(newHead);

    if (nx === state.food.x && ny === state.food.y) {
      const foodCfg = CONFIG.FOOD_TYPES[state.foodType];
      const points  = foodCfg ? foodCfg.points : 1;

      updateScore(state.score + points);

      // Particles at food position
      const foodPixelX = nx * (document.getElementById('game-canvas').width  / CONFIG.GRID_SIZE) + (document.getElementById('game-canvas').width  / CONFIG.GRID_SIZE) / 2;
      const foodPixelY = ny * (document.getElementById('game-canvas').height / CONFIG.GRID_SIZE) + (document.getElementById('game-canvas').height / CONFIG.GRID_SIZE) / 2;
      const pColor = foodCfg ? foodCfg.color : '#e53e3e';
      spawnParticles(foodPixelX, foodPixelY, pColor, 12);
      spawnFloatingText(foodPixelX, foodPixelY, `+${points}`, pColor);

      // Sound
      if (state.foodType === 'golden') {
        Audio.playGolden();
      } else if (state.foodType !== 'normal') {
        activatePowerUp(state.foodType);
      } else {
        Audio.playEat();
      }

      // Spawn new food
      const diff = CONFIG.DIFFICULTY[state.difficulty];
      state.food     = randomFood(state.snake);
      state.foodType = rollFoodType();
      state.foodPulse = 0;
      state.growing   = true;

      // Speed up (only for non-powerup state)
      if (!state.activePowerUps.some(p => p.type === 'speedup' || p.type === 'slowmo')) {
        state.tickMs = Math.max(diff.MIN_TICK_MS, state.tickMs - diff.SPEED_INCREMENT);
      }
    } else {
      state.growing = false;
      state.snake.pop();
    }

    updateParticles();
    updateFloatingTexts();
    updatePowerUpBar();

    Renderer.draw(state);
    tickTimer = setTimeout(tick, state.tickMs);
  }

  // ─── End game ────────────────────────────────────────────────────────────────
  function endGame() {
    state.phase = STATE.GAMEOVER;
    clearTimeout(tickTimer);
    stopTimer();
    Audio.playGameOver();
    triggerScreenShake();

    Renderer.draw(state);

    const hs    = getHighScore();
    const isNew = state.score > hs;
    if (isNew) {
      saveHighScore(state.score);
      spawnConfetti();
      Audio.playNewRecord();
    }

    elFinalScore.textContent = state.score;
    elNewRecord.classList.toggle('hidden', !isNew);
    elHighScore.textContent  = `Best: ${isNew ? state.score : hs}`;

    // Stats line
    const modeLabel = state.mode === 'timed' ? '⏱ Timed' : '🌿 Classic';
    const diffLabel = { easy: '🌱 Easy', medium: '🌿 Medium', hard: '🌲 Hard' }[state.difficulty];
    elStats.textContent = `${modeLabel} · ${diffLabel}`;

    showScreen('gameover');
  }

  // ─── Start / Pause / Resume ──────────────────────────────────────────────────
  function start() {
    clearTimeout(tickTimer);
    stopTimer();
    Input.reset();
    state = initState();
    updateScore(0);
    elHighScore.textContent = `Best: ${getHighScore()}`;
    showScreen(null);

    if (selectedMode === 'timed') startTimer();

    Renderer.draw(state);
    tickTimer = setTimeout(tick, state.tickMs);
  }

  function pause() {
    if (state.phase !== STATE.PLAYING) return;
    state.phase = STATE.PAUSED;
    clearTimeout(tickTimer);
    stopTimer();
    showScreen('pause');
  }

  function resume() {
    if (state.phase !== STATE.PAUSED) return;
    state.phase = STATE.PLAYING;
    showScreen(null);
    if (selectedMode === 'timed' && state.timerSeconds > 0) {
      // Resume countdown from current remaining time
      timerInterval = setInterval(() => {
        state.timerSeconds -= 1;
        elTimer.textContent = state.timerSeconds;
        if (state.timerSeconds <= 10) {
          elTimer.classList.add('urgent');
          Audio.playUrgentTick();
        }
        if (state.timerSeconds <= 0) {
          clearInterval(timerInterval);
          endGame();
        }
      }, 1000);
    }
    tickTimer = setTimeout(tick, state.tickMs);
  }

  function goToMenu() {
    clearTimeout(tickTimer);
    stopTimer();
    if (state) state.phase = STATE.IDLE;
    showScreen('start');
    drawIdle();
  }

  // ─── Idle canvas ─────────────────────────────────────────────────────────────
  function drawIdle() {
    const mid = Math.floor(CONFIG.GRID_SIZE / 2);
    Renderer.draw({
      snake: [
        { x: mid, y: mid }, { x: mid - 1, y: mid }, { x: mid - 2, y: mid },
      ],
      food:         { x: mid + 3, y: mid },
      foodType:     'normal',
      foodPulse:    0.5,
      ghostMode:    false,
      particles:    [],
      confetti:     [],
      floatingTexts:[],
    });
  }

  // ─── Difficulty / Mode selectors ─────────────────────────────────────────────
  function initSelectors() {
    document.querySelectorAll('.diff-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedDifficulty = btn.dataset.diff;
      });
    });

    document.querySelectorAll('.mode-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedMode = btn.dataset.mode;
      });
    });
  }

  // ─── Init ────────────────────────────────────────────────────────────────────
  function init() {
    elHighScore.textContent = `Best: ${getHighScore()}`;
    showScreen('start');
    drawIdle();
    initSelectors();

    document.getElementById('btn-start').addEventListener('click', start);
    document.getElementById('btn-restart').addEventListener('click', start);
    document.getElementById('btn-restart-pause').addEventListener('click', start);
    document.getElementById('btn-resume').addEventListener('click', resume);
    document.getElementById('btn-menu').addEventListener('click', goToMenu);
    btnPause.addEventListener('click', pause);

    btnMute.addEventListener('click', () => {
      const nowMuted = Audio.toggleMute();
      btnMute.textContent = nowMuted ? '🔇' : '🔊';
    });
  }

  return { init, start, pause, resume };
})();
