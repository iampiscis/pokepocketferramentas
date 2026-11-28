


















export const TM_ELEMENTAL_POWER = 2800;















export const TM_ELEMENTAL_POWER_PVP = 1800;


export const TM_ELEMENTAL_CD_MS = 60_000;


export const TM_ELEMENTAL_RAIO = 1;



















export const golpeTmElemental = (tipo, fisico = false, { pvp = false } = {}) => ({
  name: `Z-Move ${tipo}`,
  power: pvp === true ? TM_ELEMENTAL_POWER_PVP : TM_ELEMENTAL_POWER,
  type: tipo,
  category: fisico === true ? 'PHYSICAL' : 'SPECIAL',
  cooldownMs: TM_ELEMENTAL_CD_MS,
  tmElemental: true,
});







export const ZMOVE_TROCA_COOLDOWN_MS = 5 * 60_000;





export const zmoveTrocaLiberadaEm = (trocadoEm) => {
  const t = Number(trocadoEm);
  return Number.isFinite(t) && t > 0 ? t + ZMOVE_TROCA_COOLDOWN_MS : 0;
};






export const fisicoDoPedido = (v) => (v === true || v === false ? v : null);
