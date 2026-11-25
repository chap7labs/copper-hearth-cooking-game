// Entry module for Yuzu & Hinoki: depth-first wiring of recipes, spatial layouts,
// game loop, top-down chef controller, stations, orders, input, sprites, renderer, and audio.

import { FIXED_STEP, SHIFTS } from './config/recipes.js';
import { buildWalkGrid, getLayout } from './config/kitchenLayouts.js';
import {
  SCREEN_PAUSED,
  SCREEN_PLAYING,
  SCREEN_SUMMARY,
  SCREEN_TITLE,
  createGameLoop,
} from './engine/gameLoop.js';
import {
  commandChefToStation,
  createChef,
  resetChef,
  triggerChefDash,
  updateChef,
} from './systems/chefController.js';
import {
  createKitchenState,
  interactWithStation,
  resetKitchenState,
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

let selectedShift = 0;
let activeLayout = getLayout(SHIFTS[0].layoutId);
let walkGrid = buildWalkGrid(activeLayout);

const chef = createChef(activeLayout);
const kitchen = createKitchenState(activeLayout);
const orders = createOrderManager(seed);
const renderer = createKitchenRenderer(canvas);
const audio = createSoundEngine();

let guideOpen = false;

function announce(text) {
  if (statusEl) statusEl.textContent = text;
}

function handleGameEvent(type, payload = {}) {
  if (type === 'pick') {
    audio.playPick();
    announce(`Picked ${payload.ingredientId}.`);
  } else if (type === 'chop' || type === 'chop_done') {
    audio.playChop();
    if (type === 'chop_done') announce(`Chopped ${payload.ingredientId}.`);
  } else if (type === 'cook_start') {
    audio.playCookStart(payload.cookType);
    announce(`Cooking ${payload.ingredientId} on ${payload.cookType}.`);
  } else if (type === 'perfect_ready') audio.playPerfectChime();
  else if (type === 'plate' || type === 'plate_complete' || type === 'ready_to_serve') {
    audio.playPlate();
    if (type === 'plate') announce(`Plated ${payload.count}/3.`);
    else if (type === 'plate_complete') announce(`Completed ${payload.recipeId}.`);
    else if (type === 'ready_to_serve') announce(`Ready on pass: ${payload.recipeId}.`);
  } else if (type === 'serve_success') {
    audio.playBellServe(payload.combo ?? 1);
    announce(`Served ${payload.recipeId}. Earnings $${orders.score}. Combo x${orders.combo}.`);
  } else if (type === 'new_ticket') audio.playNewTicket();
  else if (type === 'trash') {
    audio.playTrash();
    announce('Discarded item.');
  }
  else if (type === 'ticket_expired') {
    audio.playError();
    announce(`Ticket ${payload.ticketNumber ?? ''} expired.`);
  } else if (type === 'burnt' || type === 'error') {
    audio.playError();
    if (kitchen.banner?.text) announce(`Notice: ${kitchen.banner.text}`);
  } else if (type === 'shift_complete') {
    audio.playShiftComplete();
    loop.setScreen(SCREEN_SUMMARY);
    announce(`Shift complete. Score $${orders.score}, ${orders.starsEarned} stars.`);
  }
}

function interactAt(station) {
  interactWithStation(
    kitchen,
    chef,
    orders,
    station,
    (passId) => servePlateFromPass(orders, kitchen, activeLayout, passId, handleGameEvent),
    handleGameEvent,
  );
}

function beginShift(index) {
  selectedShift = Math.max(0, Math.min(SHIFTS.length - 1, index));
  const shift = SHIFTS[selectedShift];
  activeLayout = getLayout(shift.layoutId);
  walkGrid = buildWalkGrid(activeLayout);
  resetChef(chef, activeLayout);
  resetKitchenState(kitchen, activeLayout);
  startShift(orders, selectedShift);
  guideOpen = false;
  loop.setScreen(SCREEN_PLAYING);
  announce(`Started ${shift.name}.`);
}

const loop = createGameLoop({
  step: FIXED_STEP,
  onUpdate(dt) {
    if (guideOpen) return;
    updateChef(chef, dt, activeLayout, walkGrid, input.getMoveDir(), (st) => interactAt(st));
    updateKitchenState(kitchen, dt, activeLayout, handleGameEvent);
    updateOrders(orders, dt, handleGameEvent);
  },
  onRender(screen, clock) {
    renderer.render({
      kitchen,
      orders,
      chef,
      layout: activeLayout,
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
  getLayout: () => activeLayout,
  isGuideOpen: () => guideOpen,
  onUnlockAudio: () => audio.unlock(),
  selectShift: (index) => {
    selectedShift = Math.max(0, Math.min(SHIFTS.length - 1, index));
    activeLayout = getLayout(SHIFTS[selectedShift].layoutId);
    walkGrid = buildWalkGrid(activeLayout);
    resetChef(chef, activeLayout);
    resetKitchenState(kitchen, activeLayout);
  },
  startService: () => beginShift(selectedShift),
  restartShift: () => beginShift(selectedShift),
  nextShift: () => beginShift(orders.shiftIndex < SHIFTS.length - 1 ? orders.shiftIndex + 1 : 0),
  startEndless: () => beginShift(SHIFTS.length - 1),
  goToTitle: () => {
    guideOpen = false;
    loop.setScreen(SCREEN_TITLE);
    announce('Returned to Yuzu and Hinoki menu.');
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
  toggleMute: () => audio.setMuted(!audio.isMuted()),
  toggleGuide: (force) => {
    guideOpen = force === undefined ? !guideOpen : Boolean(force);
  },
  commandStation: (stationId) => {
    const res = commandChefToStation(chef, activeLayout, walkGrid, stationId);
    if (res === 'immediate') {
      const st = activeLayout.stations.find((s) => s.id === stationId);
      if (st) interactAt(st);
    }
  },
  interactFocused: () => {
    if (!chef.focusedStationId) return;
    const st = activeLayout.stations.find((s) => s.id === chef.focusedStationId);
    if (st) interactAt(st);
  },
  dashChef: () => {
    if (triggerChefDash(chef)) audio.playDash();
  },
});

document.addEventListener('visibilitychange', () => {
  if (document.hidden && loop.getScreen() === SCREEN_PLAYING) {
    loop.setScreen(SCREEN_PAUSED);
  }
});

announce('Yuzu and Hinoki ready. Select a shift and press Space or click Open Kitchen.');
loop.start();
