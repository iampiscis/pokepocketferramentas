
























































import { EXPO_QUALIDADE, multDeNascenca } from './nota-pokemon.mjs';
import { ehLendarioOuMitico } from './mistico.mjs';
import { basesComRefino } from './refino-stats.mjs';
import { efetividade } from './tipo-efetividade.mjs';
import { golpeTmElemental } from './tm-elemental.mjs';
import { normalizarMapaDeCasas } from './pvp-tabuleiro.mjs';


export const TIPOS_GINASIO = [
  'NORMAL', 'FIRE', 'WATER', 'GRASS', 'ELECTRIC', 'ICE', 'FIGHTING', 'POISON', 'GROUND',
  'FLYING', 'PSYCHIC', 'BUG', 'ROCK', 'GHOST', 'DRAGON', 'DARK', 'STEEL', 'FAIRY',
];

const TIPOS_VALIDOS = new Set(TIPOS_GINASIO);


export const iconeDoGinasio = (tipo) => `/img/tipos/${String(tipo).toLowerCase()}.svg`;


export const GINASIO_TIME_MAX = 5;













export const ARENA_NIVEL_CHEIO = 150;


export const ARENA_EXPO_GINASIO = 0.45;


export const ARENA_EXPO_GUERRA = 0.20;


export const GINASIO_NIVEL_MIN = 150;








export const GINASIO_BUFF_PODIO_PCT = Object.freeze([25, 10, 5]);

export const GINASIO_BUFF_PCT = GINASIO_BUFF_PODIO_PCT[0];
export const GINASIO_BUFF_MULT = 1 + GINASIO_BUFF_PCT / 100;






export function segundoETerceiro(times, liderId) {
  const resto = (times ?? []).filter((t) => Number(t.playerId) !== Number(liderId));
  return { segundoId: resto[0]?.playerId ?? null, terceiroId: resto[1]?.playerId ?? null };
}


export const pctDoLugarGinasio = (lugar) => GINASIO_BUFF_PODIO_PCT[Math.floor(Number(lugar)) - 1] ?? 0;

export const multDoLugarGinasio = (lugar) => 1 + pctDoLugarGinasio(lugar) / 100;


export const GINASIO_DESAFIO_COOLDOWN_MS = 24 * 60 * 60 * 1000;


export const SLUG_ARENA_GINASIO = 'ginasio-duelo';


export function tipoDeGinasio(bruto) {
  const t = String(bruto ?? '').toUpperCase();
  return TIPOS_VALIDOS.has(t) ? t : null;
}





export const pokemonDoTipo = (tipos, tipo) =>
  (tipos ?? []).some((x) => String(x).toUpperCase() === String(tipo).toUpperCase());
















export function nivelDeArena(level, expoente) {
  const n = Math.max(1, Math.floor(Number(level) || 1));
  if (n <= ARENA_NIVEL_CHEIO) return n;
  return Math.max(
    ARENA_NIVEL_CHEIO,
    Math.round(ARENA_NIVEL_CHEIO * (n / ARENA_NIVEL_CHEIO) ** expoente),
  );
}


export const nivelNoGinasio = (level) => nivelDeArena(level, ARENA_EXPO_GINASIO);


export const nivelNaGuerra = (level) => nivelDeArena(level, ARENA_EXPO_GUERRA);




























export const hpDeCombateGinasio = (hp) => Math.max(24, Math.round(hp * 12));












export function statsNoNivel(pk, esp, nivelBruto) {
  if (!esp || !pk?.ivs) return null;
  const nivel = Math.max(1, Math.floor(Number(nivelBruto) || 1));
  const mult = multDeNascenca(pk.potencia, pk.shiny, ehLendarioOuMitico(esp?.pokeId));
  const b = basesComRefino(esp, pk.refino);
  const um = (base, iv, k) =>
    Math.round((base + 2 * (iv ?? 1)) * (nivel / 100) * (Math.pow(Number(pk.quality ?? pk.qualidade) || 1, EXPO_QUALIDADE[k]) * mult));
  return {
    hp: um(b.hp, pk.ivs.hp, 'hp'),
    atk: um(b.atk, pk.ivs.atk, 'atk'),
    def: um(b.def, pk.ivs.def, 'def'),
    spAtk: um(b.spAtk, pk.ivs.spAtk, 'spAtk'),
    spDef: um(b.spDef, pk.ivs.spDef, 'spDef'),
    speed: um(b.speed, pk.ivs.speed, 'speed'),
  };
}


export function statsNoGinasio(pk, esp) {
  return statsNoNivel(pk, esp, nivelNoGinasio(pk?.level));
}


