const CDN = 'https://cdn.jsdelivr.net/npm/'
const URL_TESSERACT = CDN + 'tesseract.js@5.1.1/dist/tesseract.min.js'
const URL_WORKER = CDN + 'tesseract.js@5.1.1/dist/worker.min.js'
const URL_CORE = CDN + 'tesseract.js-core@5.1.1'
const URL_IDIOMA = 'https://tessdata.projectnaptha.com/4.0.0_fast'

const STATS = ['hp', 'atk', 'def', 'spAtk', 'spDef', 'speed']
const ROTULOS = { hp: 'HP', atk: 'ATK', def: 'DEF', spAtk: 'SP.ATK', spDef: 'SP.DEF', speed: 'SPD' }
const LARGURA_ALVO = 1850
const MAX_PIXELS = 6e6

let carregandoWorker = null
let fila = Promise.resolve()
let progressoAtual = null

function carregarScript(url) {
  if (globalThis.Tesseract) return Promise.resolve()
  return new Promise((ok, falha) => {
    const s = document.createElement('script')
    s.src = url
    s.async = true
    s.crossOrigin = 'anonymous'
    s.onload = () => ok()
    s.onerror = () => falha(new Error('não consegui baixar o leitor de imagem'))
    document.head.append(s)
  })
}

async function criarWorker() {
  await carregarScript(URL_TESSERACT)
  const worker = await globalThis.Tesseract.createWorker('eng', 1, {
    workerPath: URL_WORKER,
    corePath: URL_CORE,
    langPath: URL_IDIOMA,
    logger: (m) => progressoAtual?.(m)
  })
  await worker.setParameters({ user_defined_dpi: '300', preserve_interword_spaces: '1' })
  return worker
}

function obterWorker() {
  carregandoWorker ??= criarWorker().catch((err) => {
    carregandoWorker = null
    throw err
  })
  return carregandoWorker
}

export function preparar() {
  if (typeof document === 'undefined') return
  obterWorker().catch(() => {})
}

async function paraCanvas(imagem) {
  let fonte = imagem
  if (imagem instanceof Blob) {
    if (typeof createImageBitmap === 'function') fonte = await createImageBitmap(imagem)
    else {
      const url = URL.createObjectURL(imagem)
      try {
        fonte = await new Promise((ok, falha) => {
          const img = new Image()
          img.onload = () => ok(img)
          img.onerror = () => falha(new Error('imagem inválida'))
          img.src = url
        })
      } finally {
        setTimeout(() => URL.revokeObjectURL(url), 0)
      }
    }
  } else if (typeof HTMLImageElement !== 'undefined' && imagem instanceof HTMLImageElement && !imagem.complete) {
    await new Promise((ok, falha) => {
      imagem.addEventListener('load', ok, { once: true })
      imagem.addEventListener('error', () => falha(new Error('imagem inválida')), { once: true })
    })
  }
  if (typeof HTMLCanvasElement !== 'undefined' && fonte instanceof HTMLCanvasElement) return fonte
  const w = fonte.naturalWidth || fonte.width
  const h = fonte.naturalHeight || fonte.height
  if (!w || !h) throw new Error('imagem vazia')
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  c.getContext('2d').drawImage(fonte, 0, 0)
  fonte.close?.()
  return c
}

function mediaCaixa(src, w, h, r) {
  const tmp = new Float32Array(w * h)
  const out = new Float32Array(w * h)
  for (let y = 0; y < h; y++) {
    const base = y * w
    let acc = 0
    for (let x = 0; x <= Math.min(r, w - 1); x++) acc += src[base + x]
    for (let x = 0; x < w; x++) {
      tmp[base + x] = acc / (Math.min(w - 1, x + r) - Math.max(0, x - r) + 1)
      if (x + r + 1 < w) acc += src[base + x + r + 1]
      if (x - r >= 0) acc -= src[base + x - r]
    }
  }
  for (let x = 0; x < w; x++) {
    let acc = 0
    for (let y = 0; y <= Math.min(r, h - 1); y++) acc += tmp[y * w + x]
    for (let y = 0; y < h; y++) {
      out[y * w + x] = acc / (Math.min(h - 1, y + r) - Math.max(0, y - r) + 1)
      if (y + r + 1 < h) acc += tmp[(y + r + 1) * w + x]
      if (y - r >= 0) acc -= tmp[(y - r) * w + x]
    }
  }
  return out
}

function lerPixels(origem, x, y, w, h, escala = 1) {
  x = Math.max(0, Math.floor(x))
  y = Math.max(0, Math.floor(y))
  w = Math.max(1, Math.min(origem.width - x, Math.round(w)))
  h = Math.max(1, Math.min(origem.height - y, Math.round(h)))
  const c = document.createElement('canvas')
  c.width = Math.max(1, Math.round(w * escala))
  c.height = Math.max(1, Math.round(h * escala))
  const g = c.getContext('2d', { willReadFrequently: true })
  g.imageSmoothingEnabled = true
  g.imageSmoothingQuality = 'high'
  g.drawImage(origem, x, y, w, h, 0, 0, c.width, c.height)
  return { x, y, w: c.width, h: c.height, c, g, img: g.getImageData(0, 0, c.width, c.height) }
}

function mapaZ(px, w, h, raio, canalMax = false) {
  const n = w * h
  const L = new Float32Array(n), L2 = new Float32Array(n), L3 = new Float32Array(n)
  for (let i = 0; i < n; i++) {
    const r = px[i * 4], g = px[i * 4 + 1], b = px[i * 4 + 2]
    const v = (canalMax ? Math.max(r, g, b) : 0.299 * r + 0.587 * g + 0.114 * b) / 255
    L[i] = v
    L2[i] = v * v
    L3[i] = v * v * v
  }
  const m1 = mediaCaixa(L, w, h, raio), m2 = mediaCaixa(L2, w, h, raio), m3 = mediaCaixa(L3, w, h, raio)
  const z = new Float32Array(n)
  for (let i = 0; i < n; i++) {
    const mu = m1[i]
    const vari = Math.max(0, m2[i] - mu * mu)
    const terceiro = m3[i] - 3 * mu * m2[i] + 2 * mu * mu * mu
    z[i] = ((terceiro >= 0 ? 1 : -1) * (L[i] - mu)) / Math.max(Math.sqrt(vari), 0.06)
  }
  return z
}

function realcar(origem, rx, ry, rw, rh, escala, raio, margem = 0, { canalMax = false, ampliarAntes = false } = {}) {
  const pre = ampliarAntes ? escala : 1
  const p = lerPixels(origem, rx, ry, rw, rh, pre)
  const px = p.img.data
  const z = mapaZ(px, p.w, p.h, Math.max(2, Math.round(raio * pre)), canalMax)
  for (let i = 0; i < z.length; i++) {
    const v = 255 - Math.min(255, Math.max(0, (z[i] - 0.25) * 200))
    px[i * 4] = px[i * 4 + 1] = px[i * 4 + 2] = v
    px[i * 4 + 3] = 255
  }
  p.g.putImageData(p.img, 0, 0)
  const pos = escala / pre
  const m = Math.round(margem)
  if (pos === 1 && !m) return p.c
  const c = document.createElement('canvas')
  c.width = Math.max(1, Math.round(p.w * pos)) + 2 * m
  c.height = Math.max(1, Math.round(p.h * pos)) + 2 * m
  const g = c.getContext('2d')
  g.fillStyle = '#fff'
  g.fillRect(0, 0, c.width, c.height)
  g.imageSmoothingEnabled = true
  g.imageSmoothingQuality = 'high'
  g.drawImage(p.c, m, m, c.width - 2 * m, c.height - 2 * m)
  return c
}

function semAcento(s) {
  return String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '')
}

const chave = (s) => semAcento(s).toUpperCase()
const altura = (p) => p.y1 - p.y0
const meioY = (p) => (p.y0 + p.y1) / 2
const limitar = (v, a, b) => Math.min(b, Math.max(a, v))

function caixaDe(b, escala, dx, dy) {
  return { x0: b.x0 / escala + dx, y0: b.y0 / escala + dy, x1: b.x1 / escala + dx, y1: b.y1 / escala + dy }
}

function palavrasDe(words, escala, dx = 0, dy = 0) {
  const out = []
  for (const w of words || []) {
    const t = String(w.text || '').trim()
    if (t) out.push({ t, k: chave(t), ...caixaDe(w.bbox, escala, dx, dy) })
  }
  return out
}

function linhasDe(lines, escala, dx = 0, dy = 0) {
  const out = []
  for (const l of lines || []) {
    const t = String(l.text || '').replace(/\s+/g, ' ').trim()
    if (t) out.push({ t, k: chave(t), ...caixaDe(l.bbox, escala, dx, dy), palavras: palavrasDe(l.words, escala, dx, dy) })
  }
  return out
}

function digitos(s) {
  return String(s).replace(/[Oo]/g, '0').replace(/[Il|!]/g, '1').replace(/[Ss]/g, '5').replace(/B/g, '8')
}

