






























































import { destinosDeEvolucao } from './evolucoes-ramificadas.mjs';


function basesDe(esp) {
  if (!esp) return null;
  return {
    hp: esp.baseHp, atk: esp.baseAtk, def: esp.baseDef,
    spAtk: esp.baseSpAtk, spDef: esp.baseSpDef, speed: esp.baseSpeed,
  };
}


const MAX_ELOS = 12;




















export function anotarLinhagemDaNota(lista, buscar, elosExtras = []) {


  const paisDe = new Map();
  const ligar = (de, para) => {
    if (!de || !para || de === para) return;
    if (!paisDe.has(para)) paisDe.set(para, new Set());
    paisDe.get(para).add(de);
  };
  for (const esp of lista) {
    if (!esp?.pokeId) continue;
    for (const d of destinosDeEvolucao(esp, buscar)) {
      ligar(esp.pokeId, d.especie?.pokeId);
    }
  }
  for (const [de, para] of elosExtras) ligar(Number(de), Number(para));

  for (const esp of lista) {
    if (!esp?.pokeId) continue;


    const vistos = new Set([esp.pokeId]);
    const anteriores = [];
    let camada = [...(paisDe.get(esp.pokeId) ?? [])];
    for (let passos = 1; passos <= MAX_ELOS && camada.length; passos++) {
      const proxima = [];
      for (const id of camada) {
        if (vistos.has(id)) continue;
        vistos.add(id);
        const bases = basesDe(buscar(id));


        if (bases && Object.values(bases).every((v) => Number.isFinite(Number(v)) && Number(v) > 0)) {
          anteriores.push({ bases, passos });
        }
        for (const pai of paisDe.get(id) ?? []) proxima.push(pai);
      }
      camada = proxima;
    }


    if (anteriores.length) esp.notaAncestrais = anteriores;
    else if (esp.notaAncestrais) delete esp.notaAncestrais;
  }
}
