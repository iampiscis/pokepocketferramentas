const TIPOS = ['NORMAL', 'FIRE', 'WATER', 'GRASS', 'ELECTRIC', 'ICE', 'FIGHTING', 'POISON', 'GROUND', 'FLYING', 'PSYCHIC', 'BUG', 'ROCK', 'GHOST', 'DRAGON', 'DARK', 'STEEL', 'FAIRY']
const NOME_TIPO = { NORMAL: 'Normal', FIRE: 'Fogo', WATER: 'Água', ELECTRIC: 'Elétrico', GRASS: 'Planta', ICE: 'Gelo', FIGHTING: 'Lutador', POISON: 'Veneno', GROUND: 'Terra', FLYING: 'Voador', PSYCHIC: 'Psíquico', BUG: 'Inseto', ROCK: 'Pedra', GHOST: 'Fantasma', DRAGON: 'Dragão', DARK: 'Sombrio', STEEL: 'Aço', FAIRY: 'Fada' }
const COR_TIPO = { NORMAL: '#9a9a6e', FIRE: '#e8742a', WATER: '#4f7fe6', ELECTRIC: '#d9b51c', GRASS: '#5fae38', ICE: '#5ec2be', FIGHTING: '#b8302a', POISON: '#9a3c98', GROUND: '#c9a24c', FLYING: '#8f78e0', PSYCHIC: '#ec4b7d', BUG: '#94a61a', ROCK: '#a8952f', GHOST: '#6a4f8f', DRAGON: '#6a35ea', DARK: '#6a5345', STEEL: '#8c8cae', FAIRY: '#d0739f' }
const COR_TIER = { 'S+': '#ff6fae', S: '#ff7676', 'S-': '#b495ff', 'A+': '#f5b13d', A: '#ffa25a', 'A-': '#ffd95e', 'B+': '#8c93f0', B: '#5f9ad6', 'B-': '#3fd4c6', C: '#9aa0aa', D: '#e4e7ec' }
const EMBED = new URLSearchParams(location.search).has('embed')
const JANELAS = ['dia', 'semana', 'mes']
const SPRITES = '../calculadora/jogo/sprites-png/'
const BOLA = '../assets/pokebola.svg'

