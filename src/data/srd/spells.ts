import type { Spell } from '@/types/ruleset';
import { level0 } from './spells/level0';
import { level1 } from './spells/level1';
import { level2 } from './spells/level2';
import { level3 } from './spells/level3';
import { level4 } from './spells/level4';
import { level5 } from './spells/level5';
import { level6 } from './spells/level6';
import { level7 } from './spells/level7';
import { level8 } from './spells/level8';
import { level9 } from './spells/level9';

export const spells: Spell[] = [...level0, ...level1, ...level2, ...level3, ...level4, ...level5, ...level6, ...level7, ...level8, ...level9];
