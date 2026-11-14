import { useEffect, useRef, useState } from "react";
import {
  AdditiveBlending,
  AmbientLight,
  BufferGeometry,
  CanvasTexture,
  Color,
  DoubleSide,
  Float32BufferAttribute,
  Group,
  LineBasicMaterial,
  LineLoop,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PerspectiveCamera,
  PointLight,
  Points,
  PointsMaterial,
  Raycaster,
  RingGeometry,
  Scene,
  SphereGeometry,
  Sprite,
  SpriteMaterial,
  SRGBColorSpace,
  Vector2,
  Vector3,
  WebGLRenderer,
  type Object3D,
} from "three";
import { Icon } from "../components/Icon";
import {
  BODIES,
  D2R,
  DAY,
  ELEMENTS,
  J2000,
  MOONS,
  MOONS_OF,
  RADIUS3D,
  SPEEDS,
  SYNODIC,
  fmt,
  moonAgeAt,
  planetVec,
  type BodyDef,
  type MoonDef,
  type Vec,
} from "../lib/astronomy";
import { useComfort } from "../lib/comfort";
import { Caption, Note, seeded, type ExperienceProps } from "./shared";

const TAU = Math.PI * 2;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

/** Convierte una posición eclíptica real (UA) a coordenadas del modelo 3D. */
function to3D(v: Vec): Vector3 {
  const r = Math.hypot(v[0], v[1], v[2]);
  const k = RADIUS3D(r) / Math.max(r, 1e-6);
  // x/z = plano de la eclíptica; y = inclinación, exagerada para que se vea.
  return new Vector3(v[0] * k, v[2] * k * 6, -v[1] * k);
}

/** Texturas de los planetas, generadas con canvas: sin imágenes externas. */
function planetTexture(body: BodyDef): CanvasTexture {
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 128;
  const g = c.getContext("2d");
  if (g) {
    const seed = [...body.key].reduce((a, ch) => a + ch.charCodeAt(0), 0);
    const rnd = seeded(seed);
    g.fillStyle = body.color;
    g.fillRect(0, 0, 256, 128);

    if (body.texture === "bands" || body.texture === "cloud" || body.texture === "deep" || body.texture === "ice") {
      for (let y = 0; y < 128; y += 3) {
        const wave = Math.sin(y * 0.22 + seed) * 0.07;
        g.globalAlpha = 0.12 + rnd() * 0.3;
        g.fillStyle = rnd() > 0.45 ? body.spot : "#fff8e6";
        g.fillRect(0, y, 256, 2 + rnd() * 3 + wave * 10);
      }
      g.globalAlpha = 1;
      if (body.key === "Júpiter") {
        g.fillStyle = "#b96b52";
        g.globalAlpha = 0.85;
        g.beginPath();
        g.ellipse(178, 76, 22, 11, 0, 0, TAU);
        g.fill();
        g.globalAlpha = 1;
      }
      if (body.texture === "ice") {
        g.globalAlpha = 0.2;
        g.strokeStyle = "#ffffff";
        for (let i = 0; i < 4; i++) {
          g.beginPath();
          g.ellipse(128, 64, 90 - i * 18, 60 - i * 12, 0, 0, TAU);
          g.stroke();
        }
        g.globalAlpha = 1;
      }
    } else if (body.texture === "earth") {
      g.fillStyle = "#4b8fc9";
      g.fillRect(0, 0, 256, 128);
      for (let i = 0; i < 26; i++) {
        const x = rnd() * 256;
        const y = 16 + rnd() * 96;
        g.fillStyle = rnd() > 0.35 ? "#6fa66a" : "#b9b07b";
        g.beginPath();
        g.ellipse(x, y, 8 + rnd() * 22, 4 + rnd() * 12, rnd() * 2, 0, TAU);
        g.fill();
      }
      g.globalAlpha = 0.45;
      g.fillStyle = "#ffffff";
      for (let i = 0; i < 20; i++) {
        g.beginPath();
        g.ellipse(rnd() * 256, rnd() * 128, 8 + rnd() * 18, 2 + rnd() * 4, 0, 0, TAU);
        g.fill();
      }
      g.globalAlpha = 1;
      g.fillStyle = "#f4f8f4";
      g.fillRect(0, 0, 256, 7);
      g.fillRect(0, 121, 256, 7);
    } else if (body.texture === "desert") {
      for (let i = 0; i < 40; i++) {
        g.globalAlpha = 0.1 + rnd() * 0.28;
        g.fillStyle = rnd() > 0.5 ? "#8d4c32" : "#e2b07e";
        g.beginPath();
        g.ellipse(rnd() * 256, rnd() * 128, 5 + rnd() * 20, 3 + rnd() * 8, 0, 0, TAU);
        g.fill();
      }
      g.globalAlpha = 0.75;
      g.fillStyle = "#f5ede2";
      g.fillRect(0, 0, 256, 5);
      g.fillRect(0, 123, 256, 5);
      g.globalAlpha = 1;
    } else {
      // Mercurio y superficies rocosas
      for (let i = 0; i < 70; i++) {
        g.globalAlpha = 0.1 + rnd() * 0.25;
        g.fillStyle = rnd() > 0.5 ? body.spot : "#f0e8da";
        g.beginPath();
        g.arc(rnd() * 256, rnd() * 128, 1 + rnd() * 7, 0, TAU);
        g.fill();
      }
      g.globalAlpha = 1;
    }
  }
  const tex = new CanvasTexture(c);
  tex.colorSpace = SRGBColorSpace;
  return tex;
}