const fmt = new Intl.NumberFormat('pt-BR')
const fmtPct = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 })
const fmtDia = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit' })
const fmtHora = new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' })
const $ = (id) => document.getElementById(id)
const ehNum = (v) => v != null && v !== '' && Number.isFinite(Number(v))
const normalizar = (t) => String(t || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()
const plural = (n, um, varios) => `${fmt.format(n)} ${Number(n) === 1 ? um : varios}`

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

const estado = { janela: 'dia', busca: '', tipos: [], todas: false, ordem: 'score', ficha: null }
let dados = null

function lerHash() {
  const p = new URLSearchParams(location.hash.slice(1))
  estado.janela = JANELAS.includes(p.get('j')) ? p.get('j') : 'dia'
  estado.busca = p.get('b') || ''
  estado.tipos = (p.get('t') || '').split(',').map((t) => t.toUpperCase()).filter((t) => TIPOS.includes(t))
  estado.todas = p.get('a') === '1'
  estado.ordem = p.get('o') === 'uso' ? 'uso' : 'score'
  estado.ficha = ehNum(p.get('p')) ? Number(p.get('p')) : null
}

function gravarHash() {
  const p = new URLSearchParams()
  if (estado.janela !== 'dia') p.set('j', estado.janela)
  if (estado.busca.trim()) p.set('b', estado.busca.trim())
  if (estado.tipos.length) p.set('t', estado.tipos.join(','))
  if (estado.todas) p.set('a', '1')
  if (estado.ordem !== 'score') p.set('o', estado.ordem)
  if (estado.ficha != null) p.set('p', String(estado.ficha))
  const h = p.toString().replace(/%2C/g, ',')
  history.replaceState(null, '', location.pathname + location.search + (h ? `#${h}` : ''))
}

function janelasDe(j) {
  if (j?.janelas) return j.janelas
  if (Array.isArray(j?.tiers)) return { dia: j }
  return {}
}

function janelaAtual() {
  const js = janelasDe(dados)
  return js[estado.janela] || js.dia || js[JANELAS.find((k) => js[k])] || null
}

function sprite(p) {
  const img = el('img', { alt: '', loading: 'lazy', decoding: 'async' })
  const looks = [p.looktype, p.lookNormal, 60000 + Number(p.speciesId)].filter(ehNum).map(Number)
  const tentativas = [...new Set(looks)].map((l) => `${SPRITES}${l}.png`)
  const proxima = () => {
    const url = tentativas.shift()
    if (url) img.src = url
    else { img.onerror = null; img.src = BOLA; img.className = 'bola' }
  }
  img.onerror = proxima
  proxima()
  return img
}

const linkCalc = (p) => `../calculadora/#e=${Number(p.speciesId)}&n=100&p=1&q=1.1&s=1&iv=20.20.20.20.20.20&sn=100`

function cartao(p) {
  const tipos = (p.tipos || []).filter(Boolean).map((t) => String(t).toUpperCase())
  const nomesTipos = tipos.map((t) => NOME_TIPO[t] || t).join(' e ')
  const score = ehNum(p.score) ? Math.round(p.score) : null
  return el('a', { class: 'poke', href: linkCalc(p), 'data-id': String(p.speciesId), title: `${p.nome} shiny${nomesTipos ? ` (${nomesTipos})` : ''}${score != null ? ` · score ${fmt.format(score)}` : ''}${ehNum(p.usoTopo) ? ` · ${fmtPct.format(p.usoTopo)}% do top ${fmt.format(janelaAtual()?.topo ?? 100)}` : Number(p.uso) > 0 ? ` · uso ${fmtPct.format(p.uso)}%` : ''}` }, [
    el('span', { class: 'poke-img' }, [sprite(p), el('i', { class: 'poke-shiny', 'aria-hidden': 'true', text: '✦' })]),
    el('span', { class: 'poke-nome', text: p.nome }),
    nomesTipos ? el('span', { class: 'so-leitor', text: nomesTipos }) : null,
    el('b', { class: 'poke-val', text: score != null ? fmt.format(score) : '—' })
  ])
}

const CARTAO_MIN = 104
const CELULAR = matchMedia('(max-width: 560px)')

function equilibrarRaias() {
  for (const g of document.querySelectorAll('.faixa-cartoes')) {
    g.style.gridTemplateColumns = ''
    for (const c of g.children) c.style.gridColumnStart = ''
    if (CELULAR.matches) continue
    const cs = getComputedStyle(g)
    const gap = parseFloat(cs.columnGap) || 0
    const largura = g.clientWidth - (parseFloat(cs.paddingLeft) || 0) - (parseFloat(cs.paddingRight) || 0)
    const maxCols = Math.max(1, Math.floor((largura + gap) / (CARTAO_MIN + gap)))
    if (maxCols <= 4) continue
    const n = g.children.length
    const linhas = Math.ceil(n / maxCols)
    const cols = Math.ceil(n / linhas)
    const cartao = Math.floor(((largura - gap * (maxCols - 1)) / maxCols) * 100) / 100
    g.style.gridTemplateColumns = `repeat(${cols}, minmax(0, ${cartao}px))`
    const base = Math.floor(n / linhas)
    let i = 0
    for (let l = 0; l < linhas; l++) {
      if (l) g.children[i].style.gridColumnStart = '1'
      i += base + (l < n % linhas ? 1 : 0)
    }
  }
}

let esperaRaias = 0
let larguraRaias = innerWidth
addEventListener('resize', () => {
  if (innerWidth === larguraRaias) return
  larguraRaias = innerWidth
  cancelAnimationFrame(esperaRaias)
  esperaRaias = requestAnimationFrame(equilibrarRaias)
})

const PASSOS_NOME = ['n1', 'n2', 'n3']

function ajustarNomes() {
  const nomes = [...document.querySelectorAll('#faixas .poke-nome, #fora-faixas .poke-nome')]
  nomes.forEach((n) => n.classList.remove(...PASSOS_NOME))
  let fila = nomes
  for (const passo of PASSOS_NOME) {
    fila = fila.filter((n) => n.scrollWidth > n.clientWidth + 1)
    if (!fila.length) break
    fila.forEach((n) => { n.classList.remove(...PASSOS_NOME); n.classList.add(passo) })
  }
}

let esperaNomes = 0
addEventListener('resize', () => { clearTimeout(esperaNomes); esperaNomes = setTimeout(ajustarNomes, 150) })

function filtrar(itens) {
  const q = normalizar(estado.busca)
  return itens.filter((p) =>
    (!q || normalizar(p.nome).includes(q) || normalizar(p.base?.nome).includes(q)) &&
    (!estado.tipos.length || (p.tipos || []).some((t) => estado.tipos.includes(String(t).toUpperCase())))
  )
}

function ordenar(itens) {
  const sc = (p) => (ehNum(p.score) ? Number(p.score) : -1)
  const us = (p) => (ehNum(p.usoTopo) ? Number(p.usoTopo) : ehNum(p.uso) ? Number(p.uso) : -1)
  return [...itens].sort(estado.ordem === 'uso' ? (a, b) => us(b) - us(a) || sc(b) - sc(a) : (a, b) => sc(b) - sc(a) || us(b) - us(a))
}

function dia(iso) {
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? '' : fmtDia.format(d)
}

const ICO_IND = {
  periodo: '<rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
  recorte: '<path d="M8 3.5h8V9a4 4 0 0 1-8 0z"/><path d="M8 5.5H5a3 3 0 0 0 3.2 4M16 5.5h3a3 3 0 0 1-3.2 4M12 13v3.5M9.5 16.5h5v4h-5z"/>',
  partidas: '<path d="M4 4l7.5 7.5M20 4l-7.5 7.5M4.5 15.5l4 4M19.5 15.5l-4 4M6 18l-2 2M18 18l2 2"/>',
  jogadores: '<circle cx="9" cy="8" r="3.2"/><path d="M3 19c0-3.3 2.7-5.5 6-5.5s6 2.2 6 5.5M16 4.8a3.2 3.2 0 0 1 0 6.4M17.5 13.8c2.1.6 3.5 2.6 3.5 5.2"/>'
}

function faixaDatas(de, ate) {
  const a = new Date(de), b = new Date(ate)
  if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime())) return ''
  const [da, ma] = fmtDia.format(a).split('/'), [db, mb] = fmtDia.format(b).split('/')
  if (da === db && ma === mb) return `${db}/${mb}`
  return ma === mb ? `${da}-${db}/${mb}` : `${da}/${ma}-${db}/${mb}`
}

