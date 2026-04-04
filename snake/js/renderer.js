const Renderer = (() => {
  let canvas, ctx, cellSize, gridSize;

  function init(canvasEl, cs, gs) {
    canvas = canvasEl;
    ctx = canvas.getContext('2d');
    cellSize = cs;
    gridSize = gs;
  }

  function resize(cs) {
    cellSize = cs;
  }

  function clear() {
    ctx.fillStyle = CONFIG.COLORS.BG;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  function drawGrid() {
    ctx.strokeStyle = CONFIG.COLORS.GRID;
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= gridSize; i++) {
      const pos = i * cellSize;
      ctx.beginPath();
      ctx.moveTo(pos, 0);
      ctx.lineTo(pos, canvas.height);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, pos);
      ctx.lineTo(canvas.width, pos);
      ctx.stroke();
    }
  }

  function roundRect(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  function drawSnake(segments) {
    const pad = Math.max(1, cellSize * 0.08);
    const radius = Math.max(2, cellSize * 0.3);

    segments.forEach((seg, i) => {
      const x = seg.x * cellSize + pad;
      const y = seg.y * cellSize + pad;
      const s = cellSize - pad * 2;

      ctx.fillStyle = i === 0 ? CONFIG.COLORS.SNAKE_HEAD : CONFIG.COLORS.SNAKE_BODY;
      roundRect(x, y, s, s, radius);
      ctx.fill();

      if (i === 0) {
        ctx.strokeStyle = CONFIG.COLORS.SNAKE_OUTLINE;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Eyes
        const eyeR = Math.max(1.5, cellSize * 0.09);
        const eyeOff = cellSize * 0.28;
        ctx.fillStyle = '#1a1a2e';
        ctx.beginPath();
        ctx.arc(seg.x * cellSize + cellSize * 0.35, seg.y * cellSize + eyeOff, eyeR, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(seg.x * cellSize + cellSize * 0.65, seg.y * cellSize + eyeOff, eyeR, 0, Math.PI * 2);
        ctx.fill();
      }
    });
  }

  function drawFood(pos, pulse) {
    const cx = pos.x * cellSize + cellSize / 2;
    const cy = pos.y * cellSize + cellSize / 2;
    const r = (cellSize / 2 - 2) * (0.85 + 0.15 * pulse);

    ctx.shadowColor = CONFIG.COLORS.FOOD_GLOW;
    ctx.shadowBlur = 12 + 8 * pulse;
    ctx.fillStyle = CONFIG.COLORS.FOOD;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Shine
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.beginPath();
    ctx.arc(cx - r * 0.25, cy - r * 0.3, r * 0.28, 0, Math.PI * 2);
    ctx.fill();
  }

  function draw(state) {
    clear();
    drawGrid();
    if (state.food) drawFood(state.food, state.foodPulse);
    if (state.snake && state.snake.length) drawSnake(state.snake);
  }

  return { init, resize, draw };
})();
