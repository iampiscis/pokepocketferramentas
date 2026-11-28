const SPRITES = '../calculadora/jogo/sprites-png/'
const BOLA = '../assets/pokebola.svg'
const FILEIRAS = [[12, 17], [11, 18], [11, 18], [13, 16], [13, 16]]
const CASAS = (() => {
  const l = []
  FILEIRAS.forEach(([de, ate], fileira) => { for (let cx = de; cx <= ate; cx++) l.push({ casa: l.length, fileira, cx }) })
  return l
})()
const fmt = new Intl.NumberFormat('pt-BR')
const fmtDia = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit' })
const fmtHora = new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' })
const ehNum = (v) => v != null && v !== '' && Number.isFinite(Number(v))
const $ = (id) => document.getElementById(id)
const ICO = {
  semana: '<rect x="3.5" y="5" width="17" height="15" rx="3"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
  topo: '<path d="M8 3.5h8V9a4 4 0 0 1-8 0zM12 13v3.5M8.5 20.5h7M8 5.5H5.5c0 2.6 1.2 4 3 4.3M16 5.5h2.5c0 2.6-1.2 4-3 4.3"/>',
  formacoes: '<rect x="3.5" y="3.5" width="17" height="17" rx="3"/><path d="M3.5 9.2h17M3.5 14.8h17M9.2 3.5v17M14.8 3.5v17"/>',
  hora: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
  espada: '<path d="M20 4l-1.2 4.6L9.6 17.8 6.2 14.4 15.4 5.2z"/><path d="M5 13.2l5.8 5.8M7.6 16.4 4 20"/>',
  arco: '<path d="M6.5 4.2c7.3.3 13 6 13.3 13.3"/><path d="M6.5 4.2 19.8 17.5"/><path d="M4 20 15.6 8.4M15.6 8.4h-3.7M15.6 8.4v3.7M4 20h2.6M4 20v-2.6"/>',
  usados: '<path d="M5 20v-6M12 20V5M19 20v-9"/>',
  pontos: '<path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z"/>',
  vitorias: '<circle cx="12" cy="12" r="8.5"/><path d="M8 12.5l2.7 2.7L16.5 9"/>',
  frente: '<path d="M12 19V5M6.5 10.5 12 5l5.5 5.5"/>',
  pokebola: '<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h5.5M15 12h5.5"/><circle cx="12" cy="12" r="3"/>',
  busca: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m15.5 15.5 5 5"/>',
  link: '<path d="M10 14a4.5 4.5 0 0 0 6.4 0l3-3a4.5 4.5 0 0 0-6.4-6.4l-1.2 1.2"/><path d="M14 10a4.5 4.5 0 0 0-6.4 0l-3 3a4.5 4.5 0 0 0 6.4 6.4l1.2-1.2"/>'
}

function el(tag, attrs = {}, filhos = []) {
  const n = document.createElement(tag)
  for (const [k, v] of Object.entries(attrs)) {
    if (v == null || v === false) continue
    if (k === 'text') n.textContent = v
    else if (k === 'class') n.className = v
    else n.setAttribute(k, v === true ? '' : v)
  }
  for (const f of [].concat(filhos)) if (f != null && f !== false) n.append(f)
  return n
}
function ico(nome) {
  const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  s.setAttribute('viewBox', '0 0 24 24'); s.setAttribute('fill', 'none'); s.setAttribute('stroke', 'currentColor')
  s.setAttribute('stroke-width', '2.1'); s.setAttribute('stroke-linecap', 'round'); s.setAttribute('stroke-linejoin', 'round'); s.setAttribute('aria-hidden', 'true')
  s.innerHTML = ICO[nome]
  return s
}
function sprite(p) {
  const img = el('img', { alt: '', loading: 'lazy', decoding: 'async' })
  const t = looksTier.get(Number(p.speciesId))
  const tentativas = [...new Set([p.looktype, p.shiny ? t?.shiny : null, t?.normal, 60000 + Number(p.speciesId)].filter(ehNum).map(Number))].map((l) => `${SPRITES}${l}.png`)
  const proxima = () => {
    const url = tentativas.shift()
    if (url) img.src = url
    else { img.onerror = null; img.src = BOLA; img.className = 'bola' }
  }
  img.onerror = proxima
  proxima()
  return img
}
const zona = (casa) => { const f = CASAS[casa]?.fileira ?? 0; return f === 0 ? 'frente' : f <= 2 ? 'meio' : 'fundo' }
const alcance = (a) => (a > 1 ? `alcance ${a}` : 'corpo a corpo')
function indicador(icone, texto, titulo) {
  return el('li', { class: `ind ind-${icone}`, title: titulo || null }, [ico(icone), el('span', { text: texto })])
}

