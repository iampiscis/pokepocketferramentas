import './preco-mercado.js'
import './preco-mercado-entrada.js'
import { lerTextoFicha } from './leitor-ficha.js'

const BASE = new URL('./', import.meta.url)
const JOGO = new URL('jogo/', BASE)
const CATALOGOS = ['creatures', 'creatures-novos', 'creatures-outland-novos', 'creatures-formas', 'creatures-audit-overrides']
const E = globalThis.PrecoMercadoEntrada
const MODULOS = {
  gi: 'ginasios.mjs', ramificadas: 'evolucoes-ramificadas.mjs', evolucoes: 'evolucoes-cruzadas.mjs', megas: 'megas.mjs',
  outland: 'outland.mjs', planilhas: 'golpes-planilhas.mjs', especiais: 'golpes-especiais.mjs', baseOutland: 'herdar-base-outland.mjs',
  golpesOrre: 'herdar-golpes-orre.mjs', ajustes: 'ajustes-especie-espelho.mjs', teto: 'teto-captura.mjs', linhagem: 'linhagem-nota.mjs',
  nota: 'nota-pokemon.mjs', formas: 'formas.mjs'
}
const STATS = ['hp', 'atk', 'def', 'spAtk', 'spDef', 'speed']
const BASE_DE = { hp: 'baseHp', atk: 'baseAtk', def: 'baseDef', spAtk: 'baseSpAtk', spDef: 'baseSpDef', speed: 'baseSpeed' }
const TIPOS = ['NORMAL', 'FIRE', 'WATER', 'GRASS', 'ELECTRIC', 'ICE', 'FIGHTING', 'POISON', 'GROUND', 'FLYING', 'PSYCHIC', 'BUG', 'ROCK', 'GHOST', 'DRAGON', 'DARK', 'STEEL', 'FAIRY']

const NIVEL_INDICADOR = 100
const NIVEL_REFERENCIA = 2000
const ESCALA_SCORE = { pvp: [10, 25000], pve: [15, 39000] }
const CURVA_SCORE = 1.8
const LOOK_NORMAL = 60000
const LOOK_SHINY = 70000

