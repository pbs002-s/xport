/* ============================================================
   PROJECT REELS — detailed multi-scene animated mockups (canvas + rAF).
   Each project plays a 4-scene mini-walkthrough of its real flow.
============================================================ */

/* ---- small canvas-draw helpers, bound per frame via `g` ---- */
function makeHelpers(ctx) {
  const rr = (x, y, w, h, r) => { r = Math.max(0, Math.min(r, w / 2, h / 2)); ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); };
  const T = (s, x, y, sz, col, align = "left", weight = 400, fam = "m") => { ctx.fillStyle = col; ctx.textAlign = align; ctx.textBaseline = "alphabetic"; ctx.font = `${weight !== 400 ? weight + " " : ""}${sz}px ${fam === "d" ? "'Inter Tight','Inter',system-ui,sans-serif" : "'JetBrains Mono',ui-monospace,monospace"}`; ctx.fillText(s, x, y); };
  const dot = (x, y, r, col) => { ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill(); };
  return { rr, T, dot };
}

/* dispatch table */
const REEL_DRAW = {};

function ProjectReel({ kind }) {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const _arc = ctx.arc.bind(ctx); ctx.arc = (x, y, r, a, b, c) => _arc(x, y, Math.max(0, r || 0), a, b, c || false);
    const _rg = ctx.createRadialGradient.bind(ctx); ctx.createRadialGradient = (x0, y0, r0, x1, y1, r1) => _rg(x0, y0, Math.max(0, r0 || 0), x1, y1, Math.max(0, r1 || 0));
    const dpr = Math.min(devicePixelRatio || 1, 2);
    let raf = 0, W = 0, H = 0, t0 = performance.now();
    function size() { const r = canvas.getBoundingClientRect(); if (r.width > 0) { W = canvas.width = Math.max(2, Math.round(r.width * dpr)); H = canvas.height = Math.max(2, Math.round(r.height * dpr)); } }
    addEventListener("resize", size);
    const V = (v, f) => getComputedStyle(document.documentElement).getPropertyValue(v).trim() || f;
    const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
    const ease = (x) => 1 - Math.pow(1 - x, 3);
    const easeIO = (x) => x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
    const H2 = makeHelpers(ctx);

    function frame(now) {
      if (!visible) return;
      size();
      if (W < 2 || H < 2) { raf = requestAnimationFrame(frame); return; }
      const t = (now - t0) / 1000;
      const g = {
        ctx, t, clamp, ease, easeIO, ...H2,
        A: V("--accent", "#be123c"), AS: V("--accent-soft", "rgba(190,18,60,.10)"), INK: V("--ink", "#16140f"), INK2: V("--ink-2", "#524e48"),
        INK3: V("--ink-3", "#6e695e"), LINE: V("--line-2", "rgba(0,0,0,.18)"), SURF: V("--surface", "#fff"),
        PAPER: V("--paper", "#f4f1ea"), green: "#1f9d57", red: "#e23b5a", amber: "#e0922b",
      };
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const w = W / dpr, h = H / dpr;
      g.w = w; g.h = h; g.PAD = Math.round(w * 0.045);
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = g.PAPER; ctx.fillRect(0, 0, w, h);
      try { (REEL_DRAW[kind] || REEL_DRAW.generic)(g); } catch (e) { /* never break the loop */ }
      sceneDots(g);
      raf = requestAnimationFrame(frame);
    }

    function sceneDots(g) {
      if (g._N == null) return;
      const { ctx, w, h, A, LINE } = g; const n = g._N, gap = 9, tot = (n - 1) * gap, x0 = w / 2 - tot / 2, y = h - 8;
      for (let i = 0; i < n; i++) { ctx.fillStyle = i === g._idx ? A : LINE; ctx.beginPath(); ctx.arc(x0 + i * gap, y, i === g._idx ? 2.6 : 2, 0, 7); ctx.fill(); }
      g._N = null;
    }

    let visible = true; size(); raf = requestAnimationFrame(frame);
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (e.isIntersecting && !visible) { visible = true; t0 = performance.now(); raf = requestAnimationFrame(frame); }
      else if (!e.isIntersecting && visible) { visible = false; cancelAnimationFrame(raf); }
    }), { rootMargin: "200px" });
    io.observe(canvas);
    return () => { cancelAnimationFrame(raf); removeEventListener("resize", size); io.disconnect(); };
  }, [kind]);
  return <canvas ref={ref} className="reel-canvas"></canvas>;
}

/* scene controller: returns body region + slide + sets dots */
function scenes(g, n, dur) {
  const tt = g.t % (n * dur), idx = Math.floor(tt / dur), lo = tt % dur;
  g._N = n; g._idx = idx;
  const sl = (1 - g.easeIO(g.clamp(lo / 0.45, 0, 1))) * g.w * 0.1;
  return { idx, lo, sl };
}
function bodyClip(g, x, y, w, h) { g.ctx.save(); g.ctx.beginPath(); g.rr(x, y, w, h, 6); g.ctx.clip(); }

/* ============================================================
   EDUSYNC — digital university platform: 4 portals, realtime chat, routine, grading.
   0 4-portal shell  1 Socket.IO & Redis chat  2 routine conflict check  3 submission & grading
============================================================ */
REEL_DRAW.edusync = function (g) {
  const { ctx, w, h, t, PAD, A, INK, INK2, INK3, LINE, SURF, PAPER, green, amber, red, T, rr, dot, clamp, ease, easeIO } = g;
  const { idx, lo, sl } = scenes(g, 4, 2.5);

  ctx.fillStyle = SURF; ctx.strokeStyle = LINE; ctx.lineWidth = 1;
  rr(PAD, PAD, w - 2 * PAD, h * 0.12, 5); ctx.fill(); ctx.stroke();
  dot(PAD + 15, PAD + h * 0.06, 5, A);
  T("EduSync · University OS", PAD + 28, PAD + h * 0.078, Math.round(w * 0.025), INK, "left", 600);
  T(["4 portals", "Socket.IO chat", "routine engine", "grading queue"][idx], w - PAD - 10, PAD + h * 0.078, Math.round(w * 0.022), INK3, "right");

  const bx = PAD, by = PAD + h * 0.16, bw = w - 2 * PAD, bh = h - by - PAD - h * 0.06;
  ctx.save(); ctx.translate(sl, 0);

  if (idx === 0) {
    /* 4 role-scoped portals */
    T("4 Role-Scoped Portals", bx + 4, by + h * 0.045, Math.round(w * 0.026), INK, "left", 600);
    const portals = [
      ["Student", "Courses · Routine · Quizzes", green],
      ["Teacher", "Grading Queue · Attendance", A],
      ["Super Admin", "404-Invisibility · Depts", amber],
      ["Authority", "Proctor · Lost & Found", "#3b82f6"]
    ];
    const pw = (bw - 10) / 2, ph = bh * 0.35;
    portals.forEach((p, i) => {
      const col = i % 2, row = Math.floor(i / 2);
      const px = bx + col * (pw + 10), py = by + bh * 0.10 + row * (ph + 8);
      const pr = easeIO(clamp((lo - 0.15 - i * 0.15) / 0.4, 0, 1));
      if (pr <= 0) return;
      ctx.globalAlpha = pr;
      const isTarget = i === 0;
      ctx.fillStyle = isTarget ? "rgba(31,111,235,.06)" : SURF;
      ctx.strokeStyle = isTarget ? A : LINE;
      ctx.lineWidth = isTarget ? 1.5 : 1;
      rr(px, py, pw, ph, 5); ctx.fill(); ctx.stroke();
      dot(px + 12, py + ph * 0.3, 4, p[2]);
      T(p[0], px + 24, py + ph * 0.36, Math.round(w * 0.023), INK, "left", 600);
      T(p[1], px + 12, py + ph * 0.72, Math.round(w * 0.018), INK3);
      ctx.globalAlpha = 1;
    });
    if (lo > 1.2) {
      T("Unified React 19 shell · RBAC strictly enforced", bx + 8, by + bh * 0.925, Math.round(w * 0.020), green, "left", 500);
    }

  } else if (idx === 1) {
    /* Socket.IO + Redis Pub/Sub realtime messaging */
    T("Socket.IO + Redis Pub/Sub", bx + 4, by + h * 0.045, Math.round(w * 0.026), INK, "left", 600);
    dot(bx + bw - 100, by + h * 0.038, 4, green);
    T("ws://live:6002", bx + bw - 10, by + h * 0.045, Math.round(w * 0.02), green, "right");

    const chatCardH = bh * 0.68;
    ctx.fillStyle = SURF; ctx.strokeStyle = LINE; rr(bx, by + bh * 0.1, bw, chatCardH, 5); ctx.fill(); ctx.stroke();
    bodyClip(g, bx, by + bh * 0.1, bw, chatCardH);

    // message 1
    const p1 = easeIO(clamp(lo / 0.5, 0, 1));
    if (p1 > 0) {
      ctx.globalAlpha = p1;
      const mw = bw * 0.65, mx = bx + 10, my = by + bh * 0.16;
      ctx.fillStyle = PAPER; ctx.strokeStyle = LINE; rr(mx, my, mw, bh * 0.22, 6); ctx.fill(); ctx.stroke();
      T("Study Group · CSE-311", mx + 10, my + bh * 0.08, Math.round(w * 0.019), A, "left", 600);
      T("Midterm review session today at 4 PM?", mx + 10, my + bh * 0.16, Math.round(w * 0.021), INK);
      ctx.globalAlpha = 1;
    }

    // message 2 (reply)
    const p2 = easeIO(clamp((lo - 0.7) / 0.5, 0, 1));
    if (p2 > 0) {
      ctx.globalAlpha = p2;
      const mw = bw * 0.55, mx = bx + bw - mw - 10, my = by + bh * 0.44;
      ctx.fillStyle = A; rr(mx, my, mw, bh * 0.22, 6); ctx.fill();
      T("Yes! Room 402 is booked.", mx + 10, my + bh * 0.13, Math.round(w * 0.021), "#fff");
      T("Delivered · 12ms", mx + mw - 10, my + bh * 0.185, Math.round(w * 0.017), "rgba(255,255,255,.8)", "right");
      ctx.globalAlpha = 1;
    }
    ctx.restore();

    if (lo > 1.4) {
      T("Redis channel: chat:group:cse311 broadcasted", bx + 8, by + bh * 0.925, Math.round(w * 0.020), INK3, "left", 500);
    }

  } else if (idx === 2) {
    /* Academic routine conflict engine */
    T("Routine Engine · Collision Free", bx + 4, by + h * 0.045, Math.round(w * 0.026), INK, "left", 600);
    const slots = [
      ["08:30 - 10:00", "CSE-221 (Algorithms)", "Room 601", green],
      ["10:00 - 11:30", "CSE-311 (Database)", "Room 504", green],
      ["11:30 - 01:00", "Proposed: PHY-102", "Conflict: [11:30, 12:00)", red],
    ];
    slots.forEach((s, i) => {
      const p = easeIO(clamp((lo - 0.2 - i * 0.25) / 0.4, 0, 1));
      if (p <= 0) return;
      const y = by + bh * 0.12 + i * bh * 0.23;
      ctx.globalAlpha = p;
      ctx.fillStyle = SURF; ctx.strokeStyle = s[3] === red ? red : LINE; ctx.lineWidth = s[3] === red ? 1.5 : 1;
      rr(bx, y, bw, bh * 0.18, 4); ctx.fill(); ctx.stroke();
      dot(bx + 14, y + bh * 0.09, 4.5, s[3]);
      T(s[0], bx + 28, y + bh * 0.075, Math.round(w * 0.019), INK3);
      T(s[1], bx + 28, y + bh * 0.135, Math.round(w * 0.022), INK, "left", 500);
      T(s[2], bx + bw - 12, y + bh * 0.105, Math.round(w * 0.021), s[3], "right", 600);
      ctx.globalAlpha = 1;
    });
    if (lo > 1.4) {
      T("Half-open interval check [start, end) invariant active", bx + 8, by + bh * 0.925, Math.round(w * 0.020), INK3, "left", 500);
    }

  } else {
    /* Assignment grading queue & auto-penalties */
    T("Grading Queue & Late Penalties", bx + 4, by + h * 0.045, Math.round(w * 0.026), INK, "left", 600);
    const queue = [
      ["Tanvir Ahmed", "Lab Assignment 3.pdf", "100 / 100", green, "On time"],
      ["Pritam Biswas", "Final Project Code.zip", "98 / 100", green, "On time"],
      ["Nafis Rayan", "Report Draft.docx", "85 / 100", amber, "-5% late penalty"],
    ];
    queue.forEach((q, i) => {
      const p = easeIO(clamp((lo - 0.2 - i * 0.22) / 0.4, 0, 1));
      if (p <= 0) return;
      const y = by + bh * 0.11 + i * bh * 0.20;
      ctx.globalAlpha = p;
      ctx.fillStyle = SURF; ctx.strokeStyle = LINE; rr(bx, y, bw, bh * 0.16, 4); ctx.fill(); ctx.stroke();
      T(q[0], bx + 12, y + bh * 0.065, Math.round(w * 0.022), INK, "left", 600);
      T(q[1], bx + 12, y + bh * 0.12, Math.round(w * 0.019), INK3);
      T(q[2], bx + bw - 12, y + bh * 0.065, Math.round(w * 0.023), q[3], "right", 600);
      T(q[4], bx + bw - 12, y + bh * 0.12, Math.round(w * 0.018), q[3], "right");
      ctx.globalAlpha = 1;
    });
    if (lo > 1.3) {
      ctx.fillStyle = "rgba(31,157,87,.1)"; ctx.strokeStyle = green;
      rr(bx, by + bh * 0.74, bw, bh * 0.12, 4); ctx.fill(); ctx.stroke();
      dot(bx + 16, by + bh * 0.80, 4, green);
      T("Redis queue worker: 24 grades dispatched to students", bx + 28, by + bh * 0.82, Math.round(w * 0.020), green, "left", 500);
    }
    if (lo > 1.6) {
      T("Automatic late penalty applied · gradebook synced", bx + 8, by + bh * 0.925, Math.round(w * 0.019), INK3, "left", 500);
    }
  }

  ctx.restore();
};

