const Input = (() => {
  const SWIPE_THRESHOLD = 20;
  const DIR = { UP: 'UP', DOWN: 'DOWN', LEFT: 'LEFT', RIGHT: 'RIGHT' };
  const OPPOSITE = { UP: 'DOWN', DOWN: 'UP', LEFT: 'RIGHT', RIGHT: 'LEFT' };

  let queue = [];
  let touchStart = null;

  function enqueue(dir) {
    const last = queue[queue.length - 1];
    if (last === dir) return;
    if (last && OPPOSITE[last] === dir) return;
    if (queue.length < 3) queue.push(dir);
  }

  function dequeue() {
    return queue.shift() || null;
  }

  function onTouchStart(e) {
    const t = e.changedTouches[0];
    touchStart = { x: t.clientX, y: t.clientY };
  }

  function onTouchEnd(e) {
    if (!touchStart) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touchStart.x;
    const dy = t.clientY - touchStart.y;
    touchStart = null;

    if (Math.abs(dx) < SWIPE_THRESHOLD && Math.abs(dy) < SWIPE_THRESHOLD) return;

    if (Math.abs(dx) > Math.abs(dy)) {
      enqueue(dx > 0 ? DIR.RIGHT : DIR.LEFT);
    } else {
      enqueue(dy > 0 ? DIR.DOWN : DIR.UP);
    }
  }

  function onKeyDown(e) {
    const map = {
      ArrowUp: DIR.UP, ArrowDown: DIR.DOWN,
      ArrowLeft: DIR.LEFT, ArrowRight: DIR.RIGHT,
      KeyW: DIR.UP, KeyS: DIR.DOWN,
      KeyA: DIR.LEFT, KeyD: DIR.RIGHT,
    };
    if (map[e.code]) {
      e.preventDefault();
      enqueue(map[e.code]);
    }
  }

  function init() {
    document.addEventListener('touchstart', onTouchStart, { passive: true });
    document.addEventListener('touchend', onTouchEnd, { passive: true });
    document.addEventListener('keydown', onKeyDown);
  }

  function reset() {
    queue = [];
    touchStart = null;
  }

  return { init, reset, dequeue, DIR };
})();
