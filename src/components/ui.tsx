import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, X } from 'lucide-react';
import { useUI } from '@/store/ui';
import { getImage } from '@/db';

/* ---------- Buttons ---------- */
export function Button({ variant = '', size = '', block, className = '', ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: '' | 'primary' | 'ghost' | 'danger' | 'ember' | 'arcane' | 'subtle'; size?: '' | 'sm' | 'xs'; block?: boolean }) {
  return <button className={`btn ${variant} ${size} ${block ? 'block' : ''} ${className}`} {...props} />;
}

export function IconButton({ className = '', ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={`iconbtn ${className}`} {...props} />;
}

/* ---------- Top bar ---------- */
export function TopBar({ title, subtitle, back, onBack, right, children }: { title?: React.ReactNode; subtitle?: React.ReactNode; back?: boolean; onBack?: () => void; right?: React.ReactNode; children?: React.ReactNode }) {
  const goBack = useUI((s) => s.back);
  return (
    <div className="topbar">
      {(back || onBack) && (
        <IconButton onClick={onBack ?? goBack} aria-label="Back"><ChevronLeft size={22} /></IconButton>
      )}
      <div className="grow">
        {children ?? (
          <>
            {title && <div className="title truncate">{title}</div>}
            {subtitle && <div className="subtitle truncate">{subtitle}</div>}
          </>
        )}
      </div>
      {right}
    </div>
  );
}

/* ---------- Form bits ---------- */
export function Field({ label, hint, children }: { label?: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="field">
      {label && <div className="label">{label}</div>}
      {children}
      {hint && <div className="tiny mute ui">{hint}</div>}
    </div>
  );
}

export function Select({ className = '', ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <div className="select-wrap"><select className={`select ${className}`} {...props} /></div>;
}

export function Toggle({ on, onChange, label, hint }: { on: boolean; onChange: (v: boolean) => void; label?: string; hint?: string }) {
  return (
    <div className="row-between" onClick={() => onChange(!on)} style={{ cursor: 'pointer', padding: '6px 0' }}>
      <div className="grow">
        {label && <div style={{ fontWeight: 600 }}>{label}</div>}
        {hint && <div className="tiny mute ui">{hint}</div>}
      </div>
      <div className={`toggle ${on ? 'on' : ''}`} role="switch" aria-checked={on} />
    </div>
  );
}

export function Segmented<T extends string>({ value, options, onChange }: { value: T; options: { value: T; label: string }[]; onChange: (v: T) => void }) {
  return (
    <div className="seg">
      {options.map((o) => <button key={o.value} className={o.value === value ? 'on' : ''} onClick={() => onChange(o.value)}>{o.label}</button>)}
    </div>
  );
}

export function Chip({ children, tone = '', on, onClick, className = '' }: { children: React.ReactNode; tone?: '' | 'gold' | 'ember' | 'arcane' | 'moss' | 'blood'; on?: boolean; onClick?: () => void; className?: string }) {
  return <span className={`chip ${tone} ${onClick ? 'selectable' : ''} ${on ? 'on' : ''} ${className}`} onClick={onClick}>{children}</span>;
}

export function Bar({ value, max, kind = '', className = '' }: { value: number; max: number; kind?: '' | 'hp' | 'xp' | 'gold'; className?: string }) {
  const pct = max > 0 ? Math.max(0, Math.min(100, (value / max) * 100)) : 0;
  const state = kind === 'hp' ? (pct > 50 ? 'ok' : pct > 25 ? 'warn' : '') : '';
  return <div className={`bar ${kind} ${state} ${className}`}><i style={{ width: `${pct}%` }} /></div>;
}

export function SectionTitle({ children, right }: { children: React.ReactNode; right?: React.ReactNode }) {
  return <div className="section-title"><h3>{children}</h3>{right && <div style={{ marginLeft: 'auto' }}>{right}</div>}</div>;
}

export function Ornament({ short }: { short?: boolean }) { return <div className={`ornament ${short ? 'short' : ''}`} />; }

export function Spinner() { return <div className="spinner" />; }

export function Empty({ icon, title, text }: { icon?: React.ReactNode; title: string; text?: string }) {
  return (
    <div className="empty">
      {icon && <div className="ico">{icon}</div>}
      <div className="display" style={{ fontSize: 15, letterSpacing: '0.08em', color: 'var(--ink-dim)' }}>{title}</div>
      {text && <div className="small mt-8">{text}</div>}
    </div>
  );
}

/* ---------- Sheet (bottom modal) ---------- */
export function Sheet({ open, onClose, title, children, right }: { open: boolean; onClose: () => void; title?: React.ReactNode; children: React.ReactNode; right?: React.ReactNode }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
          <motion.div className="sheet" initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 30, stiffness: 320 }} onClick={(e) => e.stopPropagation()}>
            <div className="handle" />
            <div className="sheet-head">
              <div className="card-title grow">{title}</div>
              {right}
              <IconButton onClick={onClose} aria-label="Close"><X size={20} /></IconButton>
            </div>
            <div className="sheet-body">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title?: React.ReactNode; children: React.ReactNode }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="overlay centered" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
          <motion.div className="modal" initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} transition={{ type: 'spring', damping: 26, stiffness: 340 }} onClick={(e) => e.stopPropagation()}>
            {title && <div className="card-title mb-16">{title}</div>}
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function Confirm({ open, onClose, onConfirm, title, text, confirmLabel = 'Confirm', danger }: { open: boolean; onClose: () => void; onConfirm: () => void; title: string; text?: string; confirmLabel?: string; danger?: boolean }) {
  return (
    <Modal open={open} onClose={onClose} title={title}>
      {text && <p className="dim mb-16">{text}</p>}
      <div className="row">
        <Button variant="ghost" className="grow" onClick={onClose}>Cancel</Button>
        <Button variant={danger ? 'danger' : 'primary'} className="grow" onClick={() => { onConfirm(); onClose(); }}>{confirmLabel}</Button>
      </div>
    </Modal>
  );
}

