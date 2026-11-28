const RAIZ_PP = (() => { try { return new URL('../', document.currentScript.src).pathname } catch { return '/pokepocketferramentas/' } })()
const SECOES_FERR = [
  ['pokemon', 'Seu pokémon', ['calculadora', 'nivel'], '<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h5.5M15 12h5.5"/><circle cx="12" cy="12" r="3"/>'],
  ['pvp', 'PvP', ['tier', 'posicionamento', 'monte-seu-time'], '<path d="M14.5 4.5h5v5L9 20l-5-5z"/><path d="M5 13.5 10.5 19M3.5 20.5l2-2"/>'],
  ['servidor', 'Servidor agora', ['farm', 'shinies'], '<circle cx="12" cy="12" r="2"/><path d="M8.2 15.8a5.4 5.4 0 0 1 0-7.6M15.8 8.2a5.4 5.4 0 0 1 0 7.6M5.4 18.6a9.3 9.3 0 0 1 0-13.2M18.6 5.4a9.3 9.3 0 0 1 0 13.2"/>']
]
const paginaFerr = (href) => { try { return new URL(href, document.baseURI).pathname.match(/\/(calculadora|nivel|tier|posicionamento|monte-seu-time|farm|shinies)\/(?:index\.html)?$/)?.[1] || null } catch { return null } }
const novoEl = (tag, classe, texto) => { const e = document.createElement(tag); if (classe) e.className = classe; if (texto != null) e.textContent = texto; return e }

;(() => {
  const grupos = (links) => SECOES_FERR.map(([id, nome, pags]) => [id, nome, pags.flatMap((p) => links.filter((a) => paginaFerr(a.href) === p))]).filter((g) => g[2].length)
  for (const lista of document.querySelectorAll('.ferr-lista:not(.sec-pop)')) {
    const links = [...lista.querySelectorAll(':scope > a')]
    const gs = grupos(links)
    if (!gs.length) continue
    const soltos = links.filter((a) => !gs.some((g) => g[2].includes(a)))
    lista.replaceChildren(...gs.flatMap(([, nome, as]) => [novoEl('span', 'ferr-sec', nome), ...as]), ...soltos)
  }
  for (const pe of document.querySelectorAll('.pe-ferr')) {
    const links = [...pe.querySelectorAll(':scope > a')]
    const gs = grupos(links)
    if (!gs.length) continue
    pe.replaceChildren(...gs.map(([id, nome, as]) => {
      const itens = novoEl('div', 'pe-itens')
      itens.style.setProperty('--n', String(as.length))
      itens.append(...as)
      const g = novoEl('div', `pe-grupo pe-${id}`)
      g.append(novoEl('span', 'pe-sec', nome), itens)
      return g
    }))
  }
})()

const APOIO_COPIAR = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="8.5" y="8.5" width="11.5" height="11.5" rx="2.5"/><path d="M15.5 8.5V6.5a2 2 0 0 0-2-2h-7a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h2"/></svg>'
const apoioHTML = (fonte) => `
  <h3 class="apoie-tit"><span class="apoie-gema" style="background-image:url('${fonte}assets/gema.svg')"></span>Apoie o projeto</h3>
  <p class="apoie-sub">Sua doação mantém as melhorias e o PokePocket sempre gratuito.</p>
  <div class="apoie-opcoes">
    <section class="apoie-op coins" aria-label="Apoiar com coins">
      <div class="apoie-op-cab"><span class="apoie-medalha"><img src="${fonte}assets/coin.svg" alt="" /></span><div><b>Coins</b><small>Direto no jogo</small></div></div>
      <span class="apoie-rot2">Envie para o jogador</span>
      <div class="apoie-campo"><code class="apoie-nick">Piscis</code><button type="button" data-copiar="Piscis" data-rotulo="Copiar" aria-label="Copiar o nick Piscis">${APOIO_COPIAR}<span>Copiar</span></button></div>
    </section>
    <span class="apoie-ou" aria-hidden="true">ou</span>
    <section class="apoie-op gemas" aria-label="Apoiar com gemas">
      <div class="apoie-op-cab"><span class="apoie-medalha"><img src="${fonte}assets/gema.svg" alt="" /></span><div><b>Gemas</b><small>USDT · rede Solana (SPL)</small></div></div>
      <span class="apoie-rot2">Endereço da carteira</span>
      <div class="apoie-campo"><code class="apoie-end">J3NgpD4WkWBsxgEUgibU59AoBHVUJse9YuLu6wJ78wMx</code><button type="button" data-copiar="J3NgpD4WkWBsxgEUgibU59AoBHVUJse9YuLu6wJ78wMx" data-rotulo="Copiar" aria-label="Copiar o endereço da carteira">${APOIO_COPIAR}<span>Copiar</span></button></div>
      <p class="apoie-alerta">⚠ Só USDT na rede Solana. Outra moeda ou rede pode ser perdida.</p>
    </section>
  </div>`

