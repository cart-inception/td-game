// Definition of enemy waves for each round
module.exports = [
  {
    number: 1,
    enemies: [
      { type: 'basic_bloon', count: 10, delay: 0, spacing: 1000 }
    ]
  },
  {
    number: 2,
    enemies: [
      { type: 'basic_bloon', count: 15, delay: 0, spacing: 800 }
    ]
  },
  {
    number: 3,
    enemies: [
      { type: 'basic_bloon', count: 10, delay: 0, spacing: 600 },
      { type: 'fast_bloon', count: 5, delay: 2000, spacing: 1000 }
    ]
  },
  {
    number: 4,
    enemies: [
      { type: 'basic_bloon', count: 15, delay: 0, spacing: 500 },
      { type: 'fast_bloon', count: 8, delay: 2000, spacing: 800 }
    ]
  },
  {
    number: 5,
    enemies: [
      { type: 'basic_bloon', count: 10, delay: 0, spacing: 400 },
      { type: 'fast_bloon', count: 10, delay: 1000, spacing: 600 },
      { type: 'heavy_bloon', count: 3, delay: 2000, spacing: 1500 }
    ]
  },
  {
    number: 6,
    enemies: [
      { type: 'heavy_bloon', count: 8, delay: 0, spacing: 1200 }
    ]
  },
  {
    number: 7,
    enemies: [
      { type: 'fast_bloon', count: 20, delay: 0, spacing: 400 },
      { type: 'camo_bloon', count: 5, delay: 2000, spacing: 1000 }
    ]
  },
  {
    number: 8,
    enemies: [
      { type: 'basic_bloon', count: 15, delay: 0, spacing: 300 },
      { type: 'heavy_bloon', count: 6, delay: 1000, spacing: 1000 },
      { type: 'camo_bloon', count: 8, delay: 2000, spacing: 800 }
    ]
  },
  {
    number: 9,
    enemies: [
      { type: 'regen_bloon', count: 10, delay: 0, spacing: 1200 }
    ]
  },
  {
    number: 10,
    enemies: [
      { type: 'fast_bloon', count: 10, delay: 0, spacing: 300 },
      { type: 'heavy_bloon', count: 10, delay: 1000, spacing: 800 },
      { type: 'boss_bloon', count: 1, delay: 5000, spacing: 0 }
    ]
  },
  {
    number: 11,
    enemies: [
      { type: 'basic_bloon', count: 20, delay: 0, spacing: 200 },
      { type: 'fast_bloon', count: 15, delay: 1000, spacing: 300 },
      { type: 'camo_bloon', count: 10, delay: 2000, spacing: 500 }
    ]
  },
  {
    number: 12,
    enemies: [
      { type: 'heavy_bloon', count: 15, delay: 0, spacing: 800 },
      { type: 'regen_bloon', count: 12, delay: 2000, spacing: 1000 }
    ]
  },
  {
    number: 13,
    enemies: [
      { type: 'camo_bloon', count: 20, delay: 0, spacing: 600 }
    ]
  },
  {
    number: 14,
    enemies: [
      { type: 'fast_bloon', count: 25, delay: 0, spacing: 250 },
      { type: 'regen_bloon', count: 15, delay: 2000, spacing: 800 }
    ]
  },
  {
    number: 15,
    enemies: [
      { type: 'basic_bloon', count: 10, delay: 0, spacing: 200 },
      { type: 'fast_bloon', count: 10, delay: 500, spacing: 300 },
      { type: 'heavy_bloon', count: 10, delay: 1000, spacing: 600 },
      { type: 'camo_bloon', count: 10, delay: 1500, spacing: 500 },
      { type: 'regen_bloon', count: 10, delay: 2000, spacing: 800 }
    ]
  },
  {
    number: 16,
    enemies: [
      { type: 'boss_bloon', count: 2, delay: 0, spacing: 3000 }
    ]
  },
  {
    number: 17,
    enemies: [
      { type: 'heavy_bloon', count: 20, delay: 0, spacing: 500 },
      { type: 'camo_bloon', count: 15, delay: 1000, spacing: 600 }
    ]
  },
  {
    number: 18,
    enemies: [
      { type: 'fast_bloon', count: 30, delay: 0, spacing: 200 },
      { type: 'regen_bloon', count: 15, delay: 1000, spacing: 700 }
    ]
  },
  {
    number: 19,
    enemies: [
      { type: 'camo_bloon', count: 20, delay: 0, spacing: 500 },
      { type: 'regen_bloon', count: 20, delay: 1000, spacing: 600 }
    ]
  },
  {
    number: 20,
    enemies: [
      { type: 'basic_bloon', count: 10, delay: 0, spacing: 150 },
      { type: 'fast_bloon', count: 10, delay: 500, spacing: 200 },
      { type: 'heavy_bloon', count: 10, delay: 1000, spacing: 400 },
      { type: 'camo_bloon', count: 10, delay: 1500, spacing: 300 },
      { type: 'regen_bloon', count: 10, delay: 2000, spacing: 500 },
      { type: 'boss_bloon', count: 3, delay: 5000, spacing: 2000 }
    ]
  }
];