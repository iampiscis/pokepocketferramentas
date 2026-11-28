import * as motor from './motor.js'
import { codificarCompacto, decodificarCompacto, marcarIsolado } from './link.js'

const STATS = [['hp', 'HP'], ['atk', 'ATK'], ['def', 'DEF'], ['spAtk', 'SP.ATK'], ['spDef', 'SP.DEF'], ['speed', 'VEL']]
const TIPOS = ['NORMAL', 'FIRE', 'WATER', 'GRASS', 'ELECTRIC', 'ICE', 'FIGHTING', 'POISON', 'GROUND', 'FLYING', 'PSYCHIC', 'BUG', 'ROCK', 'GHOST', 'DRAGON', 'DARK', 'STEEL', 'FAIRY']
const NOME_TIPO = { NORMAL: 'Normal', FIRE: 'Fogo', WATER: 'Água', ELECTRIC: 'Elétrico', GRASS: 'Planta', ICE: 'Gelo', FIGHTING: 'Lutador', POISON: 'Veneno', GROUND: 'Terra', FLYING: 'Voador', PSYCHIC: 'Psíquico', BUG: 'Inseto', ROCK: 'Pedra', GHOST: 'Fantasma', DRAGON: 'Dragão', DARK: 'Sombrio', STEEL: 'Aço', FAIRY: 'Fada' }
const COR_TIPO = { NORMAL: '#9a9a6e', FIRE: '#e8742a', WATER: '#4f7fe6', ELECTRIC: '#d9b51c', GRASS: '#5fae38', ICE: '#5ec2be', FIGHTING: '#b8302a', POISON: '#9a3c98', GROUND: '#c9a24c', FLYING: '#8f78e0', PSYCHIC: '#ec4b7d', BUG: '#94a61a', ROCK: '#a8952f', GHOST: '#6a4f8f', DRAGON: '#6a35ea', DARK: '#6a5345', STEEL: '#8c8cae', FAIRY: '#d0739f' }
const FAIXAS = [[0, 'Baixo', '#f87171'], [300, 'Regular', '#fb923c'], [500, 'Bom', '#facc15'], [700, 'Excelente', '#4ade80']]
const COR_POT = { 1: '#b9aeb3', 2: '#6bc96b', 3: '#1fa5f5', 4: '#be66ff', 5: '#ffc02e' }
const FAIXAS_NOTA = [[1, 'Extremamente fraco', '#b0b5bc'], [2, 'Fraco', '#c94444'], [3, 'Mediano', '#f08830'], [4, 'Razoável', '#3a9a5c'], [5, 'Bom', '#8ee4a8'], [6, 'Forte', '#42ff9a'], [7, 'Poderoso', '#c8b4ff'], [8, 'Mítico', '#d896ff'], [9, 'Lendário', '#ffb8dc'], [Infinity, 'Divino', '#ff7ec8']]
const corQual = (q) => COR_POT[q >= 1.7 ? 5 : q >= 1.5 ? 4 : q >= 1.4 ? 3 : q >= 1.2 ? 2 : 1]
const corIv = (v) => (v <= 6 ? '#ff6b6b' : v <= 10 ? '#ff9a3c' : v <= 14 ? '#ffd93d' : v <= 26 ? '#2ecc71' : '#7dff9a')
const faixaNota = (n) => FAIXAS_NOTA.find(([ate]) => Number(n) <= ate) || FAIXAS_NOTA[FAIXAS_NOTA.length - 1]
const opcoesPot = () => [1, 2, 3, 4, 5].map((n) => [n, `P${n}`, COR_POT[n]])
const NIVEL_MAX = 10000

const ICONES = {
  nivel: '<path d="M5 21V4"/><path d="M5 4.5c3-1.6 5.5 1.6 8.5 0s4.5-.5 5.5 0v8c-1 .5-2.5 1.6-5.5 0s-5.5 1.6-8.5 0"/>',
  forma: '<path d="M12 3.5l7.5 4.3v8.4L12 20.5l-7.5-4.3V7.8z"/><path d="M12 15.5v-7M8.8 11.8 12 8.5l3.2 3.3"/>',
  nascimento: '<path d="M12 3.5c3.6 0 6.5 4.7 6.5 9.2A6.5 6.5 0 0 1 5.5 12.7C5.5 8.2 8.4 3.5 12 3.5z"/><path d="M9.5 13.5l1.8 1.8 3.4-3.8"/>',
  zmove: '<circle cx="12" cy="12" r="8.5"/><path d="M8.5 8h7l-7 8h7"/>',
  refino: '<path d="M7 3.5h10l3 5-8 12-8-12z"/><path d="M4 8.5h16M9.5 3.5 12 8.5l2.5-5M12 8.5v12"/>',
  pvp: '<path d="M4 4l7.5 7.5M20 4l-7.5 7.5M4.5 15.5l4 4M19.5 15.5l-4 4M6 18l-2 2M18 18l2 2"/>',
  pve: '<circle cx="12" cy="12" r="7.5"/><circle cx="12" cy="12" r="3"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3"/>',
  nota: '<path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z"/>',
  poderPvp: '<path d="M13 2.5 5 13.5h6l-1 8 8-11h-6z"/>',
  poderPve: '<path d="M3 19.5 9 9l4 6 2.5-3.5 5.5 8z"/><circle cx="16.5" cy="6" r="2"/>',
  golpe: '<path d="M4.5 19.5 14 10M14 10l1.5-5.5L20 3l-1.5 4.5L13 9zM9 15l-3-3M7.5 13.5 4 10"/>',
  stats: '<path d="M5 20V11M10 20V5M15 20v-7M20 20V8"/>',
  gema: '<path d="M6.5 4.5h11l3.5 5-9 10.5L3 9.5z"/><path d="M3 9.5h18M9.5 4.5 12 9.5l2.5-5M12 9.5V20"/>',
  estrela: '<path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z"/>',
  area: '<circle cx="12" cy="12" r="3"/><circle cx="12" cy="12" r="8" stroke-dasharray="3 3"/>'
}

const fmt = new Intl.NumberFormat('pt-BR')
const fmt1 = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
const fmt3 = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 3, maximumFractionDigits: 3 })
const fmtNota = (v) => fmt3.format(Number(v))
const fmt2 = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const fmtCurto = new Intl.NumberFormat('pt-BR', { notation: 'compact', maximumFractionDigits: 1 })
const ehNum = (v) => v != null && v !== '' && Number.isFinite(Number(v))
const grande = (v) => (!ehNum(v) ? '—' : Math.abs(v) >= 100000 ? fmtCurto.format(v) : fmt.format(Math.round(v)))
const inteiro = (v, min, max) => Math.min(max, Math.max(min, Math.round(Number(v) || 0)))
const nomeTipo = (t) => NOME_TIPO[String(t || '').toUpperCase()] || t || ''

const $ = (id) => document.getElementById(id)

function el(tag, props = {}, filhos = []) {
  const n = document.createElement(tag)
  for (const [k, v] of Object.entries(props)) {
    if (v == null || v === false) continue
    if (k === 'class') n.className = v
    else if (k === 'text') n.textContent = v
    else if (k === 'style') n.style.cssText = v
    else if (k.startsWith('on')) n.addEventListener(k.slice(2), v)
    else n.setAttribute(k, v === true ? '' : String(v))
  }
  for (const f of [].concat(filhos)) if (f != null && f !== false) n.append(f)
  return n
}

function ico(k, px = 20, classe = 'ico') {
  const s = el('span', { class: classe, 'aria-hidden': 'true' })
  s.innerHTML = `<svg viewBox="0 0 24 24" width="${px}" height="${px}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${ICONES[k]}</svg>`
  return s
}

const st = { pronto: false, hoje: null, nomeHoje: '', sim: null, formas: [], res: null, seq: 0, timer: 0, ultimoHash: '', precos: new Map(), ui: {} }

function normal(x = {}) {
  const ivs = {}
  const refino = {}
  for (const [k] of STATS) {
    ivs[k] = inteiro(x.ivs?.[k], 0, 32)
    refino[k] = k === 'speed' ? 0 : inteiro(x.refino?.[k], 0, 999)
  }
  const q = Number(x.quality)
  const tm = String(x.tmElemental || '').toUpperCase()
  return {
    speciesId: Number(x.speciesId) || null,
    level: inteiro(x.level || 1, 1, NIVEL_MAX),
    potencia: inteiro(x.potencia || 1, 1, 5),
    quality: q > 0 ? Math.round(q * 1000) / 1000 : 1,
    shiny: !!x.shiny,
    ivs,
    refino,
    tmElemental: TIPOS.includes(tm) ? tm : null,
    tmFisico: !!x.tmFisico,
    tmAoe: !!x.tmAoe
  }
}

const pkDe = (x) => ({ speciesId: x.speciesId, level: x.level, potencia: x.potencia, quality: x.quality, shiny: x.shiny, ivs: { ...x.ivs }, refino: { ...x.refino }, tmElemental: x.tmElemental, tmFisico: x.tmFisico, tmAoe: x.tmAoe })
const padraoSim = (h) => ({ ...pkDe(h) })
const somaRefino = (r) => STATS.reduce((t, [k]) => t + (r?.[k] || 0), 0)
const somaIvs = (r) => STATS.reduce((t, [k]) => t + (r?.[k] || 0), 0)

function especie(sid) {
  try { return motor.especie(Number(sid)) || null } catch { return null }
}

function lookDe(f, shiny) {
  if (!f) return null
  return shiny && f.lookShiny != null && f.lookShiny !== f.looktype ? [f.lookShiny, f.looktype] : f.looktype
}

function sprite(looktype, tam) {
  const caixa = el('span', { class: 'sprite', style: `width:${tam}px;height:${tam}px`, 'aria-hidden': 'true' })
  let s = null
  for (const lt of [].concat(looktype)) {
    if (lt == null) continue
    try { s = motor.sprite(lt) } catch { s = null }
    if (s?.url) break
  }
  if (!s?.url) {
    caixa.classList.add('sem')
    return caixa
  }
  const cel = Number(s.cell) || 32
  const fw = Number(s.w ?? s.largura) || cel
  const fh = Number(s.h ?? s.altura) || cel
  const [x0, y0, x1, y1] = Array.isArray(s.caixa) && s.caixa.length === 4 && s.caixa[2] > s.caixa[0] && s.caixa[3] > s.caixa[1] ? s.caixa.map(Number) : [0, 0, fw, fh]
  const w = Math.max(1, x1 - x0)
  const h = Math.max(1, y1 - y0)
  const esc = (tam * 0.88) / Math.max(w, h)
  const img = el('i', { style: `width:${w}px;height:${h}px;background-position:${-((Number(s.x) || 0) + x0)}px ${-((Number(s.y) || 0) + y0)}px;transform:translate(-50%,-50%) scale(${esc.toFixed(4)})` })
  img.style.backgroundImage = `url("${String(s.url).replace(/"/g, '%22')}")`
  caixa.append(img)
  return caixa
}

