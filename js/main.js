/* ==========================================================
   LearnToBeAFeminist : comportement du site
   1) menu mobile  2) cartes d'articles  3) recherche
   ========================================================== */
(function () {
  'use strict';

  var lang = document.documentElement.lang === 'en' ? 'en' : 'fr';
  var T = {
    fr: { read: 'Lire la suite', locale: 'fr-FR' },
    en: { read: 'Read more', locale: 'en-GB' }
  }[lang];

  /* ---------- 1) Menu mobile ---------- */
  var toggle = document.querySelector('.menu-toggle');
  var nav = document.getElementById('main-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) {
        nav.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.focus();
      }
    });
  }

  /* ---------- 2) Cartes d'articles ---------- */
  var list = document.getElementById('articles-list');
  if (!list || !window.ARTICLES) { return; }

  var input = document.getElementById('search');
  var form = document.getElementById('search-form');
  var count = document.getElementById('result-count');
  var none = document.getElementById('no-results');

  // Du plus récent au plus ancien
  var articles = window.ARTICLES.slice().sort(function (a, b) {
    return b.date.localeCompare(a.date);
  });

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) { node.className = className; }
    if (text) { node.textContent = text; }
    return node;
  }

  function formatDate(iso) {
    return new Date(iso + 'T12:00:00').toLocaleDateString(T.locale, {
      day: 'numeric', month: 'short', year: 'numeric'
    });
  }

  // Vignette : vraie photo si "image" existe, sinon un motif coloré
  function buildThumb(a, i) {
    if (a.image) {
      var img = el('img', 'thumb');
      img.src = '../' + a.image;
      img.alt = a.imageAlt ? a.imageAlt[lang] : '';
      img.width = 112;
      img.height = 112;
      img.loading = 'lazy';
      return img;
    }
    var d = el('div', 'thumb thumb--' + (i % 4), a.category[lang].charAt(0));
    d.setAttribute('aria-hidden', 'true');
    return d;
  }

  function buildCard(a, i) {
    var li = el('li', 'card');
    li.appendChild(buildThumb(a, i));

    var body = el('div', 'card__body');

    var meta = el('p', 'card__meta');
    meta.appendChild(el('span', 'tag', a.category[lang]));
    var time = el('time', null, formatDate(a.date));
    time.setAttribute('datetime', a.date);
    meta.appendChild(time);

    var h3 = el('h3');
    var link = el('a', null, a.title[lang]);
    link.href = a.url[lang];
    h3.appendChild(link);

    var more = el('span', 'card__more', T.read + ' →');
    more.setAttribute('aria-hidden', 'true');

    body.appendChild(meta);
    body.appendChild(h3);
    body.appendChild(el('p', 'card__excerpt', a.summary[lang]));
    body.appendChild(more);
    li.appendChild(body);
    return li;
  }

  /* ---------- 3) Recherche (sans accents, sans majuscules) ---------- */
  function normalize(s) {
    return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  function countLabel(n) {
    var plural = lang === 'fr' ? n > 1 : n !== 1;
    return n + (plural ? ' articles' : ' article');
  }

  function render(query) {
    var words = normalize(query.trim()).split(/\s+/).filter(Boolean);
    var shown = articles.filter(function (a) {
      if (!words.length) { return true; }
      var text = normalize([a.title[lang], a.summary[lang], a.category[lang]].join(' '));
      return words.every(function (w) { return text.indexOf(w) !== -1; });
    });

    list.textContent = '';
    shown.forEach(function (a, i) { list.appendChild(buildCard(a, i)); });
    count.textContent = countLabel(shown.length);
    none.hidden = shown.length !== 0;
  }

  if (form) { form.addEventListener('submit', function (e) { e.preventDefault(); }); }
  if (input) { input.addEventListener('input', function () { render(input.value); }); }
  render('');
})();