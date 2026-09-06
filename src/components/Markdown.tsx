import React from 'react';

/** Minimal, safe markdown → React for DM narration: paragraphs, bold, italics, blockquotes, lists, headings, hr, inline code. */

function inline(text: string, keyBase: string): React.ReactNode[] {
  const out: React.ReactNode[] = [];
  const re = /(\*\*\*([^*]+)\*\*\*|\*\*([^*]+)\*\*|\*([^*\n]+)\*|_([^_\n]+)_|`([^`]+)`|~~([^~]+)~~)/g;
  let last = 0; let m: RegExpExecArray | null; let i = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const k = `${keyBase}-${i++}`;
    if (m[2]) out.push(<strong key={k}><em>{m[2]}</em></strong>);
    else if (m[3]) out.push(<strong key={k}>{m[3]}</strong>);
    else if (m[4]) out.push(<em key={k}>{m[4]}</em>);
    else if (m[5]) out.push(<em key={k}>{m[5]}</em>);
    else if (m[6]) out.push(<code key={k}>{m[6]}</code>);
    else if (m[7]) out.push(<s key={k}>{m[7]}</s>);
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

export function Markdown({ text, className = 'prose', streaming }: { text: string; className?: string; streaming?: boolean }) {
  const blocks: React.ReactNode[] = [];
  const lines = text.replace(/\r/g, '').split('\n');
  let i = 0; let key = 0;
  const para: string[] = [];
  const flushPara = () => {
    if (!para.length) return;
    const t = para.join(' ').trim();
    if (t) blocks.push(<p key={key++}>{inline(t, `p${key}`)}</p>);
    para.length = 0;
  };
  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();
    if (!trimmed) { flushPara(); i++; continue; }
    const h = trimmed.match(/^(#{1,4})\s+(.*)$/);
    if (h) { flushPara(); blocks.push(<h3 key={key++}>{inline(h[2], `h${key}`)}</h3>); i++; continue; }
    if (/^(-{3,}|\*{3,}|_{3,})$/.test(trimmed)) { flushPara(); blocks.push(<hr key={key++} />); i++; continue; }
    if (trimmed.startsWith('>')) {
      flushPara();
      const q: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('>')) { q.push(lines[i].trim().replace(/^>\s?/, '')); i++; }
      blocks.push(<blockquote key={key++}>{q.map((l, j) => <p key={j}>{inline(l, `q${key}${j}`)}</p>)}</blockquote>);
      continue;
    }
    if (/^([-*•]|\d+[.)])\s+/.test(trimmed)) {
      flushPara();
      const items: string[] = [];
      const ordered = /^\d/.test(trimmed);
      while (i < lines.length && /^([-*•]|\d+[.)])\s+/.test(lines[i].trim())) { items.push(lines[i].trim().replace(/^([-*•]|\d+[.)])\s+/, '')); i++; }
      const L = ordered ? 'ol' : 'ul';
      blocks.push(React.createElement(L, { key: key++ }, items.map((it, j) => <li key={j}>{inline(it, `l${key}${j}`)}</li>)));
      continue;
    }
    para.push(trimmed);
    i++;
  }
  flushPara();
  return <div className={className}>{blocks}{streaming && <span className="cursor" />}</div>;
}
