import type { ReactNode } from "react";
import type { ArtKey } from "../lib/rooms-data";

const LINE = "#4b4239";

const ART: Record<ArtKey, ReactNode> = {
  xilofono: (
    <g stroke={LINE} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round">
      <path d="M4 15 44 20M4 33 44 28" fill="none" />
      <rect x="5" y="8" width="6.5" height="32" rx="2.5" fill="#e88a7a" />
      <rect x="13.2" y="10" width="6.5" height="28" rx="2.5" fill="#f0b765" />
      <rect x="21.4" y="12" width="6.5" height="24" rx="2.5" fill="#efd96b" />
      <rect x="29.6" y="14" width="6.5" height="20" rx="2.5" fill="#9ccf8f" />
      <rect x="37.8" y="16" width="6.5" height="16" rx="2.5" fill="#8fb8e0" />
    </g>
  ),
  flauta: (
    <g transform="rotate(-32 24 24)" stroke={LINE} strokeWidth="1.5" strokeLinejoin="round">
      <rect x="2" y="19.5" width="44" height="9" rx="4.5" fill="#ecd9b0" />
      <rect x="7" y="19.5" width="4" height="9" fill="#bd9079" />
      <g fill={LINE} stroke="none">
        <circle cx="18" cy="24" r="1.7" />
        <circle cx="24.5" cy="24" r="1.7" />
        <circle cx="31" cy="24" r="1.7" />
        <circle cx="37.5" cy="24" r="1.7" />
      </g>
    </g>
  ),
  pandereta: (
    <g stroke={LINE} strokeWidth="1.5">
      <circle cx="24" cy="24" r="18" fill="#d9a273" />
      <circle cx="24" cy="24" r="12" fill="#fff8ea" />
      <g fill="#edd27a">
        <circle cx="24" cy="6" r="3.2" />
        <circle cx="39.6" cy="15" r="3.2" />
        <circle cx="39.6" cy="33" r="3.2" />
        <circle cx="24" cy="42" r="3.2" />
        <circle cx="8.4" cy="33" r="3.2" />
        <circle cx="8.4" cy="15" r="3.2" />
      </g>
    </g>
  ),
  burbujas: (
    <g stroke="#6fa3b8" strokeWidth="1.5" fill="#d9f0f7" fillOpacity="0.75">
      <circle cx="18" cy="28" r="13" />
      <circle cx="36" cy="14" r="8" />
      <circle cx="38" cy="36" r="5" />
      <g stroke="#ffffff" strokeWidth="2" strokeLinecap="round" fill="none">
        <path d="M10 24a9 9 0 0 1 6-6" />
        <path d="M31.5 12a5 5 0 0 1 3-2.5" />
      </g>
    </g>
  ),
  plastilina: (
    <g stroke={LINE} strokeWidth="1.5" strokeLinejoin="round">
      <ellipse cx="15" cy="33" rx="11" ry="9" fill="#e88a7a" />
      <ellipse cx="34" cy="34" rx="10" ry="8" fill="#8fb8e0" />
      <ellipse cx="25" cy="18" rx="10" ry="9" fill="#efd96b" />
    </g>
  ),
  delantal: (
    <g stroke={LINE} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round">
      <path d="M17 10C17 3 31 3 31 10" fill="none" />
      <path d="M17 10h14l2 9 7 4-2.5 20Q24 46 10.5 43L8 23l7-4z" fill="#f0bfa3" />
      <rect x="17.5" y="27" width="13" height="9" rx="2.5" fill="#fff5ea" />
      <path d="M8 23H3M40 23h5" fill="none" />
    </g>
  ),
  manta: (
    <g stroke={LINE} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round">
      <rect x="5" y="25" width="38" height="15" rx="6" fill="#b79fc9" />
      <rect x="7" y="12" width="34" height="15" rx="6" fill="#d6c3e3" />
      <path d="M13 19.5h22M11 32.5h26" stroke="#fff" strokeOpacity="0.7" strokeDasharray="3 4" fill="none" />
    </g>
  ),
  cojin: (
    <g stroke={LINE} strokeWidth="1.5" strokeLinejoin="round">
      <path d="M8 11Q24 7 40 11 45 24 40 37 24 41 8 37 3 24 8 11Z" fill="#f0c987" />
      <circle cx="24" cy="24" r="2.5" fill="#bd9079" />
      <path d="M14 17q10 3 20 0M14 31q10-3 20 0" fill="none" strokeOpacity="0.35" />
    </g>
  ),
  regadera: (
    <g stroke={LINE} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round">
      <path d="M15 21C4 21 4 37 16 36" fill="none" />
      <path d="M31 27 41 15" fill="none" strokeWidth="3" />
      <path d="M37 10l8 8" fill="none" strokeWidth="3" />
      <path d="M13 19h20l-2 22H15z" fill="#8fbccb" />
      <path d="M13 19h20" stroke="#fff" strokeOpacity="0.6" />
    </g>
  ),
};

/** Ilustración SVG propia para objetos sin un emoji fiel. Escala con el tamaño de fuente. */
export function ObjectArt({ art }: { art: ArtKey }) {
  return (
    <svg viewBox="0 0 48 48" width="1.2em" height="1.2em" aria-hidden="true" focusable="false" className="block">
      {ART[art]}
    </svg>
  );
}
