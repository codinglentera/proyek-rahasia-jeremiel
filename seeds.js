export const recipes = [
  { seedA: 'dirt', seedB: 'rock', result: 'grass', grow: 30, rarity: 'common' },
  { seedA: 'grass', seedB: 'rock', result: 'cave_bg', grow: 45, rarity: 'common' },
  { seedA: 'grass', seedB: 'water', result: 'rice', grow: 70, rarity: 'uncommon' },
  { seedA: 'lava', seedB: 'dirt', result: 'fire_seed', grow: 120, rarity: 'rare' },
  { seedA: 'sand', seedB: 'water', result: 'mud', grow: 35, rarity: 'common' },
  { seedA: 'sand', seedB: 'grass', result: 'cactus', grow: 90, rarity: 'uncommon' },
  { seedA: 'dirt', seedB: 'tree', result: 'root', grow: 60, rarity: 'uncommon' },
  { seedA: 'cave', seedB: 'fire', result: 'crystal', grow: 180, rarity: 'very_rare' },
  { seedA: 'grass', seedB: 'root', result: 'flower', grow: 100, rarity: 'uncommon' },
  { seedA: 'crystal', seedB: 'water', result: 'pearl', grow: 240, rarity: 'legendary' }
];

export function spliceSeeds(seedA, seedB) {
  const recipe = recipes.find(
    r =>
      (r.seedA === seedA && r.seedB === seedB) ||
      (r.seedA === seedB && r.seedB === seedA)
  );

  if (!recipe) {
    return { success: false, msg: 'Invalid combination!', result: null };
  }

  return {
    success: true,
    result: recipe.result,
    grow: recipe.grow,
    rarity: recipe.rarity,
    msg: `Spliced into ${recipe.result} (${recipe.rarity})!`
  };
}

export function getBlockInfo(type) {
  const blockData = {
    dirt: { icon: '🟫', color: '#8B4513', solid: true },
    rock: { icon: '⬛', color: '#404040', solid: true },
    grass: { icon: '🟩', color: '#228B22', solid: false },
    water: { icon: '🌊', color: '#4169E1', solid: false },
    sand: { icon: '🟨', color: '#FFD700', solid: true },
    tree: { icon: '🌳', color: '#228B22', solid: false },
    lava: { icon: '🔥', color: '#FF4500', solid: false },
    cave_bg: { icon: '⛏️', color: '#696969', solid: true },
    rice: { icon: '🌾', color: '#DAA520', solid: false },
    fire_seed: { icon: '🔥', color: '#FF6347', solid: false },
    mud: { icon: '🟫', color: '#654321', solid: true },
    cactus: { icon: '🌵', color: '#6B8E23', solid: false },
    root: { icon: '🌳', color: '#8B4513', solid: false },
    crystal: { icon: '💎', color: '#00CED1', solid: false },
    flower: { icon: '🌸', color: '#FFB6C1', solid: false },
    pearl: { icon: '⚪', color: '#FFFFFF', solid: false }
  };

  return blockData[type] || { icon: '?', color: '#000000', solid: false };
}
