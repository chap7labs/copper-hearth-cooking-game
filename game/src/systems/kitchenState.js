// Kitchen stations state machine: pantry pickup, oak chopping board, dual copper skillets,
// layered assembly board, warm serving pass, particles, and floating score popups.

import {
  INGREDIENT_MAP,
  LAYOUT,
  RECIPE_MAP,
  canAcceptOnAssembly,
  findCandidateRecipes,
  matchCompleteRecipe,
} from '../config/recipes.js';

const MAX_PARTICLES = 160;

export function createKitchenState() {
  return {
    heldItem: null,
    skillets: [createEmptySkillet(0), createEmptySkillet(1)],
    choppingBoard: {
      item: null,
      hitsDone: 0,
      hitsNeeded: 3,
      knifeAnim: 0,
    },
    assembly: {
      items: [],
      candidateIds: [],
      completeRecipeId: null,
      completeTimer: 0,
      plateAnim: 0,
    },
    servingPass: {
      plates: [],
      bellAnim: 0,
    },
    particles: [],
    popups: [],
    banner: { text: '', color: '#f5c469', timer: 0 },
  };
}

function createEmptySkillet(id) {
  return {
    id,
    item: null,
    elapsed: 0,
    heatZone: 'idle',
    sizzleTimer: 0,
    perfectAnnounced: false,
  };
}

export function resetKitchenState(state) {
  const fresh = createKitchenState();
  Object.assign(state, fresh);
}

function showBanner(state, text, color = '#f5c469', duration = 1.6) {
  state.banner.text = text;
  state.banner.color = color;
  state.banner.timer = duration;
}

export function spawnPopup(state, text, subtext, x, y, color = '#ffe08a') {
  state.popups.push({
    text,
    subtext,
    x,
    y,
    color,
    life: 1.55,
    maxLife: 1.55,
  });
}

function addParticle(state, p) {
  if (state.particles.length >= MAX_PARTICLES) state.particles.shift();
  state.particles.push(p);
}

export function emitBurst(state, kind, x, y, count, color) {
  for (let i = 0; i < count; i += 1) {
    const angle = (Math.PI * 2 * i) / count + (i % 2) * 0.25;
    const speed = kind === 'sparkle' ? 54 + (i % 4) * 20 : kind === 'spark' ? 46 + (i % 3) * 22 : 28 + (i % 3) * 16;
    addParticle(state, {
      kind,
      x: x + Math.cos(angle) * 10,
      y: y + Math.sin(angle) * 7,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - (kind === 'steam' ? 28 : kind === 'spark' ? 32 : 16),
      size: kind === 'sparkle' ? 4.8 : kind === 'spark' ? 2.6 : 3.4,
      color,
      phase: i * 1.1,
      life: kind === 'sparkle' ? 0.85 : kind === 'spark' ? 0.45 : 0.54,
      maxLife: kind === 'sparkle' ? 0.85 : kind === 'spark' ? 0.45 : 0.54,
    });
  }
}

export function pickIngredient(state, ingredientId, onEvent) {
  const spec = INGREDIENT_MAP[ingredientId];
  if (!spec) return false;
  state.heldItem = {
    ingredientId,
    state: 'raw',
    quality: 1,
  };
  showBanner(state, `Holding ${spec.name}`, '#f7d694', 1.2);
  onEvent?.('pick', { ingredientId });
  return true;
}

