const SPRITES = '../calculadora/jogo/sprites-png/'
const BOLA = '../assets/pokebola.svg'
const fmt = new Intl.NumberFormat('pt-BR')
const fmtDia = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit' })
const fmtHora = new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' })
const $ = (id) => document.getElementById(id)
const ICO = {
  topo: '<path d="M8 3.5h8V9a4 4 0 0 1-8 0zM12 13v3.5M8.5 20.5h7M8 5.5H5.5c0 2.6 1.2 4 3 4.3M16 5.5h2.5c0 2.6-1.2 4-3 4.3"/>',
  hora: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
  janela: '<path d="M4 19V5M4 19h16"/><path d="M7 15l4-4 3 3 5-6"/>',
  busca: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m15.5 15.5 5 5"/>',
  xp: '<path d="M13 2.5 5 13.5h6l-1 8 8-11h-6z"/>',
  coins: '<circle cx="12" cy="12" r="8.5"/><path d="M14.6 9.2c-.5-.9-1.5-1.4-2.6-1.4-1.6 0-2.8.9-2.8 2.1 0 2.8 5.6 1.6 5.6 4.3 0 1.2-1.2 2.1-2.8 2.1-1.2 0-2.3-.6-2.7-1.5M12 6v1.8M12 16.2V18"/>',
  abates: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3"/>',
  hunt: '<path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.5"/>'
}
const ESCUDO = '<path d="M12 3.2 19 6v5.2c0 4.4-3 7.9-7 9.6-4-1.7-7-5.2-7-9.6V6z"/>'
const ORDENS = [['xph', 'XP/h', 'xp'], ['coinsh', 'Coins/h', 'coins'], ['kph', 'Abates/h', 'abates']]

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
const ehNum = (v) => v != null && v !== '' && Number.isFinite(Number(v))
function curto(v) {
  if (!ehNum(v)) return '—'
  const n = Number(v), a = Math.abs(n)
  const f = (x, s) => `${x >= 100 ? Math.round(x) : x.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} ${s}`
  if (a >= 1e9) return f(n / 1e9, 'bi')
  if (a >= 1e6) return f(n / 1e6, 'mi')
  if (a >= 1e3) return f(n / 1e3, 'mil')
  return fmt.format(Math.round(n))
}
function sprite(p) {
  const img = el('img', { alt: '', loading: 'lazy', decoding: 'async' })
  const tentativas = [...new Set([p?.looktype, ehNum(p?.speciesId) ? (p.shiny ? 70000 : 60000) + Number(p.speciesId) : null, ehNum(p?.speciesId) ? 60000 + Number(p.speciesId) : null].filter(ehNum).map(Number))].map((l) => `${SPRITES}${l}.png`)
  const proxima = () => {
    const url = tentativas.shift()
    if (url) img.src = url
    else { img.onerror = null; img.src = BOLA; img.className = 'bola' }
  }
  img.onerror = proxima
  proxima()
  return img
}
function guildTag(g) {
  const tag = String(g?.tag || '').trim().replace(/^\[|\]$/g, '').slice(0, 8)
  if (!tag) return null
  const cor = /^#[0-9a-f]{3,8}$/i.test(String(g.cor || '')) ? g.cor : '#c9b8a8'
  const esc = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  esc.setAttribute('viewBox', '0 0 24 24'); esc.setAttribute('aria-hidden', 'true'); esc.innerHTML = ESCUDO
  return el('span', { class: 'pos-guild', style: `--g:${cor}`, title: g.nome ? `Guild ${g.nome}` : `Guild ${tag}` }, [esc, el('b', { text: tag })])
}
const normalizar = (t) => String(t || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()
const indicador = (icone, texto, titulo) => el('li', { class: `ind ind-${icone}`, title: titulo || null }, [ico(icone), el('span', { text: texto })])

let dados = null
let ordem = 'xph'

async function carregar() {
  const corpo = $('farm-corpo')
  corpo.replaceChildren(el('div', { class: 'carga vao' }, [el('img', { class: 'carga-bola', src: BOLA, alt: '' }), el('b', { text: 'Carregando o top farm' })]))
  try {
    const r = await fetch(`farm.json?t=${Math.floor(Date.now() / 300000)}`, { cache: 'no-cache' })
    if (!r.ok) throw new Error(`HTTP ${r.status}`)
    dados = await r.json()
    pintar()
  } catch {
    const tentar = el('button', { type: 'button', class: 'botao pequeno', text: 'Tentar de novo' })
    tentar.onclick = carregar
    corpo.replaceChildren(el('div', { class: 'carga vao falhou' }, [el('b', { text: 'Não deu para carregar o top farm agora.' }), tentar]))
  }
}

function linha(j, i, maxXp) {
  const pk = j.pk
  const hunt = ehNum(j.hunt) ? `Nv ${fmt.format(j.hunt)}` : '—'
  const ex = Array.isArray(j.exemplos) && j.exemplos.length ? j.exemplos.join(', ') : ''
  const item = el('div', { class: `farm-linha${i < 3 ? ` top${i + 1}` : ''}`, 'data-busca': normalizar(`${j.nick} ${j.guild?.tag || ''} ${j.guild?.nome || ''} ${pk?.nome || ''} ${ex}`) }, [
    el('span', { class: 'pos-lugar', text: `${i + 1}º` }),
    el('span', { class: 'farm-quem' }, [
      el('span', { class: 'farm-nome' }, [el('strong', { class: 'pos-nick' }, [el('span', { text: j.nick })]), guildTag(j.guild)]),
      el('small', { class: 'farm-sub' }, ehNum(j.nivel) ? [el('span', { class: 'farm-longo', text: 'Treinador ' }), `Nv ${fmt.format(j.nivel)}`] : [])
    ]),
    el('span', { class: 'farm-pk', title: pk ? '' : 'O pokémon que está farmando não aparece na vitrine nem no time de PvP do perfil' }, [
      el('span', { class: 'farm-pk-img' }, [pk ? sprite(pk) : el('img', { class: 'bola', src: BOLA, alt: '' }), pk?.shiny ? el('i', { class: 'farm-shiny', 'aria-hidden': 'true', text: '✦' }) : null]),
      el('span', { class: 'farm-pk-txt' }, [el('b', { text: pk ? `${pk.shiny ? 'Shiny ' : ''}${pk.nome}` : 'Não exposto' }), el('small', { text: pk && ehNum(pk.nivel) ? `Nv ${fmt.format(pk.nivel)}` : 'não aparece no perfil' })])
    ]),
    el('span', { class: `farm-num xp${ordem === 'xph' ? ' ativo' : ''}`, title: `${fmt.format(Math.round(j.xph))} XP por hora (medido)` }, [el('small', { text: 'XP/h' }), el('b', { text: curto(j.xph) }), el('i', { class: 'farm-barra', style: `--p:${Math.max(0.04, j.xph / maxXp)}` })]),
    el('span', { class: `farm-num coins${ordem === 'coinsh' ? ' ativo' : ''}`, title: ehNum(j.coinsh) ? `${fmt.format(Math.round(j.coinsh))} coins por hora (estimado pela hunt)` : 'Sem estimativa' }, [el('small', { text: 'Coins/h' }), el('b', { text: ehNum(j.coinsh) ? `≈${curto(j.coinsh)}` : '—' })]),
    el('span', { class: `farm-num abates${ordem === 'kph' ? ' ativo' : ''}`, title: `${fmt.format(Math.round(j.kph))} pokémon derrotados por hora (medido)` }, [el('small', { text: 'Abates/h' }), el('b', { text: fmt.format(Math.round(j.kph)) })]),
    el('span', { class: 'farm-hunt', title: ex ? `Hunt provável, ${hunt}: ${ex}` : 'Hunt provável' }, [el('small', {}, [el('span', { class: 'farm-longo', text: 'Hunt provável' }), el('span', { class: 'farm-curto', text: 'Hunt' })]), el('b', { text: hunt }), el('em', { text: ex })])
  ])
  return item
}

function podio(ord) {
  const [m, rot] = ORDENS.find((o) => o[0] === ordem)
  const valor = (j) => (m === 'kph' ? fmt.format(Math.round(j.kph)) : m === 'coinsh' ? (ehNum(j.coinsh) ? `≈${curto(j.coinsh)}` : '—') : curto(j.xph))
  const cartao = (j, i) => {
    if (!j) return el('div', { class: 'farm-pod vazio' })
    const pk = j.pk
    const mini = [m !== 'xph' ? `${curto(j.xph)} XP/h` : null, m !== 'coinsh' && ehNum(j.coinsh) ? `≈${curto(j.coinsh)} coins/h` : null, m !== 'kph' ? `${fmt.format(Math.round(j.kph))} abates/h` : null].filter(Boolean)
    return el('div', { class: `farm-pod p${i + 1}` }, [
      i === 0 ? el('i', { class: 'pod-brilho', 'aria-hidden': 'true' }, [el('i')]) : null,
      el('span', { class: 'pod-lugar', text: `${i + 1}º` }),
      el('span', { class: 'pod-pk' }, [el('i', { class: 'pod-luz', 'aria-hidden': 'true' }), pk ? sprite(pk) : el('img', { class: 'bola', src: BOLA, alt: '' }), pk?.shiny ? el('i', { class: 'farm-shiny', 'aria-hidden': 'true', text: '✦' }) : null]),
      el('span', { class: 'pod-nome' }, [el('strong', { class: 'pos-nick' }, [el('span', { text: j.nick })]), guildTag(j.guild)]),
      el('small', { class: 'pod-pkn', text: pk ? `${pk.shiny ? 'Shiny ' : ''}${pk.nome}` : 'Pokémon não exposto' }),
      el('b', { class: 'pod-valor' }, [valor(j), el('small', { text: rot })]),
      el('span', { class: 'pod-mini' }, mini.map((t) => el('span', { text: t }))),
      el('span', { class: 'pod-hunt', text: ehNum(j.hunt) ? `Hunt Nv ${fmt.format(j.hunt)}` : '' })
    ])
  }
  return [cartao(ord[1], 1), cartao(ord[0], 0), cartao(ord[2], 2)]
}

function pintar() {
  const corpo = $('farm-corpo')
  const js = Array.isArray(dados?.jogadores) ? dados.jogadores.slice() : []
  if (!js.length) { corpo.replaceChildren(el('p', { class: 'vazio', text: 'O top farm ainda não saiu.' })); return }
  const g = new Date(dados.geradoEm)
  const inds = [
    indicador('topo', `Top ${js.length}`, ehNum(dados.medidos) ? `${fmt.format(dados.medidos)} jogadores medidos` : null),
    ehNum(dados.janelaMin) ? indicador('janela', `Medido em ~${dados.janelaMin} min`, 'Duas leituras do perfil público com esse intervalo') : null,
    Number.isNaN(g.getTime()) ? null : indicador('hora', `Atualizado ${fmtDia.format(g)} às ${fmtHora.format(g)}`)
  ].filter(Boolean)
  const info = el('button', { type: 'button', class: 'info', 'aria-expanded': 'false', 'aria-controls': 'farm-explica', 'aria-label': 'Como o top farm é medido', text: 'i' })
  const explica = el('div', { id: 'farm-explica', class: 'explica explica-pop', role: 'dialog', 'aria-label': 'Como o top farm é medido', hidden: true }, [
    el('div', { class: 'ex-cab' }, [el('b', { text: 'Como o top farm é medido' })]),
    el('div', { class: 'ex-grade' }, [
      bloco('⚡', 'XP e abates por hora', 'Medidos: diferença entre duas leituras do perfil público.'),
      bloco('◎', 'Pokémon', 'O da vitrine ou do time de PvP que ganhou XP no intervalo.'),
      bloco('⌖', 'Hunt provável', 'Faixa de nível pelo XP de cada abate; o jogo não mostra a hunt.'),
      bloco('$', 'Coins por hora', 'Estimadas pela faixa da hunt e pelos abates por hora.')
    ])
  ])
  info.onclick = (e) => { e.stopPropagation(); const abrir = explica.hidden; explica.hidden = !abrir; info.setAttribute('aria-expanded', String(abrir)) }
  document.addEventListener('click', (e) => { if (!explica.hidden && !explica.contains(e.target)) { explica.hidden = true; info.setAttribute('aria-expanded', 'false') } })
  const topo = el('div', { class: 'info-linha' }, [el('ul', { class: 'indicadores', 'aria-label': 'Resumo' }, inds), info, explica])

  const lista = el('div', { class: 'farm-lista' })
  const pod = el('div', { class: 'farm-podio entra', 'aria-label': 'Os 3 primeiros' })
  setTimeout(() => pod.classList.remove('entra'), 1200)
  const chips = el('div', { class: 'farm-ordem', role: 'tablist', 'aria-label': 'Ordenar por' })
  const desenhar = () => {
    const ord = js.slice().sort((a, b) => (Number(b[ordem]) || 0) - (Number(a[ordem]) || 0))
    const maxXp = Math.max(...js.map((j) => Number(j.xph) || 0), 1)
    lista.replaceChildren(...ord.map((j, i) => linha(j, i, maxXp)))
    pod.replaceChildren(...podio(ord))
    for (const b of chips.children) b.setAttribute('aria-selected', String(b.dataset.ordem === ordem))
    filtrar()
  }
  for (const [k, rot, ic] of ORDENS) {
    const b = el('button', { type: 'button', class: 'farm-chip', role: 'tab', 'data-ordem': k }, [ico(ic), el('span', { text: rot })])
    b.onclick = () => { ordem = k; desenhar() }
    chips.append(b)
  }
  const input = el('input', { class: 'campo', type: 'search', autocomplete: 'off', spellcheck: 'false', placeholder: 'Buscar jogador, guild ou pokémon', 'aria-label': 'Buscar jogador, guild ou pokémon' })
  const vazio = el('p', { class: 'vazio pos-busca-vazio', hidden: true, text: 'Ninguém com esse nome no top farm.' })
  const filtrar = () => {
    const q = normalizar(input.value)
    let n = 0
    let i = 0
    for (const it of lista.children) { const ok = q ? it.dataset.busca.includes(q) : i >= 3; it.hidden = !ok; if (ok) n++; i++ }
    pod.hidden = !!q
    vazio.hidden = !q || !!n
  }
  input.addEventListener('input', filtrar)
  const barra = el('div', { class: 'farm-barra-topo' }, [el('label', { class: 'busca pos-busca' }, [el('span', { class: 'busca-ico', 'aria-hidden': 'true' }, [ico('busca')]), input]), chips])
  corpo.replaceChildren(topo, pod, barra, vazio, lista)
  desenhar()
}
const bloco = (sim, tit, txt) => el('div', { class: 'ex-bloco' }, [el('span', { class: 'ex-ico', 'aria-hidden': 'true', text: sim }), el('b', { text: tit }), el('span', { text: txt })])

carregar()
