import * as P from '../calculadora/jogo/pvp-passivas.mjs'
import { iconePassiva } from './icones.js'
import { alcanceDaFolga } from '../calculadora/jogo/pvp-tabuleiro.mjs'

const SPRITES = '../calculadora/jogo/sprites-png/'
const BOLA = '../assets/pokebola.svg'
const DITTO = 132
const DRAGONITE = 149
const NOME_TIPO = { NORMAL: 'Normal', FIRE: 'Fogo', WATER: 'Água', ELECTRIC: 'Elétrico', GRASS: 'Planta', ICE: 'Gelo', FIGHTING: 'Lutador', POISON: 'Veneno', GROUND: 'Terra', FLYING: 'Voador', PSYCHIC: 'Psíquico', BUG: 'Inseto', ROCK: 'Pedra', GHOST: 'Fantasma', DRAGON: 'Dragão', DARK: 'Sombrio', STEEL: 'Aço', FAIRY: 'Fada' }
const COR_TIPO = { NORMAL: '#9a9a6e', FIRE: '#e8742a', WATER: '#4f7fe6', ELECTRIC: '#d9b51c', GRASS: '#5fae38', ICE: '#5ec2be', FIGHTING: '#b8302a', POISON: '#9a3c98', GROUND: '#c9a24c', FLYING: '#8f78e0', PSYCHIC: '#ec4b7d', BUG: '#94a61a', ROCK: '#a8952f', GHOST: '#6a4f8f', DRAGON: '#6a35ea', DARK: '#6a5345', STEEL: '#8c8cae', FAIRY: '#d0739f' }

const DESC = {
  rocky_helmet: 'Devolve a quem bate nele {pct}% do dano de cada golpe (a Investida também), a luta toda.',
  rain_dance: '+{pct}% de dano e recarga {recarga}% mais rápida para ele e os aliados de BST até {bst}, a luta toda. Duas Rain Dance não somam.',
  swarm: '+{pct}% de dano, e mais {porInseto}% por outro pokémon do tipo Inseto no time (contados no começo), até +{teto}%, a luta toda.',
  intimidate: 'Os inimigos causam {pct}% menos dano de golpe, a luta toda. Só vale se ele for o único pokémon do tipo Dragão do time (megas contam).',
  iron_defense: '+{pct}% de DEF e SP.DEF, a luta toda.',
  burn: 'O alvo perde {pct}% do HP máximo por segundo durante {seg} s ({total}% no total).',
  poison: 'O alvo perde {pct}% do HP máximo por segundo durante {seg} s ({total}% no total).',
  freeze: 'Por {seg} s o alvo não ataca nem anda, as recargas dele param e ele toma {danoRecebido}% a mais de dano de golpe.',
  paralyze: 'Na hora, as recargas do alvo atrasam {atraso} s. Depois, por {seg} s, elas ficam {recarga}% mais lentas e cada ataque dele tem {falha}% de chance de falhar.',
  leech_seed: 'Drena {pct}% do HP máximo do alvo por segundo durante {seg} s e cura quem plantou no mesmo tanto, até {curaMax}% do HP máximo dele.',
  dig: 'Desvia do próximo golpe de {poder} de poder que ele receber, sem dano. O Z-Move não é desviado.',
  confusion: 'O próximo golpe do alvo de até {poder} de poder acerta o aliado mais perto dele (sozinho, ele mesmo), e o dano conta para quem confundiu. O Z-Move e a Investida não gastam a confusão.',
  fear: 'Por {seg} s o alvo recua, uma casa por vez, sem atacar, e as recargas dele param.',
  rock_smash: 'O alvo perde {pct}% da DEF e da SP.DEF por {seg} s, e o time inteiro aproveita.',
  whirlwind: 'Empurra o alvo para o fundo do lado dele, na mesma coluna (para antes de quem estiver no caminho), e causa {pct}% do HP máximo dele.',
  assurance: 'Causa {pct}% do HP máximo do alvo mais {faltando}% do HP que falta a ele.',
  charm: 'Puxa o inimigo mais longe para a casa livre mais à frente do lado dele e causa {pct}% do HP máximo dele.',
  recover: 'Cura {pct}% do HP máximo do mais ferido do time (ele incluso). Só conta quem tem BST até {bst}, para disparar e para receber. Depois, volta só após um ciclo completo.'
}
const CURTO = {
  rocky_helmet: 'Devolve {pct}% do dano que recebe',
  rain_dance: '+{pct}% de dano e recarga {recarga}% mais rápida (BST até {bst})',
  swarm: '+{pct}% de dano, +{porInseto}% por Inseto (até {teto}%)',
  intimidate: 'Inimigos causam {pct}% menos dano de golpe',
  iron_defense: '+{pct}% de DEF e SP.DEF',
  burn: '{pct}% do HP por segundo, {seg} s',
  poison: '{pct}% do HP por segundo, {seg} s',
  freeze: 'Parado {seg} s e +{danoRecebido}% de dano recebido',
  paralyze: 'Recargas +{atraso} s, {recarga}% mais lentas, {falha}% de falha',
  leech_seed: 'Drena {pct}% por segundo e cura quem plantou',
  dig: 'Desvia do próximo golpe',
  confusion: 'O próximo golpe dele acerta o aliado mais perto',
  fear: 'Recua {seg} s sem atacar',
  rock_smash: '−{pct}% de DEF e SP.DEF por {seg} s',
  whirlwind: 'Empurra para o fundo e causa {pct}% do HP',
  assurance: '{pct}% do HP máximo + {faltando}% do que falta',
  charm: 'Puxa o mais longe para a frente e causa {pct}% do HP',
  recover: 'Cura {pct}% do mais ferido do time'
}
const GATILHO = {
  [P.GATILHO_INICIO]: { curto: 'Início', longo: 'No começo da luta.' },
  [P.GATILHO_CICLO]: { curto: 'Ciclo', longo: 'No começo e a cada ciclo.' },
  [P.GATILHO_CURA]: { curto: 'HP {gatilhoHp}%', longo: 'Quando ele ou um aliado de BST até {bst} cai a {gatilhoHp}% do HP.' }
}
const ALVO = {
  rocky_helmet: 'Quem bate nele', rain_dance: 'Ele e os aliados de BST até {bst}', swarm: 'Ele mesmo', intimidate: 'Todos os inimigos',
  iron_defense: 'Ele mesmo', dig: 'Ele mesmo', charm: 'O inimigo mais longe', recover: 'O mais ferido do time (BST até {bst})'
}
const ALVO_CICLO = 'No começo, o inimigo mais perto em casas; no fim de cada ciclo, quem ele está atacando'
const DOIS_LADOS = new Set(['rocky_helmet', 'dig'])
const NO_INIMIGO = new Set(['rocky_helmet', 'intimidate', 'burn', 'poison', 'freeze', 'paralyze', 'leech_seed', 'confusion', 'fear', 'rock_smash', 'whirlwind', 'assurance', 'charm'])

const SOM_PASSIVA = { rocky_helmet: 'pedra', rain_dance: 'chuva', swarm: 'inseto', intimidate: 'rugido', iron_defense: 'metal', burn: 'fogo', poison: 'veneno', freeze: 'gelo', paralyze: 'raio', leech_seed: 'planta', dig: 'terra', confusion: 'psi', fear: 'fantasma', rock_smash: 'soco', whirlwind: 'vento', assurance: 'sombra', charm: 'fada', recover: 'cura' }
let somMod = null
const somPronto = import('./som.js').then((m) => { somMod = m; return m }).catch(() => null)
function som(nome, opt) { if (!cena || cena.vel) somMod?.tocar(nome, opt) }
const EMOJI_PASSIVA = { '⛰️': 'rocky_helmet', '🌧️': 'rain_dance', '🐝': 'swarm', '🐉': 'intimidate', '🔩': 'iron_defense', '🔥': 'burn', '☠️': 'poison', '❄️': 'freeze', '🌩️': 'paralyze', '⚡': 'paralyze', '🌱': 'leech_seed', '🕳️': 'dig', '💫': 'confusion', '👻': 'fear', '👊': 'rock_smash', '🌪️': 'whirlwind', '🌑': 'assurance', '💗': 'charm', '💚': 'recover' }
const IDS_ICONE = new Set(Object.values(EMOJI_PASSIVA))
function comIcone(n, txt) {
  const id = EMOJI_PASSIVA[txt] || (IDS_ICONE.has(txt) ? txt : null)
  if (id) { n.innerHTML = iconePassiva(id); n.classList.add('svg') } else { n.textContent = txt || ''; n.classList.remove('svg') }
  return n
}
const preencher = (txt, n) => txt.replace(/\{(\w+)\}/g, (_, k) => n[k] ?? '')
const $ = (id) => document.getElementById(id)
const reduzido = matchMedia('(prefers-reduced-motion: reduce)')
const ehNum = (v) => v != null && v !== '' && Number.isFinite(Number(v))

function el(tag, attrs = {}, filhos = []) {
  const n = document.createElement(tag)
  for (const [k, v] of Object.entries(attrs)) {
    if (v == null || v === false) continue
    if (k === 'text') n.textContent = v
    else if (k === 'class') n.className = v
    else if (k === 'style') n.style.cssText = v
    else if (k === 'html') n.innerHTML = v
    else n.setAttribute(k, v === true ? '' : v)
  }
  for (const f of [].concat(filhos)) if (f != null && f !== false) n.append(f)
  return n
}
function imgSprite(looktype, speciesId) {
  const img = el('img', { alt: '', decoding: 'async', draggable: 'false' })
  const tentativas = [...new Set([].concat(looktype, 60000 + Number(speciesId)).filter(ehNum).map(Number))].map((l) => `${SPRITES}${l}.png`)
  const proxima = () => {
    const url = tentativas.shift()
    if (url) img.src = url
    else { img.onerror = null; img.src = BOLA; img.classList.add('bola') }
  }
  img.onerror = proxima
  proxima()
  return img
}
const temShiny = (e) => e?.lookShiny != null && e.lookShiny !== e.looktype
const lookDe = (e, sh) => (sh && temShiny(e) ? [e.lookShiny, e.looktype] : e?.looktype)
const ICO_SHINY = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M10 2.5c.7 5 2.9 7.3 7.9 8-5 .7-7.2 2.9-7.9 7.9-.7-5-2.9-7.2-7.9-7.9 5-.7 7.2-3 7.9-8z"/><path d="M18.5 13.5c.4 2.6 1.5 3.7 4 4-2.5.4-3.6 1.5-4 4-.4-2.5-1.5-3.6-4-4 2.5-.3 3.6-1.4 4-4z"/></svg>'
function caixaShiny(e, sh, attrs) {
  const ok = temShiny(e), on = ok && !!sh
  return el('button', { type: 'button', class: `pt-shiny${on ? ' on' : ''}`, role: 'checkbox', 'aria-checked': String(on), 'aria-label': `Shiny${e?.nome ? ` (${e.nome})` : ''}`, title: ok ? (on ? 'Shiny marcado' : 'Marcar shiny') : 'Sem sprite shiny', disabled: !ok, html: ICO_SHINY, ...attrs })
}

const LISTA = P.ORDEM_PASSIVAS.map((id) => {
  const p = P.PASSIVAS[id]
  const n = P.numerosDaPassiva(p)
  const especies = [...P.PASSIVA_POR_ESPECIE].filter(([, pid]) => pid === id).map(([sp]) => sp)
  return {
    id, p, n, especies,
    nome: p.nome, tipo: p.tipo, icone: p.icone,
    inimigo: NO_INIMIGO.has(id),
    doisLados: NO_INIMIGO.has(id) || DOIS_LADOS.has(id),
    gatCurto: preencher(GATILHO[p.gatilho]?.curto ?? '', n),
    gatLongo: preencher(GATILHO[p.gatilho]?.longo ?? '', n),
    alvo: ALVO[id] ? preencher(ALVO[id], n) : ALVO_CICLO,
    curto: preencher(CURTO[id], n),
    desc: preencher(DESC[id], n)
  }
})
const PORID = new Map(LISTA.map((x) => [x.id, x]))

let motor = null
const especieCache = new Map()
async function carregarMotor() {
  if (!motor) motor = import('../calculadora/motor.js').then(async (m) => { await m.carregar(); return m })
  return motor
}
function especie(id) {
  if (especieCache.has(id)) return especieCache.get(id)
  let e = null
  try { e = motor && motorPronto ? motorPronto.especie(id) : null } catch {}
  if (e) especieCache.set(id, e)
  return e
}
let motorPronto = null

const estado = { sel: 'charm', filtro: 'todas', caster: null, modo: 'passivas', time: [], ini: [], lado: 'nos', timeSel: null }
const TIME_MAX = 5
const INI_PADRAO = [[132, 3, 0], [132, 6, 1], [132, 0, 1], [132, 4, 2], [132, 3, 4]]
const TIME_EXEMPLO = [[210, 3, 0], [184, 4, 0], [12, 2, 1], [621, 5, 1], [3149, 3, 1]]

