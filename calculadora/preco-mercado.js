;(function (fabrica) {
  const api = fabrica()
  if (typeof module === 'object' && module.exports) module.exports = api
  else globalThis.PrecoMercadoPublico = api
})(function () {
  const LN = Math.log
  const STATS = ['hp', 'atk', 'def', 'spAtk', 'spDef', 'speed']
  const PADRAO_Q = { q10: -0.6, q20: -0.35, q50: 0, q80: 0.35, q90: 0.6 }
  const ORDEM_Q = ['q10', 'q20', 'q50', 'q80', 'q90']

  const faixaNeff = (neff) => (neff < 1 ? 0 : neff < 4 ? 1 : neff < 12 ? 2 : 3)
  const faixaNivel = (lv) => Math.max(0, Math.min(12, Math.floor(Math.log2(Math.max(1, lv)))))
  const somaProduto = (a, b) => {
    let s = 0
    for (let i = 0; i < a.length; i++) s += a[i] * b[i]
    return s
  }
  const coefDe = (x) => (x ? { n: x[0], coef: x.slice(1, 5) } : null)

  function avaliar(no, x) {
    while (Array.isArray(no)) no = x[no[0]] <= no[1] ? no[2] : no[3]
    return no
  }

  function linha(pub, pk, moeda) {
    const sp = Number(pk?.speciesId)
    const esp = Number.isFinite(sp) ? pub.esp[sp] : null
    if (!esp) return null
    const sh = pk.shiny ? 1 : 0
    const orb = moeda === 'orb' ? 1 : 0
    const g = `${sp}|${sh}`
    const ivs = pk.ivs && STATS.every((k) => Number.isFinite(Number(pk.ivs[k]))) ? STATS.map((k) => Number(pk.ivs[k])) : null
    const nota = pk.nota != null && Number.isFinite(Number(pk.nota)) ? Number(pk.nota) : null
    return {
      sp,
      g,
      fam: `${esp[0]}|${sh}`,
      sh,
      orb,
      taxa: orb ? pub.cambio : 1,
      lv: Number(pk.level) || 1,
      nota,
      pot: Number(pk.potencia) || 1,
      f: ivs ? { iv: ivs, q: Number(pk.quality ?? pk.qualidade) || null, pve: Number(pk.pve) > 0 ? Number(pk.pve) : null, z: pk.tmElemental || null, a: pk.tmAoe ? 1 : 0, efr: Number.isFinite(Number(pk.efr)) && pk.efr != null ? Number(pk.efr) : null } : null,
      vel: LN(1 + (pub.vel[g] || 0)),
      attr: { raro: esp[1], caca: esp[2], mega: esp[3] }
    }
  }

  function atributos(x, opcoes, ttsTipico) {
    const tts = opcoes?.tts !== false
    const L = LN(Math.max(1, x.lv)) - 5
    const temNota = x.nota != null
    const a = x.attr
    const f = x.f
    const temFicha = f && Array.isArray(f.iv) ? 1 : 0
    const N0 = temNota ? x.nota - 3.5 : 0
    const N = temFicha ? N0 * (opcoes?.alfaNota ?? 1) : N0
    const ivs = temFicha ? f.iv.reduce((s, n) => s + n, 0) : 99
    const efr = temFicha && Number.isFinite(f.efr) ? Math.max(-2, Math.min(0.5, f.efr)) : null
    return [
      1, x.orb, x.sh, L, L * L, N, N * N, temNota ? 0 : 1,
      x.pot === 2 ? 1 : 0, x.pot === 3 ? 1 : 0, x.pot === 4 ? 1 : 0, x.pot === 5 ? 1 : 0,
      a.mega || 0, a.raro === 2 ? 1 : 0, a.raro === 1 ? 1 : 0, a.caca != null ? a.caca - 5 : 0,
      tts ? LN(ttsTipico || 60) - LN(60) : 0, 0,
      x.vel - 2, 0, x.orb * x.sh,
      temFicha, temFicha ? (ivs - 99) / 50 : 0, temFicha && f.q ? f.q - 1.3 : 0,
      temFicha && f.pve > 0 ? LN(f.pve) - 10 : 0, 0,
      temFicha && f.z ? 1 : 0, temFicha && f.a ? 1 : 0,
      x.sh * L, x.sh * L * L, (a.mega || 0) * L, x.sh * N, x.sh * N * N,
      efr ?? 0, temFicha ? ((f.iv[0] + f.iv[2] + f.iv[4]) / 3 - 16) / 16 : 0,
      efr != null ? Math.max(0, N0 - 0.5) * Math.max(0, -efr - 0.1) : 0
    ]
  }

  const GEMAS_ALTO_CAL = 50
  const MIN_SINAL = 5
  const pesoSinal = (n) => (n >= MIN_SINAL ? n / (n + 3) : 0)
  const ajusteSinais = (s) => (s ? pesoSinal(s[0]) * Math.min(0, s[1]) + pesoSinal(s[2]) * Math.max(0, s[3]) : 0)

  function liquidez(pub, x) {
    const L = pub.liq
    if (!L) return null
    const g = L.g[`${x.g}|${x.orb}`]
    const est = g != null ? g : L.global
    const classe = est <= L.cortes[0] ? 'rapido' : est >= L.cortes[1] ? 'devagar' : 'normal'
    return { classe, horas: Math.round((Math.exp(est) / 60) * 10) / 10 }
  }

  function fraco(pub, x) {
    if (!pub.loc || pub.opcoes?.kLocal == null) return false
    return !!(x.sh || x.attr.mega || x.attr.raro === 2 || (x.orb && (pub.grupos[x.g]?.[0] ?? 0) < 20))
  }

  function local(pub, x) {
    const c = pub.loc[`${x.g}|${x.orb}|${x.pot}`] || pub.loc[`${x.g}|${x.orb}|0`]
    if (!c) return { corr: 0, neff: 0 }
    const v = c[0] + c[1] * (LN(Math.max(1, x.lv)) - 7) + c[2] * (x.nota != null ? x.nota - 4 : 0)
    const lim = Math.max(-LN(5), Math.min(LN(5), v))
    return { corr: lim * (c[3] / (c[3] + pub.opcoes.kLocal)), neff: c[3] }
  }

  function grade(pub, x) {
    const t = pub.vzg?.[`${x.g}|${x.orb}|${x.pot}`]
    if (!t || x.nota == null) return null
    const fl = LN(Math.max(1, x.lv)) / 0.2
    const fnb = x.nota / 0.15
    const lb = Math.round(fl)
    const nb = Math.round(fnb)
    let melhor = null
    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        const v = t[`${lb + i}|${nb + j}`]
        if (!v) continue
        const d = (lb + i - fl) ** 2 + (nb + j - fnb) ** 2
        if (!melhor || d < melhor.d) melhor = { d, v }
      }
    }
    return melhor ? { corr: melhor.v[0], neff: melhor.v[1] } : null
  }

  function vizinhanca(pub, x) {
    const v = pub.viz[`${x.g}|${x.orb}|${faixaNivel(x.lv)}`] || pub.viz[`${x.g}|${x.orb}|*`]
    return v ? { corr: v[1], neff: v[2] } : { corr: 0, neff: 0 }
  }

  function preverLinha(pub, x) {
    const z = [1, LN(Math.max(1, x.lv)) - 5, x.nota != null ? x.nota - 3.5 : 0, x.orb]
    const g = coefDe(pub.grupos[x.g])
    const fa = coefDe(pub.familias[x.fam])
    const base = atributos(x, pub.opcoes, pub.ttsTipico)
    const h = somaProduto(pub.beta, base) + (fa ? somaProduto(fa.coef, z) : 0) + (g ? somaProduto(g.coef, z) : 0)
    const viz = fraco(pub, x) ? local(pub, x) : grade(pub, x) || vizinhanca(pub, x)
    let ajuste = 0
    if (pub.arv) {
      const atrib = [...base, LN(1 + viz.neff), viz.corr, h - 17, LN(1 + (g?.n || 0)), LN(1 + (fa?.n || 0)), g ? g.coef[1] : 0, g ? g.coef[2] : 0]
      ajuste = pub.arv.base
      for (const a of pub.arv.nos) ajuste += avaliar(a, atrib)
    }
    const centro = h + viz.corr + ajuste + ajusteSinais(pub.sin?.[x.g])
    const liq = liquidez(pub, x)
    const l = liq ? liq.classe[0] : ''
    const fn = faixaNeff(viz.neff)
    const c0 = pub.cal[`${x.orb}|${fn}${l}`] || pub.cal[`${x.orb}|${fn}`] || pub.cal[`${x.orb}|*`] || null
    const alto = x.orb && Math.exp(centro) / x.taxa >= GEMAS_ALTO_CAL ? pub.cal[`1|A${l}`] || pub.cal['1|A'] : null
    const c = c0 && alto ? alto.map((v, i) => (i === 2 ? c0[2] : c0[2] + v - alto[2])) : c0
    const semFicha = !(x.f && Array.isArray(x.f.iv))
    const desloca = (q) => (c ? c[ORDEM_Q.indexOf(q)] : PADRAO_Q[q])
    const nativo = (v) => Math.exp(v) / x.taxa
    const larg = desloca('q80') - desloca('q20')
    return {
      p10: nativo(centro + desloca('q10')),
      p20: nativo(centro + desloca('q20')),
      p50: nativo(centro + desloca('q50')),
      p80: nativo(centro + desloca('q80')),
      p90: nativo(centro + desloca('q90')),
      neff: viz.neff,
      grupo: g?.n || 0,
      confianca: Math.round(100 * Math.max(0.05, Math.min(0.95, Math.exp(-larg) * ((viz.neff / (viz.neff + 2)) * 0.6 + 0.4) * (semFicha ? 0.85 : 1))))
    }
  }

  function prever(pub, pk, moeda) {
    if (!pub || pub.formato !== 1 || !pk) return null
    const x = linha(pub, pk, moeda)
    if (!x) return null
    const r = preverLinha(pub, x)
    const arred = (v) => (moeda === 'orb' ? Math.max(1, Math.round(v)) : Math.max(1, Math.round(v / 1000) * 1000))
    return { p10: arred(r.p10), p20: arred(r.p20), p50: arred(r.p50), p80: arred(r.p80), p90: arred(r.p90), confianca: r.confianca, vizinhos: Math.round(r.neff * 10) / 10, grupo: r.grupo }
  }

  return { prever, preverLinha, linha, atributos, faixaNivel, faixaNeff, FORMATO: 1 }
})
