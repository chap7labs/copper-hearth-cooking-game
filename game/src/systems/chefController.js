// Top-down chef spatial movement, dash trail, grid BFS click-to-move, and station focus detection.

import { GRID_COLS, GRID_ROWS, GRID_X0, GRID_Y0, TILE_H, TILE_W } from '../config/recipes.js';
import {
  findGridPath,
  getAdjacentWalkableTiles,
  stationRect,
  tileToWorld,
  worldToTile,
} from '../config/kitchenLayouts.js';

const CHEF_RADIUS = 22;
const BASE_SPEED = 360;
const DASH_SPEED = 620;
const DASH_DURATION = 0.17;
const DASH_COOLDOWN = 0.65;

export function createChef(layout) {
  const spawn = tileToWorld(layout.spawnTile.col, layout.spawnTile.row);
  return {
    x: spawn.x,
    y: spawn.y,
    vx: 0,
    vy: 0,
    facingAngle: -Math.PI / 2,
    walkPhase: 0,
    dashTimer: 0,
    dashCooldown: 0,
    path: [],
    targetStationId: null,
    focusedStationId: null,
    interactAnim: 0,
    dashTrail: [],
  };
}

export function resetChef(chef, layout) {
  Object.assign(chef, createChef(layout));
}

export function triggerChefDash(chef) {
  if (chef.dashCooldown > 0 || chef.dashTimer > 0) return false;
  chef.dashTimer = DASH_DURATION;
  chef.dashCooldown = DASH_COOLDOWN;
  return true;
}

export function commandChefToStation(chef, layout, grid, stationId) {
  const station = layout.stations.find((s) => s.id === stationId);
  if (!station) return false;

  const curTile = worldToTile(chef.x, chef.y);
  const goals = getAdjacentWalkableTiles(grid, station);
  if (goals.length === 0) return false;

  // Already standing on an adjacent tile -> arrive immediately
  if (goals.some((g) => g.col === curTile.col && g.row === curTile.row)) {
    chef.path = [];
    chef.targetStationId = station.id;
    const rect = stationRect(station);
    chef.facingAngle = Math.atan2(rect.cy - chef.y, rect.cx - chef.x);
    return 'immediate';
  }

  const tilePath = findGridPath(grid, curTile, goals);
  if (tilePath.length === 0) return false;
  chef.path = tilePath.map((t) => tileToWorld(t.col, t.row));
  chef.targetStationId = station.id;
  return 'moving';
}

function collidesAt(x, y, grid) {
  const minX = GRID_X0 + CHEF_RADIUS;
  const maxX = GRID_X0 + GRID_COLS * TILE_W - CHEF_RADIUS;
  const minY = GRID_Y0 + CHEF_RADIUS;
  const maxY = GRID_Y0 + GRID_ROWS * TILE_H - CHEF_RADIUS;
  if (x < minX || x > maxX || y < minY || y > maxY) return true;

  const checkPts = [
    [x - CHEF_RADIUS + 2, y - CHEF_RADIUS + 2],
    [x + CHEF_RADIUS - 2, y - CHEF_RADIUS + 2],
    [x - CHEF_RADIUS + 2, y + CHEF_RADIUS - 2],
    [x + CHEF_RADIUS - 2, y + CHEF_RADIUS - 2],
  ];
  for (const [px, py] of checkPts) {
    const col = Math.floor((px - GRID_X0) / TILE_W);
    const row = Math.floor((py - GRID_Y0) / TILE_H);
    if (col < 0 || col >= GRID_COLS || row < 0 || row >= GRID_ROWS) return true;
    if (grid[row][col]) return true;
  }
  return false;
}

export function findFocusedStation(chef, layout) {
  const reachX = chef.x + Math.cos(chef.facingAngle) * 44;
  const reachY = chef.y + Math.sin(chef.facingAngle) * 44;

  let bestId = null;
  let bestDist = 86;
  for (const st of layout.stations) {
    if (st.kind === 'counter') continue;
    const rect = stationRect(st);
    const cx = Math.max(rect.x, Math.min(rect.x + rect.w, reachX));
    const cy = Math.max(rect.y, Math.min(rect.y + rect.h, reachY));
    const dReach = Math.hypot(reachX - cx, reachY - cy);

    const bx = Math.max(rect.x, Math.min(rect.x + rect.w, chef.x));
    const by = Math.max(rect.y, Math.min(rect.y + rect.h, chef.y));
    const dBody = Math.hypot(chef.x - bx, chef.y - by);

    const score = dReach * 0.65 + dBody * 0.55;
    if (dBody <= 64 && score < bestDist) {
      bestDist = score;
      bestId = st.id;
    }
  }
  return bestId;
}

export function updateChef(chef, dt, layout, grid, moveDir, onArriveStation) {
  if (chef.dashTimer > 0) chef.dashTimer = Math.max(0, chef.dashTimer - dt);
  if (chef.dashCooldown > 0) chef.dashCooldown = Math.max(0, chef.dashCooldown - dt);
  if (chef.interactAnim > 0) chef.interactAnim = Math.max(0, chef.interactAnim - dt * 5);

  // Fade dash trail
  for (let i = chef.dashTrail.length - 1; i >= 0; i -= 1) {
    chef.dashTrail[i].life -= dt;
    if (chef.dashTrail[i].life <= 0) chef.dashTrail.splice(i, 1);
  }

  const speed = chef.dashTimer > 0 ? DASH_SPEED : BASE_SPEED;
  let moving = false;

  if (moveDir.x !== 0 || moveDir.y !== 0) {
    // Manual WASD overrides click path
    chef.path = [];
    chef.targetStationId = null;
    const len = Math.hypot(moveDir.x, moveDir.y);
    const nx = moveDir.x / len;
    const ny = moveDir.y / len;
    chef.facingAngle = Math.atan2(ny, nx);
    const stepX = nx * speed * dt;
    const stepY = ny * speed * dt;

    if (!collidesAt(chef.x + stepX, chef.y, grid)) chef.x += stepX;
    if (!collidesAt(chef.x, chef.y + stepY, grid)) chef.y += stepY;
    chef.vx = nx * speed;
    chef.vy = ny * speed;
    moving = true;
  } else if (chef.path.length > 0) {
    const wp = chef.path[0];
    const dx = wp.x - chef.x;
    const dy = wp.y - chef.y;
    const dist = Math.hypot(dx, dy);
    const stepDist = speed * dt;

    if (dist <= stepDist + 2) {
      chef.x = wp.x;
      chef.y = wp.y;
      chef.path.shift();
      if (chef.path.length === 0 && chef.targetStationId) {
        const stId = chef.targetStationId;
        chef.targetStationId = null;
        const st = layout.stations.find((s) => s.id === stId);
        if (st) {
          const rect = stationRect(st);
          chef.facingAngle = Math.atan2(rect.cy - chef.y, rect.cx - chef.x);
          onArriveStation?.(st);
        }
      }
    } else {
      const nx = dx / dist;
      const ny = dy / dist;
      chef.facingAngle = Math.atan2(ny, nx);
      chef.x += nx * stepDist;
      chef.y += ny * stepDist;
      chef.vx = nx * speed;
      chef.vy = ny * speed;
    }
    moving = true;
  } else {
    chef.vx = 0;
    chef.vy = 0;
  }

  if (moving) {
    chef.walkPhase += dt * (chef.dashTimer > 0 ? 22 : 13);
    if (chef.dashTimer > 0) {
      chef.dashTrail.push({ x: chef.x, y: chef.y, life: 0.22, maxLife: 0.22 });
    }
  }

  chef.focusedStationId = findFocusedStation(chef, layout);
}
