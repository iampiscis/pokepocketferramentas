const L = 1200
const A = 630

const FAIXAS = [[0, 'Baixo', '#f87171'], [300, 'Regular', '#fb923c'], [500, 'Bom', '#facc15'], [700, 'Excelente', '#4ade80']]
const COR_POT = { 1: '#b9aeb3', 2: '#6bc96b', 3: '#1fa5f5', 4: '#be66ff', 5: '#ffc02e' }
const FAIXAS_NOTA = [[1, 'Extremamente fraco', '#b0b5bc'], [2, 'Fraco', '#c94444'], [3, 'Mediano', '#f08830'], [4, 'Razoável', '#3a9a5c'], [5, 'Bom', '#8ee4a8'], [6, 'Forte', '#42ff9a'], [7, 'Poderoso', '#c8b4ff'], [8, 'Mítico', '#d896ff'], [9, 'Lendário', '#ffb8dc'], [Infinity, 'Divino', '#ff7ec8']]

const DISPLAY = '"PP Lilita", "Arial Black", sans-serif'
const TEXTO = '"PP Nunito", system-ui, sans-serif'

const fmt = new Intl.NumberFormat('pt-BR')
const fmt3 = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 3, maximumFractionDigits: 3 })
const fmtCurto = new Intl.NumberFormat('pt-BR', { notation: 'compact', maximumFractionDigits: 1 })
const ehNum = (v) => v != null && v !== '' && Number.isFinite(Number(v))
const grande = (v) => (Math.abs(v) >= 100000 ? fmtCurto.format(v) : fmt.format(Math.round(v)))
const faixaDe = (v) => [...FAIXAS].reverse().find(([de]) => v >= de) || FAIXAS[0]
const faixaNota = (n) => FAIXAS_NOTA.find(([ate]) => Number(n) <= ate) || FAIXAS_NOTA[FAIXAS_NOTA.length - 1]

const url = (rel) => new URL(rel, import.meta.url).href

let recursos = null

export function carregarRecursos() {
  if (!recursos) {
    recursos = (async () => {
      const fontes = [
        new FontFace('PP Lilita', `url(${url('../assets/fontes/lilita.woff2')}) format("woff2")`),
        new FontFace('PP Nunito', `url(${url('../assets/fontes/nunito.woff2')}) format("woff2")`, { weight: '200 1000' })
      ]
      const [gema, bola] = await Promise.all([
        svgComoImagem(url('../assets/gema.svg'), 128).catch(() => null),
        svgComoImagem(url('../assets/pokebola.svg'), 256).catch(() => null),
        ...fontes.map(async (f) => { document.fonts.add(await f.load()) })
      ])
      return { gema, bola }
    })()
    recursos.catch(() => { recursos = null })
  }
  return recursos
}

async function svgComoImagem(endereco, lado) {
  const r = await fetch(endereco)
  if (!r.ok) throw new Error(`svg ${r.status}`)
  const txt = (await r.text()).replace('<svg ', `<svg width="${lado}" height="${lado}" `)
  const blobUrl = URL.createObjectURL(new Blob([txt], { type: 'image/svg+xml' }))
  try {
    return await imagem(blobUrl)
  } finally {
    URL.revokeObjectURL(blobUrl)
  }
}

function imagem(src, cors = false) {
  return new Promise((ok, falha) => {
    const img = new Image()
    if (cors) img.crossOrigin = 'anonymous'
    img.decoding = 'async'
    img.onload = () => ok(img)
    img.onerror = () => falha(new Error(`imagem ${src}`))
    img.src = src
  })
}

async function carregarSprite(s) {
  if (!s?.url) return null
  try {
    const img = await imagem(s.url, true)
    const x = ehNum(s.x) ? Number(s.x) : 0
    const y = ehNum(s.y) ? Number(s.y) : 0
    const w = ehNum(s.w) && s.w > 0 ? Number(s.w) : img.naturalWidth - x
    const h = ehNum(s.h) && s.h > 0 ? Number(s.h) : img.naturalHeight - y
    return w > 0 && h > 0 ? { img, x, y, w, h } : null
  } catch {
    return null
  }
}