export function interactChoppingBoard(state, onEvent) {
  const board = state.choppingBoard;

  // Chopping an item already on the board takes priority
  if (board.item && board.item.state === 'raw') {
    board.hitsDone += 1;
    board.knifeAnim = 1;
    emitBurst(state, 'chop', LAYOUT.choppingBoard.cx, LAYOUT.choppingBoard.cy + 8, 6, INGREDIENT_MAP[board.item.ingredientId].accent);
    if (board.hitsDone >= board.hitsNeeded) {
      board.item.state = 'chopped';
      showBanner(state, `${INGREDIENT_MAP[board.item.ingredientId].shortLabel} chopped! Press [A] to plate`, '#8be39a', 1.5);
      onEvent?.('chop_done', { ingredientId: board.item.ingredientId });
    } else {
      onEvent?.('chop', { hitsDone: board.hitsDone });
    }
    return true;
  }

  // Pick up finished chopped item if hands are empty
  if (board.item && board.item.state === 'chopped' && !state.heldItem) {
    state.heldItem = board.item;
    board.item = null;
    board.hitsDone = 0;
    onEvent?.('pick', { ingredientId: state.heldItem.ingredientId });
    return true;
  }

  // Place held choppable item and execute chop 1 immediately for snappy feel
  if (!board.item && state.heldItem && state.heldItem.state === 'raw') {
    const spec = INGREDIENT_MAP[state.heldItem.ingredientId];
    if (spec.prepType !== 'chop') {
      showBanner(state, spec.prepType === 'cook' ? `${spec.shortLabel} goes in a Skillet [Q/E]` : `${spec.shortLabel} plates directly [A]`, '#f5b064', 1.5);
      onEvent?.('error');
      return false;
    }
    board.item = state.heldItem;
    state.heldItem = null;
    board.hitsDone = 1;
    board.hitsNeeded = spec.chopHits ?? 3;
    board.knifeAnim = 1;
    emitBurst(state, 'chop', LAYOUT.choppingBoard.cx, LAYOUT.choppingBoard.cy + 8, 6, spec.accent);
    onEvent?.('chop', { hitsDone: 1 });
    return true;
  }

  onEvent?.('error');
  return false;
}

export function interactSkillet(state, index, onEvent) {
  const skillet = state.skillets[index];
  if (!skillet) return false;

  // Retrieve cooked / perfect / burnt item when hands are empty
  if (skillet.item && !state.heldItem) {
    if (skillet.item.state === 'raw') {
      showBanner(state, 'Still searing - wait for golden zone!', '#f5b064', 1.2);
      onEvent?.('error');
      return false;
    }
    const pulled = skillet.item;
    skillet.item = null;
    skillet.elapsed = 0;
    skillet.heatZone = 'idle';
    skillet.perfectAnnounced = false;
    state.heldItem = pulled;
    const label = pulled.state === 'perfect' ? 'PERFECT sear!' : pulled.state === 'burnt' ? 'Burnt! Trash with [X]' : 'Seared!';
    showBanner(state, `${INGREDIENT_MAP[pulled.ingredientId].shortLabel}: ${label}`, pulled.state === 'burnt' ? '#ef706b' : '#8be39a', 1.4);
    onEvent?.('pick', { ingredientId: pulled.ingredientId });
    return true;
  }

  // Place raw cookable ingredient into empty skillet
  if (!skillet.item && state.heldItem && state.heldItem.state === 'raw') {
    const spec = INGREDIENT_MAP[state.heldItem.ingredientId];
    if (spec.prepType !== 'cook') {
      showBanner(state, spec.prepType === 'chop' ? `${spec.shortLabel} needs Chopping Board [C]` : `${spec.shortLabel} plates directly [A]`, '#f5b064', 1.5);
      onEvent?.('error');
      return false;
    }
    skillet.item = state.heldItem;
    state.heldItem = null;
    skillet.elapsed = 0;
    skillet.heatZone = 'searing';
    skillet.sizzleTimer = 0;
    skillet.perfectAnnounced = false;
    const box = LAYOUT.skillets[index];
    emitBurst(state, 'sizzle', box.cx, box.cy, 7, '#ffd27a');
    onEvent?.('sizzle_start', { index, ingredientId: skillet.item.ingredientId });
    return true;
  }

  onEvent?.('error');
  return false;
}