const GOLPE_BASICO = { power: 30, cooldownMs: 2000, category: 'PHYSICAL' };









function notaGolpeGinasio(g, nivel, stats, tipos) {
  const atk = g.category === 'SPECIAL' ? stats.spAtk : stats.atk;
  const def = g.category === 'SPECIAL' ? stats.spDef : stats.def;
  const stab = tipos.includes(g.type) ? 1.5 : 1;
  const base = ((2 * nivel) / 5 + 2) * (g.power ?? 0) * (atk / Math.max(1, def)) / 50 + 2;
  return base * stab;
}
























export function melhorGolpeDoGinasio(esp, nivel, stats = null, tmElemental = null, tmFisico = false, { pvp = false } = {}) {
  const golpes = (esp?.attacks ?? []).filter((a) => (a.learnLevel ?? 1) <= nivel);
  if (tmElemental) golpes.push(golpeTmElemental(tmElemental, tmFisico, { pvp }));
  if (!golpes.length) return GOLPE_BASICO;

  if (stats) {
    const tipos = [esp.type1, esp.type2].filter(Boolean);
    let melhor = GOLPE_BASICO;
    let melhorNota = -1;
    for (const g of golpes) {
      const nota = notaGolpeGinasio(g, nivel, stats, tipos);
      if (nota > melhorNota) {
        melhorNota = nota;
        melhor = g;
      }
    }
    return melhor;
  }

  let melhor = GOLPE_BASICO;
  let nota = GOLPE_BASICO.power / GOLPE_BASICO.cooldownMs;
  for (const a of golpes) {
    const n = (a.power ?? 0) / Math.max(1, a.cooldownMs ?? 10_000);
    if (n > nota) {
      nota = n;
      melhor = a;
    }
  }
  return melhor;
}








export function ratingDeCombate(pk, esp) {
  return ratingNoNivel(pk, esp, nivelNoGinasio(pk?.level), true);
}












export const poderNoNivel = (pk, esp, nivel, { pvp = false } = {}) =>
  (esp ? Math.max(1, Math.round(ratingNoNivel(pk, esp, nivel, pvp) / GINASIO_ESCALA_FORCA)) : 1);

function ratingNoNivel(pk, esp, nivelBruto, pvp = false) {
  const st = statsNoNivel(pk, esp, nivelBruto);
  if (!st) return 0;
  const nivel = Math.max(1, Math.floor(Number(nivelBruto) || 1));
  const g = melhorGolpeDoGinasio(esp, nivel, st, pk.tmElemental, pk.tmFisico, { pvp });
  const atk = Math.max(st.atk, st.spAtk);
  const def = (st.def + st.spDef) / 2;
  const dps =
    (((2 * nivel) / 5 + 2) * (g.power ?? GOLPE_BASICO.power) * atk)
    / 50
    / (Math.max(400, g.cooldownMs ?? GOLPE_BASICO.cooldownMs) / 1000);
  return dps * hpDeCombateGinasio(st.hp) * def;
}


export const VARIACAO_DANO_MIN = 0.85;
export const VARIACAO_DANO_MAX = 1.0;


export function metricasDeCombate(pk, esp) {
  const st = statsNoGinasio(pk, esp);
  if (!st) return null;
  const nivel = nivelNoGinasio(pk.level);
  const g = melhorGolpeDoGinasio(esp, nivel, st, pk.tmElemental, pk.tmFisico, { pvp: true });
  const atk = Math.max(st.atk, st.spAtk);
  const def = (st.def + st.spDef) / 2;
  const dps =
    (((2 * nivel) / 5 + 2) * (g.power ?? GOLPE_BASICO.power) * atk)
    / 50
    / (Math.max(400, g.cooldownMs ?? GOLPE_BASICO.cooldownMs) / 1000);
  const ehp = hpDeCombateGinasio(st.hp);
  const rating = dps * ehp * def;
  return {
    dps, ehp, def, rating, golpe: g, stats: st, nivel,
    nivelReal: Math.max(1, Math.floor(Number(pk.level) || 1)),
    tm: pk.tmElemental ?? null,
    golpeDaTm: !!g.tmElemental,
  };
}

const tiposDeEspecie = (esp) => [esp?.type1, esp?.type2].filter(Boolean);


function basicoContra(tipos, tiposDefensor, tabela) {
  for (const tipo of tipos.length ? tipos : ['NORMAL']) {
    if (efetividade(tipo, tiposDefensor[0], tiposDefensor[1], tabela) > 0) {
      return { ...GOLPE_BASICO, type: tipo };
    }
  }
  return null;
}


