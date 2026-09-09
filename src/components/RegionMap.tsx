import React, { useMemo, useRef, useState } from 'react';
import { Locate, Minus, Plus } from 'lucide-react';
import type { Campaign } from '@/types/campaign';
import { mapModel, type MapNode } from '@/engine/map';

/**
 * Abstract region map: SVG nodes for known locations, routes the party has
 * travelled, a party marker at the current location, NPC dots per location.
 * Pan by dragging, zoom with the buttons or pinch (two-pointer).
 */
export function RegionMap({ campaign, onSelect, height = 300 }: { campaign: Campaign; onSelect?: (n: MapNode) => void; height?: number }) {
  const { nodes, edges, bounds } = useMemo(() => mapModel(campaign), [campaign.entities, campaign.travel, campaign.scene.locationId]);
  const [view, setView] = useState<{ x: number; y: number; k: number } | null>(null);
  const drag = useRef<{ x: number; y: number; vx: number; vy: number } | null>(null);
  const pinch = useRef<{ d: number; k: number } | null>(null);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const W = 400;
  const H = height;
  const UNIT = 26; // px per map unit at k=1
  const party = campaign.partyIds.map((id) => campaign.characters[id]).filter(Boolean);
  const byId = useMemo(() => Object.fromEntries(nodes.map((n) => [n.id, n])), [nodes]);

  // Default view: fit all nodes.
  const fit = () => {
    const w = (bounds.maxX - bounds.minX) * UNIT + 120, h = (bounds.maxY - bounds.minY) * UNIT + 120;
    const k = Math.max(0.35, Math.min(1.6, Math.min(W / w, H / h)));
    return { x: W / 2 - ((bounds.minX + bounds.maxX) / 2) * UNIT * k, y: H / 2 - ((bounds.minY + bounds.maxY) / 2) * UNIT * k, k };
  };
  const v = view ?? fit();
  const px = (n: { x: number; y: number }) => ({ x: v.x + n.x * UNIT * v.k, y: v.y + n.y * UNIT * v.k });

  const onPointerDown = (e: React.PointerEvent) => {
    (e.target as Element).setPointerCapture?.(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size === 1) drag.current = { x: e.clientX, y: e.clientY, vx: v.x, vy: v.y };
    if (pointers.current.size === 2) { const [a, b] = [...pointers.current.values()]; pinch.current = { d: Math.hypot(a.x - b.x, a.y - b.y), k: v.k }; drag.current = null; }
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size === 2 && pinch.current) {
      const [a, b] = [...pointers.current.values()];
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      const k = Math.max(0.3, Math.min(3, (pinch.current.k * d) / pinch.current.d));
      setView({ ...v, k });
    } else if (drag.current) {
      setView({ ...v, x: drag.current.vx + (e.clientX - drag.current.x), y: drag.current.vy + (e.clientY - drag.current.y) });
    }
  };
  const onPointerUp = (e: React.PointerEvent) => { pointers.current.delete(e.pointerId); if (pointers.current.size < 2) pinch.current = null; if (pointers.current.size === 0) drag.current = null; };
  const zoom = (f: number) => setView({ x: W / 2 + (v.x - W / 2) * f, y: H / 2 + (v.y - H / 2) * f, k: Math.max(0.3, Math.min(3, v.k * f)) });

  if (!nodes.length) {
    return <div className="center" style={{ height, background: 'radial-gradient(circle at 50% 40%, rgba(139,108,255,0.12), transparent 60%), var(--bg-2)', borderRadius: 16, border: '1px solid var(--line)' }}><div className="empty"><div className="ico">🗺️</div><div className="display" style={{ fontSize: 13, letterSpacing: '0.1em' }}>Uncharted</div><div className="small mt-8">Places appear here as the story visits them.</div></div></div>;
  }

  return (
    <div style={{ position: 'relative', borderRadius: 16, overflow: 'hidden', border: '1px solid var(--line-strong)', background: 'radial-gradient(circle at 50% 30%, rgba(139,108,255,0.10), transparent 60%), #0d0b14', touchAction: 'none', userSelect: 'none' }}>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: 'block', height }} onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={onPointerUp}>
        <defs>
          <pattern id="grid" width={UNIT * v.k * 2} height={UNIT * v.k * 2} patternUnits="userSpaceOnUse" x={v.x % (UNIT * v.k * 2)} y={v.y % (UNIT * v.k * 2)}>
            <path d={`M ${UNIT * v.k * 2} 0 L 0 0 0 ${UNIT * v.k * 2}`} fill="none" stroke="rgba(226,184,91,0.07)" strokeWidth="1" />
          </pattern>
          <radialGradient id="pulse"><stop offset="0" stopColor="#f3d58a" stopOpacity="0.55" /><stop offset="1" stopColor="#f3d58a" stopOpacity="0" /></radialGradient>
        </defs>
        <rect width={W} height={H} fill="url(#grid)" />
        {/* containment links (room inside a place) */}
        {nodes.filter((n) => n.parentId && byId[n.parentId]).map((n) => { const a = px(n), b = px(byId[n.parentId!]); return <line key={'c' + n.id} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="rgba(226,184,91,0.18)" strokeWidth="1" strokeDasharray="2 3" />; })}
        {/* travelled routes */}
        {edges.map(([a, b]) => { const A = px(byId[a]), B = px(byId[b]); return <line key={a + b} x1={A.x} y1={A.y} x2={B.x} y2={B.y} stroke="rgba(226,184,91,0.45)" strokeWidth="1.5" strokeDasharray="5 4" />; })}
        {nodes.map((n) => {
          const p = px(n);
          const r = n.parentId ? 5 : 7;
          return (
            <g key={n.id} onClick={() => onSelect?.(n)} style={{ cursor: 'pointer' }}>
              {n.current && <circle cx={p.x} cy={p.y} r={22} fill="url(#pulse)" />}
              <circle cx={p.x} cy={p.y} r={r} fill={n.current ? '#f3d58a' : n.visited ? '#8b6cff' : '#2a2438'} stroke={n.current ? '#fff2c8' : n.visited ? '#b79dff' : 'rgba(226,184,91,0.5)'} strokeWidth="1.5" />
              {n.npcs.slice(0, 4).map((_, i) => <circle key={i} cx={p.x + 9 + i * 5} cy={p.y - 9} r={2.2} fill="#ff8a5c" />)}
              <text x={p.x} y={p.y + r + 12} textAnchor="middle" fontSize={n.parentId ? 9 : 10.5} fontFamily="Cinzel Variable, Cinzel, serif" fill={n.current ? '#f3d58a' : '#b9b0c4'} style={{ letterSpacing: '0.04em', pointerEvents: 'none' }}>{n.name.length > 22 ? n.name.slice(0, 21) + '…' : n.name}</text>
              {n.current && party.length > 0 && (
                <g>
                  {party.slice(0, 4).map((ch, i) => (
                    <g key={ch.id}>
                      <circle cx={p.x - 12 + i * 8} cy={p.y - 16} r={6} fill="#15121f" stroke={ch.kind === 'player' ? '#f3d58a' : '#b79dff'} strokeWidth="1.2" />
                      <text x={p.x - 12 + i * 8} y={p.y - 13.5} textAnchor="middle" fontSize="6.5" fontFamily="Cinzel Variable, Cinzel, serif" fill={ch.kind === 'player' ? '#f3d58a' : '#b79dff'} style={{ pointerEvents: 'none' }}>{ch.name[0]}</text>
                    </g>
                  ))}
                </g>
              )}
            </g>
          );
        })}
      </svg>
      <div style={{ position: 'absolute', right: 8, bottom: 8, display: 'flex', gap: 4 }}>
        <button className="iconbtn" style={{ background: 'rgba(0,0,0,0.5)' }} onClick={() => zoom(1.25)} aria-label="Zoom in"><Plus size={16} /></button>
        <button className="iconbtn" style={{ background: 'rgba(0,0,0,0.5)' }} onClick={() => zoom(0.8)} aria-label="Zoom out"><Minus size={16} /></button>
        <button className="iconbtn" style={{ background: 'rgba(0,0,0,0.5)' }} onClick={() => setView(null)} aria-label="Fit"><Locate size={16} /></button>
      </div>
      <div className="tiny mute ui" style={{ position: 'absolute', left: 10, bottom: 10, display: 'flex', gap: 10 }}>
        <span><i style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 4, background: '#f3d58a', marginRight: 4 }} />here</span>
        <span><i style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 4, background: '#8b6cff', marginRight: 4 }} />visited</span>
        <span><i style={{ display: 'inline-block', width: 6, height: 6, borderRadius: 3, background: '#ff8a5c', marginRight: 4 }} />people</span>
      </div>
    </div>
  );
}
