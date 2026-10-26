import { motion, AnimatePresence, useInView, animate } from "framer-motion";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { FiGithub, FiExternalLink, FiArrowUpRight, FiSend, FiAward, FiMail, FiMapPin, FiPhone } from "react-icons/fi";
import { FaLinkedinIn, FaXTwitter, FaInstagram, FaYoutube, FaMedium } from "react-icons/fa6";
import { profile } from "@/lib/profile";
import { GlowButton, Tilt, Magnetic } from "./fx";

const spring = { type: "spring" as const, stiffness: 90, damping: 18 };
const reveal = { initial: { opacity: 0, y: 40, filter: "blur(8px)" }, whileInView: { opacity: 1, y: 0, filter: "blur(0px)" }, viewport: { once: true, margin: "-80px" }, transition: spring };

function Heading({ eyebrow, title, light }: { eyebrow: string; title: ReactNode; light?: boolean }) {
  return (
    <motion.header {...reveal} className="mb-14">
      <p className={`eyebrow ${light ? "text-starlight-soft" : "text-ink-soft"}`}>{eyebrow}</p>
      <h2 className={`mt-3 font-display text-5xl leading-[0.95] md:text-7xl ${light ? "text-starlight text-glow" : "text-ink"}`}>{title}</h2>
    </motion.header>
  );
}

