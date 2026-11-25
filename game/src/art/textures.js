// Deterministic procedural offscreen CanvasPattern atlas generated once at startup.
// Provides deep Kyoto slate-matcha stone floors, honey hinoki woodgrain, handmade washi paper, and celadon stoneware.

function createDeterministicRng(seed) {
  let s = (seed >>> 0) || 1;
  return function next() {
    s = (Math.imul(1664525, s) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function makeCanvas(w, h) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return c;
}

function buildStoneTileCanvas(w, h, baseColors, groutColor, speckLight, speckDark, seed) {
  const c = makeCanvas(w, h);
  const tctx = c.getContext('2d');
  const rng = createDeterministicRng(seed);
  const cols = 2;
  const rows = 2;
  const cw = w / cols;
  const ch = h / rows;

  tctx.fillStyle = groutColor;
  tctx.fillRect(0, 0, w, h);

  for (let r = 0; r < rows; r += 1) {
    for (let col = 0; col < cols; col += 1) {
      const tx = col * cw;
      const ty = r * ch;
      const idx = (r * cols + col) % baseColors.length;
      tctx.fillStyle = baseColors[idx];
      tctx.fillRect(tx + 1.5, ty + 1.5, cw - 3, ch - 3);

      // Subtle bevel edge on stone tile
      tctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
      tctx.fillRect(tx + 1.5, ty + 1.5, cw - 3, 2);
      tctx.fillStyle = 'rgba(0, 0, 0, 0.14)';
      tctx.fillRect(tx + 1.5, ty + ch - 3.5, cw - 3, 2);

      for (let i = 0; i < 42; i += 1) {
        const sx = tx + 3 + rng() * (cw - 6);
        const sy = ty + 3 + rng() * (ch - 6);
        const sz = 1 + rng() * 1.8;
        tctx.fillStyle = rng() > 0.5 ? speckLight : speckDark;
        tctx.fillRect(sx, sy, sz, sz);
      }
    }
  }
  return c;
}

function buildHinokiWoodCanvas() {
  const w = 128;
  const h = 64;
  const c = makeCanvas(w, h);
  const tctx = c.getContext('2d');
  const rng = createDeterministicRng(90210);

  tctx.fillStyle = '#ecd29d';
  tctx.fillRect(0, 0, w, h);

  for (let y = 0; y < h; y += 3) {
    const shade = rng();
    tctx.fillStyle = shade > 0.65 ? 'rgba(255, 246, 220, 0.28)' : shade < 0.35 ? 'rgba(176, 126, 62, 0.18)' : 'rgba(218, 178, 114, 0.14)';
    tctx.fillRect(0, y, w, 2);
  }

  tctx.strokeStyle = 'rgba(148, 98, 42, 0.22)';
  tctx.lineWidth = 1;
  for (let i = 0; i < 8; i += 1) {
    const gy = 4 + i * 7.5;
    tctx.beginPath();
    tctx.moveTo(0, gy);
    tctx.bezierCurveTo(42, gy + (rng() - 0.5) * 3, 86, gy + (rng() - 0.5) * 3, w, gy);
    tctx.stroke();
  }

  tctx.fillStyle = 'rgba(120, 76, 30, 0.22)';
  tctx.fillRect(0, 31, w, 1.2);
  tctx.fillRect(0, 63, w, 1.2);
  return c;
}

function buildWashiCanvas() {
  const w = 96;
  const h = 96;
  const c = makeCanvas(w, h);
  const tctx = c.getContext('2d');
  const rng = createDeterministicRng(77119);

  tctx.fillStyle = '#fcf7ea';
  tctx.fillRect(0, 0, w, h);

  for (let i = 0; i < 55; i += 1) {
    const x1 = rng() * w;
    const y1 = rng() * h;
    const len = 5 + rng() * 11;
    const ang = rng() * Math.PI * 2;
    tctx.strokeStyle = rng() > 0.45 ? 'rgba(214, 198, 162, 0.34)' : 'rgba(255, 255, 250, 0.65)';
    tctx.lineWidth = 0.9;
    tctx.beginPath();
    tctx.moveTo(x1, y1);
    tctx.lineTo(x1 + Math.cos(ang) * len, y1 + Math.sin(ang) * len);
    tctx.stroke();
  }
  return c;
}

function buildStonewareCanvas() {
  const w = 72;
  const h = 48;
  const c = makeCanvas(w, h);
  const tctx = c.getContext('2d');
  const rng = createDeterministicRng(31415);

  tctx.fillStyle = '#cce3d6';
  tctx.fillRect(0, 0, w, h);

  for (let i = 0; i < 28; i += 1) {
    tctx.fillStyle = rng() > 0.5 ? 'rgba(255, 255, 255, 0.3)' : 'rgba(72, 108, 90, 0.14)';
    tctx.fillRect(rng() * w, rng() * h, 1.6, 1.6);
  }
  tctx.strokeStyle = 'rgba(76, 112, 92, 0.25)';
  tctx.lineWidth = 1;
  tctx.beginPath();
  tctx.moveTo(0, 24);
  tctx.lineTo(w, 24);
  tctx.moveTo(36, 0);
  tctx.lineTo(36, 24);
  tctx.moveTo(18, 24);
  tctx.lineTo(18, 48);
  tctx.stroke();
  return c;
}

export function createTextureAtlas(ctx) {
  if (typeof document === 'undefined' || !ctx?.createPattern) {
    return { patterns: {}, canvases: {} };
  }

  const canvases = {
    slateMatcha: buildStoneTileCanvas(
      136,
      84,
      ['#2d423a', '#263831', '#31473f', '#293c35'],
      '#1a2822',
      'rgba(182, 218, 198, 0.08)',
      'rgba(10, 18, 14, 0.18)',
      101,
    ),
    afternoonSlate: buildStoneTileCanvas(
      136,
      84,
      ['#2f3c37', '#28342f', '#34423c', '#2b3833'],
      '#1a221f',
      'rgba(220, 212, 178, 0.08)',
      'rgba(10, 14, 12, 0.18)',
      202,
    ),
    lanternStone: buildStoneTileCanvas(
      136,
      84,
      ['#222a38', '#1d2430', '#262f3e', '#202735'],
      '#131821',
      'rgba(214, 194, 152, 0.07)',
      'rgba(8, 10, 16, 0.20)',
      303,
    ),
    hinokiWood: buildHinokiWoodCanvas(),
    washiPaper: buildWashiCanvas(),
    stoneware: buildStonewareCanvas(),
  };

  const patterns = {};
  for (const [k, canvasEl] of Object.entries(canvases)) {
    patterns[k] = ctx.createPattern(canvasEl, 'repeat');
  }

  return { patterns, canvases };
}