document.addEventListener('click', async (e) => {
  const bt = e.target.closest?.('[data-copiar]')
  if (!bt) return
  const txt = bt.dataset.copiar
  try { await navigator.clipboard.writeText(txt) } catch { const t = document.createElement('textarea'); t.value = txt; t.style.cssText = 'position:fixed;opacity:0'; document.body.append(t); t.select(); document.execCommand('copy'); t.remove() }
  const sp = bt.querySelector('span')
  bt.classList.add('ok'); if (sp) sp.textContent = 'Copiado'
  clearTimeout(bt._t); bt._t = setTimeout(() => { bt.classList.remove('ok'); if (sp) sp.textContent = bt.dataset.rotulo || 'Copiar' }, 2200)
});
document.addEventListener('DOMContentLoaded', () => { for (const c of document.querySelectorAll('[data-apoio]')) c.innerHTML = apoioHTML(c.dataset.apoio || '') });

(() => {
  for (const raiz of document.querySelectorAll('[data-ferramentas]')) {
    const botao = raiz.querySelector('.ferr-botao')
    const lista = raiz.querySelector('.ferr-lista')
    if (!botao || !lista) continue
    const itens = () => [...lista.querySelectorAll('a')]
    const aberto = () => botao.getAttribute('aria-expanded') === 'true'
    const abre = (v, foco) => {
      botao.setAttribute('aria-expanded', String(v))
      lista.classList.toggle('aberta', v)
      if (v && foco !== undefined) {
        const l = itens()
        l[(foco + l.length) % l.length]?.focus()
      }
    }
    botao.addEventListener('click', () => abre(!aberto()))
    botao.addEventListener('keydown', (e) => {
      if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return
      e.preventDefault()
      abre(true, e.key === 'ArrowDown' ? 0 : -1)
    })
    lista.addEventListener('keydown', (e) => {
      const l = itens()
      const i = l.indexOf(document.activeElement)
      const ir = { ArrowDown: i + 1, ArrowUp: i - 1, Home: 0, End: l.length - 1 }[e.key]
      if (ir === undefined) return
      e.preventDefault()
      l[(ir + l.length) % l.length].focus()
    })
    raiz.addEventListener('focusout', (e) => { if (aberto() && e.relatedTarget && !raiz.contains(e.relatedTarget)) abre(false) })
    document.addEventListener('click', (e) => { if (aberto() && !raiz.contains(e.target)) abre(false) })
    document.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape' || !aberto()) return
      abre(false)
      botao.focus()
    })
  }
})()

