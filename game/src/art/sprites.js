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
    const aura = ctx.createRadialGradient(0, 0, 20, 0, 0, 64);
    aura.addColorStop(0, 'rgba(255, 224, 118, 0.56)');
    aura.addColorStop(1, 'rgba(255, 224, 118, 0)');
    ctx.fillStyle = aura;
    ctx.beginPath();
    ctx.arc(0, 0, 64, 0, Math.PI * 2);
    ctx.fill();
  }

  if (showPlate) {
    ctx.fillStyle = 'rgba(16, 10, 6, 0.45)';
    ctx.beginPath();
    ctx.ellipse(4, 9, 47, 41, 0, 0, Math.PI * 2);
    ctx.fill();

    if (recipeId === 'yuzu_ramen') {
      ctx.fillStyle = '#99291e';
      ctx.beginPath();
      ctx.arc(0, 0, 46, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#f0c475';
      ctx.lineWidth = 2.4;
      ctx.stroke();
      ctx.fillStyle = '#220e0a';
      ctx.beginPath();
      ctx.arc(0, 0, 40, 0, Math.PI * 2);
      ctx.fill();
    } else if (recipeId === 'ebi_tempura_don') {
      ctx.fillStyle = '#1d1716';
      ctx.beginPath();
      ctx.arc(0, 0, 46, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#d94534';
      ctx.lineWidth = 4;
      ctx.stroke();
      ctx.strokeStyle = '#ebc072';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(0, 0, 42, 0, Math.PI * 2);
      ctx.stroke();
    } else if (recipeId === 'yakitori_bento') {
      ctx.fillStyle = '#331d12';
      roundedRectPath(ctx, -46, -34, 92, 68, 10);
      ctx.fill();
      ctx.strokeStyle = '#cf4e38';
      ctx.lineWidth = 2.6;
      ctx.stroke();
      ctx.fillStyle = '#24140c';
      roundedRectPath(ctx, -40, -28, 38, 56, 5);
      ctx.fill();
      roundedRectPath(ctx, 2, -28, 38, 56, 5);
      ctx.fill();
    } else if (recipeId === 'yuzu_soba') {
      ctx.fillStyle = '#d8ae6c';
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
      const isSalmon = recipeId === 'teriyaki_salmon';
      ctx.fillStyle = isSalmon ? '#cde2d6' : '#faf4e6';
      ctx.beginPath();
      ctx.arc(0, 0, 46, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = isSalmon ? '#5b8572' : '#c9a66b';
      ctx.lineWidth = 2.4;
      ctx.stroke();
      ctx.strokeStyle = isSalmon ? 'rgba(255,255,255,0.42)' : 'rgba(201,166,107,0.32)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(0, 0, 38, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  if (recipeId === 'yuzu_ramen') {
    if (has('noodles')) {
      const broth = ctx.createRadialGradient(-7, -7, 4, 0, 0, 39);
      broth.addColorStop(0, '#fff096');
      broth.addColorStop(0.65, '#eb9f2a');
      broth.addColorStop(1, '#c77214');
      ctx.fillStyle = broth;
      ctx.beginPath();
      ctx.arc(0, 0, 39, 0, Math.PI * 2);
      ctx.fill();
      // Shimmering aroma oil droplets & broth specular arc
      ctx.fillStyle = 'rgba(255, 250, 214, 0.52)';
      for (const [ox, oy, or] of [[-24, 10, 3], [-12, 24, 2.4], [18, 22, 2.8], [26, -14, 2.2], [-2, -26, 2.6]]) {
        ctx.beginPath();
        ctx.arc(ox, oy, or, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.strokeStyle = '#e6c87a';
      ctx.lineWidth = 3.2;
      for (const yOff of [-12, -5, 2, 9, 16]) {
        ctx.beginPath();
        ctx.moveTo(-25, yOff + 1);
        ctx.quadraticCurveTo(-8, yOff - 5, 0, yOff + 2);
        ctx.quadraticCurveTo(10, yOff + 7, 25, yOff);
        ctx.stroke();
      }
      ctx.strokeStyle = '#fff8d4';
      ctx.lineWidth = 2.1;
      for (const yOff of [-12, -5, 2, 9, 16]) {
        ctx.beginPath();
        ctx.moveTo(-25, yOff);
        ctx.quadraticCurveTo(-8, yOff - 6, 0, yOff + 1);
        ctx.quadraticCurveTo(10, yOff + 6, 25, yOff - 1);
        ctx.stroke();
      }
    }
    if (has('yuzu')) {
      // Bright yuzu citrus wheel
      ctx.fillStyle = '#ffd638';
      ctx.beginPath();
      ctx.arc(-15, -13, 10.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fff9cc';
      ctx.beginPath();
      ctx.arc(-15, -13, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#f2c12e';
      ctx.lineWidth = 1;
      for (let seg = 0; seg < 6; seg += 1) {
        const ang = (seg * Math.PI) / 3;
        ctx.beginPath();
        ctx.moveTo(-15, -13);
        ctx.lineTo(-15 + Math.cos(ang) * 7, -13 + Math.sin(ang) * 7);
        ctx.stroke();
      }
      // Ajitama half soft-boiled egg with jammy orange yolk
      ctx.fillStyle = '#fff9ec';
      ctx.beginPath();
      ctx.ellipse(13, -12, 11.5, 9, 0.25, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#f07c18';
      ctx.beginPath();
      ctx.arc(13, -12, 5.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(255, 245, 210, 0.72)';
      ctx.beginPath();
      ctx.arc(11.5, -13.5, 1.7, 0, Math.PI * 2);
      ctx.fill();
      // Narutomaki white-and-pink spiral slice
      ctx.fillStyle = '#fffaf2';
      ctx.beginPath();
      ctx.arc(-20, 12, 7.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ef7d92';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.arc(-20, 12, 4, 0, Math.PI * 1.5);
      ctx.stroke();
    }
    if (has('scallion')) {
      // Toasted nori sheet tucked on upper-right rim + scallion rings
      ctx.fillStyle = '#18291d';
      roundedRectPath(ctx, 17, 2, 16, 21, 2);
      ctx.fill();
      ctx.strokeStyle = '#5cd469';
      ctx.lineWidth = 2.5;
      for (const [sx, sy] of [[-9, 17], [1, 12], [-2, -2], [8, 22]]) {
        ctx.beginPath();
        ctx.arc(sx, sy, 3.2, 0, Math.PI * 2);
        ctx.stroke();
      }
      // Pair of wooden chopsticks resting across the bowl rim
      ctx.save();
      ctx.rotate(-0.34);
      ctx.fillStyle = 'rgba(18, 10, 6, 0.38)';
      ctx.fillRect(-38, 28, 76, 4.2);
      ctx.fillStyle = '#e3be7a';
      ctx.beginPath();
      ctx.moveTo(-38, 25);
      ctx.lineTo(38, 24);
      ctx.lineTo(38, 27.5);
      ctx.lineTo(-38, 26.8);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(-38, 30.5);
      ctx.lineTo(38, 29.5);
      ctx.lineTo(38, 33);
      ctx.lineTo(-38, 32.3);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#b83c2b';
      ctx.fillRect(22, 24, 16, 3.5);
      ctx.fillRect(22, 29.5, 16, 3.5);
      ctx.restore();
    }
  } else if (recipeId === 'ebi_tempura_don') {
    if (has('rice')) {
      ctx.fillStyle = '#fffcf5';
      ctx.beginPath();
      ctx.arc(0, 2, 37, 0, Math.PI * 2);
      ctx.fill();
      // Savory tentsuyu sauce drizzle across rice
      ctx.strokeStyle = 'rgba(110, 56, 18, 0.72)';
      ctx.lineWidth = 3.0;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(-22, -10);
      ctx.quadraticCurveTo(-4, -2, 16, -12);
      ctx.moveTo(-20, 12);
      ctx.quadraticCurveTo(0, 20, 20, 10);
      ctx.stroke();
      ctx.fillStyle = '#2c2017';
      for (const [sx, sy] of [[-16, -8], [14, 18], [-6, 22], [8, -20]]) {
        ctx.beginPath();
        ctx.arc(sx, sy, 1.4, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    if (has('shrimp')) {
      for (const [sx, sy, rot] of [[-9, -7, -0.38], [10, 4, -0.22]]) {
        ctx.save();
        ctx.translate(sx, sy);
        ctx.rotate(rot);
        ctx.fillStyle = 'rgba(24, 12, 6, 0.3)';
        ctx.beginPath();
        ctx.ellipse(2, 4, 21, 9, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ee9b2f';
        ctx.beginPath();
        ctx.ellipse(0, 0, 21, 9, 0, 0, Math.PI * 2);
        ctx.fill();
        // Crispy panko batter highlights
        ctx.fillStyle = '#ffd166';
        for (const [bx, by, br] of [[-11, -3, 4], [-3, -4, 4.5], [5, -3, 4.2], [-6, 3, 3.8], [3, 3, 3.5]]) {
          ctx.beginPath();
          ctx.arc(bx, by, br, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.fillStyle = '#fff5cf';
        ctx.beginPath();
        ctx.arc(-5, -3, 2, 0, Math.PI * 2);
        ctx.arc(4, -2, 2, 0, Math.PI * 2);
        ctx.fill();
        // Flared coral tail
        ctx.fillStyle = '#e34c38';
        ctx.beginPath();
        ctx.moveTo(16, -4);
        ctx.lineTo(26, -8);
        ctx.lineTo(23, 0);
        ctx.lineTo(25, 6);
        ctx.lineTo(16, 2);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }
    }
    if (has('scallion')) {
      ctx.strokeStyle = '#54c762';
      ctx.lineWidth = 2.5;
      for (const [gx, gy] of [[-18, 13], [3, 18], [14, -15], [-4, -18]]) {
        ctx.beginPath();
        ctx.arc(gx, gy, 3.2, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
  } else if (recipeId === 'teriyaki_salmon') {
    if (has('rice')) {
      ctx.fillStyle = '#fffdf8';
      ctx.beginPath();
      ctx.arc(-14, 11, 20, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#2d241e';
      for (const [sx, sy] of [[-18, 8], [-11, 13], [-14, 4]]) {
        ctx.beginPath();
        ctx.arc(sx, sy, 1.4, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    if (has('yuzu')) {
      ctx.fillStyle = '#439c52';
      ctx.beginPath();
      ctx.ellipse(-18, -14, 11, 6, 0.35, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffe04d';
      ctx.beginPath();
      ctx.arc(17, 19, 10.5, 0, Math.PI);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#fff7ba';
      ctx.beginPath();
      ctx.arc(17, 19.5, 7, 0, Math.PI);
      ctx.closePath();
      ctx.fill();
    }
    if (has('salmon')) {
      const sGrad = ctx.createLinearGradient(-8, -18, 28, 10);
      sGrad.addColorStop(0, '#ff8e53');
      sGrad.addColorStop(0.55, '#ea5d2c');
      sGrad.addColorStop(1, '#c43e18');
      ctx.fillStyle = sGrad;
      ctx.beginPath();
      ctx.ellipse(10, -4, 25, 14.5, -0.25, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#361208';
      ctx.lineWidth = 2.6;
      for (const gx of [-1, 8, 17, 25]) {
        ctx.beginPath();
        ctx.moveTo(gx - 2, -14);
        ctx.lineTo(gx + 3, 5);
        ctx.stroke();
      }
      ctx.strokeStyle = 'rgba(255, 252, 234, 0.68)';
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.ellipse(8, -9, 14, 4.5, -0.25, Math.PI * 1.05, Math.PI * 1.9);
      ctx.stroke();
      ctx.fillStyle = '#faf0c8';
      for (const [sx, sy] of [[4, -3], [14, -1], [21, -7], [9, 3]]) {
        ctx.beginPath();
        ctx.arc(sx, sy, 1.4, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  } else if (recipeId === 'yakitori_bento') {
    if (has('rice')) {
      ctx.fillStyle = '#fffcf2';
      roundedRectPath(ctx, -36, -22, 30, 44, 6);
      ctx.fill();
      ctx.fillStyle = '#d93d34';
      ctx.beginPath();
      ctx.arc(-21, 0, 5.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#2c2017';
      for (const [sx, sy] of [[-29, -12], [-14, 12]]) {
        ctx.beginPath();
        ctx.arc(sx, sy, 1.3, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    if (has('chicken')) {
      for (const yOff of [-11, 7]) {
        ctx.strokeStyle = '#e5c88e';
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.moveTo(3, yOff);
        ctx.lineTo(37, yOff);
        ctx.stroke();
        for (const cx of [12, 21, 30]) {
          ctx.fillStyle = '#a34c20';
          ctx.beginPath();
          ctx.arc(cx, yOff, 5.4, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#381508';
          ctx.fillRect(cx - 2.5, yOff - 0.8, 5, 1.8);
          ctx.fillStyle = 'rgba(255, 244, 214, 0.55)';
          ctx.beginPath();
          ctx.arc(cx - 1.6, yOff - 1.8, 1.6, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
    if (has('scallion')) {
      ctx.strokeStyle = '#58c464';
      ctx.lineWidth = 2.3;
      for (const [sx, sy] of [[14, -18], [26, 18], [16, 16]]) {
        ctx.beginPath();
        ctx.arc(sx, sy, 3.1, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
  } else if (recipeId === 'katsu_curry') {
    if (has('rice')) {
      ctx.fillStyle = '#fffcf5';
      ctx.beginPath();
      ctx.arc(-11, 0, 27, Math.PI * 0.5, Math.PI * 1.5);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#e0483d';
      ctx.beginPath();
      ctx.arc(-26, -12, 4.5, 0, Math.PI * 2);
      ctx.fill();
    }
    if (has('curry')) {
      const cGrad = ctx.createRadialGradient(8, -2, 3, 8, 0, 28);
      cGrad.addColorStop(0, '#c46f18');
      cGrad.addColorStop(1, '#8f440b');
      ctx.fillStyle = cGrad;
      ctx.beginPath();
      ctx.arc(8, 0, 28, -Math.PI * 0.5, Math.PI * 0.5);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#f28b30';
      ctx.beginPath();
      ctx.arc(22, -9, 3.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#f2d98d';
      ctx.beginPath();
      ctx.arc(20, 12, 3.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 240, 194, 0.52)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(10, -2, 20, -0.9, 0.45);
      ctx.stroke();
    }
    if (has('chicken')) {
      ctx.fillStyle = 'rgba(24, 12, 6, 0.32)';
      roundedRectPath(ctx, -21, -9, 46, 25, 8);
      ctx.fill();
      const kGrad = ctx.createLinearGradient(-22, -12, 24, 12);
      kGrad.addColorStop(0, '#ffd466');
      kGrad.addColorStop(1, '#d98821');
      ctx.fillStyle = kGrad;
      roundedRectPath(ctx, -23, -12, 46, 24, 8);
      ctx.fill();
      ctx.strokeStyle = '#7a3e0d';
      ctx.lineWidth = 2.1;
      for (const sx of [-14, -7, 0, 7, 14]) {
        ctx.beginPath();
        ctx.moveTo(sx, -11);
        ctx.lineTo(sx, 11);
        ctx.stroke();
      }
      ctx.fillStyle = 'rgba(255, 250, 224, 0.58)';
      ctx.fillRect(-19, -9, 38, 3);
    }
  } else if (recipeId === 'yuzu_soba') {
    if (has('noodles')) {
      ctx.fillStyle = '#9c927d';
      ctx.beginPath();
      ctx.ellipse(-6, 2, 25, 19, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#5c5345';
      ctx.lineWidth = 1.9;
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
      ctx.ellipse(16, -8, 16, 7.5, -0.4, 0, Math.PI * 2);
      ctx.fill();
    }
    if (has('yuzu')) {
      ctx.fillStyle = '#ffd63b';
      ctx.beginPath();
      ctx.arc(20, 14, 9, 0, Math.PI * 2);
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
    const aura = ctx.createRadialGradient(0, -2, 3, 0, -2, 23);
    aura.addColorStop(0, `rgba(255, 224, 118, ${0.62 * pulse})`);
    aura.addColorStop(1, 'rgba(255, 224, 118, 0)');
    ctx.fillStyle = aura;
    ctx.beginPath();
    ctx.arc(0, -2, 23, 0, Math.PI * 2);
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
  for (let i = 0; i < chef.dashTrail.length; i += 1) {
    const t = chef.dashTrail[i];
    const a = Math.max(0, t.life / t.maxLife) * 0.45;
    ctx.save();
    ctx.globalAlpha = a;
    ctx.fillStyle = '#ffe99e';
    ctx.beginPath();
    ctx.arc(t.x, t.y, 26, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#fff9df';
    ctx.lineWidth = 2.6;
    ctx.beginPath();
    ctx.arc(t.x, t.y, 31, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  ctx.save();
  ctx.translate(chef.x, chef.y - 3);
  ctx.scale(1.62, 1.62);

  // Multi-layered soft 2.5D floor contact shadow
  ctx.fillStyle = 'rgba(12, 8, 4, 0.30)';
  ctx.beginPath();
  ctx.ellipse(3, 10, 23, 17, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(12, 8, 4, 0.48)';
  ctx.beginPath();
  ctx.ellipse(2, 7, 17, 13, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.rotate(chef.facingAngle + Math.PI / 2);
  const stride = Math.sin(chef.walkPhase) * 4.8;

  // Animated wooden geta clogs
  ctx.fillStyle = '#3d2414';
  roundedRectPath(ctx, -13, 2 + stride, 8, 12, 3);
  ctx.fill();
  roundedRectPath(ctx, 5, 2 - stride, 8, 12, 3);
  ctx.fill();
  ctx.fillStyle = '#d93b2b';
  ctx.fillRect(-10.5, 3 + stride, 3, 4);
  ctx.fillRect(7.5, 3 - stride, 3, 4);

  // Indigo Kyoto samue tunic & shoulder highlight folds
  ctx.fillStyle = '#234663';
  roundedRectPath(ctx, -18, -11, 36, 22, 10);
  ctx.fill();
  ctx.fillStyle = '#325f85';
  roundedRectPath(ctx, -15, -9, 30, 9, 6);
  ctx.fill();
  ctx.strokeStyle = '#f2f6f8';
  ctx.lineWidth = 2.2;
  roundedRectPath(ctx, -18, -11, 36, 22, 10);
  ctx.stroke();

  // Cream collar V & vermilion obi sash
  ctx.fillStyle = '#faf4e6';
  ctx.beginPath();
  ctx.moveTo(-7, -10);
  ctx.lineTo(7, -10);
  ctx.lineTo(0, -1);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#d93b2b';
  roundedRectPath(ctx, -12, 7.5, 24, 4.5, 2);
  ctx.fill();

  // Extended arms + larger hands + held item
  const handY = -20 - chef.interactAnim * 4;
  ctx.fillStyle = '#f4c7a0';
  ctx.beginPath();
  ctx.arc(-13, handY + 5, 5.5, 0, Math.PI * 2);
  ctx.arc(13, handY + 5, 5.5, 0, Math.PI * 2);
  ctx.fill();

  if (heldItem) {
    if (heldItem.kind === 'dish') {
      drawPlatedDish(ctx, heldItem.recipeId, ['rice', 'salmon', 'yuzu', 'noodles', 'shrimp', 'chicken', 'curry', 'scallion'], 0, handY - 10, 24, { showPlate: true, glow: true });
    } else {
      drawIngredientSprite(ctx, heldItem.ingredientId, heldItem.state, 0, handY - 7, 1.08, 0, heldItem.isPerfect);
    }
  }

  // Head with clear forward-facing directional rim, dark hair & white-vermilion hachimaki
  ctx.fillStyle = '#f4c7a0';
  ctx.beginPath();
  ctx.arc(0, -3.2, 12.6, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#1f1714';
  ctx.beginPath();
  ctx.arc(0, 1.2, 12.6, 0, Math.PI * 2);
  ctx.fill();

  // Hair sheen highlight
  ctx.strokeStyle = 'rgba(255, 245, 230, 0.28)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, 0, 7, Math.PI * 1.1, Math.PI * 1.9);
  ctx.stroke();

  // Bold white hachimaki headband + vermilion crest band
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 5.0;
  ctx.beginPath();
  ctx.arc(0, -0.2, 11.6, Math.PI * 0.86, Math.PI * 2.14);
  ctx.stroke();

  ctx.strokeStyle = '#d93b2b';
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.arc(0, -0.8, 11.6, Math.PI * 1.18, Math.PI * 1.82);
  ctx.stroke();

  // Trailing headband tails + vermilion knot
  const sway = Math.sin(clock * 8 + chef.walkPhase) * 2.8;
  ctx.strokeStyle = '#faf6eb';
  ctx.lineWidth = 3.4;
  ctx.beginPath();
  ctx.moveTo(-3, 11);
  ctx.lineTo(-7.5 + sway, 20);
  ctx.moveTo(3, 11);
  ctx.lineTo(7.5 + sway, 19);
  ctx.stroke();
  ctx.fillStyle = '#d93b2b';
  ctx.beginPath();
  ctx.arc(0, 11, 3.4, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

export function drawCookRing(ctx, cx, cy, r, sk, spec) {
  if (!sk.item || !spec) return;
  const maxTime = spec.burnTime;
  const startAngle = -Math.PI / 2;
  const totalArc = Math.PI * 2;

  ctx.save();
  ctx.strokeStyle = 'rgba(255,255,255,0.26)';
  ctx.lineWidth = 4.0;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.stroke();

  const pStart = startAngle + (spec.perfectStart / maxTime) * totalArc;
  const pEnd = startAngle + (spec.perfectEnd / maxTime) * totalArc;
  ctx.strokeStyle = '#39d17b';
  ctx.lineWidth = 4.6;
  ctx.beginPath();
  ctx.arc(cx, cy, r, pStart, pEnd);
  ctx.stroke();

  ctx.strokeStyle = '#e5534b';
  ctx.lineWidth = 4.2;
  ctx.beginPath();
  ctx.arc(cx, cy, r, pEnd, startAngle + totalArc);
  ctx.stroke();

  const ratio = Math.min(1, sk.elapsed / maxTime);
  ctx.strokeStyle = sk.heatZone === 'perfect' ? '#ffe066' : sk.heatZone === 'burnt' || sk.heatZone === 'warning' ? '#ff5f52' : '#f59f3d';
  ctx.lineWidth = 3.6;
  ctx.beginPath();
  ctx.arc(cx, cy, r, startAngle, startAngle + ratio * totalArc);
  ctx.stroke();
  ctx.restore();
}

function drawStationHeader(ctx, rect, label, bgColor = 'rgba(15, 22, 18, 0.94)', textColor = '#fff2d6') {
  const pillW = Math.max(46, rect.w - 10);
  ctx.fillStyle = bgColor;
  roundedRectPath(ctx, rect.x + 5, rect.y + 3, pillW, 21, 5);
  ctx.fill();
  ctx.strokeStyle = 'rgba(218, 180, 102, 0.65)';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.fillStyle = textColor;
  ctx.font = '900 12px "Trebuchet MS", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(label, rect.cx, rect.y + 17.5);
}

function drawLiveSteamWisps(ctx, cx, cy, clock, count = 3, tint = '#ffffff', spread = 24) {
  ctx.save();
  ctx.lineCap = 'round';
  for (let i = 0; i < count; i += 1) {
    const phase = clock * 3.4 + i * 1.9;
    const xOff = (i - (count - 1) / 2) * spread + Math.sin(phase) * 4;
    const yRise = (phase % 2.4) * 5;
    ctx.globalAlpha = 0.72 - (i % 2) * 0.14;
    ctx.strokeStyle = tint;
    ctx.lineWidth = 3.2;
    ctx.beginPath();
    ctx.moveTo(cx + xOff, cy - yRise);
    ctx.quadraticCurveTo(
      cx + xOff + Math.cos(phase * 1.3) * 7,
      cy - 12 - yRise,
      cx + xOff - Math.sin(phase) * 5,
      cy - 24 - yRise,
    );
    ctx.stroke();
  }
  ctx.restore();
}

function drawStationCabinet25D(ctx, rect, styleKind, isActive = false, highlightColor = null) {
  const frontDepth = rect.h >= 120 ? 19 : 15;
  const topH = rect.h - frontDepth;
  const topRect = {
    x: rect.x,
    y: rect.y,
    w: rect.w,
    h: topH,
    cx: rect.cx,
    cy: rect.y + topH / 2,
  };

  // Multi-layered floor contact shadow directly beneath the 2.5D cabinet
  ctx.fillStyle = 'rgba(12, 8, 5, 0.34)';
  roundedRectPath(ctx, rect.x + 3, rect.y + 8, rect.w + 2, rect.h + 2, 10);
  ctx.fill();
  ctx.fillStyle = 'rgba(8, 5, 3, 0.56)';
  roundedRectPath(ctx, rect.x + 2, rect.y + rect.h - 7, rect.w - 4, 11, 4);
  ctx.fill();

  // 2.5D vertical cabinet front wall
  const frontY = rect.y + topH - 4;
  const frontH = frontDepth + 4;
  const frontFill = styleKind === 'cook'
    ? '#2b3036'
    : styleKind === 'pass'
      ? '#4a311c'
      : styleKind === 'pantry'
        ? '#263830'
        : styleKind === 'trash'
          ? '#3b1e1b'
          : '#6e4c2a';
  ctx.fillStyle = frontFill;
  roundedRectPath(ctx, rect.x + 2, frontY, rect.w - 4, frontH, 7);
  ctx.fill();

  // Recessed dark plinth toe-kick along bottom 4px
  ctx.fillStyle = 'rgba(10, 8, 6, 0.65)';
  ctx.fillRect(rect.x + 6, rect.y + rect.h - 4, rect.w - 12, 3.5);

  // Station-specific 2.5D front face hardware (knobs, louvers, drawers, handles)
  const midY = rect.y + topH + frontDepth * 0.45;
  if (styleKind === 'cook') {
    if (isActive) {
      ctx.fillStyle = 'rgba(255, 132, 42, 0.45)';
      ctx.fillRect(rect.x + 16, rect.y + topH + 1, rect.w - 32, 3);
    }
    const knobCount = Math.min(4, Math.max(2, Math.floor(rect.w / 62)));
    for (let k = 0; k < knobCount; k += 1) {
      const kx = rect.x + 22 + k * 24;
      ctx.fillStyle = '#15181c';
      ctx.beginPath();
      ctx.arc(kx, midY, 4.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#d4aa5a';
      ctx.beginPath();
      ctx.arc(kx, midY, 3.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#241a12';
      ctx.fillRect(kx - 0.8, midY - 3, 1.6, 3);
    }
    // Horizontal louver vents on right half of stove front
    if (rect.w >= 140) {
      ctx.fillStyle = '#161a1e';
      for (let v = 0; v < 2; v += 1) {
        ctx.fillRect(rect.x + rect.w - 64, midY - 3 + v * 5, 48, 2.4);
      }
    }
  } else if (styleKind === 'plate' || styleKind === 'counter' || styleKind === 'chop') {
    const panels = Math.max(1, Math.min(3, Math.floor(rect.w / 100)));
    const pw = (rect.w - 18 - (panels - 1) * 6) / panels;
    for (let p = 0; p < panels; p += 1) {
      const px = rect.x + 9 + p * (pw + 6);
      ctx.fillStyle = 'rgba(32, 20, 10, 0.34)';
      roundedRectPath(ctx, px, rect.y + topH + 2, pw, frontDepth - 5, 3);
      ctx.fill();
      ctx.fillStyle = '#e2be76';
      ctx.fillRect(px + pw * 0.36, midY - 1, pw * 0.28, 2.4);
    }
  } else if (styleKind === 'pass') {
    ctx.fillStyle = '#cfa052';
    ctx.fillRect(rect.x + 12, midY - 1, rect.w - 24, 2.5);
  } else {
    ctx.fillStyle = '#b9c9be';
    ctx.fillRect(rect.cx - 16, midY - 1, 32, 2.5);
  }

  if (highlightColor) {
    ctx.strokeStyle = highlightColor;
    ctx.lineWidth = 2.6;
    roundedRectPath(ctx, rect.x + 1.5, rect.y + 1.5, rect.w - 3, rect.h - 3, 9);
    ctx.stroke();
  }

  return topRect;
}

function drawCounterProps(ctx, rect, prop) {
  if (prop === 'plates_shoyu') {
    const px = rect.x + rect.w * 0.36;
    const py = rect.cy + (rect.h > 95 ? -16 : -2);
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
    const by = rect.cy + (rect.h > 95 ? 18 : 6);
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
    roundedRectPath(ctx, cx - 36, cy - 20, 72, 40, 7);
    ctx.fill();
    const bowls = [
      { dx: -20, dy: -3, fill: '#4fb85e' },
      { dx: 0, dy: 4, fill: '#e8c47a' },
      { dx: 20, dy: -3, fill: '#e8788a' },
    ];
    for (const b of bowls) {
      ctx.fillStyle = '#f5f0e4';
      ctx.beginPath();
      ctx.arc(cx + b.dx, cy + b.dy, 10.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = b.fill;
      ctx.beginPath();
      ctx.arc(cx + b.dx, cy + b.dy, 7.2, 0, Math.PI * 2);
      ctx.fill();
    }
    if (rect.h > 95) {
      ctx.fillStyle = '#382518';
      roundedRectPath(ctx, cx - 26, cy + 28, 52, 16, 5);
      ctx.fill();
      ctx.fillStyle = '#faf7ef';
      roundedRectPath(ctx, cx - 21, cy + 31, 42, 10, 4);
      ctx.fill();
    }
  } else if (prop === 'tea_set') {
    const cx = rect.cx;
    const cy = rect.cy;
    ctx.fillStyle = '#8f6938';
    roundedRectPath(ctx, cx - 26, cy - 16, 52, 32, 6);
    ctx.fill();
    ctx.fillStyle = '#242220';
    ctx.beginPath();
    ctx.arc(cx - 7, cy, 11, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#5e5852';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = '#5b8a5f';
    ctx.beginPath();
    ctx.arc(cx + 14, cy - 6, 5.2, 0, Math.PI * 2);
    ctx.arc(cx + 14, cy + 7, 5.2, 0, Math.PI * 2);
    ctx.fill();
  } else {
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
  const highlight = isFocused ? '#ffe066' : isHovered ? '#72c98d' : null;

  if (st.kind === 'counter') {
    const top = drawStationCabinet25D(ctx, rect, 'counter', false, highlight);
    const wood = ctx.createLinearGradient(top.x, top.y, top.x, top.y + top.h);
    wood.addColorStop(0, '#ebd09e');
    wood.addColorStop(1, '#c79758');
    ctx.fillStyle = wood;
    roundedRectPath(ctx, top.x + 1, top.y + 1, top.w - 2, top.h - 1, 8);
    ctx.fill();
    ctx.strokeStyle = '#855c2e';
    ctx.lineWidth = 1.6;
    ctx.stroke();
    ctx.fillStyle = 'rgba(255, 252, 236, 0.45)';
    ctx.fillRect(top.x + 8, top.y + 2, top.w - 16, 2.5);
    ctx.strokeStyle = 'rgba(110, 72, 32, 0.22)';
    ctx.lineWidth = 1;
    for (const frac of [0.34, 0.56, 0.76]) {
      const gy = top.y + top.h * frac;
      ctx.beginPath();
      ctx.moveTo(top.x + 8, gy);
      ctx.quadraticCurveTo(top.cx, gy + 3, top.x + top.w - 8, gy);
      ctx.stroke();
    }
    drawCounterProps(ctx, top, st.prop ?? 'spice_rack');
    return;
  }

  if (st.kind === 'pantry') {
    const ing = INGREDIENT_MAP[st.ingredientId];
    const top = drawStationCabinet25D(ctx, rect, 'pantry', false, highlight);
    ctx.fillStyle = '#382e26';
    roundedRectPath(ctx, top.x + 2, top.y + 2, top.w - 4, top.h - 2, 8);
    ctx.fill();
    ctx.strokeStyle = highlight ?? '#c2a67a';
    ctx.lineWidth = highlight ? 2.6 : 1.5;
    ctx.stroke();
    ctx.fillStyle = 'rgba(255, 248, 224, 0.22)';
    ctx.fillRect(top.x + 8, top.y + 3, top.w - 16, 2);

    ctx.fillStyle = '#191411';
    roundedRectPath(ctx, top.x + 6, top.y + 6, 21, 18, 4);
    ctx.fill();
    ctx.fillStyle = '#ffe5a3';
    ctx.font = '900 11px "Trebuchet MS", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(ing.key, top.x + 16.5, top.y + 19);

    drawIngredientSprite(ctx, ing.id, 'raw', top.cx - 16, top.cy + 7, 1.05);

    ctx.fillStyle = '#fcf6ea';
    ctx.font = '800 11px "Trebuchet MS", sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(ing.shortLabel, top.x + top.w - 7, top.y + 19);
    ctx.fillStyle = '#bfe3b8';
    ctx.font = '800 9.5px "Trebuchet MS", sans-serif';
    ctx.fillText(ing.prepBadge, top.x + top.w - 7, top.y + top.h - 7);
    return;
  }

  if (st.kind === 'trash') {
    const top = drawStationCabinet25D(ctx, rect, 'trash', false, highlight);
    ctx.fillStyle = isFocused || isHovered ? '#6b2c26' : '#4a2924';
    roundedRectPath(ctx, top.x + 2, top.y + 2, top.w - 4, top.h - 2, 8);
    ctx.fill();
    ctx.strokeStyle = highlight ?? '#c96b5e';
    ctx.lineWidth = highlight ? 2.6 : 1.6;
    ctx.stroke();
    drawIcon(ctx, 'trash', top.cx - 28, top.cy, 25, '#f7bcb4');
    ctx.fillStyle = '#ffe0db';
    ctx.font = '900 11.5px "Trebuchet MS", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('TRASH [X]', top.cx - 8, top.cy + 4);
    return;
  }

  if (st.kind === 'chop') {
    const board = kitchen.chopStations[st.id];
    const top = drawStationCabinet25D(ctx, rect, 'chop', Boolean(board?.item), highlight);
    const wood = ctx.createLinearGradient(top.x, top.y, top.x + top.w, top.y + top.h);
    wood.addColorStop(0, '#f7e1b5');
    wood.addColorStop(1, '#d4ab6e');
    ctx.fillStyle = wood;
    roundedRectPath(ctx, top.x + 2, top.y + 2, top.w - 4, top.h - 2, 8);
    ctx.fill();
    ctx.strokeStyle = highlight ?? '#8a602e';
    ctx.lineWidth = highlight ? 2.8 : 1.8;
    ctx.stroke();
    ctx.fillStyle = 'rgba(255, 252, 236, 0.45)';
    ctx.fillRect(top.x + 8, top.y + 3, top.w - 16, 2);

    drawStationHeader(ctx, top, st.label, '#3c2913', '#fff4dc');

    if (board?.item) {
      const chopProg = board.hitsNeeded > 0 ? board.hitsDone / board.hitsNeeded : 0;
      drawIngredientSprite(ctx, board.item.ingredientId, board.item.state, top.cx - 14, top.cy + 8, 1.18, chopProg);
      if (board.item.state === 'raw') {
        drawChefKnife(ctx, top.cx + 28, top.cy + 7, board.knifeAnim);
      }
      for (let i = 0; i < board.hitsNeeded; i += 1) {
        ctx.fillStyle = i < board.hitsDone ? '#33c972' : '#4a3520';
        roundedRectPath(ctx, top.cx - 32 + i * 22, top.y + top.h - 10, 18, 6, 3);
        ctx.fill();
      }
    } else {
      drawChefKnife(ctx, top.cx + 4, top.cy + 10, 0);
      ctx.fillStyle = '#4f3216';
      ctx.font = '900 9.5px "Trebuchet MS", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('CHOP x3', top.cx, top.y + top.h - 4);
    }
    return;
  }

  if (st.kind === 'cook') {
    const sk = kitchen.cookStations[st.id];
    const spec = sk?.item ? INGREDIENT_MAP[sk.item.ingredientId] : null;
    const active = Boolean(sk?.item);
    const top = drawStationCabinet25D(ctx, rect, 'cook', active, highlight);
    const potCy = st.hRows >= 2 ? top.cy + 8 : top.y + 42;

    if (st.cookType === 'grill') {
      ctx.fillStyle = '#312c2b';
      roundedRectPath(ctx, top.x + 2, top.y + 2, top.w - 4, top.h - 2, 8);
      ctx.fill();
      ctx.strokeStyle = sk?.heatZone === 'perfect' ? '#4ae388' : highlight ?? '#857468';
      ctx.lineWidth = highlight || sk?.heatZone === 'perfect' ? 2.8 : 1.7;
      ctx.stroke();

      const emberY1 = st.hRows >= 2 ? top.y + 42 : potCy + 1;
      const emberY2 = st.hRows >= 2 ? top.y + top.h - 32 : potCy + 1;
      const rows = st.hRows >= 2 ? 3 : 1;
      for (let er = 0; er < rows; er += 1) {
        const ey = rows === 1 ? emberY1 : emberY1 + (er * (emberY2 - emberY1)) / 2;
        for (let e = 0; e < 4; e += 1) {
          const ex = top.x + 28 + e * ((top.w - 56) / 3);
          const glow = active ? 0.88 + Math.sin(clock * 12 + e + er) * 0.12 : 0.42;
          ctx.fillStyle = `rgba(255, 92, 34, ${glow})`;
          ctx.beginPath();
          ctx.ellipse(ex, ey, 14, 7.5, 0.2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.strokeStyle = '#6b615b';
      ctx.lineWidth = 2.6;
      for (let gx = top.x + 14; gx <= top.x + top.w - 14; gx += 16) {
        ctx.beginPath();
        ctx.moveTo(gx, top.y + 25);
        ctx.lineTo(gx, top.y + top.h - 10);
        ctx.stroke();
      }
    } else if (st.cookType === 'fryer') {
      ctx.fillStyle = '#7e8991';
      roundedRectPath(ctx, top.x + 2, top.y + 2, top.w - 4, top.h - 2, 8);
      ctx.fill();
      ctx.strokeStyle = sk?.heatZone === 'perfect' ? '#4ae388' : highlight ?? '#bcc7cf';
      ctx.lineWidth = highlight || sk?.heatZone === 'perfect' ? 2.8 : 1.7;
      ctx.stroke();

      const oil = ctx.createRadialGradient(top.cx, potCy, 5, top.cx, potCy, top.w * 0.42);
      oil.addColorStop(0, '#ffe475');
      oil.addColorStop(1, '#c97e16');
      ctx.fillStyle = oil;
      roundedRectPath(ctx, top.x + 12, top.y + 24, top.w - 24, top.h - 32, 6);
      ctx.fill();

      const bubbleCount = active ? 8 : 4;
      ctx.fillStyle = active ? 'rgba(255, 252, 214, 0.86)' : 'rgba(255, 245, 194, 0.42)';
      for (let b = 0; b < bubbleCount; b += 1) {
        const bx = top.x + 24 + ((b * 27 + Math.floor(clock * 20)) % (top.w - 48));
        const by = top.y + 29 + ((b * 11) % Math.max(12, top.h - 40));
        ctx.beginPath();
        ctx.arc(bx, by, active ? 3.0 : 2.1, 0, Math.PI * 2);
        ctx.fill();
      }
    } else {
      ctx.fillStyle = '#4e4843';
      roundedRectPath(ctx, top.x + 2, top.y + 2, top.w - 4, top.h - 2, 8);
      ctx.fill();
      ctx.strokeStyle = sk?.heatZone === 'perfect' ? '#4ae388' : highlight ?? '#96897b';
      ctx.lineWidth = highlight || sk?.heatZone === 'perfect' ? 2.8 : 1.7;
      ctx.stroke();

      ctx.fillStyle = '#633320';
      ctx.beginPath();
      ctx.arc(top.cx, potCy, 22, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#d49a62';
      ctx.lineWidth = 2.2;
      ctx.stroke();
      ctx.fillStyle = active ? '#eda93b' : '#402619';
      ctx.beginPath();
      ctx.arc(top.cx, potCy, 17, 0, Math.PI * 2);
      ctx.fill();
    }

    drawStationHeader(ctx, top, st.label, 'rgba(15, 22, 18, 0.94)', '#fff2d6');

    if (sk?.item) {
      drawCookRing(ctx, top.cx, potCy, 20, sk, spec);
      drawIngredientSprite(ctx, sk.item.ingredientId, sk.item.state, top.cx, potCy, 1.0, 0, sk.item.isPerfect);

      if (sk.heatZone === 'burnt') {
        drawLiveSteamWisps(ctx, top.cx, potCy - 14, clock, 3, 'rgba(72, 65, 60, 0.85)', 14);
      } else {
        drawLiveSteamWisps(ctx, top.cx, potCy - 12, clock, 3, sk.heatZone === 'perfect' ? '#fff7d4' : '#ffffff', 16);
      }

      const pillCol = sk.heatZone === 'perfect' ? '#1f9653' : sk.heatZone === 'burnt' || sk.heatZone === 'warning' ? '#cf3834' : '#bd671c';
      const pillTxt = sk.heatZone === 'perfect' ? 'PERFECT!' : sk.heatZone === 'burnt' ? 'BURNT!' : sk.heatZone === 'warning' ? 'PULL!' : 'COOKING';
      ctx.fillStyle = pillCol;
      roundedRectPath(ctx, top.cx - 42, top.y + top.h - 17, 84, 17, 4);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 10.5px "Trebuchet MS", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(pillTxt, top.cx, top.y + top.h - 4.5);
    }
    return;
  }

  if (st.kind === 'plate') {
    const plate = kitchen.plateStations[st.id];
    const top = drawStationCabinet25D(ctx, rect, 'plate', (plate?.items?.length ?? 0) > 0, highlight);
    const slate = ctx.createLinearGradient(top.x, top.y, top.x, top.y + top.h);
    slate.addColorStop(0, '#414950');
    slate.addColorStop(1, '#272c32');
    ctx.fillStyle = slate;
    roundedRectPath(ctx, top.x + 1, top.y + 1, top.w - 2, top.h - 1, 9);
    ctx.fill();
    ctx.strokeStyle = highlight ?? '#c9ad76';
    ctx.lineWidth = highlight ? 3 : 2;
    ctx.stroke();
    ctx.fillStyle = 'rgba(255, 252, 236, 0.25)';
    ctx.fillRect(top.x + 10, top.y + 2.5, top.w - 20, 2);

    const candidate = plate?.candidateIds?.length
      ? RECIPE_MAP[plate.candidateIds[0]]
      : orders.tickets[0]
        ? RECIPE_MAP[orders.tickets[0].recipeId]
        : RECIPE_MAP.yuzu_ramen;
    const platedIds = (plate?.items ?? []).map((it) => it.ingredientId);

    if (st.hRows >= 2) {
      drawPlatedDish(ctx, candidate.id, platedIds, top.x + 82, top.cy + 4, 48, {
        showPlate: true,
        glow: platedIds.length > 0,
      });

      ctx.textAlign = 'left';
      ctx.fillStyle = platedIds.length > 0 ? '#ffe48a' : '#e6f0e4';
      ctx.font = '900 14px "Trebuchet MS", sans-serif';
      ctx.fillText(
        platedIds.length > 0 ? `${candidate.shortName} (${platedIds.length}/3)` : st.label,
        top.x + 148,
        top.y + 28,
      );

      for (let i = 0; i < candidate.steps.length; i += 1) {
        const step = candidate.steps[i];
        const done = platedIds.includes(step.ingredientId);
        const sy = top.y + 52 + i * 31;
        ctx.fillStyle = done ? '#28613d' : '#1b2024';
        roundedRectPath(ctx, top.x + 148, sy - 12, top.w - 190, 23, 6);
        ctx.fill();

        ctx.fillStyle = done ? '#58eb8f' : '#c9974c';
        ctx.beginPath();
        ctx.arc(top.x + 162, sy - 0.5, 4.8, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = done ? '#b8f7cd' : '#edf2ec';
        ctx.font = '800 11.5px "Trebuchet MS", sans-serif';
        ctx.fillText(`${i + 1}. ${step.label}`, top.x + 174, sy + 3.5);
      }

      ctx.fillStyle = '#f2ece0';
      ctx.beginPath();
      ctx.arc(top.x + top.w - 22, top.y + top.h - 20, 11, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#4fb85e';
      ctx.beginPath();
      ctx.arc(top.x + top.w - 22, top.y + top.h - 20, 7, 0, Math.PI * 2);
      ctx.fill();
    } else {
      const dishCx = st.wCols >= 4 ? top.x + 48 : top.x + 44;
      drawPlatedDish(ctx, candidate.id, platedIds, dishCx, top.cy + 1, 30, {
        showPlate: true,
        glow: platedIds.length > 0,
      });

      const tx = st.wCols >= 4 ? top.x + 88 : top.x + 82;
      ctx.textAlign = 'left';
      ctx.fillStyle = platedIds.length > 0 ? '#ffe48a' : '#e1ede0';
      ctx.font = st.wCols >= 4 ? '900 11.5px "Trebuchet MS", sans-serif' : '900 10.5px "Trebuchet MS", sans-serif';
      ctx.fillText(
        platedIds.length > 0 ? `${candidate.shortName} (${platedIds.length}/3)` : `${st.label}`,
        tx,
        top.y + 27,
      );
      const nextStep = candidate.steps.find((s) => !platedIds.includes(s.ingredientId));
      ctx.fillStyle = nextStep ? '#bce0b6' : '#8ef5b0';
      ctx.font = st.wCols >= 4 ? '800 10.5px "Trebuchet MS", sans-serif' : '800 9.5px "Trebuchet MS", sans-serif';
      ctx.fillText(nextStep ? `NEXT: ${nextStep.label.toUpperCase()}` : 'DISH COMPLETE!', tx, top.y + 49);
    }
    return;
  }

  if (st.kind === 'pass') {
    const pass = kitchen.passStations[st.id];
    const hasReady = (pass?.plates?.length ?? 0) > 0;
    const top = drawStationCabinet25D(ctx, rect, 'pass', hasReady, highlight);
    const passGrad = ctx.createLinearGradient(top.x, top.y, top.x, top.y + top.h);
    passGrad.addColorStop(0, hasReady ? '#785527' : '#574636');
    passGrad.addColorStop(1, hasReady ? '#4f3516' : '#382c21');
    ctx.fillStyle = passGrad;
    roundedRectPath(ctx, top.x + 1, top.y + 1, top.w - 2, top.h - 1, 9);
    ctx.fill();
    ctx.strokeStyle = hasReady ? '#ffe066' : highlight ?? '#cfa052';
    ctx.lineWidth = hasReady || highlight ? 2.8 : 1.8;
    ctx.stroke();

    // Miniature Japanese noren valance along top of pass
    const panelW = (top.w - 16) / 4;
    for (let n = 0; n < 4; n += 1) {
      const nx = top.x + 6 + n * (panelW + 1.3);
      ctx.fillStyle = n % 2 === 0 ? '#a83326' : '#253f59';
      roundedRectPath(ctx, nx, top.y + 3, panelW - 2, 11, 2);
      ctx.fill();
      ctx.fillStyle = '#f5e8ca';
      ctx.fillRect(nx + 2, top.y + 12, panelW - 6, 1.4);
    }

    if (st.hRows >= 2) {
      if (hasReady) {
        const lead = pass.plates[0];
        const recipe = RECIPE_MAP[lead.recipeId];
        drawPlatedDish(
          ctx,
          recipe.id,
          recipe.steps.map((s) => s.ingredientId),
          top.cx - 18,
          top.y + 56,
          36,
          { showPlate: true, glow: true },
        );
        drawLiveSteamWisps(ctx, top.cx - 18, top.y + 24, clock, 3, '#fff9e6', 14);
        drawBrassBell(ctx, top.x + top.w - 28, top.y + 60, pass.bellAnim, true, clock);

        ctx.fillStyle = '#1f9450';
        roundedRectPath(ctx, top.x + 12, top.y + 98, top.w - 24, 22, 6);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = '900 11.5px "Trebuchet MS", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('READY TO SERVE', top.cx, top.y + 113);

        ctx.fillStyle = '#ffe9b8';
        ctx.font = '900 12px "Trebuchet MS", sans-serif';
        ctx.fillText(recipe.shortName, top.cx, top.y + 138);
      } else {
        drawStationHeader(ctx, top, st.label, 'rgba(15, 22, 18, 0.94)', '#fff2d6');
        drawBrassBell(ctx, top.cx, top.cy + 2, pass?.bellAnim ?? 0, false, clock);
        ctx.fillStyle = '#e0cca8';
        ctx.font = '800 11px "Trebuchet MS", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('DELIVER DISH HERE', top.cx, top.y + top.h - 14);
      }
      return;
    }

    if (hasReady) {
      const lead = pass.plates[0];
      const recipe = RECIPE_MAP[lead.recipeId];
      drawPlatedDish(
        ctx,
        recipe.id,
        recipe.steps.map((s) => s.ingredientId),
        top.x + 48,
        top.cy + 4,
        30,
        { showPlate: true, glow: true },
      );
      drawLiveSteamWisps(ctx, top.x + 48, top.cy - 18, clock, 2, '#fff9e6', 12);

      const pillX = top.x + 90;
      const pillW = top.w - 140;
      ctx.fillStyle = '#1f9450';
      roundedRectPath(ctx, pillX, top.y + 17, pillW, 21, 6);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 11.5px "Trebuchet MS", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('READY TO SERVE', pillX + pillW / 2, top.y + 31.5);

      ctx.fillStyle = '#ffe9b8';
      ctx.font = '900 11px "Trebuchet MS", sans-serif';
      ctx.fillText(recipe.shortName, pillX + pillW / 2, top.y + 56);

      drawBrassBell(ctx, top.x + top.w - 26, top.cy + 4, pass.bellAnim, true, clock);
    } else {
      drawBrassBell(ctx, top.x + top.w - 28, top.cy + 4, pass?.bellAnim ?? 0, false, clock);
      ctx.fillStyle = '#fff0cf';
      ctx.font = '900 13px "Trebuchet MS", sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(st.label, top.x + 14, top.y + 34);
      ctx.fillStyle = '#d4be98';
      ctx.font = '800 10.5px "Trebuchet MS", sans-serif';
      ctx.fillText('Deliver Dish Here', top.x + 14, top.y + 54);
    }
  }
}
