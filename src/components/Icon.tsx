import {
  ArrowLeft,
  ArrowRight,
  Check,
  Eraser,
  Heart,
  Home,
  Info,
  NotebookPen,
  Play,
  RotateCcw,
  Settings2,
  SkipForward,
  Square,
  Trash2,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";

const ICONS = {
  "arrow-left": ArrowLeft,
  "arrow-right": ArrowRight,
  check: Check,
  eraser: Eraser,
  heart: Heart,
  home: Home,
  info: Info,
  journal: NotebookPen,
  play: Play,
  reset: RotateCcw,
  settings: Settings2,
  skip: SkipForward,
  stop: Square,
  trash: Trash2,
  "sound-on": Volume2,
  "sound-off": VolumeX,
  close: X,
} as const;

export type IconName = keyof typeof ICONS;

/** Wrapper de lucide-react: iconos siempre decorativos (el texto o aria-label va en el control). */
export function Icon({ name, size = 20, className }: { name: IconName; size?: number; className?: string }) {
  const Component = ICONS[name];
  return <Component size={size} strokeWidth={2} aria-hidden="true" focusable="false" className={className} />;
}