const TABELA = {
  NORMAL: { ROCK: 0.5, GHOST: 0, STEEL: 0.5 },
  FIRE: { FIRE: 0.5, WATER: 0.5, GRASS: 2, ICE: 2, BUG: 2, ROCK: 0.5, DRAGON: 0.5, STEEL: 2 },
  WATER: { FIRE: 2, WATER: 0.5, GRASS: 0.5, GROUND: 2, ROCK: 2, DRAGON: 0.5 },
  ELECTRIC: { WATER: 2, ELECTRIC: 0.5, GRASS: 0.5, GROUND: 0, FLYING: 2, DRAGON: 0.5 },
  GRASS: { FIRE: 0.5, WATER: 2, GRASS: 0.5, POISON: 0.5, GROUND: 2, FLYING: 0.5, BUG: 0.5, ROCK: 2, DRAGON: 0.5, STEEL: 0.5 },
  ICE: { FIRE: 0.5, WATER: 0.5, GRASS: 2, ICE: 0.5, GROUND: 2, FLYING: 2, DRAGON: 2, STEEL: 0.5 },
  FIGHTING: { NORMAL: 2, ICE: 2, POISON: 0.5, FLYING: 0.5, PSYCHIC: 0.5, BUG: 0.5, ROCK: 2, GHOST: 0, DARK: 2, STEEL: 2, FAIRY: 0.5 },
  POISON: { GRASS: 2, POISON: 0.5, GROUND: 0.5, ROCK: 0.5, GHOST: 0.5, STEEL: 0, FAIRY: 2 },
  GROUND: { FIRE: 2, ELECTRIC: 2, GRASS: 0.5, POISON: 2, FLYING: 0, BUG: 0.5, ROCK: 2, STEEL: 2 },
  FLYING: { ELECTRIC: 0.5, GRASS: 2, FIGHTING: 2, BUG: 2, ROCK: 0.5, STEEL: 0.5 },
  PSYCHIC: { FIGHTING: 2, POISON: 2, PSYCHIC: 0.5, DARK: 0, STEEL: 0.5 },
  BUG: { FIRE: 0.5, GRASS: 2, FIGHTING: 0.5, POISON: 0.5, FLYING: 0.5, PSYCHIC: 2, GHOST: 0.5, DARK: 2, STEEL: 0.5, FAIRY: 0.5 },
  ROCK: { FIRE: 2, ICE: 2, FIGHTING: 0.5, GROUND: 0.5, FLYING: 2, BUG: 2, STEEL: 0.5 },
  GHOST: { NORMAL: 0, PSYCHIC: 2, GHOST: 2, DARK: 0.5 },
  DRAGON: { DRAGON: 2, STEEL: 0.5, FAIRY: 0 },
  DARK: { FIGHTING: 0.5, PSYCHIC: 2, GHOST: 2, DARK: 0.5, FAIRY: 0.5 },
  STEEL: { FIRE: 0.5, WATER: 0.5, ELECTRIC: 0.5, ICE: 2, ROCK: 2, STEEL: 0.5, FAIRY: 2 },
  FAIRY: { FIRE: 0.5, FIGHTING: 2, POISON: 0.5, DRAGON: 2, DARK: 2, STEEL: 0.5 }
}
const AMPLIACAO = { 4: 5.5, 2: 2.5, 1: 1, 0.5: 0.33, 0.25: 0.17, 0: 0 }
const INICIO_MS = 1250
const RECARGA_GLOBAL_MS = 1000
const INVESTIDA = { power: 45, cooldownMs: 2000 }
const Z_MOVE = { power: 1800, cooldownMs: 60000 }
const VIDA_TABULEIRO = 1.5

let carregando = null
let ctx = null
const cacheScore = new Map()
const cacheSimular = new Map()
let modeloPreco = null

const normalizar = (t) => String(t ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/\s+/g, ' ').trim()

async function lerJson(url) {
  const r = await fetch(url, { cache: 'no-cache' })
  if (!r.ok) throw new Error(`${url.pathname || url}: HTTP ${r.status}`)
  return r.json()
}

async function lerTexto(url, opcional = false) {
  try {
    const r = await fetch(url, { cache: 'no-cache' })
    if (!r.ok) throw new Error(`HTTP ${r.status}`)
    return await r.text()
  } catch (err) {
    if (opcional) return null
    throw err
  }
}

const montarCatalogoJogo = E.catalogoJogo
const montarCatalogoIndicador = E.catalogoIndicador
const formasAlcancaveis = E.formasAlcancaveis

const tiposDe = (esp) => [...new Set([esp?.type1, esp?.type2].filter(Boolean).map((t) => String(t).toUpperCase()))]

function efetividade(tipoGolpe, tiposDefensor) {
  const linha = TABELA[String(tipoGolpe).toUpperCase()] || {}
  let v = 1
  for (const t of tiposDefensor) v *= linha[t] ?? 1
  return AMPLIACAO[v] ?? v
}

function golpesPvp(esp, nivel, tm) {
  const gs = (esp?.attacks || [])
    .filter((g) => (g.learnLevel ?? 1) <= nivel && (g.power ?? 0) > 0)
    .map((g) => ({ power: g.power, cd: Math.max(400, g.cooldownMs ?? 2000), especial: g.category === 'SPECIAL', tipo: String(g.type).toUpperCase(), aoe: false }))
  if (tm?.tipo) gs.push({ power: Z_MOVE.power, cd: Z_MOVE.cooldownMs, especial: !tm.fisico, tipo: String(tm.tipo).toUpperCase(), aoe: !!tm.aoe })
  return gs
}

