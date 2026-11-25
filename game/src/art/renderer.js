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
  ctx.fillStyle = fill;
  ctx.fill();
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

    // Outer architectural frame around kitchen floor
    ctx.fillStyle = theme === 'lantern' ? '#171b24' : '#2a241d';
    ctx.fillRect(0, 116, CANVAS_WIDTH, CANVAS_HEIGHT - 116);

    // Handcrafted hinoki timber beam valance trim along top wall (y: 116..129)
    const beamGrad = ctx.createLinearGradient(0, 116, 0, 129);
    beamGrad.addColorStop(0, theme === 'lantern' ? '#4a301e' : '#8a5d32');
    beamGrad.addColorStop(0.55, theme === 'lantern' ? '#362113' : '#6e4722');
    beamGrad.addColorStop(1, theme === 'lantern' ? '#24150c' : '#4f3216');
    ctx.fillStyle = beamGrad;
    ctx.fillRect(0, 116, CANVAS_WIDTH, 13);
    ctx.fillStyle = 'rgba(255, 236, 194, 0.22)';
    ctx.fillRect(0, 116, CANVAS_WIDTH, 1.5);
    for (let jx = 44; jx < CANVAS_WIDTH; jx += 180) {
      ctx.fillStyle = '#c89f56';
      ctx.beginPath();
      ctx.arc(jx, 122.5, 2.2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Continuous 2.5D Kyoto open-kitchen floor (no static 4-box dashboard!)
    const floorX = GRID_X0 - 8;
    const floorY = GRID_Y0 - 6;
    const floorW = GRID_COLS * TILE_W + 16;
    const floorH = GRID_ROWS * TILE_H + 12;

    const floorGrad = ctx.createLinearGradient(0, floorY, 0, floorY + floorH);
    if (theme === 'lantern') {
      floorGrad.addColorStop(0, '#2b3240');
      floorGrad.addColorStop(1, '#1e232e');
    } else if (theme === 'afternoon') {
      floorGrad.addColorStop(0, '#e8cda0');
      floorGrad.addColorStop(1, '#d4b27d');
    } else {
      floorGrad.addColorStop(0, '#f4e8ce');
      floorGrad.addColorStop(1, '#e3cfa9');
    }
    ctx.fillStyle = floorGrad;
    roundedRectPath(ctx, floorX, floorY, floorW, floorH, 12);
    ctx.fill();

    // Subtle hinoki wood plank / celadon tile pattern across continuous kitchen floor
    ctx.save();
    ctx.beginPath();
    roundedRectPath(ctx, floorX, floorY, floorW, floorH, 12);
    ctx.clip();

    ctx.strokeStyle = theme === 'lantern' ? 'rgba(255, 225, 175, 0.06)' : 'rgba(130, 96, 48, 0.11)';
    ctx.lineWidth = 1;
    for (let r = 0; r <= GRID_ROWS; r += 1) {
      const y = GRID_Y0 + r * TILE_H;
      ctx.beginPath();
      ctx.moveTo(floorX, y);
      ctx.lineTo(floorX + floorW, y);
      ctx.stroke();
    }
    for (let c = 0; c <= GRID_COLS; c += 1) {
      const x = GRID_X0 + c * TILE_W;
      ctx.beginPath();
      ctx.moveTo(x, floorY);
      ctx.lineTo(x, floorY + floorH);
      ctx.stroke();
    }

    // Celadon backsplash accent band behind North cooking line
    ctx.fillStyle = theme === 'lantern' ? 'rgba(42, 68, 66, 0.48)' : 'rgba(136, 178, 155, 0.38)';
    ctx.fillRect(floorX, floorY, floorW, TILE_H + 8);

    // Woven anti-slip kitchen runner mats along Walkways Row 1 & Row 4 (eliminates floor void)
    for (const matRow of [1, 4]) {
      const mx = GRID_X0 + 18;
      const my = GRID_Y0 + matRow * TILE_H + 10;
      const mw = GRID_COLS * TILE_W - 36;
      const mh = TILE_H - 20;
      ctx.fillStyle = theme === 'lantern' ? 'rgba(20, 26, 36, 0.72)' : 'rgba(48, 62, 53, 0.24)';
      roundedRectPath(ctx, mx, my, mw, mh, 10);
      ctx.fill();
      ctx.save();
      ctx.setLineDash([8, 6]);
      ctx.strokeStyle = theme === 'lantern' ? 'rgba(215, 168, 96, 0.28)' : 'rgba(198, 158, 94, 0.42)';
      ctx.lineWidth = 1.4;
      roundedRectPath(ctx, mx + 4, my + 4, mw - 8, mh - 8, 7);
      ctx.stroke();
      ctx.restore();

      ctx.strokeStyle = theme === 'lantern' ? 'rgba(255, 224, 172, 0.06)' : 'rgba(34, 48, 40, 0.11)';
      ctx.lineWidth = 1;
      for (let ry = my + 12; ry < my + mh - 8; ry += 11) {
        ctx.beginPath();
        ctx.moveTo(mx + 14, ry);
        ctx.lineTo(mx + mw - 14, ry);
        ctx.stroke();
      }
    }

    if (theme === 'daylight' || theme === 'afternoon') {
      // Slanting Kyoto morning/afternoon sunlight shafts with shoji lattice bars
      ctx.fillStyle = theme === 'afternoon' ? 'rgba(255, 204, 108, 0.28)' : 'rgba(255, 250, 214, 0.34)';
      for (const sx of [120, 500, 880]) {
        ctx.beginPath();
        ctx.moveTo(sx, floorY);
        ctx.lineTo(sx + 180, floorY);
        ctx.lineTo(sx + 350, floorY + floorH);
        ctx.lineTo(sx + 170, floorY + floorH);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = theme === 'afternoon' ? 'rgba(255, 228, 162, 0.14)' : 'rgba(255, 255, 240, 0.18)';
        ctx.beginPath();
        ctx.moveTo(sx + 48, floorY);
        ctx.lineTo(sx + 92, floorY);
        ctx.lineTo(sx + 262, floorY + floorH);
        ctx.lineTo(sx + 218, floorY + floorH);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = theme === 'afternoon' ? 'rgba(255, 204, 108, 0.28)' : 'rgba(255, 250, 214, 0.34)';
      }
    } else {
      // Glowing warm orange-gold lantern pools in Lantern Dinner Service
      const pulse = 0.9 + Math.sin(clock * 2.5) * 0.1;
      for (const [lx, ly] of [[60, 220], [60, 470], [946, 155], [1220, 220], [1220, 470]]) {
        const lg = ctx.createRadialGradient(lx, ly, 12, lx, ly, 210 * pulse);
        lg.addColorStop(0, 'rgba(255, 162, 62, 0.34)');
        lg.addColorStop(1, 'rgba(255, 162, 62, 0)');
        ctx.fillStyle = lg;
        ctx.beginPath();
        ctx.arc(lx, ly, 210, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  }

  function renderTopRail(orders, audioMuted, clock, hoverZone) {
    const railGrad = ctx.createLinearGradient(0, 0, 0, 116);
    railGrad.addColorStop(0, '#18211d');
    railGrad.addColorStop(1, '#26332c');
    ctx.fillStyle = railGrad;
    ctx.fillRect(0, 0, CANVAS_WIDTH, 116);

    // Bamboo/brass hanger bar
    ctx.fillStyle = '#c89f56';
    ctx.fillRect(14, 6, 706, 4);

    // 4 Washi paper order tickets
    for (let i = 0; i < HUD_LAYOUT.tickets.length; i += 1) {
      const box = HUD_LAYOUT.tickets[i];
      const ticket = orders.tickets[i];
      const tilt = TICKET_TILTS[i % TICKET_TILTS.length];

      if (!ticket) {
        drawPanel(ctx, box, 'rgba(255, 248, 232, 0.05)', 'rgba(182, 204, 174, 0.2)', 9, 1);
        ctx.fillStyle = 'rgba(224, 234, 220, 0.32)';
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
      roundedRectPath(ctx, box.x + 5, box.y + 6, box.w - 10, 20, 5);
      ctx.fill();

      ctx.fillStyle = '#ffe9b8';
      ctx.font = '700 9.5px "Trebuchet MS", sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(ticket.ticketNumber, box.x + 10, box.y + 19);

      ctx.fillStyle = '#ffffff';
      ctx.font = '800 10.5px "Trebuchet MS", sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(recipe.shortName, box.x + box.w - 10, box.y + 19);

      drawPlatedDish(
        ctx,
        recipe.id,
        recipe.steps.map((s) => s.ingredientId),
        box.x + 32,
        box.y + 54,
        20,
        { showPlate: true },
      );

      for (let sIdx = 0; sIdx < recipe.steps.length; sIdx += 1) {
        const step = recipe.steps[sIdx];
        const ing = INGREDIENT_MAP[step.ingredientId];
        const sy = box.y + 34 + sIdx * 16;
        ctx.fillStyle = '#efe7d3';
        roundedRectPath(ctx, box.x + 60, sy - 4, 98, 13, 4);
        ctx.fill();

        ctx.fillStyle = ing.accent;
        ctx.beginPath();
        ctx.arc(box.x + 68, sy + 2.5, 3.6, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#24201a';
        ctx.font = '700 9px "Trebuchet MS", sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(ing.shortLabel, box.x + 75, sy + 5.5);

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
        ctx.fillText(tag, box.x + 154, sy + 5.5);
      }

      const barX = box.x + 7;
      const barY = box.y + box.h - 12;
      const barW = box.w - 14;
      ctx.fillStyle = '#dfd6be';
      roundedRectPath(ctx, barX, barY, barW, 7, 3.5);
      ctx.fill();
      ctx.fillStyle = ratio > 0.55 ? '#2ebd6b' : ratio > 0.30 ? '#f2b632' : '#e5484d';
      roundedRectPath(ctx, barX, barY, Math.max(6, barW * ratio), 7, 3.5);
      ctx.fill();
      ctx.restore();
    }

    // Shift Timer Pill
    const shift = SHIFTS[orders.shiftIndex] ?? SHIFTS[0];
    const tBox = HUD_LAYOUT.timerBox;
    const lowTime = !shift.endless && orders.shiftTimeLeft <= 20;
    drawPanel(ctx, tBox, lowTime ? '#421a18' : '#1b2620', lowTime ? '#ef685c' : '#96b593', 10, 1.8);
    ctx.fillStyle = '#b9d4b6';
    ctx.font = '700 10px "Trebuchet MS", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(shift.endless ? 'ENDLESS' : 'SHIFT TIMER', tBox.x + tBox.w / 2, tBox.y + 19);
    drawIcon(ctx, 'clock', tBox.x + 28, tBox.y + 52, 20, lowTime ? '#ff8b7b' : '#f4cf6b');
    ctx.fillStyle = lowTime ? '#ffb1a6' : '#f9f5e8';
    ctx.font = '900 32px "Trebuchet MS", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(
      shift.endless ? `${orders.dishesServed} DISHES` : formatTimer(orders.shiftTimeLeft),
      shift.endless ? tBox.x + 44 : tBox.x + 48,
      tBox.y + 62,
    );
    ctx.fillStyle = '#c9d9c6';
    ctx.font = '700 9.5px "Trebuchet MS", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(shift.endless ? `MISSED ${orders.missedTickets}/3` : shift.name.toUpperCase(), tBox.x + tBox.w / 2, tBox.y + 84);

    // Score Pill
    const sBox = HUD_LAYOUT.scoreBox;
    drawPanel(ctx, sBox, '#1b2620', '#96b593', 10, 1.8);
    ctx.fillStyle = '#b9d4b6';
    ctx.font = '700 10px "Trebuchet MS", sans-serif';
    ctx.fillText('EARNINGS', sBox.x + sBox.w / 2, sBox.y + 19);
    ctx.fillStyle = '#92f0a1';
    ctx.font = '900 30px "Trebuchet MS", sans-serif';
    ctx.fillText(`$${orders.score}`, sBox.x + sBox.w / 2, sBox.y + 58);
    ctx.fillStyle = '#d1e0ce';
    ctx.font = '700 10.5px "Trebuchet MS", sans-serif';
    ctx.fillText(`TARGET $${shift.targetScore}`, sBox.x + sBox.w / 2, sBox.y + 83);

    // Combo Pill
    const cBox = HUD_LAYOUT.comboBox;
    const hot = orders.combo >= 2;
    drawPanel(ctx, cBox, hot ? '#573014' : '#1b2620', hot ? '#ffd05b' : '#7a9978', 10, 1.8);
    ctx.fillStyle = '#b9d4b6';
    ctx.font = '700 9.5px "Trebuchet MS", sans-serif';
    ctx.fillText('COMBO', cBox.x + cBox.w / 2, cBox.y + 19);
    ctx.fillStyle = hot ? '#ffe169' : '#d2ded0';
    ctx.font = '900 28px "Trebuchet MS", sans-serif';
    ctx.fillText(`x${orders.combo}`, cBox.x + cBox.w / 2, cBox.y + 58);
    ctx.fillStyle = hot ? '#ffbd59' : '#95ad92';
    ctx.font = '700 9.5px "Trebuchet MS", sans-serif';
    ctx.fillText(hot ? 'HOT!' : 'STREAK', cBox.x + cBox.w / 2, cBox.y + 83);

    // Utility buttons
    const btns = [
      { rect: HUD_LAYOUT.pauseBtn, id: 'btn_pause', label: 'PAUSE [P]', icon: 'pause' },
      { rect: HUD_LAYOUT.muteBtn, id: 'btn_mute', label: audioMuted ? 'MUTED [M]' : 'AUDIO [M]', icon: audioMuted ? 'sound_off' : 'sound_on' },
      { rect: HUD_LAYOUT.guideBtn, id: 'btn_guide', label: 'RECIPES [H]', icon: 'book' },
    ];
    for (const b of btns) {
      const h = hoverZone === b.id;
      drawPanel(ctx, b.rect, h ? '#3b4f42' : '#202d25', h ? '#ffe07d' : '#7f9e7d', 7, 1.4);
      drawIcon(ctx, b.icon, b.rect.x + 15, b.rect.y + 14.5, 12, '#f5ebc8');
      ctx.fillStyle = '#f5f2e6';
      ctx.font = '700 10.5px "Trebuchet MS", sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(b.label, b.rect.x + 28, b.rect.y + 18.5);
    }

    ctx.fillStyle = '#c89f56';
    ctx.fillRect(0, 114, CANVAS_WIDTH, 2);
  }

  function renderKitchenWorld(kitchen, orders, chef, layout, hoverZone, clock) {
    // Draw crisp golden dotted path and destination ring when chef is auto-routing
    if (chef.path.length > 0) {
      ctx.save();
      ctx.strokeStyle = 'rgba(255, 228, 128, 0.85)';
      ctx.lineWidth = 3.5;
      ctx.lineCap = 'round';
      ctx.setLineDash([7, 7]);
      ctx.beginPath();
      ctx.moveTo(chef.x, chef.y);
      for (const wp of chef.path) ctx.lineTo(wp.x, wp.y);
      ctx.stroke();
      ctx.setLineDash([]);
      const dest = chef.path[chef.path.length - 1];
      const ringR = 11 + Math.sin(clock * 8) * 2;
      ctx.strokeStyle = 'rgba(255, 232, 140, 0.9)';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.arc(dest.x, dest.y, ringR, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    for (const st of layout.stations) {
      const rect = stationRect(st);
      const isFocused = chef.focusedStationId === st.id;
      const isHovered = hoverZone === `st:${st.id}`;
      drawStationHardware(ctx, st, rect, kitchen, orders, clock, isFocused, isHovered);
    }

    // Top-down Kyoto chef walking across floor
    drawTopDownChef(ctx, chef, kitchen.heldItem, clock);

    // Decorative hanging chōchin lanterns strictly on outer frames & spice divider (0 UI overlap)
    if (layout.theme === 'lantern') {
      for (const [lx, ly] of [[14, 210], [14, 460], [1266, 210], [1266, 460], [946, 126]]) {
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
        ctx.globalAlpha = alpha * 0.52;
        ctx.strokeStyle = p.color;
        ctx.lineWidth = Math.max(2, p.size * 0.44);
        ctx.lineCap = 'round';
        const wave = Math.sin((p.phase ?? 0) + p.life * 9) * 5;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.quadraticCurveTo(p.x + wave, p.y - 8, p.x - wave * 0.5, p.y - 16);
        ctx.stroke();
      } else {
        ctx.globalAlpha = alpha * 0.92;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    // Compact zero-overlap score popups anchored cleanly in open Row 1 corridor below Pass
    for (let i = 0; i < kitchen.popups.length; i += 1) {
      const pop = kitchen.popups[i];
      const alpha = Math.min(1, (pop.life / pop.maxLife) * 1.45);
      ctx.save();
      ctx.globalAlpha = alpha;
      const pill = { x: pop.x - 68, y: pop.y - 16, w: 136, h: 32 };
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

    // Bottom Status Bar (HOLDING badge on left, never covers pantry trays)
    const sb = HUD_LAYOUT.statusBar;
    drawPanel(ctx, sb, 'rgba(22, 30, 25, 0.92)', 'rgba(162, 190, 158, 0.35)', 8, 1.2);
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
    ctx.fillStyle = 'rgba(14, 20, 16, 0.72)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    drawPanel(ctx, { x: 260, y: 102, w: 760, h: 520 }, 'rgba(24, 34, 28, 0.96)', '#d9b568', 20, 3);

    const shift = SHIFTS[orders.shiftIndex] ?? SHIFTS[0];
    ctx.textAlign = 'center';
    ctx.fillStyle = '#b4d6af';
    ctx.font = '800 13px "Trebuchet MS", sans-serif';
    ctx.fillText(shift.name.toUpperCase(), 640, 144);

    ctx.fillStyle = '#fbf7ec';
    ctx.font = '900 38px "Trebuchet MS", sans-serif';
    ctx.fillText('SHIFT COMPLETE', 640, 190);

    for (let i = 0; i < 3; i += 1) {
      const lit = i < orders.starsEarned;
      const sx = 556 + i * 84;
      const sy = 240;
      if (lit) {
        const starGlow = ctx.createRadialGradient(sx, sy, 4, sx, sy, 34);
        starGlow.addColorStop(0, 'rgba(255, 215, 80, 0.48)');
        starGlow.addColorStop(1, 'rgba(255, 215, 80, 0)');
        ctx.fillStyle = starGlow;
        ctx.beginPath();
        ctx.arc(sx, sy, 34, 0, Math.PI * 2);
        ctx.fill();
      }
      drawIcon(ctx, 'star', sx, sy, 48, lit ? '#ffd34e' : '#3d4d42');
    }

    ctx.fillStyle = '#92f0a1';
    ctx.font = '900 52px "Trebuchet MS", sans-serif';
    ctx.fillText(`$${orders.score}`, 640, 326);
    ctx.fillStyle = '#d1e0ce';
    ctx.font = '700 13px "Trebuchet MS", sans-serif';
    ctx.fillText(`TARGET $${shift.targetScore}   |   3-STAR GOAL $${shift.starThresholds[2]}`, 640, 352);

    const stats = [
      { label: 'DISHES SERVED', val: `${orders.dishesServed}` },
      { label: 'PERFECT COOKS', val: `${orders.perfectDishes}` },
      { label: 'TIPS EARNED', val: `+$${orders.tipsEarned}` },
      { label: 'BEST COMBO', val: `x${orders.bestCombo}` },
    ];
    for (let i = 0; i < stats.length; i += 1) {
      const st = stats[i];
      const sx = 312 + i * 168;
      const sy = 382;
      drawPanel(ctx, { x: sx, y: sy, w: 152, h: 98 }, '#17211b', '#7a9978', 12, 1.5);
      ctx.fillStyle = '#b9d4b6';
      ctx.font = '700 11px "Trebuchet MS", sans-serif';
      ctx.fillText(st.label, sx + 76, sy + 30);
      ctx.fillStyle = '#ffe5a8';
      ctx.font = '900 28px "Trebuchet MS", sans-serif';
      ctx.fillText(st.val, sx + 76, sy + 72);
    }

    const hasNext = orders.shiftIndex < SHIFTS.length - 1;
    const btns = [
      { rect: HUD_LAYOUT.summaryNextBtn, id: 'summary_next', label: hasNext ? 'NEXT SHIFT [SPACE]' : 'PLAY AGAIN [SPACE]', fill: '#2c7546' },
      { rect: HUD_LAYOUT.summaryReplayBtn, id: 'summary_replay', label: 'REPLAY [R]', fill: '#3f5445' },
      { rect: HUD_LAYOUT.summaryEndlessBtn, id: 'summary_endless', label: 'ENDLESS MODE', fill: '#2c3b31' },
    ];
    for (const b of btns) {
      const h = hoverZone === b.id;
      drawPanel(ctx, b.rect, b.fill, h ? '#ffe07d' : '#c89f56', 12, 2);
      ctx.fillStyle = '#fff8ea';
      ctx.font = '800 14.5px "Trebuchet MS", sans-serif';
      ctx.fillText(b.label, b.rect.x + b.rect.w / 2, b.rect.y + 35);
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
