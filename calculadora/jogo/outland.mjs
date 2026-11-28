






export const OUTLAND_DEX_BASE = 2001;


export const OUTLAND_POKE_MIN = 2001;


export const OUTLAND_POKE_MAX = 2059;


export const OUTLAND_POKE_LEGADO_MIN = 10501;
export const OUTLAND_POKE_LEGADO_MAX = 10548;


export const OUTLAND_POKE_REMAP_OFFSET = OUTLAND_POKE_LEGADO_MIN - OUTLAND_POKE_MIN;

export function isOutlandPokeId(pokeId) {
  const id = Number(pokeId);
  return id >= OUTLAND_POKE_MIN && id < OUTLAND_POKE_MAX;
}

export function isOutlandPokeIdLegado(pokeId) {
  const id = Number(pokeId);
  return id >= OUTLAND_POKE_LEGADO_MIN && id < OUTLAND_POKE_LEGADO_MAX;
}


export function remapOutlandPokeId(pokeId) {
  const id = Number(pokeId);
  if (!Number.isFinite(id)) return pokeId;
  if (isOutlandPokeIdLegado(id)) return id - OUTLAND_POKE_REMAP_OFFSET;
  return id;
}


export const ESPELHO_FANTASMA_14_MIN = 14000;
export const ESPELHO_FANTASMA_14_MAX = 15000;














export function isEspelhoFantasmaPokeId(pokeId) {
  const id = Number(pokeId);
  return (id >= 10000 && id < OUTLAND_POKE_LEGADO_MIN) || (id >= ESPELHO_FANTASMA_14_MIN && id < ESPELHO_FANTASMA_14_MAX);
}


export function montarOutlandDex(especiesMap) {
  const lista = [...especiesMap.values()]
    .filter((e) => isOutlandPokeId(e.pokeId))
    .sort((a, b) => a.pokeId - b.pokeId);
  const pokeToDex = {};
  const dexToPoke = {};
  for (const e of lista) {
    pokeToDex[e.pokeId] = e.pokeId;
    dexToPoke[e.pokeId] = e.pokeId;
  }
  const total = lista.length;
  return {
    pokeToDex,
    dexToPoke,
    total,
    min: OUTLAND_DEX_BASE,
    max: total ? OUTLAND_DEX_BASE + total - 1 : OUTLAND_DEX_BASE,
  };
}

export function dexChaveOutland(pokeId) {
  return isOutlandPokeId(pokeId) ? pokeId : null;
}


export function montarOutlandDexLegado48(_speciesMap) {
  const dexToPoke = {};
  for (let i = 0; i < 47; i++) {
    dexToPoke[OUTLAND_DEX_BASE + i] = OUTLAND_POKE_LEGADO_MIN + i;
  }
  return dexToPoke;
}


export function aplicarRemapOutlandLista(lista) {
  for (const c of lista) {
    if (isOutlandPokeIdLegado(c.pokeId)) c.pokeId = remapOutlandPokeId(c.pokeId);
    if (c.evolvesToId && isOutlandPokeIdLegado(c.evolvesToId)) {
      c.evolvesToId = remapOutlandPokeId(c.evolvesToId);
    }
  }
}
