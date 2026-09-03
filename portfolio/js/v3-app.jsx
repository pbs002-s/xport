/* ============================================================
   v3 APP SHELL — theme toggle (light default)
============================================================ */
function CmdKV3({ open, setOpen, toggleTheme }) {
  const [q, setQ] = useState(""); const [active, setActive] = useState(0); const inputRef = useRef(null);
  const D = window.DATA; const go = (id) => window.MOTION.scrollTo("#" + id);
    const items = [
      { id: "home", label: "Top", ic: "⌂", desc: "go", act: () => go("home") },
      { id: "profile", label: "Profile", ic: "01", desc: "section", act: () => go("profile") },
      { id: "skills", label: "Capabilities", ic: "02", desc: "section", act: () => go("skills") },
      { id: "network", label: "Skill graph", ic: "03", desc: "section", act: () => go("network") },
      { id: "github", label: "GitHub activity", ic: "04", desc: "section", act: () => go("github") },
      { id: "work", label: "Selected work", ic: "05", desc: "section", act: () => go("work") },
      { id: "reel", label: "Motion reel", ic: "06", desc: "section", act: () => go("reel") },
      { id: "experience", label: "Experience", ic: "07", desc: "section", act: () => go("experience") },
      { id: "console", label: "Console", ic: "08", desc: "section", act: () => go("console") },
      { id: "credentials", label: "Credentials", ic: "09", desc: "section", act: () => go("credentials") },
      { id: "cv", label: "CV / Profile", ic: "10", desc: "section", act: () => go("cv") },
      { id: "contact", label: "Contact", ic: "11", desc: "section", act: () => go("contact") },
      { id: "cv-open", label: "Open GitHub Profile", ic: "↗", desc: "link", act: () => window.open("https://github.com/" + (D.identity.handle || "pbs002-s"), "_blank") },
      { id: "theme", label: "Toggle light / dark", ic: "◐", desc: "action", act: toggleTheme },
      { id: "email", label: "Copy email", ic: "@", desc: "action", act: () => navigator.clipboard && navigator.clipboard.writeText(D.identity.email) },
      { id: "gh-open", label: "Open GitHub", ic: "↗", desc: "link", act: () => window.open(D.socials.find(s=>s.key==="github").url, "_blank") },
      { id: "leetcode", label: "Open LeetCode", ic: "↗", desc: "link", act: () => window.open(D.socials.find(s=>s.key==="leetcode").url, "_blank") },
  ];
  const filtered = items.filter((it) => it.label.toLowerCase().includes(q.toLowerCase()) || it.id.includes(q.toLowerCase()));
  useEffect(() => { if (open) { setQ(""); setActive(0); setTimeout(() => inputRef.current && inputRef.current.focus(), 30); } }, [open]);
  useEffect(() => setActive(0), [q]);
  const onKey = (e) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => Math.min(a + 1, filtered.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
    else if (e.key === "Enter") { e.preventDefault(); const it = filtered[active]; if (it) { it.act(); setOpen(false); } }
    else if (e.key === "Escape") setOpen(false);
  };
  return (
    <div className={"cmdk-ov" + (open ? " open" : "")} onMouseDown={(e) => { if (e.target === e.currentTarget) setOpen(false); }}>
      <div className="cmdk" onKeyDown={onKey}>
        <div className="cmdk-s"><span className="p">$</span><input ref={inputRef} value={q} onChange={(e) => setQ(e.target.value)} placeholder="jump to a section or run a command…" spellCheck="false" /><span className="kbd">esc</span></div>
        <div className="cmdk-list">
          {filtered.length === 0 && <div className="cmdk-item">no matches.</div>}
          {filtered.map((it, i) => (
            <div key={it.id} className={"cmdk-item" + (i === active ? " active" : "")} onMouseEnter={() => setActive(i)} onMouseDown={(e) => { e.preventDefault(); it.act(); setOpen(false); }}>
              <span className="ic">{it.ic}</span><span>{it.label}</span><span className="desc">{it.desc}</span>
            </div>
          ))}
        </div>
        <div className="cmdk-foot"><span>↑↓ navigate</span><span>↵ select</span><span>esc close</span></div>
      </div>
    </div>
  );
}

