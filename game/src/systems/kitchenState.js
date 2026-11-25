// Spatial kitchen state machine: dynamic stations per layout, 4 cooking station types,
// layered plating islands, dual/single warm serving passes, particles, and safe-zone popups.

import {
  INGREDIENT_MAP,
  RECIPE_MAP,
  canAcceptOnAssembly,
  findCandidateRecipes,
  matchCompleteRecipe,
} from '../config/recipes.js';
import { stationRect } from '../config/kitchenLayouts.js';

const MAX_PARTICLES = 180;

function cookedStateFor(cookType) {
  if (cookType === 'grill') return 'grilled';
  if (cookType === 'fryer') return 'fried';
  return 'boiled';
}

export function createKitchenState(layout) {
  const cookStations = {};
  const chopStations = {};
  const plateStations = {};
  const passStations = {};

  for (const st of layout.stations) {
    if (st.kind === 'cook') {
      cookStations[st.id] = {
        id: st.id,
        cookType: st.cookType,
        item: null,
        elapsed: 0,
        heatZone: 'idle',
        sizzleTimer: 0,
        perfectAnnounced: false,
      };
    } else if (st.kind === 'chop') {
      chopStations[st.id] = {
        id: st.id,
        item: null,
        hitsDone: 0,
        hitsNeeded: 3,
        knifeAnim: 0,
      };
    } else if (st.kind === 'plate') {
      plateStations[st.id] = {
        id: st.id,
        items: [],
        candidateIds: [],
        plateAnim: 0,
      };
    } else if (st.kind === 'pass') {
      passStations[st.id] = {
        id: st.id,
        plates: [],
        bellAnim: 0,
      };
    }
  }

  return {
    layoutId: layout.id,
    heldItem: null,
    cookStations,
    chopStations,
    plateStations,
    passStations,
    particles: [],
    popups: [],
    banner: { text: '', color: '#ffe5a3', timer: 0 },
  };
}

export function resetKitchenState(state, layout) {
  Object.assign(state, createKitchenState(layout));
}

export function showBanner(state, text, color = '#ffe5a3', duration = 1.6) {
  state.banner.text = text;
  state.banner.color = color;
  state.banner.timer = duration;
}

export function spawnPopup(state, text, subtext, x, y, color = '#ffe07d') {
  state.popups.push({
    text,
    subtext,
    x,
    y,
    color,
    life: 2.1,
    maxLife: 2.1,
  });
}

function addParticle(state, p) {
  if (state.particles.length >= MAX_PARTICLES) state.particles.shift();
  state.particles.push(p);
}

export function emitBurst(state, kind, x, y, count, color) {
  for (let i = 0; i < count; i += 1) {
    const angle = (Math.PI * 2 * i) / count + (i % 2) * 0.25;
    const speed = kind === 'sparkle' ? 56 + (i % 4) * 18 : kind === 'spark' ? 44 + (i % 3) * 20 : 28 + (i % 3) * 16;
    addParticle(state, {
      kind,
      x: x + Math.cos(angle) * 9,
      y: y + Math.sin(angle) * 7,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - (kind === 'steam' ? 28 : kind === 'spark' ? 30 : 16),
      size: kind === 'sparkle' ? 4.6 : kind === 'spark' ? 2.8 : 3.4,
      color,
      phase: i * 1.1,
      life: kind === 'sparkle' ? 0.85 : kind === 'spark' ? 0.45 : 0.55,
      maxLife: kind === 'sparkle' ? 0.85 : kind === 'spark' ? 0.45 : 0.55,
    });
  }
}

