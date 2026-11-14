import { playHello } from "../lib/audio";
import { useComfort } from "../lib/comfort";
import { href, usePath } from "../lib/router";
import { Icon } from "./Icon";

interface Props {
  onOpenJournal: () => void;
  onOpenSettings: () => void;
}

export function Header({ onOpenJournal, onOpenSettings }: Props) {
  const { comfort, updateComfort } = useComfort();
  const path = usePath();

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-2 gap-y-1 px-4 py-2.5 sm:px-6">
        <div className="flex min-w-0 items-center gap-1 sm:gap-2">
          <a href={href("/")} className="flex shrink-0 items-center gap-2.5 rounded-full py-1 pr-2" aria-label="Refugio, ir al instructivo">
            <span aria-hidden="true" className="grid size-10 place-items-center rounded-2xl bg-accent text-accent-ink">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3.5 11.5 12 4l8.5 7.5" />
                <path d="M6 10v9.5h12V10" />
                <path d="M12 19.5v-4a2 2 0 0 0-2-2" />
              </svg>
            </span>
            <span className="text-xl font-extrabold tracking-tight">Refugio</span>
          </a>
          <nav aria-label="Secciones" className="order-3 ml-1 flex w-full items-center gap-1 sm:order-none sm:w-auto">
            <a
              href={href("/")}
              aria-current={path === "/" ? "page" : undefined}
              className={`rounded-full px-3 py-2 text-sm font-bold ${path === "/" ? "bg-soft text-ink" : "text-muted hover:bg-soft hover:text-ink"}`}
            >
              Instructivo
            </a>
            <a
              href={href("/casa")}
              aria-current={path === "/casa" ? "page" : undefined}
              className={`rounded-full px-3 py-2 text-sm font-bold ${path === "/casa" ? "bg-soft text-ink" : "text-muted hover:bg-soft hover:text-ink"}`}
            >
              Casa
            </a>
          </nav>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            role="switch"
            aria-checked={comfort.sound}
            aria-label="Sonido"
            title={comfort.sound ? "Sonido activado" : "Sonido desactivado"}
            onClick={() => {
              const next = !comfort.sound;
              updateComfort({ sound: next });
              if (next) playHello();
            }}
            className="flex min-h-11 cursor-pointer items-center gap-2 rounded-full border border-line bg-surface px-3 text-sm font-bold hover:border-primary"
          >
            <Icon name={comfort.sound ? "sound-on" : "sound-off"} size={18} />
            <span className="hidden sm:inline">Sonido</span>
            <span
              aria-hidden="true"
              className={`relative h-5 w-9 rounded-full border-2 transition-colors ${
                comfort.sound ? "border-primary bg-primary" : "border-muted bg-soft"
              }`}
            >
              <span
                className={`absolute top-1/2 left-0.5 size-3 -translate-y-1/2 rounded-full transition-transform ${
                  comfort.sound ? "translate-x-4 bg-primary-ink" : "bg-muted"
                }`}
              />
            </span>
          </button>
          <button
            type="button"
            onClick={onOpenJournal}
            aria-label="Abrir el diario"
            className="flex min-h-11 min-w-11 cursor-pointer items-center justify-center gap-2 rounded-full border border-line bg-surface px-3 text-sm font-bold hover:border-primary"
          >
            <Icon name="journal" size={18} />
            <span className="hidden sm:inline">Diario</span>
          </button>
          <button
            type="button"
            onClick={onOpenSettings}
            aria-label="Abrir los ajustes de confort"
            className="flex min-h-11 min-w-11 cursor-pointer items-center justify-center gap-2 rounded-full border border-line bg-surface px-3 text-sm font-bold hover:border-primary"
          >
            <Icon name="settings" size={18} />
            <span className="hidden sm:inline">Ajustes</span>
          </button>
        </div>
      </div>
    </header>
  );
}
