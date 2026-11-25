// Three spatial 18x8 top-down Kyoto kitchen layouts plus deterministic BFS grid pathfinding.

import { GRID_COLS, GRID_ROWS, GRID_X0, GRID_Y0, INGREDIENTS, TILE_H, TILE_W } from './recipes.js';

function pantryRow() {
  return INGREDIENTS.map((ing, i) => ({
    id: `pantry_${ing.id}`,
    kind: 'pantry',
    ingredientId: ing.id,
    col: i * 2,
    row: 5,
    wCols: 2,
    hRows: 1,
    label: ing.shortLabel,
    shortKey: ing.key,
  })).concat([
    {
      id: 'trash_bin',
      kind: 'trash',
      col: 16,
      row: 5,
      wCols: 2,
      hRows: 1,
      label: 'TRASH',
      shortKey: 'X',
    },
  ]);
}

export const KITCHEN_LAYOUTS = {
  daylight: {
    id: 'daylight',
    title: 'Daylight Counter',
    theme: 'daylight',
    spawnTile: { col: 8, row: 4 },
    stations: [
      { id: 'chop_1', kind: 'chop', col: 0, row: 0, wCols: 3, hRows: 1, label: 'HINOKI CHOP' },
      { id: 'grill_1', kind: 'cook', cookType: 'grill', col: 3, row: 0, wCols: 3, hRows: 1, label: 'BINCHO GRILL' },
      { id: 'fryer_1', kind: 'cook', cookType: 'fryer', col: 6, row: 0, wCols: 3, hRows: 1, label: 'TEMPURA FRYER' },
      { id: 'boiler_1', kind: 'cook', cookType: 'boiler', col: 9, row: 0, wCols: 3, hRows: 1, label: 'DONABE BOIL' },
      { id: 'counter_top', kind: 'counter', prop: 'spice_rack', col: 12, row: 0, wCols: 2, hRows: 1, label: 'SPICES' },
      { id: 'pass_1', kind: 'pass', col: 14, row: 0, wCols: 4, hRows: 1, label: 'WARM PASS' },
      { id: 'island_l', kind: 'counter', prop: 'plates_shoyu', col: 4, row: 2, wCols: 2, hRows: 2, label: 'PREP' },
      { id: 'plate_1', kind: 'plate', col: 6, row: 2, wCols: 6, hRows: 2, label: 'PLATING ISLAND' },
      { id: 'island_r', kind: 'counter', prop: 'garnish_bowls', col: 12, row: 2, wCols: 2, hRows: 2, label: 'GARNISH' },
      ...pantryRow(),
    ],
  },
  split_island: {
    id: 'split_island',
    title: 'Split Island Rush',
    theme: 'afternoon',
    spawnTile: { col: 8, row: 3 },
    stations: [
      { id: 'grill_1', kind: 'cook', cookType: 'grill', col: 0, row: 0, wCols: 4, hRows: 1, label: 'BINCHO GRILL' },
      { id: 'fryer_1', kind: 'cook', cookType: 'fryer', col: 4, row: 0, wCols: 4, hRows: 1, label: 'TEMPURA FRYER' },
      { id: 'counter_n1', kind: 'counter', prop: 'spice_rack', col: 8, row: 0, wCols: 1, hRows: 1, label: 'SPICES' },
      { id: 'pass_1', kind: 'pass', col: 9, row: 0, wCols: 4, hRows: 1, label: 'WARM PASS' },
      { id: 'counter_n2', kind: 'counter', prop: 'tea_set', col: 13, row: 0, wCols: 1, hRows: 1, label: 'TEA' },
      { id: 'boiler_1', kind: 'cook', cookType: 'boiler', col: 14, row: 0, wCols: 4, hRows: 1, label: 'DONABE BOIL' },
      { id: 'plate_1', kind: 'plate', col: 2, row: 2, wCols: 4, hRows: 1, label: 'WEST PLATING' },
      { id: 'chop_1', kind: 'chop', col: 2, row: 3, wCols: 4, hRows: 1, label: 'HINOKI CHOP' },
      { id: 'island_w', kind: 'counter', prop: 'plates_shoyu', col: 6, row: 2, wCols: 1, hRows: 2, label: 'PREP' },
      { id: 'island_e1', kind: 'counter', prop: 'garnish_bowls', col: 11, row: 2, wCols: 1, hRows: 2, label: 'GARNISH' },
      { id: 'plate_2', kind: 'plate', col: 12, row: 2, wCols: 4, hRows: 1, label: 'EAST PLATING' },
      { id: 'island_e2', kind: 'counter', prop: 'tea_set', col: 12, row: 3, wCols: 4, hRows: 1, label: 'TEA & GARNISH' },
      ...pantryRow(),
    ],
  },
  lantern: {
    id: 'lantern',
    title: 'Lantern Dinner Service',
    theme: 'lantern',
    spawnTile: { col: 8, row: 4 },
    stations: [
      { id: 'pass_1', kind: 'pass', col: 0, row: 0, wCols: 4, hRows: 1, label: 'WEST PASS' },
      { id: 'grill_1', kind: 'cook', cookType: 'grill', col: 4, row: 0, wCols: 3, hRows: 1, label: 'BINCHO GRILL' },
      { id: 'fryer_1', kind: 'cook', cookType: 'fryer', col: 7, row: 0, wCols: 3, hRows: 1, label: 'TEMPURA FRYER' },
      { id: 'boiler_1', kind: 'cook', cookType: 'boiler', col: 10, row: 0, wCols: 3, hRows: 1, label: 'DONABE BOIL' },
      { id: 'counter_ltop', kind: 'counter', prop: 'spice_rack', col: 13, row: 0, wCols: 1, hRows: 1, label: 'SPICES' },
      { id: 'pass_2', kind: 'pass', col: 14, row: 0, wCols: 4, hRows: 1, label: 'EAST PASS' },
      { id: 'chop_1', kind: 'chop', col: 3, row: 2, wCols: 3, hRows: 1, label: 'HINOKI CHOP' },
      { id: 'island_lw', kind: 'counter', prop: 'plates_shoyu', col: 3, row: 3, wCols: 3, hRows: 1, label: 'PLATES' },
      { id: 'plate_1', kind: 'plate', col: 6, row: 2, wCols: 5, hRows: 2, label: 'PLATING BRIDGE' },
      { id: 'plate_2', kind: 'plate', col: 11, row: 2, wCols: 3, hRows: 1, label: 'SIDE PLATE' },
      { id: 'island_le', kind: 'counter', prop: 'garnish_bowls', col: 11, row: 3, wCols: 3, hRows: 1, label: 'GARNISH' },
      ...pantryRow(),
    ],
  },
};

