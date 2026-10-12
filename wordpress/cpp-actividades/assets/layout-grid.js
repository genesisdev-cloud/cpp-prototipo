/*!
 * Tarjetas que se expanden (Layout Grid) en JavaScript puro, sin dependencias.
 * Al tocar una tarjeta, su foto crece hasta el centro de la pantalla (animación
 * FLIP con la Web Animations API) y muestra el título y el texto sobre un velo
 * oscuro. Se cierra con la X, con Escape o tocando fuera.
 */
(function () {
  'use strict';

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function rectOf(el) {
    var r = el.getBoundingClientRect();
    return { left: r.left, top: r.top, width: r.width, height: r.height };
  }
  function target() {
    var vw = window.innerWidth, vh = window.innerHeight;
    var w = Math.min(vw >= 768 ? 880 : vw * 0.94, vw * 0.94);
    var h = Math.min(vw >= 768 ? 560 : vh * 0.8, vh * 0.86);
    return { left: (vw - w) / 2, top: (vh - h) / 2, width: w, height: h };
  }
  function px(r) {
    return { left: r.left + 'px', top: r.top + 'px', width: r.width + 'px', height: r.height + 'px' };
  }
  function move(el, from, to, ms, done) {
    if (reduce || !el.animate) { Object.assign(el.style, px(to)); if (done) done(); return; }
    var a = el.animate([px(from), px(to)], { duration: ms, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'forwards' });
    a.onfinish = function () { Object.assign(el.style, px(to)); a.cancel(); if (done) done(); };
  }

  function init(root) {
    var cards = root.querySelectorAll('.lg-card');
    if (!cards.length) return;
    root.classList.add('is-ready');
    var current = null;

    function open(card) {
      if (current) return;
      var btn = card.querySelector('.lg-open');
      var img = btn.querySelector('img');
      var title = card.querySelector('.lg-content h3');
      var text = card.querySelector('.lg-content p');
      var from = rectOf(btn);

      var back = document.createElement('div');
      back.className = 'lg-backdrop';
      var pop = document.createElement('div');
      pop.className = 'lg-pop';
      pop.setAttribute('role', 'dialog');
      pop.setAttribute('aria-modal', 'true');
      pop.setAttribute('aria-label', title ? title.textContent : '');
      var bigImg = img.cloneNode(false);
      bigImg.alt = '';
      var body = document.createElement('div');
      body.className = 'lg-pop-body';
      body.innerHTML = '<h3></h3><p></p>';
      body.querySelector('h3').textContent = title ? title.textContent : '';
      body.querySelector('p').textContent = text ? text.textContent : '';
      var close = document.createElement('button');
      close.type = 'button';
      close.className = 'lg-close';
      close.setAttribute('aria-label', root.getAttribute('data-close') || 'Cerrar');
      pop.appendChild(bigImg); pop.appendChild(body); pop.appendChild(close);
      Object.assign(pop.style, px(from));
      document.body.appendChild(back);
      document.body.appendChild(pop);
      document.documentElement.classList.add('lg-lock');
      card.classList.add('is-open');
      current = { card: card, btn: btn, pop: pop, back: back };

      var to = target();
      back.animate && !reduce ? back.animate([{ opacity: 0 }, { opacity: 0.45 }], { duration: 320, fill: 'forwards' }) : (back.style.opacity = 0.45);
      move(pop, from, to, 380, function () { pop.classList.add('is-full'); close.focus(); });
      if (reduce) pop.classList.add('is-full');

      back.addEventListener('click', shut);
      close.addEventListener('click', shut);
      pop.addEventListener('click', function (e) { if (e.target === pop || e.target === bigImg) shut(); });
    }

    function shut() {
      if (!current) return;
      var c = current; current = null;
      c.pop.classList.remove('is-full');
      var now = rectOf(c.pop), to = rectOf(c.btn);
      Object.assign(c.pop.style, px(now));
      if (c.back.animate && !reduce) c.back.animate([{ opacity: 0.45 }, { opacity: 0 }], { duration: 300, fill: 'forwards' });
      move(c.pop, now, to, 340, function () {
        c.pop.remove(); c.back.remove();
        c.card.classList.remove('is-open');
        document.documentElement.classList.remove('lg-lock');
        c.btn.focus();
      });
    }

    for (var i = 0; i < cards.length; i++) {
      (function (card) {
        card.querySelector('.lg-open').addEventListener('click', function () { open(card); });
      })(cards[i]);
    }
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') shut(); });
    // Si cambia el tamaño de la ventana con una tarjeta abierta, se vuelve a centrar.
    window.addEventListener('resize', function () {
      if (current) Object.assign(current.pop.style, px(target()));
    });
  }

  function boot() {
    var list = document.querySelectorAll('.lg');
    for (var i = 0; i < list.length; i++) init(list[i]);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
