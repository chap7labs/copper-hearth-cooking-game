// Entry module for Copper Hearth: wires config, loop, kitchen state, orders, input, art, and audio.

import { FIXED_STEP, SHIFTS } from './config/recipes.js';
import {
  SCREEN_PAUSED,
  SCREEN_PLAYING,
  SCREEN_SUMMARY,
  SCREEN_TITLE,
  createGameLoop,
} from './engine/gameLoop.js';
import {
  createKitchenState,
  discardAction,
  interactAssembly,
  interactChoppingBoard,
  interactSkillet,
  pickIngredient,
  resetKitchenState,
  transferCompletePlateToPass,
  updateKitchenState,
} from './systems/kitchenState.js';
import {
  createOrderManager,
  servePlateFromPass,
  startShift,
  updateOrders,
} from './systems/orderManager.js';
import { createInputController } from './systems/inputController.js';
import { createKitchenRenderer } from './art/renderer.js';
import { createSoundEngine } from './audio/soundEngine.js';

const params = new URLSearchParams(window.location.search);
const seedParam = Number.parseInt(params.get('seed') ?? '', 10);
const seed = Number.isInteger(seedParam) ? seedParam : 20261125;

const canvas = document.getElementById('kitchen-canvas');
const statusEl = document.getElementById('status');

const kitchen = createKitchenState();
const orders = createOrderManager(seed);
const renderer = createKitchenRenderer(canvas);
const audio = createSoundEngine();

let selectedShift = 0;
let guideOpen = false;

function announce(text) {
  if (statusEl) statusEl.textContent = text;
}

function handleGameEvent(type, payload = {}) {
  if (type === 'pick') audio.playPick();
  else if (type === 'chop' || type === 'chop_done') audio.playChop();
  else if (type === 'sizzle_start') audio.playSizzleStart();
  else if (type === 'perfect_ready') audio.playPerfectChime();
  else if (type === 'plate' || type === 'plate_complete' || type === 'ready_to_serve') audio.playPlate();
  else if (type === 'serve_success') {
    audio.playBellServe(payload.combo ?? 1);
    announce(`Served ${payload.recipeId}. Earnings $${orders.score}. Combo x${orders.combo}.`);
  } else if (type === 'new_ticket') audio.playNewTicket();
  else if (type === 'trash') audio.playTrash();
  else if (type === 'error' || type === 'burnt' || type === 'ticket_expired') audio.playError();
  else if (type === 'shift_complete') {
    audio.playShiftComplete();
    loop.setScreen(SCREEN_SUMMARY);
    announce(`Shift complete. Score $${orders.score}, ${orders.starsEarned} stars.`);
  }
}

function beginShift(index) {
  selectedShift = Math.max(0, Math.min(SHIFTS.length - 1, index));
  resetKitchenState(kitchen);
  startShift(orders, selectedShift);
  guideOpen = false;
  loop.setScreen(SCREEN_PLAYING);
  announce(`Started ${SHIFTS[selectedShift].name}.`);
}

const loop = createGameLoop({
  step: FIXED_STEP,
  onUpdate(dt) {
    if (guideOpen) return;
    updateKitchenState(kitchen, dt, handleGameEvent);
    updateOrders(orders, dt, handleGameEvent);
  },
  onRender(screen, clock) {
    renderer.render({
      kitchen,
      orders,
      screen,
      selectedShift,
      audioMuted: audio.isMuted(),
      guideOpen,
      pointer: input.getPointer(),
      clock,
    });
  },
});

const input = createInputController(canvas, {
  getScreen: () => loop.getScreen(),
  isGuideOpen: () => guideOpen,
  onUnlockAudio: () => audio.unlock(),
  selectShift: (index) => {
    selectedShift = Math.max(0, Math.min(SHIFTS.length - 1, index));
  },
  startService: () => beginShift(selectedShift),
  restartShift: () => beginShift(selectedShift),
  nextShift: () => {
    const nextIdx = orders.shiftIndex < SHIFTS.length - 1 ? orders.shiftIndex + 1 : 0;
    beginShift(nextIdx);
  },
  startEndless: () => beginShift(SHIFTS.length - 1),
  goToTitle: () => {
    guideOpen = false;
    loop.setScreen(SCREEN_TITLE);
    announce('Returned to Copper Hearth menu.');
  },
  togglePause: () => {
    const cur = loop.getScreen();
    if (cur === SCREEN_PLAYING) {
      loop.setScreen(SCREEN_PAUSED);
      announce('Game paused.');
    } else if (cur === SCREEN_PAUSED) {
      loop.setScreen(SCREEN_PLAYING);
      announce('Game resumed.');
    }
  },
  toggleMute: () => {
    audio.setMuted(!audio.isMuted());
  },
  toggleGuide: (force) => {
    guideOpen = force === undefined ? !guideOpen : Boolean(force);
  },
  pickIngredient: (id) => pickIngredient(kitchen, id, handleGameEvent),
  interactSkillet: (idx) => interactSkillet(kitchen, idx, handleGameEvent),
  interactChop: () => interactChoppingBoard(kitchen, handleGameEvent),
  interactAssembly: () => interactAssembly(kitchen, handleGameEvent),
  sendToPass: () => transferCompletePlateToPass(kitchen, handleGameEvent),
  clearAssembly: () => {
    if (kitchen.assembly.items.length > 0) {
      kitchen.assembly.items = [];
      kitchen.assembly.candidateIds = [];
      kitchen.assembly.completeRecipeId = null;
      handleGameEvent('trash');
    }
  },
  servePass: () => servePlateFromPass(orders, kitchen, handleGameEvent),
  discard: () => discardAction(kitchen, handleGameEvent),
});

document.addEventListener('visibilitychange', () => {
  if (document.hidden && loop.getScreen() === SCREEN_PLAYING) {
    loop.setScreen(SCREEN_PAUSED);
  }
});

announce('Copper Hearth ready. Select a shift and press Space or click Start Service.');
loop.start();