function ataqueEfetivo(meta, st, esp, nivel, tm) {
  const tipos = tiposDe(esp)
  const gs = golpesPvp(esp, nivel, tm)
  const k = ((2 * nivel) / 5 + 2) / 50
  const valor = gs.map((g) => k * g.power * (g.especial ? st.spAtk : st.atk) * (tipos.includes(g.tipo) ? 1.5 : 1) * (g.aoe ? meta.aoe : 1))
  const casts = gs.map(() => 0)
  const pronto = gs.map(() => INICIO_MS)
  let livre = INICIO_MS, investidaPronta = INICIO_MS, investidas = 0
  for (let t = INICIO_MS; t < meta.T * 1000; t += 250) {
    if (t < livre) continue
    let b = -1
    for (let i = 0; i < gs.length; i++) if (pronto[i] <= t && (b < 0 || valor[i] > valor[b])) b = i
    if (b >= 0) {
      casts[b]++
      pronto[b] = t + gs[b].cd
      livre = t + RECARGA_GLOBAL_MS
    } else if (investidaPronta <= t) {
      investidas++
      investidaPronta = t + INVESTIDA.cooldownMs
      livre = t + RECARGA_GLOBAL_MS
    }
  }
  let total = investidas * k * INVESTIDA.power * st.atk * meta.defInv
  gs.forEach((g, i) => { total += casts[i] * valor[i] * (meta.def[g.tipo]?.[g.especial ? 1 : 0] ?? 0) })
  return total
}

function resistenciaEfetiva(meta, st, hpCombate, esp) {
  const tipos = tiposDe(esp)
  let recebido = meta.invInc / st.def
  for (const t of TIPOS) {
    const e = efetividade(t, tipos)
    if (e) recebido += e * (meta.inc[t][0] / st.def + meta.inc[t][1] / st.spDef)
  }
  return (hpCombate * VIDA_TABULEIRO) / recebido
}

function melhorForcaPvp(c, pk, esp, nivel) {
  const { gi, meta } = c
  const st = gi.statsNoNivel({ ...pk, speciesId: esp.pokeId, level: nivel }, esp, nivel)
  if (!st) return null
  let melhor = null
  for (const tipo of tiposDe(esp).length ? tiposDe(esp) : ['NORMAL']) {
    for (const fisico of [true, false]) {
      const ataque = ataqueEfetivo(meta, st, esp, nivel, { tipo, fisico, aoe: false }) / meta.mO
      const resistencia = resistenciaEfetiva(meta, st, gi.hpDeCombateGinasio(st.hp), esp) / meta.mR
      const forca = ataque + resistencia
      if (!melhor || forca > melhor.forca) melhor = { forca, ataque, resistencia, tm: tipo, fisico }
    }
  }
  return melhor
}

const escalaDoNivel = E.escalaDoNivel
const pokemonBase = E.pokemonBase
const poderPadrao = E.poderPadrao

function scorePoder(v, tipo) {
  if (!(Number(v) > 0)) return null
  const [lo, hi] = ESCALA_SCORE[tipo]
  const x = Math.max(0, Math.min(1, (Math.log10(v) - Math.log10(lo)) / (Math.log10(hi) - Math.log10(lo))))
  return Math.round(1000 * x ** CURVA_SCORE)
}