function pullBestReadyItem(state) {
  // Prefer perfect skillet items, then cooked skillet items, then chopped board item
  let bestSkilletIdx = -1;
  let bestScore = -1;
  for (let i = 0; i < state.skillets.length; i += 1) {
    const sk = state.skillets[i];
    if (!sk.item) continue;
    if (sk.item.state !== 'perfect' && sk.item.state !== 'cooked') continue;
    if (!canAcceptOnAssembly(state.assembly.items, sk.item)) continue;
    const rank = sk.item.state === 'perfect' ? 3 : 2;
    if (rank > bestScore) {
      bestScore = rank;
      bestSkilletIdx = i;
    }
  }
  if (bestSkilletIdx !== -1) {
    const sk = state.skillets[bestSkilletIdx];
    const item = sk.item;
    sk.item = null;
    sk.elapsed = 0;
    sk.heatZone = 'idle';
    sk.perfectAnnounced = false;
    return item;
  }

  const board = state.choppingBoard;
  if (board.item && board.item.state === 'chopped' && canAcceptOnAssembly(state.assembly.items, board.item)) {
    const item = board.item;
    board.item = null;
    board.hitsDone = 0;
    return item;
  }

  return null;
}

export function interactAssembly(state, onEvent) {
  const asm = state.assembly;

  // If dish is complete and waiting on assembly, move to pass
  if (asm.completeRecipeId) {
    return transferCompletePlateToPass(state, onEvent);
  }

  let itemToPlate = state.heldItem;
  let fromHand = true;

  if (!itemToPlate) {
    itemToPlate = pullBestReadyItem(state);
    fromHand = false;
    if (!itemToPlate) {
      showBanner(state, 'Pick an ingredient [1-8] or finish prep first', '#f5b064', 1.4);
      onEvent?.('error');
      return false;
    }
  }

  if (!canAcceptOnAssembly(asm.items, itemToPlate)) {
    if (!fromHand) return false;
    const spec = INGREDIENT_MAP[itemToPlate.ingredientId];
    if (itemToPlate.state === 'burnt') {
      showBanner(state, 'Burnt food cannot be plated - Trash [X]', '#ef706b', 1.6);
    } else if (spec.prepType === 'cook' && itemToPlate.state === 'raw') {
      showBanner(state, `Sear ${spec.shortLabel} in Skillet [Q/E] first`, '#f5b064', 1.5);
    } else if (spec.prepType === 'chop' && itemToPlate.state === 'raw') {
      showBanner(state, `Chop ${spec.shortLabel} on Oak Board [C] first`, '#f5b064', 1.5);
    } else {
      showBanner(state, 'That does not match the current dish on the plate', '#ef706b', 1.5);
    }
    onEvent?.('error');
    return false;
  }

  if (fromHand) state.heldItem = null;
  asm.items.push(itemToPlate);
  asm.plateAnim = 1;
  asm.candidateIds = findCandidateRecipes(asm.items).map((r) => r.id);
  emitBurst(state, 'sparkle', LAYOUT.assemblyBoard.cx, LAYOUT.assemblyBoard.cy, 6, '#ffe69a');

  const complete = matchCompleteRecipe(asm.items);
  if (complete) {
    asm.completeRecipeId = complete.id;
    asm.completeTimer = 0.24;
    showBanner(state, `${complete.name} plated! Sending to pass...`, '#8be39a', 1.3);
    onEvent?.('plate_complete', { recipeId: complete.id });
  } else {
    onEvent?.('plate', { count: asm.items.length });
  }
  return true;
}

