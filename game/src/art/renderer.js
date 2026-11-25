// Top-down 2.5D Kyoto Open-Kitchen renderer for Yuzu & Hinoki across 3 lighting themes.

import {
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  GRID_COLS,
  GRID_ROWS,
  GRID_X0,
  GRID_Y0,
  HUD_LAYOUT,
  INGREDIENT_MAP,
  RECIPES,
  RECIPE_MAP,
  SHIFTS,
  TILE_H,
  TILE_W,
} from '../config/recipes.js';
import { stationRect } from '../config/kitchenLayouts.js';
import { SCREEN_PAUSED, SCREEN_SUMMARY, SCREEN_TITLE } from '../engine/gameLoop.js';
import {
  drawIcon,
  drawIngredientSprite,
  drawPlatedDish,
  drawStationHardware,
  drawTopDownChef,
  roundedRectPath,
} from './sprites.js';

const TICKET_TILTS = [-0.02, 0.016, -0.014, 0.019];

function formatTimer(seconds) {
  const s = Math.max(0, Math.ceil(seconds));
  const m = Math.floor(s / 60);
  const rem = s % 60;
  return `${String(m).padStart(2, '0')}:${String(rem).padStart(2, '0')}`;
}

function drawPanel(ctx, rect, fill, border, radius = 10, lineWidth = 1.5) {
  roundedRectPath(ctx, rect.x, rect.y, rect.w, rect.h, radius);
  if (fill) {
    ctx.fillStyle = fill;
    ctx.fill();
  }
  if (border) {
    ctx.strokeStyle = border;
    ctx.lineWidth = lineWidth;
    ctx.stroke();
  }
}

