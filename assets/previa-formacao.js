const PREVIA = 'https://pokepocket.piscis.workers.dev'
const L = 1200
const A = 630
const DISPLAY = '"PP Lilita", "Arial Black", sans-serif'
const TEXTO = '"PP Nunito", system-ui, sans-serif'
const FILEIRAS = [[1, 6], [0, 7], [0, 7], [2, 5], [2, 5]]
const url = (rel) => new URL(rel, import.meta.url).href
const SPRITES = url('../calculadora/jogo/sprites-png/')

export const origem = () => (document.documentElement.dataset.isolado ? 'i' : 'o')

let fontes = null
function carregarFontes() {
  fontes ??= Promise.all([
    new FontFace('PP Lilita', `url(${url('fontes/lilita.woff2')}) format("woff2")`),
    new FontFace('PP Nunito', `url(${url('fontes/nunito.woff2')}) format("woff2")`, { weight: '200 1000' })
  ].map(async (f) => { document.fonts.add(await f.load()) })).catch(() => { fontes = null })
  return fontes
}

function imagem(src) {
  return new Promise((ok, falha) => {
    const img = new Image()
    img.decoding = 'async'
    img.onload = () => ok(img)
    img.onerror = () => falha(new Error(src))
    img.src = src
  })
}
async function spriteDe(p) {
  for (const lt of [p.lt, 60000 + Number(p.sp)]) {
    if (!(Number(lt) > 0)) continue
    try { return await imagem(`${SPRITES}${Number(lt)}.png`) } catch {}
  }
  return null
}

function arred(c, x, y, w, h, r) {
  c.beginPath()
  c.moveTo(x + r, y)
  c.arcTo(x + w, y, x + w, y + h, r)
  c.arcTo(x + w, y + h, x, y + h, r)
  c.arcTo(x, y + h, x, y, r)
  c.arcTo(x, y, x + w, y, r)
  c.closePath()
}
function texto(c, t, x, y, fonte, cor = '#fff6ef', max = 0) {
  c.font = fonte
  let s = String(t)
  if (max) while (s.length > 1 && c.measureText(s).width > max) s = `${s.slice(0, -2)}…`
  c.fillStyle = cor
  c.fillText(s, x, y)
  return c.measureText(s).width
}
function desenharSprite(c, img, x, y, lado) {
  if (!img) return
  const k = Math.min(lado / img.naturalWidth, lado / img.naturalHeight)
  const w = img.naturalWidth * k, h = img.naturalHeight * k
  c.imageSmoothingEnabled = false
  c.drawImage(img, x + (lado - w) / 2, y + (lado - h) / 2, w, h)
}

function bola(c, cx, cy, r) {
  c.save()
  c.beginPath(); c.arc(cx, cy, r, 0, Math.PI * 2); c.fillStyle = 'rgba(255,243,223,.30)'; c.fill()
  c.beginPath(); c.arc(cx, cy, r, Math.PI, 0); c.fillStyle = 'rgba(224,80,92,.55)'; c.fill()
  c.fillStyle = '#10070c'; c.fillRect(cx - r, cy - r * 0.07, r * 2, r * 0.14)
  c.beginPath(); c.arc(cx, cy, r * 0.28, 0, Math.PI * 2); c.fill()
  c.beginPath(); c.arc(cx, cy, r * 0.17, 0, Math.PI * 2); c.fillStyle = 'rgba(243,228,207,.9)'; c.fill()
  c.restore()
}

