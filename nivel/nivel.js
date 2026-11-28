const NV_MAX = 99999
const HORA = 3600000
const DIA = 24 * HORA
const LIMITE = 30 * 365.25 * DIA
const CHAVE = 'pp-nivel'
const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']
const SEMANA = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb']

const xpDoNivel = (L) => (L <= 1 ? 0 : Math.round((50 / 3) * (L ** 3 - 6 * L ** 2 + 17 * L - 12)))

function nivelDoXp(xp) {
  if (!(xp > 0)) return 1
  let lo = 1
  let hi = NV_MAX + 1
  while (lo < hi) {
    const m = Math.ceil((lo + hi) / 2)
    if (xpDoNivel(m) <= xp) lo = m
    else hi = m - 1
  }
  const a = xpDoNivel(lo)
  return lo + Math.min(0.9999, (xp - a) / Math.max(1, xpDoNivel(lo + 1) - a))
}

const inteiro = new Intl.NumberFormat('pt-BR')
const fmtNv = (v) => inteiro.format(Math.floor(v))
const dec = (v, max) => new Intl.NumberFormat('pt-BR', { maximumFractionDigits: max }).format(v)

function numCurto(v) {
  const a = Math.abs(v)
  const f = (x, s) => `${dec(x, Math.abs(x) < 10 ? 2 : Math.abs(x) < 100 ? 1 : 0)} ${s}`
  if (a >= 1e12) return f(v / 1e12, 'tri')
  if (a >= 1e9) return f(v / 1e9, 'bi')
  if (a >= 1e6) return f(v / 1e6, 'mi')
  if (a >= 1e4) return f(v / 1e3, 'mil')
  return inteiro.format(Math.round(v))
}

function lerNumero(txt) {
  const s = String(txt || '').toLowerCase().replace(/\s+/g, '').replace(/(xp)?(\/h|porhora)?$/, '')
  const m = /^(\d[\d.,]*)(kkk|kk|k|mil|mi|m|bi|b|tri|t)?$/.exec(s)
  if (!m) return NaN
  const mult = { k: 1e3, mil: 1e3, kk: 1e6, m: 1e6, mi: 1e6, kkk: 1e9, b: 1e9, bi: 1e9, t: 1e12, tri: 1e12 }[m[2]] || 1
  let n = m[1]
  if (n.includes(',')) n = n.replace(/\./g, '').replace(',', '.')
  else if (/^\d{1,3}(\.\d{3})+$/.test(n)) n = n.replace(/\./g, '')
  const v = parseFloat(n) * mult
  return Number.isFinite(v) ? v : NaN
}

const lerInteiro = (txt) => {
  const d = String(txt || '').replace(/\D/g, '')
  return d ? Number(d) : NaN
}

function fmtDuracao(ms) {
  const min = Math.round(ms / 60000)
  if (min < 1) return '< 1 min'
  if (min < 60) return `${min} min`
  const h = Math.floor(min / 60)
  const m = min % 60
  if (h < 24) return m ? `${h} h ${m} min` : `${h} h`
  const d = Math.floor(h / 24)
  const hh = h % 24
  if (d < 60) return hh ? `${d} d ${hh} h` : `${d} d`
  if (d < 730) {
    const meses = Math.floor(d / 30.44)
    const dd = Math.round(d - meses * 30.44)
    return dd ? `${meses} meses ${dd} d` : `${meses} meses`
  }
  return `${dec(d / 365.25, 1)} anos`
}

const meiaNoite = (t) => { const d = new Date(t); d.setHours(0, 0, 0, 0); return d.getTime() }
const hhmm = (d) => `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`

function fmtDia(t, { hora = false } = {}) {
  const d = new Date(t)
  const dias = Math.round((meiaNoite(t) - meiaNoite(Date.now())) / DIA)
  if (dias === 0) return `hoje · ${hhmm(d)}`
  if (dias === 1) return `amanhã · ${hhmm(d)}`
  const ano = d.getFullYear() !== new Date().getFullYear() ? ` ${d.getFullYear()}` : ''
  return `${SEMANA[d.getDay()]}, ${d.getDate()} ${MESES[d.getMonth()]}${ano}${hora ? ` · ${hhmm(d)}` : ''}`
}

