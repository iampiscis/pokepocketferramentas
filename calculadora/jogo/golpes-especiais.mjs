






import { isEspelhoFantasmaPokeId } from './outland.mjs';
import { COOLDOWN_600_MS } from './cooldown-golpes.mjs';

export const GOLPE_600_POR_TIPO = {
  GRASS: { name: 'Petal Bloom', power: 600, type: 'GRASS', category: 'SPECIAL', cooldownMs: COOLDOWN_600_MS },
  WATER: { name: 'Cyclonic Tide', power: 600, type: 'WATER', category: 'SPECIAL', cooldownMs: COOLDOWN_600_MS },
  FIRE: { name: 'Ignition Point', power: 600, type: 'FIRE', category: 'SPECIAL', cooldownMs: COOLDOWN_600_MS },
  FLYING: { name: 'Massive Hurricane', power: 600, type: 'FLYING', category: 'PHYSICAL', cooldownMs: COOLDOWN_600_MS },
  BUG: { name: 'Hive Crush', power: 600, type: 'BUG', category: 'PHYSICAL', cooldownMs: COOLDOWN_600_MS },
  POISON: { name: 'Toxic Deluge', power: 600, type: 'POISON', category: 'PHYSICAL', cooldownMs: COOLDOWN_600_MS },
  ELECTRIC: { name: 'Static Overload', power: 600, type: 'ELECTRIC', category: 'SPECIAL', cooldownMs: COOLDOWN_600_MS },
  GROUND: { name: 'Crossing Fissure', power: 600, type: 'GROUND', category: 'PHYSICAL', cooldownMs: COOLDOWN_600_MS },
  FIGHTING: { name: 'Meteor Fists', power: 600, type: 'FIGHTING', category: 'PHYSICAL', cooldownMs: COOLDOWN_600_MS },
  PSYCHIC: { name: 'Mental Singularity', power: 600, type: 'PSYCHIC', category: 'SPECIAL', cooldownMs: COOLDOWN_600_MS },
  ROCK: { name: 'Crumbling Rain', power: 600, type: 'ROCK', category: 'PHYSICAL', cooldownMs: COOLDOWN_600_MS },
  GHOST: { name: 'Untold Nightmare', power: 600, type: 'GHOST', category: 'SPECIAL', cooldownMs: COOLDOWN_600_MS },
  ICE: { name: 'Ice Time', power: 600, type: 'ICE', category: 'SPECIAL', cooldownMs: COOLDOWN_600_MS },
  DARK: { name: 'Endless Hollow', power: 600, type: 'DARK', category: 'PHYSICAL', cooldownMs: COOLDOWN_600_MS },
  STEEL: { name: 'Alloy Breaker', power: 600, type: 'STEEL', category: 'PHYSICAL', cooldownMs: COOLDOWN_600_MS },
  DRAGON: { name: 'Eternal Dragon', power: 600, type: 'DRAGON', category: 'SPECIAL', cooldownMs: COOLDOWN_600_MS },
  FAIRY: { name: 'Starlight Charm', power: 600, type: 'FAIRY', category: 'SPECIAL', cooldownMs: COOLDOWN_600_MS },
  NORMAL: { name: 'Ultimate Force', power: 600, type: 'NORMAL', category: 'PHYSICAL', cooldownMs: COOLDOWN_600_MS },
};