function glowTexture(): CanvasTexture {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const g = c.getContext("2d");
  if (g) {
    const grad = g.createRadialGradient(64, 64, 2, 64, 64, 64);
    grad.addColorStop(0, "rgba(255,255,255,1)");
    grad.addColorStop(0.18, "rgba(255,225,150,0.85)");
    grad.addColorStop(0.5, "rgba(255,190,90,0.25)");
    grad.addColorStop(1, "rgba(255,190,90,0)");
    g.fillStyle = grad;
    g.fillRect(0, 0, 128, 128);
  }
  const tex = new CanvasTexture(c);
  tex.colorSpace = SRGBColorSpace;
  return tex;
}

function labelTexture(text: string): CanvasTexture {
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 64;
  const g = c.getContext("2d");
  if (g) {
    g.font = "bold 30px Nunito, system-ui, sans-serif";
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.lineWidth = 6;
    g.strokeStyle = "rgba(8,11,28,0.85)";
    g.strokeText(text, 128, 32);
    g.fillStyle = "#f4f4ff";
    g.fillText(text, 128, 32);
  }
  const tex = new CanvasTexture(c);
  tex.colorSpace = SRGBColorSpace;
  return tex;
}

interface MoonNode {
  def: MoonDef;
  orbit: Group;
  mesh: Mesh;
  label: Sprite;
}

interface Engine {
  setPlaying: (v: boolean) => void;
  setSpeed: (daysPerSecond: number) => void;
  setFocus: (name: string) => void;
  setNow: () => void;
  resetView: () => void;
  rotateBy: (dx: number, dy: number) => void;
  zoomBy: (factor: number) => void;
  dispose: () => void;
}

function focusDistance(name: string): number {
  if (name === "Sistema") return 340;
  if (name === "Sol") return 34;
  const moon = MOONS.find((m) => m.name === name);
  if (moon) return clamp(moon.orbit * 1.5, 8, 22);
  const body = BODIES.find((b) => b.key === name);
  if (body) {
    const far = MOONS_OF(name).reduce((a, m) => Math.max(a, m.orbit), 0);
    return clamp(body.r3 * 3 + far * 1.25, 10, 34);
  }
  return 340;
}

