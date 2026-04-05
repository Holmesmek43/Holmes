// Haptics.js — Taptic Engine for iPhone via Capacitor, Vibration API fallback for Android
// On plain Safari (no Capacitor), all calls silently do nothing.
const Haptics = (() => {
  // Capacitor Haptics plugin (available when running as native iOS/Android app)
  function cap() {
    return window.Capacitor?.Plugins?.Haptics || null;
  }

  // Vibration API fallback (Android Chrome / Firefox)
  function vibe(pattern) {
    navigator.vibrate?.(pattern);
  }

  // ─── Light tap — eating normal food ────────────────────────────────────────
  function light() {
    const h = cap();
    if (h) {
      h.impact({ style: 'LIGHT' });
    } else {
      vibe(20);
    }
  }

  // ─── Medium tap — eating golden food or activating power-up ────────────────
  function medium() {
    const h = cap();
    if (h) {
      h.impact({ style: 'MEDIUM' });
    } else {
      vibe(40);
    }
  }

  // ─── Heavy tap — shield absorbing a hit ────────────────────────────────────
  function heavy() {
    const h = cap();
    if (h) {
      h.impact({ style: 'HEAVY' });
    } else {
      vibe(60);
    }
  }

  // ─── Error notification — game over ────────────────────────────────────────
  function error() {
    const h = cap();
    if (h) {
      h.notification({ type: 'ERROR' });
    } else {
      vibe([80, 50, 80]);
    }
  }

  // ─── Success notification — new high score ─────────────────────────────────
  function success() {
    const h = cap();
    if (h) {
      h.notification({ type: 'SUCCESS' });
    } else {
      vibe([30, 30, 60]);
    }
  }

  // ─── Warning notification — countdown last 10s ─────────────────────────────
  function warning() {
    const h = cap();
    if (h) {
      h.notification({ type: 'WARNING' });
    } else {
      vibe(25);
    }
  }

  // ─── Selection tick — used for UI button taps ──────────────────────────────
  function selection() {
    const h = cap();
    if (h) {
      h.selectionStart();
      h.selectionChanged();
      h.selectionEnd();
    } else {
      vibe(10);
    }
  }

  return { light, medium, heavy, error, success, warning, selection };
})();
