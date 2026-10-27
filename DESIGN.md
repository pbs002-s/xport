# Design System: Editorial Engineering Interface

## 1. Visual Theme & Atmosphere
* **Design Philosophy:** Editorial Engineering — tactile, Swiss-influenced typography paired with technical rigor and warm minimalism. The visual language balances high-agency editorial layout (generous tracking, italicized serif accents, tactile micro-feedback) with precise developer aesthetics (monospaced metadata, subtle structural hairpins, and data-dense readouts).
* **Density:** `4/10` (Daily App Balanced) — generous breathing room, structured paddings, uncluttered spatial zones.
* **Variance:** `7/10` (Offset Asymmetric) — deliberate tension between stark left-aligned grids, offset media backplates, and asymmetric text arrangements.
* **Motion:** `6/10` (Fluid Physics & Micro-Feedback) — buttery smooth spring curves, hardware-accelerated transforms (`translate3d`, `scale`, `opacity`), and opacity cross-faded elevation shadows. Zero jank, no layout thrashing.

---

## 2. Color Calibration & Palette Roles

### Light Theme (Default — Warm Paper)
* **Canvas Paper** (`--paper`): `#FBFBFA` — Base viewport background, warm off-white canvas avoiding clinical starkness.
* **Elevated Paper** (`--paper-2`): `#F2F2F0` — Subtle nested container backgrounds and secondary surface fills.
* **Pure Surface** (`--surface`): `#FFFFFF` — Primary elevated cards, modals, and spotlight surfaces.
* **Deep Ink** (`--ink`): `#111113` — Primary typography, highest contrast text (Off-Black, never `#000000`).
* **Subtle Ink** (`--ink-2`): `#56565C` — Secondary prose, captions, and structural labels.
* **Muted Ink** (`--ink-3`): `#86868D` — Monospaced metadata, breadcrumbs, timestamp tags, and disabled states.
* **Hairline Border** (`--line`): `rgba(17, 17, 19, 0.10)` — 1px primary structural separation rules.
* **Strong Border** (`--line-2`): `rgba(17, 17, 19, 0.20)` — Hover states, active borders, and container focus rings.
* **Soft Elevation Shadow** (`--shadow`): `0 24px 60px -32px rgba(17, 17, 19, 0.28)` — Diffused ambient shadow layer.

### Dark Theme (Neutral Near-Black)
* **Canvas Paper** (`--paper`): `#0B0B0C` — Primary dark viewport canvas (charcoal zinc, avoiding pure black).
* **Elevated Paper** (`--paper-2`): `#121214` — Secondary dark surfaces, inset cards, and nested blocks.
* **Pure Surface** (`--surface`): `#161618` — Elevated interactive cards, popovers, and floating toolbars.
* **Deep Ink** (`--ink`): `#F4F4F3` — Primary readable text, clean high-contrast bone-white.
* **Subtle Ink** (`--ink-2`): `#A3A3AA` — Secondary descriptions, captions, and muted body copy.
* **Muted Ink** (`--ink-3`): `#74747C` — Technical markers, subtle labels, and inactive elements.
* **Hairline Border** (`--line`): `rgba(244, 244, 243, 0.11)` — 1px dark theme dividers and card borders.
* **Strong Border** (`--line-2`): `rgba(244, 244, 243, 0.20)` — High-contrast hover borders and active cards.
* **Deep Shadow** (`--shadow`): `0 32px 80px -40px #000000` — Deep ambient occlusion for elevated dark surfaces.

### Accent System (Single Focused Accent)
* **Primary Accent** (`--accent`): `#BE123C` (Rose 700 / Crimson Editorial) — CTAs, active pills, text highlights, focus rings.
* **Soft Accent Tint** (`--accent-soft`): `rgba(190, 18, 60, 0.10)` — Badges, tag backgrounds, and subtle highlight fills.
* **Accent Constraints:** Saturation strictly capped below 80%. Multi-color rainbow or neon purple/cyan glows are completely prohibited.

---

## 3. Typographic Architecture