/* ============================================================
   BHASHABOT — multilingual Messenger auto-reply.
   0 message arrives  1 one GPT-4o call  2 decision point  3 reply sent
============================================================ */
REEL_DRAW.bhashabot = function (g) {
  const { ctx, w, h, t, PAD, A, INK, INK2, INK3, LINE, SURF, green, amber, red, T, rr, dot, clamp, ease, easeIO } = g;
  const { idx, lo, sl } = scenes(g, 4, 2.5);

  /* messenger chrome (persistent) */
  ctx.fillStyle = SURF; ctx.strokeStyle = LINE; ctx.lineWidth = 1;
  rr(PAD, PAD, w - 2 * PAD, h * 0.12, 5); ctx.fill(); ctx.stroke();
  dot(PAD + 15, PAD + h * 0.06, 6, A);
  T("Messenger · Page Inbox", PAD + 28, PAD + h * 0.078, Math.round(w * 0.026), INK, "left", 600);
  T(["incoming", "GPT-4o", "routing", "sent"][idx], w - PAD - 10, PAD + h * 0.078, Math.round(w * 0.022), INK3, "right");

  const bx = PAD, by = PAD + h * 0.16, bw = w - 2 * PAD, bh = h - by - PAD - h * 0.06;
  const bubble = (x, y, ww, hh, mine, txt, sz) => {
    ctx.fillStyle = mine ? A : SURF; ctx.strokeStyle = mine ? A : LINE;
    rr(x, y, ww, hh, 8); ctx.fill(); ctx.stroke();
    T(txt, x + 12, y + hh * 0.62, sz, mine ? "#fff" : INK);
  };

  ctx.save(); ctx.translate(sl, 0);

  if (idx === 0) {
    /* customer writes in Banglish */
    const p1 = easeIO(clamp(lo / 0.6, 0, 1));
    ctx.globalAlpha = p1;
    bubble(bx, by + bh * 0.06, bw * 0.72, bh * 0.17, false, "vai, product ta ki stock ache?", Math.round(w * 0.026));
    ctx.globalAlpha = 1;
    const p2 = easeIO(clamp((lo - 0.7) / 0.6, 0, 1));
    if (p2 > 0) {
      ctx.globalAlpha = p2;
      bubble(bx, by + bh * 0.28, bw * 0.6, bh * 0.17, false, "dam koto hobe?", Math.round(w * 0.026));
      ctx.globalAlpha = 1;
    }
    if (lo > 1.5) {
      /* typing indicator */
      const ty = by + bh * 0.52;
      ctx.fillStyle = SURF; ctx.strokeStyle = LINE; rr(bx, ty, bw * 0.24, bh * 0.14, 8); ctx.fill(); ctx.stroke();
      for (let i = 0; i < 3; i++) {
        const a = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * 6 - i * 1.1));
        ctx.globalAlpha = a; dot(bx + bw * 0.06 + i * bw * 0.06, ty + bh * 0.07, 3.2, INK3); ctx.globalAlpha = 1;
      }
      T("detecting language…", bx + 6, by + bh * 0.76, Math.round(w * 0.024), INK3);
    }
    if (lo > 1.6) {
      T("Meta Webhook · payload verified with APP_SECRET sha256", bx + 8, by + bh * 0.925, Math.round(w * 0.020), green, "left", 500);
    }

  } else if (idx === 1) {
    /* one GPT-4o call returns the whole structured verdict */
    T("single GPT-4o call", bx + 4, by + h * 0.05, Math.round(w * 0.026), INK, "left", 600);
    T("structured JSON", bx + bw - 4, by + h * 0.05, Math.round(w * 0.02), A, "right", 500);
    const rows = [
      ["language", "Banglish (bn-Latn)", A],
      ["intent", "stock + price enquiry", INK],
      ["sentiment", "neutral", green],
      ["lead", "captured", green],
      ["handoff", "not required", INK3],
    ];
    rows.forEach((r, i) => {
      const y = by + bh * 0.10 + i * bh * 0.145;
      const p = easeIO(clamp((lo - 0.25 - i * 0.22) / 0.45, 0, 1));
      if (p <= 0) return;
      ctx.globalAlpha = p;
      ctx.fillStyle = SURF; ctx.strokeStyle = LINE; rr(bx, y, bw, bh * 0.12, 4); ctx.fill(); ctx.stroke();
      T(r[0], bx + 10, y + bh * 0.08, Math.round(w * 0.022), INK3);
      T(r[1], bx + bw - 10, y + bh * 0.08, Math.round(w * 0.023), r[2], "right", 500);
      ctx.globalAlpha = 1;
    });
    if (lo > 1.5) {
      T("1 request · 0 cascade delay · structured JSON verdict", bx + 8, by + bh * 0.925, Math.round(w * 0.020), green, "left", 500);
    }

  } else if (idx === 2) {
    /* one decision point: bot replies, or a human takes over */
    T("one decision point", bx + 4, by + h * 0.05, Math.round(w * 0.026), INK, "left", 600);
    const nx = bx + bw / 2, ny = by + bh * 0.24;
    ctx.fillStyle = A; rr(nx - bw * 0.16, ny - bh * 0.07, bw * 0.32, bh * 0.14, 5); ctx.fill();
    T("webhook", nx, ny + bh * 0.025, Math.round(w * 0.024), "#fff", "center", 600);

    const branches = [
      [bx + bw * 0.17, "auto-reply", green, "refund? no"],
      [bx + bw * 0.83, "human agent", amber, "emergency? no"],
    ];
    const pick = 0;  // this conversation routes to the bot
    branches.forEach((b, i) => {
      const p = easeIO(clamp((lo - 0.4 - i * 0.2) / 0.5, 0, 1));
      const yy = by + bh * 0.62;
      ctx.strokeStyle = i === pick && lo > 1.1 ? b[2] : LINE;
      ctx.lineWidth = i === pick && lo > 1.1 ? 2 : 1;
      ctx.beginPath(); ctx.moveTo(nx, ny + bh * 0.07);
      ctx.lineTo(b[0], yy - bh * 0.08); ctx.stroke();
      ctx.globalAlpha = p;
      const on = i === pick && lo > 1.3;
      ctx.fillStyle = on ? b[2] : SURF; ctx.strokeStyle = on ? b[2] : LINE; ctx.lineWidth = 1;
      rr(b[0] - bw * 0.15, yy - bh * 0.08, bw * 0.3, bh * 0.15, 5); ctx.fill(); ctx.stroke();
      T(b[1], b[0], yy + bh * 0.015, Math.round(w * 0.024), on ? "#fff" : INK2, "center", 600);
      T(b[3], b[0], yy + bh * 0.17, Math.round(w * 0.02), INK3, "center");
      ctx.globalAlpha = 1;
    });
    if (lo > 1.4) {
      T("Deterministic routing · human fallback SLA < 30s", bx + 8, by + bh * 0.925, Math.round(w * 0.020), INK3, "left", 500);
    }

  } else {
    /* reply goes out, in the customer's own language */
    bubble(bx, by + bh * 0.04, bw * 0.66, bh * 0.15, false, "dam koto hobe?", Math.round(w * 0.025));
    const p = easeIO(clamp((lo - 0.4) / 0.7, 0, 1));
    if (p > 0) {
      ctx.globalAlpha = p;
      const rw = bw * 0.74;
      bubble(bx + bw - rw, by + bh * 0.24, rw, bh * 0.28, true, "", 0);
      T("Ji vai, stock ache!", bx + bw - rw + 12, by + bh * 0.35, Math.round(w * 0.025), "#fff");
      T("Price 1,250 taka, free delivery.", bx + bw - rw + 12, by + bh * 0.46, Math.round(w * 0.023), "rgba(255,255,255,.85)");
      ctx.globalAlpha = 1;
    }
    if (lo > 1.4) {
      dot(bx + bw - 10, by + bh * 0.57, 4.5, green);
      T("replied in 1.2s", bx + bw - 20, by + bh * 0.585, Math.round(w * 0.021), green, "right");
    }
    /* 18-language coverage strip */
    T("18 languages supported", bx + 4, by + bh * 0.68, Math.round(w * 0.02), INK3);
    const langs = ["বাংলা", "EN", "हिं", "عر", "ES", "FR", "PT", "ID", "UR"];
    langs.forEach((l, i) => {
      const p2 = clamp((lo - 0.8 - i * 0.06) / 0.3, 0, 1);
      if (p2 <= 0) return;
      const cw = bw / langs.length;
      ctx.globalAlpha = p2 * 0.9;
      ctx.fillStyle = SURF; ctx.strokeStyle = LINE;
      rr(bx + i * cw + 1, by + bh * 0.73, cw - 3, bh * 0.14, 4); ctx.fill(); ctx.stroke();
      T(l, bx + i * cw + cw / 2, by + bh * 0.825, Math.round(w * 0.021), INK2, "center");
      ctx.globalAlpha = 1;
    });
    if (lo > 1.5) {
      T("Bangla, Banglish, Hindi, Arabic, English & 13 more", bx + 8, by + bh * 0.925, Math.round(w * 0.020), green, "left", 500);
    }
  }

  ctx.restore();
};

