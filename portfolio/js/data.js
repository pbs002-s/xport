/* ============================================================
   PORTFOLIO CONTENT — Pritam Biswas (pbs002-s)
   Single source of truth. Edit copy here.
============================================================ */
window.DATA = {
  identity: {
    name: "PRITAM BISWAS",
    handle: "pbs002-s",
    roles: [
      "App & Web Developer",
      "AI Explorer",
      "Competitive Programmer",
      "Full-Stack Developer",
      "Software Engineer",
    ],
    location: "Dhaka, Bangladesh",
    flag: "BD",
    email: "pritam020s2@gmail.com",
    phone: "",
    site: "https://pritam-biswas-portfolio.netlify.app",
    summary:
      "Second-year CSE undergraduate (B.Tech, expected graduation 2028) at Daffodil International University who has shipped multiple production-grade, AI-integrated and distributed products — EduSync (a multi-tenant digital campus collaboration platform), BhashaBot (a multilingual GPT-4o support agent live across 18 languages), OpenGovtBD (a civic engagement platform), medicalLLM (an EMG ALS screening platform), and DIU Routine (a native Android app with Gemini Vision). Every project was built solo, end-to-end — architecture, Git-based version control, debugging, and interface.",
  },

  // KPI / status widgets for the hero console
  stats: [
    { label: "contributions", value: "350+", sub: "past year" },
    { label: "repositories", value: "13", sub: "public & private" },
    { label: "problems", value: "100+", sub: "LeetCode & CP" },
    { label: "stack", value: "full", sub: "web · mobile · ai" },
  ],

  skills: [
    {
      cat: "Core Languages & Tech",
      cmd: "stack --core",
      items: ["Python", "JavaScript", "TypeScript", "Java", "PHP", "React", "Node.js", "Express"],
    },
    {
      cat: "Frameworks & Mobile",
      cmd: "stack --mobile",
      items: ["Kotlin", "Jetpack Compose", "Android", "Java 17", "Spring Boot", "Laravel", "Thymeleaf", "Maven", "Tailwind CSS", "HTML/CSS", "C"],
    },
    {
      cat: "AI & Automation",
      cmd: "stack --ai",
      items: ["GPT-4o API", "Gemini API", "Gemini Vision", "n8n Workflows", "PyTorch", "Florence-2", "XGBoost", "Grad-CAM", "SHAP", "K-Means Clustering", "PCA", "Groq / Llama 3.3"],
    },
    {
      cat: "Engineering & Tools",
      cmd: "stack --tools",
      items: ["Git / GitHub", "Docker", "Socket.IO", "Redis", "PostgreSQL", "CRUD Architecture", "Role-Based Access", "REST APIs", "Room DB", "PostGIS", "Chart.js", "MySQL", "Linux"],
    },
  ],

  projects: [
    {
      name: "EduSync",
      tag: "Campus Collaboration & Digital University Platform",
      status: "LIVE",
      period: "2026",
      url: "https://github.com/pbs002-s/EduSync",
      role: "Full-Stack Architect",
      blurb:
        "A multi-tenant digital campus collaboration platform unifying 4 role-scoped portals (Student, Teacher, Super Admin, and Campus Authority) with real-time Socket.IO messaging over Redis Pub/Sub, academic lifecycle management, routine conflict detection, and background queue workers.",
      highlights: [
        "4 role-scoped portals over a unified React 19 shell: Student, Teacher, Super Admin & Authority",
        "Real-time 1-on-1 & study group push messaging powered by Node.js, Socket.IO and Redis Pub/Sub",
        "Academic lifecycle engine with automated routine conflict detection, course enrollment & submission grading queues",
      ],
      stack: ["React 19", "TypeScript", "Laravel 13", "Node.js", "Socket.IO", "PostgreSQL", "Redis", "Docker"],
    },
    {
      name: "BhashaBot",
      tag: "AI Multilingual Messenger Auto-Reply",
      status: "LIVE",
      period: "2026 — Present",
      url: "https://github.com/pbs002-s/BhashaBot",
      role: "Solo Creator",
      blurb:
        "Automated Facebook Messenger support with an n8n workflow that detects customer language across 18 languages — including native Bangla/Banglish — using a single GPT-4o call to return reply, sentiment, intent, lead data, and a human-handoff flag.",
      highlights: [
        "Multilingual NLP auto-reply across 18 languages including native Bangla and Banglish",
        "One-webhook, one-decision-point architecture auto-routing refunds & emergencies to human agents",
        "Full lead extraction, sentiment analysis, and customer intent classification",
      ],
      stack: ["TypeScript", "Next.js 14", "n8n", "GPT-4o", "Groq", "Llama 3.3", "libSQL"],
    },
    {
      name: "EMG ALS Screening Platform",
      tag: "Multi-Modal Clinical AI (medicalLLM)",
      status: "RESEARCH",
      period: "2026",
      url: "https://github.com/pbs002-s/medicalLLM",
      role: "Solo Creator",
      blurb:
        "An end-to-end clinical neurophysiology platform that screens for Amyotrophic Lateral Sclerosis from raw EMG signals, fusing a 1-D CNN over the waveform with a Florence-2 vision-language model over spectrogram plots, then reconciling both through an XGBoost meta-learner.",
      highlights: [
        "Multi-modal fusion: 1-D deep CNN on raw EMG + Florence-2 VLM on raster/spectrogram plots",
        "Explainable by design — 1-D Grad-CAM anomaly windows and Tree SHAP feature attribution",
        "Gemini-powered clinical assistant scoped strictly to EMG analysis, with React 18 + Vite intake UI",
      ],
      stack: ["Python", "PyTorch", "Florence-2", "XGBoost", "Grad-CAM", "SHAP", "Gemini API", "React", "TypeScript"],
    },
    {
      name: "DIU Routine",
      tag: "Offline Android Class Scheduler",
      status: "LIVE",
      period: "2026",
      url: "https://github.com/pbs002-s/diu-routine",
      role: "Creator & Maintainer",
      blurb:
        "A native Kotlin & Jetpack Compose Android app that scans uploaded routine PDFs/DOCX with Gemini Vision to auto-extract dates, times, rooms, and course codes into a fully offline timetable.",
      highlights: [
        "Gemini Vision auto-extraction of dates, times, rooms, and course codes from scanned PDFs",
        "Smart pre-class reminders and on-device attendance & study-streak tracking",
        "100% offline persistence using Room Database",
      ],
      stack: ["Kotlin", "Jetpack Compose", "Android", "Gemini Vision", "Room DB", "Python"],
    },
    {
      name: "OpenGovtBD",
      tag: "Government–Citizen Engagement Platform",
      status: "LIVE",
      period: "2025 — 2026",
      url: "https://github.com/pbs002-s/OpenGovtBD",
      live: "https://opengovtbd.onrender.com/",
      role: "Full-Stack Developer",
      blurb:
        "A role-driven civic platform built on Java 17 and Spring Boot 3 MVC — Citizen, Officer and Super Admin workspaces covering the full complaint lifecycle, moderated public discussions, official polls, a suggestion box, and an analytics dashboard.",
      highlights: [
        "Three role-based workspaces over an abstract User hierarchy — Citizen, Officer, Super Admin",
        "Complaint lifecycle with timeline tracking, officer replies, citizen ratings and a reopen flow",
        "Gamified participation (points & badges), notification centre, and Chart.js admin analytics",
      ],
      stack: ["Java 17", "Spring Boot", "Thymeleaf", "Maven", "Chart.js", "REST APIs"],
    },
    {
      name: "BhoomiSheba",
      tag: "Cadastral Automation Platform",
      status: "LIVE",
      period: "2026",
      url: "https://github.com/pbs002-s/BhoomiSheba",
      role: "Solo Creator",
      blurb:
        "Next-gen Bangladesh land automation platform: PostGIS spatial GIS, e-mutation tracking, multi-source cross-audits, and instant QR-verified e-Dakhila generation.",
      highlights: [
        "PostGIS spatial queries over cadastral parcel data",
        "e-Mutation tracking workflow with multi-source cross-audits",
        "QR-verified e-Dakhila document generation",
      ],
      stack: ["TypeScript", "React", "PostGIS", "Node.js", "Leaflet"],
    },
  ],

  // open-source / personal builds (github.com/pbs002-s) — shown in Work + skill graph
  ghProjects: [
    {
      name: "EduSync", short: "EduSync", gh: "EduSync", status: "OPEN SOURCE", lang: "TypeScript",
      tag: "Digital University Platform", role: "Architect & Creator", period: "Open source · React 19 / Laravel / Socket.IO", reel: "edusync",
      blurb: "Multi-tenant digital university platform: 4 role-scoped portals, real-time Socket.IO messaging over Redis Pub/Sub, PostgreSQL full-text search & Docker orchestration.",
      highlights: ["4 role-scoped portals over 1 unified shell", "Socket.IO + Redis Pub/Sub realtime messaging", "Academic routine conflict detection & grading queues"],
      stack: ["React 19", "TypeScript", "Laravel 13", "Node.js", "Socket.IO", "PostgreSQL", "Redis", "Docker"],
    },
    {
      name: "BhashaBot", short: "BhashaBot", gh: "BhashaBot", status: "OPEN SOURCE", lang: "TypeScript",
      tag: "Multilingual AI Messenger Agent", role: "Creator", period: "Open source · TypeScript", reel: "bhashabot",
      blurb: "Automated Facebook Messenger support detecting 18 languages with GPT-4o, intent classification, and human handoff routing.",
      highlights: ["18 languages including Bangla/Banglish", "One-webhook decision point", "Lead data & sentiment analysis"],
      stack: ["TypeScript", "Next.js 14", "GPT-4o", "n8n", "libSQL"],
    },
    {
      name: "EMG ALS Screening Platform", short: "medicalLLM", gh: "medicalLLM", status: "OPEN SOURCE", lang: "Jupyter Notebook",
      tag: "Multi-Modal Clinical AI", role: "Creator", period: "Open source · Python / Jupyter", reel: "signal",
      blurb: "ALS screening from raw EMG: 1-D CNN + Florence-2 vision-language model fused by an XGBoost meta-learner, with Grad-CAM and SHAP explainability.",
      highlights: ["1-D CNN over raw EMG waveforms", "Florence-2 VLM on spectrogram plots", "Grad-CAM + Tree SHAP explainability"],
      stack: ["Python", "PyTorch", "Florence-2", "XGBoost", "Gemini API"],
    },
    {
      name: "DIU Routine", short: "DIURoutine", gh: "diu-routine", status: "OPEN SOURCE", lang: "Kotlin",
      tag: "Offline Android Scheduler", role: "Creator", period: "Open source · Kotlin", reel: "diuroutine",
      blurb: "Native Kotlin & Jetpack Compose Android app with Gemini Vision PDF routine parser, offline Room storage, and study tracking.",
      highlights: ["Gemini Vision OCR extraction", "Room DB local persistence", "Attendance & streak tracking"],
      stack: ["Kotlin", "Jetpack Compose", "Android", "Room DB", "Gemini Vision"],
    },
    {
      name: "OpenGovtBD", short: "OpenGovtBD", gh: "OpenGovtBD", status: "OPEN SOURCE", lang: "Java",
      tag: "Govt-Citizen Engagement", role: "Creator", period: "Open source · Java", reel: "opengovtbd",
      blurb: "Java 17 + Spring Boot 3 civic platform with Citizen, Officer and Super Admin workspaces for complaints, discussions, polls and suggestions.",
      highlights: ["Three role-based workspaces", "Full complaint lifecycle & timeline", "Gamified points, badges and analytics"],
      stack: ["Java 17", "Spring Boot", "Thymeleaf", "Maven", "Chart.js"],
    },
    {
      name: "BhoomiSheba", short: "BhoomiSheba", gh: "BhoomiSheba", status: "OPEN SOURCE", lang: "TypeScript",
      tag: "Cadastral Automation Platform", role: "Creator", period: "Open source · TypeScript", reel: "bhoomisheba",
      blurb: "Next-gen Bangladesh land automation platform: PostGIS spatial GIS, e-mutation tracking, multi-source cross-audits & instant QR e-Dakhila.",
      highlights: ["PostGIS spatial queries", "e-Mutation tracking workflow", "QR-verified e-Dakhila generation"],
      stack: ["TypeScript", "React", "PostGIS", "Node.js", "Leaflet"],
    },
  ],

  experience: [
    {
      role: "App & Web Developer",
      org: "Independent & Open Source Products",
      period: "2024 — Present",
      place: "Dhaka, Bangladesh",
      desc: "Architected and shipped production-grade distributed and AI-integrated software products solo end-to-end: EduSync (digital university collaboration platform), BhashaBot (multilingual AI customer agent), OpenGovtBD (Spring Boot civic engagement platform), and DIU Routine (Gemini Vision Android scheduler).",
    },
    {
      role: "Competitive Programmer",
      org: "LeetCode & Codeforces",
      period: "2024 — Present",
      place: "Dhaka, Bangladesh",
      desc: "Actively solving algorithmic challenges across LeetCode (Pritam_002) and Codeforces (Pritam-580), practicing data structures, graph theory, and dynamic programming.",
    },
  ],

  education: [
    {
      degree: "B.Tech, Computer Science & Engineering",
      org: "Daffodil International University",
      period: "2nd Year | Expected Graduation: 2028",
      place: "Dhaka, Bangladesh",
      extra: "CSE Undergraduate · Focus on Full-Stack, Mobile & AI Systems",
    },
  ],

  certifications: [
    { title: "National Science Fair Certificate of Recognition", by: "Government of Bangladesh" },
    { title: "Digital Bangladesh Certificate", by: "Government of Bangladesh" },
    { title: "Civic & Academic Participation Certificates", by: "Government & Academic Institutions" },
  ],

  achievements: [
    { title: "1st Place, Institutional Science Fair", by: "Won 3 consecutive years" },
    { title: "Government of Bangladesh Recognition", by: "National Science Fair & Digital Bangladesh" },
    { title: "Competitive Programmer", by: "LeetCode (Pritam_002) & Codeforces (Pritam-580)" },
    { title: "350+ GitHub Contributions", by: "Shipped 4 production-grade AI-integrated apps" },
  ],

  cv: {
    title: "Pritam Biswas — Curriculum Vitae",
    file: "Pritam_Biswas_CV.pdf",
    label: "PDF · Official Resume",
    note: "Official 2-page CV — preview directly online or download the PDF copy.",
  },

  socials: [
    { label: "GitHub", url: "https://github.com/pbs002-s", key: "github" },
    { label: "LeetCode", url: "https://leetcode.com/u/Pritam_002/", key: "leetcode" },
    { label: "Codeforces", url: "https://codeforces.com/profile/Pritam-580", key: "codeforces" },
    { label: "Facebook", url: "https://www.facebook.com/pbs.020", key: "facebook" },
    { label: "Instagram", url: "https://www.instagram.com/swagoto_pritom/", key: "instagram" },
    { label: "Portfolio", url: "https://pritam-biswas-portfolio.netlify.app", key: "site" },
    { label: "Email", url: "mailto:pritam020s2@gmail.com", key: "email" },
  ],
};

/* ------------------------------------------------------------
   `projects` (editorial copy) and `ghProjects` (repo metadata) describe the
   same four products. Anything that renders "the projects" must merge them,
   or the item shows up twice — which is what happened in the Selected Work
   stack and again in the skill graph. One helper, so every caller agrees.
------------------------------------------------------------ */
window.DATA.mergedProjects = function () {
  const D = window.DATA;
  const key = (n) => n.replace(/\(.*?\)/g, "").replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
  const repoUrl = (gh) => gh === D.identity.handle
    ? "https://github.com/" + D.identity.handle + "?tab=repositories"   // profile, not a repo
    : "https://github.com/" + D.identity.handle + "/" + gh;

  const order = [];
  const byKey = new Map();
  const put = (p) => {
    const k = key(p.name);
    if (byKey.has(k)) { byKey.set(k, Object.assign({}, p, byKey.get(k))); return; }  // first wins
    byKey.set(k, p); order.push(k);
  };

  (D.projects || []).forEach(put);
  (D.ghProjects || []).forEach((p) => put(Object.assign({}, p, {
    repo: p.gh, url: repoUrl(p.gh), oss: true,
  })));

  return order.map((k) => byKey.get(k));
};