function retArred(c, x, y, w, h, r) {
  c.beginPath()
  c.roundRect(x, y, w, h, r)
}

function semente(n) {
  let s = n
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296
    return s / 4294967296
  }
}

function fundo(c, cena) {
  const k = 0.25
  const baixa = document.createElement('canvas')
  baixa.width = L * k
  baixa.height = A * k
  const b = baixa.getContext('2d')
  b.scale(k, k)
  b.fillStyle = '#0b0608'
  b.fillRect(0, 0, L, A)
  const brilhos = [
    [L * 0.5, 0, 620, 'rgba(61, 31, 44, 1)'],
    [L * 0.85, A * 0.35, 380, 'rgba(255, 120, 180, 0.09)'],
    [L * 0.12, A * 0.8, 400, 'rgba(120, 160, 255, 0.08)'],
    [235, 250, 330, 'rgba(255, 211, 77, 0.07)']
  ]
  for (const [x, y, r, cor] of brilhos) {
    const g = b.createRadialGradient(x, y, 0, x, y, r)
    g.addColorStop(0, cor)
    g.addColorStop(1, 'rgba(11, 6, 8, 0)')
    b.fillStyle = g
    b.fillRect(0, 0, L, A)
  }
  if (cena) holofote(b, cena.x, cena.y, cena.r)
  c.imageSmoothingEnabled = true
  c.imageSmoothingQuality = 'high'
  c.drawImage(baixa, 0, 0, L, A)
  const rnd = semente(7)
  const tons = ['#ffffff', '#cfd8ff', '#ffe9c4', '#ffe9a3']
  for (let i = 0; i < 70; i++) {
    const r = rnd() < 0.18 ? 1.6 : 0.9
    c.globalAlpha = 0.25 + rnd() * 0.45
    c.fillStyle = tons[i % tons.length]
    c.beginPath()
    c.arc(rnd() * L, rnd() * A, r, 0, Math.PI * 2)
    c.fill()
  }
  c.globalAlpha = 1
  retArred(c, 14, 14, L - 28, A - 28, 26)
  c.lineWidth = 2
  c.strokeStyle = 'rgba(255, 233, 163, 0.14)'
  c.stroke()
}

function holofote(c, cx, cy, raio) {
  c.save()
  c.translate(cx, cy)
  const raios = 18
  for (let i = 0; i < raios; i++) {
    const a = (i / raios) * Math.PI * 2
    c.beginPath()
    c.moveTo(0, 0)
    c.arc(0, 0, raio, a, a + (Math.PI * 2) / raios * 0.36)
    c.closePath()
    const g = c.createRadialGradient(0, 0, raio * 0.1, 0, 0, raio)
    g.addColorStop(0, 'rgba(255, 233, 163, 0.10)')
    g.addColorStop(1, 'rgba(255, 233, 163, 0)')
    c.fillStyle = g
    c.fill()
  }
  const halo = c.createRadialGradient(0, 0, 0, 0, 0, raio * 0.75)
  halo.addColorStop(0, 'rgba(255, 233, 163, 0.16)')
  halo.addColorStop(1, 'rgba(255, 233, 163, 0)')
  c.fillStyle = halo
  c.beginPath()
  c.arc(0, 0, raio, 0, Math.PI * 2)
  c.fill()
  c.restore()
}

