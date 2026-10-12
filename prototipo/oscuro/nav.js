// Submenú de "Institucional": se abre con hover (escritorio) o tocando la flecha (celular/teclado).
(function () {
  var items = Array.prototype.slice.call(document.querySelectorAll('.has-sub'));
  function close(li) { li.classList.remove('open'); li.querySelector('.sub-toggle').setAttribute('aria-expanded', 'false'); }
  items.forEach(function (li) {
    var b = li.querySelector('.sub-toggle');
    b.addEventListener('click', function (e) {
      e.stopPropagation();
      var open = li.classList.toggle('open');
      b.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  });
  document.addEventListener('click', function (e) { items.forEach(function (li) { if (!li.contains(e.target)) close(li); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') items.forEach(close); });
})();
