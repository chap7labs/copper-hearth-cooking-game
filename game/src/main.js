// Entry module for Yuzu & Hinoki: depth-first wiring of recipes, spatial layouts,
// game loop, scene manager, texture atlas, top-down/3/4 chef controller, stations, orders,
// input, sprites, world/HUD renderers, and Web Audio.

import { CANVAS_HEIGHT, CANVAS_WIDTH, FIXED_STEP, SHIFTS } from './config/recipes.js';
import { buildWalkGrid, getLayout } from './config/kitchenLayouts.js';
import {
  SCREEN_PAUSED,
  SCREEN_PLAYING,
  SCREEN_SUMMARY,
  SCREEN_TITLE,
  createGameLoop,
} from './engine/gameLoop.js';
import { createSceneManager } from './engine/sceneManager.js';
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
import { createTextureAtlas } from './art/textures.js';
import { createWorldRenderer } from './art/worldRenderer.js';
import { createHudRenderer } from './art/hudRenderer.js';
import { createSoundEngine } from './audio/soundEngine.js';

const params = new URLSearchParams(window.location.search);
const seedParam = Number.parseInt(params.get('seed') ?? '', 10);
const seed = Number.isInteger(seedParam) ? seedParam : 20261125;

const canvas = document.getElementById('kitchen-canvas');
const ctx = canvas.getContext('2d');
const statusEl = document.getElementById('status');

let selectedShift = 0;
let activeLayout = getLayout(SHIFTS[0].layoutId);
let walkGrid = buildWalkGrid(activeLayout);

const chef = createChef(activeLayout);
const kitchen = createKitchenState(activeLayout);
const orders = createOrderManager(seed);
const textures = createTextureAtlas(ctx);
const worldRenderer = createWorldRenderer(ctx, textures);
const hudRenderer = createHudRenderer(ctx, textures);
const audio = createSoundEngine();

function announce(text) {
  if (statusEl) statusEl.textContent = text;
}

function handleGameEvent(type, payload = {}) {
  if (type === 'pick') {
    audio.playPick();
    announce(`Picked ${payload.ingredientId}.`);
  } else if (type === 'chop' || type === 'chop_done') {
    audio.playChop();
    sceneManager.triggerShake(1.6, 0.1);
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
    sceneManager.triggerShake(2.4, 0.14);
    announce(`Served ${payload.recipeId}. Earnings $${orders.score}. Combo x${orders.combo}.`);
  } else if (type === 'new_ticket') audio.playNewTicket();
  else if (type === 'trash') {
    audio.playTrash();
    announce('Discarded item.');
  } else if (type === 'ticket_expired') {
    audio.playError();
    announce(`Ticket ${payload.ticketNumber ?? ''} expired.`);
  } else if (type === 'burnt' || type === 'error') {
    audio.playError();
    if (type === 'burnt') sceneManager.triggerShake(3.2, 0.2);
    if (kitchen.banner?.text) announce(`Notice: ${kitchen.banner.text}`);
  } else if (type === 'shift_complete') {
    audio.playShiftComplete();
    sceneManager.setScreen(SCREEN_SUMMARY);
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
  sceneManager.setScreen(SCREEN_PLAYING);
  announce(`Started ${shift.name}.`);
}

const loop = createGameLoop({
  step: FIXED_STEP,
  onUpdate(dt) {
    sceneManager.update(dt);
    if (sceneManager.isGuideOpen()) return;
    updateChef(chef, dt, activeLayout, walkGrid, input.getMoveDir(), (st) => interactAt(st));
    updateKitchenState(kitchen, dt, activeLayout, handleGameEvent);
    updateOrders(orders, dt, handleGameEvent);
  },
  onRender(screen, clock) {
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    const frameState = {
      kitchen,
      orders,
      chef,
      layout: activeLayout,
      screen,
      selectedShift,
      audioMuted: audio.isMuted(),
      guideOpen: sceneManager.isGuideOpen(),
      pointer: input.getPointer(),
      clock,
      sceneManager,
    };
    worldRenderer.renderWorld(frameState);
    hudRenderer.renderHud(frameState);
  },
});

const sceneManager = createSceneManager(loop);

const input = createInputController(canvas, {
  getScreen: () => sceneManager.getScreen(),
  getLayout: () => activeLayout,
  isGuideOpen: () => sceneManager.isGuideOpen(),
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
    sceneManager.setScreen(SCREEN_TITLE);
    announce('Returned to Yuzu and Hinoki menu.');
  },
  togglePause: () => {
    const cur = sceneManager.getScreen();
    if (cur === SCREEN_PLAYING) {
      sceneManager.setScreen(SCREEN_PAUSED);
      announce('Game paused.');
    } else if (cur === SCREEN_PAUSED) {
      sceneManager.setScreen(SCREEN_PLAYING);
      announce('Game resumed.');
    }
  },
  toggleMute: () => audio.setMuted(!audio.isMuted()),
  toggleGuide: (force) => sceneManager.toggleGuide(force),
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
    if (triggerChefDash(chef)) {
      audio.playDash();
      sceneManager.triggerShake(1.4, 0.1);
    }
  },
});

document.addEventListener('visibilitychange', () => {
  if (document.hidden && sceneManager.getScreen() === SCREEN_PLAYING) {
    sceneManager.setScreen(SCREEN_PAUSED);
  }
});

announce('Yuzu and Hinoki ready. Select a shift and press Space or click Open Kitchen.');
loop.start();