function pedestal(c, cx, cy, larg) {
  const alt = larg * 0.2
  c.save()
  const sombra = c.createRadialGradient(cx, cy + 6, 0, cx, cy + 6, larg * 0.62)
  sombra.addColorStop(0, 'rgba(0, 0, 0, 0.55)')
  sombra.addColorStop(1, 'rgba(0, 0, 0, 0)')
  c.fillStyle = sombra
  c.beginPath()
  c.ellipse(cx, cy + 6, larg * 0.62, alt * 0.9, 0, 0, Math.PI * 2)
  c.fill()
  c.beginPath()
  c.ellipse(cx, cy + 10, larg / 2, alt / 2, 0, 0, Math.PI * 2)
  c.fillStyle = '#480e1e'
  c.fill()
  const topo = c.createLinearGradient(cx - larg / 2, cy, cx + larg / 2, cy)
  topo.addColorStop(0, '#914850')
  topo.addColorStop(0.5, '#bd6951')
  topo.addColorStop(1, '#914850')
  c.beginPath()
  c.ellipse(cx, cy, larg / 2, alt / 2, 0, 0, Math.PI * 2)
  c.fillStyle = topo
  c.fill()
  c.lineWidth = 2.5
  c.strokeStyle = '#f1d3b7'
  c.stroke()
  const luz = c.createRadialGradient(cx, cy - alt * 0.1, 0, cx, cy, larg * 0.42)
  luz.addColorStop(0, 'rgba(255, 233, 163, 0.45)')
  luz.addColorStop(1, 'rgba(255, 233, 163, 0)')
  c.beginPath()
  c.ellipse(cx, cy, larg / 2 - 6, alt / 2 - 4, 0, 0, Math.PI * 2)
  c.fillStyle = luz
  c.fill()
  c.restore()
}

function desenharSprite(c, sp, cx, base, caixa) {
  const esc = Math.max(1, Math.floor(Math.min(caixa / sp.w, caixa / sp.h)))
  const w = sp.w * esc
  const h = sp.h * esc
  const x = Math.round(cx - w / 2)
  const y = Math.round(base - h)
  c.save()
  c.imageSmoothingEnabled = false
  c.shadowColor = 'rgba(0, 0, 0, 0.5)'
  c.shadowBlur = 24
  c.shadowOffsetY = 8
  c.drawImage(sp.img, sp.x, sp.y, sp.w, sp.h, x, y, w, h)
  c.restore()
  return { x, y, w, h }
}

function brilho(c, x, y, r, cor) {
  c.save()
  c.translate(x, y)
  c.shadowColor = cor
  c.shadowBlur = r * 0.9
  c.fillStyle = cor
  c.beginPath()
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 - Math.PI / 2
    const d = i % 2 === 0 ? r : r * 0.26
    c.lineTo(Math.cos(a) * d, Math.sin(a) * d)
  }
  c.closePath()
  c.fill()
  c.restore()
}

function escala(c, x, y, w, h, segs, valor, gap = 4) {
  const total = segs.reduce((s, sg) => s + sg.peso, 0)
  const util = w - gap * (segs.length - 1)
  let px = x
  let marca = null
  for (const sg of segs) {
    const sw = (sg.peso / total) * util
    c.globalAlpha = 0.2
    c.fillStyle = sg.cor
    retArred(c, px, y, sw, h, h / 2)
    c.fill()
    c.globalAlpha = 1
    const cheio = valor == null ? 0 : Math.max(0, Math.min(1, (valor - sg.de) / (sg.ate - sg.de)))
    if (cheio > 0) {
      retArred(c, px, y, Math.max(h, sw * cheio), h, h / 2)
      c.fill()
    }
    if (valor != null && valor >= sg.de && (valor < sg.ate || sg.ultimo)) marca = { x: px + sw * cheio, cor: sg.cor }
    px += sw + gap
  }
  if (marca) {
    c.save()
    c.shadowColor = marca.cor
    c.shadowBlur = 10
    c.beginPath()
    c.arc(marca.x, y + h / 2, h * 0.95, 0, Math.PI * 2)
    c.fillStyle = '#fff'
    c.fill()
    c.shadowBlur = 0
    c.lineWidth = 3
    c.strokeStyle = 'rgba(10, 5, 8, 0.85)'
    c.stroke()
    c.restore()
  }
}

