import { ClientOnly } from "@tanstack/react-router";
import { motion, useScroll, useTransform, useMotionValueEvent, useReducedMotion } from "framer-motion";
import Lenis from "lenis";
import { gsap } from "gsap";
import { lazy, Suspense, useCallback, useEffect, useRef, useState } from "react";
import { profile } from "@/lib/profile";
import { BootLoader, OrbCursor } from "./fx";
import { Hero, About, Skills, Projects, Experience as Exp, Certifications, Contact, Footer } from "./Sections";

const Universe = lazy(() => import("./Universe"));

const NAV = ["home", "about", "skills", "projects", "experience", "certifications", "contact"];
let lenisRef: Lenis | null = null;

function goTo(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  if (lenisRef) lenisRef.scrollTo(el, { duration: 1.8, easing: (t) => 1 - Math.pow(1 - t, 4) });
  else el.scrollIntoView({ behavior: "smooth" });
}

function Navbar() {
  const [active, setActive] = useState("home");
  const [small, setSmall] = useState(false);
  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, "change", (v) => setSmall(v > 60));
  useEffect(() => {
    const io = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && setActive(e.target.id)), { rootMargin: "-45% 0px -50% 0px" });
    NAV.forEach((id) => { const el = document.getElementById(id); if (el) io.observe(el); });
    return () => io.disconnect();
  }, []);
  return (
    <motion.nav aria-label="Primary" className="fixed inset-x-0 top-4 z-50 flex justify-center px-3" initial={{ y: -80 }} animate={{ y: 0 }} transition={{ type: "spring", stiffness: 120, damping: 18, delay: 0.3 }}>
      <motion.div layout className="flex max-w-full items-center gap-1 overflow-x-auto rounded-full border border-glass-edge bg-popover/60 text-popover-foreground shadow-glow backdrop-blur-xl" animate={{ padding: small ? "4px" : "8px" }}>
        <button onClick={() => goTo("home")} className="px-3 font-display text-xl italic" aria-label="Back to top">{profile.initials}</button>
        {NAV.slice(1).map((id) => (
          <a key={id} href={`#${id}`} onClick={(e) => { e.preventDefault(); goTo(id); }} aria-current={active === id ? "true" : undefined} className={`relative whitespace-nowrap rounded-full px-3 py-1.5 text-xs capitalize transition-colors md:text-sm ${active === id ? "text-ink" : "text-starlight-soft hover:text-starlight"} ${id === "certifications" ? "hidden lg:block" : ""}`}>
            {active === id && <motion.span layoutId="nav-pill" className="absolute inset-0 rounded-full bg-starlight" transition={{ type: "spring", stiffness: 300, damping: 26 }} />}
            <span className="relative">{id}</span>
          </a>
        ))}
      </motion.div>
    </motion.nav>
  );
}

export function SpaceExperience() {
  const reduce = useReducedMotion();
  const [ready, setReady] = useState(false);
  const scroll = useRef(0);
  const mouse = useRef({ x: 0, y: 0 });
  const { scrollYProgress } = useScroll();
  const bg = useTransform(scrollYProgress, [0, 0.07, 0.17, 0.3, 0.48, 0.75], ["#fbfcfe", "#e6e9ef", "#4a78bd", "#172a5c", "#0b1130", "#04050a"]);
  useMotionValueEvent(scrollYProgress, "change", (v) => { scroll.current = v; });
  const done = useCallback(() => setReady(true), []);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      gsap.to(mouse.current, { x: (e.clientX / window.innerWidth) * 2 - 1, y: -((e.clientY / window.innerHeight) * 2 - 1), duration: 1.2, ease: "power3.out", overwrite: true });
    };
    window.addEventListener("pointermove", onMove);
    if (reduce) return () => window.removeEventListener("pointermove", onMove);
    const lenis = new Lenis({ lerp: 0.075, smoothWheel: true });
    lenisRef = lenis;
    let raf = 0;
    const loop = (t: number) => { lenis.raf(t); raf = requestAnimationFrame(loop); };
    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); lenis.destroy(); lenisRef = null; window.removeEventListener("pointermove", onMove); };
  }, [reduce]);

  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[300] focus:rounded focus:bg-starlight focus:px-3 focus:py-2 focus:text-ink">Skip to content</a>
      <ClientOnly fallback={null}><BootLoader onDone={done} /></ClientOnly>
      <motion.div aria-hidden className="fixed inset-0 -z-20" style={{ backgroundColor: bg }} />
      <div aria-hidden className="fixed inset-0 -z-10">
        <ClientOnly fallback={null}>
          <Suspense fallback={null}><Universe scroll={scroll} mouse={mouse} /></Suspense>
        </ClientOnly>
      </div>
      <ClientOnly fallback={null}><OrbCursor /></ClientOnly>
      <Navbar />
      <main id="main" className="relative mx-auto max-w-7xl overflow-x-clip">
        <Hero ready={ready} />
        <About />
        <Skills />
        <Projects />
        <Exp />
        <Certifications />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
