















































import { inicioDaTemporada } from './pvp-rank.mjs';






export const PASSIVAS_DESDE_MS = Date.UTC(2026, 10, 29, 3, 0, 0);



if (inicioDaTemporada('2026-11-29') !== PASSIVAS_DESDE_MS) {
  throw new Error('PASSIVAS_DESDE_MS não é o começo de uma semana do PvP (inicioDaTemporada)');
}


export const BST_MAX_PASSIVA = 500;


export const PISO_MULT = 0.5;


export const PODER_600 = 600;


export const GATILHO_INICIO = 'inicio';
export const GATILHO_CICLO = 'ciclo';
export const GATILHO_CURA = 'cura';










export const PASSIVAS = Object.freeze({
  rocky_helmet: Object.freeze({ id: 'rocky_helmet', nome: 'Rocky Helmet', tipo: 'ROCK', gatilho: GATILHO_INICIO, icone: '⛰️', devolve: 0.20 }),
  rain_dance: Object.freeze({ id: 'rain_dance', nome: 'Rain Dance', tipo: 'WATER', gatilho: GATILHO_INICIO, icone: '🌧️', dano: 0.20, recarga: -0.10 }),
  swarm: Object.freeze({ id: 'swarm', nome: 'Swarm', tipo: 'BUG', gatilho: GATILHO_INICIO, icone: '🐝', dano: 0.35, porInseto: 0.05, teto: 0.50 }),
  intimidate: Object.freeze({ id: 'intimidate', nome: 'Intimidate', tipo: 'DRAGON', gatilho: GATILHO_INICIO, icone: '🐉', dano: -0.20 }),
  iron_defense: Object.freeze({ id: 'iron_defense', nome: 'Iron Defense', tipo: 'STEEL', gatilho: GATILHO_INICIO, icone: '🔩', defesa: 0.35 }),
  burn: Object.freeze({ id: 'burn', nome: 'Burn', tipo: 'FIRE', gatilho: GATILHO_CICLO, icone: '🔥', porSeg: 0.04, durMs: 5000 }),
  poison: Object.freeze({ id: 'poison', nome: 'Poison', tipo: 'POISON', gatilho: GATILHO_CICLO, icone: '☠️', porSeg: 0.015, durMs: 12_000 }),
  freeze: Object.freeze({ id: 'freeze', nome: 'Freeze', tipo: 'ICE', gatilho: GATILHO_CICLO, icone: '❄️', durMs: 2500, danoRecebido: 0.20 }),
  paralyze: Object.freeze({ id: 'paralyze', nome: 'Paralyze', tipo: 'ELECTRIC', gatilho: GATILHO_CICLO, icone: '🌩️', atrasoMs: 3000, durMs: 12_000, recarga: 0.30, falha: 0.25 }),
  leech_seed: Object.freeze({ id: 'leech_seed', nome: 'Leech Seed', tipo: 'GRASS', gatilho: GATILHO_CICLO, icone: '🌱', porSeg: 0.015, durMs: 10_000, curaMax: 0.15 }),
  dig: Object.freeze({ id: 'dig', nome: 'Dig', tipo: 'GROUND', gatilho: GATILHO_CICLO, icone: '🕳️' }),
  confusion: Object.freeze({ id: 'confusion', nome: 'Confusion', tipo: 'PSYCHIC', gatilho: GATILHO_CICLO, icone: '💫' }),
  fear: Object.freeze({ id: 'fear', nome: 'Fear', tipo: 'GHOST', gatilho: GATILHO_CICLO, icone: '👻', durMs: 4000 }),
  rock_smash: Object.freeze({ id: 'rock_smash', nome: 'Rock Smash', tipo: 'FIGHTING', gatilho: GATILHO_CICLO, icone: '👊', defesa: -0.20, durMs: 15_000 }),
  whirlwind: Object.freeze({ id: 'whirlwind', nome: 'Whirlwind', tipo: 'FLYING', gatilho: GATILHO_CICLO, icone: '🌪️', dano: 0.15 }),
  assurance: Object.freeze({ id: 'assurance', nome: 'Assurance', tipo: 'DARK', gatilho: GATILHO_CICLO, icone: '🌑', dano: 0.25, faltando: 0.25 }),
  charm: Object.freeze({ id: 'charm', nome: 'Charm', tipo: 'FAIRY', gatilho: GATILHO_CICLO, icone: '💗', dano: 0.10 }),
  recover: Object.freeze({ id: 'recover', nome: 'Recover', tipo: 'NORMAL', gatilho: GATILHO_CURA, icone: '💚', cura: 0.20, gatilhoHp: 0.50 }),
});