;(() => {
  const isolado = document.documentElement.dataset.isolado
  if (!isolado) return
  const fonte = new URL('../', document.baseURI).pathname
  const comModo = (href) => {
    const u = new URL(href, document.baseURI)
    if (u.origin !== location.origin || u.pathname.startsWith(isolado) || !u.pathname.startsWith(fonte)) return href
    const resto = u.pathname.slice(fonte.length)
    const ehRaiz = resto === '' || resto === 'index.html'
    const pagina = ehRaiz ? '' : resto.match(/^(calculadora|nivel|tier|posicionamento|monte-seu-time|farm|shinies)\/$/)?.[1]
    if (pagina == null) return href
    return new URL(`${isolado}${pagina ? pagina + '/' : ''}${ehRaiz ? '' : u.search + u.hash}`, location.origin).toString()
  }
  const svg = (d) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`
  const ITENS = [
    { p: '', n: 'Início', ic: svg('<path d="M3.5 11 12 4l8.5 7"/><path d="M5.5 9.5V20h13V9.5"/><path d="M10 20v-5.5h4V20"/>') },
    { p: 'calculadora/', d: 'Nota, score e preço', n: 'Calculadora', ic: svg('<rect x="5" y="2.5" width="14" height="19" rx="3"/><path d="M8.5 6.5h7M8.5 11h.01M12 11h.01M15.5 11h.01M8.5 14.5h.01M12 14.5h.01M8.5 18h.01M12 18h.01M15.5 14.5V18"/>') },
    { p: 'nivel/', d: 'Quando você chega lá', n: 'Nível', ic: svg('<path d="M2.5 20.5 9 9.5l3.6 5.6 2.4-3.4 6.5 8.8z"/><path d="M15 11.7V3.5l4.5 1.8L15 7.1"/>') },
    { p: 'tier/', d: 'O meta do ranqueado, todo dia', n: 'Tier PvP', ic: svg('<path d="M8 3.5h8V9a4 4 0 0 1-8 0z"/><path d="M8 5.5H5a3 3 0 0 0 3.2 4M16 5.5h3a3 3 0 0 1-3.2 4M12 13v3.5M8.5 20.5h7M9.5 16.5h5v4h-5z"/>') },
    { p: 'posicionamento/', d: 'Formações do top 200 do PvP', n: 'Posicionamento', ic: svg('<rect x="3.5" y="3.5" width="17" height="17" rx="3"/><path d="M3.5 12h17"/><circle cx="12" cy="12" r="3"/><path d="M8 7.5h.01M16 7.5h.01M8 16.5h.01M12 16.5h.01M16 16.5h.01"/>') },
    { p: 'monte-seu-time/', d: 'Passivas do PvP no tabuleiro', n: 'Monte seu time', ic: svg('<path d="M12 3.5l1.8 5.2 5.2 1.8-5.2 1.8L12 17.5l-1.8-5.2L5 10.5l5.2-1.8z"/><path d="M18.5 15.5l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z"/>') },
    { p: 'farm/', d: 'Quem mais farma agora', n: 'Top farm', ic: svg('<path d="M4 19.5h16"/><path d="M7 16v-4M12 16V7M17 16v-7"/><path d="M14.5 4.5 17 3l1.5 2.5"/>') },
    { p: 'shinies/', d: 'Os capturados no último dia', n: 'Shinies 24h', ic: svg('<path d="M12 2.5c.9 4.6 2.9 6.6 7.5 7.5-4.6.9-6.6 2.9-7.5 7.5-.9-4.6-2.9-6.6-7.5-7.5 4.6-.9 6.6-2.9 7.5-7.5z"/><path d="M19 16v4.5M16.75 18.25h4.5"/>') },
  ]
  const atual = location.pathname.slice(isolado.length).replace(/index\.html$/, '')
  const link = (it, rico = false) => {
    const a = document.createElement('a')
    a.href = isolado + it.p
    if (rico) {
      const ic = novoEl('span', 'ferr-ic'); ic.innerHTML = it.ic
      const txt = novoEl('span', 'ferr-txt'); txt.append(novoEl('b', null, it.n), novoEl('small', null, it.d || ''))
      a.append(ic, txt)
    } else {
      a.innerHTML = `<span class="ic">${it.ic}</span>`
      a.append(it.n)
    }
    if (it.p === atual) { a.className = 'ativo'; a.setAttribute('aria-current', 'page') }
    return a
  }
  const doGrupo = (pags) => pags.map((p) => ITENS.find((it) => it.p === `${p}/`)).filter(Boolean)
  const menus = []
  const fecharTodos = (exceto) => { for (const m of menus) if (m !== exceto) m.abre(false) }
  const montarTopo = (alvo) => {
    if (!alvo) return
    alvo.setAttribute('aria-label', 'Ferramentas')
    alvo.dataset.ferr = ''
    alvo.replaceChildren(link(ITENS[0]), ...SECOES_FERR.map(([id, nome, pags, icSec]) => {
      const itens = doGrupo(pags)
      const caixa = novoEl('div', 'sec-menu')
      const botao = novoEl('button', 'sec-botao')
      botao.type = 'button'
      botao.setAttribute('aria-expanded', 'false')
      botao.setAttribute('aria-controls', `sec-${id}`)
      botao.innerHTML = `<span class="ic">${svg(icSec)}</span>`
      botao.append(nome)
      botao.insertAdjacentHTML('beforeend', '<svg class="seta" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>')
      if (itens.some((it) => it.p === atual)) botao.classList.add('ativo')
      const pop = novoEl('div', 'ferr-lista sec-pop')
      pop.id = `sec-${id}`
      pop.setAttribute('aria-label', nome)
      pop.append(...itens.map((it) => link(it, true)))
      const menu = { abre: (v) => { botao.setAttribute('aria-expanded', String(v)); pop.classList.toggle('aberta', v) } }
      menus.push(menu)
      botao.addEventListener('click', () => { const v = botao.getAttribute('aria-expanded') !== 'true'; fecharTodos(menu); menu.abre(v) })
      caixa.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && botao.getAttribute('aria-expanded') === 'true') { menu.abre(false); botao.focus() }
        if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return
        const l = [...pop.querySelectorAll('a')]
        const i = l.indexOf(document.activeElement)
        e.preventDefault()
        menu.abre(true)
        l[(i < 0 ? (e.key === 'ArrowDown' ? 0 : -1) : i + (e.key === 'ArrowDown' ? 1 : -1) + l.length) % l.length]?.focus()
      })
      caixa.addEventListener('focusout', (e) => { if (e.relatedTarget && !caixa.contains(e.relatedTarget)) menu.abre(false) })
      caixa.append(botao, pop)
      return caixa
    }))
    document.addEventListener('click', (e) => { if (!alvo.contains(e.target)) fecharTodos() })
  }
  const montarPainel = (alvo) => {
    if (!alvo) return
    alvo.setAttribute('aria-label', 'Ferramentas')
    alvo.dataset.ferr = ''
    alvo.replaceChildren(link(ITENS[0]), ...SECOES_FERR.flatMap(([, nome, pags]) => [novoEl('span', 'nav-sec', nome), ...doGrupo(pags).map((it) => link(it))]))
  }
  montarTopo(document.querySelector('.topo .secoes'))
  montarPainel(document.querySelector('.painel-menu nav'))
  const marca = document.querySelector('.topo .marca')
  if (marca && !marca.querySelector('.marca-ferr')) {
    const tag = document.createElement('span')
    tag.className = 'marca-ferr'
    tag.textContent = 'Ferramentas'
    marca.append(tag)
    marca.setAttribute('aria-label', 'PokePocket Ferramentas, início')
  }
  const troca = (e) => {
    const a = e.target.closest?.('a[href]')
    if (a) { const novo = comModo(a.href); if (novo !== a.href) a.href = novo }
  }
  for (const ev of ['click', 'auxclick', 'contextmenu', 'mouseover', 'focusin', 'touchstart']) document.addEventListener(ev, troca, { capture: true, passive: true })
})()

;(() => {
  const iso = !!document.documentElement.dataset.isolado
  const fonte = RAIZ_PP
  const CORACAO = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 20.5s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.6a4.3 4.3 0 0 1 7.5 2.7c0 5.6-7.5 10.2-7.5 10.2z"/></svg>'
  let pop = null
  const montar = () => {
    pop = document.createElement('dialog')
    pop.className = 'apoie-pop'
    pop.setAttribute('aria-labelledby', 'apoie-tit')
    const it = (n, w, d) => `<img class="pix" src="${fonte}assets/itens/${n}.png" alt="" style="width:${w}px;animation-delay:${d}s" />`
    pop.innerHTML = `
      <button type="button" class="apoie-fechar" aria-label="Fechar"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg></button>
      <div class="apoie-cab"><span class="apoie-rot">Créditos</span><h2 id="apoie-tit">Feito por fãs</h2><p>É grátis e continua grátis.</p></div>
      <div class="apoie-grade">
        <div class="apoie-autor">
          <div class="apoie-palco">
            <div class="apoie-luz"></div>
            <span class="apoie-nota" style="left:18%;top:22%">♪</span><span class="apoie-nota" style="left:74%;top:16%;animation-delay:.8s">♫</span><span class="apoie-nota" style="left:52%;top:30%;animation-delay:1.6s">♪</span>
            <div class="apoie-dancam">${it('bulbasaur', 64, 0)}${it('charmander', 70, 0.15)}${it('squirtle', 62, 0.3)}${it('pikachu', 80, 0.45)}</div>
          </div>
          <div class="apoie-nome"><small>Feito com carinho pela</small><b><svg viewBox="0 0 64 40" aria-hidden="true"><path d="M4 34L8 10l14 12L32 4l10 18 14-12 4 24z" fill="#ffd34d" stroke="#7d5313" stroke-width="3" stroke-linejoin="round"/></svg>Equipe PokePocket</b></div>
        </div>
        <div class="apoie-doar">${apoioHTML(fonte)}
        </div>
      </div>`
    document.body.append(pop)
    pop.querySelector('.apoie-fechar').addEventListener('click', () => pop.close())
    pop.addEventListener('click', (e) => { if (e.target === pop) pop.close() })
  }
  const hoje = () => { const d = new Date(); return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}` }
  const ler = (k) => { try { return JSON.parse(localStorage.getItem(k) || 'null') } catch { return null } }
  const gravar = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)) } catch {} }
  const abrir = () => { if (!pop) montar(); if (!pop.open) pop.showModal(); gravar('pp-apoio-visto', hoje()) }
  const USO_ATE_MOSTRAR = 3 * 60000
  const PASSO = 5000
  setInterval(() => {
    if (document.hidden || ler('pp-apoio-visto') === hoje()) return
    const u = ler('pp-uso')
    const ms = (u?.dia === hoje() ? u.ms : 0) + PASSO
    gravar('pp-uso', { dia: hoje(), ms })
    if (ms < USO_ATE_MOSTRAR || document.querySelector('dialog[open]')) return
    abrir()
  }, PASSO)
  if (iso) document.addEventListener('click', (e) => {
    const a = e.target.closest?.('.coracao, .apoio, a[href$="#apoie"]')
    if (!a) return
    e.preventDefault()
    abrir()
  }, true)
  const acoes = iso && document.querySelector('.topo .acoes-topo')
  if (acoes && !acoes.querySelector('.coracao')) {
    const b = document.createElement('a')
    b.className = 'coracao'
    b.href = '#apoie'
    b.setAttribute('aria-label', 'Apoie o projeto')
    b.title = 'Apoie'
    b.innerHTML = CORACAO
    acoes.prepend(b)
  }
  const cor = document.querySelector('.topo .acoes-topo .coracao')
  if (cor && !cor.querySelector('.coracao-pika')) {
    cor.classList.add('coracao-pilula')
    cor.insertAdjacentHTML('afterbegin', `<span class="pk-raio" aria-hidden="true"><i></i></span><span class="coracao-pika" aria-hidden="true" style="--gg:url('${fonte}assets/itens/gengar-tchau.png')"><span class="pk-portal"></span><span class="pk-luz"><span class="pk-eco"></span><span class="pk-gg"></span></span><span class="pk-mega-wrap"><span class="pk-mega" style="--mg:url('${fonte}assets/itens/gengar-mega.png')"><span class="pk-mega-olhos" style="background-image:url('${fonte}assets/itens/gengar-mega-olhos.png')"></span></span></span></span><span class="coracao-txt">Apoie</span>`)
  }
  if (cor && !iso) cor.addEventListener('click', (e) => { if (matchMedia('(min-width: 1181px)').matches) { e.preventDefault(); abrir() } })
  const gg = cor && cor.querySelector('.pk-gg')
  if (gg) {
    let dentro = false, espera = null
    const visivel = () => parseFloat(getComputedStyle(gg).opacity) > 0.35
    const checar = () => { if (!dentro) return; if (visivel()) { cor.classList.add('mega'); espera = null } else espera = setTimeout(checar, 100) }
    const entra = () => { dentro = true; clearTimeout(espera); checar() }
    const sai = () => { dentro = false; clearTimeout(espera); cor.classList.remove('mega') }
    cor.addEventListener('pointerenter', entra)
    cor.addEventListener('pointerleave', sai)
    cor.addEventListener('focus', entra)
    cor.addEventListener('blur', sai)
  }
  if (iso && location.hash === '#apoie') abrir()
})()
