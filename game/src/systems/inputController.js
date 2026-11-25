// Dual spatial input controller: WASD/Arrows + Space/E/Q/1-8/X AND click-to-move BFS routing.

import { CANVAS_HEIGHT, CANVAS_WIDTH, HUD_LAYOUT, INGREDIENTS } from '../config/recipes.js';
import { stationRect } from '../config/kitchenLayouts.js';
import { SCREEN_PAUSED, SCREEN_PLAYING, SCREEN_SUMMARY, SCREEN_TITLE } from '../engine/gameLoop.js';

function pointInRect(x, y, rect) {
  return x >= rect.x && x <= rect.x + rect.w && y >= rect.y && y <= rect.y + rect.h;
}

export function createInputController(canvas, callbacks) {
  const pointer = { x: 640, y: 360, hoverZone: null };
  const keysDown = new Set();

  function toCanvasCoords(event) {
    const rect = canvas.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return { x: 0, y: 0 };
    return {
      x: ((event.clientX - rect.left) / rect.width) * CANVAS_WIDTH,
      y: ((event.clientY - rect.top) / rect.height) * CANVAS_HEIGHT,
    };
  }

  function detectHoverZone(x, y, screen, guideOpen) {
    if (guideOpen) return 'guide_close';
    if (screen === SCREEN_TITLE) {
      for (let i = 0; i < HUD_LAYOUT.titleShiftCards.length; i += 1) {
        if (pointInRect(x, y, HUD_LAYOUT.titleShiftCards[i])) return `shift_${i}`;
      }
      if (pointInRect(x, y, HUD_LAYOUT.titleStartBtn)) return 'title_start';
      return null;
    }
    if (screen === SCREEN_PAUSED) {
      if (pointInRect(x, y, HUD_LAYOUT.pauseResumeBtn)) return 'pause_resume';
      if (pointInRect(x, y, HUD_LAYOUT.pauseRestartBtn)) return 'pause_restart';
      if (pointInRect(x, y, HUD_LAYOUT.pauseTitleBtn)) return 'pause_title';
      return null;
    }
    if (screen === SCREEN_SUMMARY) {
      if (pointInRect(x, y, HUD_LAYOUT.summaryNextBtn)) return 'summary_next';
      if (pointInRect(x, y, HUD_LAYOUT.summaryReplayBtn)) return 'summary_replay';
      if (pointInRect(x, y, HUD_LAYOUT.summaryEndlessBtn)) return 'summary_endless';
      return null;
    }

    if (pointInRect(x, y, HUD_LAYOUT.pauseBtn)) return 'btn_pause';
    if (pointInRect(x, y, HUD_LAYOUT.muteBtn)) return 'btn_mute';
    if (pointInRect(x, y, HUD_LAYOUT.guideBtn)) return 'btn_guide';

    const layout = callbacks.getLayout();
    for (const st of layout.stations) {
      if (st.kind === 'counter') continue;
      if (pointInRect(x, y, stationRect(st))) return `st:${st.id}`;
    }
    return null;
  }

  function handlePointerMove(event) {
    const pos = toCanvasCoords(event);
    pointer.x = pos.x;
    pointer.y = pos.y;
    pointer.hoverZone = detectHoverZone(pos.x, pos.y, callbacks.getScreen(), callbacks.isGuideOpen());
  }

  function handlePointerDown(event) {
    callbacks.onUnlockAudio();
    const pos = toCanvasCoords(event);
    pointer.x = pos.x;
    pointer.y = pos.y;
    const screen = callbacks.getScreen();
    const zone = detectHoverZone(pos.x, pos.y, screen, callbacks.isGuideOpen());
    pointer.hoverZone = zone;
    if (!zone) return;

    if (zone === 'guide_close') callbacks.toggleGuide(false);
    else if (zone.startsWith('shift_')) callbacks.selectShift(Number(zone.slice(6)));
    else if (zone === 'title_start') callbacks.startService();
    else if (zone === 'pause_resume') callbacks.togglePause();
    else if (zone === 'pause_restart') callbacks.restartShift();
    else if (zone === 'pause_title') callbacks.goToTitle();
    else if (zone === 'summary_next') callbacks.nextShift();
    else if (zone === 'summary_replay') callbacks.restartShift();
    else if (zone === 'summary_endless') callbacks.startEndless();
    else if (zone === 'btn_pause') callbacks.togglePause();
    else if (zone === 'btn_mute') callbacks.toggleMute();
    else if (zone === 'btn_guide') callbacks.toggleGuide();
    else if (zone.startsWith('st:')) callbacks.commandStation(zone.slice(3));
  }

  function handleKeyDown(event) {
    callbacks.onUnlockAudio();
    const key = event.key.toLowerCase();
    keysDown.add(key);
    const screen = callbacks.getScreen();

    if (callbacks.isGuideOpen()) {
      if (key === 'h' || key === 'escape' || key === ' ') {
        event.preventDefault();
        callbacks.toggleGuide(false);
      }
      return;
    }

    if (screen === SCREEN_TITLE) {
      if (key === ' ' || key === 'enter') {
        event.preventDefault();
        callbacks.startService();
      } else if (key >= '1' && key <= '4') {
        callbacks.selectShift(Number(key) - 1);
      }
      return;
    }

    if (screen === SCREEN_SUMMARY) {
      if (key === ' ' || key === 'enter') {
        event.preventDefault();
        callbacks.nextShift();
      } else if (key === 'r') {
        callbacks.restartShift();
      }
      return;
    }

    if (key === 'p' || key === 'escape') {
      event.preventDefault();
      callbacks.togglePause();
      return;
    }
    if (key === 'm') {
      callbacks.toggleMute();
      return;
    }
    if (key === 'h') {
      callbacks.toggleGuide();
      return;
    }

    if (screen !== SCREEN_PLAYING) return;

    if (key >= '1' && key <= '8') {
      const item = INGREDIENTS[Number(key) - 1];
      if (item) callbacks.commandStation(`pantry_${item.id}`);
    } else if (key === ' ' || key === 'e' || key === 'enter') {
      event.preventDefault();
      callbacks.interactFocused();
    } else if (key === 'q') {
      callbacks.dashChef();
    } else if (key === 'x' || key === 'backspace') {
      event.preventDefault();
      callbacks.commandStation('trash_bin');
    }
  }

  function handleKeyUp(event) {
    keysDown.delete(event.key.toLowerCase());
  }

  function getMoveDir() {
    let x = 0;
    let y = 0;
    if (keysDown.has('a') || keysDown.has('arrowleft')) x -= 1;
    if (keysDown.has('d') || keysDown.has('arrowright')) x += 1;
    if (keysDown.has('w') || keysDown.has('arrowup')) y -= 1;
    if (keysDown.has('s') || keysDown.has('arrowdown')) y += 1;
    return { x, y };
  }

  canvas.addEventListener('pointermove', handlePointerMove);
  canvas.addEventListener('pointerdown', handlePointerDown);
  window.addEventListener('keydown', handleKeyDown);
  window.addEventListener('keyup', handleKeyUp);

  return {
    getPointer: () => pointer,
    getMoveDir,
    destroy() {
      canvas.removeEventListener('pointermove', handlePointerMove);
      canvas.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    },
  };
}
