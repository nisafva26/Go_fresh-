/* GO FRESH — futuristic edition: UI, scroll choreography, data */
(() => {
  'use strict';

  const WA = '971506261523';
  const waLink = (t) => `https://wa.me/${WA}?text=${encodeURIComponent(t)}`;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const hasGsap = !!(window.gsap && window.ScrollTrigger);
  const isMobile = () => innerWidth < 900;

  $('.year').textContent = new Date().getFullYear();

  /* ---------------------------------------------------------
     Shared state read by the WebGL scene (js/scene.js)
     --------------------------------------------------------- */
  const egg = window.__egg = { x: 1.6, y: 0, s: 1.1, explode: 0, alpha: 1, spin: 0, ready: false };

  /* ---------------------------------------------------------
     Inventory data
     --------------------------------------------------------- */
  const PRODUCTS = [
    { sku: 'KZ-30-W', brand: 'kanza', name: 'Kanza 30 White', color: 'white', img: 'kanza-30-white', tags: ['30 PCS', 'FARM FRESH', 'LARGE'] },
    { sku: 'KZ-15-W', brand: 'kanza', name: 'Kanza 15 White', color: 'white', img: 'kanza-15-white', tags: ['15 PCS', 'FARM FRESH', 'GRADE AA'] },
    { sku: 'KZ-06-W', brand: 'kanza', name: 'Kanza 6 White', color: 'white', img: 'kanza-6-white', tags: ['6 PCS', 'FARM FRESH', 'SAMPLER'] },
    { sku: 'KZ-S6', brand: 'kanza', name: 'Kanza Super 6', color: 'super', img: 'kanza-super-6', tags: ['6 PCS', 'EXTRA LARGE', 'PREMIUM', 'OMEGA‑3'] },
    { sku: 'KZ-30-B', brand: 'kanza', name: 'Kanza 30 Brown', color: 'brown', img: 'kanza-30-brown', tags: ['30 PCS', 'RICH YOLK', 'LARGE'] },
    { sku: 'KZ-15-B', brand: 'kanza', name: 'Kanza 15 Brown', color: 'brown', img: 'kanza-15-brown', tags: ['15 PCS', 'NUTRIENT RICH', 'GRADE AA'] },
    { sku: 'KZ-06-B', brand: 'kanza', name: 'Kanza 6 Brown', color: 'brown', img: 'kanza-6-brown', tags: ['6 PCS', 'SAMPLER', 'NUTRIENT RICH'] },
    { sku: 'MY-30-W', brand: 'miya', name: 'Miya 30 White', color: 'white', img: 'miya-30-white', tags: ['30 PCS', 'GREAT VALUE', 'DAILY FRESH'] },
    { sku: 'MY-15-W', brand: 'miya', name: 'Miya 15 White', color: 'white', img: 'miya-15-white', tags: ['15 PCS', 'AFFORDABLE', 'DAILY FRESH'] },
    { sku: 'MY-06-W', brand: 'miya', name: 'Miya 6 White', color: 'white', img: 'miya-6-white', tags: ['6 PCS', 'BUDGET', 'TRIAL SIZE'] },
  ];
  const grid = $('.grid');
  grid.innerHTML = PRODUCTS.map((p) => `
    <article class="card card--${p.brand} holo" data-brand="${p.brand}" data-color="${p.color}" data-cursor="ORDER">
      <div class="card__top mono"><span>${p.sku}</span><b>● ${p.brand.toUpperCase()}</b></div>
      <div class="capsule"><img src="/images/${p.img}.webp" alt="${p.name} eggs" loading="lazy" /></div>
      <div class="card__body">
        <h3>${p.name}</h3>
        <div class="chips">${p.tags.map((t) => `<span>${t}</span>`).join('')}</div>
        <a class="card__order" href="${waLink(`Hi GO FRESH, I'd like to order ${p.name} eggs (${p.sku}).`)}" target="_blank" rel="noopener">
          <span>REQUEST VIA WHATSAPP</span><span>↗</span>
        </a>
      </div>
    </article>`).join('');

  /* Filter + sliding pill */
  const cards = $$('.card');
  const segBtns = $$('.seg button');
  const pill = $('.seg__pill');
  const movePill = () => {
    const a = $('.seg button.is-active');
    pill.style.width = a.offsetWidth + 'px';
    pill.style.transform = `translateX(${a.offsetLeft}px)`;
  };
  function applyFilter(f) {
    segBtns.forEach((b) => { const on = b.dataset.filter === f; b.classList.toggle('is-active', on); b.setAttribute('aria-selected', on); });
    movePill();
    const match = (c) => f === 'all' || c.dataset.brand === f || c.dataset.color === f;
    cards.forEach((c) => c.classList.toggle('is-hidden', !match(c)));
    if (hasGsap && !reduceMotion) {
      gsap.fromTo(cards.filter(match), { opacity: 0, y: 30, filter: 'blur(8px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', duration: .6, stagger: .04, ease: 'power3.out', overwrite: true });
      ScrollTrigger.refresh();
    }
  }
  segBtns.forEach((b) => b.addEventListener('click', () => applyFilter(b.dataset.filter)));
  $$('[data-filter-link]').forEach((b) => b.addEventListener('click', () => {
    applyFilter(b.dataset.filterLink);
    scrollToTarget($('#inventory'));
  }));
  addEventListener('resize', movePill);
  document.fonts && document.fonts.ready.then(movePill);
  movePill();

  /* Holographic glare follows the pointer */
  if (finePointer) {
    document.addEventListener('pointermove', (e) => {
      const h = e.target.closest && e.target.closest('.holo');
      if (!h) return;
      const r = h.getBoundingClientRect();
      h.style.setProperty('--mx', `${e.clientX - r.left}px`);
      h.style.setProperty('--my', `${e.clientY - r.top}px`);
    });
  }

  /* ---------------------------------------------------------
     Dubai clock + open/closed status (Mon–Sat 08:00–18:00)
     --------------------------------------------------------- */
  function tickClock() {
    const parts = Object.fromEntries(new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Dubai', weekday: 'short', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).formatToParts(new Date()).map((p) => [p.type, p.value]));
    const h = +parts.hour % 24, m = +parts.minute;
    const open = parts.weekday !== 'Sun' && h >= 8 && h < 18;
    $('.js-status').textContent = `DUBAI ${String(h).padStart(2, '0')}:${parts.minute}:${parts.second} GST`;
    $('.js-open').textContent = open
      ? `OPEN NOW — ${String(17 - h).padStart(2, '0')}h ${String(59 - m).padStart(2, '0')}m until close`
      : 'CLOSED — back Mon–Sat 08:00 GST · WhatsApp anytime';
    $$('.open-state .led').forEach((l) => l.classList.toggle('is-off', !open));
  }
  tickClock(); setInterval(tickClock, 1000);

  /* Hero readouts */
  setInterval(() => {
    $('.js-temp').textContent = (3.8 + Math.random() * .4).toFixed(1);
    $('.js-idx').textContent = (99.5 + Math.random() * .45).toFixed(1);
  }, 900);
  (function rotLoop() {
    const r = Math.round(((window.__eggRot || 0) % 360 + 360) % 360);
    $('.js-rot').textContent = String(r).padStart(3, '0');
    requestAnimationFrame(rotLoop);
  })();

  /* ---------------------------------------------------------
     Mobile menu
     --------------------------------------------------------- */
  let lenis = null;
  const burger = $('.nav__burger');
  const setMenu = (open) => {
    document.body.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', open);
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    $('.menu').setAttribute('aria-hidden', !open);
    if (lenis) open ? lenis.stop() : lenis.start();
  };
  burger.addEventListener('click', () => setMenu(!document.body.classList.contains('menu-open')));

  function scrollToTarget(el) {
    if (lenis) lenis.scrollTo(el, { duration: 1.6 });
    else el.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
  }
  $$('a[href^="#"]').forEach((a) => a.addEventListener('click', (e) => {
    const id = a.getAttribute('href');
    const t = id === '#top' ? document.body : $(id);
    if (!t) return;
    e.preventDefault();
    if (document.body.classList.contains('menu-open')) setMenu(false);
    if (id === '#top') lenis ? lenis.scrollTo(0, { duration: 1.6 }) : scrollTo({ top: 0, behavior: 'smooth' });
    else scrollToTarget(t);
  }));

  /* Nav state */
  const nav = $('.nav');
  let lastY = scrollY;
  addEventListener('scroll', () => {
    const y = scrollY;
    nav.classList.toggle('is-scrolled', y > 40);
    nav.classList.toggle('is-hidden', y > lastY && y > 500 && !document.body.classList.contains('menu-open'));
    lastY = y;
    const max = document.documentElement.scrollHeight - innerHeight;
    $('.hud__scroll').textContent = String(Math.round((y / Math.max(max, 1)) * 100)).padStart(3, '0');
  }, { passive: true });
  const navLinks = $$('.nav__links a');
  const io = new IntersectionObserver((ents) => ents.forEach((en) => {
    if (en.isIntersecting) navLinks.forEach((l) => l.classList.toggle('is-active', l.getAttribute('href') === '#' + en.target.id));
  }), { rootMargin: '-45% 0px -50% 0px' });
  ['telemetry', 'network', 'inventory', 'contact'].forEach((id) => io.observe(document.getElementById(id)));

  /* ---------------------------------------------------------
     Contact form — Netlify Forms + WhatsApp
     --------------------------------------------------------- */
  const form = $('.terminal');
  const status = $('.terminal__status');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    status.textContent = '> transmitting…';
    try {
      const res = await fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams(new FormData(form)).toString() });
      if (!res.ok) throw new Error(res.status);
      form.reset();
      status.textContent = '> message received. we\'ll be in touch shortly ✓';
    } catch {
      status.textContent = '> link unstable — use WhatsApp or call +971 50 626 1523';
    }
  });
  $('.js-wa').addEventListener('click', () => {
    const f = new FormData(form);
    const lines = [`Hi GO FRESH, this is ${f.get('name') || '…'}.`, f.get('message'), f.get('phone') && `Phone: ${f.get('phone')}`, f.get('email') && `Email: ${f.get('email')}`].filter(Boolean);
    open(waLink(lines.join('\n')), '_blank', 'noopener');
  });

  /* ---------------------------------------------------------
     Network diagram — build nodes & links
     --------------------------------------------------------- */
  const NS = 'http://www.w3.org/2000/svg';
  const mk = (tag, attrs, parent) => { const el = document.createElementNS(NS, tag); for (const k in attrs) el.setAttribute(k, attrs[k]); parent && parent.appendChild(el); return el; };
  const HUB = { x: 400, y: 300 };
  const farms = ['ARABIAN FARMS', 'AL AIN', 'AL JAZEERA', 'KN'];
  const farmG = $('.net__farms'), farmLineG = $('.net__farmlines'), shopG = $('.net__shops'), shopLineG = $('.net__shoplines'), pulseG = $('.net__pulses');
  const farmPaths = farms.map((name, i) => {
    const y = 120 + i * 120;
    const g = mk('g', { class: 'net__farm' }, farmG);
    mk('circle', { cx: 90, cy: y, r: 16 }, g);
    mk('circle', { cx: 90, cy: y, r: 5, class: 'core' }, g);
    const t = mk('text', { x: 90, y: y - 26, 'text-anchor': 'middle', class: 'net__label' }, g); t.textContent = name;
    return mk('path', { d: `M106 ${y} C 250 ${y}, 260 ${HUB.y}, ${HUB.x - 46} ${HUB.y}`, pathLength: 1, 'stroke-dasharray': 1, 'stroke-dashoffset': 1 }, farmLineG);
  });
  const shops = [], shopPaths = [];
  for (let i = 0; i < 100; i++) {
    const col = i % 10, row = Math.floor(i / 10);
    const x = 610 + col * 16, y = 165 + row * 30;
    shops.push(mk('circle', { cx: x, cy: y, r: 3.4 }, shopG));
    if (col === 0) shopPaths.push(mk('path', { d: `M${HUB.x + 46} ${HUB.y} C 520 ${HUB.y}, 540 ${y}, ${x - 8} ${y}`, pathLength: 1, 'stroke-dasharray': 1, 'stroke-dashoffset': 1 }, shopLineG));
  }
  // Pulses that travel along links
  const pulses = [];
  farmPaths.forEach((p) => pulses.push({ path: p, el: mk('circle', { r: 3.5, opacity: 0 }, pulseG), off: Math.random(), speed: .35 + Math.random() * .2, group: 'farm' }));
  shopPaths.forEach((p) => pulses.push({ path: p, el: mk('circle', { r: 2.6, opacity: 0, fill: '#FFB21A' }, pulseG), off: Math.random(), speed: .4 + Math.random() * .3, group: 'shop' }));
  const net = { farm: 0, shop: 0 };
  const lens = new Map(pulses.map((p) => [p.path, p.path.getTotalLength()]));
  (function pulseLoop(t) {
    const time = (t || 0) / 1000;
    for (const p of pulses) {
      const vis = p.group === 'farm' ? net.farm : net.shop;
      const k = (time * p.speed + p.off) % 1;
      const pt = p.path.getPointAtLength(k * lens.get(p.path));
      p.el.setAttribute('cx', pt.x); p.el.setAttribute('cy', pt.y);
      p.el.setAttribute('opacity', vis > .98 ? Math.sin(k * Math.PI).toFixed(2) : 0);
    }
    requestAnimationFrame(pulseLoop);
  })();

  /* Split manifesto for scramble etc. — scramble helper */
  const GLYPHS = '01<>/\\[]{}=+*#%&@$ABCDEFGHJKLMNPQRSTUVWXYZ';
  function scramble(el, dur = 1.2, delay = 0) {
    const final = el.dataset.text || el.textContent;
    const len = final.length;
    const start = performance.now() + delay * 1000;
    return new Promise((res) => {
      (function frame(now) {
        const p = Math.min(Math.max((now - start) / (dur * 1000), 0), 1);
        const solved = Math.floor(p * len);
        let out = '';
        for (let i = 0; i < len; i++) {
          if (final[i] === ' ') out += ' ';
          else if (i < solved) out += final[i];
          else out += p > 0 ? GLYPHS[(Math.random() * GLYPHS.length) | 0] : ' ';
        }
        el.textContent = out;
        if (p < 1) requestAnimationFrame(frame); else { el.textContent = final; res(); }
      })(performance.now());
    });
  }

  /* ---------------------------------------------------------
     Fallback: no GSAP or reduced motion
     --------------------------------------------------------- */
  const boot = $('.boot');
  const endBoot = () => { document.body.classList.remove('is-loading'); boot.remove(); };
  if (!hasGsap || reduceMotion) {
    endBoot();
    egg.ready = true;
    $$('.count').forEach((c) => (c.textContent = c.dataset.pad ? String(c.dataset.to).padStart(+c.dataset.pad, '0') : c.dataset.to));
    $$('.ring__fg').forEach((r) => (r.style.strokeDashoffset = 0));
    $$('[stroke-dashoffset]').forEach((p) => p.setAttribute('stroke-dashoffset', 0));
    shops.forEach((s) => s.classList.add('on')); net.farm = net.shop = 1;
    $('.net__check').setAttribute('opacity', 1);
    $('.net__count').textContent = '100';
    $$('.step').forEach((s) => s.classList.add('is-active'));
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  if (window.Lenis) {
    lenis = new Lenis({ lerp: .09, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    lenis.stop();
  }

  /* ---------------------------------------------------------
     Boot sequence
     --------------------------------------------------------- */
  const LOG = [
    'INIT GO_FRESH://CORE',
    'LOADING FARM SOURCES ........ <b>4 OK</b>',
    'VERIFYING HACCP CERT ........ <b>PASS</b>',
    'SYNCING RETAIL NODES ........ <b>100+</b>',
    'CALIBRATING EGG.UNIT_001 .... <b>OK</b>',
    'FRESHNESS PROTOCOL .......... <b>ONLINE</b>',
  ];
  const logEl = $('.boot__log'), bar = $('.boot__bar span'), pct = $('.boot__pct');
  const prog = { v: 0 };
  let ready = false;
  const sceneReady = new Promise((r) => {
    if (window.__sceneReady) r();
    addEventListener('gf:scene-ready', r, { once: true });
    setTimeout(r, 6000);
  });
  Promise.all([sceneReady, new Promise((r) => (document.readyState === 'complete' ? r() : addEventListener('load', r, { once: true })))]).then(() => (ready = true));

  gsap.to(prog, {
    v: 85, duration: 1.6, ease: 'power1.inOut',
    onUpdate: renderBoot,
    onComplete: function wait() {
      if (!ready) return setTimeout(wait, 80);
      gsap.to(prog, { v: 100, duration: .35, onUpdate: renderBoot, onComplete: launch });
    },
  });
  function renderBoot() {
    const v = prog.v;
    bar.style.width = v + '%';
    pct.textContent = String(Math.round(v)).padStart(3, '0') + '%';
    const n = Math.min(LOG.length, Math.floor((v / 100) * LOG.length) + 1);
    logEl.innerHTML = LOG.slice(0, n).map((l) => '> ' + l).join('\n');
  }

  function launch() {
    gsap.timeline({ onComplete: () => { endBoot(); lenis && lenis.start(); ScrollTrigger.refresh(); } })
      .to(boot, { clipPath: 'polygon(0 0, 100% 0, 100% 0, 0 0)', duration: .9, ease: 'expo.inOut' })
      .add(() => {
        egg.ready = true;
        $$('.hero .scramble').forEach((el, i) => scramble(el, .9 + i * .15, i * .12));
      }, '-=.5')
      .from(['.hero__meta', '.hero__readout', '.hero__side', '.nav', '.hero__scroll'], { opacity: 0, y: 20, duration: .9, stagger: .08, ease: 'power3.out' }, '-=.2');
  }
  boot.style.clipPath = 'polygon(0 0, 100% 0, 100% 100%, 0 100%)';
  $$('.hero .scramble').forEach((el) => (el.textContent = ' '));

  /* ---------------------------------------------------------
     Egg choreography — blend between per-section targets
     --------------------------------------------------------- */
  const STAGES = {
    hero:      { x: 1.75, y: .12, s: 1.05, explode: 0, alpha: 1 },
    telemetry: { x: 3.4, y: .7, s: .5, explode: .45, alpha: .7 },
    network:   { x: 0, y: 0, s: .3, explode: 1.3, alpha: 0 },
    brands:    { x: -3.1, y: .2, s: .55, explode: .5, alpha: .8 },
    inventory: { x: 0, y: 3.4, s: .3, explode: 1, alpha: 0 },
    protocol:  { x: 2.8, y: -.4, s: .7, explode: .25, alpha: .9 },
    contact:   { x: 0, y: -2.7, s: .45, explode: .7, alpha: .6 },
    footer:    { x: 0, y: .4, s: .95, explode: 0, alpha: 1 },
  };
  const MOBILE = { hero: { x: .3, y: .15, s: .5 }, telemetry: { x: 1, y: 2.3, s: .35, alpha: .35 }, brands: { x: -1, y: 2.3, s: .3, alpha: .35 }, protocol: { x: .9, y: 2.3, s: .35, alpha: .4 }, contact: { x: 0, y: -2.6, s: .3, alpha: .4 }, footer: { x: 0, y: 1, s: .5 } };
  let anchors = [];
  const measure = () => {
    anchors = $$('[data-stage]').map((el) => {
      const r = el.getBoundingClientRect();
      const base = STAGES[el.dataset.stage];
      const t = isMobile() ? { ...base, ...(MOBILE[el.dataset.stage] || {}) } : base;
      const top = r.top + scrollY;
      // pinned sections hold their state for the length of the pin
      return { at: top + Math.min(r.height, innerHeight) / 2, end: top + r.height - innerHeight / 2, t };
    }).sort((a, b) => a.at - b.at);
  };
  ScrollTrigger.addEventListener('refresh', measure);
  const smooth = (x) => x * x * (3 - 2 * x);
  gsap.ticker.add(() => {
    if (!anchors.length) return;
    const y = scrollY + innerHeight / 2;
    let target = anchors[0].t;
    for (let i = 0; i < anchors.length; i++) {
      const a = anchors[i], b = anchors[i + 1];
      if (y <= a.at) { target = a.t; break; }
      if (!b) { target = a.t; break; }
      const hold = Math.max(a.end, a.at);
      if (y <= hold) { target = a.t; break; }
      if (y < b.at) {
        const k = smooth((y - hold) / (b.at - hold));
        target = {}; for (const key in a.t) target[key] = a.t[key] + (b.t[key] - a.t[key]) * k;
        break;
      }
    }
    for (const key in target) egg[key] += (target[key] - egg[key]) * .08;
  });
  if (lenis) lenis.on('scroll', ({ velocity }) => { egg.spin = velocity || 0; });

  /* ---------------------------------------------------------
     Section animations
     --------------------------------------------------------- */
  // Manifesto: text lights up as you read
  gsap.to('.fill-text', { backgroundSize: '100% 100%, 100% 100%', ease: 'none', scrollTrigger: { trigger: '.manifesto', start: 'top 80%', end: 'bottom 40%', scrub: true } });

  // Telemetry panels
  ScrollTrigger.create({
    trigger: '.panels', start: 'top 85%', once: true,
    onEnter: () => {
      gsap.from('.panel', { y: 60, opacity: 0, duration: 1, stagger: .1, ease: 'power3.out' });
      gsap.to('.ring__fg', { strokeDashoffset: 0, duration: 2, stagger: .15, ease: 'power3.inOut' });
      $$('.count').forEach((el) => {
        const o = { v: 0 };
        gsap.to(o, { v: +el.dataset.to, duration: 2, ease: 'power3.out', onUpdate: () => (el.textContent = String(Math.round(o.v)).padStart(+(el.dataset.pad || 0), '0')) });
      });
      $$('.panel__num--word').forEach((el, i) => { el.dataset.text = el.textContent; scramble(el, 1.2, .3 + i * .2); });
    },
  });

  // Network — pinned build-up
  const steps = $$('.step');
  const countEl = $('.net__count');
  const netTl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: {
      trigger: '.network', start: 'top top', end: () => '+=' + innerHeight * 3, pin: '.network__pin', scrub: .6, anticipatePin: 1,
      onUpdate: (self) => {
        const idx = Math.min(4, Math.floor(self.progress * 5.2));
        steps.forEach((s, i) => { s.classList.toggle('is-active', i === idx); s.classList.toggle('is-done', i < idx); });
        $('.network__bar span').style.transform = `scaleX(${self.progress})`;
      },
    },
  });
  netTl
    .from('.net__farm', { opacity: 0, scale: 0, transformOrigin: 'center', stagger: .02, duration: .06 }, 0)
    .to(farmPaths, { attr: { 'stroke-dashoffset': 0 }, stagger: .02, duration: .12 }, .04)
    .to(net, { farm: 1, duration: .01 }, .2)
    .from('.net__hub', { scale: .6, opacity: .3, svgOrigin: '400 300', duration: .1 }, .15)
    .to('.net__check', { attr: { opacity: 1 }, duration: .04 }, .3)
    .to('.net__hubglow', { scale: 1.35, svgOrigin: '400 300', duration: .08, yoyo: true, repeat: 1 }, .45)
    .to(shopPaths, { attr: { 'stroke-dashoffset': 0 }, stagger: .015, duration: .1 }, .58)
    .to(net, { shop: 1, duration: .01 }, .74)
    .to({ n: 0 }, {
      n: 100, duration: .22,
      onUpdate: function () {
        const n = Math.round(this.targets()[0].n);
        shops.forEach((s, i) => s.classList.toggle('on', i < n));
        countEl.textContent = String(n).padStart(3, '0');
      },
    }, .76)
    .to({}, { duration: .04 });

  // Generic reveals
  $$('.h2').forEach((h) => gsap.from(h, { y: 60, opacity: 0, filter: 'blur(10px)', duration: 1.1, ease: 'expo.out', scrollTrigger: { trigger: h, start: 'top 88%' } }));
  $$('.tag').forEach((t) => {
    t.dataset.text = t.textContent;
    ScrollTrigger.create({ trigger: t, start: 'top 90%', once: true, onEnter: () => scramble(t, .8) });
  });
  gsap.from('.unit', { y: 100, opacity: 0, duration: 1.2, stagger: .15, ease: 'expo.out', scrollTrigger: { trigger: '.units', start: 'top 85%' } });
  ScrollTrigger.batch('.card', { start: 'top 92%', once: true, onEnter: (els) => gsap.from(els, { y: 60, opacity: 0, duration: .9, stagger: .07, ease: 'power3.out' }) });
  gsap.from('.proto', { y: 80, opacity: 0, duration: 1, stagger: .12, ease: 'expo.out', scrollTrigger: { trigger: '.protocols', start: 'top 85%' } });
  gsap.fromTo('.mega__row', { xPercent: 0 }, { xPercent: -35, ease: 'none', scrollTrigger: { trigger: '.protocol', start: 'top bottom', end: 'bottom top', scrub: true } });
  gsap.from('.channels li', { x: -40, opacity: 0, stagger: .08, duration: .9, ease: 'power3.out', scrollTrigger: { trigger: '.channels', start: 'top 88%' } });
  gsap.from('.terminal', { y: 80, opacity: 0, duration: 1.1, ease: 'expo.out', scrollTrigger: { trigger: '.terminal', start: 'top 88%' } });
  gsap.from('.footer__mega', { yPercent: 40, opacity: 0, letterSpacing: '0em', duration: 1.4, ease: 'expo.out', scrollTrigger: { trigger: '.footer', start: 'top 85%' } });

  // Hero text drifts as you leave
  gsap.to('.hero__title', { yPercent: -18, opacity: .15, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

  /* ---------------------------------------------------------
     Cursor + card tilt (desktop)
     --------------------------------------------------------- */
  if (finePointer) {
    const cur = $('.cursor'), label = $('.cursor__label');
    const cx = gsap.quickTo(cur, 'x', { duration: .2, ease: 'power3' });
    const cy = gsap.quickTo(cur, 'y', { duration: .2, ease: 'power3' });
    addEventListener('mousemove', (e) => { cx(e.clientX); cy(e.clientY); cur.classList.add('is-visible'); window.__mouse = { x: e.clientX / innerWidth - .5, y: e.clientY / innerHeight - .5 }; });
    document.addEventListener('mouseleave', () => cur.classList.remove('is-visible'));
    document.addEventListener('mouseover', (e) => {
      const t = e.target.closest('[data-cursor]');
      cur.classList.toggle('is-hover', !!t);
      label.textContent = t ? t.dataset.cursor : '';
    });
    $$('.card, .unit').forEach((c) => {
      const rx = gsap.quickTo(c, 'rotationX', { duration: .5, ease: 'power3' });
      const ry = gsap.quickTo(c, 'rotationY', { duration: .5, ease: 'power3' });
      gsap.set(c, { transformPerspective: 1000 });
      c.addEventListener('mousemove', (e) => {
        const r = c.getBoundingClientRect();
        ry(((e.clientX - r.left) / r.width - .5) * 8);
        rx(-((e.clientY - r.top) / r.height - .5) * 8);
      });
      c.addEventListener('mouseleave', () => { rx(0); ry(0); });
    });
  }
})();