export async function desenharFormacao({ titulo, subtitulo, colunas, nos = [], ini = [], lados = true }) {
  await carregarFontes()
  const todos = [...nos, ...ini, ...colunas.flatMap((k) => k.itens)]
  const cache = new Map()
  await Promise.all(todos.map(async (p) => { const k = `${p.lt}:${p.sp}`; if (!cache.has(k)) cache.set(k, spriteDe(p)) }))
  const img = async (p) => cache.get(`${p.lt}:${p.sp}`)
  const cv = document.createElement('canvas')
  cv.width = L; cv.height = A
  const c = cv.getContext('2d')
  const g = c.createRadialGradient(780, 300, 40, 780, 300, 760)
  g.addColorStop(0, '#3a1c2a'); g.addColorStop(1, '#0b0608')
  c.fillStyle = g; c.fillRect(0, 0, L, A)
  c.strokeStyle = 'rgba(255,233,163,.16)'; c.lineWidth = 2; arred(c, 12, 12, L - 24, A - 24, 26); c.stroke()

  const cel = lados ? 46 : 64, gap = lados ? 6 : 8, passo = cel + gap, meio = 16
  const lin = lados ? 10 : 5
  const bw = 8 * passo - gap, bh = lin * passo - gap + (lados ? meio : 0)
  const bx = 52, by = Math.round((A - bh) / 2)
  c.save()
  arred(c, bx - 16, by - 16, bw + 32, bh + 32, 22)
  const gt = c.createRadialGradient(bx + bw / 2, by + bh / 2, 20, bx + bw / 2, by + bh / 2, bh * 0.75)
  gt.addColorStop(0, '#3a1c2a'); gt.addColorStop(1, '#10070c')
  c.fillStyle = gt; c.fill()
  c.strokeStyle = 'rgba(255,233,163,.28)'; c.lineWidth = 2; c.stroke()
  c.restore()
  const pos = (lado, col, f) => ({ x: bx + col * passo, y: lado === 'ini' ? by + (4 - f) * passo : by + (lados ? 5 * passo + meio : 0) + f * passo })
  const ymeio = by + 5 * passo - gap / 2 + meio / 2
  const casas = []
  for (const lado of lados ? ['ini', 'nos'] : ['nos']) for (let f = 0; f < 5; f++) for (let col = FILEIRAS[f][0]; col <= FILEIRAS[f][1]; col++) casas.push({ lado, ...pos(lado, col, f) })
  for (const k of casas) {
    arred(c, k.x, k.y, cel, cel, 8)
    c.fillStyle = 'rgba(70,48,40,.55)'; c.fill()
    c.save(); c.clip()
    if (lados) bola(c, bx + bw / 2, ymeio, bw * 0.27)
    c.fillStyle = k.lado === 'ini' ? 'rgba(255,111,125,.14)' : 'rgba(226,169,63,.12)'; c.fillRect(k.x, k.y, cel, cel)
    c.restore()
    arred(c, k.x + 1, k.y + 1, cel - 2, cel - 2, 7)
    c.strokeStyle = k.lado === 'ini' ? 'rgba(255,194,200,.45)' : 'rgba(255,233,163,.6)'; c.lineWidth = 1.6; c.stroke()
  }
  if (lados) {
    c.setLineDash([10, 10]); c.strokeStyle = 'rgba(255,233,163,.45)'; c.lineWidth = 2
    c.beginPath(); c.moveTo(bx, ymeio); c.lineTo(bx + bw, ymeio); c.stroke(); c.setLineDash([])
  }
  for (const [lista, lado] of [[ini, 'ini'], [nos, 'nos']]) for (const p of lista) {
    if (!(p.f >= 0 && p.f < 5)) continue
    const { x, y } = pos(lado, p.col, p.f)
    arred(c, x - 2, y - 2, cel + 4, cel + 4, 9)
    c.fillStyle = '#1b0f15'; c.fill()
    c.strokeStyle = p.cor || (lado === 'ini' ? '#ff6f7d' : '#e2a93f'); c.lineWidth = 3; c.stroke()
    desenharSprite(c, await img(p), x + 1, y + 1, cel - 2)
  }

  const rx = bx + bw + 64
  const rw = L - rx - 48
  let y = 92
  texto(c, titulo.toUpperCase(), rx, y, `52px ${DISPLAY}`, '#ffd34d', rw)
  y += 40
  if (subtitulo) { texto(c, subtitulo, rx, y, `800 24px ${TEXTO}`, '#e6c9b9', rw); y += 20 }
  y += 28
  const ncol = colunas.length
  const cw = ncol > 1 ? (rw - 24) / 2 : rw
  colunas.forEach((col, k) => {
    const cx = rx + k * (cw + 24)
    let yy = y
    if (col.rotulo) {
      c.beginPath(); c.arc(cx + 7, yy - 8, 7, 0, Math.PI * 2); c.fillStyle = col.cor || '#e2a93f'; c.fill()
      texto(c, col.rotulo.toUpperCase(), cx + 22, yy, `900 18px ${TEXTO}`, '#e6c9b9')
      yy += 16
    }
    col.altura = yy
  })
  const linhaH = ncol > 1 ? 66 : 76
  for (let k = 0; k < ncol; k++) {
    const col = colunas[k]
    const cx = rx + k * (cw + 24)
    let yy = col.altura
    for (const p of col.itens.slice(0, 6)) {
      arred(c, cx, yy, cw, linhaH - 8, 12)
      c.fillStyle = 'rgba(21,11,16,.82)'; c.fill()
      c.strokeStyle = 'rgba(255,233,163,.10)'; c.lineWidth = 1.5; c.stroke()
      desenharSprite(c, await img(p), cx + 6, yy + 3, linhaH - 14)
      const tx = cx + linhaH - 2
      texto(c, p.nome, tx, yy + (ncol > 1 ? 25 : 30), `900 ${ncol > 1 ? 21 : 25}px ${TEXTO}`, '#fff6ef', cw - (tx - cx) - 10)
      if (p.chip) {
        c.font = `900 14px ${TEXTO}`
        const tw = Math.min(c.measureText(p.chip.texto).width, cw - (tx - cx) - 30)
        const cy = yy + (ncol > 1 ? 32 : 40)
        arred(c, tx, cy, tw + 16, 20, 10)
        c.fillStyle = p.chip.fundo || 'rgba(255,233,163,.14)'; c.fill()
        c.strokeStyle = p.chip.cor || '#e2a93f'; c.lineWidth = 1.4; c.stroke()
        texto(c, p.chip.texto, tx + 8, cy + 15, `900 14px ${TEXTO}`, p.chip.cor || '#ffe9a3', tw)
      }
      yy += linhaH
    }
  }
  c.font = `800 18px ${TEXTO}`
  const marca = 'PokePocket · iampiscis.github.io'
  texto(c, marca, L - 48 - c.measureText(marca).width, A - 40, `800 18px ${TEXTO}`, 'rgba(230,201,185,.75)')
  return new Promise((ok, falha) => cv.toBlob((b) => (b ? ok(b) : falha(new Error('imagem'))), 'image/jpeg', 0.9))
}

