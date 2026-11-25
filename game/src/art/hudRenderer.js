// HUD, Top Order Rail, floating score popups, bottom status bar, and modal overlays
// for Yuzu & Hinoki using textured washi paper & hinoki wood patterns.

import {
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  HUD_LAYOUT,
  INGREDIENT_MAP,
  RECIPES,
  RECIPE_MAP,
  SHIFTS,
} from '../config/recipes.js';
import { SCREEN_PAUSED, SCREEN_SUMMARY, SCREEN_TITLE } from '../engine/gameLoop.js';
import { drawIcon, drawIngredientSprite, drawPlatedDish, roundedRectPath } from './sprites.js';

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

export function createHudRenderer(ctx, textures) {
  function renderTopRail(orders, audioMuted, clock, hoverZone) {
    const railGrad = ctx.createLinearGradient(0, 0, 0, 112);
    railGrad.addColorStop(0, '#18211d');
    railGrad.addColorStop(1, '#26332c');
    ctx.fillStyle = railGrad;
    ctx.fillRect(0, 0, CANVAS_WIDTH, 112);

    ctx.fillStyle = '#c89f56';
    ctx.fillRect(14, 5, 704, 3.5);

    const washiPat = textures?.patterns?.washiPaper ?? '#fcf8ee';

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
      const isCritical = ratio < 0.28;
      const isUrgent = ratio < 0.48;
      const pulse = isCritical ? 0.5 + Math.sin(clock * 11) * 0.5 : 0;

      ctx.save();
      const px = box.x + box.w / 2;
      const py = box.y + 4;
      ctx.translate(px, py);
      ctx.rotate(tilt);
      ctx.translate(-px, -py);

      const bg = isCritical
        ? `rgb(255, ${Math.round(226 - pulse * 28)}, ${Math.round(206 - pulse * 30)})`
        : isUrgent
          ? '#fff0cc'
          : washiPat;
      const borderCol = isCritical ? '#e5484d' : isUrgent ? '#eb8b1e' : '#c9a66b';
      drawPanel(ctx, box, bg, borderCol, 9, isUrgent ? 2.4 : 1.4);

      ctx.fillStyle = isCritical ? '#b3282d' : isUrgent ? '#b85a10' : recipe.badgeBg;
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
        ctx.fillStyle = isUrgent ? '#f7dfb0' : '#efe7d3';
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
      ctx.fillStyle = ratio > 0.48 ? '#2ebd6b' : ratio > 0.28 ? '#f29524' : '#e5484d';
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

  function renderPopupsAndStatusBar(kitchen, layout) {
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
    drawPanel(ctx, sb, 'rgba(22, 30, 25, 0.95)', 'rgba(162, 190, 158, 0.35)', 8, 1.2);
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
    ctx.fillText('LIVING KYOTO IZAKAYA KITCHEN', 640, 110);

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
    ctx.fillStyle = 'rgba(20, 16, 11, 0.30)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    drawPanel(ctx, { x: 120, y: 58, w: 1040, h: 604 }, 'rgba(22, 33, 27, 0.96)', '#d9b568', 22, 3.2);
    drawPanel(ctx, { x: 132, y: 70, w: 1016, h: 580 }, null, 'rgba(217, 181, 104, 0.34)', 16, 1.4);

    // Warm hinoki timber header accent bar inside Shift Complete modal
    if (textures?.patterns?.hinokiWood) {
      drawPanel(ctx, { x: 400, y: 76, w: 480, h: 34 }, textures.patterns.hinokiWood, '#8a5d2e', 8, 1.5);
    }

    drawPlatedDish(ctx, 'yuzu_ramen', ['noodles', 'yuzu', 'scallion'], 248, 178, 56, { showPlate: true, glow: true });
    drawPlatedDish(ctx, 'teriyaki_salmon', ['rice', 'salmon', 'yuzu'], 1032, 178, 56, { showPlate: true, glow: true });

    const shift = SHIFTS[orders.shiftIndex] ?? SHIFTS[0];
    ctx.textAlign = 'center';
    ctx.fillStyle = textures?.patterns?.hinokiWood ? '#2d1c0c' : '#b4d6af';
    ctx.font = '900 14.5px "Trebuchet MS", sans-serif';
    ctx.fillText(shift.name.toUpperCase(), 640, 98);

    ctx.fillStyle = '#fbf7ec';
    ctx.font = '900 46px "Trebuchet MS", sans-serif';
    ctx.fillText('SHIFT COMPLETE', 640, 166);

    for (let i = 0; i < 3; i += 1) {
      const lit = i < orders.starsEarned;
      const sx = 528 + i * 112;
      const sy = 228;
      if (lit) {
        const starGlow = ctx.createRadialGradient(sx, sy, 6, sx, sy, 46);
        starGlow.addColorStop(0, 'rgba(255, 215, 80, 0.56)');
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

  function renderHud(state) {
    const { kitchen, orders, layout, screen, selectedShift, audioMuted, guideOpen, pointer, clock, sceneManager } = state;

    renderTopRail(orders, audioMuted, clock, pointer.hoverZone);
    renderPopupsAndStatusBar(kitchen, layout);

    if (screen === SCREEN_TITLE) renderTitleOverlay(selectedShift, pointer.hoverZone, clock);
    else if (screen === SCREEN_PAUSED) renderPauseOverlay(pointer.hoverZone);
    else if (screen === SCREEN_SUMMARY) renderShiftSummaryOverlay(orders, pointer.hoverZone);

    if (guideOpen) renderGuideOverlay();

    const fade = sceneManager?.getTransitionAlpha ? sceneManager.getTransitionAlpha() : 0;
    if (fade > 0) {
      ctx.fillStyle = `rgba(18, 22, 18, ${fade * 0.4})`;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    }
  }

  return { renderHud };
}
