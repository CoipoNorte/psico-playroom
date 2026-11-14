// Tonos suaves generados con Web Audio API. Sin archivos de audio.
// Todo es opcional: si el navegador no soporta audio, simplemente no suena.

import type { Voice } from "./rooms-data";

let ctx: AudioContext | null = null;
let noise: AudioBuffer | null = null;

function getContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const AC: typeof AudioContext | undefined =
    window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  if (!ctx) ctx = new AC();
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

function envelope(ac: AudioContext, peak: number, attack: number, release: number): GainNode {
  const t = ac.currentTime;
  const g = ac.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(peak, t + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t + attack + release);
  g.connect(ac.destination);
  return g;
}

function osc(ac: AudioContext, type: OscillatorType, freq: number, out: AudioNode, length: number): OscillatorNode {
  const o = ac.createOscillator();
  o.type = type;
  o.frequency.setValueAtTime(freq, ac.currentTime);
  o.connect(out);
  o.start();
  o.stop(ac.currentTime + length);
  return o;
}

/** Reproduce un tono breve y suave. Nunca lanza errores. */
export function playTone(freq: number, voice: Voice = "soft"): void {
  try {
    const ac = getContext();
    if (!ac) return;
    const t = ac.currentTime;

    switch (voice) {
      case "pluck": {
        osc(ac, "triangle", freq, envelope(ac, 0.16, 0.006, 0.55), 0.7);
        break;
      }
      case "bell": {
        osc(ac, "sine", freq, envelope(ac, 0.13, 0.008, 1.7), 1.9);
        osc(ac, "sine", freq * 2.76, envelope(ac, 0.035, 0.008, 0.9), 1.1);
        break;
      }
      case "flute": {
        const g = envelope(ac, 0.11, 0.14, 1.0);
        const o = osc(ac, "sine", freq, g, 1.3);
        const lfo = ac.createOscillator();
        const depth = ac.createGain();
        lfo.frequency.value = 5;
        depth.gain.value = 3;
        lfo.connect(depth);
        depth.connect(o.frequency);
        lfo.start();
        lfo.stop(t + 1.3);
        break;
      }
      case "drum": {
        const o = osc(ac, "sine", freq * 1.7, envelope(ac, 0.3, 0.004, 0.38), 0.5);
        o.frequency.exponentialRampToValueAtTime(freq, t + 0.12);
        break;
      }
      case "shaker": {
        if (!noise) {
          noise = ac.createBuffer(1, Math.floor(ac.sampleRate * 0.25), ac.sampleRate);
          const data = noise.getChannelData(0);
          for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
        }
        const src = ac.createBufferSource();
        src.buffer = noise;
        const filter = ac.createBiquadFilter();
        filter.type = "highpass";
        filter.frequency.value = 5200;
        src.connect(filter);
        filter.connect(envelope(ac, 0.1, 0.005, 0.2));
        src.start();
        break;
      }
      default: {
        osc(ac, "sine", freq, envelope(ac, 0.12, 0.03, 0.95), 1.1);
      }
    }
  } catch {
    // El silencio es un respaldo perfectamente válido.
  }
}

/** Tono sostenido (flauta, campana larga...). Devuelve la función que lo apaga. */
export function startTone(freq: number, voice: Voice = "flute"): () => void {
  try {
    const ac = getContext();
    if (!ac) return () => {};
    const t = ac.currentTime;
    const g = ac.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(voice === "flute" ? 0.1 : 0.12, t + 0.12);
    g.connect(ac.destination);
    const o = ac.createOscillator();
    o.type = voice === "flute" ? "sine" : "triangle";
    o.frequency.value = freq;
    o.connect(g);
    let lfo: OscillatorNode | null = null;
    if (voice === "flute") {
      lfo = ac.createOscillator();
      const depth = ac.createGain();
      lfo.frequency.value = 5;
      depth.gain.value = 3;
      lfo.connect(depth);
      depth.connect(o.frequency);
      lfo.start();
    }
    o.start();
    return () => {
      try {
        const now = ac.currentTime;
        g.gain.cancelScheduledValues(now);
        g.gain.setValueAtTime(Math.max(g.gain.value, 0.0001), now);
        g.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);
        o.stop(now + 0.3);
        lfo?.stop(now + 0.3);
      } catch {
        // ya estaba apagado
      }
    };
  } catch {
    return () => {};
  }
}

/** Lluvia suave: ruido filtrado en bucle. */
export function startRain(level = 0.5): { setLevel: (v: number) => void; stop: () => void } {
  const none = { setLevel: () => {}, stop: () => {} };
  try {
    const ac = getContext();
    if (!ac) return none;
    const seconds = 2;
    const buffer = ac.createBuffer(1, ac.sampleRate * seconds, ac.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    const src = ac.createBufferSource();
    src.buffer = buffer;
    src.loop = true;
    const filter = ac.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 900;
    const g = ac.createGain();
    g.gain.value = 0.0001;
    g.gain.exponentialRampToValueAtTime(Math.max(0.0001, level * 0.09), ac.currentTime + 0.8);
    src.connect(filter);
    filter.connect(g);
    g.connect(ac.destination);
    src.start();
    return {
      setLevel: (v) => {
        try {
          g.gain.setTargetAtTime(Math.max(0.0001, v * 0.09), ac.currentTime, 0.2);
          filter.frequency.setTargetAtTime(500 + v * 900, ac.currentTime, 0.2);
        } catch {
          // ignorar
        }
      },
      stop: () => {
        try {
          const now = ac.currentTime;
          g.gain.setTargetAtTime(0.0001, now, 0.3);
          src.stop(now + 1.2);
        } catch {
          // ya estaba parado
        }
      },
    };
  } catch {
    return none;
  }
}

/** Pequeño acorde de confirmación al activar el sonido. */
export function playHello(): void {
  playTone(392, "soft");
  window.setTimeout(() => playTone(523.25, "soft"), 140);
}

function click(ac: AudioContext, when: number, freq: number): void {
  const o = ac.createOscillator();
  const g = ac.createGain();
  o.type = "square";
  o.frequency.setValueAtTime(freq, when);
  g.gain.setValueAtTime(0.0001, when);
  g.gain.exponentialRampToValueAtTime(0.16, when + 0.003);
  g.gain.exponentialRampToValueAtTime(0.0001, when + 0.05);
  o.connect(g);
  g.connect(ac.destination);
  o.start(when);
  o.stop(when + 0.06);
}

/**
 * Metrónomo preciso: los clics se programan en el reloj de audio (no con setInterval),
 * así el ritmo no se desvía. `onBeat` avisa a la interfaz para animar el pulso.
 */
export function startMetronome(bpm: number, onBeat: (beat: number) => void, audible: boolean): () => void {
  const ac = getContext();
  if (!ac) return () => {};
  const interval = 60 / bpm;
  let next = ac.currentTime + 0.08;
  let beat = 0;
  const timers: number[] = [];
  const pump = window.setInterval(() => {
    while (next < ac.currentTime + 0.12) {
      const b = beat % 4;
      if (audible) click(ac, next, b === 0 ? 1320 : 990);
      const delay = Math.max(0, (next - ac.currentTime) * 1000);
      timers.push(window.setTimeout(() => onBeat(b), delay));
      next += interval;
      beat += 1;
    }
  }, 25);
  return () => {
    window.clearInterval(pump);
    timers.forEach((t) => window.clearTimeout(t));
  };
}
