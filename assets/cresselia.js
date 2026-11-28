(() => {
  const SVG = '<svg class="pp-cr-svg" viewBox="0 0 84 66" aria-hidden="true"><defs><linearGradient id="pp-cr-veu" x1="0" x2="1"><stop offset="0" stop-color="#ff7cc4" stop-opacity=".2"/><stop offset=".5" stop-color="#ffb3df"/><stop offset="1" stop-color="#ff7cc4" stop-opacity=".35"/></linearGradient></defs>'
    + '<g class="pp-cr-anel"><path d="M8 43 A32 9 -14 0 1 74 27" fill="none" stroke="url(#pp-cr-veu)" stroke-width="3.6" stroke-linecap="round" opacity=".7"/></g>'
    + '<g fill="none" stroke="#ff9fd6" stroke-width="1.6" stroke-linecap="round" opacity=".85"><path class="pp-cr-cola" d="M25 49 C16 52 10 57 4 64"/><path class="pp-cr-cola b" d="M25 49 C18 55 9 54 3 61"/></g>'
    + '<path d="M27 58 C17 51 18 39 28 35 C35 32 40 37 38 45 C36 52 32 56 27 58Z" fill="#b9cdf0"/>'
    + '<path d="M29 35 C20 37 14 47 17 57 C21 51 24 43 31 39Z" fill="#f4d66e"/>'
    + '<path d="M31 37 C35 29 39 23 38 17 L43.5 16 C46 23 42 31 36 39Z" fill="#b9cdf0"/>'
    + '<path d="M43.5 16 C46 23 42 31 36 39 L34.5 37.5 C40 31 43 24 41 17Z" fill="#f4d66e" opacity=".8"/>'
    + '<ellipse cx="43" cy="15.5" rx="5.2" ry="4.2" fill="#ea6fab"/>'
    + '<path d="M45 16 L53 18 L46 19Z" fill="#f4d66e"/>'
    + '<path d="M34 15 C33 5 45 -1 57 3 C48 3.5 42 8.5 42.5 14.5 C40 12.5 36.5 12.5 34 15Z" fill="#f6dc72"/>'
    + '<circle cx="44.2" cy="14.6" r="1.1" fill="#b0103a"/>'
    + '<g class="pp-cr-anel"><path d="M8 43 A32 9 -14 0 0 74 27" fill="none" stroke="url(#pp-cr-veu)" stroke-width="4" stroke-linecap="round"/></g>'
    + '</svg>'
  const semMovimento = matchMedia('(prefers-reduced-motion: reduce)')
  const rnd = (a, b) => a + Math.random() * (b - a)
  const bloqueado = () => semMovimento.matches || document.documentElement.classList.contains('embed')

  function montar(host) {
    const palco = document.createElement('span')
    palco.className = 'pp-cr-palco'
    palco.setAttribute('aria-hidden', 'true')
    const faiscas = Array.from({ length: 7 }, (_, i) => `<i class="pp-cr-faisca" style="--i:${i};--x:${Math.round(rnd(-8, 8))}px;--y:${Math.round(rnd(10, 32))}px"></i>`).join('')
    palco.innerHTML = `<span class="pp-cr"><i class="pp-cr-flash"></i><span class="pp-cr-corpo"><i class="pp-cr-brilho"></i>${faiscas}${SVG}</span></span>`
    host.append(palco)
    const c = palco.firstElementChild
    c.addEventListener('animationend', (ev) => { if (ev.target === c) c.classList.remove('voa') })
    return c
  }

  function voar(c, op = {}) {
    if (!c || document.hidden || bloqueado()) return false
    const { yMin = 3, yMax = 14, teleporte = 1, escala = [1, 1], dur = [12, 17], margem = 70 } = op
    c.classList.remove('voa')
    const dir = Math.random() < 0.5 ? 1 : -1
    const a = rnd(20, 34), b = rnd(40, 56), salto = rnd(12, 22), fim = Math.min(90, b + salto + rnd(14, 24))
    const xs = [rnd(4, 14), a, b, b + 2, b + 2 + salto, fim - 3, fim]
    let y = rnd(yMin, yMax)
    const passo = Math.max(3, (yMax - yMin) / 3)
    const ys = xs.map((_, i) => (i ? (y = Math.max(yMin, Math.min(yMax, y + rnd(-passo, passo)))) : y))
    xs.forEach((x, i) => {
      const px = dir === 1 ? x : 94 - x
      c.style.setProperty(`--x${i}`, `min(${px.toFixed(1)}cqw, 100cqw - ${margem}px)`)
      c.style.setProperty(`--y${i}`, `${ys[i].toFixed(1)}cqh`)
    })
    c.style.setProperty('--dur', `${rnd(dur[0], dur[1]).toFixed(1)}s`)
    c.style.setProperty('--esc', rnd(escala[0], escala[1]).toFixed(2))
    c.classList.toggle('esq', dir === -1)
    c.classList.toggle('reto', Math.random() >= teleporte)
    void c.offsetWidth
    c.classList.add('voa')
    return true
  }

  function pagina({ primeira = [25000, 60000], intervalo = [60000, 150000] } = {}) {
    if (bloqueado()) return
    const camada = document.createElement('div')
    camada.className = 'pp-cr-camada'
    document.body.append(camada)
    const c = montar(camada)
    let timer = 0
    const agenda = (ms) => {
      clearTimeout(timer)
      timer = setTimeout(() => {
        if (document.hidden) return document.addEventListener('visibilitychange', () => agenda(rnd(4000, 12000)), { once: true })
        voar(c, { yMin: 8, yMax: 62, teleporte: 0.35, escala: [0.8, 1.5], dur: [11, 22], margem: 90 })
        agenda(rnd(intervalo[0], intervalo[1]))
      }, ms)
    }
    document.addEventListener('visibilitychange', () => { if (document.hidden) c.classList.remove('voa') })
    agenda(Array.isArray(primeira) ? rnd(primeira[0], primeira[1]) : primeira)
  }

  window.ppCresselia = { montar, voar, pagina, bloqueado }
})()