function calcularIndicador(c, pk) {
  const { gi, indicador: especies, m, meta } = c
  const esp = especies.get(Number(pk?.speciesId))
  if (!esp || !pk?.ivs) return null
  const formas = formasAlcancaveis(esp, especies, m)
  const melhorEm = (nivel, pvp) => {
    let r = null
    for (const f of formas) {
      const v = poderPadrao(gi, pk, f, nivel, pvp)
      if (!r || v > r.v) r = { v, nome: f.name, speciesId: f.pokeId }
    }
    return r
  }
  const paraNv100 = (r, nivel) => ({ ...r, v: Math.round((r.v * escalaDoNivel(NIVEL_INDICADOR)) / escalaDoNivel(nivel)) })
  const refPvp = gi.nivelNoGinasio(NIVEL_REFERENCIA)
  let efetivo = null
  if (gi.statsNoNivel && gi.hpDeCombateGinasio) {
    for (const f of formas) {
      const v = melhorForcaPvp(c, pokemonBase(pk), f, refPvp)
      if (v && (!efetivo || v.forca > efetivo.forca)) efetivo = { ...v, nome: f.name, speciesId: f.pokeId }
    }
  }
  const pvp = efetivo
    ? { v: Math.max(1, Math.round(Math.exp(meta.escala[0] + meta.escala[1] * Math.log(efetivo.forca)))), nome: efetivo.nome, ataque: efetivo.ataque, resistencia: efetivo.resistencia }
    : paraNv100(melhorEm(refPvp, true), refPvp)
  const pve = paraNv100(melhorEm(NIVEL_REFERENCIA, false), NIVEL_REFERENCIA)
  return { pvp, pve }
}

const temSprite = (c, lt) => lt != null && !!(c.sprites?.looks?.[lt] || c.atlas?.slots?.[lt])

function shinyDe(c, looktype, padrao) {
  const lt = c.sprites?.shiny?.[looktype] ?? padrao ?? (looktype != null && c.sprites?.looks?.[looktype + 10000] ? looktype + 10000 : null)
  if (lt == null) return null
  return !c.sprites || temSprite(c, lt) ? lt : null
}

function looksDe(c, esp) {
  const { megas } = c.m
  const id = Number(esp.pokeId)
  const meta = megas.megaPorPokeId(id)
  if (meta) {
    const looktype = megas.looktypeDaMega(meta)
    return { looktype, lookShiny: megas.megaTemShiny(meta) ? shinyDe(c, looktype, megas.looktypeShinyDaMega(meta)) : null, mega: true }
  }
  const forma = c.formaPorId.get(id)
  const looktype = forma?.looktype ?? (temSprite(c, LOOK_NORMAL + id) ? LOOK_NORMAL + id : esp.looktype ?? null)
  if (forma) return { looktype, lookShiny: shinyDe(c, looktype, forma.looktypeShiny), mega: false }
  if (c.m.outland.isOutlandPokeId(id)) return { looktype, lookShiny: shinyDe(c, looktype, null), mega: false }
  const dex = id <= 1025 || id >= 3000 ? id : id % 1000
  return { looktype, lookShiny: shinyDe(c, looktype, LOOK_SHINY + dex), mega: false }
}

function resumo(c, esp) {
  return { speciesId: esp.pokeId, nome: esp.name, tipos: [esp.type1, esp.type2].filter(Boolean), ...looksDe(c, esp) }
}

async function iniciar(aoProgresso) {
  const avisar = (fracao, texto) => { try { aoProgresso?.(fracao, texto) } catch {} }
  avisar(0, 'Baixando dados do jogo')
  const [versao, mods, textos, meta, atlas, sprites, extras] = await Promise.all([
    lerJson(new URL('versao.json', JOGO)).catch(() => null),
    Promise.all(Object.entries(MODULOS).map(async ([k, arq]) => [k, await import(new URL(arq, JOGO).href)])),
    Promise.all(CATALOGOS.map((c) => lerTexto(new URL(`${c}.json`, JOGO), c !== 'creatures'))),
    lerJson(new URL('meta-pvp.json', BASE)),
    lerJson(new URL('marker-atlas.json', JOGO)).catch(() => null),
    lerJson(new URL('sprites.json', JOGO)).catch(() => null),
    lerJson(new URL('especies-extras.json', BASE)).catch(() => null)
  ])
  avisar(0.6, 'Montando o catálogo de espécies')
  const m = Object.fromEntries(mods)
  const fontes = () => Object.fromEntries(CATALOGOS.map((c, i) => [c, textos[i] ? JSON.parse(textos[i]) : null]))
  if (!textos[0]) throw new Error('catálogo do jogo vazio')
  const base = E.contexto(m, fontes)
  const c = { ...base, meta, atlas, sprites, extras, versao, formaPorId: new Map(m.formas.FORMAS.map((f) => [f.pokeId, f])) }
  c.lista = [...c.jogo.values()].filter((e) => e?.name).map((e) => ({ esp: e, chave: normalizar(e.name), ...resumo(c, e) }))
  ctx = c
  avisar(1, 'Pronto')
  return { versaoJogo: versao?.versaoJogo ?? null, atualizadoEm: versao?.atualizadoEm ?? null, especies: c.lista.length }
}

