











































import { destinosDeEvolucao, EVOLUCOES_RAMIFICADAS } from './evolucoes-ramificadas.mjs';
import { dexDe } from './escala-hunt-level.mjs';
import { isOutlandPokeId } from './outland.mjs';








export const TETO_CAPTURA_MAX = 100;









export const ESCADA_TETO_CAPTURA = {
  1: [100],
  2: [40, 100],
  3: [20, 40, 100],
  4: [20, 40, 70, 100],
};


const PASSAGENS_MAX = 8;


export function escadaDeElos(elos) {
  const n = Math.min(Math.max(Math.floor(Number(elos) || 1), 1), 4);
  return ESCADA_TETO_CAPTURA[n] ?? ESCADA_TETO_CAPTURA[4];
}














export function montarEstagiosEvolutivos(lista, buscar) {
  const especies = [...lista];
  const saidaDe = new Map();
  const entradaDe = new Map();

  for (const c of especies) {
    if (!c?.pokeId) continue;
    const destinos = new Set();
    for (const d of destinosDeEvolucao(c, buscar)) {
      if (!d.pokeId || d.pokeId === c.pokeId) continue;
      destinos.add(d.pokeId);
      if (!entradaDe.has(d.pokeId)) entradaDe.set(d.pokeId, new Set());
      entradaDe.get(d.pokeId).add(c.pokeId);
    }
    saidaDe.set(c.pokeId, destinos);
  }


  const alturas = (arestas) => {
    const h = new Map();
    for (const id of saidaDe.keys()) h.set(id, 0);
    for (let passagem = 0; passagem < PASSAGENS_MAX; passagem++) {
      let mudou = false;
      for (const [id, vizinhos] of arestas) {
        const base = h.get(id) ?? 0;
        for (const v of vizinhos) {
          if (base + 1 > (h.get(v) ?? 0)) {
            h.set(v, base + 1);
            mudou = true;
          }
        }
      }
      if (!mudou) break;
    }
    return h;
  };

  const atras = alturas(saidaDe);
  const frente = alturas(entradaDe);

  const out = new Map();
  for (const id of saidaDe.keys()) {
    const e = atras.get(id) ?? 0;
    const f = frente.get(id) ?? 0;
    out.set(id, { estagio: e, elos: e + f + 1 });
  }
  return out;
}


export function tetoDeCaptura(pokeId, estagios) {
  const info = estagios?.get?.(pokeId);
  if (!info) return TETO_CAPTURA_MAX;
  const escada = escadaDeElos(info.elos);
  return escada[Math.min(info.estagio, escada.length - 1)];
}








export function nivelDeCaptura(nivelSelvagem, teto) {
  const n = Math.max(1, Math.floor(Number(nivelSelvagem) || 1));
  if (n <= TETO_CAPTURA_MAX) return n;
  const t = Math.max(1, Math.floor(Number(teto) || TETO_CAPTURA_MAX));
  return Math.min(n, t);
}









export function ehOutlandOuAcima(pokeId) {
  if (isOutlandPokeId(pokeId)) return true;
  const dex = dexDe(pokeId);
  return Number.isFinite(dex) && dex >= 252;
}










function precisaDescer(destinoId, nivelAtual) {
  return ehOutlandOuAcima(destinoId) || (Number(nivelAtual) || 0) > TETO_CAPTURA_MAX;
}














export function aplicarTetoDeCaptura(lista, buscar) {
  const especies = [...lista];
  const estagios = montarEstagiosEvolutivos(especies, buscar);

  for (const c of especies) {
    if (!c?.pokeId) continue;
    c.tetoCaptura = tetoDeCaptura(c.pokeId, estagios);
  }

  let elosAjustados = 0;
  let ramosAjustados = 0;

  for (const c of especies) {
    if (!c?.pokeId || !c.evolvesToId || c.evolvesToId <= 0) continue;
    if (!precisaDescer(c.evolvesToId, c.evolveLevel)) continue;
    const novo = tetoDeCaptura(c.evolvesToId, estagios);
    if (c.evolveLevel === novo) continue;
    c.evolveLevel = novo;
    elosAjustados++;
  }

  for (const familia of Object.values(EVOLUCOES_RAMIFICADAS)) {
    for (const r of familia) {


      if (r.fixo) continue;
      if (!precisaDescer(r.para, r.nivel)) continue;
      const novo = tetoDeCaptura(r.para, estagios);
      if (r.nivel === novo) continue;
      r.nivel = novo;
      ramosAjustados++;
    }
  }

  return { estagios, elosAjustados, ramosAjustados };
}