let dados = null
let tiers = new Map()
let looksTier = new Map()
const COR_TIER = { 'S+': '#ff6fae', S: '#ff7676', 'S-': '#b495ff', 'A+': '#f5b13d', A: '#ffa25a', 'A-': '#ffd95e', 'B+': '#8c93f0', B: '#5f9ad6', 'B-': '#3fd4c6', C: '#9aa0aa', D: '#e4e7ec' }

async function lerTiers() {
  try {
    const r = await fetch('../tier/tier.json', { cache: 'no-cache' })
    if (!r.ok) return
    const todo = await r.json()
    const j = todo?.janelas?.dia
    const looks = new Map()
    for (const jan of Object.values(todo?.janelas || {})) for (const x of [...(jan?.tiers || []).flatMap((g) => g.itens || []), ...(jan?.foraDoMeta || [])]) if (x && !looks.has(Number(x.speciesId))) looks.set(Number(x.speciesId), { shiny: x.looktype, normal: x.lookNormal })
    looksTier = looks
    const m = new Map()
    for (const g of j?.tiers || []) for (const x of g.itens || []) m.set(Number(x.speciesId), g.tier)
    for (const x of j?.foraDoMeta || []) if (!m.has(Number(x.speciesId)) && COR_TIER[x.tier]) m.set(Number(x.speciesId), x.tier)
    tiers = m
  } catch {}
}
const tierDe = (p) => tiers.get(Number(p.speciesId)) || null
function seloTier(p, cls = 'pos-tier') {
  const t = tierDe(p)
  return t ? el('span', { class: cls, style: `--t:${COR_TIER[t]}`, title: `Tier ${t} no tier de hoje` }, [t]) : null
}
let carregando = null

async function carregar() {
  if (dados || carregando) return carregando
  const corpo = $('pos-corpo')
  corpo.replaceChildren(el('div', { class: 'carga vao' }, [el('img', { class: 'carga-bola', src: BOLA, alt: '' }), el('b', { text: 'Carregando as formações' })]))
  carregando = (async () => {
    try {
      const [r] = await Promise.all([fetch('posicionamento.json', { cache: 'no-cache' }), lerTiers()])
      if (!r.ok) throw new Error(`HTTP ${r.status}`)
      dados = await r.json()
      pintar()
    } catch {
      const tentar = el('button', { type: 'button', class: 'botao pequeno', text: 'Tentar de novo' })
      tentar.onclick = () => { carregando = null; carregar() }
      corpo.replaceChildren(el('div', { class: 'carga vao falhou' }, [el('b', { text: 'Não deu para carregar as formações agora.' }), tentar]))
    } finally {
      carregando = null
    }
  })()
  return carregando
}

function pintar() {
  const corpo = $('pos-corpo')
  const js = Array.isArray(dados?.jogadores) ? dados.jogadores : []
  if (!js.length) { corpo.replaceChildren(el('p', { class: 'vazio', text: 'As formações da semana ainda não saíram.' })); return }
  const n = js.length
  const total = n + (Array.isArray(dados.outros) ? dados.outros.length : 0)
  const g = new Date(dados.geradoEm)
  const mes = /^\d{4}-\d{2}$/.test(String(dados.mes || '')) ? new Intl.DateTimeFormat('pt-BR', { month: 'long' }).format(new Date(`${dados.mes}-15T12:00:00`)) : null
  const inds = [
    indicador('topo', mes ? `Top 200 de ${mes}` : 'Top 200 do mensal', 'Ranking do PvP mensal'),
    indicador('formacoes', `${total} formações`, total > n ? `${n} em destaque e ${total - n} na lista` : null),
    Number.isNaN(g.getTime()) ? null : indicador('hora', `Atualizado ${fmtDia.format(g)} às ${fmtHora.format(g)}`, 'Atualiza sozinho quando aparece jogador novo')
  ].filter(Boolean)
  const explica = el('div', { id: 'pos-explica', class: 'explica explica-pop', role: 'dialog', 'aria-label': 'Como as formações são escolhidas', hidden: true }, [
    el('div', { class: 'ex-cab' }, [el('b', { text: 'Como as formações são escolhidas' })]),
    el('div', { class: 'ex-grade' }, [
      bloco('⚔', 'Formações vistas', 'Todas as formações do top 200 vistas em partidas contra as nossas contas.'),
      bloco('★', 'Ranking', 'Os 10 mais bem colocados em destaque; abaixo, o resto até o top 200.'),
      bloco('↑', 'Tabuleiro', 'Adversário em cima. Toque num pokémon para ver o alcance.'),
      bloco('➶', 'Alcance', 'Espada luta colado, arco ataca de longe.')
    ])
  ])
  const info = el('button', { type: 'button', class: 'info', 'aria-expanded': 'false', 'aria-controls': 'pos-explica', 'aria-label': 'Como as formações são escolhidas', text: 'i' })
  info.onclick = (e) => {
    e.stopPropagation()
    const abrir = explica.hidden
    explica.hidden = !abrir
    info.setAttribute('aria-expanded', String(abrir))
  }
  document.addEventListener('click', (e) => { if (!explica.hidden && !explica.contains(e.target)) { explica.hidden = true; info.setAttribute('aria-expanded', 'false') } })
  const linha = el('div', { class: 'info-linha' }, [el('ul', { class: 'indicadores', 'aria-label': 'Resumo' }, inds), info, explica])
  const outros = Array.isArray(dados.outros) ? dados.outros : []
  const grade = el('div', { class: 'pos-grade' }, js.map(cartao))
  const secao = outrosSecao(outros)
  const busca = buscaCampo(grade, secao)
  corpo.replaceChildren(linha, resumo(dados.resumo || [], n), busca.campo, busca.vazio, grade, secao)
  aplicarFiltro()
  abrirDoLink()
}