export function carregar(aoProgresso) {
  carregando ??= iniciar(aoProgresso).catch((err) => {
    carregando = null
    throw err
  })
  return carregando
}

function exigirCarregado() {
  if (!ctx) throw new Error('motor não carregado: chame carregar() antes')
  return ctx
}

export function buscarEspecies(texto, limite = 12) {
  const c = exigirCarregado()
  const q = normalizar(texto)
  if (!q) return []
  const numero = /^#?\d+$/.test(q) ? Number(q.replace('#', '')) : null
  const prefixo = []
  const meio = []
  for (const x of c.lista) {
    if (numero != null && x.speciesId === numero) prefixo.unshift(x)
    else if (x.chave.startsWith(q)) prefixo.push(x)
    else if (x.chave.includes(q)) meio.push(x)
  }
  const ordem = (a, b) => a.chave.length - b.chave.length || a.speciesId - b.speciesId
  const fixo = numero != null && prefixo[0]?.speciesId === numero ? [prefixo.shift()] : []
  return [...fixo, ...prefixo.sort(ordem), ...meio.sort(ordem)].slice(0, limite).map(({ esp, chave, ...r }) => r)
}

export function especie(speciesId) {
  const c = exigirCarregado()
  const esp = c.jogo.get(Number(speciesId))
  if (!esp) return null
  return { ...resumo(c, esp), base: Object.fromEntries(STATS.map((k) => [k, esp[BASE_DE[k]]])) }
}

export function formas(speciesId) {
  const c = exigirCarregado()
  const esp = c.indicador.get(Number(speciesId))
  if (!esp) return []
  return formasAlcancaveis(esp, c.indicador, c.m).map((f) => c.jogo.get(f.pokeId) || f).map((f) => resumo(c, f))
}

const normalizarPk = E.normalizar

function scoreDe(c, p) {
  const chave = JSON.stringify([p.speciesId, p.potencia, p.quality, p.shiny, STATS.map((k) => p.ivs[k])])
  if (!cacheScore.has(chave)) {
    if (cacheScore.size > 5000) cacheScore.clear()
    let r = null
    try { r = calcularIndicador(c, p) } catch {}
    cacheScore.set(chave, r)
  }
  const r = cacheScore.get(chave)
  if (!r) return { pvp: null, pve: null, formaPvp: null, formaPve: null, ataque: null, resistencia: null, pveNv100: null }
  return { pvp: scorePoder(r.pvp.v, 'pvp'), pve: scorePoder(r.pve.v, 'pve'), formaPvp: r.pvp.nome, formaPve: r.pve.nome, ataque: r.pvp.ataque ?? null, resistencia: r.pvp.resistencia ?? null, pveNv100: r.pve.v ?? null }
}

