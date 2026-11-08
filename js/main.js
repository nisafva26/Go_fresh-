/* Go Fresh — editorial edition */
(() => {
  'use strict';

  const WA = '971506261523';
  const waLink = (t) => `https://wa.me/${WA}?text=${encodeURIComponent(t)}`;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasGsap = !!(window.gsap && window.ScrollTrigger);

  $('.year').textContent = new Date().getFullYear();

  /* ---------- Products ---------- */
  const PRODUCTS = [
    { brand: 'kanza', name: 'Kanza 30', shell: 'white', img: 'kanza-30-white', note: 'Large · farm fresh · tray of 30' },
    { brand: 'kanza', name: 'Kanza 15', shell: 'white', img: 'kanza-15-white', note: 'Grade AA · farm fresh · pack of 15' },
    { brand: 'kanza', name: 'Kanza 6', shell: 'white', img: 'kanza-6-white', note: 'Farm fresh · perfect for sampling' },
    { brand: 'kanza', name: 'Kanza Super 6', shell: 'super', img: 'kanza-super-6', note: 'Extra large · premium · rich in Omega‑3' },
    { brand: 'kanza', name: 'Kanza 30', shell: 'brown', img: 'kanza-30-brown', note: 'Large · rich yolk · tray of 30' },
    { brand: 'kanza', name: 'Kanza 15', shell: 'brown', img: 'kanza-15-brown', note: 'Grade AA · nutrient rich · pack of 15' },
    { brand: 'kanza', name: 'Kanza 6', shell: 'brown', img: 'kanza-6-brown', note: 'Nutrient rich · perfect for sampling' },
    { brand: 'miya', name: 'Miya 30', shell: 'white', img: 'miya-30-white', note: 'Great value · daily fresh · tray of 30' },
    { brand: 'miya', name: 'Miya 15', shell: 'white', img: 'miya-15-white', note: 'Affordable · fresh daily · pack of 15' },
    { brand: 'miya', name: 'Miya 6', shell: 'white', img: 'miya-6-white', note: 'Budget friendly · trial size' },
  ];
  const shellName = { white: 'White', brown: 'Brown', super: 'Extra large' };
  $('.shelf').innerHTML = PRODUCTS.map((p) => {
    const full = `${p.name}${p.shell === 'super' ? '' : ' ' + shellName[p.shell]}`;
    return `
    <article class="egg-card egg-card--${p.brand}" data-brand="${p.brand}" data-shell="${p.shell}">
      <div class="egg-card__img">
        <span class="egg-card__brand label">${p.brand}</span>
        <img src="/images/${p.img}.webp" alt="${full} eggs" loading="lazy" />
      </div>
      <div class="egg-card__row">
        <h3>${p.name}</h3>
        <span class="egg-card__shell"><i class="${p.shell}"></i>${shellName[p.shell]}</span>
      </div>
      <p>${p.note}</p>
      <a class="link" href="${waLink(`Hi Go Fresh, I'd like to order ${full} eggs.`)}" target="_blank" rel="noopener">Order</a>
    </article>`;
  }).join('');

  const cards = $$('.egg-card');
  const tabs = $$('.tabs button');
  function applyFilter(f) {
    tabs.forEach((t) => { const on = t.dataset.filter === f; t.classList.toggle('is-active', on); t.setAttribute('aria-selected', on); });
    const match = (c) => f === 'all' || c.dataset.brand === f || c.dataset.shell === f;
    cards.forEach((c) => c.classList.toggle('is-hidden', !match(c)));
    if (hasGsap && !reduceMotion) {
      gsap.fromTo(cards.filter(match), { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: .6, stagger: .05, ease: 'power3.out', overwrite: true });
      ScrollTrigger.refresh();
    }
  }
  tabs.forEach((t) => t.addEventListener('click', () => applyFilter(t.dataset.filter)));
  $$('[data-filter-link]').forEach((a) => a.addEventListener('click', () => applyFilter(a.dataset.filterLink)));

  /* ---------- Menu ---------- */
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

  /* ---------- Anchors ---------- */
  $$('a[href^="#"]').forEach((a) => a.addEventListener('click', (e) => {
    const id = a.getAttribute('href');
    const target = id === '#top' ? null : $(id);
    if (id !== '#top' && !target) return;
    e.preventDefault();
    if (document.body.classList.contains('menu-open')) setMenu(false);
    if (lenis) lenis.scrollTo(target || 0, { offset: target ? -70 : 0, duration: 1.4 });
    else (target || document.body).scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
  }));

  /* ---------- Nav ---------- */
  const nav = $('.nav');
  let lastY = scrollY;
  addEventListener('scroll', () => {
    const y = scrollY;
    nav.classList.toggle('is-scrolled', y > 30);
    nav.classList.toggle('is-hidden', y > lastY && y > 600 && !document.body.classList.contains('menu-open'));
    lastY = y;
  }, { passive: true });
  const links = $$('.nav__links a');
  const io = new IntersectionObserver((ents) => ents.forEach((en) => {
    if (en.isIntersecting) links.forEach((l) => l.classList.toggle('is-active', l.getAttribute('href') === '#' + en.target.id));
  }), { rootMargin: '-45% 0px -50% 0px' });
  ['story', 'brands', 'eggs', 'contact'].forEach((id) => io.observe(document.getElementById(id)));

  /* ---------- Form ---------- */
  const form = $('.form');
  const status = $('.form__status');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    status.textContent = 'Sending…';
    try {
      const res = await fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams(new FormData(form)).toString() });
      if (!res.ok) throw new Error(res.status);
      form.reset();
      status.textContent = 'Thank you — we’ll be in touch shortly.';
    } catch {
      status.textContent = 'Couldn’t send just now. Please WhatsApp or call +971 50 626 1523.';
    }
  });
  $('.js-wa').addEventListener('click', () => {
    const f = new FormData(form);
    const lines = [`Hi Go Fresh, this is ${f.get('name') || '…'}.`, f.get('message'), f.get('phone') && `Phone: ${f.get('phone')}`, f.get('email') && `Email: ${f.get('email')}`].filter(Boolean);
    open(waLink(lines.join('\n')), '_blank', 'noopener');
  });

  if (!hasGsap || reduceMotion) return;

  /* =========================================================
     Motion
     ========================================================= */
  gsap.registerPlugin(ScrollTrigger);
  if (window.Lenis) {
    lenis = new Lenis({ lerp: .1, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  const run = () => {
    // Hero entrance
    gsap.timeline({ defaults: { ease: 'expo.out' } })
      .from('.hero__line > span', { yPercent: 110, duration: 1.4, stagger: .12 })
      .from('.arch', { clipPath: 'inset(100% 0 0 0 round 999px 999px 10px 10px)', duration: 1.5, ease: 'expo.inOut' }, .1)
      .from('.arch img', { scale: 1.3, duration: 2, ease: 'power3.out' }, .3)
      .from('.hero__script', { opacity: 0, x: -30, filter: 'blur(8px)', duration: 1.4 }, .9)
      .from('.hero__caption', { opacity: 0, duration: 1 }, 1.2)
      .from(['.hero__label', '.hero__lede', '.hero__ctas', '.nav'], { opacity: 0, y: 16, duration: 1, stagger: .08 }, .6);

    // Hero parallax
    gsap.to('.arch img', { yPercent: -12, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
    gsap.to('.hero__title', { yPercent: 25, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

    // Statement: lines fade up, image pills open
    gsap.from('.statement__text', { opacity: 0, y: 40, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: '.statement', start: 'top 75%' } });
    gsap.from('.pill', { width: 0, duration: 1.2, stagger: .2, ease: 'expo.inOut', scrollTrigger: { trigger: '.statement__text', start: 'top 70%' } });

    // Section headings
    $$('.h2, .contact__title').forEach((h) => gsap.from(h, { y: 50, opacity: 0, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: h, start: 'top 88%' } }));

    // Posters
    gsap.from('.poster', { y: 80, opacity: 0, duration: 1.2, stagger: .12, ease: 'expo.out', scrollTrigger: { trigger: '.posters', start: 'top 85%' } });
    $$('.poster--photo img').forEach((img) => gsap.fromTo(img, { yPercent: -6 }, { yPercent: 6, ease: 'none', scrollTrigger: { trigger: img.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } }));
    gsap.from('.seal', { rotate: -90, scale: .6, opacity: 0, duration: 1.4, ease: 'back.out(1.6)', scrollTrigger: { trigger: '.poster--tile', start: 'top 80%' } });
    gsap.to('.seal svg', { rotate: 360, ease: 'none', scrollTrigger: { trigger: '.journey', start: 'top bottom', end: 'bottom top', scrub: 1 } });

    // Brands
    $$('.brand').forEach((b) => {
      const tl = gsap.timeline({ scrollTrigger: { trigger: b, start: 'top 70%' }, defaults: { ease: 'expo.out' } });
      tl.from(b.querySelector('.brand__name'), { yPercent: 40, opacity: 0, duration: 1.4 })
        .from(b.querySelectorAll('.brand__caps, .brand__text, .link, .brand__copy > .label'), { y: 20, opacity: 0, duration: 1, stagger: .08 }, .2);
      gsap.from(b.querySelector('.brand__pack'), { y: 120, rotate: b.classList.contains('brand--miya') ? 8 : -8, ease: 'none', scrollTrigger: { trigger: b, start: 'top bottom', end: 'center center', scrub: true } });
    });

    // Products
    ScrollTrigger.batch('.egg-card', { start: 'top 92%', once: true, onEnter: (els) => gsap.from(els, { y: 50, opacity: 0, duration: 1, stagger: .07, ease: 'expo.out' }) });

    // Numbers
    gsap.from('.num', { y: 40, opacity: 0, duration: 1.1, stagger: .1, ease: 'expo.out', scrollTrigger: { trigger: '.numbers', start: 'top 75%' } });
    $$('.count').forEach((el) => {
      const o = { v: 0 }, to = +el.dataset.to;
      gsap.to(o, { v: to, duration: 2, ease: 'power3.out', onUpdate: () => (el.textContent = Math.round(o.v)), scrollTrigger: { trigger: el, start: 'top 85%', once: true } });
    });
    gsap.from('.numbers__script', { opacity: 0, x: -40, filter: 'blur(6px)', duration: 1.4, ease: 'expo.out', scrollTrigger: { trigger: '.numbers__script', start: 'top 90%' } });

    // Contact & footer
    gsap.from('.details div', { y: 20, opacity: 0, duration: .9, stagger: .07, ease: 'power3.out', scrollTrigger: { trigger: '.details', start: 'top 88%' } });
    gsap.from('.form', { y: 60, opacity: 0, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: '.form', start: 'top 88%' } });
    gsap.from('.footer__word', { yPercent: 50, opacity: 0, duration: 1.4, ease: 'expo.out', scrollTrigger: { trigger: '.footer', start: 'top 85%' } });
    gsap.from('.footer__script', { opacity: 0, x: 40, duration: 1.4, ease: 'expo.out', scrollTrigger: { trigger: '.footer', start: 'top 70%' } });
  };

  // Wait for fonts so the hero animates with the right glyphs
  (document.fonts ? Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 1500))]) : Promise.resolve()).then(run);
})();
