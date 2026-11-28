




































export const TABULEIRO_MAX = 5;






export const ARENA_TABULEIRO = Object.freeze({
  slug: 'ginasio-duelo',
  mapa: 'cerulean',
  box: Object.freeze([14, -27, 29, 24]),
  groundZ: 7,
});


const GIRO_CX = 29;
const GIRO_CY = 25;


export const girar = (cx, cy) => ({ cx: GIRO_CX - cx, cy: GIRO_CY - cy });





const FILEIRAS = Object.freeze([
  Object.freeze({ cy: 13, de: 12, ate: 17 }),
  Object.freeze({ cy: 14, de: 11, ate: 18 }),
  Object.freeze({ cy: 15, de: 11, ate: 18 }),
  Object.freeze({ cy: 16, de: 13, ate: 16 }),
  Object.freeze({ cy: 17, de: 13, ate: 16 }),
]);


export const FILEIRAS_TABULEIRO = FILEIRAS.length;


const TREINADOR_BAIXO = Object.freeze({ cx: 15, cy: 18 });





export const CASAS_TABULEIRO = Object.freeze((() => {
  const lista = [];
  FILEIRAS.forEach((f, fileira) => {
    for (let cx = f.de; cx <= f.ate; cx++) {
      lista.push(Object.freeze({ casa: lista.length, fileira, coluna: cx - f.de, cx, cy: f.cy }));
    }
  });
  return lista;
})());


export const TOTAL_CASAS = CASAS_TABULEIRO.length;








export const VIDA_TABULEIRO = 1.5;


export const ALCANCE_CORPO = 1;


export const ALCANCE_MAX = 4;


export const ALCANCES_A_DISTANCIA = Object.freeze([2, 3, 4]);


export const CORTE_ALCANCE_3 = 25;


export const CORTE_ALCANCE_4 = 50;


export const ICONE_CORPO = '🗡️';
export const ICONE_DISTANCIA = '🏹';


export function folgaDaEspecie(esp) {
  if (!esp || typeof esp !== 'object') return null;
  const spAtk = Number(esp.baseSpAtk);
  if (!Number.isFinite(spAtk)) return null;
  return spAtk - Math.max(Number(esp.baseAtk) || 0, Number(esp.baseHp) || 0);
}


export function alcanceDaFolga(folga) {
  const f = Number(folga);
  if (folga == null || !Number.isFinite(f) || f <= 0) return ALCANCE_CORPO;
  if (f < CORTE_ALCANCE_3) return 2;
  if (f < CORTE_ALCANCE_4) return 3;
  return ALCANCE_MAX;
}





export const alcanceDaEspecie = (esp) => alcanceDaFolga(folgaDaEspecie(esp));


export function alcanceValido(v) {
  const n = Number(v);
  if (!Number.isInteger(n) || n < ALCANCE_CORPO) return ALCANCE_CORPO;
  return Math.min(n, ALCANCE_MAX);
}


export const ehAtirador = (alcance) => Number(alcance) > ALCANCE_CORPO;


export function textoDoSeloAlcance(alcance) {
  const a = alcanceValido(alcance);
  return a > ALCANCE_CORPO ? `${a}${ICONE_DISTANCIA}` : ICONE_CORPO;
}


export function contarAlcances(alcances) {
  const por = { 1: 0, 2: 0, 3: 0, 4: 0 };
  for (const v of Array.isArray(alcances) ? alcances : []) {
    if (v == null) continue;
    por[alcanceValido(v)]++;
  }
  return { perto: por[1], longe: por[2] + por[3] + por[4], por };
}







const F0 = [2, 3, 1, 4, 0, 5];
const F1 = [9, 10, 8, 11, 7, 12, 6, 13];
const F2_MIOLO = [17, 18, 16, 19];
const F2_LADOS = [15, 20];
const F2_PONTAS = [14, 21];
const F2 = [...F2_MIOLO, ...F2_LADOS, ...F2_PONTAS];
const F3 = [23, 24, 22, 25];
const F4 = [27, 28, 26, 29];
const PRIORIDADE_POR_ALCANCE = Object.freeze({
  1: Object.freeze([...F0, ...F1, ...F2, ...F3, ...F4]),
  2: Object.freeze([...F1, ...F2, ...F0, ...F3, ...F4]),
  3: Object.freeze([...F2_MIOLO, ...F3, ...F2_LADOS, ...F4, ...F2_PONTAS, ...F1, ...F0]),
  4: Object.freeze([...F3, ...F2, ...F4, ...F1, ...F0]),
});


export function casaValida(v) {
  if (typeof v === 'string' && v.trim() !== '') v = Number(v);
  return Number.isInteger(v) && v >= 0 && v < TOTAL_CASAS ? v : null;
}










export function casasDaEquipe(pedidas, alcances = []) {
  const n = Math.min(TABULEIRO_MAX, Array.isArray(pedidas) ? pedidas.length : 0);
  const saida = new Array(n).fill(null);
  const usadas = new Set();
  for (let i = 0; i < n; i++) {
    const c = casaValida(pedidas[i]);
    if (c == null || usadas.has(c)) continue;
    saida[i] = c;
    usadas.add(c);
  }
  for (let i = 0; i < n; i++) {
    if (saida[i] != null) continue;
    const ordem = PRIORIDADE_POR_ALCANCE[alcanceValido(alcances[i])];
    const livre = ordem.find((c) => !usadas.has(c));
    saida[i] = livre;
    usadas.add(livre);
  }
  return saida;
}






export function normalizarMapaDeCasas(bruto, ids) {
  const saida = {};
  if (!bruto || typeof bruto !== 'object' || Array.isArray(bruto)) return saida;
  const usadas = new Set();
  for (const id of (ids ?? []).slice(0, TABULEIRO_MAX)) {
    const chave = String(id);
    if (!Object.prototype.hasOwnProperty.call(bruto, chave)) continue;
    const c = casaValida(bruto[chave]);
    if (c == null || usadas.has(c)) continue;
    usadas.add(c);
    saida[chave] = c;
  }
  return saida;
}


export const casasPedidasDoMapa = (mapa, ids) =>
  (ids ?? []).map((id) => (mapa && Object.prototype.hasOwnProperty.call(mapa, String(id)) ? mapa[String(id)] : null));





export function casaNoMapa(casa, lado = 0) {
  const c = CASAS_TABULEIRO[casaValida(casa) ?? -1];
  if (!c) return null;
  return lado === 1 ? girar(c.cx, c.cy) : { cx: c.cx, cy: c.cy };
}


export function treinadorNoMapa(lado = 0) {
  return lado === 1 ? girar(TREINADOR_BAIXO.cx, TREINADOR_BAIXO.cy) : { cx: TREINADOR_BAIXO.cx, cy: TREINADOR_BAIXO.cy };
}


export function casaDaTile(cx, cy, lado = 0) {
  const p = lado === 1 ? girar(cx, cy) : { cx, cy };
  const c = CASAS_TABULEIRO.find((k) => k.cx === p.cx && k.cy === p.cy);
  return c ? c.casa : null;
}


export function distanciaEntreCasas(a, b) {
  const ca = CASAS_TABULEIRO[casaValida(a) ?? -1];
  const cb = CASAS_TABULEIRO[casaValida(b) ?? -1];
  if (!ca || !cb) return Infinity;
  return Math.max(Math.abs(ca.cx - cb.cx), Math.abs(ca.cy - cb.cy));
}