function texto(c, t, x, y, { fonte, cor = '#fff6ef', alinha = 'left', base = 'alphabetic', sombra = null } = {}) {
  c.font = fonte
  c.textAlign = alinha
  c.textBaseline = base
  if (sombra) {
    c.fillStyle = sombra
    c.fillText(t, x, y + 4)
  }
  c.fillStyle = cor
  c.fillText(t, x, y)
  return c.measureText(t).width
}

function caberFonte(c, t, maxLarg, maior, menor, molde) {
  for (let px = maior; px > menor; px -= 2) {
    c.font = molde(px)
    if (c.measureText(t).width <= maxLarg) return px
  }
  return menor
}

const baseEsquerda = (d) => (ehNum(d.nota) ? 352 : 440)

function colunaEsquerda(c, d, sp, bola) {
  const cx = 245
  const base = baseEsquerda(d)
  const temNota = ehNum(d.nota)
  pedestal(c, cx, base, 280)
  let caixa = null
  if (sp) {
    caixa = desenharSprite(c, sp, cx, base + 6, temNota ? 290 : 330)
  } else if (bola) {
    c.save()
    c.globalAlpha = 0.9
    c.shadowColor = 'rgba(0, 0, 0, 0.55)'
    c.shadowBlur = 24
    c.shadowOffsetY = 8
    c.drawImage(bola, cx - 85, base - 182, 170, 170)
    c.restore()
  }
  if (d.shiny && caixa) {
    brilho(c, Math.min(cx + 190, caixa.x + caixa.w + 16), Math.max(40, caixa.y + 10), 16, '#ffe9a3')
    brilho(c, Math.max(cx - 190, caixa.x - 18), caixa.y + caixa.h * 0.42, 10, '#fff6ef')
  }
  if (!temNota) return
  const n = Math.max(0, Math.min(10, Number(d.nota)))
  const [, nomeFaixa, cor] = faixaNota(n)
  const valorTxt = fmt3.format(n)
  c.font = `40px ${DISPLAY}`
  const wDe = c.measureText(' / 10').width
  const pxNum = caberFonte(c, valorTxt, 400 - wDe, 92, 60, (p) => `${p}px ${DISPLAY}`)
  c.font = `${pxNum}px ${DISPLAY}`
  const wNum = c.measureText(valorTxt).width
  const x0 = cx - (wNum + wDe) / 2
  const yNum = 492
  c.save()
  c.shadowColor = cor
  c.shadowBlur = 28
  texto(c, valorTxt, x0, yNum, { fonte: `${pxNum}px ${DISPLAY}`, cor })
  c.restore()
  texto(c, ' / 10', x0 + wNum, yNum, { fonte: `40px ${DISPLAY}`, cor: '#a88e86' })
  texto(c, nomeFaixa.toUpperCase(), cx, 532, { fonte: `900 26px ${TEXTO}`, cor, alinha: 'center' })
  const segs = FAIXAS_NOTA.map(([, , corF], i) => ({ de: i, ate: i + 1, peso: 1, cor: corF, ultimo: i === 9 }))
  escala(c, cx - 175, 556, 350, 14, segs, n, 5)
}

function blocoScore(c, x, y, w, h, rotulo, score, poder) {
  retArred(c, x, y, w, h, 20)
  c.fillStyle = 'rgba(22, 11, 16, 0.78)'
  c.fill()
  c.lineWidth = 2
  c.strokeStyle = 'rgba(255, 233, 163, 0.16)'
  c.stroke()
  texto(c, `SCORE ${rotulo}`, x + 24, y + 38, { fonte: `900 22px ${TEXTO}`, cor: '#e6c9b9' })
  const v = Math.max(0, Math.min(1000, Number(score)))
  const [, nome, cor] = faixaDe(v)
  const wNum = texto(c, fmt.format(Math.round(v)), x + 24, y + 102, { fonte: `64px ${DISPLAY}`, cor })
  texto(c, nome, x + 24 + wNum + 14, y + 100, { fonte: `900 24px ${TEXTO}`, cor })
  const segs = FAIXAS.map(([de, , corF], i) => {
    const ate = FAIXAS[i + 1]?.[0] ?? 1000
    return { de, ate, peso: ate - de, cor: corF, ultimo: i === FAIXAS.length - 1 }
  })
  escala(c, x + 24, y + 122, w - 48, 12, segs, v)
  if (ehNum(poder)) {
    const wr = texto(c, 'Poder ', x + 24, y + 166, { fonte: `800 22px ${TEXTO}`, cor: '#a88e86' })
    texto(c, grande(Number(poder)), x + 24 + wr, y + 166, { fonte: `900 22px ${TEXTO}`, cor: '#e6c9b9' })
  }
}