export const GOLPE_600_POR_TIPO_B = {
  NORMAL: { name: 'Giga Impact', power: 600, type: 'NORMAL', category: 'PHYSICAL', cooldownMs: COOLDOWN_600_MS },
  FIRE: { name: 'Blast Burn', power: 600, type: 'FIRE', category: 'SPECIAL', cooldownMs: COOLDOWN_600_MS },
  WATER: { name: 'Hydro Cannon', power: 600, type: 'WATER', category: 'SPECIAL', cooldownMs: COOLDOWN_600_MS },
  GRASS: { name: 'Frenzy Plant', power: 600, type: 'GRASS', category: 'SPECIAL', cooldownMs: COOLDOWN_600_MS },
  ELECTRIC: { name: 'Bolt Strike', power: 600, type: 'ELECTRIC', category: 'PHYSICAL', cooldownMs: COOLDOWN_600_MS },
  ICE: { name: 'Glacial Lance', power: 600, type: 'ICE', category: 'PHYSICAL', cooldownMs: COOLDOWN_600_MS },
  FIGHTING: { name: 'Meteor Assault', power: 600, type: 'FIGHTING', category: 'PHYSICAL', cooldownMs: COOLDOWN_600_MS },
  POISON: { name: 'Gunk Shot', power: 600, type: 'POISON', category: 'PHYSICAL', cooldownMs: COOLDOWN_600_MS },
  GROUND: { name: 'Precipice Blades', power: 600, type: 'GROUND', category: 'PHYSICAL', cooldownMs: COOLDOWN_600_MS },
  FLYING: { name: 'Sky Attack', power: 600, type: 'FLYING', category: 'PHYSICAL', cooldownMs: COOLDOWN_600_MS },
  PSYCHIC: { name: 'Prismatic Laser', power: 600, type: 'PSYCHIC', category: 'SPECIAL', cooldownMs: COOLDOWN_600_MS },
  BUG: { name: 'Megahorn', power: 600, type: 'BUG', category: 'PHYSICAL', cooldownMs: COOLDOWN_600_MS },
  ROCK: { name: 'Rock Wrecker', power: 600, type: 'ROCK', category: 'PHYSICAL', cooldownMs: COOLDOWN_600_MS },
  GHOST: { name: 'Astral Barrage', power: 600, type: 'GHOST', category: 'SPECIAL', cooldownMs: COOLDOWN_600_MS },
  DRAGON: { name: 'Roar of Time', power: 600, type: 'DRAGON', category: 'SPECIAL', cooldownMs: COOLDOWN_600_MS },
  DARK: { name: 'Wicked Blow', power: 600, type: 'DARK', category: 'PHYSICAL', cooldownMs: COOLDOWN_600_MS },
  STEEL: { name: 'Steel Beam', power: 600, type: 'STEEL', category: 'SPECIAL', cooldownMs: COOLDOWN_600_MS },
  FAIRY: { name: 'Light of Ruin', power: 600, type: 'FAIRY', category: 'SPECIAL', cooldownMs: COOLDOWN_600_MS },
};









export const GOLPE_600_RESERVA = {
  NORMAL: { name: 'Blood Moon', power: 600, type: 'NORMAL', category: 'PHYSICAL', cooldownMs: COOLDOWN_600_MS },
  FIRE: { name: 'Mind Blown', power: 600, type: 'FIRE', category: 'SPECIAL', cooldownMs: COOLDOWN_600_MS },
  WATER: { name: 'Steam Eruption', power: 600, type: 'WATER', category: 'SPECIAL', cooldownMs: COOLDOWN_600_MS },
  GRASS: { name: 'Chloroblast', power: 600, type: 'GRASS', category: 'SPECIAL', cooldownMs: COOLDOWN_600_MS },
  ELECTRIC: { name: 'Plasma Fists', power: 600, type: 'ELECTRIC', category: 'PHYSICAL', cooldownMs: COOLDOWN_600_MS },
  ICE: { name: 'Freeze Shock', power: 600, type: 'ICE', category: 'PHYSICAL', cooldownMs: COOLDOWN_600_MS },
  FIGHTING: { name: 'Combat Torque', power: 600, type: 'FIGHTING', category: 'PHYSICAL', cooldownMs: COOLDOWN_600_MS },
  POISON: { name: 'Noxious Torque', power: 600, type: 'POISON', category: 'PHYSICAL', cooldownMs: COOLDOWN_600_MS },
  GROUND: { name: "Land's Wrath", power: 600, type: 'GROUND', category: 'PHYSICAL', cooldownMs: COOLDOWN_600_MS },
  FLYING: { name: 'Bleakwind Storm', power: 600, type: 'FLYING', category: 'SPECIAL', cooldownMs: COOLDOWN_600_MS },
  PSYCHIC: { name: 'Psycho Boost', power: 600, type: 'PSYCHIC', category: 'SPECIAL', cooldownMs: COOLDOWN_600_MS },
  BUG: { name: 'Pollen Puff', power: 600, type: 'BUG', category: 'SPECIAL', cooldownMs: COOLDOWN_600_MS },
  ROCK: { name: 'Diamond Storm', power: 600, type: 'ROCK', category: 'PHYSICAL', cooldownMs: COOLDOWN_600_MS },
  GHOST: { name: 'Moongeist Beam', power: 600, type: 'GHOST', category: 'SPECIAL', cooldownMs: COOLDOWN_600_MS },
  DRAGON: { name: 'Dynamax Cannon', power: 600, type: 'DRAGON', category: 'SPECIAL', cooldownMs: COOLDOWN_600_MS },
  DARK: { name: 'Fiery Wrath', power: 600, type: 'DARK', category: 'SPECIAL', cooldownMs: COOLDOWN_600_MS },
  STEEL: { name: 'Make It Rain', power: 600, type: 'STEEL', category: 'SPECIAL', cooldownMs: COOLDOWN_600_MS },
  FAIRY: { name: 'Fleur Cannon', power: 600, type: 'FAIRY', category: 'SPECIAL', cooldownMs: COOLDOWN_600_MS },
};

