const STATS = [['hp', /^HP$/], ['atk', /^ATK$/], ['def', /^DEF$/], ['spAtk', /^SP\.?\s*ATK$/], ['spDef', /^SP\.?\s*DEF$/], ['speed', /^(SPD|SPEED|SPE|VEL)$/]]
const TIPOS = ['NORMAL', 'FIRE', 'WATER', 'GRASS', 'ELECTRIC', 'ICE', 'FIGHTING', 'POISON', 'GROUND', 'FLYING', 'PSYCHIC', 'BUG', 'ROCK', 'GHOST', 'DRAGON', 'DARK', 'STEEL', 'FAIRY']

const semAcento = (t) => String(t ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()

const CAMPOS = [
  ['especie', /^(especie|species)$/],
  ['shiny', /^shiny$/],
  ['nivel', /^(nivel|level)$/],
  ['potencia', /^(potencia|potency)$/],
  ['qualidade', /^(qualidade|quality|calidad)$/],
  ['nota', /^(nota da calculadora|calculator score|nota de la calculadora)$/],
  ['zmove', /^z-?move$/],
  ['categoria', /^(categoria|category)$/],
  ['aoe', /^(tm aoe|aoe tm)$/]
]

const SIM = /^(sim|yes|si)\b/

function numero(t) {
  const s = String(t ?? '').trim()
  const m = /^[-+]?\d[\d,]*(\.\d+)?/.exec(s)
  if (!m) return null
  const v = Number(m[0].replace(/,/g, ''))
  return Number.isFinite(v) ? v : null
}

function celulas(linha) {
  return linha.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((c) => c.trim())
}

function lerTabela(linhas) {
  const ivs = {}
  const refino = {}
  for (let i = 0; i < linhas.length; i++) {
    const cab = linhas[i]
    if (!/^\s*\|/.test(cab) || !/^\s*\|?\s*:?-{3,}/.test(linhas[i + 1] || '')) continue
    const col = celulas(cab).map(semAcento)
    const iIv = col.findIndex((c) => /^iv\b/.test(c))
    const iBase = col.findIndex((c) => /^base\b|\bbase$|species base/.test(c))
    const iRef = col.findIndex((c) => /^(refino|refine|refinado)\b/.test(c))
    if (iIv < 0 && iRef < 0) continue
    for (let j = i + 2; j < linhas.length && /^\s*\|/.test(linhas[j]); j++) {
      const c = celulas(linhas[j])
      const rot = String(c[0] || '').toUpperCase().replace(/\*/g, '').trim()
      const stat = STATS.find(([, re]) => re.test(rot))?.[0]
      if (!stat) continue
      if (iIv >= 0) {
        const v = numero(c[iIv])
        if (v != null) ivs[stat] = v
      }
      if (iRef >= 0) {
        const v = numero(String(c[iRef]).replace(/^\+/, ''))
        if (v != null) refino[stat] = v
      } else if (iBase >= 0) {
        const m = /\+\s*(\d[\d,]*)/.exec(String(c[iBase]))
        if (m) refino[stat] = numero(m[1])
      }
    }
    break
  }
  return { ivs, refino }
}

export function lerTextoFicha(texto) {
  const bruto = String(texto ?? '')
  if (!bruto.trim()) return null
  const linhas = bruto.replace(/\r/g, '').split('\n')
  const v = {}
  for (const l of linhas) {
    const m = /^\s*[-*•]\s*([^:]+?)\s*:\s*(.+?)\s*$/.exec(l.replace(/\*\*|__/g, ''))
    if (!m) continue
    const rot = semAcento(m[1])
    const campo = CAMPOS.find(([, re]) => re.test(rot))?.[0]
    if (campo && v[campo] == null) v[campo] = m[2]
  }
  const { ivs, refino } = lerTabela(linhas)
  if (!v.especie && !Object.keys(ivs).length) return null
  let nome = null
  let dex = null
  let tipos = []
  if (v.especie) {
    const m = /^(.+?)(?:\s*\(#(\d+)\))?(?:\s+[—–-]\s+([A-Z/\s]+))?$/.exec(v.especie.trim())
    nome = (m?.[1] || v.especie).replace(/✨/g, '').trim() || null
    dex = m?.[2] ? Number(m[2]) : null
    tipos = (m?.[3] || '').split('/').map((t) => t.trim()).filter((t) => TIPOS.includes(t))
  }
  const pot = /P\s*([1-5])\b/i.exec(v.potencia || '')
  const tipoZ = /Z-?Move\s+([A-Z]+)/.exec(v.zmove || '')
  const fisico = /^(fisico|physical)\b/.test(semAcento(v.categoria || ''))
  return {
    nome,
    dex,
    tipos,
    shiny: SIM.test(semAcento(v.shiny || '')) || /✨/.test(v.especie || ''),
    level: numero(v.nivel),
    potencia: pot ? Number(pot[1]) : null,
    quality: numero(v.qualidade),
    nota: numero(v.nota),
    ivs,
    refino,
    tmElemental: tipoZ && TIPOS.includes(tipoZ[1]) ? tipoZ[1] : null,
    tmFisico: tipoZ ? fisico : false,
    tmAoe: SIM.test(semAcento(v.aoe || ''))
  }
}
