/* Colegio Presbiteriano del Paraguay: comportamiento del sitio nuevo (menú, avisos de documentos pendientes). */
(function () {
  'use strict';

  var burger = document.querySelector('.burger');
  var menu = document.getElementById('menu');

  function cerrar() {
    if (!menu) return;
    menu.classList.remove('is-open');
    if (burger) { burger.setAttribute('aria-expanded', 'false'); burger.setAttribute('aria-label', 'Abrir el menú'); }
  }

  if (burger && menu) {
    burger.addEventListener('click', function () {
      var abierto = menu.classList.toggle('is-open');
      burger.setAttribute('aria-expanded', abierto ? 'true' : 'false');
      burger.setAttribute('aria-label', abierto ? 'Cerrar el menú' : 'Abrir el menú');
    });
    menu.addEventListener('click', function (e) { if (e.target.closest('a')) cerrar(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') cerrar(); });
    window.addEventListener('resize', function () { if (window.innerWidth >= 1000) cerrar(); });
  }

  /* Documentos que todavía no se cargaron: no navegan y avisan. */
  var aviso;
  function mostrarAviso(texto) {
    if (!aviso) {
      aviso = document.createElement('div');
      aviso.setAttribute('role', 'status');
      aviso.style.cssText = 'position:fixed;left:50%;bottom:26px;transform:translateX(-50%);z-index:99;background:#fff;color:#004C23;' +
        'font:700 14px Montserrat,sans-serif;padding:12px 20px;border-radius:999px;box-shadow:0 10px 30px rgba(0,0,0,.3);max-width:calc(100vw - 32px);text-align:center;transition:opacity .25s';
      document.body.appendChild(aviso);
    }
    aviso.textContent = texto;
    aviso.style.opacity = '1';
    clearTimeout(aviso._t);
    aviso._t = setTimeout(function () { aviso.style.opacity = '0'; }, 2600);
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest('[data-doc-pendiente]');
    if (!a) return;
    e.preventDefault();
    mostrarAviso(a.getAttribute('data-aviso') || 'Este documento estará disponible muy pronto.');
  });

  /* El logo se arma al cargar y se repite al tocarlo. */
  var logo = document.getElementById('logoAssembly');
  if (logo) {
    logo.closest('a').addEventListener('click', function () {
      var piezas = logo.querySelectorAll('.pz');
      Array.prototype.forEach.call(piezas, function (p) { p.style.animation = 'none'; });
      void logo.offsetWidth;
      Array.prototype.forEach.call(piezas, function (p) { p.style.animation = ''; });
    });
  }
})();