export const ORDEM_PASSIVAS = Object.freeze([
  'rocky_helmet', 'rain_dance', 'swarm', 'intimidate', 'iron_defense',
  'burn', 'poison', 'freeze', 'paralyze', 'leech_seed', 'dig', 'confusion', 'fear', 'rock_smash', 'whirlwind',
  'assurance', 'charm', 'recover',
]);


export const PASSIVA_DO_TIPO = Object.freeze(Object.fromEntries(ORDEM_PASSIVAS.map((id) => [PASSIVAS[id].tipo, id])));









const ESPECIES_DA_PASSIVA = {
  rocky_helmet: [
    76,
    139,
    141,
    185,
    337,
    338,
    346,
    348,
    409,
    411,
    703,
    745,
    774,
    874,
    934,
    950,
    2019,
    4076,
    8745,
    8774,
    9745,
    13337,
    13338,
    13346,
    13348,
  ],
  rain_dance: [
    55,
    87,
    99,
    119,
    171,
    184,
    186,
    195,
    199,
    211,
    222,
    224,
    226,
    272,
    279,
    321,
    340,
    342,
    367,
    368,
    369,
    370,
    419,
    423,
    457,
    516,
    565,
    581,
    593,
    594,
    693,
    746,
    752,
    771,
    779,
    834,
    847,
    961,
    964,
    976,
    2013,
    2040,
    8351,
    13272,
    13279,
    13321,
    13340,
    13342,
    13367,
    13368,
    13369,
    13370,
  ],
  swarm: [
    12,
    47,
    49,
    166,
    168,
    205,
    267,
    269,
    284,
    291,
    292,
    313,
    314,
    402,
    413,
    414,
    416,
    542,
    558,
    589,
    596,
    617,
    632,
    666,
    738,
    743,
    900,
    918,
    920,
    954,
    8413,
    9413,
    13267,
    13269,
    13284,
    13291,
    13292,
    13313,
    13314,
  ],
  intimidate: [
    621,
  ],
  iron_defense: [
    437,
    681,
    707,
    863,
    879,
    966,
    968,
    8681,
  ],
  burn: [
    78,
    219,
    324,
    514,
    555,
    631,
    741,
    776,
    2053,
    4105,
    11351,
    13324,
  ],
  poison: [
    24,
    89,
    110,
    317,
    336,
    435,
    452,
    454,
    569,
    748,
    758,
    945,
    980,
    2054,
    4089,
    5080,
    5110,
    5199,
    13317,
    13336,
  ],
  freeze: [
    124,
    225,
    873,
    875,
    2014,
    4028,
    5555,
    9351,
  ],
  paralyze: [
    101,
    311,
    312,
    417,
    479,
    523,
    587,
    695,
    702,
    777,
    836,
    871,
    877,
    923,
    939,
    941,
    4026,
    6101,
    8741,
    13311,
    13312,
  ],
  leech_seed: [
    45,
    182,
    189,
    192,
    275,
    286,
    332,
    357,
    421,
    455,
    512,
    547,
    549,
    556,
    591,
    598,
    754,
    756,
    830,
    841,
    842,
    947,
    2052,
    6549,
    13275,
    13286,
    13332,
    13357,
  ],
  dig: [
    28,
    51,
    105,
    232,
    344,
    618,
    750,
    867,
    2017,
    2018,
    2047,
    4051,
    5618,
    13344,
  ],
  confusion: [
    97,
    122,
    178,
    201,
    202,
    326,
    518,
    528,
    561,
    576,
    579,
    606,
    876,
    956,
    2036,
    2038,
    5078,
    9741,
    13326,
  ],
  fear: [
    426,
    429,
    442,
    563,
    709,
    711,
    770,
    778,
    972,
    2056,
    11741,
  ],
  rock_smash: [
    106,
    107,
    237,
    297,
    538,
    539,
    675,
    766,
    853,
    2028,
    2029,
    2030,
    7128,
    8128,
    9128,
    13297,
  ],
  whirlwind: [
    22,
    83,
    85,
    164,
    277,
    441,
    521,
    663,
    733,
    823,
    845,
    931,
    962,
    973,
    2045,
    13277,
  ],
  assurance: [
    262,
    510,
    828,
    4020,
    4053,
    13262,
  ],
  charm: [
    210,
    683,
    685,
    764,
    869,
    927,
    2043,
  ],
  recover: [
    20,
    40,
    53,
    128,
    132,
    162,
    235,
    241,
    264,
    295,
    301,
    327,
    335,
    351,
    352,
    400,
    424,
    432,
    505,
    508,
    573,
    586,
    626,
    660,
    676,
    735,
    760,
    765,
    775,
    820,
    832,
    916,
    925,
    2016,
    2035,
    13264,
    13295,
    13301,
    13327,
    13335,
    13351,
    13352,
  ],
};


