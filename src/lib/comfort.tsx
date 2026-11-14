import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { playTone } from "./audio";
import type { Voice } from "./rooms-data";
import {
  clearAll,
  DEFAULT_ALIAS,
  getComfort,
  getVisitor,
  saveComfort,
  saveVisitor,
  type Comfort,
  type Visitor,
} from "./store";

interface ComfortContextValue {
  visitor: Visitor;
  comfort: Comfort;
  /** Alias a usar en saludos, o cadena vacía si es el alias por defecto. */
  friendlyName: string;
  /** Cambia cuando se borran los datos, para reiniciar las vistas sin recargar. */
  dataVersion: number;
  updateVisitor: (patch: Partial<Pick<Visitor, "alias" | "color">>) => void;
  updateComfort: (patch: Partial<Comfort>) => void;
  resetAll: () => void;
}

const ComfortContext = createContext<ComfortContextValue | null>(null);

const INK = "#2b3327";

/** Elige texto oscuro o claro según la luminosidad del color de acento. */
function readableOn(hex: string): string {
  const n = parseInt(hex.slice(1), 16);
  const channel = (v: number) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  const lum = 0.2126 * channel((n >> 16) & 255) + 0.7152 * channel((n >> 8) & 255) + 0.0722 * channel(n & 255);
  return lum > 0.3 ? INK : "#ffffff";
}

export function ComfortProvider({ children }: { children: ReactNode }) {
  const [visitor, setVisitor] = useState<Visitor>(() => getVisitor());
  const [comfort, setComfort] = useState<Comfort>(() => getComfort());
  const [dataVersion, setDataVersion] = useState(0);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--accent", visitor.color);
    root.style.setProperty("--accent-ink", readableOn(visitor.color));
  }, [visitor.color]);

  useEffect(() => {
    document.documentElement.dataset.reduceMotion = String(comfort.reduceMotion);
  }, [comfort.reduceMotion]);

  const updateVisitor = useCallback((patch: Partial<Pick<Visitor, "alias" | "color">>) => {
    setVisitor((prev) => {
      const next = { ...prev, ...patch };
      saveVisitor(next);
      return next;
    });
  }, []);

  const updateComfort = useCallback((patch: Partial<Comfort>) => {
    setComfort((prev) => {
      const next = { ...prev, ...patch };
      saveComfort(next);
      return next;
    });
  }, []);

  const resetAll = useCallback(() => {
    clearAll();
    setVisitor(getVisitor());
    setComfort(getComfort());
    setDataVersion((v) => v + 1);
  }, []);

  const value = useMemo<ComfortContextValue>(() => {
    const alias = visitor.alias.trim();
    return {
      visitor,
      comfort,
      friendlyName: alias && alias !== DEFAULT_ALIAS ? alias : "",
      dataVersion,
      updateVisitor,
      updateComfort,
      resetAll,
    };
  }, [visitor, comfort, dataVersion, updateVisitor, updateComfort, resetAll]);

  return <ComfortContext.Provider value={value}>{children}</ComfortContext.Provider>;
}

export function useComfort(): ComfortContextValue {
  const ctx = useContext(ComfortContext);
  if (!ctx) throw new Error("useComfort debe usarse dentro de <ComfortProvider>");
  return ctx;
}

/** Reproduce un tono solo si el sonido está activado. */
export function useSound(): (freq: number, voice?: Voice) => void {
  const { comfort } = useComfort();
  return useCallback(
    (freq: number, voice?: Voice) => {
      if (comfort.sound) playTone(freq, voice);
    },
    [comfort.sound],
  );
}
