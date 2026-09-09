import type { Campaign, Entity } from '@/types/campaign';

/**
 * Region map: locations get abstract 2D coordinates. New locations are placed
 * relative to a known location by compass direction and rough distance, so the
 * map stays consistent with how the DM describes travel. Units are arbitrary
 * ("one unit ≈ a short walk"); the map is a diagram, not a survey.
 */

export type Direction = 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w' | 'nw' | 'inside';
export type Distance = 'inside' | 'adjacent' | 'near' | 'moderate' | 'far' | 'distant';

const ANGLES: Record<Exclude<Direction, 'inside'>, number> = { n: -90, ne: -45, e: 0, se: 45, s: 90, sw: 135, w: 180, nw: -135 };
const UNITS: Record<Distance, number> = { inside: 0.6, adjacent: 1.5, near: 3, moderate: 6, far: 10, distant: 16 };

export function parseDirection(s?: string): Direction | undefined {
  if (!s) return undefined;
  const t = s.toLowerCase().replace(/[^a-z]/g, '');
  if (/^(inside|within|in)$/.test(t)) return 'inside';
  const m: Record<string, Direction> = { n: 'n', north: 'n', ne: 'ne', northeast: 'ne', e: 'e', east: 'e', se: 'se', southeast: 'se', s: 's', south: 's', sw: 'sw', southwest: 'sw', w: 'w', west: 'w', nw: 'nw', northwest: 'nw' };
  return m[t];
}

export function parseDistance(s?: string): Distance {
  const t = (s ?? '').toLowerCase();
  if (/inside|within/.test(t)) return 'inside';
  if (/adjacent|next|beside|across/.test(t)) return 'adjacent';
  if (/near|close|short|minutes/.test(t)) return 'near';
  if (/moderate|hour|half.?day/.test(t)) return 'moderate';
  if (/far|day|days/.test(t)) return 'far';
  if (/distant|week|weeks|remote/.test(t)) return 'distant';
  return 'near';
}

function taken(c: Campaign, x: number, y: number, ignore: Set<string>, minDist = 1.2): boolean {
  return Object.values(c.entities).some((e) => !ignore.has(e.id) && e.type === 'location' && e.map && Math.hypot(e.map.x - x, e.map.y - y) < minDist);
}

function nudge(c: Campaign, x: number, y: number, ignore: Set<string>, minDist = 1.2): { x: number; y: number } {
  if (!taken(c, x, y, ignore, minDist)) return { x, y };
  for (let r = minDist + 0.2; r < 12; r += minDist) {
    for (let a = 0; a < 360; a += 45) {
      const nx = x + Math.cos((a * Math.PI) / 180) * r, ny = y + Math.sin((a * Math.PI) / 180) * r;
      if (!taken(c, nx, ny, ignore, minDist)) return { x: nx, y: ny };
    }
  }
  return { x: x + Math.random() * 6, y: y + Math.random() * 6 };
}

