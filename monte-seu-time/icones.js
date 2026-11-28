const C = {
  ve: '#d65a4f', veE: '#a8403a', veC: '#ee8a7c',
  br: '#ece3da', brE: '#c4b7ad', pr: '#2b2326',
  ou: '#e2b04a', ouE: '#b5852e', ouC: '#f6d683',
  ma: '#a26a42', maE: '#7b4c2e', maC: '#c48b5c',
  az: '#5f9bd1', azE: '#40729f', azC: '#9ccbeb',
  vd: '#6dbb6b', vdE: '#4b9450', vdC: '#9ad694',
  ro: '#9273c6', roE: '#6c519b', roC: '#b9a0e3',
  rs: '#e283b0', rsE: '#b65a88', rsC: '#f4b3d1',
  la: '#e98d45', laE: '#c06a2e', laC: '#f5b37a',
  me: '#bcc3cb', meE: '#868e98', meC: '#e3e8ee',
  ci: '#6c737c', ciE: '#4d535b'
}
const SN = 'stroke="none"'
const gota = (x, y, cor, luz) => `<path d="M${x} ${y}c.95 1.3 1.45 2.2 1.45 2.85a1.45 1.45 0 0 1-2.9 0c0-.65.5-1.55 1.45-2.85z" fill="${cor}"/><circle cx="${x - 0.45}" cy="${y + 2.75}" r=".38" fill="${luz}" ${SN}/>`
const brilho = (x, y, r, cor) => `<path d="M${x} ${y - r}l${r * 0.28} ${r * 0.72} ${r * 0.72} ${r * 0.28}-${r * 0.72} ${r * 0.28}-${r * 0.28} ${r * 0.72}-${r * 0.28}-${r * 0.72}-${r * 0.72}-${r * 0.28} ${r * 0.72}-${r * 0.28}z" fill="${cor}"/>`