const codigoTime = (l) => l.map((m) => `${Number(m.sp).toString(36)}${m.col}${m.f}${m.sh ? 's' : ''}`).join('-')
const lerCodigo = (txt) => (txt ? txt.split('-').map((t) => { const sh = t.endsWith('s'); if (sh) t = t.slice(0, -1); return [parseInt(t.slice(0, -2), 36), Number(t.at(-2)), Number(t.at(-1)), sh] }).filter((v) => v.slice(0, 3).every(Number.isFinite) && valida(v[1], v[2])) : null)
function lerHash() {
  const h = decodeURIComponent(location.hash.slice(1))
  if (h === 'time' || h.startsWith('time=') || h.startsWith('t=')) {
    estado.modo = 'time'
    const partes = Object.fromEntries(h.split('&').map((t) => t.split('=')))
    const velho = (txt) => (txt == null ? null : txt.split(',').filter(Boolean).map((t) => t.split('.').map(Number)).filter((v) => v.length === 3 && v.every(Number.isFinite) && valida(v[1], v[2])))
    const nos = partes.t != null ? lerCodigo(partes.t) : velho(partes.time)
    const ini = partes.i != null ? lerCodigo(partes.i) : velho(partes.ini)
    estado.time = (nos ?? TIME_EXEMPLO).slice(0, TIME_MAX).map(([sp, col, f, sh]) => ({ sp, col, f, sh: !!sh }))
    estado.ini = (ini ?? INI_PADRAO).slice(0, TIME_MAX).map(([sp, col, f, sh]) => ({ sp, col, f, sh: !!sh }))
    return
  }
  if (PORID.has(h)) { estado.modo = 'passivas'; estado.sel = h; return }
  estado.modo = 'time'
  estado.time = TIME_EXEMPLO.map(([sp, col, f]) => ({ sp, col, f }))
  estado.ini = INI_PADRAO.map(([sp, col, f]) => ({ sp, col, f }))
}
function gravarHash() {
  const limpo = location.pathname + location.search
  if (estado.modo === 'time') { if (location.hash) history.replaceState(null, '', limpo) }
  else history.replaceState(null, '', `${limpo}#${estado.sel}`)
}
const previaMod = import('../assets/previa-formacao.js')
function desenharTime(m) {
  const item = (x, lado) => ({ lt: x.e?.looktype, sp: x.sp, col: x.col, f: x.f, nome: x.e?.nome || `#${x.sp}`, cor: x.x ? COR_TIPO[x.x.tipo] : lado === 'ini' ? '#ff6f7d' : '#8b919c', chip: x.x ? { texto: x.x.nome, cor: COR_TIPO[x.x.tipo], fundo: 'rgba(21,11,16,.9)' } : { texto: 'Sem passiva', cor: '#a88e86', fundo: 'rgba(21,11,16,.9)' } })
  const N = membros('nos').map((x) => item(x, 'nos')), I = membros('ini').map((x) => item(x, 'ini'))
  return m.desenharFormacao({ titulo: 'Monte seu time', subtitulo: `${N.length} contra ${I.length} · passivas do PvP`, nos: N, ini: I, colunas: [{ rotulo: 'Seu time', cor: '#e2a93f', itens: N }, { rotulo: 'Inimigo', cor: '#ff6f7d', itens: I }] })
}
function linkDoTime() {
  const u = new URL(location.href)
  u.hash = `t=${codigoTime(estado.time)}&i=${codigoTime(estado.ini)}`
  return u.toString()
}

function montarLista() {
  const corpo = $('pas-linhas')
  corpo.replaceChildren(...LISTA.filter((x) => estado.filtro === 'todas' || (estado.filtro === 'inimigo') === x.inimigo).map((x) => el('button', { type: 'button', class: `pas-linha${x.id === estado.sel ? ' sel' : ''}`, style: `--t:${COR_TIPO[x.tipo]}`, 'data-id': x.id, 'aria-pressed': String(x.id === estado.sel), title: `${x.nome}: ${x.curto}` }, [
    comIcone(el('span', { class: 'pas-ic', 'aria-hidden': 'true' }), x.id),
    el('span', { class: 'pas-linha-txt' }, [el('b', { text: x.nome }), el('span', { class: `pas-gat g-${x.p.gatilho}`, text: x.gatCurto })])
  ])))
  document.querySelectorAll('[data-filtro]').forEach((b) => {
    const on = b.dataset.filtro === estado.filtro
    b.classList.toggle('ativo', on)
    b.setAttribute('aria-pressed', String(on))
  })
}

