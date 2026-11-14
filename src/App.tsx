import { useEffect, useRef, useState } from "react";
import { ComfortSettings } from "./components/ComfortSettings";
import { Disclaimer, LocalModeNote } from "./components/Disclaimer";
import { Header } from "./components/Header";
import { JournalPanel } from "./components/JournalPanel";
import { ComfortProvider, useComfort } from "./lib/comfort";
import { getRoom } from "./lib/rooms-data";
import { matchRoute, usePath } from "./lib/router";
import { CasaPage } from "./pages/CasaPage";
import { HomePage, NotFoundPage } from "./pages/HomePage";
import { RoomPage } from "./pages/RoomPage";

const HOME_TITLE = "Refugio · Cómo habitar la casa (instructivo)";
const CASA_TITLE = "La casa · Explora las diez habitaciones · Refugio";

function Shell() {
  const path = usePath();
  const route = matchRoute(path);
  const room = route.name === "room" ? getRoom(route.slug) : undefined;
  const { dataVersion } = useComfort();
  const [journalOpen, setJournalOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const previousPath = useRef(path);

  // Navegación sin recarga: al cambiar de ruta, subir al inicio y llevar el foco al título.
  useEffect(() => {
    if (previousPath.current === path) return;
    previousPath.current = path;
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    document.getElementById("page-title")?.focus({ preventScroll: true });
  }, [path]);

  useEffect(() => {
    document.title =
      room && route.name === "room"
        ? `${room.name} · Refugio`
        : route.name === "home"
          ? HOME_TITLE
          : route.name === "casa"
            ? CASA_TITLE
            : "Puerta no encontrada · Refugio";
  }, [room, route.name]);

  return (
    <div className="flex min-h-dvh flex-col bg-bg text-ink">
      <a
        href="#contenido"
        onClick={(e) => {
          e.preventDefault();
          document.getElementById("contenido")?.focus();
        }}
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-full focus:bg-surface focus:px-4 focus:py-2 focus:font-bold focus:shadow-lg"
      >
        Saltar al contenido
      </a>

      <Header onOpenJournal={() => setJournalOpen(true)} onOpenSettings={() => setSettingsOpen(true)} />

      <main id="contenido" tabIndex={-1} className="flex-1" key={dataVersion}>
        {route.name === "home" && <HomePage />}
        {route.name === "casa" && <CasaPage />}
        {route.name === "room" && room && (
          <RoomPage key={room.slug} room={room} onOpenJournal={() => setJournalOpen(true)} />
        )}
        {(route.name === "not-found" || (route.name === "room" && !room)) && <NotFoundPage />}
      </main>

      <footer className="border-t border-line bg-bg">
        <div className="mx-auto max-w-6xl space-y-3 px-4 py-8 sm:px-6">
          <Disclaimer />
          <LocalModeNote />
          <p className="text-sm text-muted">
            Refugio no pide cuenta ni contraseña, no recoge datos personales y no usa analíticas de terceros.
          </p>
        </div>
      </footer>

      <JournalPanel open={journalOpen} onClose={() => setJournalOpen(false)} roomSlug={room ? room.slug : null} />
      <ComfortSettings open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
}

export default function App() {
  return (
    <ComfortProvider>
      <Shell />
    </ComfortProvider>
  );
}