function notaGolpeComMatchup(g, nivel, stats, tiposAtacante, tiposDefensor, defStats, tabela) {
  const ef = efetividade(g.type, tiposDefensor[0], tiposDefensor[1], tabela);
  if (ef === 0) return -1;
  const stab = tiposAtacante.includes(g.type) ? 1.5 : 1;
  const atk = g.category === 'SPECIAL' ? stats.spAtk : stats.atk;
  const def = defStats
    ? (g.category === 'SPECIAL' ? defStats.spDef : defStats.def)
    : atk;
  const base = ((2 * nivel) / 5 + 2) * (g.power ?? 0) * (atk / Math.max(1, def)) / 50 + 2;
  return base * stab * ef;
}









function melhorGolpeContra(esp, nivel, stats, tiposDefensor, defStats, tabela, tmElemental = null, tmFisico = false) {
  const tipos = tiposDeEspecie(esp);
  const golpes = (esp?.attacks ?? []).filter((a) => (a.learnLevel ?? 1) <= nivel);
  if (tmElemental) golpes.push(golpeTmElemental(tmElemental, tmFisico, { pvp: true }));
  let melhor = null;
  let melhorNota = -1;
  for (const g of golpes) {
    const nota = notaGolpeComMatchup(g, nivel, stats, tipos, tiposDefensor, defStats, tabela);
    if (nota > melhorNota) {
      melhorNota = nota;
      melhor = g;
    }
  }
  if (melhor) return melhor;
  return basicoContra(tipos, tiposDefensor, tabela) ?? GOLPE_BASICO;
}






function metricasDeCombateContra(pk, esp, pkOpp, espOpp, tabela) {
  const st = statsNoGinasio(pk, esp);
  const stOpp = statsNoGinasio(pkOpp, espOpp);
  if (!st || !stOpp) return null;
  const nivel = nivelNoGinasio(pk.level);
  const tiposDef = tiposDeEspecie(espOpp);
  const tiposAtq = tiposDeEspecie(esp);
  const g = melhorGolpeContra(esp, nivel, st, tiposDef, stOpp, tabela, pk.tmElemental, pk.tmFisico);
  const atk = g.category === 'SPECIAL' ? st.spAtk : st.atk;
  const defOpp = g.category === 'SPECIAL' ? stOpp.spDef : stOpp.def;
  const ef = efetividade(g.type, tiposDef[0], tiposDef[1], tabela);
  const stab = tiposAtq.includes(g.type) ? 1.5 : 1;
  const base =
    ((2 * nivel) / 5 + 2) * (g.power ?? GOLPE_BASICO.power) * atk / Math.max(1, defOpp) / 50 + 2;
  const dano = base * stab * Math.max(0, ef);
  const cd = Math.max(400, g.cooldownMs ?? GOLPE_BASICO.cooldownMs) / 1000;
  const dps = dano / cd;
  const ehp = hpDeCombateGinasio(st.hp);
  const defTank = (st.def + st.spDef) / 2;
  const rating = dps * ehp * defTank;
  return {
    dps, ehp, def: defTank, rating, golpe: g, stats: st, nivel,
    nivelReal: Math.max(1, Math.floor(Number(pk.level) || 1)),
    ef, stab: stab > 1,



    tm: pk.tmElemental ?? null,
    golpeDaTm: !!g.tmElemental,
  };
}


function rngDeterministico(seed) {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 0x1_0000_0000;
  };
}