let trocaToken = 0
async function escolher(id, rolar = false, caster = null) {
  if (!PORID.has(id)) return
  const mudou = id !== estado.sel || estado.modo !== 'passivas'
  if (estado.modo !== 'passivas') { estado.modo = 'passivas'; aplicarModo() }
  estado.sel = id
  estado.caster = caster
  gravarHash()
  montarLista()
  som('clique', { forca: 0.6 })
  if (rolar && matchMedia('(max-width: 900px)').matches) $('pas-palco').scrollIntoView({ behavior: reduzido.matches ? 'auto' : 'smooth', block: 'start' })
  const alvos = ['pas-cab', 'pas-passo', 'pas-fatos', 'pas-quem'].map($).concat(tabuleiro ? [tabuleiro.camada] : [])
  const meu = ++trocaToken
  if (mudou && !reduzido.matches) {
    cena?.parar()
    await Promise.all(alvos.map((e) => e.animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateY(4px)' }], { duration: 170, easing: 'ease-in', fill: 'forwards' }).finished.catch(() => {})))
    if (meu !== trocaToken) return
  }
  montarDetalhe()
  for (const e of alvos) {
    e.getAnimations().forEach((an) => an.cancel())
    if (mudou && !reduzido.matches) e.animate([{ opacity: 0, transform: 'translateY(-4px)' }, { opacity: 1, transform: 'none' }], { duration: 300, easing: 'cubic-bezier(.2,.7,.3,1)' })
  }
}

function casterPadrao(x) {
  if (estado.caster != null) return estado.caster
  if (!motorPronto) return x.especies.find((s) => s <= 1025) ?? x.especies[0]
  const ok = x.especies.filter((s) => especie(s))
  return ok.find((s) => s <= 1025) ?? ok[0] ?? x.especies[0]
}

function montarDetalhe() {
  const x = PORID.get(estado.sel)
  const palco = $('pas-palco')
  palco.style.setProperty('--t', COR_TIPO[x.tipo])
  $('pas-cab').replaceChildren(
    comIcone(el('span', { class: 'pas-ic grande', 'aria-hidden': 'true' }), x.id),
    el('span', { class: 'pas-cab-txt' }, [
      el('h2', { text: x.nome }),
      el('span', { class: 'pas-cab-chips' }, [
        el('span', { class: 'pas-tipo', text: NOME_TIPO[x.tipo] }),
        el('span', { class: `pas-lado ${x.inimigo ? 'ini' : 'time'}`, text: x.inimigo ? 'Afeta o inimigo' : 'Ajuda o time' }),
        el('span', { class: `pas-gat g-${x.p.gatilho}`, text: x.gatCurto })
      ]),
      el('span', { class: 'pas-resumo', text: x.curto })
    ])
  )
  $('pas-fatos').replaceChildren(
    fato('Quando', x.gatLongo),
    fato('Alvo', x.alvo),
    fato('Efeito', x.desc)
  )
  montarQuemTem(x)
  iniciarCena(x)
}
function fato(rot, txt) {
  return el('div', { class: 'pas-fato' }, [el('dt', { text: rot }), el('dd', { text: txt })])
}

function montarQuemTem(x) {
  const caixa = $('pas-quem')
  const titulo = el('h3', {}, [`Quem tem`, el('span', { class: 'pas-n', text: String(new Set(x.especies.map((s) => especie(s)?.nome).filter(Boolean)).size || x.especies.length) })])
  if (!motorPronto) {
    caixa.replaceChildren(titulo, el('p', { class: 'pas-carregando', text: 'Carregando pokémon…' }))
    return
  }
  const itens = x.especies.map((s) => ({ s, e: especie(s) })).filter((i) => i.e)
  const atualSp = casterPadrao(x)
  const porNome = new Map()
  for (const i of itens.sort((a, b) => a.s - b.s)) if (!porNome.has(i.e.nome) || i.s === atualSp) porNome.set(i.e.nome, i)
  itens.splice(0, itens.length, ...[...porNome.values()].sort((a, b) => a.e.nome.localeCompare(b.e.nome, 'pt-BR')))
  const atual = casterPadrao(x)
  caixa.replaceChildren(titulo, el('div', { class: 'pas-quem-lista' }, itens.map(({ s, e }) => {
    const b = el('button', { type: 'button', class: `pas-pk${s === atual ? ' sel' : ''}`, 'data-sp': String(s), title: `Ver ${e.nome} no tabuleiro` }, [
      el('span', { class: 'pas-pk-img' }, [imgSprite(e.looktype, s)]),
      el('span', { class: 'pas-pk-nome', text: e.nome })
    ])
    return b
  })))
}

const FILEIRAS = [[1, 6], [0, 7], [0, 7], [2, 5], [2, 5]]
const valida = (col, f) => f >= 0 && f < 5 && col >= FILEIRAS[f][0] && col <= FILEIRAS[f][1]
const yDe = (lado, f) => (lado === 'ini' ? 12 - f : 13 + f)

let cena = null

function montarTabuleiro(doisLados) {
  const tab = $('pas-tab')
  tab.classList.toggle('so-time', !doisLados)
  const casas = new Map()
  const filhos = []
  if (doisLados) filhos.push(el('span', { class: 'pas-canto deles', text: 'Inimigo' }))
  const linha = (lado, f) => {
    for (let col = 0; col < 8; col++) {
      if (!valida(col, f)) { filhos.push(el('span', { class: 'pas-fora' })); continue }
      const c = el('span', { class: `pas-casa ${lado}${(col + f) % 2 ? ' alt' : ''}`, 'data-k': `${lado}:${col}:${f}` })
      casas.set(`${lado}:${col}:${f}`, c)
      filhos.push(c)
    }
  }
  if (doisLados) for (let f = 4; f >= 0; f--) linha('ini', f)
  const meio = el('span', { class: 'pas-meio', 'aria-hidden': 'true' })
  meio.innerHTML = '<svg class="pas-emblema" viewBox="0 0 100 100"><circle class="e-claro" cx="50" cy="50" r="48"/><path class="e-vermelho" d="M2 50a48 48 0 0 1 96 0z"/><rect class="e-faixa" x="2" y="47" width="96" height="6"/><circle class="e-faixa" cx="50" cy="50" r="13"/><circle class="e-botao" cx="50" cy="50" r="8"/></svg>'
  filhos.push(meio)
  for (let f = 0; f < 5; f++) linha('nos', f)
  filhos.push(el('span', { class: 'pas-canto nosso', text: 'Seu time' }))
  const camada = el('div', { class: 'pas-camada' })
  filhos.push(camada)
  tab.replaceChildren(...filhos)
  return { tab, casas, camada }
}

let tabuleiro = null
const LEVE = (navigator.hardwareConcurrency || 8) <= 4 || (navigator.deviceMemory || 8) <= 4 || matchMedia('(max-width: 560px)').matches
let palcoVisivel = true
let pronto = false
const precisaPausar = () => document.hidden || !palcoVisivel
async function aguardarVisivel(c) { while (c.vivo && precisaPausar()) await new Promise((ok) => setTimeout(ok, 300)) }
const RITMO = 1
const BOLA_SVG = `url("data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" fill="#fff3df" fill-opacity=".34"/><path d="M2 50a48 48 0 0 1 96 0z" fill="#e0505c" fill-opacity=".55"/><rect x="2" y="46.5" width="96" height="7" fill="#10070c"/><circle cx="50" cy="50" r="14" fill="#10070c"/><circle cx="50" cy="50" r="8.5" fill="#f3e4cf" fill-opacity=".9"/></svg>')}")`
function pintarBola(tab) {
  const meio = tab.querySelector('.pas-meio')
  if (!meio) return
  const cx = meio.offsetLeft + meio.offsetWidth / 2, cy = meio.offsetTop + meio.offsetHeight / 2
  const D = meio.offsetWidth * 0.52
  for (const c of tab.querySelectorAll('.pas-casa')) {
    let b = c.firstElementChild
    if (!b) { b = document.createElement('i'); b.className = 'pas-casa-bola'; c.append(b) }
    const x = cx - D / 2 - c.offsetLeft, y = cy - D / 2 - c.offsetTop
    const longe = x > c.offsetWidth || y > c.offsetHeight || x + D < 0 || y + D < 0
    b.style.backgroundImage = longe ? 'none' : BOLA_SVG
    b.style.backgroundSize = `${D}px ${D}px`
    b.style.backgroundPosition = `${x}px ${y}px`
  }
}
class Cena {
  constructor(x, doisLados) {
    this.x = x
    this.vivo = true
    this.pecas = []
    this.vel = reduzido.matches ? 0 : 1
    tabuleiro ??= montarTabuleiro(true)
    const { tab, casas, camada } = tabuleiro
    this.tab = tab; this.casas = casas; this.camada = camada
    camada.getAnimations().forEach((an) => an.cancel())
    camada.replaceChildren()
    if (this.vel) camada.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 320, easing: 'ease-out' })
    this.ro = new ResizeObserver(() => this.reposicionar())
    this.ro.observe(tab)
  }
  parar() { this.vivo = false; this.ro.disconnect(); clearTimeout(this.tLoop) }
  casa(lado, col, f) { return this.casas.get(`${lado}:${col}:${f}`) }
  geo(lado, col, f) {
    const c = this.casa(lado, col, f)
    return { x: c.offsetLeft, y: c.offsetTop, w: c.offsetWidth }
  }
  peca(lado, col, f, { sp = DITTO, lt = null, hp = 100, papel = 'teste', rotulo = null } = {}) {
    const n = el('div', { class: `pas-peca ${lado} ${papel}` }, [
      el('span', { class: 'pas-peca-img' }, [imgSprite(lt, sp)]),
      el('span', { class: 'pas-st' }),
      el('span', { class: 'pas-hp' }, [el('b'), el('i')]),
      rotulo ? el('span', { class: 'pas-rot', text: rotulo }) : null
    ])
    this.camada.append(n)
    const p = { n, lado, col, f, hp }
    this.pecas.push(p)
    this.por(p)
    this.vida(p, hp, 0)
    return p
  }
  por(p) {
    const g = this.geo(p.lado, p.col, p.f)
    p.n.style.left = `${g.x}px`; p.n.style.top = `${g.y}px`; p.n.style.width = `${g.w}px`; p.n.style.height = `${g.w}px`
  }
  reposicionar() { pintarBola(this.tab); for (const p of this.pecas) this.por(p) }
  centro(p) { const g = this.geo(p.lado, p.col, p.f); return { x: g.x + g.w / 2, y: g.y + g.w / 2, w: g.w } }
  ms(v) { return v * this.vel * RITMO }
  async espera(ms) {
    if (!this.vivo) throw new Error('fim')
    await new Promise((ok) => setTimeout(ok, this.vel ? ms * RITMO : Math.min(ms, 400)))
    if (precisaPausar()) await aguardarVisivel(this)
    if (!this.vivo) throw new Error('fim')
  }
  async mover(p, col, f, ms = 500, arco = 0) {
    const a = this.geo(p.lado, p.col, p.f)
    p.col = col; p.f = f
    const b = this.geo(p.lado, col, f)
    this.por(p)
    if (!this.ms(ms)) return this.espera(0)
    const dx = a.x - b.x, dy = a.y - b.y
    som(arco ? 'puxao' : 'passo', { forca: arco ? 0.9 : 0.5 })
    const meio = arco ? [{ transform: `translate(${dx / 2}px, ${dy / 2 - arco * b.w}px) scale(1.15)`, offset: 0.5 }] : []
    await p.n.animate([{ transform: `translate(${dx}px, ${dy}px)` }, ...meio, { transform: 'translate(0, 0)' }], { duration: this.ms(ms), easing: 'cubic-bezier(.45,.05,.35,1)' }).finished.catch(() => {})
    if (!this.vivo) throw new Error('fim')
  }
  async moverPara(p, lado, col, f, ms = 400, arco = 0) {
    const a = this.geo(p.lado, p.col, p.f)
    p.lado = lado; p.col = col; p.f = f
    const b = this.geo(lado, col, f)
    this.por(p)
    if (!this.ms(ms)) return this.espera(0)
    const dx = a.x - b.x, dy = a.y - b.y
    const meio = arco ? [{ transform: `translate(${dx / 2}px, ${dy / 2 - arco * b.w}px) scale(1.15)`, offset: 0.5 }] : []
    await p.n.animate([{ transform: `translate(${dx}px, ${dy}px)` }, ...meio, { transform: 'translate(0, 0)' }], { duration: this.ms(ms), easing: 'cubic-bezier(.45,.05,.35,1)' }).finished.catch(() => {})
    if (!this.vivo) throw new Error('fim')
  }
  legendaRapida(txt) {
    const r = $('pt-rodada')
    const curto = txt.replace(/^(Rodada \d+):.*$/, '$1')
    if (r.textContent !== curto) { r.textContent = curto; if (this.vel) r.animate([{ transform: 'scale(.85)', opacity: 0.4 }, { transform: 'scale(1)', opacity: 1 }], { duration: 220, easing: 'ease-out' }) }
    r.classList.toggle('fim', /venceu|esgotado/.test(txt))
    this.leituraAte = 0
  }

  async investida(p, alvo, ms = 380) {
    setTimeout(() => som('soco', { forca: 0.7 }), this.ms(ms) * 0.4)
    const a = this.centro(p), b = this.centro(alvo)
    const dx = (b.x - a.x) * 0.45, dy = (b.y - a.y) * 0.45
    if (!this.ms(ms)) return this.espera(0)
    await p.n.animate([{ transform: 'translate(0,0)' }, { transform: `translate(${dx}px, ${dy}px)`, offset: 0.45 }, { transform: 'translate(0,0)' }], { duration: this.ms(ms), easing: 'ease-in-out' }).finished.catch(() => {})
    if (!this.vivo) throw new Error('fim')
  }
  cor() { return COR_TIPO[this.x.tipo] }
  async golpe(de, para, emoji, ms = 520, opt = {}) {
    if (typeof opt === 'string') opt = { classe: opt }
    const cor = opt.cor ?? (opt.classe === 'cura' ? '#4ade80' : this.cor())
    const a = this.centro(de), b = this.centro(para)
    const k = opt.passa ? 1.45 : 1
    const dx = (b.x - a.x) * k, dy = (b.y - a.y) * k
    const tam = Math.max(18, a.w * 0.56)
    const base = `left:${a.x}px;top:${a.y}px;--c:${cor}`
    const rastro = [1, 2, 3, 4].map((i) => el('span', { class: 'pas-rastro', style: `${base};width:${tam * (1 - i * 0.16)}px;height:${tam * (1 - i * 0.16)}px` }))
    const panDe = (pp) => Math.max(-1, Math.min(1, (this.centro(pp).x / Math.max(1, this.tab.clientWidth)) * 2 - 1)) * 0.6
    const doDono = de === this.dono
    som(opt.classe === 'cura' ? 'cura' : doDono ? 'disparo' : 'disparo', { forca: doDono ? 0.8 : 0.45, pan: panDe(de) })
    if (doDono && !opt.semSomPassiva) som(SOM_PASSIVA[this.x.id], { forca: 0.7, pan: panDe(de) })
    const orbe = el('span', { class: `pas-proj ${opt.classe || ''}`, style: `${base};width:${tam}px;height:${tam}px;font-size:${tam * 0.6}px` }, [comIcone(el('span'), emoji)])
    this.camada.append(...rastro, orbe)
    const fimOp = opt.passa ? 0 : 1
    const kf = (op) => [{ transform: 'translate(-50%,-50%) scale(.3)', opacity: 0 }, { transform: 'translate(-50%,-50%) scale(1)', opacity: op, offset: 0.14 }, { transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(${opt.passa ? 0.7 : 1})`, opacity: op * fimOp }]
    const opts = (d) => ({ duration: this.ms(ms), delay: this.ms(d), easing: 'cubic-bezier(.35,.05,.35,1)', fill: 'both' })
    if (this.ms(ms)) await Promise.all([orbe.animate(kf(1), opts(0)).finished, ...rastro.map((r, i) => r.animate(kf(0.55 - i * 0.11), opts((i + 1) * 28)).finished)]).catch(() => {})
    orbe.remove(); rastro.forEach((r) => r.remove())
    if (!this.vivo) throw new Error('fim')
    if (!opt.passa && !opt.semImpacto) { this.impacto(para, cor); som(doDono ? 'impacto' : 'impacto', { forca: doDono ? 0.9 : 0.5, pan: panDe(para) }) }
  }
  impacto(p, cor = this.cor(), forte = 1) {
    if (!this.vel) return
    const c = this.centro(p)
    p.n.animate([{ filter: 'brightness(2.4) saturate(1.4)' }, { filter: 'none' }], { duration: 320 })
    p.n.querySelector('.pas-peca-img').animate([{ transform: 'translate(0,0)' }, { transform: `translate(${-3 * forte}px,1px)` }, { transform: `translate(${3 * forte}px,-1px)` }, { transform: 'translate(0,0)' }], { duration: 220 })
    const anel = el('span', { class: 'pas-anel', style: `left:${c.x}px;top:${c.y}px;--c:${cor};width:${c.w}px;height:${c.w}px` })
    this.camada.append(anel)
    const tira = () => anel.remove()
    anel.animate([{ transform: 'translate(-50%,-50%) scale(.4)', opacity: 1 }, { transform: 'translate(-50%,-50%) scale(1.6)', opacity: 0 }], { duration: 420, easing: 'ease-out' }).finished.then(tira, tira)
    this.particulas(p, cor, 9, 'explode')
  }
  particulas(p, cor, n = 8, modo = 'explode', simbolo = null) {
    if (!this.vel || precisaPausar()) return
    if (LEVE) n = Math.ceil(n / 2)
    const c = this.centro(p)
    for (let i = 0; i < n; i++) {
      const ang = (i / n) * Math.PI * 2 + Math.random() * 0.6
      const r = c.w * (0.55 + Math.random() * 0.5)
      const t = simbolo ? Math.max(9, c.w * 0.26) : Math.max(4, c.w * (0.07 + Math.random() * 0.06))
      const o = el('span', { class: `pas-part${simbolo ? ' sim' : ''}`, text: simbolo, style: `left:${c.x}px;top:${c.y}px;--c:${cor};${simbolo ? `font-size:${t}px` : `width:${t}px;height:${t}px`}` })
      this.camada.append(o)
      let kf
      if (modo === 'sobe') {
        const x0 = (Math.random() - 0.5) * c.w * 0.8, y0 = c.w * (0.1 + Math.random() * 0.25)
        kf = [{ transform: `translate(calc(-50% + ${x0}px), calc(-50% + ${y0}px)) scale(.4)`, opacity: 0 }, { opacity: 1, offset: 0.25 }, { transform: `translate(calc(-50% + ${x0 + (Math.random() - 0.5) * c.w * 0.4}px), calc(-50% - ${c.w * (0.7 + Math.random() * 0.5)}px)) scale(1)`, opacity: 0 }]
      } else if (modo === 'suga') {
        kf = [{ transform: `translate(calc(-50% + ${Math.cos(ang) * r}px), calc(-50% + ${Math.sin(ang) * r}px)) scale(1)`, opacity: 0 }, { opacity: 1, offset: 0.3 }, { transform: 'translate(-50%,-50%) scale(.3)', opacity: 0 }]
      } else {
        kf = [{ transform: 'translate(-50%,-50%) scale(1)', opacity: 1 }, { transform: `translate(calc(-50% + ${Math.cos(ang) * r}px), calc(-50% + ${Math.sin(ang) * r}px)) scale(.2)`, opacity: 0 }]
      }
      const tira = () => o.remove()
      o.animate(kf, { duration: modo === 'sobe' ? 900 + Math.random() * 500 : 520 + Math.random() * 200, delay: modo === 'sobe' ? Math.random() * 300 : 0, easing: 'cubic-bezier(.2,.7,.3,1)', fill: 'both' }).finished.then(tira, tira)
    }
  }
  aura(p, cor, on = true) {
    p.n.style.setProperty('--a', cor)
    p.n.classList.toggle('aura', on)
  }
  fio(de, para, cor, { arco = 0, classe = '' } = {}) {
    const a = this.centro(de), b = this.centro(para)
    const W = this.tab.clientWidth, H = this.tab.clientHeight
    const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2 - arco * a.w
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    svg.setAttribute('class', `pas-fio ${classe}`)
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`)
    svg.style.cssText = `--c:${cor}`
    svg.innerHTML = `<path d="M${a.x} ${a.y} Q${mx} ${my} ${b.x} ${b.y}"/>`
    this.camada.prepend(svg)
    return svg
  }
  texto(p, txt, tipo = 'dano') {
    const c = this.centro(p)
    const o = el('span', { class: `pas-txt ${tipo}`, text: txt, style: `left:${c.x}px;top:${c.y - c.w * 0.42}px;--c:${this.cor()}` })
    this.camada.append(o)
    const fim = () => o.remove()
    if (!this.vel) { setTimeout(fim, 1100); return }
    o.animate([{ transform: 'translate(-50%, 10%) scale(.5)', opacity: 0 }, { transform: 'translate(-50%, -55%) scale(1.12)', opacity: 1, offset: 0.16 }, { transform: 'translate(-50%, -70%) scale(1)', opacity: 1, offset: 0.62 }, { transform: 'translate(-50%, -125%) scale(.96)', opacity: 0 }], { duration: 2300, easing: 'ease-out' }).finished.then(fim, fim)
  }
  vida(p, v, ms = 350) {
    p.hp = Math.max(0, Math.min(100, v))
    const i = p.n.querySelector('.pas-hp i'), g = p.n.querySelector('.pas-hp b')
    i.style.transition = `width ${this.ms(ms)}ms ease`
    i.style.width = `${p.hp}%`
    g.style.transition = `width ${this.ms(ms + 500)}ms ease ${this.ms(380)}ms`
    g.style.width = `${p.hp}%`
    i.classList.toggle('baixo', p.hp <= 50)
  }
  status(p, txt) {
    const s = p.n.querySelector('.pas-st')
    comIcone(s, txt)
    s.classList.toggle('on', !!txt)
  }
  marca(p, classe, on = true) { p.n.classList.toggle(classe, on) }
  efeito(classe, sobre = 'nos', on = true) {
    let o = this.camada.querySelector(`.pas-fx.${classe}[data-sobre="${sobre}"]`)
    if (!on) { o?.remove(); return }
    const cs = [...this.casas.entries()].filter(([k]) => k.startsWith(`${sobre}:`)).map(([, c]) => c)
    const x0 = Math.min(...cs.map((c) => c.offsetLeft)), y0 = Math.min(...cs.map((c) => c.offsetTop))
    const x1 = Math.max(...cs.map((c) => c.offsetLeft + c.offsetWidth)), y1 = Math.max(...cs.map((c) => c.offsetTop + c.offsetHeight))
    if (!o) { o = el('span', { class: `pas-fx ${classe}`, 'data-sobre': sobre }); this.camada.prepend(o) }
    Object.assign(o.style, { left: `${x0 - 4}px`, top: `${y0 - 4}px`, width: `${x1 - x0 + 8}px`, height: `${y1 - y0 + 8}px` })
    if (classe === 'chuva' && !o.childElementCount) {
      const alt = y1 - y0 + 60, larg = x1 - x0 + 8
      o.style.setProperty('--alt', `${alt}px`)
      for (let i = 0; i < (LEVE ? 28 : 64); i++) {
        const d = 0.55 + Math.random() * 0.35
        o.append(el('i', { class: 'pas-gota', style: `left:${Math.random() * (larg + 30)}px;--h:${12 + Math.random() * 16}px;--o:${0.5 + Math.random() * 0.5};--d:${d}s;--a:${-Math.random() * d}s` }))
      }
      for (let i = 0; i < 9; i++) o.append(el('i', { class: 'pas-respingo', style: `left:${8 + Math.random() * (larg - 16)}px;top:${10 + Math.random() * (alt - 70)}px;--a:${Math.random() * 1.4}s` }))
    }
  }
  onda(p, cor) {
    if (p === this.dono) som(SOM_PASSIVA[this.x.id], { forca: 0.8 })
    const c = this.centro(p)
    const o = el('span', { class: 'pas-onda', style: `left:${c.x}px;top:${c.y}px;--c:${cor}` })
    this.camada.append(o)
    const fim = () => o.remove()
    if (!this.vel) { fim(); return }
    o.animate([{ transform: 'translate(-50%,-50%) scale(.2)', opacity: 0.95 }, { transform: 'translate(-50%,-50%) scale(10)', opacity: 0 }], { duration: 1200, easing: 'cubic-bezier(.2,.7,.3,1)' }).finished.then(fim, fim)
    const o2 = el('span', { class: 'pas-onda fina', style: `left:${c.x}px;top:${c.y}px;--c:${cor}` })
    this.camada.append(o2)
    const fim2 = () => o2.remove()
    o2.animate([{ transform: 'translate(-50%,-50%) scale(.2)', opacity: 0.8 }, { transform: 'translate(-50%,-50%) scale(7)', opacity: 0 }], { duration: 1000, delay: 160, easing: 'ease-out', fill: 'both' }).finished.then(fim2, fim2)
  }
  async legenda(txt) {
    if (estado.modo === 'time') return this.legendaRapida(txt)
    if (this.vel && this.leituraAte) { const falta = this.leituraAte - performance.now(); if (falta > 0) await this.espera(falta) }
    if (!this.vivo) throw new Error('fim')
    this.leituraAte = performance.now() + Math.max(1500, txt.length * 55)
    const l = $('pas-passo')
    this.nPasso = (this.nPasso || 0) + 1
    const corpo = el('span', { class: 'pas-passo-txt' })
    const partes = txt.split(/([−+]?\d+(?:,\d+)?\s?(?:%\/s|%|s\b)|\b\d{2,}\b)/)
    partes.forEach((t, i) => { if (t) corpo.append(i % 2 ? el('b', { class: 'pas-num', text: t }) : t) })
    const barra = el('i', { class: 'pas-passo-barra' })
    l.replaceChildren(estado.modo === 'time' ? el('span', { class: 'pas-passo-ic svg time', 'aria-hidden': 'true', html: ICO_TIME }) : comIcone(el('span', { class: 'pas-passo-ic', 'aria-hidden': 'true' }), this.x.id), corpo, barra)
    if (this.vel) barra.animate([{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], { duration: Math.max(1500, txt.length * 55), easing: 'linear', fill: 'forwards' })
    if (this.vel) l.animate([{ opacity: 0, transform: 'translateY(4px)' }, { opacity: 1, transform: 'none' }], { duration: 260 })
  }
}

const pct = (v) => `${String(v).replace('.', ',')}%`

function elenco(c, x, { aliadosInseto = false, aliadoForte = false } = {}) {
  const sp = casterPadrao(x)
  const e = motorPronto ? especie(sp) : null
  const C = c.peca('nos', 3, 0, { sp, lt: e?.looktype, papel: 'dono' })
  c.dono = C
  const outrosInseto = aliadosInseto ? x.especies.filter((s) => s !== sp && especie(s)).slice(0, 2) : []
  const a1 = outrosInseto[0] ?? DITTO
  const a2 = outrosInseto[1] ?? (aliadoForte ? DRAGONITE : DITTO)
  const A1 = c.peca('nos', 5, 1, { sp: a1, lt: especie(a1)?.looktype, papel: 'aliado' })
  const A2 = c.peca('nos', 1, 2, { sp: a2, lt: especie(a2)?.looktype, papel: 'aliado', rotulo: aliadoForte ? 'BST > 500' : null })
  return { C, A1, A2, nInseto: outrosInseto.length }
}
function inimigos(c, { apagados = false } = {}) {
  const E = {
    E1: c.peca('ini', 3, 0), E2: c.peca('ini', 6, 1), E3: c.peca('ini', 0, 1), E4: c.peca('ini', 4, 2), E5: c.peca('ini', 3, 4)
  }
  if (apagados) for (const p of Object.values(E)) c.marca(p, 'quieto')
  return E
}

const num = (v) => Number(String(v).replace(',', '.'))
const COR = { fogo: '#ff8a3d', veneno: '#c46be0', gelo: '#7fe3ff', raio: '#ffd84d', planta: '#6fd44a', terra: '#c9a24c', psi: '#ff6fae', fantasma: '#a98bff', luta: '#ff5a4f', vento: '#cfd6ff', sombra: '#8a6bb8', fada: '#ff8fc8', cura: '#4ade80', pedra: '#d1b46a', agua: '#6fa8ff', inseto: '#b8d42a', dragao: '#8b5cff', aco: '#c9d0ff' }

const CENAS = {
  async rocky_helmet(c, x) {
    const { C } = elenco(c, x); const { E1 } = inimigos(c)
    c.status(C, x.id); c.aura(C, COR.pedra)
    await c.legenda('Ativa a luta toda.')
    await c.espera(1000)
    for (let i = 0; i < 2; i++) {
      await c.legenda('Bateu nele…')
      await c.investida(E1, C); c.impacto(C, '#ffb3ba'); c.texto(C, '−10%'); c.vida(C, C.hp - 10)
      await c.espera(200)
      await c.legenda(`…leva ${pct(x.n.pct)} do dano de volta.`)
      await c.golpe(C, E1, '⛰️', 420, { cor: COR.pedra }); c.texto(E1, `−${pct(x.n.pct)} do dano`, 'refl'); c.vida(E1, E1.hp - 2)
      await c.espera(1000)
    }
    await c.legenda('Vale até para a Investida.')
    await c.espera(1200)
  },
  async rain_dance(c, x) {
    const { C, A1, A2 } = elenco(c, x, { aliadoForte: true }); inimigos(c, { apagados: true })
    await c.legenda('Começa a luta: bônus no time.')
    await c.espera(500); c.onda(C, COR.agua); c.efeito('chuva', 'nos'); await c.espera(800)
    for (const p of [C, A1]) { c.aura(p, COR.agua); c.status(p, '🌧️'); c.texto(p, `+${pct(x.n.pct)} dano`, 'buff'); c.particulas(p, COR.agua, 6, 'sobe') }
    await c.legenda(`+${pct(x.n.pct)} de dano e recarga ${pct(x.n.recarga)} mais rápida.`)
    await c.espera(2200)
    c.texto(A2, 'não recebe', 'nada'); c.marca(A2, 'apagado')
    await c.legenda(`BST acima de ${x.n.bst} fica de fora.`)
    await c.espera(2400)
  },
  async swarm(c, x) {
    const { C, A1, A2, nInseto } = elenco(c, x, { aliadosInseto: true }); inimigos(c, { apagados: true })
    c.aura(C, COR.inseto)
    await c.legenda(`Começa com +${pct(x.n.pct)} de dano.`)
    await c.espera(500); c.status(C, '🐝'); c.texto(C, `+${pct(x.n.pct)}`, 'buff'); c.particulas(C, COR.inseto, 8, 'explode'); som('inseto')
    await c.espera(1100)
    if (nInseto) {
      await c.legenda(`+${pct(x.n.porInseto)} por outro Inseto no time.`)
      for (const p of [A1, A2].slice(0, nInseto)) {
        const f = c.fio(p, C, COR.inseto)
        c.onda(p, COR.inseto); await c.golpe(p, C, '🐝', 480, { cor: COR.inseto, semImpacto: true })
        c.texto(C, `+${pct(x.n.porInseto)} (Inseto)`, 'buff'); som('inseto', { forca: 0.6 })
        await c.espera(500); f.remove()
      }
    }
    const total = Math.min(num(x.n.teto), num(x.n.pct) + nInseto * num(x.n.porInseto))
    c.texto(C, `+${pct(total)} de dano`, 'buff'); c.particulas(C, COR.inseto, 10, 'sobe')
    await c.legenda(`Total: +${pct(total)} (máximo +${pct(x.n.teto)}).`)
    await c.espera(2600)
  },
  async intimidate(c, x) {
    const { C } = elenco(c, x); const E = inimigos(c)
    await c.legenda('Começa a luta intimidando.')
    await c.espera(700); c.onda(C, COR.dragao); await c.espera(450)
    for (const p of Object.values(E)) { c.aura(p, COR.dragao); c.status(p, '🐉'); c.texto(p, `−${pct(x.n.pct)} dano`, 'deb') }
    await c.legenda(`Inimigos: −${pct(x.n.pct)} de dano.`)
    await c.espera(1600)
    await c.golpe(E.E1, C, '✦', 480, { cor: '#ffb3ba' }); c.texto(C, `dano de golpe −${pct(x.n.pct)}`, 'nada')
    await c.espera(1200)
    await c.legenda('Só se for o único Dragão do time.')
    await c.espera(2200)
  },
  async iron_defense(c, x) {
    const { C, A1 } = elenco(c, x); const { E1, E2 } = inimigos(c)
    await c.legenda('Começa a luta na defesa.')
    await c.espera(700); c.onda(C, COR.aco); c.status(C, '🔩'); c.marca(C, 'escudo'); c.particulas(C, COR.aco, 10, 'explode'); som('metal')
    c.texto(C, `+${pct(x.n.pct)} DEF e SP.DEF`, 'buff')
    await c.legenda(`+${pct(x.n.pct)} de DEF e SP.DEF.`)
    await c.espera(1500)
    await c.golpe(E1, C, '✦', 460, { cor: '#ffb3ba' }); c.texto(C, 'menos dano', 'nada'); c.vida(C, C.hp - 6); som('metal', { forca: 0.5 })
    await c.espera(400)
    await c.golpe(E2, A1, '✦', 460, { cor: '#ffb3ba' }); c.texto(A1, '−12%'); c.vida(A1, A1.hp - 12)
    await c.legenda('Só ele. Aliados não ganham.')
    await c.espera(2200)
  },
  async burn(c, x) { await dot(c, x, '🔥', 'queima', COR.fogo) },
  async poison(c, x) { await dot(c, x, '☠️', 'veneno', COR.veneno) },
  async freeze(c, x) {
    const { C, A1 } = elenco(c, x); const { E1 } = inimigos(c)
    await c.legenda('Mira no inimigo mais perto.')
    await c.espera(600); await c.golpe(C, E1, '❄️', 520, { cor: COR.gelo })
    c.particulas(E1, COR.gelo, 7, 'explode', '❄')
    c.status(E1, '❄️'); c.marca(E1, 'gelo')
    await c.legenda(`Congelado: ${x.n.seg} s parado.`)
    await c.espera(1400)
    await c.legenda(`Toma +${pct(x.n.danoRecebido)} de dano.`)
    await c.golpe(A1, E1, '✦', 460, { cor: '#ffe9a3' }); c.texto(E1, `+${pct(x.n.danoRecebido)} dano`, 'deb'); c.vida(E1, E1.hp - 14)
    await c.espera(1100); c.marca(E1, 'gelo', false); c.status(E1, ''); c.particulas(E1, COR.gelo, 8, 'explode')
    await c.legenda('Repete a cada ciclo.')
    await c.espera(1800)
  },
  async paralyze(c, x) {
    const { C } = elenco(c, x); const { E1 } = inimigos(c)
    await c.legenda('Mira no inimigo mais perto.')
    await c.espera(600); await c.golpe(C, E1, '⚡', 380, { cor: COR.raio })
    c.status(E1, '🌩️'); c.marca(E1, 'choque'); c.aura(E1, COR.raio)
    c.texto(E1, `recargas +${String(x.n.atraso).replace('.', ',')} s`, 'deb')
    await c.legenda(`Recargas atrasam ${x.n.atraso} s.`)
    for (let i = 0; i < 4; i++) { c.particulas(E1, COR.raio, 5, 'explode'); await c.espera(380) }
    await c.legenda(`Por ${x.n.seg} s: ${pct(x.n.falha)} de chance de falhar.`)
    await c.espera(900)
    await c.legenda('Falhou: o ataque não sai.'); await c.espera(500)
    c.texto(E1, 'Falhou!', 'nada'); c.particulas(E1, COR.raio, 8, 'explode'); som('falha')
    await c.espera(2000); c.marca(E1, 'choque', false); c.aura(E1, COR.raio, false)
  },
  async leech_seed(c, x) {
    const { C } = elenco(c, x); const { E1 } = inimigos(c)
    c.vida(C, 70, 0)
    await c.legenda('Planta no inimigo mais perto.')
    await c.espera(900); await c.golpe(C, E1, '🌱', 520, { cor: COR.planta }); c.status(E1, '🌱'); c.aura(E1, COR.planta)
    const f = c.fio(E1, C, COR.planta)
    await c.legenda(`Drena ${pct(x.n.pct)}/s e cura quem plantou.`)
    const ticks = Math.round(num(x.n.seg)), por = num(x.n.pct)
    let curado = 0
    for (let i = 0; i < ticks; i++) {
      c.vida(E1, E1.hp - por, 250); c.particulas(E1, COR.planta, 3, 'explode')
      if (i % 2 === 0) c.texto(E1, `−${pct(por)}`)
      const cura = Math.min(por, num(x.n.curaMax) - curado)
      if (cura > 0) { curado += cura; c.vida(C, C.hp + cura, 250); if (i % 2 === 0) { c.golpe(E1, C, '✚', 380, { classe: 'cura', semImpacto: true }).catch(() => {}); som('planta', { forca: 0.5 }) } }
      await c.espera(320)
    }
    await c.espera(400)
    f.remove(); c.aura(E1, COR.planta, false); c.status(E1, '')
    c.texto(E1, `${pct(Math.round(ticks * por * 10) / 10)} no total`, 'deb')
    await c.legenda(`Cura até ${pct(x.n.curaMax)}. Repete a cada ciclo.`)
    await c.espera(2600)
  },
  async dig(c, x) {
    const { C } = elenco(c, x); const { E2 } = inimigos(c)
    c.status(C, '🕳️'); c.aura(C, COR.terra)
    await c.legenda('Pronto para desviar.')
    await c.espera(1000)
    await c.legenda('O golpe vem…')
    const ida = c.golpe(E2, C, '✦', 700, { cor: '#ffb3ba', passa: true })
    await c.espera(280); c.marca(C, 'cavando'); c.particulas(C, COR.terra, 10, 'explode'); som('terra')
    await ida; c.texto(C, 'Esquivou!', 'nada'); som('esquiva')
    await c.espera(450); c.marca(C, 'cavando', false); c.status(C, ''); c.aura(C, COR.terra, false); c.particulas(C, COR.terra, 6, 'sobe')
    await c.legenda('…e passa direto. Z-Move não.')
    await c.espera(1800); c.status(C, '🕳️'); c.aura(C, COR.terra)
    await c.legenda('Pronto de novo a cada ciclo.')
    await c.espera(1600)
  },
  async confusion(c, x) {
    const { C } = elenco(c, x); const { E1, E4 } = inimigos(c)
    await c.legenda('Confunde o inimigo mais perto.')
    await c.espera(600); await c.golpe(C, E1, '💫', 520, { cor: COR.psi }); c.status(E1, '💫'); c.aura(E1, COR.psi)
    c.particulas(E1, COR.psi, 6, 'sobe', '★')
    await c.espera(1300)
    await c.legenda('O próximo golpe dele…')
    await c.espera(700)
    c.texto(E1, 'Confuso!', 'nada'); som('psi')
    await c.golpe(E1, E4, '✦', 560, { cor: '#ffb3ba' }); c.texto(E4, '−12%'); c.vida(E4, E4.hp - 12); c.status(E1, ''); c.aura(E1, COR.psi, false)
    await c.legenda('…acerta o aliado mais perto.')
    await c.espera(3000)
  },
  async fear(c, x) {
    const { C } = elenco(c, x); const { E1 } = inimigos(c)
    await c.legenda('Assusta o inimigo mais perto.')
    await c.espera(600); await c.golpe(C, E1, '👻', 560, { cor: COR.fantasma }); c.status(E1, '👻'); c.marca(E1, 'medo'); c.aura(E1, COR.fantasma)
    await c.legenda(`Recua ${x.n.seg} s sem atacar.`)
    for (const f of [1, 2, 3]) { c.particulas(E1, COR.fantasma, 4, 'sobe'); await c.mover(E1, 3, f, 520); await c.espera(420) }
    c.marca(E1, 'medo', false); c.status(E1, ''); c.aura(E1, COR.fantasma, false)
    await c.legenda('Volta a lutar de onde parou.')
    await c.espera(2200)
  },
  async rock_smash(c, x) {
    const { C, A1, A2 } = elenco(c, x); const { E1 } = inimigos(c)
    await c.legenda('Quebra a defesa do mais perto.')
    await c.espera(600); await c.golpe(C, E1, '👊', 420, { cor: COR.luta }); c.status(E1, '👊'); c.marca(E1, 'quebrado'); c.aura(E1, COR.luta)
    c.texto(E1, `−${pct(x.n.pct)} DEF e SP.DEF`, 'deb')
    await c.legenda(`−${pct(x.n.pct)} DEF e SP.DEF por ${x.n.seg} s.`)
    await c.espera(1200)
    await Promise.all([c.golpe(A1, E1, '✦', 500, { cor: '#ffe9a3' }), c.golpe(A2, E1, '✦', 620, { cor: '#ffe9a3' })])
    c.texto(E1, 'mais dano', 'deb'); c.vida(E1, E1.hp - 22)
    await c.espera(1600); c.marca(E1, 'quebrado', false); c.aura(E1, COR.luta, false)
    await c.legenda('Repete a cada ciclo.')
    await c.espera(1600)
  },
  async whirlwind(c, x) {
    const { C } = elenco(c, x); const { E1, E5 } = inimigos(c)
    await c.legenda('Sopra o inimigo mais perto.')
    await c.espera(600); await c.golpe(C, E1, '🌪️', 480, { cor: COR.vento })
    c.texto(E1, `−${pct(x.n.pct)}`); c.vida(E1, E1.hp - 15)
    await c.legenda('Empurra para o fundo…')
    c.marca(E1, 'girando'); c.particulas(E1, COR.vento, 8, 'explode')
    await c.mover(E1, 3, 3, 900)
    c.marca(E1, 'girando', false); c.impacto(E1, COR.vento, 0.4)
    c.marca(E5, 'mira')
    await c.legenda('…até antes de quem está atrás.')
    await c.espera(1600); c.marca(E5, 'mira', false)
    await c.espera(900)
  },
  async assurance(c, x) {
    const { C } = elenco(c, x); const { E1 } = inimigos(c)
    c.vida(E1, 60, 0)
    await c.legenda('Golpeia quem ele ataca (60% do HP).')
    await c.espera(1100); await c.golpe(C, E1, '🌑', 480, { cor: COR.sombra })
    const p1 = num(x.n.pct), p2 = num(x.n.faltando)
    const extra = Math.round(40 * p2) / 100
    c.particulas(E1, COR.sombra, 10, 'explode')
    c.texto(E1, `−${pct(p1)} −${pct(extra)}`); c.vida(E1, E1.hp - p1 - extra)
    await c.legenda(`${pct(p1)} + ${pct(p2)} do que falta. Ferido dói mais.`)
    await c.espera(3200)
  },
  async charm(c, x) {
    const { C } = elenco(c, x); const { E5 } = inimigos(c)
    await c.legenda('Mira no inimigo mais longe.')
    await c.espera(500); c.marca(E5, 'mira')
    const mira = c.fio(C, E5, COR.fada)
    await c.espera(900)
    await c.golpe(C, E5, '💗', 620, { cor: COR.fada })
    mira.remove(); c.marca(E5, 'mira', false); c.status(E5, '💗'); c.aura(E5, COR.fada)
    await c.legenda('Puxa para a frente…')
    c.particulas(E5, COR.fada, 6, 'sobe', '♥')
    await c.mover(E5, 4, 0, 950, 1.2)
    c.impacto(E5, COR.fada); c.particulas(E5, COR.fada, 6, 'sobe', '♥')
    c.texto(E5, `−${pct(x.n.pct)}`); c.vida(E5, E5.hp - 10)
    await c.legenda(`…e tira ${pct(x.n.pct)} do HP.`)
    await c.espera(2000); c.aura(E5, COR.fada, false)
    await c.legenda('Repete a cada ciclo.')
    await c.espera(1600)
  },
  async recover(c, x) {
    const { C, A1 } = elenco(c, x); const { E2, E4 } = inimigos(c)
    await c.legenda(`Aliado caiu a ${x.n.gatilhoHp}% do HP…`)
    await c.espera(800)
    for (const [E, d] of [[E2, 25], [E4, 30]]) { await c.golpe(E, A1, '✦', 460, { cor: '#ffb3ba' }); c.texto(A1, `−${d}%`); c.vida(A1, A1.hp - d); await c.espera(450) }
    c.onda(C, COR.cura); await c.golpe(C, A1, '💚', 520, { classe: 'cura' })
    c.particulas(A1, COR.cura, 8, 'sobe', '✚')
    c.texto(A1, `+${pct(x.n.pct)}`, 'cura'); c.vida(A1, A1.hp + num(x.n.pct))
    await c.legenda(`…cura ${pct(x.n.pct)} do mais ferido.`)
    await c.espera(3000)
  }

}
async function dot(c, x, emoji, classe, cor) {
  const { C } = elenco(c, x); const { E1 } = inimigos(c)
  await c.legenda('Mira no inimigo mais perto.')
  await c.espera(600); await c.golpe(C, E1, emoji, 520, { cor }); c.status(E1, emoji); c.marca(E1, classe); c.aura(E1, cor)
  await c.legenda(`−${pct(x.n.pct)} do HP por segundo, ${x.n.seg} s.`)
  const ticks = Math.round(num(x.n.seg)), por = num(x.n.pct), passo = Math.min(560, 3600 / ticks)
  for (let i = 0; i < ticks; i++) {
    await c.espera(passo)
    c.particulas(E1, cor, 4, 'sobe'); c.vida(E1, E1.hp - por, Math.min(300, passo))
    if (ticks <= 6 || i % 2 === 0) c.texto(E1, `−${pct(por)}`)
    if (i % 2 === 0) som(classe === 'queima' ? 'fogo' : 'veneno', { forca: 0.5 })
  }
  await c.espera(300)
  c.texto(E1, `${pct(x.n.total)} no total`, 'deb')
  c.marca(E1, classe, false); c.status(E1, ''); c.aura(E1, cor, false)
  await c.legenda('Repete a cada ciclo.')
  await c.espera(2000)
}

function iniciarCena(x) {
  if (!pronto) return
  cena?.parar()
  const c = new Cena(x, x.doisLados)
  cena = c
  const emTime = estado.modo === 'time'
  $('pas-legenda-tab').textContent = 'Os Ditto são pokémon de teste.'
  const rodar = async () => {
    if (!c.vivo) return
    try {
      await (emTime ? cenaTime(c) : CENAS[x.id](c, x))
      if (!c.vivo) return
      if (c.vel && c.leituraAte) { const falta = c.leituraAte - performance.now(); if (falta > 0) await c.espera(falta) }
      if (c.vel) await c.camada.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 450, easing: 'ease-in', fill: 'forwards' }).finished.catch(() => {})
      if (!c.vivo) return
      c.camada.getAnimations().forEach((an) => an.cancel())
      c.camada.replaceChildren(); c.pecas = []; c.nPasso = 0; c.leituraAte = 0
      if (c.vel) c.camada.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 380, easing: 'ease-out' })
      c.tLoop = setTimeout(rodar, 60)
    } catch {}
  }
  requestAnimationFrame(() => requestAnimationFrame(rodar))
}

