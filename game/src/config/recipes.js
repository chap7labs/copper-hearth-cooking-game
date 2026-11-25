// Culinary definitions, HUD coordinates, 8 combinable ingredients, 6 Kyoto recipes, and 3 shifts + Endless.

export const CANVAS_WIDTH = 1280;
export const CANVAS_HEIGHT = 720;
export const FIXED_STEP = 1 / 60;

export const GRID_COLS = 18;
export const GRID_ROWS = 6;
export const TILE_W = 68;
export const TILE_H = 86;
export const GRID_X0 = 28;
export const GRID_Y0 = 134;

export const HUD_LAYOUT = {
  topRail: { x: 0, y: 0, w: 1280, h: 116 },
  tickets: [0, 1, 2, 3].map((i) => ({ x: 18 + i * 176, y: 10, w: 168, h: 98 })),
  timerBox: { x: 732, y: 11, w: 170, h: 96 },
  scoreBox: { x: 910, y: 11, w: 138, h: 96 },
  comboBox: { x: 1056, y: 11, w: 72, h: 96 },
  pauseBtn: { x: 1140, y: 11, w: 122, h: 29 },
  muteBtn: { x: 1140, y: 44, w: 122, h: 29 },
  guideBtn: { x: 1140, y: 77, w: 122, h: 29 },
  statusBar: { x: 28, y: 672, w: 1224, h: 34 },

  titleShiftCards: [0, 1, 2, 3].map((i) => ({ x: 152 + i * 246, y: 422, w: 230, h: 106 })),
  titleStartBtn: { x: 460, y: 552, w: 360, h: 62 },

  pauseResumeBtn: { x: 490, y: 306, w: 300, h: 54 },
  pauseRestartBtn: { x: 490, y: 374, w: 300, h: 50 },
  pauseTitleBtn: { x: 490, y: 438, w: 300, h: 50 },

  summaryNextBtn: { x: 340, y: 526, w: 240, h: 56 },
  summaryReplayBtn: { x: 600, y: 526, w: 170, h: 56 },
  summaryEndlessBtn: { x: 790, y: 526, w: 170, h: 56 },
};

export const INGREDIENTS = [
  {
    id: 'salmon',
    key: '1',
    name: 'King Salmon Fillet',
    shortLabel: 'SALMON',
    prepType: 'cook',
    cookStations: ['grill'],
    prepBadge: 'GRILL',
    cookDuration: 3.4,
    perfectStart: 2.2,
    perfectEnd: 6.0,
    burnTime: 10.5,
    accent: '#ef7654',
  },
  {
    id: 'chicken',
    key: '2',
    name: 'Heritage Chicken',
    shortLabel: 'CHICKEN',
    prepType: 'cook',
    cookStations: ['grill', 'fryer'],
    prepBadge: 'GRL/FRY',
    cookDuration: 3.4,
    perfectStart: 2.2,
    perfectEnd: 6.0,
    burnTime: 10.5,
    accent: '#e09a52',
  },
  {
    id: 'shrimp',
    key: '3',
    name: 'Tiger Ebi Prawn',
    shortLabel: 'EBI',
    prepType: 'cook',
    cookStations: ['fryer'],
    prepBadge: 'FRY',
    cookDuration: 3.2,
    perfectStart: 2.1,
    perfectEnd: 5.8,
    burnTime: 10.2,
    accent: '#f58a5e',
  },
  {
    id: 'noodles',
    key: '4',
    name: 'Hand-Cut Noodles',
    shortLabel: 'NOODLES',
    prepType: 'cook',
    cookStations: ['boiler'],
    prepBadge: 'BOIL',
    cookDuration: 3.2,
    perfectStart: 2.1,
    perfectEnd: 5.8,
    burnTime: 10.2,
    accent: '#ebd178',
  },
  {
    id: 'curry',
    key: '5',
    name: 'Kyoto Golden Curry',
    shortLabel: 'CURRY',
    prepType: 'cook',
    cookStations: ['boiler'],
    prepBadge: 'SIMMER',
    cookDuration: 3.3,
    perfectStart: 2.2,
    perfectEnd: 5.9,
    burnTime: 10.3,
    accent: '#c47924',
  },
  {
    id: 'rice',
    key: '6',
    name: 'Steamed Koshihikari Rice',
    shortLabel: 'RICE',
    prepType: 'direct',
    cookStations: [],
    prepBadge: 'READY',
    accent: '#f6f1e4',
  },
  {
    id: 'yuzu',
    key: '7',
    name: 'Fresh Kyoto Yuzu',
    shortLabel: 'YUZU',
    prepType: 'chop',
    cookStations: [],
    prepBadge: 'CHOP',
    chopHits: 3,
    accent: '#f2cc38',
  },
  {
    id: 'scallion',
    key: '8',
    name: 'Kujo Scallions',
    shortLabel: 'SCALLION',
    prepType: 'chop',
    cookStations: [],
    prepBadge: 'CHOP',
    chopHits: 3,
    accent: '#4ea860',
  },
];

export const INGREDIENT_MAP = Object.fromEntries(INGREDIENTS.map((item) => [item.id, item]));