function createEngine(
  host: HTMLDivElement,
  opts: { onDate: (ms: number) => void; onPick: (name: string) => void; playing: boolean; speed: number },
): Engine | null {
  // Comprobación previa: evita que Three.js escriba errores en consola si no hay WebGL2.
  const probe = document.createElement("canvas");
  const gl = probe.getContext("webgl2");
  if (!gl) return null;
  gl.getExtension("WEBGL_lose_context")?.loseContext();

  let renderer: WebGLRenderer;
  try {
    renderer = new WebGLRenderer({ antialias: true, alpha: false, powerPreference: "low-power" });
  } catch {
    return null;
  }

  const disposables: { dispose: () => void }[] = [];
  const track = <T extends { dispose: () => void }>(x: T): T => {
    disposables.push(x);
    return x;
  };

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.domElement.style.width = "100%";
  renderer.domElement.style.height = "100%";
  renderer.domElement.style.display = "block";
  renderer.domElement.style.touchAction = "none";
  renderer.domElement.style.outline = "none";
  renderer.domElement.tabIndex = 0;
  renderer.domElement.setAttribute("role", "img");
  renderer.domElement.setAttribute("aria-label", "Modelo 3D del sistema solar. Arrastra para girar la vista, usa las flechas o pellizca para acercarte.");
  host.appendChild(renderer.domElement);

  const scene = new Scene();
  scene.background = new Color(0x080b1c);
  const camera = new PerspectiveCamera(50, 1, 0.1, 5000);
  scene.add(track(new AmbientLight(0xffffff, 0.42)));
  const sunLight = new PointLight(0xfff2d0, 2.9, 0, 0);
  sunLight.position.set(0, 0, 0);
  scene.add(sunLight);

  // Estrellas de fondo
  {
    const rnd = seeded(191);
    const coords: number[] = [];
    for (let i = 0; i < 900; i++) {
      const u = rnd() * 2 - 1;
      const a = rnd() * TAU;
      const r = 900 + rnd() * 900;
      const s = Math.sqrt(1 - u * u);
      coords.push(r * s * Math.cos(a), r * u, r * s * Math.sin(a));
    }
    const geo = track(new BufferGeometry());
    geo.setAttribute("position", new Float32BufferAttribute(coords, 3));
    scene.add(new Points(geo, track(new PointsMaterial({ color: 0xffffff, size: 1.4, sizeAttenuation: false, transparent: true, opacity: 0.85, depthWrite: false }))));
  }

  const clickables: Mesh[] = [];
  const pickables = new Map<string, Object3D>();
  const glow = track(glowTexture());

  // Sol
  const sunGroup = new Group();
  const sunGeo = track(new SphereGeometry(6, 32, 24));
  const sunMesh = new Mesh(sunGeo, track(new MeshBasicMaterial({ color: 0xffd978 })));
  sunMesh.userData.pickName = "Sol";
  clickables.push(sunMesh);
  sunGroup.add(sunMesh);
  const sunHalo = new Sprite(track(new SpriteMaterial({ map: glow, color: 0xffcf6a, transparent: true, blending: AdditiveBlending, depthWrite: false })));
  sunHalo.scale.set(38, 38, 1);
  sunGroup.add(sunHalo);
  scene.add(sunGroup);
  pickables.set("Sol", sunGroup);

  const planetNodes = new Map<string, { group: Group; spin: Group; mesh: Mesh; def: BodyDef }>();
  const moonNodes: MoonNode[] = [];

  for (const body of BODIES) {
    // Órbita real muestreada a lo largo de un período orbital.
    const periodDays = 365.25 * Math.pow(ELEMENTS[body.key].a, 1.5);
    const base = Date.now();
    const points: Vector3[] = [];
    for (let i = 0; i < 160; i++) points.push(to3D(planetVec(base + (i / 160) * periodDays * DAY, body.key)));
    const orbitGeo = track(new BufferGeometry().setFromPoints(points));
    scene.add(new LineLoop(orbitGeo, track(new LineBasicMaterial({ color: 0x8891c9, transparent: true, opacity: 0.24 }))));

    const group = new Group();
    scene.add(group);
    pickables.set(body.key, group);

    const spin = new Group();
    spin.rotation.z = body.tilt * D2R;
    group.add(spin);

    const tex = track(planetTexture(body));
    const geo = track(new SphereGeometry(body.r3, 32, 20));
    const mat = track(new MeshStandardMaterial({ map: tex, roughness: 1, metalness: 0 }));
    const mesh = new Mesh(geo, mat);
    mesh.userData.pickName = body.key;
    clickables.push(mesh);
    spin.add(mesh);

    if (body.ring) {
      for (let i = 0; i < 3; i++) {
        const inner = body.r3 * (1.4 + i * 0.24);
        const ring = new Mesh(
          track(new RingGeometry(inner, inner + body.r3 * 0.18, 64)),
          track(new MeshBasicMaterial({ color: i === 1 ? 0xd7bb85 : 0xe9d6a8, side: DoubleSide, transparent: true, opacity: 0.55 - i * 0.1, depthWrite: false })),
        );
        ring.rotation.x = -Math.PI / 2;
        spin.add(ring);
      }
    }

    for (const moon of MOONS_OF(body.key)) {
      const orbit = new Group();
      orbit.rotation.z = moon.tilt * D2R;
      group.add(orbit);
      const circle: Vector3[] = [];
      for (let i = 0; i < 64; i++) {
        const a = (i / 64) * TAU;
        circle.push(new Vector3(Math.cos(a) * moon.orbit, 0, Math.sin(a) * moon.orbit));
      }
      orbit.add(new LineLoop(track(new BufferGeometry().setFromPoints(circle)), track(new LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.16 }))));
      const moonMesh = new Mesh(
        track(new SphereGeometry(moon.size, 16, 12)),
        track(new MeshStandardMaterial({ color: moon.color, roughness: 1, metalness: 0 })),
      );
      moonMesh.position.set(moon.orbit, 0, 0);
      moonMesh.userData.pickName = moon.name;
      clickables.push(moonMesh);
      orbit.add(moonMesh);
      pickables.set(moon.name, moonMesh);
      const label = new Sprite(track(new SpriteMaterial({ map: track(labelTexture(moon.name)), transparent: true, depthTest: false, depthWrite: false })));
      label.position.set(moon.orbit, moon.size + 1.4, 0);
      label.scale.set(6.5, 1.6, 1);
      label.visible = false;
      orbit.add(label);
      moonNodes.push({ def: moon, orbit, mesh: moonMesh, label });
    }
    planetNodes.set(body.key, { group, spin, mesh, def: body });
  }

  const view = {
    yaw: 0.65,
    pitch: 0.52,
    distance: 340,
    desiredDistance: 340,
    focus: "Sistema",
    target: new Vector3(),
    desiredTarget: new Vector3(),
  };
  let simMs = Date.now();
  let playing = opts.playing;
  let speedDays = opts.speed;
  let raf = 0;
  let last = performance.now();
  let lastUi = 0;
  const tmp = new Vector3();

  function setFocus(name: string) {
    view.focus = name;
    view.desiredDistance = focusDistance(name);
  }

  const raycaster = new Raycaster();
  const ndc = new Vector2();
  const pointers = new Map<number, { x: number; y: number }>();
  let pinch = 0;
  let moved = false;

  const rotateBy = (dx: number, dy: number) => {
    view.yaw -= dx * 0.006;
    view.pitch = clamp(view.pitch + dy * 0.006, -1.3, 1.3);
  };
  const zoomBy = (factor: number) => {
    view.desiredDistance = clamp(view.desiredDistance * factor, 5, 900);
  };

  const onPointerDown = (e: PointerEvent) => {
    renderer.domElement.setPointerCapture(e.pointerId);
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.size === 2) {
      const [a, b] = [...pointers.values()];
      pinch = Math.hypot(a.x - b.x, a.y - b.y);
    }
    moved = false;
  };
  const onPointerMove = (e: PointerEvent) => {
    const prev = pointers.get(e.pointerId);
    if (!prev) return;
    const dx = e.clientX - prev.x;
    const dy = e.clientY - prev.y;
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.size === 2) {
      const [a, b] = [...pointers.values()];
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      if (pinch > 0 && d > 0) zoomBy(pinch / d);
      pinch = d;
      moved = true;
    } else {
      if (Math.abs(dx) + Math.abs(dy) > 1) {
        rotateBy(dx, dy);
        moved = true;
      }
    }
  };
  const onPointerUp = (e: PointerEvent) => {
    if (pointers.has(e.pointerId) && pointers.size === 1 && !moved) {
      const rect = renderer.domElement.getBoundingClientRect();
      ndc.set(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
      raycaster.setFromCamera(ndc, camera);
      const hit = raycaster.intersectObjects(clickables, false)[0];
      if (hit) {
        const name = hit.object.userData.pickName as string;
        setFocus(name);
        opts.onPick(name);
      }
    }
    pointers.delete(e.pointerId);
    if (pointers.size < 2) pinch = 0;
    try {
      renderer.domElement.releasePointerCapture(e.pointerId);
    } catch {
      // el navegador ya liberó el puntero
    }
  };
  const onWheel = (e: WheelEvent) => {
    e.preventDefault();
    zoomBy(Math.exp(e.deltaY * 0.0012));
  };
  const onKeyDown = (e: KeyboardEvent) => {
    const map: Record<string, () => void> = {
      ArrowLeft: () => rotateBy(-18, 0),
      ArrowRight: () => rotateBy(18, 0),
      ArrowUp: () => rotateBy(0, -18),
      ArrowDown: () => rotateBy(0, 18),
      "+": () => zoomBy(0.85),
      "=": () => zoomBy(0.85),
      "-": () => zoomBy(1.18),
    };
    const fn = map[e.key];
    if (fn) {
      e.preventDefault();
      fn();
    }
  };

  const canvas = renderer.domElement;
  canvas.addEventListener("pointerdown", onPointerDown);
  canvas.addEventListener("pointermove", onPointerMove);
  canvas.addEventListener("pointerup", onPointerUp);
  canvas.addEventListener("pointercancel", onPointerUp);
  canvas.addEventListener("wheel", onWheel, { passive: false });
  canvas.addEventListener("keydown", onKeyDown);

  const resize = () => {
    const w = Math.max(1, host.clientWidth);
    const h = Math.max(1, host.clientHeight);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };
  resize();
  const ro = new ResizeObserver(resize);
  ro.observe(host);

  const tick = (now: number) => {
    const dt = Math.min(0.1, (now - last) / 1000);
    last = now;
    if (playing) simMs += dt * speedDays * DAY;
    const days = (simMs - J2000) / DAY;
    const E = planetVec(simMs, "Tierra");
    const sunAngle = Math.atan2(-E[1], -E[0]);

    sunMesh.rotation.y = days * 0.02;
    for (const { group, mesh, def } of planetNodes.values()) {
      group.position.copy(to3D(planetVec(simMs, def.key)));
      mesh.rotation.y = (TAU * days) / def.rotDays;
    }
    for (const node of moonNodes) {
      const m = node.def;
      // La Luna usa la fase real; las demás, su período orbital real.
      const angle = m.name === "Luna" ? sunAngle + (TAU * moonAgeAt(simMs)) / SYNODIC : (TAU * days) / m.period + m.phase;
      node.orbit.rotation.y = angle;
      node.label.visible = view.focus === m.parent || view.focus === m.name;
    }

    const obj = pickables.get(view.focus);
    if (obj) obj.getWorldPosition(tmp);
    else tmp.set(0, 0, 0);
    view.desiredTarget.copy(tmp);
    view.target.lerp(view.desiredTarget, 0.09);
    view.distance += (view.desiredDistance - view.distance) * 0.1;

    const cp = Math.cos(view.pitch);
    camera.position.set(
      view.target.x + view.distance * cp * Math.sin(view.yaw),
      view.target.y + view.distance * Math.sin(view.pitch),
      view.target.z + view.distance * cp * Math.cos(view.yaw),
    );
    camera.lookAt(view.target);
    renderer.render(scene, camera);

    if (now - lastUi > 250) {
      opts.onDate(simMs);
      lastUi = now;
    }
    raf = requestAnimationFrame(tick);
  };
  raf = requestAnimationFrame(tick);

  return {
    setPlaying: (v) => { playing = v; },
    setSpeed: (v) => { speedDays = v; },
    setFocus,
    setNow: () => { simMs = Date.now(); opts.onDate(simMs); },
    resetView: () => {
      view.yaw = 0.65;
      view.pitch = 0.52;
      setFocus("Sistema");
      opts.onPick("Sistema");
    },
    rotateBy,
    zoomBy,
    dispose: () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerup", onPointerUp);
      canvas.removeEventListener("pointercancel", onPointerUp);
      canvas.removeEventListener("wheel", onWheel);
      canvas.removeEventListener("keydown", onKeyDown);
      disposables.forEach((d) => d.dispose());
      renderer.dispose();
      // Libera el contexto WebGL: así no queda una GPU activa al cerrar el modal.
      try {
        renderer.forceContextLoss();
      } catch {
        // algunos navegadores ya lo liberaron
      }
      if (canvas.parentNode === host) host.removeChild(canvas);
    },
  };
}