const normal = (t) => String(t || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()
function ligarBusca() {
  const campo = $('pas-busca'), caixa = $('pas-achados')
  let ativo = -1
  const fechar = () => { caixa.hidden = true; caixa.replaceChildren(); ativo = -1; campo.setAttribute('aria-expanded', 'false') }
  const abrirPassiva = (sp, pid) => {
    escolher(pid, true, sp)
    fechar()
    campo.value = ''
    campo.blur()
  }
  const pintar = () => {
    const q = campo.value
    if (!normal(q)) return fechar()
    if (!motorPronto) {
      caixa.replaceChildren(el('p', { class: 'pas-achados-vazio', text: 'Carregando os pokémon do jogo…' }))
      caixa.hidden = false
      return
    }
    let achados = []
    try { achados = motorPronto.buscarEspecies(q, 8) } catch {}
    if (!achados.length) {
      caixa.replaceChildren(el('p', { class: 'pas-achados-vazio', text: 'Nenhum pokémon com esse nome.' }))
      caixa.hidden = false
      return
    }
    caixa.replaceChildren(...achados.map((a, i) => {
      const pas = P.passivaDaEspecie(a.speciesId)
      const e = especie(a.speciesId)
      const bst = e ? Object.values(e.base || {}).reduce((t, v) => t + (Number(v) || 0), 0) : null
      const x = pas ? PORID.get(pas.id) : null
      const b = el('button', { type: 'button', class: `pas-achado${x ? '' : ' sem'}`, role: 'option', 'data-sp': String(a.speciesId), 'data-pas': x?.id || '', style: x ? `--t:${COR_TIPO[x.tipo]}` : null }, [
        el('span', { class: 'pas-pk-img' }, [imgSprite(a.looktype, a.speciesId)]),
        el('span', { class: 'pas-achado-txt' }, [
          el('b', { text: a.nome }),
          el('small', { text: bst ? `BST ${bst} · ${bst <= P.BST_MAX_PASSIVA ? 'recebe' : 'não recebe'} Rain Dance e Recover de aliados` : '' })
        ]),
        x ? el('span', { class: 'pas-achado-pas' }, [comIcone(el('span', { class: 'pas-achado-ic', 'aria-hidden': 'true' }), x.id), x.nome]) : el('span', { class: 'pas-achado-pas nada', text: 'Sem passiva' })
      ])
      if (i === ativo) b.classList.add('foco')
      return b
    }))
    caixa.hidden = false
    campo.setAttribute('aria-expanded', 'true')
  }
  campo.addEventListener('input', () => { ativo = -1; pintar() })
  campo.addEventListener('focus', () => { carregarMotor().then((m) => { motorPronto = m; if (normal(campo.value)) pintar() }) ; if (normal(campo.value)) pintar() })
  campo.addEventListener('keydown', (e) => {
    const itens = [...caixa.querySelectorAll('.pas-achado')]
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      if (!itens.length) return
      e.preventDefault()
      ativo = (ativo + (e.key === 'ArrowDown' ? 1 : -1) + itens.length) % itens.length
      itens.forEach((b, i) => b.classList.toggle('foco', i === ativo))
      itens[ativo].scrollIntoView({ block: 'nearest' })
    } else if (e.key === 'Enter') {
      const b = itens[ativo >= 0 ? ativo : 0]
      if (b?.dataset.pas) { e.preventDefault(); abrirPassiva(Number(b.dataset.sp), b.dataset.pas) }
    } else if (e.key === 'Escape') fechar()
  })
  caixa.addEventListener('mousedown', (e) => e.preventDefault())
  caixa.addEventListener('click', (e) => {
    const b = e.target.closest('.pas-achado')
    if (b?.dataset.pas) abrirPassiva(Number(b.dataset.sp), b.dataset.pas)
  })
  campo.addEventListener('blur', () => setTimeout(fechar, 120))
}