function tiposDe(lista) {
  const tipos = (lista || []).filter(Boolean)
  if (!tipos.length) return null
  return el('span', { class: 'tipos' }, tipos.map((t) => el('span', { class: 'tipo', style: `--c:${COR_TIPO[String(t).toUpperCase()] || '#777'}`, text: nomeTipo(t) })))
}

function passos({ valor, min, max, passo = 1, casas = 0, rotulo, aoMudar, classe = '' }) {
  const mostrar = (v) => (casas ? v.toLocaleString('pt-BR', { minimumFractionDigits: casas, maximumFractionDigits: casas }) : fmt.format(v))
  const ler = (t) => {
    const s = String(t).trim()
    if (!s) return NaN
    return casas ? Number(s.replace(',', '.').replace(/[^\d.]/g, '')) : Number(s.replace(/\D/g, ''))
  }
  const lim = (v) => Math.min(max, Math.max(min, casas ? Math.round(v * 10 ** casas) / 10 ** casas : Math.round(v)))
  let atual = lim(Number(valor) || min)
  const campo = el('input', { type: 'text', class: 'campo', inputmode: casas ? 'decimal' : 'numeric', autocomplete: 'off', 'aria-label': rotulo, value: mostrar(atual) })
  const aplicar = (v) => {
    const n = lim(v)
    campo.value = mostrar(n)
    if (n !== atual) {
      atual = n
      aoMudar(n)
    }
  }
  campo.addEventListener('input', () => {
    const v = ler(campo.value)
    if (!Number.isFinite(v)) return
    const n = lim(v)
    if (n === v && n !== atual) {
      atual = n
      aoMudar(n)
    }
  })
  campo.addEventListener('change', () => {
    const v = ler(campo.value)
    aplicar(Number.isFinite(v) ? v : atual)
  })
  campo.addEventListener('focus', () => { try { campo.select() } catch {} })
  campo.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') campo.blur()
    else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault()
      aplicar(atual + (e.key === 'ArrowUp' ? passo : -passo))
    }
  })
  const bt = (d, txt) => el('button', { type: 'button', class: 'passo', 'aria-label': `${d > 0 ? 'Mais' : 'Menos'} ${rotulo}`, text: txt, onclick: () => aplicar(atual + d) })
  const raiz = el('div', { class: `passos ${classe}`.trim() }, [bt(-passo, '−'), campo, bt(passo, '+')])
  raiz.definir = (v) => {
    atual = lim(v)
    campo.value = mostrar(atual)
  }
  return raiz
}

function seg(opcoes, atual, aoMudar, rotulo, classe = '') {
  const bts = opcoes.map(([k, txt, cor]) => el('button', { type: 'button', 'aria-pressed': String(k === atual), text: txt, style: cor ? `--pc:${cor}` : null }))
  const definir = (k) => bts.forEach((b, i) => b.setAttribute('aria-pressed', String(opcoes[i][0] === k)))
  bts.forEach((b, i) => b.addEventListener('click', () => {
    definir(opcoes[i][0])
    aoMudar(opcoes[i][0])
  }))
  const raiz = el('div', { class: `seg ${classe}`.trim(), role: 'group', 'aria-label': rotulo }, bts)
  raiz.definir = definir
  return raiz
}

function alternar(rotulo, icone, ligado, aoMudar, classe = '') {
  const b = el('button', { type: 'button', class: `chip ${classe}`.trim(), 'aria-pressed': String(ligado) }, [ico(icone, 16, 'ico-chip'), el('span', { text: rotulo })])
  b.addEventListener('click', () => {
    const v = b.getAttribute('aria-pressed') !== 'true'
    b.setAttribute('aria-pressed', String(v))
    aoMudar(v)
  })
  b.definir = (v) => b.setAttribute('aria-pressed', String(!!v))
  return b
}

function bloco(icone, titulo, filhos, resumo = '') {
  const r = el('span', { class: 'resumo', text: resumo })
  const no = el('section', { class: 'bloco vao' }, [el('div', { class: 'bloco-cab' }, [ico(icone), el('h3', { text: titulo }), r]), ...filhos])
  no.resumo = r
  return no
}

function celula(rotulo, controle) {
  return el('label', { class: 'celula' }, [el('span', { text: rotulo }), controle])
}

function codificar() {
  const h = st.hoje
  const s = st.sim
  const p = new URLSearchParams()
  const lista = (r) => STATS.map(([k]) => r[k] || 0).join('.')
  p.set('e', h.speciesId)
  p.set('n', h.level)
  p.set('p', h.potencia)
  p.set('q', h.quality)
  if (h.shiny) p.set('s', '1')
  p.set('iv', lista(h.ivs))
  if (somaRefino(h.refino)) p.set('r', lista(h.refino))
  if (h.tmElemental) {
    p.set('hz', h.tmElemental.toLowerCase())
    if (h.tmFisico) p.set('hzf', '1')
  }
  if (h.tmAoe) p.set('hza', '1')
  if (s.speciesId !== h.speciesId) p.set('f', s.speciesId)
  p.set('sn', s.level)
  if (s.potencia !== h.potencia) p.set('sp', s.potencia)
  if (s.shiny !== h.shiny) p.set('ss', s.shiny ? '1' : '0')
  if (somaRefino(s.refino) || somaRefino(h.refino)) p.set('sr', lista(s.refino))
  if (s.tmElemental) {
    p.set('z', s.tmElemental.toLowerCase())
    if (s.tmFisico) p.set('zf', '1')
  }
  if (s.tmAoe) p.set('za', '1')
  return p.toString()
}