export const PASSIVA_POR_ESPECIE = new Map(
  Object.entries(ESPECIES_DA_PASSIVA).flatMap(([id, ids]) => ids.map((pokeId) => [pokeId, id])),
);


export function passivaDaEspecie(especieOuId) {
  const id = Number(typeof especieOuId === 'object' && especieOuId ? especieOuId.pokeId : especieOuId);
  const p = PASSIVA_POR_ESPECIE.get(id);
  return p ? PASSIVAS[p] : null;
}


export function bstDaEspecie(esp) {
  if (!esp || typeof esp !== 'object') return null;
  const k = ['baseHp', 'baseAtk', 'baseDef', 'baseSpAtk', 'baseSpDef', 'baseSpeed'];
  if (!k.every((c) => Number.isFinite(Number(esp[c])))) return null;
  return k.reduce((s, c) => s + Number(esp[c]), 0);
}


export const recebeDoAliado = (esp) => {
  const b = bstDaEspecie(esp);
  return b != null && b <= BST_MAX_PASSIVA;
};






export const passivasNoAr = (agora = Date.now()) => Number(agora) >= PASSIVAS_DESDE_MS;


export const MODOS_PREVIA = Object.freeze(['treino', 'amistoso']);












export const CAMPEONATOS_SEM_PASSIVA = Object.freeze(['2026-11-30']);


const idDaEdicao = (edicao) => String((edicao && typeof edicao === 'object' ? edicao.id : edicao) ?? '');






export const campeonatoForaDasPassivas = (edicao) => CAMPEONATOS_SEM_PASSIVA.includes(idDaEdicao(edicao));








export const campeonatoTemPassivas = (edicao) =>
  !!edicao && typeof edicao === 'object' && passivasNoAr(Number(edicao.lutasEm)) && !campeonatoForaDasPassivas(edicao);







export function numerosDaPassiva(p, { decimal = ',' } = {}) {
  if (!p) return {};
  const casa = (v) => (Number.isInteger(v) ? String(v) : v.toFixed(1).replace('.', decimal));
  const pct = (v) => casa(Math.round(Math.abs(Number(v) || 0) * 1000) / 10);
  const seg = (ms) => casa(Math.round((Number(ms) || 0) / 100) / 10);
  return {
    pct: pct(p.devolve ?? p.dano ?? p.porSeg ?? p.cura ?? p.defesa ?? p.danoRecebido ?? 0),
    seg: seg(p.durMs),
    total: p.porSeg != null ? pct(p.porSeg * (p.durMs / 1000)) : '',
    recarga: p.recarga != null ? pct(p.recarga) : '',
    falha: p.falha != null ? pct(p.falha) : '',
    atraso: p.atrasoMs != null ? seg(p.atrasoMs) : '',
    porInseto: p.porInseto != null ? pct(p.porInseto) : '',
    teto: p.teto != null ? pct(p.teto) : '',
    faltando: p.faltando != null ? pct(p.faltando) : '',
    curaMax: p.curaMax != null ? pct(p.curaMax) : '',
    gatilhoHp: p.gatilhoHp != null ? pct(p.gatilhoHp) : '',
    danoRecebido: p.danoRecebido != null ? pct(p.danoRecebido) : '',
    bst: String(BST_MAX_PASSIVA),
    poder: String(PODER_600),
  };
}