export function compararDuelo1v1(pkA, espA, pkB, espB, { amostras = 400, tabelaTipos = null } = {}) {
  const usaTipos = tabelaTipos && Object.keys(tabelaTipos).length > 0;
  const mA = usaTipos
    ? metricasDeCombateContra(pkA, espA, pkB, espB, tabelaTipos)
    : metricasDeCombate(pkA, espA);
  const mB = usaTipos
    ? metricasDeCombateContra(pkB, espB, pkA, espA, tabelaTipos)
    : metricasDeCombate(pkB, espB);
  if (!mA || !mB) return null;



  const scoreA = (mA, v) => usaTipos ? mA.dps * v * mA.ehp : mA.dps * v * mA.ehp * mA.def;
  const scoreB = (mB, v) => usaTipos ? mB.dps * v * mB.ehp : mB.dps * v * mB.ehp * mB.def;

  const rAmin = scoreA(mA, VARIACAO_DANO_MIN);
  const rAmax = scoreA(mA, VARIACAO_DANO_MAX);
  const rBmin = scoreB(mB, VARIACAO_DANO_MIN);
  const rBmax = scoreB(mB, VARIACAO_DANO_MAX);
  const baseA = scoreA(mA, 1);
  const baseB = scoreB(mB, 1);
  const espelho = Math.abs(baseA - baseB) / Math.max(baseA, baseB, 1) < 1e-6;

  let pctA;
  let pctB;
  if (espelho) {

    pctA = 0.5;
    pctB = 0.5;
  } else {
    const seed = (
      (pkA.speciesId ?? 0) * 997
      + (pkB.speciesId ?? 0) * 991
      + Math.round(mA.rating)
      + Math.round(mB.rating * 3)
    ) >>> 0;
    const rnd = rngDeterministico(seed);
    let vitA = 0;
    for (let i = 0; i < amostras; i++) {
      const vA = VARIACAO_DANO_MIN + rnd() * (VARIACAO_DANO_MAX - VARIACAO_DANO_MIN);
      const vB = VARIACAO_DANO_MIN + rnd() * (VARIACAO_DANO_MAX - VARIACAO_DANO_MIN);
      const rA = scoreA(mA, vA);
      const rB = scoreB(mB, vB);
      if (rA > rB) vitA++;
      else if (rA === rB) vitA += 0.5;
    }
    pctA = vitA / amostras;
    pctB = 1 - pctA;
  }

  let pctMinA = pctA;
  let pctMaxA = pctA;
  if (rAmin > rBmax) { pctMinA = 1; pctMaxA = 1; }
  else if (rAmax < rBmin) { pctMinA = 0; pctMaxA = 0; }
  else {
    pctMinA = Math.min(pctA, rAmin / (rAmin + rBmax));
    pctMaxA = Math.max(pctA, rAmax / (rAmax + rBmin));
  }

  const favorito = mA.rating >= mB.rating ? 'a' : 'b';
  return {
    a: mA,
    b: mB,
    poderA: Math.max(1, Math.round(mA.rating / GINASIO_ESCALA_FORCA)),
    poderB: Math.max(1, Math.round(mB.rating / GINASIO_ESCALA_FORCA)),
    pctA,
    pctB,
    pctMinA: Math.max(0, Math.min(1, pctMinA)),
    pctMaxA: Math.max(0, Math.min(1, pctMaxA)),
    favorito,
    empate: espelho || Math.abs(mA.rating - mB.rating) / Math.max(mA.rating, mB.rating, 1) < 0.015,
  };
}










export const GINASIO_ESCALA_FORCA = 1e7;


export const poderNoGinasio = (pk, esp = null) =>
  esp ? Math.max(1, Math.round(ratingDeCombate(pk, esp) / GINASIO_ESCALA_FORCA)) : 1;


export const poderDoTimeGinasio = (pokemons, esps = null) =>
  (pokemons ?? []).reduce(
    (s, pk) => s + poderNoGinasio(pk, esps?.get?.(pk?.speciesId) ?? null),
    0,
  );

















export const poderNaGuerra = (pk, esp = null) => poderNoNivel(pk, esp, nivelNaGuerra(pk?.level), { pvp: true });










export function motivoForaDoGinasio(pk, tipo, escolhidos = [], emGinasio = null) {
  if (!pk) return 'sumiu';
  if (!pokemonDoTipo(pk.tipos, tipo)) return 'tipo';


  if (outroGinasioDoPokemon(pk, tipo, emGinasio)) return 'outroGinasio';



  if (escolhidos.some((o) => o && o.id !== pk.id && o.speciesId === pk.speciesId)) return 'especie';
  if (escolhidos.some((o) => o && o.id === pk.id)) return 'repetido';
  if (escolhidos.length >= GINASIO_TIME_MAX) return 'cheio';
  return null;
}










export function timeValidoDoGinasio(pokemons, tipo) {
  const ok = [];
  for (const pk of pokemons ?? []) {
    if (!motivoForaDoGinasio(pk, tipo, ok)) ok.push(pk);
  }
  return ok;
}








export function validarTimeGinasio(pokemons, tipo, emGinasio = null) {
  if (!tipoDeGinasio(tipo)) return { ok: false, motivo: 'tipo' };
  const lista = pokemons ?? [];
  if (lista.length > GINASIO_TIME_MAX) return { ok: false, motivo: 'cheio' };
  const ok = [];
  for (const pk of lista) {
    const motivo = motivoForaDoGinasio(pk, tipo, ok, emGinasio);
    if (motivo) {
      return {
        ok: false,
        motivo,
        pk: pk ?? null,
        ...(motivo === 'outroGinasio' ? { outroTipo: outroGinasioDoPokemon(pk, tipo, emGinasio) } : {}),
      };
    }
    ok.push(pk);
  }
  return { ok: true, motivo: null };
}




