function recorteDe(j) {
  if (typeof dados.recorte === 'string' && dados.recorte) return { curto: dados.recorte, frase: `no ${dados.recorte}`, titulo: 'Jogadores Mestre, Grão-Mestre e Challenger do ranqueado' }
  const topo = j?.topo ?? dados.topo
  if (ehNum(topo)) return { curto: `Top ${fmt.format(topo)}`, frase: `no top ${fmt.format(topo)}`, titulo: 'Jogadores do topo do ranqueado' }
  return null
}

function indicador(icone, texto, extra = null, titulo = null) {
  const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  s.setAttribute('viewBox', '0 0 24 24'); s.setAttribute('fill', 'none'); s.setAttribute('stroke', 'currentColor')
  s.setAttribute('stroke-width', '2.1'); s.setAttribute('stroke-linecap', 'round'); s.setAttribute('stroke-linejoin', 'round'); s.setAttribute('aria-hidden', 'true')
  s.innerHTML = ICO_IND[icone]
  return el('li', { class: `ind ind-${icone}`, title: titulo }, [s, el('span', { text: texto }), extra])
}

function pintarPeriodo(j) {
  const itens = []
  const datas = faixaDatas(j.de, j.ate)
  if (datas) {
    let selo = null
    if (j.parcial) {
      const t0 = new Date(j.de).getTime(), t1 = new Date(j.ate).getTime()
      const n = ehNum(j.dias) ? Number(j.dias) : Number.isFinite(t1 - t0) ? Math.max(1, Math.round((t1 - t0) / 864e5)) : null
      if (n) selo = el('em', { class: 'parcial', text: plural(n, 'dia', 'dias'), title: 'A janela ainda não tem todos os dias' })
    }
    itens.push(indicador('periodo', datas, selo, 'Período'))
  }
  const rec = recorteDe(j)
  if (rec) itens.push(indicador('recorte', rec.curto, null, rec.titulo))
  if (ehNum(j.partidas)) itens.push(indicador('partidas', plural(j.partidas, 'partida', 'partidas')))
  if (ehNum(j.jogadores)) itens.push(indicador('jogadores', plural(j.jogadores, 'jogador', 'jogadores')))
  $('indicadores').replaceChildren(...itens)
}

