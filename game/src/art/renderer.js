// Warm Artisan Bistro 1280x720 Canvas 2D renderer with continuous butcher-block counter,
// subway tile backsplash, overhead heat-lamp cone, 2.5D cast shadows, and organic layout.

import {
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  INGREDIENTS,
  INGREDIENT_MAP,
  LAYOUT,
  RECIPES,
  RECIPE_MAP,
  SHIFTS,
} from '../config/recipes.js';
import { SCREEN_PAUSED, SCREEN_SUMMARY, SCREEN_TITLE } from '../engine/gameLoop.js';
import {
  drawBrassBell,
  drawChefKnife,
  drawCopperSkillet,
  drawIcon,
  drawIngredientSprite,
  drawPlatedDish,
  roundedRectPath,
} from './sprites.js';

const TICKET_TILTS = [-0.022, 0.017, -0.014, 0.021];

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

function drawCastShadow(ctx, x, y, w, h, radius = 12, dx = 6, dy = 8, alpha = 0.36) {
  ctx.save();
  ctx.fillStyle = `rgba(22, 10, 4, ${alpha})`;
  roundedRectPath(ctx, x + dx, y + dy, w, h, radius);
  ctx.fill();
  ctx.restore();
}

function drawBacksplashPlaque(ctx, cx, cy, w, text) {
  const rect = { x: cx - w / 2, y: cy - 12, w, h: 24 };
  drawCastShadow(ctx, rect.x, rect.y, rect.w, rect.h, 6, 2, 3, 0.22);
  drawPanel(ctx, rect, '#3b2417', '#c7954b', 6, 1.4);
  ctx.fillStyle = '#ffe5b0';
  ctx.font = '800 11.5px "Trebuchet MS", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(text, cx, cy + 4);
}