const feitos = new Map()
const comPrazo = (p, ms) => Promise.race([p, new Promise((_, nao) => setTimeout(() => nao(new Error('demorou')), ms))])

export function linkCurto(token, desenhar, reserva) {
  if (feitos.has(token)) return feitos.get(token)
  const tarefa = (async () => {
    try {
      const r = await comPrazo(fetch(`${PREVIA}/s`, { method: 'POST', headers: { 'content-type': 'text/plain' }, body: token }), 6000)
      if (!r.ok) return reserva
      const { id, temImagem } = await r.json()
      if (!/^[0-9A-Za-z]{7}$/.test(id || '')) return reserva
      if (!temImagem) {
        const png = await comPrazo(desenhar(), 15000)
        const ri = await comPrazo(fetch(`${PREVIA}/i/${id}`, { method: 'POST', headers: { 'content-type': png.type || 'image/jpeg' }, body: png }), 15000)
        if (!ri.ok && ri.status !== 204) return reserva
      }
      return `${PREVIA}/${id}`
    } catch {
      return reserva
    }
  })()
  feitos.set(token, tarefa)
  tarefa.then((l) => { if (l === reserva) feitos.delete(token) })
  return tarefa
}

export async function copiarTexto(promessa) {
  if (window.ClipboardItem && navigator.clipboard?.write) {
    try {
      await navigator.clipboard.write([new ClipboardItem({ 'text/plain': promessa.then((t) => new Blob([t], { type: 'text/plain' })) })])
      return await promessa
    } catch {}
  }
  const t = await promessa
  try { await navigator.clipboard.writeText(t) } catch {
    const a = document.createElement('textarea')
    a.value = t; a.style.cssText = 'position:fixed;opacity:0'
    document.body.append(a); a.select()
    try { document.execCommand('copy') } catch {}
    a.remove()
  }
  return t
}

export const b64url = (txt) => btoa(String.fromCharCode(...new TextEncoder().encode(txt))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
