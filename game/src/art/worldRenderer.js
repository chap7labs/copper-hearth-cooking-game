// 2.5D Living Kyoto Izakaya world renderer: architectural back wall with shoji, signboard & guests,
// cool-dark Kyoto slate-matcha floor, S-curve route, Y-sorted hardware & 3/4 chef, and post-steam badges.

import {
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  GRID_COLS,
  GRID_ROWS,
  GRID_X0,
  GRID_Y0,
  TILE_H,
  TILE_W,
} from '../config/recipes.js';
import { stationRect } from '../config/kitchenLayouts.js';
import {
  drawStationHardware,
  drawStationOverlayBadges,
  drawTopDownChef,
  roundedRectPath,
} from './sprites.js';

export function createWorldRenderer(ctx, textures) {
  function drawIzakayaGuests(layout, clock) {
    const passStations = layout.stations.filter((s) => s.kind === 'pass');
    const guestSpecs = [
      { offset: 0.24, coat: '#3c5a6e', hair: '#1d1614', hairBun: false, cup: true },
      { offset: 0.56, coat: '#8a3d33', hair: '#2a1d18', hairBun: true, cup: true },
      { offset: 0.82, coat: '#46614d', hair: '#242224', hairBun: false, cup: false },
    ];

    for (const ps of passStations) {
      if (ps.row !== 0) continue;
      const rect = stationRect(ps);
      const count = ps.wCols >= 4 ? 3 : 2;
      for (let i = 0; i < count; i += 1) {
        const g = guestSpecs[i];
        const gx = rect.x + rect.w * g.offset;
        const bob = Math.sin(clock * 2.1 + i * 1.7) * 1.1;
        const gy = 148 + bob;

        // Warm shoulders behind Pass counter
        ctx.fillStyle = g.coat;
        roundedRectPath(ctx, gx - 16, gy - 3, 32, 18, 8);
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 245, 224, 0.28)';
        ctx.lineWidth = 1.2;
        ctx.stroke();

        // Guest head + hair
        ctx.fillStyle = '#f2c79d';
        ctx.beginPath();
        ctx.arc(gx, gy - 9, 9.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = g.hair;
        ctx.beginPath();
        ctx.arc(gx, gy - 11.5, 9.5, Math.PI * 0.9, Math.PI * 2.1);
        ctx.fill();
        if (g.hairBun) {
          ctx.beginPath();
          ctx.arc(gx, gy - 20.5, 4.2, 0, Math.PI * 2);
          ctx.fill();
        }
        // Subtle friendly eyes facing Pass
        ctx.fillStyle = '#241a14';
        ctx.beginPath();
        ctx.arc(gx - 3, gy - 8, 1.2, 0, Math.PI * 2);
        ctx.arc(gx + 3, gy - 8, 1.2, 0, Math.PI * 2);
        ctx.fill();

        if (g.cup) {
          ctx.fillStyle = '#d7e8dc';
          roundedRectPath(ctx, gx + 12, 152, 8, 8, 2);
          ctx.fill();
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.55)';
          ctx.lineWidth = 1.4;
          ctx.beginPath();
          ctx.moveTo(gx + 16, 150);
          ctx.quadraticCurveTo(gx + 18, 145, gx + 15, 141);
          ctx.stroke();
        }
      }
    }
  }

  function renderRoomAndFloor(layout, clock) {
    const theme = layout.theme;

    // Outer architectural Kyoto frame
    ctx.fillStyle = theme === 'lantern' ? '#12161f' : '#1b2621';
    ctx.fillRect(0, 112, CANVAS_WIDTH, CANVAS_HEIGHT - 112);

    // 2.5D Kyoto Back Wall (y: 112..168)
    const wallGrad = ctx.createLinearGradient(0, 112, 0, 168);
    if (theme === 'lantern') {
      wallGrad.addColorStop(0, '#2e241d');
      wallGrad.addColorStop(1, '#201914');
    } else if (theme === 'afternoon') {
      wallGrad.addColorStop(0, '#f2e0be');
      wallGrad.addColorStop(1, '#dec392');
    } else {
      wallGrad.addColorStop(0, '#faf3e1');
      wallGrad.addColorStop(1, '#ebe0c5');
    }
    ctx.fillStyle = wallGrad;
    ctx.fillRect(20, 112, CANVAS_WIDTH - 40, 56);

    // Top structural hinoki beam (y: 112..120) with brass joinery studs
    const beamGrad = ctx.createLinearGradient(0, 112, 0, 121);
    beamGrad.addColorStop(0, theme === 'lantern' ? '#4f3320' : '#8a5d32');
    beamGrad.addColorStop(1, theme === 'lantern' ? '#29190e' : '#573719');
    ctx.fillStyle = beamGrad;
    ctx.fillRect(0, 112, CANVAS_WIDTH, 9);
    for (let jx = 56; jx < CANVAS_WIDTH; jx += 180) {
      ctx.fillStyle = '#d4aa5a';
      ctx.beginPath();
      ctx.arc(jx, 116.5, 2.1, 0, Math.PI * 2);
      ctx.fill();
    }

    // 3 Sunlit / Twilight Shoji Windows with kumiko lattice frames (y: 121..150)
    for (const wx of [76, 396, 868]) {
      const wy = 121;
      const ww = 148;
      const wh = 29;
      ctx.fillStyle = theme === 'lantern' ? '#28384e' : theme === 'afternoon' ? '#ffde8a' : '#fffbe2';
      roundedRectPath(ctx, wx, wy, ww, wh, 2);
      ctx.fill();
      if (theme === 'lantern') {
        const moonGlow = ctx.createRadialGradient(wx + 74, wy + 12, 4, wx + 74, wy + 12, 65);
        moonGlow.addColorStop(0, 'rgba(195, 224, 255, 0.34)');
        moonGlow.addColorStop(1, 'rgba(38, 52, 71, 0)');
        ctx.fillStyle = moonGlow;
        ctx.fillRect(wx, wy, ww, wh);
      }
      ctx.strokeStyle = theme === 'lantern' ? '#422918' : '#7a5128';
      ctx.lineWidth = 2.2;
      ctx.strokeRect(wx, wy, ww, wh);
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.moveTo(wx, wy + wh * 0.5);
      ctx.lineTo(wx + ww, wy + wh * 0.5);
      for (let kx = wx + 25; kx < wx + ww; kx += 25) {
        ctx.moveTo(kx, wy);
        ctx.lineTo(kx, wy + wh);
      }
      ctx.stroke();
    }

    // Wall-mounted magnetic knife rack on upper-left wall (y: 123..146)
    ctx.fillStyle = '#472a18';
    roundedRectPath(ctx, 252, 126, 114, 7, 2);
    ctx.fill();
    for (let k = 0; k < 3; k += 1) {
      const kx = 266 + k * 36;
      ctx.fillStyle = '#dde5ea';
      ctx.fillRect(kx, 123, 8, 17);
      ctx.fillStyle = '#3b2012';
      ctx.fillRect(kx + 1.5, 118, 5, 6);
    }

    // Stocked ceramic shelf on upper-right wall (x: 1036..1210)
    ctx.fillStyle = theme === 'lantern' ? '#4f331e' : '#85582e';
    ctx.fillRect(1036, 143, 178, 5);
    for (let b = 0; b < 3; b += 1) {
      ctx.fillStyle = b === 2 ? '#e4f0e8' : '#a8ccb7';
      roundedRectPath(ctx, 1048, 137 - b * 4.5, 24, 6, 3);
      ctx.fill();
    }
    for (const [dx, col, h] of [[44, '#7a4928', 15], [68, '#466e5c', 13], [94, '#c77d32', 12], [120, '#2b241f', 16], [144, '#d9b568', 11]]) {
      ctx.fillStyle = col;
      roundedRectPath(ctx, 1048 + dx, 143 - h, 14, h, 3);
      ctx.fill();
    }

    // Center In-World Izakaya Signboard ("YUZU & HINOKI") + split vermilion noren curtains
    for (let n = 0; n < 2; n += 1) {
      const nx = 548 + n * 184;
      ctx.fillStyle = '#b33424';
      roundedRectPath(ctx, nx, 120, 44, 24, 3);
      ctx.fill();
      ctx.fillStyle = '#faf3e0';
      ctx.fillRect(nx + 4, 140, 36, 2);
      ctx.beginPath();
      ctx.arc(nx + 22, 130, 5.5, 0, Math.PI * 2);
      ctx.strokeStyle = '#faf3e0';
      ctx.lineWidth = 1.6;
      ctx.stroke();
    }
    ctx.fillStyle = '#2d1c10';
    roundedRectPath(ctx, 594, 116, 136, 26, 5);
    ctx.fill();
    ctx.strokeStyle = '#d9b568';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = '#ffeec2';
    ctx.font = '900 12px "Trebuchet MS", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('YUZU & HINOKI', 662, 133.5);

    // Glazed celadon stoneware backsplash strip (y: 150..164)
    ctx.fillStyle = textures?.patterns?.stoneware ?? (theme === 'lantern' ? '#2c4744' : '#c6e2d2');
    ctx.fillRect(20, 150, CANVAS_WIDTH - 40, 14);
    if (theme === 'lantern') {
      ctx.fillStyle = 'rgba(22, 34, 34, 0.56)';
      ctx.fillRect(20, 150, CANVAS_WIDTH - 40, 14);
    }

    // Warm illustrated izakaya guests behind Warm Pass counter
    drawIzakayaGuests(layout, clock);

    // Baseboard floor/wall seam (y: 164..168)
    ctx.fillStyle = theme === 'lantern' ? '#1c140e' : '#573a1d';
    ctx.fillRect(20, 164, CANVAS_WIDTH - 40, 4);

    // Cool-Dark Textured Stone Floor (~35% darker than bright food & warm hinoki counters)
    const floorX = GRID_X0 - 8;
    const floorY = GRID_Y0;
    const floorW = GRID_COLS * TILE_W + 16;
    const floorH = GRID_ROWS * TILE_H;

    const stonePattern = theme === 'lantern'
      ? textures?.patterns?.lanternStone
      : theme === 'afternoon'
        ? textures?.patterns?.afternoonSlate
        : textures?.patterns?.slateMatcha;
    ctx.fillStyle = stonePattern ?? (theme === 'lantern' ? '#1e2430' : '#2b3d37');
    roundedRectPath(ctx, floorX, floorY, floorW, floorH, 8);
    ctx.fill();

    ctx.save();
    ctx.beginPath();
    roundedRectPath(ctx, floorX, floorY, floorW, floorH, 8);
    ctx.clip();

    // Wall/floor ambient occlusion shadow band
    const wallAo = ctx.createLinearGradient(0, floorY, 0, floorY + 26);
    wallAo.addColorStop(0, 'rgba(8, 10, 10, 0.42)');
    wallAo.addColorStop(1, 'rgba(8, 10, 10, 0)');
    ctx.fillStyle = wallAo;
    ctx.fillRect(floorX, floorY, floorW, 26);

    // Brass service floor drains along open kitchen aisles
    const drains = theme === 'lantern' ? [[334, 294], [946, 294]] : [[266, 294], [1014, 294]];
    for (const [dx, dy] of drains) {
      ctx.fillStyle = '#141a18';
      roundedRectPath(ctx, dx - 16, dy - 10, 32, 20, 4);
      ctx.fill();
      ctx.strokeStyle = '#8f723e';
      ctx.lineWidth = 1.6;
      ctx.stroke();
      for (let s = -10; s <= 10; s += 5) {
        ctx.fillStyle = '#6b552c';
        ctx.fillRect(dx + s - 1, dy - 6, 2, 12);
      }
    }

    // Woven bamboo anti-slip kitchen runner mats aligned to actual open aisles
    const runners = theme === 'lantern'
      ? [
          { x: GRID_X0 + 3 * TILE_W + 10, y: GRID_Y0 + 1 * TILE_H + 10, w: 11 * TILE_W - 20, h: TILE_H - 20 },
          { x: GRID_X0 + 1 * TILE_W + 10, y: GRID_Y0 + 4 * TILE_H + 10, w: 15 * TILE_W - 20, h: TILE_H - 20 },
        ]
      : [
          { x: GRID_X0 + 18, y: GRID_Y0 + 1 * TILE_H + 10, w: GRID_COLS * TILE_W - 36, h: TILE_H - 20 },
          { x: GRID_X0 + 18, y: GRID_Y0 + 4 * TILE_H + 10, w: GRID_COLS * TILE_W - 36, h: TILE_H - 20 },
        ];
    for (const rm of runners) {
      ctx.fillStyle = theme === 'lantern' ? 'rgba(18, 22, 30, 0.62)' : 'rgba(16, 24, 20, 0.56)';
      roundedRectPath(ctx, rm.x, rm.y, rm.w, rm.h, 9);
      ctx.fill();
      ctx.save();
      ctx.setLineDash([8, 6]);
      ctx.strokeStyle = theme === 'lantern' ? 'rgba(235, 182, 92, 0.42)' : 'rgba(204, 174, 108, 0.44)';
      ctx.lineWidth = 1.4;
      roundedRectPath(ctx, rm.x + 4, rm.y + 4, rm.w - 8, rm.h - 8, 6);
      ctx.stroke();
      ctx.restore();
    }

    // Living side-floor kitchen props & woven mats tucked along outer left/right margins on Shift 1
    if (theme === 'daylight') {
      for (const mx of [GRID_X0 + 18, GRID_X0 + 15 * TILE_W + 10]) {
        ctx.fillStyle = 'rgba(182, 138, 72, 0.16)';
        roundedRectPath(ctx, mx, GRID_Y0 + 2 * TILE_H + 6, 2.7 * TILE_W, 2 * TILE_H - 12, 10);
        ctx.fill();
        ctx.strokeStyle = 'rgba(208, 168, 98, 0.34)';
        ctx.lineWidth = 1.4;
        ctx.stroke();
      }
      // Steaming cast-iron hagama rice cooker + wooden dashi barrel (far-left margin)
      const hx = GRID_X0 + 58;
      const hy = GRID_Y0 + 2 * TILE_H + 42;
      ctx.fillStyle = 'rgba(10, 12, 10, 0.45)';
      ctx.beginPath();
      ctx.ellipse(hx + 2, hy + 18, 30, 10, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#6e4c2a';
      roundedRectPath(ctx, hx - 28, hy - 14, 56, 36, 8);
      ctx.fill();
      ctx.fillStyle = '#26282b';
      ctx.beginPath();
      ctx.arc(hx, hy, 20, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#c49654';
      ctx.beginPath();
      ctx.arc(hx, hy, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#5c3c1b';
      roundedRectPath(ctx, hx - 10, hy - 3, 20, 6, 3);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 250, 232, 0.65)';
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(hx - 6, hy - 14);
      ctx.quadraticCurveTo(hx - 2, hy - 26, hx - 7, hy - 35);
      ctx.moveTo(hx + 7, hy - 15);
      ctx.quadraticCurveTo(hx + 11, hy - 27, hx + 6, hy - 36);
      ctx.stroke();
      // Wooden dashi/soy barrel just below hagama
      ctx.fillStyle = '#825329';
      ctx.beginPath();
      ctx.arc(hx + 26, hy + 68, 17, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#c9a054';
      ctx.lineWidth = 2.2;
      ctx.stroke();
      // Stacked bamboo seiro steamer baskets + tea stand on right open floor edge
      const bx = GRID_X0 + 16.5 * TILE_W + 18;
      const by = GRID_Y0 + 2 * TILE_H + 42;
      ctx.fillStyle = 'rgba(10, 12, 10, 0.45)';
      ctx.beginPath();
      ctx.ellipse(bx + 2, by + 18, 28, 10, 0, 0, Math.PI * 2);
      ctx.fill();
      for (let st = 0; st < 2; st += 1) {
        const sy = by - st * 10;
        ctx.fillStyle = '#c99b56';
        ctx.beginPath();
        ctx.arc(bx, sy, 21, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#7d5422';
        ctx.lineWidth = 1.8;
        ctx.stroke();
      }
      ctx.fillStyle = '#e5be7d';
      ctx.beginPath();
      ctx.arc(bx, by - 10, 17, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#365442';
      roundedRectPath(ctx, bx - 44, by + 50, 44, 28, 6);
      ctx.fill();
      ctx.fillStyle = '#cfa052';
      ctx.beginPath();
      ctx.arc(bx - 30, by + 64, 7, 0, Math.PI * 2);
      ctx.arc(bx - 12, by + 64, 7, 0, Math.PI * 2);
      ctx.fill();
    }

    if (theme === 'daylight' || theme === 'afternoon') {
      // Slanting golden sunlight shafts from shoji windows across the dark slate floor
      ctx.fillStyle = theme === 'afternoon' ? 'rgba(255, 198, 92, 0.24)' : 'rgba(255, 242, 186, 0.26)';
      for (const sx of [80, 400, 872]) {
        ctx.beginPath();
        ctx.moveTo(sx, floorY);
        ctx.lineTo(sx + 150, floorY);
        ctx.lineTo(sx + 315, floorY + floorH);
        ctx.lineTo(sx + 165, floorY + floorH);
        ctx.closePath();
        ctx.fill();
      }
    } else {
      // Bright warm golden lantern floor illumination under EVERY active station & island in U-layout
      const pulse = 0.94 + Math.sin(clock * 2.5) * 0.06;
      const pools = [
        [130, 336, 210],
        [130, 462, 175],
        [368, 210, 195],
        [640, 210, 195],
        [538, 420, 225],
        [810, 378, 185],
        [1082, 210, 195],
        [1150, 420, 210],
      ];
      for (const [lx, ly, r] of pools) {
        const lg = ctx.createRadialGradient(lx, ly, 12, lx, ly, r * pulse);
        lg.addColorStop(0, 'rgba(255, 186, 84, 0.44)');
        lg.addColorStop(0.55, 'rgba(255, 150, 52, 0.18)');
        lg.addColorStop(1, 'rgba(255, 140, 44, 0)');
        ctx.fillStyle = lg;
        ctx.beginPath();
        ctx.arc(lx, ly, r, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  }

  function drawSmoothRoutePath(chef, clock) {
    if (chef.path.length === 0) return;
    const pts = [{ x: chef.x, y: chef.y }, ...chef.path];
    ctx.save();
    let walked = 0;
    const maxDist = 180;
    let dotIdx = 0;

    for (let i = 0; i < pts.length - 1 && walked < maxDist; i += 1) {
      const dx = pts[i + 1].x - pts[i].x;
      const dy = pts[i + 1].y - pts[i].y;
      const segLen = Math.hypot(dx, dy);
      if (segLen < 1) continue;
      for (let d = 24; d <= segLen && walked + d <= maxDist; d += 26) {
        const t = d / segLen;
        const px = pts[i].x + dx * t;
        const py = pts[i].y + dy * t + 14;
        const fade = Math.max(0.14, 0.56 - dotIdx * 0.08);
        const rad = Math.max(2.2, 4.4 - dotIdx * 0.35);
        ctx.fillStyle = `rgba(255, 224, 122, ${fade})`;
        ctx.beginPath();
        ctx.arc(px, py, rad, 0, Math.PI * 2);
        ctx.fill();
        dotIdx += 1;
      }
      walked += segLen;
    }

    const last = pts[pts.length - 1];
    const ringR = 11 + Math.sin(clock * 8) * 1.8;
    ctx.strokeStyle = 'rgba(255, 224, 122, 0.45)';
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    ctx.arc(last.x, last.y, ringR, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  function renderParticles(kitchen) {
    for (let i = 0; i < kitchen.particles.length; i += 1) {
      const p = kitchen.particles[i];
      const alpha = Math.max(0, p.life / p.maxLife);
      ctx.save();
      if (p.kind === 'steam') {
        ctx.globalAlpha = alpha * 0.78;
        ctx.strokeStyle = p.color;
        ctx.lineWidth = Math.max(2.8, p.size * 0.52);
        ctx.lineCap = 'round';
        const wave = Math.sin((p.phase ?? 0) + p.life * 9) * 6;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.quadraticCurveTo(p.x + wave, p.y - 10, p.x - wave * 0.55, p.y - 20);
        ctx.stroke();
      } else {
        ctx.globalAlpha = alpha * 0.94;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  }

  function renderWorld(state) {
    const { kitchen, orders, chef, layout, pointer, clock, sceneManager } = state;
    const camOffset = sceneManager?.getCameraOffset ? sceneManager.getCameraOffset(clock) : { x: 0, y: 0 };

    ctx.save();
    ctx.translate(camOffset.x, camOffset.y);

    renderRoomAndFloor(layout, clock);
    drawSmoothRoutePath(chef, clock);

    // Y-sorted 2.5D hardware & 3/4-view chef (clear separation from SIDE PLATE & aisles)
    const drawList = layout.stations.map((st) => {
      const rect = stationRect(st);
      return {
        sortY: rect.y + rect.h,
        draw: () => drawStationHardware(
          ctx,
          st,
          rect,
          kitchen,
          orders,
          clock,
          chef.focusedStationId === st.id,
          pointer.hoverZone === `st:${st.id}`,
          textures,
        ),
      };
    });
    drawList.push({
      sortY: chef.y + 30,
      draw: () => drawTopDownChef(ctx, chef, kitchen.heldItem, clock),
    });
    drawList.sort((a, b) => a.sortY - b.sortY);
    for (let i = 0; i < drawList.length; i += 1) {
      drawList[i].draw();
    }

    if (layout.theme === 'lantern') {
      for (const [lx, ly] of [[16, 224], [16, 464], [1264, 224], [1264, 464], [430, 128], [850, 128]]) {
        ctx.fillStyle = '#381608';
        ctx.fillRect(lx - 6, ly - 17, 12, 4);
        ctx.fillRect(lx - 5, ly + 13, 10, 3);
        ctx.fillStyle = '#ff8c38';
        ctx.beginPath();
        ctx.ellipse(lx, ly, 11, 14, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#471808';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.fillStyle = '#ffe99e';
        ctx.beginPath();
        ctx.ellipse(lx, ly, 5.5, 8, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // All steam, smoke & spark particles rendered BEFORE station labels
    renderParticles(kitchen);

    // Post-steam station labels & status pills (0 letters overlapped by steam!)
    for (let i = 0; i < layout.stations.length; i += 1) {
      const st = layout.stations[i];
      drawStationOverlayBadges(ctx, st, stationRect(st), kitchen, orders);
    }

    if (layout.theme === 'lantern') {
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      for (const [lx, ly, r] of [[130, 336, 175], [368, 210, 165], [640, 210, 165], [538, 420, 195], [1150, 420, 185]]) {
        const glow = ctx.createRadialGradient(lx, ly, 8, lx, ly, r);
        glow.addColorStop(0, 'rgba(255, 180, 74, 0.17)');
        glow.addColorStop(1, 'rgba(255, 140, 44, 0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(lx, ly, r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      const vig = ctx.createRadialGradient(640, 400, 380, 640, 400, 780);
      vig.addColorStop(0, 'rgba(8, 10, 16, 0)');
      vig.addColorStop(1, 'rgba(8, 10, 16, 0.22)');
      ctx.fillStyle = vig;
      ctx.fillRect(0, 112, CANVAS_WIDTH, CANVAS_HEIGHT - 112);
    }

    ctx.restore();
  }

  return { renderWorld };
}