function fmtCurto(t) {
  const d = new Date(t)
  const dias = Math.round((meiaNoite(t) - meiaNoite(Date.now())) / DIA)
  if (dias === 0) return `hoje ~${String(d.getHours()).padStart(2, '0')}h`
  if (dias === 1) return `amanhã ~${String(d.getHours()).padStart(2, '0')}h`
  return `${d.getDate()} ${MESES[d.getMonth()]}${d.getFullYear() !== new Date().getFullYear() ? ` ${d.getFullYear()}` : ''}`
}

const isoDia = (t) => { const d = new Date(t); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}` }
const fimDoDia = (iso) => { const [a, m, d] = String(iso).split('-').map(Number); return a ? new Date(a, m - 1, d, 23, 59, 59).getTime() : NaN }

const esc = (t) => String(t).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])

const TRILHA = (() => {
  const b = [[3, 95], [16, 92], [30, 88.5], [42, 83], [46, 76.5], [43, 71], [49, 65.5], [60, 61], [63, 54.5], [59, 49], [64, 43], [72, 38.5], [74, 32], [71, 27.5], [74.5, 21.5], [76, 17]]
  const out = []
  for (let i = 0; i < b.length - 1; i++) {
    const p0 = b[i - 1] || b[i], p1 = b[i], p2 = b[i + 1], p3 = b[i + 2] || p2
    for (let k = 0; k < 10; k++) {
      const t = k / 10, t2 = t * t, t3 = t2 * t
      out.push([0, 1].map((j) => 0.5 * (2 * p1[j] + (-p0[j] + p2[j]) * t + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * t2 + (-p0[j] + 3 * p1[j] - 3 * p2[j] + p3[j]) * t3)))
    }
  }
  out.push(b[b.length - 1])
  return out
})()

function pontoNaTrilha(f) {
  const segs = []
  let total = 0
  for (let i = 1; i < TRILHA.length; i++) {
    const l = Math.hypot((TRILHA[i][0] - TRILHA[i - 1][0]) * 1.8, TRILHA[i][1] - TRILHA[i - 1][1])
    segs.push(l)
    total += l
  }
  let alvo = Math.max(0, Math.min(1, f)) * total
  for (let i = 0; i < segs.length; i++) {
    if (alvo <= segs[i] || i === segs.length - 1) {
      const t = segs[i] ? Math.min(1, alvo / segs[i]) : 0
      return { x: TRILHA[i][0] + (TRILHA[i + 1][0] - TRILHA[i][0]) * t, y: TRILHA[i][1] + (TRILHA[i + 1][1] - TRILHA[i][1]) * t, i }
    }
    alvo -= segs[i]
  }
  const u = TRILHA[TRILHA.length - 1]
  return { x: u[0], y: u[1], i: segs.length - 1 }
}

const CEU = (() => {
  let sem = 7
  const r = () => (sem = (sem * 16807) % 2147483647) / 2147483647
  const cores = ['#fff3ea', '#fff3ea', '#ffe9a3', '#d9e4ff', '#ffd1ec']
  const rgba = (h, a) => `rgba(${parseInt(h.slice(1, 3), 16)},${parseInt(h.slice(3, 5), 16)},${parseInt(h.slice(5, 7), 16)},${a})`
  const camadas = [[], [], [], []]
  for (let i = 0; i < 90; i++) {
    const x = 3 + r() * 94, y = 4 + Math.pow(r(), 1.4) * 58, t = r(), c = cores[Math.floor(r() * cores.length)], p = 2 + r() * 4
    const gr = t > 0.88, mi = !gr && t < 0.4, pisca = t > 0.3
    const op = pisca ? 0.95 : gr ? 0.9 : mi ? 0.4 : 0.75
    const raio = gr ? 1.3 : mi ? 0.5 : 0.8
    const lado = gr ? 12 : 4
    const g = gr ? `radial-gradient(circle,${rgba(c, op)} 0 ${raio}px,${rgba('#ffe9a3', 0.3)} ${raio + 0.9}px,transparent ${lado / 2}px)` : `radial-gradient(circle,${rgba(c, op)} 0 ${raio}px,transparent ${raio + 0.7}px)`
    camadas[pisca ? (p < 3.3 ? 1 : p < 4.6 ? 2 : 3) : 0].push(`${g} ${x.toFixed(1)}% ${y.toFixed(1)}%/${lado}px ${lado}px no-repeat`)
  }
  const estrelas = camadas.map((l, k) => `<b class="nl-estrelas c${k}" style="background:${l.join(',')}"></b>`).join('')
  return '<b class="nl-aurora"></b><b class="nl-via"></b>' + estrelas
    + '<b class="nl-cad b1"></b><b class="nl-cad b2"></b><b class="nl-nevoa n1"></b><b class="nl-nevoa n2"></b>'
    + '<button type="button" class="nl-lua" aria-label="Lua crescente" title="Lua crescente"></button>'
})()

const PANO = ['M5 3.5 C10 1.8 14 5.6 22.5 3.6 L20.4 8.6 L22.5 13.4 C14 15.4 10 11.6 5 13.2Z', 'M5 3.5 C10 5.4 15 2 22.5 4.6 L20.6 9.4 L22.5 14.2 C15 11.8 10 15 5 13.2Z']
const BANDEIRA = '<span class="nl-pano">'
  + `<svg viewBox="0 0 26 32" width="26" height="32" aria-hidden="true"><defs><linearGradient id="nl-cume-g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff1c2"/><stop offset=".45" stop-color="#f3c35a"/><stop offset="1" stop-color="#b9822c"/></linearGradient></defs><path fill="url(#nl-cume-g)" d="${PANO[0]}"/></svg>`
  + `<svg class="b" viewBox="0 0 26 32" width="26" height="32" aria-hidden="true"><path fill="url(#nl-cume-g)" d="${PANO[1]}"/></svg>`
  + '<span class="nl-cume-luz"><i></i></span></span>'
  + '<svg class="nl-haste" viewBox="0 0 26 32" width="26" height="32" aria-hidden="true"><line x1="4.5" y1="2.5" x2="4.5" y2="31" stroke="#ffe9a3" stroke-width="1.6" stroke-linecap="round"/><circle cx="4.5" cy="2.2" r="1.9" fill="#fff6d8"/></svg>'

function desenharMonte(marcos, fHoje, rotHoje, rotCume) {
  const caminho = (pts) => pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(2)},${p[1].toFixed(2)}`).join(' ')
  const ph = pontoNaTrilha(fHoje)
  const feito = [...TRILHA.slice(0, ph.i + 1), [ph.x, ph.y]]
  const svg = `<svg class="nl-monte-svg" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
    <defs><linearGradient id="nl-g-serra" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a2330"/><stop offset="1" stop-color="#1a0f15"/></linearGradient></defs>
    <path class="nl-serra-longe" d="M0,100 V56 L7,50 L14,54 L24,42 L32,48 L42,36 L50,44 L58,38 L66,46 L76,34 L86,42 L94,36 L100,38 V100 Z"/>
    <path class="nl-serra-meio" d="M0,100 V70 L9,63 L18,67 L28,57 L38,63 L48,55 L56,61 L64,53 L74,59 L84,51 L92,57 L100,53 V100 Z"/>
    <path class="nl-serra" d="M0,100 V88 L10,82 L20,78 L30,70 L40,62 L48,55 L56,46 L63,38 L70,26 L76,16 L80,20 L84,24 L90,34 L96,40 L100,42 V100 Z"/>
    <path class="nl-serra-sombra" d="M76,16 L80,20 L84,24 L90,34 L96,40 L100,42 V100 H74 L80,62 L78,34 Z"/>
    <path class="nl-neve" d="M70,26 L76,16 L80,20 L84,24 L82.4,25.6 L80,23.4 L77.8,26.4 L75.4,23.8 L72.8,27.6 Z"/>
    <path class="nl-frente" d="M0,100 V95 L12,92 L26,95.5 L42,93 L58,96 L74,93.5 L88,96 L100,94 V100 Z"/>
    <path class="nl-trilha-leito" d="${caminho(TRILHA)}"/>
    <path class="nl-trilha" d="${caminho(TRILHA)}"/>
    <path class="nl-trilha-brilho" d="${caminho(feito)}"/>
    <path class="nl-trilha-feita" d="${caminho(feito)}"/>
    <path class="nl-trilha-lua" d="${caminho(TRILHA)}"/>
  </svg>`
  const nos = marcos.filter((p) => p.f > 0 && p.f < 1).map((p, k) => {
    const q = pontoNaTrilha(p.f)
    const perto = Math.hypot((q.x - ph.x) * 1.8, q.y - ph.y) < 9 || (q.y > ph.y && q.y - ph.y < 16 && Math.abs(q.x - ph.x) < 14)
    return `<span class="nl-acamp${p.feita ? ' feita' : ''}${perto ? ' perto' : ''}" style="left:${q.x}%;top:${q.y}%;--k:${k}"><i></i></span>`
  }).join('')
  const qc = pontoNaTrilha(1)
  const cume = `<span class="nl-cume" style="left:${qc.x}%;top:${qc.y}%"><i class="nl-cume-halo"></i><i class="nl-cume-brilho b1"></i><i class="nl-cume-brilho b2"></i><span class="nl-cume-flag">${BANDEIRA}</span><b>${esc(rotCume)}</b></span>`
  const lado = (ph.x < 18 ? ' nl-esq' : ph.x > 72 ? ' nl-dir' : '') + (ph.y > 78 ? ' nl-cima' : '')
  const voce = `<span class="nl-voce${lado}" style="left:${ph.x}%;top:${ph.y}%"><i class="nl-voce-halo"></i><i class="nl-voce-ponto"></i><b>${esc(rotHoje)}</b></span>`
  return `<span class="nl-monte-fundo">${svg}</span>${nos}${cume}${voce}`
}