/* ---------------- HERO ---------------- */
function RotatingTitle() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setI((v) => (v + 1) % profile.titles.length), 2200);
    return () => clearInterval(id);
  }, []);
  return (
    <span className="relative inline-flex h-[1.3em] overflow-hidden align-bottom">
      <AnimatePresence mode="wait">
        <motion.span key={i} initial={{ y: "100%", opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: "-100%", opacity: 0 }} transition={spring} className="text-primary">
          {profile.titles[i]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

export function Hero({ ready }: { ready: boolean }) {
  const words = profile.name.split(" ");
  return (
    <section id="home" aria-label="Introduction" className="relative flex min-h-svh items-center px-6 pt-28 md:px-12">
      <div className="max-w-3xl">
        <motion.p className="eyebrow text-ink-soft" initial={{ opacity: 0 }} animate={ready ? { opacity: 1 } : {}} transition={{ delay: 0.2 }}>
          ◦ Transmission received — {profile.location}
        </motion.p>
        <h1 className="mt-6 font-display text-[clamp(3.5rem,11vw,9.5rem)] leading-[0.88] tracking-tight text-ink">
          {words.map((w, i) => (
            <span key={i} className="block overflow-hidden">
              <motion.span className="block" initial={{ y: "110%" }} animate={ready ? { y: 0 } : {}} transition={{ ...spring, delay: 0.3 + i * 0.12 }}>
                {i === words.length - 1 ? <em>{w}</em> : w}
              </motion.span>
            </span>
          ))}
        </h1>
        <motion.p className="mt-6 text-xl text-ink-soft md:text-2xl" initial={{ opacity: 0, y: 20 }} animate={ready ? { opacity: 1, y: 0 } : {}} transition={{ ...spring, delay: 0.6 }}>
          <RotatingTitle />
        </motion.p>
        <motion.div className="mt-10 flex flex-wrap gap-3" initial={{ opacity: 0, y: 20 }} animate={ready ? { opacity: 1, y: 0 } : {}} transition={{ ...spring, delay: 0.8 }}>
          <GlowButton href="#projects">View Projects <FiArrowUpRight /></GlowButton>
          <GlowButton href={profile.resume} variant="ghost" target="_blank" rel="noreferrer">Download Resume</GlowButton>
          <GlowButton href="#contact" variant="ghost">Contact Me</GlowButton>
        </motion.div>
      </div>
      <motion.div className="eyebrow absolute bottom-8 left-1/2 -translate-x-1/2 text-ink-soft" animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
        Scroll to launch ↓
      </motion.div>
    </section>
  );
}

/* ---------------- ABOUT ---------------- */
function Counter({ to, suffix }: { to: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  useEffect(() => {
    if (!inView || !ref.current) return;
    const c = animate(0, to, { duration: 1.6, ease: "easeOut", onUpdate: (v) => { if (ref.current) ref.current.textContent = Math.round(v) + suffix; } });
    return () => c.stop();
  }, [inView, to, suffix]);
  return <span ref={ref}>0{suffix}</span>;
}

export function About() {
  const [tab, setTab] = useState(0);
  const tabs = ["Story", "Education", "Achievements"];
  return (
    <section id="about" aria-labelledby="about-h" className="px-6 py-32 md:px-12">
      <Heading eyebrow="01 — Ship's log" title={<span id="about-h">About the <em>pilot</em></span>} />
      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <motion.div {...reveal} className="glass-light rounded-2xl p-8">
          <div role="tablist" className="mb-6 flex gap-2">
            {tabs.map((t, i) => (
              <button key={t} role="tab" aria-selected={tab === i} onClick={() => setTab(i)} className="relative rounded-full px-4 py-1.5 text-sm text-ink">
                {tab === i && <motion.span layoutId="tab" className="absolute inset-0 rounded-full bg-primary/15" transition={spring} />}
                <span className="relative">{t}</span>
              </button>
            ))}
          </div>
          <AnimatePresence mode="wait">
            <motion.div key={tab} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={spring} className="space-y-3 text-lg leading-relaxed text-ink-soft">
              {tab === 0 && profile.about.map((p) => <p key={p}>{p}</p>)}
              {tab === 1 && (
                <dl className="grid grid-cols-2 gap-4">
                  {Object.entries(profile.education).map(([k, v]) => (
                    <div key={k}><dt className="eyebrow">{k}</dt><dd className="mt-1 text-ink">{v}</dd></div>
                  ))}
                </dl>
              )}
              {tab === 2 && <ul className="space-y-2">{profile.achievements.map((a) => <li key={a} className="flex gap-2"><FiAward className="mt-1 text-primary" />{a}</li>)}</ul>}
            </motion.div>
          </AnimatePresence>
        </motion.div>
        <div className="grid grid-cols-2 gap-4">
          {profile.stats.map((s, i) => (
            <motion.div key={s.label} {...reveal} transition={{ ...spring, delay: i * 0.08 }}>
              <Tilt className="glass-light h-full rounded-2xl p-6">
                <p className="font-display text-5xl text-ink"><Counter to={s.value} suffix={s.suffix} /></p>
                <p className="mt-2 text-sm text-ink-soft">{s.label}</p>
              </Tilt>
            </motion.div>
          ))}
        </div>
      </div>
      <ol className="relative mt-16 grid gap-6 border-t border-ink/15 pt-10 md:grid-cols-4">
        {profile.timeline.map((t, i) => (
          <motion.li key={t.year} {...reveal} transition={{ ...spring, delay: i * 0.1 }} className="relative">
            <span className="absolute -top-[46px] left-0 size-3 rounded-full bg-primary shadow-glow" />
            <p className="font-display text-3xl text-ink">{t.year}</p>
            <p className="mt-1 text-ink-soft">{t.text}</p>
          </motion.li>
        ))}
      </ol>
    </section>
  );
}

/* ---------------- SKILLS (planets) ---------------- */
export function Skills() {
  const [active, setActive] = useState<number | null>(null);
  return (
    <section id="skills" aria-labelledby="skills-h" className="px-6 py-32 md:px-12">
      <Heading light eyebrow="02 — Star system" title={<span id="skills-h">Skills in <em>orbit</em></span>} />
      <div className="grid grid-cols-2 gap-x-6 gap-y-16 sm:grid-cols-3">
        {profile.skills.map((s, i) => {
          const size = 110 + ((i * 37) % 60);
          const open = active === i;
          return (
            <motion.div key={s.name} {...reveal} transition={{ ...spring, delay: i * 0.08 }} className="relative flex flex-col items-center">
              <motion.button
                data-cursor="magnet"
                aria-expanded={open}
                aria-label={`${s.name} details`}
                onMouseEnter={() => setActive(i)}
                onMouseLeave={() => setActive(null)}
                onFocus={() => setActive(i)}
                onBlur={() => setActive(null)}
                animate={{ y: [0, -14, 0] }}
                transition={{ repeat: Infinity, duration: 5 + i, ease: "easeInOut" }}
                whileHover={{ scale: 1.12 }}
                className="relative rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                style={{ width: size, height: size }}
              >
                <span className="absolute inset-0 rounded-full" style={{ background: `radial-gradient(circle at 30% 30%, white, ${s.color} 40%, color-mix(in oklab, ${s.color} 30%, black) 100%)`, boxShadow: `0 0 60px -10px ${s.color}` }} />
                <motion.span className="absolute -inset-5 rounded-full border border-starlight/20" animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 8 + i * 2, ease: "linear" }}>
                  <span className="absolute -top-1 left-1/2 size-2 rounded-full bg-starlight shadow-glow" />
                  <span className="absolute -bottom-0.5 left-1/4 size-1 rounded-full bg-aurora" />
                </motion.span>
              </motion.button>
              <p className="mt-6 font-display text-2xl text-starlight">{s.name}</p>
              <AnimatePresence>
                {open && (
                  <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }} transition={spring} className="glass absolute top-full z-20 mt-2 w-64 rounded-xl p-4 text-sm text-starlight-soft">
                    <p className="text-starlight">{s.desc}</p>
                    <p className="mt-3 eyebrow">Experience · {s.exp}</p>
                    <p className="eyebrow">Projects · {s.projects}</p>
                    <p className="mt-2 text-starlight">{s.stack}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}

/* ---------------- PROJECTS ---------------- */
function Chips({ items }: { items: string[] }) {
  return <div className="flex flex-wrap gap-2">{items.map((t) => <span key={t} className="rounded-full border border-glass-edge px-3 py-1 font-mono text-xs text-starlight-soft">{t}</span>)}</div>;
}
function Links({ p }: { p: (typeof profile.projects)[number] }) {
  return (
    <div className="flex gap-4 text-starlight">
      <a href={p.github} target="_blank" rel="noreferrer" aria-label={`${p.name} on GitHub`} className="inline-flex items-center gap-1 text-sm hover:text-glow"><FiGithub /> Code</a>
      <a href={p.demo} target="_blank" rel="noreferrer" aria-label={`${p.name} live demo`} className="inline-flex items-center gap-1 text-sm hover:text-glow"><FiExternalLink /> Live</a>
    </div>
  );
}
function Preview({ seed }: { seed: number }) {
  return (
    <div className="relative h-full min-h-48 overflow-hidden rounded-xl" style={{ background: `radial-gradient(circle at ${30 + seed * 20}% 40%, var(--glow), transparent 55%), radial-gradient(circle at 80% 80%, var(--aurora), transparent 50%), var(--space-deep)` }}>
      <motion.div className="absolute left-1/2 top-1/2 size-24 -translate-1/2 rounded-full border border-starlight/40" animate={{ rotate: 360, scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 10 }} />
      <span className="eyebrow absolute bottom-3 left-4 text-starlight">Mission 0{seed + 1}</span>
    </div>
  );
}
export function Projects() {
  const [feat, ...rest] = profile.projects;
  if (!feat) return null;
  return (
    <section id="projects" aria-labelledby="projects-h" className="px-6 py-32 md:px-12">
      <Heading light eyebrow="03 — Missions" title={<span id="projects-h">Selected <em>work</em></span>} />
      <motion.div {...reveal}>
        <Tilt max={5} className="glass grid gap-8 rounded-3xl p-6 md:grid-cols-2 md:p-10">
          <Preview seed={0} />
          <div className="flex flex-col justify-center gap-5">
            <p className="eyebrow text-aurora">★ Featured mission</p>
            <h3 className="font-display text-5xl text-starlight">{feat.name}</h3>
            <p className="text-lg text-starlight-soft">{feat.desc}</p>
            <Chips items={feat.stack} />
            <Links p={feat} />
          </div>
        </Tilt>
      </motion.div>
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        {rest.map((p, i) => (
          <motion.div key={p.name} {...reveal} transition={{ ...spring, delay: i * 0.1 }}>
            <Tilt className="glass flex h-full flex-col gap-4 rounded-3xl p-6">
              <div className="h-44"><Preview seed={i + 1} /></div>
              <h3 className="font-display text-3xl text-starlight">{p.name}</h3>
              <p className="text-starlight-soft">{p.desc}</p>
              <Chips items={p.stack} />
              <Links p={p} />
            </Tilt>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

/* ---------------- EXPERIENCE ---------------- */
export function Experience() {
  return (
    <section id="experience" aria-labelledby="exp-h" className="px-6 py-32 md:px-12">
      <Heading light eyebrow="04 — Flight path" title={<span id="exp-h">Experience</span>} />
      <ol className="relative ml-3 border-l border-glass-edge md:mx-auto md:max-w-4xl">
        {profile.experience.map((e, i) => (
          <motion.li key={e.company} initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ ...spring, delay: i * 0.1 }} className="relative mb-10 pl-8">
            <motion.span className="absolute -left-[7px] top-6 size-3 rounded-full bg-glow shadow-glow" animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 2.4, delay: i * 0.4 }} />
            <Tilt max={4} className="glass rounded-2xl p-6">
              <p className="eyebrow text-starlight-soft">{e.duration}</p>
              <h3 className="mt-2 font-display text-3xl text-starlight">{e.role}</h3>
              <p className="text-aurora">{e.company}</p>
              <p className="mt-3 text-starlight-soft">{e.desc}</p>
            </Tilt>
          </motion.li>
        ))}
      </ol>
    </section>
  );
}

/* ---------------- CERTIFICATIONS ---------------- */
export function Certifications() {
  return (
    <section id="certifications" aria-labelledby="cert-h" className="px-6 py-32 md:px-12">
      <Heading light eyebrow="05 — Clearances" title={<span id="cert-h">Certifications</span>} />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {profile.certifications.map((c, i) => (
          <motion.div key={c.name} {...reveal} transition={{ ...spring, delay: i * 0.08 }}>
            <Tilt className="glass group flex h-full flex-col justify-between gap-8 rounded-2xl p-6">
              <motion.span className="grid size-12 place-items-center rounded-full border border-glass-edge text-xl text-glow" whileHover={{ rotate: 180 }} transition={spring}><FiAward /></motion.span>
              <div>
                <h3 className="text-lg text-starlight">{c.name}</h3>
                <p className="mt-1 eyebrow text-starlight-soft">{c.issuer} · {c.year}</p>
              </div>
            </Tilt>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

/* ---------------- CONTACT ---------------- */
export function Contact() {
  const [state, setState] = useState<"idle" | "launch" | "sent">("idle");
  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setState("launch");
    setTimeout(() => {
      setState("sent");
      window.location.href = `mailto:${profile.email}?subject=${encodeURIComponent(`Hello from ${f.get("name")}`)}&body=${encodeURIComponent(String(f.get("message")))}`;
    }, 1100);
  };
  const field = "w-full rounded-xl border border-glass-edge bg-glass px-4 py-3 text-starlight placeholder:text-starlight-soft/60 focus:border-glow focus:outline-none focus:ring-2 focus:ring-ring/40";
  return (
    <section id="contact" aria-labelledby="contact-h" className="px-6 py-32 md:px-12">
      <Heading light eyebrow="06 — Mission control" title={<span id="contact-h">Open a <em>channel</em></span>} />
      <div className="grid gap-8 lg:grid-cols-[1fr_1.3fr]">
        <motion.div {...reveal} className="space-y-5 text-starlight-soft">
          <p className="text-lg">Have a mission in mind? Signals are monitored around the clock.</p>
          <a href={`mailto:${profile.email}`} className="flex items-center gap-3 hover:text-starlight"><FiMail /> {profile.email}</a>
          <p className="flex items-center gap-3"><FiPhone /> {profile.phone}</p>
          <p className="flex items-center gap-3"><FiMapPin /> {profile.location}</p>
        </motion.div>
        <motion.form {...reveal} onSubmit={submit} className="glass space-y-4 rounded-3xl p-6 md:p-8">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2"><span className="eyebrow text-starlight-soft">Name</span><input required name="name" className={field} placeholder="Ada Lovelace" /></label>
            <label className="space-y-2"><span className="eyebrow text-starlight-soft">Email</span><input required type="email" name="email" className={field} placeholder="ada@orbit.io" /></label>
          </div>
          <label className="block space-y-2"><span className="eyebrow text-starlight-soft">Message</span><textarea required name="message" rows={5} className={field} placeholder="Tell me about your mission…" /></label>
          <Magnetic className="inline-block">
            <button type="submit" disabled={state === "launch"} className="relative inline-flex items-center gap-2 overflow-visible rounded-full bg-primary px-7 py-3 text-sm font-medium text-primary-foreground shadow-glow">
              <motion.span animate={state === "launch" ? { x: 300, y: -300, rotate: -45, opacity: 0 } : { x: 0, y: 0, rotate: 0, opacity: 1 }} transition={{ duration: 1, ease: [0.6, 0, 0.4, 1] }}>
                <FiSend />
              </motion.span>
              {state === "sent" ? "Transmission sent" : state === "launch" ? "Launching…" : "Launch message"}
            </button>
          </Magnetic>
        </motion.form>
      </div>
    </section>
  );
}

/* ---------------- FOOTER ---------------- */
const SOCIALS = [
  { href: profile.socials.github, icon: FiGithub, label: "GitHub" },
  { href: profile.socials.linkedin, icon: FaLinkedinIn, label: "LinkedIn" },
  { href: profile.socials.twitter, icon: FaXTwitter, label: "Twitter" },
  { href: profile.socials.instagram, icon: FaInstagram, label: "Instagram" },
  { href: profile.socials.youtube, icon: FaYoutube, label: "YouTube" },
  { href: profile.socials.medium, icon: FaMedium, label: "Medium" },
];
const CONSTELLATION = [[10, 60], [22, 30], [38, 45], [52, 20], [66, 38], [80, 25], [92, 55]];
export function Footer() {
  return (
    <footer className="relative overflow-hidden px-6 pb-10 pt-24 md:px-12">
      <svg aria-hidden viewBox="0 0 100 70" className="mx-auto mb-12 w-full max-w-3xl text-starlight-soft">
        <motion.polyline points={CONSTELLATION.map((p) => p.join(",")).join(" ")} fill="none" stroke="currentColor" strokeWidth="0.15" initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 2.5 }} />
        {CONSTELLATION.map(([x, y], i) => (
          <motion.circle key={i} cx={x} cy={y} r="0.8" fill="var(--starlight)" animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 2 + i * 0.3 }} />
        ))}
      </svg>
      <p className="text-center font-display text-3xl italic text-starlight md:text-4xl">“{profile.quote}”</p>
      <nav aria-label="Social links" className="mt-10 flex flex-wrap justify-center gap-3">
        {SOCIALS.map(({ href, icon: Icon, label }) => (
          <Magnetic key={label}>
            <motion.a whileHover={{ rotate: 15, scale: 1.1 }} href={href} target="_blank" rel="noreferrer" aria-label={label} className="glass grid size-11 place-items-center rounded-full text-starlight">
              <Icon />
            </motion.a>
          </Magnetic>
        ))}
      </nav>
      <p className="eyebrow mt-12 text-center text-starlight-soft">© {new Date().getFullYear()} {profile.name} · Drifting through deep space</p>
    </footer>
  );
}