function decodificar(txt) {
  const p = new URLSearchParams(String(txt || '').replace(/^#/, ''))
  const sid = Number(p.get('e'))
  if (!(sid > 0) || !especie(sid)) return null
  const lista = (v) => {
    const a = String(v || '').split('.').map(Number)
    return Object.fromEntries(STATS.map(([k], i) => [k, a[i] || 0]))
  }
  const hoje = { speciesId: sid, level: Number(p.get('n')) || 100, potencia: Number(p.get('p')) || 1, quality: Number(p.get('q')) || 1, shiny: p.get('s') === '1', ivs: lista(p.get('iv')), refino: lista(p.get('r')), tmElemental: p.get('hz') ? p.get('hz').toUpperCase() : null, tmFisico: p.get('hzf') === '1', tmAoe: p.get('hza') === '1' }
  const sim = {
    ...hoje,
    speciesId: Number(p.get('f')) || sid,
    level: Number(p.get('sn')) || hoje.level,
    potencia: p.has('sp') ? Number(p.get('sp')) : hoje.potencia,
    shiny: p.has('ss') ? p.get('ss') === '1' : hoje.shiny,
    refino: lista(p.get('sr')),
    tmElemental: p.get('z') ? p.get('z').toUpperCase() : null,
    tmFisico: p.get('zf') === '1',
    tmAoe: p.get('za') === '1'
  }
  return { hoje, sim }
}

function gravarEstado() {
  if (!st.hoje) return
  const cod = `k=${codificarCompacto({ hoje: st.hoje, sim: st.sim })}`
  st.ultimoHash = cod
  try { history.replaceState(null, '', `${location.pathname}${location.search}#${cod}`) } catch {}
}

function aplicarCodigo(txt) {
  let d = null
  const k = /^#?k=([A-Za-z0-9_-]+)$/.exec(String(txt || ''))
  if (k) {
    try {
      const c = decodificarCompacto(k[1])
      if (especie(c.hoje.speciesId)) d = { hoje: c.hoje, sim: { ...c.sim, ivs: c.hoje.ivs, quality: c.hoje.quality } }
    } catch {}
  } else d = decodificar(txt)
  if (!d) return false
  definirHoje(d.hoje, d.sim)
  return true
}

function carregarFormas(sid) {
  let lista = []
  try { lista = motor.formas(sid) || [] } catch {}
  const visto = new Set()
  const out = []
  for (const f of lista) {
    const id = Number(f?.speciesId)
    if (!(id > 0) || visto.has(id)) continue
    visto.add(id)
    out.push({ ...f, speciesId: id })
  }
  if (!visto.has(sid)) {
    const e = especie(sid)
    if (e) out.unshift(e)
  }
  return out
}

function formaSim() {
  return st.formas.find((f) => f.speciesId === st.sim.speciesId) || especie(st.sim.speciesId)
}

function definirHoje(h, simSalvo = null, recolher = true) {
  st.hoje = normal(h)
  const e = especie(st.hoje.speciesId)
  st.nomeHoje = e?.nome || h.nome || 'Pokémon'
  st.formas = carregarFormas(st.hoje.speciesId)
  st.sim = simSalvo ? normal({ ...simSalvo, ivs: st.hoje.ivs, quality: st.hoje.quality }) : padraoSim(st.hoje)
  if (!st.formas.some((f) => f.speciesId === st.sim.speciesId)) st.sim.speciesId = st.hoje.speciesId
  st.res = null
  limparConferir()
  montarEditorHoje()
  montarSimulacao()
  pintarIdentidade()
  abrirEntrada(!recolher)
  $('cartao-sim').hidden = false
  agendar(true)
}

function hojeMudou(campo, antes) {
  const h = st.hoje
  const s = st.sim
  s.ivs = { ...h.ivs }
  s.quality = h.quality
  if (campo === 'potencia' && s.potencia === antes) s.potencia = h.potencia
  if (campo === 'shiny' && s.shiny === antes) s.shiny = h.shiny
  if (campo === 'level' && s.level < h.level) s.level = h.level
  montarSimulacao()
  pintarIdentidade()
  agendar()
}

function montarEditorHoje() {
  const h = st.hoje
  const caixa = $('editor-hoje')
  if (!h) return caixa.replaceChildren()
  const muda = (campo) => (v) => {
    const antes = h[campo]
    h[campo] = v
    hojeMudou(campo, antes)
  }
  const nivel = passos({ valor: h.level, min: 1, max: NIVEL_MAX, passo: 10, rotulo: 'nível de hoje', aoMudar: muda('level') })
  const mudaQual = muda('quality')
  const qual = passos({ valor: h.quality, min: 0.5, max: 2, passo: 0.001, casas: 3, rotulo: 'qualidade', classe: 'colorido', aoMudar: (v) => { qual.style.setProperty('--vc', corQual(v)); mudaQual(v) } })
  qual.style.setProperty('--vc', corQual(h.quality))
  const pot = seg(opcoesPot(), h.potencia, muda('potencia'), 'Potência de hoje', 'pot')
  const shiny = alternar('Shiny', 'estrela', h.shiny, muda('shiny'), 'shiny')
  const ivs = STATS.map(([k, rot]) => {
    const p = passos({ valor: h.ivs[k], min: 0, max: 32, rotulo: `IV de ${rot}`, classe: 'colorido', aoMudar: (v) => { h.ivs[k] = v; p.style.setProperty('--vc', corIv(v)); p.classList.toggle('brilho', v >= 27); hojeMudou('ivs') } })
    p.style.setProperty('--vc', corIv(h.ivs[k]))
    p.classList.toggle('brilho', h.ivs[k] >= 27)
    return celula(rot, p)
  })
  caixa.replaceChildren(
    el('div', { class: 'duas-col' }, [celula('Nível', nivel), celula('Qualidade', qual)]),
    el('div', { class: 'linha' }, [el('div', { style: 'flex:1 1 220px;min-width:0' }, [pot]), shiny]),
    el('div', {}, [el('span', { class: 'sub', text: 'IVs (0 a 32)' }), el('div', { class: 'grade6' }, ivs)])
  )
}

function abrirEntrada(abrir) {
  const tem = !!st.hoje
  const aberta = !tem || abrir
  $('entrada').hidden = !aberta
  $('novo').hidden = !tem || aberta
  $('trocar').hidden = !tem
  $('trocar').textContent = aberta ? 'Fechar' : 'Editar'
  $('trocar').setAttribute('aria-expanded', String(aberta))
}

function pintarIdentidade() {
  const h = st.hoje
  const box = $('identidade')
  if (!h) return (box.hidden = true)
  const e = especie(h.speciesId)
  const dado = (rot, v, no = null, attrs = {}) => el('span', attrs, [el('small', { text: rot }), no || el('b', { text: v })])
  st.ui.notaHoje = el('b', { text: ehNum(st.res?.h?.nota) ? fmtNota(st.res.h.nota) : '—' })
  st.ui.notaHojeCel = null
  const ref = somaRefino(h.refino)
  box.replaceChildren(
    el('div', { class: 'id-topo' }, [
      sprite(lookDe(e, h.shiny), 60),
      el('div', { style: 'min-width:0' }, [
        el('div', { class: 'id-nome' }, [el('strong', { text: st.nomeHoje }), h.shiny ? ico('estrela', 16, 'estrela') : null, el('span', { class: 'id-hoje', text: 'Hoje' })]),
        el('div', { style: 'margin-top:3px' }, [tiposDe(e?.tipos)])
      ])
    ]),
    el('div', { class: 'id-dados' }, [
      dado('Nível', fmt.format(h.level)),
      dado('Pot', `P${h.potencia}`, null, { class: 'pot-cel', style: `--pc:${COR_POT[h.potencia]}` }),
      dado('Qual', fmt3.format(h.quality), null, { style: `--vc:${corQual(h.quality)}`, class: 'cor-cel' }),
      (st.ui.notaHojeCel = dado('Nota', '', st.ui.notaHoje, { class: 'cor-cel' }))
    ]),
    el('div', { class: 'id-sub' }, [el('span', { text: 'IVs' }), el('span', { text: `${fmt.format(somaIvs(h.ivs))}/192${ref ? ` · refino +${fmt.format(ref)}` : ''}${h.tmElemental ? ` · Z-\u2060Move ${nomeTipo(h.tmElemental)}` : ''}${h.tmAoe ? ' · AoE' : ''}` })]),
    el('div', { class: 'id-ivs' }, STATS.map(([k, rot]) => dado(rot, fmt.format(h.ivs[k]), null, { class: `cor-cel${h.ivs[k] >= 27 ? ' brilho' : ''}`, style: `--vc:${corIv(h.ivs[k])}` })))
  )
  pintarNotaHoje()
  box.hidden = false
}

function pintarNotaHoje() {
  const n = st.res?.h?.nota
  if (!st.ui.notaHoje) return
  st.ui.notaHoje.textContent = ehNum(n) ? fmtNota(n) : '—'
  if (st.ui.notaHojeCel) {
    const f = ehNum(n) ? faixaNota(n) : null
    st.ui.notaHojeCel.style.setProperty('--vc', f ? f[2] : 'var(--tinta)')
    st.ui.notaHojeCel.setAttribute('aria-label', f ? `Nota ${f[1]}` : 'Nota')
  }
}

function montarSimulacao() {
  const h = st.hoje
  const s = st.sim
  const caixa = $('controles')
  const ui = (st.ui.sim = {})
  const mudou = () => {
    resumos()
    agendar()
  }

  const regua = el('input', { type: 'range', class: 'regua', min: 1, max: NIVEL_MAX, step: 1, value: s.level, 'aria-label': 'Nível simulado' })
  const nivel = passos({ valor: s.level, min: 1, max: NIVEL_MAX, passo: 100, rotulo: 'nível simulado', aoMudar: (v) => { s.level = v; regua.value = String(v); mudou() } })
  regua.addEventListener('input', () => { s.level = Number(regua.value); nivel.definir(s.level); mudou() })
  ui.nivel = bloco('nivel', 'Nível', [el('div', { class: 'nivel-linha' }, [nivel, regua])])

  let secForma = null
  if (st.formas.length > 1) {
    const bts = st.formas.map((f) => {
      const b = el('button', { type: 'button', class: `forma${f.mega ? ' mega' : ''}`, 'aria-pressed': String(f.speciesId === s.speciesId) }, [sprite(lookDe(f, s.shiny), 34), el('span', { text: f.nome })])
      b.addEventListener('click', () => {
        s.speciesId = f.speciesId
        bts.forEach((x) => x.setAttribute('aria-pressed', String(x === b)))
        mudou()
      })
      return b
    })
    secForma = bloco('forma', 'Forma', [el('div', { class: 'formas' }, bts)])
    ui.forma = secForma
  }

  const pot = seg(opcoesPot(), s.potencia, (v) => { s.potencia = v; mudou() }, 'Potência simulada', 'pot')
  const shiny = alternar('Shiny', 'estrela', s.shiny, (v) => {
    s.shiny = v
    if (secForma) secForma.querySelectorAll('.forma').forEach((b, i) => b.replaceChild(sprite(lookDe(st.formas[i], v), 34), b.firstChild))
    mudou()
  }, 'shiny')
  ui.nasc = bloco('nascimento', 'Potência', [el('div', { class: 'linha' }, [el('div', { style: 'flex:1 1 200px;min-width:0' }, [pot]), shiny])])

  const aoe = seg([['sem', 'Sem AoE'], ['com', 'Com AoE']], s.tmAoe ? 'com' : 'sem', (k) => { s.tmAoe = k === 'com'; mudou() }, 'AoE')
  const z = seg([['sem', 'Sem Z-Move'], ['com', 'Com Z-Move']], s.tmElemental ? 'com' : 'sem', (k) => {
    if (k === 'com') {
      const tipos = st.res?.s?.tipos || formaSim()?.tipos || []
      if (!s.tmElemental) {
        s.tmElemental = TIPOS.includes(String(tipos[0]).toUpperCase()) ? String(tipos[0]).toUpperCase() : 'NORMAL'
        const at = st.res?.s?.stats
        s.tmFisico = !!at && Number(at.atk) > Number(at.spAtk)
      }
    } else s.tmElemental = null
    mudou()
  }, 'Z-Move')
  ui.z = bloco('zmove', 'Z-Move', [z])
  ui.aoe = bloco('area', 'AoE', [aoe])

  const refino = STATS.filter(([k]) => k !== 'speed').map(([k, rot]) => celula(rot, passos({ valor: s.refino[k], min: 0, max: 999, rotulo: `refino de ${rot}`, aoMudar: (v) => { s.refino[k] = v; mudou() } })))
  ui.refino = bloco('refino', 'Refino', [el('div', { class: 'grade6 grade-refino' }, refino)])
  ui.refino.classList.add('larga')
  if (secForma) secForma.classList.add('larga')

  caixa.replaceChildren(ui.nivel, ui.nasc, ...(secForma ? [secForma] : []), ui.z, ui.aoe, ui.refino)
  resumos()
}

function resumos() {
  const ui = st.ui.sim
  const h = st.hoje
  const s = st.sim
  if (!ui) return
  ui.nivel.resumo.textContent = s.level === h.level ? `Nv ${fmt.format(s.level)}` : `${fmt.format(h.level)} → ${fmt.format(s.level)}`
  if (ui.forma) ui.forma.resumo.textContent = formaSim()?.nome || ''
  const nasc = []
  if (s.potencia !== h.potencia) nasc.push(`P${h.potencia} → P${s.potencia}`)
  else nasc.push(`P${s.potencia}`)
  if (s.shiny) nasc.push('shiny')
  ui.nasc.resumo.textContent = nasc.join(' · ')
  ui.z.resumo.textContent = s.tmElemental ? `${nomeTipo(s.tmElemental)} · ${s.tmFisico ? 'físico' : 'especial'}` : 'nenhum'
  ui.aoe.resumo.textContent = s.tmAoe ? 'golpe em área' : 'nenhum'
  const ref = somaRefino(s.refino)
  ui.refino.resumo.textContent = ref ? `+${fmt.format(ref)}` : 'nenhum'
}

function agendar(imediato = false) {
  clearTimeout(st.timer)
  $('calc').classList.add('calculando')
  st.timer = setTimeout(calcular, imediato ? 0 : 200)
}

async function calcular() {
  if (!st.hoje) return
  const seq = ++st.seq
  const pkH = pkDe(st.hoje)
  const pkS = pkDe(st.sim)
  let rh, rs
  try {
    ;[rh, rs] = await Promise.all([Promise.resolve(motor.simular(pkH)), Promise.resolve(motor.simular(pkS))])
  } catch (err) {
    rh = { erro: err?.message || 'Não consegui calcular.' }
  }
  if (seq !== st.seq) return
  $('calc').classList.remove('calculando')
  gravarEstado()
  const erro = rh?.erro || rs?.erro || (!rh || !rs ? 'Não consegui calcular este pokémon.' : '')
  if (erro) {
    st.res = null
    mensagemVisor(erro, true)
    $('detalhes').hidden = true
    return
  }
  st.res = { h: rh, s: rs }
  pintarNotaHoje()
  pintarVisor()
  pintarScoreInfo()
  pintarGolpe()
  pintarStats()
  $('detalhes').hidden = false
  st.ultimoPreco = [pkH, rh, pkS, rs]
  pintarPreco(seq, pkH, rh, pkS, rs)
}

function limparTudo() {
  clearTimeout(st.timer)
  st.seq++
  st.hoje = null
  st.sim = null
  st.res = null
  st.formas = []
  st.ultimoHash = ''
  try { history.replaceState(null, '', location.pathname + location.search) } catch {}
  $('calc').classList.remove('calculando')
  $('visor').hidden = true
  $('detalhes').hidden = true
  $('cartao-sim').hidden = true
  $('controles').replaceChildren()
  $('identidade').hidden = true
  montarEditorHoje()
  limparConferir()
  statusFicha('')
  $('ficha').value = ''
  abrirEntrada(true)
  trocarAba('colar')
}

function novoCalculo() {
  const anterior = st.hoje ? { hoje: pkDe(st.hoje), sim: pkDe(st.sim), nome: st.nomeHoje } : null
  limparTudo()
  $('ficha').focus()
  if (anterior) {
    mostrarToast(`Cálculo de ${anterior.nome} limpo`, () => {
      definirHoje(anterior.hoje, anterior.sim, true)
      statusFicha('')
    })
  }
}

function mensagemVisor(txt, erro = false) {
  $('visor-msg-txt').textContent = txt
  $('visor-msg').classList.toggle('erro', erro)
  $('visor-msg').hidden = false
  $('visor').hidden = false
  $('visor-id').hidden = true
  $('visor-cels').hidden = true
  $('copiar-topo').hidden = true
  $('novo-calculo-topo').hidden = !st.hoje
}

const faixaDe = (v) => [...FAIXAS].reverse().find(([de]) => v >= de) || FAIXAS[0]

function classeDelta(d) {
  return d == null || d === 0 ? 'igual' : d > 0 ? 'sobe' : 'desce'
}

function escalaScore(valor) {
  const v = ehNum(valor) ? Math.max(0, Math.min(1000, Number(valor))) : null
  const segs = FAIXAS.map(([de, nome, cor], i) => {
    const ate = FAIXAS[i + 1]?.[0] ?? 1000
    const cheio = v == null ? 0 : Math.max(0, Math.min(1, (v - de) / (ate - de)))
    const aqui = v != null && v >= de && (v < ate || ate === 1000)
    return el('span', { class: 'esc-f', style: `flex-grow:${ate - de};--c:${cor}` }, [
      el('i', { style: `width:${(cheio * 100).toFixed(1)}%` }),
      aqui ? el('b', { class: 'esc-marca', style: `left:${(cheio * 100).toFixed(1)}%` }) : null
    ])
  })
  return el('span', { class: 'escala', 'aria-hidden': 'true' }, segs)
}

function escalaNota(nota) {
  const n = ehNum(nota) ? Math.max(0, Math.min(10, Number(nota))) : null
  const segs = FAIXAS_NOTA.map(([, nome, cor], i) => {
    const cheio = n == null ? 0 : Math.max(0, Math.min(1, n - i))
    const aqui = n != null && n >= i && (n < i + 1 || i === 9)
    return el('span', { class: 'esc-f', style: `flex-grow:1;--c:${cor}` }, [
      el('i', { style: `width:${(cheio * 100).toFixed(1)}%` }),
      aqui ? el('b', { class: 'esc-marca', style: `left:${(cheio * 100).toFixed(1)}%` }) : null
    ])
  })
  return el('span', { class: 'escala nota-esc', 'aria-hidden': 'true' }, segs)
}

function vCel({ id = null, classe = '', icone, rotulo, valor, barra = null, pe = [], dica = '' }) {
  return el('div', { class: `v-cel ${classe}`.trim(), id, role: 'group', 'aria-label': dica || null }, [
    el('span', { class: 'v-rot' }, [ico(icone, 13, 'ico-v'), ...[].concat(rotulo).map((r, i) => el('span', { class: i ? 'longo' : null, text: r }))]),
    valor,
    barra || el('span', { class: 'escala vazia', 'aria-hidden': 'true' }),
    el('span', { class: 'v-pe' }, pe)
  ])
}

const pilula = (p) => (p == null || p === 0 ? null : el('span', { class: `delta ${classeDelta(p)}`, text: textoVariacao(p) }))

const COR_TIER = { 'S+': '#ff7ec8', S: '#ffc02e', 'S-': '#ffd34d', 'A+': '#4ade80', A: '#42c97a', 'A-': '#3a9a5c', 'B+': '#7dd3fc', B: '#1fa5f5', 'B-': '#5b8fd6', C: '#b9aeb3', D: '#8a8086' }
function tierDoScore(v) {
  const c = st.cortes
  if (!Array.isArray(c) || !c.length || !ehNum(v)) return null
  return (c.find((x) => v >= Number(x.min)) || c[c.length - 1]).tier
}
async function carregarCortes() {
  try {
    const r = await fetch('../tier/tier.json', { cache: 'no-cache' })
    if (!r.ok) return
    const j = await r.json()
    const c = j?.janelas?.dia?.cortes
    if (Array.isArray(c) && c.length) {
      st.cortes = c
      if (st.res) pintarVisor()
    }
  } catch {}
}

function celModo(icone, iconePoder, rotulo, sc, scHoje, pod, podHoje, dicaExtra = '') {
  const v = ehNum(sc) ? Math.round(Number(sc)) : null
  const ho = ehNum(scHoje) ? Math.round(Number(scHoje)) : null
  const d = v != null && ho != null ? v - ho : null
  const faixa = v != null ? faixaDe(v) : null
  return vCel({
    classe: 'modo',
    icone,
    rotulo,
    valor: el('b', { class: 'v-val' }, [v != null ? fmt.format(v) : '—', d ? el('small', { class: `v-dif ${classeDelta(d)}`, text: `${d > 0 ? '+' : '−'}${fmt.format(Math.abs(d))}` }) : null]),
    barra: escalaScore(v ?? NaN),
    pe: [el('span', { class: 'v-poder' }, [ico(iconePoder, 12, 'ico-v'), grande(pod)]), pilula(variacao(podHoje, pod))],
    dica: [faixa ? `Score ${rotulo} ${fmt.format(v)} de 1000 (${faixa[1]})` : '', icone === 'pvp' && tierDoScore(v) ? `Tier ${tierDoScore(v)} no meta de hoje` : '', `Poder ${rotulo} ${grande(pod)}`, dicaExtra].filter(Boolean).join(' · ')
  })
}

const TAXA_FAIXAS_ORB = [[500, 1300], [5000, 1000], [Infinity, 750]]
function liquidoVenda(total, moeda) {
  const t = Math.floor(Number(total) || 0)
  if (t <= 0) return 0
  if (moeda === 'gold') return Math.floor((t * 8500) / 10000)
  let piso = 0
  let bp = 0
  for (const [ate, bpFaixa] of TAXA_FAIXAS_ORB) {
    const teto = Math.min(t, ate)
    if (teto <= piso) break
    bp += (teto - piso) * bpFaixa
    piso = teto
  }
  return t - Math.min(t, Math.ceil(bp / 10000))
}
function melhorMoeda(gemasJusto, coinsJusto, cambio) {
  if (!ehNum(gemasJusto) || !ehNum(coinsJusto) || !(cambio > 0)) return null
  const viaGemas = liquidoVenda(gemasJusto, 'orb') * cambio
  const viaCoins = liquidoVenda(coinsJusto, 'gold')
  if (!(viaGemas > 0) || !(viaCoins > 0)) return null
  const r = viaGemas / viaCoins
  if (Math.abs(r - 1) < 0.05) return null
  return { moeda: r > 1 ? 'orb' : 'gold', ganho: Math.round((Math.max(r, 1 / r) - 1) * 100), viaGemas, viaCoins }
}

function celPreco(valor, p = null, dica = '', coins = null, conf = null, melhor = null) {
  return vCel({
    id: 'v-preco',
    classe: 'preco-v',
    icone: 'gema',
    rotulo: ['Preço', 'justo'],
    valor: (() => {
      const selo = (m) => (melhor?.moeda === m ? el('span', { class: 'v-melhor', title: `Vendendo em ${m === 'orb' ? 'Gemas' : 'Coins'} você recebe cerca de ${melhor.ganho}% a mais, já descontadas as taxas e pelo câmbio de hoje`, text: `+${melhor.ganho}%` }) : null)
      const g = el('b', { class: `v-val rosa${melhor && melhor.moeda !== 'orb' ? ' v-pior' : ''}` }, [valor, valor !== '—' && valor !== '…' ? el('span', { class: 'gema-ico', 'aria-hidden': 'true' }) : null, selo('orb')])
      return coins == null ? g : el('span', { class: 'v-precos' }, [g, el('b', { class: `v-val v-val-coin${melhor && melhor.moeda !== 'gold' ? ' v-pior' : ''}` }, [coins, el('span', { class: 'coin-ico', 'aria-hidden': 'true' }), selo('gold')])])
    })(),
    pe: [valor === '…' ? el('span', { class: 'delta igual', text: 'calculando' }) : pilula(p)],
    dica
  })
}

function pintarVisor() {
  const { h, s } = st.res
  const f = formaSim()
  $('visor-id').replaceChildren(
    sprite(lookDe(f, st.sim.shiny), 56),
    el('div', { style: 'min-width:0' }, [
      el('span', { class: 'tag', text: 'Resultado' }),
      el('div', { class: 'id-nome-linha' }, [
        el('strong', {}, [s.nome || f?.nome || '', st.sim.shiny ? ico('estrela', 14, 'estrela') : null]),
        tierDoScore(s.score?.pvp) ? el('a', { class: 'v-tier', href: '../tier/', title: `Tier ${tierDoScore(s.score.pvp)} no meta PvP de hoje`, style: `--ct:${COR_TIER[tierDoScore(s.score.pvp)] || '#ffd34d'}`, text: tierDoScore(s.score.pvp) }) : null
      ]),
      el('span', { class: 'v-sub' }, [`Nv ${fmt.format(st.sim.level)} · `, el('b', { class: 'pot-txt', style: `color:${COR_POT[st.sim.potencia]}`, text: `P${st.sim.potencia}` })])
    ])
  )
  const fn = ehNum(s.nota) ? faixaNota(s.nota) : null
  const dn = ehNum(h.nota) && ehNum(s.nota) ? Math.round((s.nota - h.nota) * 1000) / 1000 : null
  const nota = vCel({
    classe: 'nota-v',
    icone: 'nota',
    rotulo: 'Nota',
    valor: el('b', { class: 'v-val', style: fn ? `color:${fn[2]}` : null }, [ehNum(s.nota) ? fmtNota(s.nota) : '—', el('small', { text: '/10' })]),
    barra: escalaNota(s.nota),
    pe: [fn ? el('span', { class: 'v-nome', style: `color:${fn[2]}`, text: fn[1] }) : null, !dn ? null : el('span', { class: `delta ${classeDelta(dn)}`, text: `${dn > 0 ? '+' : '−'}${fmt3.format(Math.abs(dn))}` })],
    dica: fn ? `Nota do jogo: ${fmtNota(s.nota)}, ${fn[1]}` : 'Nota do jogo, de 0 a 10'
  })
  $('visor-cels').replaceChildren(
    nota,
    celModo('pvp', 'poderPvp', 'PvP', s.score?.pvp, h.score?.pvp, s.pvp, h.pvp, ehNum(s.nivelPvp) ? `conta como Nv ${fmt.format(s.nivelPvp)}` : ''),
    celModo('pve', 'poderPve', 'PvE', s.score?.pve, h.score?.pve, s.pve, h.pve),
    celPreco('…')
  )
  $('visor-msg').hidden = true
  $('visor').hidden = false
  $('visor-id').hidden = false
  $('visor-cels').hidden = false
  $('copiar-topo').hidden = false
  $('novo-calculo-topo').hidden = false
}

function textoForma(v) {
  if (!v) return ''
  if (typeof v === 'string') return v
  if (typeof v === 'object') return v.nome || ''
  const e = especie(v)
  return e?.nome || ''
}

function pintarScoreInfo() {
  const s = st.res.s
  const linha = (rot, icone, v, forma) => {
    if (!ehNum(v)) return null
    const faixa = faixaDe(Number(v))
    const nome = textoForma(forma)
    return el('div', { class: 'sf-l' }, [
      el('div', { class: 'sf-topo' }, [ico(icone, 15, 'ico-sf'), el('span', { class: 'sf-rot', text: rot }), el('b', { text: fmt.format(Math.round(v)) }), el('span', { class: 'selo', style: `--cor:${faixa[2]}`, text: faixa[1] })]),
      escalaScore(Number(v)),
      nome ? el('small', { text: `como ${nome}` }) : null
    ])
  }
  const linhas = [linha('PvP', 'pvp', s.score?.pvp, s.score?.formaPvp), linha('PvE', 'pve', s.score?.pve, s.score?.formaPve)].filter(Boolean)
  $('score-formas').replaceChildren(el('span', { class: 'luta-rot', text: 'Score' }), ...(linhas.length ? linhas : [el('p', { class: 'luta-vazio', text: 'Sem score para esta espécie.' })]))
  const nota = $('nota-det')
  if (!ehNum(s.nota)) return nota.replaceChildren(el('span', { class: 'luta-rot', text: 'Nota do jogo' }), el('p', { class: 'luta-vazio', text: 'Sem nota.' }))
  const f = faixaNota(s.nota)
  const dn = ehNum(st.res.h.nota) ? Math.round((s.nota - st.res.h.nota) * 1000) / 1000 : null
  nota.replaceChildren(
    el('span', { class: 'luta-rot', text: 'Nota do jogo' }),
    el('div', { class: 'nd-valor' }, [el('b', { style: `color:${f[2]}`, text: fmtNota(s.nota) }), el('small', { text: '/10' })]),
    el('div', { class: 'nd-pe' }, [el('span', { class: 'selo', style: `--cor:${f[2]}`, text: f[1] }), !dn ? null : el('span', { class: `delta ${classeDelta(dn)}`, text: `${dn > 0 ? '+' : '−'}${fmt3.format(Math.abs(dn))} vs hoje` })]),
    escalaNota(s.nota)
  )
}

function variacao(a, b) {
  if (!(Number(a) > 0) || !ehNum(b)) return null
  const p = (Number(b) / Number(a) - 1) * 100
  return Math.abs(p) < 0.5 ? 0 : p
}

function textoVariacao(p) {
  if (p == null) return '—'
  if (p === 0) return 'igual'
  if (p < 100) return `${p > 0 ? '+' : '−'}${fmt.format(Math.round(Math.abs(p)))}%`
  const x = 1 + p / 100
  return `${x < 10 ? fmt1.format(x) : grande(x)}×`
}

function categoriaTxt(c) {
  const t = String(c || '')
  if (/f[ií]s|phys/i.test(t)) return 'físico'
  if (/esp|spec/i.test(t)) return 'especial'
  return t.toLowerCase()
}

function pintarGolpe() {
  const g = st.res.s.golpe
  const box = $('golpe')
  if (!g) return (box.hidden = true)
  const tipo = String(g.tipo || '').toUpperCase()
  const nome = g.zmove ? `Z-\u2060Move ${nomeTipo(tipo)}`.trim() : g.nome || '—'
  const cat = categoriaTxt(g.categoria)
  const detalhe = [cat ? cat[0].toUpperCase() + cat.slice(1) : '', g.cdMs ? `recarga ${fmt1.format(g.cdMs / 1000)} s` : ''].filter(Boolean).join(' · ')
  box.replaceChildren(
    el('span', { class: 'luta-rot', text: 'Golpe principal' }),
    el('div', { class: 'golpe-linha' }, [
      ico('golpe', 22),
      el('div', { style: 'min-width:0' }, [
        el('div', { class: 'golpe-nome' }, [el('strong', { text: nome }), !g.zmove && tipo ? tiposDe([tipo]) : null]),
        detalhe ? el('div', { class: 'golpe-det', text: detalhe }) : null
      ])
    ]),
    el('div', { class: 'golpe-num' }, [el('b', { text: ehNum(g.power) ? fmt.format(g.power) : '—' }), el('small', { text: 'de poder' })])
  )
  box.hidden = false
}

function pintarStats() {
  const { h, s } = st.res
  const celulas = STATS.map(([k, rot]) => {
    const a = Number(h.stats?.[k]) || 0
    const b = Number(s.stats?.[k]) || 0
    const p = variacao(a, b)
    return el('div', { class: 'stat-c', role: 'group', 'aria-label': `${rot}: hoje ${grande(a)}, simulado ${grande(b)}` }, [
      el('small', { text: rot }),
      el('b', { text: grande(b) }),
      el('span', { class: 'stat-pe' }, [
        el('span', { text: `hoje ${grande(a)}` }),
        el('span', { class: `delta ${p == null || p === 0 ? 'igual' : p > 0 ? 'sobe' : 'desce'}`, text: p == null || p === 0 ? '—' : textoVariacao(p) })
      ])
    ])
  })
  $('bloco-stats').replaceChildren(
    el('div', { class: 'bloco-cab' }, [ico('stats'), el('h3', { text: 'Atributos' }), el('span', { class: 'resumo', text: `Nv ${fmt.format(st.sim.level)}` })]),
    el('div', { class: 'stats-linha' }, celulas)
  )
}

function precoDe(pk, res) {
  const chave = JSON.stringify(pk)
  let p = st.precos.get(chave)
  if (!p) {
    p = Promise.resolve()
      .then(() => motor.preco(pk, res))
      .catch((err) => ({ erro: err?.message || 'Não consegui estimar o preço.' }))
    st.precos.set(chave, p)
    if (st.precos.size > 60) st.precos.delete(st.precos.keys().next().value)
  }
  return p
}

function gemas(v) {
  if (!ehNum(v)) return '—'
  return Math.abs(v) >= 1000000 ? fmtCurto.format(v) : fmt.format(Math.round(v))
}

const cabPreco = (extra = null) => el('div', { class: 'bloco-cab preco-cab' }, [el('span', { class: 'gema-ico', 'aria-hidden': 'true' }), el('h3', { text: 'Preço' }), extra])
const DESCR_PRECO = { rapido: 'vende logo', justo: 'preço de mercado', esperar: 'se puder esperar' }

async function pintarPreco(seq, pkH, rh, pkS, rs) {
  const box = $('bloco-preco')
  const pS = precoDe(pkS, rs)
  const pH = precoDe(pkH, rh)
  let pronto = false
  pS.then(() => { pronto = true })
  await Promise.resolve()
  if (!pronto) box.replaceChildren(cabPreco(el('span', { class: 'resumo', text: 'calculando…' })), el('div', { class: 'precos3' }, [el('div', { class: 'esqueleto' }), el('div', { class: 'esqueleto' }), el('div', { class: 'esqueleto' })]))
  const [ds, dh] = await Promise.all([pS, pH])
  if (seq !== st.seq) return
  const trocaPreco = (valor, p = null, dica = '', coins = null, conf = null, melhor = null) => $('v-preco')?.replaceWith(celPreco(valor, p, dica, coins, conf, melhor))
  if (!ds || ds.erro) {
    trocaPreco('—', null, 'Preço indisponível')
    box.replaceChildren(cabPreco(), el('p', { class: 'preco-nota', text: ds?.erro || 'Não consegui estimar o preço agora.' }))
    return
  }
  const g = ds.gemas
  if (!g || !ehNum(g.justo)) {
    trocaPreco('—', null, 'Sem vendas parecidas')
    box.replaceChildren(cabPreco(), el('p', { class: 'preco-nota', text: 'Sem vendas parecidas para estimar.' }))
    return
  }
  const hojeJusto = dh && !dh.erro && ehNum(dh.gemas?.justo) ? Number(dh.gemas.justo) : null
  const p = hojeJusto ? variacao(hojeJusto, g.justo) : null
  const coinsTopo = !pkS.shiny && ehNum(ds.coins?.justo) ? Number(ds.coins.justo) : null
  const melhor = coinsTopo != null ? melhorMoeda(g.justo, coinsTopo, ds.cambio) : null
  trocaPreco(Math.abs(g.justo) >= 100000 ? fmtCurto.format(g.justo) : gemas(g.justo), hojeJusto != null ? p : null, `Preço justo: ${gemas(g.justo)} gemas${coinsTopo != null ? ` ou ${grande(coinsTopo)} coins` : ''}${melhor ? ` · em ${melhor.moeda === 'orb' ? 'Gemas' : 'Coins'} rende ${melhor.ganho}% a mais` : ''}`, coinsTopo != null ? grande(coinsTopo) : null, ds.confianca, melhor)
  const pontos = [['rapido', 'Rápido', g.rapido], ['justo', 'Justo', g.justo], ['esperar', 'Esperar', g.esperar]].filter(([, , v]) => ehNum(v))
  const valores = pontos.map(([, , v]) => Number(v))
  const min = Math.min(...valores)
  const max = Math.max(...valores)
  const folga = (max - min) * 0.3 || Math.max(1, max * 0.08)
  const posNum = (v) => ((Number(v) - (min - folga)) / (max - min + folga * 2)) * 100
  const pos = (v) => Math.max(0, Math.min(100, posNum(v))).toFixed(1)
  const cartao = ([k, rot, v]) => el('div', { class: `pc pc-${k}`, role: 'listitem' }, [
    el('span', { class: 'pc-rot' }, [el('i', { 'aria-hidden': 'true' }), rot]),
    el('strong', {}, [gemas(v), el('span', { class: 'gema-ico', 'aria-hidden': 'true' })]),
    el('small', { text: DESCR_PRECO[k] })
  ])
  const o = !pkS.shiny && ds.coins && ehNum(ds.coins.justo) ? ds.coins : null
  const pontosCoins = o ? [['rapido', 'Rápido', o.rapido], ['justo', 'Justo', o.justo], ['esperar', 'Esperar', o.esperar]].filter(([, , v]) => ehNum(v)) : []
  const hojeCoins = o && !pkH.shiny && dh && !dh.erro && ehNum(dh.coins?.justo) ? Number(dh.coins.justo) : null
  const pCoins = hojeCoins ? variacao(hojeCoins, o.justo) : null
  const cartaoCoin = ([k, rot, v]) => el('div', { class: `pc pc-coin pc-${k}`, role: 'listitem' }, [
    el('span', { class: 'pc-rot' }, [el('i', { 'aria-hidden': 'true' }), rot]),
    el('strong', {}, [grande(v), el('span', { class: 'coin-ico', 'aria-hidden': 'true' })]),
    el('small', { text: DESCR_PRECO[k] })
  ])
  const subMoeda = (ico, nome, hoje, pv, fmtV) => el('div', { class: 'preco-moeda' }, [el('span', { class: ico, 'aria-hidden': 'true' }), el('span', { text: nome }), hoje != null && pv !== 0 ? el('span', { class: 'preco-cab-hoje' }, [el('span', { text: `hoje ${fmtV(hoje)}` }), pilula(pv)]) : null])
  const regua = el('div', { class: 'preco-regua', 'aria-hidden': 'true' }, [
    el('span', { class: 'pr-faixa', style: `left:${pos(pontos[0][2])}%;right:${(100 - pos(pontos[pontos.length - 1][2])).toFixed(1)}%` }),
    ...pontos.map(([k, , v]) => el('i', { class: `pr-ponto pc-${k}`, style: `left:${pos(v)}%` })),
    hojeJusto != null && p !== 0 ? el('b', { class: `pr-hoje${posNum(hojeJusto) < 0 ? ' antes' : posNum(hojeJusto) > 100 ? ' depois' : ''}`, style: `left:${pos(hojeJusto)}%` }, [el('span', { text: `hoje ${gemas(hojeJusto)}` })]) : null
  ])
  const detalhes = []
  if (ehNum(ds.confianca)) {
    const c = Math.max(0, Math.min(100, Math.round(ds.confianca)))
    detalhes.push(el('span', { class: 'pd-conf' }, ['Confiança', el('span', { class: 'pd-barra', 'aria-hidden': 'true' }, [el('i', { style: `width:${c}%` })]), el('b', { text: `${c}%` })]))
  }
  if (Number(ds.vendas) > 0) detalhes.push(el('span', { class: 'pd-txt', text: `${fmt.format(ds.vendas)} vendas da espécie` }))
  detalhes.push(el('span', { class: 'pd-vivo', title: `Ofertas do mercado e vendas fechadas${ds.versaoModelo ? ` · versão ${ds.versaoModelo}` : ''}` }, [el('i', { 'aria-hidden': 'true' }), el('span', { class: 'pd-vivo-txt', text: textoVivo() })]))
  for (const a of ds.adicionais || []) {
    if (!(Number(a?.total) > 0)) continue
    const nome = String(a.nome || '').replace(/Z-Move ([A-Z]+)/, (_, t) => `Z-\u2060Move ${nomeTipo(t)}`)
    detalhes.push(el('span', { class: 'pd-chip' }, [`${nome} +${gemas(a.total)}`, el('span', { class: 'gema-ico', 'aria-hidden': 'true' })]))
  }
  const hojeTxt = hojeJusto != null && p !== 0 ? el('span', { class: 'preco-cab-hoje' }, [el('span', { text: `hoje ${gemas(hojeJusto)}` }), pilula(p)]) : null
  box.replaceChildren(...[
    cabPreco(o ? null : hojeTxt),
    o ? subMoeda('gema-ico', 'Gemas', hojeJusto, p, gemas) : null,
    el('div', { class: 'precos3', role: 'list' }, pontos.map(cartao)),
    regua,
    o ? subMoeda('coin-ico', 'Coins', hojeCoins, pCoins, grande) : null,
    o ? el('div', { class: 'precos3 precos3-coin', role: 'list' }, pontosCoins.map(cartaoCoin)) : null,
    detalhes.length ? el('div', { class: 'preco-det' }, detalhes) : null
  ].filter(Boolean))
}

function textoVivo() {
  const t = motor.precoConferidoEm()
  return t ? `ao vivo · ${new Date(t).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}` : 'ao vivo'
}

async function conferirPrecoAoVivo() {
  if (document.hidden || st.conferindoPreco) return
  st.conferindoPreco = true
  try {
    const mudou = await motor.atualizarModeloPreco()
    if (mudou && st.ultimoPreco && st.res) {
      st.precos.clear()
      pintarPreco(st.seq, ...st.ultimoPreco)
    } else for (const x of document.querySelectorAll('.pd-vivo-txt')) x.textContent = textoVivo()
  } finally {
    st.conferindoPreco = false
  }
}
setInterval(conferirPrecoAoVivo, 5 * 60000)
document.addEventListener('visibilitychange', () => {
  if (!document.hidden && Date.now() - motor.precoConferidoEm() > 5 * 60000) conferirPrecoAoVivo()
})

function statusFicha(txt, tipo = '') {
  const s = $('status-ficha')
  s.textContent = txt
  s.className = `status ${tipo}`.trim()
}

let timerToast = 0
function mostrarToast(txt, desfazer = null) {
  const t = $('toast')
  $('toast-txt').textContent = txt
  $('toast-desfazer').hidden = !desfazer
  st.desfazer = desfazer
  t.hidden = false
  clearTimeout(timerToast)
  timerToast = setTimeout(() => { t.hidden = true; st.desfazer = null }, desfazer ? 6000 : 3500)
}

function trocarPokemon(h, sim = null, recolher = true) {
  const anterior = st.hoje ? { hoje: { ...pkDe(st.hoje) }, sim: { ...pkDe(st.sim) }, nome: st.nomeHoje } : null
  definirHoje(h, sim, recolher)
  if (anterior) {
    mostrarToast(`${anterior.nome} substituído`, () => {
      definirHoje(anterior.hoje, anterior.sim, true)
      statusFicha('')
    })
  }
}

async function carregarFicha(t) {
  t = String(t || '').trim()
  if (!t) return false
  let f = null
  try { f = await motor.lerFicha(t) } catch {}
  if (!f) {
    statusFicha('Não reconheci esse texto. Copie de novo pelo botão Copiar p/ ChatGPT da ficha.', 'erro')
    return false
  }
  let sid = Number(f.speciesId) || null
  if (!sid && f.nome) {
    try { sid = Number((await motor.buscarEspecies(f.nome, 1))?.[0]?.speciesId) || null } catch {}
  }
  if (!sid || !especie(sid)) {
    statusFicha(`Não achei a espécie${f.nome ? ` "${f.nome}"` : ''}.`, 'erro')
    return false
  }
  trocarPokemon({ ...f, speciesId: sid })
  statusFicha(`Lido: ${st.nomeHoje}, Nv ${fmt.format(st.hoje.level)}`, 'ok')
  return true
}

let timerFicha = 0
async function lerColado() {
  const t = $('ficha').value.trim()
  if (!t) return statusFicha('')
  if (await carregarFicha(t)) $('ficha').value = ''
}

let leitorMod = null
function leitor() {
  leitorMod ??= import('./leitor.js').catch((err) => {
    leitorMod = null
    throw err
  })
  return leitorMod
}

function prepararLeitor() {
  leitor().then((m) => m.preparar?.()).catch(() => {})
}

function mostrarLeitura(frac) {
  $('leitura').hidden = false
  $('leitura-barra').style.width = `${Math.max(6, Math.min(100, (Number(frac) || 0) * 100)).toFixed(1)}%`
}

function limparConferir() {
  $('conferir').hidden = true
  document.querySelector('.cartao-hoje')?.classList.remove('conferir-ivs')
  document.body.classList.remove('calc-incerto')
}

const NOMES_FALTA = { especie: 'a espécie', level: 'o nível', potencia: 'a potência', quality: 'a qualidade', nota: 'a nota' }

function conferirLeitura(r, { refino = false, ivsEstimados = false } = {}) {
  const faltas = (r?.faltando || []).filter((k) => k !== 'nota')
  const avisos = r?.avisos || []
  const somaErrada = avisos.some((a) => /soma/i.test(a))
  const ivs = ivsEstimados || faltas.some((k) => k.startsWith('ivs.')) || avisos.some((a) => /iv/i.test(a))
  const itens = [...new Set(faltas.filter((k) => !k.startsWith('ivs.')).map((k) => NOMES_FALTA[k]).filter(Boolean))]
  if (ivs) itens.unshift('os IVs')
  if (refino) itens.push('o refino')
  if (!itens.length) return false
  const lista = itens.join(', ').replace(/, ([^,]*)$/, ' e $1')
  $('conferir-txt').textContent = `${somaErrada ? 'A soma dos IVs não bateu' : `Faltou ${lista} no print`}. O cálculo pode não ser fiel: ${somaErrada ? `confira ${lista}` : 'complete à mão'}, ou use um print da ficha inteira.`
  $('conferir').hidden = false
  document.body.classList.add('calc-incerto')
  if (ivs) document.querySelector('.cartao-hoje').classList.add('conferir-ivs')
  return true
}

const CHAVES_IV = ['hp', 'atk', 'def', 'spAtk', 'spDef', 'speed']
function estimarIvs(pk) {
  const soma = Number(pk.ivSomado)
  const faltam = CHAVES_IV.filter((k) => !(Number(pk.ivs?.[k]) > 0))
  if (!faltam.length || !(soma > 0)) return null
  const ivs = { ...pk.ivs }
  const conhecida = CHAVES_IV.reduce((a, k) => a + (faltam.includes(k) ? 0 : Number(ivs[k]) || 0), 0)
  let resto = soma - conhecida
  if (resto < faltam.length || resto > faltam.length * 32) return null
  faltam.forEach((k, i) => {
    const v = Math.min(32, Math.max(1, Math.round(resto / (faltam.length - i))))
    ivs[k] = v
    resto -= v
  })
  const alvo = Number(pk.nota)
  if (!(alvo > 0) || faltam.length < 2) return ivs
  const erro = (x) => {
    const r = motor.simular({ ...pk, ivs: x })
    return Number.isFinite(r?.nota) ? Math.abs(r.nota - alvo) : Infinity
  }
  let atual = erro(ivs)
  for (let volta = 0; volta < 400 && atual > 0.0005; volta++) {
    let melhor = null
    for (const de of faltam) for (const para of faltam) {
      if (de === para || ivs[de] <= 1 || ivs[para] >= 32) continue
      for (const passo of [4, 1]) {
        const d = Math.min(passo, ivs[de] - 1, 32 - ivs[para])
        if (d < 1) continue
        const x = { ...ivs, [de]: ivs[de] - d, [para]: ivs[para] + d }
        const e = erro(x)
        if (e < atual - 1e-9 && (!melhor || e < melhor.e)) melhor = { x, e }
      }
    }
    if (!melhor) break
    Object.assign(ivs, melhor.x)
    atual = melhor.e
  }
  return ivs
}

async function lerImagem(arquivo) {
  if (!st.pronto || !arquivo) return
  statusFicha('')
  limparConferir()
  mostrarLeitura(0)
  let r = null
  try {
    const m = await leitor()
    r = await m.lerPrint(arquivo, {
      especiePorNome: typeof motor.especiePorNome === 'function' ? motor.especiePorNome : undefined,
      buscarEspecies: motor.buscarEspecies,
      aoProgresso: (f) => mostrarLeitura(f)
    })
  } catch {
    $('leitura').hidden = true
    statusFicha('Não consegui ler o print agora. Tente de novo ou cole a ficha.', 'erro')
    return
  }
  $('leitura').hidden = true
  const f = r?.ficha
  const sid = Number(f?.speciesId) || null
  if (!sid || !especie(sid)) {
    statusFicha('Não reconheci o pokémon nesse print. Use um print da ficha inteira ou monte à mão.', 'erro')
    return
  }
  let refino = f.refino || {}
  let refinoAviso = ''
  if (f.stats) {
    let deduzido = null
    try { deduzido = (await leitor()).refinoPelosStats?.({ ...f, speciesId: sid }, f.statsOpcoes || f.stats, motor) } catch {}
    if (deduzido) refino = deduzido
    else refinoAviso = ' Não deu para conferir o refino; ajuste à mão.'
  }
  if (f.zMove && !f.tmElemental) f.tmElemental = especie(sid)?.tipos?.[0] ?? null
  let ivsEstimados = null
  try { ivsEstimados = estimarIvs({ ...f, speciesId: sid, refino }) } catch {}
  trocarPokemon({ ...f, speciesId: sid, refino, ...(ivsEstimados ? { ivs: ivsEstimados } : {}) })
  const incompleto = conferirLeitura(r, { refino: !!refinoAviso, ivsEstimados: !!ivsEstimados })
  statusFicha(incompleto ? '' : `Lido do print: ${st.nomeHoje}, Nv ${fmt.format(st.hoje.level)}`, 'ok')
}

function imagemDe(lista) {
  for (const it of lista || []) {
    if (it.kind === 'file' && /^image\//.test(it.type)) return it.getAsFile()
    if (it instanceof File && /^image\//.test(it.type)) return it
  }
  return null
}

function aoColar(e) {
  const dados = e.clipboardData
  if (!dados) return false
  const img = imagemDe(dados.items) || imagemDe(dados.files)
  if (img) {
    e.preventDefault()
    lerImagem(img)
    return true
  }
  const txt = dados.getData('text/plain') || dados.getData('text')
  if (txt && txt.trim()) {
    e.preventDefault()
    carregarFicha(txt)
    return true
  }
  return false
}

function abrirBusca() {
  abrirEntrada(true)
  trocarAba('mao')
  $('busca').focus()
}

let timerBusca = 0
function buscar() {
  const t = $('busca').value.trim()
  const lista = $('resultados')
  if (!t) {
    lista.hidden = true
    return lista.replaceChildren()
  }
  let r = []
  try { r = motor.buscarEspecies(t, 8) || [] } catch {}
  if (!r.length) {
    lista.replaceChildren(el('li', { class: 'vazio-busca', text: 'Nenhuma espécie com esse nome.' }))
    lista.hidden = false
    return
  }
  lista.replaceChildren(...r.map((e) => el('li', {}, [el('button', { type: 'button', onclick: () => escolherEspecie(e) }, [
    sprite(e.looktype, 44),
    el('span', { class: 'nome' }, [el('span', { text: e.nome }), tiposDe(e.tipos), e.mega ? el('span', { class: 'etiqueta', text: 'Mega' }) : null])
  ])])))
  lista.hidden = false
}

function escolherEspecie(e) {
  const base = st.hoje || { level: 100, potencia: 1, quality: 1, shiny: false, ivs: Object.fromEntries(STATS.map(([k]) => [k, 16])), refino: {} }
  trocarPokemon({ ...base, speciesId: e.speciesId, nome: e.nome, refino: {} }, null, false)
  $('busca').value = ''
  $('resultados').hidden = true
  $('resultados').replaceChildren()
  statusFicha('')
}

const ABAS = ['colar', 'print', 'mao']

function trocarAba(qual) {
  for (const a of ABAS) {
    const sel = a === qual
    $(`aba-${a}`).setAttribute('aria-selected', String(sel))
    $(`aba-${a}`).tabIndex = sel ? 0 : -1
    $(`painel-${a}`).hidden = !sel
  }
  if (qual === 'print') prepararLeitor()
}

let timerLink = 0
async function copiarTexto(texto) {
  try {
    await navigator.clipboard.writeText(texto)
    return true
  } catch {
    const campo = el('textarea', { style: 'position:fixed;left:-9999px;top:0', readonly: true })
    campo.value = texto
    document.body.append(campo)
    campo.select()
    let ok = false
    try { ok = document.execCommand('copy') } catch {}
    campo.remove()
    return ok
  }
}

const PREVIA = 'https://pokepocket.piscis.workers.dev'
const linksFeitos = new Map()

function comPrazo(p, ms) {
  return Promise.race([p, new Promise((_, nao) => setTimeout(() => nao(new Error('demorou')), ms))])
}

async function imagemPrevia(s, resumo) {
  const { desenharCartao } = await import('./cartao.js')
  const forma = formaSim()
  const look = lookDe(forma, st.sim.shiny)
  const png = typeof motor.spritePng === 'function' ? [].concat(look ?? []).map((lt) => motor.spritePng(lt)).find(Boolean) || null : null
  return desenharCartao({
    nome: resumo.nome,
    shiny: !!st.sim.shiny,
    nivel: st.sim.level,
    potencia: st.sim.potencia,
    nota: resumo.nota,
    pvp: resumo.pvp,
    pve: resumo.pve,
    poderPvp: ehNum(s.pvp) ? s.pvp : null,
    poderPve: ehNum(s.pve) ? s.pve : null,
    justo: resumo.justo,
    vendas: resumo.vendas ?? null,
    sprite: png ? { url: new URL(png.url, document.baseURI).href, x: 0, y: 0, w: png.w, h: png.h } : null
  })
}

async function linkCurto(s, resumo) {
  const cru = codificarCompacto({ hoje: st.hoje, sim: st.sim }, resumo)
  const token = document.documentElement.dataset.isolado ? marcarIsolado(cru) : cru
  if (linksFeitos.has(token)) return linksFeitos.get(token)
  const longo = `${PREVIA}/p/${token}`
  const tarefa = (async () => {
    try {
      const r = await comPrazo(fetch(`${PREVIA}/s`, { method: 'POST', headers: { 'content-type': 'text/plain' }, body: token }), 5000)
      if (!r.ok) return longo
      const { id, temImagem } = await r.json()
      if (!/^[0-9A-Za-z]{7}$/.test(id || '')) return longo
      if (!temImagem) {
        const enviar = async () => {
          const img = await comPrazo(imagemPrevia(s, resumo), 15000)
          const ri = await comPrazo(fetch(`${PREVIA}/i/${id}`, { method: 'POST', headers: { 'content-type': 'image/png' }, body: img }), 15000)
          if (!ri.ok) throw new Error(`imagem ${ri.status}`)
        }
        try { await enviar() } catch { setTimeout(() => enviar().catch(() => {}), 3000) }
      }
      return `${PREVIA}/${id}`
    } catch {
      return longo
    }
  })()
  linksFeitos.set(token, tarefa)
  tarefa.then((l) => { if (l.includes('/p/')) linksFeitos.delete(token) })
  return tarefa
}

async function dadosCompartilhar() {
  const s = st.res?.s
  if (!s) return { linha: '', link: location.href }
  let justo = null
  let justoCoins = null
  let vendas = null
  try {
    const p = await precoDe(pkDe(st.sim), s)
    if (ehNum(p?.gemas?.justo)) justo = Math.round(p.gemas.justo)
    if (!st.sim.shiny && ehNum(p?.coins?.justo)) justoCoins = Math.round(p.coins.justo)
    if (Number(p?.vendas) > 0) vendas = Number(p.vendas)
  } catch {}
  const faixaTxt = (v) => (ehNum(v) ? ` · ${faixaDe(Number(v))[1]}` : '')
  const linhas = [`**${s.nome}${st.sim.shiny ? ' shiny' : ''}** · Nv ${fmt.format(st.sim.level)} · P${st.sim.potencia}`]
  if (ehNum(s.nota)) linhas.push(`⭐ Nota ${fmtNota(s.nota)} · ${faixaNota(s.nota)[1]}`)
  if (ehNum(s.score?.pvp)) linhas.push(`⚔️ PvP ${fmt.format(s.score.pvp)}${faixaTxt(s.score.pvp)}${ehNum(s.pvp) ? ` · poder ${grande(s.pvp)}` : ''}`)
  if (ehNum(s.score?.pve)) linhas.push(`🎯 PvE ${fmt.format(s.score.pve)}${faixaTxt(s.score.pve)}${ehNum(s.pve) ? ` · poder ${grande(s.pve)}` : ''}`)
  if (justo != null) linhas.push(`💎 Preço justo ${gemas(justo)} gemas${justoCoins != null ? ` ou ${grande(justoCoins)} coins` : ''}`)
  const resumo = { nome: s.nome, pvp: ehNum(s.score?.pvp) ? s.score.pvp : null, pve: ehNum(s.score?.pve) ? s.score.pve : null, nota: ehNum(s.nota) ? s.nota : null, justo }
  let link = location.href
  try { link = await linkCurto(s, { ...resumo, vendas }) } catch {}
  return { linha: linhas.join('\n'), link }
}

async function copiar(bt, comResumo) {
  if (st.hoje) gravarEstado()
  bt.classList.add('gerando')
  const texto = dadosCompartilhar().then(({ linha, link }) => (comResumo && linha ? `${linha}\n${link}` : link))
  let ok = false
  try {
    if (typeof ClipboardItem === 'function' && navigator.clipboard?.write) {
      await navigator.clipboard.write([new ClipboardItem({ 'text/plain': texto.then((t) => new Blob([t], { type: 'text/plain' })) })])
      ok = true
    }
  } catch {}
  if (!ok) ok = await copiarTexto(await texto)
  bt.classList.remove('gerando')
  const aviso = $('link-ok')
  aviso.className = `link-ok${ok ? '' : ' erro'}`
  aviso.textContent = ok ? (comResumo ? 'Resumo e link copiados' : 'Link copiado') : 'Copie o endereço na barra do navegador'
  for (const b of document.querySelectorAll('.copiar')) b.classList.remove('ok')
  if (ok) {
    bt.classList.remove('pulou')
    void bt.offsetWidth
    bt.classList.add('ok', 'pulou')
  }
  clearTimeout(timerLink)
  timerLink = setTimeout(() => {
    aviso.textContent = ''
    for (const b of document.querySelectorAll('.copiar')) b.classList.remove('ok', 'pulou')
  }, 2500)
}

function ligarEventos() {
  $('ficha').addEventListener('input', () => {
    clearTimeout(timerFicha)
    timerFicha = setTimeout(lerColado, 250)
  })
  $('busca').addEventListener('input', () => {
    clearTimeout(timerBusca)
    timerBusca = setTimeout(buscar, 120)
  })
  $('busca').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      clearTimeout(timerBusca)
      buscar()
      $('resultados').querySelector('button')?.click()
    } else if (e.key === 'ArrowDown') {
      const b = $('resultados').querySelector('button')
      if (b) {
        e.preventDefault()
        b.focus()
      }
    }
  })
  $('resultados').addEventListener('keydown', (e) => {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return
    const bts = [...$('resultados').querySelectorAll('button')]
    const i = bts.indexOf(document.activeElement)
    if (i < 0) return
    e.preventDefault()
    if (e.key === 'ArrowUp' && i === 0) return $('busca').focus()
    bts[Math.max(0, Math.min(bts.length - 1, i + (e.key === 'ArrowDown' ? 1 : -1)))].focus()
  })
  ABAS.forEach((a, i) => {
    $(`aba-${a}`).addEventListener('click', () => trocarAba(a))
    $(`aba-${a}`).addEventListener('keydown', (e) => {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return
      const outro = ABAS[(i + (e.key === 'ArrowRight' ? 1 : ABAS.length - 1)) % ABAS.length]
      trocarAba(outro)
      $(`aba-${outro}`).focus()
    })
  })
  $('ficha').addEventListener('paste', (e) => {
    const img = imagemDe(e.clipboardData?.items) || imagemDe(e.clipboardData?.files)
    if (img) {
      e.preventDefault()
      lerImagem(img)
    }
  })
  $('novo-colar').addEventListener('paste', (e) => aoColar(e))
  $('novo-colar').addEventListener('input', () => { $('novo-colar').value = '' })
  $('novo-buscar').addEventListener('click', abrirBusca)
  $('novo-calculo').addEventListener('click', novoCalculo)
  $('novo-calculo-topo').addEventListener('click', novoCalculo)
  $('novo-imagem').addEventListener('click', () => $('arquivo-print').click())
  $('zona-print').addEventListener('click', () => $('arquivo-print').click())
  for (const id of ['zona-print', 'novo-imagem', 'novo-colar']) {
    $(id).addEventListener('pointerenter', prepararLeitor, { once: true })
    $(id).addEventListener('focus', prepararLeitor, { once: true })
  }
  $('arquivo-print').addEventListener('change', () => {
    const f = $('arquivo-print').files?.[0]
    $('arquivo-print').value = ''
    if (f) lerImagem(f)
  })
  for (const ev of ['input', 'change']) $('editor-hoje').addEventListener(ev, () => { if (document.body.classList.contains('calc-incerto')) limparConferir() })
  $('conferir-editar').addEventListener('click', () => {
    abrirEntrada(true)
    trocarAba('mao')
    $('editor-hoje').querySelector('.grade6 .campo')?.focus()
  })
  $('toast-desfazer').addEventListener('click', () => {
    const f = st.desfazer
    st.desfazer = null
    $('toast').hidden = true
    clearTimeout(timerToast)
    if (f) f()
  })
  document.addEventListener('paste', (e) => {
    if (!st.pronto || e.defaultPrevented) return
    const alvo = e.target
    if (alvo instanceof Element && alvo.closest('input, textarea, select, [contenteditable="true"]')) return
    aoColar(e)
  })
  let arrastando = 0
  const temArquivo = (e) => [...(e.dataTransfer?.types || [])].includes('Files')
  window.addEventListener('dragenter', (e) => {
    if (!st.pronto || !temArquivo(e)) return
    arrastando++
    $('soltar').hidden = false
  })
  window.addEventListener('dragover', (e) => {
    if (!temArquivo(e)) return
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
  })
  window.addEventListener('dragleave', (e) => {
    if (!temArquivo(e)) return
    arrastando = Math.max(0, arrastando - 1)
    if (!arrastando) $('soltar').hidden = true
  })
  window.addEventListener('drop', (e) => {
    if (!temArquivo(e)) return
    e.preventDefault()
    arrastando = 0
    $('soltar').hidden = true
    const f = [...(e.dataTransfer.files || [])].find((x) => /^image\//.test(x.type))
    if (f) lerImagem(f)
    else statusFicha('Solte uma imagem (print da ficha).', 'erro')
  })
  $('trocar').addEventListener('click', () => abrirEntrada($('entrada').hidden))
  $('voltar').addEventListener('click', () => {
    if (!st.hoje) return
    st.sim = pkDe(st.hoje)
    montarSimulacao()
    agendar(true)
  })
  $('info-score').addEventListener('click', () => {
    const b = $('info-score')
    const abrir = b.getAttribute('aria-expanded') !== 'true'
    b.setAttribute('aria-expanded', String(abrir))
    $('explica').hidden = !abrir
  })
  $('copiar-link').addEventListener('click', (e) => copiar(e.currentTarget, false))
  $('copiar-topo').addEventListener('click', (e) => copiar(e.currentTarget, false))
  $('copiar-resumo').addEventListener('click', (e) => copiar(e.currentTarget, true))
  window.addEventListener('hashchange', () => {
    const h = location.hash.replace(/^#/, '')
    if (!st.pronto || !h || h === st.ultimoHash) return
    aplicarCodigo(h)
  })
}

function progresso(p, texto) {
  let frac = null
  let txt = typeof texto === 'string' ? texto : null
  if (typeof p === 'number') frac = p
  else if (typeof p === 'string') txt = p
  else if (p && typeof p === 'object') {
    frac = p.fracao ?? p.progresso ?? p.pct ?? (Number(p.total) > 0 ? Number(p.feito ?? p.carregado ?? 0) / Number(p.total) : null)
    txt = p.texto || p.etapa || p.mensagem || null
  }
  if (ehNum(frac)) {
    let f = Number(frac)
    if (f > 1) f /= 100
    $('carga-barra').style.width = `${Math.max(8, Math.min(100, f * 100)).toFixed(1)}%`
  }
  if (txt) $('carga-txt').textContent = String(txt)
}

async function iniciar() {
  const carga = $('carga')
  carga.classList.remove('falhou')
  $('carga-erro').hidden = true
  $('carga-txt').textContent = 'Carregando dados do jogo'
  $('carga-barra').style.width = '8%'
  try {
    await motor.carregar(progresso)
    carregarCortes()
  } catch (err) {
    carga.classList.add('falhou')
    $('carga-txt').textContent = 'Não deu para carregar'
    $('carga-erro-txt').textContent = err?.message || 'Verifique a conexão e tente de novo.'
    $('carga-erro').hidden = false
    return
  }
  $('carga-barra').style.width = '100%'
  st.pronto = true
  carga.hidden = true
  $('calc').hidden = false
  try { localStorage.removeItem('pokepocket-calc') } catch {}
  const doLink = location.hash.replace(/^#/, '')
  if (doLink) aplicarCodigo(doLink)
}

ligarEventos()
$('carga-tentar').addEventListener('click', () => location.reload())
iniciar()

const preCarregarCartao = () => import('./cartao.js').then((m) => m.carregarRecursos?.()).catch(() => {})
if ('requestIdleCallback' in window) requestIdleCallback(preCarregarCartao, { timeout: 4000 })
else setTimeout(preCarregarCartao, 2500)