const $ = (id) => document.getElementById(id)
const ui = {
  base: $('seg-base'), modo: $('seg-modo'), bonusSeg: $('seg-bonus'),
  nivel: $('nivel'), pct: $('pct'), xp: $('xp'), xph: $('xph'), bonus: $('bonus'), alvo: $('alvo'), data: $('data'), partida: $('partida'),
  grupoNivel: $('grupo-nivel'), grupoXp: $('grupo-xp'), grupoAlvo: $('grupo-alvo'), grupoData: $('grupo-data'), atalhos: $('atalhos'),
  monte: $('monte'), ceu: $('ceu'), voo: $('voo'), cena: $('cena'), cab: $('cab'), ritmo: $('ritmo'), marcos: $('marcos'), vazio: $('vazio'), resultado: $('resultado')
}

const PADRAO = { base: 'nivel', nivel: '1.200', pct: '', xp: '', xph: '300 mi', bonus: '1', modo: 'nivel', alvo: '1.500', data: '', partida: '' }
let estado = { ...PADRAO }
try { Object.assign(estado, JSON.parse(localStorage.getItem(CHAVE)) || {}) } catch {}
const salvar = () => { try { localStorage.setItem(CHAVE, JSON.stringify(estado)) } catch {} }

function marcarSeg(seg, v) {
  for (const b of seg.querySelectorAll('button')) b.setAttribute('aria-pressed', String(b.dataset.v === String(v)))
}