const ORDEM_DOS_GINASIOS = new Map(TIPOS_GINASIO.map((t, i) => [t, i]));











export function ginasioDeCadaPokemon(linhas) {
  const melhor = new Map();
  for (const l of linhas ?? []) {
    const tipo = tipoDeGinasio(l?.tipo);
    if (!tipo) continue;
    const dono = Number(l.playerId);
    const em = new Date(l.atualizadoEm ?? 0).getTime() || 0;
    const ordem = ORDEM_DOS_GINASIOS.get(tipo);
    let doDono = melhor.get(dono);
    if (!doDono) melhor.set(dono, (doDono = new Map()));
    for (const bruto of l.ids ?? []) {
      const id = Number(bruto);
      if (!Number.isFinite(id)) continue;
      const atual = doDono.get(id);
      if (!atual || em > atual.em || (em === atual.em && ordem < atual.ordem)) doDono.set(id, { tipo, em, ordem });
    }
  }
  const saida = new Map();
  for (const [dono, doDono] of melhor) saida.set(dono, new Map([...doDono].map(([id, v]) => [id, v.tipo])));
  return saida;
}


export function idsQueContamNoGinasio(linha, ginasioDe) {
  const tipo = tipoDeGinasio(linha?.tipo);
  const doDono = ginasioDe?.get(Number(linha?.playerId));
  if (!tipo || !doDono) return [];
  const saida = [];
  for (const bruto of linha.ids ?? []) {
    const id = Number(bruto);
    if (Number.isFinite(id) && doDono.get(id) === tipo && !saida.includes(id)) saida.push(id);
  }
  return saida;
}

















export function timesQueContam(linhas, porId, ginasioDe = ginasioDeCadaPokemon(linhas)) {
  return (linhas ?? []).map((l) => {
    const dono = Number(l.playerId);
    const candidatos = [];
    for (const id of idsQueContamNoGinasio(l, ginasioDe)) {
      const pk = porId?.get(id);
      if (pk && Number(pk.donoId) === dono) candidatos.push(pk);
    }
    const validos = timeValidoDoGinasio(candidatos, l.tipo);
    const casas = normalizarMapaDeCasas(l.casas, validos.map((pk) => pk.id));

    const pokemons = validos.map((pk) => ({ ...pk, casa: casas[String(pk.id)] ?? null }));
    return { pokemons, casas };
  });
}






export function pokemonEmGinasioDosTimes(times) {
  const saida = {};
  for (const time of times ?? []) {
    const tipo = tipoDeGinasio(time?.tipo);
    if (!tipo) continue;
    for (const pk of time.pokemons ?? []) if (pk?.id != null) saida[String(pk.id)] = tipo;
  }
  return saida;
}






export function outroGinasioDoPokemon(pk, tipo, emGinasio) {
  if (!emGinasio || pk == null) return null;
  const id = typeof pk === 'object' ? pk.id : pk;
  if (id == null) return null;
  const onde = emGinasio instanceof Map
    ? emGinasio.get(id) ?? emGinasio.get(Number(id)) ?? emGinasio.get(String(id))
    : emGinasio[String(id)];
  const outro = tipoDeGinasio(onde);
  return outro && outro !== tipoDeGinasio(tipo) ? outro : null;
}









function lugarNoTipo(podio, tipo) {
  if (podio instanceof Map) return podio.get(tipo);
  if (podio instanceof Set) return podio.has(tipo) ? 1 : undefined;
  if (Array.isArray(podio)) return podio.includes(tipo) ? 1 : undefined;
  return podio[tipo];
}















export function buffGinasioDoPokemon(tiposPokemon, podio) {
  if (!podio || !tiposPokemon?.length) return null;
  let melhor = 0;
  for (const tipo of tiposPokemon) {
    const lugar = Math.floor(Number(lugarNoTipo(podio, String(tipo).toUpperCase())) || 0);
    if (pctDoLugarGinasio(lugar) > 0 && (!melhor || lugar < melhor)) melhor = lugar;
  }
  return melhor ? { lugar: melhor, pct: pctDoLugarGinasio(melhor) } : null;
}






export function multBuffGinasio(tiposPokemon, podio) {
  const b = buffGinasioDoPokemon(tiposPokemon, podio);
  return b ? multDoLugarGinasio(b.lugar) : 1;
}
