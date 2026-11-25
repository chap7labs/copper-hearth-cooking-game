// Procedural 2.5D Canvas 2D culinary illustrations, kitchen hardware, and vector icons (zero external assets).

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
  } else if (kind === 'play') {
    ctx.beginPath();
    ctx.moveTo(-r * 0.45, -r * 0.65);
    ctx.lineTo(r * 0.65, 0);
    ctx.lineTo(-r * 0.45, r * 0.65);
    ctx.closePath();
    ctx.fill();
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
    ctx.moveTo(-r * 0.2, -r * 0.12);
    ctx.lineTo(-r * 0.2, r * 0.4);
    ctx.moveTo(r * 0.2, -r * 0.12);
    ctx.lineTo(r * 0.2, r * 0.4);
    ctx.stroke();
  }
  ctx.restore();
}

export function drawIngredientSprite(ctx, ingredientId, prepState, x, y, scale = 1, chopProgress = 0) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  const isBurnt = prepState === 'burnt';
  const isCooked = prepState === 'cooked' || prepState === 'perfect';
  const isChopped = prepState === 'chopped';

  // Directional bottom-right cast shadow
  ctx.fillStyle = 'rgba(18, 8, 3, 0.38)';
  ctx.beginPath();
  ctx.ellipse(3, 12, 22, 8.5, 0.08, 0, Math.PI * 2);
  ctx.fill();

  if (ingredientId === 'brioche') {
    const baseGrad = ctx.createLinearGradient(0, -16, 0, 14);
    baseGrad.addColorStop(0, '#f8cc73');
    baseGrad.addColorStop(0.55, '#db8b32');
    baseGrad.addColorStop(1, '#8f4b17');
    ctx.fillStyle = '#9c561d';
    ctx.beginPath();
    ctx.ellipse(0, 6, 21, 8.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f9e5ba';
    ctx.beginPath();
    ctx.ellipse(0, 2, 19, 5.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = baseGrad;
    ctx.beginPath();
    ctx.arc(0, -1, 19, Math.PI, 0);
    ctx.quadraticCurveTo(19, 4, 0, 4);
    ctx.quadraticCurveTo(-19, 4, -19, -1);
    ctx.fill();
    // Specular glaze arc + sesame seeds
    ctx.strokeStyle = 'rgba(255, 248, 220, 0.55)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(-3, -3, 13, Math.PI * 1.12, Math.PI * 1.65);
    ctx.stroke();
    ctx.fillStyle = '#fff5dc';
    for (const [sx, sy] of [[-8, -11], [0, -14], [8, -10], [-3, -7], [5, -6]]) {
      ctx.beginPath();
      ctx.ellipse(sx, sy, 2.2, 1.1, 0.3, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (ingredientId === 'beef') {
    const edge = isBurnt ? '#1c1514' : isCooked ? '#4a2015' : '#962b2b';
    const top = isBurnt ? '#342a28' : isCooked ? '#803d27' : '#de6159';
    ctx.fillStyle = edge;
    ctx.beginPath();
    ctx.ellipse(0, 5, 21, 12.5, 0, 0, Math.PI * 2);
    ctx.fill();
    const grad = ctx.createRadialGradient(-5, -4, 3, 0, 1, 21);
    grad.addColorStop(0, top);
    grad.addColorStop(1, edge);
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.ellipse(0, 1, 20.5, 11.5, 0, 0, Math.PI * 2);
    ctx.fill();
    if (isCooked && !isBurnt) {
      ctx.strokeStyle = '#240d07';
      ctx.lineWidth = 2.7;
      for (const gx of [-10, -2, 6]) {
        ctx.beginPath();
        ctx.moveTo(gx - 3, -7);
        ctx.lineTo(gx + 5, 7);
        ctx.stroke();
      }
      ctx.fillStyle = '#f8ba38';
      ctx.beginPath();
      ctx.moveTo(-12, -3);
      ctx.lineTo(13, -4);
      ctx.lineTo(11, 7);
      ctx.lineTo(2, 10);
      ctx.lineTo(-10, 5);
      ctx.closePath();
      ctx.fill();
    } else if (!isBurnt) {
      ctx.fillStyle = 'rgba(255, 228, 224, 0.6)';
      ctx.beginPath();
      ctx.ellipse(-6, -1, 5.2, 2, 0.4, 0, Math.PI * 2);
      ctx.ellipse(7, 3, 4.2, 1.8, -0.3, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (ingredientId === 'herbs') {
    if (isChopped) {
      for (const [cx, cy, c, r] of [
        [-10, 4, '#397843', 4.3], [0, 6, '#59ab62', 4.5], [10, 3, '#3b261d', 4.1],
        [-5, -3, '#573b2e', 3.8], [5, -4, '#4e9b57', 4.2], [1, 1, '#79c774', 3.6],
        [-12, -2, '#4c8f53', 3.4], [12, 6, '#65b56c', 3.5], [4, 7, '#452e23', 3.1],
      ]) {
        ctx.fillStyle = c;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (chopProgress > 0) {
      // Split truffle halves + scattered basil shreds
      ctx.fillStyle = '#472f24';
      ctx.beginPath();
      ctx.ellipse(-10, 3, 9, 8, -0.25, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#7c5b49';
      ctx.beginPath();
      ctx.ellipse(-7, 3, 4.5, 6, -0.25, 0, Math.PI * 2);
      ctx.fill();
      for (const [lx, ly, c] of [[5, -4, '#4ea358'], [12, 2, '#62b86a'], [2, 6, '#3e8546'], [14, -5, '#472f24']]) {
        ctx.fillStyle = c;
        ctx.beginPath();
        ctx.ellipse(lx, ly, 5.5, 3.2, 0.5, 0, Math.PI * 2);
        ctx.fill();
      }
    } else {
      ctx.fillStyle = '#473026';
      ctx.beginPath();
      ctx.ellipse(-5, 3, 12, 10, -0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#6c4b3c';
      ctx.beginPath();
      ctx.arc(-8, -1, 3.5, 0, Math.PI * 2);
      ctx.fill();
      for (const [lx, ly, rot] of [[9, -4, 0.4], [12, 4, 1.0]]) {
        ctx.save();
        ctx.translate(lx, ly);
        ctx.rotate(rot);
        ctx.fillStyle = '#4ea158';
        ctx.beginPath();
        ctx.ellipse(0, 0, 10, 5.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#97df9a';
        ctx.lineWidth = 1.1;
        ctx.beginPath();
        ctx.moveTo(-7, 0);
        ctx.lineTo(7, 0);
        ctx.stroke();
        ctx.restore();
      }
    }
  } else if (ingredientId === 'salmon') {
    ctx.fillStyle = isBurnt ? '#181210' : isCooked ? '#8a3218' : '#bf4b34';
    ctx.beginPath();
    ctx.moveTo(-20, 5);
    ctx.quadraticCurveTo(-15, -9, 17, -6);
    ctx.quadraticCurveTo(22, 3, 17, 13);
    ctx.quadraticCurveTo(-12, 15, -20, 5);
    ctx.closePath();
    ctx.fill();
    const grad = ctx.createLinearGradient(-20, -10, 20, 12);
    if (isBurnt) {
      grad.addColorStop(0, '#2a201d');
      grad.addColorStop(1, '#181210');
    } else if (isCooked) {
      grad.addColorStop(0, '#ffa066');
      grad.addColorStop(0.55, '#dc5d32');
      grad.addColorStop(1, '#a33c1e');
    } else {
      grad.addColorStop(0, '#ffaa90');
      grad.addColorStop(1, '#eb684c');
    }
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(-20, 1);
    ctx.quadraticCurveTo(-16, -13, 16, -10);
    ctx.quadraticCurveTo(22, -1, 17, 9);
    ctx.quadraticCurveTo(-12, 12, -20, 1);
    ctx.closePath();
    ctx.fill();
    if (!isBurnt) {
      ctx.strokeStyle = isCooked ? 'rgba(54, 18, 7, 0.72)' : 'rgba(255, 236, 226, 0.7)';
      ctx.lineWidth = 2.1;
      for (const sx of [-9, -1, 7]) {
        ctx.beginPath();
        ctx.moveTo(sx, -9);
        ctx.quadraticCurveTo(sx + 2, 0, sx - 1, 8);
        ctx.stroke();
      }
    }
  } else if (ingredientId === 'rice') {
    ctx.fillStyle = '#5c341c';
    ctx.beginPath();
    ctx.arc(0, 3, 19.5, 0, Math.PI);
    ctx.fill();
    ctx.fillStyle = '#824d2c';
    ctx.beginPath();
    ctx.ellipse(0, 3, 19.5, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    const riceGrad = ctx.createRadialGradient(-4, -6, 2, 0, -2, 18);
    riceGrad.addColorStop(0, '#ffffff');
    riceGrad.addColorStop(1, '#e0d3bc');
    ctx.fillStyle = riceGrad;
    ctx.beginPath();
    ctx.arc(0, 1, 16.5, Math.PI, 0);
    ctx.quadraticCurveTo(0, 7, -16.5, 1);
    ctx.fill();
    ctx.fillStyle = '#2b241f';
    for (const [sx, sy] of [[-5, -7], [3, -9], [7, -4], [-2, -3]]) {
      ctx.beginPath();
      ctx.arc(sx, sy, 1.3, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (ingredientId === 'ramen') {
    if (isBurnt) {
      ctx.fillStyle = '#241c19';
      ctx.beginPath();
      ctx.ellipse(0, 2, 20, 13, 0, 0, Math.PI * 2);
      ctx.fill();
    } else if (isCooked) {
      const broth = ctx.createRadialGradient(-4, -3, 2, 0, 1, 20);
      broth.addColorStop(0, '#ffde73');
      broth.addColorStop(1, '#c7721c');
      ctx.fillStyle = broth;
      ctx.beginPath();
      ctx.ellipse(0, 2, 20, 13, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#fff3c4';
      ctx.lineWidth = 2.2;
      for (const yOff of [-4, 1, 6]) {
        ctx.beginPath();
        ctx.moveTo(-12, yOff);
        ctx.quadraticCurveTo(-4, yOff - 4, 4, yOff);
        ctx.quadraticCurveTo(10, yOff + 3, 13, yOff - 1);
        ctx.stroke();
      }
    } else {
      ctx.fillStyle = '#edd182';
      ctx.beginPath();
      ctx.ellipse(0, 2, 19, 12, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#c29338';
      ctx.lineWidth = 2;
      for (const r of [14, 9, 4]) {
        ctx.beginPath();
        ctx.ellipse(0, 2, r, r * 0.62, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
  } else if (ingredientId === 'garlic') {
    if (isChopped) {
      ctx.fillStyle = '#fff9ee';
      ctx.beginPath();
      ctx.ellipse(-7, 2, 9.5, 7.2, -0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#f59922';
      ctx.beginPath();
      ctx.arc(-7, 2, 4.4, 0, Math.PI * 2);
      ctx.fill();
      for (const [gx, gy, c] of [
        [7, -3, '#ecd488'], [11, 3, '#dbb558'], [5, 5, '#59ab62'], [13, -1, '#68ba70'],
      ]) {
        ctx.fillStyle = c;
        ctx.beginPath();
        ctx.arc(gx, gy, 3.6, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (chopProgress > 0) {
      // Halved egg + sliced garlic cloves
      ctx.fillStyle = '#fff9ee';
      ctx.beginPath();
      ctx.ellipse(-9, 2, 8.5, 6.5, -0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#f59922';
      ctx.beginPath();
      ctx.arc(-9, 2, 4, 0, Math.PI * 2);
      ctx.fill();
      for (const [gx, gy, rot] of [[6, -4, 0.3], [11, 3, -0.4], [4, 6, 0.8], [14, -2, 0.1]]) {
        ctx.save();
        ctx.translate(gx, gy);
        ctx.rotate(rot);
        ctx.fillStyle = '#f2e6c8';
        ctx.beginPath();
        ctx.ellipse(0, 0, 5, 2.8, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    } else {
      ctx.fillStyle = '#efe5cf';
      ctx.beginPath();
      ctx.ellipse(-6, 3, 10, 11, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#d4c39e';
      ctx.beginPath();
      ctx.moveTo(-6, -12);
      ctx.lineTo(-3, -6);
      ctx.lineTo(-9, -6);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#f2c179';
      ctx.beginPath();
      ctx.ellipse(9, 2, 8.5, 10.5, 0.2, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (ingredientId === 'dough') {
    if (isBurnt) {
      ctx.fillStyle = '#241c19';
      ctx.beginPath();
      ctx.ellipse(0, 2, 22, 13, -0.15, 0, Math.PI * 2);
      ctx.fill();
    } else if (isCooked) {
      ctx.fillStyle = '#d99a4e';
      ctx.beginPath();
      ctx.ellipse(0, 2, 22, 13, -0.15, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#c8422b';
      ctx.beginPath();
      ctx.ellipse(0, 2, 17, 9.5, -0.15, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fcf6e8';
      for (const [mx, my] of [[-7, 0], [3, -2], [8, 4], [-2, 6]]) {
        ctx.beginPath();
        ctx.arc(mx, my, 3.4, 0, Math.PI * 2);
        ctx.fill();
      }
    } else {
      ctx.fillStyle = '#f4e6ca';
      ctx.beginPath();
      ctx.ellipse(0, 2, 21, 12, -0.15, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#d7c099';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
  }

  if (prepState === 'perfect') {
    ctx.strokeStyle = '#ffd966';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(16, -11, 5, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = '#ffe994';
    ctx.beginPath();
    ctx.arc(16, -11, 2.5, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

export function drawPlatedDish(ctx, recipeId, itemsPresent, x, y, radius = 56, options = {}) {
  const { showPlate = true, glow = false } = options;
  const has = (id) => itemsPresent.includes(id);

  ctx.save();
  ctx.translate(x, y);
  const s = radius / 56;
  ctx.scale(s, s);

  if (glow) {
    const aura = ctx.createRadialGradient(0, 0, 30, 0, 0, 76);
    aura.addColorStop(0, 'rgba(255, 216, 114, 0.42)');
    aura.addColorStop(1, 'rgba(255, 216, 114, 0)');
    ctx.fillStyle = aura;
    ctx.beginPath();
    ctx.arc(0, 0, 76, 0, Math.PI * 2);
    ctx.fill();
  }

  if (showPlate) {
    // Directional bottom-right cast shadow
    ctx.fillStyle = 'rgba(18, 9, 4, 0.46)';
    ctx.beginPath();
    ctx.ellipse(6, 11, 57, 49, 0.08, 0, Math.PI * 2);
    ctx.fill();

    if (recipeId === 'garlic_ramen') {
      // Deep crimson-lacquered artisan ramen bowl
      const rim = ctx.createLinearGradient(-50, -50, 50, 50);
      rim.addColorStop(0, '#c73e32');
      rim.addColorStop(1, '#5e1712');
      ctx.fillStyle = rim;
      ctx.beginPath();
      ctx.arc(0, 0, 55, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ebbb6e';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.arc(0, 0, 51, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = '#240d0c';
      ctx.beginPath();
      ctx.arc(0, 0, 46, 0, Math.PI * 2);
      ctx.fill();
    } else if (recipeId === 'salmon_bowl') {
      const bowlRim = ctx.createLinearGradient(-50, -50, 50, 50);
      bowlRim.addColorStop(0, '#2a4a69');
      bowlRim.addColorStop(1, '#122133');
      ctx.fillStyle = bowlRim;
      ctx.beginPath();
      ctx.arc(0, 0, 55, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#e2be82';
      ctx.lineWidth = 2.5;
      ctx.stroke();
      ctx.fillStyle = '#f5ede0';
      ctx.beginPath();
      ctx.arc(0, 0, 46, 0, Math.PI * 2);
      ctx.fill();
    } else if (recipeId === 'herb_flatbread') {
      // Beveled walnut wooden serving paddle
      ctx.fillStyle = '#4a2914';
      roundedRectPath(ctx, -58, -33, 116, 74, 22);
      ctx.fill();
      ctx.fillStyle = '#7b4828';
      roundedRectPath(ctx, -58, -37, 116, 70, 22);
      ctx.fill();
      ctx.strokeStyle = '#ab7046';
      ctx.lineWidth = 2;
      ctx.stroke();
    } else {
      // Cream porcelain plate with golden rim + specular shine
      const plateGrad = ctx.createRadialGradient(-12, -12, 8, 0, 0, 55);
      plateGrad.addColorStop(0, '#fffcf5');
      plateGrad.addColorStop(0.78, '#efe2cd');
      plateGrad.addColorStop(1, '#cab393');
      ctx.fillStyle = plateGrad;
      ctx.beginPath();
      ctx.arc(0, 0, 55, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#c4964f';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(0, 0, 44, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  if (recipeId === 'truffle_burger') {
    if (has('brioche')) {
      ctx.fillStyle = '#bf722a';
      ctx.beginPath();
      ctx.ellipse(0, 15, 34, 15, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#f6e1b8';
      ctx.beginPath();
      ctx.ellipse(0, 12, 31, 12, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    if (has('beef')) {
      ctx.fillStyle = '#4c2014';
      ctx.beginPath();
      ctx.ellipse(0, 6, 34, 14, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#6b301e';
      ctx.beginPath();
      ctx.ellipse(0, 3, 33, 12.5, 0, 0, Math.PI * 2);
      ctx.fill();
      // Char marks
      ctx.strokeStyle = '#290f08';
      ctx.lineWidth = 2.6;
      for (const gx of [-15, -4, 7, 17]) {
        ctx.beginPath();
        ctx.moveTo(gx - 3, -5);
        ctx.lineTo(gx + 4, 9);
        ctx.stroke();
      }
      // Melted cheddar skirt
      ctx.fillStyle = '#f8ba38';
      ctx.beginPath();
      ctx.moveTo(-30, 1);
      ctx.lineTo(30, -1);
      ctx.lineTo(25, 13);
      ctx.lineTo(8, 19);
      ctx.lineTo(-9, 13);
      ctx.lineTo(-24, 16);
      ctx.closePath();
      ctx.fill();
    }
    if (has('herbs')) {
      // Crisp ruffled lettuce + dark truffle shavings + aioli dots
      ctx.fillStyle = '#4ba856';
      for (const [lx, ly] of [[-20, -4], [-4, -7], [14, -5], [22, 1], [-14, 3], [8, 4]]) {
        ctx.beginPath();
        ctx.ellipse(lx, ly, 10.5, 5.5, 0.25, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = '#382219';
      for (const [tx, ty] of [[-9, -3], [4, -4], [12, 1], [-2, 2]]) {
        ctx.beginPath();
        ctx.arc(tx, ty, 3.2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = '#fff4d4';
      ctx.beginPath();
      ctx.arc(-14, -1, 2.2, 0, Math.PI * 2);
      ctx.arc(9, -2, 2.2, 0, Math.PI * 2);
      ctx.fill();
    }
    if (has('brioche') && has('beef') && has('herbs')) {
      const crown = ctx.createLinearGradient(0, -35, 0, -2);
      crown.addColorStop(0, '#fbd07a');
      crown.addColorStop(0.6, '#dc8632');
      crown.addColorStop(1, '#a9581a');
      ctx.fillStyle = crown;
      ctx.beginPath();
      ctx.arc(0, -8, 30, Math.PI, 0);
      ctx.quadraticCurveTo(30, 0, 0, 0);
      ctx.quadraticCurveTo(-30, 0, -30, -8);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 250, 224, 0.55)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(-4, -10, 22, Math.PI * 1.15, Math.PI * 1.65);
      ctx.stroke();
      ctx.fillStyle = '#fff5dc';
      for (const [sx, sy] of [[-12, -20], [0, -24], [12, -19], [-5, -15], [7, -14]]) {
        ctx.beginPath();
        ctx.ellipse(sx, sy, 2.6, 1.3, 0.3, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.strokeStyle = '#e7c68b';
      ctx.lineWidth = 2.6;
      ctx.beginPath();
      ctx.moveTo(0, -24);
      ctx.lineTo(0, -39);
      ctx.stroke();
    }
  } else if (recipeId === 'salmon_bowl') {
    if (has('rice')) {
      const riceGrad = ctx.createRadialGradient(-8, -6, 4, 0, 0, 42);
      riceGrad.addColorStop(0, '#ffffff');
      riceGrad.addColorStop(1, '#e0d3bc');
      ctx.fillStyle = riceGrad;
      ctx.beginPath();
      ctx.arc(0, 2, 40, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#2e2621';
      for (const [bx, by] of [[-22, 12], [-14, 22], [18, -18], [25, -4]]) {
        ctx.beginPath();
        ctx.arc(bx, by, 1.4, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    if (has('salmon')) {
      const sal = ctx.createLinearGradient(-28, -14, 28, 16);
      sal.addColorStop(0, '#ffa16e');
      sal.addColorStop(0.55, '#dc5d32');
      sal.addColorStop(1, '#9f3b1e');
      ctx.fillStyle = sal;
      ctx.beginPath();
      ctx.ellipse(-4, -2, 29, 16, -0.25, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#471a0e';
      ctx.lineWidth = 2.6;
      for (const gx of [-16, -6, 4, 13]) {
        ctx.beginPath();
        ctx.moveTo(gx - 3, -12);
        ctx.lineTo(gx + 3, 9);
        ctx.stroke();
      }
      // Glaze specular highlight
      ctx.strokeStyle = 'rgba(255, 240, 210, 0.55)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-18, -8);
      ctx.quadraticCurveTo(-2, -13, 12, -7);
      ctx.stroke();
    }
    if (has('garlic')) {
      // Bright yellow lemon wedge + jammy egg + crisp green scallions
      ctx.save();
      ctx.translate(22, -14);
      ctx.rotate(0.4);
      ctx.fillStyle = '#ffe04d';
      ctx.beginPath();
      ctx.arc(0, 0, 12, 0, Math.PI);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#fff9d6';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();

      ctx.fillStyle = '#fffaf0';
      ctx.beginPath();
      ctx.ellipse(17, 16, 12, 9, 0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#f59e25';
      ctx.beginPath();
      ctx.arc(17, 16, 5.2, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#4fb35b';
      ctx.lineWidth = 2.4;
      for (const [sx, sy] of [[-12, 16], [-3, -15], [7, -12], [0, 7]]) {
        ctx.beginPath();
        ctx.arc(sx, sy, 3.2, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
  } else if (recipeId === 'garlic_ramen') {
    if (has('ramen')) {
      const broth = ctx.createRadialGradient(-8, -8, 6, 0, 0, 44);
      broth.addColorStop(0, '#ffe885');
      broth.addColorStop(0.65, '#dc8622');
      broth.addColorStop(1, '#9c4e12');
      ctx.fillStyle = broth;
      ctx.beginPath();
      ctx.arc(0, 0, 43, 0, Math.PI * 2);
      ctx.fill();
      // Curly golden noodles
      ctx.strokeStyle = '#fff4c2';
      ctx.lineWidth = 2.9;
      for (const yOff of [-13, -3, 7, 16]) {
        ctx.beginPath();
        ctx.moveTo(-26, yOff);
        ctx.quadraticCurveTo(-8, yOff - 7, 9, yOff);
        ctx.quadraticCurveTo(22, yOff + 5, 28, yOff - 2);
        ctx.stroke();
      }
      // Oil sheen dots
      ctx.fillStyle = 'rgba(255, 248, 200, 0.5)';
      ctx.beginPath();
      ctx.arc(-24, 6, 3, 0, Math.PI * 2);
      ctx.arc(-18, 16, 2.2, 0, Math.PI * 2);
      ctx.fill();
    }
    if (has('garlic')) {
      // Ajitsuke tamago halved egg + pink-swirl narutomaki fish cake
      ctx.fillStyle = '#fff9ec';
      ctx.beginPath();
      ctx.ellipse(-15, -13, 13, 9.5, -0.25, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#f59018';
      ctx.beginPath();
      ctx.arc(-15, -13, 5.8, 0, Math.PI * 2);
      ctx.fill();

      // Narutomaki pink-swirl slice
      ctx.fillStyle = '#fff7f7';
      ctx.beginPath();
      ctx.arc(-4, 15, 9.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#f07596';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.arc(-4, 15, 5, 0, Math.PI * 1.6);
      ctx.stroke();

      ctx.fillStyle = '#f5d487';
      for (const [gx, gy] of [[12, 16], [19, 8]]) {
        ctx.beginPath();
        ctx.arc(gx, gy, 3.2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    if (has('herbs')) {
      // Crisp dark nori sheet + bright emerald scallions
      ctx.save();
      ctx.translate(22, -14);
      ctx.rotate(0.2);
      ctx.fillStyle = '#182b1e';
      roundedRectPath(ctx, -10, -14, 20, 26, 3);
      ctx.fill();
      ctx.strokeStyle = '#2d4c36';
      ctx.lineWidth = 1.2;
      ctx.stroke();
      ctx.restore();

      ctx.strokeStyle = '#58c464';
      ctx.lineWidth = 2.5;
      for (const [sx, sy] of [[2, -6], [10, 4], [-18, 16], [14, 18]]) {
        ctx.beginPath();
        ctx.arc(sx, sy, 3.2, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
  } else if (recipeId === 'herb_flatbread') {
    if (has('dough')) {
      // Wood-fired blistered golden crust
      ctx.fillStyle = '#e0a252';
      ctx.beginPath();
      ctx.ellipse(0, 0, 49, 28, 0, 0, Math.PI * 2);
      ctx.fill();
      // Charred wood-fired rim bubbles
      ctx.fillStyle = '#472814';
      for (const [bx, by, r] of [[-42, -9, 3.2], [38, -14, 3.5], [44, 6, 3], [-36, 15, 2.8], [14, -24, 2.6]]) {
        ctx.beginPath();
        ctx.arc(bx, by, r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = '#cf3f27';
      ctx.beginPath();
      ctx.ellipse(0, 0, 40, 20, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fffaf0';
      for (const [mx, my] of [[-22, -4], [-6, 7], [11, -6], [24, 4], [0, -11]]) {
        ctx.beginPath();
        ctx.arc(mx, my, 6.4, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    if (has('garlic')) {
      ctx.fillStyle = '#f2ce74';
      for (const [gx, gy] of [[-14, 5], [2, 1], [17, -4], [-25, 2]]) {
        ctx.beginPath();
        ctx.arc(gx, gy, 3.3, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    if (has('herbs')) {
      ctx.fillStyle = '#47ad52';
      for (const [bx, by, rot] of [[-14, -6, 0.3], [4, 7, -0.4], [19, 1, 0.7], [-2, -2, 0.1]]) {
        ctx.save();
        ctx.translate(bx, by);
        ctx.rotate(rot);
        ctx.beginPath();
        ctx.ellipse(0, 0, 8, 4.2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }
  }

  ctx.restore();
}

export function drawCopperSkillet(ctx, cx, cy, r, skillet, clock, spec) {
  ctx.save();
  ctx.translate(cx, cy);

  // Cast-iron 8-spoke gas burner grate beneath pan
  ctx.strokeStyle = '#332c29';
  ctx.lineWidth = 4;
  for (let s = 0; s < 8; s += 1) {
    const a = (s * Math.PI) / 4;
    ctx.beginPath();
    ctx.moveTo(Math.cos(a) * 18, Math.sin(a) * 18);
    ctx.lineTo(Math.cos(a) * (r + 10), Math.sin(a) * (r + 10));
    ctx.stroke();
  }

  // Animated blue-core & orange-tip gas flame petals when active
  if (skillet.item) {
    const flicker = 0.86 + Math.sin(clock * 20 + skillet.id * 2) * 0.14;
    const glowColor = skillet.heatZone === 'burnt'
      ? 'rgba(235, 68, 50, 0.45)'
      : skillet.heatZone === 'perfect'
        ? 'rgba(255, 210, 72, 0.58)'
        : 'rgba(250, 136, 48, 0.48)';
    const flameGlow = ctx.createRadialGradient(0, 0, r * 0.45, 0, 0, r * 1.24 * flicker);
    flameGlow.addColorStop(0, glowColor);
    flameGlow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = flameGlow;
    ctx.beginPath();
    ctx.arc(0, 0, r * 1.24, 0, Math.PI * 2);
    ctx.fill();

    for (let f = 0; f < 10; f += 1) {
      const a = (f * Math.PI) / 5 + Math.sin(clock * 14 + f) * 0.08;
      const fx = Math.cos(a) * (r + 2);
      const fy = Math.sin(a) * (r + 2);
      ctx.fillStyle = '#ff9838';
      ctx.beginPath();
      ctx.arc(fx, fy, 5.2 * flicker, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#6ec8ff';
      ctx.beginPath();
      ctx.arc(Math.cos(a) * (r - 1), Math.sin(a) * (r - 1), 2.8, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Directional bottom-right cast shadow
  ctx.fillStyle = 'rgba(10, 5, 2, 0.52)';
  ctx.beginPath();
  ctx.arc(6, 8, r, 0, Math.PI * 2);
  ctx.fill();

  // Slightly angled riveted copper handle for organic silhouette
  ctx.save();
  ctx.rotate(skillet.id === 0 ? 0.14 : -0.11);
  const handleGrad = ctx.createLinearGradient(r - 4, -8, r + 52, 8);
  handleGrad.addColorStop(0, '#c77c43');
  handleGrad.addColorStop(0.5, '#f4ba7c');
  handleGrad.addColorStop(1, '#7c3f18');
  ctx.fillStyle = handleGrad;
  roundedRectPath(ctx, r - 6, -7, 56, 14, 6);
  ctx.fill();
  ctx.fillStyle = '#29170d';
  ctx.beginPath();
  ctx.arc(r + 38, 0, 3.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Outer brushed copper rim + bevel
  const copperGrad = ctx.createLinearGradient(-r, -r, r, r);
  copperGrad.addColorStop(0, '#f4ba7c');
  copperGrad.addColorStop(0.5, '#c4713a');
  copperGrad.addColorStop(1, '#723716');
  ctx.fillStyle = copperGrad;
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fill();

  // Seasoned dark cast-iron interior
  const panGrad = ctx.createRadialGradient(-10, -10, 6, 0, 0, r - 9);
  panGrad.addColorStop(0, '#3d3633');
  panGrad.addColorStop(1, '#191514');
  ctx.fillStyle = panGrad;
  ctx.beginPath();
  ctx.arc(0, 0, r - 9, 0, Math.PI * 2);
  ctx.fill();

  // Specular rim highlight
  ctx.strokeStyle = 'rgba(255, 236, 200, 0.45)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, 0, r - 3, Math.PI * 1.05, Math.PI * 1.55);
  ctx.stroke();

  // Heat sweet-spot ring around rim when cooking
  if (skillet.item && spec) {
    const maxTime = spec.burnTime;
    const startAngle = -Math.PI / 2;
    const totalArc = Math.PI * 2;
    const ringR = r + 7;

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.16)';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(0, 0, ringR, 0, Math.PI * 2);
    ctx.stroke();

    const pStart = startAngle + (spec.perfectStart / maxTime) * totalArc;
    const pEnd = startAngle + (spec.perfectEnd / maxTime) * totalArc;
    ctx.strokeStyle = '#39d17b';
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.arc(0, 0, ringR, pStart, pEnd);
    ctx.stroke();

    ctx.strokeStyle = '#e5534b';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(0, 0, ringR, pEnd, startAngle + totalArc);
    ctx.stroke();

    const ratio = Math.min(1, skillet.elapsed / maxTime);
    ctx.strokeStyle = skillet.heatZone === 'perfect'
      ? '#ffe066'
      : skillet.heatZone === 'burnt' || skillet.heatZone === 'warning'
        ? '#ff5f52'
        : '#f59f3d';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(0, 0, ringR, startAngle, startAngle + ratio * totalArc);
    ctx.stroke();

    drawIngredientSprite(ctx, skillet.item.ingredientId, skillet.item.state, 0, 0, 1.35);
  }

  ctx.restore();
}

export function drawChefKnife(ctx, x, y, chopAnim) {
  ctx.save();
  const drop = Math.sin(chopAnim * Math.PI) * 18;
  const tilt = -0.44 + chopAnim * 0.48;
  ctx.translate(x, y + drop);
  ctx.rotate(tilt);

  // Cast shadow
  ctx.fillStyle = 'rgba(24, 12, 5, 0.35)';
  ctx.beginPath();
  ctx.ellipse(3, 12, 34, 6, 0, 0, Math.PI * 2);
  ctx.fill();

  const blade = ctx.createLinearGradient(-34, -8, 14, 12);
  blade.addColorStop(0, '#f4f7f9');
  blade.addColorStop(0.55, '#bac5ce');
  blade.addColorStop(1, '#79858f');
  ctx.fillStyle = blade;
  ctx.beginPath();
  ctx.moveTo(-36, 4);
  ctx.lineTo(14, -10);
  ctx.lineTo(14, 8);
  ctx.quadraticCurveTo(-12, 13, -36, 4);
  ctx.closePath();
  ctx.fill();

  // Brass bolster + walnut handle
  ctx.fillStyle = '#d4a353';
  ctx.fillRect(12, -9, 4, 13);
  ctx.fillStyle = '#472716';
  roundedRectPath(ctx, 16, -9, 27, 12, 4);
  ctx.fill();
  ctx.fillStyle = '#e0b469';
  ctx.beginPath();
  ctx.arc(23, -3, 1.8, 0, Math.PI * 2);
  ctx.arc(33, -3, 1.8, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

export function drawBrassBell(ctx, cx, cy, anim, readyGlow, clock) {
  ctx.save();
  const shake = anim > 0 ? Math.sin(anim * Math.PI * 8) * 2.5 : 0;
  ctx.translate(cx + shake, cy);

  if (readyGlow) {
    const pulse = 0.78 + Math.sin(clock * 6) * 0.22;
    const aura = ctx.createRadialGradient(0, -3, 4, 0, -3, 26);
    aura.addColorStop(0, `rgba(255, 224, 118, ${0.55 * pulse})`);
    aura.addColorStop(1, 'rgba(255, 224, 118, 0)');
    ctx.fillStyle = aura;
    ctx.beginPath();
    ctx.arc(0, -3, 26, 0, Math.PI * 2);
    ctx.fill();
  }

  // Compact walnut base & polished brass dome (keeps clean margin from button label)
  ctx.fillStyle = '#381e10';
  roundedRectPath(ctx, -20, 6, 40, 7, 3);
  ctx.fill();

  const bellGrad = ctx.createRadialGradient(-5, -7, 2, 0, -1, 18);
  bellGrad.addColorStop(0, '#fff7cb');
  bellGrad.addColorStop(0.45, '#e8b648');
  bellGrad.addColorStop(1, '#855615');
  ctx.fillStyle = bellGrad;
  ctx.beginPath();
  ctx.arc(0, 6, 16, Math.PI, 0);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#f8d882';
  ctx.beginPath();
  ctx.arc(0, -11, 3.4, 0, Math.PI * 2);
  ctx.fill();

  if (anim > 0 || readyGlow) {
    ctx.strokeStyle = anim > 0 ? '#fff0a8' : 'rgba(255, 226, 138, 0.65)';
    ctx.lineWidth = 1.8;
    for (const dir of [-1, 1]) {
      ctx.beginPath();
      ctx.arc(dir * 16, -2, 6, dir < 0 ? Math.PI * 0.68 : -Math.PI * 0.32, dir < 0 ? Math.PI * 1.32 : Math.PI * 0.32);
      ctx.stroke();
    }
  }

  ctx.restore();
}
