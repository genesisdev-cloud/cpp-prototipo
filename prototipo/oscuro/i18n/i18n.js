/*!
 * Motor de idiomas del sitio del Colegio Presbiteriano del Paraguay (ES / EN / KO).
 * El HTML se escribe en español (idioma base). Este script cambia los textos según
 * el idioma elegido usando el diccionario de i18n/translations.js:
 *   window.CPP_I18N = { en: { "Texto en español": "English text" }, ko: { ... } }
 * Idioma: ?lang=en | ?lang=ko | ?lang=es  (se recuerda en el navegador).
 * Otros scripts pueden usar window.cppT("texto en español") y escuchar el evento "cpp:lang".
 */
(function () {
  'use strict';

  var STORE = 'cpp-lang';
  var LANGS = ['es', 'en', 'ko'];
  var LABEL = { es: 'ES', en: 'EN', ko: '한국어' };
  var GROUP = { es: 'Idioma', en: 'Language', ko: '언어' };
  var NAME = { es: 'Español', en: 'English', ko: '한국어' };
  var INLINE = { A: 1, STRONG: 1, B: 1, EM: 1, I: 1, SPAN: 1, SMALL: 1, BR: 1, SUP: 1, SUB: 1, SVG: 1, ABBR: 1, MARK: 1, U: 1 };
  var SKIP = { SCRIPT: 1, STYLE: 1, NOSCRIPT: 1, SVG: 1, TEXTAREA: 1, CODE: 1, PRE: 1, IFRAME: 1 };
  var ATTRS = ['placeholder', 'title', 'alt', 'aria-label', 'aria-roledescription', 'data-close'];
  var SVG_TOKEN = '⟦svg⟧';

  var dict = window.CPP_I18N || { en: {}, ko: {} };
  var lang = 'es';
  var store = new WeakMap();          // original (español) de cada nodo o elemento
  var attrStore = new WeakMap();      // originales de atributos
  var missing = {};

  var HAS_LETTER = /[A-Za-z\u00C0-\u024F\u3131-\u318E\uAC00-\uD7A3]/;
  function hasLetters(s) { return HAS_LETTER.test(s); }
  function norm(s) { return s.replace(/\s+/g, ' ').trim(); }
  function keyOfHtml(html) { return norm(html.replace(/<svg[\s\S]*?<\/svg>/gi, SVG_TOKEN)); }

  /* ---- 1. qué se traduce ---------------------------------------------- */
  function collect(root) {
    var out = [];
    (function walk(el) {
      if (SKIP[el.tagName] || el.getAttribute('translate') === 'no') return;
      var hasText = false, allInline = true, c, i;
      for (i = 0; i < el.childNodes.length; i++) {
        c = el.childNodes[i];
        if (c.nodeType === 3 && hasLetters(c.nodeValue)) hasText = true;
        else if (c.nodeType === 1 && !INLINE[c.tagName]) allInline = false;
      }
      if (hasText && allInline) { out.push({ kind: 'unit', el: el }); return; }
      for (i = 0; i < el.childNodes.length; i++) {
        c = el.childNodes[i];
        if (c.nodeType === 3 && hasLetters(c.nodeValue)) out.push({ kind: 'text', node: c });
        else if (c.nodeType === 1) walk(c);
      }
    })(root);
    return out;
  }

  function attrItems(root) {
    var out = [], sel = ATTRS.map(function (a) { return '[' + a + ']'; }).join(',');
    var els = root.querySelectorAll(sel);
    for (var i = 0; i < els.length; i++) {
      if (els[i].closest && els[i].closest('.lang')) continue;
      if (els[i].parentElement && els[i].parentElement.closest('[data-i18n-u]')) continue;   // viajan dentro del texto del bloque
      for (var j = 0; j < ATTRS.length; j++) {
        var v = els[i].getAttribute(ATTRS[j]);
        if (v && hasLetters(v) && !/^https?:|^#|^\.\.?\//.test(v)) out.push({ el: els[i], attr: ATTRS[j], value: v });
      }
    }
    return out;
  }

  /* ---- 2. lista de textos (para armar el diccionario) ----------------- */
  window.cppI18nKeys = function () {
    var keys = {}, i, it, list;
    list = collect(document.body);
    for (i = 0; i < list.length; i++) {
      it = list[i];
      var k = it.kind === 'unit' ? (store.get(it.el) || { key: keyOfHtml(it.el.innerHTML) }).key : norm((store.get(it.node) || { orig: it.node.nodeValue }).orig);
      keys[k] = 'texto';
    }
    attrItems(document).forEach(function (a) {
      var o = attrStore.get(a.el); var v = o && o[a.attr] !== undefined ? o[a.attr] : a.value; keys[norm(v)] = 'attr';
    });
    keys[norm(document.documentElement.getAttribute('data-title') || document.title)] = 'titulo';
    return keys;
  };

  /* ---- 3. aplicar un idioma ------------------------------------------- */
  function restoreSvg(t, svgs) {
    var n = 0;
    return t.split(SVG_TOKEN).reduce(function (acc, part, idx) { return idx === 0 ? part : acc + (svgs[n++] || '') + part; }, '');
  }

  function translateAll(l) {
    var d = dict[l] || {};
    var list = collect(document.body), i, it, st, t;
    for (i = 0; i < list.length; i++) {
      it = list[i];
      if (it.kind === 'unit') {
        st = store.get(it.el);
        if (!st) {
          st = { html: it.el.innerHTML, svgs: Array.prototype.map.call(it.el.querySelectorAll('svg'), function (s) { return s.outerHTML; }) };
          st.key = keyOfHtml(st.html); store.set(it.el, st);
        }
        it.el.setAttribute('data-i18n-u', '');
        t = l === 'es' ? null : d[st.key];
        if (l !== 'es' && !t) missing[st.key] = 1;
        it.el.innerHTML = t ? restoreSvg(t, st.svgs) : st.html;
      } else {
        st = store.get(it.node);
        if (!st) { st = { orig: it.node.nodeValue }; store.set(it.node, st); }
        t = l === 'es' ? null : d[norm(st.orig)];
        if (l !== 'es' && !t) missing[norm(st.orig)] = 1;
        var lead = /^\s/.test(st.orig) ? ' ' : '', trail = /\s$/.test(st.orig) ? ' ' : '';
        it.node.nodeValue = t ? lead + t + trail : st.orig;
      }
    }
    attrItems(document).forEach(function (a) {
      var o = attrStore.get(a.el); if (!o) { o = {}; attrStore.set(a.el, o); }
      if (o[a.attr] === undefined) o[a.attr] = a.value;
      var tv = l === 'es' ? null : d[norm(o[a.attr])];
      if (l !== 'es' && !tv) missing[norm(o[a.attr])] = 1;
      a.el.setAttribute(a.attr, tv || o[a.attr]);
    });
    // título de la pestaña
    var de = document.documentElement;
    if (!de.getAttribute('data-title')) de.setAttribute('data-title', document.title);
    var tt = l === 'es' ? null : d[norm(de.getAttribute('data-title'))];
    document.title = tt || de.getAttribute('data-title');
    // enlaces a PDF en el idioma elegido
    var pdfs = document.querySelectorAll('a[href*="assets/pdf/requisitos-"]');
    for (i = 0; i < pdfs.length; i++) {
      var base = pdfs[i].getAttribute('data-pdf') || pdfs[i].getAttribute('href').replace(/-(en|ko)\.pdf$/, '.pdf');
      pdfs[i].setAttribute('data-pdf', base);
      pdfs[i].setAttribute('href', l === 'es' ? base : base.replace(/\.pdf$/, '-' + l + '.pdf'));
    }
  }

  window.cppT = function (s) { var t = lang === 'es' ? null : (dict[lang] || {})[norm(s)]; return t || s; };
  window.cppLang = function () { return lang; };

  function setLang(l, persist) {
    if (LANGS.indexOf(l) < 0) l = 'es';
    lang = l;
    document.documentElement.setAttribute('lang', l);
    translateAll(l);
    if (persist !== false) { try { localStorage.setItem(STORE, l); } catch (e) {} }
    var bs = document.querySelectorAll('.lang button');
    for (var i = 0; i < bs.length; i++) bs[i].setAttribute('aria-pressed', bs[i].getAttribute('data-lang') === l ? 'true' : 'false');
    var g = document.querySelector('.lang'); if (g) g.setAttribute('aria-label', GROUP[l]);
    document.dispatchEvent(new CustomEvent('cpp:lang', { detail: { lang: l } }));
    if (/i18n=debug/.test(location.search) && l !== 'es') console.warn('Sin traducir (' + l + '):', Object.keys(missing));
    missing = {};
  }

  /* ---- 4. selector de idioma en el encabezado -------------------------- */
  function buildSwitcher() {
    var host = document.querySelector('.top-inner');
    if (!host || host.querySelector('.lang')) return;
    var g = document.createElement('div');
    g.className = 'lang'; g.setAttribute('role', 'group'); g.setAttribute('translate', 'no');
    LANGS.forEach(function (l) {
      var b = document.createElement('button');
      b.type = 'button'; b.setAttribute('data-lang', l); b.setAttribute('lang', l);
      b.setAttribute('aria-label', NAME[l]); b.textContent = LABEL[l];
      b.addEventListener('click', function () { setLang(l); });
      g.appendChild(b);
    });
    var toggle = host.querySelector('.menu-toggle');
    host.insertBefore(g, toggle || null);
  }

  /* ---- 5. arranque ------------------------------------------------------ */
  function pick() {
    var m = /[?&]lang=(es|en|ko)\b/.exec(location.search);
    if (m) return m[1];
    try { var s = localStorage.getItem(STORE); if (LANGS.indexOf(s) >= 0) return s; } catch (e) {}
    return 'es';
  }
  buildSwitcher();
  var first = pick();
  document.documentElement.setAttribute('lang', first);
  setLang(first, /[?&]lang=/.test(location.search));
})();