export const RECIPES = [
  {
    id: 'yuzu_ramen',
    name: 'Yuzu Shio Ramen',
    shortName: 'YUZU RAMEN',
    basePrice: 32,
    patienceSec: 138,
    accentColor: '#eab83e',
    badgeBg: '#7a3324',
    steps: [
      { ingredientId: 'noodles', requiredState: 'boiled', label: 'Boil Noodles' },
      { ingredientId: 'yuzu', requiredState: 'chopped', label: 'Chop Yuzu' },
      { ingredientId: 'scallion', requiredState: 'chopped', label: 'Chop Scallion' },
    ],
  },
  {
    id: 'ebi_tempura_don',
    name: 'Crispy Ebi Tempura Don',
    shortName: 'TEMPURA DON',
    basePrice: 34,
    patienceSec: 138,
    accentColor: '#eb8d36',
    badgeBg: '#274254',
    steps: [
      { ingredientId: 'rice', requiredState: 'raw', label: 'Steamed Rice' },
      { ingredientId: 'shrimp', requiredState: 'fried', label: 'Fry Ebi' },
      { ingredientId: 'scallion', requiredState: 'chopped', label: 'Chop Scallion' },
    ],
  },
  {
    id: 'teriyaki_salmon',
    name: 'Charcoal Teriyaki Salmon',
    shortName: 'TERIYAKI SALMON',
    basePrice: 36,
    patienceSec: 140,
    accentColor: '#eb6c47',
    badgeBg: '#2b5446',
    steps: [
      { ingredientId: 'rice', requiredState: 'raw', label: 'Steamed Rice' },
      { ingredientId: 'salmon', requiredState: 'grilled', label: 'Grill Salmon' },
      { ingredientId: 'yuzu', requiredState: 'chopped', label: 'Chop Yuzu' },
    ],
  },
  {
    id: 'yakitori_bento',
    name: 'Smoky Yakitori Bento',
    shortName: 'YAKITORI BENTO',
    basePrice: 32,
    patienceSec: 138,
    accentColor: '#c96f32',
    badgeBg: '#4c3222',
    steps: [
      { ingredientId: 'rice', requiredState: 'raw', label: 'Steamed Rice' },
      { ingredientId: 'chicken', requiredState: 'grilled', label: 'Grill Chicken' },
      { ingredientId: 'scallion', requiredState: 'chopped', label: 'Chop Scallion' },
    ],
  },
  {
    id: 'katsu_curry',
    name: 'Katsu Curry Plate',
    shortName: 'KATSU CURRY',
    basePrice: 38,
    patienceSec: 142,
    accentColor: '#d98a26',
    badgeBg: '#694318',
    steps: [
      { ingredientId: 'rice', requiredState: 'raw', label: 'Steamed Rice' },
      { ingredientId: 'chicken', requiredState: 'fried', label: 'Fry Katsu' },
      { ingredientId: 'curry', requiredState: 'boiled', label: 'Simmer Curry' },
    ],
  },
  {
    id: 'yuzu_soba',
    name: 'Chilled Yuzu Soba',
    shortName: 'YUZU SOBA',
    basePrice: 30,
    patienceSec: 136,
    accentColor: '#569c6d',
    badgeBg: '#364d3d',
    steps: [
      { ingredientId: 'noodles', requiredState: 'boiled', label: 'Boil Noodles' },
      { ingredientId: 'shrimp', requiredState: 'fried', label: 'Fry Ebi' },
      { ingredientId: 'yuzu', requiredState: 'chopped', label: 'Chop Yuzu' },
    ],
  },
];

export const RECIPE_MAP = Object.fromEntries(RECIPES.map((r) => [r.id, r]));

export const SHIFTS = [
  {
    id: 'daylight',
    layoutId: 'daylight',
    name: 'Shift 1: Daylight Counter',
    subtitle: 'Open center plating island',
    durationSec: 180,
    targetScore: 180,
    starThresholds: [140, 220, 290],
    spawnInterval: 7.2,
    maxTickets: 4,
    recipeIds: ['yuzu_ramen', 'ebi_tempura_don', 'teriyaki_salmon', 'yakitori_bento'],
    endless: false,
  },
  {
    id: 'split_island',
    layoutId: 'split_island',
    name: 'Shift 2: Split Island Rush',
    subtitle: 'Dual prep islands & cross-routes',
    durationSec: 180,
    targetScore: 220,
    starThresholds: [170, 250, 340],
    spawnInterval: 6.8,
    maxTickets: 4,
    recipeIds: ['ebi_tempura_don', 'teriyaki_salmon', 'katsu_curry', 'yuzu_soba', 'yuzu_ramen'],
    endless: false,
  },
  {
    id: 'lantern',
    layoutId: 'lantern',
    name: 'Shift 3: Lantern Dinner',
    subtitle: 'Evening lantern glow & dual pass',
    durationSec: 200,
    targetScore: 260,
    starThresholds: [200, 290, 390],
    spawnInterval: 6.4,
    maxTickets: 4,
    recipeIds: ['katsu_curry', 'yakitori_bento', 'yuzu_ramen', 'teriyaki_salmon', 'ebi_tempura_don', 'yuzu_soba'],
    endless: false,
  },
  {
    id: 'endless',
    layoutId: 'lantern',
    name: 'Endless Kyoto',
    subtitle: 'All 6 dishes until 3 missed',
    durationSec: 0,
    targetScore: 360,
    starThresholds: [180, 340, 520],
    spawnInterval: 6.5,
    maxTickets: 4,
    recipeIds: ['yuzu_ramen', 'ebi_tempura_don', 'teriyaki_salmon', 'yakitori_bento', 'katsu_curry', 'yuzu_soba'],
    endless: true,
  },
];

export function stepToken(ingredientId, prepState) {
  return `${ingredientId}:${prepState}`;
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
  if (!candidateItem || candidateItem.state === 'burnt' || candidateItem.kind === 'dish') return false;
  const spec = INGREDIENT_MAP[candidateItem.ingredientId];
  if (!spec) return false;
  if (spec.prepType === 'cook' && !['grilled', 'fried', 'boiled'].includes(candidateItem.state)) {
    return false;
  }
  if (spec.prepType === 'chop' && candidateItem.state !== 'chopped') {
    return false;
  }
  return findCandidateRecipes([...assemblyItems, candidateItem]).length > 0;
}