const linkDe = (nick) => `${location.origin}${location.pathname}${location.search}#j=${encodeURIComponent(nick)}`
function nickDoLink() {
  const m = /^#j=(.+)$/.exec(location.hash)
  if (!m) return null
  try { return decodeURIComponent(m[1]).trim() } catch { return null }
}
function abrirDoLink() {
  const nick = nickDoLink()
  document.querySelector('.pos-aviso-link')?.remove()
  if (!nick || !dados) return
  const k = normalizar(nick)
  const top = (dados.jogadores || []).find((j) => normalizar(j.nick) === k)
  if (top) {
    const card = [...document.querySelectorAll('.pos-grade .pos-card')].find((c) => c.dataset.nick === k)
    if (card) {
      card.scrollIntoView({ block: 'center', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })
      card.classList.remove('destacado'); void card.offsetWidth; card.classList.add('destacado')
    }
    return
  }
  const outro = (dados.outros || []).find((j) => normalizar(j.nick) === k)
  if (outro) return abrirPop(outro)
  const aviso = el('div', { class: 'pos-aviso-link', role: 'status' }, [
    el('b', { text: `A formação de ${nick} não está mais disponível.` }),
    el('span', { text: 'O jogador saiu do top 200 ou a formação foi trocada. Veja as atuais abaixo.' })
  ])
  const fechar = el('button', { type: 'button', class: 'pos-aviso-fechar', 'aria-label': 'Fechar aviso', text: '×' })
  fechar.onclick = () => { aviso.remove(); history.replaceState(null, '', location.pathname + location.search) }
  aviso.append(fechar)
  $('pos-corpo').prepend(aviso)
}
addEventListener('hashchange', abrirDoLink)
const previaMod = import('../assets/previa-formacao.js')
const alcTxt = (n) => (n > 1 ? `alcance ${n}` : 'corpo a corpo')
function desenharJogador(m, j) {
  const itens = (j.pks || []).map((p) => {
    const k = CASAS[p.casa]
    const t = tierDe(p)
    const n = alcanceN(p.alcance)
    return { lt: p.looktype, sp: p.speciesId, col: k ? k.cx - 11 : -1, f: k ? k.fileira : -1, nome: p.nome, cor: t ? COR_TIER[t] : '#e2a93f', chip: { texto: t ? `Tier ${t} · ${alcTxt(n)}` : alcTxt(n), cor: t ? COR_TIER[t] : '#e6c9b9', fundo: 'rgba(21,11,16,.9)' } }
  })
  const jogos = (j.vitorias || 0) + (j.derrotas || 0)
  const wr = jogos ? ` · ${Math.round((100 * j.vitorias) / jogos)}%` : ''
  const sub = `${j.pos ? `${j.pos}º no PvP mensal · ` : ''}${fmt.format(j.pontos || 0)} pts${wr}`
  return m.desenharFormacao({ titulo: `${j.nick}${j.guild?.tag ? ` [${j.guild.tag}]` : ''}`, subtitulo: sub, nos: itens, lados: false, colunas: [{ itens }] })
}
document.addEventListener('click', (e) => {
  const bt = e.target.closest?.('[data-copiar-pos]')
  if (!bt || bt.classList.contains('gerando')) return
  const nick = bt.dataset.copiarPos
  const k = normalizar(nick)
  const j = [...(dados?.jogadores || []), ...(dados?.outros || [])].find((x) => normalizar(x.nick) === k)
  const reserva = linkDe(nick)
  bt.classList.add('gerando')
  const promessa = j ? previaMod.then((m) => m.linkCurto(`P${m.origem()}_${m.b64url(nick)}`, () => desenharJogador(m, j), reserva)).catch(() => reserva) : Promise.resolve(reserva)
  previaMod.then((m) => m.copiarTexto(promessa)).catch(() => promessa).finally(() => {
    bt.classList.remove('gerando'); bt.classList.add('ok')
    clearTimeout(bt._t); bt._t = setTimeout(() => bt.classList.remove('ok'), 2200)
  })
})
function botaoLink(j) {
  const b = el('button', { type: 'button', class: 'pos-link', 'data-copiar-pos': j.nick, title: 'Copiar link desta formação', 'aria-label': `Copiar link da formação de ${j.nick}` }, [ico('link')])
  return b
}

