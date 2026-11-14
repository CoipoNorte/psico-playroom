// Capa de datos en modo local.
//
// Decisión documentada: este proyecto se entrega como sitio estático (sin servidor
// Node ni PostgreSQL), así que la app funciona siempre en el "modo local" que la
// especificación prevé para cuando la base de datos no responde. Las formas de los
// datos reflejan las tablas refugio_visitors / refugio_room_progress / refugio_journal
// para que conectar un backend más adelante sea sustituir este archivo.
//
// Si localStorage no está disponible (modo privado estricto), se usa memoria y la
// app sigue funcionando durante la visita.

export interface Visitor {
  id: string;
  alias: string;
  color: string;
  createdAt: string;
}

export interface Comfort {
  sound: boolean;
  reduceMotion: boolean;
}

export interface Point {
  x: number;
  y: number;
}

export interface RoomProgress {
  activityStep: number;
  data: {
    done?: boolean;
    skipped?: number[];
    positions?: Record<string, Point>;
    /** Versión de la distribución con la que se guardaron las posiciones. */
    layoutV?: number;
    counts?: Record<string, number>;
  };
  updatedAt: string;
}

export interface JournalEntry {
  id: string;
  visitorId: string;
  roomSlug: string | null;
  mood: string;
  text: string;
  createdAt: string;
}

const KEYS = {
  visitor: "refugio:visitor",
  comfort: "refugio:comfort",
  progress: "refugio:progress",
  journal: "refugio:journal",
  experiences: "refugio:experiences",
} as const;

export const DEFAULT_ALIAS = "Visitante";
export const DEFAULT_COLOR = "#a3b18a";

const memory = new Map<string, string>();
let persistent = true;

function read<T>(key: string, fallback: T): T {
  let raw: string | null | undefined;
  try {
    raw = window.localStorage.getItem(key);
  } catch {
    persistent = false;
    raw = memory.get(key);
  }
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown): void {
  const raw = JSON.stringify(value);
  try {
    window.localStorage.setItem(key, raw);
  } catch {
    persistent = false;
    memory.set(key, raw);
  }
}

/** ¿Los datos sobreviven al cerrar la pestaña? */
export function isPersistent(): boolean {
  return persistent;
}

export function uuid(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") return crypto.randomUUID();
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}

/* ---------- Visitante anónimo (estable, no expira, no se rota) ---------- */

export function getVisitor(): Visitor {
  const saved = read<Partial<Visitor> | null>(KEYS.visitor, null);
  if (saved && typeof saved.id === "string" && saved.id) {
    return {
      id: saved.id,
      alias: typeof saved.alias === "string" && saved.alias.trim() ? saved.alias : DEFAULT_ALIAS,
      color: typeof saved.color === "string" && /^#[0-9a-f]{6}$/i.test(saved.color) ? saved.color : DEFAULT_COLOR,
      createdAt: typeof saved.createdAt === "string" ? saved.createdAt : new Date().toISOString(),
    };
  }
  const fresh: Visitor = { id: uuid(), alias: DEFAULT_ALIAS, color: DEFAULT_COLOR, createdAt: new Date().toISOString() };
  write(KEYS.visitor, fresh);
  return fresh;
}

export function saveVisitor(visitor: Visitor): void {
  write(KEYS.visitor, visitor);
}

/* ---------- Preferencias de confort ---------- */

export function getComfort(): Comfort {
  const saved = read<Partial<Comfort> | null>(KEYS.comfort, null);
  let prefersReduced = false;
  try {
    prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch {
    prefersReduced = false;
  }
  return {
    sound: typeof saved?.sound === "boolean" ? saved.sound : false,
    reduceMotion: typeof saved?.reduceMotion === "boolean" ? saved.reduceMotion : prefersReduced,
  };
}

export function saveComfort(comfort: Comfort): void {
  write(KEYS.comfort, comfort);
}

/* ---------- Progreso por habitación ---------- */

type ProgressMap = Record<string, RoomProgress>;

export function getAllProgress(): ProgressMap {
  const map = read<ProgressMap | null>(KEYS.progress, null);
  return map && typeof map === "object" ? map : {};
}

export function getProgress(slug: string): RoomProgress {
  const p = getAllProgress()[slug];
  if (p && typeof p.activityStep === "number" && p.data && typeof p.data === "object") return p;
  return { activityStep: 0, data: {}, updatedAt: new Date().toISOString() };
}

export function saveProgress(slug: string, progress: RoomProgress): void {
  const map = getAllProgress();
  map[slug] = { ...progress, updatedAt: new Date().toISOString() };
  write(KEYS.progress, map);
}

/* ---------- Diario privado ---------- */

export function listJournal(visitorId: string): JournalEntry[] {
  const all = read<JournalEntry[] | null>(KEYS.journal, null);
  if (!Array.isArray(all)) return [];
  return all
    .filter((e) => e && e.visitorId === visitorId && typeof e.createdAt === "string")
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function addJournal(entry: Omit<JournalEntry, "id" | "createdAt">): JournalEntry {
  const all = read<JournalEntry[] | null>(KEYS.journal, null);
  const full: JournalEntry = { ...entry, id: uuid(), createdAt: new Date().toISOString() };
  write(KEYS.journal, [...(Array.isArray(all) ? all : []), full]);
  return full;
}

export function deleteJournal(id: string): void {
  const all = read<JournalEntry[] | null>(KEYS.journal, null);
  if (!Array.isArray(all)) return;
  write(KEYS.journal, all.filter((e) => e.id !== id));
}

/* ---------- Estado de las experiencias (planta, perchero, marcapáginas...) ---------- */

export function getExperience<T>(key: string, fallback: T): T {
  const all = read<Record<string, unknown> | null>(KEYS.experiences, null);
  const value = all && typeof all === "object" ? all[key] : undefined;
  return value === undefined ? fallback : (value as T);
}

export function saveExperience(key: string, value: unknown): void {
  const all = read<Record<string, unknown> | null>(KEYS.experiences, null);
  write(KEYS.experiences, { ...(all && typeof all === "object" ? all : {}), [key]: value });
}

/* ---------- Borrado total ---------- */

export function clearAll(): void {
  for (const key of Object.values(KEYS)) {
    try {
      window.localStorage.removeItem(key);
    } catch {
      // se limpia la memoria a continuación
    }
    memory.delete(key);
  }
}
