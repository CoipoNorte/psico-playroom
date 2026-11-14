// Enrutador mínimo por hash (#/habitacion/peluches).
// Decisión: el sitio se sirve como un único index.html estático, así que las rutas
// por hash garantizan que recargar o compartir un enlace siempre funcione.

import { useSyncExternalStore } from "react";

function subscribe(callback: () => void): () => void {
  window.addEventListener("hashchange", callback);
  return () => window.removeEventListener("hashchange", callback);
}

function getPath(): string {
  const hash = window.location.hash.replace(/^#/, "");
  return hash.startsWith("/") ? hash : "/";
}

export function usePath(): string {
  return useSyncExternalStore(subscribe, getPath, () => "/");
}

export function href(path: string): string {
  return `#${path}`;
}

export function roomHref(slug: string): string {
  return href(`/habitacion/${slug}`);
}

export type Route = { name: "home" } | { name: "casa" } | { name: "room"; slug: string } | { name: "not-found" };

export function matchRoute(path: string): Route {
  const clean = path.split("?")[0].replace(/\/+$/, "") || "/";
  if (clean === "/") return { name: "home" };
  if (clean === "/casa") return { name: "casa" };
  const room = /^\/habitacion\/([^/]+)$/.exec(clean);
  if (room) {
    try {
      return { name: "room", slug: decodeURIComponent(room[1]) };
    } catch {
      return { name: "not-found" };
    }
  }
  return { name: "not-found" };
}
