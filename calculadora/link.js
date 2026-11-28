const VERSAO = 2
const CHAVES = ['hp', 'atk', 'def', 'spAtk', 'spDef', 'speed']
const TIPOS = ['NORMAL', 'FIRE', 'WATER', 'GRASS', 'ELECTRIC', 'ICE', 'FIGHTING', 'POISON', 'GROUND', 'FLYING', 'PSYCHIC', 'BUG', 'ROCK', 'GHOST', 'DRAGON', 'DARK', 'STEEL', 'FAIRY']
const ALFABETO = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_'

const inteiro = (v, min, max) => Math.min(max, Math.max(min, Math.round(Number(v) || 0)))
const temRefino = (r) => CHAVES.some((k) => Number(r?.[k]) > 0)

function escrever(bytes, v) {
  let n = Math.max(0, Math.floor(Number(v) || 0))
  do {
    let b = n % 128
    n = Math.floor(n / 128)
    if (n > 0) b |= 128
    bytes.push(b)
  } while (n > 0)
}

function leitor(bytes) {
  let i = 0
  return {
    num() {
      let v = 0
      let mult = 1
      for (let k = 0; k < 8; k++) {
        if (i >= bytes.length) throw new Error('link incompleto')
        const b = bytes[i++]
        v += (b & 127) * mult
        if (!(b & 128)) return v
        mult *= 128
      }
      throw new Error('link inválido')
    },
    texto() {
      const n = this.num()
      if (n > 60 || i + n > bytes.length) throw new Error('link inválido')
      const t = new TextDecoder().decode(new Uint8Array(bytes.slice(i, i + n)))
      i += n
      return t
    },
    fim: () => i >= bytes.length
  }
}

function paraBase64(bytes) {
  let s = ''
  for (let i = 0; i < bytes.length; i += 3) {
    const n = (bytes[i] << 16) | ((bytes[i + 1] ?? 0) << 8) | (bytes[i + 2] ?? 0)
    const q = Math.min(4, Math.ceil(((bytes.length - i) * 8) / 6))
    for (let k = 0; k < q; k++) s += ALFABETO[(n >> (18 - 6 * k)) & 63]
  }
  return s
}

function deBase64(txt) {
  const bytes = []
  let acc = 0
  let bits = 0
  for (const c of txt) {
    const v = ALFABETO.indexOf(c)
    if (v < 0) throw new Error('link inválido')
    acc = (acc << 6) | v
    bits += 6
    if (bits >= 8) {
      bits -= 8
      bytes.push((acc >> bits) & 255)
      acc &= (1 << bits) - 1
    }
  }
  return bytes
}

export function codificarCompacto({ hoje, sim }, resumo = null) {
  const b = [VERSAO]
  const outra = Number(sim.speciesId) !== Number(hoje.speciesId)
  const rh = temRefino(hoje.refino)
  const rs = temRefino(sim.refino)
  const flags = (hoje.shiny ? 1 : 0) | (sim.shiny ? 2 : 0) | (rh ? 4 : 0) | (rs ? 8 : 0) | (outra ? 16 : 0) | (sim.tmFisico ? 32 : 0) | (sim.tmAoe ? 64 : 0) | (resumo ? 128 : 0)
  escrever(b, flags)
  escrever(b, hoje.speciesId)
  escrever(b, inteiro(hoje.level, 1, 1e7))
  escrever(b, (inteiro(hoje.potencia, 1, 5) - 1) + 5 * (inteiro(sim.potencia, 1, 5) - 1))
  escrever(b, inteiro(Number(hoje.quality) * 1000, 0, 1e6))
  let ivs = 0
  CHAVES.forEach((k, i) => { ivs += (inteiro(hoje.ivs?.[k], 1, 32) - 1) * 32 ** i })
  escrever(b, ivs)
  if (rh) CHAVES.forEach((k) => escrever(b, inteiro(hoje.refino[k], 0, 1e6)))
  escrever(b, inteiro(sim.level, 1, 1e7))
  if (outra) escrever(b, sim.speciesId)
  if (rs) CHAVES.forEach((k) => escrever(b, inteiro(sim.refino[k], 0, 1e6)))
  escrever(b, sim.tmElemental ? TIPOS.indexOf(String(sim.tmElemental).toUpperCase()) + 1 : 0)
  escrever(b, hoje.tmElemental ? TIPOS.indexOf(String(hoje.tmElemental).toUpperCase()) + 1 : 0)
  escrever(b, (hoje.tmFisico ? 1 : 0) | (hoje.tmAoe ? 2 : 0))
  if (resumo) {
    const nome = new TextEncoder().encode(String(resumo.nome || '').slice(0, 40))
    escrever(b, nome.length)
    b.push(...nome)
    const opc = (v, f = 1) => (Number.isFinite(Number(v)) && v !== null ? Math.round(Number(v) * f) + 1 : 0)
    escrever(b, opc(resumo.pvp))
    escrever(b, opc(resumo.pve))
    escrever(b, opc(resumo.nota, 1000))
    escrever(b, opc(resumo.justo))
  }
  return paraBase64(b)
}