/** Opción B: modelo 3D del sistema solar con rotaciones y lunas en movimiento real. */
export function Solar3D(_props: ExperienceProps) {
  const { comfort } = useComfort();
  const hostRef = useRef<HTMLDivElement>(null);
  const engine = useRef<Engine | null>(null);
  const [supported, setSupported] = useState(true);
  const [playing, setPlaying] = useState(!comfort.reduceMotion);
  const [speedIdx, setSpeedIdx] = useState(1);
  const [selected, setSelected] = useState("Sistema");
  const [date, setDate] = useState(() => Date.now());

  useEffect(() => {
    if (!hostRef.current) return;
    const e = createEngine(hostRef.current, {
      onDate: setDate,
      onPick: setSelected,
      playing: !comfort.reduceMotion,
      speed: SPEEDS[1].days,
    });
    if (!e) {
      setSupported(false);
      return;
    }
    engine.current = e;
    return () => {
      e.dispose();
      engine.current = null;
    };
    // Se crea una vez; el resto se actualiza mediante los métodos del motor.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => engine.current?.setPlaying(playing), [playing]);
  useEffect(() => engine.current?.setSpeed(SPEEDS[speedIdx].days), [speedIdx]);
  useEffect(() => engine.current?.setFocus(selected), [selected]);

  const moon = MOONS.find((m) => m.name === selected);
  const body = BODIES.find((b) => b.key === selected);
  const moons = MOONS_OF(selected);
  const dateLabel = new Date(date).toLocaleString("es", { dateStyle: "long", timeStyle: "short" });

  const chips = ["Sistema", "Sol", ...BODIES.map((b) => b.key)];
  const rotationLabel = body
    ? `${fmt(Math.abs(body.rotDays) < 2 ? Math.abs(body.rotDays) * 24 : Math.abs(body.rotDays), 1)} ${Math.abs(body.rotDays) < 2 ? "horas" : "días"}${body.rotDays < 0 ? ", al revés" : ""}`
    : "";

  return (
    <div className="space-y-4">
      <Caption>
        Arrastra para girar la vista, usa la rueda o pellizca para acercarte, y toca un planeta o una luna para seguirlo. Con el teclado: flechas para girar y + / − para acercar.
      </Caption>

      <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl border border-line bg-[#080b1c]">
        {supported ? (
          <>
            <div ref={hostRef} className="absolute inset-0" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#080b1c]/85 to-transparent px-4 pt-8 pb-3 text-xs font-bold text-[#dfe4ff]">
              <p className="tabular-nums">{dateLabel}</p>
              <p className="opacity-80">Siguiendo: {selected}</p>
            </div>
          </>
        ) : (
          <div className="grid h-full place-items-center p-6 text-center text-[#dfe4ff]">
            <div>
              <p aria-hidden="true" className="text-5xl">🪐</p>
              <p className="mt-3 font-bold">Este navegador no puede mostrar el modelo 3D.</p>
              <p className="mt-1 text-sm opacity-80">El mapa orbital de la opción A sigue disponible y muestra las mismas posiciones reales.</p>
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1" role="group" aria-label="Seguir un cuerpo">
        {chips.map((c) => (
          <button key={c} type="button" aria-pressed={selected === c} className={`btn min-h-9 shrink-0 text-sm ${selected === c ? "btn-primary" : "btn-quiet"}`} onClick={() => setSelected(c)}>
            {c === "Sistema" ? "🌌 Vista general" : c === "Sol" ? "☀️ Sol" : c}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button type="button" className="btn btn-primary min-h-9 text-sm" aria-pressed={playing} onClick={() => setPlaying((p) => !p)}>
          <Icon name={playing ? "stop" : "play"} size={14} /> {playing ? "Pausar" : "Seguir"}
        </button>
        <button type="button" className="btn btn-quiet min-h-9 text-sm" onClick={() => engine.current?.setNow()}>
          Ir a hoy
        </button>
        <button type="button" className="btn btn-quiet min-h-9 text-sm" onClick={() => engine.current?.resetView()}>
          Vista general
        </button>
        <button type="button" className="btn btn-quiet min-h-9 w-10 px-0 text-base" aria-label="Acercar" onClick={() => engine.current?.zoomBy(0.8)}>
          +
        </button>
        <button type="button" className="btn btn-quiet min-h-9 w-10 px-0 text-base" aria-label="Alejar" onClick={() => engine.current?.zoomBy(1.25)}>
          −
        </button>
        <button type="button" className="btn btn-quiet min-h-9 w-10 px-0" aria-label="Girar a la izquierda" onClick={() => engine.current?.rotateBy(-30, 0)}>
          <Icon name="arrow-left" size={15} />
        </button>
        <button type="button" className="btn btn-quiet min-h-9 w-10 px-0" aria-label="Girar a la derecha" onClick={() => engine.current?.rotateBy(30, 0)}>
          <Icon name="arrow-right" size={15} />
        </button>
      </div>

      <div role="group" aria-label="Velocidad del tiempo" className="flex flex-wrap gap-2">
        {SPEEDS.map((s, i) => (
          <button key={s.label} type="button" aria-pressed={speedIdx === i} className={`btn min-h-9 text-sm ${speedIdx === i ? "btn-primary" : "btn-quiet"}`} onClick={() => setSpeedIdx(i)}>
            {s.label}
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-line bg-soft p-4" aria-live="polite">
        {selected === "Sistema" ? (
          <>
            <p className="text-lg font-extrabold">El sistema solar, en movimiento</p>
            <p className="mt-1 text-sm">
              Las posiciones de los planetas corresponden a la fecha que se muestra. Cada planeta gira sobre su eje con su período real y sus lunas orbitan con los suyos. Acércate a Júpiter o Saturno para verlas.
            </p>
          </>
        ) : selected === "Sol" ? (
          <>
            <p className="text-lg font-extrabold">☀️ El Sol</p>
            <p className="mt-1 text-sm">Contiene el 99,8 % de la masa del sistema solar. Su luz tarda unos 8 minutos en llegar a la Tierra y algo más de 4 horas en llegar a Neptuno.</p>
          </>
        ) : moon ? (
          <>
            <p className="text-lg font-extrabold">{moon.name}</p>
            <p className="mt-1 text-sm">
              Luna de {moon.parent}. Da una vuelta cada {fmt(Math.abs(moon.period), Math.abs(moon.period) < 1 ? 2 : 1)} días{moon.period < 0 ? " y gira al revés que su planeta" : ""}. {moon.fact}
            </p>
          </>
        ) : body ? (
          <>
            <p className="text-lg font-extrabold">{selected}</p>
            <p className="mt-1 text-sm">
              Gira sobre sí cada {rotationLabel}; eje inclinado {fmt(body.tilt, 1)}°. Ahora está a {fmt(Math.hypot(...planetVec(date, selected)), 2)} UA del Sol. {body.fact}
            </p>
            {moons.length > 0 && (
              <p className="mt-2 text-sm text-muted">
                {moons.length} {moons.length === 1 ? "luna" : "lunas"}: {moons.map((m) => `${m.name} (${fmt(Math.abs(m.period), 1)} d)`).join(", ")}.
              </p>
            )}
          </>
        ) : null}
      </div>

      <Note>
        Los tamaños de planetas y lunas, sus distancias y la inclinación de las órbitas están exagerados para que se vean; los períodos de rotación y de las lunas, y las posiciones de los planetas, son reales. Las texturas están dibujadas en código.
      </Note>
    </div>
  );
}