function pintar() {
  const j = janelaAtual()
  const js = janelasDe(dados)
  document.querySelectorAll('[data-janela]').forEach((b) => {
    b.setAttribute('aria-pressed', String(b.dataset.janela === estado.janela))
    b.disabled = !js[b.dataset.janela]
  })
  document.querySelectorAll('[data-ordem]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.ordem === estado.ordem)))
  const fora = Array.isArray(j?.foraDoMeta) ? j.foraDoMeta : []
  $('todas').setAttribute('aria-pressed', String(estado.todas && fora.length > 0))
  $('todas').disabled = !fora.length
  document.querySelectorAll('.chip-tipo').forEach((b) => b.setAttribute('aria-pressed', String(estado.tipos.includes(b.dataset.tipo))))
  $('tipos').classList.toggle('escolhido', estado.tipos.length > 0)
  $('limpa-tipos').hidden = !estado.tipos.length
  $('n-tipos').hidden = !estado.tipos.length
  $('n-tipos').textContent = String(estado.tipos.length)
  $('abre-tipos').setAttribute('aria-label', estado.tipos.length ? `Tipos, ${estado.tipos.length} filtrados` : 'Tipos')
  if ($('busca').value !== estado.busca) $('busca').value = estado.busca
  if (!j) { $('faixas').replaceChildren(); $('vazio').hidden = false; return }
  pintarPeriodo(j)
  const cortes = new Map((j.cortes || []).map((c) => [c.tier, c.min]))
  const faixas = (j.tiers || []).map((t, i) => faixa(t.tier, t.itens, cortes, false, i < 2)).filter(Boolean)
  $('faixas').replaceChildren(...faixas)
  let foraFaixas = []
  const buscando = normalizar(estado.busca) !== ''
  if ((estado.todas || buscando) && fora.length) {
    const grupos = new Map()
    for (const p of fora) {
      const t = p.tier || '?'
      if (!grupos.has(t)) grupos.set(t, [])
      grupos.get(t).push(p)
    }
    const ordem = [...(j.cortes || []).map((c) => c.tier), ...Object.keys(COR_TIER)]
    const pos = (t) => { const k = ordem.indexOf(t); return k < 0 ? ordem.length : k }
    foraFaixas = [...grupos.keys()].sort((a, b) => pos(a) - pos(b)).map((t) => faixa(t, grupos.get(t), cortes, true)).filter(Boolean)
    $('t-fora').textContent = `Fora do meta ${{ dia: 'hoje', semana: 'na semana', mes: 'no mês' }[estado.janela] || 'no período'}`
    $('fora-aviso').textContent = j.criterio === 'nota' && j.topo ? `em menos de ${fmtPct.format(j.minUsoTopo ?? 3)}% dos times do top ${fmt.format(j.topo)} no período; faixa pela força` : `sem uso shiny ${recorteDe(j)?.frase ?? 'no ranqueado'} no período`
  }
  $('fora-faixas').replaceChildren(...foraFaixas)
  $('fora').hidden = !foraFaixas.length
  equilibrarRaias()
  ajustarNomes()
  $('vazio').hidden = faixas.length + foraFaixas.length > 0
  $('vazio').textContent = buscando && !estado.tipos.length ? 'Nenhum shiny com esse nome no tier' : 'Nenhum pokémon com esses filtros.'
}

function faixa(tier, lista, cortes, apagada = false, destaque = false) {
  const itens = ordenar(filtrar(lista || []))
  if (!itens.length) return null
  const min = cortes.get(tier)
  return el('section', { class: `faixa${destaque ? ' destaque' : ''}${apagada ? ' apagada' : ''}`, style: `--cor:${COR_TIER[tier] || '#8b919c'}`, 'aria-label': `${apagada ? 'Fora do meta, tier' : 'Tier'} ${tier}`, title: janelaAtual()?.criterio !== 'nota' && ehNum(min) && Number(min) > 0 ? `Tier ${tier}: score ${fmt.format(min)} ou mais` : null }, [
    el('div', { class: 'faixa-rot' }, [el('b', { text: tier })]),
    el('div', { class: 'faixa-cartoes' }, itens.map(cartao))
  ])
}

function abrirTipos(v) {
  $('abre-tipos').setAttribute('aria-expanded', String(v))
  $('tipos').hidden = !v
}

function montarFiltros() {
  $('tipos').replaceChildren(
    ...TIPOS.map((t) => el('button', { type: 'button', class: 'chip-tipo', 'data-tipo': t, style: `--c:${COR_TIPO[t]}`, 'aria-pressed': 'false', text: NOME_TIPO[t] })),
    el('button', { type: 'button', class: 'limpa-tipos', id: 'limpa-tipos', text: 'Limpar', hidden: true })
  )
  const muda = () => { gravarHash(); pintar() }
  $('tipos').addEventListener('click', (e) => {
    if (e.target.closest('.limpa-tipos')) { estado.tipos = []; return muda() }
    const b = e.target.closest('.chip-tipo')
    if (!b) return
    const t = b.dataset.tipo
    estado.tipos = estado.tipos.includes(t) ? estado.tipos.filter((x) => x !== t) : [...estado.tipos, t]
    muda()
  })
  $('abre-tipos').addEventListener('click', () => abrirTipos($('tipos').hidden))
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !$('tipos').hidden) { abrirTipos(false); $('abre-tipos').focus() } })
  document.querySelectorAll('[data-janela]').forEach((b) => b.addEventListener('click', () => { estado.janela = b.dataset.janela; muda() }))
  document.querySelectorAll('[data-ordem]').forEach((b) => b.addEventListener('click', () => { estado.ordem = b.dataset.ordem; muda() }))
  $('todas').addEventListener('click', () => { estado.todas = !estado.todas; muda() })
  let espera = 0
  $('busca').addEventListener('input', (e) => {
    estado.busca = e.target.value
    clearTimeout(espera)
    espera = setTimeout(muda, 120)
  })
  const fecharExplica = () => { $('info-score').setAttribute('aria-expanded', 'false'); $('explica').hidden = true }
  $('info-score').addEventListener('click', (e) => {
    e.stopPropagation()
    const aberto = e.currentTarget.getAttribute('aria-expanded') === 'true'
    e.currentTarget.setAttribute('aria-expanded', String(!aberto))
    $('explica').hidden = aberto
  })
  document.addEventListener('click', (e) => { if (!$('explica').hidden && !$('explica').contains(e.target)) fecharExplica() })
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') fecharExplica() })
  addEventListener('hashchange', () => { lerHash(); pintar(); sincronizarFicha() })
  $('faixas').addEventListener('click', clicouCartao)
  $('fora-faixas').addEventListener('click', clicouCartao)
  montarFicha()
}

