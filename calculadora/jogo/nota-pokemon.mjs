




















import { basesComRefino } from './refino-stats.mjs';
import { ehLendarioOuMitico } from './mistico.mjs';



export const IV_POR_STAT = { min: 1, max: 32 };
export const IV_STATS = 6;
export const IV_MIN = IV_STATS * IV_POR_STAT.min;
export const IV_MAX = IV_STATS * IV_POR_STAT.max;

const STAT_KEYS = ['hp', 'atk', 'def', 'spAtk', 'spDef', 'speed'];




export const BANDAS_QUALIDADE = [
  { min: 0.8, max: 0.9, chance: 5 },
  { min: 0.9, max: 1.0, chance: 5 },
  { min: 1.0, max: 1.1, chance: 34.03846 },
  { min: 1.1, max: 1.2, chance: 20 },
  { min: 1.2, max: 1.3, chance: 10 },
  { min: 1.3, max: 1.4, chance: 10 },
  { min: 1.4, max: 1.5, chance: 10 },
  { min: 1.5, max: 1.6, chance: 5 },
  { min: 1.7, max: 1.8, chance: 0.67308 },
  { min: 1.8, max: 1.8, chance: 0.28846 },
];

export const QUALIDADE_MIN = BANDAS_QUALIDADE[0].min;
export const QUALIDADE_MAX = BANDAS_QUALIDADE.at(-1).max;


export const EXPO_QUALIDADE = {
  hp: 0.95, atk: 0.8, def: 0.8, spAtk: 0.8, spDef: 0.8, speed: 0.95,
};



export const POTENCIA_MIN = 1;
export const POTENCIA_MAX = 5;


export const BONUS_POTENCIA = [0, 0.05, 0.1, 0.25, 1];


export const multPotencia = (n) => 1 + (BONUS_POTENCIA[(Math.round(n) || 1) - 1] ?? 0);

export const MULT_SHINY_STATS = 3;


export const MULT_LENDARIO_STATS = 4;

export const multDeNascenca = (potencia, shiny, lendario = false) =>
  multPotencia(potencia) * (shiny ? MULT_SHINY_STATS : 1) * (lendario ? MULT_LENDARIO_STATS : 1);




export const REF_BASE = { hp: 80, atk: 80, def: 80, spAtk: 80, spDef: 80, speed: 80 };


export const PODER_ESCALA_NIVEL = 10;


export const PODER_FORMULA_VERSAO = 5;





export const NOTA_FORMULA_VERSAO = 2;









export const GANHO_MIN_EVOLUCAO = 0.1;










export const MERCADO_POKEMON_MIN = { level: 50, nota: 3.5 };
























export const pokemonSoEmGemas = (pk) => !!pk?.shiny;





export const AUTO_LOCK_NOTA_MIN = 3.5;









export function notaAutoLockValida(v) {
  if (typeof v !== 'number' || !Number.isFinite(v)) return null;
  if (v < 0 || v > 10) return null;
  return Math.round(v * 1000) / 1000;
}

export const FAIXAS_NOTA = [
  { id: 'extremamente-fraco', ate: 1 },
  { id: 'fraco', ate: 2 },
  { id: 'mediano', ate: 3 },
  { id: 'razoavel', ate: 4 },
  { id: 'bom', ate: 5 },
  { id: 'forte', ate: 6 },
  { id: 'poderoso', ate: 7 },
  { id: 'mitico', ate: 8 },
  { id: 'legendario', ate: 9 },
  { id: 'divino', ate: 10 },
];


export const faixaDaNota = (n) => {
  const v = Number(n);
  if (!Number.isFinite(v)) return FAIXAS_NOTA[0].id;
  return FAIXAS_NOTA.find((f) => v <= f.ate)?.id ?? 'divino';
};

const limitar = (v, min, max) => Math.min(max, Math.max(min, v));


