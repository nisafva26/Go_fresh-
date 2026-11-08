# GO FRESH website

Futuristic one-page experience for GO FRESH (Kanza & Miya eggs, Dubai): real-time 3D egg (Three.js), HUD interface, scroll-driven supply-network visualisation.

Plain HTML/CSS/JS — no build step. Deploy the repo root to Netlify as-is.

- `index.html` — page markup
- `css/style.css` — styles and design tokens
- `js/main.js` — UI, scroll choreography (GSAP + ScrollTrigger + Lenis), product data, filters, form, Dubai open/closed status
- `js/scene.js` — WebGL egg scene (Three.js); follows section targets set in `STAGES` in main.js
- `js/vendor/` — GSAP 3.12.5, ScrollTrigger, Lenis 1.1.13, Three.js 0.160 (bundled locally)
- `_redirects` — old `/about`, `/product`, `/contact` URLs point to the matching sections

To edit products, change the `PRODUCTS` array at the top of `js/main.js`.
The contact form uses Netlify Forms (enable form detection in the Netlify dashboard).
