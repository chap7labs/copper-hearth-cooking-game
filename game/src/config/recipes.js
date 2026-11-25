// Culinary definitions, station layout coordinates, shifts, and recipe matching for Copper Hearth.

export const CANVAS_WIDTH = 1280;
export const CANVAS_HEIGHT = 720;
export const FIXED_STEP = 1 / 60;

export const LAYOUT = {
  topRail: { x: 0, y: 0, w: 1280, h: 130 },
  tickets: [0, 1, 2, 3].map((i) => ({ x: 22 + i * 176, y: 12, w: 166, h: 108 })),
  timerBox: { x: 734, y: 14, w: 170, h: 104 },
  scoreBox: { x: 914, y: 14, w: 142, h: 104 },
  comboBox: { x: 1066, y: 14, w: 72, h: 104 },
  pauseBtn: { x: 1150, y: 14, w: 110, h: 32 },
  muteBtn: { x: 1150, y: 50, w: 110, h: 32 },
  guideBtn: { x: 1150, y: 86, w: 110, h: 32 },

  kitchenZone: { x: 0, y: 130, w: 1280, h: 435 },
  hearthZone: { x: 18, y: 142, w: 318, h: 412 },
  skillets: [
    { id: 0, key: 'Q', label: 'SKILLET Q', x: 30, y: 176, w: 294, h: 174, cx: 142, cy: 263, r: 62 },
    { id: 1, key: 'E', label: 'SKILLET E', x: 30, y: 364, w: 294, h: 174, cx: 142, cy: 451, r: 62 },
  ],
  choppingBoard: { x: 350, y: 142, w: 256, h: 412, cx: 478, cy: 344 },
  assemblyBoard: { x: 620, y: 142, w: 340, h: 412, cx: 790, cy: 318 },
  sendPassBtn: { x: 644, y: 496, w: 176, h: 42 },
  clearAssemblyBtn: { x: 830, y: 496, w: 108, h: 42 },
  servingPass: { x: 974, y: 142, w: 288, h: 412, cx: 1118, cy: 310 },
  bellBtn: { x: 1004, y: 474, w: 228, h: 66, cx: 1118, cy: 506 },

  pantryZone: { x: 0, y: 565, w: 1280, h: 155 },
  pantryBins: [0, 1, 2, 3, 4, 5, 6, 7].map((i) => ({
    index: i,
    x: 18 + i * 140,
    y: 574,
    w: 132,
    h: 108,
    cx: 18 + i * 140 + 66,
    cy: 616,
  })),
  trashBin: { x: 1146, y: 574, w: 116, h: 108, cx: 1204, cy: 622 },
  statusBar: { x: 18, y: 690, w: 1244, h: 24 },

  titleShiftCards: [0, 1, 2, 3].map((i) => ({ x: 160 + i * 244, y: 416, w: 228, h: 108 })),
  titleStartBtn: { x: 460, y: 550, w: 360, h: 64 },

  pauseResumeBtn: { x: 490, y: 312, w: 300, h: 56 },
  pauseRestartBtn: { x: 490, y: 382, w: 300, h: 52 },
  pauseTitleBtn: { x: 490, y: 448, w: 300, h: 52 },

  summaryNextBtn: { x: 340, y: 528, w: 240, h: 58 },
  summaryReplayBtn: { x: 600, y: 528, w: 170, h: 58 },
  summaryEndlessBtn: { x: 790, y: 528, w: 170, h: 58 },
};