/* ============================================================
   DIU ROUTINE — scanned routine in, offline timetable out.
   0 upload  1 Gemini Vision extraction  2 timetable  3 reminder + streak
============================================================ */
REEL_DRAW.diuroutine = function (g) {
  const { ctx, w, h, t, PAD, A, INK, INK2, INK3, LINE, SURF, PAPER, green, amber, T, rr, dot, clamp, ease, easeIO } = g;
  const { idx, lo, sl } = scenes(g, 4, 2.4);

  ctx.fillStyle = SURF; ctx.strokeStyle = LINE; ctx.lineWidth = 1;
  rr(PAD, PAD, w - 2 * PAD, h * 0.12, 5); ctx.fill(); ctx.stroke();
  dot(PAD + 15, PAD + h * 0.06, 5, A);
  T("DIU Routine · offline", PAD + 28, PAD + h * 0.078, Math.round(w * 0.026), INK, "left", 600);
  T(["upload", "Gemini Vision", "timetable", "reminder"][idx], w - PAD - 10, PAD + h * 0.078, Math.round(w * 0.022), INK3, "right");

  const bx = PAD, by = PAD + h * 0.16, bw = w - 2 * PAD, bh = h - by - PAD - h * 0.06;
  ctx.save(); ctx.translate(sl, 0);

  if (idx === 0) {
    /* the department PDF everyone gets */
    const dw = bw * 0.52, dx = bx + bw / 2 - dw / 2, dh = bh * 0.70;
    ctx.fillStyle = PAPER; ctx.strokeStyle = LINE; rr(dx, by, dw, dh, 5); ctx.fill(); ctx.stroke();
    T("Fall-2026_CSE_Routine.pdf", dx + dw / 2, by + dh + bh * 0.14, Math.round(w * 0.024), INK3, "center");
    /* a faint scanned grid */
    ctx.strokeStyle = LINE; ctx.lineWidth = 1;
    for (let r = 1; r < 6; r++) { const y = by + (r / 6) * dh; ctx.beginPath(); ctx.moveTo(dx, y); ctx.lineTo(dx + dw, y); ctx.stroke(); }
    for (let c = 1; c < 5; c++) { const x = dx + (c / 5) * dw; ctx.beginPath(); ctx.moveTo(x, by); ctx.lineTo(x, by + dh); ctx.stroke(); }
    ctx.fillStyle = LINE;
    for (let r = 0; r < 6; r++) for (let c = 0; c < 5; c++) {
      if ((r * 5 + c) % 3 === 0) continue;
      rr(dx + (c / 5) * dw + 5, by + (r / 6) * dh + dh * 0.055, dw / 5 - 10, dh * 0.045, 2); ctx.fill();
    }
    /* scan sweep */
    const sp = (lo % 1.6) / 1.6;
    const gy = by + sp * dh;
    const grad = ctx.createLinearGradient(0, gy - dh * 0.08, 0, gy);
    grad.addColorStop(0, "rgba(31,111,235,0)"); grad.addColorStop(1, "rgba(31,111,235,.28)");
    ctx.fillStyle = grad; ctx.fillRect(dx, gy - dh * 0.08, dw, dh * 0.08);
    ctx.strokeStyle = A; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(dx, gy); ctx.lineTo(dx + dw, gy); ctx.stroke();
    if (lo > 1.2) {
      T("Raw department timetable uploaded via camera / PDF", bx + 8, by + bh * 0.925, Math.round(w * 0.020), INK3, "left", 500);
    }

  } else if (idx === 1) {
    /* Gemini Vision pulls structured fields out of the scan */
    T("Gemini Vision · extracting", bx + 4, by + h * 0.05, Math.round(w * 0.026), INK, "left", 600);
    T("JSON schema", bx + bw - 4, by + h * 0.05, Math.round(w * 0.02), A, "right", 500);
    const fields = [
      ["course", "CSE 2118"], ["day", "Sunday"],
      ["time", "08:30 – 10:00"], ["room", "KT-604"],
      ["teacher", "MMR"], ["section", "62_D"],
    ];
    const cols = 2, cw = (bw - 8) / cols, chh = bh * 0.19;
    fields.forEach((f, i) => {
      const p = easeIO(clamp((lo - 0.2 - i * 0.18) / 0.4, 0, 1));
      if (p <= 0) return;
      const x = bx + (i % cols) * (cw + 8), y = by + bh * 0.11 + Math.floor(i / cols) * (chh + bh * 0.05);
      ctx.globalAlpha = p;
      ctx.fillStyle = SURF; ctx.strokeStyle = p > 0.9 ? A : LINE; rr(x, y, cw, chh, 4); ctx.fill(); ctx.stroke();
      T(f[0], x + 10, y + chh * 0.38, Math.round(w * 0.019), INK3);
      T(f[1], x + 10, y + chh * 0.80, Math.round(w * 0.025), INK, "left", 600);
      ctx.globalAlpha = 1;
    });
    if (lo > 1.7) T("6 fields · 24 classes parsed into Room DB", bx + 8, by + bh * 0.925, Math.round(w * 0.020), green, "left", 500);

  } else if (idx === 2) {
    /* the built timetable, on the phone */
    const pw = bw * 0.44, px = bx + bw / 2 - pw / 2, ph = bh * 0.94;
    ctx.fillStyle = SURF; ctx.strokeStyle = INK3; ctx.lineWidth = 1.4;
    rr(px, by, pw, ph, 12); ctx.fill(); ctx.stroke();
    ctx.fillStyle = LINE; rr(px + pw / 2 - pw * 0.1, by + 6, pw * 0.2, 3, 2); ctx.fill();
    T("Today · Sunday", px + 12, by + ph * 0.12, Math.round(w * 0.024), INK, "left", 600);
    const classes = [["08:30", "CSE 2118", "KT-604"], ["10:00", "CSE 2113", "KT-511"], ["11:30", "MAT 2101", "AB-402"]];
    classes.forEach((c, i) => {
      const p = easeIO(clamp((lo - 0.3 - i * 0.3) / 0.5, 0, 1));
      if (p <= 0) return;
      const y = by + ph * 0.2 + i * ph * 0.24;
      ctx.globalAlpha = p;
      ctx.fillStyle = i === 0 ? A : PAPER; ctx.strokeStyle = i === 0 ? A : LINE;
      rr(px + 8, y, pw - 16, ph * 0.19, 5); ctx.fill(); ctx.stroke();
      const fg = i === 0 ? "#fff" : INK, fg2 = i === 0 ? "rgba(255,255,255,.8)" : INK3;
      T(c[0], px + 18, y + ph * 0.07, Math.round(w * 0.02), fg2);
      T(c[1], px + 18, y + ph * 0.14, Math.round(w * 0.024), fg, "left", 600);
      T(c[2], px + pw - 26, y + ph * 0.14, Math.round(w * 0.02), fg2, "right");
      ctx.globalAlpha = 1;
    });
    T("stored offline · Room DB", px + pw / 2, by + ph * 0.91, Math.round(w * 0.02), INK3, "center");

  } else {
    /* reminder fires, streak ticks up */
    const p = easeIO(clamp(lo / 0.7, 0, 1));
    const ny = by + bh * 0.04 - (1 - p) * bh * 0.3;
    ctx.globalAlpha = p;
    ctx.fillStyle = SURF; ctx.strokeStyle = LINE; rr(bx, ny, bw, bh * 0.26, 6); ctx.fill(); ctx.stroke();
    ctx.fillStyle = A; rr(bx + 12, ny + bh * 0.06, bh * 0.14, bh * 0.14, 4); ctx.fill();
    T("!", bx + 12 + bh * 0.07, ny + bh * 0.165, Math.round(w * 0.026), "#fff", "center", 700);
    T("CSE 2118 starts in 15 min", bx + bh * 0.2 + 16, ny + bh * 0.12, Math.round(w * 0.025), INK, "left", 600);
    T("Room KT-604 · walk now", bx + bh * 0.2 + 16, ny + bh * 0.21, Math.round(w * 0.021), INK3);
    ctx.globalAlpha = 1;

    /* attendance streak */
    const sp = easeIO(clamp((lo - 0.8) / 0.8, 0, 1));
    if (sp > 0) {
      ctx.globalAlpha = sp;
      T("study streak", bx + 4, by + bh * 0.46, Math.round(w * 0.021), INK3);
      const days = 14, gw = (bw - (days - 1) * 4) / days;
      for (let i = 0; i < days; i++) {
        const on = i < Math.round(days * sp);
        ctx.fillStyle = on ? (i > days - 4 ? green : A) : LINE;
        ctx.globalAlpha = sp * (on ? 0.9 : 0.4);
        rr(bx + i * (gw + 4), by + bh * 0.53, gw, bh * 0.12, 3); ctx.fill();
      }
      ctx.globalAlpha = sp;
      T(Math.round(12 * sp) + " days", bx + 4, by + bh * 0.77, Math.round(w * 0.04), INK, "left", 700, "d");
      T("attendance 94%", bx + bw - 4, by + bh * 0.77, Math.round(w * 0.024), green, "right");
      ctx.globalAlpha = 1;
    }
    if (lo > 1.4) {
      T("Smart notification fires based on current location & timetable", bx + 8, by + bh * 0.925, Math.round(w * 0.020), INK3, "left", 500);
    }
  }

  ctx.restore();
};