const STATS = [['hp', 'HP'], ['atk', 'Atk'], ['def', 'Def'], ['spAtk', 'SpA'], ['spDef', 'SpD'], ['speed', 'Vel']]
const ICO = {
  fechar: '<path d="M6 6l12 12M18 6 6 18"/>',
  evo: '<path d="M4 12h11M11 7l5 5-5 5"/><circle cx="19" cy="12" r="1.6"/>',
  escudo: '<path d="M12 3.5 19 6v5.5c0 4.3-3 7.6-7 9-4-1.4-7-4.7-7-9V6z"/><path d="M9 12l2 2 4-4"/>',
  stats: '<path d="M5 20V11M10 20V5M15 20v-7M20 20V8"/>',
  calc: '<rect x="5" y="2.5" width="14" height="19" rx="3"/><path d="M8.5 6.5h7M8.5 11h.01M12 11h.01M15.5 11h.01M8.5 14.5h.01M12 14.5h.01M8.5 18h.01M12 18h.01M15.5 14.5V18"/>',
  link: '<path d="M10 14a4.5 4.5 0 0 0 6.4 0l3-3a4.5 4.5 0 0 0-6.4-6.4l-1.2 1.2"/><path d="M14 10a4.5 4.5 0 0 0-6.4 0l-3 3a4.5 4.5 0 0 0 6.4 6.4l1.2-1.2"/>'
}
let motorP = null
let motorPronto = null
let fichaSeq = 0

function ico(nome, cls = '') {
  const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  s.setAttribute('viewBox', '0 0 24 24'); s.setAttribute('fill', 'none'); s.setAttribute('stroke', 'currentColor')
  s.setAttribute('stroke-width', '2.2'); s.setAttribute('stroke-linecap', 'round'); s.setAttribute('stroke-linejoin', 'round'); s.setAttribute('aria-hidden', 'true')
  if (cls) s.setAttribute('class', cls)
  s.innerHTML = ICO[nome]
  return s
}

function imgDe(looks, cls = '') {
  const tentativas = [...new Set(looks.filter(ehNum).map(Number))].map((l) => `${SPRITES}${l}.png`)
  const img = el('img', { alt: '', decoding: 'async', class: cls || null })
  const proxima = () => {
    const url = tentativas.shift()
    if (url) img.src = url
    else { img.onerror = null; img.src = BOLA; img.classList.add('bola') }
  }
  img.onerror = proxima
  proxima()
  return img
}

