/* GO FRESH — interactions & scroll story */
(() => {
  'use strict';

  const WA_NUMBER = '971506261523';
  const waLink = (text) => `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const hasGsap = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';

  $('.year').textContent = new Date().getFullYear();

  /* ---------------------------------------------------------
     Product data (rendered into the grid)
     --------------------------------------------------------- */
  const PRODUCTS = [
    { brand: 'kanza', name: 'Kanza 30', color: 'white', img: 'kanza-30-white', tags: ['30 pieces', 'Farm fresh', 'Large size'] },
    { brand: 'kanza', name: 'Kanza 15', color: 'white', img: 'kanza-15-white', tags: ['15 pieces', 'Farm fresh', 'Grade AA'] },
    { brand: 'kanza', name: 'Kanza 6', color: 'white', img: 'kanza-6-white', tags: ['6 pieces', 'Farm fresh', 'Perfect for sampling'] },
    { brand: 'kanza', name: 'Kanza Super 6', color: 'super', img: 'kanza-super-6', tags: ['6 pieces', 'Extra large', 'Premium quality', 'Rich in Omega‑3'] },
    { brand: 'kanza', name: 'Kanza 30', color: 'brown', img: 'kanza-30-brown', tags: ['30 pieces', 'Rich yolk', 'Large size'] },
    { brand: 'kanza', name: 'Kanza 15', color: 'brown', img: 'kanza-15-brown', tags: ['15 pieces', 'Nutrient rich', 'Grade AA'] },
    { brand: 'kanza', name: 'Kanza 6', color: 'brown', img: 'kanza-6-brown', tags: ['6 pieces', 'Perfect for sampling', 'Nutrient rich'] },
    { brand: 'miya', name: 'Miya 30', color: 'white', img: 'miya-30-white', tags: ['30 pieces', 'Great value', 'Daily fresh'] },
    { brand: 'miya', name: 'Miya 15', color: 'white', img: 'miya-15-white', tags: ['15 pieces', 'Affordable', 'Fresh daily'] },
    { brand: 'miya', name: 'Miya 6', color: 'white', img: 'miya-6-white', tags: ['6 pieces', 'Budget friendly', 'Trial size'] },
  ];

  const grid = $('.grid');
  grid.innerHTML = PRODUCTS.map((p) => {
    const colorLabel = p.color === 'super' ? '' : (p.color === 'brown' ? 'Brown' : 'White');
    const fullName = `${p.name}${colorLabel ? ' ' + colorLabel : ''}`;
    return `
      <article class="card" data-brand="${p.brand}" data-color="${p.color}" data-cursor="Order">
        <div class="card__img">
          <span class="card__brand card__brand--${p.brand}">${p.brand}</span>
          <img src="/images/${p.img}.webp" alt="${fullName} eggs" loading="lazy" width="1000" height="620" />
        </div>
        <div class="card__body">
          <h3><span class="swatch swatch--${p.color}" aria-hidden="true"></span>${fullName}</h3>
          <div class="tags">${p.tags.map((t) => `<span>${t}</span>`).join('')}</div>
          <a class="card__order" href="${waLink(`Hi GO FRESH, I'd like to order ${fullName} eggs.`)}" target="_blank" rel="noopener">
            Order on WhatsApp <span class="arr" aria-hidden="true">→</span>
          </a>
        </div>
      </article>`;
  }).join('');

  /* ---------------------------------------------------------
     Filters
     --------------------------------------------------------- */
  const cards = $$('.card');
  const chips = $$('.chip');
  function applyFilter(f) {
    chips.forEach((c) => {
      const on = c.dataset.filter === f;
      c.classList.toggle('is-active', on);
      c.setAttribute('aria-selected', on);
    });
    const match = (c) => f === 'all' || c.dataset.brand === f || c.dataset.color === f;
    cards.forEach((c) => c.classList.toggle('is-hidden', !match(c)));
    if (hasGsap && !reduceMotion) {
      gsap.fromTo(cards.filter(match), { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: .6, stagger: .05, ease: 'power3.out', overwrite: true });
      ScrollTrigger.refresh();
    }
  }
  chips.forEach((c) => c.addEventListener('click', () => applyFilter(c.dataset.filter)));
  $$('[data-filter-link]').forEach((a) => a.addEventListener('click', () => applyFilter(a.dataset.filterLink)));

  /* ---------------------------------------------------------
     Carton cells (100 shops)
     --------------------------------------------------------- */
  const carton = $('.carton');
  const goldCells = new Set([0, 23, 47, 58, 76, 99]);
  for (let i = 0; i < 100; i++) {
    const cup = document.createElement('div');
    cup.className = 'cup' + (goldCells.has(i) ? ' is-gold' : (i % 7 === 3 || i % 11 === 5 ? ' is-brown' : ''));
    cup.appendChild(document.createElement('i'));
    carton.appendChild(cup);
  }

  /* ---------------------------------------------------------
     Split story text into words
     --------------------------------------------------------- */
  $$('.reveal-words').forEach((el) => {
    el.innerHTML = el.textContent.trim().split(/\s+/).map((w) => `<span class="w">${w}</span>`).join(' ');
  });

  /* ---------------------------------------------------------
     Mobile menu
     --------------------------------------------------------- */
  const burger = $('.nav__burger');
  const menu = $('.menu');
  const setMenu = (open) => {
    document.body.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', open);
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    menu.setAttribute('aria-hidden', !open);
    if (lenis) open ? lenis.stop() : lenis.start();
  };
  burger.addEventListener('click', () => setMenu(!document.body.classList.contains('menu-open')));

  /* ---------------------------------------------------------
     Contact form: Netlify Forms + WhatsApp fallback
     --------------------------------------------------------- */
  const form = $('.form');
  const status = $('.form__status');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = new URLSearchParams(new FormData(form)).toString();
    status.textContent = 'Sending…';
    try {
      const res = await fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: data });
      if (!res.ok) throw new Error(res.status);
      form.reset();
      status.textContent = 'Thank you! We\'ll get back to you shortly. 🥚';
    } catch {
      status.textContent = 'Couldn\'t send right now — try WhatsApp or call +971 50 626 1523.';
    }
  });
  $('.js-wa').addEventListener('click', () => {
    const f = new FormData(form);
    const lines = [`Hi GO FRESH, this is ${f.get('name') || '…'}.`, f.get('message') || '', f.get('phone') ? `Phone: ${f.get('phone')}` : '', f.get('email') ? `Email: ${f.get('email')}` : ''].filter(Boolean);
    window.open(waLink(lines.join('\n')), '_blank', 'noopener');
  });

  /* ---------------------------------------------------------
     No GSAP or reduced motion: show everything and stop here
     --------------------------------------------------------- */
  let lenis = null;
  const loader = $('.loader');
  const finishLoading = () => {
    document.body.classList.remove('is-loading');
    loader.remove();
  };

  if (!hasGsap || reduceMotion) {
    finishLoading();
    $$('.cup i').forEach((i) => { i.style.transform = 'none'; i.style.opacity = 1; });
    $('.carton-num').textContent = '100+';
    $$('.count').forEach((c) => (c.textContent = c.dataset.to));
    initNav(null);
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  /* ---------------------------------------------------------
     Smooth scroll (Lenis) synced with ScrollTrigger
     --------------------------------------------------------- */
  if (typeof window.Lenis !== 'undefined') {
    lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    lenis.stop();
  }

  initNav(lenis);

  /* ---------------------------------------------------------
     Preloader → hero intro
     --------------------------------------------------------- */
  const num = $('.loader__num');
  const fill = $('.loader__egg span');
  const counter = { v: 0 };
  let pageLoaded = document.readyState === 'complete';
  window.addEventListener('load', () => { pageLoaded = true; });

  gsap.to(counter, {
    v: 90, duration: 1.4, ease: 'power2.out',
    onUpdate: () => { num.textContent = Math.round(counter.v); fill.style.height = counter.v + '%'; },
    onComplete: function waitForLoad() {
      if (!pageLoaded) return setTimeout(waitForLoad, 80);
      gsap.to(counter, {
        v: 100, duration: .35, ease: 'none',
        onUpdate: () => { num.textContent = Math.round(counter.v); fill.style.height = counter.v + '%'; },
        onComplete: revealSite,
      });
    },
  });

  function revealSite() {
    const tl = gsap.timeline({
      onComplete: () => { finishLoading(); lenis && lenis.start(); ScrollTrigger.refresh(); },
    });
    tl.to(loader, { clipPath: 'inset(0 0 100% 0)', duration: 1, ease: 'expo.inOut' })
      .from('.hero__title .word', { yPercent: 115, rotate: 4, duration: 1.2, stagger: .08, ease: 'expo.out' }, '-=.45')
      .from('.egg', { y: -180, rotate: -25, opacity: 0, duration: 1.3, ease: 'bounce.out' }, '<.1')
      .from('.hero__badge', { scale: 0, rotate: -120, duration: 1, ease: 'back.out(1.8)' }, '-=.8')
      .from(['.hero__eyebrow', '.hero__foot'], { y: 24, opacity: 0, duration: .8, stagger: .1, ease: 'power3.out' }, '-=.9')
      .from('.nav', { y: -30, opacity: 0, duration: .8, ease: 'power3.out' }, '<');
  }
  loader.style.clipPath = 'inset(0 0 0% 0)';

  /* ---------------------------------------------------------
     HERO — pinned crack sequence
     --------------------------------------------------------- */
  const hero = $('.hero');
  const eggSvg = $('.egg__svg');
  const flood = $('.yolk-flood');

  const yolkGeom = () => {
    const h = hero.getBoundingClientRect();
    const e = eggSvg.getBoundingClientRect();
    return {
      x: e.left - h.left + e.width * (100 / 200),
      y: e.top - h.top + e.height * (150 / 260),
      r: e.width * (52 / 200),
      cover: Math.hypot(h.width, h.height) / 50 + 2,
    };
  };
  const placeFlood = () => {
    // Measure with the egg in its resting position
    const g = yolkGeom();
    gsap.set(flood, { left: g.x, top: g.y });
  };

  const heroTl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: {
      trigger: hero, start: 'top top', end: '+=170%', scrub: 0.8, pin: true, anticipatePin: 1,
      onRefreshInit: () => gsap.set(flood, { scale: 0, opacity: 0 }),
      onRefresh: placeFlood,
      invalidateOnRefresh: true,
    },
  });

  heroTl
    .to('.hero__scroll', { opacity: 0, duration: .1 }, 0)
    .to('.hero__title .line', { yPercent: -40, opacity: 0, stagger: .04, duration: .35 }, 0)
    .to(['.hero__eyebrow', '.hero__foot p', '.hero__badge'], { opacity: 0, y: -30, duration: .25 }, 0.05)
    .to('.egg', { keyframes: { rotate: [0, -8, 7, -5, 4, 0] }, duration: .3 }, 0)
    .to('.egg__crack', { strokeDashoffset: 0, duration: .25 }, .15)
    .to('.egg__top', { y: -120, x: -30, rotate: -38, duration: .35, ease: 'power2.in' }, .42)
    .to('.egg__bottom', { y: 70, rotate: 6, duration: .35, ease: 'power2.in' }, .42)
    .to('.egg__crack', { opacity: 0, duration: .05 }, .42)
    .to('.egg__shadow', { opacity: 0, duration: .2 }, .42)
    .to('.egg__yolk', { scale: 1.12, transformOrigin: '50% 50%', duration: .2 }, .5)
    .set(flood, { opacity: 1, scale: () => yolkGeom().r / 50 * 1.12 }, .7)
    .to(flood, { scale: () => yolkGeom().cover, duration: .3, ease: 'power2.in' }, .7);

  // Playful: click/tap the egg to make it wobble
  $('.egg').addEventListener('click', () => {
    gsap.fromTo('.egg__svg', { rotate: 0 }, { keyframes: { rotate: [-12, 10, -6, 3, 0] }, duration: .8, ease: 'power2.out', transformOrigin: '50% 90%' });
  });

  // Egg follows the pointer a little (desktop)
  if (finePointer) {
    const tiltX = gsap.quickTo('.hero__stage', 'x', { duration: .8, ease: 'power3' });
    const tiltY = gsap.quickTo('.hero__stage', 'y', { duration: .8, ease: 'power3' });
    const rot = gsap.quickTo('.egg__svg', 'rotationY', { duration: .8, ease: 'power3' });
    hero.addEventListener('mousemove', (e) => {
      const nx = e.clientX / window.innerWidth - .5;
      const ny = e.clientY / window.innerHeight - .5;
      tiltX(nx * 30); tiltY(ny * 20); rot(nx * 25);
    });
  }

  /* ---------------------------------------------------------
     STORY — words light up, counters tick
     --------------------------------------------------------- */
  gsap.to('.story__text .w', {
    opacity: 1, stagger: .05, ease: 'none',
    scrollTrigger: { trigger: '.story__text', start: 'top 80%', end: 'bottom 45%', scrub: true },
  });
  $$('.count').forEach((el) => {
    const o = { v: 0 };
    gsap.to(o, {
      v: +el.dataset.to, duration: 2, ease: 'power3.out',
      onUpdate: () => (el.textContent = Math.round(o.v)),
      scrollTrigger: { trigger: el, start: 'top 90%', once: true },
    });
  });
  gsap.from('.stat', { y: 60, opacity: 0, stagger: .12, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: '.stats', start: 'top 85%' } });

  /* ---------------------------------------------------------
     MARQUEE — speed & direction follow scroll velocity
     --------------------------------------------------------- */
  const marquee = gsap.to('.marquee__track', { xPercent: -50, duration: 22, ease: 'none', repeat: -1 });
  ScrollTrigger.create({
    trigger: '.marquee', start: 'top bottom', end: 'bottom top',
    onUpdate: (self) => {
      const v = self.getVelocity() / 300;
      const dir = self.direction;
      gsap.to(marquee, { timeScale: dir * Math.min(Math.max(Math.abs(v), 1), 5), duration: .3, overwrite: true });
      gsap.to(marquee, { timeScale: dir, duration: 1.2, delay: .3 });
    },
  });

  /* ---------------------------------------------------------
     Responsive pieces
     --------------------------------------------------------- */
  const mm = gsap.matchMedia();

  mm.add('(min-width: 901px)', () => {
    // JOURNEY — horizontal scroll with a delivery truck
    const track = $('.journey__track');
    const dist = () => track.scrollWidth - window.innerWidth;
    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: { trigger: '.journey', start: 'top top', end: () => '+=' + dist(), scrub: 1, pin: true, invalidateOnRefresh: true, anticipatePin: 1 },
    });
    tl.to(track, { x: () => -dist() }, 0)
      .to('.journey__truck', { x: () => $('.journey__road').offsetWidth - 64 }, 0);
    $$('.step__img:not(.step__img--white) img').forEach((img) => {
      gsap.to(img, { scale: 1, ease: 'none', scrollTrigger: { trigger: img, containerAnimation: tl, start: 'left right', end: 'right left', scrub: true } });
    });
    // bob the truck
    gsap.to('.journey__truck svg', { y: -3, duration: .25, repeat: -1, yoyo: true, ease: 'sine.inOut' });
  });

  mm.add('(max-width: 900px)', () => {
    $$('.step').forEach((s) => gsap.from(s, { y: 60, opacity: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: s, start: 'top 88%' } }));
  });

  /* ---------------------------------------------------------
     CARTON — eggs drop in as shops join
     --------------------------------------------------------- */
  const cartonNum = $('.carton-num');
  gsap.to('.cup i', {
    y: 0, scale: 1, opacity: 1, ease: 'back.out(2)',
    stagger: { each: .02, from: 'start' },
    scrollTrigger: {
      trigger: '.carton', start: 'top 80%', end: 'bottom 45%', scrub: .6,
      onUpdate: (self) => {
        const n = Math.round(self.progress * 100);
        cartonNum.textContent = n >= 100 ? '100+' : n;
      },
    },
  });
  gsap.from('.carton', { rotate: -6, y: 80, ease: 'none', scrollTrigger: { trigger: '.carton-sec', start: 'top bottom', end: 'center center', scrub: true } });

  /* ---------------------------------------------------------
     BRANDS — parallax packs + headline
     --------------------------------------------------------- */
  $$('.brand').forEach((b) => {
    gsap.from(b.querySelector('.brand__img'), { yPercent: 30, ease: 'none', scrollTrigger: { trigger: b, start: 'top bottom', end: 'bottom top', scrub: true } });
    gsap.from(b.querySelector('h3'), { yPercent: 60, opacity: 0, duration: 1.1, ease: 'expo.out', scrollTrigger: { trigger: b, start: 'top 70%' } });
  });

  /* Section titles slide up */
  $$('.title').forEach((t) => gsap.from(t, { y: 70, opacity: 0, duration: 1.1, ease: 'expo.out', scrollTrigger: { trigger: t, start: 'top 88%' } }));

  /* ---------------------------------------------------------
     PRODUCTS — staggered entrance + 3D tilt
     --------------------------------------------------------- */
  ScrollTrigger.batch('.card', {
    start: 'top 90%', once: true,
    onEnter: (els) => gsap.from(els, { y: 80, opacity: 0, rotateX: -12, duration: 1, stagger: .08, ease: 'power3.out' }),
  });
  if (finePointer) {
    cards.forEach((card) => {
      const rx = gsap.quickTo(card, 'rotationX', { duration: .5, ease: 'power3' });
      const ry = gsap.quickTo(card, 'rotationY', { duration: .5, ease: 'power3' });
      gsap.set(card, { transformPerspective: 900 });
      card.addEventListener('mousemove', (e) => {
        const r = card.getBoundingClientRect();
        ry(((e.clientX - r.left) / r.width - .5) * 10);
        rx(-((e.clientY - r.top) / r.height - .5) * 10);
      });
      card.addEventListener('mouseleave', () => { rx(0); ry(0); });
    });
  }

  /* ---------------------------------------------------------
     QUALITY — words converge, egg spins
     --------------------------------------------------------- */
  const qBig = $('.quality__big');
  gsap.timeline({ scrollTrigger: { trigger: qBig, start: 'top bottom', end: 'center 45%', scrub: 1 } })
    .from(qBig.children[0], { xPercent: -60, opacity: 0 }, 0)
    .from(qBig.children[2], { xPercent: 60, opacity: 0 }, 0)
    .from('.quality__egg', { rotate: -540, scale: 0 }, 0);
  gsap.from('.q', { y: 60, opacity: 0, stagger: .12, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: '.quality__grid', start: 'top 85%' } });

  /* CONTACT */
  gsap.from('.contact__list li', { x: -40, opacity: 0, stagger: .08, duration: .9, ease: 'power3.out', scrollTrigger: { trigger: '.contact__list', start: 'top 85%' } });
  gsap.from('.form', { y: 80, opacity: 0, duration: 1.1, ease: 'expo.out', scrollTrigger: { trigger: '.form', start: 'top 85%' } });

  /* FOOTER — giant letters bounce up */
  gsap.from('.footer__mega span', {
    yPercent: 100, opacity: 0, rotate: () => gsap.utils.random(-20, 20), stagger: .05, duration: 1, ease: 'back.out(1.6)',
    scrollTrigger: { trigger: '.footer__mega', start: 'top 92%' },
  });

  /* Progress egg fills with yolk */
  gsap.to('.progress__fill', { attr: { y: 0 }, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: .3 } });

  /* ---------------------------------------------------------
     Cursor + magnetic buttons (desktop)
     --------------------------------------------------------- */
  if (finePointer) {
    const cursor = $('.cursor');
    const label = $('.cursor__label');
    const cx = gsap.quickTo(cursor, 'x', { duration: .25, ease: 'power3' });
    const cy = gsap.quickTo(cursor, 'y', { duration: .25, ease: 'power3' });
    window.addEventListener('mousemove', (e) => { cx(e.clientX); cy(e.clientY); cursor.classList.add('is-visible'); });
    document.addEventListener('mouseleave', () => cursor.classList.remove('is-visible'));
    document.addEventListener('mouseover', (e) => {
      const t = e.target.closest('[data-cursor]');
      cursor.classList.toggle('is-hover', !!t);
      label.textContent = t ? t.dataset.cursor : '';
    });

    $$('.magnetic').forEach((el) => {
      const mx = gsap.quickTo(el, 'x', { duration: .6, ease: 'elastic.out(1, .4)' });
      const my = gsap.quickTo(el, 'y', { duration: .6, ease: 'elastic.out(1, .4)' });
      el.addEventListener('mousemove', (e) => {
        const r = el.getBoundingClientRect();
        mx((e.clientX - r.left - r.width / 2) * .35);
        my((e.clientY - r.top - r.height / 2) * .35);
      });
      el.addEventListener('mouseleave', () => { mx(0); my(0); });
    });
  }

  /* ---------------------------------------------------------
     Nav behaviour + anchor scrolling
     --------------------------------------------------------- */
  function initNav(lenisInstance) {
    const nav = $('.nav');
    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      nav.classList.toggle('is-scrolled', y > 40);
      nav.classList.toggle('is-hidden', y > lastY && y > 400 && !document.body.classList.contains('menu-open'));
      lastY = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    $$('a[href^="#"]').forEach((a) => {
      a.addEventListener('click', (e) => {
        const id = a.getAttribute('href');
        const target = id === '#top' ? document.body : $(id);
        if (!target) return;
        e.preventDefault();
        if (document.body.classList.contains('menu-open')) setMenu(false);
        if (lenisInstance) lenisInstance.scrollTo(id === '#top' ? 0 : target, { offset: 0, duration: 1.6 });
        else target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
      });
    });

    // Highlight the current section in the nav
    const links = $$('.nav__links a');
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) links.forEach((l) => l.classList.toggle('is-active', l.getAttribute('href') === '#' + en.target.id));
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    ['story', 'journey', 'products', 'contact'].forEach((id) => { const s = document.getElementById(id); if (s) io.observe(s); });
  }
})();
