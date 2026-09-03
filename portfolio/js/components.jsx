/* ============================================================
   SHARED COMPONENTS & HOOKS
============================================================ */
/* Expose React hooks on the global object so every Babel file
   (each runs in its own scope) can use them as bare identifiers. */
Object.assign(window, {
  useState: React.useState,
  useEffect: React.useEffect,
  useRef: React.useRef,
  useCallback: React.useCallback,
  useMemo: React.useMemo,
});

/* ---- scroll-reveal hook ---- */
function useReveal() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }),
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    el.querySelectorAll(".reveal").forEach((n) => io.observe(el.classList.contains("reveal") ? el : n));
    if (el.classList.contains("reveal")) io.observe(el);
    return () => io.disconnect();
  }, []);
  return ref;
}

/* ---- rotating typewriter for roles ---- */
function Typewriter({ words, className }) {
  const [i, setI] = useState(0);
  const [txt, setTxt] = useState("");
  const [del, setDel] = useState(false);
  useEffect(() => {
    const full = words[i % words.length];
    let t;
    if (!del && txt === full) {
      t = setTimeout(() => setDel(true), 1500);
    } else if (del && txt === "") {
      setDel(false); setI((v) => v + 1);
    } else {
      t = setTimeout(() => {
        setTxt(del ? full.slice(0, txt.length - 1) : full.slice(0, txt.length + 1));
      }, del ? 45 : 80);
    }
    return () => clearTimeout(t);
  }, [txt, del, i, words]);
  return (
    <span className={className}>
      {txt}
      <span className="caret">&nbsp;</span>
    </span>
  );
}

/* ---- section header ---- */
function SecHead({ kicker, title, index }) {
  return (
    <div className="sec-head reveal">
      <div>
        <div className="sec-kicker">{kicker}</div>
        <h2 className="sec-title">{title}</h2>
      </div>
      <div className="sec-rule"></div>
      <div className="sec-index">{index}</div>
    </div>
  );
}

/* ---- tiny inline icons (stroke) ---- */
const Icon = {
  arrow: () => (<svg className="arrow" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M7 17L17 7M17 7H8M17 7V16"/></svg>),
  sun: () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>),
  moon: () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.8A9 9 0 1111.2 3 7 7 0 0021 12.8z"/></svg>),
  cmd: () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 6a3 3 0 10-3 3h12a3 3 0 10-3-3v12a3 3 0 103-3H6a3 3 0 10 3 3z"/></svg>),
  github: () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.58 2 12.25c0 4.53 2.87 8.37 6.84 9.73.5.1.68-.22.68-.49v-1.7c-2.78.62-3.37-1.37-3.37-1.37-.45-1.18-1.11-1.5-1.11-1.5-.91-.64.07-.62.07-.62 1 .07 1.53 1.06 1.53 1.06.9 1.57 2.34 1.12 2.91.86.09-.66.35-1.12.63-1.38-2.22-.26-4.55-1.14-4.55-5.07 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.71 0 0 .84-.27 2.75 1.05A9.3 9.3 0 0112 6.84c.85 0 1.71.12 2.51.34 1.91-1.32 2.75-1.05 2.75-1.05.55 1.41.2 2.45.1 2.71.64.72 1.03 1.63 1.03 2.75 0 3.94-2.34 4.81-4.57 5.06.36.32.68.94.68 1.9v2.82c0 .27.18.6.69.49A10.02 10.02 0 0022 12.25C22 6.58 17.52 2 12 2z"/></svg>),
  linkedin: () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M4.98 3.5A2.5 2.5 0 002.5 6a2.5 2.5 0 002.48 2.5A2.5 2.5 0 007.5 6 2.5 2.5 0 004.98 3.5zM3 9h4v12H3zM10 9h3.8v1.7h.05c.53-1 1.83-2.05 3.76-2.05C21.4 8.65 22 11.1 22 14.3V21h-4v-5.9c0-1.4 0-3.2-1.96-3.2-1.96 0-2.26 1.53-2.26 3.1V21h-4z"/></svg>),
  facebook: () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M22 12a10 10 0 10-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.78-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99A10 10 0 0022 12z"/></svg>),
  instagram: () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>),
  email: () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="5" width="18" height="14" rx="1"/><path d="M3 7l9 6 9-6"/></svg>),
  palette: () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M12 3a9 9 0 100 18h1.5a2 2 0 001.6-3.2l-.3-.4a2 2 0 011.6-3.2H18a3 3 0 003-3.1A9 9 0 0012 3z"/><circle cx="7.5" cy="12" r="1.1" fill="currentColor" stroke="none"/><circle cx="9.8" cy="7.8" r="1.1" fill="currentColor" stroke="none"/><circle cx="14.5" cy="7.5" r="1.1" fill="currentColor" stroke="none"/></svg>),
  ext: () => (<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 4h6v6M20 4l-9 9M19 13v6a1 1 0 01-1 1H5a1 1 0 01-1-1V6a1 1 0 011-1h6"/></svg>),
};

Object.assign(window, { useReveal, Typewriter, SecHead, Icon });