const chipTipo = (t) => el('span', { class: 'tipo', style: `--c:${COR_TIPO[t] || '#777'}`, text: NOME_TIPO[t] || t })
const tiposDoItem = (p) => (p.tipos || []).filter(Boolean).map((t) => String(t).toUpperCase())

function acharItem(id) {
  const j = janelaAtual()
  if (!j) return null
  for (const t of j.tiers || []) for (const p of t.itens || []) if (Number(p.speciesId) === id) return { p, tier: t.tier, fora: false }
  for (const p of j.foraDoMeta || []) if (Number(p.speciesId) === id) return { p, tier: p.tier, fora: true }
  return null
}

function carregarMotor() {
  motorP ??= import('../calculadora/motor.js')
  motorPronto ??= motorP.then(async (m) => { await m.carregar(); return m }).catch((e) => { motorPronto = null; throw e })
  return motorPronto
}

function bloco(icone, titulo, conteudo, cls = '') {
  return el('section', { class: `f-bloco ${cls}`.trim() }, [el('h3', {}, [ico(icone), titulo]), conteudo])
}

function abrirFicha(id) {
  estado.ficha = id
  gravarHash()
  sincronizarFicha()
}

function fecharFicha() {
  if (estado.ficha == null) return
  estado.ficha = null
  gravarHash()
  sincronizarFicha()
}

function sincronizarFicha() {
  const d = $('ficha')
  const achado = estado.ficha != null ? acharItem(estado.ficha) : null
  if (!achado) {
    if (estado.ficha != null) { estado.ficha = null; gravarHash() }
    if (d.open) d.close()
    return
  }
  if (Number(d.dataset.id) !== estado.ficha || !d.open) pintarFicha(achado)
  if (!d.open) d.showModal()
}

function pintarFicha({ p, tier, fora }) {
  const d = $('ficha')
  d.dataset.id = String(p.speciesId)
  const seq = ++fichaSeq
  const tipos = tiposDoItem(p)
  const score = ehNum(p.score) ? Math.round(p.score) : null
  const carga = () => el('span', { class: 'f-carga', text: 'Carregando…' })
  const defs = el('div', { class: 'f-defs' }, [carga()])
  const stats = el('div', { class: 'f-stats' }, [carga()])
  const noTopo = recorteDe(janelaAtual())?.frase ?? 'no topo do ranqueado'
  const jt = janelaAtual()
  const uso = [
    ehNum(p.usoTopo) ? (Number(p.usoTopo) > 0 ? `Em ${fmtPct.format(p.usoTopo)}% dos times do top ${fmt.format(jt?.topo ?? 100)}` : `Sem uso no top ${fmt.format(jt?.topo ?? 100)}`) : null,
    Number(p.uso) > 0 ? `Uso ${fmtPct.format(p.uso)}% ${noTopo}` : `Sem uso ${noTopo}`,
    ehNum(p.vitorias) ? `${fmtPct.format(p.vitorias)}% de vitórias` : null,
    Number(p.n) > 0 ? plural(p.n, 'partida', 'partidas') : null
  ].filter(Boolean).join(' · ')
  $('ficha-corpo').replaceChildren(
    el('button', { type: 'button', class: 'f-fechar', 'aria-label': 'Fechar', title: 'Fechar (Esc)', 'data-fechar': '' }, [ico('fechar')]),
    el('header', { class: 'f-cab', style: `--cor:${COR_TIER[tier] || '#8b919c'}` }, [
      el('span', { class: 'f-arte' }, [imgDe([p.looktype, p.lookNormal, 60000 + Number(p.speciesId)]), el('i', { class: 'f-brilho', 'aria-hidden': 'true', text: '✦' })]),
      el('div', { class: 'f-id' }, [
        el('h2', { id: 'ficha-nome', text: p.nome }),
        el('div', { class: 'f-linha' }, [
          el('span', { class: 'f-tier', text: tier || '?', title: fora ? 'Tier pela força; pouco usado no período' : `Tier ${tier}` }),
          el('span', { class: 'f-score' }, [el('b', { text: score != null ? fmt.format(score) : '—' }), el('small', { text: 'Score PvP' })])
        ]),
        tipos.length ? el('span', { class: 'tipos' }, tipos.map(chipTipo)) : null
      ])
    ]),
    bloco('escudo', 'Contra tipos', defs),
    bloco('stats', 'Atributos base', stats),
    el('p', { class: 'f-uso', text: fora ? `${uso} · fora do meta no período` : uso }),
    el('div', { class: 'f-pe' }, [el('a', { class: 'botao pequeno', href: linkCalc(p) }, [ico('calc'), 'Abrir na calculadora'])])
  )
  carregarMotor().then((m) => {
    if (seq !== fichaSeq) return
    defs.replaceChildren(...pintarDefesas(tipos, m.TABELA_TIPOS, m.AMPLIACAO_TIPOS || {}))
    stats.replaceChildren(...pintarStats(m.especie(p.speciesId)?.base))
  }).catch(() => {
    if (seq !== fichaSeq) return
    for (const n of [defs, stats]) n.replaceChildren(el('span', { class: 'f-carga', text: 'Não deu para carregar.' }))
  })
}

