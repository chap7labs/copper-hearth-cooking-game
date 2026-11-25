// Order ticket queue, patience timers, combo scoring, tips, and shift summary evaluation.

import { RECIPE_MAP, SHIFTS } from '../config/recipes.js';
import { stationRect } from '../config/kitchenLayouts.js';
import { emitBurst, spawnPopup } from './kitchenState.js';

export function createSeededRandom(seed) {
  let state = (seed >>> 0) || 1;
  return function next() {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function createOrderManager(seed = 42) {
  return {
    seed,
    rng: createSeededRandom(seed),
    shiftIndex: 0,
    shiftTimeLeft: SHIFTS[0].durationSec,
    shiftDuration: SHIFTS[0].durationSec,
    spawnCooldown: 0,
    nextTicketNumber: 101,
    tickets: [],
    score: 0,
    tipsEarned: 0,
    dishesServed: 0,
    perfectDishes: 0,
    missedTickets: 0,
    combo: 0,
    bestCombo: 0,
    lastRemovedId: null,
    shiftComplete: false,
    starsEarned: 0,
    bestScore: 0,
  };
}

export function startShift(orders, shiftIndex) {
  const shift = SHIFTS[shiftIndex] ?? SHIFTS[0];
  orders.rng = createSeededRandom(orders.seed + shiftIndex * 97);
  orders.shiftIndex = shiftIndex;
  orders.shiftDuration = shift.durationSec;
  orders.shiftTimeLeft = shift.durationSec;
  orders.spawnCooldown = 3.2;
  orders.nextTicketNumber = 101 + shiftIndex * 20;
  orders.tickets = [];
  orders.score = 0;
  orders.tipsEarned = 0;
  orders.dishesServed = 0;
  orders.perfectDishes = 0;
  orders.missedTickets = 0;
  orders.combo = 0;
  orders.bestCombo = 0;
  orders.lastRemovedId = null;
  orders.shiftComplete = false;
  orders.starsEarned = 0;

  spawnTicket(orders, shift.recipeIds[0], 1.0);
  spawnTicket(orders, shift.recipeIds[1], 0.93);
  spawnTicket(orders, shift.recipeIds[2], 0.86);
}

function pickRecipeId(orders) {
  const shift = SHIFTS[orders.shiftIndex] ?? SHIFTS[0];
  const pool = shift.recipeIds;
  const activeIds = new Set(orders.tickets.map((t) => t.recipeId));
  const fresh = pool.filter((id) => !activeIds.has(id));
  if (fresh.length > 0) {
    const distinct = fresh.filter((id) => id !== orders.lastRemovedId);
    const list = distinct.length > 0 ? distinct : fresh;
    return list[0];
  }
  return pool[Math.floor(orders.rng() * pool.length)];
}

export function spawnTicket(orders, forcedRecipeId = null, initialRatio = 1) {
  const shift = SHIFTS[orders.shiftIndex] ?? SHIFTS[0];
  if (orders.tickets.length >= shift.maxTickets) return null;
  const recipeId = forcedRecipeId ?? pickRecipeId(orders);
  const recipe = RECIPE_MAP[recipeId];
  const speedScale = Math.max(0.78, 1 - orders.shiftIndex * 0.05);
  const maxPatience = Math.round(recipe.patienceSec * speedScale);
  const ticket = {
    id: orders.nextTicketNumber,
    ticketNumber: `#${orders.nextTicketNumber}`,
    recipeId,
    patience: maxPatience * initialRatio,
    maxPatience,
    spawnAnim: 1,
  };
  orders.nextTicketNumber += 1;
  orders.tickets.push(ticket);
  return ticket;
}

function finalizeShift(orders, onEvent) {
  const shift = SHIFTS[orders.shiftIndex] ?? SHIFTS[0];
  orders.shiftComplete = true;
  let stars = 0;
  for (let i = 0; i < shift.starThresholds.length; i += 1) {
    if (orders.score >= shift.starThresholds[i]) stars += 1;
  }
  orders.starsEarned = stars;
  orders.bestScore = Math.max(orders.bestScore, orders.score);
  onEvent?.('shift_complete', { score: orders.score, stars });
}

export function updateOrders(orders, dt, onEvent) {
  if (orders.shiftComplete) return;
  const shift = SHIFTS[orders.shiftIndex] ?? SHIFTS[0];

  if (!shift.endless) {
    orders.shiftTimeLeft = Math.max(0, orders.shiftTimeLeft - dt);
  }

  for (let i = orders.tickets.length - 1; i >= 0; i -= 1) {
    const t = orders.tickets[i];
    if (t.spawnAnim > 0) t.spawnAnim = Math.max(0, t.spawnAnim - dt * 4);
    t.patience -= dt;
    if (t.patience <= 0) {
      orders.tickets.splice(i, 1);
      orders.lastRemovedId = t.recipeId;
      orders.missedTickets += 1;
      orders.combo = 0;
      onEvent?.('ticket_expired', { ticketNumber: t.ticketNumber });
    }
  }

  orders.spawnCooldown -= dt;
  const dynamicInterval = shift.endless
    ? Math.max(4.8, shift.spawnInterval - orders.dishesServed * 0.1)
    : shift.spawnInterval;

  if (orders.tickets.length < 3 || (orders.spawnCooldown <= 0 && orders.tickets.length < shift.maxTickets)) {
    const spawned = spawnTicket(orders);
    if (spawned) onEvent?.('new_ticket', { ticket: spawned });
    orders.spawnCooldown = dynamicInterval;
  }

  if (shift.endless && orders.missedTickets >= 3) {
    finalizeShift(orders, onEvent);
  } else if (!shift.endless && orders.shiftTimeLeft <= 0) {
    finalizeShift(orders, onEvent);
  }
}

export function getComboMultiplier(combo) {
  if (combo >= 5) return 1.75;
  if (combo === 4) return 1.5;
  if (combo === 3) return 1.35;
  if (combo === 2) return 1.2;
  if (combo === 1) return 1.1;
  return 1.0;
}

export function servePlateFromPass(orders, kitchen, layout, passStationId, onEvent) {
  const pass = kitchen.passStations[passStationId];
  if (!pass || pass.plates.length === 0) {
    kitchen.banner = { text: 'No finished plate on this Serving Pass!', color: '#f5b064', timer: 1.4 };
    onEvent?.('error');
    return false;
  }

  let bestTicketIdx = -1;
  let bestPlateIdx = -1;

  for (let pIdx = 0; pIdx < pass.plates.length; pIdx += 1) {
    const plate = pass.plates[pIdx];
    const tIdx = orders.tickets.findIndex((t) => t.recipeId === plate.recipeId);
    if (tIdx !== -1 && (bestTicketIdx === -1 || tIdx < bestTicketIdx)) {
      bestTicketIdx = tIdx;
      bestPlateIdx = pIdx;
    }
  }

  const passSt = layout.stations.find((s) => s.id === passStationId);
  const passRect = passSt ? stationRect(passSt) : { cx: 1116, y: 168, h: 84 };
  const popX = Math.max(106, Math.min(1174, passRect.cx));
  const popY = Math.min(556, passRect.y + passRect.h + 24);

  if (bestTicketIdx === -1) {
    pass.plates.shift();
    pass.bellAnim = 1;
    orders.combo = 0;
    spawnPopup(kitchen, 'WRONG ORDER', 'Combo Reset', popX, popY, '#ef706b');
    onEvent?.('error');
    return false;
  }

  const [plate] = pass.plates.splice(bestPlateIdx, 1);
  const [ticket] = orders.tickets.splice(bestTicketIdx, 1);
  orders.lastRemovedId = ticket.recipeId;
  const recipe = RECIPE_MAP[plate.recipeId];

  orders.combo += 1;
  orders.bestCombo = Math.max(orders.bestCombo, orders.combo);
  orders.dishesServed += 1;
  if (plate.perfectCount > 0) orders.perfectDishes += 1;

  const patienceRatio = ticket.patience / ticket.maxPatience;
  const speedTip = patienceRatio > 0.6 ? 6 : patienceRatio > 0.35 ? 3 : 0;
  const perfectBonus = plate.perfectCount * 6;
  const mult = getComboMultiplier(orders.combo - 1);
  const earned = Math.round((recipe.basePrice + speedTip + perfectBonus) * mult);
  const tipPart = Math.max(0, earned - recipe.basePrice);

  orders.score += earned;
  orders.tipsEarned += tipPart;
  pass.bellAnim = 1;

  const sub = plate.perfectCount > 0 ? `PERFECT! x${orders.combo}` : orders.combo > 1 ? `COMBO x${orders.combo}` : 'SERVED!';
  spawnPopup(
    kitchen,
    `+$${earned}`,
    sub,
    popX,
    popY,
    plate.perfectCount > 0 ? '#ffe67a' : '#8ef0a2',
  );

  const st = layout.stations.find((s) => s.id === passStationId);
  if (st) {
    const rect = stationRect(st);
    emitBurst(kitchen, 'sparkle', rect.cx, rect.cy, orders.combo >= 3 ? 16 : 10, '#ffe478');
  }

  onEvent?.('serve_success', { recipeId: recipe.id, earned, combo: orders.combo, perfect: plate.perfectCount > 0 });
  return true;
}