export const MARCA_ISOLADO = 'Ferramnt'

export function marcarIsolado(token) {
  const b = deBase64(token)
  while (b.length % 3) b.push(0)
  return paraBase64(b) + MARCA_ISOLADO
}

export function decodificarCompacto(token) {
  const txt = String(token || '').trim()
  if (!txt || txt.length > 200) throw new Error('link inválido')
  const r = leitor(deBase64(txt))
  const versao = r.num()
  if (versao !== 1 && versao !== 2) throw new Error('versão de link desconhecida')
  const flags = r.num()
  const hoje = { speciesId: r.num(), level: r.num() }
  const pot = r.num()
  hoje.potencia = (pot % 5) + 1
  hoje.quality = r.num() / 1000
  hoje.shiny = !!(flags & 1)
  let ivs = r.num()
  hoje.ivs = {}
  for (const k of CHAVES) {
    hoje.ivs[k] = (ivs % 32) + 1
    ivs = Math.floor(ivs / 32)
  }
  hoje.refino = Object.fromEntries(CHAVES.map((k) => [k, 0]))
  if (flags & 4) for (const k of CHAVES) hoje.refino[k] = r.num()
  const sim = { ...hoje, ivs: { ...hoje.ivs }, level: r.num(), potencia: Math.floor(pot / 5) + 1, shiny: !!(flags & 2) }
  sim.speciesId = flags & 16 ? r.num() : hoje.speciesId
  sim.refino = Object.fromEntries(CHAVES.map((k) => [k, 0]))
  if (flags & 8) for (const k of CHAVES) sim.refino[k] = r.num()
  const tm = r.num()
  sim.tmElemental = tm > 0 && tm <= TIPOS.length ? TIPOS[tm - 1] : null
  sim.tmFisico = !!(flags & 32)
  sim.tmAoe = !!(flags & 64)
  hoje.tmElemental = null
  hoje.tmFisico = false
  hoje.tmAoe = false
  if (versao >= 2) {
    const ht = r.num()
    const hf = r.num()
    hoje.tmElemental = ht > 0 && ht <= TIPOS.length ? TIPOS[ht - 1] : null
    hoje.tmFisico = !!(hf & 1)
    hoje.tmAoe = !!(hf & 2)
  }
  let resumo = null
  if (flags & 128) {
    const nome = r.texto()
    const opc = (f = 1) => {
      const v = r.num()
      return v ? (v - 1) / f : null
    }
    resumo = { nome, pvp: opc(), pve: opc(), nota: opc(1000), justo: opc() }
  }
  if (!(hoje.speciesId > 0) || !(sim.speciesId > 0)) throw new Error('link inválido')
  return { hoje, sim, resumo }
}