function preencher() {
  ui.nivel.value = estado.nivel
  ui.pct.value = estado.pct
  ui.xp.value = estado.xp
  ui.xph.value = estado.xph
  ui.bonus.value = estado.bonus === '1' ? '' : estado.bonus
  ui.alvo.value = estado.alvo
  ui.partida.value = estado.partida
  ui.data.min = isoDia(Date.now() + DIA)
  if (!estado.data || estado.data < ui.data.min) estado.data = isoDia(Date.now() + 30 * DIA)
  ui.data.value = estado.data
}

function lerBonus() {
  const v = parseFloat(String(estado.bonus || '1').replace(/[×x\s]/gi, '').replace(',', '.'))
  return v > 0 && v <= 100 ? v : 1
}

function pontoAtual() {
  if (estado.base === 'xp') {
    const xp = lerNumero(estado.xp)
    if (!(xp >= 0)) return { erro: ['Digite o XP total', 'O XP acumulado da conta, como 28,6 bi.'] }
    const nf = nivelDoXp(xp)
    if (nf >= NV_MAX) return { erro: ['XP alto demais', `Vai além do Nv ${fmtNv(NV_MAX)}.`] }
    return { xp, nv: Math.floor(nf), frac: nf % 1 }
  }
  const nv = lerInteiro(estado.nivel)
  if (!(nv >= 1)) return { erro: ['Digite o nível atual', 'O nível que a conta tem hoje.'] }
  if (nv >= NV_MAX) return { erro: ['Nível alto demais', `Use um nível abaixo de ${fmtNv(NV_MAX)}.`] }
  const pct = Math.min(99.9, Math.max(0, parseFloat(String(estado.pct || '0').replace(',', '.')) || 0))
  const a = xpDoNivel(nv)
  return { xp: a + (pct / 100) * (xpDoNivel(nv + 1) - a), nv, frac: pct / 100 }
}