export function interactWithStation(state, chef, orders, station, serveCallback, onEvent) {
  if (!station || station.kind === 'counter') return false;
  const rect = stationRect(station);
  chef.interactAnim = 1;

  if (station.kind === 'pantry') {
    if (state.heldItem?.kind === 'dish') {
      showBanner(state, 'Deliver your completed dish to the Warm Pass!', '#f6be62', 1.5);
      onEvent?.('error');
      return false;
    }
    const spec = INGREDIENT_MAP[station.ingredientId];
    state.heldItem = {
      kind: 'ingredient',
      ingredientId: station.ingredientId,
      state: 'raw',
      isPerfect: false,
    };
    showBanner(state, `Picked up ${spec.name}`, '#f7e5b0', 1.2);
    onEvent?.('pick', { ingredientId: station.ingredientId });
    return true;
  }

  if (station.kind === 'trash') {
    if (state.heldItem) {
      state.heldItem = null;
      showBanner(state, 'Discarded held item', '#f2a499', 1.2);
      onEvent?.('trash');
      return true;
    }
    return false;
  }

  if (station.kind === 'chop') {
    const board = state.chopStations[station.id];
    if (!board) return false;

    if (board.item && board.item.state === 'raw') {
      board.hitsDone += 1;
      board.knifeAnim = 1;
      emitBurst(state, 'chop', rect.cx, rect.cy, 6, INGREDIENT_MAP[board.item.ingredientId].accent);
      if (board.hitsDone >= board.hitsNeeded) {
        board.item.state = 'chopped';
        showBanner(state, `${INGREDIENT_MAP[board.item.ingredientId].shortLabel} finely chopped!`, '#8ef0a2', 1.4);
        onEvent?.('chop_done', { ingredientId: board.item.ingredientId });
      } else {
        onEvent?.('chop', { hitsDone: board.hitsDone });
      }
      return true;
    }

    if (board.item && board.item.state === 'chopped' && !state.heldItem) {
      state.heldItem = board.item;
      board.item = null;
      board.hitsDone = 0;
      onEvent?.('pick', { ingredientId: state.heldItem.ingredientId });
      return true;
    }

    if (!board.item && state.heldItem?.kind === 'ingredient' && state.heldItem.state === 'raw') {
      const spec = INGREDIENT_MAP[state.heldItem.ingredientId];
      if (spec.prepType !== 'chop') {
        showBanner(state, `${spec.shortLabel} does not go on the Chopping Block`, '#f5b064', 1.4);
        onEvent?.('error');
        return false;
      }
      board.item = state.heldItem;
      state.heldItem = null;
      board.hitsDone = 1;
      board.hitsNeeded = spec.chopHits ?? 3;
      board.knifeAnim = 1;
      emitBurst(state, 'chop', rect.cx, rect.cy, 6, spec.accent);
      onEvent?.('chop', { hitsDone: 1 });
      return true;
    }

    onEvent?.('error');
    return false;
  }

  if (station.kind === 'cook') {
    const sk = state.cookStations[station.id];
    if (!sk) return false;

    // Retrieve finished or burnt item if hands empty
    if (sk.item && !state.heldItem) {
      if (sk.item.state === 'raw') {
        showBanner(state, 'Still cooking - wait for golden zone!', '#f5b064', 1.2);
        onEvent?.('error');
        return false;
      }
      const pulled = sk.item;
      sk.item = null;
      sk.elapsed = 0;
      sk.heatZone = 'idle';
      sk.perfectAnnounced = false;
      state.heldItem = pulled;
      const spec = INGREDIENT_MAP[pulled.ingredientId];
      showBanner(
        state,
        pulled.state === 'burnt' ? `${spec.shortLabel} burnt! Drop in Trash` : `${spec.shortLabel} ${pulled.isPerfect ? 'PERFECT!' : 'ready!'}`,
        pulled.state === 'burnt' ? '#ef706b' : '#8ef0a2',
        1.4,
      );
      onEvent?.('pick', { ingredientId: pulled.ingredientId });
      return true;
    }

    // Place raw ingredient compatible with this cooking station type
    if (!sk.item && state.heldItem?.kind === 'ingredient' && state.heldItem.state === 'raw') {
      const spec = INGREDIENT_MAP[state.heldItem.ingredientId];
      if (!spec.cookStations.includes(sk.cookType)) {
        const rightTarget = spec.prepType === 'chop'
          ? 'Hinoki Chopping Block'
          : spec.cookStations.length > 0
            ? spec.cookStations.join(' / ').toUpperCase()
            : 'Plating Island';
        showBanner(state, `${spec.shortLabel} uses ${rightTarget}`, '#f5b064', 1.5);
        onEvent?.('error');
        return false;
      }
      sk.item = state.heldItem;
      state.heldItem = null;
      sk.elapsed = 0;
      sk.heatZone = 'cooking';
      sk.sizzleTimer = 0;
      sk.perfectAnnounced = false;
      emitBurst(state, 'spark', rect.cx, rect.cy, 7, sk.cookType === 'boiler' ? '#fff2be' : '#ffd27a');
      onEvent?.('cook_start', { cookType: sk.cookType, ingredientId: sk.item.ingredientId });
      return true;
    }

    onEvent?.('error');
    return false;
  }

  if (station.kind === 'plate') {
    const plate = state.plateStations[station.id];
    if (!plate) return false;

    if (!state.heldItem) {
      showBanner(state, 'Carry a prepped ingredient here to plate', '#f5b064', 1.3);
      onEvent?.('error');
      return false;
    }

    if (!canAcceptOnAssembly(plate.items, state.heldItem)) {
      const spec = INGREDIENT_MAP[state.heldItem.ingredientId];
      if (state.heldItem.kind === 'dish') {
        showBanner(state, 'Carry your finished dish to the Warm Pass!', '#8ef0a2', 1.4);
      } else if (state.heldItem.state === 'burnt') {
        showBanner(state, 'Burnt food cannot be plated - Trash [X]', '#ef706b', 1.5);
      } else if (spec && spec.prepType === 'cook' && state.heldItem.state === 'raw') {
        showBanner(state, `Cook ${spec.shortLabel} on ${spec.cookStations.join('/')} first`, '#f5b064', 1.5);
      } else if (spec && spec.prepType === 'chop' && state.heldItem.state === 'raw') {
        showBanner(state, `Chop ${spec.shortLabel} on Hinoki Block first`, '#f5b064', 1.5);
      } else {
        showBanner(state, 'Does not combine with items on this plate', '#ef706b', 1.5);
      }
      onEvent?.('error');
      return false;
    }

    plate.items.push(state.heldItem);
    state.heldItem = null;
    plate.plateAnim = 1;
    plate.candidateIds = findCandidateRecipes(plate.items).map((r) => r.id);
    emitBurst(state, 'sparkle', rect.cx, rect.cy, 6, '#ffe69a');

    const complete = matchCompleteRecipe(plate.items);
    if (complete) {
      const perfectCount = plate.items.filter((it) => it.isPerfect).length;
      state.heldItem = {
        kind: 'dish',
        recipeId: complete.id,
        perfectCount,
      };
      plate.items = [];
      plate.candidateIds = [];
      plate.plateAnim = 0;
      emitBurst(state, 'sparkle', rect.cx, rect.cy, 12, '#ffe89c');
      showBanner(state, `${complete.name} plated! Carry to Warm Pass`, '#8ef0a2', 1.7);
      onEvent?.('plate_complete', { recipeId: complete.id });
    } else {
      onEvent?.('plate', { count: plate.items.length });
    }
    return true;
  }

  if (station.kind === 'pass') {
    const pass = state.passStations[station.id];
    if (!pass) return false;

    // Carrying a completed dish -> place onto Warm Pass (READY TO SERVE)
    if (state.heldItem?.kind === 'dish') {
      if (pass.plates.length >= 2) {
        return serveCallback(station.id);
      }
      const dish = state.heldItem;
      state.heldItem = null;
      pass.plates.push({
        recipeId: dish.recipeId,
        perfectCount: dish.perfectCount,
        shimmerPhase: 0,
      });
      emitBurst(state, 'sparkle', rect.cx, rect.cy, 10, '#ffe89c');
      showBanner(state, `${RECIPE_MAP[dish.recipeId].shortName} READY TO SERVE! Interact Pass to ring bell`, '#8ef0a2', 1.7);
      onEvent?.('ready_to_serve', { recipeId: dish.recipeId });
      return true;
    }

    // Empty hands or non-dish -> ring Brass Bell and serve Pass plate!
    if (pass.plates.length > 0) {
      return serveCallback(station.id);
    }

    showBanner(state, 'Assemble a 3-part dish on Plating Island first', '#f5b064', 1.4);
    onEvent?.('error');
    return false;
  }

  return false;
}

