/** Screen wake lock, refcounted. Keeps the phone awake while a model request is in flight. */
let lock: any = null;
let count = 0;

export async function acquireWakeLock(): Promise<void> {
  count++;
  if (lock || typeof navigator === 'undefined' || !('wakeLock' in navigator)) return;
  try {
    lock = await (navigator as any).wakeLock.request('screen');
    lock.addEventListener?.('release', () => { lock = null; });
  } catch { lock = null; }
}

export function releaseWakeLock(): void {
  count = Math.max(0, count - 1);
  if (count === 0 && lock) { try { lock.release(); } catch { /* ignore */ } lock = null; }
}

// Re-acquire if the OS released the lock while we were hidden and work is still pending.
if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible' && count > 0 && !lock) { count--; void acquireWakeLock(); } });
}

/** Resolves when the page is visible (immediately if it already is). */
export function whenVisible(): Promise<void> {
  if (typeof document === 'undefined' || document.visibilityState === 'visible') return Promise.resolve();
  return new Promise((res) => { const h = () => { if (document.visibilityState === 'visible') { document.removeEventListener('visibilitychange', h); res(); } }; document.addEventListener('visibilitychange', h); });
}