function montarCiclo() {
  const desde = new Date(P.PASSIVAS_DESDE_MS)
  const dia = new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Sao_Paulo', day: '2-digit', month: '2-digit' }).format(desde)
  const hora = new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Sao_Paulo', hour: '2-digit', minute: '2-digit' }).format(desde)
  const ja = P.passivasNoAr()
  const hoje = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(new Date())
  const fora = P.CAMPEONATOS_SEM_PASSIVA.filter((d) => d >= hoje).map((d) => d.slice(8, 10) + '/' + d.slice(5, 7))
  $('pas-quando').replaceChildren(
    el('li', {}, [el('b', { text: ja ? 'Já valem' : `A partir de ${dia}, ${hora}` }), ja ? ' no Ranqueado, nos torneios e no Ginásio' : ' no Ranqueado, nos torneios e no Ginásio (horário de Brasília)']),
    el('li', {}, [el('b', { text: 'Já valem' }), ' no Amistoso e no Treinamento']),
    ...fora.map((d) => el('li', {}, [el('b', { text: 'Fora' }), ` do Mundial de ${d}, que fica no formato antigo`]))
  )
}

function ligar() {
  $('pas-linhas').addEventListener('click', (e) => { const b = e.target.closest('[data-id]'); if (b) escolher(b.dataset.id, true) })
  document.querySelectorAll('[data-filtro]').forEach((b) => b.addEventListener('click', () => { estado.filtro = b.dataset.filtro; montarLista() }))
  $('pas-quem').addEventListener('click', (e) => {
    const b = e.target.closest('[data-sp]')
    if (!b) return
    estado.caster = Number(b.dataset.sp)
    montarQuemTem(PORID.get(estado.sel))
    iniciarCena(PORID.get(estado.sel))
  })
  const btSom = $('pas-som')
  const pintarSom = (on) => { btSom.setAttribute('aria-pressed', String(on)); btSom.title = on ? 'Desligar som' : 'Ligar som'; btSom.classList.toggle('ligado', on) }
  somPronto.then((m) => { if (!m) { btSom.hidden = true; return } pintarSom(m.somLigado()) })
  btSom.addEventListener('click', async () => { const m = await somPronto; if (!m) return; const on = m.alternarSom(); pintarSom(on); if (on) iniciarCena(PORID.get(estado.sel)) })
  ligarBusca()
  const pop = $('pas-como')
  pop.querySelectorAll('[data-ico]').forEach((e) => comIcone(e, e.dataset.ico))
  $('pas-como-abrir').addEventListener('click', () => { pop.showModal(); som('clique', { forca: 0.6 }) })
  $('pas-como-fechar').addEventListener('click', () => pop.close())
  pop.addEventListener('click', (e) => { if (e.target === pop) pop.close() })
  addEventListener('hashchange', () => { lerHash(); if (estado.modo === 'time') { aplicarModo(); atualizarTime(true) } else escolher(estado.sel) })
}