function colunaDireita(c, d, gema) {
  const x = 500
  const larg = 660
  const temPvp = ehNum(d.pvp)
  const temPve = ehNum(d.pve)
  const temJusto = ehNum(d.justo)
  const temNv = ehNum(d.nivel) || ehNum(d.potencia)
  const nome = String(d.nome || 'Pokémon')
  const reservaBrilho = d.shiny ? 48 : 0
  const px = caberFonte(c, nome, larg - reservaBrilho, 76, 40, (p) => `${p}px ${DISPLAY}`)

  const altNome = px
  const altNv = temNv ? 54 : 0
  const comPoder = (temPvp && ehNum(d.poderPvp)) || (temPve && ehNum(d.poderPve))
  const altScores = temPvp || temPve ? (comPoder ? 184 : 150) : 0
  const altJusto = temJusto ? 76 : 0
  const blocos = [altNome, altNv, altScores, altJusto].filter(Boolean)
  const gaps = [0, 22, 30, 30]
  let total = altNome
  if (altNv) total += altNv + gaps[1]
  if (altScores) total += altScores + gaps[2]
  if (altJusto) total += altJusto + gaps[3]
  const topo = 40
  const fim = 548
  let y = topo + Math.max(0, (fim - topo - total) / 2)
  if (blocos.length === 1) y = topo + (fim - topo - total) / 2

  c.save()
  c.font = `${px}px ${DISPLAY}`
  const wNome = c.measureText(nome).width
  if (d.shiny) {
    const g = c.createLinearGradient(0, y, 0, y + px)
    g.addColorStop(0, '#fff3c4')
    g.addColorStop(0.55, '#ffd34d')
    g.addColorStop(1, '#e2a93f')
    texto(c, nome, x, y + px * 0.84, { fonte: `${px}px ${DISPLAY}`, cor: g, sombra: '#3b1208' })
    brilho(c, x + wNome + 26, y + px * 0.28, 17, '#ffe9a3')
    brilho(c, x + wNome + 10, y + px * 0.66, 8, '#fff6ef')
  } else {
    texto(c, nome, x, y + px * 0.84, { fonte: `${px}px ${DISPLAY}`, cor: '#fff6ef', sombra: '#1b1216' })
  }
  c.restore()
  y += altNome

  if (altNv) {
    y += gaps[1]
    let cx = x
    if (ehNum(d.nivel)) {
      cx += texto(c, `Nv ${fmt.format(Number(d.nivel))}`, cx, y + 38, { fonte: `900 36px ${TEXTO}`, cor: '#e6c9b9' })
    }
    const p = ehNum(d.potencia) ? Math.max(1, Math.min(5, Math.round(Number(d.potencia)))) : null
    if (p) {
      if (cx > x) cx += 16
      const cor = COR_POT[p]
      c.font = `30px ${DISPLAY}`
      const wp = c.measureText(`P${p}`).width + 32
      retArred(c, cx, y + 4, wp, 46, 23)
      c.globalAlpha = 0.16
      c.fillStyle = cor
      c.fill()
      c.globalAlpha = 1
      c.lineWidth = 2.5
      c.strokeStyle = cor
      c.stroke()
      texto(c, `P${p}`, cx + wp / 2, y + 39, { fonte: `30px ${DISPLAY}`, cor, alinha: 'center' })
    }
    y += altNv
  }

  if (altScores) {
    y += gaps[2]
    const itens = [temPvp && ['PvP', d.pvp, d.poderPvp], temPve && ['PvE', d.pve, d.poderPve]].filter(Boolean)
    const gap = 20
    const w = (larg - gap * (itens.length - 1)) / itens.length
    itens.forEach(([rot, sc, pod], i) => blocoScore(c, x + i * (w + gap), y, w, altScores, rot, sc, pod))
    y += altScores
  }

  if (altJusto) {
    y += gaps[3]
    const lado = 62
    if (gema) {
      c.save()
      c.shadowColor = 'rgba(236, 72, 153, 0.7)'
      c.shadowBlur = 22
      c.drawImage(gema, x - 4, y + 4, lado, lado)
      c.restore()
    }
    const tx = x + (gema ? lado + 12 : 0)
    texto(c, 'PREÇO JUSTO', tx, y + 22, { fonte: `900 20px ${TEXTO}`, cor: '#f9a8d4' })
    const g = c.createLinearGradient(0, y + 26, 0, y + 76)
    g.addColorStop(0, '#f9a8d4')
    g.addColorStop(1, '#ec4899')
    c.save()
    c.shadowColor = 'rgba(236, 72, 153, 0.45)'
    c.shadowBlur = 20
    const wv = texto(c, fmt.format(Math.round(Number(d.justo))), tx, y + 74, { fonte: `56px ${DISPLAY}`, cor: g })
    c.restore()
    texto(c, 'gemas', tx + wv + 12, y + 72, { fonte: `800 24px ${TEXTO}`, cor: '#f472b6' })
  }
}