function atalhosDe(nv) {
  const passos = nv < 100 ? [10, 50, 100] : nv < 1000 ? [100, 500, 1000] : [100, 500, 1000]
  const vals = []
  for (const p of passos) {
    const v = Math.ceil((nv + 1) / p) * p
    if (!vals.includes(v) && v > nv && v < NV_MAX) vals.push(v)
  }
  return vals.slice(0, 3)
}

const tile = (rot, val, sub) => `<div class="nl-rt"><span class="nl-rt-rot">${esc(rot)}</span><b>${esc(val)}</b><small>${esc(sub)}</small></div>`

function falha(titulo, texto) {
  ui.resultado.hidden = true
  ui.vazio.hidden = false
  ui.vazio.innerHTML = `<img src="../assets/pokebola.svg" alt="" /><b>${esc(titulo)}</b><span>${esc(texto)}</span>`
}

function calcular() {
  const agora = Date.now()
  ui.grupoNivel.hidden = estado.base !== 'nivel'
  ui.grupoXp.hidden = estado.base !== 'xp'
  const porNivel = estado.modo === 'nivel'
  ui.grupoAlvo.hidden = !porNivel
  ui.grupoData.hidden = porNivel
  const bonus = lerBonus()
  marcarSeg(ui.bonusSeg, [1, 1.5, 2, 3].includes(bonus) ? String(bonus) : '')
  const p = pontoAtual()
  if (!p.erro) {
    ui.atalhos.innerHTML = atalhosDe(p.nv).map((v) => `<button type="button" class="chip-nv" data-v="${v}">${fmtNv(v)}</button>`).join('')
  }
  if (p.erro) return falha(...p.erro)
  const base = lerNumero(estado.xph)
  if (!(base > 0)) return falha('Digite o XP por hora', 'Quanto XP a conta ganha por hora, como 300 mi.')
  const taxa = base * bonus
  const partidaDig = lerInteiro(estado.partida)
  const partida = partidaDig >= 1 ? partidaDig : p.nv
  if (partida > p.nv) return falha(`Partida acima do Nv ${fmtNv(p.nv)}`, 'A partida precisa ser um nível já alcançado.')
  let xpCume
  let tCume
  let alvoNv
  if (porNivel) {
    alvoNv = lerInteiro(estado.alvo)
    if (!(alvoNv > 0)) return falha('Digite o nível alvo', 'O nível que você quer alcançar.')
    if (alvoNv <= p.nv) return falha(`Já passou do Nv ${fmtNv(alvoNv)}`, `A conta está no Nv ${fmtNv(p.nv)}. Escolha um nível acima.`)
    if (alvoNv > NV_MAX) return falha('Nível alto demais', `Escolha um nível até ${fmtNv(NV_MAX)}.`)
    xpCume = xpDoNivel(alvoNv)
    tCume = agora + ((xpCume - p.xp) / taxa) * HORA
    if (tCume - agora > LIMITE) return falha('Mais de 30 anos', 'Nesse ritmo o alvo fica longe demais para projetar.')
  } else {
    tCume = fimDoDia(estado.data)
    if (!(tCume > agora)) return falha('Escolha uma data futura', 'A partir de amanhã.')
    if (tCume - agora > LIMITE) return falha('Data longe demais', 'Escolha uma data nos próximos 30 anos.')
    xpCume = p.xp + taxa * ((tCume - agora) / HORA)
    if (nivelDoXp(xpCume) >= NV_MAX) return falha('Nível alto demais', `Nesse ritmo passa do Nv ${fmtNv(NV_MAX)}.`)
  }
  ui.vazio.hidden = true
  ui.resultado.hidden = false
  const nvCume = nivelDoXp(xpCume)
  const xpBase = xpDoNivel(partida)
  const fHoje = xpCume > xpBase ? Math.max(0, Math.min(1, (p.xp - xpBase) / (xpCume - xpBase))) : 0
  const pct = Math.floor(fHoje * 100)
  const xpDe = (f) => xpBase + f * (xpCume - xpBase)
  const quando = (xp) => agora + ((xp - p.xp) / taxa) * HORA
  const marcos = [0, 0.2, 0.4, 0.6, 0.8, 1].map((f) => ({ f, feita: f <= fHoje && f < 1, nv: f === 0 ? partida : Math.floor(nivelDoXp(xpDe(f))) }))
  const rotHoje = `Nv ${fmtNv(p.nv)} · ${pct}%`
  const rotCume = `Nv ${fmtNv(nvCume)}`
  const ass = JSON.stringify([marcos.map((m) => m.feita), fHoje.toFixed(3), rotHoje, rotCume])
  if (ui.cena._ass !== ass) {
    ui.cena._ass = ass
    ui.cena.innerHTML = desenharMonte(marcos, fHoje, rotHoje, rotCume)
  }
  ui.monte.setAttribute('aria-label', porNivel ? `Escalada do Nv ${fmtNv(partida)} ao Nv ${fmtNv(alvoNv)}: ${pct}% do caminho feito` : `Escalada do Nv ${fmtNv(partida)} até ${fmtDia(tCume)}: Nv ${fmtNv(nvCume)}`)
  const barra = `<span class="nl-barra" aria-hidden="true"><i style="width:${pct}%"></i></span>`
  const nFinal = Math.floor(nvCume)
  ui.cab.innerHTML = porNivel
    ? `<span class="nl-cab-de">Nv ${fmtNv(p.nv)} → ${fmtNv(alvoNv)}</span><strong class="nl-cab-valor">${esc(fmtDuracao(tCume - agora))}</strong><span class="nl-cab-quando">${esc(fmtDia(tCume, { hora: tCume - agora < 14 * DIA }))}</span>${barra}<span class="nl-cab-sub"><span>Faltam ${esc(numCurto(xpCume - p.xp))} XP</span><b>${pct}%</b></span>`
    : `<span class="nl-cab-de">Até ${esc(fmtDia(tCume))}</span><strong class="nl-cab-valor">Nv ${fmtNv(nvCume)}</strong><span class="nl-cab-quando">${Math.floor((nvCume % 1) * 100)}% para o ${fmtNv(nvCume + 1)}</span>${barra}<span class="nl-cab-sub"><span>+${fmtNv(nFinal - p.nv)} ${nFinal - p.nv === 1 ? 'nível' : 'níveis'} · +${esc(numCurto(xpCume - p.xp))} XP</span><b>${pct}%</b></span>`
  const nvDia = Math.max(0, nivelDoXp(p.xp + taxa * 24) - nivelDoXp(p.xp))
  const tProx = ((xpDoNivel(p.nv + 1) - p.xp) / taxa) * HORA
  ui.ritmo.innerHTML = tile('XP por hora', numCurto(taxa), `${numCurto(taxa * 24)} por dia`)
    + tile('Níveis por dia', dec(nvDia, nvDia < 10 ? 1 : 0), `${dec(nvDia / 24, nvDia / 24 < 10 ? 1 : 0)} por hora`)
    + tile('Próximo nível', tProx < 60000 ? '< 1 min' : fmtDuracao(tProx), `Nv ${fmtNv(p.nv + 1)}`)
    + tile('Bônus de XP', bonus !== 1 ? `×${dec(bonus, 2)}` : 'nenhum', bonus !== 1 ? `base ${numCurto(base)}/h` : 'XP base')
  const proxima = marcos.find((m) => !m.feita)
  ui.marcos.innerHTML = marcos.map((m) => {
    const tipo = m.f === 1 ? 'cume' : m.feita ? 'feita' : m === proxima ? 'proxima' : 'meta'
    const quandoTxt = m.f === 1 ? fmtCurto(tCume) : m.feita ? (m.f === 0 ? (partida === p.nv && fHoje === 0 ? 'agora' : 'partida') : 'feito') : fmtCurto(quando(xpDe(m.f)))
    const ok = m.feita ? '<svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>' : ''
    return `<li class="nl-marco ${tipo}"><span class="nl-marco-pct">${ok}<span>${Math.round(m.f * 100)}%</span></span><b>Nv ${fmtNv(m.nv)}</b><small>${esc(quandoTxt)}</small></li>`
  }).join('')
}