const ORDEM_CASAS = [[0, [3, 4, 2, 5, 1, 6]], [1, [3, 4, 2, 5, 1, 6, 0, 7]], [2, [3, 4, 2, 5, 1, 6, 0, 7]], [3, [3, 4, 2, 5]], [4, [3, 4, 2, 5]]].flatMap(([f, cols]) => cols.map((col) => ({ col, f })))
const bstDe = (e) => (e ? Object.values(e.base || {}).reduce((t, v) => t + (Number(v) || 0), 0) : null)
const ICO_TIME = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="8" cy="8" r="3"/><circle cx="16" cy="8" r="3"/><path d="M2.8 19.5c.6-3.2 2.6-5 5.2-5s4.6 1.8 5.2 5M10.8 19.5c.6-3.2 2.6-5 5.2-5s4.6 1.8 5.2 5"/></svg>'
const ICO_X = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M7 7l10 10M17 7 7 17"/></svg>'

const listaDe = (lado) => (lado === 'ini' ? estado.ini : estado.time)
const NOME_LADO = { nos: 'Seu time', ini: 'Inimigo' }
function membros(lado = 'nos') {
  return listaDe(lado).map((m, i) => {
    const e = especie(m.sp)
    const p = P.passivaDaEspecie(m.sp)
    return { ...m, i, lado, k: `${lado}:${i}`, e, p, x: p ? PORID.get(p.id) : null, bst: bstDe(e), tipos: e?.tipos || [] }
  })
}
function analisar(T) {
  const tem = (id) => T.filter((m) => m.p?.id === id)
  const insetos = T.filter((m) => m.tipos.includes('BUG'))
  const dragoes = T.filter((m) => m.tipos.includes('DRAGON'))
  const nomes = (l) => l.map((m) => m.e?.nome).filter(Boolean).join(', ')
  const alertas = []
  const rain = tem('rain_dance')
  if (rain.length) {
    const fora = T.filter((m) => m.bst > P.BST_MAX_PASSIVA && m.p?.id !== 'rain_dance')
    alertas.push({ id: 'rain_dance', estado: rain.length > 1 ? 'aviso' : 'ok', titulo: rain.length > 1 ? 'Rain Dance não soma' : `Rain Dance +${rain[0].x.n.pct}%`, detalhe: rain.length > 1 ? `${rain.length} no time, vale uma só` : `Dano e recarga para ${T.length - fora.length} do time` })
    if (fora.length) alertas.push({ id: 'rain_dance', estado: 'aviso', titulo: 'Fora da Rain Dance', detalhe: `${nomes(fora)} (BST acima de ${P.BST_MAX_PASSIVA})` })
  }
  const intim = tem('intimidate')
  if (intim.length) alertas.push(dragoes.length > 1 ? { id: 'intimidate', estado: 'off', titulo: 'Intimidate desligado', detalhe: `${dragoes.length} Dragões no time (megas contam)` } : { id: 'intimidate', estado: 'ok', titulo: 'Intimidate ativo', detalhe: `O outro lado causa ${intim[0].x.n.pct}% menos dano` })
  for (const m of tem('swarm')) {
    const n = insetos.filter((o) => o !== m).length
    alertas.push({ id: 'swarm', estado: 'ok', titulo: `Swarm +${Math.min(num(m.x.n.teto), num(m.x.n.pct) + n * num(m.x.n.porInseto))}%`, detalhe: `${m.e?.nome} · ${n} outro${n === 1 ? '' : 's'} Inseto${n === 1 ? '' : 's'}` })
  }
  if (tem('recover').length) {
    const fora = T.filter((m) => m.bst > P.BST_MAX_PASSIVA)
    if (fora.length) alertas.push({ id: 'recover', estado: 'aviso', titulo: 'Fora do Recover', detalhe: `${nomes(fora)} (BST acima de ${P.BST_MAX_PASSIVA})` })
  }
  return { insetos, dragoes, alertas, intimOk: dragoes.length <= 1 }
}