async function reconhecer(worker, canvas, psm, whitelist = '') {
  await worker.setParameters({ tessedit_pageseg_mode: psm, tessedit_char_whitelist: whitelist })
  const { data } = await worker.recognize(canvas)
  return data
}

async function lerRecorte(ctx, caixa, alturaTexto, whitelist, psm = '7') {
  const { worker, origem } = ctx
  const esc = limitar(34 / Math.max(1, alturaTexto), 1, 8)
  const raio = Math.max(4, Math.round(alturaTexto * 1.2))
  const c = realcar(origem, caixa.x0, caixa.y0, caixa.x1 - caixa.x0, caixa.y1 - caixa.y0, esc, raio, 16)
  const d = await reconhecer(worker, c, psm, whitelist)
  ctx.passo()
  return String(d.text || '').replace(/\s+/g, ' ').trim()
}

async function lerPilha(ctx, itens, whitelist, limiar = 0, estilo = {}) {
  const { worker, origem } = ctx
  const alvo = 34
  const gap = Math.round(alvo * 0.8)
  const partes = itens.map((it) => {
    if (!it) return null
    const c = it.caixa
    return realcar(origem, c.x0, c.y0, c.x1 - c.x0, c.y1 - c.y0, limitar(alvo / Math.max(1, it.h), 0.5, 8), Math.max(4, Math.round(it.h * 1.2)), 0, estilo)
  })
  const largura = Math.max(1, ...partes.filter(Boolean).map((c) => c.width)) + 2 * gap
  const faixas = []
  let y = gap
  for (const c of partes) {
    faixas.push(c ? { y0: y, y1: y + c.height } : null)
    if (c) y += c.height + gap
  }
  const tela = document.createElement('canvas')
  tela.width = largura
  tela.height = Math.max(y, 1)
  const g = tela.getContext('2d', { willReadFrequently: true })
  g.fillStyle = '#fff'
  g.fillRect(0, 0, tela.width, tela.height)
  partes.forEach((c, i) => { if (c) g.drawImage(c, gap, faixas[i].y0) })
  if (limiar) {
    const im = g.getImageData(0, 0, tela.width, tela.height)
    const d = im.data
    for (let i = 0; i < d.length; i += 4) d[i] = d[i + 1] = d[i + 2] = d[i] < limiar ? 0 : 255
    g.putImageData(im, 0, 0)
  }
  const dados = await reconhecer(worker, tela, '6', whitelist)
  ctx.passo()
  const textos = itens.map(() => [])
  for (const w of dados.words || []) {
    const t = String(w.text || '').trim()
    if (!t) continue
    const cy = (w.bbox.y0 + w.bbox.y1) / 2
    const i = faixas.findIndex((f) => f && cy >= f.y0 - gap / 2 && cy <= f.y1 + gap / 2)
    if (i >= 0) textos[i].push({ x: w.bbox.x0, t })
  }
  return textos.map((l) => l.sort((a, b) => a.x - b.x).map((p) => p.t).join(' '))
}

async function passadaGeral(worker, origem, y0, y1) {
  const W = origem.width
  const h = y1 - y0
  let escala = limitar(LARGURA_ALVO / W, 1, 4)
  if (W * h * escala * escala > MAX_PIXELS) escala = Math.max(0.8, Math.sqrt(MAX_PIXELS / (W * h)))
  const raio = Math.round(limitar(W / 100, 6, 16))
  const canvas = realcar(origem, 0, y0, W, h, escala, raio)
  const d = await reconhecer(worker, canvas, '11')
  return { palavras: palavrasDe(d.words, escala, 0, y0), linhas: linhasDe(d.lines, escala, 0, y0), texto: d.text || '' }
}

function escurecerLocal(origem, escala, raio) {
  const p = lerPixels(origem, 0, 0, origem.width, origem.height, escala)
  const { w, h } = p
  const d = p.img.data
  const L = new Float32Array(w * h)
  for (let i = 0; i < L.length; i++) L[i] = 0.299 * d[i * 4] + 0.587 * d[i * 4 + 1] + 0.114 * d[i * 4 + 2]
  const m = mediaCaixa(L, w, h, Math.max(2, Math.round(raio * escala)))
  for (let i = 0; i < L.length; i++) {
    const v = m[i] > 90 && m[i] - L[i] > 25 ? 0 : 255
    d[i * 4] = d[i * 4 + 1] = d[i * 4 + 2] = v
    d[i * 4 + 3] = 255
  }
  p.g.putImageData(p.img, 0, 0)
  return p.c
}

async function passadaEscura(worker, origem) {
  const W = origem.width, H = origem.height
  let escala = limitar(LARGURA_ALVO / W, 1, 4)
  if (W * H * escala * escala > MAX_PIXELS) escala = Math.max(0.8, Math.sqrt(MAX_PIXELS / (W * H)))
  const raio = limitar(Math.round(Math.min(W, H) / 60), 4, 10)
  const d = await reconhecer(worker, escurecerLocal(origem, escala, raio), '11')
  return { palavras: palavrasDe(d.words, escala), linhas: linhasDe(d.lines, escala), texto: d.text || '' }
}

const decimal = (inteiro, frac) => Number(`${inteiro}.${frac}`)

function camposDoTexto(texto) {
  const t = chave(texto).replace(/[|]/g, ' ')
  const D = '[0-9OIL]'
  const num = (x) => Number(digitos(x).replace(/L/g, '1'))
  const out = {}
  const pot = /(?:^|[^A-Z0-9])P\s?([1-5])(?![0-9.,])/.exec(t)
  if (pot) out.potencia = Number(pot[1])
  const soma = new RegExp(`(${D}{1,3})\\s*[/:.]\\s*192\\b`).exec(t) || new RegExp(`(?:^|[^A-Z])[I1L][VY]\\s*(?:S[O0]MAD[O0])?\\s*(${D}{1,3})\\b(?![.,]\\d)`).exec(t)
  if (soma && num(soma[1]) >= 6 && num(soma[1]) <= 192) out.ivSomado = num(soma[1])
  const q = new RegExp(`(?:^|[^A-Z])(?:Q|QUALIDADE|QUALITY|CALIDAD)\\s*[:.]?\\s*([0-3OIL])\\s*[,.]\\s*(${D}{1,3})\\b`).exec(t)
  if (q) out.quality = Number(`${num(q[1])}.${digitos(q[2]).replace(/L/g, '1')}`)
  const n = new RegExp(`(?:^|[^A-Z])(?:N|NOTA|SCORE)\\s*[:.]?\\s*(${D}{1,2})\\s*[,.]\\s*(${D}{1,3})\\b`).exec(t)
  if (n && num(n[1]) <= 10) out.nota = Number(`${num(n[1])}.${digitos(n[2]).replace(/L/g, '1')}`)
  const nv = new RegExp('(?:^|[^A-Z])N[VY]\\s*\\.?\\s*' + NUM_NIVEL + '(?![0-9])').exec(digitos(t))
  if (nv) out.level = numeroNivel(nv[1])
  const selo = /(?:^|\s)\+\s?(\d{1,2})(?=\s|$)/m.exec(t)
  if (selo) out.selo = Number(selo[1])
  out.zMove = /Z\s?-?\s?M[O0]VE/.test(t)
  out.aoe = /(?:^|[^A-Z0-9])A[O0]E(?:$|[^A-Z])/.test(t)
  return out
}

function ancora(palavras, re, filtro = () => true) {
  return palavras.filter((p) => re.test(p.k) && filtro(p)).sort((a, b) => a.y0 - b.y0 || a.x0 - b.x0)[0] || null
}

function comPares(linhas) {
  const out = []
  for (const l of linhas) {
    const ps = l.palavras
    ps.forEach((p, i) => {
      out.push(p)
      const q = ps[i + 1]
      const letras = (x) => x.k.replace(/[^A-Z]/g, '').length >= 2
      if (q && letras(p) && letras(q) && q.x0 - p.x1 < altura(p) * 1.2) out.push({ t: p.t + q.t, k: p.k + q.k, x0: p.x0, y0: Math.min(p.y0, q.y0), x1: q.x1, y1: Math.max(p.y1, q.y1) })
    })
  }
  return out
}

