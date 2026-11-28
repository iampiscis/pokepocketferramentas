




























export const PODER_MINIMO = 15;


const PODER_JOELHO = 100;


export const COOLDOWN_600_MS = 60_000;












export const COOLDOWN_MEGA_MS = 30_000;


export function poderNormalizado(power) {
  const p = Number(power);
  return Number.isFinite(p) && p > PODER_MINIMO ? p : PODER_MINIMO;
}





export function cooldownDoPoder(power) {
  const p = poderNormalizado(power);
  const seg = p <= PODER_JOELHO
    ? 10 + ((p - PODER_MINIMO) * 20) / (PODER_JOELHO - PODER_MINIMO)
    : 30 + ((p - PODER_JOELHO) * 30) / (600 - PODER_JOELHO);
  return Math.round(seg * 10) * 100;
}





export function aplicarCurvaNoGolpe(a) {
  if (!a) return false;
  const poder = poderNormalizado(a.power);
  const cd = cooldownDoPoder(poder);
  if (a.power === poder && a.cooldownMs === cd) return false;
  a.power = poder;
  a.cooldownMs = cd;
  return true;
}






















export const SPEED_POTENCIAL_TETO_PCT = 7;


const SPEED_JOELHO = 120;


const ivDoSpeed = (iv) => Math.min(32, Math.max(1, Math.round(Number(iv) || 1)));


export function potencialDoSpeed(speedBase) {
  const s = Math.max(0, Number(speedBase) || 0);
  const pct = s <= SPEED_JOELHO ? s / 20 : 6 + (s - SPEED_JOELHO) / 40;
  return Math.min(SPEED_POTENCIAL_TETO_PCT, pct);
}


export function descontoDoSpeedPct(speedBase, ivSpeed) {
  return potencialDoSpeed(speedBase) * (ivDoSpeed(ivSpeed) / 32);
}


export function cooldownGolpeComSpeed(cooldownMs, speedBase, ivSpeed) {
  const base = Math.max(0, Number(cooldownMs) || 0);
  if (base <= 0) return base;
  return Math.round(base * (1 - descontoDoSpeedPct(speedBase, ivSpeed) / 100));
}