export function ivsDeSoma(soma) {
  const s = limitar(Math.round(Number(soma) || IV_MIN), IV_MIN, IV_MAX);
  const med = Math.floor(s / IV_STATS);
  const rest = s - med * IV_STATS;
  const ivs = Object.fromEntries(STAT_KEYS.map((k) => [k, med]));
  for (let i = 0; i < rest; i++) ivs[STAT_KEYS[i % IV_STATS]]++;
  return ivs;
}


function basesDe(bases) {
  const b = bases ?? REF_BASE;
  return {
    hp: b.hp ?? b.baseHp ?? REF_BASE.hp,
    atk: b.atk ?? b.baseAtk ?? REF_BASE.atk,
    def: b.def ?? b.baseDef ?? REF_BASE.def,
    spAtk: b.spAtk ?? b.baseSpAtk ?? REF_BASE.spAtk,
    spDef: b.spDef ?? b.baseSpDef ?? REF_BASE.spDef,
    speed: b.speed ?? b.baseSpeed ?? REF_BASE.speed,
  };
}





export function somaStatsNascimento({
  iv,
  ivs: ivsRaw,
  qualidade,
  potencia,
  shiny = false,
  lendario = false,
  bases,
}) {
  const b = basesDe(bases);
  const ivs = ivsRaw ?? ivsDeSoma(iv);
  const q = limitar(Number(qualidade) || 1, QUALIDADE_MIN, QUALIDADE_MAX);
  const p = limitar(Math.round(Number(potencia) || POTENCIA_MIN), POTENCIA_MIN, POTENCIA_MAX);
  const mult = multDeNascenca(p, shiny, lendario);
  let soma = 0;
  for (const k of STAT_KEYS) {
    soma += Math.round(
      (b[k] + 2 * (Number(ivs[k]) || IV_POR_STAT.min))
      * (q ** EXPO_QUALIDADE[k])
      * mult,
    );
  }
  return soma;
}





export function fatiasNascimentoPorStat({
  iv,
  ivs: ivsRaw,
  qualidade,
  potencia,
  shiny = false,
  bases,
}) {
  const b = basesDe(bases);
  const ivs = ivsRaw ?? ivsDeSoma(iv);
  const q = limitar(Number(qualidade) || 1, QUALIDADE_MIN, QUALIDADE_MAX);
  const p = limitar(Math.round(Number(potencia) || POTENCIA_MIN), POTENCIA_MIN, POTENCIA_MAX);
  const mult = multDeNascenca(p, shiny);
  const partes = [];
  let soma = 0;
  for (const k of STAT_KEYS) {
    const valor = Math.round(
      (b[k] + 2 * (Number(ivs[k]) || IV_POR_STAT.min))
      * (q ** EXPO_QUALIDADE[k])
      * mult,
    );
    partes.push({ key: k, valor });
    soma += valor;
  }
  const div = soma > 0 ? soma : 1;
  return partes
    .map((x) => ({ ...x, pct: x.valor / div }))
    .sort((a, b) => b.pct - a.pct || b.valor - a.valor);
}

function limitesForca({ bases } = {}) {
  const min = somaStatsNascimento({
    iv: IV_MIN, qualidade: QUALIDADE_MIN, potencia: POTENCIA_MIN, shiny: false, bases,
  });
  const max = somaStatsNascimento({
    iv: IV_MAX, qualidade: QUALIDADE_MAX, potencia: POTENCIA_MAX, shiny: true, bases,
  });
  return { min: Math.max(1, min), max: Math.max(min + 1, max) };
}


export function notaDeForca(soma, limites = null) {
  const { min, max } = limites ?? limitesForca();
  const s = limitar(Number(soma) || min, min, max);
  if (max <= min) return 0;
  const lo = Math.log(min);
  const hi = Math.log(max);
  const bruta = 10 * (Math.log(Math.max(1, s)) - lo) / (hi - lo);
  return Math.round(limitar(bruta, 0, 10) * 1000) / 1000;
}





