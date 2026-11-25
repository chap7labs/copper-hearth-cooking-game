// Procedural 2.5D Kyoto culinary illustrations, top-down chef character, and 4 station hardware types.

import { INGREDIENT_MAP, RECIPE_MAP } from '../config/recipes.js';

export function roundedRectPath(ctx, x, y, w, h, r) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

export function drawIcon(ctx, kind, x, y, size, color) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  ctx.lineWidth = Math.max(1.5, size * 0.14);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  const r = size * 0.5;

  if (kind === 'pause') {
    ctx.fillRect(-r * 0.55, -r * 0.65, r * 0.36, r * 1.3);
    ctx.fillRect(r * 0.19, -r * 0.65, r * 0.36, r * 1.3);
  } else if (kind === 'sound_on' || kind === 'sound_off') {
    ctx.beginPath();
    ctx.moveTo(-r * 0.65, -r * 0.28);
    ctx.lineTo(-r * 0.25, -r * 0.28);
    ctx.lineTo(r * 0.22, -r * 0.65);
    ctx.lineTo(r * 0.22, r * 0.65);
    ctx.lineTo(-r * 0.25, r * 0.28);
    ctx.lineTo(-r * 0.65, r * 0.28);
    ctx.closePath();
    ctx.fill();
    if (kind === 'sound_on') {
      ctx.beginPath();
      ctx.arc(r * 0.25, 0, r * 0.42, -0.7, 0.7);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(r * 0.25, 0, r * 0.7, -0.7, 0.7);
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.moveTo(r * 0.4, -r * 0.35);
      ctx.lineTo(r * 0.85, r * 0.35);
      ctx.moveTo(r * 0.85, -r * 0.35);
      ctx.lineTo(r * 0.4, r * 0.35);
      ctx.stroke();
    }
  } else if (kind === 'book') {
    roundedRectPath(ctx, -r * 0.7, -r * 0.6, r * 1.4, r * 1.2, 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, -r * 0.58);
    ctx.lineTo(0, r * 0.58);
    ctx.stroke();
  } else if (kind === 'clock') {
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.75, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -r * 0.45);
    ctx.moveTo(0, 0);
    ctx.lineTo(r * 0.34, r * 0.16);
    ctx.stroke();
  } else if (kind === 'star') {
    ctx.beginPath();
    for (let i = 0; i < 10; i += 1) {
      const rad = i % 2 === 0 ? r * 0.95 : r * 0.42;
      const a = -Math.PI / 2 + (i * Math.PI) / 5;
      const px = Math.cos(a) * rad;
      const py = Math.sin(a) * rad;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
  } else if (kind === 'trash') {
    roundedRectPath(ctx, -r * 0.52, -r * 0.38, r * 1.04, r * 1.05, 3);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-r * 0.7, -r * 0.44);
    ctx.lineTo(r * 0.7, -r * 0.44);
    ctx.moveTo(-r * 0.25, -r * 0.65);
    ctx.lineTo(r * 0.25, -r * 0.65);
    ctx.stroke();
  }
  ctx.restore();
}

