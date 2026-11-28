;(function (fabrica) {
  const api = fabrica()
  if (typeof module === 'object' && module.exports) module.exports = api
  else globalThis.PrecoMercadoEntrada = api
})(function () {
  const STATS = ['hp', 'atk', 'def', 'spAtk', 'spDef', 'speed']
  const BASES = ['baseHp', 'baseAtk', 'baseDef', 'baseSpAtk', 'baseSpDef', 'baseSpeed']
  const MODULOS = {
    gi: 'ginasios.mjs', ramificadas: 'evolucoes-ramificadas.mjs', evolucoes: 'evolucoes-cruzadas.mjs', megas: 'megas.mjs',
    outland: 'outland.mjs', planilhas: 'golpes-planilhas.mjs', especiais: 'golpes-especiais.mjs', baseOutland: 'herdar-base-outland.mjs',
    golpesOrre: 'herdar-golpes-orre.mjs', ajustes: 'ajustes-especie-espelho.mjs', teto: 'teto-captura.mjs', linhagem: 'linhagem-nota.mjs',
    nota: 'nota-pokemon.mjs'
  }
  const CATALOGOS = ['creatures', 'creatures-novos', 'creatures-outland-novos', 'creatures-formas', 'creatures-audit-overrides']
  const NIVEL_INDICADOR = 100
  const NIVEL_REFERENCIA = 2000

  const normalizarTexto = (t) => String(t ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, ' ').trim()

  function listaBase(f) {
    const lista = [...(f.creatures?.creatures ?? [])]
    for (const k of ['creatures-novos', 'creatures-outland-novos', 'creatures-formas']) if (f[k]?.creatures?.length) lista.push(...f[k].creatures)
    return lista
  }

  function aplicarOverrides(lista, fonte) {
    for (const o of fonte?.overrides ?? []) {
      const c = lista.find((x) => x.pokeId === o.pokeId)
      if (!c) continue
      for (const k of BASES) if (typeof o[k] === 'number') c[k] = o[k]
      if (Array.isArray(o.attacks)) c.attacks = o.attacks.map((a) => ({ ...a }))
    }
  }

  function catalogoJogo(m, f) {
    const lista = listaBase(f)
    m.outland.aplicarRemapOutlandLista(lista)
    aplicarOverrides(lista, f['creatures-audit-overrides'])
    m.ajustes?.aplicarAjustesTipos?.((id) => lista.filter((c) => c.pokeId === id))
    m.planilhas.aplicarGolpesDasPlanilhas((id) => lista.filter((c) => c.pokeId === id))
    m.baseOutland.herdarBaseOutland(lista)
    m.evolucoes.aplicarCadeiasTruncadas(lista)
    m.evolucoes.normalizarEvolveLevel600(lista)
    m.ajustes?.aplicarAjustesHuntLevel?.((id) => lista.find((c) => c.pokeId === id))
    const especies = new Map()
    for (const c of lista) {
      if (m.outland.isEspelhoFantasmaPokeId(c.pokeId)) continue
      m.especiais.injetarGolpesEspeciais(c)
      especies.set(c.pokeId, c)
    }
    m.golpesOrre.herdarGolpesOrre(lista)
    for (const mega of m.megas.criarEspeciesMega(lista)) especies.set(mega.pokeId, mega)
    const todas = [...especies.values()]
    m.teto.aplicarTetoDeCaptura(todas, (id) => especies.get(id))
    m.linhagem.anotarLinhagemDaNota(todas, (id) => especies.get(id), m.megas.elosMegaDaNota(todas))
    return especies
  }

  function catalogoIndicador(m, f) {
    const lista = listaBase(f)
    m.outland.aplicarRemapOutlandLista(lista)
    aplicarOverrides(lista, f['creatures-audit-overrides'])
    m.ajustes.aplicarAjustesTipos((id) => lista.filter((c) => c.pokeId === id))
    m.planilhas.aplicarGolpesDasPlanilhas((id) => lista.filter((c) => c.pokeId === id))
    m.baseOutland.herdarBaseOutland(lista)
    m.evolucoes.aplicarCadeiasTruncadas(lista)
    m.evolucoes.normalizarEvolveLevel600(lista)
    m.ajustes.aplicarAjustesHuntLevel((id) => lista.find((c) => c.pokeId === id))
    const especies = new Map()
    for (const c of lista) {
      if (m.outland.isEspelhoFantasmaPokeId(c.pokeId)) continue
      m.especiais.injetarGolpesEspeciais(c)
      if (m.outland.isOutlandPokeId(c.pokeId)) {
        c.evolvesToId = 0
        c.evolveLevel = 0
      }
      especies.set(c.pokeId, c)
    }
    m.golpesOrre.herdarGolpesOrre(lista)
    m.evolucoes.aplicarEvolucoesEntreGeracoes(lista)
    m.ramificadas.alinharNivelPadraoRamificado(lista)
    m.evolucoes.corrigirNiveisDeEvolucao(lista)
    for (const mega of m.megas.criarEspeciesMega(lista)) {
      lista.push(mega)
      especies.set(mega.pokeId, mega)
    }
    return especies
  }

  function contexto(m, fontes) {
    const indicador = catalogoIndicador(m, fontes())
    const jogo = catalogoJogo(m, fontes())
    const porNome = new Map()
    for (const e of jogo.values()) {
      const k = normalizarTexto(e?.name)
      if (k && !porNome.has(k)) porNome.set(k, e)
    }
    return { gi: m.gi, m, jogo, indicador, porNome }
  }

  function formasAlcancaveis(esp, especies, m) {
    const pega = (id) => especies.get(Number(id))
    const vistos = new Map([[esp.pokeId, esp]])
    const fila = [esp]
    while (fila.length) {
      const x = fila.shift()
      for (const d of m.ramificadas.destinosDeEvolucao(x, pega)) {
        const alvo = d.especie || pega(d.pokeId)
        if (!alvo || vistos.has(alvo.pokeId)) continue
        vistos.set(alvo.pokeId, alvo)
        fila.push(alvo)
      }
      for (const mg of m.megas.megasDaEspecie(x.pokeId)) {
        const alvo = pega(m.megas.pokeIdDaMega(mg))
        if (alvo && !vistos.has(alvo.pokeId)) {
          vistos.set(alvo.pokeId, alvo)
          fila.push(alvo)
        }
      }
    }
    return [...vistos.values()]
  }

  const escalaDoNivel = (n) => ((2 * n) / 5 + 2) * n ** 3
  const pokemonBase = (pk) => ({ potencia: Math.max(1, Math.round(Number(pk.potencia) || 1)), quality: Number(pk.quality ?? pk.qualidade) || 1, shiny: !!pk.shiny, ivs: pk.ivs })

  function poderPadrao(gi, pk, esp, nivel, pvp) {
    let melhor = 0
    for (const tmFisico of [true, false]) {
      const como = { ...pokemonBase(pk), speciesId: esp.pokeId, level: nivel, refino: {}, tmElemental: esp.type1 || 'NORMAL', tmFisico }
      const v = gi.poderNoNivel(como, esp, nivel, { pvp })
      if (v > melhor) melhor = v
    }
    return melhor
  }

  function melhorEm(ctx, p, nivel, pvp) {
    const esp = ctx.indicador.get(Number(p?.speciesId))
    if (!esp || !p?.ivs) return null
    let r = null
    for (const f of formasAlcancaveis(esp, ctx.indicador, ctx.m)) {
      const v = poderPadrao(ctx.gi, p, f, nivel, pvp)
      if (!r || v > r.v) r = { v, nome: f.name, speciesId: f.pokeId }
    }
    return r
  }

  const IVS_IDEAIS = Object.fromEntries(STATS.map((k) => [k, 32]))
  function eficiencia(ctx, p) {
    const nivel = ctx.gi.nivelNoGinasio ? ctx.gi.nivelNoGinasio(NIVEL_REFERENCIA) : NIVEL_REFERENCIA
    const r = melhorEm(ctx, p, nivel, true)
    const ideal = melhorEm(ctx, { ...p, ivs: IVS_IDEAIS }, nivel, true)
    return r?.v > 0 && ideal?.v > 0 ? Math.round(Math.log(r.v / ideal.v) * 1e4) / 1e4 : null
  }

  function pveNv100(ctx, p) {
    const r = melhorEm(ctx, p, NIVEL_REFERENCIA, false)
    return r ? Math.round((r.v * escalaDoNivel(NIVEL_INDICADOR)) / escalaDoNivel(NIVEL_REFERENCIA)) : null
  }

  function normalizar(pk) {
    const ref = pk?.refino && typeof pk.refino === 'object' ? pk.refino : {}
    return {
      speciesId: Number(pk?.speciesId),
      level: Math.max(1, Math.round(Number(pk?.level) || 1)),
      refino: Object.fromEntries(STATS.map((k) => [k, Math.max(0, Math.round(Number(ref[k]) || 0))])),
      tmElemental: pk?.tmElemental ? String(pk.tmElemental).toUpperCase() : null,
      tmFisico: !!pk?.tmFisico,
      shiny: !!pk?.shiny,
      potencia: Math.min(5, Math.max(1, Math.round(Number(pk?.potencia) || 1))),
      quality: Number(pk?.quality ?? pk?.qualidade) || 1,
      ivs: Object.fromEntries(STATS.map((k) => [k, Math.max(0, Math.min(32, Math.round(Number(pk?.ivs?.[k]) || 0)))]))
    }
  }

  function especieDe(ctx, pk) {
    const id = Number(pk?.speciesId)
    if (pk?.speciesId != null && Number.isFinite(id) && ctx.jogo.has(id)) return id
    if (!pk?.nome) return null
    const limpo = normalizarTexto(String(pk.nome).replace(/\s*\(.*\)\s*$/, ''))
    const e = ctx.porNome.get(limpo) || ctx.porNome.get(limpo.replace(/^shiny /, ''))
    return e ? e.pokeId : null
  }

  function entrada(ctx, pk) {
    if (!ctx || !pk) return null
    const speciesId = especieDe(ctx, pk)
    if (speciesId == null) return null
    const p = normalizar({ ...pk, speciesId })
    const esp = ctx.jogo.get(speciesId)
    const temIvs = STATS.some((k) => p.ivs[k] > 0)
    let nota = null
    if (temIvs) {
      const n = ctx.m.nota.notaDePokemon(p, esp)
      nota = Number.isFinite(n) ? Number(n) : null
    } else if (pk.nota != null && pk.nota !== '' && Number.isFinite(Number(pk.nota))) {
      nota = Number(pk.nota)
    }
    return {
      speciesId,
      shiny: p.shiny,
      level: p.level,
      nota,
      potencia: p.potencia,
      quality: p.quality,
      ivs: temIvs ? p.ivs : null,
      pve: temIvs ? pveNv100(ctx, p) : null,
      efr: temIvs ? eficiencia(ctx, p) : null,
      tmElemental: p.tmElemental,
      tmAoe: pk.tmAoe === true || pk.tmAoe === 1
    }
  }

  function prever(motor, pub, ctx, pk, moeda) {
    const e = entrada(ctx, pk)
    return e ? motor.prever(pub, e, moeda) : null
  }

  return {
    MODULOS, CATALOGOS, STATS, NIVEL_INDICADOR, NIVEL_REFERENCIA,
    contexto, catalogoJogo, catalogoIndicador, aplicarOverrides, formasAlcancaveis, escalaDoNivel, pokemonBase, poderPadrao,
    melhorEm, pveNv100, eficiencia, normalizar, normalizarTexto, especieDe, entrada, prever
  }
})
