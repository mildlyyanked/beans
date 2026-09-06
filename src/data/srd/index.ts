import type { Ruleset } from '@/types/ruleset';
import { abilities, skills } from './abilities';
import { conditions } from './conditions';
import { mechanics } from './mechanics';
import { species } from './species';
import { backgrounds } from './backgrounds';
import { classes } from './classes';
import { spells } from './spells';
import { equipment } from './equipment';
import { monsters } from './monsters';

export const srdRuleset: Ruleset = {
  id: 'srd-5e',
  name: 'Fifth Edition (SRD 5.1)',
  version: '5.1',
  description:
    'The classic d20 fantasy ruleset: six abilities, twelve classes, nine species, spell slots, and a bestiary of iconic monsters. Based on the System Reference Document 5.1.',
  author: 'Wizards of the Coast (SRD 5.1)',
  license: 'Creative Commons Attribution 4.0 International (CC-BY-4.0). This work includes material taken from the System Reference Document 5.1 by Wizards of the Coast LLC, available at https://dnd.wizards.com/resources/systems-reference-document.',
  builtIn: true,
  labels: {
    species: 'Race', speciesPlural: 'Races', class: 'Class', classPlural: 'Classes', background: 'Background', backgroundPlural: 'Backgrounds',
    spell: 'Spell', spellPlural: 'Spells', monster: 'Monster', monsterPlural: 'Monsters', gm: 'Dungeon Master', currency: 'gp',
  },
  gmGuidance:
    'Heroic fantasy in the d20 tradition. Adventurers rise from humble beginnings to face dragons, liches, and the schemes of gods. Magic is real but wondrous, monsters are dangerous, and the world rewards cleverness, courage, and teamwork. Use the three pillars — combat, exploration, and social interaction — in roughly equal measure. Death is possible but should feel earned; give players meaningful choices and let consequences follow. Lean into vivid sensory description, distinct NPC voices, and the rhythm of tension and release.',
  abilities,
  skills,
  species,
  classes,
  backgrounds,
  spells,
  equipment,
  monsters,
  conditions,
  mechanics,
};