/* ============================================================
   OPENGOVTBD — citizen files, officer resolves, admin sees it.
   0 complaint  1 lifecycle  2 official poll  3 analytics + badge
============================================================ */
REEL_DRAW.opengovtbd = function (g) {
  const { ctx, w, h, t, PAD, A, INK, INK2, INK3, LINE, SURF, PAPER, green, amber, red, T, rr, dot, clamp, ease, easeIO } = g;
  const { idx, lo, sl } = scenes(g, 4, 2.5);

  /* government banner */
  ctx.fillStyle = A; rr(PAD, PAD, w - 2 * PAD, h * 0.13, 5); ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,.75)"; ctx.lineWidth = 1.4;
  ctx.beginPath(); ctx.arc(PAD + 16, PAD + h * 0.065, 6.5, 0, 7); ctx.stroke();
  T("OpenGovtBD", PAD + 30, PAD + h * 0.09, Math.round(w * 0.03), "#fff", "left", 600);
  T(["citizen", "officer", "poll", "admin"][idx].toUpperCase(), w - PAD - 12, PAD + h * 0.09, Math.round(w * 0.021), "rgba(255,255,255,.8)", "right");

  const bx = PAD, by = PAD + h * 0.18, bw = w - 2 * PAD, bh = h - by - PAD - h * 0.06;
  ctx.save(); ctx.translate(sl, 0);

  if (idx === 0) {
    /* citizen files a complaint */
    T("File a complaint", bx + 4, by + h * 0.045, Math.round(w * 0.026), INK, "left", 600);
    const fields = [["Category", "Road & Infrastructure"], ["Division", "Dhaka"], ["Details", "Broken street light, Ward 12"]];
    fields.forEach((f, i) => {
      const p = easeIO(clamp((lo - 0.2 - i * 0.28) / 0.45, 0, 1));
      if (p <= 0) return;
      const y = by + bh * 0.1 + i * bh * 0.22;
      ctx.globalAlpha = p;
      T(f[0], bx + 4, y + bh * 0.04, Math.round(w * 0.02), INK3);
      ctx.fillStyle = SURF; ctx.strokeStyle = LINE; rr(bx, y + bh * 0.06, bw, bh * 0.13, 4); ctx.fill(); ctx.stroke();
      const chars = Math.floor(clamp((lo - 0.3 - i * 0.28) / 0.5, 0, 1) * f[1].length);
      T(f[1].slice(0, chars), bx + 10, y + bh * 0.145, Math.round(w * 0.023), INK);
      ctx.globalAlpha = 1;
    });
    const sp = easeIO(clamp((lo - 1.5) / 0.6, 0, 1));
    if (sp > 0) {
      const sy = by + bh * 0.77 + (1 - sp) * bh * 0.06;
      ctx.fillStyle = A; rr(bx, sy, bw * 0.34, bh * 0.14, 4); ctx.fill();
      T("Submit", bx + bw * 0.17, sy + bh * 0.085, Math.round(w * 0.024), "#fff", "center", 600);
      if (sp > 0.9) T("#CMP-2291 created", bx + bw * 0.38, sy + bh * 0.085, Math.round(w * 0.022), green);
    }
    if (lo > 1.6) {
      T("Geo-tagged & routed to Ward 12 executive engineer", bx + 8, by + bh * 0.925, Math.round(w * 0.020), green, "left", 500);
    }

  } else if (idx === 1) {
    /* the complaint lifecycle, with the officer's timeline */
    T("Complaint #CMP-2291", bx + 4, by + h * 0.045, Math.round(w * 0.026), INK, "left", 600);
    const steps = ["Submitted", "Assigned", "In Progress", "Resolved"];
    const reached = clamp((lo - 0.2) / 1.5, 0, 1) * (steps.length - 1);
    const lx = bx + 10, ly = by + bh * 0.18, gap = bh * 0.20;
    /* rail */
    ctx.strokeStyle = LINE; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(lx, ly); ctx.lineTo(lx, ly + gap * (steps.length - 1)); ctx.stroke();
    ctx.strokeStyle = A;
    ctx.beginPath(); ctx.moveTo(lx, ly); ctx.lineTo(lx, ly + gap * reached); ctx.stroke();
    steps.forEach((s, i) => {
      const on = reached >= i - 0.05;
      const y = ly + i * gap;
      ctx.fillStyle = on ? (i === 3 ? green : A) : SURF;
      ctx.strokeStyle = on ? (i === 3 ? green : A) : LINE; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(lx, y, 6, 0, 7); ctx.fill(); ctx.stroke();
      T(s, lx + 18, y + bh * 0.025, Math.round(w * 0.024), on ? INK : INK3, "left", on ? 600 : 400);
      if (on && i === 1) T("Officer · PWD Dhaka", bx + bw - 6, y + bh * 0.025, Math.round(w * 0.02), INK3, "right");
      if (on && i === 3) T("★★★★☆ rated", bx + bw - 6, y + bh * 0.025, Math.round(w * 0.02), amber, "right");
    });
    if (lo > 1.5) {
      T("Citizen verified resolution · SMS confirmation dispatched", bx + 8, by + bh * 0.925, Math.round(w * 0.020), green, "left", 500);
    }

  } else if (idx === 2) {
    /* official poll, live percentages */
    T("Official Poll · one vote per citizen", bx + 4, by + h * 0.045, Math.round(w * 0.024), INK, "left", 600);
    T("Which service needs priority?", bx + 4, by + bh * 0.17, Math.round(w * 0.026), INK2, "left", 500);
    const opts = [["Waste collection", 0.46], ["Street lighting", 0.31], ["Drainage", 0.23]];
    opts.forEach((o, i) => {
      const p = easeIO(clamp((lo - 0.3 - i * 0.2) / 0.8, 0, 1));
      const y = by + bh * 0.26 + i * bh * 0.20;
      ctx.fillStyle = SURF; ctx.strokeStyle = i === 0 ? A : LINE; ctx.lineWidth = 1;
      rr(bx, y, bw, bh * 0.15, 4); ctx.fill(); ctx.stroke();
      ctx.save(); ctx.beginPath(); rr(bx, y, bw, bh * 0.15, 4); ctx.clip();
      ctx.fillStyle = i === 0 ? "rgba(31,111,235,.16)" : LINE;
      ctx.globalAlpha = i === 0 ? 1 : 0.5;
      ctx.fillRect(bx, y, bw * o[1] * p, bh * 0.15);
      ctx.globalAlpha = 1; ctx.restore();
      T(o[0], bx + 12, y + bh * 0.10, Math.round(w * 0.024), INK);
      T(Math.round(o[1] * p * 100) + "%", bx + bw - 12, y + bh * 0.10, Math.round(w * 0.024), i === 0 ? A : INK3, "right", 600);
    });
    if (lo > 1.6) T("2,418 votes cast · NID verified tamper-proof tally", bx + 8, by + bh * 0.925, Math.round(w * 0.020), INK3, "left", 500);

  } else {
    /* super-admin analytics + civic gamification */
    T("Super Admin · analytics", bx + 4, by + h * 0.045, Math.round(w * 0.026), INK, "left", 600);
    const bars = [["Roads", .82], ["Water", .61], ["Waste", .74], ["Power", .43], ["Health", .55], ["Edu", .38]];
    const gw = (bw - (bars.length - 1) * 8) / bars.length, gh = bh * 0.44, gy = by + bh * 0.1;
    bars.forEach((b, i) => {
      const p = easeIO(clamp((lo - 0.2 - i * 0.1) / 0.5, 0, 1));
      const x = bx + i * (gw + 8), vh2 = gh * b[1] * p;
      ctx.fillStyle = A; ctx.globalAlpha = 0.85;
      rr(x, gy + gh - vh2, gw, Math.max(1, vh2), 3); ctx.fill(); ctx.globalAlpha = 1;
      T(b[0], x + gw / 2, gy + gh + bh * 0.055, Math.round(w * 0.019), INK3, "center");
    });
    ctx.strokeStyle = LINE; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(bx, gy + gh); ctx.lineTo(bx + bw, gy + gh); ctx.stroke();

    const p = easeIO(clamp((lo - 1.2) / 0.7, 0, 1));
    if (p > 0) {
      ctx.globalAlpha = p;
      const cy = by + bh * 0.68;
      ctx.fillStyle = SURF; ctx.strokeStyle = LINE; rr(bx, cy, bw, bh * 0.20, 5); ctx.fill(); ctx.stroke();
      dot(bx + 20, cy + bh * 0.10, 7, amber);
      T("Gold badge", bx + 36, cy + bh * 0.09, Math.round(w * 0.024), INK, "left", 600);
      T("resolution rate 87%", bx + bw - 12, cy + bh * 0.11, Math.round(w * 0.022), green, "right");
      T("1,240 civic points", bx + 36, cy + bh * 0.155, Math.round(w * 0.02), INK3);
      ctx.globalAlpha = 1;
    }
    if (lo > 1.5) {
      T("Ranked #3 of 48 municipal zones nationwide", bx + 8, by + bh * 0.935, Math.round(w * 0.019), green, "left", 500);
    }
  }

  ctx.restore();
};