export const INGREDIENTS = [
  {
    id: 'brioche',
    key: '1',
    name: 'Toasted Brioche',
    shortLabel: 'BRIOCHE',
    prepType: 'direct',
    prepBadge: 'READY',
    accent: '#e2a44c',
  },
  {
    id: 'beef',
    key: '2',
    name: 'Wagyu Beef Patty',
    shortLabel: 'BEEF',
    prepType: 'cook',
    prepBadge: 'SEAR',
    cookDuration: 4.0,
    perfectStart: 2.6,
    perfectEnd: 4.4,
    burnTime: 6.4,
    accent: '#c44536',
  },
  {
    id: 'herbs',
    key: '3',
    name: 'Truffle & Herbs',
    shortLabel: 'TRUFFLE',
    prepType: 'chop',
    prepBadge: 'CHOP',
    chopHits: 3,
    accent: '#4a8c57',
  },
  {
    id: 'salmon',
    key: '4',
    name: 'Wild Salmon Fillet',
    shortLabel: 'SALMON',
    prepType: 'cook',
    prepBadge: 'SEAR',
    cookDuration: 4.2,
    perfectStart: 2.8,
    perfectEnd: 4.6,
    burnTime: 6.6,
    accent: '#f07b5c',
  },
  {
    id: 'rice',
    key: '5',
    name: 'Steamed Jasmine Rice',
    shortLabel: 'RICE',
    prepType: 'direct',
    prepBadge: 'READY',
    accent: '#f3ead8',
  },
  {
    id: 'ramen',
    key: '6',
    name: 'Artisan Noodles & Broth',
    shortLabel: 'RAMEN',
    prepType: 'cook',
    prepBadge: 'SIMMER',
    cookDuration: 3.8,
    perfectStart: 2.5,
    perfectEnd: 4.3,
    burnTime: 6.3,
    accent: '#e6b84c',
  },
  {
    id: 'garlic',
    key: '7',
    name: 'Roasted Garlic & Egg',
    shortLabel: 'GARLIC',
    prepType: 'chop',
    prepBadge: 'CHOP',
    chopHits: 3,
    accent: '#e8d79b',
  },
  {
    id: 'dough',
    key: '8',
    name: 'Sourdough Flatbread',
    shortLabel: 'DOUGH',
    prepType: 'cook',
    prepBadge: 'BAKE',
    cookDuration: 3.6,
    perfectStart: 2.4,
    perfectEnd: 4.2,
    burnTime: 6.2,
    accent: '#d96b43',
  },
];

export const INGREDIENT_MAP = Object.fromEntries(INGREDIENTS.map((item) => [item.id, item]));

export const RECIPES = [
  {
    id: 'truffle_burger',
    name: 'Truffle Smash Burger',
    shortName: 'TRUFFLE BURGER',
    basePrice: 26,
    patienceSec: 56,
    accentColor: '#d97236',
    badgeBg: '#5a2b17',
    steps: [
      { ingredientId: 'brioche', requiredState: 'raw', label: 'Brioche' },
      { ingredientId: 'beef', requiredState: 'cooked', label: 'Sear Beef' },
      { ingredientId: 'herbs', requiredState: 'chopped', label: 'Chop Truffle' },
    ],
  },
  {
    id: 'salmon_bowl',
    name: 'Seared Salmon Bowl',
    shortName: 'SALMON BOWL',
    basePrice: 28,
    patienceSec: 60,
    accentColor: '#eb7a53',
    badgeBg: '#1c3e57',
    steps: [
      { ingredientId: 'rice', requiredState: 'raw', label: 'Rice Base' },
      { ingredientId: 'salmon', requiredState: 'cooked', label: 'Sear Salmon' },
      { ingredientId: 'garlic', requiredState: 'chopped', label: 'Chop Garlic' },
    ],
  },
  {
    id: 'garlic_ramen',
    name: 'Golden Garlic Ramen',
    shortName: 'GARLIC RAMEN',
    basePrice: 30,
    patienceSec: 62,
    accentColor: '#eab338',
    badgeBg: '#5c211c',
    steps: [
      { ingredientId: 'ramen', requiredState: 'cooked', label: 'Simmer Broth' },
      { ingredientId: 'garlic', requiredState: 'chopped', label: 'Chop Garlic' },
      { ingredientId: 'herbs', requiredState: 'chopped', label: 'Chop Herbs' },
    ],
  },
  {
    id: 'herb_flatbread',
    name: 'Herb Margherita Flatbread',
    shortName: 'HERB FLATBREAD',
    basePrice: 24,
    patienceSec: 54,
    accentColor: '#5ba868',
    badgeBg: '#4f2c1a',
    steps: [
      { ingredientId: 'dough', requiredState: 'cooked', label: 'Bake Dough' },
      { ingredientId: 'garlic', requiredState: 'chopped', label: 'Chop Garlic' },
      { ingredientId: 'herbs', requiredState: 'chopped', label: 'Chop Basil' },
    ],
  },
];