function localizarCartoes(linhas, W) {
  const rotulos = [
    { alvos: ['POTENCIA'], razao: 6.4 },
    { alvos: ['QUALIDADE'], razao: 7.3 },
    { alvos: ['SOMADO', 'IVSOMADO'], razao: 6.8 }
  ]
  const cands = []
  for (const p of comPares(linhas)) {
    const k = p.k.replace(/[^A-Z0-9]/g, '').replace(/0/g, 'O')
    rotulos.forEach((r, i) => {
      for (const alvo of r.alvos) {
        if (distancia(k, alvo) > Math.floor(alvo.length / 3)) continue
        const h = Math.min(altura(p), (p.x1 - p.x0) / (alvo === 'IVSOMADO' ? 8.6 : r.razao))
        cands.push({ i, x0: alvo === 'SOMADO' ? p.x0 - h * 2.2 : p.x0, y1: p.y1, h, exato: alvo !== 'SOMADO' })
      }
    })
  }
  if (!cands.length) return null
  let proximos = null
  for (const c of cands) {
    const grupo = []
    for (let i = 0; i < 3; i++) {
      const m = cands.filter((o) => o.i === i && Math.abs(o.y1 - c.y1) < c.h * 2.5).sort((a, b) => Math.abs(a.y1 - c.y1) - Math.abs(b.y1 - c.y1))[0]
      if (m) grupo.push(m)
    }
    const ordem = grupo.every((g, j) => j === 0 || g.x0 > grupo[j - 1].x0)
    if (!ordem) continue
    if (!proximos || grupo.length > proximos.length || (grupo.length === proximos.length && c.y1 < proximos[0].y1)) proximos = grupo
  }
  if (!proximos) return null
  let passo = W * 0.18
  if (proximos.length >= 2) {
    const a = proximos[0], b = proximos[proximos.length - 1]
    passo = (b.x0 - a.x0) / (b.i - a.i)
  }
  const h = Math.min(...proximos.map((a) => a.h))
  const y1 = Math.min(...proximos.map((a) => a.y1))
  const ref = proximos[0]
  const x = [0, 1, 2].map((i) => proximos.find((a) => a.i === i && a.exato)?.x0 ?? ref.x0 + (i - ref.i) * passo)
  const exato = [0, 1, 2].map((i) => proximos.some((a) => a.i === i && a.exato))
  return { x, exato, y1, h, passo, topo: y1 - h }
}

function caixaValorCartao(c, i) {
  return { x0: c.x[i] - c.h * (c.exato[i] ? 0.8 : 1), x1: c.x[i] + c.passo * 0.7, y0: c.y1 + c.h * 0.15, y1: c.y1 + c.h * 3.3, h: c.h * 1.5 }
}

function potenciaPelaCor(origem, c) {
  const p = lerPixels(origem, c.x[0], c.y1 - c.h * 1.2, c.passo * 0.6, c.h * 4.2)
  const d = p.img.data
  const hist = new Map()
  let saturados = 0
  const n = d.length / 4
  for (let i = 0; i < d.length; i += 4) {
    const r = d[i], g = d[i + 1], b = d[i + 2]
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b)
    if (mx <= 90 || (mx - mn) / mx <= 0.25) continue
    saturados++
    let hue = mx === r ? ((g - b) / (mx - mn)) % 6 : mx === g ? (b - r) / (mx - mn) + 2 : (r - g) / (mx - mn) + 4
    hue = Math.round((((hue * 60) % 360) + 360) % 360 / 10) * 10
    hist.set(hue, (hist.get(hue) || 0) + 1)
  }
  const frac = saturados / Math.max(1, n)
  if (frac < 0.15) return 1
  if (frac < 0.4) return null
  const hue = [...hist].sort((a, b) => b[1] - a[1])[0][0]
  if (hue >= 80 && hue <= 160) return 2
  if (hue >= 170 && hue <= 240) return 3
  if (hue >= 250 && hue <= 320) return 4
  if (hue >= 25 && hue <= 70) return 5
  return null
}

function lerPotenciaTexto(t) {
  const m = /P\s*([1-5])/.exec(digitos(t.toUpperCase()).replace(/[^P0-9]/g, ''))
  if (m) return Number(m[1])
  const n = /([1-5])/.exec(digitos(t))
  return n ? Number(n[1]) : null
}

function lerQualidadeTexto(t) {
  const s = digitos(t)
  const m = /(\d)\s*[,.]\s*(\d{3})/.exec(s)
  if (m) return Number(`${m[1]}.${m[2]}`)
  const n = /(?:^|\D)([0-3])(\d{3})(?:\D|$)/.exec(s)
  return n ? Number(`${n[1]}.${n[2]}`) : null
}

function opcoesSoma(t) {
  const s = digitos(t).replace(/\s+/g, '')
  const out = []
  const add = (v) => { if (v >= 6 && v <= 192 && !out.includes(v)) out.push(v) }
  const m = /^(\d{1,3})[/|]/.exec(s)
  if (m) add(Number(m[1]))
  const m2 = /(\d{1,3})[/|]/.exec(s)
  if (m2) add(Number(m2[1]))
  const primeiro = /^\s*(\d{1,3})\s+\d/.exec(digitos(t))
  if (primeiro) add(Number(primeiro[1]))
  const d = s.replace(/\D/g, '')
  if (d.endsWith('192') && d.length > 3) {
    const pre = d.slice(0, -3)
    add(Number(pre))
    if (pre.length > 1 && /[17]$/.test(pre)) add(Number(pre.slice(0, -1)))
  } else if (d.endsWith('92') && d.length > 2) {
    const pre = d.slice(0, -2)
    if (/[17]$/.test(pre)) add(Number(pre.slice(0, -1)))
    add(Number(pre))
  }
  if (!out.length && /^\d{1,3}$/.test(d)) add(Number(d))
  return out
}

const NUM_NIVEL = '(\\d{1,3}(?:[.,]\\s?\\d{3})+|\\d{1,5})'
const numeroNivel = (t) => Number(String(t).replace(/[.,\s]/g, ''))

function nivelDeTexto(t) {
  const s = digitos(t)
  const m = new RegExp('N\\s*[VYRW¥]\\s*\\.?\\s*' + NUM_NIVEL, 'i').exec(s.replace(/^.*?(N)/i, 'N'))
  if (m) return numeroNivel(m[1])
  const n = new RegExp(NUM_NIVEL + '\\s*$').exec(s)
  return n ? numeroNivel(n[1]) : null
}

function notaDeTexto(t) {
  const s = digitos(t)
  const m = /(\d{1,2})\s*[,.]\s*(\d{3})/.exec(s)
  if (m && Number(m[1]) <= 10) return Number(`${m[1]}.${m[2]}`)
  const n = /(?:^|\D)(\d)(\d{3})(?:\D|$)/.exec(s)
  return n ? Number(`${n[1]}.${n[2]}`) : null
}

function notaDaPassada(linhas) {
  for (const l of linhas) {
    const m = /(\d{1,2})\s*[,.]\s*(\d{3})\s*[/|1]?\s*1\s*0\s*[,.]\s*0/.exec(digitos(l.t))
    if (m && Number(m[1]) <= 10) return Number(`${m[1]}.${m[2]}`)
  }
  return null
}