### Typeface Stacks
* **Display / Headings:** `"Inter Tight"`, `"Inter"`, `-apple-system`, `sans-serif`
  * Weight: `600` (Semi-bold) to `700` (Bold)
  * Tracking: Tight (`letter-spacing: -0.025em` to `-0.04em`)
* **Body / Interface:** `"Inter"`, `system-ui`, `-apple-system`, `"Segoe UI"`, `sans-serif`
  * Weight: `400` (Regular) to `500` (Medium)
  * Line Height: `1.55`
  * Tracking: Relaxed neutral (`letter-spacing: -0.006em`)
  * Reading constraint: Max 65 characters per line (`max-width: 65ch`)
* **Editorial Accent (Serif Italic):** `"Instrument Serif"`, `Georgia`, `"Times New Roman"`, `serif`
  * Style: `italic`
  * Weight: `400`
  * Usage: Highlighting emotive words, signature titles, or poetic subheadings
* **Monospace / Technical Data:** `"JetBrains Mono"`, `ui-monospace`, `SFMono-Regular`, `monospace`
  * Weight: `400` to `500`
  * Tracking: `-0.02em`
  * Usage: Version tags, code snippets, keyboard shortcuts, stats labels, timestamps

### Type Scale (Fluid Clamp Hierarchy)
* **Hero Headline:** `clamp(2.5rem, 6.5vw, 5.5rem)` — tight leading (`0.98`), bold impact.
* **Section Title (H2):** `clamp(1.75rem, 3.8vw, 3rem)` — leading `1.15`, negative tracking.
* **Sub-Heading (H3):** `clamp(1.15rem, 2vw, 1.5rem)` — leading `1.3`, weight `600`.
* **Lead Paragraph:** `clamp(1.05rem, 1.3vw, 1.25rem)` — leading `1.6`, muted ink tone.
* **Body Default:** `1rem` (`16px`) / `1.55` line-height.
* **Small / Captions:** `0.85rem` (`13.6px`) — leading `1.45`.
* **Micro / Taglines:** `0.72rem` (`11.5px`) — uppercase, letter-spacing `+0.08em`.

---

## 4. Layout Principles & Spacing Matrix

### Spacing Scale
* **Container Max-Width:** `1280px` (`--maxw`) centered with fluid horizontal gutters.
* **Fluid Gutter:** `clamp(20px, 5vw, 72px)` (`--gutter`).
* **Section Vertical Padding:** `clamp(80px, 11vw, 170px)` (`--pad`).
* **Border Radius Scale:**
  * Small (Badges, Chips, Inputs): `6px`
  * Standard Primitives (Buttons, Cards): `10px` (`--radius`)
  * Elevated Modules / Panels: `16px` to `20px`
  * Pills / Round Badges: `9999px`

### Grid Systems
* **Strict CSS Grid Hierarchy:** Avoid arbitrary percentage flexbox calculations.
* **Hero Layout:** Split-screen or asymmetric editorial alignment. Centered hero rows with stacked generic buttons are prohibited.
* **Card Architecture:** 2-column or 3-column asymmetric masonry grids. 1-column full width stacked on screens `< 768px`.
* **Sticky Navigation & Sidebar Rail:**
  * Top navigation with backdrop blur filter (`backdrop-filter: blur(14px)`).
  * Minimalist vertical progression rail with micro-dot position indicators.

---

## 5. Surface, Elevation & Depth Tokens

* **Grain Overlay:** Fixed procedural fractal noise canvas (`opacity: 0.028` light, `0.04` dark) with `mix-blend-mode: multiply` (light) or `screen` (dark) to impart an analog tactile paper grain.
* **Aurora Atmospheric Glow:** Subdued radial gradient ambient background (`opacity: 0.85` light, `0.6` dark) anchoring spatial depth without high-saturation neon bleed.
* **Hardware-Accelerated Composite Hover Shadows:**
  * Dynamic elevation must NOT animate `box-shadow` directly (prevents GPU paint thrashing).
  * Hover shadow is pre-rendered in a `::after` pseudo-element with `opacity: 0` and transitioned via `opacity` cross-fade (`160ms - 220ms`).

---

## 6. Component Primitives & Styling

