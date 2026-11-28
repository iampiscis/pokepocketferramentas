
export const LENDARIO_DEX = new Set([

  377, 378, 379, 380, 381, 382, 383, 384,

  480, 481, 482, 483, 484, 485, 486, 487, 488,

  638, 639, 640, 641, 642, 643, 644, 645, 646,

  716, 717, 718,



  772, 773,
  785, 786, 787, 788, 789, 790, 791, 792,
  793, 794, 795, 796, 797, 798, 799, 800,
  803, 804, 805, 806,

  888, 889, 890, 891, 892, 894, 895, 896, 897, 898, 905,

  1001, 1002, 1003, 1004, 1007, 1008, 1009, 1010,
  1014, 1015, 1016, 1017, 1020, 1021, 1022, 1023, 1024,
]);


export const MITICO_DEX = new Set([
  385, 386,
  489, 490, 491, 492, 493,
  647, 648, 649,
  719, 720, 721,
  801, 802, 807, 808, 809,
  893, 1025,
]);


export const LENDARIOS_DEX = LENDARIO_DEX;











export const SLUGS_OMITIDOS = new Set();


export const NOMES_OMITIDOS = new Set();


export const FONTE_POR_TIPO = {
  FIRE: 'charmander',
  WATER: 'squirtle',
  GRASS: 'ivysaur',
  ROCK: 'geodude',
  GROUND: 'sandshrew',
  ELECTRIC: 'pikachu',



  PSYCHIC: 'brave_alakazam',
  GHOST: 'haunter',
  DARK: 'houndour',
  STEEL: 'magnemite',
  FIGHTING: 'primeape',
  NORMAL: 'pidgey',
  FAIRY: 'clefairy',
  BUG: 'butterfree',
  DRAGON: 'dragonair',
  POISON: 'ivysaur',
  FLYING: 'pidgey',
  ICE: 'squirtle',
  'BUG/FIRE': 'butterfree',
  'BUG/FLYING': 'butterfree',
  'DARK/FLYING': 'houndour',
  'DRAGON/FLYING': 'dragonair',
  'FIGHTING/DARK': 'primeape',
  'GROUND/FLYING': 'sandshrew',
  'GROUND/ROCK': 'sandshrew',
  'POISON/DRAGON': 'ivysaur',
  'POISON/WATER': 'ivysaur',
  'ROCK/FLYING': 'geodude',
  'ROCK/STEEL': 'geodude',
  'STEEL/GHOST': 'magnemite',
  'STEEL/PSYCHIC': 'magnemite',
  'WATER/PSYCHIC': 'squirtle',
  'WATER/ROCK': 'squirtle',
};

export function fontePorTipo(tipo) {
  if (!tipo) return 'pidgey';
  return FONTE_POR_TIPO[tipo] ?? FONTE_POR_TIPO[tipo.split('/')[0]] ?? 'pidgey';
}