/* ============================================================
   THEME STUDIO — the user-facing appearance picker.
   Appearance (light / dark / system) + accent + background texture.
   Everything persists to localStorage; "system" tracks the OS live.
============================================================ */
const ACCENTS = [
  { name: "Blue",     hex: "#1f6feb" },
  { name: "Indigo",   hex: "#5b5bd6" },
  { name: "Teal",     hex: "#0d7d74" },
  { name: "Amber",    hex: "#b45309" },
  { name: "Rose",     hex: "#be123c" },
  { name: "Graphite", hex: "#52525b" },
];

function ThemeStudio({ mode, setMode, accent, setAccent, aurora, setAurora, grain, setGrain }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false); };
    const onKey = (e) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const Switch = ({ on, onToggle, label }) => (
    <div className="tstudio-row">
      <span>{label}</span>
      <button type="button" className="tstudio-switch" aria-pressed={on}
        aria-label={label} onClick={() => onToggle(!on)}><i /></button>
    </div>
  );

  return (
    <div className="tstudio" ref={wrapRef}>
      <button className="ibtn" type="button" aria-expanded={open} aria-haspopup="dialog"
        title="Appearance and colour" onClick={() => setOpen((o) => !o)}>
        <Icon.palette />
      </button>

      <div className="tstudio-pop" role="dialog" aria-label="Appearance settings" hidden={!open}>
        <div className="tstudio-grp">
          <span className="tstudio-lbl">Appearance</span>
          <div className="tstudio-seg">
            {["light", "dark", "system"].map((m) => (
              <button key={m} type="button" aria-pressed={mode === m} onClick={() => setMode(m)}>{m}</button>
            ))}
          </div>
        </div>

        <div className="tstudio-grp">
          <span className="tstudio-lbl">Accent colour</span>
          <div className="tstudio-swatches">
            {ACCENTS.map((a) => (
              <button key={a.hex} type="button" className="tstudio-sw"
                style={{ "--sw": a.hex }} title={a.name} aria-label={a.name}
                aria-pressed={accent.toLowerCase() === a.hex}
                onClick={() => setAccent(a.hex)} />
            ))}
          </div>
        </div>

        <div className="tstudio-grp">
          <span className="tstudio-lbl">Background</span>
          <Switch label="Colour wash" on={aurora} onToggle={setAurora} />
          <Switch label="Film grain" on={grain} onToggle={setGrain} />
          <p className="tstudio-note">Motion follows your system reduce-motion setting.</p>
        </div>
      </div>
    </div>
  );
}

