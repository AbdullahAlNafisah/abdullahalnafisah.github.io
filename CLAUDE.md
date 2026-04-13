# abdullahalnafisah.github.io

## Project Purpose

Personal academic portfolio website for Abdullah Al-Nafisah, hosted on GitHub Pages. It presents his biography, publications, engineering projects, and conference posters. The site is intentionally minimal — plain HTML, CSS, and vanilla JavaScript with no framework, no bundler, and no build step. Pushing to `main` deploys immediately via GitHub Pages.

---

## Module Layout

```
abdullahalnafisah.github.io/
├── index.html            # Homepage: bio, profile photo, social links
├── archive.html          # Publications, projects, and posters listing
├── style.css             # Single shared stylesheet for all pages
├── html_header.js        # Injects shared <nav> into every page at runtime
├── html_footer.js        # Injects shared footer (live Riyadh clock) at runtime
├── profile.jpg           # Profile photo (circular, 200×200 px display)
├── posters/              # PDF posters linked from archive.html
│   ├── exit-chart/
│   ├── senior-project/
│   ├── spin-logic/
│   └── seismic-acquisition/
└── projects/             # One subdirectory per featured project
    ├── chaotic_oscillators/
    ├── fpga_graphics_control/
    ├── fpga_localization/
    ├── seismic_acquisition/
    └── tunable_comb_filter/
```

### `index.html`
Homepage. Contains:
- Arabic Basmala/greeting banner (RTL, dark background)
- Profile photo (`profile.jpg`, circular)
- Social links (LinkedIn, Facebook, X/Twitter, Instagram) via Font Awesome icons
- Short bio paragraph describing current role at NTIS, KAUST M.Sc., KFUPM B.Sc., Georgia Tech exchange

### `archive.html`
Lists all publications (IEEE/journal papers), project pages, and PDF posters with external links.

### `html_header.js` / `html_footer.js`
Shared layout components injected at runtime via `document.getElementById(...).innerHTML`. Every HTML page must include:
```html
<header id="common-header"></header>
...
<footer id="common-footer"></footer>
<script src="html_header.js"></script>
<script src="html_footer.js"></script>
```
- **Header**: `<nav>` with Home and Archive links (absolute paths `/index.html`, `/archive.html`).
- **Footer**: Live clock displaying the current time in Asia/Riyadh (GMT+3), updated every second.

### `projects/`
Each subdirectory contains an HTML page (and assets) for a specific engineering project. Projects are linked from `archive.html` using absolute root-relative paths (`/projects/<name>/<name>.html`).

---

## Coding Conventions

- **No frameworks, no build tools.** Everything is plain HTML5, CSS3, and vanilla JS. Do not introduce npm, React, or any bundler.
- **Shared layout via JS injection** — do not duplicate nav/footer HTML. Add the `common-header` / `common-footer` pattern to every new page.
- **Root-relative links** — use `/index.html`, `/archive.html`, `/projects/...` (not relative `./` or `../`) so links work correctly from any subdirectory depth.
- **Google Fonts** — loaded via `<link>` preconnect. Current fonts: *Amiri* (Arabic), *Edu NSW ACT Cursive* (headings). Add new fonts in the same `<head>` block.
- **Font Awesome 6.5** — loaded from cdnjs for social icons. Use `fa-brands` class for brand icons.
- **Inline styles** are used for one-off layout tweaks; `style.css` is used for structural/repeated rules.
- **Google Analytics** — tag `G-SPEP808K2E` is included on every page via the deferred GTM script. Keep it on any new pages added.
- **Google Site Verification** meta tag (`WpzyAhc3YcZBRUftVh0ZAnBCio0hivIyIASDU_4T8wk`) must remain on `index.html` and `archive.html`.

---

## Important Context

- **Deployment**: GitHub Pages serves the repo root on `main` directly. There is no CI pipeline — a commit is a deploy.
- **No local server required** to edit, but browser security may block the JS injection when opening files directly from disk (`file://`). Use a local HTTP server (e.g., `python3 -m http.server`) to test layout changes involving `html_header.js` / `html_footer.js`.
- **Timezone**: The footer clock is hardcoded to `Asia/Riyadh`. Do not change this.
- **Language**: The page is in English. The Arabic text at the top of `index.html` is the Basmala and Islamic greeting — do not remove or alter it.
- **Profile photo**: `profile.jpg` is ~930 KB. If replacing, keep the filename and aspect ratio (displayed as 200×200 circular via CSS `border-radius: 50%`).
- **Adding a new project**: Create `projects/<name>/` with an HTML page, link it from `archive.html` in the Projects `<ul>`, and include the shared header/footer JS.
- **Adding a new poster**: Place the PDF under `posters/<name>/poster.pdf` and link from `archive.html`.
