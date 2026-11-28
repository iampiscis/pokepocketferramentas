const SPRITES = '../calculadora/jogo/sprites-png/'
const BOLA = '../assets/pokebola.svg'
const CHAVE = 'pp-shinies-filtro'
const fmt = new Intl.NumberFormat('pt-BR')
const fmtNota = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const fmtQ = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const fmtDia = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit' })
const fmtHora = new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' })
const $ = (id) => document.getElementById(id)

const NOME_TIPO = { NORMAL: 'Normal', FIRE: 'Fogo', WATER: 'Água', ELECTRIC: 'Elétrico', GRASS: 'Planta', ICE: 'Gelo', FIGHTING: 'Lutador', POISON: 'Veneno', GROUND: 'Terra', FLYING: 'Voador', PSYCHIC: 'Psíquico', BUG: 'Inseto', ROCK: 'Pedra', GHOST: 'Fantasma', DRAGON: 'Dragão', DARK: 'Sombrio', STEEL: 'Aço', FAIRY: 'Fada' }
const COR_TIPO = { NORMAL: '#9a9a6e', FIRE: '#e8742a', WATER: '#4f7fe6', ELECTRIC: '#d9b51c', GRASS: '#5fae38', ICE: '#5ec2be', FIGHTING: '#b8302a', POISON: '#9a3c98', GROUND: '#c9a24c', FLYING: '#8f78e0', PSYCHIC: '#ec4b7d', BUG: '#94a61a', ROCK: '#a8952f', GHOST: '#6a4f8f', DRAGON: '#6a35ea', DARK: '#6a5345', STEEL: '#8c8cae', FAIRY: '#d0739f' }
const FAIXAS_NOTA = [[1, 'Extremamente fraco', '#b0b5bc'], [2, 'Fraco', '#c94444'], [3, 'Mediano', '#f08830'], [4, 'Razoável', '#3a9a5c'], [5, 'Bom', '#8ee4a8'], [6, 'Forte', '#42ff9a'], [7, 'Poderoso', '#c8b4ff'], [8, 'Mítico', '#d896ff'], [9, 'Lendário', '#ffb8dc'], [Infinity, 'Divino', '#ff7ec8']]
const FAIXAS_SCORE = [[0, 'Baixo', '#ff6b6b'], [300, 'Regular', '#ffb547'], [500, 'Bom', '#ffd75e'], [700, 'Excelente', '#5ee69a']]
const ESCALA_PVP = [10, 25000]
const CURVA = 1.8
const ORDENS = [['recentes', 'Captura recente'], ['favoritos', 'Mais favoritados'], ['nota', 'Maior nota'], ['pvp', 'Maior Score PvP'], ['pvpJogo', 'Maior Score PvE'], ['preco', 'Menor preço']]
const LADOS = [['todos', 'Todos'], ['venda', 'À venda'], ['fora', 'Fora']]
const POR_PAGINA = 30
const GIST = 'https://api.github.com/gists/963037f07afd92147bc65b48170645d2'
const A_CADA = 60000
const NOVO_POR = 10 * 60000
const DIA = 24 * 3600000

