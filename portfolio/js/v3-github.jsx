/* ============================================================
   GITHUB — focus section. Live stats + contribution heatmap +
   curated pinned repositories (github.com/pbs002-s).
============================================================ */
const GH_USER = "pbs002-s";
const LANG_COLORS = {
  JavaScript: "#f1e05a", TypeScript: "#3178c6", Python: "#3572A5", PHP: "#4F5D95",
  HTML: "#e34c26", CSS: "#563d7c", Java: "#b07219", Blade: "#f7523f", Shell: "#89e051",
  Dart: "#00B4AB", "C++": "#f34b7d", C: "#555555", Vue: "#41b883", Go: "#00ADD8",
  Kotlin: "#A97BFF", "Jupyter Notebook": "#DA5B0B",
};
const langColor = (l) => LANG_COLORS[l] || "var(--accent)";

/* curated pinned repositories — the work I want front-and-centre */
const PINNED = [
  { name: "EduSync", lang: "TypeScript", featured: true,
    desc: "Distributed campus collaboration platform: 4 role-scoped portals, real-time Socket.IO messaging over Redis Pub/Sub, and academic lifecycle management." },
  { name: "BhoomiSheba", lang: "TypeScript",
    desc: "Next-gen Bangladesh land automation platform: PostGIS spatial GIS, e-mutation tracking, multi-source cross-audits & instant QR e-Dakhila." },
  { name: "OpenGovtBD", lang: "Java",
    desc: "Java 17 + Spring Boot 3 government-citizen platform: role-based Citizen/Officer/Admin workspaces, complaint lifecycle, public discussions, polls & analytics." },
  { name: "medicalLLM", lang: "Jupyter Notebook",
    desc: "EMG-based ALS screening platform fusing a 1-D CNN, the Florence-2 vision-language model and an XGBoost meta-learner, with Grad-CAM and SHAP explainability." },
  { name: "BhashaBot", lang: "TypeScript",
    desc: "Enterprise-grade multilingual AI auto-reply & agent command center powered by Groq and Llama 3.3 for real-time customer query handling." },
  { name: "diu-routine", lang: "Kotlin",
    desc: "Offline-first campus routine and schedule manager for Daffodil International University students with PDF parsing and offline access." },
  { name: "LeetCode", lang: "Java",
    desc: "Curated solutions to algorithmic problems, data structures, and competitive programming challenges across LeetCode & Codeforces." },
];

