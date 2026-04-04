(() => {
  const canvas = document.getElementById('game-canvas');

  function computeLayout() {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const canvasSize = Math.floor(Math.min(vw, vh) / CONFIG.GRID_SIZE) * CONFIG.GRID_SIZE;
    const cellSize = canvasSize / CONFIG.GRID_SIZE;
    return { canvasSize, cellSize };
  }

  function applyLayout() {
    const { canvasSize, cellSize } = computeLayout();
    canvas.width  = canvasSize;
    canvas.height = canvasSize;
    Renderer.resize(cellSize);
  }

  function init() {
    const { canvasSize, cellSize } = computeLayout();
    canvas.width  = canvasSize;
    canvas.height = canvasSize;

    Renderer.init(canvas, cellSize, CONFIG.GRID_SIZE);
    Input.init();
    Game.init();
  }

  window.addEventListener('resize', () => {
    applyLayout();
  });

  window.addEventListener('orientationchange', () => {
    setTimeout(applyLayout, 100);
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
