



































import { FUSO_BRASILIA_MS } from './fuso-brasilia.mjs';

export const PVP_PONTOS_INICIAIS = 0;













export const PVP_TETO_POSICIONAMENTO = 299;


export const PVP_PONTOS_MIN = 0;


export const PVP_PONTOS_POR_DIVISAO = 100;






























export const PVP_TIERS = [
  { id: 'bronze', divisoes: 3, de: 0 },
  { id: 'prata', divisoes: 3, de: 300 },
  { id: 'ouro', divisoes: 3, de: 600 },
  { id: 'platina', divisoes: 3, de: 900 },
  { id: 'diamante', divisoes: 3, de: 1200 },


  { id: 'mestre', divisoes: 1, de: 1500, vagas: 500 },
  { id: 'graomestre', divisoes: 1, de: 1500, vagas: 250 },
  { id: 'challenger', divisoes: 1, de: 1500, vagas: 100 },
];


export const PVP_PR_ELITE = 1500;


export const PVP_VAGAS_CHALLENGER = 100;


export const PVP_VAGAS_GRAO_MESTRE = 250;


export const PVP_VAGAS_MESTRE = 500;


export const TIERS_DE_ELITE = Object.freeze(['mestre', 'graomestre', 'challenger']);


export const ehTierDeElite = (tierId) => TIERS_DE_ELITE.includes(tierId);


export const iconeDoRank = (tierId) => `/img/ranks/${tierId}.webp`;







export const PVP_TABELA_LINHAS = 1000;
export const PVP_TABELA_POR_PAGINA = 100;
export const PVP_TABELA_PAGINAS = Math.ceil(PVP_TABELA_LINHAS / PVP_TABELA_POR_PAGINA);


export function paginaDaPosicao(posicao) {
  const pos = Math.floor(Number(posicao) || 0);
  return pos >= 1 && pos <= PVP_TABELA_LINHAS ? Math.ceil(pos / PVP_TABELA_POR_PAGINA) : null;
}










export const PVP_NIVEL_MIN = 150;


export const PVP_TIME_MAX = 5;


export const PVP_TIME_MIN = 1;













export const PVP_PARTIDAS_POSICIONAMENTO = 5;


export const PVP_ESCUDO_TIER = 1;
































export const PVP_ATRITO_DERROTA = 0.7;








export const PVP_ENTRE_PARTIDAS_MS = 20_000;




































export const PVP_DECAIMENTO_HORAS = 24;
export const PVP_DECAIMENTO_MS = PVP_DECAIMENTO_HORAS * 60 * 60_000;








export const PVP_RETENCAO_PARTIDAS_DIAS = 30;










export const PVP_PODA_PARTIDAS_DIAS = 14;













export const PVP_HISTORICO_PARTIDAS = 20;







export const PVP_HISTORICO_JOGO = 12;


export const PVP_PR_DIAMANTE = PVP_TIERS.find((x) => x.id === 'diamante').de;




















export function pontosAposDecaimento(topoDiamante, degrau = 1) {
  const base = Math.max(PVP_PR_DIAMANTE - 1, Math.floor(Number(topoDiamante) || 0));
  const passo = Math.max(1, Math.floor(Number(degrau) || 1));
  return Math.min(PVP_PR_ELITE - 1, base + passo);
}








export function decaiEm(ultimaEm, tierId) {
  if (!ehTierDeElite(tierId)) return null;
  if (ultimaEm == null) return null;
  const t = ultimaEm instanceof Date ? ultimaEm.getTime() : Number(new Date(ultimaEm));
  return Number.isFinite(t) ? t + PVP_DECAIMENTO_MS : null;
}






export const PVP_POSICOES_PREMIADAS = 100;











export const PVP_PREMIO_CORTE_TOP20 = 20;
export const PVP_PREMIO_CORTE_TOP50 = 50;



