/* ============================================================
   BHOOMISHEBA — land records: query, mutate, audit, issue.
   0 parcel lookup  1 e-mutation  2 cross-audit  3 QR e-Dakhila
============================================================ */
REEL_DRAW.bhoomisheba = function (g) {
  const { ctx, w, h, t, PAD, A, INK, INK2, INK3, LINE, SURF, PAPER, green, amber, red, T, rr, dot, clamp, ease, easeIO } = g;
  const { idx, lo, sl } = scenes(g, 4, 2.5);

  ctx.fillStyle = SURF; ctx.strokeStyle = LINE; ctx.lineWidth = 1;
  rr(PAD, PAD, w - 2 * PAD, h * 0.12, 5); ctx.fill(); ctx.stroke();
  dot(PAD + 15, PAD + h * 0.06, 5, A);
  T("BhoomiSheba · land records", PAD + 28, PAD + h * 0.078, Math.round(w * 0.025), INK, "left", 600);
  T(["parcel", "e-mutation", "cross-audit", "e-Dakhila"][idx], w - PAD - 10, PAD + h * 0.078, Math.round(w * 0.022), INK3, "right");

  const bx = PAD, by = PAD + h * 0.16, bw = w - 2 * PAD, bh = h - by - PAD - h * 0.06;
  ctx.save(); ctx.translate(sl, 0);

  /* deterministic cadastral parcels — irregular plots, not a grid */
  const parcels = [
    [0.04, 0.06, 0.28, 0.3], [0.34, 0.04, 0.3, 0.22], [0.66, 0.08, 0.3, 0.26],
    [0.06, 0.4, 0.24, 0.28], [0.32, 0.3, 0.32, 0.34], [0.68, 0.38, 0.26, 0.3],
    [0.04, 0.72, 0.3, 0.24], [0.38, 0.68, 0.26, 0.28], [0.68, 0.72, 0.28, 0.24],
  ];
  const TARGET = 4;

  if (idx === 0) {
    /* PostGIS spatial query lands on one plot */
    const mh = bh * 0.80;
    ctx.fillStyle = PAPER; ctx.strokeStyle = LINE; rr(bx, by, bw, mh, 5); ctx.fill(); ctx.stroke();
    bodyClip(g, bx, by, bw, mh);
    parcels.forEach((p, i) => {
      const x = bx + p[0] * bw, y = by + p[1] * mh, pw = p[2] * bw, ph = p[3] * mh;
      const hit = i === TARGET && lo > 0.9;
      ctx.fillStyle = hit ? "rgba(31,111,235,.2)" : SURF;
      ctx.strokeStyle = hit ? A : LINE; ctx.lineWidth = hit ? 2 : 1;
      rr(x, y, pw, ph, 3); ctx.fill(); ctx.stroke();
      T("P-" + (101 + i), x + 6, y + ph * 0.36, Math.round(w * 0.018), hit ? A : INK3);
    });
    /* sweeping query radius */
    const tp = parcels[TARGET];
    const cx = bx + (tp[0] + tp[2] / 2) * bw, cy = by + (tp[1] + tp[3] / 2) * mh;
    const rad = (0.15 + 0.55 * clamp(lo / 1.0, 0, 1)) * bw * 0.5;
    ctx.strokeStyle = A; ctx.globalAlpha = 0.5 + 0.5 * Math.sin(t * 3);
    ctx.lineWidth = 1.4; ctx.setLineDash([4, 4]);
    ctx.beginPath(); ctx.arc(cx, cy, rad, 0, 7); ctx.stroke();
    ctx.setLineDash([]); ctx.globalAlpha = 1;
    ctx.restore();
    T("ST_Intersects( parcel, geom )", bx + 8, by + bh * 0.925, Math.round(w * 0.020), INK3, "left", 500);
    if (lo > 1.2) T("P-105 · 0.42 acre", bx + bw - 8, by + bh * 0.925, Math.round(w * 0.020), A, "right", 600);

  } else if (idx === 1) {
    /* e-mutation transfer workflow */
    T("e-Mutation · P-105", bx + 4, by + h * 0.045, Math.round(w * 0.026), INK, "left", 600);
    /* from -> to owner */
    const cardH = bh * 0.2, cw = bw * 0.4;
    const p1 = easeIO(clamp(lo / 0.6, 0, 1));
    ctx.globalAlpha = p1;
    ctx.fillStyle = SURF; ctx.strokeStyle = LINE; rr(bx, by + bh * 0.12, cw, cardH, 5); ctx.fill(); ctx.stroke();
    T("from", bx + 10, by + bh * 0.19, Math.round(w * 0.018), INK3);
    T("Abdul Karim", bx + 10, by + bh * 0.27, Math.round(w * 0.023), INK, "left", 600);
    ctx.globalAlpha = 1;
    const p2 = easeIO(clamp((lo - 0.5) / 0.6, 0, 1));
    if (p2 > 0) {
      ctx.globalAlpha = p2;
      ctx.fillStyle = SURF; ctx.strokeStyle = A; rr(bx + bw - cw, by + bh * 0.12, cw, cardH, 5); ctx.fill(); ctx.stroke();
      T("to", bx + bw - cw + 10, by + bh * 0.19, Math.round(w * 0.018), INK3);
      T("Rahima Begum", bx + bw - cw + 10, by + bh * 0.27, Math.round(w * 0.023), INK, "left", 600);
      /* arrow */
      const ay = by + bh * 0.22, ax0 = bx + cw + 8, ax1 = bx + bw - cw - 8;
      ctx.strokeStyle = A; ctx.lineWidth = 1.6; ctx.globalAlpha = p2;
      ctx.beginPath(); ctx.moveTo(ax0, ay); ctx.lineTo(ax1, ay); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(ax1, ay); ctx.lineTo(ax1 - 6, ay - 4); ctx.lineTo(ax1 - 6, ay + 4); ctx.closePath();
      ctx.fillStyle = A; ctx.fill();
      ctx.globalAlpha = 1;
    }
    /* approval chain */
    const chain = ["Application", "Tahsil review", "AC(Land) approval", "Khatian updated"];
    chain.forEach((c, i) => {
      const p = clamp((lo - 0.8 - i * 0.28) / 0.35, 0, 1);
      if (p <= 0) return;
      const y = by + bh * 0.40 + i * bh * 0.14;
      ctx.globalAlpha = p;
      const done = lo > 0.9 + i * 0.28 + 0.3;
      dot(bx + 8, y + bh * 0.05, 5, done ? green : LINE);
      if (done) {
        ctx.strokeStyle = "#fff"; ctx.lineWidth = 1.4;
        ctx.beginPath(); ctx.moveTo(bx + 5.5, y + bh * 0.05); ctx.lineTo(bx + 7.5, y + bh * 0.068); ctx.lineTo(bx + 11, y + bh * 0.03); ctx.stroke();
      }
      T(c, bx + 22, y + bh * 0.075, Math.round(w * 0.023), done ? INK : INK3);
      ctx.globalAlpha = 1;
    });
    if (lo > 1.4) {
      T("AC(Land) signed with government digital certificate", bx + 8, by + bh * 0.925, Math.round(w * 0.020), green, "left", 500);
    }

  } else if (idx === 2) {
    /* multi-source cross-audit */
    T("Cross-audit · 4 sources", bx + 4, by + h * 0.045, Math.round(w * 0.026), INK, "left", 600);
    const srcs = [["RS Khatian", "0.42 ac", true], ["BS Khatian", "0.42 ac", true], ["Mouza map", "0.42 ac", true], ["Mutation reg.", "0.38 ac", false]];
    srcs.forEach((s, i) => {
      const p = easeIO(clamp((lo - 0.2 - i * 0.22) / 0.4, 0, 1));
      if (p <= 0) return;
      const y = by + bh * 0.10 + i * bh * 0.15;
      ctx.globalAlpha = p;
      ctx.fillStyle = SURF; ctx.strokeStyle = s[2] ? LINE : red; ctx.lineWidth = s[2] ? 1 : 1.5;
      rr(bx, y, bw, bh * 0.12, 4); ctx.fill(); ctx.stroke();
      dot(bx + 14, y + bh * 0.06, 4.5, s[2] ? green : red);
      T(s[0], bx + 28, y + bh * 0.08, Math.round(w * 0.023), INK);
      T(s[1], bx + bw - 12, y + bh * 0.08, Math.round(w * 0.023), s[2] ? INK2 : red, "right", 600);
      ctx.globalAlpha = 1;
    });
    if (lo > 1.4) {
      ctx.globalAlpha = easeIO(clamp((lo - 1.4) / 0.5, 0, 1));
      ctx.fillStyle = "rgba(226,59,90,.1)"; ctx.strokeStyle = red;
      rr(bx, by + bh * 0.72, bw, bh * 0.12, 4); ctx.fill(); ctx.stroke();
      T("discrepancy flagged for review", bx + 12, by + bh * 0.795, Math.round(w * 0.022), red);
      ctx.globalAlpha = 1;
    }
    if (lo > 1.6) {
      T("Audit rule: area delta > 0.02 ac triggers automatic tribunal hold", bx + 8, by + bh * 0.925, Math.round(w * 0.020), INK3, "left", 500);
    }

  } else {
    /* QR-verified e-Dakhila (rent receipt) */
    T("e-Dakhila issued", bx + 4, by + h * 0.045, Math.round(w * 0.026), INK, "left", 600);
    const dw = bw * 0.60, dx = bx, dh = bh * 0.76, dy = by + bh * 0.09;
    ctx.fillStyle = PAPER; ctx.strokeStyle = LINE; rr(dx, dy, dw, dh, 5); ctx.fill(); ctx.stroke();
    const lines = [["Holding", "P-105"], ["Owner", "Rahima Begum"], ["Area", "0.42 acre"], ["Year", "1432 BS"], ["Paid", "৳ 1,150"]];
    lines.forEach((l, i) => {
      const p = clamp((lo - 0.2 - i * 0.15) / 0.3, 0, 1);
      if (p <= 0) return;
      ctx.globalAlpha = p;
      const y = dy + dh * 0.16 + i * dh * 0.16;
      T(l[0], dx + 12, y, Math.round(w * 0.019), INK3);
      T(l[1], dx + dw - 12, y, Math.round(w * 0.022), i === 4 ? green : INK, "right", i === 4 ? 600 : 400);
      ctx.globalAlpha = 1;
    });
    /* QR renders block by block, then verifies */
    const qp = clamp((lo - 0.6) / 0.9, 0, 1);
    const qs = bw * 0.28, qx = bx + bw - qs, qy = dy + dh * 0.08;
    ctx.fillStyle = SURF; ctx.strokeStyle = LINE; rr(qx - 8, qy - 8, qs + 16, qs + 16, 5); ctx.fill(); ctx.stroke();
    const cells = 9, cs = qs / cells;
    ctx.fillStyle = INK;
    for (let r = 0; r < cells; r++) for (let c = 0; c < cells; c++) {
      if ((r * cells + c) / (cells * cells) > qp) continue;
      const corner = (r < 3 && c < 3) || (r < 3 && c > cells - 4) || (r > cells - 4 && c < 3);
      const sd = Math.sin((r * 13.7 + c * 7.3)) * 1000;
      if (corner ? (r === 0 || c === 0 || r === 2 || c === 2 || r === cells - 1 || c === cells - 1 || (r === 1 && c === 1)) : (sd - Math.floor(sd)) > 0.48) {
        ctx.fillRect(qx + c * cs, qy + r * cs, cs - 1, cs - 1);
      }
    }
    if (lo > 1.8) {
      dot(qx + qs / 2, qy + qs + bh * 0.12, 7, green);
      ctx.strokeStyle = "#fff"; ctx.lineWidth = 1.8;
      ctx.beginPath(); ctx.moveTo(qx + qs / 2 - 3.5, qy + qs + bh * 0.12);
      ctx.lineTo(qx + qs / 2 - 1, qy + qs + bh * 0.135); ctx.lineTo(qx + qs / 2 + 3.5, qy + qs + bh * 0.102); ctx.stroke();
      T("verified", qx + qs / 2, qy + qs + bh * 0.20, Math.round(w * 0.021), green, "center");
    }
    if (lo > 1.8) {
      T("Cryptographically verifiable rent receipt · BDT 1,150 paid", bx + 8, by + bh * 0.935, Math.round(w * 0.020), green, "left", 500);
    }
  }

  ctx.restore();
};

