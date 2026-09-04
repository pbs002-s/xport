/* ============================================================
   SKILL GRAPH — force-directed neural net of skills × projects
   Canvas + rAF. Category-colored nodes, clickable legend filter,
   live stats, hover tooltip, click-to-pin detail panel.
============================================================ */
const NET_CATS = [
  { key: "app", label: "Core & Web", color: "#e2622b", cats: ["Core Languages & Tech", "Backend & Frontend"] },
  { key: "ai", label: "AI & Neural Systems", color: "#be123c", cats: ["AI & Automation", "AI & ML", "APIs & Integration"] },
  { key: "mob", label: "Mobile & Frameworks", color: "#2f9bd6", cats: ["Frameworks & Mobile", "Mobile"] },
  { key: "ops", label: "Tools & Systems", color: "#1f9d57", cats: ["Engineering & Tools", "Server & Infrastructure"] },
];
const NET_ETC = { key: "etc", label: "Other", color: "#8a8276" };

function buildCatLookup(D) {
  const itemCat = {};
  (D.skills || []).forEach((s) => s.items.forEach((it) => { itemCat[it.toLowerCase()] = s.cat; }));
  return (techName) => {
    const raw = techName.toLowerCase();
    const cat = itemCat[raw] || itemCat[raw.replace(/\s*\d+(\.\d+)?$/, "")];
    const found = NET_CATS.find((c) => c.cats.includes(cat));
    return found || NET_ETC;
  };
}