export const PVP_PREMIOS = [
  { ate: 1, faixa: 'campeao', horas: { shiny: 72, captura: 72, xp: 72, pokexp: 72 }, diamantes: 300 },
  { ate: 3, faixa: 'podio', horas: { shiny: 48, captura: 48, xp: 48, pokexp: 48 }, diamantes: 200 },
  { ate: 10, faixa: 'top10', horas: { shiny: 24, captura: 24, xp: 24, pokexp: 24 }, diamantes: 100 },
  { ate: PVP_PREMIO_CORTE_TOP20, faixa: 'challenger', horas: { shiny: 18, captura: 18, xp: 18, pokexp: 18 }, diamantes: 50 },
  { ate: PVP_PREMIO_CORTE_TOP50, faixa: 'mestre', horas: { xp: 18, pokexp: 18 }, diamantes: 25 },
  { ate: PVP_POSICOES_PREMIADAS, faixa: 'top100', horas: { xp: 12, pokexp: 12 }, diamantes: 0 },
];


export function premioDaPosicao(posicao) {
  const pos = Math.floor(Number(posicao) || 0);
  if (pos < 1) return null;
  return PVP_PREMIOS.find((f) => pos <= f.ate) ?? null;
}



















export const PVP_OVOS_TOP = Object.freeze({ p4: 2 });
export const PVP_OVOS_POR_TIER = Object.freeze({
  prata: Object.freeze({ p2: 1 }),
  ouro: Object.freeze({ p2: 2 }),
  platina: Object.freeze({ p2: 2, p3: 1 }),
  diamante: Object.freeze({ p2: 1, p3: 2 }),
  mestre: Object.freeze({ p3: 1, p4: 1 }),
  graomestre: Object.freeze({ p3: 2, p4: 1 }),
});


export const PVP_PR_MIN_OVOS = PVP_TIERS.find((x) => x.id === 'prata').de;





export const PVP_FAIXA_OVOS = 'ovos';





export function ovosDoTier(tierId) {
  return PVP_OVOS_POR_TIER[tierId] ?? null;
}







export function ovosDaVirada(posicao, tierId) {
  const pos = Math.floor(Number(posicao) || 0);
  if (pos >= 1 && pos <= PVP_POSICOES_PREMIADAS) return PVP_OVOS_TOP;
  if (ehTierDeElite(tierId) && (pos < 1 || tierId === 'challenger')) return PVP_OVOS_POR_TIER.diamante;
  return ovosDoTier(tierId);
}









export const PVP_FUSO_VIRADA_MS = FUSO_BRASILIA_MS;

const SEMANA_MS = 7 * 24 * 60 * 60_000;





export const TEMPORADA_SEMANAL_RE = /^\d{4}-\d{2}-\d{2}$/;










export function ehChaveDeTemporada(chave) {
  const s = String(chave ?? '').trim();
  if (!TEMPORADA_SEMANAL_RE.test(s)) return false;
  const dia = new Date(`${s}T12:00:00Z`);
  if (!Number.isFinite(dia.getTime()) || dia.toISOString().slice(0, 10) !== s) return false;
  return dia.getUTCDay() === 0 || dia.getUTCDay() === 1;
}









export function temporadaDe(agora) {
  const brasilia = new Date(Number(agora) - PVP_FUSO_VIRADA_MS);
  const desdeDomingo = brasilia.getUTCDay();
  return new Date(Date.UTC(
    brasilia.getUTCFullYear(), brasilia.getUTCMonth(), brasilia.getUTCDate() - desdeDomingo,
  )).toISOString().slice(0, 10);
}








export const inicioDaTemporada = (competencia) =>
  Date.parse(`${competencia}T00:00:00Z`) + PVP_FUSO_VIRADA_MS;


export const fimDaTemporada = (competencia) => inicioDaTemporada(competencia) + SEMANA_MS;


export function temporadaAnterior(competencia) {
  return new Date(Date.parse(`${competencia}T00:00:00Z`) - SEMANA_MS).toISOString().slice(0, 10);
}









export function vagaDecaiu(ultimaEm, agora = Date.now()) {
  if (ultimaEm == null) return false;
  const t = ultimaEm instanceof Date ? ultimaEm.getTime() : Number(new Date(ultimaEm));
  if (!Number.isFinite(t)) return false;
  return agora - t >= PVP_DECAIMENTO_MS;
}



const NUM_DIVISAO = ['I', 'II', 'III'];