/* generic fallback — only reached if a project names a reel that doesn't exist */
REEL_DRAW.generic = function (g) {
  const { ctx, w, h, t, PAD, A, INK3, LINE, SURF, T, rr, clamp, easeIO } = g;
  const { idx, lo } = scenes(g, 2, 2.4);
  ctx.fillStyle = SURF; ctx.strokeStyle = LINE; rr(PAD, PAD, w - 2 * PAD, h - 2 * PAD - h * 0.06, 5); ctx.fill(); ctx.stroke();
  const bars = 5;
  for (let i = 0; i < bars; i++) {
    const p = easeIO(clamp((lo - i * 0.18) / 0.5, 0, 1));
    const y = PAD + h * 0.14 + i * h * 0.13;
    ctx.fillStyle = i === idx ? A : LINE; ctx.globalAlpha = 0.8;
    rr(PAD + 14, y, (w - 2 * PAD - 28) * (0.3 + 0.6 * p), h * 0.07, 3); ctx.fill();
    ctx.globalAlpha = 1;
  }
};

/* ============================================================
   EMG ALS SCREENING — raw signal in, explained verdict out.
   Four scenes mirroring the real pipeline:
     0 intake  1 1-D CNN + Grad-CAM  2 Florence-2 VLM  3 XGBoost fusion
============================================================ */
REEL_DRAW.signal = function (g) {
  const { ctx, w, h, t, PAD, A, INK, INK2, INK3, LINE, SURF, green, amber, red, T, rr, dot, clamp, ease, easeIO } = g;
  const { idx, lo, sl } = scenes(g, 4, 2.4);

  /* header (persistent) */
  ctx.fillStyle = SURF; ctx.strokeStyle = LINE; ctx.lineWidth = 1;
  rr(PAD, PAD, w - 2 * PAD, h * 0.12, 5); ctx.fill(); ctx.stroke();
  dot(PAD + 14, PAD + h * 0.06, 4.5, A);
  T("EMG · ALS SCREENING", PAD + 26, PAD + h * 0.078, Math.round(w * 0.026), INK, "left", 600);
  T(["intake", "1-D CNN", "Florence-2", "fusion"][idx], w - PAD - 10, PAD + h * 0.078, Math.round(w * 0.022), INK3, "right");

  const bx = PAD, by = PAD + h * 0.16, bw = w - 2 * PAD, bh = h - by - PAD - h * 0.06;

  /* shared EMG trace — deterministic, so every frame is reproducible */
  const emg = (i, n, burst) => {
    const u = i / n;
    let v = Math.sin(u * 74 + t * 2.2) * 0.34
          + Math.sin(u * 151 - t * 1.4) * 0.2
          + Math.sin(u * 311 + t * 3.1) * 0.12;
    if (burst > 0) {
      // pathological burst window: denser, higher amplitude
      const d = Math.exp(-Math.pow((u - burst) * 7, 2));
      v += d * (Math.sin(u * 620 + t * 9) * 0.55 + Math.sin(u * 990 - t * 6) * 0.3);
    }
    return v;
  };
  const drawTrace = (x, y, ww, hh, burst, col, lw) => {
    ctx.strokeStyle = col; ctx.lineWidth = lw || 1.4; ctx.beginPath();
    const N = Math.max(40, Math.round(ww / 2));
    for (let i = 0; i <= N; i++) {
      const px = x + (i / N) * ww, py = y + hh / 2 - emg(i, N, burst) * hh * 0.42;
      i ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
    }
    ctx.stroke();
  };

  ctx.save(); ctx.translate(sl, 0);

  if (idx === 0) {
    /* ---- intake: drag-and-drop .npy, waveform streams in ---- */
    ctx.fillStyle = SURF; ctx.strokeStyle = LINE; rr(bx, by, bw, bh * 0.3, 5); ctx.fill();
    ctx.setLineDash([5, 4]); ctx.strokeStyle = A; ctx.stroke(); ctx.setLineDash([]);
    T("drop EMG recording  ·  .npy / .csv", bx + bw / 2, by + bh * 0.18, Math.round(w * 0.026), INK2, "center");

    const p = easeIO(clamp((lo - 0.5) / 1.2, 0, 1));
    if (p > 0) {
      const ty = by + bh * 0.38, th = bh * 0.44;
      ctx.fillStyle = SURF; ctx.strokeStyle = LINE; rr(bx, ty, bw, th, 5); ctx.fill(); ctx.stroke();
      bodyClip(g, bx, ty, bw, th);
      drawTrace(bx + 6, ty, (bw - 12) * p, th, 0, A, 1.4);
      ctx.restore();
      T("bandpass 20–450 Hz · z-score", bx + 8, by + bh * 0.925, Math.round(w * 0.020), INK3, "left", 500);
      T(Math.round(p * 4096) + " samples", bx + bw - 8, by + bh * 0.925, Math.round(w * 0.020), INK3, "right", 500);
    }

  } else if (idx === 1) {
    /* ---- 1-D CNN + Grad-CAM anomaly window ---- */
    const ty = by, th = bh * 0.56;
    ctx.fillStyle = SURF; ctx.strokeStyle = LINE; rr(bx, ty, bw, th, 5); ctx.fill(); ctx.stroke();
    bodyClip(g, bx, ty, bw, th);
    drawTrace(bx + 6, ty, bw - 12, th, 0.62, INK2, 1.3);

    /* Grad-CAM heat band sweeping onto the pathological window */
    const p = easeIO(clamp((lo - 0.4) / 1.1, 0, 1));
    if (p > 0) {
      const cw = (bw - 12) * 0.26, cx = bx + 6 + (bw - 12) * 0.62 - cw / 2;
      const grad = ctx.createLinearGradient(cx, 0, cx + cw, 0);
      grad.addColorStop(0, "rgba(226,59,90,0)");
      grad.addColorStop(0.5, "rgba(226,59,90," + (0.3 * p) + ")");
      grad.addColorStop(1, "rgba(226,59,90,0)");
      ctx.fillStyle = grad; ctx.fillRect(cx, ty, cw, th);
      ctx.strokeStyle = red; ctx.lineWidth = 1.2; ctx.globalAlpha = p;
      ctx.strokeRect(cx, ty + 2, cw, th - 4); ctx.globalAlpha = 1;
      // recolour only the highlighted window, not the whole recording
      ctx.save(); ctx.beginPath(); ctx.rect(cx, ty, cw, th); ctx.clip();
      drawTrace(bx + 6, ty, bw - 12, th, 0.62, red, 1.6);
      ctx.restore();
    }
    ctx.restore();
    T("1-D Grad-CAM · MUAP instability", bx + 6, ty + th + h * 0.055, Math.round(w * 0.024), INK3);

    /* per-segment energy bars */
    const bars = 14, gw = (bw - (bars - 1) * 3) / bars, byy = ty + th + h * 0.08, bhh = bh - th - h * 0.16;
    for (let i = 0; i < bars; i++) {
      const seg = i / (bars - 1);
      const e = 0.25 + Math.abs(Math.sin(seg * 5 + t)) * 0.3 + Math.exp(-Math.pow((seg - 0.62) * 4, 2)) * 0.6;
      const v = clamp(e, 0.08, 1) * easeIO(clamp((lo - 0.3 - i * 0.04) / 0.4, 0, 1));
      ctx.fillStyle = seg > 0.5 && seg < 0.76 ? red : A;
      ctx.globalAlpha = 0.85;
      rr(bx + i * (gw + 3), byy + bhh * (1 - v), gw, Math.max(1, bhh * v), 2); ctx.fill();
      ctx.globalAlpha = 1;
    }
    if (lo > 1.4) {
      T("High-activation segment localized to motor unit action potential", bx + 8, by + bh * 0.925, Math.round(w * 0.020), red, "left", 500);
    }

  } else if (idx === 2) {
    /* ---- Florence-2 vision-language model over the spectrogram ---- */
    T("Florence-2 VLM · raster + spectrogram", bx + 4, by + h * 0.05, Math.round(w * 0.026), INK, "left", 600);
    const sy = by + h * 0.08, sh = bh * 0.50;
    ctx.fillStyle = SURF; ctx.strokeStyle = LINE; rr(bx, sy, bw, sh, 5); ctx.fill(); ctx.stroke();
    bodyClip(g, bx, sy, bw, sh);
    /* spectrogram tiles fading in column by column */
    const cols = 26, rows = 9, cwid = (bw - 8) / cols, rh = (sh - 8) / rows;
    for (let c = 0; c < cols; c++) {
      const cp = clamp((lo - 0.2 - c * 0.035) / 0.3, 0, 1);
      if (cp <= 0) continue;
      for (let r = 0; r < rows; r++) {
        const u = c / cols, band = 1 - r / rows;
        let e = Math.abs(Math.sin(u * 9 + band * 4 + t * 0.6)) * band;
        e += Math.exp(-Math.pow((u - 0.62) * 5, 2)) * band * 0.8;
        e = clamp(e, 0, 1);
        ctx.globalAlpha = cp * (0.12 + e * 0.8);
        ctx.fillStyle = e > 0.62 ? red : e > 0.36 ? amber : A;
        ctx.fillRect(bx + 4 + c * cwid, sy + 4 + r * rh, cwid - 1, rh - 1);
      }
    }
    ctx.globalAlpha = 1;
    ctx.restore();

    /* the model's caption, typed out */
    const cap = "dense interference pattern, reduced recruitment";
    const n = Math.floor(clamp((lo - 0.9) / 1.0, 0, 1) * cap.length);
    const chH = bh * 0.18;
    ctx.fillStyle = SURF; ctx.strokeStyle = LINE; rr(bx, sy + sh + h * 0.03, bw, chH, 5); ctx.fill(); ctx.stroke();
    T("“" + cap.slice(0, n) + (n < cap.length && Math.floor(t * 3) % 2 ? "▏" : "") + "”",
      bx + 12, sy + sh + h * 0.10, Math.round(w * 0.022), INK2);
    if (lo > 1.7) {
      T("Zero-shot prompt: <CAPTION_TO_PHRASE_GROUNDING> on STFT matrix", bx + 8, by + bh * 0.925, Math.round(w * 0.020), INK3, "left", 500);
    }

  } else {
    /* ---- XGBoost meta-learner: SHAP bars, then the calibrated verdict ---- */
    T("XGBoost meta-learner · Tree SHAP", bx + 4, by + h * 0.05, Math.round(w * 0.026), INK, "left", 600);
    const feats = [
      ["CNN probability", 0.92, red],
      ["VLM embedding", 0.74, red],
      ["segment energy", 0.53, amber],
      ["spectral entropy", 0.31, A],
    ];
    feats.forEach((f, i) => {
      const y = by + bh * 0.06 + i * bh * 0.14;
      const p = easeIO(clamp((lo - 0.25 - i * 0.22) / 0.5, 0, 1));
      T(f[0], bx + 4, y + bh * 0.09, Math.round(w * 0.022), INK3);
      const tw = bw * 0.46, tx = bx + bw - tw;
      ctx.fillStyle = LINE; rr(tx, y + bh * 0.035, tw, bh * 0.07, 3); ctx.fill();
      ctx.fillStyle = f[2]; rr(tx, y + bh * 0.035, Math.max(1, tw * f[1] * p), bh * 0.07, 3); ctx.fill();
    });

    const vp = easeIO(clamp((lo - 1.5) / 0.7, 0, 1));
    if (vp > 0) {
      const vy = by + bh * 0.69, vh = bh * 0.18;
      ctx.globalAlpha = vp;
      ctx.fillStyle = SURF; ctx.strokeStyle = red; ctx.lineWidth = 1.4;
      rr(bx, vy, bw, vh, 5); ctx.fill(); ctx.stroke();
      dot(bx + 16, vy + vh / 2, 5, red);
      T("ALS-consistent  ·  confidence 0." + Math.round(87 * vp + 6), bx + 30, vy + vh / 2 + h * 0.016,
        Math.round(w * 0.025), INK, "left", 600);
      T("review required", bx + bw - 12, vy + vh / 2 + h * 0.016, Math.round(w * 0.021), INK3, "right");
      ctx.globalAlpha = 1;
    }
    if (lo > 1.6) {
      T("Fused multi-modal confidence: CNN + VLM + clinical features", bx + 8, by + bh * 0.925, Math.round(w * 0.020), INK3, "left", 500);
    }
  }

  ctx.restore();
};