export const TIPOS_ELEMENTO = Object.keys(GOLPE_600_POR_TIPO);

export function dexDe(id) {
  return id < 1000 ? id : id % 1000;
}


export function ehUltimaEvolucao(c) {
  return !c.evolvesToId;
}













export function elegivelParaGolpeEspecial(c) {
  if (!ehUltimaEvolucao(c)) return false;
  if (isEspelhoFantasmaPokeId(c.pokeId)) return false;


  if (c.megaDeDex != null) return false;




  if (c.golpesFechados) return false;
  return true;
}

export function temGolpe600DoTipo(attacks, tipo) {
  return (attacks ?? []).some((a) => a.power >= 600 && a.type === tipo);
}


export function limparGolpesQuebrados(attacks) {
  return (attacks ?? []).filter((a) => {
    if (!TIPOS_ELEMENTO.includes(a.type)) return false;
    if ((a.power ?? 0) <= 10) return false;
    return true;
  });
}







export function fixarCooldownGolpe600(creature) {
  let mexeu = false;
  for (const a of creature.attacks ?? []) {



    if (a.cdFixo) continue;
    if ((a.power ?? 0) >= 600 && a.cooldownMs !== COOLDOWN_600_MS) { a.cooldownMs = COOLDOWN_600_MS; mexeu = true; }
  }
  return mexeu;
}

export function injetarGolpesEspeciais(creature) {
  fixarCooldownGolpe600(creature);
  if (!elegivelParaGolpeEspecial(creature)) return false;

  let attacks = limparGolpesQuebrados(creature.attacks);
  const antes = JSON.stringify(attacks);
  const tipos = [...new Set([creature.type1, creature.type2].filter((t) => t && TIPOS_ELEMENTO.includes(t)))];




  const catAssinatura = (creature.baseAtk ?? 0) >= (creature.baseSpAtk ?? 0) ? 'PHYSICAL' : 'SPECIAL';
  for (const a of attacks) {
    if (a.power < 600) continue;
    if (!a.categoriaFixa) a.category = catAssinatura;
    a.cooldownMs = COOLDOWN_600_MS;
  }

  for (const tipo of tipos) {
    const tmpl = GOLPE_600_POR_TIPO[tipo];
    if (!tmpl || temGolpe600DoTipo(attacks, tipo)) continue;
    attacks.push({ ...tmpl, category: catAssinatura, learnLevel: 1 });
  }





  const golpes600 = attacks.filter((a) => a.power >= 600 && TIPOS_ELEMENTO.includes(a.type));
  if (golpes600.length === 1) {
    const b = [GOLPE_600_POR_TIPO_B, GOLPE_600_RESERVA]
      .map((tabela) => tabela[golpes600[0].type])
      .find((g) => g && !attacks.some((a) => a.name === g.name));
    if (b) attacks.push({ ...b, category: catAssinatura, learnLevel: 1 });
  }

  if (JSON.stringify(attacks) === antes) return false;
  creature.attacks = attacks;
  return true;
}


export function golpesDaFicha(especie) {
  if (!especie) return [];
  const clone = { ...especie, attacks: (especie.attacks ?? []).map((a) => ({ ...a })) };
  injetarGolpesEspeciais(clone);
  return clone.attacks ?? [];
}