function localizarIvs(origem, reg, porCor = true) {
  const p = lerPixels(origem, reg.x0, reg.y0, reg.x1 - reg.x0, reg.y1 - reg.y0)
  const { w, h } = p
  if (w < 10 || h < 10) return []
  const px = p.img.data
  const L = new Float32Array(w * h)
  for (let i = 0; i < w * h; i++) L[i] = Math.max(px[i * 4], px[i * 4 + 1], px[i * 4 + 2])
  const media = mediaCaixa(L, w, h, Math.max(4, Math.round(origem.width / 100)))
  const cor = new Uint8Array(w * h)
  const solto = new Uint8Array(w * h)
  for (let i = 0; i < w * h; i++) {
    const mx = L[i], mn = Math.min(px[i * 4], px[i * 4 + 1], px[i * 4 + 2])
    if (mx > 60 && mx - media[i] > 10) solto[i] = 1
    if (mx > 90 && mx - media[i] > 15 && (mx - mn) / mx > 0.3) cor[i] = 1
  }
  const maxV = Math.max(12, origem.width / 30), maxH = Math.max(30, origem.width / 14)
  const folga = Math.max(2, Math.round(origem.width / 300))
  const trilhas = (mask, n, m, idx, limite, apagar) => {
    const fechar = (ini, ult, a) => { if (ini >= 0 && ult - ini + 1 > limite) for (let k = ini; k <= ult; k++) apagar(a, k) }
    for (let a = 0; a < n; a++) {
      let ini = -1, ult = -1
      for (let b = 0; b < m; b++) {
        if (!mask[idx(a, b)]) continue
        if (ini < 0 || b - ult > folga + 1) {
          fechar(ini, ult, a)
          ini = b
        }
        ult = b
      }
      fechar(ini, ult, a)
    }
  }
  const apagarV = []
  trilhas(solto, w, h, (x, y) => y * w + x, maxV, (x, y) => { for (let d = -1; d <= 1; d++) if (x + d >= 0 && x + d < w) apagarV.push(y * w + x + d) })
  const base = porCor ? cor : solto
  const apagarH = []
  trilhas(base, h, w, (y, x) => y * w + x, maxH, (y, x) => apagarH.push(y * w + x))
  for (const i of apagarV) cor[i] = solto[i] = 0
  for (const i of apagarH) base[i] = 0
  if (porCor) {
    const apagarS = []
    trilhas(solto, h, w, (y, x) => y * w + x, maxH, (y, x) => apagarS.push(y * w + x))
    for (const i of apagarS) solto[i] = 0
  }
  const valorDe = (f, xFim) => {
    const hb = f.y1 - f.y0 + 1
    const ocupada = (x) => { for (let y = f.y0; y <= f.y1; y++) if (solto[y * w + x]) return true; return false }
    let x = xFim
    while (x >= 0 && xFim - x < hb * 0.6 && ocupada(x)) x--
    while (x >= 0 && xFim - x <= hb * 3 && !ocupada(x)) x--
    if (x < 0 || !ocupada(x)) return null
    const x1 = x
    let x0 = x, vazio = 0
    for (; x >= 0; x--) {
      if (ocupada(x)) { x0 = x; vazio = 0 } else if (++vazio > hb * 0.9) break
    }
    return x1 - x0 >= hb * 0.4 ? { x0: p.x + x0, x1: p.x + x1 + 1 } : null
  }
  if (!porCor) cor.set(solto)
  const direita = new Int32Array(h).fill(-1)
  for (let y = 0; y < h; y++) for (let x = w - 1; x >= 0; x--) if (cor[y * w + x]) { direita[y] = x; break }
  const validos = [...direita].filter((v) => v >= 0)
  if (validos.length < 6) return []
  const hist = new Map()
  for (const v of validos) { const k = Math.round(v / 3); hist.set(k, (hist.get(k) || 0) + 1) }
  let moda = null
  for (const [k, n] of hist) if (!moda || n + (hist.get(k - 1) || 0) + (hist.get(k + 1) || 0) > moda.n) moda = { k, n: n + (hist.get(k - 1) || 0) + (hist.get(k + 1) || 0) }
  const colDireita = Math.max(...validos.filter((v) => Math.abs(v - moda.k * 3) <= 6))
  const tol = Math.max(6, origem.width * 0.03)
  const linhaOk = (y) => direita[y] >= 0 && direita[y] >= colDireita - tol
  let faixas = []
  for (let y = 0; y < h; y++) {
    if (!linhaOk(y)) continue
    const ult = faixas[faixas.length - 1]
    if (ult && y - ult.y1 <= 2) ult.y1 = y
    else faixas.push({ y0: y, y1: y })
  }
  faixas = faixas.filter((f) => f.y1 - f.y0 >= 2)
  if (!faixas.length) return []
  const alts = faixas.map((f) => f.y1 - f.y0 + 1).sort((a, b) => a - b)
  const med = alts[Math.floor(alts.length / 2)]
  faixas = faixas.filter((f) => { const a = f.y1 - f.y0 + 1; return a >= med * 0.5 && a <= med * 1.8 })
  const tokens = faixas.map((f) => {
    const hb = f.y1 - f.y0 + 1
    const ocupada = (x) => { for (let y = f.y0; y <= f.y1; y++) if (cor[y * w + x]) return true; return false }
    let xl = colDireita, vazio = 0
    const lacunas = []
    for (let x = colDireita; x >= 0; x--) {
      if (ocupada(x)) {
        if (vazio) lacunas.push({ x0: x + 1, x1: x + vazio })
        xl = x
        vazio = 0
      } else if (++vazio > hb * 1.1) break
    }
    const largura = (l) => l.x1 - l.x0 + 1
    const separador = lacunas.filter((l) => l.x0 > xl && largura(l) >= hb * 0.75).sort((a, b) => b.x0 - a.x0)[0]
    if (separador && colDireita - separador.x1 >= hb * 1.5) xl = separador.x1 + 1
    const maior = lacunas.filter((l) => l.x0 > xl).sort((a, b) => largura(b) - largura(a) || a.x0 - b.x0)[0]
    return {
      valor: valorDe(f, xl - 1),
      x0: p.x + xl, x1: p.x + colDireita + 1, y0: p.y + f.y0, y1: p.y + f.y1 + 1,
      corte: maior && maior.x1 - maior.x0 + 1 >= hb * 0.15 ? p.x + maior.x1 + 1 : null
    }
  })
  return tokens.filter((t) => t.x1 - t.x0 >= (t.y1 - t.y0) * 1.5)
}

function ivsDeTexto(t, soDigitos) {
  const s = digitos(String(t).toUpperCase()).replace(/\s+/g, '')
  const out = []
  const add = (v) => { if (v !== '' && v != null && Number(v) >= 1 && Number(v) <= 32 && !out.includes(Number(v))) out.push(Number(v)) }
  const v = /V(\d{1,2})$/.exec(s)
  if (v) add(v[1])
  const d = /(\d{1,3})$/.exec(s)?.[1]
  if (d) {
    if (soDigitos || !v) add(d.length > 2 ? d.slice(-2) : d)
    if (!soDigitos && !v && d.startsWith('1')) add(d.slice(1))
  }
  return out
}