function idxDoTier(pontos) {
  if (pontos >= PVP_PR_ELITE) return PVP_TIERS.findIndex((x) => x.id === 'mestre');
  let i = 0;
  for (let k = 0; k < PVP_TIERS.length; k++) if (pontos >= PVP_TIERS[k].de) i = k;
  return i;
}



















export function rankDePontos(pontosBruto) {
  const pontos = Math.max(PVP_PONTOS_MIN, Math.round(Number(pontosBruto) || 0));
  const idx = idxDoTier(pontos);
  const tier = PVP_TIERS[idx];

  if (tier.divisoes === 1) {
    return {
      pontos,
      tierId: 'mestre',
      tierIdx: PVP_TIERS.findIndex((x) => x.id === 'mestre'),
      divisao: 0,
      divisaoNum: '',
      rotulo: 'mestre',
      de: PVP_PR_ELITE,
      ate: Infinity,
      aberto: true,
      naFaixa: pontos - PVP_PR_ELITE,
      larguraFaixa: null,
      progresso: null,
      icone: iconeDoRank('mestre'),
    };
  }

  const dentro = Math.min(
    tier.divisoes - 1,
    Math.floor((pontos - tier.de) / PVP_PONTOS_POR_DIVISAO),
  );
  const de = tier.de + dentro * PVP_PONTOS_POR_DIVISAO;

  const divisao = dentro + 1;
  return {
    pontos,
    tierId: tier.id,
    tierIdx: idx,
    divisao,
    divisaoNum: NUM_DIVISAO[divisao - 1] ?? String(divisao),
    rotulo: `${tier.id} ${NUM_DIVISAO[divisao - 1] ?? divisao}`,
    de,
    ate: de + PVP_PONTOS_POR_DIVISAO,
    aberto: false,
    naFaixa: pontos - de,
    larguraFaixa: PVP_PONTOS_POR_DIVISAO,
    progresso: (pontos - de) / PVP_PONTOS_POR_DIVISAO,
    icone: iconeDoRank(tier.id),
  };
}
































export function rankComVaga(pontosBruto, posicao, { inativo = false } = {}) {
  const base = rankDePontos(pontosBruto);
  if (base.pontos < PVP_PR_ELITE) return base;

  const pos = inativo ? 0 : Number(posicao) || 0;
  if (pos > 0 && pos <= PVP_VAGAS_CHALLENGER) {
    return { ...base, tierId: 'challenger', rotulo: 'challenger', icone: iconeDoRank('challenger'), posicao: pos };
  }
  if (pos > 0 && pos <= PVP_VAGAS_GRAO_MESTRE) {
    return {
      ...base,
      tierId: 'graomestre',
      rotulo: 'graomestre',
      icone: iconeDoRank('graomestre'),
      posicao: pos,
    };
  }
  if (pos > 0 && pos <= PVP_VAGAS_MESTRE) {
    return { ...base, posicao: pos };
  }



  const diamante = PVP_TIERS.find((x) => x.id === 'diamante');
  const topo = diamante.divisoes;
  const deTopo = diamante.de + (topo - 1) * PVP_PONTOS_POR_DIVISAO;
  return {
    ...base,
    tierId: 'diamante',
    tierIdx: PVP_TIERS.findIndex((x) => x.id === 'diamante'),
    divisao: topo,
    divisaoNum: NUM_DIVISAO[topo - 1],
    rotulo: `diamante ${NUM_DIVISAO[topo - 1]}`,
    de: deTopo,
    ate: PVP_PR_ELITE,
    aberto: false,
    naFaixa: PVP_PONTOS_POR_DIVISAO,
    larguraFaixa: PVP_PONTOS_POR_DIVISAO,
    progresso: 1,
    icone: iconeDoRank('diamante'),
    posicao: pos || null,
    aguardandoVaga: true,



    vagaDecaiu: !!inativo,
    faltamPosicoes: pos > 0 ? Math.max(1, pos - PVP_VAGAS_MESTRE) : null,
  };
}


export const emPosicionamento = (partidas) =>
  (Number(partidas) || 0) < PVP_PARTIDAS_POSICIONAMENTO;