function outrosSecao(lista) {
  if (!lista.length) return null
  return el('section', { class: 'pos-outros', 'aria-labelledby': 'pos-outros-t' }, [
    el('h2', { id: 'pos-outros-t', class: 'pos-sub' }, [ico('formacoes'), el('span', { text: `Mais formações do top 200 · ${lista.length}` })]),
    el('div', { class: 'pos-outros-lista' }, lista.map(outro))
  ])
}

let pop = null
function abrirPop(j) {
  if (!pop) {
    pop = el('dialog', { class: 'pos-pop', 'aria-label': 'Formação' })
    pop.addEventListener('click', (e) => { if (e.target === pop) pop.close() })
    document.body.append(pop)
  }
  const fechar = el('button', { type: 'button', class: 'pos-pop-fechar', 'aria-label': 'Fechar' })
  fechar.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>'
  fechar.onclick = () => pop.close()
  pop.setAttribute('aria-label', `Formação de ${j.nick}`)
  pop.replaceChildren(fechar, cartao(j))
  if (!pop.open) pop.showModal()
}

function outro(j) {
  const jogos = (j.vitorias || 0) + (j.derrotas || 0)
  const wr = jogos ? Math.round((100 * j.vitorias) / jogos) : null
  const d = /^\d{4}-\d{2}-\d{2}$/.test(String(j.usadoEm || '')) ? fmtDia.format(new Date(`${j.usadoEm}T12:00:00`)) : null
  const pks = [...j.pks].sort((a, b) => (CASAS[a.casa]?.fileira ?? 0) - (CASAS[b.casa]?.fileira ?? 0) || a.casa - b.casa)
  const item = el('button', { type: 'button', class: 'pos-outro', 'data-busca': textoBusca(j), 'data-esp': espDe(j), title: `Ver a formação de ${j.nick}` }, [
    el('span', { class: 'pos-lugar', text: `${j.pos}º` }),
    el('span', { class: 'pos-outro-quem' }, [
      el('span', { class: 'pos-outro-nome' }, [el('strong', { class: 'pos-nick' }, [el('span', { text: j.nick })]), guildTag(j.guild)]),
      el('span', { class: 'pos-outro-meta' }, [
        el('span', { text: `${fmt.format(j.pontos || 0)} pts` }),
        wr != null ? el('span', { text: `${wr}%` }) : null,
        d ? el('span', { text: `usada em ${d}` }) : null
      ])
    ]),
    el('span', { class: 'pos-outro-pks', 'aria-label': pks.map((p) => p.nome).join(', ') }, pks.map((p) => el('span', { class: 'pos-outro-pk' }, [sprite(p)]))),
    el('span', { class: 'pos-outro-seta', 'aria-hidden': 'true' })
  ])
  item.addEventListener('click', () => abrirPop(j))
  return item
}

function bloco(icone, titulo, texto) {
  return el('div', { class: 'ex-bloco' }, [el('span', { class: 'ex-ico', 'aria-hidden': 'true', text: icone }), el('b', { text: titulo }), el('span', { text: texto })])
}

