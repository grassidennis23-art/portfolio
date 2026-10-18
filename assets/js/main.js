(function () {
  var doc = document.documentElement;
  doc.classList.add('js');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };

  /* ---------- language (IT source in HTML, EN in i18n.js) ---------- */
  var EN = window.DG_EN || {};
  var nodes = $$('[data-i18n]');
  nodes.forEach(function (n) { n._it = n.innerHTML; });
  var titles = $$('[data-case]');
  titles.forEach(function (c) {
    $$('img', c).forEach(function (im, i) { im._it = im.alt; im._i = i + 1; });
  });
  var docTitle = { it: 'Dennis Grassi, DG Design', en: 'Dennis Grassi, DG Design' };
  var metaDesc = document.querySelector('meta[name="description"]');
  var descs = {
    it: metaDesc.content,
    en: 'Dennis Grassi, interior designer and 3D artist. Spaces told through matter, light and atmosphere: renders, products, scenography and technical boards.'
  };
  var lang = 'it';
  function setLang(l) {
    lang = l;
    doc.lang = l;
    nodes.forEach(function (n) {
      var k = n.getAttribute('data-i18n');
      n.innerHTML = l === 'en' && EN[k] ? EN[k] : n._it;
    });
    titles.forEach(function (c) {
      var k = c.querySelector('.case-title');
      var t = k ? k.textContent : '';
      $$('img', c).forEach(function (im) { im.alt = l === 'en' ? t + ' (' + im._i + ')' : im._it; });
    });
    $$('.lang-btn').forEach(function (b) { var on = b.getAttribute('data-lang') === l; b.classList.toggle('is-on', on); b.setAttribute('aria-pressed', on); });
    document.title = docTitle[l];
    metaDesc.content = descs[l];
    heroPauseLabel();
    try { localStorage.setItem('dg-lang', l); } catch (e) {}
  }
  $$('.lang-btn').forEach(function (b) { b.addEventListener('click', function () { setLang(b.getAttribute('data-lang')); }); });

  /* ---------- reveal ---------- */
  var items = $$('.reveal');
  if ('IntersectionObserver' in window && !reduce) {
    items.forEach(function (el) {
      var sib = el.parentElement ? [].slice.call(el.parentElement.children).filter(function (c) { return c.classList.contains('reveal'); }) : [el];
      el.style.setProperty('--d', Math.min(sib.indexOf(el), 5) * 80 + 'ms');
    });
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.1, rootMargin: '0px 0px -5% 0px' });
    items.forEach(function (el) { io.observe(el); });
  } else {
    items.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- bar: hide on scroll down, mobile menu ---------- */
  var bar = document.querySelector('.bar'), lastY = 0;
  window.addEventListener('scroll', function () {
    var y = window.scrollY;
    bar.classList.toggle('is-hidden', y > lastY && y > 300 && !document.body.classList.contains('nav-open'));
    lastY = y;
  }, { passive: true });
  var menuBtn = document.getElementById('menu-btn');
  function menu(open) { document.body.classList.toggle('nav-open', open); menuBtn.setAttribute('aria-expanded', open); }
  menuBtn.addEventListener('click', function () { menu(!document.body.classList.contains('nav-open')); });
  $$('.bar-nav a').forEach(function (a) { a.addEventListener('click', function () { menu(false); }); });

  /* ---------- hero video + inline clips ---------- */
  var hero = document.getElementById('hero-video');
  var pauseBtn = document.getElementById('hero-pause');
  function heroPauseLabel() {
    var paused = hero.paused;
    pauseBtn.textContent = paused ? (lang === 'en' ? EN['hero.play'] : 'Riproduci video') : (lang === 'en' ? EN['hero.pause'] : 'Pausa video');
    pauseBtn.setAttribute('aria-pressed', paused);
  }
  if (reduce) { hero.removeAttribute('autoplay'); hero.pause(); }
  pauseBtn.addEventListener('click', function () { if (hero.paused) hero.play(); else hero.pause(); });
  hero.addEventListener('play', heroPauseLabel);
  hero.addEventListener('pause', heroPauseLabel);
  var clips = $$('video[data-inview]');
  if ('IntersectionObserver' in window && !reduce) {
    var vio = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { var p = e.target.play(); if (p && p.catch) p.catch(function () {}); } else e.target.pause(); });
    }, { threshold: 0.35 });
    clips.forEach(function (v) { vio.observe(v); });
  }

  /* ---------- light parallax ---------- */
  var par = $$('[data-parallax-soft]');
  if (par.length && !reduce) {
    var ticking = false;
    var run = function () {
      var vh = window.innerHeight;
      par.forEach(function (el) {
        var r = el.getBoundingClientRect();
        if (r.bottom < 0 || r.top > vh) return;
        var p = (r.top + r.height / 2 - vh / 2) / vh;
        var img = el.querySelector('img');
        if (img) img.style.transform = 'translate3d(0,' + (p * -24).toFixed(1) + 'px,0) scale(1.06)';
      });
      ticking = false;
    };
    window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(run); } }, { passive: true });
    run();
  }

  /* ---------- project tabs ---------- */
  var tabs = $$('.tab');
  function showPanel(name, focus) {
    tabs.forEach(function (t) {
      var on = t.getAttribute('data-panel') === name;
      t.classList.toggle('is-on', on); t.setAttribute('aria-selected', on); t.tabIndex = on ? 0 : -1;
      var p = document.getElementById('panel-' + t.getAttribute('data-panel'));
      if (on) {
        p.hidden = false;
        $$('.reveal', p).forEach(function (el) { el.classList.add('in'); });
        p.classList.remove('is-entering'); void p.offsetWidth; p.classList.add('is-entering');
        if (focus) t.focus();
      } else { p.hidden = true; }
    });
  }
  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () { showPanel(t.getAttribute('data-panel')); });
    t.addEventListener('keydown', function (e) {
      var n = e.key === 'ArrowRight' ? i + 1 : e.key === 'ArrowLeft' ? i - 1 : null;
      if (n === null) return;
      e.preventDefault();
      showPanel(tabs[(n + tabs.length) % tabs.length].getAttribute('data-panel'), true);
    });
  });
  showPanel('interni');

  /* ---------- lightbox (current panel) ---------- */
  var lb = document.getElementById('lb'), fig = document.getElementById('lb-fig'), cap = document.getElementById('lb-cap');
  var img = document.createElement('img');
  fig.insertBefore(img, cap);
  var group = [], cur = 0, opener = null;
  function show(i) {
    cur = (i + group.length) % group.length;
    var t = group[cur], im = t.querySelector('img'), c = t.closest('.case');
    img.src = t.getAttribute('data-src');
    img.alt = im.alt;
    var title = c ? c.querySelector('.case-title') : null;
    cap.textContent = (title ? title.textContent + '. ' : '') + im.alt;
  }
  function open(t) {
    opener = t;
    group = $$('.ph', t.closest('.panel'));
    lb.hidden = false; document.body.style.overflow = 'hidden';
    show(group.indexOf(t));
    lb.querySelector('.lb-close').focus();
  }
  function close() { lb.hidden = true; document.body.style.overflow = ''; if (opener) opener.focus(); }
  $$('.ph').forEach(function (t) { t.addEventListener('click', function () { open(t); }); });
  lb.querySelector('.lb-close').addEventListener('click', close);
  lb.querySelector('.lb-prev').addEventListener('click', function () { show(cur - 1); });
  lb.querySelector('.lb-next').addEventListener('click', function () { show(cur + 1); });
  lb.addEventListener('click', function (e) { if (e.target === lb) close(); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && document.body.classList.contains('nav-open')) menu(false);
    if (lb.hidden) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') show(cur - 1);
    if (e.key === 'ArrowRight') show(cur + 1);
  });

  /* ---------- start ---------- */
  var saved = null;
  try { saved = localStorage.getItem('dg-lang'); } catch (e) {}
  var start = saved || ((navigator.language || 'it').slice(0, 2) === 'en' ? 'en' : 'it');
  setLang(start === 'en' ? 'en' : 'it');
})();
