# Go Fresh website

Editorial one-page site for Go Fresh (Kanza & Miya eggs, Dubai).

Plain HTML/CSS/JS — no build step. Deploy the repo root to Netlify as-is.

**Design system**
- Palette: paper `#F5EDE0`, ink `#2A1A12`, yolk `#F0912A` / `#D2611B`; accents tile `#3A9BA6`, cherry `#A3191B`, apricot `#F4D6AE`, mint `#CFE4D8`
- Type: Gloock (display serif), Mr Dafoe (script accents), DM Sans (text)

**Files**
- `index.html` — markup
- `css/style.css` — tokens and styles
- `js/main.js` — product data (`PRODUCTS`), filters, form, scroll animations (GSAP + ScrollTrigger + Lenis)
- `js/vendor/` — GSAP 3.12.5, ScrollTrigger, Lenis 1.1.13
- `_redirects` — old `/about`, `/product`, `/contact` URLs point to the matching sections

The contact form uses Netlify Forms (enable form detection in the Netlify dashboard).