export function eixosForca(params) {
  const { basesLimites, ...resto } = params;
  const args = {
    iv: IV_MIN,
    qualidade: QUALIDADE_MIN,
    potencia: POTENCIA_MIN,
    shiny: false,
    ...resto,
  };
  const limites = limitesForca({ bases: basesLimites ?? args.bases });
  const logAtual = Math.log(somaStatsNascimento(args));
  const ganho = (patch) => {
    const patched = { ...args, ...patch };
    const s = somaStatsNascimento(patched);
    return Math.max(0, logAtual - Math.log(Math.max(1, s)));
  };
  const deltas = {
    iv: ganho({ ivs: ivsDeSoma(IV_MIN) }),
    qualidade: ganho({ qualidade: QUALIDADE_MIN }),
    potencia: ganho({ potencia: POTENCIA_MIN }),
    shiny: ganho({ shiny: false }),
  };
  const total = Object.values(deltas).reduce((a, b) => a + b, 0);
  const div = total > 1e-9 ? total : 1;
  return {
    iv: deltas.iv / div,
    qualidade: deltas.qualidade / div,
    potencia: deltas.potencia / div,
    shiny: deltas.shiny / div,
    soma: somaStatsNascimento(args),
    limites,
  };
}


export function scoreForca(params, { limitesRef = false } = {}) {
  const args = {
    iv: IV_MIN,
    qualidade: QUALIDADE_MIN,
    potencia: POTENCIA_MIN,
    shiny: false,
    ...params,
  };
  const limites = limitesRef ? limitesForca() : limitesForca(args);
  return limitar(notaDeForca(somaStatsNascimento(args), limites) / 10, 0, 1);
}


export function limitesScoreEspecie(bases) {
  const b = bases ?? REF_BASE;
  const min = scoreForca({
    iv: IV_MIN, qualidade: QUALIDADE_MIN, potencia: POTENCIA_MIN, shiny: false, bases: b,
  }, { limitesRef: true });
  const max = scoreForca({
    iv: IV_MAX, qualidade: QUALIDADE_MAX, potencia: POTENCIA_MAX, shiny: true, bases: b,
  }, { limitesRef: true });
  return { min, max: Math.max(min, max) };
}


export function notaDeScore(score, limites) {
  const { min, max } = limites;
  const s = limitar(Number(score) || min, min, max);
  if (max <= min) return 0;
  return Math.round(10 * (s - min) / (max - min) * 1000) / 1000;
}












export function notaPokemon({
  iv,
  ivs,
  qualidade,
  potencia,
  shiny = false,
  bases,
  basesLimites,
  basesAncestrais = null,
}) {
  const args = { iv, ivs, qualidade, potencia, shiny, bases, basesLimites: basesLimites ?? bases };
  const limitesScore = limitesScoreEspecie(args.basesLimites ?? args.bases);
  const score = scoreForca({
    iv: args.iv,
    ivs: args.ivs,
    qualidade: args.qualidade,
    potencia: args.potencia,
    shiny: args.shiny,
    bases: args.bases,
  }, { limitesRef: true });
  let nota = notaDeScore(score, limitesScore);









  for (const { bases: b, passos } of basesAncestrais ?? []) {
    const scoreAnc = scoreForca({ iv, ivs, qualidade, potencia, shiny, bases: b }, { limitesRef: true });
    const notaAnc = notaDeScore(scoreAnc, limitesScoreEspecie(b));
    const piso = Math.min(10, notaAnc + (Number(passos) || 1) * GANHO_MIN_EVOLUCAO);
    if (piso > nota) nota = piso;
  }



  nota = Math.round(nota * 1000) / 1000;
  const { soma, ...eixos } = eixosForca(args);
  return { nota, faixa: faixaDaNota(nota), eixos, soma, score, limites: limitesScore };
}