const fmtMult = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 })

function pintarDefesas(tipos, tabela, ampliacao) {
  if (!tabela || !tipos.length) return [el('span', { class: 'f-carga', text: 'Sem dados de tipo.' })]
  const grupos = { fraco: [], resiste: [], imune: [] }
  for (const atq of TIPOS) {
    const linha = tabela[atq] || {}
    let v = 1
    for (const t of tipos) v *= linha[t] ?? 1
    if (v === 1) continue
    const real = ampliacao[v] ?? v
    ;(v === 0 ? grupos.imune : v > 1 ? grupos.fraco : grupos.resiste).push([atq, real])
  }
  grupos.fraco.sort((a, b) => b[1] - a[1])
  grupos.resiste.sort((a, b) => a[1] - b[1])
  const chip = ([t, v]) => el('span', { class: 'tipo f-mult', style: `--c:${COR_TIPO[t] || '#777'}` }, [NOME_TIPO[t] || t, el('small', { text: `×${fmtMult.format(v)}` })])
  const grupo = (rot, itens, cls) => el('div', { class: `f-def ${cls}` }, [el('span', { class: 'f-def-rot', text: rot }), itens.length ? el('span', { class: 'f-def-tipos' }, itens.map(chip)) : el('span', { class: 'f-def-nada', text: 'nenhuma' })])
  return [
    grupo('Fraquezas', grupos.fraco, 'fraco'),
    grupo('Resistências', grupos.resiste, 'resiste'),
    grupo('Imunidades', grupos.imune, 'imune'),
    el('p', { class: 'f-def-nota', text: 'Multiplicadores do combate do jogo: ×2 vale ×2,5 e ×4 vale ×5,5; ×½ vale ×0,33 e ×¼ vale ×0,17.' })
  ]
}

function pintarStats(base) {
  if (!base) return [el('span', { class: 'f-carga', text: 'Sem atributos.' })]
  const max = Math.max(160, ...STATS.map(([k]) => Number(base[k]) || 0))
  return STATS.map(([k, rot]) => {
    const v = Number(base[k]) || 0
    const cor = v >= 120 ? '#4ade80' : v >= 90 ? '#facc15' : v >= 60 ? '#fb923c' : '#f87171'
    return el('div', { class: 'f-stat' }, [el('span', { text: rot }), el('b', { text: fmt.format(v) }), el('i', { style: `--c:${cor}` }, [el('i', { style: `width:${Math.min(100, (v / max) * 100).toFixed(1)}%` })])])
  })
}

function montarFicha() {
  const d = $('ficha')
  d.addEventListener('click', (e) => {
    if (e.target === d || e.target.closest('[data-fechar]')) return fecharFicha()
  })
  d.addEventListener('cancel', (e) => { e.preventDefault(); fecharFicha() })
  d.addEventListener('close', () => { if (estado.ficha != null) fecharFicha() })
}