function AppV3() {
  const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
    "accent": "#1f6feb",
    "grain": true,
    "aurora": true
  }/*EDITMODE-END*/;
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const readLS = (k, d) => { try { return localStorage.getItem(k) || d; } catch (e) { return d; } };
  const writeLS = (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} };

  const [mode, setMode] = useState(() => readLS("pb-mode", "system"));   // light | dark | system
  const [sysDark, setSysDark] = useState(() => matchMedia("(prefers-color-scheme: dark)").matches);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const theme = mode === "system" ? (sysDark ? "dark" : "light") : mode;

  /* "system" has to keep tracking the OS after load */
  useEffect(() => {
    const mq = matchMedia("(prefers-color-scheme: dark)");
    const on = (e) => setSysDark(e.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    writeLS("pb-mode", mode);
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", theme === "dark" ? "#0b0b0c" : "#fbfbfa");
  }, [theme, mode]);

  const toggleTheme = () => setMode(theme === "light" ? "dark" : "light");

  /* restore the saved accent once on mount */
  useEffect(() => {
    const saved = readLS("pb-accent", "");
    if (saved && saved !== t.accent) setTweak("accent", saved);
  }, []);

  useEffect(() => {
    const r = document.documentElement.style;
    r.setProperty("--accent", t.accent);
    const h = t.accent.replace("#", "");
    const R = parseInt(h.substr(0, 2), 16), G = parseInt(h.substr(2, 2), 16), B = parseInt(h.substr(4, 2), 16);
    r.setProperty("--accent-soft", `rgba(${R},${G},${B},.1)`);
    writeLS("pb-accent", t.accent);
  }, [t.accent]);

  useEffect(() => {
    let done = false; const boot = () => { if (done) return; done = true; window.MOTION && window.MOTION.init(); };
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => setTimeout(boot, 60));
    setTimeout(boot, 1400);
    setTimeout(() => document.body.classList.add("force-show"), 3200);
  }, []);

  useEffect(() => {
    const onKey = (e) => { if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setPaletteOpen((o) => !o); } };
    window.addEventListener("keydown", onKey); return () => window.removeEventListener("keydown", onKey);
  }, []);

  const D = window.DATA;
  const nav = ["profile", "network", "github", "work", "cv", "contact"];
  const rail = [["profile","PROFILE"],["skills","CAPABILITIES"],["network","SKILL GRAPH"],["github","GITHUB"],["work","WORK"],["reel","MOTION REEL"],["experience","EXPERIENCE"],["console","CONSOLE"],["credentials","CREDENTIALS"],["cv","CV / PROFILE"],["contact","CONTACT"]];
  const go = (id) => window.MOTION ? window.MOTION.scrollTo("#" + id) : null;

  return (
    <>
      <div className="loader">
        <div className="loader-c">
          <div className="loader-id"><span>{D.identity.name.toUpperCase()}</span><span>PORTFOLIO / 2026</span></div>
          <div className="loader-name"><span>{(D.identity.name || "Pritom").split(" ")[0]}</span><span>{(D.identity.name || "Pritom Biswas").split(" ").slice(1).join(" ")}</span></div>
          <div className="loader-bar"><i></i></div>
          <div className="loader-pct"><span>LOADING INTERFACE</span><span><span className="num">000</span>%</span></div>
        </div>
      </div>

      <div className="cursor-ring" aria-hidden="true"></div>
      <div className="grain"></div>
      <canvas className="aurora" aria-hidden="true"></canvas>
      <div className="sbar"></div>

      <nav className="nav">
        <a className="brand" href="#home" onClick={(e) => { e.preventDefault(); go("home"); }}><span className="sq"></span>{D.identity.name}</a>
        <div className="nav-right">
          <div className="nav-links">{nav.map((id) => <a key={id} href={"#" + id} onClick={(e) => { e.preventDefault(); go(id); }}>{id}</a>)}</div>
          <button className="ibtn" title="Command palette (⌘K)" aria-label="Open command palette" onClick={() => setPaletteOpen(true)}><Icon.cmd /></button>
          <button className="ibtn" title="Toggle light / dark" aria-label="Toggle light or dark mode" onClick={toggleTheme}>{theme === "light" ? <Icon.moon /> : <Icon.sun />}</button>
          <ThemeStudio
            mode={mode} setMode={setMode}
            accent={t.accent} setAccent={(v) => setTweak("accent", v)}
            aurora={t.aurora} setAurora={(v) => setTweak("aurora", v)}
            grain={t.grain} setGrain={(v) => setTweak("grain", v)} />
        </div>
      </nav>

      <div className="rail">{rail.map(([id, lbl]) => <a key={id} href={"#" + id} onClick={(e) => { e.preventDefault(); go(id); }}><span className="dot"></span><span className="lbl">{lbl}</span></a>)}</div>

      <main>
        <HeroV3 />
        <MarqueeV3 />
        <ProfileV3 />
        <SkillsV3 />
        <TechNetwork />
        <GitHubV3 />
        <WorkV3 />
        <ShowreelBand />
        <ExperienceV3 />
        <ConsoleV3 />
        <CredentialsV3 />
        <CvV3 />
        <ContactV3 />
      </main>

      <footer className="footer"><div className="wrap footer-in">
        <span>© 2026 <b>{D.identity.name}</b>. All rights reserved.</span>
        <span>{D.identity.roles[0]} · {D.identity.roles[1]} — <span className="accent">{D.identity.location}</span></span>
      </div></footer>

      <CmdKV3 open={paletteOpen} setOpen={setPaletteOpen} toggleTheme={toggleTheme} />

      <TweaksPanel>
        <TweakSection label="Theme" />
        <TweakRadio label="Mode" value={mode} options={["light", "dark", "system"]} onChange={setMode} />
        <TweakSection label="Accent" />
        <TweakColor label="Accent color" value={t.accent} options={ACCENTS.map((a) => a.hex)} onChange={(v) => setTweak("accent", v)} />
        <TweakSection label="Texture" />
        <TweakToggle label="Aurora" value={t.aurora} onChange={(v) => setTweak("aurora", v)} />
        <TweakToggle label="Film grain" value={t.grain} onChange={(v) => setTweak("grain", v)} />
      </TweaksPanel>
      <style>{`.grain{display:${t.grain ? "block" : "none"}}.aurora{${t.aurora ? "" : "display:none"}}`}</style>
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<AppV3 />);