export function simular(pk) {
  let c
  try { c = exigirCarregado() } catch (err) { return { erro: err.message } }
  const p = normalizarPk(pk)
  const chave = JSON.stringify(p)
  if (cacheSimular.has(chave)) return cacheSimular.get(chave)
  let r
  try {
    const { gi, m } = c
    const esp = c.jogo.get(p.speciesId)
    if (!esp) return { erro: 'espécie desconhecida' }
    const como = p
    const nivelPvp = gi.nivelNoGinasio(p.level)
    const statsPvp = gi.statsNoNivel(como, esp, nivelPvp)
    const g = gi.melhorGolpeDoGinasio(esp, nivelPvp, statsPvp, como.tmElemental || null, !!como.tmFisico, { pvp: true })
    const nota = m.nota.notaDePokemon(como, esp)
    r = {
      speciesId: p.speciesId,
      nome: esp.name,
      tipos: [esp.type1, esp.type2].filter(Boolean),
      base: Object.fromEntries(STATS.map((k) => [k, esp[BASE_DE[k]]])),
      stats: gi.statsNoNivel(como, esp, p.level),
      nivelPvp,
      pvp: gi.poderNoGinasio(como, esp),
      pve: gi.poderNoNivel(como, esp, p.level),
      nota: Number.isFinite(nota) ? nota : null,
      poder: m.nota.poderDePokemon(como, esp),
      golpe: g ? { nome: g.name || g.nome || (g.tmElemental ? 'Z-Move' : null), power: g.power ?? null, tipo: g.type || null, categoria: g.category || null, cdMs: g.cooldownMs ?? null, zmove: !!g.tmElemental } : null,
      score: scoreDe(c, p)
    }
  } catch (err) {
    return { erro: String(err?.message || err) }
  }
  if (cacheSimular.size > 2000) cacheSimular.clear()
  cacheSimular.set(chave, r)
  return r
}