### 1. Buttons & Interactive Links
* **Primary Button:**
  * Background: Solid `--accent` (`#BE123C`).
  * Text: High-contrast white (`#FFFFFF`).
  * Padding: `10px 18px` with `10px` border radius.
  * State feedback: Subtle `-1px` vertical translation on hover, scale `0.98` on active click.
* **Ghost / Secondary Button:**
  * Background: Transparent.
  * Border: `1px solid var(--line)`.
  * Hover: Background `--paper-2`, border `--line-2`.
* **Icon Buttons (`.ibtn`):**
  * Proportional circular/square hit area (minimum `44px x 44px`).
  * Click feedback: `transform: scale(0.94)`.

### 2. Cards & Panels
* **Structure:** Background `--surface`, border `1px solid var(--line)`.
* **Hover Interaction:** Subtle `translateY(-3px)`, border turns `--line-2`, shadow fades in smoothly via `::after`.
* **Padding:** Generous internal breathing space (`clamp(18px, 2.5vw, 32px)`).

### 3. Tags, Badges & Chips
* **Status Badges:** Minimalist capsule pill (`padding: 4px 10px`, font size `0.75rem`).
* **Interactive Chips:** Micro-hover shift `translateY(-2px)`, border-color `--accent`.
* **Technical Monospace Tags:** Font `JetBrains Mono`, `0.78rem`, subtle background `--paper-2`.

### 4. Input Fields & Search / Command Palette
* **Structure:** Inset background `--paper-2`, border `1px solid var(--line)`.
* **Focus State:** 2px solid `--accent` ring, `outline-offset: 3px`, no harsh browser default outlines.
* **Labels:** Clean label positioned strictly above the input. Error states placed cleanly below in semantic red.

### 5. Media & Project Viewports
* **Browser Frame Mockups:** Minimalist dot indicators (macOS style window chrome), subtle hairline border, zero cartoon skeuomorphism.
* **Visual Hover Treatment:** Scale `1.02` to `1.04` on inner imagery with smoothed cubic-bezier dampening.

---

## 7. Motion Philosophy & Micro-Interactions

### Timing & Transition Bands
* **Micro-Interactions (`--dur-micro`):** `160ms` with `cubic-bezier(0.4, 0, 0.2, 1)` (Hover, active press, color state).
* **UI Transitions (`--dur-ui`):** `220ms` with `cubic-bezier(0.16, 1, 0.3, 1)` (Dropdowns, modals, drawer entries).
* **Surface Movements (`--dur-slow`):** `420ms` with `cubic-bezier(0.16, 1, 0.3, 1)` (Theme cross-fade, page smooth reveals).

### Rules of Motion
* **Composited Properties Exclusively:** Animate strictly `transform` and `opacity`. Never trigger reflow by animating `top`, `left`, `width`, `height`, or `margin`.
* **Smooth Scrolling:** Integrated Lenis smooth scroll engine with normalized scroll inertia.
* **Reduced Motion Compliance:**
  * Honor `@media (prefers-reduced-motion: reduce)`.
  * Disable translational motion (`transform: none`), zero-out transition delays, switch animations to clean instant opacity cuts.

---

## 8. Anti-Patterns (Banned Visual Patterns)

* **NO AI Cliché Gradients:** No purple-to-cyan neon linear gradients or glowing futuristic blobs.
* **NO Pure Black Surfaces:** Never use `#000000` for backgrounds or text; use calibrated zincs and charcoals (`#0B0B0C`, `#111113`).
* **NO Generic 3-Column Equal Cards:** Do not present repeated uniform cards; break layouts with asymmetric widths, editorial quotes, and media spotlights.
* **NO Layout Thrashing Shadow Animations:** Never animate `box-shadow` values directly in keyframes or hover states.
* **NO Cartoon Emojis:** Ban emojis as UI icons; use precise, crisp SVG linear icons with unified stroke width (`1.5px` to `2px`).
* **NO Bouncing Arrow Fillers:** Prohibit bouncing scroll chevrons, "scroll down to see more" animations, and floating chat bubbles.
* **NO Overlapping Text Layers:** Text and background elements must maintain immaculate legibility without colliding spatial bounds.
