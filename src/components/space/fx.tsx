import { motion, useMotionValue, useSpring, useTransform, AnimatePresence, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState, type ReactNode, type MouseEvent } from "react";
import { profile } from "@/lib/profile";

/* ---------- Magnetic wrapper: element drifts toward the cursor ---------- */
export function Magnetic({ children, strength = 0.35, className }: { children: ReactNode; strength?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useSpring(0, { stiffness: 200, damping: 15, mass: 0.4 });
  const y = useSpring(0, { stiffness: 200, damping: 15, mass: 0.4 });
  const onMove = (e: MouseEvent) => {
    const r = ref.current!.getBoundingClientRect();
    x.set((e.clientX - r.left - r.width / 2) * strength);
    y.set((e.clientY - r.top - r.height / 2) * strength);
  };
  return (
    <motion.div ref={ref} onMouseMove={onMove} onMouseLeave={() => { x.set(0); y.set(0); }} style={{ x, y }} className={className} data-cursor="grow">
      {children}
    </motion.div>
  );
}

/* ---------- Tilt card: 3D tilt + glare following cursor ---------- */
export function Tilt({ children, className, max = 10 }: { children: ReactNode; className?: string; max?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const rx = useSpring(useTransform(py, [0, 1], [max, -max]), { stiffness: 150, damping: 18 });
  const ry = useSpring(useTransform(px, [0, 1], [-max, max]), { stiffness: 150, damping: 18 });
  const glare = useTransform([px, py], ([a, b]) => `radial-gradient(circle at ${(a as number) * 100}% ${(b as number) * 100}%, color-mix(in oklab, var(--glow) 35%, transparent), transparent 55%)`);
  return (
    <motion.div
      ref={ref}
      data-cursor="magnet"
      onMouseMove={(e) => {
        const r = ref.current!.getBoundingClientRect();
        px.set((e.clientX - r.left) / r.width);
        py.set((e.clientY - r.top) / r.height);
      }}
      onMouseLeave={() => { px.set(0.5); py.set(0.5); }}
      whileHover={{ y: -8, scale: 1.015 }}
      transition={{ type: "spring", stiffness: 220, damping: 20 }}
      style={{ rotateX: rx, rotateY: ry, transformPerspective: 900 }}
      className={`relative ${className ?? ""}`}
    >
      <motion.div aria-hidden className="pointer-events-none absolute inset-0 rounded-[inherit]" style={{ background: glare }} />
      {children}
    </motion.div>
  );
}

/* ---------- Ripple button ---------- */
export function GlowButton({ children, href, onClick, variant = "solid", type, ...rest }: { children: ReactNode; href?: string; onClick?: () => void; variant?: "solid" | "ghost"; type?: "submit" | "button"; [k: string]: unknown }) {
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);
  const base = "relative inline-flex items-center gap-2 overflow-hidden whitespace-nowrap rounded-full px-6 py-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";
  const styles = variant === "solid" ? "bg-primary text-primary-foreground shadow-glow" : "glass-light text-ink";
  const addRipple = (e: MouseEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const id = Date.now();
    setRipples((p) => [...p, { id, x: e.clientX - r.left, y: e.clientY - r.top }]);
    setTimeout(() => setRipples((p) => p.filter((q) => q.id !== id)), 700);
    onClick?.();
  };
  const inner = (
    <>
      {ripples.map((r) => (
        <motion.span key={r.id} aria-hidden className="pointer-events-none absolute size-4 rounded-full bg-starlight/60" style={{ left: r.x - 8, top: r.y - 8 }} initial={{ scale: 0, opacity: 0.8 }} animate={{ scale: 14, opacity: 0 }} transition={{ duration: 0.7 }} />
      ))}
      <span className="relative inline-flex items-center gap-2">{children}</span>
    </>
  );
  return (
    <Magnetic>
      {href ? (
        <a href={href} onClick={addRipple} className={`${base} ${styles}`} {...rest}>{inner}</a>
      ) : (
        <button type={type ?? "button"} onClick={addRipple} className={`${base} ${styles}`} {...rest}>{inner}</button>
      )}
    </Magnetic>
  );
}

/* ---------- AI orb cursor ---------- */
export function OrbCursor() {
  const reduce = useReducedMotion();
  const [enabled, setEnabled] = useState(false);
  const [mode, setMode] = useState<"idle" | "grow" | "magnet">("idle");
  const mx = useMotionValue(-100);
  const my = useMotionValue(-100);
  const x = useSpring(mx, { stiffness: 350, damping: 28, mass: 0.5 });
  const y = useSpring(my, { stiffness: 350, damping: 28, mass: 0.5 });
  const tx = useSpring(mx, { stiffness: 90, damping: 20 });
  const ty = useSpring(my, { stiffness: 90, damping: 20 });
  const tx2 = useSpring(mx, { stiffness: 50, damping: 18 });
  const ty2 = useSpring(my, { stiffness: 50, damping: 18 });

  useEffect(() => {
    if (reduce || !window.matchMedia("(pointer: fine)").matches) return;
    setEnabled(true);
    document.documentElement.classList.add("custom-cursor");
    const move = (e: PointerEvent) => {
      mx.set(e.clientX);
      my.set(e.clientY);
      const t = (e.target as HTMLElement).closest?.("[data-cursor], a, button, input, textarea") as HTMLElement | null;
      setMode(t ? (t.dataset["cursor"] === "magnet" ? "magnet" : "grow") : "idle");
    };
    window.addEventListener("pointermove", move);
    return () => {
      window.removeEventListener("pointermove", move);
      document.documentElement.classList.remove("custom-cursor");
    };
  }, [reduce, mx, my]);

  if (!enabled) return null;
  const size = mode === "grow" ? 56 : mode === "magnet" ? 84 : 18;
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[100] mix-blend-difference">
      <motion.div className="absolute size-2 -translate-1/2 rounded-full bg-glow/70 blur-[2px]" style={{ left: tx2, top: ty2 }} />
      <motion.div className="absolute size-3 -translate-1/2 rounded-full bg-glow/80 blur-[1px]" style={{ left: tx, top: ty }} />
      <motion.div className="absolute" style={{ left: x, top: y }}>
        <motion.div
          className="-translate-1/2 rounded-full border border-starlight/70 bg-glow/40 shadow-glow backdrop-blur-[1px]"
          animate={{ width: size, height: size }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        />
        <motion.div className="absolute left-0 top-0" animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 3, ease: "linear" }}>
          {[0, 120, 240].map((a) => (
            <span key={a} className="absolute size-1 rounded-full bg-starlight" style={{ transform: `rotate(${a}deg) translateX(${size / 2 + 8}px)` }} />
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}

/* ---------- Boot sequence loader ---------- */
const DIAG = ["Initializing neural core", "Calibrating star maps", "Warming fusion engines", "Syncing particle field", "Systems nominal"];
export function BootLoader({ onDone }: { onDone: () => void }) {
  const [pct, setPct] = useState(0);
  const [show, setShow] = useState(true);
  useEffect(() => {
    let p = 0;
    const id = setInterval(() => {
      p = Math.min(100, p + Math.random() * 9 + 3);
      setPct(Math.floor(p));
      if (p >= 100) {
        clearInterval(id);
        setTimeout(() => { setShow(false); onDone(); }, 500);
      }
    }, 90);
    return () => clearInterval(id);
  }, [onDone]);
  return (
    <AnimatePresence>
      {show && (
        <motion.div role="status" aria-live="polite" className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-background text-ink" exit={{ opacity: 0, scale: 1.08, filter: "blur(12px)" }} transition={{ duration: 0.9, ease: [0.7, 0, 0.2, 1] }}>
          <motion.div className="relative grid size-28 place-items-center" animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 6, ease: "linear" }}>
            <svg viewBox="0 0 100 100" className="absolute inset-0 size-full">
              <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeOpacity="0.12" />
              <motion.circle cx="50" cy="50" r="46" fill="none" stroke="var(--primary)" strokeWidth="1.5" strokeLinecap="round" pathLength={1} strokeDasharray="1" animate={{ strokeDashoffset: 1 - pct / 100 }} />
            </svg>
            <motion.span className="font-display text-4xl italic" animate={{ rotate: -360 }} transition={{ repeat: Infinity, duration: 6, ease: "linear" }}>{profile.initials}</motion.span>
          </motion.div>
          <p className="mt-8 font-display text-6xl tabular-nums">{pct}<span className="text-ink-soft">%</span></p>
          <ul className="eyebrow mt-6 h-24 space-y-1 text-center text-ink-soft">
            {DIAG.slice(0, Math.ceil((pct / 100) * DIAG.length)).map((d) => (
              <motion.li key={d} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>▸ {d}</motion.li>
            ))}
          </ul>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