/* ---------- Toasts ---------- */
export function Toasts() {
  const toasts = useUI((s) => s.toasts);
  return (
    <div className="toasts">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div key={t.id} className={`toast ${t.kind}`} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 10, opacity: 0 }}>{t.text}</motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

/* ---------- Images from IndexedDB ---------- */
const imgCache = new Map<string, string>();
export function useStoredImage(id?: string): string | undefined {
  const [url, setUrl] = useState<string | undefined>(id ? imgCache.get(id) : undefined);
  useEffect(() => {
    let alive = true;
    if (!id) { setUrl(undefined); return; }
    const cached = imgCache.get(id);
    if (cached) { setUrl(cached); return; }
    getImage(id).then((u) => { if (alive && u) { imgCache.set(id, u); setUrl(u); } });
    return () => { alive = false; };
  }, [id]);
  return url;
}

export function StoredImage({ id, className, alt = '' }: { id?: string; className?: string; alt?: string }) {
  const url = useStoredImage(id);
  if (!url) return null;
  return <img src={url} className={className} alt={alt} />;
}

export function Avatar({ name, imageId, size = '' }: { name: string; imageId?: string; size?: '' | 'lg' | 'xl' }) {
  const url = useStoredImage(imageId);
  const initials = name.split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase();
  return <div className={`avatar ${size}`}>{url ? <img src={url} alt={name} /> : initials}</div>;
}

/* ---------- Auto-growing textarea ---------- */
export function AutoTextarea({ value, onChange, onSubmit, placeholder, disabled }: { value: string; onChange: (v: string) => void; onSubmit?: () => void; placeholder?: string; disabled?: boolean }) {
  const ref = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(140, el.scrollHeight) + 'px';
  }, [value]);
  return (
    <textarea
      ref={ref}
      rows={1}
      value={value}
      placeholder={placeholder}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey && onSubmit && !(e.nativeEvent as any).isComposing) { e.preventDefault(); onSubmit(); } }}
    />
  );
}

/* ---------- D20 glyph ---------- */
export function D20({ value, className = '' }: { value: number; className?: string }) {
  return (
    <div className={`d20 ${value === 20 ? 'nat20' : value === 1 ? 'nat1' : ''} ${className}`}>
      <svg viewBox="0 0 100 100" fill="none">
        <polygon points="50,4 92,28 92,72 50,96 8,72 8,28" stroke="url(#g)" strokeWidth="2.5" fill="rgba(226,184,91,0.08)" />
        <polygon points="50,4 92,28 50,40 8,28" stroke="url(#g)" strokeWidth="1" fill="rgba(226,184,91,0.06)" opacity="0.7" />
        <line x1="50" y1="40" x2="50" y2="96" stroke="url(#g)" strokeWidth="1" opacity="0.5" />
        <line x1="50" y1="40" x2="8" y2="72" stroke="url(#g)" strokeWidth="1" opacity="0.5" />
        <line x1="50" y1="40" x2="92" y2="72" stroke="url(#g)" strokeWidth="1" opacity="0.5" />
        <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#f3d58a" /><stop offset="1" stopColor="#a97d2c" /></linearGradient></defs>
      </svg>
      <span style={{ position: 'relative' }}>{value}</span>
    </div>
  );
}

/* ---------- Sigil (logo) ---------- */
export function Sigil({ size = 84 }: { size?: number }) {
  return (
    <svg className="sigil" width={size} height={size} viewBox="0 0 100 100" fill="none">
      <defs>
        <linearGradient id="sg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#f3d58a" /><stop offset="0.5" stopColor="#e2b85b" /><stop offset="1" stopColor="#a97d2c" /></linearGradient>
      </defs>
      <circle cx="50" cy="50" r="46" stroke="url(#sg)" strokeWidth="1.5" opacity="0.5" />
      <circle cx="50" cy="50" r="40" stroke="url(#sg)" strokeWidth="0.8" opacity="0.35" strokeDasharray="2 4" />
      <polygon points="50,12 84,32 84,68 50,88 16,68 16,32" stroke="url(#sg)" strokeWidth="2" fill="rgba(226,184,91,0.06)" />
      <polygon points="50,12 84,32 50,44 16,32" stroke="url(#sg)" strokeWidth="1.2" fill="rgba(226,184,91,0.12)" />
      <line x1="50" y1="44" x2="50" y2="88" stroke="url(#sg)" strokeWidth="1.2" />
      <line x1="50" y1="44" x2="16" y2="68" stroke="url(#sg)" strokeWidth="1.2" />
      <line x1="50" y1="44" x2="84" y2="68" stroke="url(#sg)" strokeWidth="1.2" />
      <text x="50" y="34" textAnchor="middle" fill="url(#sg)" fontFamily="Cinzel Variable, Cinzel, serif" fontWeight="700" fontSize="14">20</text>
    </svg>
  );
}