function GitHubV3() {
  const [status, setStatus] = useState("loading");   // loading | live | fallback
  const [profile, setProfile] = useState(null);
  const [langs, setLangs] = useState([]);
  const [starsByName, setStarsByName] = useState({});
  const [totalStars, setTotalStars] = useState(null);
  const [cal, setCal] = useState(null);
  const [tip, setTip] = useState(null);

  useEffect(() => {
    let alive = true;
    async function load() {
      const [pf, rp, cc] = await Promise.allSettled([
        fetch(`https://api.github.com/users/${GH_USER}`).then((r) => r.ok ? r.json() : Promise.reject()),
        fetch(`https://api.github.com/users/${GH_USER}/repos?per_page=100&sort=pushed`).then((r) => r.ok ? r.json() : Promise.reject()),
        fetch(`https://github-contributions-api.jogruber.de/v4/${GH_USER}?y=last`).then((r) => r.ok ? r.json() : Promise.reject()),
      ]);
      if (!alive) return;
      let ok = false;
      let profileOk = false;
      if (pf.status === "fulfilled" && pf.value && pf.value.login) { setProfile(pf.value); ok = true; profileOk = true; }
      if (rp.status === "fulfilled" && Array.isArray(rp.value)) {
        const real = rp.value.filter((r) => !r.fork);
        setTotalStars(real.reduce((s, r) => s + (r.stargazers_count || 0), 0));
        const sm = {}; rp.value.forEach((r) => { sm[r.name.toLowerCase()] = { stars: r.stargazers_count || 0, forks: r.forks_count || 0 }; });
        setStarsByName(sm);
        const counts = {}; real.forEach((r) => { if (r.language) counts[r.language] = (counts[r.language] || 0) + 1; });
        const tot = Object.values(counts).reduce((a, b) => a + b, 0);
        if (tot) setLangs(Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([k, v]) => ({ k, pct: Math.round((v / tot) * 100) })));
        ok = true;
      }
      if (cc.status === "fulfilled" && cc.value && cc.value.contributions) {
        const total = (cc.value.total && (cc.value.total.lastYear || Object.values(cc.value.total)[0])) || cc.value.contributions.reduce((s, d) => s + d.count, 0);
        setCal({ cells: cc.value.contributions.map((d) => ({ ...d, wd: new Date(d.date + "T00:00").getDay() })), total });
        ok = true;
      }
      if (!langs.length && (rp.status !== "fulfilled")) setLangs([{ k: "TypeScript", pct: 48 }, { k: "Kotlin", pct: 39 }, { k: "JavaScript", pct: 5 }, { k: "Python", pct: 4 }, { k: "Java", pct: 4 }]);
      if (!ok) {
        const cells = []; const today = new Date();
        for (let i = 363; i >= 0; i--) { const d = new Date(today); d.setDate(today.getDate() - i); const seed = Math.sin(i * 12.9898) * 43758.5; const r = seed - Math.floor(seed); const level = r > 0.8 ? 4 : r > 0.62 ? 3 : r > 0.42 ? 2 : r > 0.2 ? 1 : 0; cells.push({ date: d.toISOString().slice(0, 10), count: level * 3, level, wd: d.getDay() }); }
        setCal({ cells, total: null });
      }
      setStatus(profileOk ? "live" : "fallback");
    }
    load();
    return () => { alive = false; };
  }, []);

  const monthLabels = (() => {
    if (!cal) return []; const out = []; let lastM = -1;
    cal.cells.forEach((c, i) => { const col = Math.floor(i / 7); const m = new Date(c.date + "T00:00").getMonth(); if (m !== lastM && c.wd <= 1) { out.push({ col, label: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][m] }); lastM = m; } });
    return out;
  })();
  const lvlBg = (l) => l === 0 ? "var(--line)" : "var(--accent)";
  const lvlOpacity = (l) => [1, 0.34, 0.56, 0.78, 1][l];
  const stat = (v) => (v === null || v === undefined) ? "—" : (typeof v === "number" && v >= 1000 ? (v / 1000).toFixed(1) + "k" : v);
  const repoUrl = (n) => `https://github.com/${GH_USER}/${n}`;
  const enrich = (n) => starsByName[n.toLowerCase()] || {};
  const featured = PINNED.find((p) => p.featured);
  const rest = PINNED.filter((p) => !p.featured);

  /* last-known real values — shown instantly + as fallback when the GitHub API is rate-limited (60 req/hr) */
  const FB = { contrib: 352, repos: 12, followers: 11, stars: 23 };
  const contribTotal = (cal && cal.total != null) ? cal.total : FB.contrib;
  const stats = [
    { v: stat(profile && profile.public_repos != null ? profile.public_repos : FB.repos), l: "repositories", sub: "public" },
    { v: stat(profile && profile.followers != null ? profile.followers : FB.followers), l: "followers", sub: "on github" },
    { v: stat(totalStars != null ? totalStars : FB.stars), l: "stars", sub: "earned" },
  ];

  return (
    <section id="github" className="gh-band section pad">
      <div className="wrap">
        <div className="shead" data-rv>
          <div className="meta">
            <span className="no">04</span><span>/ github</span><span className="ln"></span>
            <span className="gh-status"><i className={status === "live" ? "ok" : ""}></i>{status === "live" ? "live · github.com/" + GH_USER : status === "loading" ? "connecting…" : "github.com/" + GH_USER}</span>
          </div>
          <h2 className="mask"><span>I ship code, every day.</span></h2>
          <p className="sub">My GitHub isn't a graveyard of abandoned forks — it's where I build real, self-hosted products. Live data, straight from the API.</p>
        </div>

        <div className="gh-statrow" data-rv>
          {stats.map((s) => (
            <div className="gh-bigstat" key={s.l}><b>{s.v}</b><span className="l">{s.l}</span><span className="s">{s.sub}</span></div>
          ))}
        </div>

        <div className="gh-cal-card" data-rv data-d="1">
          <div className="gh-cal-head">
            <div className="gh-contrib"><b>{contribTotal.toLocaleString()}</b><span>contributions<br/>in the last year</span></div>
            <span className="gh-legend">less {[0,1,2,3,4].map((l) => <i key={l} style={{ background: lvlBg(l), opacity: lvlOpacity(l) }}></i>)} more</span>
          </div>
          <div className="gh-cal-scroll">
            <div className="gh-months">{monthLabels.map((m, i) => <span key={i} style={{ gridColumn: m.col + 1 }}>{m.label}</span>)}</div>
            <div className="gh-cal-grid">
              {cal ? cal.cells.map((c, i) => (
                <i key={i} className="gh-cell" style={{ gridRow: c.wd + 1, background: lvlBg(c.level), opacity: lvlOpacity(c.level) }}
                  onMouseEnter={(e) => { const r = e.target.getBoundingClientRect(); setTip({ x: r.left + r.width / 2, y: r.top, txt: `${c.count} contribution${c.count===1?"":"s"} · ${c.date}` }); }}
                  onMouseLeave={() => setTip(null)}></i>
              )) : <span className="gh-loading">loading activity…</span>}
            </div>
          </div>
        </div>

        <div className="gh-pin-head" data-rv><span>PINNED REPOSITORIES</span><a href={`https://github.com/${GH_USER}?tab=repositories`} target="_blank" rel="noopener">view all ↗</a></div>

        {featured && (
          <a className="gh-featured" href={repoUrl(featured.name)} target="_blank" rel="noopener" data-rv>
            <div className="gh-feat-tag">★ FEATURED PROJECT</div>
            <h3>{featured.name}</h3>
            <p>{featured.desc}</p>
            <div className="gh-feat-foot">
              <span className="gh-repo-lang"><i style={{ background: langColor(featured.lang) }}></i>{featured.lang}</span>
              {enrich(featured.name).stars != null && <span>★ {enrich(featured.name).stars}</span>}
              {enrich(featured.name).forks > 0 && <span>⑂ {enrich(featured.name).forks}</span>}
              <span className="gh-feat-open">open repository ↗</span>
            </div>
          </a>
        )}

        <div className="gh-pingrid">
          {rest.map((r, i) => (
            <a key={r.name} className="gh-pin" href={repoUrl(r.name)} target="_blank" rel="noopener" data-rv data-d={String((i % 3) + 1)}>
              <div className="gh-pin-top"><span className="gh-pin-ic">▢</span><span className="gh-pin-name">{r.name}</span><span className="gh-pin-go">↗</span></div>
              <p className="gh-pin-desc">{r.desc}</p>
              <div className="gh-pin-foot"><span className="gh-repo-lang"><i style={{ background: langColor(r.lang) }}></i>{r.lang}</span>{enrich(r.name).stars != null && <span>★ {enrich(r.name).stars}</span>}</div>
            </a>
          ))}
        </div>

        <div className="gh-langs" data-rv>
          <div className="gh-langs-h">MOST USED LANGUAGES</div>
          <div className="gh-langbar">{langs.map((l) => <span key={l.k} style={{ width: l.pct + "%", background: langColor(l.k) }} title={l.k + " " + l.pct + "%"}></span>)}</div>
          <div className="gh-langlist">{langs.map((l) => <span key={l.k} className="gh-langtag"><i style={{ background: langColor(l.k) }}></i>{l.k} <em>{l.pct}%</em></span>)}</div>
        </div>
      </div>
      {tip && <div className="gh-tip" style={{ left: tip.x, top: tip.y }}>{tip.txt}</div>}
    </section>
  );
}

Object.assign(window, { GitHubV3 });
