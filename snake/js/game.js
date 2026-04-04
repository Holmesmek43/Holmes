const Game = (() => {
  const STATE = { IDLE: 'IDLE', PLAYING: 'PLAYING', PAUSED: 'PAUSED', GAMEOVER: 'GAMEOVER' };
  const DIR_VEC = {
    UP:    { x:  0, y: -1 },
    DOWN:  { x:  0, y:  1 },
    LEFT:  { x: -1, y:  0 },
    RIGHT: { x:  1, y:  0 },
  };

  let state, tickTimer;

  const elScore     = document.getElementById('score-display');
  const elHighScore = document.getElementById('high-score-display');
  const elFinalScore= document.getElementById('final-score');
  const elNewRecord = document.getElementById('new-high-score');

  const screens = {
    start:    document.getElementById('screen-start'),
    pause:    document.getElementById('screen-pause'),
    gameover: document.getElementById('screen-gameover'),
  };
  const btnPause = document.getElementById('btn-pause');

  function getHighScore() {
    return parseInt(localStorage.getItem('snakeHighScore') || '0', 10);
  }

  function saveHighScore(s) {
    localStorage.setItem('snakeHighScore', String(s));
  }

  function showScreen(name) {
    Object.values(screens).forEach(el => el.classList.add('hidden'));
    btnPause.classList.add('hidden');
    if (name) {
      screens[name].classList.remove('hidden');
    } else {
      btnPause.classList.remove('hidden');
    }
  }

  function randomFood(snake) {
    const occupied = new Set(snake.map(s => `${s.x},${s.y}`));
    const gs = CONFIG.GRID_SIZE;
    let pos;
    do {
      pos = { x: Math.floor(Math.random() * gs), y: Math.floor(Math.random() * gs) };
    } while (occupied.has(`${pos.x},${pos.y}`));
    return pos;
  }

  function initState() {
    const mid = Math.floor(CONFIG.GRID_SIZE / 2);
    const snake = [
      { x: mid,     y: mid },
      { x: mid - 1, y: mid },
      { x: mid - 2, y: mid },
    ];
    return {
      phase: STATE.PLAYING,
      snake,
      dir: Input.DIR.RIGHT,
      nextDir: Input.DIR.RIGHT,
      food: randomFood(snake),
      score: 0,
      tickMs: CONFIG.TICK_MS,
      foodPulse: 0,
      pulseDir: 1,
      growing: false,
    };
  }

  function updateScore(s) {
    state.score = s;
    elScore.textContent = s;
  }

  function tick() {
    if (state.phase !== STATE.PLAYING) return;

    // Animate food pulse
    state.foodPulse += 0.06 * state.pulseDir;
    if (state.foodPulse >= 1) { state.foodPulse = 1; state.pulseDir = -1; }
    if (state.foodPulse <= 0) { state.foodPulse = 0; state.pulseDir = 1; }

    // Apply queued direction
    const queued = Input.dequeue();
    if (queued) state.dir = queued;

    const vec = DIR_VEC[state.dir];
    const head = state.snake[0];
    let nx = head.x + vec.x;
    let ny = head.y + vec.y;

    if (CONFIG.WRAP_WALLS) {
      nx = (nx + CONFIG.GRID_SIZE) % CONFIG.GRID_SIZE;
      ny = (ny + CONFIG.GRID_SIZE) % CONFIG.GRID_SIZE;
    } else if (nx < 0 || nx >= CONFIG.GRID_SIZE || ny < 0 || ny >= CONFIG.GRID_SIZE) {
      endGame();
      return;
    }

    // Self collision (skip last segment if not growing, as it will move away)
    const checkBody = state.growing ? state.snake : state.snake.slice(0, -1);
    if (checkBody.some(s => s.x === nx && s.y === ny)) {
      endGame();
      return;
    }

    const newHead = { x: nx, y: ny };
    state.snake.unshift(newHead);

    if (nx === state.food.x && ny === state.food.y) {
      updateScore(state.score + 1);
      state.food = randomFood(state.snake);
      state.foodPulse = 0;
      state.growing = true;
      state.tickMs = Math.max(CONFIG.MIN_TICK_MS, state.tickMs - CONFIG.SPEED_INCREMENT);
    } else {
      state.growing = false;
      state.snake.pop();
    }

    Renderer.draw(state);
    tickTimer = setTimeout(tick, state.tickMs);
  }

  function endGame() {
    state.phase = STATE.GAMEOVER;
    clearTimeout(tickTimer);
    Renderer.draw(state);

    const hs = getHighScore();
    const isNew = state.score > hs;
    if (isNew) saveHighScore(state.score);

    elFinalScore.textContent = state.score;
    elNewRecord.classList.toggle('hidden', !isNew);
    elHighScore.textContent = `Best: ${isNew ? state.score : hs}`;
    showScreen('gameover');
  }

  function start() {
    clearTimeout(tickTimer);
    Input.reset();
    state = initState();
    updateScore(0);
    elHighScore.textContent = `Best: ${getHighScore()}`;
    showScreen(null);
    Renderer.draw(state);
    tickTimer = setTimeout(tick, state.tickMs);
  }

  function pause() {
    if (state.phase !== STATE.PLAYING) return;
    state.phase = STATE.PAUSED;
    clearTimeout(tickTimer);
    showScreen('pause');
  }

  function resume() {
    if (state.phase !== STATE.PAUSED) return;
    state.phase = STATE.PLAYING;
    showScreen(null);
    tickTimer = setTimeout(tick, state.tickMs);
  }

  function drawIdle() {
    // Draw an initial decorative state on the canvas
    const mid = Math.floor(CONFIG.GRID_SIZE / 2);
    Renderer.draw({
      snake: [
        { x: mid, y: mid }, { x: mid - 1, y: mid }, { x: mid - 2, y: mid },
      ],
      food: { x: mid + 3, y: mid },
      foodPulse: 0.5,
    });
  }

  function init() {
    elHighScore.textContent = `Best: ${getHighScore()}`;
    showScreen('start');
    drawIdle();

    document.getElementById('btn-start').addEventListener('click', start);
    document.getElementById('btn-restart').addEventListener('click', start);
    document.getElementById('btn-restart-pause').addEventListener('click', start);
    document.getElementById('btn-resume').addEventListener('click', resume);
    btnPause.addEventListener('click', pause);
  }

  return { init, start, pause, resume };
})();
