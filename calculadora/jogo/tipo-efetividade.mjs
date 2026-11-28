
















export const DIAGONAL_DE_TIPOS = Object.freeze({
  FIRE: 0.5, WATER: 0.5, ELECTRIC: 0.5, GRASS: 0.5, ICE: 0.5, POISON: 0.5, PSYCHIC: 0.5, DARK: 0.5, STEEL: 0.5,
  GHOST: 2, DRAGON: 2,
});


export function multAtaqueContraDefesa(atq, def, linha) {
  const a = String(atq).toUpperCase();
  const d = String(def).toUpperCase();
  if (d === a) return DIAGONAL_DE_TIPOS[a] ?? 1;
  return linha[d] ?? 1;
}


export function efetividade(atq, def1, def2, tabela) {
  const linha = tabela[String(atq).toUpperCase()] ?? {};
  let v = multAtaqueContraDefesa(atq, def1, linha);
  if (def2 && def2 !== def1) v *= multAtaqueContraDefesa(atq, def2, linha);
  return v;
}