const ICO = {
  busca: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m15.5 15.5 5 5"/>',
  shiny: '<path d="M12 3.5l1.8 5.2 5.2 1.8-5.2 1.8L12 17.5l-1.8-5.2L5 10.5l5.2-1.8z"/><path d="M18.5 15.5l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z"/>',
  jogadores: '<circle cx="9" cy="8.5" r="3.2"/><path d="M3.5 19.5c.6-3.2 2.8-5 5.5-5s4.9 1.8 5.5 5"/><circle cx="16.5" cy="9.5" r="2.6"/><path d="M15.5 14.6c2.6-.3 4.6 1.3 5 4.4"/>',
  venda: '<path d="M3.5 12.2V4.5a1 1 0 0 1 1-1h7.7l8.3 8.3a1.4 1.4 0 0 1 0 2l-6.2 6.2a1.4 1.4 0 0 1-2 0z"/><circle cx="8" cy="8" r="1.4"/>',
  hora: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
  filtros: '<path d="M4 6h16M7 12h10M10 18h4"/>',
  ordem: '<path d="M7 4v16M3.5 16.5 7 20l3.5-3.5M17 20V4M13.5 7.5 17 4l3.5 3.5"/>',
  seta: '<path d="m6 9 6 6 6-6"/>',
  x: '<path d="M6 6l12 12M18 6 6 18"/>',
  estrela: '<path d="M12 2.8l2.75 5.9 6.45.75-4.78 4.4 1.27 6.37L12 17l-5.69 3.22 1.27-6.37-4.78-4.4 6.45-.75z"/>',
  nivel: '<path d="M2.5 20.5 9 9.5l3.6 5.6 2.4-3.4 6.5 8.8z"/>',
  pvp: '<path d="M14.5 4.5h5v5L9 20l-5-5z"/><path d="M5 13.5 10.5 19M3.5 20.5l2-2"/>',
  dono: '<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h5.5M15 12h5.5"/><circle cx="12" cy="12" r="3"/>',
  troca: '<path d="M4 8h13l-3.5-3.5M20 16H7l3.5 3.5"/>',
  coracao: '<path d="M12 20.5s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.6a4.3 4.3 0 0 1 7.5 2.7c0 5.6-7.5 10.2-7.5 10.2z"/>',
  coin: '<circle cx="12" cy="12" r="8.5"/><path d="M14.6 9.2c-.5-.9-1.5-1.4-2.6-1.4-1.6 0-2.8.9-2.8 2.1 0 2.8 5.6 1.6 5.6 4.3 0 1.2-1.2 2.1-2.8 2.1-1.2 0-2.3-.6-2.7-1.5M12 6v1.8M12 16.2V18"/>',
  gema: '<path d="M6.5 4h11l3.5 5-9 11L3 9z"/><path d="M3 9h18M9.5 4 8 9l4 11 4-11-1.5-5"/>'
}

