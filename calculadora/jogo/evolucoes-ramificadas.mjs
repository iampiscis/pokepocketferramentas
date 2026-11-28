











































import { LOOKTYPE_SEM_ARTE, temSpriteJogo } from './sprite-jogo.mjs';

export { LOOKTYPE_SEM_ARTE };


export function temArteJogavel(especie) {
  return temSpriteJogo(especie);
}








export const EVOLUCOES_RAMIFICADAS = {

  44: [{ para: 45, nivel: 70 }, { para: 182, nivel: 50 }],

  61: [{ para: 62, nivel: 80 }, { para: 186, nivel: 70 }],

  79: [{ para: 80, nivel: 60 }, { para: 199, nivel: 1_000 }],








  133: [
    { para: 134, nivel: 80, fixo: true },
    { para: 135, nivel: 80, fixo: true },
    { para: 136, nivel: 80, fixo: true },
    { para: 196, nivel: 80, fixo: true },
    { para: 197, nivel: 80, fixo: true },
    { para: 470, nivel: 80, fixo: true },
    { para: 471, nivel: 80, fixo: true },
    { para: 700, nivel: 80, fixo: true },
  ],

  236: [{ para: 237, nivel: 60 }, { para: 106, nivel: 60 }, { para: 107, nivel: 60 }],

  265: [{ para: 266, nivel: 650 }, { para: 268, nivel: 500 }],
  13265: [{ para: 266, nivel: 650 }, { para: 268, nivel: 500 }],

  281: [{ para: 282, nivel: 100 }, { para: 475, nivel: 1_500 }],
  13281: [{ para: 282, nivel: 100 }, { para: 475, nivel: 1_500 }],

  290: [{ para: 291, nivel: 700 }, { para: 292, nivel: 500 }],
  13290: [{ para: 291, nivel: 700 }, { para: 292, nivel: 500 }],

  361: [{ para: 362, nivel: 80 }, { para: 478, nivel: 1_250 }],
  13361: [{ para: 362, nivel: 80 }, { para: 478, nivel: 1_250 }],

  366: [{ para: 367, nivel: 700 }, { para: 368, nivel: 550 }],
  13366: [{ para: 367, nivel: 700 }, { para: 368, nivel: 550 }],



  412: [
    { para: 413, nivel: 2_000 },
    { para: 414, nivel: 1_250 },
    { para: 8413, nivel: 2_000 },
    { para: 9413, nivel: 2_000 },
  ],













  25: [{ para: 26, nivel: 80 }, { para: 4026, nivel: 43_100 }],

  102: [{ para: 103, nivel: 100 }, { para: 4103, nivel: 34_650 }],

  104: [{ para: 105, nivel: 50 }, { para: 4105, nivel: 34_650 }],

  109: [{ para: 110, nivel: 60 }, { para: 5110, nivel: 69_300 }],

  439: [{ para: 122, nivel: 80 }, { para: 5122, nivel: 64_000 }],

  156: [{ para: 157, nivel: 80 }, { para: 6157, nivel: 86_150 }],

  502: [{ para: 503, nivel: 100 }, { para: 6503, nivel: 86_150 }],

  548: [{ para: 549, nivel: 100 }, { para: 6549, nivel: 69_300 }],

  627: [{ para: 628, nivel: 100 }, { para: 6628, nivel: 69_300 }],

  704: [{ para: 705, nivel: 40 }, { para: 6705, nivel: 64_000 }],

  712: [{ para: 713, nivel: 100 }, { para: 6713, nivel: 69_300 }],

  723: [{ para: 724, nivel: 100 }, { para: 6724, nivel: 86_150 }],

  744: [{ para: 745, nivel: 34_650 }, { para: 8745, nivel: 34_650 }, { para: 9745, nivel: 34_650 }],

  550: [{ para: 902, nivel: 69_300 }, { para: 8902, nivel: 69_300 }],

  5079: [{ para: 5080, nivel: 69_300 }, { para: 5199, nivel: 69_300 }],








  123: [{ para: 212, nivel: 80 }, { para: 900, nivel: 27_500 }],

  790: [{ para: 791, nivel: 7_500 }, { para: 792, nivel: 7_500 }],

  840: [{ para: 841, nivel: 30_450 }, { para: 842, nivel: 26_150 }, { para: 1011, nivel: 40_000 }],


  646: [{ para: 8646, nivel: 8_600 }, { para: 9646, nivel: 8_600 }],








  935: [{ para: 936, nivel: 120_550 }, { para: 937, nivel: 120_550 }],


  898: [{ para: 8898, nivel: 64_950 }, { para: 9898, nivel: 64_950 }],


  1017: [{ para: 9017, nivel: 160_300 }, { para: 8017, nivel: 160_300 }, { para: 12017, nivel: 160_300 }],














  217: [{ para: 901, nivel: 46_150 }, { para: 8901, nivel: 160_300 }],

  680: [{ para: 681, nivel: 16_000 }, { para: 8681, nivel: 21_200 }],










  800: [{ para: 8800, nivel: 35_150 }, { para: 9800, nivel: 35_150 }],
};




































export const TIPO_DA_PEDRA_POR_ESPECIE = {
  16: 'FLYING',
  17: 'FLYING',
  21: 'FLYING',
  163: 'FLYING',
  276: 'FLYING',
  13276: 'FLYING',
  333: 'FLYING',
  13333: 'FLYING',
  396: 'FLYING',
  397: 'FLYING',
  627: 'FLYING',
  661: 'FLYING',
  731: 'FLYING',
  732: 'FLYING',
};
















export function tipoDaPedraDeEvolucao(base, destino = null) {
  if (!base) return null;
  const forcado = TIPO_DA_PEDRA_POR_ESPECIE[base.pokeId];
  if (forcado) return forcado;
  if (destino?.type1 && EVOLUCOES_RAMIFICADAS[base.pokeId]) return destino.type1;
  return base.type1 ?? null;
}












export function destinosDeEvolucao(especie, buscar) {
  if (!especie) return [];
  const saida = [];
  const juntar = (pokeId, nivel) => {
    if (!pokeId || saida.some((d) => d.pokeId === pokeId)) return;
    const alvo = buscar(pokeId);
    if (!alvo) return;
    saida.push({ pokeId, nivel: nivel ?? 0, especie: alvo, temArte: temArteJogavel(alvo) });
  };

  const familia = EVOLUCOES_RAMIFICADAS[especie.pokeId];
  if (familia) {
    for (const r of familia) juntar(r.para, r.nivel);


    juntar(especie.evolvesToId, especie.evolveLevel);
  } else {
    juntar(especie.evolvesToId, especie.evolveLevel);
  }
  return saida;
}





export function evolucoesFinais(especie, buscar) {
  if (!especie) return [];
  const finais = new Map();

  const dfs = (esp, ehRaiz) => {
    const proximos = destinosDeEvolucao(esp, buscar).filter((d) => d.temArte);
    if (proximos.length === 0) {
      if (!ehRaiz) finais.set(esp.pokeId, esp);
      return;
    }
    for (const d of proximos) dfs(d.especie, false);
  };

  dfs(especie, true);
  return [...finais.values()];
}








export function alinharNivelPadraoRamificado(lista) {
  let ajustados = 0;
  for (const c of lista) {
    const familia = EVOLUCOES_RAMIFICADAS[c.pokeId];
    if (!familia?.length) continue;
    const padrao = familia.find((r) => r.para === c.evolvesToId) ?? familia[0];
    if (c.evolveLevel === padrao.nivel) continue;
    c.evolveLevel = padrao.nivel;
    ajustados++;
  }
  return ajustados;
}
