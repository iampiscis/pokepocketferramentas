





import { NIVEL_ANCORA, ouroDoNivel, xpDoNivel } from './sell-value.mjs';

export const AJUSTE_HUNT_LEVEL = {
  112: 100,
  219: 100,
  13447: 1000,
  13448: 1250,
  297: 700,
  13297: 700,






  235: 30,




  132: 50,





  461: 1500,
  468: 1500,
};


export function aplicarAjustesHuntLevel(obter) {
  for (const [id, nivel] of Object.entries(AJUSTE_HUNT_LEVEL)) {
    const esp = obter(Number(id));
    if (!esp) continue;
    esp.huntLevel = nivel;
    if (nivel <= NIVEL_ANCORA) {
      esp.experience = xpDoNivel(nivel);
      const ouro = ouroDoNivel(nivel);
      esp.sellValue = ouro;
      esp.priceNpc = ouro;
    }
  }
}









export const AJUSTE_TIPOS = {
  448: ['FIGHTING', 'STEEL'],
  13448: ['FIGHTING', 'STEEL'],
};





export function aplicarAjustesTipos(obter) {
  for (const [id, [type1, type2]] of Object.entries(AJUSTE_TIPOS)) {
    for (const esp of obter(Number(id)) ?? []) {
      esp.type1 = type1;
      esp.type2 = type2 ?? null;
    }
  }
}