export function createKitchenRenderer(canvas) {
  const ctx = canvas.getContext('2d');

  function renderFloorAndLighting(layout, clock) {
    const theme = layout.theme;

    // Outer architectural Kyoto timber & stucco frame
    ctx.fillStyle = theme === 'lantern' ? '#12151c' : '#30251c';
    ctx.fillRect(0, 112, CANVAS_WIDTH, CANVAS_HEIGHT - 112);

    // Real 2.5D Kyoto Back Wall (y: 112..168) with timber beam, shoji windows, wall shelves & celadon backsplash
    const wallGrad = ctx.createLinearGradient(0, 112, 0, 168);
    if (theme === 'lantern') {
      wallGrad.addColorStop(0, '#2a221c');
      wallGrad.addColorStop(1, '#1e1915');
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
    beamGrad.addColorStop(0, theme === 'lantern' ? '#4a301e' : '#8a5d32');
    beamGrad.addColorStop(1, theme === 'lantern' ? '#26170d' : '#573719');
    ctx.fillStyle = beamGrad;
    ctx.fillRect(0, 112, CANVAS_WIDTH, 9);
    for (let jx = 56; jx < CANVAS_WIDTH; jx += 180) {
      ctx.fillStyle = '#d4aa5a';
      ctx.beginPath();
      ctx.arc(jx, 116.5, 2.1, 0, Math.PI * 2);
      ctx.fill();
    }

    // 3 Sunlit / Twilight Shoji Windows with wooden kumiko lattice frames (y: 121..150)
    for (const wx of [92, 551, 1010]) {
      const wy = 121;
      const ww = 178;
      const wh = 29;
      ctx.fillStyle = theme === 'lantern' ? '#263447' : theme === 'afternoon' ? '#ffe094' : '#fffbe0';
      roundedRectPath(ctx, wx, wy, ww, wh, 2);
      ctx.fill();
      if (theme === 'lantern') {
        const moonGlow = ctx.createRadialGradient(wx + 90, wy + 12, 4, wx + 90, wy + 12, 75);
        moonGlow.addColorStop(0, 'rgba(195, 222, 255, 0.36)');
        moonGlow.addColorStop(1, 'rgba(38, 52, 71, 0)');
        ctx.fillStyle = moonGlow;
        ctx.fillRect(wx, wy, ww, wh);
      } else {
        const sunGlow = ctx.createLinearGradient(wx, wy, wx + ww, wy + wh);
        sunGlow.addColorStop(0, 'rgba(255, 255, 255, 0.55)');
        sunGlow.addColorStop(1, 'rgba(255, 224, 140, 0.15)');
        ctx.fillStyle = sunGlow;
        ctx.fillRect(wx, wy, ww, wh);
      }
      ctx.strokeStyle = theme === 'lantern' ? '#3d2718' : '#7a5128';
      ctx.lineWidth = 2.4;
      ctx.strokeRect(wx, wy, ww, wh);
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(wx, wy + wh * 0.5);
      ctx.lineTo(wx + ww, wy + wh * 0.5);
      for (let kx = wx + 30; kx < wx + ww; kx += 30) {
        ctx.moveTo(kx, wy);
        ctx.lineTo(kx, wy + wh);
      }
      ctx.stroke();
    }

    // 2 Hinoki Wall Shelves with stacked celadon bowls & ceramic spice jars (y: 124..148)
    for (const sx of [318, 774]) {
      ctx.fillStyle = theme === 'lantern' ? '#4f331e' : '#85582e';
      ctx.fillRect(sx, 143, 188, 5);
      ctx.fillStyle = 'rgba(15, 10, 5, 0.35)';
      ctx.fillRect(sx + 18, 148, 8, 5);
      ctx.fillRect(sx + 162, 148, 8, 5);
      // Stacked celadon bowls
      for (let b = 0; b < 3; b += 1) {
        ctx.fillStyle = b === 2 ? '#e4f0e8' : '#a8ccb7';
        roundedRectPath(ctx, sx + 18, 137 - b * 4.5, 24, 6, 3);
        ctx.fill();
      }
      // Ceramic sake & shoyu flasks + spice tins
      for (const [dx, col, h] of [[66, '#7a4928', 15], [90, '#466e5c', 13], [116, '#c77d32', 12], [142, '#2b241f', 16], [164, '#d9b568', 11]]) {
        ctx.fillStyle = col;
        roundedRectPath(ctx, sx + dx, 143 - h, 14, h, 3);
        ctx.fill();
        ctx.fillStyle = 'rgba(255, 250, 232, 0.35)';
        ctx.fillRect(sx + dx + 3, 145 - h, 3, h - 4);
      }
    }

    // Celadon/Mint Glazed Subway Backsplash Strip (y: 150..164)
    ctx.fillStyle = theme === 'lantern' ? '#2c4744' : '#c6e2d2';
    ctx.fillRect(20, 150, CANVAS_WIDTH - 40, 14);
    ctx.strokeStyle = theme === 'lantern' ? 'rgba(255,255,255,0.12)' : 'rgba(72, 104, 88, 0.25)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(20, 157);
    ctx.lineTo(CANVAS_WIDTH - 20, 157);
    for (let tx = 44; tx < CANVAS_WIDTH - 20; tx += 36) {
      ctx.moveTo(tx, 150);
      ctx.lineTo(tx, 164);
    }
    ctx.stroke();

    // Baseboard Floor/Wall Seam (y: 164..168) + soft downward shadow onto Row 0
    ctx.fillStyle = theme === 'lantern' ? '#1c140e' : '#573a1d';
    ctx.fillRect(20, 164, CANVAS_WIDTH - 40, 4);

    // Continuous 2.5D Kyoto Open-Kitchen Floor (y: 168..672)
    const floorX = GRID_X0 - 8;
    const floorY = GRID_Y0;
    const floorW = GRID_COLS * TILE_W + 16;
    const floorH = GRID_ROWS * TILE_H;

    const floorGrad = ctx.createLinearGradient(0, floorY, 0, floorY + floorH);
    if (theme === 'lantern') {
      floorGrad.addColorStop(0, '#362d26');
      floorGrad.addColorStop(1, '#26201b');
    } else if (theme === 'afternoon') {
      floorGrad.addColorStop(0, '#ecd4a8');
      floorGrad.addColorStop(1, '#dab67e');
    } else {
      floorGrad.addColorStop(0, '#f7ecd3');
      floorGrad.addColorStop(1, '#e8d4ab');
    }
    ctx.fillStyle = floorGrad;
    roundedRectPath(ctx, floorX, floorY, floorW, floorH, 8);
    ctx.fill();

    ctx.save();
    ctx.beginPath();
    roundedRectPath(ctx, floorX, floorY, floorW, floorH, 8);
    ctx.clip();

    // Floor shadow directly below back wall seam
    const wallAo = ctx.createLinearGradient(0, floorY, 0, floorY + 26);
    wallAo.addColorStop(0, 'rgba(18, 12, 6, 0.28)');
    wallAo.addColorStop(1, 'rgba(18, 12, 6, 0)');
    ctx.fillStyle = wallAo;
    ctx.fillRect(floorX, floorY, floorW, 26);

    // Warm hinoki wood planks across floor with staggered plank seams
    ctx.strokeStyle = theme === 'lantern' ? 'rgba(255, 224, 178, 0.07)' : 'rgba(145, 102, 52, 0.14)';
    ctx.lineWidth = 1.1;
    const plankH = 28;
    for (let py = floorY + plankH, rowIdx = 0; py < floorY + floorH; py += plankH, rowIdx += 1) {
      ctx.beginPath();
      ctx.moveTo(floorX, py);
      ctx.lineTo(floorX + floorW, py);
      ctx.stroke();
      const offset = (rowIdx % 2) * 68;
      for (let px = floorX + offset + 68; px < floorX + floorW; px += 136) {
        ctx.beginPath();
        ctx.moveTo(px, py - plankH);
        ctx.lineTo(px, py);
        ctx.stroke();
      }
    }

    // Crisp Celadon/Mint Glazed Ceramic Tile Inlay Zones (breaks out of Copper/Saffron/Ember palette!)
    const tileLight = theme === 'lantern' ? 'rgba(54, 92, 88, 0.44)' : 'rgba(182, 222, 200, 0.62)';
    const tileAlt = theme === 'lantern' ? 'rgba(42, 74, 72, 0.44)' : 'rgba(154, 204, 178, 0.56)';
    const drawCeladonStrip = (c0, r0, wC, hR) => {
      const sx = GRID_X0 + c0 * TILE_W;
      const sy = GRID_Y0 + r0 * TILE_H;
      const tw = TILE_W / 2;
      const th = TILE_H / 2;
      for (let r = 0; r < hR * 2; r += 1) {
        for (let c = 0; c < wC * 2; c += 1) {
          ctx.fillStyle = (r + c) % 2 === 0 ? tileLight : tileAlt;
          ctx.fillRect(sx + c * tw + 1, sy + r * th + 1, tw - 2, th - 2);
        }
      }
    };

    if (theme === 'lantern') {
      drawCeladonStrip(3, 1, 12, 1);
      drawCeladonStrip(3, 2, 2, 2);
      drawCeladonStrip(13, 2, 2, 2);
      drawCeladonStrip(1, 4, 16, 1);
    } else {
      drawCeladonStrip(1, 1, 16, 1);
      drawCeladonStrip(1, 4, 16, 1);
    }

    // Woven anti-slip kitchen runner mats aligned to open aisles
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
      ctx.fillStyle = theme === 'lantern' ? 'rgba(18, 24, 30, 0.72)' : 'rgba(38, 64, 52, 0.22)';
      roundedRectPath(ctx, rm.x, rm.y, rm.w, rm.h, 9);
      ctx.fill();
      ctx.save();
      ctx.setLineDash([8, 6]);
      ctx.strokeStyle = theme === 'lantern' ? 'rgba(224, 174, 96, 0.34)' : 'rgba(228, 198, 134, 0.56)';
      ctx.lineWidth = 1.4;
      roundedRectPath(ctx, rm.x + 4, rm.y + 4, rm.w - 8, rm.h - 8, 6);
      ctx.stroke();
      ctx.restore();
    }

    if (theme === 'daylight' || theme === 'afternoon') {
      // Slanting sunlight shafts directly from the 3 back-wall shoji windows
      ctx.fillStyle = theme === 'afternoon' ? 'rgba(255, 208, 114, 0.28)' : 'rgba(255, 252, 222, 0.36)';
      for (const sx of [96, 556, 1016]) {
        ctx.beginPath();
        ctx.moveTo(sx, floorY);
        ctx.lineTo(sx + 174, floorY);
        ctx.lineTo(sx + 340, floorY + floorH);
        ctx.lineTo(sx + 166, floorY + floorH);
        ctx.closePath();
        ctx.fill();
      }
    } else {
      // Real warm orange-gold lantern pools cast onto the timber & celadon floor
      const pulse = 0.92 + Math.sin(clock * 2.5) * 0.08;
      for (const [lx, ly] of [[68, 250], [68, 490], [430, 175], [850, 175], [1180, 250], [1180, 490]]) {
        const lg = ctx.createRadialGradient(lx, ly, 10, lx, ly, 230 * pulse);
        lg.addColorStop(0, 'rgba(255, 168, 64, 0.42)');
        lg.addColorStop(0.55, 'rgba(255, 140, 44, 0.16)');
        lg.addColorStop(1, 'rgba(255, 140, 44, 0)');
        ctx.fillStyle = lg;
        ctx.beginPath();
        ctx.arc(lx, ly, 230, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  }

  function renderTopRail(orders, audioMuted, clock, hoverZone) {
    const railGrad = ctx.createLinearGradient(0, 0, 0, 112);
    railGrad.addColorStop(0, '#18211d');
    railGrad.addColorStop(1, '#26332c');
    ctx.fillStyle = railGrad;
    ctx.fillRect(0, 0, CANVAS_WIDTH, 112);

    ctx.fillStyle = '#c89f56';
    ctx.fillRect(14, 5, 704, 3.5);

    // 4 Washi paper order tickets with clean internal padding
    for (let i = 0; i < HUD_LAYOUT.tickets.length; i += 1) {
      const box = HUD_LAYOUT.tickets[i];
      const ticket = orders.tickets[i];
      const tilt = TICKET_TILTS[i % TICKET_TILTS.length];

      if (!ticket) {
        drawPanel(ctx, box, 'rgba(255, 248, 232, 0.05)', 'rgba(182, 204, 174, 0.22)', 9, 1);
        ctx.fillStyle = 'rgba(224, 234, 220, 0.36)';
        ctx.font = '700 10.5px "Trebuchet MS", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('OPEN SLOT', box.x + box.w / 2, box.y + box.h / 2 + 4);
        continue;
      }

      const recipe = RECIPE_MAP[ticket.recipeId];
      const ratio = Math.max(0, Math.min(1, ticket.patience / ticket.maxPatience));
      const isUrgent = ratio < 0.30;
      const pulse = isUrgent ? 0.5 + Math.sin(clock * 11) * 0.5 : 0;

      ctx.save();
      const px = box.x + box.w / 2;
      const py = box.y + 4;
      ctx.translate(px, py);
      ctx.rotate(tilt);
      ctx.translate(-px, -py);

      const bg = isUrgent
        ? `rgb(255, ${Math.round(234 - pulse * 28)}, ${Math.round(218 - pulse * 30)})`
        : '#fcf8ee';
      drawPanel(ctx, box, bg, isUrgent ? '#e5484d' : '#c9a66b', 9, isUrgent ? 2.4 : 1.4);

      ctx.fillStyle = recipe.badgeBg;
      roundedRectPath(ctx, box.x + 6, box.y + 6, box.w - 12, 19, 5);
      ctx.fill();

      ctx.fillStyle = '#ffe9b8';
      ctx.font = '700 9.5px "Trebuchet MS", sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(ticket.ticketNumber, box.x + 11, box.y + 19);

      ctx.fillStyle = '#ffffff';
      ctx.font = '800 10px "Trebuchet MS", sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(recipe.shortName, box.x + box.w - 11, box.y + 19);

      drawPlatedDish(
        ctx,
        recipe.id,
        recipe.steps.map((s) => s.ingredientId),
        box.x + 31,
        box.y + 53,
        19,
        { showPlate: true },
      );

      for (let sIdx = 0; sIdx < recipe.steps.length; sIdx += 1) {
        const step = recipe.steps[sIdx];
        const ing = INGREDIENT_MAP[step.ingredientId];
        const sy = box.y + 33 + sIdx * 16;
        ctx.fillStyle = '#efe7d3';
        roundedRectPath(ctx, box.x + 58, sy - 4, 100, 13, 4);
        ctx.fill();

        ctx.fillStyle = ing.accent;
        ctx.beginPath();
        ctx.arc(box.x + 66, sy + 2.5, 3.4, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#24201a';
        ctx.font = '700 9px "Trebuchet MS", sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(ing.shortLabel, box.x + 73, sy + 5.5);

        const tag = step.requiredState === 'grilled'
          ? 'GRL'
          : step.requiredState === 'fried'
            ? 'FRY'
            : step.requiredState === 'boiled'
              ? 'BOIL'
              : step.requiredState === 'chopped'
                ? 'CHP'
                : 'RAW';
        ctx.fillStyle = '#6e5739';
        ctx.textAlign = 'right';
        ctx.fillText(tag, box.x + 153, sy + 5.5);
      }

      const barX = box.x + 8;
      const barY = box.y + box.h - 12;
      const barW = box.w - 16;
      ctx.fillStyle = '#dfd6be';
      roundedRectPath(ctx, barX, barY, barW, 7, 3.5);
      ctx.fill();
      ctx.fillStyle = ratio > 0.55 ? '#2ebd6b' : ratio > 0.30 ? '#f2b632' : '#e5484d';
      roundedRectPath(ctx, barX, barY, Math.max(6, barW * ratio), 7, 3.5);
      ctx.fill();
      ctx.restore();
    }

    const shift = SHIFTS[orders.shiftIndex] ?? SHIFTS[0];
    const tBox = HUD_LAYOUT.timerBox;
    const lowTime = !shift.endless && orders.shiftTimeLeft <= 20;
    drawPanel(ctx, tBox, lowTime ? '#421a18' : '#1b2620', lowTime ? '#ef685c' : '#96b593', 10, 1.8);
    ctx.fillStyle = '#b9d4b6';
    ctx.font = '700 10px "Trebuchet MS", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(shift.endless ? 'ENDLESS' : 'SHIFT TIMER', tBox.x + tBox.w / 2, tBox.y + 18);
    drawIcon(ctx, 'clock', tBox.x + 28, tBox.y + 50, 20, lowTime ? '#ff8b7b' : '#f4cf6b');
    ctx.fillStyle = lowTime ? '#ffb1a6' : '#f9f5e8';
    ctx.font = '900 31px "Trebuchet MS", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(
      shift.endless ? `${orders.dishesServed} DISHES` : formatTimer(orders.shiftTimeLeft),
      shift.endless ? tBox.x + 42 : tBox.x + 46,
      tBox.y + 60,
    );
    ctx.fillStyle = '#c9d9c6';
    ctx.font = '700 9.5px "Trebuchet MS", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(shift.endless ? `MISSED ${orders.missedTickets}/3` : shift.name.toUpperCase(), tBox.x + tBox.w / 2, tBox.y + 82);

    const sBox = HUD_LAYOUT.scoreBox;
    drawPanel(ctx, sBox, '#1b2620', '#96b593', 10, 1.8);
    ctx.fillStyle = '#b9d4b6';
    ctx.font = '700 10px "Trebuchet MS", sans-serif';
    ctx.fillText('EARNINGS', sBox.x + sBox.w / 2, sBox.y + 18);
    ctx.fillStyle = '#92f0a1';
    ctx.font = '900 30px "Trebuchet MS", sans-serif';
    ctx.fillText(`$${orders.score}`, sBox.x + sBox.w / 2, sBox.y + 57);
    ctx.fillStyle = '#d1e0ce';
    ctx.font = '700 10.5px "Trebuchet MS", sans-serif';
    ctx.fillText(`TARGET $${shift.targetScore}`, sBox.x + sBox.w / 2, sBox.y + 82);

    const cBox = HUD_LAYOUT.comboBox;
    const hot = orders.combo >= 2;
    drawPanel(ctx, cBox, hot ? '#573014' : '#1b2620', hot ? '#ffd05b' : '#7a9978', 10, 1.8);
    ctx.fillStyle = '#b9d4b6';
    ctx.font = '700 9.5px "Trebuchet MS", sans-serif';
    ctx.fillText('COMBO', cBox.x + cBox.w / 2, cBox.y + 18);
    ctx.fillStyle = hot ? '#ffe169' : '#d2ded0';
    ctx.font = '900 28px "Trebuchet MS", sans-serif';
    ctx.fillText(`x${orders.combo}`, cBox.x + cBox.w / 2, cBox.y + 57);
    ctx.fillStyle = hot ? '#ffbd59' : '#95ad92';
    ctx.font = '700 9.5px "Trebuchet MS", sans-serif';
    ctx.fillText(hot ? 'HOT!' : 'STREAK', cBox.x + cBox.w / 2, cBox.y + 82);

    const btns = [
      { rect: HUD_LAYOUT.pauseBtn, id: 'btn_pause', label: 'PAUSE [P]', icon: 'pause' },
      { rect: HUD_LAYOUT.muteBtn, id: 'btn_mute', label: audioMuted ? 'MUTED [M]' : 'AUDIO [M]', icon: audioMuted ? 'sound_off' : 'sound_on' },
      { rect: HUD_LAYOUT.guideBtn, id: 'btn_guide', label: 'RECIPES [H]', icon: 'book' },
    ];
    for (const b of btns) {
      const h = hoverZone === b.id;
      drawPanel(ctx, b.rect, h ? '#3b4f42' : '#202d25', h ? '#ffe07d' : '#7f9e7d', 7, 1.4);
      drawIcon(ctx, b.icon, b.rect.x + 15, b.rect.y + 13.5, 11.5, '#f5ebc8');
      ctx.fillStyle = '#f5f2e6';
      ctx.font = '700 10.5px "Trebuchet MS", sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(b.label, b.rect.x + 28, b.rect.y + 17.5);
    }

    ctx.fillStyle = '#c89f56';
    ctx.fillRect(0, 110, CANVAS_WIDTH, 2);
  }

  function renderKitchenWorld(kitchen, orders, chef, layout, hoverZone, clock) {
    // High-contrast dual-stroke dotted route line
    if (chef.path.length > 0) {
      ctx.save();
      ctx.lineCap = 'round';
      ctx.setLineDash([10, 8]);
      ctx.strokeStyle = 'rgba(20, 14, 6, 0.55)';
      ctx.lineWidth = 6.5;
      ctx.beginPath();
      ctx.moveTo(chef.x, chef.y);
      for (const wp of chef.path) ctx.lineTo(wp.x, wp.y);
      ctx.stroke();
      ctx.strokeStyle = 'rgba(255, 232, 134, 0.94)';
      ctx.lineWidth = 4.2;
      ctx.stroke();
      ctx.setLineDash([]);
      const dest = chef.path[chef.path.length - 1];
      const ringR = 12 + Math.sin(clock * 8) * 2.2;
      ctx.strokeStyle = 'rgba(255, 234, 146, 0.95)';
      ctx.lineWidth = 2.6;
      ctx.beginPath();
      ctx.arc(dest.x, dest.y, ringR, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // 2.5D Y-sorted drawables so the 1.62x chef passes behind/in front of kitchen islands naturally
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
          hoverZone === `st:${st.id}`,
        ),
      };
    });
    drawList.push({
      sortY: chef.y + 22,
      draw: () => drawTopDownChef(ctx, chef, kitchen.heldItem, clock),
    });
    drawList.sort((a, b) => a.sortY - b.sortY);
    for (let i = 0; i < drawList.length; i += 1) {
      drawList[i].draw();
    }

    // Real warm lantern illumination pass + soft evening vignette on Lantern Dinner Service
    if (layout.theme === 'lantern') {
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      for (const [lx, ly] of [[68, 250], [68, 490], [430, 175], [850, 175], [1180, 250], [1180, 490]]) {
        const glow = ctx.createRadialGradient(lx, ly, 8, lx, ly, 195);
        glow.addColorStop(0, 'rgba(255, 165, 62, 0.14)');
        glow.addColorStop(1, 'rgba(255, 140, 44, 0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(lx, ly, 195, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      const vig = ctx.createRadialGradient(640, 400, 340, 640, 400, 740);
      vig.addColorStop(0, 'rgba(8, 10, 16, 0)');
      vig.addColorStop(1, 'rgba(8, 10, 16, 0.34)');
      ctx.fillStyle = vig;
      ctx.fillRect(0, 112, CANVAS_WIDTH, CANVAS_HEIGHT - 112);

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
  }

  function renderParticlesAndStatus(kitchen, layout) {
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

    for (let i = 0; i < kitchen.popups.length; i += 1) {
      const pop = kitchen.popups[i];
      const alpha = Math.min(1, (pop.life / pop.maxLife) * 1.45);
      ctx.save();
      ctx.globalAlpha = alpha;
      const pill = { x: pop.x - 70, y: pop.y - 16, w: 140, h: 32 };
      drawPanel(ctx, pill, 'rgba(18, 26, 21, 0.96)', pop.color, 8, 1.7);
      ctx.textAlign = 'center';
      ctx.fillStyle = pop.color;
      ctx.font = '900 14.5px "Trebuchet MS", sans-serif';
      ctx.fillText(pop.text, pop.x, pop.y - 1);
      if (pop.subtext) {
        ctx.font = '800 9.5px "Trebuchet MS", sans-serif';
        ctx.fillStyle = '#fff5d6';
        ctx.fillText(pop.subtext, pop.x, pop.y + 11.5);
      }
      ctx.restore();
    }

    const sb = HUD_LAYOUT.statusBar;
    drawPanel(ctx, sb, 'rgba(22, 30, 25, 0.94)', 'rgba(162, 190, 158, 0.35)', 8, 1.2);
    let textX = sb.x + 14;
    if (kitchen.heldItem) {
      const pill = { x: sb.x + 6, y: sb.y + 3, w: 232, h: sb.h - 6 };
      drawPanel(ctx, pill, '#2e3f34', '#ffe07d', 6, 1.3);
      if (kitchen.heldItem.kind === 'dish') {
        drawPlatedDish(ctx, kitchen.heldItem.recipeId, ['rice', 'salmon', 'yuzu', 'noodles', 'shrimp', 'chicken', 'curry', 'scallion'], pill.x + 19, pill.y + 14, 12, { showPlate: true });
        ctx.textAlign = 'left';
        ctx.fillStyle = '#92f0a1';
        ctx.font = '800 11px "Trebuchet MS", sans-serif';
        ctx.fillText(`CARRYING: ${RECIPE_MAP[kitchen.heldItem.recipeId].shortName}`, pill.x + 36, sb.y + 21);
      } else {
        const spec = INGREDIENT_MAP[kitchen.heldItem.ingredientId];
        drawIngredientSprite(ctx, kitchen.heldItem.ingredientId, kitchen.heldItem.state, pill.x + 19, pill.y + 14, 0.52);
        ctx.textAlign = 'left';
        ctx.fillStyle = '#ffe5a3';
        ctx.font = '800 11px "Trebuchet MS", sans-serif';
        ctx.fillText(`HOLDING: ${spec.shortLabel} (${kitchen.heldItem.state.toUpperCase()})`, pill.x + 36, sb.y + 21);
      }
      textX = pill.x + pill.w + 14;
    }

    ctx.textAlign = 'left';
    if (kitchen.banner.timer > 0 && kitchen.banner.text) {
      ctx.fillStyle = kitchen.banner.color;
      ctx.font = '800 12px "Trebuchet MS", sans-serif';
      ctx.fillText(kitchen.banner.text, textX, sb.y + 21);
    } else {
      ctx.fillStyle = '#d5e2d3';
      ctx.font = '700 11.5px "Trebuchet MS", sans-serif';
      ctx.fillText('CONTROLS: Click Station or [WASD] Move  |  [Space/E] Interact  |  [Q] Dash  |  [1-8] Pantry  |  [X] Trash', textX, sb.y + 21);
    }
    ctx.textAlign = 'right';
    ctx.fillStyle = '#b9d4b6';
    ctx.font = '800 11px "Trebuchet MS", sans-serif';
    ctx.fillText(`YUZU & HINOKI  -  ${layout.title.toUpperCase()}`, sb.x + sb.w - 14, sb.y + 21);
  }

  function renderTitleOverlay(selectedShift, hoverZone, clock) {
    ctx.fillStyle = 'rgba(18, 24, 20, 0.72)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    drawPanel(ctx, { x: 112, y: 62, w: 1056, h: 594 }, 'rgba(26, 36, 30, 0.96)', '#c89f56', 20, 2.5);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#a8cfa3';
    ctx.font = '800 14px "Trebuchet MS", sans-serif';
    ctx.fillText('SUNLIT KYOTO OPEN-KITCHEN', 640, 110);

    ctx.fillStyle = '#fbf7ec';
    ctx.font = '900 52px "Trebuchet MS", sans-serif';
    ctx.fillText('YUZU & HINOKI', 640, 166);

    ctx.fillStyle = '#d2e0cf';
    ctx.font = '600 15.5px "Trebuchet MS", sans-serif';
    ctx.fillText('Navigate spatial kitchen islands, master grill, fryer, boiler & knife prep, and serve 6 combinable dishes.', 640, 200);

    for (let i = 0; i < RECIPES.length; i += 1) {
      const r = RECIPES[i];
      const rx = 205 + i * 174;
      const ry = 296;
      drawPanel(ctx, { x: rx - 78, y: ry - 60, w: 156, h: 126 }, '#1c2620', '#6d8c6a', 12, 1.4);
      drawPlatedDish(
        ctx,
        r.id,
        r.steps.map((s) => s.ingredientId),
        rx,
        ry - 8,
        33,
        { showPlate: true, glow: i === Math.floor(clock) % 6 },
      );
      ctx.fillStyle = '#ffe9bf';
      ctx.font = '800 11.5px "Trebuchet MS", sans-serif';
      ctx.fillText(r.shortName, rx, ry + 48);
    }

    for (let i = 0; i < SHIFTS.length; i += 1) {
      const shift = SHIFTS[i];
      const card = HUD_LAYOUT.titleShiftCards[i];
      const active = selectedShift === i;
      const hovered = hoverZone === `shift_${i}`;
      drawPanel(
        ctx,
        card,
        active ? '#334d3c' : hovered ? '#283c30' : '#1b2620',
        active ? '#ffe07d' : hovered ? '#b4d6af' : '#638060',
        12,
        active ? 2.5 : 1.5,
      );
      ctx.fillStyle = active ? '#ffe59c' : '#f2ede0';
      ctx.font = '800 13px "Trebuchet MS", sans-serif';
      ctx.fillText(shift.name, card.x + card.w / 2, card.y + 34);
      ctx.fillStyle = '#bfd4bc';
      ctx.font = '600 11px "Trebuchet MS", sans-serif';
      ctx.fillText(shift.subtitle, card.x + card.w / 2, card.y + 58);
      ctx.fillStyle = '#92f0a1';
      ctx.font = '700 11.5px "Trebuchet MS", sans-serif';
      ctx.fillText(
        shift.endless ? 'Target $360+' : `${shift.durationSec}s  |  Target $${shift.targetScore}`,
        card.x + card.w / 2,
        card.y + 84,
      );
    }

    const sb = HUD_LAYOUT.titleStartBtn;
    const sbHover = hoverZone === 'title_start';
    drawPanel(ctx, sb, sbHover ? '#3c8a57' : '#2d7346', '#ffe49e', 14, 2);
    ctx.fillStyle = '#fff9ec';
    ctx.font = '900 22px "Trebuchet MS", sans-serif';
    ctx.fillText('OPEN KITCHEN  [SPACE]', sb.x + sb.w / 2, sb.y + 39);
  }

  function renderPauseOverlay(hoverZone) {
    ctx.fillStyle = 'rgba(14, 20, 16, 0.74)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    drawPanel(ctx, { x: 420, y: 204, w: 440, h: 326 }, '#1b2620', '#c89f56', 18, 2.5);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#fbf7ec';
    ctx.font = '900 32px "Trebuchet MS", sans-serif';
    ctx.fillText('SERVICE PAUSED', 640, 266);

    const items = [
      { rect: HUD_LAYOUT.pauseResumeBtn, id: 'pause_resume', label: 'RESUME SERVICE [P]', fill: '#2c7546' },
      { rect: HUD_LAYOUT.pauseRestartBtn, id: 'pause_restart', label: 'RESTART SHIFT', fill: '#3f5445' },
      { rect: HUD_LAYOUT.pauseTitleBtn, id: 'pause_title', label: 'MAIN MENU', fill: '#2c3b31' },
    ];
    for (const item of items) {
      const h = hoverZone === item.id;
      drawPanel(ctx, item.rect, item.fill, h ? '#ffe07d' : '#96b593', 10, 2);
      ctx.fillStyle = '#fff6e4';
      ctx.font = '800 16px "Trebuchet MS", sans-serif';
      ctx.fillText(item.label, item.rect.x + item.rect.w / 2, item.rect.y + 33);
    }
  }

  function renderGuideOverlay() {
    ctx.fillStyle = 'rgba(14, 20, 16, 0.80)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    drawPanel(ctx, { x: 110, y: 74, w: 1060, h: 572 }, '#1b2620', '#c89f56', 18, 2.5);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffe9bf';
    ctx.font = '900 26px "Trebuchet MS", sans-serif';
    ctx.fillText('KYOTO RECIPE BOOK (6 COMBINABLE DISHES)', 640, 120);

    for (let i = 0; i < RECIPES.length; i += 1) {
      const r = RECIPES[i];
      const col = i % 2;
      const row = Math.floor(i / 2);
      const rx = 148 + col * 504;
      const ry = 148 + row * 144;
      drawPanel(ctx, { x: rx, y: ry, w: 480, h: 130 }, '#141d18', '#6d8c6a', 12, 1.4);
      drawPlatedDish(
        ctx,
        r.id,
        r.steps.map((s) => s.ingredientId),
        rx + 66,
        ry + 66,
        40,
        { showPlate: true },
      );

      ctx.textAlign = 'left';
      ctx.fillStyle = '#ffe5ad';
      ctx.font = '800 15px "Trebuchet MS", sans-serif';
      ctx.fillText(`${r.name}  ($${r.basePrice})`, rx + 126, ry + 32);

      for (let sIdx = 0; sIdx < r.steps.length; sIdx += 1) {
        const st = r.steps[sIdx];
        const ing = INGREDIENT_MAP[st.ingredientId];
        ctx.fillStyle = '#dce8da';
        ctx.font = '700 12.5px "Trebuchet MS", sans-serif';
        ctx.fillText(`${sIdx + 1}. [${ing.key}] ${ing.shortLabel} -> ${st.label}`, rx + 126, ry + 62 + sIdx * 24);
      }
    }

    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffe07d';
    ctx.font = '700 13.5px "Trebuchet MS", sans-serif';
    ctx.fillText('Click anywhere or press [H] / [ESC] to close', 640, 616);
  }

  function renderShiftSummaryOverlay(orders, hoverZone) {
    ctx.fillStyle = 'rgba(24, 19, 13, 0.34)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    drawPanel(ctx, { x: 120, y: 58, w: 1040, h: 604 }, 'rgba(22, 33, 27, 0.96)', '#d9b568', 22, 3.2);
    drawPanel(ctx, { x: 132, y: 70, w: 1016, h: 580 }, null, 'rgba(217, 181, 104, 0.28)', 16, 1.4);

    // Flanking culinary showcase dishes inside modal header
    drawPlatedDish(ctx, 'yuzu_ramen', ['noodles', 'yuzu', 'scallion'], 248, 178, 56, { showPlate: true, glow: true });
    drawPlatedDish(ctx, 'teriyaki_salmon', ['rice', 'salmon', 'yuzu'], 1032, 178, 56, { showPlate: true, glow: true });

    const shift = SHIFTS[orders.shiftIndex] ?? SHIFTS[0];
    ctx.textAlign = 'center';
    ctx.fillStyle = '#b4d6af';
    ctx.font = '800 15px "Trebuchet MS", sans-serif';
    ctx.fillText(shift.name.toUpperCase(), 640, 114);

    ctx.fillStyle = '#fbf7ec';
    ctx.font = '900 46px "Trebuchet MS", sans-serif';
    ctx.fillText('SHIFT COMPLETE', 640, 166);

    for (let i = 0; i < 3; i += 1) {
      const lit = i < orders.starsEarned;
      const sx = 528 + i * 112;
      const sy = 228;
      if (lit) {
        const starGlow = ctx.createRadialGradient(sx, sy, 6, sx, sy, 46);
        starGlow.addColorStop(0, 'rgba(255, 215, 80, 0.54)');
        starGlow.addColorStop(1, 'rgba(255, 215, 80, 0)');
        ctx.fillStyle = starGlow;
        ctx.beginPath();
        ctx.arc(sx, sy, 46, 0, Math.PI * 2);
        ctx.fill();
      }
      drawIcon(ctx, 'star', sx, sy, 62, lit ? '#ffd34e' : '#3d4d42');
    }

    ctx.fillStyle = '#92f0a1';
    ctx.font = '900 68px "Trebuchet MS", sans-serif';
    ctx.fillText(`$${orders.score}`, 640, 332);
    ctx.fillStyle = '#d1e0ce';
    ctx.font = '700 15px "Trebuchet MS", sans-serif';
    ctx.fillText(`TARGET $${shift.targetScore}   |   3-STAR GOAL $${shift.starThresholds[2]}`, 640, 364);

    const stats = [
      { label: 'DISHES SERVED', val: `${orders.dishesServed}` },
      { label: 'PERFECT COOKS', val: `${orders.perfectDishes}` },
      { label: 'TIPS EARNED', val: `+$${orders.tipsEarned}` },
      { label: 'BEST COMBO', val: `x${orders.bestCombo}` },
    ];
    for (let i = 0; i < stats.length; i += 1) {
      const st = stats[i];
      const sx = 172 + i * 240;
      const sy = 404;
      drawPanel(ctx, { x: sx, y: sy, w: 216, h: 116 }, '#17211b', '#7a9978', 14, 1.6);
      ctx.fillStyle = '#b9d4b6';
      ctx.font = '800 12.5px "Trebuchet MS", sans-serif';
      ctx.fillText(st.label, sx + 108, sy + 36);
      ctx.fillStyle = '#ffe5a8';
      ctx.font = '900 36px "Trebuchet MS", sans-serif';
      ctx.fillText(st.val, sx + 108, sy + 86);
    }

    const hasNext = orders.shiftIndex < SHIFTS.length - 1;
    const btns = [
      { rect: HUD_LAYOUT.summaryNextBtn, id: 'summary_next', label: hasNext ? 'NEXT SHIFT [SPACE]' : 'PLAY AGAIN [SPACE]', fill: '#2c7546' },
      { rect: HUD_LAYOUT.summaryReplayBtn, id: 'summary_replay', label: 'REPLAY [R]', fill: '#3f5445' },
      { rect: HUD_LAYOUT.summaryEndlessBtn, id: 'summary_endless', label: 'ENDLESS MODE', fill: '#2c3b31' },
    ];
    for (const b of btns) {
      const h = hoverZone === b.id;
      drawPanel(ctx, b.rect, b.fill, h ? '#ffe07d' : '#c89f56', 12, 2.2);
      ctx.fillStyle = '#fff8ea';
      ctx.font = '800 16px "Trebuchet MS", sans-serif';
      ctx.fillText(b.label, b.rect.x + b.rect.w / 2, b.rect.y + 37);
    }
  }

  function render(state) {
    const { kitchen, orders, chef, layout, screen, selectedShift, audioMuted, guideOpen, pointer, clock } = state;

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    renderFloorAndLighting(layout, clock);
    renderTopRail(orders, audioMuted, clock, pointer.hoverZone);
    renderKitchenWorld(kitchen, orders, chef, layout, pointer.hoverZone, clock);
    renderParticlesAndStatus(kitchen, layout);

    if (screen === SCREEN_TITLE) renderTitleOverlay(selectedShift, pointer.hoverZone, clock);
    else if (screen === SCREEN_PAUSED) renderPauseOverlay(pointer.hoverZone);
    else if (screen === SCREEN_SUMMARY) renderShiftSummaryOverlay(orders, pointer.hoverZone);

    if (guideOpen) renderGuideOverlay();
  }

  return { render };
}