function especiePorFicha(c, texto, nome) {
  const id = Number(/\(#(\d+)\)/.exec(texto)?.[1])
  if (id && c.jogo.has(id)) {
    const e = c.jogo.get(id)
    if (!nome || normalizar(e.name) === normalizar(nome)) return e
  }
  if (!nome) return null
  const limpo = normalizar(nome.replace(/\s*\(.*\)\s*$/, ''))
  return c.porNome.get(limpo) || c.porNome.get(limpo.replace(/^shiny /, '')) || null
}

export function lerFicha(texto) {
  const c = exigirCarregado()
  const f = lerTextoFicha(texto)
  if (!f || (!f.nome && !Object.keys(f.ivs).length)) return null
  const esp = especiePorFicha(c, String(texto), f.nome)
  return {
    speciesId: esp?.pokeId ?? null,
    nome: esp?.name ?? f.nome ?? null,
    level: f.level ?? null,
    potencia: f.potencia ?? null,
    quality: f.quality ?? null,
    nota: f.nota ?? null,
    shiny: f.shiny,
    ivs: { ...f.ivs },
    refino: Object.fromEntries(STATS.map((k) => [k, Number(f.refino[k]) || 0])),
    tmElemental: f.tmElemental,
    tmFisico: f.tmFisico,
    tmAoe: f.tmAoe
  }
}

async function versaoDoCodigo(nome) {
  const r = await fetch(new URL(nome, BASE), { cache: 'no-cache' })
  if (!r.ok) throw new Error(`${nome}: HTTP ${r.status}`)
  const texto = (await r.text()).replace(/\r\n/g, '\n')
  const h = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(texto))
  return [...new Uint8Array(h)].map((b) => b.toString(16).padStart(2, '0')).join('').slice(0, 12)
}

const MODELO_RAMO = 'https://raw.githubusercontent.com/iampiscis/pokepocket/modelo/preco-mercado.json'

async function carregarModeloPreco() {
  const [prever, entrada] = await Promise.all([versaoDoCodigo('preco-mercado.js'), versaoDoCodigo('preco-mercado-entrada.js')])
  const casado = (pub) => !!pub && pub.formato === globalThis.PrecoMercadoPublico?.FORMATO && (!pub.versaoPrevisor || pub.versaoPrevisor === prever) && (!pub.versaoEntrada || pub.versaoEntrada === entrada)
  let ramo = null
  try {
    const r = await fetch(MODELO_RAMO, { cache: 'no-cache' })
    if (r.ok) ramo = await r.json()
  } catch {}
  if (casado(ramo)) return ramo
  const pub = await lerJson(new URL('preco-mercado.json', BASE))
  if (!pub || pub.formato !== globalThis.PrecoMercadoPublico?.FORMATO) throw new Error('modelo de preço em formato inesperado')
  if (!casado(pub)) throw new Error('o preço de mercado está sendo atualizado; recarregue a página em alguns minutos')
  return pub
}

const CAMBIO_RAMO = 'https://raw.githubusercontent.com/iampiscis/pokepocket/cambio/cambio.json'
let cambioCache = null
async function cambioMercado() {
  if (!cambioCache || Date.now() - cambioCache.lido > 10 * 60000) {
    const lido = Date.now()
    cambioCache = { lido, p: fetch(CAMBIO_RAMO, { cache: 'no-cache' }).then((r) => (r.ok ? r.json() : null)).catch(() => null) }
  }
  const c = await cambioCache.p
  const taxa = Number(c?.taxa)
  const em = Number(c?.em)
  return taxa > 0 && em > 0 && Date.now() - em < 36 * 3600000 ? taxa : null
}

let conferidoPrecoEm = 0
export async function atualizarModeloPreco() {
  if (!modeloPreco) return false
  const antigo = await modeloPreco.catch(() => null)
  const novo = await carregarModeloPreco().catch(() => null)
  if (!novo) return false
  conferidoPrecoEm = Date.now()
  if (antigo && novo.versaoModelo === antigo.versaoModelo && novo.dadosAte === antigo.dadosAte) return false
  modeloPreco = Promise.resolve(novo)
  return true
}
export const precoConferidoEm = () => conferidoPrecoEm

export async function preco(pk) {
  try {
    modeloPreco ??= carregarModeloPreco().then((pub) => {
      conferidoPrecoEm = Date.now()
      return pub
    }, (err) => {
      modeloPreco = null
      throw err
    })
    const pub = await modeloPreco
    const c = exigirCarregado()
    if (!E.especieDe(c, pk)) return { erro: 'espécie desconhecida' }
    const faixa = (r) => (r ? { rapido: r.p20, justo: r.p50, esperar: r.p80, confianca: r.confianca } : null)
    const g = E.prever(globalThis.PrecoMercadoPublico, pub, c, pk, 'orb')
    const o = E.prever(globalThis.PrecoMercadoPublico, pub, c, pk, 'gold')
    return {
      gemas: faixa(g),
      coins: faixa(o),
      confianca: g?.confianca ?? null,
      vendas: g?.grupo ?? 0,
      adicionais: [],
      cambio: await cambioMercado(),
      atualizadoEm: pub.dadosAte,
      versaoModelo: pub.versaoModelo ?? null
    }
  } catch (err) {
    return { erro: String(err?.message || err) }
  }
}

export function sprite(looktype) {
  if (looktype == null) return null
  const q = ctx?.sprites?.looks?.[String(looktype)]
  const pagina = q ? ctx.sprites.paginas?.[q[0]] : null
  if (pagina) return { url: pagina, cell: Math.max(q[3], q[4]), x: q[1], y: q[2], caixa: q.length >= 9 ? q.slice(5, 9) : [0, 0, q[3], q[4]] }
  const a = ctx?.atlas
  const pos = a?.slots?.[String(looktype)]
  if (!pos) return null
  return { url: a.url, cell: a.cell, x: pos[0] * a.cell, y: pos[1] * a.cell, caixa: a.caixas?.[String(looktype)] ?? null }
}

export function spritePng(looktype) {
  if (looktype == null) return null
  const q = ctx?.sprites?.looks?.[String(looktype)]
  if (!q || q.length < 9) return null
  return { url: `jogo/sprites-png/${Number(looktype)}.png`, w: q[7] - q[5], h: q[8] - q[6] }
}

export const TABELA_TIPOS = TABELA
export const AMPLIACAO_TIPOS = AMPLIACAO