export function transferCompletePlateToPass(state, onEvent) {
  const asm = state.assembly;
  if (!asm.completeRecipeId) return false;
  if (state.servingPass.plates.length >= 2) {
    showBanner(state, 'Serving Pass full (2/2)! Ring bell [Space] to serve', '#f5b064', 1.6);
    onEvent?.('error');
    return false;
  }

  const perfectCount = asm.items.filter((it) => it.state === 'perfect').length;
  const recipeId = asm.completeRecipeId;
  state.servingPass.plates.push({
    recipeId,
    perfectCount,
    shimmerPhase: 0,
  });
  asm.items = [];
  asm.candidateIds = [];
  asm.completeRecipeId = null;
  asm.completeTimer = 0;
  asm.plateAnim = 0;

  emitBurst(state, 'sparkle', LAYOUT.servingPass.cx, LAYOUT.servingPass.cy, 10, '#ffe89c');
  showBanner(state, `${RECIPE_MAP[recipeId].shortName} READY TO SERVE! Press [Space]`, '#8be39a', 1.8);
  onEvent?.('ready_to_serve', { recipeId });
  return true;
}

export function discardAction(state, onEvent) {
  if (state.heldItem) {
    state.heldItem = null;
    showBanner(state, 'Discarded held item', '#d7a28c', 1.1);
    onEvent?.('trash');
    return true;
  }
  for (let i = 0; i < state.skillets.length; i += 1) {
    if (state.skillets[i].item?.state === 'burnt') {
      state.skillets[i].item = null;
      state.skillets[i].elapsed = 0;
      state.skillets[i].heatZone = 'idle';
      state.skillets[i].perfectAnnounced = false;
      showBanner(state, 'Cleared burnt skillet', '#d7a28c', 1.1);
      onEvent?.('trash');
      return true;
    }
  }
  if (state.assembly.items.length > 0) {
    state.assembly.items = [];
    state.assembly.candidateIds = [];
    state.assembly.completeRecipeId = null;
    state.assembly.completeTimer = 0;
    showBanner(state, 'Cleared assembly plate', '#d7a28c', 1.1);
    onEvent?.('trash');
    return true;
  }
  if (state.choppingBoard.item) {
    state.choppingBoard.item = null;
    state.choppingBoard.hitsDone = 0;
    showBanner(state, 'Cleared chopping board', '#d7a28c', 1.1);
    onEvent?.('trash');
    return true;
  }
  return false;
}

