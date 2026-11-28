






























import { LENDARIO_DEX, MITICO_DEX } from './spawns-filtro.mjs';
import { temSpriteJogo } from './sprite-jogo.mjs';
import { isMegaPokeId, megaPorPokeId, MEGA_POKE_BASE } from './megas.mjs';
import { dexBaseDaForma } from './formas.mjs';


export const MYSTIC_TICKET_ID = 70090;


export const CHANCE_TICKET_PASSO = 0.000005;





export function chanceTicketDoPar(par) {
  const n = Math.max(0, Math.floor(Number(par) || 0));
  return Math.min(1, (n + 1) * CHANCE_TICKET_PASSO);
}







export const NIVEL_LENDARIO_MISTICO = 100;







export function nivelDaLutaMistica(nivelTreinador) {
  return Math.max(1, Math.floor(Number(nivelTreinador) || 1));
}
























export const MISTICO_QUALIDADE_MIN = 1;
export const MISTICO_IV_SOMA_MIN = 111;





export const CAPTURA_MISTICA_POR_BOLA = Object.freeze({
  1: 0.001,
  2: 0.002,
  3: 0.003,
  4: 0.004,
  5: 0.005,
});


export const BOLAS_MISTICAS_DA_MELHOR = Object.freeze([5, 4, 3, 2, 1]);





export function chanceCapturaMistica(ballId, multCaptura = 1) {
  const base = CAPTURA_MISTICA_POR_BOLA[Number(ballId)] ?? 0;
  return Math.min(1, base * Math.max(1, Number(multCaptura) || 1));
}







export const MISTICO_ESCOLHA_MS = 25_000;






export const LENDARIOS_KANTO_JOHTO = Object.freeze([144, 145, 146, 150, 243, 244, 245, 249, 250]);


export const MITICOS_KANTO_JOHTO = Object.freeze([151, 251]);







export const MITICOS_FORA_DO_FILTRO = Object.freeze([494]);


export const DEX_LENDARIO_OU_MITICO = new Set([
  ...LENDARIOS_KANTO_JOHTO, ...MITICOS_KANTO_JOHTO, ...MITICOS_FORA_DO_FILTRO,
  ...LENDARIO_DEX, ...MITICO_DEX,
]);


export const DEX_MITICO = new Set([
  ...MITICOS_KANTO_JOHTO, ...MITICOS_FORA_DO_FILTRO, ...MITICO_DEX,
]);






export const dexNacional = (id) => {
  if (id >= 13000) return id % 1000;
  if (isMegaPokeId(id)) return megaPorPokeId(id)?.dex ?? id - MEGA_POKE_BASE;
  return dexBaseDaForma(id) ?? id;
};










export function ehLendarioOuMitico(pokeId) {
  const id = Number(pokeId);
  return Number.isInteger(id) && id > 0 && DEX_LENDARIO_OU_MITICO.has(dexNacional(id));
}


export function ehMitico(pokeId) {
  const id = Number(pokeId);
  return Number.isInteger(id) && id > 0 && DEX_MITICO.has(dexNacional(id));
}



















export function poolLendariosMisticos(especies) {
  const lista = [];
  for (const e of especies.values()) {
    const id = Number(e?.pokeId);
    if (!Number.isInteger(id) || id < 1 || id >= 2000) continue;
    if (!DEX_LENDARIO_OU_MITICO.has(id)) continue;
    if (!temSpriteJogo(e)) continue;
    lista.push(e);
  }
  return lista.sort((a, b) => a.pokeId - b.pokeId);
}


export function sortearLendarioMistico(pool, aleatorio = Math.random) {
  if (!pool?.length) return null;
  return pool[Math.floor(aleatorio() * pool.length)] ?? pool[pool.length - 1];
}


export const ARENA_MISTICA = 'arena_mistica';