export function getLayout(layoutId) {
  return KITCHEN_LAYOUTS[layoutId] ?? KITCHEN_LAYOUTS.daylight;
}

export function stationRect(st) {
  return {
    x: GRID_X0 + st.col * TILE_W,
    y: GRID_Y0 + st.row * TILE_H,
    w: st.wCols * TILE_W,
    h: st.hRows * TILE_H,
    cx: GRID_X0 + (st.col + st.wCols / 2) * TILE_W,
    cy: GRID_Y0 + (st.row + st.hRows / 2) * TILE_H,
  };
}

export function tileToWorld(col, row) {
  return {
    x: GRID_X0 + (col + 0.5) * TILE_W,
    y: GRID_Y0 + (row + 0.5) * TILE_H,
  };
}

export function worldToTile(x, y) {
  return {
    col: Math.max(0, Math.min(GRID_COLS - 1, Math.floor((x - GRID_X0) / TILE_W))),
    row: Math.max(0, Math.min(GRID_ROWS - 1, Math.floor((y - GRID_Y0) / TILE_H))),
  };
}

export function buildWalkGrid(layout) {
  const blocked = Array.from({ length: GRID_ROWS }, () => Array(GRID_COLS).fill(false));
  for (const st of layout.stations) {
    for (let r = st.row; r < st.row + st.hRows; r += 1) {
      for (let c = st.col; c < st.col + st.wCols; c += 1) {
        if (r >= 0 && r < GRID_ROWS && c >= 0 && c < GRID_COLS) {
          blocked[r][c] = true;
        }
      }
    }
  }
  return blocked;
}

export function getAdjacentWalkableTiles(grid, station) {
  const goals = [];
  const seen = new Set();
  const dirs = [[0, 1], [0, -1], [-1, 0], [1, 0]];
  for (let r = station.row; r < station.row + station.hRows; r += 1) {
    for (let c = station.col; c < station.col + station.wCols; c += 1) {
      for (const [dc, dr] of dirs) {
        const nc = c + dc;
        const nr = r + dr;
        if (nc < 0 || nc >= GRID_COLS || nr < 0 || nr >= GRID_ROWS) continue;
        if (grid[nr][nc]) continue;
        const key = `${nc},${nr}`;
        if (!seen.has(key)) {
          seen.add(key);
          goals.push({ col: nc, row: nr });
        }
      }
    }
  }
  return goals;
}

export function findGridPath(grid, startTile, goalTiles) {
  if (goalTiles.length === 0) return [];
  const goalSet = new Set(goalTiles.map((g) => `${g.col},${g.row}`));
  const startKey = `${startTile.col},${startTile.row}`;
  if (goalSet.has(startKey)) return [];

  const queue = [{ col: startTile.col, row: startTile.row }];
  const parent = new Map([[startKey, null]]);
  const dirs = [[0, -1], [0, 1], [-1, 0], [1, 0]];

  while (queue.length > 0) {
    const cur = queue.shift();
    const curKey = `${cur.col},${cur.row}`;
    if (goalSet.has(curKey)) {
      const path = [];
      let trace = curKey;
      while (trace && trace !== startKey) {
        const [c, r] = trace.split(',').map(Number);
        path.push({ col: c, row: r });
        trace = parent.get(trace);
      }
      path.reverse();
      return path;
    }

    for (const [dc, dr] of dirs) {
      const nc = cur.col + dc;
      const nr = cur.row + dr;
      if (nc < 0 || nc >= GRID_COLS || nr < 0 || nr >= GRID_ROWS) continue;
      if (grid[nr][nc]) continue;
      const nk = `${nc},${nr}`;
      if (parent.has(nk)) continue;
      parent.set(nk, curKey);
      queue.push({ col: nc, row: nr });
    }
  }
  return [];
}
