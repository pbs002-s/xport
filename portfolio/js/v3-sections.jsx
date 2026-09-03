/* ============================================================
   v3 SECTIONS — editorial
============================================================ */
function L({ text }) {
  return <span>{text.split("").map((c, i) => <span key={i} style={{ display: "inline-block" }}>{c === " " ? "\u00A0" : c}</span>)}</span>;
}

const HERO_PHOTO_CANDIDATES = [
  "photo.jpg",
  "uploads/495269744_1890600001687484_511654819114515539_n.jpg",
];

/* ---------- HERO ---------- */
function HeroV3() {
  const D = window.DATA;
  const [photoIndex, setPhotoIndex] = useState(0);
  const heroPhotoSrc = new URL(
    HERO_PHOTO_CANDIDATES[Math.min(photoIndex, HERO_PHOTO_CANDIDATES.length - 1)],
    window.location.href
  ).href;
  const handlePhotoError = () => {
    setPhotoIndex((current) => (
      current < HERO_PHOTO_CANDIDATES.length - 1 ? current + 1 : current
    ));
  };

  const nameParts = (D.identity.name || "Pritom Biswas").split(" ");
  const firstName = nameParts[0];
  const lastName = nameParts.slice(1).join(" ");

  return (
    <section id="home" className="hero wrap section">
      <div className="hero-grid">
        <div>
          <div className="eyebrow">
            <span className="av"><i></i> available for work</span>
            <span>·</span><span>{D.identity.location}</span>
            <span>·</span><span>UTC+6</span>
          </div>
          <div className="hero-name-row">
            <h1 className="hero-name">
              <span className="ln mask"><L text={firstName} /></span>
              <span className="ln mask" data-d="1"><span className="it"><L text={lastName} /></span></span>
            </h1>
            <div className="hero-mobile-avatar" aria-hidden="true">
              <img src={heroPhotoSrc} alt={D.identity.name} onError={handlePhotoError} />
            </div>
          </div>
          <div className="hero-roles">
            <span className="pre">role — </span>
            <Typewriter words={D.identity.roles} />
          </div>
          <p className="hero-desc">{D.identity.summary}</p>
          <div className="hero-cta">
            <button className="btn btn-solid" data-mag onClick={() => window.MOTION.scrollTo("#work")}><span>Selected work</span></button>
            <button className="btn" data-mag onClick={() => window.MOTION.scrollTo("#contact")}><span>Get in touch ↗</span></button>
          </div>
          <div className="hero-scroll">SCROLL TO EXPLORE <span className="ln"></span></div>
        </div>
        <div className="portrait">
          <div className="ticks">FIG. 01 — DEVELOPER</div>
          <div className="stage">
            <div className="backplate"></div>
            <div className="halo h1"></div>
            <div className="halo h2"></div>
            <div className="tilt">
              <div className="pin">
                <div className="frame-head">
                  <span className="fid">PB / PROFILE</span>
                  <span className="fstate"><i></i> LIVE</span>
                </div>
                <div className="pwrap">
                  <img src={heroPhotoSrc} alt={D.identity.name} onError={handlePhotoError} />
                </div>
                <div className="frame-foot">
                  <div className="idblock">
                    <span className="lab">Focus</span>
                    <strong>Build / Ship / Learn</strong>
                  </div>
                </div>
              </div>
            </div>
            <div className="pchip c1"><i></i> CONTRIBS 350+</div>
            <div className="pchip c2">DHAKA · UTC+6</div>
            <div className="pchip c3">● FULL STACK</div>
          </div>
          <div className="cap">
            <span>{D.identity.name} · Developer</span>
            <span className="accent">System status: online</span>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- MARQUEE ---------- */
function MarqueeV3() {
  const words = ["React", "TypeScript", "Next.js", "Java 17", "Spring Boot", "Python", "PyTorch", "Kotlin", "Jetpack Compose", "PostGIS", "XGBoost", "Gemini", "GPT-4o", "Competitive Programming"];
  const seq = [...words, ...words];
  return (
    <div className="marquee">
      <div className="marquee-track" aria-hidden="true">
        {seq.map((w, i) => <span key={i} className={"item" + (i % 3 === 1 ? " gh" : "")}>{w}</span>)}
      </div>
      {/* auto-motion longer than 5s needs a stop control (WCAG 2.2.2, Level A) */}
      <button className="marquee-pause" type="button" aria-label="Pause the technology marquee">❚❚</button>
    </div>
  );
}

/* ---------- PROFILE ---------- */
function ProfileV3() {
  const D = window.DATA;
  const stats = [
    { v: "350", suf: "+", dec: 0, l: "contributions past year" },
    { v: "12", suf: "", dec: 0, l: "public repositories" },
    { v: "100", suf: "+", dec: 0, l: "algorithmic problems" },
    { v: "24", suf: "/7", dec: 0, l: "continuous learning" },
  ];
  const pillars = [
    { k: "Build", v: "Apps", s: "React · Next.js · mobile & web products" },
    { k: "Solve", v: "Logic", s: "Data structures · algorithms · LeetCode" },
    { k: "Explore", v: "AI / ML", s: "Groq · Llama · Florence-2 · PyTorch" },
    { k: "Scale", v: "Infra", s: "Docker · Linux · PostGIS · databases" },
  ];
  return (
    <section id="profile" className="wrap section pad">
      <div className="shead">
        <div className="meta"><span className="no">01</span><span>/ profile</span><span className="ln"></span><span>who's behind the work</span></div>
        <h2 className="mask"><span>Engineer &amp; builder,<br />end to end.</span></h2>
      </div>
      <div className="profile-shell">
        <div className="profile-main" data-rv>
          <div className="profile-stage">
            <div className="profile-kicker">Profile / editorial mode</div>
            <div className="profile-super">FULL-STACK<br />MEETS AI</div>
            <p className="profile-lead">I build responsive applications and explore machine learning solutions.</p>
            <p className="profile-body short">{D.identity.summary}</p>
            <div className="profile-strip">
              {D.identity.roles.slice(0, 4).map((r) => <span key={r}>{r}</span>)}
            </div>
          </div>
          <div className="profile-principle" data-rv data-d="1">
            <span className="nlab">Core principle</span>
            <p>"Consistency beats talent when talent doesn't work consistently."</p>
          </div>
        </div>
        <div className="profile-side" data-rv data-d="1">
          <div className="profile-matrix">
            {pillars.map((item) => (
              <div className="profile-cell" key={item.k}>
                <div className="profile-card-top">{item.k}</div>
                <h3>{item.v}</h3>
                <p>{item.s}</p>
              </div>
            ))}
          </div>
          <div className="profile-bio-card">
            <div className="profile-card-top">Availability</div>
            <div className="profile-bio-grid">
              <div className="mrow"><span>Base</span><strong>{D.identity.location}</strong></div>
              <div className="mrow"><span>Email</span><strong><a href={"mailto:" + D.identity.email} className="accent">{D.identity.email}</a></strong></div>
              <div className="mrow"><span>Status</span><strong className="accent">Open to opportunities</strong></div>
            </div>
          </div>
        </div>
      </div>
      <div className="stats stats-profile" data-rv style={{ marginTop: "clamp(40px,5vw,70px)" }}>
        {stats.map((s) => (
          <div className="st" key={s.l}>
            <div className="topline"></div>
            <div className="v"><span data-count={s.v} data-dec={s.dec}>0</span><small>{s.suf}</small></div>
            <div className="l">{s.l}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------- SKILLS (horizontal) ---------- */
function SkillsV3() {
  const D = window.DATA;
  return (
    <section id="skills" className="skills section">
      <div className="skills-sticky">
        <div className="skills-head wrap">
          <div className="meta"><span className="no">02</span><span>/ capabilities</span><span className="ln"></span><span>the toolchain — scroll →</span></div>
        </div>
        <div className="skills-track">
          {D.skills.map((s, i) => (
            <div className="skill-panel" key={s.cat}>
              <div className="pn">{String(i + 1).padStart(2, "0")} — {String(D.skills.length).padStart(2, "0")}</div>
              <h3>{s.cat}</h3>
              <div className="cmd">{s.cmd}</div>
              <div className="items">{s.items.map((it) => <span key={it} className="chip">{it}</span>)}</div>
            </div>
          ))}
          <div className="skill-panel" style={{ width: "30vw" }}></div>
        </div>
        <div className="skills-foot"><span>DRAG / SCROLL</span><span className="track"><i></i></span><span>STACK</span></div>
      </div>
    </section>
  );
}

/* ---------- WORK (sticky-stacking panels) ---------- */
function WorkV3() {
  const D = window.DATA;
  const all = D.mergedProjects();

  const kindOf = (p) => p.reel || "dashboard";
  const hostLabel = (p) => p.url.replace(/^https?:\/\//, "").replace(/\/$/, "");
  return (
    <section id="work" className="section">
      <div className="wrap work-head">
        <div className="shead">
          <div className="meta"><span className="no">05</span><span>/ selected work</span><span className="ln"></span><span>{all.length} projects — live &amp; open source</span></div>
          <h2 className="mask"><span>Things I've shipped.</span></h2>
        </div>
      </div>
      <div className="work-stack">
        {all.map((p, i) => (
          <div className={"work-panel" + (i % 2 ? " flip" : "")} key={p.name} style={{ background: i % 2 ? "var(--paper-2)" : "var(--paper)", zIndex: i + 1 }}>
            <span className="work-edge"></span>
            <div className="pcard" data-n={String(i + 1).padStart(2, "0")}>
              <div className="wrap">
                <div className="prow">
                  <a className="wv" href={p.url} target="_blank" rel="noopener">
                    <div className="browser">
                      <div className="bbar"><i></i><i></i><i></i><span className="url">{hostLabel(p)}</span></div>
                      <div className="bcanvas">
                        <ProjectReel kind={kindOf(p)} />
                      </div>
                      <div className="tagline">{p.tag}</div>
                    </div>
                  </a>
                  <div className="wi">
                    <div className="idx">PROJECT {String(i + 1).padStart(2, "0")} — {String(all.length).padStart(2, "0")}</div>
                    <div className="meta"><span className="live"><i></i>{p.status}</span><span>{p.period}</span></div>
                    <h3>{p.name}</h3>
                    <div className="ptag">{p.tag} · {p.role}</div>
                    <p className="blurb">{p.blurb}</p>
                    <ul className="hl">{p.highlights.map((h) => <li key={h}>{h}</li>)}</ul>
                    <div className="foot">
                      <div className="stack">{p.stack.map((s) => <span key={s} className="chip">{s}</span>)}</div>
                      <a className="open" href={p.url} target="_blank" rel="noopener">{p.oss ? "view on github" : "open live"} <Icon.arrow /></a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------- EXPERIENCE ---------- */
function ExperienceV3() {
  const D = window.DATA;
  return (
    <section id="experience" className="wrap section pad">
      <div className="shead">
        <div className="meta"><span className="no">07</span><span>/ experience</span><span className="ln"></span><span>track record</span></div>
        <h2 className="mask"><span>Where I've built.</span></h2>
      </div>
      <div className="tl">
        <div className="tl-fill"></div>
        {D.experience.map((e, i) => (
          <div className="tl-item" key={i} data-rv data-d={String(i % 4)}>
            <span className="node"></span>
            <div className="per">{e.period}</div>
            <div className="ro">{e.role}</div>
            <div className="or">{e.org}</div>
            <div className="pl">{e.place}</div>
            <p className="de">{e.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------- CONSOLE ---------- */
function ConsoleV3() {
  return (
    <section id="console" className="wrap section pad">
      <div className="shead">
        <div className="meta"><span className="no">08</span><span>/ console</span><span className="ln"></span><span>an interactive easter egg</span></div>
      </div>
      <div className="console-wrap">
        <div data-rv>
          <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "clamp(30px,4vw,56px)", lineHeight: 1, letterSpacing: "-.03em" }}>Talk to<br />the machine.</h2>
          <p style={{ color: "var(--ink-2)", fontSize: 17, lineHeight: 1.7, marginTop: 22, maxWidth: "42ch" }}>
            This isn't a screenshot — it's a working shell. Type <span className="mono accent">help</span>, <span className="mono accent">whoami</span>, <span className="mono accent">projects</span> or <span className="mono accent">neofetch</span> and it responds. Because an engineer's portfolio should <em>run</em>.
          </p>
        </div>
        <div data-rv data-d="1">
          <Terminal onCommand={(t, a) => { if (t === "goto") window.MOTION.scrollTo("#" + (a === "projects" ? "work" : a)); }} />
        </div>
      </div>
    </section>
  );
}

/* ---------- CREDENTIALS ---------- */
function CredentialsV3() {
  const D = window.DATA;
  return (
    <section id="credentials" className="wrap section pad">
      <div className="shead">
        <div className="meta"><span className="no">09</span><span>/ credentials</span><span className="ln"></span><span>certifications · awards</span></div>
        <h2 className="mask"><span>Certified &amp; recognized.</span></h2>
      </div>
      <div className="creds creds-2">
        <div data-rv>
          <div className="col-head">Certifications</div>
          {D.certifications.map((c, i) => (
            <div className="icard" key={i}><h4>{c.title}</h4><div className="sub"><span>{c.by}</span></div></div>
          ))}
        </div>
        <div data-rv data-d="1">
          <div className="col-head">Achievements</div>
          {D.achievements.map((a, i) => (
            <div className="icard" key={i}><h4>{a.title}</h4><div className="sub"><span>{a.by}</span></div></div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- CV ---------- */
function CvV3() {
  const D = window.DATA;
  const cv = D.cv || {};
  const file = cv.file || "/Pritam_Biswas_CV.pdf";
  const previewSrc = `${file}#toolbar=0&navpanes=0&scrollbar=1&view=FitH`;
  const [checking, setChecking] = useState(true);
  const [previewReady, setPreviewReady] = useState(false);
  const [previewFailed, setPreviewFailed] = useState(false);

  useEffect(() => {
    let active = true;
    setChecking(true);
    setPreviewReady(false);
    setPreviewFailed(false);

    fetch(file, { method: "HEAD" })
      .then((res) => {
        if (!active) return;
        if (!res.ok) {
          setPreviewFailed(true);
          setChecking(false);
        }
      })
      .catch(() => {
        if (!active) return;
        setPreviewFailed(true);
        setChecking(false);
      });

    /* Browsers with no inline PDF viewer (most mobile ones) fire neither `load`
       nor `error` on the iframe, which left the card stuck on "Preparing
       profile view…" forever. Fall back to the profile card instead. */
    const giveUp = setTimeout(() => {
      if (!active) return;
      setPreviewReady((ready) => {
        if (!ready) { setPreviewFailed(true); setChecking(false); }
        return ready;
      });
    }, 5000);

    return () => {
      active = false;
      clearTimeout(giveUp);
    };
  }, [file]);

  return (
    <section id="cv" className="wrap section pad">
      <div className="shead">
        <div className="meta"><span className="no">10</span><span>/ cv</span><span className="ln"></span><span>preview · download</span></div>
        <h2 className="mask"><span>View the hardcopy.</span></h2>
      </div>

      <div className="cv-shell">
        <div className="cv-copy" data-rv>
          <div className="cv-kicker">{cv.label || "PDF · Resume"}</div>
          <h3>{cv.title || "Curriculum Vitae"}</h3>
          <p>{cv.note || "Explore projects and code on GitHub or get in touch directly."}</p>

          <div className="cv-actions">
            <a className="btn btn-solid" href={file} target="_blank" rel="noopener">
              <span>Open PDF ↗</span>
            </a>
            <a className="btn" href={file} download="Pritam_Biswas_CV.pdf">
              <span>Download CV ↓</span>
            </a>
          </div>
        </div>

        <div className="cv-preview-card" data-rv data-d="1">
          <div className="cv-preview-bar">
            <span>Pritam_Biswas_CV.pdf</span>
            <a href={file} download="Pritam_Biswas_CV.pdf" className="cv-inline-link">download <Icon.arrow /></a>
          </div>

          <div className={"cv-preview" + (previewReady ? " ready" : "")}>
            {!previewFailed && (
              <iframe
                src={previewSrc}
                title="Pritom Biswas CV preview"
                loading="lazy"
                onLoad={() => {
                  setPreviewReady(true);
                  setChecking(false);
                }}
                onError={() => {
                  setPreviewFailed(true);
                  setChecking(false);
                }}
              />
            )}

            {checking && !previewFailed && (
              <div className="cv-preview-state">
                <span className="cv-state-k">Loading preview</span>
                <strong>Preparing profile view…</strong>
              </div>
            )}

            {previewFailed && (
              <div className="cv-preview-state fail">
                <span className="cv-state-k">Developer Profile</span>
                <strong>{D.identity.name}</strong>
                <p>Visit GitHub at <a href={"https://github.com/" + (D.identity.handle || "pbs002-s")} target="_blank" rel="noopener" className="accent">github.com/{D.identity.handle}</a> to see live source code, repositories, and activity.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- CONTACT ---------- */
function ContactV3() {
  const D = window.DATA;
  const [copied, setCopied] = useState(false);
  return (
    <section id="contact" className="wrap section pad contact">
      <div className="shead" style={{ marginBottom: 18 }}>
        <div className="meta" style={{ justifyContent: "center" }}><span className="no">11</span><span>/ contact</span></div>
      </div>
      <p style={{ fontFamily: "var(--font-mono)", fontSize: 13, letterSpacing: ".1em", color: "var(--ink-3)", textTransform: "uppercase" }} data-rv>Available for full-stack · web · app roles</p>
      <div className="big mask"><span>Let's <span className="it">build</span>.</span></div>
      <div className="em" data-rv>
        <a href={"mailto:" + D.identity.email} data-mag onClick={() => { navigator.clipboard && navigator.clipboard.writeText(D.identity.email); setCopied(true); setTimeout(() => setCopied(false), 1600); }}>
          {copied ? "copied to clipboard ✓" : D.identity.email}
        </a>
      </div>
      <div className="socials" data-rv data-d="1">
        {D.socials.filter((s) => s.key !== "email").map((s) => (
          <a key={s.key} href={s.url} target="_blank" rel="noopener" className="soc" data-mag>{Icon[s.key] ? Icon[s.key]() : null} {s.label}</a>
        ))}
      </div>
      <div className="meta" data-rv data-d="2">{D.identity.phone && <span>📞 {D.identity.phone}</span>}<span>🌐 {D.identity.site.replace("https://", "")}</span><span>📍 {D.identity.location}</span></div>
    </section>
  );
}

/* ---------- SHOWREEL (cinematic video motion reel with sound on/off) ---------- */
function ShowreelBand() {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState("00:00");
  const [duration, setDuration] = useState("00:00");

  const formatTime = (secs) => {
    if (!secs || isNaN(secs)) return "00:00";
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const toggleSound = (e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    const vid = videoRef.current;
    if (!vid) return;
    const nextMuted = !vid.muted;
    vid.muted = nextMuted;
    setIsMuted(nextMuted);
    if (!nextMuted) {
      vid.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const togglePlay = () => {
    const vid = videoRef.current;
    if (!vid) return;
    if (vid.paused) {
      vid.play().catch(() => {});
      setIsPlaying(true);
    } else {
      vid.pause();
      setIsPlaying(false);
    }
  };

  const handleTimeUpdate = () => {
    const vid = videoRef.current;
    if (!vid || !vid.duration) return;
    const pct = (vid.currentTime / vid.duration) * 100;
    setProgress(pct);
    setCurrentTime(formatTime(vid.currentTime));
  };

  const handleLoadedMetadata = () => {
    const vid = videoRef.current;
    if (vid && vid.duration) {
      setDuration(formatTime(vid.duration));
    }
  };

  const handleScrub = (e) => {
    const vid = videoRef.current;
    if (!vid || !vid.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    vid.currentTime = pos * vid.duration;
  };

  const toggleFullscreen = () => {
    const elem = containerRef.current;
    if (!elem) return;
    if (!document.fullscreenElement) {
      elem.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  return (
    <section id="reel" className="reel-band section pad">
      <div className="wrap">
        <div className="shead" data-rv>
          <div className="meta"><span className="no">06</span><span>/ motion reel</span><span className="ln"></span><span>cinematic showcase with audio</span></div>
          <h2 className="mask"><span>The work, in motion.</span></h2>
        </div>
        <div className="reel-frame" data-rv data-d="1" ref={containerRef}>
          <div className="reel-bar">
            <span className="reel-name">MOTION REEL · PRITAM BISWAS</span>
            <div className="reel-bar-controls">
              <button
                type="button"
                className={"reel-sound-btn" + (!isMuted ? " active" : "")}
                onClick={toggleSound}
                title={isMuted ? "Turn sound ON" : "Turn sound OFF"}
              >
                <span>{!isMuted ? "🔊 Sound ON" : "🔇 Sound OFF"}</span>
              </button>
              <button
                type="button"
                className="reel-play-btn"
                onClick={togglePlay}
                title={isPlaying ? "Pause video" : "Play video"}
              >
                {isPlaying ? "❚❚ Pause" : "▶ Play"}
              </button>
              <button
                type="button"
                className="reel-play-btn"
                onClick={toggleFullscreen}
                title="Toggle fullscreen"
              >
                ⛶ Fullscreen
              </button>
              <a className="reel-full" href="Showreel.html" target="_blank" rel="noopener" style={{ marginLeft: 0 }}>
                page ↗
              </a>
            </div>
          </div>
          <div className="reel-screen" onClick={togglePlay}>
            <video
              ref={videoRef}
              src="videos/motion-reel.mp4"
              autoPlay
              loop
              muted={isMuted}
              playsInline
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onEnded={() => {
                const vid = videoRef.current;
                if (vid) {
                  vid.currentTime = 0;
                  vid.play().catch(() => {});
                }
              }}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            />
            <button
              type="button"
              className={"reel-float-sound " + (isMuted ? "muted" : "unmuted")}
              onClick={toggleSound}
              title={isMuted ? "Click to unmute" : "Click to mute"}
            >
              <span>{isMuted ? "🔇 SOUND OFF · Click for audio" : "🔊 SOUND ON"}</span>
            </button>
            <div className="reel-scrub-wrap" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                className="reel-play-btn"
                style={{ padding: "3px 8px", fontSize: 11 }}
                onClick={togglePlay}
              >
                {isPlaying ? "❚❚" : "▶"}
              </button>
              <div className="reel-scrub-bar" onClick={handleScrub}>
                <div className="reel-scrub-fill" style={{ width: `${progress}%` }}></div>
              </div>
              <span className="reel-time-badge">{currentTime} / {duration}</span>
              <button
                type="button"
                className={"reel-sound-btn" + (!isMuted ? " active" : "")}
                style={{ padding: "3px 9px", fontSize: 11 }}
                onClick={toggleSound}
              >
                {!isMuted ? "🔊 ON" : "🔇 OFF"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

Object.assign(window, { HeroV3, MarqueeV3, ProfileV3, SkillsV3, WorkV3, ExperienceV3, ConsoleV3, CredentialsV3, CvV3, ContactV3, ShowreelBand });
