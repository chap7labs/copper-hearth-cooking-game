// Unified mouse/pointer and keyboard input controller for Copper Hearth.

import { CANVAS_HEIGHT, CANVAS_WIDTH, INGREDIENTS, LAYOUT } from '../config/recipes.js';
import { SCREEN_PAUSED, SCREEN_PLAYING, SCREEN_SUMMARY, SCREEN_TITLE } from '../engine/gameLoop.js';

function pointInRect(x, y, rect) {
  return x >= rect.x && x <= rect.x + rect.w && y >= rect.y && y <= rect.y + rect.h;
}

export function createInputController(canvas, callbacks) {
  const pointer = { x: 640, y: 360, hoverZone: null };

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
      for (let i = 0; i < LAYOUT.titleShiftCards.length; i += 1) {
        if (pointInRect(x, y, LAYOUT.titleShiftCards[i])) return `shift_${i}`;
      }
      if (pointInRect(x, y, LAYOUT.titleStartBtn)) return 'title_start';
      return null;
    }
    if (screen === SCREEN_PAUSED) {
      if (pointInRect(x, y, LAYOUT.pauseResumeBtn)) return 'pause_resume';
      if (pointInRect(x, y, LAYOUT.pauseRestartBtn)) return 'pause_restart';
      if (pointInRect(x, y, LAYOUT.pauseTitleBtn)) return 'pause_title';
      return null;
    }
    if (screen === SCREEN_SUMMARY) {
      if (pointInRect(x, y, LAYOUT.summaryNextBtn)) return 'summary_next';
      if (pointInRect(x, y, LAYOUT.summaryReplayBtn)) return 'summary_replay';
      if (pointInRect(x, y, LAYOUT.summaryEndlessBtn)) return 'summary_endless';
      return null;
    }

    if (pointInRect(x, y, LAYOUT.pauseBtn)) return 'btn_pause';
    if (pointInRect(x, y, LAYOUT.muteBtn)) return 'btn_mute';
    if (pointInRect(x, y, LAYOUT.guideBtn)) return 'btn_guide';
    if (pointInRect(x, y, LAYOUT.skillets[0])) return 'skillet_0';
    if (pointInRect(x, y, LAYOUT.skillets[1])) return 'skillet_1';
    if (pointInRect(x, y, LAYOUT.choppingBoard)) return 'chop_board';
    if (pointInRect(x, y, LAYOUT.sendPassBtn)) return 'send_pass';
    if (pointInRect(x, y, LAYOUT.clearAssemblyBtn)) return 'clear_assembly';
    if (pointInRect(x, y, LAYOUT.assemblyBoard)) return 'assembly';
    if (pointInRect(x, y, LAYOUT.bellBtn) || pointInRect(x, y, LAYOUT.servingPass)) return 'serve_pass';
    if (pointInRect(x, y, LAYOUT.trashBin)) return 'trash';
    for (let i = 0; i < LAYOUT.pantryBins.length; i += 1) {
      if (pointInRect(x, y, LAYOUT.pantryBins[i])) return `bin_${i}`;
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

    if (zone === 'guide_close') {
      callbacks.toggleGuide(false);
      return;
    }
    if (zone.startsWith('shift_')) {
      callbacks.selectShift(Number(zone.slice(6)));
      return;
    }
    if (zone === 'title_start') {
      callbacks.startService();
      return;
    }
    if (zone === 'pause_resume') {
      callbacks.togglePause();
      return;
    }
    if (zone === 'pause_restart') {
      callbacks.restartShift();
      return;
    }
    if (zone === 'pause_title') {
      callbacks.goToTitle();
      return;
    }
    if (zone === 'summary_next') {
      callbacks.nextShift();
      return;
    }
    if (zone === 'summary_replay') {
      callbacks.restartShift();
      return;
    }
    if (zone === 'summary_endless') {
      callbacks.startEndless();
      return;
    }

    if (zone === 'btn_pause') callbacks.togglePause();
    else if (zone === 'btn_mute') callbacks.toggleMute();
    else if (zone === 'btn_guide') callbacks.toggleGuide();
    else if (zone === 'skillet_0') callbacks.interactSkillet(0);
    else if (zone === 'skillet_1') callbacks.interactSkillet(1);
    else if (zone === 'chop_board') callbacks.interactChop();
    else if (zone === 'send_pass') callbacks.sendToPass();
    else if (zone === 'clear_assembly') callbacks.clearAssembly();
    else if (zone === 'assembly') callbacks.interactAssembly();
    else if (zone === 'serve_pass') callbacks.servePass();
    else if (zone === 'trash') callbacks.discard();
    else if (zone.startsWith('bin_')) {
      const idx = Number(zone.slice(4));
      const item = INGREDIENTS[idx];
      if (item) callbacks.pickIngredient(item.id);
    }
  }

  function handleKeyDown(event) {
    callbacks.onUnlockAudio();
    const key = event.key.toLowerCase();
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
      if (item) callbacks.pickIngredient(item.id);
    } else if (key === 'c') {
      callbacks.interactChop();
    } else if (key === 'q') {
      callbacks.interactSkillet(0);
    } else if (key === 'e') {
      callbacks.interactSkillet(1);
    } else if (key === 'a') {
      callbacks.interactAssembly();
    } else if (key === ' ' || key === 'enter') {
      event.preventDefault();
      callbacks.servePass();
    } else if (key === 'x' || key === 'backspace') {
      event.preventDefault();
      callbacks.discard();
    }
  }

  canvas.addEventListener('pointermove', handlePointerMove);
  canvas.addEventListener('pointerdown', handlePointerDown);
  window.addEventListener('keydown', handleKeyDown);

  return {
    getPointer: () => pointer,
    destroy() {
      canvas.removeEventListener('pointermove', handlePointerMove);
      canvas.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('keydown', handleKeyDown);
    },
  };
}