function resumo(lista, n) {
  if (!lista.length) return null
  return el('section', { class: 'pos-usos', 'aria-labelledby': 'pos-usos-t' }, [
    el('h2', { id: 'pos-usos-t', class: 'pos-sub' }, [ico('usados'), el('span', { text: `Mais usados nos ${n} times` }), el('span', { class: 'pos-sub-dica', text: 'toque para filtrar' })]),
    el('div', { class: 'pos-usos-lista' }, lista.map((r) => {
      const f = r.fileiras || []
      const z = [['frente', f[0] || 0], ['meio', (f[1] || 0) + (f[2] || 0)], ['fundo', (f[3] || 0) + (f[4] || 0)]].sort((a, b) => b[1] - a[1])[0][0]
      return el('button', { type: 'button', class: 'pos-uso', 'data-filtro-esp': String(r.speciesId), 'aria-pressed': 'false', title: `${r.nome}: em ${r.usos} de ${n} times, mais na ${z}. Toque para filtrar.`, style: `--p:${Math.min(1, r.usos / n)}` }, [
        el('span', { class: 'poke-img' }, [sprite(r), r.shiny ? el('i', { class: 'poke-shiny', 'aria-hidden': 'true', text: '✦' }) : null]),
        el('span', { class: 'pos-uso-txt' }, [
          el('span', { class: 'pos-uso-nome', text: r.nome }),
          el('span', { class: 'pos-uso-meta' }, [seloTier(r, 'pos-tier mini'), el('b', { text: `${r.usos}/${n}` }), el('span', { text: z })])
        ]),
        el('i', { class: 'pos-uso-barra', 'aria-hidden': 'true' })
      ])
    }))
  ])
}