export function createKitchenRenderer(canvas) {
  const ctx = canvas.getContext('2d');

  function renderBackdrop(clock) {
    // 1. Warm Cream Subway Tile Backsplash (y: 128..214)
    const wallGrad = ctx.createLinearGradient(0, 128, 0, 216);
    wallGrad.addColorStop(0, '#d8c5a8');
    wallGrad.addColorStop(0.35, '#efe2cc');
    wallGrad.addColorStop(1, '#dfc9a6');
    ctx.fillStyle = wallGrad;
    ctx.fillRect(0, 128, CANVAS_WIDTH, 88);

    // Subway tile bricks & soft mortar lines
    const tileH = 22;
    const tileW = 64;
    ctx.strokeStyle = 'rgba(138, 112, 82, 0.34)';
    ctx.lineWidth = 1.2;
    for (let row = 0; row < 4; row += 1) {
      const y = 128 + row * tileH;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(CANVAS_WIDTH, y);
      ctx.stroke();
      const offset = row % 2 === 0 ? 0 : tileW / 2;
      for (let x = -offset; x <= CANVAS_WIDTH; x += tileW) {
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, y + tileH);
        ctx.stroke();
      }
    }

    // Subtle upper soffit cast shadow onto tiles
    const topShadow = ctx.createLinearGradient(0, 128, 0, 152);
    topShadow.addColorStop(0, 'rgba(32, 16, 8, 0.36)');
    topShadow.addColorStop(1, 'rgba(32, 16, 8, 0)');
    ctx.fillStyle = topShadow;
    ctx.fillRect(0, 128, CANVAS_WIDTH, 24);

    // 2. Continuous Honey-Oak Butcher-Block Countertop (y: 214..564)
    const oakGrad = ctx.createLinearGradient(0, 214, 0, 564);
    oakGrad.addColorStop(0, '#b57b45');
    oakGrad.addColorStop(0.12, '#c88f56');
    oakGrad.addColorStop(0.75, '#bf844c');
    oakGrad.addColorStop(1, '#9c6432');
    ctx.fillStyle = oakGrad;
    ctx.fillRect(0, 214, CANVAS_WIDTH, 350);

    // Alternating butcher-block wood strips
    const plankColors = [
      'rgba(255, 224, 178, 0.07)',
      'rgba(92, 46, 16, 0.08)',
      'rgba(255, 214, 156, 0.05)',
      'rgba(78, 36, 10, 0.06)',
    ];
    for (let i = 0; i < 10; i += 1) {
      ctx.fillStyle = plankColors[i % plankColors.length];
      ctx.fillRect(0, 214 + i * 35, CANVAS_WIDTH, 35);
    }

    // Subtle curved wood-grain streaks across the continuous surface
    ctx.strokeStyle = 'rgba(84, 42, 16, 0.14)';
    ctx.lineWidth = 1.5;
    for (let gy = 228; gy < 548; gy += 36) {
      ctx.beginPath();
      ctx.moveTo(0, gy);
      ctx.bezierCurveTo(340, gy - 6, 820, gy + 7, CANVAS_WIDTH, gy - 2);
      ctx.stroke();
    }

    // Back counter molding seam
    ctx.fillStyle = '#734420';
    ctx.fillRect(0, 211, CANVAS_WIDTH, 4);

    // 3D beveled oak front lip casting depth shadow
    const lipGrad = ctx.createLinearGradient(0, 550, 0, 566);
    lipGrad.addColorStop(0, '#d39b60');
    lipGrad.addColorStop(0.55, '#9d6230');
    lipGrad.addColorStop(1, '#583113');
    ctx.fillStyle = lipGrad;
    ctx.fillRect(0, 550, CANVAS_WIDTH, 16);

    // 3. Dark Walnut Lower Pantry Cabinetry (y: 566..720)
    const cabGrad = ctx.createLinearGradient(0, 566, 0, CANVAS_HEIGHT);
    cabGrad.addColorStop(0, '#362014');
    cabGrad.addColorStop(0.25, '#2b190f');
    cabGrad.addColorStop(1, '#1a0e08');
    ctx.fillStyle = cabGrad;
    ctx.fillRect(0, 566, CANVAS_WIDTH, CANVAS_HEIGHT - 566);

    const lipShadow = ctx.createLinearGradient(0, 566, 0, 582);
    lipShadow.addColorStop(0, 'rgba(10, 4, 1, 0.55)');
    lipShadow.addColorStop(1, 'rgba(10, 4, 1, 0)');
    ctx.fillStyle = lipShadow;
    ctx.fillRect(0, 566, CANVAS_WIDTH, 16);

    // 4. Overhead Brass Heat-Lamp Hood & Warm Conical Beam over Serving Pass
    const sp = LAYOUT.servingPass;
    const lampPulse = 0.92 + Math.sin(clock * 2.8) * 0.08;
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(sp.cx - 56, 152);
    ctx.lineTo(sp.cx + 56, 152);
    ctx.lineTo(sp.cx + 150, 430);
    ctx.lineTo(sp.cx - 150, 430);
    ctx.closePath();
    const beamGrad = ctx.createLinearGradient(sp.cx, 152, sp.cx, 430);
    beamGrad.addColorStop(0, `rgba(255, 224, 130, ${0.34 * lampPulse})`);
    beamGrad.addColorStop(0.65, `rgba(255, 210, 102, ${0.18 * lampPulse})`);
    beamGrad.addColorStop(1, 'rgba(255, 210, 102, 0)');
    ctx.fillStyle = beamGrad;
    ctx.fill();
    ctx.restore();

    // Physical brushed-brass heat-lamp hood
    const hoodGrad = ctx.createLinearGradient(sp.cx - 64, 130, sp.cx + 64, 154);
    hoodGrad.addColorStop(0, '#f2c16b');
    hoodGrad.addColorStop(0.5, '#c48332');
    hoodGrad.addColorStop(1, '#784613');
    ctx.fillStyle = hoodGrad;
    ctx.beginPath();
    ctx.moveTo(sp.cx - 26, 130);
    ctx.lineTo(sp.cx + 26, 130);
    ctx.lineTo(sp.cx + 64, 154);
    ctx.lineTo(sp.cx - 64, 154);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#fff1b8';
    ctx.fillRect(sp.cx - 54, 152, 108, 3);

    // Inlaid brass station plaques on backsplash wall
    drawBacksplashPlaque(ctx, LAYOUT.hearthZone.x + LAYOUT.hearthZone.w / 2, 149, 206, 'COPPER HEARTH  [Q / E]');
    drawBacksplashPlaque(ctx, LAYOUT.choppingBoard.cx, 149, 186, 'OAK CHOPPING  [C]');
    drawBacksplashPlaque(ctx, LAYOUT.assemblyBoard.cx, 149, 198, 'PLATING SLATE  [A]');
    drawBacksplashPlaque(ctx, sp.cx, 174, 172, 'WARM PASS  [SPACE]');
  }

  function renderTopOrderRail(orders, audioMuted, clock, hoverZone) {
    // Espresso timber soffit
    const railGrad = ctx.createLinearGradient(0, 0, 0, 128);
    railGrad.addColorStop(0, '#1c100b');
    railGrad.addColorStop(1, '#311d14');
    ctx.fillStyle = railGrad;
    ctx.fillRect(0, 0, CANVAS_WIDTH, 128);

    // Brushed brass ticket rail & mounting brackets
    const rodGrad = ctx.createLinearGradient(0, 7, 0, 13);
    rodGrad.addColorStop(0, '#f5cc7a');
    rodGrad.addColorStop(1, '#9c6c28');
    ctx.fillStyle = rodGrad;
    ctx.fillRect(14, 7, 712, 5);

    // Up to 4 cream order tickets with organic tilt & cast shadow
    for (let i = 0; i < LAYOUT.tickets.length; i += 1) {
      const box = LAYOUT.tickets[i];
      const ticket = orders.tickets[i];
      const tilt = TICKET_TILTS[i % TICKET_TILTS.length];

      if (!ticket) {
        drawPanel(ctx, box, 'rgba(255, 240, 215, 0.04)', 'rgba(212, 165, 86, 0.16)', 10, 1);
        ctx.fillStyle = 'rgba(245, 224, 190, 0.28)';
        ctx.font = '700 11px "Trebuchet MS", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('OPEN TICKET', box.x + box.w / 2, box.y + box.h / 2 + 4);
        continue;
      }

      const recipe = RECIPE_MAP[ticket.recipeId];
      const ratio = Math.max(0, Math.min(1, ticket.patience / ticket.maxPatience));
      const isUrgent = ratio < 0.30;
      const pulse = isUrgent ? 0.5 + Math.sin(clock * 11) * 0.5 : 0;

      ctx.save();
      const pivotX = box.x + box.w / 2;
      const pivotY = box.y + 4;
      ctx.translate(pivotX, pivotY);
      ctx.rotate(tilt);
      ctx.translate(-pivotX, -pivotY);

      drawCastShadow(ctx, box.x, box.y, box.w, box.h, 9, 4, 6, 0.45);
      const paperBg = isUrgent
        ? `rgb(255, ${Math.round(236 - pulse * 28)}, ${Math.round(220 - pulse * 30)})`
        : '#fcf6e8';
      const border = isUrgent ? '#e5484d' : '#c99b52';
      drawPanel(ctx, box, paperBg, border, 9, isUrgent ? 2.5 : 1.5);

      // Brass hanger clip
      ctx.fillStyle = '#e0b05c';
      roundedRectPath(ctx, box.x + box.w / 2 - 14, box.y - 5, 28, 9, 3);
      ctx.fill();

      // Header strip
      ctx.fillStyle = recipe.badgeBg;
      roundedRectPath(ctx, box.x + 6, box.y + 8, box.w - 12, 22, 5);
      ctx.fill();

      ctx.fillStyle = '#ffe9b8';
      ctx.font = '700 10px "Trebuchet MS", sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(ticket.ticketNumber, box.x + 11, box.y + 22);

      ctx.fillStyle = '#ffffff';
      ctx.font = '800 11px "Trebuchet MS", sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(recipe.shortName, box.x + box.w - 11, box.y + 22);

      drawPlatedDish(
        ctx,
        recipe.id,
        recipe.steps.map((s) => s.ingredientId),
        box.x + 34,
        box.y + 59,
        22,
        { showPlate: true },
      );

      for (let sIdx = 0; sIdx < recipe.steps.length; sIdx += 1) {
        const step = recipe.steps[sIdx];
        const ing = INGREDIENT_MAP[step.ingredientId];
        const sy = box.y + 39 + sIdx * 17;
        ctx.fillStyle = '#efe1c7';
        roundedRectPath(ctx, box.x + 64, sy - 4, 92, 14, 4);
        ctx.fill();

        ctx.fillStyle = ing.accent;
        ctx.beginPath();
        ctx.arc(box.x + 73, sy + 3, 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#2d1c12';
        ctx.font = '700 9.5px "Trebuchet MS", sans-serif';
        ctx.textAlign = 'left';
        const tag = step.requiredState === 'cooked' ? 'PAN' : step.requiredState === 'chopped' ? 'CHP' : 'RAW';
        ctx.fillText(ing.shortLabel, box.x + 81, sy + 6);
        ctx.fillStyle = '#7c5333';
        ctx.textAlign = 'right';
        ctx.fillText(tag, box.x + 152, sy + 6);
      }

      const barX = box.x + 8;
      const barY = box.y + box.h - 14;
      const barW = box.w - 16;
      ctx.fillStyle = '#d9ccb2';
      roundedRectPath(ctx, barX, barY, barW, 8, 4);
      ctx.fill();

      const barColor = ratio > 0.55 ? '#2ebd6b' : ratio > 0.30 ? '#f2b632' : '#e5484d';
      ctx.fillStyle = barColor;
      roundedRectPath(ctx, barX, barY, Math.max(6, barW * ratio), 8, 4);
      ctx.fill();

      ctx.restore();
    }

    // Shift Timer Pill
    const shift = SHIFTS[orders.shiftIndex] ?? SHIFTS[0];
    const tBox = LAYOUT.timerBox;
    const lowTime = !shift.endless && orders.shiftTimeLeft <= 20;
    drawCastShadow(ctx, tBox.x, tBox.y, tBox.w, tBox.h, 12, 3, 4, 0.35);
    drawPanel(
      ctx,
      tBox,
      lowTime ? '#421917' : '#24150e',
      lowTime ? '#ef685c' : '#c9974c',
      12,
      2,
    );
    ctx.fillStyle = '#d9b578';
    ctx.font = '700 11px "Trebuchet MS", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(shift.endless ? 'ENDLESS SHIFT' : 'SHIFT TIMER', tBox.x + tBox.w / 2, tBox.y + 22);

    drawIcon(ctx, 'clock', tBox.x + 30, tBox.y + 56, 22, lowTime ? '#ff8b7b' : '#f4c76b');
    ctx.fillStyle = lowTime ? '#ffb1a6' : '#fff5df';
    ctx.font = '900 34px "Trebuchet MS", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(
      shift.endless ? `${orders.dishesServed} PLATES` : formatTimer(orders.shiftTimeLeft),
      shift.endless ? tBox.x + 48 : tBox.x + 50,
      tBox.y + 68,
    );

    ctx.fillStyle = '#cbb08a';
    ctx.font = '700 10.5px "Trebuchet MS", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(
      shift.endless ? `MISSED: ${orders.missedTickets}/3` : shift.name.toUpperCase(),
      tBox.x + tBox.w / 2,
      tBox.y + 92,
    );

    // Score & Target Pill
    const sBox = LAYOUT.scoreBox;
    drawCastShadow(ctx, sBox.x, sBox.y, sBox.w, sBox.h, 12, 3, 4, 0.35);
    drawPanel(ctx, sBox, '#24150e', '#c9974c', 12, 2);
    ctx.fillStyle = '#d9b578';
    ctx.font = '700 11px "Trebuchet MS", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('EARNINGS', sBox.x + sBox.w / 2, sBox.y + 22);

    ctx.fillStyle = '#92f0a1';
    ctx.font = '900 32px "Trebuchet MS", sans-serif';
    ctx.fillText(`$${orders.score}`, sBox.x + sBox.w / 2, sBox.y + 62);

    ctx.fillStyle = '#d6bfa0';
    ctx.font = '700 11px "Trebuchet MS", sans-serif';
    ctx.fillText(`TARGET $${shift.targetScore}`, sBox.x + sBox.w / 2, sBox.y + 88);

    // Combo Multiplier Pill
    const cBox = LAYOUT.comboBox;
    const hot = orders.combo >= 2;
    drawCastShadow(ctx, cBox.x, cBox.y, cBox.w, cBox.h, 12, 3, 4, 0.35);
    drawPanel(ctx, cBox, hot ? '#572810' : '#24150e', hot ? '#ffd05b' : '#8b6838', 12, 2);
    ctx.fillStyle = '#d9b578';
    ctx.font = '700 10px "Trebuchet MS", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('COMBO', cBox.x + cBox.w / 2, cBox.y + 22);

    ctx.fillStyle = hot ? '#ffe169' : '#cbb698';
    ctx.font = '900 30px "Trebuchet MS", sans-serif';
    ctx.fillText(`x${orders.combo}`, cBox.x + cBox.w / 2, cBox.y + 62);

    ctx.fillStyle = hot ? '#ffbd59' : '#967c5c';
    ctx.font = '700 10px "Trebuchet MS", sans-serif';
    ctx.fillText(hot ? 'HOT!' : 'STREAK', cBox.x + cBox.w / 2, cBox.y + 88);

    // Top-right Utility Buttons
    const buttons = [
      { rect: LAYOUT.pauseBtn, id: 'btn_pause', label: 'PAUSE [P]', icon: 'pause' },
      { rect: LAYOUT.muteBtn, id: 'btn_mute', label: audioMuted ? 'MUTED [M]' : 'AUDIO [M]', icon: audioMuted ? 'sound_off' : 'sound_on' },
      { rect: LAYOUT.guideBtn, id: 'btn_guide', label: 'RECIPES [H]', icon: 'book' },
    ];
    for (const b of buttons) {
      const active = hoverZone === b.id;
      drawPanel(ctx, b.rect, active ? '#4c301d' : '#2a1a12', active ? '#ffd076' : '#9b7238', 8, 1.5);
      drawIcon(ctx, b.icon, b.rect.x + 17, b.rect.y + 16, 13, '#ffe4b0');
      ctx.fillStyle = '#f8e9cf';
      ctx.font = '700 11px "Trebuchet MS", sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(b.label, b.rect.x + 30, b.rect.y + 20);
    }

    ctx.fillStyle = '#ba8a42';
    ctx.fillRect(0, 126, CANVAS_WIDTH, 3);
  }

  function renderMainKitchen(kitchen, orders, hoverZone, clock) {
    // 1. Recessed Cast-Iron Bistro Range + Dual Copper Skillets
    const rangeRect = { x: 24, y: 174, w: 308, h: 368 };
    drawCastShadow(ctx, rangeRect.x, rangeRect.y, rangeRect.w, rangeRect.h, 14, 5, 7, 0.38);
    drawPanel(ctx, rangeRect, '#4a433e', '#998b7c', 14, 2);
    drawPanel(ctx, { x: 32, y: 182, w: 292, h: 334 }, '#221e1c', '#5e534a', 10, 1.5);

    // Brass stove control knobs on front range bevel
    for (let k = 0; k < 4; k += 1) {
      const kx = 64 + k * 76;
      const ky = 529;
      ctx.fillStyle = '#d4a353';
      ctx.beginPath();
      ctx.arc(kx, ky, 7.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#3b2414';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(kx, ky - 5);
      ctx.lineTo(kx, ky + 1);
      ctx.stroke();
    }

    for (let i = 0; i < LAYOUT.skillets.length; i += 1) {
      const box = LAYOUT.skillets[i];
      const sk = kitchen.skillets[i];
      const isHovered = hoverZone === `skillet_${i}`;
      const spec = sk.item ? INGREDIENT_MAP[sk.item.ingredientId] : null;

      if (isHovered || sk.heatZone === 'perfect') {
        drawPanel(
          ctx,
          { x: box.x + 8, y: box.y + 8, w: box.w - 16, h: box.h - 16 },
          'rgba(255, 224, 130, 0.04)',
          sk.heatZone === 'perfect' ? '#4ae388' : '#ffd076',
          12,
          2,
        );
      }

      drawCopperSkillet(ctx, box.cx, box.cy, box.r, sk, clock, spec);

      const infoX = box.x + 252;
      ctx.textAlign = 'center';
      ctx.fillStyle = '#e7cba1';
      ctx.font = '800 11.5px "Trebuchet MS", sans-serif';
      ctx.fillText(box.label, infoX, box.y + 38);

      if (!sk.item) {
        ctx.fillStyle = 'rgba(235, 210, 175, 0.48)';
        ctx.font = '700 10.5px "Trebuchet MS", sans-serif';
        ctx.fillText('READY', infoX, box.y + 84);
        ctx.fillText('Beef, Salmon,', infoX, box.y + 102);
        ctx.fillText('Ramen, Dough', infoX, box.y + 117);
      } else {
        const badgeColor = sk.heatZone === 'perfect'
          ? '#229653'
          : sk.heatZone === 'warning' || sk.heatZone === 'burnt'
            ? '#c93c37'
            : '#b8681f';
        const statusText = sk.heatZone === 'perfect'
          ? 'PERFECT!'
          : sk.heatZone === 'burnt'
            ? 'BURNT!'
            : sk.heatZone === 'warning'
              ? 'PULL NOW!'
              : 'SEARING...';

        drawPanel(ctx, { x: infoX - 42, y: box.y + 54, w: 84, h: 28 }, badgeColor, '#fff0c8', 7, 1.4);
        ctx.fillStyle = '#ffffff';
        ctx.font = '800 11px "Trebuchet MS", sans-serif';
        ctx.fillText(statusText, infoX, box.y + 72);

        ctx.fillStyle = '#ffe5ba';
        ctx.font = '700 11px "Trebuchet MS", sans-serif';
        ctx.fillText(spec.shortLabel, infoX, box.y + 104);

        ctx.fillStyle = '#caa97e';
        ctx.font = '700 10px "Trebuchet MS", sans-serif';
        ctx.fillText(sk.item.state === 'raw' ? 'Cooking...' : `Pull [${box.key}]`, infoX, box.y + 123);
      }
    }

    // 2. Physical 2.5D End-Grain Oak Chopping Block directly on counter
    const cb = LAYOUT.choppingBoard;
    const cbHover = hoverZone === 'chop_board';
    const boardSlab = { x: cb.x + 14, y: 218, w: cb.w - 28, h: 240 };

    // Directional cast shadow + 3D front thickness edge
    drawCastShadow(ctx, boardSlab.x, boardSlab.y, boardSlab.w, boardSlab.h + 12, 16, 7, 9, 0.36);
    drawPanel(ctx, { x: boardSlab.x, y: boardSlab.y + 12, w: boardSlab.w, h: boardSlab.h }, '#73411d', '#542c11', 16, 1.5);

    const oakBlockGrad = ctx.createLinearGradient(boardSlab.x, boardSlab.y, boardSlab.x + boardSlab.w, boardSlab.y + boardSlab.h);
    oakBlockGrad.addColorStop(0, '#e3b176');
    oakBlockGrad.addColorStop(0.55, '#cb9052');
    oakBlockGrad.addColorStop(1, '#ae7037');
    drawPanel(ctx, boardSlab, oakBlockGrad, cbHover ? '#ffe49e' : '#f0c48b', 16, cbHover ? 2.5 : 1.8);

    // Routed juice groove around cutting block perimeter
    drawPanel(
      ctx,
      { x: boardSlab.x + 12, y: boardSlab.y + 12, w: boardSlab.w - 24, h: boardSlab.h - 24 },
      'rgba(0,0,0,0)',
      'rgba(105, 56, 20, 0.38)',
      10,
      2,
    );

    const board = kitchen.choppingBoard;
    if (board.item) {
      const spec = INGREDIENT_MAP[board.item.ingredientId];
      const chopProgress = board.hitsNeeded > 0 ? board.hitsDone / board.hitsNeeded : 0;
      drawIngredientSprite(ctx, board.item.ingredientId, board.item.state, cb.cx, 332, 1.72, chopProgress);

      if (board.item.state === 'raw') {
        drawChefKnife(ctx, cb.cx + 34, 304, board.knifeAnim);
      }

      // 3-step segmented emerald progress bar on lower oak counter
      for (let step = 0; step < board.hitsNeeded; step += 1) {
        const segW = 58;
        const sx = cb.cx - ((board.hitsNeeded * segW + (board.hitsNeeded - 1) * 8) / 2) + step * (segW + 8);
        const done = step < board.hitsDone;
        drawCastShadow(ctx, sx, 480, segW, 18, 5, 2, 3, 0.28);
        drawPanel(
          ctx,
          { x: sx, y: 480, w: segW, h: 18 },
          done ? '#33c972' : '#2a180d',
          done ? '#b5ffd2' : '#734f30',
          5,
          1.4,
        );
      }

      drawPanel(ctx, { x: cb.x + 26, y: 506, w: cb.w - 52, h: 34 }, 'rgba(34, 18, 9, 0.88)', '#b58446', 8, 1.2);
      ctx.fillStyle = board.item.state === 'chopped' ? '#8ef0a2' : '#ffe3ad';
      ctx.font = '800 12.5px "Trebuchet MS", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(
        board.item.state === 'chopped' ? `${spec.shortLabel} READY [A]` : `CHOP ${board.hitsDone}/${board.hitsNeeded}  [C]`,
        cb.cx,
        527,
      );
    } else {
      drawChefKnife(ctx, cb.cx + 12, 326, 0);
      ctx.fillStyle = 'rgba(72, 38, 15, 0.72)';
      ctx.font = '800 12.5px "Trebuchet MS", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('DROP TRUFFLE OR GARLIC', cb.cx, 396);
      drawPanel(ctx, { x: cb.x + 26, y: 506, w: cb.w - 52, h: 34 }, 'rgba(34, 18, 9, 0.78)', '#8c6438', 8, 1.2);
      ctx.fillStyle = '#e5cba3';
      ctx.font = '700 11px "Trebuchet MS", sans-serif';
      ctx.fillText('Pick [3] or [7], then tap [C]', cb.cx, 527);
    }

    // 3. Honed Charcoal Slate Plating Mat directly on butcher block
    const ab = LAYOUT.assemblyBoard;
    const abHover = hoverZone === 'assembly';
    const slateRect = { x: ab.x + 12, y: 196, w: ab.w - 24, h: 222 };
    drawCastShadow(ctx, slateRect.x, slateRect.y, slateRect.w, slateRect.h + 6, 12, 6, 8, 0.38);
    drawPanel(ctx, { x: slateRect.x, y: slateRect.y + 6, w: slateRect.w, h: slateRect.h }, '#151212', '#2d2624', 12, 1);
    drawPanel(ctx, slateRect, '#292321', abHover ? '#ffd076' : '#695749', 12, abHover ? 2.5 : 1.8);

    const asm = kitchen.assembly;
    const candidateRecipe = asm.candidateIds.length > 0
      ? RECIPE_MAP[asm.candidateIds[0]]
      : orders.tickets[0]
        ? RECIPE_MAP[orders.tickets[0].recipeId]
        : RECIPES[0];

    const platedIds = asm.items.map((it) => it.ingredientId);
    const scaleBoost = 1 + asm.plateAnim * 0.08;

    ctx.save();
    ctx.translate(ab.cx, 294);
    ctx.scale(scaleBoost, scaleBoost);
    drawPlatedDish(ctx, candidateRecipe.id, platedIds, 0, 0, 74, {
      showPlate: true,
      glow: asm.items.length > 0,
    });
    ctx.restore();

    // Dish status plaque directly below slate
    drawPanel(ctx, { x: ab.x + 20, y: 424, w: ab.w - 40, h: 26 }, 'rgba(34, 19, 10, 0.9)', '#b58446', 7, 1.2);
    ctx.textAlign = 'center';
    if (asm.items.length === 0) {
      ctx.fillStyle = '#e5cba3';
      ctx.font = '800 12px "Trebuchet MS", sans-serif';
      ctx.fillText(`NEXT ORDER: ${candidateRecipe.shortName}`, ab.cx, 441);
    } else {
      const label = asm.candidateIds.length > 1
        ? `MID-ASSEMBLY (${asm.items.length}/3) - ${asm.candidateIds.length} MATCHES`
        : `${candidateRecipe.shortName}  (${asm.items.length}/3)`;
      ctx.fillStyle = '#ffe38a';
      ctx.font = '800 12px "Trebuchet MS", sans-serif';
      ctx.fillText(label, ab.cx, 441);
    }

    // 3 Ingredient step badges directly on oak surface
    let highlightedNext = false;
    for (let sIdx = 0; sIdx < candidateRecipe.steps.length; sIdx += 1) {
      const step = candidateRecipe.steps[sIdx];
      const ing = INGREDIENT_MAP[step.ingredientId];
      const isPresent = platedIds.includes(step.ingredientId);
      const isNext = !isPresent && !highlightedNext;
      if (isNext) highlightedNext = true;
      const pillW = 98;
      const px = ab.x + 14 + sIdx * (pillW + 9);
      const py = 454;
      drawCastShadow(ctx, px, py, pillW, 38, 8, 2, 3, 0.25);
      drawPanel(
        ctx,
        { x: px, y: py, w: pillW, h: 38 },
        isPresent ? '#1e4a2d' : isNext ? '#3d2512' : '#26180f',
        isPresent ? '#4ae388' : isNext ? '#ffd166' : '#735337',
        8,
        isPresent || isNext ? 2 : 1.4,
      );
      ctx.fillStyle = isPresent ? '#8ef5b0' : isNext ? '#ffe8a3' : '#d6be9c';
      ctx.font = '800 10.5px "Trebuchet MS", sans-serif';
      ctx.fillText(ing.shortLabel, px + pillW / 2, py + 15);
      ctx.fillStyle = isPresent ? '#5ae38c' : isNext ? '#ffca57' : '#b8915c';
      ctx.font = '700 9px "Trebuchet MS", sans-serif';
      ctx.fillText(isPresent ? 'PLATED' : isNext ? `NEXT: ${step.label.split(' ')[0].toUpperCase()}` : step.label.toUpperCase(), px + pillW / 2, py + 30);
    }

    // Assembly action buttons
    const sendActive = Boolean(asm.completeRecipeId);
    drawCastShadow(ctx, LAYOUT.sendPassBtn.x, LAYOUT.sendPassBtn.y, LAYOUT.sendPassBtn.w, LAYOUT.sendPassBtn.h, 8, 2, 3, 0.3);
    drawPanel(
      ctx,
      LAYOUT.sendPassBtn,
      sendActive ? '#2c7d48' : hoverZone === 'assembly' ? '#52341e' : '#362114',
      sendActive ? '#8ef5b0' : '#d4a353',
      8,
      1.6,
    );
    ctx.fillStyle = '#fff5e0';
    ctx.font = '800 12px "Trebuchet MS", sans-serif';
    ctx.fillText(
      sendActive ? 'SEND TO PASS' : 'PLATE ITEM [A]',
      LAYOUT.sendPassBtn.x + LAYOUT.sendPassBtn.w / 2,
      LAYOUT.sendPassBtn.y + 26,
    );

    drawCastShadow(ctx, LAYOUT.clearAssemblyBtn.x, LAYOUT.clearAssemblyBtn.y, LAYOUT.clearAssemblyBtn.w, LAYOUT.clearAssemblyBtn.h, 8, 2, 3, 0.3);
    drawPanel(
      ctx,
      LAYOUT.clearAssemblyBtn,
      hoverZone === 'clear_assembly' ? '#632722' : '#381c18',
      '#a8574b',
      8,
      1.6,
    );
    ctx.fillStyle = '#f8c6be';
    ctx.font = '800 11.5px "Trebuchet MS", sans-serif';
    ctx.fillText(
      'CLEAR [X]',
      LAYOUT.clearAssemblyBtn.x + LAYOUT.clearAssemblyBtn.w / 2,
      LAYOUT.clearAssemblyBtn.y + 26,
    );

    // 4. Brushed Steel & Brass Warm Serving Pass
    const sp = LAYOUT.servingPass;
    const spHover = hoverZone === 'serve_pass';
    const hasReadyPlate = kitchen.servingPass.plates.length > 0;
    const passShelf = { x: sp.x + 12, y: 196, w: sp.w - 24, h: 266 };

    drawCastShadow(ctx, passShelf.x, passShelf.y, passShelf.w, passShelf.h + 8, 14, 6, 8, 0.4);
    drawPanel(ctx, { x: passShelf.x, y: passShelf.y + 8, w: passShelf.w, h: passShelf.h }, '#63431e', '#402910', 14, 1);

    const passGrad = ctx.createLinearGradient(passShelf.x, passShelf.y, passShelf.x, passShelf.y + passShelf.h);
    passGrad.addColorStop(0, hasReadyPlate ? '#5c4128' : '#4a3a30');
    passGrad.addColorStop(0.55, hasReadyPlate ? '#422c19' : '#352922');
    passGrad.addColorStop(1, '#2b1d14');
    drawPanel(
      ctx,
      passShelf,
      passGrad,
      hasReadyPlate ? '#ffd86b' : spHover ? '#ffd076' : '#c9974c',
      14,
      hasReadyPlate ? 2.5 : 1.8,
    );

    if (hasReadyPlate) {
      const leadPlate = kitchen.servingPass.plates[0];
      const recipe = RECIPE_MAP[leadPlate.recipeId];

      // Radiant READY TO SERVE pill above dish
      drawPanel(ctx, { x: sp.x + 42, y: 208, w: sp.w - 84, h: 28 }, '#228c4e', '#b8ffd6', 14, 1.8);
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 13px "Trebuchet MS", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('READY TO SERVE', sp.cx, 227);

      drawPlatedDish(
        ctx,
        recipe.id,
        recipe.steps.map((s) => s.ingredientId),
        sp.cx,
        322,
        68,
        { showPlate: true, glow: true },
      );

      ctx.fillStyle = '#ffe9b8';
      ctx.font = '800 13px "Trebuchet MS", sans-serif';
      ctx.fillText(recipe.name.toUpperCase(), sp.cx, 416);

      if (kitchen.servingPass.plates.length > 1) {
        const second = RECIPE_MAP[kitchen.servingPass.plates[1].recipeId];
        drawPanel(ctx, { x: sp.x + 30, y: 426, w: sp.w - 60, h: 26 }, '#2b190f', '#c9974c', 7, 1.2);
        ctx.fillStyle = '#f8d88e';
        ctx.font = '700 10.5px "Trebuchet MS", sans-serif';
        ctx.fillText(`+1 QUEUED: ${second.shortName}`, sp.cx, 443);
      } else {
        ctx.fillStyle = '#92f0a1';
        ctx.font = '700 11.5px "Trebuchet MS", sans-serif';
        ctx.fillText('Ring Bell [SPACE] to deliver!', sp.cx, 443);
      }
    } else {
      ctx.strokeStyle = 'rgba(255, 220, 150, 0.28)';
      ctx.setLineDash([6, 6]);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(sp.cx, 322, 58, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = 'rgba(255, 232, 195, 0.56)';
      ctx.font = '700 12px "Trebuchet MS", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('PASS READY ZONE', sp.cx, 318);
      ctx.fillText('Complete 3-step dish', sp.cx, 336);
    }

    // Brass Service Bell Button (with guaranteed spacing between bell and text)
    const bell = LAYOUT.bellBtn;
    drawCastShadow(ctx, bell.x, bell.y, bell.w, bell.h, 12, 3, 5, 0.35);
    drawPanel(
      ctx,
      bell,
      hasReadyPlate ? '#5e3b14' : '#301e12',
      hasReadyPlate ? '#ffda70' : '#966e38',
      12,
      2,
    );
    drawBrassBell(ctx, bell.x + 36, bell.y + 34, kitchen.servingPass.bellAnim, hasReadyPlate, clock);
    ctx.fillStyle = hasReadyPlate ? '#fff7d6' : '#cfb48c';
    ctx.font = '900 14px "Trebuchet MS", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('SERVE ORDER', bell.x + 74, bell.y + 30);
    ctx.fillStyle = hasReadyPlate ? '#92f0a1' : '#a88e6b';
    ctx.font = '700 11px "Trebuchet MS", sans-serif';
    ctx.fillText('Press [SPACE] or Click', bell.x + 74, bell.y + 49);
  }

  function renderPantryCounter(kitchen, hoverZone) {
    for (let i = 0; i < INGREDIENTS.length; i += 1) {
      const ing = INGREDIENTS[i];
      const bin = LAYOUT.pantryBins[i];
      const isHeld = kitchen.heldItem?.ingredientId === ing.id;
      const isHover = hoverZone === `bin_${i}`;

      drawCastShadow(ctx, bin.x, bin.y, bin.w, bin.h, 10, 2, 4, 0.36);
      drawPanel(
        ctx,
        bin,
        isHeld ? '#52341d' : isHover ? '#422918' : '#26170e',
        isHeld ? '#ffe07d' : isHover ? '#f0be6a' : '#8f6537',
        10,
        isHeld ? 2.5 : 1.5,
      );

      // Recessed gastronorm tray interior highlight
      ctx.fillStyle = 'rgba(255, 224, 175, 0.05)';
      roundedRectPath(ctx, bin.x + 6, bin.y + 28, bin.w - 12, 54, 6);
      ctx.fill();

      drawPanel(ctx, { x: bin.x + 8, y: bin.y + 7, w: 22, h: 19 }, '#170e09', '#ba8a42', 5, 1);
      ctx.fillStyle = '#ffe5ad';
      ctx.font = '800 11px "Trebuchet MS", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(ing.key, bin.x + 19, bin.y + 20);

      const badgeColor = ing.prepType === 'cook' ? '#7a331d' : ing.prepType === 'chop' ? '#295735' : '#4a3d27';
      drawPanel(ctx, { x: bin.x + bin.w - 54, y: bin.y + 7, w: 46, h: 18 }, badgeColor, null, 5, 0);
      ctx.fillStyle = '#f9ebd2';
      ctx.font = '700 9px "Trebuchet MS", sans-serif';
      ctx.fillText(ing.prepBadge, bin.x + bin.w - 31, bin.y + 19);

      drawIngredientSprite(ctx, ing.id, 'raw', bin.cx, bin.y + 53, 1.08);

      ctx.fillStyle = '#fff0d4';
      ctx.font = '800 11.5px "Trebuchet MS", sans-serif';
      ctx.fillText(ing.shortLabel, bin.cx, bin.y + 97);
    }

    // Trash Chute
    const tb = LAYOUT.trashBin;
    const tbHover = hoverZone === 'trash';
    drawCastShadow(ctx, tb.x, tb.y, tb.w, tb.h, 10, 2, 4, 0.36);
    drawPanel(
      ctx,
      tb,
      tbHover ? '#59231f' : '#321815',
      tbHover ? '#ff8b7b' : '#9c4b42',
      10,
      1.8,
    );
    drawIcon(ctx, 'trash', tb.cx, tb.y + 44, 28, '#f5b3aa');
    ctx.fillStyle = '#ffd5cf';
    ctx.font = '800 11.5px "Trebuchet MS", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('TRASH [X]', tb.cx, tb.y + 94);

    // Bottom 1-line status bar with clean non-overlapping HELD indicator
    const sb = LAYOUT.statusBar;
    drawPanel(ctx, sb, 'rgba(18, 10, 6, 0.88)', 'rgba(186, 138, 66, 0.32)', 6, 1);
    let textX = sb.x + 14;
    if (kitchen.heldItem) {
      const heldSpec = INGREDIENT_MAP[kitchen.heldItem.ingredientId];
      const pill = { x: sb.x + 6, y: sb.y + 2, w: 214, h: sb.h - 4 };
      drawPanel(ctx, pill, '#3b2415', '#f2c16b', 5, 1.2);
      drawIngredientSprite(ctx, kitchen.heldItem.ingredientId, kitchen.heldItem.state, pill.x + 18, pill.y + 10, 0.42);
      ctx.textAlign = 'left';
      ctx.fillStyle = '#ffe6a3';
      ctx.font = '800 11px "Trebuchet MS", sans-serif';
      ctx.fillText(`HOLDING: ${heldSpec.shortLabel} (${kitchen.heldItem.state.toUpperCase()})`, pill.x + 34, sb.y + 16);
      textX = pill.x + pill.w + 14;
    }
    ctx.textAlign = 'left';
    if (kitchen.banner.timer > 0 && kitchen.banner.text) {
      ctx.fillStyle = kitchen.banner.color;
      ctx.font = '800 12px "Trebuchet MS", sans-serif';
      ctx.fillText(kitchen.banner.text, textX, sb.y + 16);
    } else {
      ctx.fillStyle = '#d9c09c';
      ctx.font = '700 11.5px "Trebuchet MS", sans-serif';
      ctx.fillText('KEYS: [1-8] Pick | [Q/E] Skillets | [C] Chop | [A] Plate | [Space] Serve | [X] Discard', textX, sb.y + 16);
    }
    ctx.textAlign = 'right';
    ctx.fillStyle = '#c2985a';
    ctx.font = '700 11px "Trebuchet MS", sans-serif';
    ctx.fillText('COPPER HEARTH ARTISAN BISTRO', sb.x + sb.w - 14, sb.y + 16);
  }

  function renderParticlesAndPopups(kitchen) {
    for (let i = 0; i < kitchen.particles.length; i += 1) {
      const p = kitchen.particles[i];
      const alpha = Math.max(0, p.life / p.maxLife);
      ctx.save();
      if (p.kind === 'steam') {
        ctx.globalAlpha = alpha * 0.48;
        ctx.strokeStyle = p.color;
        ctx.lineWidth = Math.max(2, p.size * 0.45);
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

    for (let i = 0; i < kitchen.popups.length; i += 1) {
      const pop = kitchen.popups[i];
      const alpha = Math.min(1, (pop.life / pop.maxLife) * 1.45);
      ctx.save();
      ctx.globalAlpha = alpha;
      const pill = { x: pop.x - 59, y: pop.y - 22, w: 118, h: 44 };
      drawCastShadow(ctx, pill.x, pill.y, pill.w, pill.h, 10, 2, 4, 0.38);
      drawPanel(ctx, pill, 'rgba(26, 14, 7, 0.94)', pop.color, 10, 1.8);
      ctx.textAlign = 'center';
      ctx.fillStyle = pop.color;
      ctx.font = '900 20px "Trebuchet MS", sans-serif';
      ctx.fillText(pop.text, pop.x, pop.y - 1);
      if (pop.subtext) {
        ctx.font = '800 10.5px "Trebuchet MS", sans-serif';
        ctx.fillStyle = '#fff5d6';
        ctx.fillText(pop.subtext, pop.x, pop.y + 15);
      }
      ctx.restore();
    }
  }

  function renderTitleOverlay(selectedShift, hoverZone, clock) {
    ctx.fillStyle = 'rgba(15, 9, 6, 0.72)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    drawPanel(ctx, { x: 120, y: 66, w: 1040, h: 586 }, 'rgba(37, 22, 15, 0.96)', '#d4a353', 20, 2.5);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#d9a452';
    ctx.font = '800 14px "Trebuchet MS", sans-serif';
    ctx.fillText('ARTISAN BISTRO KITCHEN', 640, 114);

    ctx.fillStyle = '#fff3dc';
    ctx.font = '900 54px "Trebuchet MS", sans-serif';
    ctx.fillText('COPPER HEARTH', 640, 170);

    ctx.fillStyle = '#d6bc99';
    ctx.font = '600 16px "Trebuchet MS", sans-serif';
    ctx.fillText('Sear to the golden sweet spot, chop fresh aromatics, layer artisan plates, and ring the brass bell.', 640, 204);

    for (let i = 0; i < RECIPES.length; i += 1) {
      const r = RECIPES[i];
      const rx = 230 + i * 273;
      const ry = 294;
      drawPanel(ctx, { x: rx - 115, y: ry - 60, w: 230, h: 124 }, '#281810', '#7e5932', 12, 1.5);
      drawPlatedDish(
        ctx,
        r.id,
        r.steps.map((s) => s.ingredientId),
        rx,
        ry - 6,
        36,
        { showPlate: true, glow: i === Math.floor(clock) % 4 },
      );
      ctx.fillStyle = '#ffe9c2';
      ctx.font = '800 12px "Trebuchet MS", sans-serif';
      ctx.fillText(r.name, rx, ry + 50);
    }

    for (let i = 0; i < SHIFTS.length; i += 1) {
      const shift = SHIFTS[i];
      const card = LAYOUT.titleShiftCards[i];
      const active = selectedShift === i;
      const hovered = hoverZone === `shift_${i}`;
      drawPanel(
        ctx,
        card,
        active ? '#54331d' : hovered ? '#3c2517' : '#261710',
        active ? '#ffe07d' : hovered ? '#d9a452' : '#735337',
        12,
        active ? 2.5 : 1.5,
      );
      ctx.fillStyle = active ? '#ffe59c' : '#f2d9b4';
      ctx.font = '800 13.5px "Trebuchet MS", sans-serif';
      ctx.fillText(shift.name, card.x + card.w / 2, card.y + 34);
      ctx.fillStyle = '#cbb08c';
      ctx.font = '600 11.5px "Trebuchet MS", sans-serif';
      ctx.fillText(shift.subtitle, card.x + card.w / 2, card.y + 58);
      ctx.fillStyle = '#92f0a1';
      ctx.font = '700 11.5px "Trebuchet MS", sans-serif';
      ctx.fillText(
        shift.endless ? 'Target $300+' : `${shift.durationSec}s  |  Target $${shift.targetScore}`,
        card.x + card.w / 2,
        card.y + 86,
      );
    }

    const sb = LAYOUT.titleStartBtn;
    const sbHover = hoverZone === 'title_start';
    drawPanel(ctx, sb, sbHover ? '#d98c36' : '#c27426', '#ffe49e', 14, 2);
    ctx.fillStyle = '#fff9ec';
    ctx.font = '900 22px "Trebuchet MS", sans-serif';
    ctx.fillText('START SERVICE  [SPACE]', sb.x + sb.w / 2, sb.y + 40);
  }

  function renderPauseOverlay(hoverZone) {
    ctx.fillStyle = 'rgba(14, 9, 6, 0.74)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    drawPanel(ctx, { x: 420, y: 204, w: 440, h: 332 }, '#281810', '#d4a353', 18, 2.5);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#fff1d6';
    ctx.font = '900 32px "Trebuchet MS", sans-serif';
    ctx.fillText('SERVICE PAUSED', 640, 266);

    const items = [
      { rect: LAYOUT.pauseResumeBtn, id: 'pause_resume', label: 'RESUME SERVICE [P]', fill: '#2c7546' },
      { rect: LAYOUT.pauseRestartBtn, id: 'pause_restart', label: 'RESTART SHIFT', fill: '#4f321e' },
      { rect: LAYOUT.pauseTitleBtn, id: 'pause_title', label: 'MAIN MENU', fill: '#3b2418' },
    ];
    for (const item of items) {
      const h = hoverZone === item.id;
      drawPanel(ctx, item.rect, item.fill, h ? '#ffe07d' : '#b98842', 10, 2);
      ctx.fillStyle = '#fff6e4';
      ctx.font = '800 16px "Trebuchet MS", sans-serif';
      ctx.fillText(item.label, item.rect.x + item.rect.w / 2, item.rect.y + 34);
    }
  }

  function renderGuideOverlay() {
    ctx.fillStyle = 'rgba(12, 8, 5, 0.78)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    drawPanel(ctx, { x: 140, y: 84, w: 1000, h: 552 }, '#281810', '#d4a353', 18, 2.5);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffe9bf';
    ctx.font = '900 28px "Trebuchet MS", sans-serif';
    ctx.fillText('CHEF RECIPE BOOK & CONTROLS', 640, 134);

    for (let i = 0; i < RECIPES.length; i += 1) {
      const r = RECIPES[i];
      const col = i % 2;
      const row = Math.floor(i / 2);
      const rx = 180 + col * 470;
      const ry = 166 + row * 195;
      drawPanel(ctx, { x: rx, y: ry, w: 450, h: 174 }, '#1d120c', '#8b6534', 14, 1.5);
      drawPlatedDish(
        ctx,
        r.id,
        r.steps.map((s) => s.ingredientId),
        rx + 78,
        ry + 88,
        48,
        { showPlate: true },
      );

      ctx.textAlign = 'left';
      ctx.fillStyle = '#ffe5ad';
      ctx.font = '800 16px "Trebuchet MS", sans-serif';
      ctx.fillText(`${r.name}  ($${r.basePrice})`, rx + 148, ry + 40);

      for (let sIdx = 0; sIdx < r.steps.length; sIdx += 1) {
        const st = r.steps[sIdx];
        const ing = INGREDIENT_MAP[st.ingredientId];
        ctx.fillStyle = '#e7d2b5';
        ctx.font = '700 13px "Trebuchet MS", sans-serif';
        ctx.fillText(`${sIdx + 1}. [${ing.key}] ${ing.shortLabel} -> ${st.label}`, rx + 148, ry + 76 + sIdx * 28);
      }
    }

    ctx.textAlign = 'center';
    ctx.fillStyle = '#d4a353';
    ctx.font = '700 14px "Trebuchet MS", sans-serif';
    ctx.fillText('Click anywhere or press [H] / [ESC] to close', 640, 608);
  }

  function renderShiftSummaryOverlay(orders, hoverZone) {
    ctx.fillStyle = 'rgba(13, 8, 5, 0.72)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    drawCastShadow(ctx, 260, 102, 760, 520, 20, 8, 12, 0.5);
    drawPanel(ctx, { x: 260, y: 102, w: 760, h: 520 }, 'rgba(41, 25, 17, 0.96)', '#e0ae5a', 20, 3);

    const shift = SHIFTS[orders.shiftIndex] ?? SHIFTS[0];
    ctx.textAlign = 'center';
    ctx.fillStyle = '#d9a452';
    ctx.font = '800 13px "Trebuchet MS", sans-serif';
    ctx.fillText(shift.name.toUpperCase(), 640, 144);

    ctx.fillStyle = '#fff4de';
    ctx.font = '900 38px "Trebuchet MS", sans-serif';
    ctx.fillText('SHIFT COMPLETE', 640, 190);

    for (let i = 0; i < 3; i += 1) {
      const lit = i < orders.starsEarned;
      const sx = 556 + i * 84;
      const sy = 240;
      if (lit) {
        const starGlow = ctx.createRadialGradient(sx, sy, 4, sx, sy, 34);
        starGlow.addColorStop(0, 'rgba(255, 215, 80, 0.45)');
        starGlow.addColorStop(1, 'rgba(255, 215, 80, 0)');
        ctx.fillStyle = starGlow;
        ctx.beginPath();
        ctx.arc(sx, sy, 34, 0, Math.PI * 2);
        ctx.fill();
      }
      drawIcon(ctx, 'star', sx, sy, 48, lit ? '#ffd34e' : '#4f3a29');
    }

    ctx.fillStyle = '#92f0a1';
    ctx.font = '900 52px "Trebuchet MS", sans-serif';
    ctx.fillText(`$${orders.score}`, 640, 326);
    ctx.fillStyle = '#d6bc99';
    ctx.font = '700 13px "Trebuchet MS", sans-serif';
    ctx.fillText(`TARGET $${shift.targetScore}   |   3-STAR GOAL $${shift.starThresholds[2]}`, 640, 352);

    const stats = [
      { label: 'DISHES SERVED', val: `${orders.dishesServed}` },
      { label: 'PERFECT SEARS', val: `${orders.perfectDishes}` },
      { label: 'TIPS EARNED', val: `+$${orders.tipsEarned}` },
      { label: 'BEST COMBO', val: `x${orders.bestCombo}` },
    ];
    for (let i = 0; i < stats.length; i += 1) {
      const st = stats[i];
      const sx = 312 + i * 168;
      const sy = 382;
      drawPanel(ctx, { x: sx, y: sy, w: 152, h: 98 }, '#1d120c', '#8b6534', 12, 1.5);
      ctx.fillStyle = '#cbb08a';
      ctx.font = '700 11px "Trebuchet MS", sans-serif';
      ctx.fillText(st.label, sx + 76, sy + 30);
      ctx.fillStyle = '#ffe5a8';
      ctx.font = '900 28px "Trebuchet MS", sans-serif';
      ctx.fillText(st.val, sx + 76, sy + 72);
    }

    const hasNext = orders.shiftIndex < SHIFTS.length - 1;
    const btns = [
      { rect: LAYOUT.summaryNextBtn, id: 'summary_next', label: hasNext ? 'NEXT SHIFT [SPACE]' : 'PLAY AGAIN [SPACE]', fill: '#2c7546' },
      { rect: LAYOUT.summaryReplayBtn, id: 'summary_replay', label: 'REPLAY [R]', fill: '#57361f' },
      { rect: LAYOUT.summaryEndlessBtn, id: 'summary_endless', label: 'ENDLESS MODE', fill: '#3c2618' },
    ];
    for (const b of btns) {
      const h = hoverZone === b.id;
      drawPanel(ctx, b.rect, b.fill, h ? '#ffe07d' : '#c9974c', 12, 2);
      ctx.fillStyle = '#fff8ea';
      ctx.font = '800 14.5px "Trebuchet MS", sans-serif';
      ctx.fillText(b.label, b.rect.x + b.rect.w / 2, b.rect.y + 35);
    }
  }

  function render(state) {
    const { kitchen, orders, screen, selectedShift, audioMuted, guideOpen, pointer, clock } = state;

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    renderBackdrop(clock);
    renderTopOrderRail(orders, audioMuted, clock, pointer.hoverZone);
    renderMainKitchen(kitchen, orders, pointer.hoverZone, clock);
    renderPantryCounter(kitchen, pointer.hoverZone);
    renderParticlesAndPopups(kitchen, pointer, screen);

    if (screen === SCREEN_TITLE) {
      renderTitleOverlay(selectedShift, pointer.hoverZone, clock);
    } else if (screen === SCREEN_PAUSED) {
      renderPauseOverlay(pointer.hoverZone);
    } else if (screen === SCREEN_SUMMARY) {
      renderShiftSummaryOverlay(orders, pointer.hoverZone);
    }

    if (guideOpen) {
      renderGuideOverlay();
    }
  }

  return { render };
}