function TechNetwork() {
  const D = window.DATA;
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);
  const [sel, setSel] = useState(null);
  const [filterCat, setFilterCat] = useState(null);
  const [tip, setTip] = useState(null);
  const [meta, setMeta] = useState({ techs: 0, projects: 0, links: 0, top: "" });
  const stateRef = useRef({ byId: {}, hoverId: null, pinId: null, filterCat: null });
  const catOf = useMemo(() => buildCatLookup(D), [D]);

  useEffect(() => { stateRef.current.filterCat = filterCat; }, [filterCat]);

  useEffect(() => {
    const canvas = canvasRef.current, wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext("2d");
    let raf = 0, W = 0, H = 0, dpr = Math.min(devicePixelRatio || 1, 2);

    const allProjects = D.mergedProjects();   // deduped: the graph showed each shared project twice
    const projects = allProjects.map((p, i) => ({ id: "p" + i, type: "project", label: p.name, short: p.short || p.name.split(" ")[0], idx: i, stack: p.stack, url: p.url, oss: !p.url || /github\.com/.test(p.url) ? !!p.gh : false }));
    const techMap = {};
    allProjects.forEach((p, i) => p.stack.forEach((tname) => {
      const key = tname.trim();
      if (!techMap[key]) { const c = catOf(key); techMap[key] = { id: "t" + Object.keys(techMap).length, type: "tech", label: key, projects: [], cat: c.key, color: c.color }; }
      if (!techMap[key].projects.includes("p" + i)) techMap[key].projects.push("p" + i);
    }));
    const techs = Object.values(techMap);
    const nodes = [...projects, ...techs];
    const byId = {}; nodes.forEach((n) => (byId[n.id] = n));
    const edges = [];
    techs.forEach((t) => t.projects.forEach((pid) => edges.push({ a: t.id, b: pid })));
    techs.forEach((t) => { t.shared = t.projects.length > 1; });
    const topTech = techs.slice().sort((a, b) => b.projects.length - a.projects.length)[0];
    setMeta({ techs: techs.length, projects: projects.length, links: edges.length, top: topTech ? topTech.label : "" });

    function place() {
      const r = wrap.getBoundingClientRect(); W = r.width; H = r.height;
      canvas.width = W * dpr; canvas.height = H * dpr; canvas.style.width = W + "px"; canvas.style.height = H + "px";
      const cx = W / 2, cy = H / 2;
      projects.forEach((p, i) => { const a = (i / projects.length) * Math.PI * 2 - Math.PI / 2; p.x = cx + Math.cos(a) * Math.min(W, H) * 0.27; p.y = cy + Math.sin(a) * Math.min(W, H) * 0.27; p.vx = p.vy = 0; p.r = Math.min(27, Math.max(17, W * 0.018)); p.m = 6; });
      techs.forEach((t, i) => { const a = (i / techs.length) * Math.PI * 2; const rad = Math.min(W, H) * (0.34 + (i % 3) * 0.04); t.x = cx + Math.cos(a) * rad; t.y = cy + Math.sin(a) * rad; t.vx = t.vy = 0; t.r = t.shared ? 9 : 6.5; t.m = 1; });
    }
    place();

    function tick() {
      const cx = W / 2, cy = H / 2;
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        n.vx += (cx - n.x) * 0.0016; n.vy += (cy - n.y) * 0.0016;
        for (let j = i + 1; j < nodes.length; j++) {
          const o = nodes[j]; let dx = n.x - o.x, dy = n.y - o.y; let d2 = dx * dx + dy * dy; if (d2 < 1) d2 = 1;
          const d = Math.sqrt(d2);
          const heavy = n.m > 1 && o.m > 1;            // project <-> project
          const force = heavy ? Math.min(52000 / d2, 14) : Math.min(2600 / d2, 2.2);
          const fx = (dx / d) * force, fy = (dy / d) * force;
          n.vx += fx / n.m; n.vy += fy / n.m; o.vx -= fx / o.m; o.vy -= fy / o.m;
        }
      }
      const rest = Math.min(W, H) * 0.16;
      for (const e of edges) {
        const a = byId[e.a], b = byId[e.b]; let dx = b.x - a.x, dy = b.y - a.y; const d = Math.hypot(dx, dy) || 1;
        const f = (d - rest) * 0.012; const fx = (dx / d) * f, fy = (dy / d) * f;
        a.vx += fx / a.m; a.vy += fy / a.m; b.vx -= fx / b.m; b.vy -= fy / b.m;
      }
      for (const n of nodes) {
        n.vx *= 0.86; n.vy *= 0.86;
        n.vx = Math.max(-6, Math.min(6, n.vx)); n.vy = Math.max(-6, Math.min(6, n.vy));
        n.x += n.vx; n.y += n.vy;
        const pad = n.r + 6; n.x = Math.max(pad, Math.min(W - pad, n.x)); n.y = Math.max(pad, Math.min(H - pad, n.y));
      }
    }
    for (let i = 0; i < 240; i++) tick();

    function cssVar(v, f) { return getComputedStyle(document.documentElement).getPropertyValue(v).trim() || f; }
    function activeId() { return stateRef.current.pinId || stateRef.current.hoverId; }
    function relatedSet(id) {
      const set = new Set(); if (!id) return set; set.add(id); const n = byId[id]; if (!n) return set;
      if (n.type === "tech") n.projects.forEach((p) => set.add(p));
      else techs.forEach((t) => { if (t.projects.includes(id)) set.add(t.id); });
      return set;
    }
    function highlight() {
      const act = activeId();
      if (act) return relatedSet(act);
      const fc = stateRef.current.filterCat;
      if (fc) { const set = new Set(); techs.forEach((t) => { if (t.cat === fc) { set.add(t.id); t.projects.forEach((p) => set.add(p)); } }); return set; }
      return null;
    }

    let flow = 0;
    function draw() {
      flow += 0.6;
      const accent = cssVar("--accent", "#be123c");
      const ink = cssVar("--ink", "#16140f"), ink2 = cssVar("--ink-2", "#5a5650"), ink3 = cssVar("--ink-3", "#948e82");
      const line = cssVar("--line-2", "rgba(0,0,0,.2)");
      const paper = cssVar("--surface", "#fff");
      const act = activeId();
      const hi = highlight();
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);

      for (const e of edges) {
        const a = byId[e.a], b = byId[e.b];
        const both = hi && hi.has(e.a) && hi.has(e.b);
        const onActive = act && both && (e.a === act || e.b === act);
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
        if (both) { ctx.strokeStyle = (byId[e.a].color || accent); ctx.lineWidth = 1.6; ctx.globalAlpha = 0.85; }
        else { ctx.strokeStyle = line; ctx.lineWidth = 1; ctx.globalAlpha = hi ? 0.08 : 0.3; }
        ctx.stroke();
        if (onActive || (both && !act)) {
          const t = ((flow * 0.012 + (e.a.charCodeAt(1) || 0) * 0.07) % 1);
          const px = a.x + (b.x - a.x) * t, py = a.y + (b.y - a.y) * t;
          ctx.globalAlpha = 1; ctx.fillStyle = byId[e.a].color || accent; ctx.beginPath(); ctx.arc(px, py, 2.6, 0, 7); ctx.fill();
        }
      }
      ctx.globalAlpha = 1;

      for (const n of nodes) {
        const dim = hi && !hi.has(n.id);
        const isActive = n.id === act;
        const pulse = isActive ? 1 + Math.sin(flow * 0.12) * 0.06 : 1;
        ctx.globalAlpha = dim ? 0.2 : 1;
        if (n.type === "project") {
          if (!dim) { ctx.globalAlpha = 0.25; ctx.fillStyle = accent; ctx.beginPath(); ctx.arc(n.x, n.y, n.r * 1.5, 0, 7); ctx.fill(); ctx.globalAlpha = 1; }
          ctx.beginPath(); ctx.arc(n.x, n.y, n.r * (isActive ? 1.18 : 1) * pulse, 0, 7);
          ctx.fillStyle = accent; ctx.fill();
          ctx.lineWidth = 2; ctx.strokeStyle = paper; ctx.stroke();
          ctx.globalAlpha = dim ? 0.3 : 1; ctx.fillStyle = "#fff"; ctx.font = "600 11px 'JetBrains Mono', monospace"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
          ctx.fillText(String(n.idx + 1).padStart(2, "0"), n.x, n.y);
          ctx.fillStyle = dim ? ink3 : ink; ctx.font = "600 12px 'JetBrains Mono', monospace"; ctx.fillText(n.short, n.x, n.y + n.r + 14);
        } else {
          const col = n.color || ink3;
          if (isActive || (!dim && (act && hi && hi.has(n.id)))) { ctx.globalAlpha = 0.3; ctx.fillStyle = col; ctx.beginPath(); ctx.arc(n.x, n.y, n.r * 2.4, 0, 7); ctx.fill(); ctx.globalAlpha = 1; }
          ctx.beginPath(); ctx.arc(n.x, n.y, n.r * (isActive ? 1.5 : 1) * pulse, 0, 7);
          ctx.fillStyle = col; ctx.fill();
          ctx.lineWidth = 1.4; ctx.strokeStyle = isActive ? paper : col; ctx.stroke();
          ctx.globalAlpha = dim ? 0.22 : (act && !isActive && hi && hi.has(n.id) ? 1 : (act ? 0.45 : 0.9));
          ctx.fillStyle = isActive ? ink : ink2; ctx.font = (isActive ? "600 " : "") + "11px 'JetBrains Mono', monospace"; ctx.textAlign = "left"; ctx.textBaseline = "middle";
          ctx.fillText(n.label, n.x + n.r + 6, n.y);
        }
        ctx.globalAlpha = 1;
      }
      raf = requestAnimationFrame(loop);
    }
    function loop() { tick(); draw(); }
    raf = requestAnimationFrame(loop);

    function pick(clientX, clientY) {
      const r = canvas.getBoundingClientRect(); const x = clientX - r.left, y = clientY - r.top;
      let best = null, bestD = 1e9;
      for (const n of nodes) { const d = Math.hypot(n.x - x, n.y - y); const hit = n.r + (n.type === "project" ? 10 : 26); if (d < hit && d < bestD) { bestD = d; best = n; } }
      return best;
    }
    function onMove(e) {
      const n = pick(e.clientX, e.clientY);
      stateRef.current.hoverId = n ? n.id : null;
      canvas.style.cursor = n ? "none" : "none";
      if (!stateRef.current.pinId) setSel(n ? { type: n.type, id: n.id } : null);
      if (n) setTip({ x: e.clientX, y: e.clientY, name: n.label, sub: n.type === "tech" ? `${n.projects.length} project${n.projects.length>1?"s":""}` : `${n.stack.length} technologies` });
      else setTip(null);
    }
    function onClick(e) {
      const n = pick(e.clientX, e.clientY);
      if (!n) { stateRef.current.pinId = null; setSel(null); return; }
      stateRef.current.pinId = (stateRef.current.pinId === n.id) ? null : n.id;
      setSel({ type: n.type, id: n.id });
    }
    function onLeave() { stateRef.current.hoverId = null; setTip(null); if (!stateRef.current.pinId) setSel(null); }
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerdown", onClick);
    canvas.addEventListener("pointerleave", onLeave);
    const onResize = () => place();
    window.addEventListener("resize", onResize);
    stateRef.current.byId = byId;
    return () => { cancelAnimationFrame(raf); canvas.removeEventListener("pointermove", onMove); canvas.removeEventListener("pointerdown", onClick); canvas.removeEventListener("pointerleave", onLeave); window.removeEventListener("resize", onResize); };
  }, [catOf]);

  const node = sel ? stateRef.current.byId[sel.id] : null;
  let panel;
  if (!node) {
    panel = (<div className="net-default">
      <div className="k">interactive map</div>
      <p>Hover or tap any <span className="accent">technology</span> to trace the projects it powers. Tap a <b>project</b> to light up its full stack — or filter by discipline below.</p>
      <div className="net-legend">
        {NET_CATS.map((c) => (
          <button key={c.key} className={"net-leg" + (filterCat === c.key ? " on" : "")} onClick={() => setFilterCat((f) => f === c.key ? null : c.key)}>
            <i style={{ background: c.color }}></i>{c.label}
          </button>
        ))}
        <span className="net-leg static"><i style={{ background: "var(--accent)", borderRadius: "50%" }}></i> project</span>
      </div>
    </div>);
  } else if (node.type === "tech") {
    const ps = node.projects.map((pid) => stateRef.current.byId[pid]).filter(Boolean);
    const cat = NET_CATS.find((c) => c.key === node.cat) || NET_ETC;
    panel = (<div className="net-detail">
      <div className="k" style={{ color: cat.color }}>{cat.label}</div>
      <h4>{node.label}</h4>
      <div className="cnt">powers <span className="accent">{ps.length}</span> project{ps.length > 1 ? "s" : ""}</div>
      <ul>{ps.map((p) => (<li key={p.id}><a href={p.url} target="_blank" rel="noopener"><span className="live"><i></i></span>{p.label}<span className="ar">↗</span></a></li>))}</ul>
    </div>);
  } else {
    panel = (<div className="net-detail">
      <div className="k">project</div>
      <h4>{node.label}</h4>
      <div className="cnt">{node.stack.length} technologies</div>
      <div className="net-chips">{node.stack.map((s) => <span key={s} className="chip">{s}</span>)}</div>
      <a className="wi-open" href={node.url} target="_blank" rel="noopener" style={{ marginTop: 14, display: "inline-flex", gap: 8, fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--accent)" }}>open ↗</a>
    </div>);
  }

  return (
    <section id="network" className="section pad">
      <div className="wrap">
        <div className="shead" data-rv>
          <div className="meta"><span className="no">03</span><span>/ skill graph</span><span className="ln"></span><span>tech × projects — interactive</span></div>
          <h2 className="mask"><span>How it all connects.</span></h2>
          <p className="sub">A live dependency map of my stack. Every line links a technology to a project that runs on it — hover to trace, click to pin, filter by discipline.</p>
        </div>
        <div className="net-statbar" data-rv>
          <div className="net-st"><b>{meta.techs}</b><span>technologies</span></div>
          <div className="net-st"><b>{meta.projects}</b><span>live projects</span></div>
          <div className="net-st"><b>{meta.links}</b><span>connections</span></div>
          <div className="net-st"><b className="accent">{meta.top}</b><span>most-used</span></div>
        </div>
        <div className="net-grid" data-rv data-d="1">
          <div className="net-wrap" ref={wrapRef}><canvas ref={canvasRef} className="net-canvas"></canvas></div>
          <div className="net-panel">{panel}</div>
        </div>
      </div>
      {tip && <div className="net-tip" style={{ left: tip.x, top: tip.y }}><b>{tip.name}</b><span>{tip.sub}</span></div>}
    </section>
  );
}

Object.assign(window, { TechNetwork });