export function drawIngredientSprite(ctx, ingredientId, prepState, x, y, scale = 1, chopProgress = 0, isPerfect = false) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  const isBurnt = prepState === 'burnt';
  const isCooked = ['grilled', 'fried', 'boiled'].includes(prepState);
  const isChopped = prepState === 'chopped';

  ctx.fillStyle = 'rgba(18, 12, 8, 0.3)';
  ctx.beginPath();
  ctx.ellipse(2, 9, 17, 6.5, 0, 0, Math.PI * 2);
  ctx.fill();

  if (ingredientId === 'salmon') {
    const grad = ctx.createLinearGradient(-16, -8, 16, 10);
    if (isBurnt) {
      grad.addColorStop(0, '#2a201d');
      grad.addColorStop(1, '#15100e');
    } else if (isCooked) {
      grad.addColorStop(0, '#ffa169');
      grad.addColorStop(1, '#b84320');
    } else {
      grad.addColorStop(0, '#ffa88f');
      grad.addColorStop(1, '#eb684c');
    }
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(-17, 1);
    ctx.quadraticCurveTo(-12, -10, 14, -8);
    ctx.quadraticCurveTo(18, 1, 13, 8);
    ctx.quadraticCurveTo(-10, 10, -17, 1);
    ctx.closePath();
    ctx.fill();
    if (!isBurnt) {
      ctx.strokeStyle = isCooked ? '#3b1509' : 'rgba(255, 240, 232, 0.75)';
      ctx.lineWidth = 1.8;
      for (const sx of [-7, 0, 7]) {
        ctx.beginPath();
        ctx.moveTo(sx, -7);
        ctx.lineTo(sx + 1, 7);
        ctx.stroke();
      }
    }
  } else if (ingredientId === 'chicken') {
    if (isBurnt) {
      ctx.fillStyle = '#241c1a';
      ctx.beginPath();
      ctx.ellipse(0, 1, 16, 10, 0, 0, Math.PI * 2);
      ctx.fill();
    } else if (prepState === 'fried') {
      // Golden crispy panko chicken katsu cutlet
      ctx.fillStyle = '#d98a29';
      ctx.beginPath();
      ctx.ellipse(0, 1, 17, 11, -0.1, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#f5bd51';
      ctx.beginPath();
      ctx.ellipse(-1, -1, 14, 8, -0.1, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#995816';
      ctx.lineWidth = 1.6;
      for (const gx of [-6, 0, 6]) {
        ctx.beginPath();
        ctx.moveTo(gx, -7);
        ctx.lineTo(gx + 2, 7);
        ctx.stroke();
      }
    } else if (prepState === 'grilled') {
      // Skewered smoky yakitori chicken
      ctx.strokeStyle = '#d9be8b';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-18, 3);
      ctx.lineTo(18, -3);
      ctx.stroke();
      for (const [cx, cy] of [[-7, 1], [1, 0], [9, -1]]) {
        ctx.fillStyle = '#964720';
        ctx.beginPath();
        ctx.arc(cx, cy, 5.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#361408';
        ctx.fillRect(cx - 3, cy - 1, 6, 2);
      }
    } else {
      // Raw heritage chicken cut
      ctx.fillStyle = '#f5cbb8';
      ctx.beginPath();
      ctx.ellipse(0, 1, 15, 10, -0.15, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffe5d9';
      ctx.beginPath();
      ctx.ellipse(-3, -2, 8, 4, -0.15, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (ingredientId === 'shrimp') {
    const col = isBurnt ? '#261e1c' : isCooked ? '#f2a438' : '#f79579';
    ctx.fillStyle = col;
    ctx.beginPath();
    ctx.ellipse(-2, 0, 15, 8, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = isBurnt ? '#1c1514' : '#e0503c';
    ctx.beginPath();
    ctx.moveTo(11, -4);
    ctx.lineTo(18, -8);
    ctx.lineTo(17, 1);
    ctx.closePath();
    ctx.fill();
    if (!isBurnt && !isCooked) {
      ctx.strokeStyle = '#fff0e6';
      ctx.lineWidth = 1.4;
      for (const sx of [-7, -1, 5]) {
        ctx.beginPath();
        ctx.moveTo(sx, -5);
        ctx.lineTo(sx + 1, 5);
        ctx.stroke();
      }
    }
  } else if (ingredientId === 'noodles') {
    if (isBurnt) {
      ctx.fillStyle = '#241c1a';
      ctx.beginPath();
      ctx.ellipse(0, 1, 16, 10, 0, 0, Math.PI * 2);
      ctx.fill();
    } else if (isCooked) {
      const broth = ctx.createRadialGradient(-3, -2, 2, 0, 1, 17);
      broth.addColorStop(0, '#ffe378');
      broth.addColorStop(1, '#c97e1c');
      ctx.fillStyle = broth;
      ctx.beginPath();
      ctx.ellipse(0, 1, 17, 11, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#fff5c8';
      ctx.lineWidth = 1.9;
      for (const yOff of [-3, 1, 5]) {
        ctx.beginPath();
        ctx.moveTo(-10, yOff);
        ctx.quadraticCurveTo(0, yOff - 4, 10, yOff);
        ctx.stroke();
      }
    } else {
      ctx.fillStyle = '#edd285';
      ctx.beginPath();
      ctx.ellipse(0, 1, 16, 10, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#bd9137';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.ellipse(0, 1, 10, 6, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
  } else if (ingredientId === 'curry') {
    ctx.fillStyle = isBurnt ? '#1c1514' : isCooked ? '#a85a14' : '#c98732';
    ctx.beginPath();
    ctx.ellipse(0, 1, 16, 10.5, 0, 0, Math.PI * 2);
    ctx.fill();
    if (!isBurnt) {
      ctx.fillStyle = '#e89835';
      ctx.beginPath();
      ctx.arc(-5, -1, 3.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#f2dd96';
      ctx.beginPath();
      ctx.arc(5, 2, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (ingredientId === 'rice') {
    ctx.fillStyle = '#734526';
    ctx.beginPath();
    ctx.arc(0, 2, 16, 0, Math.PI);
    ctx.fill();
    ctx.fillStyle = '#fffaf0';
    ctx.beginPath();
    ctx.arc(0, 1, 14, Math.PI, 0);
    ctx.quadraticCurveTo(0, 6, -14, 1);
    ctx.fill();
    ctx.fillStyle = '#2d241e';
    for (const [sx, sy] of [[-4, -6], [3, -7], [6, -2]]) {
      ctx.beginPath();
      ctx.arc(sx, sy, 1.2, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (ingredientId === 'yuzu') {
    if (isChopped) {
      for (const [cx, cy] of [[-6, 2], [5, 3], [0, -4]]) {
        ctx.fillStyle = '#f5cb2e';
        ctx.beginPath();
        ctx.arc(cx, cy, 5.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fff7ba';
        ctx.beginPath();
        ctx.arc(cx, cy, 3.6, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (chopProgress > 0) {
      ctx.fillStyle = '#f2c72c';
      ctx.beginPath();
      ctx.arc(-6, 1, 8, Math.PI * 0.5, Math.PI * 1.5);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.arc(6, 1, 8, -Math.PI * 0.5, Math.PI * 0.5);
      ctx.closePath();
      ctx.fill();
    } else {
      const yg = ctx.createRadialGradient(-4, -4, 2, 0, 0, 14);
      yg.addColorStop(0, '#ffe45e');
      yg.addColorStop(1, '#d99e16');
      ctx.fillStyle = yg;
      ctx.beginPath();
      ctx.arc(0, 0, 13, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#47944f';
      ctx.beginPath();
      ctx.ellipse(7, -9, 6, 3, -0.4, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (ingredientId === 'scallion') {
    if (isChopped) {
      ctx.strokeStyle = '#49ad58';
      ctx.lineWidth = 2.4;
      for (const [sx, sy] of [[-8, 2], [0, -3], [7, 2], [-3, 5], [9, -3]]) {
        ctx.beginPath();
        ctx.arc(sx, sy, 3.2, 0, Math.PI * 2);
        ctx.stroke();
      }
    } else if (chopProgress > 0) {
      ctx.fillStyle = '#4ba658';
      for (const [sx, sy, rot] of [[-8, 0, 0.2], [1, 2, -0.2], [9, -1, 0.4]]) {
        ctx.save();
        ctx.translate(sx, sy);
        ctx.rotate(rot);
        roundedRectPath(ctx, -6, -2.5, 12, 5, 2);
        ctx.fill();
        ctx.restore();
      }
    } else {
      ctx.save();
      ctx.rotate(-0.35);
      ctx.fillStyle = '#f2f0e4';
      roundedRectPath(ctx, -16, -4, 12, 8, 3);
      ctx.fill();
      ctx.fillStyle = '#49a656';
      roundedRectPath(ctx, -5, -4, 22, 8, 3);
      ctx.fill();
      ctx.restore();
    }
  }

  if (isPerfect) {
    ctx.strokeStyle = '#ffe066';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(14, -10, 4.5, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.restore();
}

export function drawPlatedDish(ctx, recipeId, itemsPresent, x, y, radius = 44, options = {}) {
  const { showPlate = true, glow = false } = options;
  const has = (id) => itemsPresent.includes(id);

  ctx.save();
  ctx.translate(x, y);
  const s = radius / 48;
  ctx.scale(s, s);

  if (glow) {
    const aura = ctx.createRadialGradient(0, 0, 22, 0, 0, 62);
    aura.addColorStop(0, 'rgba(255, 220, 114, 0.45)');
    aura.addColorStop(1, 'rgba(255, 220, 114, 0)');
    ctx.fillStyle = aura;
    ctx.beginPath();
    ctx.arc(0, 0, 62, 0, Math.PI * 2);
    ctx.fill();
  }

  if (showPlate) {
    ctx.fillStyle = 'rgba(18, 12, 7, 0.42)';
    ctx.beginPath();
    ctx.ellipse(4, 8, 47, 41, 0, 0, Math.PI * 2);
    ctx.fill();

    if (recipeId === 'yuzu_ramen') {
      ctx.fillStyle = '#8f2920';
      ctx.beginPath();
      ctx.arc(0, 0, 46, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ebc075';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = '#24100d';
      ctx.beginPath();
      ctx.arc(0, 0, 39, 0, Math.PI * 2);
      ctx.fill();
    } else if (recipeId === 'ebi_tempura_don') {
      ctx.fillStyle = '#1f1918';
      ctx.beginPath();
      ctx.arc(0, 0, 46, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#d14334';
      ctx.lineWidth = 4;
      ctx.stroke();
    } else if (recipeId === 'yakitori_bento') {
      ctx.fillStyle = '#331d12';
      roundedRectPath(ctx, -46, -34, 92, 68, 10);
      ctx.fill();
      ctx.strokeStyle = '#c94c38';
      ctx.lineWidth = 2.5;
      ctx.stroke();
      ctx.fillStyle = '#24140c';
      roundedRectPath(ctx, -40, -28, 38, 56, 5);
      ctx.fill();
      roundedRectPath(ctx, 2, -28, 38, 56, 5);
      ctx.fill();
    } else if (recipeId === 'yuzu_soba') {
      ctx.fillStyle = '#d4aa6a';
      roundedRectPath(ctx, -44, -34, 88, 68, 10);
      ctx.fill();
      ctx.strokeStyle = '#875e2c';
      ctx.lineWidth = 2.5;
      ctx.stroke();
      ctx.strokeStyle = 'rgba(110, 74, 30, 0.45)';
      ctx.lineWidth = 1.5;
      for (let gx = -32; gx <= 32; gx += 10) {
        ctx.beginPath();
        ctx.moveTo(gx, -30);
        ctx.lineTo(gx, 30);
        ctx.stroke();
      }
    } else {
      // Celadon / Ivory stoneware plate
      const rimCol = recipeId === 'teriyaki_salmon' ? '#b8d4c6' : '#f7f0e2';
      ctx.fillStyle = rimCol;
      ctx.beginPath();
      ctx.arc(0, 0, 46, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = recipeId === 'teriyaki_salmon' ? '#587d6d' : '#c9a66b';
      ctx.lineWidth = 2.2;
      ctx.stroke();
    }
  }

  if (recipeId === 'yuzu_ramen') {
    if (has('noodles')) {
      const broth = ctx.createRadialGradient(-6, -6, 4, 0, 0, 38);
      broth.addColorStop(0, '#ffe885');
      broth.addColorStop(1, '#cf7d1b');
      ctx.fillStyle = broth;
      ctx.beginPath();
      ctx.arc(0, 0, 38, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 250, 225, 0.45)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(-4, -4, 30, Math.PI * 1.05, Math.PI * 1.65);
      ctx.stroke();
      ctx.strokeStyle = '#fff5c8';
      ctx.lineWidth = 2.5;
      for (const yOff of [-10, -1, 8]) {
        ctx.beginPath();
        ctx.moveTo(-22, yOff);
        ctx.quadraticCurveTo(0, yOff - 6, 22, yOff);
        ctx.stroke();
      }
      ctx.fillStyle = '#f7e6b5';
      for (const [sx, sy] of [[-18, 12], [-8, 22], [12, 20]]) {
        ctx.beginPath();
        ctx.arc(sx, sy, 1.3, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    if (has('yuzu')) {
      ctx.fillStyle = '#ffd438';
      ctx.beginPath();
      ctx.arc(-14, -12, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fff9cc';
      ctx.beginPath();
      ctx.arc(-14, -12, 6.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fff9ec';
      ctx.beginPath();
      ctx.ellipse(14, -10, 10, 8, 0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#f5921d';
      ctx.beginPath();
      ctx.arc(14, -10, 4.5, 0, Math.PI * 2);
      ctx.fill();
    }
    if (has('scallion')) {
      ctx.fillStyle = '#182b1e';
      roundedRectPath(ctx, 16, 4, 15, 20, 2);
      ctx.fill();
      ctx.strokeStyle = '#58c464';
      ctx.lineWidth = 2.4;
      for (const [sx, sy] of [[-12, 14], [0, 12], [-2, -2]]) {
        ctx.beginPath();
        ctx.arc(sx, sy, 3.2, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
  } else if (recipeId === 'ebi_tempura_don') {
    if (has('rice')) {
      ctx.fillStyle = '#fffcf5';
      ctx.beginPath();
      ctx.arc(0, 2, 36, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#2c2017';
      for (const [sx, sy] of [[-16, -8], [14, 18], [-6, 20]]) {
        ctx.beginPath();
        ctx.arc(sx, sy, 1.4, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    if (has('shrimp')) {
      for (const [sx, sy, rot] of [[-8, -6, -0.35], [10, 3, -0.2]]) {
        ctx.save();
        ctx.translate(sx, sy);
        ctx.rotate(rot);
        ctx.fillStyle = '#f2a238';
        ctx.beginPath();
        ctx.ellipse(0, 0, 20, 8.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 250, 225, 0.45)';
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.ellipse(-2, -2.5, 11, 2.5, 0, Math.PI, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = '#e04f3b';
        ctx.beginPath();
        ctx.moveTo(16, -4);
        ctx.lineTo(24, -7);
        ctx.lineTo(22, 3);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }
    }
    if (has('scallion')) {
      ctx.strokeStyle = '#53b85e';
      ctx.lineWidth = 2.4;
      for (const [gx, gy] of [[-16, 12], [2, 16], [14, -14], [-4, -16]]) {
        ctx.beginPath();
        ctx.arc(gx, gy, 3.2, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
  } else if (recipeId === 'teriyaki_salmon') {
    if (has('rice')) {
      ctx.fillStyle = '#fffdf8';
      ctx.beginPath();
      ctx.arc(-14, 10, 19, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#2d241e';
      ctx.beginPath();
      ctx.arc(-16, 8, 1.4, 0, Math.PI * 2);
      ctx.arc(-10, 12, 1.4, 0, Math.PI * 2);
      ctx.fill();
    }
    if (has('salmon')) {
      ctx.fillStyle = '#dc5b30';
      ctx.beginPath();
      ctx.ellipse(10, -4, 24, 14, -0.25, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#3d150a';
      ctx.lineWidth = 2.4;
      for (const gx of [0, 9, 18]) {
        ctx.beginPath();
        ctx.moveTo(gx - 2, -13);
        ctx.lineTo(gx + 3, 5);
        ctx.stroke();
      }
      ctx.strokeStyle = 'rgba(255, 250, 225, 0.48)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(7, -8, 13, 4.5, -0.25, Math.PI * 1.05, Math.PI * 1.9);
      ctx.stroke();
      ctx.fillStyle = '#f7e6b5';
      for (const [sx, sy] of [[4, -3], [14, -1], [20, -6]]) {
        ctx.beginPath();
        ctx.arc(sx, sy, 1.3, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    if (has('yuzu')) {
      ctx.fillStyle = '#ffe04d';
      ctx.beginPath();
      ctx.arc(16, 18, 10, 0, Math.PI);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#479e54';
      ctx.beginPath();
      ctx.ellipse(-18, -14, 9, 5, 0.3, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (recipeId === 'yakitori_bento') {
    if (has('rice')) {
      ctx.fillStyle = '#fffcf2';
      roundedRectPath(ctx, -36, -22, 30, 44, 6);
      ctx.fill();
      ctx.fillStyle = '#d14038';
      ctx.beginPath();
      ctx.arc(-21, 0, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#2c2017';
      for (const [sx, sy] of [[-29, -12], [-14, 12]]) {
        ctx.beginPath();
        ctx.arc(sx, sy, 1.2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    if (has('chicken')) {
      for (const yOff of [-11, 7]) {
        ctx.strokeStyle = '#e0c38b';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(4, yOff);
        ctx.lineTo(36, yOff);
        ctx.stroke();
        for (const cx of [12, 21, 30]) {
          ctx.fillStyle = '#9c4a20';
          ctx.beginPath();
          ctx.arc(cx, yOff, 5, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = 'rgba(255, 244, 214, 0.45)';
          ctx.beginPath();
          ctx.arc(cx - 1.5, yOff - 1.5, 1.6, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
    if (has('scallion')) {
      ctx.strokeStyle = '#58c464';
      ctx.lineWidth = 2.2;
      for (const [sx, sy] of [[14, -18], [26, 18], [16, 16]]) {
        ctx.beginPath();
        ctx.arc(sx, sy, 3, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
  } else if (recipeId === 'katsu_curry') {
    if (has('rice')) {
      ctx.fillStyle = '#fffcf5';
      ctx.beginPath();
      ctx.arc(-11, 0, 26, Math.PI * 0.5, Math.PI * 1.5);
      ctx.closePath();
      ctx.fill();
    }
    if (has('curry')) {
      ctx.fillStyle = '#a85a14';
      ctx.beginPath();
      ctx.arc(8, 0, 27, -Math.PI * 0.5, Math.PI * 0.5);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 240, 194, 0.42)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(10, -2, 20, -0.9, 0.45);
      ctx.stroke();
    }
    if (has('chicken')) {
      ctx.fillStyle = '#f0b143';
      roundedRectPath(ctx, -22, -12, 44, 24, 8);
      ctx.fill();
      ctx.strokeStyle = '#8f4d14';
      ctx.lineWidth = 2;
      for (const sx of [-10, 0, 10]) {
        ctx.beginPath();
        ctx.moveTo(sx, -11);
        ctx.lineTo(sx, 11);
        ctx.stroke();
      }
      ctx.fillStyle = '#2c2017';
      for (const [sx, sy] of [[-15, -4], [6, 4]]) {
        ctx.beginPath();
        ctx.arc(sx, sy, 1.3, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  } else if (recipeId === 'yuzu_soba') {
    if (has('noodles')) {
      ctx.fillStyle = '#9c927d';
      ctx.beginPath();
      ctx.ellipse(-6, 2, 25, 19, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#5c5345';
      ctx.lineWidth = 1.8;
      for (const yOff of [-6, 0, 6]) {
        ctx.beginPath();
        ctx.moveTo(-22, yOff);
        ctx.quadraticCurveTo(-6, yOff - 5, 10, yOff);
        ctx.stroke();
      }
    }
    if (has('shrimp')) {
      ctx.fillStyle = '#f2a438';
      ctx.beginPath();
      ctx.ellipse(16, -8, 16, 7, -0.4, 0, Math.PI * 2);
      ctx.fill();
    }
    if (has('yuzu')) {
      ctx.fillStyle = '#ffd63b';
      ctx.beginPath();
      ctx.arc(20, 14, 8.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#29221d';
      ctx.beginPath();
      ctx.arc(-26, -16, 9, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.restore();
}

export function drawChefKnife(ctx, x, y, chopAnim) {
  ctx.save();
  const drop = Math.sin(chopAnim * Math.PI) * 12;
  const tilt = -0.42 + chopAnim * 0.45;
  ctx.translate(x, y + drop);
  ctx.rotate(tilt);

  ctx.fillStyle = 'rgba(24, 14, 6, 0.32)';
  ctx.beginPath();
  ctx.ellipse(2, 9, 26, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  const blade = ctx.createLinearGradient(-26, -6, 10, 9);
  blade.addColorStop(0, '#f4f7f9');
  blade.addColorStop(0.6, '#b7c2cc');
  blade.addColorStop(1, '#7a8690');
  ctx.fillStyle = blade;
  ctx.beginPath();
  ctx.moveTo(-27, 3);
  ctx.lineTo(10, -8);
  ctx.lineTo(10, 6);
  ctx.quadraticCurveTo(-9, 10, -27, 3);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#472716';
  roundedRectPath(ctx, 11, -7, 20, 9, 3);
  ctx.fill();
  ctx.restore();
}

export function drawBrassBell(ctx, cx, cy, anim, readyGlow, clock) {
  ctx.save();
  const shake = anim > 0 ? Math.sin(anim * Math.PI * 8) * 2.2 : 0;
  ctx.translate(cx + shake, cy);

  if (readyGlow) {
    const pulse = 0.78 + Math.sin(clock * 6) * 0.22;
    const aura = ctx.createRadialGradient(0, -2, 3, 0, -2, 22);
    aura.addColorStop(0, `rgba(255, 224, 118, ${0.55 * pulse})`);
    aura.addColorStop(1, 'rgba(255, 224, 118, 0)');
    ctx.fillStyle = aura;
    ctx.beginPath();
    ctx.arc(0, -2, 22, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = '#381e10';
  roundedRectPath(ctx, -16, 4, 32, 6, 3);
  ctx.fill();

  const bellGrad = ctx.createRadialGradient(-4, -5, 2, 0, -1, 14);
  bellGrad.addColorStop(0, '#fff7cb');
  bellGrad.addColorStop(0.45, '#e8b648');
  bellGrad.addColorStop(1, '#855615');
  ctx.fillStyle = bellGrad;
  ctx.beginPath();
  ctx.arc(0, 4, 13, Math.PI, 0);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#f8d882';
  ctx.beginPath();
  ctx.arc(0, -9, 2.8, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

export function drawTopDownChef(ctx, chef, heldItem, clock) {
  // Dash wind trail + crisp speed streaks
  for (let i = 0; i < chef.dashTrail.length; i += 1) {
    const t = chef.dashTrail[i];
    const a = Math.max(0, t.life / t.maxLife) * 0.42;
    ctx.save();
    ctx.globalAlpha = a;
    ctx.fillStyle = '#ffe99e';
    ctx.beginPath();
    ctx.arc(t.x, t.y, 21, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#fff9df';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.arc(t.x, t.y, 25, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  ctx.save();
  ctx.translate(chef.x, chef.y);
  ctx.scale(1.28, 1.28);

  // Strong 2.5D ground shadow
  ctx.fillStyle = 'rgba(15, 10, 5, 0.46)';
  ctx.beginPath();
  ctx.ellipse(3, 8, 21, 16, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.rotate(chef.facingAngle + Math.PI / 2);
  const stride = Math.sin(chef.walkPhase) * 4.5;

  // Stepping dark clogs
  ctx.fillStyle = '#241a14';
  ctx.beginPath();
  ctx.ellipse(-9, 6 + stride, 5.5, 8, 0, 0, Math.PI * 2);
  ctx.ellipse(9, 6 - stride, 5.5, 8, 0, 0, Math.PI * 2);
  ctx.fill();

  // Indigo Kyoto samue apron & shoulders
  ctx.fillStyle = '#223e57';
  roundedRectPath(ctx, -18, -11, 36, 22, 10);
  ctx.fill();
  ctx.strokeStyle = '#eef4f7';
  ctx.lineWidth = 2.2;
  ctx.stroke();

  // Cream apron collar V + waist sash accent
  ctx.fillStyle = '#f9f3e3';
  ctx.beginPath();
  ctx.moveTo(-7, -10);
  ctx.lineTo(7, -10);
  ctx.lineTo(0, -1);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#d93b2b';
  roundedRectPath(ctx, -11, 8, 22, 4, 2);
  ctx.fill();

  // Extended arms + larger held item preview in front of chef
  const handY = -20 - chef.interactAnim * 4;
  ctx.fillStyle = '#f4c7a0';
  ctx.beginPath();
  ctx.arc(-13, handY + 5, 5.2, 0, Math.PI * 2);
  ctx.arc(13, handY + 5, 5.2, 0, Math.PI * 2);
  ctx.fill();

  if (heldItem) {
    if (heldItem.kind === 'dish') {
      drawPlatedDish(ctx, heldItem.recipeId, ['rice', 'salmon', 'yuzu', 'noodles', 'shrimp', 'chicken', 'curry', 'scallion'], 0, handY - 9, 22, { showPlate: true, glow: true });
    } else {
      drawIngredientSprite(ctx, heldItem.ingredientId, heldItem.state, 0, handY - 6, 0.96, 0, heldItem.isPerfect);
    }
  }

  // Head + high-contrast white & vermilion hachimaki headband
  ctx.fillStyle = '#f4c7a0';
  ctx.beginPath();
  ctx.arc(0, -1, 13, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#211916';
  ctx.beginPath();
  ctx.arc(0, 1, 12.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 4.6;
  ctx.beginPath();
  ctx.arc(0, 0, 11.5, Math.PI * 0.88, Math.PI * 2.12);
  ctx.stroke();

  ctx.strokeStyle = '#d93b2b';
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  ctx.arc(0, -0.5, 11.5, Math.PI * 1.15, Math.PI * 1.85);
  ctx.stroke();

  // Trailing headband tails + vermilion knot at back
  const sway = Math.sin(clock * 8 + chef.walkPhase) * 2.5;
  ctx.strokeStyle = '#faf6eb';
  ctx.lineWidth = 3.2;
  ctx.beginPath();
  ctx.moveTo(-3, 11);
  ctx.lineTo(-7 + sway, 19);
  ctx.moveTo(3, 11);
  ctx.lineTo(7 + sway, 18);
  ctx.stroke();
  ctx.fillStyle = '#d93b2b';
  ctx.beginPath();
  ctx.arc(0, 11, 3.2, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

export function drawCookRing(ctx, cx, cy, r, sk, spec) {
  if (!sk.item || !spec) return;
  const maxTime = spec.burnTime;
  const startAngle = -Math.PI / 2;
  const totalArc = Math.PI * 2;

  ctx.save();
  ctx.strokeStyle = 'rgba(255,255,255,0.24)';
  ctx.lineWidth = 3.8;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.stroke();

  const pStart = startAngle + (spec.perfectStart / maxTime) * totalArc;
  const pEnd = startAngle + (spec.perfectEnd / maxTime) * totalArc;
  ctx.strokeStyle = '#39d17b';
  ctx.lineWidth = 4.4;
  ctx.beginPath();
  ctx.arc(cx, cy, r, pStart, pEnd);
  ctx.stroke();

  ctx.strokeStyle = '#e5534b';
  ctx.lineWidth = 4.0;
  ctx.beginPath();
  ctx.arc(cx, cy, r, pEnd, startAngle + totalArc);
  ctx.stroke();

  const ratio = Math.min(1, sk.elapsed / maxTime);
  ctx.strokeStyle = sk.heatZone === 'perfect' ? '#ffe066' : sk.heatZone === 'burnt' || sk.heatZone === 'warning' ? '#ff5f52' : '#f59f3d';
  ctx.lineWidth = 3.4;
  ctx.beginPath();
  ctx.arc(cx, cy, r, startAngle, startAngle + ratio * totalArc);
  ctx.stroke();
  ctx.restore();
}

function drawStationHeader(ctx, rect, label, bgColor = '#1c241f', textColor = '#f5e8cf') {
  ctx.fillStyle = bgColor;
  roundedRectPath(ctx, rect.x + 5, rect.y + 3, rect.w - 10, 16, 4);
  ctx.fill();
  ctx.fillStyle = textColor;
  ctx.font = '800 9px "Trebuchet MS", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(label, rect.cx, rect.y + 14);
}

function drawCounterProps(ctx, rect, prop) {
  if (prop === 'plates_shoyu') {
    const px = rect.x + rect.w * 0.36;
    const py = rect.cy + (rect.h > 100 ? -16 : -2);
    for (let i = 0; i < 3; i += 1) {
      ctx.fillStyle = 'rgba(20, 14, 8, 0.25)';
      ctx.beginPath();
      ctx.arc(px + 2, py + 4 - i * 4, 21, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = i === 2 ? '#e9f2eb' : '#d2e2d7';
      ctx.beginPath();
      ctx.arc(px, py - i * 4, 20, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#6e8c7a';
      ctx.lineWidth = 1.6;
      ctx.stroke();
    }
    const bx = rect.x + rect.w * 0.68;
    const by = rect.cy + (rect.h > 100 ? 18 : 6);
    ctx.fillStyle = 'rgba(20, 14, 8, 0.3)';
    ctx.beginPath();
    ctx.ellipse(bx + 2, by + 5, 11, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#291712';
    ctx.beginPath();
    ctx.arc(bx, by, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#c9382c';
    ctx.beginPath();
    ctx.arc(bx, by - 1, 4.5, 0, Math.PI * 2);
    ctx.fill();
    // Amber yuzu cruet
    ctx.fillStyle = '#d98f26';
    ctx.beginPath();
    ctx.arc(bx + 18, by - 14, 7.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff0b8';
    ctx.beginPath();
    ctx.arc(bx + 18, by - 14, 3, 0, Math.PI * 2);
    ctx.fill();
  } else if (prop === 'garnish_bowls') {
    const cx = rect.cx;
    const cy = rect.cy;
    ctx.fillStyle = '#6b4524';
    roundedRectPath(ctx, cx - 36, cy - 22, 72, 44, 7);
    ctx.fill();
    const bowls = [
      { dx: -20, dy: -4, fill: '#4fb85e' },
      { dx: 0, dy: 4, fill: '#e8c47a' },
      { dx: 20, dy: -4, fill: '#e8788a' },
    ];
    for (const b of bowls) {
      ctx.fillStyle = '#f5f0e4';
      ctx.beginPath();
      ctx.arc(cx + b.dx, cy + b.dy, 11, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = b.fill;
      ctx.beginPath();
      ctx.arc(cx + b.dx, cy + b.dy, 7.5, 0, Math.PI * 2);
      ctx.fill();
    }
    if (rect.h > 100) {
      // Rolled white oshibori towel tray at bottom
      ctx.fillStyle = '#382518';
      roundedRectPath(ctx, cx - 26, cy + 32, 52, 16, 5);
      ctx.fill();
      ctx.fillStyle = '#faf7ef';
      roundedRectPath(ctx, cx - 21, cy + 35, 42, 10, 4);
      ctx.fill();
    }
  } else if (prop === 'tea_set') {
    const cx = rect.cx;
    const cy = rect.cy;
    ctx.fillStyle = '#8f6938';
    roundedRectPath(ctx, cx - 24, cy - 18, 48, 36, 6);
    ctx.fill();
    ctx.fillStyle = '#242220';
    ctx.beginPath();
    ctx.arc(cx - 6, cy, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#5e5852';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = '#5b8a5f';
    ctx.beginPath();
    ctx.arc(cx + 14, cy - 6, 5.5, 0, Math.PI * 2);
    ctx.arc(cx + 14, cy + 8, 5.5, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // 'spice_rack'
    const cx = rect.cx;
    const cy = rect.cy;
    ctx.fillStyle = '#472a18';
    roundedRectPath(ctx, cx - 24, cy - 14, 48, 28, 6);
    ctx.fill();
    ctx.fillStyle = '#c94032';
    ctx.beginPath();
    ctx.arc(cx - 10, cy, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#6ea854';
    ctx.beginPath();
    ctx.arc(cx + 10, cy, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ebd48c';
    ctx.beginPath();
    ctx.arc(cx - 10, cy, 3.2, 0, Math.PI * 2);
    ctx.arc(cx + 10, cy, 3.2, 0, Math.PI * 2);
    ctx.fill();
  }
}

export function drawStationHardware(ctx, st, rect, kitchen, orders, clock, isFocused, isHovered) {
  // Cast shadow under every counter tile
  ctx.fillStyle = 'rgba(20, 14, 8, 0.34)';
  roundedRectPath(ctx, rect.x + 4, rect.y + 7, rect.w, rect.h, 9);
  ctx.fill();

  const highlight = isFocused ? '#ffe066' : isHovered ? '#72c98d' : null;

  if (st.kind === 'counter') {
    const wood = ctx.createLinearGradient(rect.x, rect.y, rect.x, rect.y + rect.h);
    wood.addColorStop(0, '#e5c18a');
    wood.addColorStop(1, '#b8894d');
    ctx.fillStyle = wood;
    roundedRectPath(ctx, rect.x + 1, rect.y + 1, rect.w - 2, rect.h - 2, 9);
    ctx.fill();
    ctx.strokeStyle = '#855c2e';
    ctx.lineWidth = 1.6;
    ctx.stroke();
    ctx.fillStyle = 'rgba(255, 248, 224, 0.35)';
    ctx.fillRect(rect.x + 8, rect.y + 2.5, rect.w - 16, 2);
    // Rich butcher-block hinoki grain lines
    ctx.strokeStyle = 'rgba(110, 72, 32, 0.22)';
    ctx.lineWidth = 1;
    for (const frac of [0.32, 0.52, 0.72]) {
      const gy = rect.y + rect.h * frac;
      ctx.beginPath();
      ctx.moveTo(rect.x + 8, gy);
      ctx.quadraticCurveTo(rect.cx, gy + 3, rect.x + rect.w - 8, gy);
      ctx.stroke();
    }
    drawCounterProps(ctx, rect, st.prop ?? 'spice_rack');
    return;
  }

  if (st.kind === 'pantry') {
    const ing = INGREDIENT_MAP[st.ingredientId];
    ctx.fillStyle = '#332922';
    roundedRectPath(ctx, rect.x + 2, rect.y + 2, rect.w - 4, rect.h - 4, 9);
    ctx.fill();
    ctx.strokeStyle = highlight ?? '#b5966d';
    ctx.lineWidth = highlight ? 2.6 : 1.5;
    ctx.stroke();

    // Keycap badge
    ctx.fillStyle = '#1b1613';
    roundedRectPath(ctx, rect.x + 7, rect.y + 7, 22, 19, 4);
    ctx.fill();
    ctx.fillStyle = '#ffe5a3';
    ctx.font = '800 11px "Trebuchet MS", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(ing.key, rect.x + 18, rect.y + 20);

    drawIngredientSprite(ctx, ing.id, 'raw', rect.cx - 14, rect.cy + 8, 1.14);

    ctx.fillStyle = '#faf4e6';
    ctx.font = '800 11px "Trebuchet MS", sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(ing.shortLabel, rect.x + rect.w - 8, rect.y + 21);
    ctx.fillStyle = '#c4dfbf';
    ctx.font = '700 9.5px "Trebuchet MS", sans-serif';
    ctx.fillText(ing.prepBadge, rect.x + rect.w - 8, rect.y + rect.h - 10);
    return;
  }

  if (st.kind === 'trash') {
    ctx.fillStyle = isFocused || isHovered ? '#632924' : '#3d2420';
    roundedRectPath(ctx, rect.x + 2, rect.y + 2, rect.w - 4, rect.h - 4, 9);
    ctx.fill();
    ctx.strokeStyle = highlight ?? '#c26357';
    ctx.lineWidth = highlight ? 2.6 : 1.6;
    ctx.stroke();
    drawIcon(ctx, 'trash', rect.cx - 26, rect.cy, 28, '#f7bcb4');
    ctx.fillStyle = '#ffdbd6';
    ctx.font = '800 12px "Trebuchet MS", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('TRASH [X]', rect.cx - 4, rect.cy + 4);
    return;
  }

  if (st.kind === 'chop') {
    const board = kitchen.chopStations[st.id];
    const wood = ctx.createLinearGradient(rect.x, rect.y, rect.x + rect.w, rect.y + rect.h);
    wood.addColorStop(0, '#f2d9a9');
    wood.addColorStop(1, '#cfa467');
    ctx.fillStyle = wood;
    roundedRectPath(ctx, rect.x + 2, rect.y + 2, rect.w - 4, rect.h - 4, 9);
    ctx.fill();
    ctx.strokeStyle = highlight ?? '#8a602e';
    ctx.lineWidth = highlight ? 2.8 : 1.8;
    ctx.stroke();

    drawStationHeader(ctx, rect, 'HINOKI CHOP', '#4f3518', '#fff0d4');

    if (board?.item) {
      const chopProg = board.hitsNeeded > 0 ? board.hitsDone / board.hitsNeeded : 0;
      drawIngredientSprite(ctx, board.item.ingredientId, board.item.state, rect.cx - 14, rect.cy + 5, 1.28, chopProg);
      if (board.item.state === 'raw') {
        drawChefKnife(ctx, rect.cx + 30, rect.cy + 3, board.knifeAnim);
      }
      for (let i = 0; i < board.hitsNeeded; i += 1) {
        ctx.fillStyle = i < board.hitsDone ? '#33c972' : '#4a3520';
        roundedRectPath(ctx, rect.cx - 34 + i * 24, rect.y + rect.h - 12, 20, 7, 3.5);
        ctx.fill();
      }
    } else {
      drawChefKnife(ctx, rect.cx + 4, rect.cy + 7, 0);
      ctx.fillStyle = '#5c3c1b';
      ctx.font = '800 9.5px "Trebuchet MS", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('CHOP x3 [SPACE]', rect.cx, rect.y + rect.h - 7);
    }
    return;
  }

  if (st.kind === 'cook') {
    const sk = kitchen.cookStations[st.id];
    const spec = sk?.item ? INGREDIENT_MAP[sk.item.ingredientId] : null;
    const active = Boolean(sk?.item);
    const potCy = rect.y + 45;

    if (st.cookType === 'grill') {
      ctx.fillStyle = '#2d2827';
      roundedRectPath(ctx, rect.x + 2, rect.y + 2, rect.w - 4, rect.h - 4, 9);
      ctx.fill();
      ctx.strokeStyle = sk?.heatZone === 'perfect' ? '#4ae388' : highlight ?? '#78685c';
      ctx.lineWidth = highlight || sk?.heatZone === 'perfect' ? 2.8 : 1.7;
      ctx.stroke();

      for (let e = 0; e < 5; e += 1) {
        const ex = rect.x + 26 + e * ((rect.w - 52) / 4);
        const glow = active ? 0.84 + Math.sin(clock * 12 + e) * 0.16 : 0.36;
        ctx.fillStyle = `rgba(255, 88, 32, ${glow})`;
        ctx.beginPath();
        ctx.ellipse(ex, potCy + 2, 15, 7.5, 0.2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.strokeStyle = '#5c534e';
      ctx.lineWidth = 2.6;
      for (let gx = rect.x + 14; gx <= rect.x + rect.w - 14; gx += 16) {
        ctx.beginPath();
        ctx.moveTo(gx, rect.y + 22);
        ctx.lineTo(gx, rect.y + rect.h - 14);
        ctx.stroke();
      }
    } else if (st.cookType === 'fryer') {
      ctx.fillStyle = '#737d85';
      roundedRectPath(ctx, rect.x + 2, rect.y + 2, rect.w - 4, rect.h - 4, 9);
      ctx.fill();
      ctx.strokeStyle = sk?.heatZone === 'perfect' ? '#4ae388' : highlight ?? '#aeb8bf';
      ctx.lineWidth = highlight || sk?.heatZone === 'perfect' ? 2.8 : 1.7;
      ctx.stroke();

      const oil = ctx.createRadialGradient(rect.cx, potCy, 5, rect.cx, potCy, rect.w * 0.44);
      oil.addColorStop(0, '#ffe06b');
      oil.addColorStop(1, '#c98018');
      ctx.fillStyle = oil;
      roundedRectPath(ctx, rect.x + 12, rect.y + 21, rect.w - 24, rect.h - 30, 6);
      ctx.fill();

      if (active) {
        ctx.fillStyle = 'rgba(255, 250, 210, 0.76)';
        for (let b = 0; b < 6; b += 1) {
          const bx = rect.x + 26 + ((b * 23 + Math.floor(clock * 18)) % (rect.w - 52));
          const by = rect.y + 28 + ((b * 11) % Math.max(12, rect.h - 46));
          ctx.beginPath();
          ctx.arc(bx, by, 2.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    } else {
      ctx.fillStyle = '#47423e';
      roundedRectPath(ctx, rect.x + 2, rect.y + 2, rect.w - 4, rect.h - 4, 9);
      ctx.fill();
      ctx.strokeStyle = sk?.heatZone === 'perfect' ? '#4ae388' : highlight ?? '#8a7e72';
      ctx.lineWidth = highlight || sk?.heatZone === 'perfect' ? 2.8 : 1.7;
      ctx.stroke();

      ctx.fillStyle = '#5c3120';
      ctx.beginPath();
      ctx.arc(rect.cx, potCy, 24, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#c98f5c';
      ctx.lineWidth = 2.0;
      ctx.stroke();
      ctx.fillStyle = active ? '#e6a83e' : '#3d2419';
      ctx.beginPath();
      ctx.arc(rect.cx, potCy, 19, 0, Math.PI * 2);
      ctx.fill();
    }

    drawStationHeader(ctx, rect, st.label, 'rgba(18, 22, 20, 0.86)', '#f7ecd4');

    if (sk?.item) {
      drawCookRing(ctx, rect.cx, potCy, 21, sk, spec);
      drawIngredientSprite(ctx, sk.item.ingredientId, sk.item.state, rect.cx, potCy, 1.04, 0, sk.item.isPerfect);

      const pillCol = sk.heatZone === 'perfect' ? '#229653' : sk.heatZone === 'burnt' || sk.heatZone === 'warning' ? '#c93c37' : '#b8681f';
      const pillTxt = sk.heatZone === 'perfect' ? 'PERFECT!' : sk.heatZone === 'burnt' ? 'BURNT!' : sk.heatZone === 'warning' ? 'PULL!' : 'COOKING';
      ctx.fillStyle = pillCol;
      roundedRectPath(ctx, rect.cx - 36, rect.y + rect.h - 17, 72, 15, 4);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = '800 9.5px "Trebuchet MS", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(pillTxt, rect.cx, rect.y + rect.h - 6);
    }
    return;
  }

  if (st.kind === 'plate') {
    const plate = kitchen.plateStations[st.id];
    const slate = ctx.createLinearGradient(rect.x, rect.y, rect.x, rect.y + rect.h);
    slate.addColorStop(0, '#383e44');
    slate.addColorStop(1, '#22262b');
    ctx.fillStyle = slate;
    roundedRectPath(ctx, rect.x + 2, rect.y + 2, rect.w - 4, rect.h - 4, 11);
    ctx.fill();
    ctx.strokeStyle = highlight ?? '#b59d70';
    ctx.lineWidth = highlight ? 3 : 2;
    ctx.stroke();

    const candidate = plate?.candidateIds?.length
      ? RECIPE_MAP[plate.candidateIds[0]]
      : orders.tickets[0]
        ? RECIPE_MAP[orders.tickets[0].recipeId]
        : RECIPE_MAP.yuzu_ramen;
    const platedIds = (plate?.items ?? []).map((it) => it.ingredientId);

    if (st.hRows >= 2) {
      drawPlatedDish(ctx, candidate.id, platedIds, rect.x + 86, rect.cy, 52, {
        showPlate: true,
        glow: platedIds.length > 0,
      });

      ctx.textAlign = 'left';
      ctx.fillStyle = platedIds.length > 0 ? '#ffe48a' : '#dce8da';
      ctx.font = '900 14px "Trebuchet MS", sans-serif';
      ctx.fillText(
        platedIds.length > 0 ? `${candidate.shortName} (${platedIds.length}/3)` : st.label,
        rect.x + 154,
        rect.y + 34,
      );

      for (let i = 0; i < candidate.steps.length; i += 1) {
        const step = candidate.steps[i];
        const done = platedIds.includes(step.ingredientId);
        const sy = rect.y + 62 + i * 32;
        ctx.fillStyle = done ? '#28613d' : '#1b2024';
        roundedRectPath(ctx, rect.x + 154, sy - 13, rect.w - 200, 24, 6);
        ctx.fill();

        ctx.fillStyle = done ? '#58eb8f' : '#c9974c';
        ctx.beginPath();
        ctx.arc(rect.x + 168, sy - 1, 5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = done ? '#b8f7cd' : '#e6ede5';
        ctx.font = '700 11.5px "Trebuchet MS", sans-serif';
        ctx.fillText(`${i + 1}. ${step.label}`, rect.x + 180, sy + 3);
      }

      // Corner ceramic garnish ramekin prop on large plating island
      ctx.fillStyle = '#f2ece0';
      ctx.beginPath();
      ctx.arc(rect.x + rect.w - 26, rect.y + rect.h - 24, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#4fb85e';
      ctx.beginPath();
      ctx.arc(rect.x + rect.w - 26, rect.y + rect.h - 24, 7.5, 0, Math.PI * 2);
      ctx.fill();
    } else {
      const dishCx = st.wCols >= 4 ? rect.x + 54 : rect.x + 48;
      drawPlatedDish(ctx, candidate.id, platedIds, dishCx, rect.cy, 35, {
        showPlate: true,
        glow: platedIds.length > 0,
      });

      const tx = st.wCols >= 4 ? rect.x + 98 : rect.x + 90;
      ctx.textAlign = 'left';
      ctx.fillStyle = platedIds.length > 0 ? '#ffe48a' : '#d6e3d5';
      ctx.font = st.wCols >= 4 ? '800 11.5px "Trebuchet MS", sans-serif' : '800 10px "Trebuchet MS", sans-serif';
      ctx.fillText(
        platedIds.length > 0 ? `${candidate.shortName} (${platedIds.length}/3)` : `${st.label}`,
        tx,
        rect.y + 32,
      );
      const nextStep = candidate.steps.find((s) => !platedIds.includes(s.ingredientId));
      ctx.fillStyle = nextStep ? '#b9d9b4' : '#8ef5b0';
      ctx.font = st.wCols >= 4 ? '700 10.5px "Trebuchet MS", sans-serif' : '700 9.5px "Trebuchet MS", sans-serif';
      ctx.fillText(nextStep ? `NEXT: ${nextStep.label.toUpperCase()}` : 'DISH COMPLETE!', tx, rect.y + 54);
    }
    return;
  }

  if (st.kind === 'pass') {
    const pass = kitchen.passStations[st.id];
    const hasReady = (pass?.plates?.length ?? 0) > 0;
    const passGrad = ctx.createLinearGradient(rect.x, rect.y, rect.x, rect.y + rect.h);
    passGrad.addColorStop(0, hasReady ? '#735127' : '#4a3d31');
    passGrad.addColorStop(1, hasReady ? '#4a3215' : '#30271e');
    ctx.fillStyle = passGrad;
    roundedRectPath(ctx, rect.x + 2, rect.y + 2, rect.w - 4, rect.h - 4, 10);
    ctx.fill();
    ctx.strokeStyle = hasReady ? '#ffe066' : highlight ?? '#c9974c';
    ctx.lineWidth = hasReady || highlight ? 2.8 : 1.8;
    ctx.stroke();

    // Handcrafted miniature Japanese noren valance curtain along top edge of Warm Pass
    const panelW = (rect.w - 16) / 4;
    for (let n = 0; n < 4; n += 1) {
      const nx = rect.x + 6 + n * (panelW + 1.3);
      ctx.fillStyle = n % 2 === 0 ? '#9e3024' : '#253c54';
      roundedRectPath(ctx, nx, rect.y + 3, panelW - 2, 11, 2);
      ctx.fill();
      ctx.fillStyle = '#f2e5c6';
      ctx.fillRect(nx + 2, rect.y + 12, panelW - 6, 1.4);
    }

    if (hasReady) {
      const lead = pass.plates[0];
      const recipe = RECIPE_MAP[lead.recipeId];
      drawPlatedDish(
        ctx,
        recipe.id,
        recipe.steps.map((s) => s.ingredientId),
        rect.x + 54,
        rect.cy + 4,
        34,
        { showPlate: true, glow: true },
      );

      const pillX = rect.x + 96;
      const pillW = rect.w - 146;
      ctx.fillStyle = '#228c4e';
      roundedRectPath(ctx, pillX, rect.y + 18, pillW, 20, 6);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 10.5px "Trebuchet MS", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('READY TO SERVE', pillX + pillW / 2, rect.y + 32);

      ctx.fillStyle = '#ffe9b8';
      ctx.font = '800 11px "Trebuchet MS", sans-serif';
      ctx.fillText(recipe.shortName, pillX + pillW / 2, rect.y + 59);

      drawBrassBell(ctx, rect.x + rect.w - 26, rect.cy + 5, pass.bellAnim, true, clock);
    } else {
      drawBrassBell(ctx, rect.x + rect.w - 28, rect.cy + 5, pass?.bellAnim ?? 0, false, clock);
      ctx.fillStyle = '#f5e2ba';
      ctx.font = '800 12px "Trebuchet MS", sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(st.label, rect.x + 16, rect.y + 39);
      ctx.fillStyle = '#c4ae8c';
      ctx.font = '700 10.5px "Trebuchet MS", sans-serif';
      ctx.fillText('Deliver Dish Here', rect.x + 16, rect.y + 60);
    }
  }
}
