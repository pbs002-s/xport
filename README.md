# Pritam Biswas — Portfolio

Personal developer portfolio. Static site, no build step — React 18 + Babel from CDN, canvas animation, Lenis smooth scroll.

**Live:** [pritam-biswas-portfolio.netlify.app](https://pritam-biswas-portfolio.netlify.app)

## Run locally

```bash
node server.js
```

Then open <http://localhost:3000>. No dependencies to install.

## Layout

```
portfolio/
  index.html         entry point
  css/               design tokens (v3-base) · sections · micro-interactions
  js/data.js         all content — edit copy and projects here
  js/v3-motion.js    one rAF loop: reveals, parallax, scroll pinning
  js/v3-reels.jsx    per-project canvas animations
  js/v3-sections.jsx page sections
  Showreel.html      standalone motion reel
server.js            static file server
```

## Notes

- Content lives in `js/data.js`. Adding a project there updates the work stack, the skill graph, and the showreel.
- Appearance (light/dark/system + accent colour) is user-switchable and persists to `localStorage`.
- Motion respects `prefers-reduced-motion`: smooth scroll, parallax and scroll-pinning are dropped; fades and focus states stay.

## Links

[GitHub](https://github.com/pbs002-s) · [LeetCode](https://leetcode.com/u/Pritam_002/) · [Codeforces](https://codeforces.com/profile/Pritam-580) · [pritam020s2@gmail.com](mailto:pritam020s2@gmail.com)