export function updateKitchenState(state, dt, onEvent) {
  if (state.banner.timer > 0) {
    state.banner.timer = Math.max(0, state.banner.timer - dt);
  }
  if (state.choppingBoard.knifeAnim > 0) {
    state.choppingBoard.knifeAnim = Math.max(0, state.choppingBoard.knifeAnim - dt * 5.2);
  }
  if (state.assembly.plateAnim > 0) {
    state.assembly.plateAnim = Math.max(0, state.assembly.plateAnim - dt * 4.0);
  }
  if (state.servingPass.bellAnim > 0) {
    state.servingPass.bellAnim = Math.max(0, state.servingPass.bellAnim - dt * 3.5);
  }

  // Smooth auto-transfer of completed dish onto Serving Pass
  if (state.assembly.completeRecipeId && state.assembly.completeTimer > 0) {
    state.assembly.completeTimer -= dt;
    if (state.assembly.completeTimer <= 0 && state.servingPass.plates.length < 2) {
      transferCompletePlateToPass(state, onEvent);
    }
  }

  // Skillet cooking progression + heat sweet spot
  for (let i = 0; i < state.skillets.length; i += 1) {
    const sk = state.skillets[i];
    if (!sk.item) continue;
    const spec = INGREDIENT_MAP[sk.item.ingredientId];
    sk.elapsed += dt;
    sk.sizzleTimer += dt;

    if (sk.elapsed >= spec.burnTime) {
      if (sk.heatZone !== 'burnt') {
        sk.heatZone = 'burnt';
        sk.item.state = 'burnt';
        showBanner(state, `Skillet ${i === 0 ? 'Q' : 'E'} burned! Clear with [Q/E] + [X]`, '#ef706b', 1.8);
        onEvent?.('burnt', { index: i });
      }
    } else if (sk.elapsed >= spec.perfectEnd) {
      sk.heatZone = 'warning';
      sk.item.state = 'cooked';
    } else if (sk.elapsed >= spec.perfectStart) {
      sk.heatZone = 'perfect';
      sk.item.state = 'perfect';
      if (!sk.perfectAnnounced) {
        sk.perfectAnnounced = true;
        onEvent?.('perfect_ready', { index: i });
      }
    } else if (sk.elapsed >= spec.cookDuration * 0.55) {
      sk.heatZone = 'searing';
      sk.item.state = 'cooked';
    } else {
      sk.heatZone = 'searing';
      sk.item.state = 'raw';
    }

    if (sk.sizzleTimer >= 0.11) {
      sk.sizzleTimer = 0;
      const box = LAYOUT.skillets[i];
      if (sk.heatZone === 'burnt') {
        addParticle(state, {
          kind: 'smoke',
          x: box.cx + (Math.sin(sk.elapsed * 9 + i) * 18),
          y: box.cy - 10,
          vx: Math.sin(sk.elapsed * 4) * 12,
          vy: -38,
          size: 8.5,
          color: '#5a524c',
          phase: sk.elapsed * 3,
          life: 0.78,
          maxLife: 0.78,
        });
      } else {
        addParticle(state, {
          kind: 'steam',
          x: box.cx + (Math.sin(sk.elapsed * 11 + i) * 20),
          y: box.cy - 14,
          vx: Math.cos(sk.elapsed * 5) * 9,
          vy: -36,
          size: sk.heatZone === 'perfect' ? 7 : 5.5,
          color: sk.heatZone === 'perfect' ? '#fff0bd' : '#f7efe3',
          phase: sk.elapsed * 4 + i,
          life: 0.72,
          maxLife: 0.72,
        });
        if (sk.heatZone === 'perfect' || sk.heatZone === 'searing') {
          const ang = (sk.elapsed * 17 + i * 2.1) % (Math.PI * 2);
          addParticle(state, {
            kind: 'spark',
            x: box.cx + Math.cos(ang) * 26,
            y: box.cy + Math.sin(ang) * 18,
            vx: Math.cos(ang) * 44,
            vy: -42 + Math.sin(ang) * 18,
            size: sk.heatZone === 'perfect' ? 2.8 : 2.1,
            color: sk.heatZone === 'perfect' ? '#ffe066' : '#ff9d42',
            phase: ang,
            life: 0.36,
            maxLife: 0.36,
          });
        }
      }
    }
  }

  // Subtle ambient heat-lamp shimmer & steam on ready plates
  for (let i = 0; i < state.servingPass.plates.length; i += 1) {
    const plate = state.servingPass.plates[i];
    plate.shimmerPhase += dt * 3.2;
    if (Math.floor((plate.shimmerPhase - dt * 3.2) * 2) !== Math.floor(plate.shimmerPhase * 2)) {
      addParticle(state, {
        kind: 'steam',
        x: LAYOUT.servingPass.cx + Math.sin(plate.shimmerPhase * 1.7 + i) * 26,
        y: LAYOUT.servingPass.cy - 22,
        vx: 4,
        vy: -24,
        size: 5.5,
        color: '#fff6de',
        life: 0.8,
        maxLife: 0.8,
      });
    }
  }

  // Step particles
  for (let i = state.particles.length - 1; i >= 0; i -= 1) {
    const p = state.particles[i];
    p.life -= dt;
    if (p.life <= 0) {
      state.particles.splice(i, 1);
      continue;
    }
    if (p.kind === 'spark') p.vy += 150 * dt;
    if (p.kind === 'steam') p.x += Math.sin((p.phase ?? 0) + p.life * 8) * 18 * dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
  }

  // Step popups (gentle vertical glide in safe backsplash gap)
  for (let i = state.popups.length - 1; i >= 0; i -= 1) {
    const pop = state.popups[i];
    pop.life -= dt;
    if (pop.life <= 0) {
      state.popups.splice(i, 1);
      continue;
    }
    pop.y -= 9 * dt;
  }
}