const ESCUDO = '<path d="M12 3.2 19 6v5.2c0 4.4-3 7.9-7 9.6-4-1.7-7-5.2-7-9.6V6z"/>'
function guildTag(g) {
  const tag = String(g?.tag || '').trim().replace(/^\[|\]$/g, '').slice(0, 8)
  if (!tag) return null
  const cor = /^#[0-9a-f]{3,8}$/i.test(String(g.cor || '')) ? g.cor : '#c9b8a8'
  const esc = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  esc.setAttribute('viewBox', '0 0 24 24'); esc.setAttribute('aria-hidden', 'true'); esc.innerHTML = ESCUDO
  return el('span', { class: 'pos-guild', style: `--g:${cor}`, title: g.nome ? `Guild ${g.nome}` : `Guild ${tag}` }, [esc, el('b', { text: tag })])
}
const textoBusca = (j) => normalizar(`${j.nick} ${j.guild?.tag || ''} ${j.guild?.nome || ''}`)
const normalizar = (t) => String(t || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()

const espDe = (j) => (j.pks || []).map((p) => Number(p.speciesId)).join(',')
const filtro = { q: '', esp: [] }
let aplicarFiltro = () => {}
let alternarEsp = () => {}
document.addEventListener('click', (e) => {
  const b = e.target.closest?.('[data-filtro-esp]')
  if (!b) return
  const id = Number(b.dataset.filtroEsp)
  alternarEsp(id)
  if (filtro.esp.includes(id)) document.querySelector('.pos-filtros')?.scrollIntoView({ block: 'nearest', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })
})
function especiesDe(lista) {
  const m = new Map()
  for (const j of lista) for (const p of j.pks || []) {
    const id = Number(p.speciesId)
    const r = m.get(id) || { speciesId: id, nome: p.nome, looktype: p.looktype, shiny: p.shiny, n: 0, jog: new Set() }
    if (!r.jog.has(j.nick)) { r.jog.add(j.nick); r.n++ }
    m.set(id, r)
  }
  return [...m.values()].sort((a, b) => b.n - a.n || a.nome.localeCompare(b.nome))
}
function buscaCampo(grade, secao) {
  const todos = [...(dados.jogadores || []), ...(dados.outros || [])]
  const especies = especiesDe(todos)
  const porId = new Map(especies.map((e) => [e.speciesId, e]))
  const input = el('input', { id: 'pos-busca', class: 'campo', type: 'search', autocomplete: 'off', spellcheck: 'false', placeholder: 'Buscar jogador ou guild', 'aria-label': 'Buscar jogador ou guild' })
  const pkIn = el('input', { id: 'pos-busca-pk', class: 'campo', type: 'search', autocomplete: 'off', spellcheck: 'false', placeholder: 'Filtrar por pokémon', 'aria-label': 'Filtrar por pokémon usado', 'aria-controls': 'pos-pk-sug', 'aria-expanded': 'false' })
  const sug = el('div', { id: 'pos-pk-sug', class: 'pos-pk-sug', role: 'listbox', hidden: true })
  const chips = el('div', { class: 'pos-chips', 'aria-live': 'polite' })
  const vazio = el('p', { class: 'vazio pos-busca-vazio', hidden: true, text: 'Nenhuma formação com esse filtro.' })
  const conta = el('span', { class: 'pos-filtro-conta' })
  let ativo = -1
  const fechar = () => { sug.hidden = true; sug.replaceChildren(); ativo = -1; pkIn.setAttribute('aria-expanded', 'false') }
  const pintarSug = () => {
    const q = normalizar(pkIn.value)
    const lista = especies.filter((e) => !filtro.esp.includes(e.speciesId) && (!q || normalizar(e.nome).includes(q))).slice(0, 8)
    if (!lista.length) { sug.replaceChildren(el('p', { class: 'pos-pk-sug-vazio', text: q ? 'Nenhum pokémon com esse nome nas formações.' : 'Todos já estão no filtro.' })); sug.hidden = false; return }
    sug.replaceChildren(...lista.map((e, i) => el('button', { type: 'button', role: 'option', class: `pos-pk-op${i === ativo ? ' foco' : ''}`, 'data-esp': String(e.speciesId) }, [
      el('span', { class: 'poke-img' }, [sprite(e)]),
      el('span', { class: 'pos-pk-op-nome', text: e.nome }),
      el('span', { class: 'pos-pk-op-n', text: `${e.n} ${e.n === 1 ? 'formação' : 'formações'}` })
    ])))
    sug.hidden = false
    pkIn.setAttribute('aria-expanded', 'true')
  }
  const pintarChips = () => {
    chips.replaceChildren(...filtro.esp.map((id) => {
      const e = porId.get(id)
      return el('button', { type: 'button', class: 'pos-chip', 'data-tirar': String(id), title: `Tirar ${e?.nome || ''} do filtro`, 'aria-label': `Tirar ${e?.nome || ''} do filtro` }, [el('span', { class: 'poke-img' }, [sprite(e || { speciesId: id })]), el('span', { text: e?.nome || `#${id}` }), el('i', { 'aria-hidden': 'true', text: '×' })])
    }), ...(filtro.esp.length > 1 ? [el('button', { type: 'button', class: 'pos-chip-limpar', 'data-limpar': '', text: 'Limpar' })] : []))
    chips.hidden = !filtro.esp.length
    document.querySelectorAll('[data-filtro-esp]').forEach((b) => { const on = filtro.esp.includes(Number(b.dataset.filtroEsp)); b.classList.toggle('no-filtro', on); b.setAttribute('aria-pressed', String(on)) })
  }
  aplicarFiltro = () => {
    const q = normalizar(filtro.q)
    let achou = 0
    for (const sel of [grade, secao]) {
      if (!sel) continue
      let n = 0
      for (const it of sel.querySelectorAll('[data-busca]')) {
        const esp = (it.dataset.esp || '').split(',').map(Number)
        const ok = (!q || it.dataset.busca.includes(q)) && filtro.esp.every((id) => esp.includes(id))
        it.hidden = !ok
        if (ok) n++
      }
      sel.hidden = !n
      achou += n
      const t = sel === secao ? sel.querySelector('#pos-outros-t span') : null
      if (t) t.textContent = `Mais formações do top 200 · ${n}`
    }
    vazio.hidden = !!achou
    conta.textContent = filtro.esp.length || q ? `${achou} ${achou === 1 ? 'formação' : 'formações'}` : ''
    pintarChips()
  }
  const alternar = (id) => {
    const i = filtro.esp.indexOf(id)
    if (i >= 0) filtro.esp.splice(i, 1)
    else filtro.esp.push(id)
    aplicarFiltro()
  }
  input.value = filtro.q
  filtro.esp = filtro.esp.filter((id) => porId.has(id))
  input.addEventListener('input', () => { filtro.q = input.value; aplicarFiltro() })
  pkIn.addEventListener('input', () => { ativo = -1; pintarSug() })
  pkIn.addEventListener('focus', pintarSug)
  pkIn.addEventListener('blur', () => setTimeout(fechar, 120))
  pkIn.addEventListener('keydown', (e) => {
    const ops = [...sug.querySelectorAll('[data-esp]')]
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      if (!ops.length) return
      e.preventDefault()
      ativo = (ativo + (e.key === 'ArrowDown' ? 1 : -1) + ops.length) % ops.length
      ops.forEach((o, i) => o.classList.toggle('foco', i === ativo))
    } else if (e.key === 'Enter') {
      const o = ops[ativo >= 0 ? ativo : 0]
      if (o) { e.preventDefault(); alternar(Number(o.dataset.esp)); pkIn.value = ''; pintarSug() }
    } else if (e.key === 'Escape') fechar()
    else if (e.key === 'Backspace' && !pkIn.value && filtro.esp.length) { filtro.esp.pop(); aplicarFiltro(); pintarSug() }
  })
  sug.addEventListener('mousedown', (e) => e.preventDefault())
  sug.addEventListener('click', (e) => { const o = e.target.closest('[data-esp]'); if (o) { alternar(Number(o.dataset.esp)); pkIn.value = ''; pintarSug(); pkIn.focus() } })
  chips.addEventListener('click', (e) => {
    if (e.target.closest('[data-limpar]')) { filtro.esp = []; return aplicarFiltro() }
    const b = e.target.closest('[data-tirar]')
    if (b) alternar(Number(b.dataset.tirar))
  })
  alternarEsp = alternar
  const campo = el('div', { class: 'pos-filtros' }, [
    el('label', { class: 'busca pos-busca' }, [el('span', { class: 'busca-ico', 'aria-hidden': 'true' }, [ico('busca')]), input]),
    el('div', { class: 'busca pos-busca pos-busca-pk' }, [el('span', { class: 'busca-ico', 'aria-hidden': 'true' }, [ico('pokebola')]), pkIn, sug]),
    conta,
    chips
  ])
  chips.hidden = true
  return { campo, vazio }
}

