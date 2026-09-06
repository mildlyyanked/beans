export function uid(prefix = ''): string {
  const rnd = typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID().slice(0, 12) : Math.random().toString(36).slice(2, 14);
  return prefix ? `${prefix}_${rnd}` : rnd;
}

export function now(): number { return Date.now(); }

export function clamp(n: number, a: number, b: number): number { return Math.max(a, Math.min(b, n)); }

export function titleCase(s: string): string {
  return s.replace(/[-_]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export function truncate(s: string, n: number): string {
  return s.length <= n ? s : s.slice(0, n - 1).trimEnd() + '…';
}

export function timeAgo(ts: number): string {
  const d = Date.now() - ts;
  const m = Math.floor(d / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const days = Math.floor(h / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(ts).toLocaleDateString();
}

export function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }

export function debounce<T extends (...a: any[]) => void>(fn: T, ms: number): T {
  let t: ReturnType<typeof setTimeout> | undefined;
  return ((...args: any[]) => { if (t) clearTimeout(t); t = setTimeout(() => fn(...args), ms); }) as T;
}

export function downloadJson(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function readFileAsText(file: File): Promise<string> {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(String(r.result));
    r.onerror = () => rej(r.error);
    r.readAsText(file);
  });
}
