import type { RollResult } from '@/types/campaign';

/**
 * Dice notation parser & roller.
 * Supports: NdM, NdMkhK (keep highest), NdMklK (keep lowest), dropping (dlK/dhK),
 * modifiers (+3, -1), multiple terms (2d6+1d4+3), and named variables.
 * Uses crypto RNG when available for honest rolls.
 */

export interface DiceTerm {
  count: number;
  sides: number;
  keepHigh?: number;
  keepLow?: number;
  dropLow?: number;
  dropHigh?: number;
  sign: 1 | -1;
}

export interface ParsedDice {
  terms: DiceTerm[];
  modifier: number;
  original: string;
}

export function rng(sides: number): number {
  if (typeof crypto !== 'undefined' && 'getRandomValues' in crypto) {
    const arr = new Uint32Array(1);
    crypto.getRandomValues(arr);
    return (arr[0] % sides) + 1;
  }
  return Math.floor(Math.random() * sides) + 1;
}

export function parseDice(input: string, vars: Record<string, number> = {}): ParsedDice {
  const src = input.replace(/\s+/g, '').toLowerCase();
  if (!src) throw new Error('Empty dice expression');
  const terms: DiceTerm[] = [];
  let modifier = 0;
  const re = /([+-]?)(\d*)d(\d+)(?:(kh|kl|dl|dh)(\d+))?|([+-]?)(\d+)|([+-]?)([a-z_][a-z0-9_]*)/g;
  let m: RegExpExecArray | null;
  let consumed = 0;
  while ((m = re.exec(src))) {
    if (m.index !== consumed) throw new Error(`Invalid dice expression near "${src.slice(consumed)}"`);
    consumed = m.index + m[0].length;
    if (m[3]) {
      const sign = m[1] === '-' ? -1 : 1;
      const count = m[2] ? parseInt(m[2], 10) : 1;
      const sides = parseInt(m[3], 10);
      if (count < 1 || count > 100 || sides < 1 || sides > 1000) throw new Error('Dice out of range');
      const term: DiceTerm = { count, sides, sign };
      if (m[4]) {
        const n = parseInt(m[5], 10);
        if (m[4] === 'kh') term.keepHigh = n;
        if (m[4] === 'kl') term.keepLow = n;
        if (m[4] === 'dl') term.dropLow = n;
        if (m[4] === 'dh') term.dropHigh = n;
      }
      terms.push(term);
    } else if (m[7]) {
      modifier += (m[6] === '-' ? -1 : 1) * parseInt(m[7], 10);
    } else if (m[9]) {
      const v = vars[m[9]];
      if (v === undefined) throw new Error(`Unknown variable "${m[9]}"`);
      modifier += (m[8] === '-' ? -1 : 1) * v;
    }
  }
  if (consumed !== src.length) throw new Error(`Invalid dice expression "${input}"`);
  return { terms, modifier, original: input };
}

export interface RollDetail {
  expression: string;
  rolls: number[];
  kept: number[];
  modifier: number;
  total: number;
  /** For single-d20 rolls: the natural die value. */
  natural?: number;
}

export function roll(input: string, vars: Record<string, number> = {}): RollDetail {
  const parsed = parseDice(input, vars);
  const rolls: number[] = [];
  const kept: number[] = [];
  let total = parsed.modifier;
  let natural: number | undefined;
  for (const term of parsed.terms) {
    const dice = Array.from({ length: term.count }, () => rng(term.sides));
    rolls.push(...dice);
    let k = [...dice];
    const sorted = [...dice].sort((a, b) => b - a);
    if (term.keepHigh !== undefined) k = sorted.slice(0, term.keepHigh);
    else if (term.keepLow !== undefined) k = sorted.slice(-term.keepLow);
    else if (term.dropLow !== undefined) k = sorted.slice(0, Math.max(0, dice.length - term.dropLow));
    else if (term.dropHigh !== undefined) k = sorted.slice(term.dropHigh);
    kept.push(...k);
    total += term.sign * k.reduce((a, b) => a + b, 0);
    if (term.sides === 20 && parsed.terms.length === 1 && k.length === 1) natural = k[0];
  }
  return { expression: parsed.original, rolls, kept, modifier: parsed.modifier, total, natural };
}

export type Advantage = 'advantage' | 'disadvantage' | 'none';

/** Roll a d20 with an optional advantage state; returns the natural chosen die and both dice. */
export function rollD20(adv: Advantage = 'none'): { natural: number; dice: number[] } {
  if (adv === 'none') { const n = rng(20); return { natural: n, dice: [n] }; }
  const a = rng(20), b = rng(20);
  return { natural: adv === 'advantage' ? Math.max(a, b) : Math.min(a, b), dice: [a, b] };
}

export function makeCheck(opts: {
  label: string;
  modifier: number;
  dc?: number;
  advantage?: Advantage;
  characterName?: string;
  kind?: string;
}): RollResult {
  const { natural, dice } = rollD20(opts.advantage ?? 'none');
  const total = natural + opts.modifier;
  const res: RollResult = {
    label: opts.label,
    expression: `1d20${opts.modifier >= 0 ? '+' : ''}${opts.modifier}`,
    rolls: dice,
    kept: [natural],
    modifier: opts.modifier,
    total,
    advantage: opts.advantage ?? 'none',
    characterName: opts.characterName,
    kind: opts.kind,
  };
  if (opts.dc !== undefined) { res.dc = opts.dc; res.success = total >= opts.dc; }
  if (natural === 20) res.critical = 'hit';
  if (natural === 1) res.critical = 'miss';
  return res;
}

export function fmtMod(n: number): string {
  return n >= 0 ? `+${n}` : `${n}`;
}

export function describeRoll(r: RollResult): string {
  const dice = r.rolls.length > 1 && r.kept ? `[${r.rolls.join(', ')}] keep ${r.kept.join(', ')}` : `[${r.rolls.join(', ')}]`;
  let s = `${r.characterName ? r.characterName + ' — ' : ''}${r.label}: ${r.total} (${dice}${r.modifier ? ' ' + fmtMod(r.modifier) : ''})`;
  if (r.dc !== undefined) s += ` vs DC ${r.dc} → ${r.success ? 'SUCCESS' : 'FAILURE'}`;
  if (r.critical === 'hit') s += ' — NATURAL 20!';
  if (r.critical === 'miss') s += ' — NATURAL 1';
  return s;
}
