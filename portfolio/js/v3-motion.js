/* ============================================================
   v3 MOTION — one rAF loop, compositor-only writes.

   Invariants:
     - Per-frame writes touch `transform` and `opacity` only. Nothing in the
       loop writes width/height/top/left/box-shadow.
     - Layout reads (getBoundingClientRect) are batched ahead of writes inside
       a frame, and cached across frames where the value can't change.
     - Every effect is classified against prefers-reduced-motion:
         Tier 1 removed   : smooth scroll, parallax, 3D tilt, marquee, aurora,
                            horizontal pin, sticky-stack scale
         Tier 2 softened  : reveals become a 160ms opacity fade, no travel
         Tier 3 kept      : counters, caret, live dots, progress bar
     - The preference is read live; toggling it in the OS takes effect without
       a reload.
============================================================ */
(function () {
  "use strict";

  const M = {};
  const reduceMQ = matchMedia("(prefers-reduced-motion: reduce)");
  /* mirrors the media query that turns the sticky work-stack on in
     v3-sections.css — the two must agree or the JS animates panels the CSS
     never pinned. */
  const stackMQ = matchMedia("(min-width: 981px) and (min-height: 700px)");
  const fine = matchMedia("(hover:hover) and (pointer:fine)").matches;

  let started = false;
  let lenis = null;
  let revealItems = [];
  let marqueePaused = false;
  const cur = { rx: innerWidth / 2, ry: innerHeight / 2, hot: false, down: false, el: null };

  const mouse = { x: innerWidth / 2, y: innerHeight / 2, has: false };
  const vp = { w: innerWidth, h: innerHeight };

  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const reduced = () => reduceMQ.matches;

  addEventListener("pointermove", (e) => {
    mouse.x = e.clientX; mouse.y = e.clientY; mouse.has = true;
  }, { passive: true });

  /* ---------- init ---------- */
  M.init = function () {
    if (started) return; started = true;
    runLoader(() => {
      setupLenis();
      setupReveals();
      setupCounters();
      setupMagnetic();
      setupAurora();
      setupMarqueeControl();
      setupCursor();
      layout();
      loopStart();
      addEventListener("resize", onResize, { passive: true });
      addEventListener("orientationchange", () => setTimeout(() => layout(true), 120));
      [200, 600, 1200].forEach((d) => setTimeout(() => layout(true), d));
      if (document.fonts) document.fonts.ready.then(() => layout(true));
      reduceMQ.addEventListener("change", onReduceChange);
    });
  };

  /* Toggling the OS setting fires no reload — react to it. */
  function onReduceChange() {
    if (reduced()) {
      if (lenis) { lenis.destroy(); lenis = null; window.__lenis = null; }
      resetStack(true);
      revealItems.forEach(setShown);
    } else if (!lenis) {
      setupLenis();
    }
    layout(true);
  }

  /* ---------- loader ---------- */
  function runLoader(done) {
    const loader = document.querySelector(".loader");
    if (!loader) { done(); return; }
    const lines = document.querySelectorAll(".loader-name span");
    const bar = document.querySelector(".loader-bar i");
    const pct = document.querySelector(".loader-pct .num");

    if (reduced()) {                       // Tier 1: skip the reveal choreography
      document.body.classList.remove("loading");
      done();
      loader.remove();
      return;
    }

    lines.forEach((l, i) => {
      l.style.transition = "transform .8s var(--ease-out)";
      l.style.transitionDelay = (i * 0.07 + 0.08) + "s";
      requestAnimationFrame(() => { l.style.transform = "none"; });
    });

    let p = 0;
    const iv = setInterval(() => {
      p += Math.random() * 16 + 8;
      if (p >= 100) { p = 100; clearInterval(iv); setTimeout(exit, 320); }
      /* scaleX, not width/right — the bar is composited */
      if (bar) bar.style.transform = `scaleX(${p / 100})`;
      if (pct) pct.textContent = String(Math.floor(p)).padStart(3, "0");
    }, 90);

    function exit() {
      document.body.classList.remove("loading");
      done();                              // arm reveals while still covered
      loader.style.transition = "transform .8s cubic-bezier(.76,0,.24,1)";
      loader.style.transform = "translateY(-100%)";
      setTimeout(() => loader.remove(), 820);
    }
  }

  /* ---------- smooth scroll (Tier 1 — not instantiated when reduced) ---------- */
  function setupLenis() {
    if (reduced() || typeof Lenis === "undefined") return;
    lenis = new Lenis({
      duration: 1.05,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });
    window.__lenis = lenis;
  }

  /* ---------- reveals ---------- */
  const TRAVEL = 28;                       // px; 0 when reduced
  const MASK_TRAVEL = 105;                 // %

  function setHidden(it) {
    const soft = reduced();
    for (const t of it.targets) {
      if (it.mask && !soft) { t.style.transform = `translateY(${MASK_TRAVEL}%)`; }
      else { t.style.opacity = "0"; if (!soft) t.style.transform = `translateY(${TRAVEL}px)`; }
    }
  }
  function setProgress(it, p) {
    const e = 1 - Math.pow(1 - p, 3);      // easeOutCubic
    const soft = reduced();
    for (const t of it.targets) {
      if (it.mask && !soft) { t.style.transform = `translateY(${(1 - e) * MASK_TRAVEL}%)`; }
      else {
        t.style.opacity = String(e);
        if (!soft) t.style.transform = `translateY(${(1 - e) * TRAVEL}px)`;
      }
    }
  }
  function setShown(it) {
    for (const t of it.targets) {
      t.style.opacity = "";
      t.style.transform = "";
      t.style.willChange = "";             // release the layer when idle
    }
    it.state = "done";
  }

  function setupReveals() {
    const els = [...document.querySelectorAll("[data-rv], .mask")];
    revealItems = els.map((el) => {
      const mask = el.classList.contains("mask");
      return {
        el, mask,
        targets: mask ? [...el.children] : [el],
        delay: (parseInt(el.getAttribute("data-d"), 10) || 0) * 70,
        state: "hidden", start: 0,
      };
    });
    revealItems.forEach(setHidden);
    // safety net: nothing stays invisible, whatever happens to the loop
    setTimeout(() => revealItems.forEach((it) => { if (it.state !== "done") setShown(it); }), 4000);
  }

  /* ---------- counters (Tier 3 — kept) ---------- */
  function setupCounters() {
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (!e.isIntersecting) return;
      io.unobserve(e.target);
      const el = e.target;
      const end = parseFloat(el.dataset.count);
      const dec = el.dataset.dec | 0;
      if (reduced()) { el.textContent = end.toFixed(dec); return; }
      const t0 = performance.now(), dur = 1400;
      (function tick(now) {
        const k = Math.min(1, (now - t0) / dur);
        el.textContent = (end * (1 - Math.pow(1 - k, 3))).toFixed(dec);
        if (k < 1) requestAnimationFrame(tick);
      })(t0);
    }), { threshold: 0.6 });
    document.querySelectorAll("[data-count]").forEach((el) => io.observe(el));
  }

  /* ---------- magnetic buttons (Tier 1 when reduced) ---------- */
  function setupMagnetic() {
    if (!fine) return;
    document.querySelectorAll("[data-mag]").forEach((el) => {
      let rect = null;
      el.addEventListener("pointerenter", () => {
        if (reduced()) return;
        rect = el.getBoundingClientRect();   // read once per hover, not per move
        el.style.willChange = "transform";
      });
      el.addEventListener("pointermove", (e) => {
        if (reduced() || !rect) return;
        const dx = (e.clientX - rect.left - rect.width / 2) * 0.22;
        const dy = (e.clientY - rect.top - rect.height / 2) * 0.3;
        el.style.transform = `translate(${dx}px,${dy}px)`;
      });
      el.addEventListener("pointerleave", () => {
        rect = null;
        el.style.transition = "transform var(--dur-ui) var(--ease-out)";
        el.style.transform = "";
        setTimeout(() => { el.style.transition = ""; el.style.willChange = ""; }, 240);
      });
    });
  }

  /* ---------- aurora wash (Tier 1 when reduced) ---------- */
  function setupAurora() {
    const c = document.querySelector(".aurora");
    if (!c) return;
    const ctx = c.getContext("2d");
    const SCALE = 0.34;                    // render small, upscale — free blur
    let w, h;

    function resize() {
      w = c.width = Math.max(2, Math.floor(innerWidth * SCALE));
      h = c.height = Math.max(2, Math.floor(innerHeight * SCALE));
      c.style.width = innerWidth + "px";
      c.style.height = innerHeight + "px";
    }
    resize();
    addEventListener("resize", resize, { passive: true });

    function hexToHsl(hex) {
      const m = hex.replace("#", "");
      const r = parseInt(m.substr(0, 2), 16) / 255,
            g = parseInt(m.substr(2, 2), 16) / 255,
            b = parseInt(m.substr(4, 2), 16) / 255;
      const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
      let hh = 0, sa = 0; const l = (mx + mn) / 2;
      if (mx !== mn) {
        const d = mx - mn;
        sa = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
        if (mx === r) hh = (g - b) / d + (g < b ? 6 : 0);
        else if (mx === g) hh = (b - r) / d + 2;
        else hh = (r - g) / d + 4;
        hh *= 60;
      }
      return [hh, sa * 100, l * 100];
    }

    /* three soft blobs, low alpha — a wash, not a lava lamp */
    const blobs = [
      { bx: .22, by: .18, ax: .10, ay: .10, sx: .000045, sy: .000052, px: 0.0, py: 2.1, hueOff: 0,   r: .58 },
      { bx: .80, by: .34, ax: .11, ay: .09, sx: .000038, sy: .000047, px: 2.4, py: 4.6, hueOff: 26,  r: .52 },
      { bx: .50, by: .78, ax: .09, ay: .11, sx: .000051, sy: .000041, px: 5.1, py: 1.3, hueOff: -30, r: .60 },
    ];

    let raf = 0;
    function draw(now) {
      raf = requestAnimationFrame(draw);
      if (reduced()) { ctx.clearRect(0, 0, w, h); return; }
      const dark = document.documentElement.dataset.theme === "dark";
      const accent = getComputedStyle(document.documentElement)
        .getPropertyValue("--accent").trim() || "#1f6feb";
      const [H, S0] = hexToHsl(accent);
      const S = clamp(S0, 40, 80);
      const L = dark ? 48 : 74;
      const a = dark ? 0.07 : 0.13;        // restrained — this is a background
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = dark ? "lighter" : "source-over";
      for (const b of blobs) {
        const x = (b.bx + Math.sin(now * b.sx + b.px) * b.ax) * w;
        const y = (b.by + Math.cos(now * b.sy + b.py) * b.ay) * h;
        const rad = b.r * Math.max(w, h);
        const hue = (H + b.hueOff + 360) % 360;
        const g = ctx.createRadialGradient(x, y, 0, x, y, rad);
        g.addColorStop(0, `hsla(${hue}, ${S}%, ${L}%, ${a})`);
        g.addColorStop(1, `hsla(${hue}, ${S}%, ${L}%, 0)`);
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(x, y, rad, 0, 7); ctx.fill();
      }
    }
    raf = requestAnimationFrame(draw);
  }

  /* ---------- marquee pause control (WCAG 2.2.2) ---------- */
  function setupMarqueeControl() {
    const btn = document.querySelector(".marquee-pause");
    if (!btn) return;
    const sync = () => {
      btn.textContent = marqueePaused ? "▶" : "❚❚";
      btn.setAttribute("aria-label", marqueePaused ? "Play the technology marquee" : "Pause the technology marquee");
      btn.setAttribute("aria-pressed", String(marqueePaused));
    };
    btn.addEventListener("click", () => { marqueePaused = !marqueePaused; sync(); });
    sync();
  }


  /* ---------- cursor ring ----------
     Hover state is read from pointerover/out (event-driven), never by probing
     elementFromPoint every frame. The loop only writes a transform. */
  const CURSOR_HOT = "a,button,input,textarea,select,summary,[role='button'],.chip,[data-mag],.net-canvas,.term,.soc,.rail a,.tstudio-sw,.marquee-pause";
  function setupCursor() {
    if (!fine) return;
    const ring = document.querySelector(".cursor-ring");
    if (!ring) return;
    cur.el = ring;
    document.body.classList.add("cursor-on");

    addEventListener("pointerover", (e) => {
      cur.hot = !!(e.target.closest && e.target.closest(CURSOR_HOT));
      ring.classList.toggle("hot", cur.hot);
    }, { passive: true });
    addEventListener("pointerout", (e) => {
      const to = e.relatedTarget;
      if (!to || !to.closest || !to.closest(CURSOR_HOT)) { cur.hot = false; ring.classList.remove("hot"); }
    }, { passive: true });
    addEventListener("pointerdown", () => { cur.down = true; ring.classList.add("down"); }, { passive: true });
    addEventListener("pointerup", () => { cur.down = false; ring.classList.remove("down"); }, { passive: true });
    // leaving the window shouldn't strand the ring at the edge
    document.addEventListener("mouseleave", () => { ring.style.opacity = "0"; });
    document.addEventListener("mouseenter", () => { ring.style.opacity = ""; });
  }

  /* ---------- layout ---------- */
  let skills = null, skillsTrack = null, skillsMax = 0;

  /* BUG FIX (mobile scroll jump):
     `resize` fires every time a mobile browser shows/hides its URL bar, which
     only changes innerHeight. Recomputing the pinned section's height there
     moves the document under the user's finger mid-scroll. Only a width change
     (or an explicit call) can alter the horizontal track, so gate on width. */
  function onResize() {
    const widthChanged = innerWidth !== vp.w;
    const bigHeightJump = Math.abs(innerHeight - vp.h) > 160;   // rotation, not toolbar
    if (widthChanged || bigHeightJump) layout(true);
  }

  function layout(force) {
    if (!force && innerWidth === vp.w) return;
    vp.w = innerWidth; vp.h = innerHeight;

    skills = document.querySelector(".skills");
    skillsTrack = document.querySelector(".skills-track");
    if (skills && skillsTrack) {
      if (reduced()) {
        /* Tier 1: no scroll-jacked horizontal pin. Let the track scroll
           natively so every panel is still reachable. */
        skills.style.height = "";
        skillsTrack.style.transform = "";
        skillsTrack.style.overflowX = "auto";
        skillsMax = 0;
      } else {
        skillsTrack.style.overflowX = "";
        skillsMax = Math.max(0, skillsTrack.scrollWidth - vp.w);
        /* pin length = one viewport + the horizontal distance to travel */
        skills.style.height = (vp.h + skillsMax) + "px";
      }
    }

    const mobileMarquee = document.querySelector(".hero + .marquee");
    if (mobileMarquee) {
      document.documentElement.style
        .setProperty("--mobile-marquee-height", mobileMarquee.offsetHeight + "px");
    }
    if (!stackMQ.matches) resetStack(true);
  }

  /* ---------- sticky work-stack ---------- */
  let stackDirty = false;

  /* BUG FIX (project section):
     The stack transform used to run unconditionally. Below 981px the CSS drops
     `position: sticky`, so panels simply flow — but the JS kept computing
     "how far has the next panel covered this one", which is ~1 for every panel
     that has scrolled past. Result: every project card except the last sat
     permanently at scale(.88) / opacity .45 / brightness(.72) on mobile, and
     nothing ever cleared it. Reset once when the stack is inactive. */
  function resetStack(force) {
    if (!stackDirty && !force) return;
    document.querySelectorAll(".work-panel .pcard").forEach((card) => {
      card.style.transform = "";
      card.style.opacity = "";
      card.style.filter = "";
      card.style.willChange = "";
    });
    stackDirty = false;
  }

  /* ---------- main loop ---------- */
  const marquee = { x: 0 };

  function loopStart() {
    const nav = document.querySelector(".nav");
    const sbar = document.querySelector(".sbar");
    const railLinks = [...document.querySelectorAll(".rail a")];
    const railSecs = railLinks.map((a) => document.getElementById(a.getAttribute("href").slice(1)));
    const hero = document.querySelector(".hero");
    const mTrack = document.querySelector(".marquee-track");
    const skillsFoot = document.querySelector(".skills-foot .track i");
    const tl = document.querySelector(".tl");
    const tlFill = document.querySelector(".tl-fill");
    const bigs = [...document.querySelectorAll(".wv .big")];
    const workPanels = [...document.querySelectorAll(".work-panel")];
    const carets = [...document.querySelectorAll(".caret")];
    const liveDots = [...document.querySelectorAll(".live i")];
    const portStage = document.querySelector(".portrait .tilt");
    const portWrap = document.querySelector(".portrait");
    const portChips = [...document.querySelectorAll(".portrait .pchip")];

    let mHalf = 0;
    const rot = { x: 0, y: 0 };

    function frame(now) {
      requestAnimationFrame(frame);
      if (lenis) lenis.raf(now);

      const soft = reduced();
      const vh = innerHeight;
      const y = scrollY;
      const docH = document.documentElement.scrollHeight - vh;

      /* ---- Tier 3: always-on feedback ---- */
      const blink = (Math.floor(now / 530) % 2) ? "1" : "0";
      for (const cr of carets) cr.style.opacity = blink;
      const pulse = 0.5 + 0.5 * (0.5 + 0.5 * Math.sin(now * 0.0038));
      for (const ld of liveDots) ld.style.opacity = String(pulse);

      /* cursor ring — snaps under reduced motion, trails otherwise */
      if (cur.el) {
        if (soft) { cur.rx = mouse.x; cur.ry = mouse.y; }
        else { cur.rx += (mouse.x - cur.rx) * 0.18; cur.ry += (mouse.y - cur.ry) * 0.18; }
        const sc = cur.down ? 0.82 : cur.hot ? 1.55 : 1;
        cur.el.style.transform = `translate3d(${cur.rx}px,${cur.ry}px,0) scale(${sc})`;
      }

      if (nav) nav.classList.toggle("shrink", y > 60);
      if (sbar) sbar.style.transform = `scaleX(${docH > 0 ? y / docH : 0})`;

      /* ---- reveals ---- */
      for (const it of revealItems) {
        if (it.state === "done") continue;
        const r = it.el.getBoundingClientRect();
        if (it.state === "hidden") {
          if (r.top < vh * 0.92 && r.bottom > 0) {
            it.state = "run";
            it.start = now + it.delay;
            for (const t of it.targets) t.style.willChange = "transform, opacity";
          } else continue;
        }
        const dur = soft ? 160 : 780;
        const p = clamp((now - it.start) / dur, 0, 1);
        if (p <= 0) { setHidden(it); continue; }
        setProgress(it, p);
        if (p >= 1) setShown(it);
      }

      /* ---- rail active section ---- */
      let act = -1;
      for (let i = 0; i < railSecs.length; i++) {
        const s = railSecs[i];
        if (!s) continue;
        const r = s.getBoundingClientRect();
        if (r.top <= vh * 0.5 && r.bottom >= vh * 0.5) act = i;
      }
      railLinks.forEach((a, i) => a.classList.toggle("on", i === act));

      /* ---- timeline fill (scaleY, not height) ---- */
      if (tl && tlFill) {
        const r = tl.getBoundingClientRect();
        tlFill.style.transform = `scaleY(${clamp((vh * 0.7 - r.top) / r.height, 0, 1)})`;
      }

      /* everything below is Tier 1 — skipped entirely when reduced */
      if (soft) { resetStack(); return; }

      /* ---- portrait parallax + tilt ---- */
      if (portWrap && hero && portStage) {
        const hr = hero.getBoundingClientRect();
        const pr = portWrap.getBoundingClientRect();          // batched reads
        const prog = clamp(-hr.top / vh, 0, 1);
        const cx = pr.left + pr.width / 2, cy = pr.top + pr.height / 2;
        const tx = fine && mouse.has ? clamp((mouse.x - cx) / pr.width, -1, 1) : 0;
        const ty = fine && mouse.has ? clamp((mouse.y - cy) / pr.height, -1, 1) : 0;
        rot.x += (-ty * 6 - rot.x) * 0.07;
        rot.y += (tx * 7 - rot.y) * 0.07;
        const float = Math.sin(now * 0.0011) * 5;
        portWrap.style.transform = `translateY(${prog * -32}px)`;   // writes
        portStage.style.transform = `translateY(${float}px) rotateX(${rot.x}deg) rotateY(${rot.y}deg)`;
        for (let i = 0; i < portChips.length; i++) {
          const d = i % 2 ? 1 : -1;
          portChips[i].style.transform = `translate(${rot.y * d}px, ${(-float + rot.x * d)}px)`;
        }
      }

      /* ---- marquee (pausable) ---- */
      if (mTrack) {
        if (!mHalf) mHalf = mTrack.scrollWidth / 2;
        if (!marqueePaused) {
          const v = lenis ? (lenis.velocity || 0) : 0;
          marquee.x -= 0.55 + Math.abs(v) * 0.3;
          if (mHalf && -marquee.x >= mHalf) marquee.x += mHalf;
        }
        mTrack.style.transform = `translate3d(${marquee.x}px,0,0)`;
      }

      /* ---- skills horizontal pin ---- */
      if (skills && skillsTrack && skillsMax > 0) {
        const r = skills.getBoundingClientRect();
        const span = skills.offsetHeight - vh;
        const prog = span > 0 ? clamp(-r.top / span, 0, 1) : 0;
        skillsTrack.style.transform = `translate3d(${-prog * skillsMax}px,0,0)`;
        if (skillsFoot) skillsFoot.style.transform = `scaleX(${prog})`;
      }

      /* ---- project visual parallax ---- */
      for (const b of bigs) {
        const r = b.getBoundingClientRect();
        if (r.bottom < 0 || r.top > vh) continue;             // offscreen: skip
        const off = (r.top + r.height / 2 - vh / 2) / vh;
        b.style.transform = `translate3d(0,${off * -34}px,0)`;
      }

      /* ---- work sticky-stack ---- */
      if (!stackMQ.matches) { resetStack(); }
      else {
        stackDirty = true;
        for (let i = 0; i < workPanels.length; i++) {
          const pr = workPanels[i].getBoundingClientRect();
          if (pr.bottom < -vh || pr.top > vh) continue;   // offscreen: don't write
          const card = workPanels[i].querySelector(".pcard");
          if (!card) continue;
          const next = workPanels[i + 1];
          let cover = 0;
          if (next) {
            const nr = next.getBoundingClientRect();
            cover = clamp(1 - nr.top / vh, 0, 1);
          }
          const e = cover < 0.5 ? 2 * cover * cover : 1 - Math.pow(-2 * cover + 2, 2) / 2;
          card.style.transform = `scale(${1 - e * 0.07}) translate3d(0,${e * -22}px,0)`;
          card.style.opacity = String(1 - e * 0.5);
        }
      }
    }
    requestAnimationFrame(frame);
  }

  /* ---------- public ---------- */
  M.scrollTo = function (sel) {
    const el = typeof sel === "string" ? document.querySelector(sel) : sel;
    if (!el) return;
    if (lenis) lenis.scrollTo(el, { offset: -4, duration: 1.2 });
    else el.scrollIntoView({ behavior: reduced() ? "auto" : "smooth", block: "start" });
  };
  M.reduced = reduced;

  window.MOTION = M;
})();