export function notaDePokemon(pk, esp = null) {
  const iv = pk?.iv ?? pk?.ivTotal ?? (
    pk?.ivs ? Object.values(pk.ivs).reduce((s, v) => s + (Number(v) || 0), 0) : null
  );
  if (iv == null || !Number.isFinite(Number(iv))) return null;
  const basesLimites = esp
    ? basesDaEspecie(esp)
    : (pk?.bases ?? null);
  const bases = esp
    ? basesComRefino(esp, pk?.refino)
    : basesLimites;
  return notaPokemon({



    basesAncestrais: esp?.notaAncestrais ?? null,
    iv: Math.round(Number(iv)),
    ivs: pk?.ivs,
    qualidade: Number(pk?.quality ?? pk?.qualidade) || 1,
    potencia: Math.min(POTENCIA_MAX, Math.max(POTENCIA_MIN, Number(pk?.potencia) || 1)),
    shiny: !!pk?.shiny,
    bases,
    basesLimites,
  }).nota;
}


export function basesDaEspecie(esp) {
  if (!esp) return null;
  return {
    hp: esp.baseHp, atk: esp.baseAtk, def: esp.baseDef,
    spAtk: esp.baseSpAtk, spDef: esp.baseSpDef, speed: esp.baseSpeed,
  };
}


export function notaMercadoDoPokemon(pk, especiesMap = null) {
  const esp = especiesMap?.get?.(pk?.speciesId) ?? null;
  return notaDePokemon(pk, esp);
}

export function atendeNotaMercado(nota) {
  return nota != null && Number(nota) >= MERCADO_POKEMON_MIN.nota - 1e-9;
}








export function motivoNaoAnunciavel(pk, especiesMap = null) {
  if (!pk) return 'sumiu';
  if (pk.shiny) return null;
  if (Number(pk.potencia) === POTENCIA_MAX) return null;
  if (ehLendarioOuMitico(pk.speciesId)) return null;
  if ((pk.level ?? 0) < MERCADO_POKEMON_MIN.level) return 'nivel';
  const nota = notaMercadoDoPokemon(pk, especiesMap);
  if (!atendeNotaMercado(nota)) return 'nota';
  return null;
}






export function poderDePokemon(pk, esp = null) {
  const iv = pk?.iv ?? pk?.ivTotal ?? (
    pk?.ivs ? Object.values(pk.ivs).reduce((s, v) => s + (Number(v) || 0), 0) : null
  );
  if (iv == null || !Number.isFinite(Number(iv))) return 1;
  const level = Math.max(1, Number(pk?.level) || 1);
  const bases = esp
    ? basesComRefino(esp, pk?.refino)
    : (pk?.bases ?? null);
  const score = scoreForca({
    iv: Math.round(Number(iv)),
    ivs: pk?.ivs,
    qualidade: Number(pk?.quality ?? pk?.qualidade) || 1,
    potencia: Math.min(POTENCIA_MAX, Math.max(POTENCIA_MIN, Number(pk?.potencia) || 1)),
    shiny: !!pk?.shiny,
    lendario: ehLendarioOuMitico(esp?.pokeId ?? pk?.speciesId),
    bases,
  }, { limitesRef: true });
  return Math.max(1, Math.round(level * PODER_ESCALA_NIVEL * score));
}










export function percentilQualidade(q) {
  const v = limitar(Number(q) || QUALIDADE_MIN, QUALIDADE_MIN, QUALIDADE_MAX);
  let acumulado = 0;
  for (const b of BANDAS_QUALIDADE) {
    if (v < b.min) break;
    if (v >= b.max) {
      acumulado += b.chance;
      continue;
    }
    acumulado += b.chance * ((v - b.min) / (b.max - b.min));
    break;
  }
  return limitar(acumulado / 100, 0, 1);
}


export const VALOR_POTENCIA = [0.3, 0.65, 0.85, 0.95, 1];


export function percentilPotencia(n) {
  const p = Math.round(limitar(Number(n) || POTENCIA_MIN, POTENCIA_MIN, POTENCIA_MAX));
  return VALOR_POTENCIA[p - 1];
}
