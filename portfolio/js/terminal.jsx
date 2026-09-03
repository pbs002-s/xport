/* ============================================================
   INTERACTIVE TERMINAL — type real commands
============================================================ */
function Terminal({ onCommand }) {
  const D = window.DATA;
  const username = (D.identity.handle || "pritam").split("-")[0];
  const banner = [
    { t: "out", html: `<span class="accent">${username}@portfolio</span>:~$ welcome — type <span class="term-key">help</span> to list commands, or try <span class="term-key">whoami</span>.` },
  ];
  const [lines, setLines] = useState(banner);
  const [val, setVal] = useState("");
  const [hist, setHist] = useState([]);
  const [hi, setHi] = useState(-1);
  const bodyRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [lines]);

  const push = (arr) => setLines((l) => [...l, ...arr]);

  const COMMANDS = {
    help: () => ([
      { t: "out", html: "Available commands:" },
      { t: "out", html: "  <span class='term-key'>whoami</span>    short bio &amp; current roles" },
      { t: "out", html: "  <span class='term-key'>skills</span>    technical stack inventory" },
      { t: "out", html: "  <span class='term-key'>projects</span>  featured work + links" },
      { t: "out", html: "  <span class='term-key'>experience</span> work history" },
      { t: "out", html: "  <span class='term-key'>contact</span>   how to reach me" },
      { t: "out", html: "  <span class='term-key'>social</span>    github / leetcode / codeforces / facebook / instagram" },
      { t: "out", html: "  <span class='term-key'>neofetch</span>  system summary" },
      { t: "out", html: "  <span class='term-key'>theme</span>     toggle dark / light" },
      { t: "out", html: "  <span class='term-key'>goto</span> &lt;section&gt;  scroll to a section" },
      { t: "out", html: "  <span class='term-key'>clear</span>     wipe the screen" },
    ]),
    whoami: () => ([
      { t: "out", html: `<span class="u">${D.identity.name.toLowerCase()}</span> — ${D.identity.roles.slice(0,3).join(" · ")}` },
      { t: "out", html: D.identity.summary },
    ]),
    skills: () => {
      const out = [];
      D.skills.forEach((s) => {
        out.push({ t: "out", html: `<span class="accent">${s.cmd}</span>` });
        out.push({ t: "out", html: "  " + s.items.join("  ·  ") });
      });
      return out;
    },
    projects: () => {
      const out = [{ t: "out", html: "Featured projects:" }];
      D.projects.forEach((p, i) => out.push({ t: "out", html: `  [${i+1}] <span class="term-key">${p.name}</span> — ${p.tag}  <a href="${p.url}" target="_blank" rel="noopener">↗ open</a>` }));
      out.push({ t: "out", html: "type <span class='term-key'>goto projects</span> to view them." });
      return out;
    },
    experience: () => {
      const out = [];
      D.experience.forEach((e) => out.push({ t: "out", html: `<span class="accent">${e.period}</span>  ${e.role} @ ${e.org}` }));
      return out;
    },
    contact: () => ([
      { t: "out", html: `email   <a href="mailto:${D.identity.email}">${D.identity.email}</a>` },
      { t: "out", html: `site    <a href="${D.identity.site}" target="_blank" rel="noopener">${D.identity.site}</a>` },
      { t: "out", html: `region  ${D.identity.location}` },
    ]),
    social: () => D.socials.map((s) => ({ t: "out", html: `${s.label.padEnd(10)} <a href="${s.url}" target="_blank" rel="noopener">${s.url}</a>` })),
    neofetch: () => ([
      { t: "out", html: `<span class="accent">      ╔═╗      </span>  <span class="u">${username}</span>@portfolio` },
      { t: "out", html: `<span class="accent">      ║P║      </span>  ─────────────────` },
      { t: "out", html: `<span class="accent">      ╚═╝      </span>  name     ${D.identity.name}` },
      { t: "out", html: `<span class="accent">    ▄▄▄▄▄▄▄    </span>  roles    ${D.identity.roles.slice(0,2).join(", ")}` },
      { t: "out", html: `<span class="accent">   █ dev █ █   </span>  contribs 350+ (past year)` },
      { t: "out", html: `<span class="accent">    ▀▀▀▀▀▀▀    </span>  stack    TypeScript · React · Kotlin · AI` },
    ]),
    clear: () => { setLines([]); return null; },
    theme: () => { onCommand && onCommand("toggle-theme"); return [{ t: "out", html: "theme toggled." }]; },
    ls: () => ([{ t: "out", html: "about/  skills/  projects/  experience/  education/  contact/" }]),
    sudo: () => ([{ t: "err", html: "nice try. permission denied — but I admire the hustle. 🙂" }]),
    goto: (arg) => {
      const map = { about:"about", skills:"skills", projects:"projects", experience:"experience", exp:"experience", education:"education", edu:"education", contact:"contact", home:"home", top:"home" };
      const key = map[(arg||"").toLowerCase()];
      if (!key) return [{ t: "err", html: `unknown section: ${arg||"(none)"} — try about|skills|projects|experience|education|contact` }];
      onCommand && onCommand("goto", key);
      return [{ t: "out", html: `→ navigating to ${key} …` }];
    },
  };

  const run = (raw) => {
    const cmd = raw.trim();
    const echo = { t: "cmd", html: `<span class="p">${username}@portfolio</span>:<span class="u">~</span>$ ${cmd.replace(/</g,"&lt;")}` };
    if (!cmd) { push([echo]); return; }
    setHist((h) => [cmd, ...h]); setHi(-1);
    const [name, ...rest] = cmd.split(/\s+/);
    const fn = COMMANDS[name.toLowerCase()];
    if (!fn) { push([echo, { t: "err", html: `command not found: ${name} — type <span class='term-key'>help</span>` }]); return; }
    const res = fn(rest.join(" "));
    if (res === null) return;
    push([echo, ...res]);
  };

  const onKey = (e) => {
    if (e.key === "Enter") { run(val); setVal(""); }
    else if (e.key === "ArrowUp") { e.preventDefault(); if (hist.length) { const n = Math.min(hi + 1, hist.length - 1); setHi(n); setVal(hist[n]); } }
    else if (e.key === "ArrowDown") { e.preventDefault(); const n = Math.max(hi - 1, -1); setHi(n); setVal(n === -1 ? "" : hist[n]); }
    else if (e.key === "l" && e.ctrlKey) { e.preventDefault(); setLines([]); }
  };

  return (
    <div className="term" onClick={() => inputRef.current && inputRef.current.focus()}>
      <div className="winbar">
        <span className="dot r"></span><span className="dot y"></span><span className="dot g"></span>
        <span className="title">— zsh — {username}@portfolio — 80×24</span>
      </div>
      <div className="term-body" ref={bodyRef}>
        {lines.map((l, i) => (
          <div key={i} className={"term-line " + (l.t === "err" ? "term-err" : l.t === "cmd" ? "" : "term-out")} dangerouslySetInnerHTML={{ __html: l.html }} />
        ))}
        <div className="term-input-row">
          <span className="p">{username}@portfolio:~$</span>
          <input ref={inputRef} className="term-input" value={val} spellCheck="false" autoComplete="off"
            onChange={(e) => setVal(e.target.value)} onKeyDown={onKey} aria-label="terminal input" />
        </div>
      </div>
      <div className="term-hint">
        <span><b>help</b> commands</span>
        <span><b>whoami</b> bio</span>
        <span><b>projects</b> work</span>
        <span><b>↑/↓</b> history</span>
      </div>
    </div>
  );
}

Object.assign(window, { Terminal });