export const RECIPE_MAP = Object.fromEntries(RECIPES.map((r) => [r.id, r]));

export const SHIFTS = [
  {
    id: 'lunch',
    name: 'Shift 1: Bistro Lunch',
    subtitle: 'Steady midday rush',
    durationSec: 135,
    targetScore: 160,
    starThresholds: [120, 200, 260],
    spawnInterval: 6.5,
    maxTickets: 4,
    recipeIds: ['truffle_burger', 'salmon_bowl', 'herb_flatbread', 'garlic_ramen'],
    endless: false,
  },
  {
    id: 'dinner',
    name: 'Shift 2: Dinner Service',
    subtitle: 'Full four-dish menu',
    durationSec: 125,
    targetScore: 190,
    starThresholds: [140, 210, 290],
    spawnInterval: 9.8,
    maxTickets: 4,
    recipeIds: ['truffle_burger', 'salmon_bowl', 'garlic_ramen', 'herb_flatbread'],
    endless: false,
  },
  {
    id: 'rush',
    name: "Shift 3: Chef's Rush",
    subtitle: 'High-heat weekend wave',
    durationSec: 135,
    targetScore: 240,
    starThresholds: [180, 260, 350],
    spawnInterval: 8.2,
    maxTickets: 4,
    recipeIds: ['garlic_ramen', 'salmon_bowl', 'truffle_burger', 'herb_flatbread'],
    endless: false,
  },
  {
    id: 'endless',
    name: 'Endless Hearth',
    subtitle: 'Survive until 3 missed tickets',
    durationSec: 0,
    targetScore: 300,
    starThresholds: [150, 300, 500],
    spawnInterval: 8.6,
    maxTickets: 4,
    recipeIds: ['truffle_burger', 'salmon_bowl', 'garlic_ramen', 'herb_flatbread'],
    endless: true,
  },
];

export function normalizeStepState(prepState) {
  return prepState === 'perfect' ? 'cooked' : prepState;
}

export function stepToken(ingredientId, prepState) {
  return `${ingredientId}:${normalizeStepState(prepState)}`;
}

export function findCandidateRecipes(assemblyItems) {
  const tokens = assemblyItems.map((item) => stepToken(item.ingredientId, item.state));
  return RECIPES.filter((recipe) => {
    const req = recipe.steps.map((s) => `${s.ingredientId}:${s.requiredState}`);
    return tokens.every((tok) => {
      const idx = req.indexOf(tok);
      if (idx === -1) return false;
      req.splice(idx, 1);
      return true;
    });
  });
}

export function matchCompleteRecipe(assemblyItems) {
  if (assemblyItems.length !== 3) return null;
  const candidates = findCandidateRecipes(assemblyItems);
  return candidates.length === 1 ? candidates[0] : null;
}

export function canAcceptOnAssembly(assemblyItems, candidateItem) {
  if (!candidateItem || candidateItem.state === 'burnt') return false;
  const spec = INGREDIENT_MAP[candidateItem.ingredientId];
  if (!spec) return false;
  if (spec.prepType === 'cook' && candidateItem.state !== 'cooked' && candidateItem.state !== 'perfect') {
    return false;
  }
  if (spec.prepType === 'chop' && candidateItem.state !== 'chopped') {
    return false;
  }
  const next = [...assemblyItems, candidateItem];
  return findCandidateRecipes(next).length > 0;
}