/** Compute a map position for `loc`. Mutates nothing; returns the map field. */
export function placeLocation(c: Campaign, loc: Entity, rel?: { relativeToId?: string; direction?: Direction; distance?: Distance }): NonNullable<Entity['map']> {
  const anchor = rel?.relativeToId ? c.entities[rel.relativeToId] : c.scene.locationId ? c.entities[c.scene.locationId] : undefined;
  const anchorPos = anchor?.map ?? (anchor ? undefined : undefined);
  const region = anchor?.map?.region ?? loc.map?.region;
  if (!anchorPos) {
    // First location, or anchor unplaced: put it at the origin or beside the most recent placed location.
    const placed = Object.values(c.entities).filter((e) => e.type === 'location' && e.map && e.id !== loc.id);
    if (!placed.length) return { x: 0, y: 0, region };
    const last = placed.sort((a, b) => b.lastSeenTurn - a.lastSeenTurn)[0];
    const p = nudge(c, last.map!.x + 3, last.map!.y, new Set([loc.id]));
    return { ...p, region };
  }
  // No direction given: a room nests inside its parent; an unrelated place fans out around the anchor.
  const nested = loc.parentId === anchor!.id;
  let dir: Direction | 'spread' = rel?.direction ?? (nested ? 'inside' : 'spread');
  const dist = rel?.distance ?? (dir === 'inside' ? 'inside' : 'near');
  const units = UNITS[dist];
  let x: number, y: number;
  if (dir === 'spread') {
    const neighbours = Object.values(c.entities).filter((e) => e.type === 'location' && e.map && e.id !== loc.id && e.id !== anchor!.id && !e.parentId).length;
    const a = ((neighbours * 137.5) % 360 - 90) * (Math.PI / 180); // golden-angle fan so places don't line up
    x = anchorPos.x + Math.cos(a) * units; y = anchorPos.y + Math.sin(a) * units;
    dir = 'n';
  } else if (dir === 'inside') {
    // Cluster inside the anchor: small offset in a stable direction based on how many children exist.
    const siblings = Object.values(c.entities).filter((e) => e.type === 'location' && e.parentId === anchor!.id && e.id !== loc.id).length;
    const a = (siblings * 72 - 90) * (Math.PI / 180);
    x = anchorPos.x + Math.cos(a) * units; y = anchorPos.y + Math.sin(a) * units;
  } else {
    const a = (ANGLES[dir] * Math.PI) / 180;
    x = anchorPos.x + Math.cos(a) * units; y = anchorPos.y + Math.sin(a) * units;
  }
  // Rooms inside a place may sit close to it (and to sibling rooms); separate places keep their distance.
  const p = dir === 'inside' ? nudge(c, x, y, new Set([loc.id, anchor!.id]), 0.5) : nudge(c, x, y, new Set([loc.id]));
  return { ...p, region };
}

/** Record travel between two locations. */
export function recordTravel(c: Campaign, fromId: string | undefined, toId: string): Campaign {
  const travel = c.travel ?? { routes: [], history: [] };
  const history = travel.history[travel.history.length - 1] === toId ? travel.history : [...travel.history, toId].slice(-200);
  let routes = travel.routes;
  if (fromId && fromId !== toId) {
    const a = c.entities[fromId], b = c.entities[toId];
    // Only draw a route between top-level places (not a room inside a building it is already in).
    const nested = a?.parentId === toId || b?.parentId === fromId;
    const exists = routes.some(([x, y]) => (x === fromId && y === toId) || (x === toId && y === fromId));
    if (!nested && !exists) routes = [...routes, [fromId, toId]];
  }
  return { ...c, travel: { routes, history } };
}

export interface MapNode { id: string; name: string; x: number; y: number; region?: string; current: boolean; visited: boolean; parentId?: string; npcs: string[]; summary: string }

export function mapModel(c: Campaign): { nodes: MapNode[]; edges: [string, string][]; bounds: { minX: number; minY: number; maxX: number; maxY: number } } {
  const visited = new Set(c.travel?.history ?? []);
  const nodes: MapNode[] = Object.values(c.entities)
    .filter((e) => e.type === 'location' && e.map)
    .map((e) => ({
      id: e.id, name: e.name, x: e.map!.x, y: e.map!.y, region: e.map!.region, current: e.id === c.scene.locationId, visited: visited.has(e.id), parentId: e.parentId,
      npcs: Object.values(c.entities).filter((n) => (n.type === 'npc' || n.type === 'creature') && n.locationId === e.id && n.status !== 'dead').map((n) => n.name),
      summary: e.summary,
    }));
  const ids = new Set(nodes.map((n) => n.id));
  const edges = (c.travel?.routes ?? []).filter(([a, b]) => ids.has(a) && ids.has(b));
  const xs = nodes.map((n) => n.x), ys = nodes.map((n) => n.y);
  const bounds = nodes.length ? { minX: Math.min(...xs), minY: Math.min(...ys), maxX: Math.max(...xs), maxY: Math.max(...ys) } : { minX: -5, minY: -5, maxX: 5, maxY: 5 };
  return { nodes, edges, bounds };
}
