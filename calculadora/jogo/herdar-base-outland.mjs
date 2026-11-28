import { isOutlandPokeId } from './outland.mjs';
import { dexSpriteBaseOutland } from './outland-sprite-dex.mjs';
import { golpesDaPlanilhaDoOutland, golpesDoOutlandFechados } from './golpes-planilhas.mjs';

const CAMPOS_STAT = ['baseHp', 'baseAtk', 'baseDef', 'baseSpAtk', 'baseSpDef', 'baseSpeed'];























export function herdarBaseOutland(lista) {
  const porId = new Map(lista.map((c) => [c.pokeId, c]));
  for (const esp of lista) {
    if (!isOutlandPokeId(esp.pokeId)) continue;
    const proprios = golpesDaPlanilhaDoOutland(esp.pokeId);
    if (proprios) esp.attacks = proprios;
    if (golpesDoOutlandFechados(esp.pokeId)) esp.golpesFechados = true;
    const baseDex = dexSpriteBaseOutland(esp.pokeId, esp.name);
    if (baseDex == null) continue;
    const base = porId.get(baseDex);
    if (!base) continue;
    for (const k of CAMPOS_STAT) {
      if (typeof base[k] === 'number') esp[k] = base[k];
    }
    if (!proprios && Array.isArray(base.attacks)) {
      esp.attacks = base.attacks.map((a) => ({ ...a }));


      if (base.golpesFechados) esp.golpesFechados = true;
    }
  }
}
