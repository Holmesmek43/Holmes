const Renderer = (() => {
  let canvas, ctx, cellSize, gridSize;

  // ─── Initialisation ──────────────────────────────────────────────────────────

  function init(canvasEl, cs, gs) {
    canvas   = canvasEl;
    ctx      = canvas.getContext('2d');
    cellSize = cs;
    gridSize = gs;
  }

  function resize(cs) {
    cellSize = cs;
  }

  // ─── Utilities ───────────────────────────────────────────────────────────────

  function hexToRgb(hex) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return { r, g, b };
  }

  function lerpColor(hexA, hexB, t) {
    const a = hexToRgb(hexA);
    const b = hexToRgb(hexB);
    const r = Math.round(a.r + (b.r - a.r) * t);
    const g = Math.round(a.g + (b.g - a.g) * t);
    const bv = Math.round(a.b + (b.b - a.b) * t);
    return `rgb(${r},${g},${bv})`;
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

  // ─── Background & Grid ───────────────────────────────────────────────────────

  function clear() {
    ctx.fillStyle = CONFIG.COLORS.BG;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  function drawGrid() {
    ctx.strokeStyle = CONFIG.COLORS.GRID;
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= gridSize; i++) {
      const pos = i * cellSize;
      ctx.beginPath(); ctx.moveTo(pos, 0); ctx.lineTo(pos, canvas.height); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, pos); ctx.lineTo(canvas.width, pos); ctx.stroke();
    }
  }

  // ─── Snake ───────────────────────────────────────────────────────────────────

  function drawSnake(segments, ghostMode) {
    if (!segments || !segments.length) return;
    const total   = segments.length;
    const pad     = Math.max(1, cellSize * 0.07);
    const radius  = Math.max(2, cellSize * 0.32);
    const s       = cellSize - pad * 2;

    // Draw body back-to-front so head is on top
    for (let i = total - 1; i >= 0; i--) {
      const seg = segments[i];
      const t   = total > 1 ? i / (total - 1) : 0;   // 0 = head, 1 = tail
      const col = lerpColor(CONFIG.COLORS.SNAKE_HEAD, CONFIG.COLORS.SNAKE_TAIL, t);
      const x   = seg.x * cellSize + pad;
      const y   = seg.y * cellSize + pad;

      if (i === 0) {
        // Head glow
        ctx.shadowColor = ghostMode ? 'rgba(79,209,197,0.8)' : CONFIG.COLORS.SNAKE_GLOW;
        ctx.shadowBlur  = ghostMode ? 18 : 12;
      } else {
        ctx.shadowBlur = 0;
      }

      ctx.fillStyle = ghostMode ? `rgba(79,209,197,${0.55 - t * 0.3})` : col;
      roundRect(x, y, s, s, radius);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // Eyes on head
    const head   = segments[0];
    const eyeR   = Math.max(1.5, cellSize * 0.08);
    const eyeOff = cellSize * 0.27;
    ctx.fillStyle = ghostMode ? '#81e6d9' : '#0a1408';
    ctx.beginPath();
    ctx.arc(head.x * cellSize + cellSize * 0.33, head.y * cellSize + eyeOff, eyeR, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(head.x * cellSize + cellSize * 0.67, head.y * cellSize + eyeOff, eyeR, 0, Math.PI * 2);
    ctx.fill();

    // Eye shine
    if (!ghostMode) {
      ctx.fillStyle = 'rgba(255,255,255,0.55)';
      const shineR = eyeR * 0.45;
      ctx.beginPath();
      ctx.arc(head.x * cellSize + cellSize * 0.33 + shineR, head.y * cellSize + eyeOff - shineR, shineR, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(head.x * cellSize + cellSize * 0.67 + shineR, head.y * cellSize + eyeOff - shineR, shineR, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // ─── Food ────────────────────────────────────────────────────────────────────

  function drawFood(pos, pulse, foodType) {
    const type  = CONFIG.FOOD_TYPES[foodType || 'normal'];
    const cx    = pos.x * cellSize + cellSize / 2;
    const cy    = pos.y * cellSize + cellSize / 2;
    const r     = (cellSize / 2 - 2) * (0.82 + 0.18 * pulse);

    ctx.shadowColor = type.glowColor;
    ctx.shadowBlur  = 14 + 8 * pulse;

    if (foodType === 'normal' || !foodType) {
      drawApple(cx, cy, r);
    } else if (foodType === 'golden') {
      drawGoldenStar(cx, cy, r, pulse);
    } else if (foodType === 'speedup') {
      drawLightning(cx, cy, r, type.color);
    } else if (foodType === 'slowmo') {
      drawSnowflake(cx, cy, r, type.color);
    } else if (foodType === 'ghost') {
      drawGhostFood(cx, cy, r, type.color, pulse);
    } else if (foodType === 'shield') {
      drawShieldFood(cx, cy, r, type.color);
    }

    ctx.shadowBlur = 0;
  }

  function drawApple(cx, cy, r) {
    // Apple body
    ctx.fillStyle = '#e53e3e';
    ctx.beginPath();
    ctx.arc(cx, cy + r * 0.05, r, 0, Math.PI * 2);
    ctx.fill();

    // Stem
    ctx.strokeStyle = '#68d391';
    ctx.lineWidth   = Math.max(1.5, r * 0.15);
    ctx.lineCap     = 'round';
    ctx.beginPath();
    ctx.moveTo(cx, cy - r * 0.85);
    ctx.lineTo(cx + r * 0.25, cy - r * 1.2);
    ctx.stroke();

    // Leaf
    ctx.fillStyle = '#48bb78';
    ctx.beginPath();
    ctx.ellipse(cx + r * 0.42, cy - r * 1.05, r * 0.32, r * 0.18, Math.PI * 0.3, 0, Math.PI * 2);
    ctx.fill();

    // Shine
    ctx.fillStyle = 'rgba(255,255,255,0.32)';
    ctx.beginPath();
    ctx.arc(cx - r * 0.28, cy - r * 0.25, r * 0.28, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawGoldenStar(cx, cy, r, pulse) {
    // Outer glow disc
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r * 1.2);
    grad.addColorStop(0,   'rgba(246,224,94,0.5)');
    grad.addColorStop(1,   'rgba(246,224,94,0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, r * 1.2, 0, Math.PI * 2);
    ctx.fill();

    // 5-point star
    ctx.fillStyle = '#f6e05e';
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const outerA = (i * 4 * Math.PI) / 5 - Math.PI / 2;
      const innerA = outerA + (2 * Math.PI) / 10;
      if (i === 0) ctx.moveTo(cx + r * Math.cos(outerA), cy + r * Math.sin(outerA));
      else         ctx.lineTo(cx + r * Math.cos(outerA), cy + r * Math.sin(outerA));
      ctx.lineTo(cx + r * 0.42 * Math.cos(innerA), cy + r * 0.42 * Math.sin(innerA));
    }
    ctx.closePath();
    ctx.fill();

    // Shine
    ctx.fillStyle = 'rgba(255,255,200,0.5)';
    ctx.beginPath();
    ctx.arc(cx - r * 0.22, cy - r * 0.22, r * 0.22, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawLightning(cx, cy, r, color) {
    // Background circle
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();

    // Lightning bolt
    ctx.fillStyle = '#fff8e1';
    ctx.beginPath();
    ctx.moveTo(cx + r * 0.1,  cy - r * 0.75);
    ctx.lineTo(cx - r * 0.15, cy - r * 0.05);
    ctx.lineTo(cx + r * 0.1,  cy - r * 0.05);
    ctx.lineTo(cx - r * 0.1,  cy + r * 0.75);
    ctx.lineTo(cx + r * 0.2,  cy + r * 0.10);
    ctx.lineTo(cx - r * 0.05, cy + r * 0.10);
    ctx.closePath();
    ctx.fill();
  }

  function drawSnowflake(cx, cy, r, color) {
    // Background circle
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();

    // Snowflake arms
    ctx.strokeStyle = '#ebf8ff';
    ctx.lineWidth   = Math.max(1.5, r * 0.14);
    ctx.lineCap     = 'round';
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + r * 0.72 * Math.cos(angle), cy + r * 0.72 * Math.sin(angle));
      ctx.stroke();
    }
    // Center dot
    ctx.fillStyle = '#ebf8ff';
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.18, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawGhostFood(cx, cy, r, color, pulse) {
    ctx.fillStyle = `rgba(79,209,197,${0.55 + 0.2 * pulse})`;
    // Ghost body
    ctx.beginPath();
    ctx.arc(cx, cy - r * 0.1, r * 0.82, Math.PI, 0, false);
    ctx.lineTo(cx + r * 0.82, cy + r * 0.7);
    // Wavy bottom
    const waves = 3;
    for (let i = 0; i < waves; i++) {
      const x1 = cx + r * 0.82 - (r * 1.64 / waves) * (i + 0.5);
      const x2 = cx + r * 0.82 - (r * 1.64 / waves) * (i + 1);
      ctx.quadraticCurveTo(x1, cy + r * (i % 2 === 0 ? 1.05 : 0.55), x2, cy + r * 0.7);
    }
    ctx.closePath();
    ctx.fill();

    // Ghost eyes
    ctx.fillStyle = '#0a1408';
    ctx.beginPath();
    ctx.arc(cx - r * 0.28, cy - r * 0.15, r * 0.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx + r * 0.28, cy - r * 0.15, r * 0.15, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawShieldFood(cx, cy, r, color) {
    // Background circle
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();

    // Shield shape
    ctx.fillStyle = '#fff5f5';
    ctx.beginPath();
    ctx.moveTo(cx,        cy - r * 0.65);
    ctx.lineTo(cx + r * 0.55, cy - r * 0.35);
    ctx.lineTo(cx + r * 0.55, cy + r * 0.10);
    ctx.quadraticCurveTo(cx + r * 0.35, cy + r * 0.72, cx, cy + r * 0.78);
    ctx.quadraticCurveTo(cx - r * 0.35, cy + r * 0.72, cx - r * 0.55, cy + r * 0.10);
    ctx.lineTo(cx - r * 0.55, cy - r * 0.35);
    ctx.closePath();
    ctx.fill();

    // Cross on shield
    ctx.fillStyle = color;
    ctx.fillRect(cx - r * 0.08, cy - r * 0.35, r * 0.16, r * 0.70);
    ctx.fillRect(cx - r * 0.28, cy - r * 0.04, r * 0.56, r * 0.16);
  }

  // ─── Particles ───────────────────────────────────────────────────────────────

  function drawParticles(particles) {
    particles.forEach(p => {
      const alpha = p.life / p.maxLife;
      ctx.globalAlpha = alpha;
      ctx.fillStyle   = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;
  }

  // ─── Confetti ────────────────────────────────────────────────────────────────

  function drawConfetti(confetti) {
    confetti.forEach(c => {
      const alpha = Math.min(1, c.life / (c.maxLife * 0.3));
      ctx.globalAlpha = alpha;
      ctx.fillStyle   = c.color;
      ctx.save();
      ctx.translate(c.x, c.y);
      ctx.rotate(c.angle);
      ctx.fillRect(-c.size / 2, -c.size / 2, c.size, c.size * 0.5);
      ctx.restore();
    });
    ctx.globalAlpha = 1;
  }

  // ─── Floating Texts ──────────────────────────────────────────────────────────

  function drawFloatingTexts(floatingTexts) {
    floatingTexts.forEach(ft => {
      const progress = 1 - ft.life / ft.maxLife;     // 0→1 as it ages
      const alpha    = ft.life / ft.maxLife;
      const offsetY  = progress * 35;

      ctx.globalAlpha = alpha;
      ctx.font        = `bold ${Math.round(cellSize * 0.7)}px -apple-system, Arial, sans-serif`;
      ctx.textAlign   = 'center';
      ctx.textBaseline= 'middle';
      ctx.fillStyle   = ft.color || '#f6e05e';

      // Drop shadow
      ctx.shadowColor = 'rgba(0,0,0,0.6)';
      ctx.shadowBlur  = 4;
      ctx.fillText(ft.text, ft.x, ft.y - offsetY);
      ctx.shadowBlur  = 0;
    });
    ctx.globalAlpha  = 1;
    ctx.textAlign    = 'left';
    ctx.textBaseline = 'alphabetic';
  }

  // ─── Main draw ───────────────────────────────────────────────────────────────

  function draw(state) {
    clear();
    drawGrid();

    if (state.food) drawFood(state.food, state.foodPulse, state.foodType);
    if (state.snake && state.snake.length) drawSnake(state.snake, state.ghostMode);
    if (state.particles && state.particles.length)     drawParticles(state.particles);
    if (state.confetti  && state.confetti.length)      drawConfetti(state.confetti);
    if (state.floatingTexts && state.floatingTexts.length) drawFloatingTexts(state.floatingTexts);
  }

  return { init, resize, draw };
})();
