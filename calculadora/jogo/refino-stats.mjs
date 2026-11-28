































































export const STATS_REFINAVEIS = ['hp', 'atk', 'def', 'spAtk', 'spDef'];


export const CAMPO_BASE = {
  hp: 'baseHp',
  atk: 'baseAtk',
  def: 'baseDef',
  spAtk: 'baseSpAtk',
  spDef: 'baseSpDef',
  speed: 'baseSpeed',
};


export const REFINO_CUSTO_BASE = 500;


export const REFINO_EXPOENTE = 3;







export const REFINO_TETO_TECNICO = 9999;


export const REFINO_PASSO = 1;

const inteiro = (v) => {
  const n = Math.floor(Number(v) || 0);
  return n > 0 ? Math.min(REFINO_TETO_TECNICO, n) : 0;
};








export function normalizarRefino(bruto) {
  const cru = typeof bruto === 'string' ? seguroJson(bruto) : bruto;
  const out = {};
  for (const k of STATS_REFINAVEIS) out[k] = inteiro(cru?.[k]);
  return out;
}

function seguroJson(txt) {
  try {
    return JSON.parse(txt);
  } catch {
    return null;
  }
}









export function compactarRefino(bonus) {
  const b = normalizarRefino(bonus);
  const out = {};
  for (const k of STATS_REFINAVEIS) if (b[k] > 0) out[k] = b[k];
  return out;
}


export const totalDoRefino = (bonus) =>
  STATS_REFINAVEIS.reduce((s, k) => s + inteiro(bonus?.[k]), 0);


export const temRefino = (bonus) => totalDoRefino(bonus) > 0;








export const custoTotalDoRefino = (nivel) =>
  REFINO_CUSTO_BASE * inteiro(nivel) ** REFINO_EXPOENTE;







export const custoDoRefino = (nivelAtual) => {
  const n = inteiro(nivelAtual);
  return REFINO_CUSTO_BASE * (3 * n * n + 3 * n + 1);
};


export const refinoNoTeto = (nivelAtual) => inteiro(nivelAtual) >= REFINO_TETO_TECNICO;


export const investidoNoRefino = (bonus) => {
  const b = normalizarRefino(bonus);
  return STATS_REFINAVEIS.reduce((s, k) => s + custoTotalDoRefino(b[k]), 0);
};







export function basesComRefino(especie, bonus) {
  const b = normalizarRefino(bonus);
  return {
    hp: (especie?.baseHp ?? 0) + b.hp * REFINO_PASSO,
    atk: (especie?.baseAtk ?? 0) + b.atk * REFINO_PASSO,
    def: (especie?.baseDef ?? 0) + b.def * REFINO_PASSO,
    spAtk: (especie?.baseSpAtk ?? 0) + b.spAtk * REFINO_PASSO,
    spDef: (especie?.baseSpDef ?? 0) + b.spDef * REFINO_PASSO,
    speed: especie?.baseSpeed ?? 0,
  };
}

