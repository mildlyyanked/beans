/**
 * Tiny safe arithmetic expression evaluator used for ruleset formulas such as
 * "floor((score - 10) / 2)" or "10 + dex". Supports + - * / % ^, parentheses,
 * numeric literals, identifiers resolved from `vars`, and the functions
 * floor, ceil, round, abs, min, max.
 */

type Tok = { t: 'num'; v: number } | { t: 'id'; v: string } | { t: 'op'; v: string } | { t: 'lp' } | { t: 'rp' } | { t: 'comma' };

function tokenize(src: string): Tok[] {
  const out: Tok[] = [];
  let i = 0;
  while (i < src.length) {
    const c = src[i];
    if (/\s/.test(c)) { i++; continue; }
    if (/[0-9.]/.test(c)) {
      let j = i;
      while (j < src.length && /[0-9.]/.test(src[j])) j++;
      out.push({ t: 'num', v: parseFloat(src.slice(i, j)) });
      i = j; continue;
    }
    if (/[a-zA-Z_]/.test(c)) {
      let j = i;
      while (j < src.length && /[a-zA-Z0-9_]/.test(src[j])) j++;
      out.push({ t: 'id', v: src.slice(i, j) });
      i = j; continue;
    }
    if ('+-*/%^'.includes(c)) { out.push({ t: 'op', v: c }); i++; continue; }
    if (c === '(') { out.push({ t: 'lp' }); i++; continue; }
    if (c === ')') { out.push({ t: 'rp' }); i++; continue; }
    if (c === ',') { out.push({ t: 'comma' }); i++; continue; }
    throw new Error(`Unexpected character '${c}' in expression`);
  }
  return out;
}

const FUNCS: Record<string, (...a: number[]) => number> = {
  floor: Math.floor, ceil: Math.ceil, round: Math.round, abs: Math.abs, min: Math.min, max: Math.max,
};

export function evaluate(expr: string, vars: Record<string, number> = {}): number {
  const toks = tokenize(expr);
  let pos = 0;
  const peek = () => toks[pos];
  const next = () => toks[pos++];

  function parsePrimary(): number {
    const tk = next();
    if (!tk) throw new Error('Unexpected end of expression');
    if (tk.t === 'num') return tk.v;
    if (tk.t === 'op' && tk.v === '-') return -parsePrimary();
    if (tk.t === 'op' && tk.v === '+') return parsePrimary();
    if (tk.t === 'lp') {
      const v = parseExpr();
      if (next()?.t !== 'rp') throw new Error('Expected )');
      return v;
    }
    if (tk.t === 'id') {
      if (peek()?.t === 'lp') {
        next();
        const args: number[] = [];
        if (peek()?.t !== 'rp') {
          args.push(parseExpr());
          while (peek()?.t === 'comma') { next(); args.push(parseExpr()); }
        }
        if (next()?.t !== 'rp') throw new Error('Expected )');
        const fn = FUNCS[tk.v];
        if (!fn) throw new Error(`Unknown function ${tk.v}`);
        return fn(...args);
      }
      if (tk.v in vars) return vars[tk.v];
      return 0; // unknown variables default to 0 so partially-specified formulas degrade gracefully
    }
    throw new Error('Unexpected token');
  }
  function parsePow(): number {
    let base = parsePrimary();
    while (peek()?.t === 'op' && (peek() as any).v === '^') { next(); base = Math.pow(base, parsePrimary()); }
    return base;
  }
  function parseMul(): number {
    let v = parsePow();
    while (peek()?.t === 'op' && '*/%'.includes((peek() as any).v)) {
      const op = (next() as any).v; const r = parsePow();
      v = op === '*' ? v * r : op === '/' ? v / r : v % r;
    }
    return v;
  }
  function parseExpr(): number {
    let v = parseMul();
    while (peek()?.t === 'op' && '+-'.includes((peek() as any).v)) {
      const op = (next() as any).v; const r = parseMul();
      v = op === '+' ? v + r : v - r;
    }
    return v;
  }
  const result = parseExpr();
  if (pos < toks.length) throw new Error('Unexpected trailing tokens');
  return result;
}