function ivsDaPassada(linhas, yTopo, yFim) {
  const lidos = []
  for (const l of linhas) {
    if ((yTopo != null && l.y0 < yTopo) || (yFim != null && l.y1 > yFim)) continue
    const t = digitos(l.k).replace(/\s+/g, ' ')
    if (/\(DE|DE 1|A 32/.test(t)) continue
    const m = /\d{1,3} ?[1I|L]V ?(\d{1,2})\b/.exec(t)
    if (m && Number(m[1]) <= 32) lidos.push({ y: meioY(l), v: Number(m[1]) })
  }
  return lidos.length === 6 ? lidos.sort((a, b) => a.y - b.y).map((x) => x.v) : null
}

function escolherIvs(opcoes, soma) {
  const primeiro = opcoes.map((o) => (o.length ? o[0] : null))
  const vazios = primeiro.filter((v) => v == null).length
  if (soma == null || vazios > 1) return { ivs: primeiro, bate: null, deduzido: null }
  let melhor = null
  const atual = []
  const busca = (i, acc, trocas) => {
    if (melhor && trocas >= melhor.trocas) return
    if (i === opcoes.length) {
      const falta = atual.indexOf(null)
      if (falta < 0) {
        if (acc === soma) melhor = { ivs: [...atual], trocas, deduzido: null }
      } else if (soma - acc >= 1 && soma - acc <= 32) {
        const ivs = [...atual]
        ivs[falta] = soma - acc
        melhor = { ivs, trocas, deduzido: falta }
      }
      return
    }
    if (!opcoes[i].length) {
      atual[i] = null
      busca(i + 1, acc, trocas)
      return
    }
    opcoes[i].forEach((v, j) => {
      atual[i] = v
      busca(i + 1, acc + v, trocas + (j > 0 ? 1 : 0))
    })
  }
  busca(0, 0, 0)
  return melhor ? { ivs: melhor.ivs, bate: true, deduzido: melhor.deduzido } : { ivs: primeiro, bate: false, deduzido: null }
}

function normalizarNome(s) {
  return semAcento(s).toLowerCase().replace(/[^a-z0-9.' -]/g, '').replace(/\s+/g, ' ').trim()
}

function distancia(a, b) {
  if (!a.length) return b.length
  if (!b.length) return a.length
  let ant = Array.from({ length: b.length + 1 }, (_, i) => i)
  for (let i = 1; i <= a.length; i++) {
    const cur = [i]
    for (let j = 1; j <= b.length; j++) cur[j] = Math.min(ant[j] + 1, cur[j - 1] + 1, ant[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1))
    ant = cur
  }
  return ant[b.length]
}

function comoEspecie(r) {
  if (!r) return null
  const id = r.speciesId ?? r.pokeId ?? r.id
  return id != null ? { speciesId: Number(id), nome: r.nome ?? r.name ?? null } : null
}

function identificarEspecie(candidatos, numero, especiePorNome, buscarEspecies) {
  for (const c of candidatos) {
    const n = normalizarNome(c)
    if (n.length < 3) continue
    if (buscarEspecies) {
      try {
        const exata = (buscarEspecies(n, 5) || []).map(comoEspecie).find((e) => e && normalizarNome(e.nome || '') === n)
        if (exata) return { ...exata, certeza: 1 }
      } catch {}
    }
    if (especiePorNome) {
      try {
        const e = comoEspecie(especiePorNome(c))
        if (e && normalizarNome(e.nome || '') === n) return { ...e, certeza: 1 }
      } catch {}
    }
  }
  if (numero && buscarEspecies) {
    try {
      const e = comoEspecie(buscarEspecies(String(numero), 1)?.[0])
      if (e && e.speciesId === numero && (!candidatos.length || candidatos.some((c) => distancia(normalizarNome(c), normalizarNome(e.nome || '')) <= 2))) return { ...e, certeza: 1 }
    } catch {}
  }
  if (!buscarEspecies) return null
  let melhor = null
  for (const c of candidatos) {
    const n = normalizarNome(c)
    if (n.length < 4) continue
    const vistos = new Map()
    const buscas = [n.slice(0, 3), n.slice(0, 2), n.slice(1, 4), n.slice(-3), ...n.split(' ').filter((w) => w.length >= 4)]
    for (const q of buscas) {
      try {
        for (const r of buscarEspecies(q, 80) || []) {
          const e = comoEspecie(r)
          if (e?.nome && !vistos.has(e.speciesId)) vistos.set(e.speciesId, e)
        }
      } catch {}
    }
    for (const e of vistos.values()) {
      const alvo = normalizarNome(e.nome)
      const d = distancia(n, alvo)
      if (d > Math.max(1, Math.floor(alvo.length / 4))) continue
      const rel = d / alvo.length
      if (!melhor || rel < melhor.rel || (rel === melhor.rel && alvo.length > melhor.tam)) melhor = { ...e, rel, tam: alvo.length, certeza: 1 - rel }
    }
  }
  if (!melhor) return null
  const { rel, tam, ...e } = melhor
  return e
}

function candidatosNome(linhas, limiteY) {
  const grupos = []
  const topo = linhas.filter((l) => limiteY == null || l.y1 <= limiteY).sort((a, b) => altura(b) - altura(a) || a.y0 - b.y0)
  for (const l of topo) {
    const limpo = l.t.replace(/\s*[·•»|].*$/, '')
    if (/^(POTENCIA|QUALIDADE|IV SOMADO)$/i.test(semAcento(limpo).trim())) continue
    const palavras = limpo.split(/\s+/)
      .map((p) => p.replace(/^[^A-Za-zÀ-ÿ]+|[^A-Za-zÀ-ÿ.'-]+$/g, ''))
      .filter((p) => /^[A-Za-zÀ-ÿ.'-]{2,}$/.test(p) || /^[A-Z]$/.test(p))
      .filter((p) => !/^shiny$/i.test(p))
      .map((p) => (/^[A-Za-z]{3,5}$/.test(p) && /[gc]a$/i.test(p) && distancia(p.toLowerCase(), 'mega') <= 2 ? 'Mega' : p))
    for (let n = Math.min(4, palavras.length); n >= 1; n--) {
      for (let i = 0; i + n <= palavras.length; i++) {
        const t = palavras.slice(i, i + n).join(' ')
        if (t.replace(/[^A-Za-zÀ-ÿ]/g, '').length >= 3) grupos.push({ t, n })
      }
    }
  }
  const vistos = new Set()
  return grupos
    .sort((a, b) => b.n - a.n || b.t.length - a.t.length)
    .map((g) => g.t)
    .filter((t) => !vistos.has(t.toLowerCase()) && vistos.add(t.toLowerCase()))
}

function caixaDoSelo(origem, titulo) {
  const th = altura(titulo)
  const p = lerPixels(origem, titulo.x1 - th * 3, titulo.y0 - th * 0.2, th * 9, th * 1.4)
  const d = p.img.data
  const colunas = new Array(p.w).fill(0)
  let y0 = p.h, y1 = -1
  for (let y = 0; y < p.h; y++) {
    for (let x = 0; x < p.w; x++) {
      const i = (y * p.w + x) * 4
      const r = d[i], g = d[i + 1], b = d[i + 2]
      if (g > 70 && g > r * 1.35 && g > b * 1.15) {
        colunas[x]++
        if (y < y0) y0 = y
        if (y > y1) y1 = y
      }
    }
  }
  const minimo = Math.max(2, th * 0.25)
  let x0 = -1, x1 = -1
  for (let x = 0; x < p.w; x++) {
    if (colunas[x] >= minimo) {
      if (x0 < 0) x0 = x
      x1 = x
    } else if (x0 >= 0 && x - x1 > th * 0.6) break
  }
  if (x0 < 0 || x1 - x0 < th * 0.8 || y1 - y0 < th * 0.4) return null
  return { x0: p.x + x0 - 1, x1: p.x + x1 + 2, y0: p.y + y0 - 1, y1: p.y + y1 + 2 }
}

function binarioDoSelo(origem, c) {
  const ch = c.y1 - c.y0
  const esc = limitar(84 / ch, 2, 8)
  const p = lerPixels(origem, c.x0 + ch * 0.2, c.y0 + ch * 0.15, c.x1 - c.x0 - ch * 0.4, ch * 0.7, esc)
  const d = p.img.data
  const L = new Float32Array(p.w * p.h)
  for (let i = 0; i < L.length; i++) L[i] = 0.299 * d[i * 4] + 0.587 * d[i * 4 + 1] + 0.114 * d[i * 4 + 2]
  const ord = Float32Array.from(L).sort()
  const limite = (ord[Math.floor(ord.length * 0.6)] + ord[Math.floor(ord.length * 0.03)]) / 2
  const m = 16
  const tela = document.createElement('canvas')
  tela.width = p.w + 2 * m
  tela.height = p.h + 2 * m
  const g = tela.getContext('2d')
  g.fillStyle = '#fff'
  g.fillRect(0, 0, tela.width, tela.height)
  const img = g.getImageData(m, m, p.w, p.h)
  for (let i = 0; i < L.length; i++) {
    const v = L[i] < limite ? 0 : 255
    img.data[i * 4] = img.data[i * 4 + 1] = img.data[i * 4 + 2] = v
    img.data[i * 4 + 3] = 255
  }
  g.putImageData(img, m, m)
  return tela
}

const TIPOS = ['NORMAL', 'FIRE', 'WATER', 'GRASS', 'ELECTRIC', 'ICE', 'FIGHTING', 'POISON', 'GROUND', 'FLYING', 'PSYCHIC', 'BUG', 'ROCK', 'GHOST', 'DRAGON', 'DARK', 'STEEL', 'FAIRY']

function lerChips(texto) {
  const k = chave(texto)
  const tokens = k.split(/[^A-Z0-9:]+/).filter(Boolean)
  const shiny = tokens.some((t) => t.length >= 4 && distancia(t.replace(/[^A-Z]/g, ''), 'SHINY') <= 1)
  const aoe = tokens.some((t) => { const x = t.replace(/[^A-Z0]/g, '').replace(/0/g, 'O'); return x.length >= 2 && x.length <= 4 && distancia(x, 'AOE') <= 1 && x.startsWith('A') })
  let elemental = null
  let fisico = false
  const re = /(?:^|[^A-Z])([EF])\s*[:;.,\-]{0,2}\s*([A-Z]{3,9})/g
  for (let m; (m = re.exec(k)) && !elemental;) {
    const w = m[2]
    let melhor = null
    for (const tipo of TIPOS) {
      const d = distancia(w, tipo)
      const lim = tipo.length <= 3 ? 0 : 1
      if (d <= lim && (!melhor || d < melhor.d)) melhor = { tipo, d }
    }
    if (melhor && !(TIPOS.includes(m[1] + w) && !/[:;.,]/.test(m[0]))) { elemental = melhor.tipo; fisico = m[1] === 'F' }
  }
  return { shiny, aoe, elemental, fisico }
}

async function executar(imagem, opcoes) {
  const { especiePorNome, buscarEspecies } = opcoes
  const avisar = (f, t) => { try { opcoes.aoProgresso?.(limitar(f, 0, 1), t) } catch {} }
  avisar(0, 'Preparando a leitura')
  const origem = await paraCanvas(imagem)
  const W = origem.width, H = origem.height

  let fase = 'carregando'
  progressoAtual = (m) => {
    if (fase === 'carregando' && m.progress != null && /load|download|initializ/i.test(m.status || '')) avisar(0.02 + 0.3 * m.progress, 'Baixando o leitor de imagem')
    else if (fase === 'geral' && m.status === 'recognizing text') avisar(0.35 + 0.4 * m.progress, 'Lendo a ficha')
  }
  const worker = await obterWorker()

  fase = 'geral'
  avisar(0.35, 'Lendo a ficha')
  const corteTopo = Math.min(H, Math.round(W * 1.2))
  let g = await passadaGeral(worker, origem, 0, corteTopo)
  if (corteTopo < H && (!ancora(g.palavras, /^ATUAI|^STATS/) || !localizarCartoes(g.linhas, W))) {
    const resto = await passadaGeral(worker, origem, Math.max(0, corteTopo - Math.round(W * 0.1)), H)
    g = { palavras: [...g.palavras, ...resto.palavras], linhas: [...g.linhas, ...resto.linhas], texto: g.texto + '\n' + resto.texto }
  }
  const { palavras, linhas } = g

  fase = 'recortes'
  let feitos = 0
  const ctx = { worker, origem, passo: () => avisar(0.75 + Math.min(0.23, ++feitos * 0.02), 'Conferindo os números') }

  const ficha = { speciesId: null, nome: null, shiny: false, level: null, potencia: null, quality: null, nota: null, ivs: {}, refino: {}, tmElemental: null, tmFisico: false, tmAoe: false, zMove: false, stats: null, statsOpcoes: null, selo: null }
  const avisos = []

  const cartoes = localizarCartoes(linhas, W)
  const limiteTopo = cartoes ? cartoes.topo : H
  const topoCartoes = cartoes ? cartoes.topo : null
  const nvPalavra = palavras
    .filter((p) => p.y1 <= limiteTopo && /(^|[^A-Z])N[VYRW¥][\d.,]*$/.test(p.k.replace(/[^A-Z0-9¥.,]/g, '')))
    .sort((a, b) => a.y0 - b.y0)[0]
  const aStats = ancora(palavras, /^ATUAI/) || ancora(palavras, /^STATS$/, (p) => p.y0 > limiteTopo)
  const ancoraNota = palavras
    .filter((p) => /^[1I]?1[0O][,.]?[0O]$/.test(p.k.replace(/[^0-9A-Z,.]/g, '')) && p.x1 - p.x0 > 6 && (!aStats || p.y1 < aStats.y0))
    .sort((a, b) => a.y0 - b.y0)[0]

  const itens = [null, null, null, null, null]
  if (cartoes) for (let i = 0; i < 3; i++) { const c = caixaValorCartao(cartoes, i); itens[i] = { caixa: c, h: c.h } }
  if (nvPalavra) {
    const h = altura(nvPalavra)
    itens[3] = { caixa: { x0: nvPalavra.x0 - h * 0.6, x1: nvPalavra.x0 + h * 7, y0: nvPalavra.y0 - h * 0.45, y1: nvPalavra.y1 + h * 0.45 }, h }
  }
  if (ancoraNota) {
    const lw = ancoraNota.x1 - ancoraNota.x0
    itens[4] = { caixa: { x0: ancoraNota.x0 - lw * 4.2, x1: ancoraNota.x0 - lw * 0.05, y0: ancoraNota.y1 - lw * 1.3, y1: ancoraNota.y1 + lw * 0.12 }, h: lw * 0.8 }
  }
  const leitores = [lerPotenciaTexto, lerQualidadeTexto, (t) => opcoesSoma(t)[0] ?? null, nivelDeTexto, notaDeTexto]
  const listas = ['P12345', '0123456789,.', '0123456789/', 'Nv0123456789., ', '0123456789,./']
  const brutos = itens.some(Boolean) ? await lerPilha(ctx, itens, 'PNv0123456789,./ ', 0, { ampliarAntes: true }) : itens.map(() => '')
  const lidos = brutos.map((t, i) => (itens[i] ? leitores[i](t) : null))
  const daPilha = [...brutos]
  for (let i = 0; i < itens.length; i++) {
    if (!itens[i] || lidos[i] != null) continue
    brutos[i] = await lerRecorte(ctx, itens[i].caixa, itens[i].h, listas[i])
    lidos[i] = leitores[i](brutos[i])
  }
  const corPot = cartoes ? potenciaPelaCor(origem, cartoes) : null
  ficha.potencia = corPot ?? lidos[0]
  ficha.quality = lidos[1]
  const opcoesIvSomado = itens[2] ? [...new Set([...opcoesSoma(brutos[2]), ...opcoesSoma(daPilha[2])])] : []
  const nivelRecorte = lidos[3]
  ficha.nota = lidos[4]
  const nivelLinha = linhas
    .filter((l) => l.y1 <= limiteTopo && !/CONTA|PRECISA/.test(l.k))
    .map((l) => new RegExp('\\bN[VYRW¥]\\s*\\.?\\s*' + NUM_NIVEL + '\\b').exec(digitos(l.k).replace(/N1/g, 'NV')))
    .find(Boolean)
  const nivelTopo = nivelLinha ? numeroNivel(nivelLinha[1]) : null
  const conta = /CONTA\s+C\S{2,4}\s+N\S?\s*(\d{1,3})\b/.exec(digitos(linhas.map((l) => l.k).join('\n')).replace(/C0NTA/g, 'CONTA'))
  const nivelConta = conta ? Number(conta[1]) : null
  const valido = (v) => v != null && v >= 1 && v <= 20000
  const decidirNivel = (badge, topo) => {
    if (valido(nivelConta) && nivelConta < 150) return nivelConta
    const ok = (v) => valido(v) && (!valido(nivelConta) || v >= nivelConta)
    if (ok(badge) && badge === topo) return badge
    return [badge, topo].find(ok) ?? null
  }
  ficha.level = decidirNivel(nivelRecorte, nivelTopo)

  if (ficha.nota == null || ficha.nota > 10) ficha.nota = notaDaPassada(linhas)

  const ehShiny = (p) => /SHINY/.test(p.k) || distancia(p.k.replace(/[^A-Z]/g, ''), 'SHINY') <= 1
  ficha.shiny = palavras.some((p) => p.y1 <= limiteTopo && ehShiny(p))
  const numero = Number(/#\s*(\d{1,4})\s+[A-Za-z]/.exec(g.texto)?.[1]) || null
  const nivelSeguro = (valido(nivelConta) && nivelConta < 150) || (valido(nivelRecorte) && nivelRecorte === nivelTopo)
  let cabecalho = []
  if (cartoes) {
    const c = cartoes
    const caixa = { x0: c.x[0] - c.h * 1.5, x1: c.x[1] + c.passo * 0.9, y0: Math.max(0, c.topo - c.passo * 1.15), y1: c.topo - c.h * 0.3 }
    const esc = limitar(30 / c.h, 1, 6)
    const tela = realcar(origem, caixa.x0, caixa.y0, caixa.x1 - caixa.x0, caixa.y1 - caixa.y0, esc, Math.max(4, Math.round(c.h * 2)), 16, { ampliarAntes: true })
    const d = await reconhecer(worker, tela, '6')
    ctx.passo()
    cabecalho = linhasDe(d.lines, esc, caixa.x0 - 16 / esc, caixa.y0 - 16 / esc)
    if (!ficha.shiny) ficha.shiny = cabecalho.some((l) => l.palavras.some(ehShiny))
    if (!nivelSeguro) {
      const m = cabecalho
        .map((l) => new RegExp('\\bN\\s*[VYRW¥]\\s*\\.?\\s*' + NUM_NIVEL + '\\b').exec(digitos(l.k)) || new RegExp('^[^A-Za-z0-9]*[A-Za-z¥]{1,3}\\s*\\.?\\s*' + NUM_NIVEL + '[^A-Za-z0-9]*$').exec(l.t))
        .find(Boolean)
      if (m) ficha.level = decidirNivel(numeroNivel(m[1]), nivelRecorte ?? nivelTopo)
    }
    const caixaChips = { x0: c.x[0] - c.h, x1: c.x[1] + c.passo, y0: c.topo - c.h * 4.6, y1: c.topo - c.h * 1.4 }
    const escChips = limitar(28 / c.h, 1, 6)
    const raioChips = Math.max(3, Math.round(c.h * 0.8))
    const telaChips = realcar(origem, caixaChips.x0, caixaChips.y0, caixaChips.x1 - caixaChips.x0, caixaChips.y1 - caixaChips.y0, escChips, raioChips, 16, { ampliarAntes: true })
    let textoChips = ''
    for (const psm of ['7', '11']) {
      textoChips += ' ' + (await reconhecer(worker, telaChips, psm)).text
      ctx.passo()
    }
    const chips = lerChips(textoChips)
    if (chips.shiny) ficha.shiny = true
    ficha.tmElemental = chips.elemental
    ficha.tmFisico = chips.fisico
    ficha.tmAoe = chips.aoe
  }
  const cand = candidatosNome([...linhas.filter((l) => l.y1 <= limiteTopo), ...cabecalho], null)
  const esp = identificarEspecie(cand, numero, especiePorNome, buscarEspecies)
  const palavrasNome = normalizarNome(esp?.nome || '').split(' ').filter((w) => w.length >= 3)
  const pontoTitulo = (l) => normalizarNome(l.t).split(' ').filter((w) => palavrasNome.some((n) => distancia(w, n) <= 1)).length
  const titulo = cabecalho.filter((l) => pontoTitulo(l) > 0).sort((a, b) => pontoTitulo(b) - pontoTitulo(a) || altura(b) - altura(a) || b.y0 - a.y0)[0]
  const seloTexto = [...linhas.filter((l) => l.y1 <= limiteTopo), ...cabecalho].map((l) => /\+\s?(\d{1,4})\b/.exec(l.t)).find(Boolean)
  if (seloTexto) ficha.selo = Number(seloTexto[1])
  else if (titulo) {
    const caixaSelo = caixaDoSelo(origem, titulo)
    if (caixaSelo) {
      const tela = binarioDoSelo(origem, caixaSelo)
      for (const psm of ['8', '7']) {
        const t = (await reconhecer(worker, tela, psm, '+0123456789')).text.replace(/\s+/g, '')
        ctx.passo()
        const m = /\+(\d{1,4})/.exec(t) || /^4(\d{1,4})$/.exec(t) || /^(\d{1,4})$/.exec(t)
        if (m) { ficha.selo = Number(m[1]); break }
      }
    }
  }
  if (esp) {
    ficha.speciesId = esp.speciesId
    ficha.nome = esp.nome
  } else ficha.nome = cand[0] || null

  let escura = null
  if (!cartoes || ficha.speciesId == null || ficha.level == null || ficha.potencia == null || ficha.quality == null || ficha.nota == null || !opcoesIvSomado.length) {
    escura = await passadaEscura(worker, origem)
    ctx.passo()
    const tudo = g.texto + '\n' + escura.texto
    const c = camposDoTexto(tudo)
    for (const k of ['potencia', 'quality', 'nota', 'level']) if (ficha[k] == null && c[k] != null) ficha[k] = c[k]
    if (c.ivSomado != null && !opcoesIvSomado.includes(c.ivSomado)) opcoesIvSomado.push(c.ivSomado)
    if (ficha.selo == null && c.selo != null) ficha.selo = c.selo
    if (c.zMove) ficha.zMove = true
    const chips = lerChips(tudo)
    if (chips.shiny) ficha.shiny = true
    if (!ficha.tmElemental && chips.elemental) { ficha.tmElemental = chips.elemental; ficha.tmFisico = chips.fisico }
    if (c.aoe) ficha.tmAoe = true
    if (ficha.speciesId == null || (esp && esp.certeza < 1)) {
      const outro = identificarEspecie(candidatosNome([...linhas, ...escura.linhas], null), numero, especiePorNome, buscarEspecies)
      if (outro && (!esp || outro.certeza > esp.certeza)) {
        ficha.speciesId = outro.speciesId
        ficha.nome = outro.nome
      }
    }
  }
  if (opcoes.depurar) ficha.depurar = { texto: g.texto, escura: escura?.texto ?? null, cand: cand.slice(0, 12) }

  const yTopo = aStats ? aStats.y1 : topoCartoes != null ? topoCartoes : 0
  const legenda = linhas.filter((l) => l.y0 > yTopo && /\(DE|DE 1 ?A|1 ?A ?32|STATS.?BASE/.test(digitos(l.k).replace(/1A/g, '1 A'))).sort((a, b) => a.y0 - b.y0)[0]
  const yFim = legenda ? legenda.y0 : Math.min(H, yTopo + W * 0.55)
  const regiaoIvs = { x0: W * 0.4, x1: W, y0: yTopo, y1: yFim }
  const qualidadeTokens = (ts) => ts.length !== 6 ? -1 : ts.filter((t) => {
    const hb = t.y1 - t.y0
    const larg = t.x1 - t.x0
    if (larg > hb * 5.5) return false
    return (t.corte != null && t.corte - t.x0 >= hb * 0.8 && t.x1 - t.corte >= hb * 0.4) || (larg >= hb * 1.8 && larg <= hb * 4.5)
  }).length
  const porCor = localizarIvs(origem, regiaoIvs)
  const porLuz = localizarIvs(origem, regiaoIvs, false)
  const [tokens, outros] = qualidadeTokens(porLuz) > qualidadeTokens(porCor) ? [porLuz, porCor] : [porCor, porLuz]
  tokens.forEach((t) => {
    if (t.valor) return
    const par = outros.find((o) => o.valor && Math.abs(o.y0 - t.y0) <= 2 && o.valor.x1 <= t.x1)
    if (par) t.valor = par.valor
  })
  const opcoesIv = STATS.map(() => [])
  if (tokens.length === 6) {
    const pad = (t) => (t.y1 - t.y0) * 0.35
    const soNumero = tokens.map((t) => {
      const hb = t.y1 - t.y0
      const x0 = t.corte != null ? t.corte - pad(t) * 0.5 : t.x1 - t.x0 < hb * 2 ? t.x0 - pad(t) : t.x0 + (t.x1 - t.x0) * 0.45
      return { caixa: { x0, x1: t.x1 + pad(t), y0: t.y0 - pad(t), y1: t.y1 + pad(t) }, h: t.y1 - t.y0 }
    })
    const inteiros = tokens.map((t) => ({ caixa: { x0: t.x0 - pad(t), x1: t.x1 + pad(t), y0: t.y0 - pad(t), y1: t.y1 + pad(t) }, h: t.y1 - t.y0 }))
    const ampliado = { ampliarAntes: true }
    const leituras = [
      [await lerPilha(ctx, soNumero, '0123456789', 0, ampliado), true],
      [await lerPilha(ctx, soNumero, '0123456789'), true],
      [await lerPilha(ctx, soNumero, '0123456789', 160), true],
      [await lerPilha(ctx, inteiros, 'IV0123456789 ', 0, ampliado), false]
    ]
    for (const [textos, soDigitos] of leituras) {
      textos.forEach((t, i) => { for (const v of ivsDeTexto(t, soDigitos)) if (!opcoesIv[i].includes(v)) opcoesIv[i].push(v) })
    }
  }
  if (tokens.length === 6 && tokens.every((t) => t.valor)) {
    const caixas = tokens.map((t) => {
      const hb = t.y1 - t.y0
      return { caixa: { x0: t.valor.x0 - hb * 0.4, x1: t.valor.x1 + hb * 0.4, y0: t.y0 - hb * 0.45, y1: t.y1 + hb * 0.45 }, h: hb * 1.1 }
    })
    const valorDeTexto = (t) => {
      const d = digitos(t).replace(/[^0-9]/g, '')
      return d && d.length <= 9 ? Number(d) : null
    }
    const leituras = [
      await lerPilha(ctx, caixas, '0123456789.,', 0, { ampliarAntes: true }),
      await lerPilha(ctx, caixas, '0123456789.,'),
      await lerPilha(ctx, caixas, '0123456789.,', 160)
    ].map((l) => l.map(valorDeTexto))
    const stats = {}
    const opcoesStats = {}
    STATS.forEach((k, i) => {
      const vals = leituras.map((l) => l[i]).filter((v) => v != null && v > 0)
      if (!vals.length) return
      const contagem = new Map()
      for (const v of vals) contagem.set(v, (contagem.get(v) || 0) + 1)
      const ordem = [...contagem].sort((a, b) => b[1] - a[1] || vals.indexOf(a[0]) - vals.indexOf(b[0])).map(([v]) => v)
      stats[k] = ordem[0]
      opcoesStats[k] = ordem
    })
    if (Object.keys(stats).length) {
      ficha.stats = stats
      ficha.statsOpcoes = opcoesStats
    }
  }
  const daPassada = ivsDaPassada(linhas, yTopo, yFim)
  if (daPassada) daPassada.forEach((v, i) => { if (!opcoesIv[i].includes(v)) opcoesIv[i].push(v) })

  const testarSomas = (lista) => {
    for (const alt of lista) {
      const e = escolherIvs(opcoesIv, alt)
      if (e.bate) return { escolha: e, soma: alt }
    }
    return null
  }
  let ivSomado = opcoesIvSomado[0] ?? null
  let escolha = escolherIvs(opcoesIv, ivSomado)
  let achou = escolha.bate ? null : testarSomas(opcoesIvSomado.slice(1))
  if (!escolha.bate && !achou && cartoes && opcoesIv.filter((o) => o.length).length >= 5) {
    for (const margem of [0.4, 0.6]) {
      const c = { ...caixaValorCartao(cartoes, 2), x0: cartoes.x[2] - cartoes.h * margem }
      const extras = opcoesSoma(await lerRecorte(ctx, c, c.h, '0123456789/'))
      for (const v of extras) if (!opcoesIvSomado.includes(v)) opcoesIvSomado.push(v)
      achou = testarSomas(extras)
      if (achou) break
    }
    if (ivSomado == null) ivSomado = opcoesIvSomado[0] ?? null
    if (!achou) escolha = escolherIvs(opcoesIv, ivSomado)
  }
  if (achou) {
    escolha = achou.escolha
    ivSomado = achou.soma
  }
  const descartarIvs = escolha.bate === false && ivSomado != null
  if (!descartarIvs) STATS.forEach((k, i) => { if (escolha.ivs[i] != null) ficha.ivs[k] = escolha.ivs[i] })
  if (ivSomado != null) ficha.ivSomado = ivSomado
  if (escolha.deduzido != null) avisos.push(`IV de ${ROTULOS[STATS[escolha.deduzido]]} deduzido pelo IV somado`)
  if (descartarIvs) {
    ficha.stats = null
    ficha.statsOpcoes = null
    avisos.push('não consegui ler os IVs de cada stat; estimei pelo IV somado e pela nota')
  } else if (escolha.bate === false) {
    const s = STATS.reduce((a, k) => a + (ficha.ivs[k] ?? 0), 0)
    avisos.push(`soma dos IVs (${s}) não bate com IV somado (${ivSomado})`)
  }
  if (ivSomado == null) avisos.push('não achei o IV somado para conferir os IVs')

  const faltando = []
  if (ficha.speciesId == null) faltando.push('especie')
  for (const k of ['level', 'potencia', 'quality', 'nota']) if (ficha[k] == null) faltando.push(k)
  for (const k of STATS) if (ficha.ivs[k] == null) faltando.push(`ivs.${k}`)

  const pesos = { especie: 0.2, level: 0.1, potencia: 0.1, quality: 0.1, nota: 0.05 }
  let confianca = 1
  for (const f of faltando) confianca -= pesos[f] ?? 0.06
  if (escolha.bate === false) confianca -= 0.25
  if (ivSomado == null) confianca -= 0.1
  if (esp && esp.certeza < 1) confianca -= 0.1
  confianca = Math.round(limitar(confianca, 0, 1) * 100) / 100

  avisar(1, 'Pronto')
  return { ficha, faltando, avisos, confianca }
}

const REFINAVEIS = ['hp', 'atk', 'def', 'spAtk', 'spDef']

export function refinoPelosStats(pk, stats, motor) {
  if (!pk || !stats || typeof motor?.simular !== 'function') return null
  const opcoes = Object.fromEntries(STATS.map((k) => [k, (Array.isArray(stats[k]) ? stats[k] : [stats[k]]).map(Number).filter((v) => v > 0)]))
  const simular = (refino) => motor.simular({ ...pk, refino })?.stats || null
  const zero = { hp: 0, atk: 0, def: 0, spAtk: 0, spDef: 0 }
  const base = simular(zero)
  if (!base || !opcoes.speed.includes(base.speed)) return null
  const PASSO = 1000
  const teste = simular(Object.fromEntries(REFINAVEIS.map((k) => [k, PASSO])))
  if (!teste) return null
  const refino = { ...zero }
  for (const k of REFINAVEIS) {
    const porPonto = (teste[k] - base[k]) / PASSO
    if (!(porPonto > 0)) return null
    let achado = null
    for (const alvo of opcoes[k]) {
      const estimado = Math.max(0, Math.round((alvo - base[k]) / porPonto))
      const tentativas = porPonto < 1
        ? Array.from({ length: Math.ceil(2 / porPonto) + 1 }, (_, i) => i)
        : [0, -1, 1, -2, 2].map((d) => estimado + d).filter((v) => v >= 0)
      achado = tentativas.find((v) => simular({ ...zero, [k]: v })?.[k] === alvo) ?? null
      if (achado != null) break
    }
    if (achado == null && porPonto < 1) achado = 0
    if (achado == null) return null
    refino[k] = achado
  }
  const final = simular(refino)
  return final && REFINAVEIS.every((k) => opcoes[k].includes(final[k]) || (base[k] === final[k] && (teste[k] - base[k]) / PASSO < 1)) ? refino : null
}

const URL_IA = 'https://pokepocket-leitor.piscis.workers.dev/ler'
const PIXELS_IA = 1150000
const PRAZO_IA = 40000

async function imagemParaIa(imagem) {
  const c = await paraCanvas(imagem)
  const k = Math.min(1, Math.sqrt(PIXELS_IA / (c.width * c.height)))
  const t = document.createElement('canvas')
  t.width = Math.max(1, Math.round(c.width * k))
  t.height = Math.max(1, Math.round(c.height * k))
  const g = t.getContext('2d')
  g.imageSmoothingEnabled = true
  g.imageSmoothingQuality = 'high'
  g.drawImage(c, 0, 0, t.width, t.height)
  return new Promise((ok, falha) => t.toBlob((b) => (b ? ok(b) : falha(new Error('imagem'))), 'image/jpeg', 0.92))
}

const naFaixa = (v, a, b, inteiro = false) => (typeof v === 'number' && Number.isFinite(v) && v >= a && v <= b && (!inteiro || Number.isInteger(v)) ? v : null)

function porStatValido(o, a, b) {
  if (!o || typeof o !== 'object') return null
  const out = {}
  for (const k of STATS) { const v = naFaixa(o[k], a, b, true); if (v != null) out[k] = v }
  return Object.keys(out).length === 6 ? out : null
}

async function lerComIa(imagem, opcoes) {
  const corpo = await imagemParaIa(imagem)
  const r = await fetch(URL_IA, { method: 'POST', headers: { 'content-type': 'image/jpeg' }, body: corpo, signal: AbortSignal.timeout(PRAZO_IA) })
  if (!r.ok) return null
  const f = (await r.json())?.ficha
  if (!f?.ehFicha || !f.nome) return null
  const esp = identificarEspecie([String(f.nome).replace(/^\s*shiny\s+/i, '')], null, opcoes.especiePorNome, opcoes.buscarEspecies)
  if (!esp) return null
  const ivSomado = naFaixa(f.ivSomado, 6, 192, true)
  let ivs = porStatValido(f.ivs, 1, 32)
  if (ivs && ivSomado != null && STATS.reduce((a, k) => a + ivs[k], 0) !== ivSomado) ivs = null
  const stats = porStatValido(f.stats, 1, 1e8)
  return {
    speciesId: esp.speciesId, nome: esp.nome, certeza: esp.certeza ?? 1, shiny: !!f.shiny,
    level: naFaixa(f.nivel, 1, 20000, true), potencia: naFaixa(f.potencia, 1, 5, true), quality: naFaixa(f.qualidade, 0.5, 2.5), nota: naFaixa(f.nota, 0, 10),
    ivSomado, ivs, stats, selo: naFaixa(f.refino, 1, 999, true),
    tmElemental: TIPOS.includes(f.tmTipo) ? f.tmTipo : null, tmFisico: !!(f.tmTipo && f.tmFisico), tmAoe: !!f.aoe, zMove: !!f.zMove
  }
}

const PESOS_FALTA = { especie: 0.2, level: 0.1, potencia: 0.1, quality: 0.1, nota: 0.05 }

function juntarLeituras(ia, local) {
  const lf = local?.ficha || {}
  const ficha = { speciesId: ia.speciesId, nome: ia.nome, shiny: ia.shiny || !!lf.shiny, level: null, potencia: null, quality: null, nota: null, ivs: {}, refino: {}, tmElemental: null, tmFisico: false, tmAoe: false, zMove: false, stats: null, statsOpcoes: null, selo: null }
  for (const k of ['level', 'potencia', 'quality', 'nota', 'selo']) ficha[k] = ia[k] ?? lf[k] ?? null
  ficha.ivSomado = ia.ivSomado ?? lf.ivSomado ?? null
  ficha.tmElemental = ia.tmElemental ?? lf.tmElemental ?? null
  ficha.tmFisico = ia.tmElemental ? ia.tmFisico : !!lf.tmFisico
  ficha.tmAoe = ia.tmAoe || !!lf.tmAoe
  ficha.zMove = ia.zMove || !!lf.zMove
  const somaLocal = STATS.every((k) => lf.ivs?.[k] != null) ? STATS.reduce((a, k) => a + lf.ivs[k], 0) : null
  if (ia.ivs) ficha.ivs = ia.ivs
  else if (somaLocal != null && (ficha.ivSomado == null || somaLocal === ficha.ivSomado)) ficha.ivs = { ...lf.ivs }
  if (ia.stats) { ficha.stats = ia.stats; ficha.statsOpcoes = Object.fromEntries(STATS.map((k) => [k, [...new Set([ia.stats[k], ...(lf.statsOpcoes?.[k] || [])])]])) }
  else if (lf.stats) { ficha.stats = lf.stats; ficha.statsOpcoes = lf.statsOpcoes }
  const faltando = []
  for (const k of ['level', 'potencia', 'quality', 'nota']) if (ficha[k] == null) faltando.push(k)
  for (const k of STATS) if (ficha.ivs[k] == null) faltando.push(`ivs.${k}`)
  let confianca = 1
  for (const f of faltando) confianca -= PESOS_FALTA[f] ?? 0.06
  if (ficha.ivSomado == null) confianca -= 0.1
  if (ia.certeza < 1) confianca -= 0.1
  const avisos = ['lido com IA']
  if (local?.ficha && local.ficha.speciesId != null && local.ficha.speciesId !== ia.speciesId) avisos.push('a leitura local achou outra espécie; confira')
  return { ficha, faltando, avisos, confianca: Math.round(limitar(confianca, 0, 1) * 100) / 100, ia: true }
}

const iaCompleta = (ia) => ia && ['level', 'potencia', 'quality', 'nota', 'ivSomado'].every((k) => ia[k] != null)

export async function lerPrint(imagem, opcoes = {}) {
  if (typeof document === 'undefined') throw new Error('a leitura de print só funciona no navegador')
  const ia = opcoes.semIa ? Promise.resolve(null) : lerComIa(imagem, opcoes).catch(() => null)
  const tarefa = fila.then(() => executar(imagem, opcoes))
  fila = tarefa.catch(() => {}).finally(() => { progressoAtual = null })
  const local = tarefa.then((r) => r, (erro) => ({ erro }))
  const primeiro = await Promise.race([ia.then((r) => ({ ia: r })), local.then((r) => ({ local: r }))])
  let rIa = primeiro.ia
  if ('ia' in primeiro && iaCompleta(rIa)) return juntarLeituras(rIa, null)
  const rLocal = await local
  if (!('ia' in primeiro)) rIa = await ia
  if (rIa) return juntarLeituras(rIa, rLocal.erro ? null : rLocal)
  if (rLocal.erro) throw rLocal.erro
  return rLocal
}