function aplicarModo() {
  const time = estado.modo === 'time'
  document.documentElement.classList.toggle('modo-time', time)
  document.querySelectorAll('[data-modo]').forEach((b) => { const on = b.dataset.modo === estado.modo; b.classList.toggle('ativo', on); b.setAttribute('aria-pressed', String(on)) })
}
function irParaTime() {
  if (estado.modo === 'time') return
  estado.modo = 'time'
  if (!estado.time.length) estado.time = TIME_EXEMPLO.map(([sp, col, f]) => ({ sp, col, f }))
  if (!estado.ini.length) estado.ini = INI_PADRAO.map(([sp, col, f]) => ({ sp, col, f }))
  aplicarModo()
  atualizarTime(true)
}
async function atualizarTime(comFade = false) {
  gravarHash()
  montarTimeLado()
  montarTimeInfo()
  const alvos = ['pas-cab', 'pas-passo', 'pas-time-info'].map($).filter(Boolean).concat(tabuleiro ? [tabuleiro.camada] : [])
  if (comFade && !reduzido.matches) {
    cena?.parar()
    await Promise.all(alvos.map((e) => e.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 160, fill: 'forwards' }).finished.catch(() => {})))
  }
  montarCabTime()
  iniciarCena(PORID.get(estado.sel))
  for (const e of alvos) { e.getAnimations().forEach((a) => a.cancel()); if (comFade && !reduzido.matches) e.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 280 }) }
}
function montarCabTime() {
  const N = membros('nos'), I = membros('ini')
  $('pas-palco').style.setProperty('--t', '#e2a93f')
  const ic = el('span', { class: 'pas-ic grande time', 'aria-hidden': 'true' })
  ic.innerHTML = ICO_TIME
  $('pas-cab').replaceChildren(ic, el('span', { class: 'pas-cab-txt' }, [
    el('h2', { text: 'Monte seu time' }),
    el('span', { class: 'pas-cab-chips' }, [
      el('span', { class: 'pt-chip', text: `Seu time ${N.length}/${TIME_MAX}` }),
      el('span', { class: 'pt-chip ini', text: `Inimigo ${I.length}/${TIME_MAX}` }),
      el('span', { class: 'pt-chip', text: `${[...N, ...I].filter((m) => m.p).length} com passiva` })
    ]),
  ]))
}
function chipPassiva(m) {
  return m.x ? el('span', { class: 'pas-achado-pas', style: `--t:${COR_TIPO[m.x.tipo]}` }, [comIcone(el('span', { class: 'pas-achado-ic', 'aria-hidden': 'true' }), m.x.id), m.x.nome]) : el('span', { class: 'pas-achado-pas nada', text: 'Sem passiva' })
}
function linhaMembro(m) {
  return el('div', { class: `pt-membro${estado.timeSel === m.k ? ' sel' : ''}`, 'data-k': m.k }, [
    el('span', { class: 'pas-pk-img' }, [imgSprite(lookDe(m.e, m.sh), m.sp)]),
    caixaShiny(m.e, m.sh, { 'data-shiny': m.k }),
    el('span', { class: 'pt-membro-txt' }, [el('b', { text: m.e?.nome || `#${m.sp}` }), el('small', { text: m.bst ? `BST ${m.bst} · alcance ${alcanceDe(m.e)}` : '' })]),
    chipPassiva(m),
    el('button', { type: 'button', class: 'pt-tirar', 'data-tirar': m.k, 'aria-label': `Tirar ${m.e?.nome || 'pokémon'}`, title: 'Tirar', html: ICO_X })
  ])
}
function montarTimeLado() {
  const lado = estado.lado
  const T = membros(lado)
  const vagas = Array.from({ length: TIME_MAX - T.length }, () => el('button', { type: 'button', class: 'pt-vaga', 'data-vaga': '', html: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M12 6v12M6 12h12"/></svg>Vaga livre' }))
  $('pt-lista').replaceChildren(...T.map(linhaMembro), ...vagas)
  for (const l of ['nos', 'ini']) {
    const b = document.querySelector(`[data-lado="${l}"]`)
    b.classList.toggle('ativo', l === lado)
    b.setAttribute('aria-selected', String(l === lado))
    b.querySelector('em').textContent = `${listaDe(l).length}/${TIME_MAX}`
  }
  document.querySelector('.pt-lado').classList.toggle('ini', lado === 'ini')
  $('pt-exemplo').textContent = lado === 'ini' ? 'Ditto' : 'Exemplo'
  $('pt-exemplo').title = lado === 'ini' ? 'Voltar aos 5 Ditto de teste' : 'Carregar um time de exemplo'
  const cheio = T.length >= TIME_MAX
  $('pt-busca').disabled = cheio
  $('pt-busca').placeholder = cheio ? `${NOME_LADO[lado]} cheio (5 pokémon)` : lado === 'ini' ? 'Adicionar pokémon ao inimigo' : 'Adicionar pokémon ao seu time'
}
function blocoRegras(titulo, T) {
  const { alertas } = analisar(T)
  if (!alertas.length) return [el('h3', {}, [titulo]), el('p', { class: 'pt-ok', text: T.length ? 'Nenhuma regra limitando as passivas.' : 'Sem pokémon.' })]
  return [el('h3', {}, [titulo]), el('ul', { class: 'pt-alertas' }, alertas.map((a) => el('li', { class: `pt-linha pt-regra ${a.estado}` }, [comIcone(el('span', { class: 'pt-linha-ic', 'aria-hidden': 'true' }), a.id), el('span', { class: 'pt-regra-txt' }, [el('b', { text: a.titulo }), el('small', { text: a.detalhe })]), el('span', { class: 'pt-estado', text: { ok: 'Ativo', aviso: 'Atenção', off: 'Desligado' }[a.estado] })])))]
}
function montarTimeInfo() {
  const N = membros('nos'), I = membros('ini')
  const T = estado.lado === 'ini' ? I : N
  const itens = T.map((m) => el('li', { class: 'pt-linha' }, [
    el('span', { class: 'pt-linha-ic sprite' }, [imgSprite(lookDe(m.e, m.sh), m.sp)]),
    el('span', {}, [el('b', { text: m.e?.nome || '' }), ' ', el('span', { class: 'pt-info-pas', text: m.x ? `${m.x.nome}: ${m.x.curto}` : 'Sem passiva: luta só com os golpes.' })])
  ]))
  $('pas-time-info').replaceChildren(
    ...blocoRegras('Regras do seu time', N),
    ...(I.some((m) => m.p) ? blocoRegras('Regras do inimigo', I) : []),
    el('h3', {}, [estado.lado === 'ini' ? 'Cada inimigo' : 'Cada um do seu time']),
    T.length ? el('ul', { class: 'pt-info' }, itens) : el('p', { class: 'pt-ok', text: 'Sem pokémon.' })
  )
}
function adicionarAoTime(sp, sh = false) {
  const lista = listaDe(estado.lado)
  if (lista.length >= TIME_MAX) return
  const livre = ORDEM_CASAS.find((c) => !lista.some((m) => m.col === c.col && m.f === c.f))
  if (!livre) return
  lista.push({ sp, ...livre, sh: sh && temShiny(especie(sp)) })
  som('clique', { forca: 0.6 })
  atualizarTime(true)
}
const parteK = (k) => { const [lado, i] = k.split(':'); return { lado, i: Number(i) } }
function alternarShiny(k) {
  const { lado, i } = parteK(k)
  const m = listaDe(lado)[i]
  if (!m) return
  const e = especie(m.sp)
  if (!temShiny(e)) return
  m.sh = !m.sh
  som('clique', { forca: 0.6 })
  montarTimeLado()
  montarTimeInfo()
  document.querySelectorAll(`.pas-peca[data-k="${k}"] .pas-peca-img`).forEach((s) => s.replaceChildren(imgSprite(lookDe(e, m.sh), m.sp)))
}
function moverMembro(k, col, f) {
  const { lado, i } = parteK(k)
  const lista = listaDe(lado)
  const m = lista[i]
  if (!m || !valida(col, f)) return false
  const outro = lista.findIndex((o) => o.col === col && o.f === f)
  if (outro === i) return false
  if (outro >= 0) { lista[outro].col = m.col; lista[outro].f = m.f }
  m.col = col; m.f = f
  return true
}
function trocarLado(lado) {
  if (estado.lado === lado) return
  estado.lado = lado
  estado.timeSel = null
  montarTimeLado()
  montarTimeInfo()
}
function ligarTime() {
  document.querySelectorAll('[data-modo]').forEach((b) => b.addEventListener('click', () => { if (b.dataset.modo === 'time') irParaTime(); else escolher(estado.sel) }))
  document.querySelectorAll('[data-lado]').forEach((b) => b.addEventListener('click', () => trocarLado(b.dataset.lado)))
  $('pt-lista').addEventListener('click', (e) => {
    if (e.target.closest('[data-vaga]')) { $('pt-busca').focus(); return }
    const s = e.target.closest('[data-shiny]')
    if (s) { if (!s.disabled) alternarShiny(s.dataset.shiny); return }
    const t = e.target.closest('[data-tirar]')
    if (t) { const { lado, i } = parteK(t.dataset.tirar); listaDe(lado).splice(i, 1); estado.timeSel = null; return atualizarTime(true) }
    const m = e.target.closest('.pt-membro[data-k]')
    if (m) { estado.timeSel = estado.timeSel === m.dataset.k ? null : m.dataset.k; montarTimeLado(); marcarSel() }
  })
  $('pt-exemplo').addEventListener('click', () => {
    if (estado.lado === 'ini') estado.ini = INI_PADRAO.map(([sp, col, f]) => ({ sp, col, f, sh: false }))
    else estado.time = TIME_EXEMPLO.map(([sp, col, f]) => ({ sp, col, f, sh: false }))
    estado.timeSel = null
    atualizarTime(true)
  })
  $('pt-copiar').addEventListener('click', () => {
    const bt = $('pt-copiar'), rot = bt.querySelector('span')
    if (bt.classList.contains('gerando')) return
    bt.classList.add('gerando'); rot.textContent = 'Gerando prévia…'
    som('clique', { forca: 0.6 })
    const promessa = previaMod.then((m) => m.linkCurto(`M${m.origem()}_${codigoTime(estado.time)}_${codigoTime(estado.ini)}`, () => desenharTime(m), linkDoTime())).catch(() => linkDoTime())
    previaMod.then((m) => m.copiarTexto(promessa)).catch(() => promessa).finally(() => {
      bt.classList.remove('gerando'); bt.classList.add('ok'); rot.textContent = 'Link copiado'
      setTimeout(() => { bt.classList.remove('ok'); rot.textContent = 'Copiar link' }, 2200)
    })
  })
  $('pt-limpar').addEventListener('click', () => { listaDe(estado.lado).length = 0; estado.timeSel = null; atualizarTime(true) })
  $('pas-tab').addEventListener('click', (e) => {
    if (estado.modo !== 'time' || ignorarClique) return
    const pc = e.target.closest('.pas-peca[data-k]')
    if (pc) { const k = pc.dataset.k; trocarLado(parteK(k).lado); estado.timeSel = estado.timeSel === k ? null : k; montarTimeLado(); marcarSel(); return }
    const casa = e.target.closest('.pas-casa[data-k]')
    if (!casa || !estado.timeSel) return
    const [lado, col, f] = casa.dataset.k.split(':').map((v, i) => (i ? Number(v) : v))
    if (lado !== parteK(estado.timeSel).lado) return
    const k = estado.timeSel
    estado.timeSel = null
    if (moverMembro(k, col, f)) { som('passo', { forca: 0.7 }); atualizarTime(true) } else { montarTimeLado(); marcarSel() }
  })
  const campo = $('pt-busca'), caixa = $('pt-achados')
  const shinyBusca = new Set()
  const fechar = () => { caixa.hidden = true; caixa.replaceChildren() }
  const pintar = () => {
    const q = campo.value
    if (!normal(q) || !motorPronto) return fechar()
    let achados = []
    try { achados = motorPronto.buscarEspecies(q, 8) } catch {}
    caixa.replaceChildren(...(achados.length ? achados.map((a) => {
      const pas = P.passivaDaEspecie(a.speciesId)
      const x = pas ? PORID.get(pas.id) : null
      const e = especie(a.speciesId)
      const sh = shinyBusca.has(a.speciesId) && temShiny(e)
      return el('div', { class: 'pas-achado', role: 'option', 'data-sp': String(a.speciesId), style: x ? `--t:${COR_TIPO[x.tipo]}` : null }, [
        el('span', { class: 'pas-pk-img' }, [imgSprite(e ? lookDe(e, sh) : a.looktype, a.speciesId)]),
        caixaShiny(e, sh, { 'data-shiny-busca': String(a.speciesId) }),
        el('span', { class: 'pas-achado-txt' }, [el('b', { text: a.nome }), el('small', { text: `BST ${bstDe(especie(a.speciesId)) ?? '?'} · alcance ${alcanceDe(especie(a.speciesId))}` })]),
        x ? el('span', { class: 'pas-achado-pas' }, [comIcone(el('span', { class: 'pas-achado-ic', 'aria-hidden': 'true' }), x.id), x.nome]) : el('span', { class: 'pas-achado-pas nada', text: 'Sem passiva' })
      ])
    }) : [el('p', { class: 'pas-achados-vazio', text: 'Nenhum pokémon com esse nome.' })]))
    caixa.hidden = false
  }
  campo.addEventListener('input', pintar)
  campo.addEventListener('focus', pintar)
  campo.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') fechar()
    if (e.key === 'Enter') { const b = caixa.querySelector('[data-sp]'); if (b) { e.preventDefault(); adicionar(Number(b.dataset.sp)); fechar() } }
  })
  const adicionar = (sp) => { adicionarAoTime(sp, shinyBusca.has(sp)); shinyBusca.clear(); campo.value = '' }
  caixa.addEventListener('mousedown', (e) => e.preventDefault())
  caixa.addEventListener('click', (e) => {
    const s = e.target.closest('[data-shiny-busca]')
    if (s) {
      const sp = Number(s.dataset.shinyBusca)
      if (!s.disabled) { if (shinyBusca.has(sp)) shinyBusca.delete(sp); else shinyBusca.add(sp); som('clique', { forca: 0.5 }); pintar() }
      return
    }
    const b = e.target.closest('[data-sp]')
    if (b) { adicionar(Number(b.dataset.sp)); fechar(); campo.focus() }
  })
  campo.addEventListener('blur', () => setTimeout(fechar, 120))
}

function desenharFormacao(c) {
  const unidades = []
  for (const lado of ['nos', 'ini']) for (const m of membros(lado)) {
    const papel = lado === 'nos' ? (m.p ? 'dono' : 'aliado sem-passiva') : (m.p ? 'teste com-passiva' : 'teste')
    const pc = c.peca(lado, m.col, m.f, { sp: m.sp, lt: lookDe(m.e, m.sh), papel })
    pc.n.dataset.k = m.k
    if (m.x) pc.n.style.setProperty('--t', COR_TIPO[m.x.tipo])
    unidades.push({ pc, m })
  }
  return unidades
}

let ignorarClique = false
function ligarArraste() {
  const tab = $('pas-tab')
  let arr = null
  const casasDo = (lado) => [...tabuleiro.casas.entries()].filter(([k]) => k.startsWith(`${lado}:`))
  const maisPerto = (lado, cx, cy) => {
    let melhor = null
    for (const [k, c] of casasDo(lado)) {
      const d = Math.hypot(c.offsetLeft + c.offsetWidth / 2 - cx, c.offsetTop + c.offsetHeight / 2 - cy)
      if (!melhor || d < melhor.d) melhor = { k, c, d }
    }
    return melhor
  }
  const limites = (lado) => {
    const cs = casasDo(lado).map(([, c]) => c)
    return { x0: Math.min(...cs.map((c) => c.offsetLeft)), y0: Math.min(...cs.map((c) => c.offsetTop)), x1: Math.max(...cs.map((c) => c.offsetLeft + c.offsetWidth)), y1: Math.max(...cs.map((c) => c.offsetTop + c.offsetHeight)) }
  }
  const pontoNoTab = (e) => { const r = tab.getBoundingClientRect(); return { x: e.clientX - r.left - tab.clientLeft, y: e.clientY - r.top - tab.clientTop } }
  tab.addEventListener('pointerdown', (e) => {
    if (estado.modo !== 'time' || e.button > 0) return
    const pc = e.target.closest('.pas-peca[data-k]')
    if (!pc) return
    e.preventDefault()
    arr = { k: pc.dataset.k, lado: parteK(pc.dataset.k).lado, x0: e.clientX, y0: e.clientY, mov: false, id: e.pointerId }
    try { tab.setPointerCapture(e.pointerId) } catch {}
  })
  tab.addEventListener('pointermove', (e) => {
    if (!arr || e.pointerId !== arr.id) return
    if (!arr.mov) {
      if (Math.hypot(e.clientX - arr.x0, e.clientY - arr.y0) < 5) return
      arr.mov = true
      cena?.parar()
      const c = new Cena(PORID.get(estado.sel), true)
      cena = c
      c.legendaRapida('Posicionando')
      desenharFormacao(c)
      const p = c.pecas.find((q) => q.n.dataset.k === arr.k)
      if (!p) { arr = null; return }
      arr.p = p
      arr.lim = limites(arr.lado)
      arr.w = p.n.offsetWidth
      const pt = pontoNoTab(e)
      arr.ox = pt.x - p.n.offsetLeft
      arr.oy = pt.y - p.n.offsetTop
      p.n.classList.add('arrastando')
      tab.classList.add('com-arraste')
    }
    const pt = pontoNoTab(e)
    const L = arr.lim
    const x = Math.max(L.x0, Math.min(L.x1 - arr.w, pt.x - arr.ox))
    const y = Math.max(L.y0, Math.min(L.y1 - arr.w, pt.y - arr.oy))
    arr.p.n.style.left = `${x}px`
    arr.p.n.style.top = `${y}px`
    const alvo = maisPerto(arr.lado, x + arr.w / 2, y + arr.w / 2)
    if (arr.alvo !== alvo?.c) { arr.alvo?.classList.remove('alvo-drop'); arr.alvo = alvo?.c; arr.alvoK = alvo?.k; arr.alvo?.classList.add('alvo-drop') }
  })
  const soltar = async (e, cancelou) => {
    if (!arr || e.pointerId !== arr.id) return
    const a = arr
    arr = null
    tab.classList.remove('com-arraste')
    if (!a.mov) return
    ignorarClique = true
    setTimeout(() => { ignorarClique = false }, 0)
    a.alvo?.classList.remove('alvo-drop')
    let mudou = false
    if (!cancelou && a.alvoK) {
      const [, col, f] = a.alvoK.split(':').map((v, i) => (i ? Number(v) : v))
      const c0 = a.alvo
      if (a.p && !reduzido.matches) await a.p.n.animate([{ left: a.p.n.style.left, top: a.p.n.style.top }, { left: `${c0.offsetLeft}px`, top: `${c0.offsetTop}px` }], { duration: 140, easing: 'ease-out', fill: 'forwards' }).finished.catch(() => {})
      mudou = moverMembro(a.k, col, f)
      if (mudou) som('passo', { forca: 0.7 })
    }
    estado.timeSel = null
    trocarLado(a.lado)
    atualizarTime(true)
  }
  tab.addEventListener('pointerup', (e) => soltar(e, false))
  tab.addEventListener('pointercancel', (e) => soltar(e, true))
  tab.addEventListener('lostpointercapture', (e) => { if (arr && e.pointerId === arr.id) soltar(e, true) })
}
function marcarSel() {
  for (const p of cena?.pecas || []) if (p.n.dataset.k) p.n.classList.toggle('sel', p.n.dataset.k === estado.timeSel)
  document.documentElement.classList.toggle('pt-movendo', estado.timeSel != null)
  document.documentElement.dataset.movendo = estado.timeSel ? parteK(estado.timeSel).lado : ''
}

const distCasa = (a, b) => Math.max(Math.abs(a.col - b.col), Math.abs(yDe(a.lado, a.f) - yDe(b.lado, b.f)))
const ICONE_CICLO = { burn: '🔥', poison: '☠️', freeze: '❄️', paralyze: '⚡', leech_seed: '🌱', confusion: '💫', fear: '👻', rock_smash: '👊', whirlwind: '🌪️', assurance: '🌑', charm: '💗' }
const COR_CICLO = { burn: COR.fogo, poison: COR.veneno, freeze: COR.gelo, paralyze: COR.raio, leech_seed: COR.planta, confusion: COR.psi, fear: COR.fantasma, rock_smash: COR.luta, whirlwind: COR.vento, assurance: COR.sombra, charm: COR.fada }
const alcanceDe = (e) => {
  if (!e?.base) return 1
  const folga = Number(e.base.spAtk) - Math.max(Number(e.base.atk) || 0, Number(e.base.hp) || 0)
  return alcanceDaFolga(folga)
}
const mundo = (u) => ({ x: u.pc.col, y: yDe(u.pc.lado, u.pc.f) })
const daMundo = (x, y) => (y >= 13 ? { lado: 'nos', col: x, f: y - 13 } : { lado: 'ini', col: x, f: 12 - y })
const celulaOk = (x, y) => { const c = daMundo(x, y); return y >= 8 && y <= 17 && valida(c.col, c.f) }
const distU = (a, b) => { const p = mundo(a), q = mundo(b); return Math.max(Math.abs(p.x - q.x), Math.abs(p.y - q.y)) }

async function cenaTime(c) {
  c.dono = null
  const N = membros('nos'), I = membros('ini')
  const pecas = desenharFormacao(c)
  marcarSel()
  if (!N.length || !I.length) { await c.legenda(!N.length ? 'Adicione ao seu time' : 'Adicione inimigos'); await c.espera(4000); return }
  const lados = { nos: analisar(N), ini: analisar(I) }
  const rainDe = { nos: N.some((m) => m.p?.id === 'rain_dance'), ini: I.some((m) => m.p?.id === 'rain_dance') }
  const unid = pecas.map(({ pc, m }) => {
    const L = lados[m.lado]
    const swarm = m.p?.id === 'swarm' ? Math.min(num(m.x.n.teto), num(m.x.n.pct) + L.insetos.filter((o) => o !== m).length * num(m.x.n.porInseto)) / 100 : 0
    const chuva = rainDe[m.lado] && (m.p?.id === 'rain_dance' || m.bst <= P.BST_MAX_PASSIVA) ? 0.2 : 0
    return { pc, m, time: m.lado === 'nos', id: m.p?.id || null, alc: alcanceDe(m.e), vivo: true, mult: 1 + chuva + swarm, chuva: !!chuva, defesa: m.p?.id === 'iron_defense' ? 1 / 1.35 : 1, cavar: m.p?.id === 'dig', curaPronta: m.p?.id === 'recover', ef: {} }
  })
  const nos = unid.filter((u) => u.time), eles = unid.filter((u) => !u.time)
  const ocupado = (x, y) => unid.some((u) => u.vivo && mundo(u).x === x && mundo(u).y === y)
  const inimigosDe = (u) => (u.time ? eles : nos).filter((o) => o.vivo)
  const aliadosDe = (u) => (u.time ? nos : eles).filter((o) => o.vivo && o !== u)
  const maisPerto = (u, lista) => [...lista].sort((a, b) => distU(u, a) - distU(u, b) || mundo(a).x - mundo(b).x)[0]
  const passo = (u, alvo, longe = false) => {
    const p = mundo(u), q = mundo(alvo)
    const d0 = Math.max(Math.abs(p.x - q.x), Math.abs(p.y - q.y))
    let melhor = null
    for (const dx of [0, -1, 1]) for (const dy of [-1, 0, 1]) {
      if (!dx && !dy) continue
      const x = p.x + dx, y = p.y + dy
      if (!celulaOk(x, y) || ocupado(x, y)) continue
      const d = Math.max(Math.abs(x - q.x), Math.abs(y - q.y))
      const e = Math.hypot(x - q.x, y - q.y)
      const nota = longe ? -d * 10 - e : d * 10 + e
      if ((longe ? d > d0 : d < d0) && (!melhor || nota < melhor.nota)) melhor = { x, y, nota }
    }
    return melhor
  }
  const caiu = (u) => {
    if (!u.vivo) return
    u.vivo = false
    c.texto(u.pc, 'caiu', 'nada')
    u.pc.n.animate([{ opacity: 1, transform: 'scale(1)' }, { opacity: 0, transform: 'scale(.6)' }], { duration: c.ms(420) || 1, fill: 'forwards' })
  }
  const dano = (alvo, v, de = null) => {
    if (!alvo.vivo) return
    const d = Math.round(v * alvo.defesa * (alvo.ef.gelo ? 1.2 : 1) * (alvo.ef.quebrado ? 1.2 : 1))
    c.texto(alvo.pc, `−${d}%`)
    c.vida(alvo.pc, alvo.pc.hp - d)
    if (de && alvo.id === 'rocky_helmet' && de.vivo) { const r = Math.max(1, Math.round(d * 0.2)); setTimeout(() => { if (!de.vivo) return; c.texto(de.pc, `−${r}%`, 'refl'); c.vida(de.pc, de.pc.hp - r); if (de.pc.hp <= 0) caiu(de) }, c.ms(250)) }
    if (alvo.pc.hp <= 0) caiu(alvo)
  }

  await c.legenda('Início')
  for (const lado of ['nos', 'ini']) if (rainDe[lado]) c.efeito('chuva', lado)
  if (rainDe.nos || rainDe.ini) som('chuva', { forca: 0.6 })
  for (const u of unid) {
    if (!u.id && !u.chuva) continue
    await c.espera(180)
    if (u.mult > 1) { c.aura(u.pc, u.chuva ? COR.agua : COR.inseto); c.texto(u.pc, `+${Math.round((u.mult - 1) * 100)}% dano`, 'buff') }
    if (u.id === 'iron_defense') { c.marca(u.pc, 'escudo'); c.texto(u.pc, `+${pct(u.m.x.n.pct)} DEF`, 'buff') }
    if (u.id === 'rocky_helmet') c.aura(u.pc, COR.pedra)
    if (u.id === 'intimidate') {
      if (lados[u.m.lado].intimOk) { c.onda(u.pc, COR.dragao); som('rugido', { forca: 0.6 }); for (const e of (u.time ? eles : nos)) { e.mult *= 0.8; c.texto(e.pc, '−20% dano', 'deb') } }
      else c.texto(u.pc, 'desligado', 'nada')
    }
  }
  await c.espera(1300)

  const cicloPassiva = async (u) => {
    const id = u.id
    if (id === 'dig') { u.cavar = true; return }
    if (id === 'recover') { u.curaPronta = true; return }
    if (!id || !ICONE_CICLO[id]) return
    const lista = inimigosDe(u)
    if (!lista.length) return
    const alvo = id === 'charm' ? [...lista].sort((a, b) => distU(u, b) - distU(u, a))[0] : (u.alvo?.vivo ? u.alvo : maisPerto(u, lista))
    som(SOM_PASSIVA[id], { forca: 0.5 })
    await c.golpe(u.pc, alvo.pc, ICONE_CICLO[id], 480, { cor: COR_CICLO[id] })
    if (!alvo.vivo) return
    c.status(alvo.pc, id)
    const n = u.m.x.n
    if (id === 'burn') alvo.ef.dot = { v: num(n.pct), r: 3, de: u, cor: COR.fogo }
    if (id === 'poison') alvo.ef.dot = { v: num(n.pct), r: 4, de: u, cor: COR.veneno }
    if (id === 'leech_seed') alvo.ef.dot = { v: num(n.pct), r: 4, de: u, cor: COR.planta, cura: true }
    if (id === 'freeze') { alvo.ef.gelo = 1; c.marca(alvo.pc, 'gelo') }
    if (id === 'paralyze') { alvo.ef.para = 3; c.marca(alvo.pc, 'choque') }
    if (id === 'confusion') alvo.ef.conf = true
    if (id === 'fear') { alvo.ef.medo = 2; c.marca(alvo.pc, 'medo') }
    if (id === 'rock_smash') { alvo.ef.quebrado = 4; c.marca(alvo.pc, 'quebrado') }
    if (id === 'assurance') dano(alvo, num(n.pct) + (100 - alvo.pc.hp) * num(n.faltando) / 100, u)
    if (id === 'whirlwind' || id === 'charm') {
      dano(alvo, num(n.pct), u)
      if (!alvo.vivo) return
      const q = mundo(alvo)
      let dest = null
      if (id === 'whirlwind') { const dir = alvo.time ? 1 : -1; let y = q.y; while (celulaOk(q.x, y + dir) && !ocupado(q.x, y + dir)) y += dir; if (y !== q.y) dest = { x: q.x, y } }
      else {
        const frente = alvo.time ? 13 : 12
        const cols = []
        for (let x = 0; x < 8; x++) if (celulaOk(x, frente) && !ocupado(x, frente)) cols.push(x)
        if (cols.length) dest = { x: cols.sort((a, b) => Math.abs(a - mundo(u).x) - Math.abs(b - mundo(u).x))[0], y: frente }
      }
      if (dest) { const k = daMundo(dest.x, dest.y); await c.moverPara(alvo.pc, k.lado, k.col, k.f, id === 'charm' ? 820 : 620, id === 'charm' ? 1 : 0) }
    }
  }

  let rodada = 0
  while (rodada < 16 && nos.some((u) => u.vivo) && eles.some((u) => u.vivo)) {
    rodada++
    const ciclo = rodada % 4 === 1
    c.legendaRapida(ciclo ? `Rodada ${rodada}: ${rodada === 1 ? 'as passivas de ciclo disparam.' : 'novo ciclo, as passivas disparam de novo.'}` : `Rodada ${rodada}: quem alcança ataca, quem não alcança avança.`)
    if (ciclo) { await Promise.all(unid.filter((u) => u.vivo && u.id).map((u, k) => (async () => { await c.espera(k * 140); await cicloPassiva(u) })())); await c.espera(350) }
    const moves = [], ataques = []
    for (const u of unid.filter((v) => v.vivo)) {
      if (u.ef.gelo) { u.ef.gelo--; if (!u.ef.gelo) c.marca(u.pc, 'gelo', false); continue }
      const lista = inimigosDe(u)
      if (!lista.length) continue
      const alvo = maisPerto(u, lista)
      u.alvo = alvo
      if (u.ef.medo) {
        u.ef.medo--
        const s = passo(u, alvo, true)
        if (s) { const k = daMundo(s.x, s.y); moves.push([u, { ...k, de: { lado: u.pc.lado, col: u.pc.col, f: u.pc.f } }]); u.pc.col = k.col; u.pc.f = k.f; u.pc.lado = k.lado }
        if (!u.ef.medo) c.marca(u.pc, 'medo', false)
        continue
      }
      if (distU(u, alvo) <= u.alc) ataques.push([u, alvo])
      else {
        const s = passo(u, alvo)
        if (s) { const k = daMundo(s.x, s.y); moves.push([u, { ...k, de: { lado: u.pc.lado, col: u.pc.col, f: u.pc.f } }]); u.pc.col = k.col; u.pc.f = k.f; u.pc.lado = k.lado }
      }
    }
    if (moves.length) {
      for (const [u, k] of moves) { u.pc.lado = k.de.lado; u.pc.col = k.de.col; u.pc.f = k.de.f }
      await Promise.all(moves.map(([u, k]) => c.moverPara(u.pc, k.lado, k.col, k.f, 360)))
    }
    await Promise.all(ataques.map(([u, alvo], k) => (async () => {
      await c.espera(k * 70)
      if (!u.vivo) return
      if (u.ef.para) { u.ef.para--; const falhou = rodada % 2 === 0; if (!u.ef.para) c.marca(u.pc, 'choque', false); if (falhou) { c.texto(u.pc, 'Falhou!', 'nada'); return } }
      let quem = alvo
      if (u.ef.conf) { u.ef.conf = false; const al = maisPerto(u, aliadosDe(u)); if (al) { quem = al; c.texto(u.pc, 'Confuso!', 'nada') } c.status(u.pc, '') }
      if (!quem.vivo) return
      if (quem.cavar && quem !== u) {
        await c.golpe(u.pc, quem.pc, '✦', 380, { cor: '#ffb3ba', passa: true })
        quem.cavar = false; c.texto(quem.pc, 'Esquivou!', 'nada')
        return
      }
      if (u.alc > 1) await c.golpe(u.pc, quem.pc, '✦', 380, { cor: u.time ? '#ffe9a3' : '#ffb3ba' })
      else { await c.investida(u.pc, quem.pc, 320); c.impacto(quem.pc, u.time ? '#ffe9a3' : '#ffb3ba', 0.6) }
      dano(quem, 9 * u.mult, u)
    })()))
    for (const u of unid.filter((v) => v.vivo && v.ef.dot)) {
      const d = u.ef.dot
      dano(u, d.v * 2)
      c.particulas(u.pc, d.cor, 4, 'sobe')
      if (d.cura && d.de.vivo) { c.vida(d.de.pc, d.de.pc.hp + d.v * 2); c.texto(d.de.pc, `+${d.v * 2}%`, 'cura') }
      if (!--d.r) { u.ef.dot = null; c.status(u.pc, '') }
    }
    for (const u of unid.filter((v) => v.ef.quebrado)) if (!--u.ef.quebrado) c.marca(u.pc, 'quebrado', false)
    for (const r of unid.filter((u) => u.vivo && u.curaPronta)) {
      const ferido = (r.time ? nos : eles).filter((o) => o.vivo && o.pc.hp <= 50 && (o === r || o.m.bst <= P.BST_MAX_PASSIVA)).sort((a, b) => a.pc.hp - b.pc.hp)[0]
      if (!ferido) continue
      r.curaPronta = false
      await c.golpe(r.pc, ferido.pc, '💚', 420, { classe: 'cura' })
      c.vida(ferido.pc, ferido.pc.hp + num(r.m.x.n.pct)); c.texto(ferido.pc, `+${pct(r.m.x.n.pct)}`, 'cura')
    }
    await c.espera(420)
  }
  const vNos = nos.some((u) => u.vivo), vIni = eles.some((u) => u.vivo)
  await c.legenda(vNos && !vIni ? `Seu time venceu · ${rodada} rodadas` : vIni && !vNos ? `Inimigo venceu · ${rodada} rodadas` : 'Tempo esgotado')
  await c.espera(2200)
}

async function precarregar() {
  const carga = $('pas-carga'), barra = carga.querySelector('em'), txt = carga.querySelector('b')
  const avanca = (f, t) => { barra.style.transform = `scaleX(${Math.max(0.04, Math.min(1, f))})`; if (t) txt.textContent = t }
  avanca(0.05, 'Carregando os pokémon…')
  try {
    motorPronto = await import('../calculadora/motor.js').then(async (m) => { await m.carregar((f) => avanca(0.05 + f * 0.6)); return m })
    motor = Promise.resolve(motorPronto)
  } catch {}
  avanca(0.68, 'Carregando sprites…')
  const sps = new Set([DITTO, DRAGONITE])
  for (const x of LISTA) { const c = casterPadrao(x); if (c != null) sps.add(c) }
  for (const s of PORID.get('swarm').especies.filter((s) => especie(s)).slice(0, 3)) sps.add(s)
  const lista = [...sps]
  let feitos = 0
  await Promise.all(lista.map((sp) => new Promise((ok) => {
    const img = imgSprite(especie(sp)?.looktype, sp)
    const fim = () => { feitos++; avanca(0.68 + (feitos / lista.length) * 0.27); ok() }
    if (img.complete && img.naturalWidth) return fim()
    img.addEventListener('load', fim, { once: true })
    img.addEventListener('error', () => setTimeout(() => (img.complete ? fim() : null), 50), { once: true })
    setTimeout(fim, 6000)
  })))
  await Promise.race([document.fonts?.ready, new Promise((ok) => setTimeout(ok, 1500))])
  await somPronto
  avanca(1, 'Pronto')
  pronto = true
  montarQuemTem(PORID.get(estado.sel))
  if (estado.modo === 'time') { montarTimeLado(); montarTimeInfo(); montarCabTime() }
  iniciarCena(PORID.get(estado.sel))
  const some = () => carga.remove()
  if (reduzido.matches) some()
  else carga.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 350, delay: 150, easing: 'ease-out', fill: 'forwards' }).finished.then(some, some)
}

lerHash()
if (estado.modo === 'time') gravarHash()
ligar()
ligarTime()
ligarArraste()
aplicarModo()
montarCiclo()
montarLista()
montarDetalhe()
tabuleiro ??= montarTabuleiro(true)
requestAnimationFrame(() => pintarBola(tabuleiro.tab))
document.addEventListener('visibilitychange', () => { document.documentElement.classList.toggle('pas-oculta', document.hidden) })
new IntersectionObserver((it) => { palcoVisivel = it[0].isIntersecting; $('pas-palco').classList.toggle('fora-da-tela', !palcoVisivel) }).observe($('pas-palco'))
precarregar()