/* ============================================================
   URA-SHREE — own from-scratch LLM, its chatbot, and the agent features.
     0 the model itself: byte-level BPE + 11.3M decoder trained from zero
     1 the chatbot: local streaming chat, no external API
     2 the agent: tool loop, AST index, human approval gate
     3 the feature deck: sandbox, shell, Time Machine, provider seam
============================================================ */
REEL_DRAW.urashree = function (g) {
  const { ctx, w, h, t, PAD, A, AS, INK, INK2, INK3, LINE, SURF, PAPER, green, amber, red, T, rr, dot, clamp, ease, easeIO } = g;
  const { idx, lo, sl } = scenes(g, 4, 3);
  const F = (k) => Math.round(w * k);

  /* persistent chrome */
  ctx.fillStyle = SURF; ctx.strokeStyle = LINE; ctx.lineWidth = 1;
  rr(PAD, PAD, w - 2 * PAD, h * 0.12, 5); ctx.fill(); ctx.stroke();
  dot(PAD + 15, PAD + h * 0.06, 5, A);
  T("URA-Shree · own model + agent", PAD + 28, PAD + h * 0.078, F(0.025), INK, "left", 600);
  T(["Trained from scratch", "Chatbot", "Agent loop", "Features"][idx], w - PAD - 12, PAD + h * 0.078, F(0.022), INK3, "right");

  const bx = PAD, by = PAD + h * 0.16, bw = w - 2 * PAD, bh = h - by - PAD - h * 0.06;
  const foot = (s, col) => {
    if (lo > 1.3) {
      const fs = Math.min(F(0.019), Math.max(9, Math.floor((bw - 16) / (s.length * 0.58))));
      T(s, bx + 8, by + bh * 0.925, fs, col || green, "left", 500);
    }
  };
  const card = (x, y, cw, ch, on) => { ctx.fillStyle = on ? AS : SURF; ctx.strokeStyle = on ? A : LINE; ctx.lineWidth = on ? 1.5 : 1; rr(x, y, cw, ch, 5); ctx.fill(); ctx.stroke(); ctx.lineWidth = 1; };
  ctx.save(); ctx.translate(sl, 0);

  if (idx === 0) {
    /* ---- Scene 0: the model, built and trained from zero ---- */
    T("My Own Model · Not a Fine-Tune", bx + 4, by + h * 0.045, F(0.026), INK, "left", 600);
    T("PyTorch · 11.3M params", bx + bw - 4, by + h * 0.045, F(0.02), A, "right", 500);

    /* raw text -> BPE tokens -> ids */
    const tokY = by + bh * 0.08, tokH = bh * 0.22;
    card(bx, tokY, bw, tokH);
    T("Custom byte-level BPE · 4096 vocab · lossless round-trip", bx + 12, tokY + tokH * 0.30, F(0.018), INK3);
    const toks = [["def", "104"], ["agent", "819"], ["_step", "377"], ["(", "42"], ["ctx", "302"]];
    const tGap = 6, tBoxW = (bw - 24 - (toks.length - 1) * tGap) / toks.length;
    toks.forEach((tk, i) => {
      const p = clamp((lo - 0.1 - i * 0.1) / 0.3, 0, 1); if (p <= 0) return;
      ctx.globalAlpha = p;
      const tx = bx + 12 + i * (tBoxW + tGap), ty = tokY + tokH * 0.44;
      const on = Math.floor(t * 3) % toks.length === i;
      ctx.fillStyle = on ? AS : PAPER; ctx.strokeStyle = on ? A : LINE;
      rr(tx, ty, tBoxW, tokH * 0.44, 4); ctx.fill(); ctx.stroke();
      T(tk[0], tx + tBoxW / 2, ty + tokH * 0.21, F(0.019), INK, "center", 500);
      T(tk[1], tx + tBoxW / 2, ty + tokH * 0.37, F(0.016), A, "center");
      ctx.globalAlpha = 1;
    });

    /* left: architecture written by hand · right: training loss actually descending */
    const aY = by + bh * 0.34, aH = bh * 0.49, lw = bw * 0.5, rw = bw - lw - 10, rx = bx + lw + 10;
    card(bx, aY, lw, aH);
    T("Written layer by layer", bx + 12, aY + aH * 0.16, F(0.02), INK, "left", 600);
    [["Decoder blocks", "12 · d_model 384"],
     ["Attention", "8 Q / 2 KV heads (GQA)"],
     ["Positional", "Rotary embeddings (RoPE)"],
     ["FFN", "SwiGLU · dim 1024"],
     ["Decode", "KV cache · 512 ctx"]].forEach((s, i) => {
      const p = clamp((lo - 0.35 - i * 0.12) / 0.3, 0, 1); if (p <= 0) return;
      ctx.globalAlpha = p;
      const sy = aY + aH * (0.32 + i * 0.145);
      T(s[0], bx + 12, sy, F(0.018), INK3);
      T(s[1], bx + lw - 12, sy, F(0.018), INK, "right", 500);
      ctx.globalAlpha = 1;
    });

    card(rx, aY, rw, aH);
    T("Training loss", rx + 12, aY + aH * 0.16, F(0.02), INK, "left", 600);
    const gx = rx + 14, gy = aY + aH * 0.26, gw = rw - 28, gh = aH * 0.48;
    ctx.strokeStyle = LINE; ctx.beginPath(); ctx.moveTo(gx, gy); ctx.lineTo(gx, gy + gh); ctx.lineTo(gx + gw, gy + gh); ctx.stroke();
    const prog = clamp((lo - 0.3) / 1.6, 0, 1);
    const lossAt = (u) => 0.08 + 0.86 * Math.exp(-3.4 * u) + 0.035 * Math.sin(u * 26);
    ctx.strokeStyle = A; ctx.lineWidth = 1.8; ctx.beginPath();
    for (let i = 0; i <= 60; i++) {
      const u = (i / 60) * prog;
      const px = gx + u * gw, py = gy + lossAt(u) * gh * 0.94;
      i ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
    }
    ctx.stroke(); ctx.lineWidth = 1;
    if (prog > 0) dot(gx + prog * gw, gy + lossAt(prog) * gh * 0.94, 3, A);
    T("step " + Math.round(prog * 12000).toLocaleString(), rx + 12, aY + aH * 0.90, F(0.017), INK3, "left");
    T("loss " + lossAt(prog).toFixed(3), rx + rw - 12, aY + aH * 0.90, F(0.017), green, "right", 500);

    foot("Tokenizer, transformer and training loop written from scratch · no pretrained weights");

  } else if (idx === 1) {
    /* ---- Scene 1: the chatbot talking, fully local ---- */
    T("Chatbot · Runs Fully Local", bx + 4, by + h * 0.045, F(0.026), INK, "left", 600);
    T("0 external API calls", bx + bw - 4, by + h * 0.045, F(0.02), green, "right", 600);

    const chY = by + bh * 0.08, chH = bh * 0.54;
    card(bx, chY, bw, chH);

    /* user turn */
    const uw = bw * 0.56, up = easeIO(clamp(lo / 0.35, 0, 1));
    ctx.globalAlpha = up;
    ctx.fillStyle = A; rr(bx + bw - uw - 12, chY + chH * 0.07, uw, chH * 0.22, 6); ctx.fill();
    T("why is my loss stuck at 4.1?", bx + bw - 22, chY + chH * 0.21, F(0.019), "#fff", "right", 500);
    ctx.globalAlpha = 1;

    /* assistant turn, streamed word by word */
    if (lo > 0.45) {
      const words = "Warmup ends at step 200 but cosine decay starts at step 0, so LR is floored. Move decay to after warmup.".split(" ");
      const shown = Math.min(words.length, Math.floor((lo - 0.45) * 14));
      const aw = bw * 0.8, ax = bx + 12, ay = chY + chH * 0.35;
      ctx.fillStyle = PAPER; ctx.strokeStyle = LINE; rr(ax, ay, aw, chH * 0.58, 6); ctx.fill(); ctx.stroke();
      dot(ax + 14, ay + chH * 0.11, 4, A);
      T("URA-Shree", ax + 24, ay + chH * 0.13, F(0.018), INK3, "left", 600);
      const size = F(0.0185), maxChars = Math.max(12, Math.floor((aw - 28) / (size * 0.58)));
      let line = "", row = 0;
      const put = (s, r) => T(s, ax + 14, ay + chH * (0.28 + r * 0.13), size, INK, "left");
      for (let i = 0; i < shown; i++) {
        const next = line ? line + " " + words[i] : words[i];
        if (next.length > maxChars) { put(line, row); row++; line = words[i]; } else line = next;
      }
      if (line) {
        put(line, row);
        if (shown < words.length && Math.floor(t * 3) % 2) {
          ctx.fillStyle = A;
          ctx.fillRect(ax + 16 + ctx.measureText(line).width, ay + chH * (0.28 + row * 0.13) - size * 0.85, 2, size);
        }
      }
    }

    /* live decode meter — card ends at 0.82, leaving ample space before footer at 0.925 */
    const mY = by + bh * 0.65, mH = bh * 0.17;
    card(bx, mY, bw, mH);
    T("model", bx + 16, mY + mH * 0.38, F(0.017), INK3, "left");
    T("ura-shree · 11.3M", bx + 16, mY + mH * 0.78, F(0.020), INK, "left", 600);

    T("decode", bx + bw / 2, mY + mH * 0.38, F(0.017), INK3, "center");
    T(Math.round(38 + 6 * Math.sin(t * 2)) + " tok/s", bx + bw / 2, mY + mH * 0.78, F(0.020), INK, "center", 600);

    T("cost", bx + bw - 16, mY + mH * 0.38, F(0.017), INK3, "right");
    T("$0.00", bx + bw - 16, mY + mH * 0.78, F(0.020), green, "right", 600);

    foot("Weights, tokenizer and inference all on your machine · nothing leaves the laptop");

  } else if (idx === 2) {
    /* ---- Scene 2: agent loop, AST grounding, approval gate ---- */
    T("Autonomous Agent Loop", bx + 4, by + h * 0.045, F(0.026), INK, "left", 600);
    T("auto_approve: false", bx + bw - 4, by + h * 0.045, F(0.02), amber, "right", 600);

    const tools = ["read_file", "ast_index", "grep", "write_patch", "shell"];
    const act = Math.floor(t * 2.2) % tools.length;
    const tw = (bw - 20) / tools.length, tY = by + bh * 0.08, tH = bh * 0.12;
    tools.forEach((tl, i) => {
      const p = clamp((lo - 0.05 - i * 0.08) / 0.25, 0, 1); if (p <= 0) return;
      ctx.globalAlpha = p;
      const tx = bx + 10 + i * tw, on = i === act;
      ctx.fillStyle = on ? A : SURF; ctx.strokeStyle = on ? A : LINE;
      rr(tx + 2, tY, tw - 4, tH, 4); ctx.fill(); ctx.stroke();
      T(tl, tx + tw / 2, tY + tH * 0.66, F(0.017), on ? "#fff" : INK2, "center", on ? 600 : 400);
      ctx.globalAlpha = 1;
    });

    /* AST symbol index — the grounding that stops invented paths */
    const sY = by + bh * 0.23, sH = bh * 0.31;
    card(bx, sY, bw, sH);
    T("AST workspace index", bx + 12, sY + sH * 0.24, F(0.019), INK, "left", 600);
    [["class DecoderTransformer", "model/transformer.py:42", A],
     ["def compute_rope(seq_len)", "model/rope.py:116 · 3 call sites", green]].forEach((s, i) => {
      const p = easeIO(clamp((lo - 0.3 - i * 0.2) / 0.35, 0, 1)); if (p <= 0) return;
      ctx.globalAlpha = p;
      const sy = sY + sH * (0.54 + i * 0.28);
      dot(bx + 16, sy - sH * 0.05, 3.5, s[2]);
      T(s[0], bx + 28, sy, F(0.018), INK, "left", 500);
      T(s[1], bx + bw - 14, sy, F(0.017), s[2], "right", 500);
      ctx.globalAlpha = 1;
    });

    /* approval gate */
    const ok = lo >= 1.7, dY = by + bh * 0.57, dH = bh * 0.27;
    card(bx, dY, bw, dH, ok);
    if (!ok) {
      dot(bx + 18, dY + dH * 0.34, 5, amber);
      T("Allow write_patch on src/agent/sandbox.py?", bx + 32, dY + dH * 0.38, F(0.021), INK, "left", 600);
      T("agent paused until you answer", bx + 32, dY + dH * 0.70, F(0.018), INK3);
      const bwid = bw * 0.18, bhg = dH * 0.44;
      ctx.fillStyle = PAPER; ctx.strokeStyle = LINE; rr(bx + bw - bwid * 2 - 20, dY + dH * 0.28, bwid, bhg, 4); ctx.fill(); ctx.stroke();
      T("Deny", bx + bw - bwid * 1.5 - 20, dY + dH * 0.58, F(0.02), INK3, "center", 500);
      ctx.globalAlpha = 0.85 + 0.15 * Math.sin(t * 6);
      ctx.fillStyle = A; rr(bx + bw - bwid - 10, dY + dH * 0.28, bwid, bhg, 4); ctx.fill();
      ctx.globalAlpha = 1;
      T("Approve ↵", bx + bw - bwid / 2 - 10, dY + dH * 0.58, F(0.02), "#fff", "center", 600);
    } else {
      dot(bx + 20, dY + dH * 0.5, 6, green);
      T("Approved · patch applied", bx + 34, dY + dH * 0.44, F(0.022), green, "left", 600);
      T("snapshot taken before the write", bx + 34, dY + dH * 0.74, F(0.018), INK2);
    }

    foot("Every edit grounded in the real AST and gated on a human yes");

  } else {
    /* ---- Scene 3: what it ships with ---- */
    T("What It Ships With", bx + 4, by + h * 0.045, F(0.026), INK, "left", 600);
    T("one workspace · one agent", bx + bw - 4, by + h * 0.045, F(0.02), INK3, "right");

    const feats = [
      ["Own LLM", "11.3M decoder, trained from zero", A],
      ["Local chatbot", "streaming, no API key needed", green],
      ["Agent loop", "plan → tool → observe → repeat", A],
      ["Safe sandbox", "approval gate on every mutation", amber],
      ["Persistent shell", "one venv across the session", green],
      ["Time Machine", "SHA-256 snapshots, instant rollback", A],
    ];
    const cw = (bw - 10) / 2, ch = (bh * 0.69 - 16) / 3;
    feats.forEach((f, i) => {
      const p = easeIO(clamp((lo - 0.1 - i * 0.11) / 0.35, 0, 1)); if (p <= 0) return;
      ctx.globalAlpha = p;
      const cx0 = bx + (i % 2) * (cw + 10), cy0 = by + bh * 0.09 + Math.floor(i / 2) * (ch + 8);
      card(cx0, cy0, cw, ch);
      dot(cx0 + 14, cy0 + ch * 0.36, 4, f[2]);
      T(f[0], cx0 + 26, cy0 + ch * 0.42, F(0.020), INK, "left", 600);
      T(f[1], cx0 + 26, cy0 + ch * 0.76, F(0.0165), INK3);
      ctx.globalAlpha = 1;
    });

    foot("Built solo end to end · PyTorch model, FastAPI backend, React 19 client");
  }

  ctx.restore();
};

/* alias keys for robustness */
REEL_DRAW["ura-shree"] = REEL_DRAW.urashree;
REEL_DRAW["ura-shree-agent"] = REEL_DRAW.urashree;


Object.assign(window, { ProjectReel, REEL_DRAW });

