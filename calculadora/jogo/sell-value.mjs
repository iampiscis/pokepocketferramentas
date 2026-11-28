




export const NIVEL_ANCORA = 150;
export const OURO_ANCORA = 12000;
export const XP_ANCORA = 0.6 * NIVEL_ANCORA ** 2;








export const xpDoNivel = (n) =>
  n <= NIVEL_ANCORA
    ? Math.floor((6 * n * n) / 10) + 8
    : Math.round(XP_ANCORA * (n / NIVEL_ANCORA) ** 1.25);


export const ouroDoNivel = (n) => Math.round(OURO_ANCORA * (n / NIVEL_ANCORA) ** 0.6);


export const TETO_PRICE_NPC_VENDA = 500_000;






















export const OURO_KILL_NIVEL_1 = 36;
export const OURO_KILL_ANCORA_NIVEL = 5_000;
export const OURO_KILL_ANCORA = 6_000;


export const EXPOENTE_OURO_KILL =
  Math.log(OURO_KILL_ANCORA / OURO_KILL_NIVEL_1) / Math.log(OURO_KILL_ANCORA_NIVEL);







export const NIVEL_TETO_OURO = 25_000;


export const TETO_OURO_KILL = Math.round(OURO_KILL_NIVEL_1 * NIVEL_TETO_OURO ** EXPOENTE_OURO_KILL);


export const ouroPorKillDoNivel = (n) =>
  Math.min(
    TETO_OURO_KILL,
    Math.max(1, Math.round(OURO_KILL_NIVEL_1 * Math.max(1, Number(n) || 1) ** EXPOENTE_OURO_KILL)),
  );













export const NIVEL_HUNT_TETO_SELL_POKEMON = 2_500;
export const TETO_SELL_POKEMON = ouroDoNivel(NIVEL_HUNT_TETO_SELL_POKEMON);










export const NIVEL_TETO_VENDA_POKEMON = 100;


export function valorEconomicoDe(esp) {
  if (!esp) return OURO_ANCORA;
  const hl = Math.max(1, esp.huntLevel ?? 1);
  const sell = esp.sellValue ?? 0;
  const npc = esp.priceNpc ?? 0;
  if (sell > 0 && sell <= TETO_PRICE_NPC_VENDA) return sell;
  if (sell > TETO_PRICE_NPC_VENDA) return ouroDoNivel(hl);
  if (npc > 0 && npc <= TETO_PRICE_NPC_VENDA) return npc;
  return ouroDoNivel(hl);
}






export function aplicarEconomiaRegiaoAlta(esp) {
  if (!esp || (esp.huntLevel ?? 0) <= NIVEL_ANCORA) return;
  esp.experience = xpDoNivel(esp.huntLevel);
  const ouro = ouroDoNivel(esp.huntLevel);
  esp.sellValue = ouro;
  esp.priceNpc = ouro;
}



















export const PRECO_NPC_FIXO = new Map([
  [2027, 60_000],
  [2050, 60_000],
  [2006, 32_000],
  [212, 88_000],
  [3212, 88_000],
]);









export function sellValueBaseDe(esp) {
  if (!esp) return Math.min(OURO_ANCORA, TETO_SELL_POKEMON);
  const fixo = PRECO_NPC_FIXO.get(esp.pokeId);
  if (fixo != null) return Math.min(fixo, TETO_SELL_POKEMON);




  const valor = valorEconomicoDe(esp);
  const base = (esp.huntLevel ?? 0) > NIVEL_ANCORA ? Math.min(ouroDoNivel(esp.huntLevel), valor) : valor;
  return Math.min(base, TETO_SELL_POKEMON);
}


export function normalizarSellValue(esp) {
  aplicarEconomiaRegiaoAlta(esp);
  const base = valorEconomicoDe(esp);
  esp.sellValue = base;
  if ((esp.priceNpc ?? 0) > TETO_PRICE_NPC_VENDA) esp.priceNpc = base;
  return base;
}





export function precoVendaPokemon(esp, pk) {
  const base = sellValueBaseDe(esp);
  const nivel = Math.min(pk.level ?? 1, NIVEL_TETO_VENDA_POKEMON);
  const valor = base * (1 + nivel / 50) * (pk.quality ?? 1) * (pk.shiny ? 10 : 1);
  return Math.max(1, Math.floor(valor));
}



















export function especieDaVenda(pk, buscar) {
  const origem = pk?.especieOrigem != null ? buscar(pk.especieOrigem) : null;
  return origem ?? buscar(pk?.speciesId);
}


export function precoVendaDoPokemon(pk, buscar) {
  return precoVendaPokemon(especieDaVenda(pk, buscar), pk);
}
