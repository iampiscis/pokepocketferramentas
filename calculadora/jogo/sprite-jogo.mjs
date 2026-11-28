import { isOutlandPokeId } from './outland.mjs';
import { isMegaPokeId, looktypeDaMega, megaPorPokeId } from './megas.mjs';


export const LOOKTYPE_NORMAL_BASE = 60000;


export const LOOKTYPE_SEM_ARTE = 1;







export function temSpriteJogo(especie) {
  const lt = especie?.looktype ?? LOOKTYPE_SEM_ARTE;
  if (lt <= LOOKTYPE_SEM_ARTE) return false;
  const id = Number(especie?.pokeId);
  if (!Number.isFinite(id)) return false;




  if (isMegaPokeId(id)) {
    const meta = megaPorPokeId(id);
    return !!meta && lt === looktypeDaMega(meta);
  }
  if (!isOutlandPokeId(id) && id >= 1000 && id < 13000 && lt !== LOOKTYPE_NORMAL_BASE + id) {
    return false;
  }
  return true;
}