function rodape(c, d) {
  const y = 588
  c.fillStyle = 'rgba(255, 233, 163, 0.12)'
  c.fillRect(500, y - 26, 660, 1.5)
  const w = texto(c, 'Calculadora Pokémon', 500, y + 6, { fonte: `24px ${DISPLAY}`, cor: '#ffd34d' })
  const fim = 500 + w
  const n = Number(d.vendas)
  const opcoes = n > 0 ? [`Valores simulados · preço com base em ${fmt.format(n)} vendas`, `Valores simulados · ${fmt.format(n)} vendas`] : ['Valores simulados']
  const livre = 1160 - fim - 24
  for (const t of opcoes) {
    for (let tam = 16; tam >= 13; tam--) {
      c.font = `700 ${tam}px ${TEXTO}`
      if (c.measureText(t).width <= livre) {
        texto(c, t, 1160, y + 4, { fonte: `700 ${tam}px ${TEXTO}`, cor: 'rgba(168, 142, 134, 0.75)', alinha: 'right' })
        return
      }
    }
  }
}

function quantizar(c, passo) {
  const img = c.getImageData(0, 0, L, A)
  const px = img.data
  const meio = passo / 2
  for (let i = 0; i < px.length; i += 4) {
    px[i] = Math.min(255, ((px[i] + meio) / passo | 0) * passo)
    px[i + 1] = Math.min(255, ((px[i + 1] + meio) / passo | 0) * passo)
    px[i + 2] = Math.min(255, ((px[i + 2] + meio) / passo | 0) * passo)
  }
  c.putImageData(img, 0, 0)
}

export async function desenharCartao(d = {}) {
  const [{ gema, bola }, sp] = await Promise.all([carregarRecursos(), carregarSprite(d.sprite)])
  const tela = document.createElement('canvas')
  tela.width = L
  tela.height = A
  const c = tela.getContext('2d')
  fundo(c, { x: 245, y: baseEsquerda(d) - 150, r: 290 })
  colunaEsquerda(c, d, sp, bola)
  colunaDireita(c, d, gema)
  rodape(c, d)
  quantizar(c, 4)
  return new Promise((ok, falha) => tela.toBlob((b) => (b ? ok(b) : falha(new Error('Falha ao gerar a imagem'))), 'image/png'))
}