let pendente = 0
function agendar() {
  cancelAnimationFrame(pendente)
  pendente = requestAnimationFrame(calcular)
}

function ligarSeg(seg, chave) {
  seg.addEventListener('click', (e) => {
    const b = e.target.closest('button[data-v]')
    if (!b) return
    estado[chave] = b.dataset.v
    if (chave === 'bonus') ui.bonus.value = b.dataset.v === '1' ? '' : dec(Number(b.dataset.v), 2)
    marcarSeg(seg, b.dataset.v)
    salvar()
    agendar()
  })
}

function ligar() {
  ligarSeg(ui.base, 'base')
  ligarSeg(ui.modo, 'modo')
  ligarSeg(ui.bonusSeg, 'bonus')
  const campos = { nivel: ui.nivel, pct: ui.pct, xp: ui.xp, xph: ui.xph, alvo: ui.alvo, partida: ui.partida, data: ui.data }
  for (const [k, el] of Object.entries(campos)) {
    el.addEventListener('input', () => { estado[k] = el.value; salvar(); agendar() })
  }
  for (const [k, el] of Object.entries({ nivel: ui.nivel, alvo: ui.alvo, partida: ui.partida })) {
    el.addEventListener('blur', () => {
      const v = lerInteiro(el.value)
      if (v > 0) el.value = estado[k] = inteiro.format(v)
      salvar()
    })
  }
  ui.bonus.addEventListener('input', () => { estado.bonus = ui.bonus.value.trim() || '1'; salvar(); agendar() })
  ui.atalhos.addEventListener('click', (e) => {
    const b = e.target.closest('button[data-v]')
    if (!b) return
    estado.alvo = ui.alvo.value = inteiro.format(Number(b.dataset.v))
    salvar()
    agendar()
  })
  setInterval(() => { if (!document.hidden) agendar() }, 60000)
}