function usadoEm(dia) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(dia || ''))) return null
  const d = new Date(`${dia}T12:00:00`)
  return el('li', { class: 'pos-usado', title: 'Última partida em que essa formação foi usada' }, [ico('semana'), el('span', { text: `usada em ${fmtDia.format(d)}` })])
}

const CY_NOSSO = (f) => 13 + f
const CY_DELES = (f) => 12 - f
const distancia = (a, b) => Math.max(Math.abs(a[0] - b[0]), Math.abs(a[1] - b[1]))
const alcanceN = (a) => Math.max(1, Math.min(4, Math.round(Number(a) || 1)))

const BOLA_SVG = `url("data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" fill="#fff3df" fill-opacity=".34"/><path d="M2 50a48 48 0 0 1 96 0z" fill="#e0505c" fill-opacity=".5"/><rect x="2" y="46.5" width="96" height="7" fill="#10070c"/><circle cx="50" cy="50" r="14" fill="#10070c"/><circle cx="50" cy="50" r="8.5" fill="#f3e4cf" fill-opacity=".85"/></svg>')}")`
function pintarBola(tab) {
  const meio = tab.querySelector('.pos-meio')
  if (!meio || !meio.offsetWidth) return
  const cx = meio.offsetLeft + meio.offsetWidth / 2, cy = meio.offsetTop + meio.offsetHeight / 2
  const D = meio.offsetWidth * 0.52
  for (const c of tab.querySelectorAll('.pos-casa:not(.ocupada)')) {
    let b = c.querySelector('.pos-casa-bola')
    if (!b) { b = el('i', { class: 'pos-casa-bola', 'aria-hidden': 'true' }); c.prepend(b) }
    const x = cx - D / 2 - c.offsetLeft, y = cy - D / 2 - c.offsetTop
    const longe = x > c.offsetWidth || y > c.offsetHeight || x + D < 0 || y + D < 0
    b.style.backgroundImage = longe ? 'none' : BOLA_SVG
    b.style.backgroundSize = `${D}px ${D}px`
    b.style.backgroundPosition = `${x}px ${y}px`
  }
}
const observaBola = new ResizeObserver((itens) => { for (const it of itens) pintarBola(it.target) })