const K_POR_TIER = {
  bronze: 32, prata: 32, ouro: 26, platina: 26, diamante: 22, mestre: 18, graomestre: 18, challenger: 18,
};

export const kDoTier = (tierId) => K_POR_TIER[tierId] ?? 32;








export const expectativa = (pontosA, pontosB) => 1 / (1 + 10 ** ((pontosB - pontosA) / 400));

































export function deltaDaPartida(a, b, venceuA, peso = 1) {
  const pa = Math.max(PVP_PONTOS_MIN, Number(a.pontos) || 0);
  const pb = Math.max(PVP_PONTOS_MIN, Number(b.pontos) || 0);
  const kBase = Math.min(kDoTier(rankDePontos(pa).tierId), kDoTier(rankDePontos(pb).tierId));
  const ka = kBase * peso;
  const kb = kBase * peso;

  const ea = expectativa(pa, pb);
  const sa = venceuA ? 1 : 0;








  const zerado = peso <= 0;
  const passo = (k, s, e) => {
    if (zerado) return 0;

    const bruto = k * (s - e) * (s > e ? 1 : PVP_ATRITO_DERROTA);
    if (bruto === 0) return s > e ? 1 : -1;
    const arred = Math.round(bruto);
    if (arred !== 0) return arred;
    return bruto > 0 ? 1 : -1;
  };

  return {
    deltaA: passo(ka, sa, ea),
    deltaB: passo(kb, 1 - sa, 1 - ea),
  };
}

















export function aplicarDelta(linha, delta) {
  const antes = Math.max(PVP_PONTOS_MIN, Math.round(Number(linha.pontos) || 0));









  const noPosicionamento = Number.isFinite(Number(linha.partidas))
    && emPosicionamento(linha.partidas);
  const tierAntes = idxDoTier(antes);
  let escudo = Math.max(0, Math.floor(Number(linha.escudo) || 0));



  let tierTopo = Math.max(0, Math.floor(Number(linha.tierTopo) || 0));

  let depois = Math.max(PVP_PONTOS_MIN, antes + Math.round(delta));





  if (noPosicionamento) depois = Math.min(depois, Math.max(PVP_TETO_POSICIONAMENTO, antes));
  let escudoUsou = false;

  if (delta < 0 && idxDoTier(depois) < tierAntes && escudo > 0) {
    depois = PVP_TIERS[tierAntes].de;
    escudo -= 1;
    escudoUsou = true;
  }

  const tierDepois = idxDoTier(depois);
  const promoveu = tierDepois > tierAntes;
  const rebaixou = tierDepois < tierAntes;


  if (promoveu && tierDepois > tierTopo) {
    tierTopo = tierDepois;
    escudo = PVP_ESCUDO_TIER;
  }

  return {
    pontos: depois,
    escudo,
    tierTopo,
    deltaAplicado: depois - antes,
    escudoUsou,
    promoveu,
    rebaixou,
  };
}





























const MIN = 60_000;
const HORA = 60 * MIN;

export const PVP_DEGRAUS_JANELA = [
  [0, 25],
  [2 * MIN, 50],
  [5 * MIN, 100],
  [15 * MIN, 150],
  [30 * MIN, 250],
  [1 * HORA, 400],
  [2 * HORA, 600],
  [4 * HORA, 1000],
  [6 * HORA, Infinity],
];


export function janelaDeBusca(esperaMs) {
  const t = Math.max(0, Number(esperaMs) || 0);
  const d = PVP_DEGRAUS_JANELA;
  if (t >= d[d.length - 1][0]) return Infinity;
  for (let i = d.length - 2; i >= 0; i--) {
    if (t < d[i][0]) continue;
    const [t0, j0] = d[i];
    const [t1, j1] = d[i + 1];
    if (!Number.isFinite(j1)) return j0;
    return j0 + ((j1 - j0) * (t - t0)) / (t1 - t0);
  }
  return d[0][1];
}








export function aceitamSeMutuamente(a, b, agora) {
  const janela = Math.min(janelaDeBusca(agora - a.desde), janelaDeBusca(agora - b.desde));
  return Math.abs(a.pontos - b.pontos) <= janela;
}