function clicouCartao(e) {
  const a = e.target.closest('a.poke[data-id]')
  if (!a || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
  e.preventDefault()
  abrirFicha(Number(a.dataset.id))
}

function temporadaTxt(t) {
  if (ehNum(t)) return `Temporada ${t}`
  const d = dia(t)
  return d ? `Temporada de ${d}` : ''
}

function pintarCabecalho() {
  const g = new Date(dados.geradoEm)
  const filhos = []
  if (!Number.isNaN(g.getTime())) filhos.push(' · ', el('b', { text: `${fmtDia.format(g)} às ${fmtHora.format(g)}` }))
  const p = janelasDe(dados).dia?.partidas ?? dados.partidas
  if (ehNum(p)) filhos.push(' · ', el('b', { text: fmt.format(p) }), Number(p) === 1 ? ' partida' : ' partidas')
  if (filhos.length) {
    $('atualizado').replaceChildren(...filhos)
    $('atualizado').hidden = false
  }
  const versao = [temporadaTxt(dados.temporada), dados.versaoJogo ? `jogo ${dados.versaoJogo}` : ''].filter(Boolean).join(' · ')
  const bloco = (ico, tit, txt) => el('div', { class: 'ex-bloco' }, [el('span', { class: 'ex-ico', 'aria-hidden': 'true', text: ico }), el('b', { text: tit }), el('span', { text: txt })])
  $('explica').replaceChildren(
    el('div', { class: 'ex-cab' }, [el('b', { text: 'Como o tier é feito' })]),
    el('div', { class: 'ex-grade' }, [
      bloco('⚔', 'Partidas reais', 'Lutas ranqueadas do dia, do Mestre ao Challenger. Sem lendários e míticos.'),
      bloco('★', 'Força + uso', 'Quanto o pokémon bate e aguenta, somado a quanto o top escolhe ele.'),
      bloco('↻', '2x por dia', 'Renova à 0h e às 12h com as lutas novas.')
    ]),
    ...(versao ? [el('small', { class: 'ex-pe', text: versao })] : [])
  )
}

async function iniciar() {
  const carga = $('carga')
  carga.classList.remove('falhou')
  $('carga-erro').hidden = true
  try {
    const r = await fetch('tier.json', { cache: 'no-cache' })
    if (!r.ok) throw new Error(`HTTP ${r.status}`)
    dados = await r.json()
  } catch {
    carga.classList.add('falhou')
    $('carga-erro-txt').textContent = 'Não deu para carregar o tier agora.'
    $('carga-erro').hidden = false
    avisarPainel('falhou')
    return
  }
  pintarCabecalho()
  carga.hidden = true
  $('tier').hidden = false
  pintar()
  sincronizarFicha()
  avisarPainel('pronto')
}

function avisarPainel(estadoCarga) {
  if (EMBED && parent !== window) parent.postMessage({ pokepocketTier: estadoCarga, geradoEm: dados?.geradoEm ?? null }, '*')
}

if (EMBED) {
  document.documentElement.classList.add('embed')
  if (parent !== window && typeof ResizeObserver === 'function') {
    let ultima = 0
    const medir = () => {
      const h = Math.ceil(document.documentElement.scrollHeight)
      if (Math.abs(h - ultima) > 1) { ultima = h; parent.postMessage({ pokepocketTier: 'altura', altura: h }, '*') }
    }
    new ResizeObserver(medir).observe(document.body)
    addEventListener('load', medir)
    if (matchMedia('(pointer: coarse)').matches) {
      let x0 = 0, y0 = 0, yAnt = 0, tAnt = 0, vel = 0, modo = null
      const rolavel = (el) => { for (let e = el; e && e !== document.body; e = e.parentElement) { const c = getComputedStyle(e); if (/(auto|scroll)/.test(c.overflowY) && e.scrollHeight > e.clientHeight + 1) return true } return false }
      addEventListener('touchstart', (e) => {
        const t = e.touches[0]
        x0 = t.clientX; y0 = yAnt = t.clientY; tAnt = performance.now(); vel = 0
        modo = e.touches.length > 1 || rolavel(e.target) ? 'livre' : null
        parent.postMessage({ pokepocketTier: 'parar' }, '*')
      }, { passive: true })
      addEventListener('touchmove', (e) => {
        if (modo === 'livre') return
        const t = e.touches[0]
        if (!modo) {
          const dx = Math.abs(t.clientX - x0), dy = Math.abs(t.clientY - y0)
          if (dx < 6 && dy < 6) return
          modo = dy > dx ? 'vertical' : 'livre'
          if (modo === 'livre') return
        }
        e.preventDefault()
        const agora = performance.now()
        const d = yAnt - t.clientY
        const dt = Math.max(1, agora - tAnt)
        vel = 0.8 * (d / dt) + 0.2 * vel
        yAnt = t.clientY; tAnt = agora
        parent.postMessage({ pokepocketTier: 'rolar', dy: d }, '*')
      }, { passive: false })
      addEventListener('touchend', () => {
        if (modo === 'vertical' && performance.now() - tAnt < 80) parent.postMessage({ pokepocketTier: 'soltar', v: vel }, '*')
        modo = null
      }, { passive: true })
    }
  }
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href]')
    if (a && !a.closest('.poke') && !a.getAttribute('href').startsWith('#')) a.target = '_blank'
  }, true)
}
lerHash()
montarFiltros()
$('carga-tentar').addEventListener('click', () => location.reload())
iniciar()