export function updateKitchenState(state, dt, layout, onEvent) {
  if (state.banner.timer > 0) state.banner.timer = Math.max(0, state.banner.timer - dt);

  for (const board of Object.values(state.chopStations)) {
    if (board.knifeAnim > 0) board.knifeAnim = Math.max(0, board.knifeAnim - dt * 5.4);
  }
  for (const plate of Object.values(state.plateStations)) {
    if (plate.plateAnim > 0) plate.plateAnim = Math.max(0, plate.plateAnim - dt * 4.2);
  }
  for (const pass of Object.values(state.passStations)) {
    if (pass.bellAnim > 0) pass.bellAnim = Math.max(0, pass.bellAnim - dt * 3.8);
    for (let i = 0; i < pass.plates.length; i += 1) {
      const p = pass.plates[i];
      p.shimmerPhase += dt * 3.2;
      if (Math.floor((p.shimmerPhase - dt * 3.2) * 2) !== Math.floor(p.shimmerPhase * 2)) {
        const st = layout.stations.find((s) => s.id === pass.id);
        if (st) {
          const rect = stationRect(st);
          addParticle(state, {
            kind: 'steam',
            x: rect.cx + Math.sin(p.shimmerPhase * 1.7 + i) * 24,
            y: rect.cy - 12,
            vx: 3,
            vy: -24,
            size: 5.5,
            color: '#fff8e2',
            phase: p.shimmerPhase,
            life: 0.78,
            maxLife: 0.78,
          });
        }
      }
    }
  }

  for (const sk of Object.values(state.cookStations)) {
    if (!sk.item) continue;
    const spec = INGREDIENT_MAP[sk.item.ingredientId];
    const targetState = cookedStateFor(sk.cookType);
    sk.elapsed += dt;
    sk.sizzleTimer += dt;

    if (sk.elapsed >= spec.burnTime) {
      if (sk.heatZone !== 'burnt') {
        sk.heatZone = 'burnt';
        sk.item.state = 'burnt';
        sk.item.isPerfect = false;
        showBanner(state, `${spec.shortLabel} burnt on ${sk.cookType}! Trash [X]`, '#ef706b', 1.8);
        onEvent?.('burnt', { stationId: sk.id });
      }
    } else if (sk.elapsed >= spec.perfectEnd) {
      sk.heatZone = 'warning';
      sk.item.state = targetState;
      sk.item.isPerfect = false;
    } else if (sk.elapsed >= spec.perfectStart) {
      sk.heatZone = 'perfect';
      sk.item.state = targetState;
      sk.item.isPerfect = true;
      if (!sk.perfectAnnounced) {
        sk.perfectAnnounced = true;
        onEvent?.('perfect_ready', { stationId: sk.id });
      }
    } else if (sk.elapsed >= spec.cookDuration * 0.55) {
      sk.heatZone = 'cooking';
      sk.item.state = targetState;
      sk.item.isPerfect = false;
    } else {
      sk.heatZone = 'cooking';
      sk.item.state = 'raw';
      sk.item.isPerfect = false;
    }

    if (sk.sizzleTimer >= 0.12) {
      sk.sizzleTimer = 0;
      const st = layout.stations.find((s) => s.id === sk.id);
      if (st) {
        const rect = stationRect(st);
        if (sk.heatZone === 'burnt') {
          addParticle(state, {
            kind: 'smoke',
            x: rect.cx + Math.sin(sk.elapsed * 9) * 18,
            y: rect.cy - 8,
            vx: Math.sin(sk.elapsed * 4) * 10,
            vy: -36,
            size: 8,
            color: '#524b46',
            phase: sk.elapsed * 3,
            life: 0.75,
            maxLife: 0.75,
          });
        } else {
          addParticle(state, {
            kind: 'steam',
            x: rect.cx + Math.sin(sk.elapsed * 11) * 18,
            y: rect.cy - 10,
            vx: Math.cos(sk.elapsed * 5) * 8,
            vy: -34,
            size: sk.heatZone === 'perfect' ? 6.8 : 5.2,
            color: sk.heatZone === 'perfect' ? '#fff0bd' : '#f9f5eb',
            phase: sk.elapsed * 4,
            life: 0.72,
            maxLife: 0.72,
          });
          const ang = (sk.elapsed * 17) % (Math.PI * 2);
          addParticle(state, {
            kind: 'spark',
            x: rect.cx + Math.cos(ang) * 20,
            y: rect.cy + Math.sin(ang) * 12,
            vx: Math.cos(ang) * 34,
            vy: -28 + Math.sin(ang) * 14,
            size: sk.cookType === 'fryer' ? 3.1 : 2.5,
            color: sk.cookType === 'grill' ? '#ff7d38' : sk.cookType === 'fryer' ? '#ffe066' : '#fff6cc',
            phase: ang,
            life: 0.36,
            maxLife: 0.36,
          });
        }
      }
    }
  }

  for (let i = state.particles.length - 1; i >= 0; i -= 1) {
    const p = state.particles[i];
    p.life -= dt;
    if (p.life <= 0) {
      state.particles.splice(i, 1);
      continue;
    }
    if (p.kind === 'spark') p.vy += 130 * dt;
    if (p.kind === 'steam') p.x += Math.sin((p.phase ?? 0) + p.life * 8) * 16 * dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
  }

  for (let i = state.popups.length - 1; i >= 0; i -= 1) {
    const pop = state.popups[i];
    pop.life -= dt;
    if (pop.life <= 0) {
      state.popups.splice(i, 1);
      continue;
    }
    pop.y -= 4 * dt;
  }
}