function el(tag, attrs = {}, filhos = []) {
  const n = document.createElement(tag)
  for (const [k, v] of Object.entries(attrs)) {
    if (v == null || v === false) continue
    if (k === 'text') n.textContent = v
    else if (k === 'class') n.className = v
    else n.setAttribute(k, v === true ? '' : v)
  }
  for (const f of [].concat(filhos)) if (f != null && f !== false) n.append(f)
  return n
}
function ico(nome, cheio = false) {
  const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  s.setAttribute('viewBox', '0 0 24 24'); s.setAttribute('aria-hidden', 'true')
  if (cheio) s.setAttribute('fill', 'currentColor')
  else { s.setAttribute('fill', 'none'); s.setAttribute('stroke', 'currentColor'); s.setAttribute('stroke-width', '2.1'); s.setAttribute('stroke-linecap', 'round'); s.setAttribute('stroke-linejoin', 'round') }
  s.innerHTML = ICO[nome]
  return s
}
const ehNum = (v) => v != null && v !== '' && Number.isFinite(Number(v))
const normalizar = (t) => String(t || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()
function curto(v) {
  const n = Number(v), a = Math.abs(n)
  const f = (x, s) => `${x >= 100 ? Math.round(x) : x.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} ${s}`
  if (a >= 1e9) return f(n / 1e9, 'bi')
  if (a >= 1e6) return f(n / 1e6, 'mi')
  if (a >= 1e3) return f(n / 1e3, 'mil')
  return fmt.format(Math.round(n))
}
function fmtHa(ms) {
  const m = Math.max(0, Math.round(ms / 60000))
  if (m < 1) return 'agora'
  if (m < 60) return `há ${m} min`
  const h = Math.floor(m / 60)
  if (h < 48) return `há ${h} h`
  return `há ${Math.floor(h / 24)} dias`
}
const faixaNota = (n) => FAIXAS_NOTA.find(([ate]) => n <= ate)
const faixaScore = (s) => [...FAIXAS_SCORE].reverse().find(([de]) => s >= de) || FAIXAS_SCORE[0]
function scorePoder(v) {
  if (!(Number(v) > 0)) return null
  const [lo, hi] = ESCALA_PVP
  const x = Math.max(0, Math.min(1, (Math.log10(v) - Math.log10(lo)) / (Math.log10(hi) - Math.log10(lo))))
  return Math.round(1000 * x ** CURVA)
}
const scoreDe = (l, k) => scorePoder(Number(l.fz?.[k]) || 0) ?? 0
const notaDe = (l) => Number(l.nf ?? l.nota)
const primeiroDono = (l) => l.cap === true || (typeof l.cap === 'string' && !!l.dono && l.cap.toLowerCase() === String(l.dono).toLowerCase())

function sprite(l) {
  const img = el('img', { alt: '', loading: 'lazy', decoding: 'async' })
  const tentativas = [...new Set([l.look, ehNum(l.sp) ? 70000 + Number(l.sp) : null, ehNum(l.sp) ? 60000 + Number(l.sp) : null].filter(ehNum).map(Number))].map((x) => `${SPRITES}${x}.png`)
  const proxima = () => {
    const url = tentativas.shift()
    if (url) img.src = url
    else { img.onerror = null; img.src = BOLA; img.className = 'bola' }
  }
  img.onerror = proxima
  proxima()
  return img
}

const padrao = () => ({ lado: 'todos', ordem: 'recentes', busca: '', notaMin: '', nivelMin: '', nivelMax: '', scoreMin: '', scorePvpMin: '', primeiroDono: false })
let f = padrao()
try { f = { ...f, ...JSON.parse(localStorage.getItem(CHAVE) || '{}') } } catch {}
const salvar = () => { try { localStorage.setItem(CHAVE, JSON.stringify(f)) } catch {} }
const lerNivel = (v) => { const t = String(v ?? '').trim(); const n = Number(t); return t && Number.isInteger(n) && n >= 1 && n <= 1000 ? n : null }
const lerNota = (v) => { const t = String(v ?? '').trim().replace(',', '.'); const n = Number(t); return t && n > 0 && n <= 10 ? n : null }
const lerScore = (v) => { const t = String(v ?? '').trim(); const n = Number(t); return t && Number.isFinite(n) && n > 0 && n <= 1000 ? n : null }
const nAtivos = () => [f.busca.trim(), lerNota(f.notaMin), lerNivel(f.nivelMin) || lerNivel(f.nivelMax), lerScore(f.scoreMin), lerScore(f.scorePvpMin), f.primeiroDono].filter(Boolean).length

function filtrar(linhas) {
  const busca = normalizar(f.busca)
  const nota = lerNota(f.notaMin)
  const nMin = lerNivel(f.nivelMin)
  const nMax = lerNivel(f.nivelMax)
  const scMin = lerScore(f.scoreMin)
  const pvpMin = lerScore(f.scorePvpMin)
  return linhas.filter((l) => (!scMin || scoreDe(l, 'pvp') >= scMin)
    && (!pvpMin || scoreDe(l, 'pvpJogo') >= pvpMin)
    && (!f.primeiroDono || primeiroDono(l))
    && (!busca || normalizar(l.nome).includes(busca) || normalizar(l.dono).includes(busca))
    && (!nota || notaDe(l) >= nota)
    && (!nMin || Number(l.nv) >= nMin)
    && (!nMax || Number(l.nv) <= nMax))
}
const ladoOk = (l) => f.lado === 'todos' || (f.lado === 'venda' ? !!l.an : !l.an)
function ordenar(linhas) {
  const cap = (l) => Number(l.em) || 0
  const precoOrd = (l) => (l.an ? (l.an.moeda === 'orb' ? 1e12 : 0) + Number(l.an.preco) : Infinity)
  const por = {
    recentes: (a, b) => cap(b) - cap(a),
    nota: (a, b) => (notaDe(b) || 0) - (notaDe(a) || 0),
    favoritos: (a, b) => (Number(b.an?.fav) || 0) - (Number(a.an?.fav) || 0) || (b.an ? 1 : 0) - (a.an ? 1 : 0),
    preco: (a, b) => precoOrd(a) - precoOrd(b),
    pvp: (a, b) => (Number(b.fz?.pvp) || 0) - (Number(a.fz?.pvp) || 0),
    pvpJogo: (a, b) => (Number(b.fz?.pvpJogo) || 0) - (Number(a.fz?.pvpJogo) || 0)
  }
  return [...linhas].sort((a, b) => (por[f.ordem] || por.recentes)(a, b) || cap(b) - cap(a))
}

function barraScore(sc) {
  return el('span', { class: 'sh-barra', 'aria-hidden': 'true' }, FAIXAS_SCORE.map(([de, , cor], i) => {
    const ate = FAIXAS_SCORE[i + 1]?.[0] ?? 1000
    const cheio = Math.max(0, Math.min(1, (sc - de) / (ate - de)))
    const aqui = sc >= de && (sc < ate || ate === 1000)
    return el('span', { class: 'sh-barra-faixa', style: `flex:${ate - de} 1 0;--c:${cor}` }, [el('i', { class: 'sh-barra-cheio', style: `width:${(cheio * 100).toFixed(1)}%` }), aqui ? el('i', { class: 'sh-barra-marca', style: `left:${(cheio * 100).toFixed(1)}%` }) : null])
  }))
}

function cartao(l) {
  const nota = ehNum(l.nota) ? Number(l.nota) : null
  const fx = nota != null ? faixaNota(nota) : null
  const sc = scorePoder(l.fz?.pvp)
  const scJogo = scorePoder(l.fz?.pvpJogo)
  const fs = sc != null ? faixaScore(sc) : null
  const nf = Number(l.nf)
  const temFinal = Number.isFinite(nf) && l.nf != null && !(Number(l.nota) >= nf - 0.0005)
  const tipos = (l.tipos || []).filter((t) => NOME_TIPO[t])
  const pe = [l.fz?.mesma === false && l.fz?.nome ? `como ${l.fz.nome}` : '', scJogo != null ? `PvE ${fmt.format(scJogo)}` : ''].filter(Boolean).join(' · ')
  const lado = l.an
    ? el('span', { class: `sh-preco ${l.an.moeda}`, title: l.an.moeda === 'orb' ? 'À venda em Gemas' : 'À venda em Coins' }, [ico(l.an.moeda === 'orb' ? 'gema' : 'coin'), el('b', { text: l.an.moeda === 'orb' ? fmt.format(l.an.preco) : curto(l.an.preco) })])
    : el('span', { class: 'sh-fora', text: 'Fora do Mercado' })
  const origem = l.cap === true
    ? el('span', { class: 'sh-origem primeiro', title: 'Ainda com quem capturou' }, [ico('dono'), el('span', { text: '1º dono' })])
    : typeof l.cap === 'string' && l.cap
      ? el('span', { class: 'sh-origem revendido', title: `Já vendido: capturado por ${l.cap}` }, [ico('troca'), el('span', { text: 'revendido' })])
      : null
  const fav = Number(l.an?.fav) || 0
  const meta = [
    el('span', { class: 'sh-dono', text: `de ${l.dono || '?'}` }),
    origem,
    fav > 0 ? el('span', { class: 'sh-fav', title: `${fmt.format(fav)} ${fav === 1 ? 'jogador favoritou' : 'jogadores favoritaram'} este anúncio` }, [ico('coracao', true), el('span', { text: fmt.format(fav) })]) : null,
    ehNum(l.em) ? el('span', { class: 'sh-ha', title: `Capturado em ${fmtDia.format(new Date(l.em))} às ${fmtHora.format(new Date(l.em))}`, text: fmtHa(Date.now() - l.em) }) : null
  ].filter(Boolean)
  const selo = el('span', { class: 'sh-selo', style: fx ? `--n:${fx[2]}` : null, title: fx ? `Nota ${fmtNota.format(nota)} · ${fx[1]}${temFinal ? ` · nota final ${fmtNota.format(nf)} se evoluir` : ''}` : 'Sem nota' }, [
    ico('estrela', true),
    el('span', { text: nota != null ? fmtNota.format(nota) : 'shiny' }),
    temFinal ? el('span', { class: 'sh-final', style: `color:${faixaNota(nf)?.[2] || 'inherit'}`, text: `› ${fmtNota.format(nf)}` }) : null
  ])
  const d = (rot, val, titulo) => el('span', { class: 'sh-d', title: titulo }, [el('small', { text: rot }), el('b', { text: val })])
  return el('article', { class: `sh-cartao${ehNovo(l) ? ' sh-recente' : ''}${acabouDeChegar(l) ? ' sh-chegou' : ''}` }, [
    el('div', { class: 'sh-topo' }, [
      el('span', { class: 'sh-arte' }, [sprite(l), el('i', { class: 'sh-brilho', 'aria-hidden': 'true', text: '✦' })]),
      el('div', { class: 'sh-id' }, [
        el('div', { class: 'sh-nome' }, [el('b', { text: l.nome || 'Pokémon' }), ehNum(l.nv) ? el('span', { class: 'sh-nv', text: `Nv ${fmt.format(l.nv)}` }) : null, ehNovo(l) ? el('span', { class: 'sh-novo', text: 'novo' }) : null]),
        el('div', { class: 'sh-linha2' }, [selo, ...tipos.map((t) => el('span', { class: 'chip-tipo sh-tipo', style: `--c:${COR_TIPO[t]}`, text: NOME_TIPO[t] }))]),
        el('div', { class: 'sh-meta' }, meta)
      ]),
      sc != null ? el('div', { class: 'sh-score', style: `--s:${fs[2]}`, title: `Score PvP ${sc} de 1000 (${fs[1]}): ataque real em 60 s + resistência por tipo contra o meta, na evolução máxima e sem refino` }, [el('b', { text: fmt.format(sc) }), el('small', { text: fs[1] })]) : null
    ]),
    sc != null ? el('div', { class: 'sh-faixa' }, [barraScore(sc), pe ? el('small', { text: pe, title: pe }) : null]) : null,
    el('div', { class: 'sh-rodape' }, [
      d('Pot', `P${l.p || 1}`, 'Potência'),
      d('Qual', ehNum(l.q) ? fmtQ.format(l.q) : '—', 'Qualidade'),
      d('IV', ehNum(l.iv) ? `${fmt.format(l.iv)}/192` : '—', 'Soma dos IVs'),
      el('span', { class: 'sh-lado' }, [lado])
    ])
  ])
}

let dados = null
let limite = POR_PAGINA
let aberto = false

async function lerGist() {
  const r = await fetch(GIST, { cache: 'no-cache' })
  if (!r.ok) throw new Error(`HTTP ${r.status}`)
  const f = (await r.json())?.files?.['shinies.json']
  if (!f) throw new Error('sem arquivo')
  if (!f.truncated) return JSON.parse(f.content)
  const raw = await fetch(f.raw_url, { cache: 'no-cache' })
  if (!raw.ok) throw new Error(`HTTP ${raw.status}`)
  return raw.json()
}
async function lerEstatico() {
  const r = await fetch(`shinies.json?t=${Math.floor(Date.now() / 300000)}`, { cache: 'no-cache' })
  if (!r.ok) throw new Error(`HTTP ${r.status}`)
  return r.json()
}
const vistos = new Map()
let pausaGistAte = 0
function receber(d) {
  const corte = Date.now() - DIA
  d.linhas = (d.linhas || []).filter((l) => !ehNum(l.em) || Number(l.em) >= corte)
  const primeira = !dados
  const agora = Date.now()
  for (const l of d.linhas) if (!vistos.has(l.id)) vistos.set(l.id, primeira ? 0 : agora)
  dados = d
}
const ehNovo = (l) => (vistos.get(l.id) || 0) > Date.now() - NOVO_POR
const acabouDeChegar = (l) => (vistos.get(l.id) || 0) > Date.now() - A_CADA + 5000
async function buscar() {
  if (Date.now() >= pausaGistAte) {
    try { return { d: await lerGist(), vivo: true } } catch { pausaGistAte = Date.now() + 5 * 60000 }
  }
  return { d: await lerEstatico(), vivo: false }
}
async function carregar() {
  const corpo = $('sh-corpo')
  corpo.replaceChildren(el('div', { class: 'carga vao' }, [el('img', { class: 'carga-bola', src: BOLA, alt: '' }), el('b', { text: 'Carregando os shinies' })]))
  try {
    const { d, vivo } = await buscar()
    receber(d)
    dados.vivo = vivo
    montar()
    if (!document.documentElement.classList.contains('embed')) agendada = setTimeout(atualizar, A_CADA)
  } catch {
    const tentar = el('button', { type: 'button', class: 'botao pequeno', text: 'Tentar de novo' })
    tentar.onclick = carregar
    corpo.replaceChildren(el('div', { class: 'carga vao falhou' }, [el('b', { text: 'Não deu para carregar os shinies agora.' }), tentar]))
  }
}
let ultimaBusca = Date.now()
let agendada = null
const aviso = el('button', { type: 'button', class: 'sh-aviso', hidden: true })
aviso.onclick = () => { aviso.hidden = true; lista.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' }) }
document.body.append(aviso)
let avisoTimer = null
function avisarNovos(n) {
  if (!n) return
  const topoLista = lista.getBoundingClientRect().top
  if (topoLista > 60 && topoLista < innerHeight - 120) return
  aviso.replaceChildren(el('i', { 'aria-hidden': 'true', text: '✦' }), el('span', { text: n === 1 ? '1 shiny novo' : `${fmt.format(n)} shinies novos` }), ico('seta'))
  aviso.hidden = false
  clearTimeout(avisoTimer)
  avisoTimer = setTimeout(() => { aviso.hidden = true }, 9000)
}
async function atualizar() {
  clearTimeout(agendada)
  if (document.hidden) return
  ultimaBusca = Date.now()
  try {
    const { d, vivo } = await buscar()
    const antes = dados?.lidoEm
    if (d.lidoEm !== antes || vivo !== dados?.vivo) {
      receber(d)
      dados.vivo = vivo
      pintarInds()
      const digitando = topo.contains(document.activeElement)
      if (aberto || digitando) pintarLista()
      else pintar()
      avisarNovos(filtrar(dados.linhas).filter(ladoOk).filter(acabouDeChegar).length)
    } else pintarInds()
  } catch {}
  agendada = setTimeout(atualizar, A_CADA)
}
document.addEventListener('visibilitychange', () => { if (!document.hidden && dados && Date.now() - ultimaBusca > A_CADA) atualizar() })

const topo = el('div', { class: 'sh-filtros' })
const contagem = el('p', { class: 'sh-contagem' })
const lista = el('div', { class: 'sh-lista' })
const mais = el('div', { class: 'sh-mais' })

function mudar() { salvar(); limite = POR_PAGINA; pintar() }

function campo({ valor, placeholder, rotulo, modo = 'decimal', ler, aoMudar }) {
  const i = el('input', { class: 'campo sh-campo', type: 'text', inputmode: modo, placeholder, 'aria-label': rotulo, autocomplete: 'off', value: valor || '' })
  let t = null
  i.addEventListener('input', () => {
    i.classList.toggle('invalido', !!i.value.trim() && ler(i.value) == null)
    clearTimeout(t)
    t = setTimeout(() => aoMudar(i.value), 350)
  })
  return i
}
function grupo(icone, titulo, conteudo) {
  return el('div', { class: 'sh-grupo' }, [el('span', { class: 'sh-grupo-tit' }, [ico(icone), el('b', { text: titulo })]), conteudo])
}
function segmentado(opcoes, atual, aoEscolher, rotulo, contagens = null) {
  const s = el('div', { class: 'sh-seg', role: 'radiogroup', 'aria-label': rotulo })
  for (const [k, rot] of opcoes) {
    const b = el('button', { type: 'button', role: 'radio', 'aria-checked': String(k === atual), class: k === atual ? 'ativo' : '' }, [el('span', { text: rot }), contagens ? el('small', { text: fmt.format(contagens[k] || 0) }) : null])
    b.onclick = () => aoEscolher(k)
    s.append(b)
  }
  return s
}

function painel(visiveis) {
  const busca = el('input', { class: 'campo', type: 'search', placeholder: 'Pokémon ou jogador', 'aria-label': 'Buscar pokémon ou jogador', autocomplete: 'off', spellcheck: 'false', value: f.busca })
  let t = null
  busca.addEventListener('input', () => { clearTimeout(t); t = setTimeout(() => { f.busca = busca.value; salvar(); limite = POR_PAGINA; pintarLista(); pintarRodapePainel() }, 220) })
  const nota = campo({ valor: f.notaMin, placeholder: '3,5', rotulo: 'Nota mínima', ler: lerNota, aoMudar: (v) => { f.notaMin = v; mudar() } })
  const nivel = (ponta) => campo({ valor: f[`nivel${ponta}`], placeholder: ponta === 'Min' ? 'de' : 'até', rotulo: `Nível ${ponta === 'Min' ? 'mínimo' : 'máximo'}`, modo: 'numeric', ler: lerNivel, aoMudar: (v) => { f[`nivel${ponta}`] = v; mudar() } })
  const score = (k, rot) => campo({ valor: f[k], placeholder: '800', rotulo: rot, modo: 'numeric', ler: lerScore, aoMudar: (v) => { f[k] = v; mudar() } })
  const dono = segmentado([['todos', 'Todos'], ['primeiro', 'Só 1º dono']], f.primeiroDono ? 'primeiro' : 'todos', (k) => { f.primeiroDono = k === 'primeiro'; mudar() }, 'Dono do shiny')
  const limpar = el('button', { type: 'button', class: 'sh-limpar', text: 'Limpar filtros', disabled: !nAtivos() })
  limpar.onclick = () => { f = { ...padrao(), lado: f.lado, ordem: f.ordem }; mudar() }
  const ver = el('button', { type: 'button', class: 'botao pequeno sh-ver', text: `Ver ${fmt.format(visiveis)}` })
  ver.onclick = () => { aberto = false; pintar() }
  return el('div', { class: 'sh-painel', id: 'sh-painel' }, [
    el('label', { class: 'busca pos-busca sh-busca' }, [el('span', { class: 'busca-ico', 'aria-hidden': 'true' }, [ico('busca')]), busca]),
    el('div', { class: 'sh-grupos' }, [
      grupo('estrela', 'Nota mínima', el('div', { class: 'sh-campos' }, [nota, el('small', { text: 'de 0 a 10' })])),
      grupo('nivel', 'Nível', el('div', { class: 'sh-campos' }, [nivel('Min'), el('span', { class: 'sh-ate', text: '–' }), nivel('Max')])),
      grupo('pvp', 'Score PvP acima de', el('div', { class: 'sh-campos' }, [score('scoreMin', 'Score PvP mínimo'), el('small', { text: 'de 0 a 1.000' })])),
      grupo('pvp', 'Score PvE acima de', el('div', { class: 'sh-campos' }, [score('scorePvpMin', 'Score PvE mínimo'), el('small', { text: 'de 0 a 1.000' })])),
      grupo('dono', 'Dono', dono)
    ]),
    el('div', { class: 'sh-painel-pe' }, [limpar, ver])
  ])
}

function chipsAtivos() {
  const itens = []
  const chip = (rot, limpar, icone) => {
    const b = el('button', { type: 'button', class: 'sh-chip', 'aria-label': `Remover filtro ${rot}` }, [ico(icone), el('span', { text: rot }), ico('x')])
    b.onclick = () => { limpar(); mudar() }
    itens.push(b)
  }
  if (f.busca.trim()) chip(`“${f.busca.trim()}”`, () => { f.busca = '' }, 'busca')
  if (lerNota(f.notaMin)) chip(`Nota ≥ ${f.notaMin}`, () => { f.notaMin = '' }, 'estrela')
  if (lerNivel(f.nivelMin) || lerNivel(f.nivelMax)) chip(lerNivel(f.nivelMin) && lerNivel(f.nivelMax) ? `Nv ${f.nivelMin}–${f.nivelMax}` : lerNivel(f.nivelMin) ? `Nv ≥ ${f.nivelMin}` : `Nv ≤ ${f.nivelMax}`, () => { f.nivelMin = ''; f.nivelMax = '' }, 'nivel')
  if (lerScore(f.scoreMin)) chip(`PvP ≥ ${f.scoreMin}`, () => { f.scoreMin = '' }, 'pvp')
  if (lerScore(f.scorePvpMin)) chip(`PvE ≥ ${f.scorePvpMin}`, () => { f.scorePvpMin = '' }, 'pvp')
  if (f.primeiroDono) chip('1º dono', () => { f.primeiroDono = false }, 'dono')
  return itens.length ? el('div', { class: 'sh-chips' }, itens) : null
}

let pintarRodapePainel = () => {}
function pintarTopo() {
  const base = filtrar(dados.linhas)
  const n = { todos: base.length, venda: base.filter((l) => l.an).length, fora: base.filter((l) => !l.an).length }
  const seg = segmentado(LADOS, f.lado, (k) => { if (k === f.lado) return; f.lado = k; mudar() }, 'Situação no Mercado', n)
  seg.classList.add('sh-lados')
  const atual = ORDENS.find(([k]) => k === f.ordem) || ORDENS[0]
  const sel = el('select', { 'aria-label': `Ordem: ${atual[1]}` }, ORDENS.map(([k, rot]) => el('option', { value: k, text: rot })))
  sel.value = atual[0]
  sel.onchange = () => { f.ordem = sel.value; mudar() }
  const ordem = el('label', { class: `sh-pilula sh-ordem${atual[0] !== 'recentes' ? ' ligado' : ''}` }, [ico('ordem'), el('span', { class: 'sh-pilula-txt' }, [el('small', { text: 'Ordem' }), el('b', { text: atual[1] })]), ico('seta'), sel])
  const na = nAtivos()
  const abrir = el('button', { type: 'button', class: `sh-pilula sh-abrir${na ? ' ligado' : ''}${aberto ? ' aberto' : ''}`, 'aria-expanded': String(aberto), 'aria-controls': 'sh-painel', 'aria-label': na ? `Filtros: ${na} ${na === 1 ? 'ativo' : 'ativos'}` : 'Filtros' }, [ico('filtros'), el('b', { text: 'Filtros' }), na ? el('span', { class: 'sh-contador', text: String(na) }) : null])
  abrir.onclick = () => { aberto = !aberto; pintar() }
  const vis = () => filtrar(dados.linhas).filter(ladoOk).length
  const extra = aberto ? painel(vis()) : chipsAtivos()
  pintarRodapePainel = () => { const v = topo.querySelector('.sh-ver'); if (v) v.textContent = `Ver ${fmt.format(vis())}` }
  topo.replaceChildren(...[el('div', { class: 'sh-barra-topo' }, [seg, el('div', { class: 'sh-barra-dir' }, [ordem, abrir])]), extra].filter(Boolean))
}

function pintarLista() {
  const vis = ordenar(filtrar(dados.linhas).filter(ladoOk))
  if (!vis.length) {
    lista.replaceChildren(el('p', { class: 'vazio sh-vazio' }, [el('b', { text: dados.linhas.length ? 'Nenhum shiny com esse filtro' : 'Nenhum shiny nas últimas 24 h' }), dados.linhas.length ? el('span', { text: 'Mude a busca ou limpe os filtros.' }) : null]))
    mais.replaceChildren()
    return
  }
  lista.replaceChildren(...vis.slice(0, limite).map(cartao))
  const resto = vis.length - limite
  if (resto > 0) {
    const b = el('button', { type: 'button', class: 'botao sh-mais-botao', text: `Mostrar mais (${fmt.format(resto)})` })
    b.onclick = () => { limite += POR_PAGINA; pintarLista() }
    mais.replaceChildren(b)
  } else mais.replaceChildren()
}

function pintar() {
  pintarTopo()
  pintarLista()
}

const infoUl = el('ul', { class: 'indicadores', 'aria-label': 'Resumo' })
function pintarInds() {
  const ls = dados.linhas || []
  const jogadores = new Set(ls.map((l) => String(l.dono || '').toLowerCase())).size
  const g = new Date(dados.lidoEm || dados.geradoEm)
  const ind = (icone, texto, titulo, classe = '') => el('li', { class: `ind ind-${icone}${classe}`, title: titulo || null }, [ico(icone), el('span', { text: texto })])
  const vivo = dados.vivo && !Number.isNaN(g.getTime()) && Date.now() - g.getTime() < 15 * 60000
  infoUl.replaceChildren(...[
    vivo ? el('li', { class: 'ind sh-vivo', title: 'A lista se atualiza sozinha a cada minuto' }, [el('i', { class: 'sh-vivo-ponto', 'aria-hidden': 'true' }), el('span', { text: 'Ao vivo' })]) : null,
    ind('shiny', `${fmt.format(ls.length)} ${ls.length === 1 ? 'shiny' : 'shinies'}`, 'Capturados nas últimas 24 h'),
    ind('jogadores', `${fmt.format(jogadores)} ${jogadores === 1 ? 'jogador' : 'jogadores'}`),
    ind('venda', `${fmt.format(ls.filter((l) => l.an).length)} à venda`),
    Number.isNaN(g.getTime()) ? null : ind('hora', `${vivo ? 'Atualizado' : 'Lido'} ${fmtDia.format(g)} às ${fmtHora.format(g)}`, 'Hora da última leitura da lista de shinies do jogo')
  ].filter(Boolean))
}
function montar() {
  const corpo = $('sh-corpo')
  const ls = dados.linhas || []
  if (document.documentElement.classList.contains('embed')) {
    const top = [...ls].sort((x, y) => (Number(y.fz?.pvp) || 0) - (Number(x.fz?.pvp) || 0)).slice(0, 4)
    corpo.replaceChildren(el('div', { class: 'sh-lista' }, top.map(cartao)))
    return
  }
  pintarInds()
  corpo.replaceChildren(el('div', { class: 'info-linha' }, [infoUl]), topo, lista, mais)
  pintar()
}

document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && aberto) { aberto = false; pintar() } })
carregar()
