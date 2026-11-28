



































const ORRE_MIN = 13000;
const ORRE_MAX = 14000;


export const nacionalDeOrre = (pokeId) =>
  (pokeId >= ORRE_MIN && pokeId < ORRE_MAX ? pokeId - ORRE_MIN : null);






export function herdarGolpesOrre(lista) {
  const porId = new Map(lista.map((c) => [c.pokeId, c]));
  for (const esp of lista) {
    const baseId = nacionalDeOrre(esp?.pokeId ?? -1);
    if (baseId == null) continue;
    const base = porId.get(baseId);



    if (Array.isArray(base?.attacks)) esp.attacks = base.attacks.map((a) => ({ ...a }));
  }
}