function cartao(j) {
  const ocupa = new Map(j.pks.map((p) => [p.casa, p]))
  const nossas = []
  const deles = []
  const tab = el('div', { class: 'pos-tab', role: 'group', 'aria-label': `Formação de ${j.nick}` }, [
    el('span', { class: 'pos-canto deles', 'aria-hidden': 'true', text: 'Adversário' }),
    el('span', { class: 'pos-canto nosso', 'aria-hidden': 'true', text: 'Formação' })
  ])
  for (let f = FILEIRAS.length - 2; f >= 0; f--) {
    for (let cx = 11; cx <= 18; cx++) {
      const c = CASAS.find((x) => x.fileira === f && x.cx === 29 - cx)
      if (!c) { tab.append(el('span', { class: 'pos-fora', 'aria-hidden': 'true' })); continue }
      const s = el('span', { class: `pos-casa inimiga${(cx + f) % 2 ? ' alt' : ''}`, 'aria-hidden': 'true' })
      deles.push({ el: s, xy: [cx, CY_DELES(f)] })
      tab.append(s)
    }
  }
  const meio = el('span', { class: 'pos-meio', 'aria-hidden': 'true' })
  tab.append(meio)
  observaBola.observe(tab)
  for (let f = 0; f < FILEIRAS.length; f++) {
    for (let cx = 11; cx <= 18; cx++) {
      const c = CASAS.find((x) => x.fileira === f && x.cx === cx)
      if (!c) { tab.append(el('span', { class: 'pos-fora', 'aria-hidden': 'true' })); continue }
      const p = ocupa.get(c.casa)
      const alt = (cx + f) % 2 ? ' alt' : ''
      if (!p) { tab.append(el('span', { class: `pos-casa nossa${alt}`, 'aria-hidden': 'true' })); continue }
      const n = alcanceN(p.alcance)
      const t = tierDe(p)
      const b = el('button', { type: 'button', style: t ? `--t:${COR_TIER[t]}` : null, class: `pos-casa nossa ocupada${alt}${n > 1 ? ' longe' : ''}`, title: `${p.nome}${t ? ` · tier ${t}` : ''} · ${alcance(n)}`, 'aria-label': `${p.nome}${t ? `, tier ${t}` : ''}, ${alcance(n)}`, 'aria-pressed': 'false' }, [
        sprite(p),
        t ? el('span', { class: 'pos-casa-info', 'aria-hidden': 'true' }, [seloTier(p, 'pos-tier mini')]) : null
      ])
      nossas.push({ el: b, p, n, xy: [cx, CY_NOSSO(f)] })
      tab.append(b)
    }
  }
  const legenda = el('p', { class: 'pos-legenda', role: 'status' })
  let fixo = null
  const mostrar = (o) => {
    for (const x of nossas) { x.el.classList.toggle('sel', x === o); x.el.setAttribute('aria-pressed', String(x === o)) }
    let total = 0
    for (const d of deles) {
      const ok = !!o && distancia(o.xy, d.xy) <= o.n
      d.el.classList.toggle('alcanca', ok)
      if (ok) total++
    }
    tab.classList.toggle('mirando', !!o)
    if (!o) {
      legenda.replaceChildren(el('span', { class: 'pos-legenda-dica', text: 'Toque num pokémon para ver o alcance' }))
      return
    }
    legenda.replaceChildren(
      el('b', { text: o.p.nome }),
      seloTier(o.p),
      el('span', { class: `pos-legenda-alc${o.n > 1 ? ' longe' : ''}` }, [ico(o.n > 1 ? 'arco' : 'espada'), o.n > 1 ? `${o.n} casas` : 'corpo a corpo']),
      el('span', { class: 'pos-legenda-n', text: total ? `alcança ${total} ${total === 1 ? 'casa' : 'casas'} do adversário` : 'precisa andar para alcançar' })
    )
  }
  for (const o of nossas) {
    o.el.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse' && !fixo) mostrar(o) })
    o.el.addEventListener('pointerleave', (e) => { if (e.pointerType === 'mouse' && !fixo) mostrar(null) })
    o.el.addEventListener('focus', () => { if (!fixo) mostrar(o) })
    o.el.addEventListener('blur', () => { if (!fixo) mostrar(null) })
    o.el.addEventListener('click', () => { fixo = fixo === o ? null : o; mostrar(fixo || o) })
  }
  mostrar(null)
  const faltam = 5 - j.pks.length
  const jogos = (j.vitorias || 0) + (j.derrotas || 0)
  const wr = jogos ? Math.round((100 * j.vitorias) / jogos) : null
  const podio = j.pos <= 3 ? ` p${j.pos}` : ''
  return el('article', { class: `pos-card${podio}`, 'data-busca': textoBusca(j), 'data-esp': espDe(j), 'data-nick': normalizar(j.nick) }, [
    el('header', { class: 'pos-card-cab' }, [
      el('span', { class: 'pos-lugar', title: 'Posição no PvP mensal', text: `${j.pos}º` }),
      el('strong', { class: 'pos-nick', title: j.guild?.nome ? `${j.nick} · ${j.guild.nome}` : j.nick }, [el('span', { text: j.nick })]),
      guildTag(j.guild),
      el('ul', { class: 'pos-stats' }, [
      el('li', { title: 'Pontos no mês' }, [ico('pontos'), el('span', { text: `${fmt.format(j.pontos || 0)} pts` })]),
      wr != null ? el('li', { title: `${fmt.format(j.vitorias)} vitórias e ${fmt.format(j.derrotas)} derrotas no mês` }, [ico('vitorias'), el('span', { text: `${wr}%` })]) : null,
      usadoEm(j.usadoEm),
      faltam > 0 ? el('li', { class: 'pos-menos', title: 'Esse jogador entra com menos de 5 pokémon' }, [el('span', { text: `${j.pks.length} pokémon` })]) : null,
      el('li', { class: 'pos-link-li' }, [botaoLink(j)])
      ])
    ]),
    tab,
    legenda
  ])
}

carregar()