const I = {
  rocky_helmet: `
    <path d="M2.3 6.2 4.6 5l1.2 2.3-2.3 1.2z" fill="${C.ma}"/><path d="M18.4 2.4l2.8-.5.7 2.7-2.6 1.1z" fill="${C.maC}"/><path d="M20.6 8l1.9.6-.8 1.8-1.6-.8z" fill="${C.ma}"/>
    <path d="M4.4 17.2v-3.4a7.6 7.6 0 0 1 15.2 0v3.4z" fill="${C.me}"/>
    <path d="M14.8 6.8a7.6 7.6 0 0 1 4.8 7v3.4h-3.1v-3.4c0-2.8-.6-5.2-1.7-7z" fill="${C.meE}" ${SN}/>
    <path d="M7.4 9.6c.6-1.2 1.6-2.2 2.8-2.7" fill="none" stroke="${C.meC}" stroke-width="1.1"/>
    <path d="M12 6.2v3.6" fill="none" stroke="${C.meE}" stroke-width="1.2"/>
    <rect x="6.6" y="12.4" width="10.8" height="2.2" rx="1.1" fill="${C.pr}"/>
    <rect x="2.6" y="16.4" width="18.8" height="3.4" rx="1.5" fill="${C.ciE}"/><rect x="3.6" y="17" width="16.8" height=".9" rx=".45" fill="${C.ci}" ${SN}/>`,
  rain_dance: `
    <path d="M6.8 14.4a4.1 4.1 0 0 1-.5-8.2 5.6 5.6 0 0 1 10.8 1.8 3.25 3.25 0 0 1-.1 6.4z" fill="${C.br}"/>
    <path d="M3.4 11.6c.6 1.7 2 2.8 3.4 2.8h10.2c1.7 0 3-1.2 3.2-2.8-.6.8-1.6 1.3-2.7 1.3H7c-1.5 0-2.8-.5-3.6-1.3z" fill="${C.brE}" ${SN}/>
    <path d="M8.2 8.8a3.2 3.2 0 0 1 2.8-1.8" fill="none" stroke="#fff" stroke-width="1.1" ${SN === '' ? '' : ''}/>
    ${gota(7.8, 16.4, C.az, C.azC)}${gota(12, 17.4, C.az, C.azC)}${gota(16.2, 16.4, C.az, C.azC)}`,
  swarm: `
    <ellipse cx="8.2" cy="8.4" rx="3.3" ry="2.1" transform="rotate(-32 8.2 8.4)" fill="#e4f1fa"/><ellipse cx="15.8" cy="8.4" rx="3.3" ry="2.1" transform="rotate(32 15.8 8.4)" fill="#e4f1fa"/>
    <path d="M10.6 5.2 9.6 3.2M13.4 5.2l1-2" fill="none" stroke="${C.pr}" stroke-width="1"/>
    <ellipse cx="12" cy="14.6" rx="5" ry="6.1" fill="${C.ou}"/>
    <path d="M14.2 9.1c1.7 1 2.8 3 2.8 5.5 0 3.4-2.2 6.1-5 6.1v-.9c1.7-.6 3-2.8 3-5.2 0-2.3-.4-4-.8-5.5z" fill="${C.ouE}" ${SN}/>
    <path d="M7.3 12.2c3.1.5 6.3.5 9.4 0l.2 1.9c-3.3.6-6.5.6-9.8 0zM7.1 16.1c3.3.6 6.5.6 9.8 0l-.4 1.9c-3 .5-6 .5-9 0z" fill="${C.pr}"/>
    <circle cx="12" cy="7" r="2.3" fill="${C.pr}"/><circle cx="11.3" cy="6.5" r=".5" fill="#fff" ${SN}/>
    <path d="M12 20.7v1.3" fill="none" stroke="${C.pr}" stroke-width="1.1"/>`,
  intimidate: `
    <path d="M4.8 6.6 3.2 2.8l4.4 2.4zM19.2 6.6l1.6-3.8-4.4 2.4z" fill="${C.roE}"/>
    <path d="M1.8 12.5S5.6 6.3 12 6.3s10.2 6.2 10.2 6.2S18.4 18.7 12 18.7 1.8 12.5 1.8 12.5z" fill="${C.ro}"/>
    <path d="M12 16.9c4.6 0 7.8-2.9 9-4.4.4.6-3.3 6.2-9 6.2S2.4 13.1 2.8 12.5c1.2 1.5 4.6 4.4 9.2 4.4z" fill="${C.roE}" ${SN}/>
    <circle cx="12" cy="12.5" r="4.2" fill="${C.ou}"/><path d="M14.6 9.2a4.2 4.2 0 0 1-2.6 7.5v-1a3.4 3.4 0 0 0 1.6-6.4z" fill="${C.ouE}" ${SN}/>
    <path d="M12 8.6c1.2 1.3 1.2 6.5 0 7.8-1.2-1.3-1.2-6.5 0-7.8z" fill="${C.pr}"/>
    <circle cx="13.9" cy="10.6" r=".8" fill="#fff" ${SN}/>`,
  iron_defense: `
    <path d="M12 2.4 20.2 5.5v6.1c0 4.9-3.4 8.7-8.2 10.4-4.8-1.7-8.2-5.5-8.2-10.4V5.5z" fill="${C.me}"/>
    <path d="M12 2.4 20.2 5.5v6.1c0 4.9-3.4 8.7-8.2 10.4z" fill="${C.meE}" ${SN}/>
    <path d="M12 4.8 6 7v4.5c0 3.5 2.3 6.4 6 7.8 3.7-1.4 6-4.3 6-7.8V7z" fill="none" stroke="${C.meC}" stroke-width=".9" ${SN}/>
    <circle cx="12" cy="11.6" r="2.6" fill="${C.ou}"/><path d="M13.6 9.6a2.6 2.6 0 0 1-1.6 4.6v-.9a1.7 1.7 0 0 0 .9-3.1z" fill="${C.ouE}" ${SN}/>
    <circle cx="7.6" cy="7.8" r=".85" fill="${C.ciE}"/><circle cx="16.4" cy="7.8" r=".85" fill="${C.ciE}"/><circle cx="8.4" cy="15.6" r=".85" fill="${C.ciE}"/><circle cx="15.6" cy="15.6" r=".85" fill="${C.ciE}"/>`,
  burn: `
    <path d="M12 21.8c-4.2 0-7.1-2.9-7.1-6.7 0-3.7 2.8-5.8 3.8-9 .9 1.7 1.7 2.8 3 3.5.2-3.1 1.8-6 3.8-7.8.4 3.6 3.7 6.3 3.7 11 0 4.8-3 9-7.2 9z" fill="${C.ve}"/>
    <path d="M12 21.8c-2.9 0-5-2.1-5-4.8 0-2.7 2-4.2 2.8-6.5.7 1.2 1.3 2 2.3 2.5.2-2.2 1.3-4.2 2.7-5.5.3 2.6 2.6 4.5 2.6 7.9 0 3.5-2.2 6.4-5.4 6.4z" fill="${C.la}"/>
    <path d="M12 21.8c-1.7 0-2.9-1.2-2.9-2.9 0-1.8 1.5-2.7 2.1-4.3.9 1 2.2 1.9 2.6 3.4.5 1.9-.4 3.8-1.8 3.8z" fill="${C.ouC}"/>`,
  poison: `
    <circle cx="19" cy="5" r="1.8" fill="${C.roC}"/><circle cx="20.8" cy="9.2" r="1.05" fill="${C.ro}"/>
    <path d="M11.4 2.6s-6.1 6.8-6.1 11.2a6.1 6.1 0 0 0 12.2 0c0-4.4-6.1-11.2-6.1-11.2z" fill="${C.ro}"/>
    <path d="M13.6 5.4c1.9 2.6 3.9 5.9 3.9 8.4a6.1 6.1 0 0 1-6.1 6.1v-1c2.7-.3 4.8-2.4 4.8-5.1 0-2.6-1.3-5.4-2.6-8.4z" fill="${C.roE}" ${SN}/>
    <ellipse cx="8.6" cy="12.6" rx="1" ry="1.9" transform="rotate(20 8.6 12.6)" fill="${C.roC}" ${SN}/>
    <circle cx="11.2" cy="16" r="1.4" fill="${C.roC}"/><circle cx="13.8" cy="12.8" r=".9" fill="${C.roC}"/>`,
  freeze: `
    <g fill="none" stroke-width="3.6"><path d="M12 2.8v18.4M4 7.4l16 9.2M4 16.6l16-9.2"/><path d="M9.7 4.1 12 6.5l2.3-2.4M9.7 19.9 12 17.5l2.3 2.4M6.1 6l1 3.2-3.3.8M17.9 6l-1 3.2 3.3.8M6.1 18l1-3.2-3.3-.8M17.9 18l-1-3.2 3.3-.8"/></g>
    <g fill="none" stroke="${C.azC}" stroke-width="1.9"><path d="M12 2.8v18.4M4 7.4l16 9.2M4 16.6l16-9.2"/><path d="M9.7 4.1 12 6.5l2.3-2.4M9.7 19.9 12 17.5l2.3 2.4M6.1 6l1 3.2-3.3.8M17.9 6l-1 3.2 3.3.8M6.1 18l1-3.2-3.3-.8M17.9 18l-1-3.2 3.3-.8"/></g>
    <path d="M12 8.6l3 1.7v3.4L12 15.4l-3-1.7v-3.4z" fill="${C.br}"/><path d="M12 8.6l3 1.7v3.4L12 15.4z" fill="${C.azC}" ${SN}/>`,
  paralyze: `
    <path d="M14.2 1.8 4.4 14.2h7l-1.3 8L20 9.8h-7.1z" fill="${C.ou}"/>
    <path d="M14.2 1.8 11.4 9.8H20L10.1 22.2l1.3-8 1.5-4.4h-1.2z" fill="${C.ouE}" ${SN}/>
    <path d="M12.6 4.6 7.6 11" fill="none" stroke="${C.ouC}" stroke-width="1" ${SN}/>`,
  leech_seed: `
    <path d="M3.4 21.6c1.1-2.6 4.6-4 8.6-4s7.5 1.4 8.6 4z" fill="${C.ma}"/><path d="M14 17.8c3 .4 5.6 1.7 6.6 3.8h-3.4c-.4-1.6-1.6-3-3.2-3.8z" fill="${C.maE}" ${SN}/>
    <path d="M12 18.6v-6.2" fill="none" stroke="${C.vdE}" stroke-width="1.8"/>
    <path d="M12 12.8c0-4.7 3.1-7.6 8.3-7.6 0 5-3.1 7.6-8.3 7.6z" fill="${C.vd}"/><path d="M12 12.8c2.6-.6 4.9-3.1 8.3-7.6 0 5-3.1 7.6-8.3 7.6z" fill="${C.vdE}" ${SN}/>
    <path d="M12 14.8c0-3.6-2.4-5.9-6.4-5.9 0 3.8 2.4 5.9 6.4 5.9z" fill="${C.vdC}"/><path d="M12 14.8c-1.9-.6-3.7-2.3-6.4-5.9 0 3.8 2.4 5.9 6.4 5.9z" fill="${C.vd}" ${SN}/>`,
  dig: `
    <path d="M2.6 21.8c.6-2.2 2.4-3.6 4.8-3.6s4.2 1.4 4.8 3.6z" fill="${C.ma}"/><circle cx="4.6" cy="17.4" r=".7" fill="${C.maE}"/><circle cx="11.6" cy="16.6" r=".6" fill="${C.maE}"/>
    <path d="M10.4 13.6 19.1 4.9l1.4 1.4-8.7 8.7z" fill="${C.ma}"/><path d="M19.8 5.6l.7.7-8.7 8.7-.7-.7z" fill="${C.maE}" ${SN}/>
    <path d="M17.2 2.2l4.6 4.6-1.4 1.4-4.6-4.6z" fill="${C.maE}"/>
    <path d="M8.2 10.4l5.4 5.4-3.6 3.6a3 3 0 0 1-4.3 0l-1.1-1.1a3 3 0 0 1 0-4.3z" fill="${C.me}"/>
    <path d="M13.6 15.8l-3.6 3.6a3 3 0 0 1-4.3 0l-.5-.5 7-7z" fill="${C.meE}" ${SN}/>`,
  confusion: `
    <path d="M12.2 11.5c.7-.5 1.8-.3 2.2.6.6 1.2-.1 2.8-1.6 3.3-2 .7-4.3-.6-4.7-2.8-.6-2.9 1.5-5.6 4.3-6 3.6-.5 6.7 2.2 6.9 5.8.2 4.3-3.2 7.8-7.4 7.8-4.6 0-8.2-3.7-8.1-8.3" fill="none" stroke-width="3.8"/>
    <path d="M12.2 11.5c.7-.5 1.8-.3 2.2.6.6 1.2-.1 2.8-1.6 3.3-2 .7-4.3-.6-4.7-2.8-.6-2.9 1.5-5.6 4.3-6 3.6-.5 6.7 2.2 6.9 5.8.2 4.3-3.2 7.8-7.4 7.8-4.6 0-8.2-3.7-8.1-8.3" fill="none" stroke="${C.rs}" stroke-width="2.2"/>
    ${brilho(19.2, 4, 2.2, C.ou)}${brilho(5, 4.4, 1.5, C.ouC)}`,
  fear: `
    <path d="M4.8 21.2V11a7.2 7.2 0 0 1 14.4 0v10.2l-2.4-1.8-2.4 1.8-2.4-1.8-2.4 1.8-2.4-1.8z" fill="${C.ro}"/>
    <path d="M14.2 4.4A7.2 7.2 0 0 1 19.2 11v10.2l-2.4-1.8-.7.5V11c0-2.8-.7-5-1.9-6.6z" fill="${C.roE}" ${SN}/>
    <path d="M7.2 9.4c.4-1.6 1.5-2.9 2.9-3.5" fill="none" stroke="${C.roC}" stroke-width="1.1" ${SN}/>
    <ellipse cx="9.3" cy="11" rx="1.35" ry="1.8" fill="${C.pr}"/><ellipse cx="14.5" cy="11" rx="1.35" ry="1.8" fill="${C.pr}"/>
    <path d="M10 16c.6-.9 1.2-1.4 1.9-1.4s1.3.5 1.9 1.4c-.6.4-1.2.6-1.9.6s-1.3-.2-1.9-.6z" fill="${C.pr}"/>`,
  rock_smash: `
    <path d="M2.4 6.4l2.2 1.4M4.4 2.6l1.4 2.4M8.8 2.2l.3 2.4" fill="none" stroke="${C.ou}" stroke-width="1.6"/>
    <rect x="7.4" y="17.4" width="9.8" height="4.4" rx="1.2" fill="${C.br}"/><rect x="7.4" y="18.8" width="9.8" height="1.2" fill="${C.brE}" ${SN}/>
    <path d="M5.6 11.4a6.6 6.6 0 0 1 12.8-2.4c1.3.4 2.2 1.6 2.2 3v2.2a5 5 0 0 1-5 5H10.4a4.8 4.8 0 0 1-4.8-4.8z" fill="${C.ve}"/>
    <path d="M18.4 9c1.3.4 2.2 1.6 2.2 3v2.2a5 5 0 0 1-5 5h-1.4a5 5 0 0 0 5-5v-2.2c0-1.1-.3-2.2-.8-3z" fill="${C.veE}" ${SN}/>
    <path d="M9.6 12.6c1.2-.9 3.1-.9 4.3.2" fill="none" stroke="${C.veE}" stroke-width="1.1" ${SN}/>
    <path d="M8.4 8.4c.7-1.3 1.9-2.2 3.3-2.5" fill="none" stroke="${C.veC}" stroke-width="1.1" ${SN}/>`,
  whirlwind: `
    <rect x="2.2" y="3" width="19.6" height="3" rx="1.5" fill="${C.meC}"/>
    <rect x="4.6" y="7.3" width="15.2" height="3" rx="1.5" fill="${C.azC}"/>
    <rect x="7.4" y="11.6" width="11" height="3" rx="1.5" fill="${C.meC}"/>
    <rect x="9.8" y="15.9" width="7" height="3" rx="1.5" fill="${C.azC}"/>
    <rect x="12" y="20.1" width="3.4" height="2.6" rx="1.3" fill="${C.meC}"/>
    <path d="M17 4.5h3.4M16.4 8.8h2M15.2 13.1h1.8" fill="none" stroke="${C.meE}" stroke-width="1" ${SN}/>`,
  assurance: `
    <path d="M20.2 14.6A8.8 8.8 0 1 1 9.4 3.8a7 7 0 0 0 10.8 10.8z" fill="${C.ouC}"/>
    <path d="M20.2 14.6A8.8 8.8 0 0 1 4.6 18.4a8.8 8.8 0 0 0 13.4-3.7 6.9 6.9 0 0 0 2.2-.1z" fill="${C.ouE}" ${SN}/>
    <circle cx="8.4" cy="13.4" r="1" fill="${C.ouE}" ${SN}/><circle cx="11.6" cy="17" r=".7" fill="${C.ouE}" ${SN}/>
    ${brilho(16.6, 4.6, 2, C.br)}${brilho(21, 9.4, 1.3, C.brE)}`,
  charm: `
    <path d="M11.6 21.2s-8.4-5.1-8.4-11.1a4.8 4.8 0 0 1 8.4-3.1 4.8 4.8 0 0 1 8.4 3.1c0 6-8.4 11.1-8.4 11.1z" fill="${C.rs}"/>
    <path d="M17.2 5.6A4.8 4.8 0 0 1 20 10.1c0 6-8.4 11.1-8.4 11.1v-1.8c3.6-2.6 6.9-6 6.9-9.3 0-1.8-.5-3.4-1.3-4.5z" fill="${C.rsE}" ${SN}/>
    <ellipse cx="7.4" cy="9.4" rx="1.3" ry="2" transform="rotate(30 7.4 9.4)" fill="${C.rsC}" ${SN}/>
    ${brilho(20, 3.6, 2.3, C.ou)}`,
  recover: `
    <path d="M12 21.4s-8.6-5.2-8.6-11.3A4.9 4.9 0 0 1 12 6.9a4.9 4.9 0 0 1 8.6 3.2c0 6.1-8.6 11.3-8.6 11.3z" fill="${C.vd}"/>
    <path d="M17.6 5.4a4.9 4.9 0 0 1 3 4.7c0 6.1-8.6 11.3-8.6 11.3v-1.8c3.8-2.7 7.1-6.2 7.1-9.5 0-1.9-.6-3.6-1.5-4.7z" fill="${C.vdE}" ${SN}/>
    <path d="M10.8 9.4h2.4v2.5h2.5v2.4h-2.5v2.5h-2.4v-2.5H8.3v-2.4h2.5z" fill="${C.br}"/>`
}

export const ICONES_PASSIVAS = Object.freeze(Object.fromEntries(Object.keys(I).map((k) => [k, true])))

export function iconePassiva(id) {
  const corpo = I[id]
  if (!corpo) return ''
  return `<svg viewBox="0 0 24 24" class="ic-cor" aria-hidden="true" style="overflow:visible"><g stroke="#1c1315" stroke-width=".8" stroke-linejoin="round" stroke-linecap="round">${corpo}</g></svg>`
}