let visivel = true
function pausar() {
  const parar = document.hidden || !visivel
  ui.monte.classList.toggle('nl-pausa', parar)
}

let timerCr = 0
let cresselia = null
function voar() {
  if (!visivel || !window.ppCresselia?.voar(cresselia)) return
  ui.monte.classList.add('lunar')
  clearTimeout(ui.monte._lunar)
  ui.monte._lunar = setTimeout(() => ui.monte.classList.remove('lunar'), 14500)
}

function agendarVoo(ms) {
  clearTimeout(timerCr)
  if (!cresselia) return
  timerCr = setTimeout(() => { voar(); agendarVoo(38000 + Math.random() * 40000) }, ms)
}

function iniciarCeu() {
  ui.ceu.innerHTML = CEU
  if (window.ppCresselia && !window.ppCresselia.bloqueado()) cresselia = window.ppCresselia.montar(ui.voo)
  ui.ceu.querySelector('.nl-lua').addEventListener('click', voar)
  if ('IntersectionObserver' in window) {
    new IntersectionObserver((itens) => { for (const it of itens) visivel = it.isIntersecting; pausar() }).observe(ui.monte)
  }
  document.addEventListener('visibilitychange', pausar)
  agendarVoo(9000)
}

preencher()
marcarSeg(ui.base, estado.base)
marcarSeg(ui.modo, estado.modo)
ligar()
iniciarCeu()
calcular()
