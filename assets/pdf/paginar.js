/*!
 * Paginador de documentos largos del colegio.
 * Toma el contenido de #fuente (títulos, párrafos, listas, tablas, figuras) y lo reparte en hojas A4:
 *   - hoja 1: membrete completo (escudo, MEC y Gobierno), título e índice;
 *   - hojas siguientes: encabezado reducido y pie con datos de Admisiones y numeración "n / N".
 * Reglas: un título nunca queda solo al final de una hoja; un párrafo que termina en ":" va junto al siguiente;
 * las listas y las tablas se parten entre elementos (las tablas repiten su encabezado).
 *
 * Configuración en <body>: data-titulo (se muestra en el encabezado reducido), data-niveles-indice="2,3,4".
 * Marcas dentro de #fuente:
 *   <div class="salto"></div>              empieza una hoja nueva
 *   <nav class="toc"></nav>                se reemplaza por el índice generado con los títulos
 *   <h2 id="x"><span class="n">1.</span>TÍTULO</h2>   los títulos con id entran al índice
 * Al terminar pone window.__listo = true (lo usa el script que imprime el PDF).
 */
(function () {
  'use strict';

  var cfg = document.body.dataset;
  var LOGOS = cfg.logos || '../logo/';          // carpeta de los logos, relativa al HTML
  var fuente = document.getElementById('fuente');
  var hojas = [];

  var ICON_TEL = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 5a2 2 0 0 1 2-2h2l2 5-2 1a12 12 0 0 0 6 6l1-2 5 2v2a2 2 0 0 1-2 2A16 16 0 0 1 4 5Z"/></svg>';
  var ICON_MAIL = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 6h18v12H3Z"/><path d="M3 7l9 6 9-6"/></svg>';

  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }

  function membreteCompleto() {
    return el('header', 'membrete',
      '<img class="m-cpp" src="' + LOGOS + 'LOGO-hd.png" alt="Colegio Presbiteriano del Paraguay">' +
      '<div class="m-oficial">' +
      '<img class="m-mec" src="' + LOGOS + 'mec-paraguay.png" alt="Ministerio de Educación y Ciencias, Paraguay">' +
      '<img class="m-gob" src="' + LOGOS + 'gobierno-paraguay.png" alt="Gobierno del Paraguay">' +
      '</div>');
  }
  function membreteMini() {
    return el('header', 'mini',
      '<img src="' + LOGOS + 'LOGO-hd.png" alt="Colegio Presbiteriano del Paraguay">' +
      '<div class="tt"><b>' + (cfg.titulo || '') + '</b><span>Colegio Presbiteriano del Paraguay</span></div>');
  }
  function pieCompleto() {
    return el('footer', 'pie',
      '<div class="rotulo">Admisiones</div><div class="datos">' +
      '<div class="dato">' + ICON_TEL + '<span>+595 991 208 472</span></div>' +
      '<div class="dato">' + ICON_MAIL + '<span>info@colegiocpp.com</span></div></div>' +
      '<div class="pag"><span class="pn"></span> / <span class="pt"></span></div>');
  }
  function pieMini() {
    return el('footer', 'pie-min',
      '<div class="a"><span class="r">Admisiones</span><span>+595 991 208 472</span><span>info@colegiocpp.com</span></div>' +
      '<div><span class="pn"></span> / <span class="pt"></span></div>');
  }

  function nuevaHoja() {
    var primera = hojas.length === 0;
    var h = el('div', 'hoja');
    h.appendChild(el('div', 'franja sup'));
    h.appendChild(primera ? membreteCompleto() : membreteMini());
    var c = el('main', 'contenido largo' + (primera ? '' : ' interior'));
    h.appendChild(c);
    h.appendChild(primera ? pieCompleto() : pieMini());
    h.appendChild(el('div', 'franja inf'));
    document.body.appendChild(h);
    var o = { hoja: h, cont: c };
    hojas.push(o);
    return o;
  }

  var actual;
  // alto realmente usado: borde inferior del último elemento; se deja un margen de 6 px porque imprimir puede variar un poco el alto del texto
  function usado(c) {
    var l = c.lastElementChild;
    return l ? l.getBoundingClientRect().bottom - c.getBoundingClientRect().top : 0;
  }
  function desborda(h) { return usado(h.cont) > h.cont.clientHeight - 6 || h.cont.scrollHeight > h.cont.clientHeight + 1; }
  function pideSiguiente(n) { return /^H[2-5]$/.test(n.tagName) || n.hasAttribute('data-sigue'); }

  // títulos (y frases que terminan en ":") que quedaron al final de una hoja pasan a la siguiente
  function retirarFinales(h) {
    var llevar = [];
    while (h.cont.children.length > 1 && pideSiguiente(h.cont.lastElementChild)) {
      llevar.unshift(h.cont.removeChild(h.cont.lastElementChild));
    }
    return llevar;
  }
  function saltarHoja() {
    var llevar = retirarFinales(actual);
    actual = nuevaHoja();
    llevar.forEach(function (n) { actual.cont.appendChild(n); });
  }

  function colocar(nodo) {
    actual.cont.appendChild(nodo);
    if (desborda(actual)) {
      actual.cont.removeChild(nodo);
      saltarHoja();
      actual.cont.appendChild(nodo);
    }
  }

  function colocarLista(src) {
    var ordenada = src.tagName === 'OL';
    var inicio = parseInt(src.getAttribute('start') || '1', 10);
    Array.prototype.forEach.call(src.children, function (li, idx) {
      var nuevo = li.cloneNode(true);
      function envoltorio() {
        var sh = src.cloneNode(false); sh.__src = src;
        if (ordenada) sh.setAttribute('start', inicio + idx);
        actual.cont.appendChild(sh); return sh;
      }
      var ult = actual.cont.lastElementChild;
      var shell = (ult && ult.__src === src) ? ult : envoltorio();
      shell.appendChild(nuevo);
      if (desborda(actual)) {
        shell.removeChild(nuevo);
        if (!shell.children.length) shell.parentNode.removeChild(shell);
        saltarHoja();
        envoltorio().appendChild(nuevo);
      }
    });
  }

  function colocarTabla(src) {
    var cabeza = src.querySelector('thead');
    var filas = Array.prototype.slice.call(src.querySelectorAll('tbody > tr'));
    if (!filas.length) filas = Array.prototype.slice.call(src.querySelectorAll('tr')).slice(cabeza ? 1 : 0);
    function envoltorio() {
      var t = src.cloneNode(false); t.__src = src;
      if (cabeza) t.appendChild(cabeza.cloneNode(true));
      t.appendChild(document.createElement('tbody'));
      actual.cont.appendChild(t); return t;
    }
    filas.forEach(function (tr) {
      var nueva = tr.cloneNode(true);
      var ult = actual.cont.lastElementChild;
      var t = (ult && ult.__src === src) ? ult : envoltorio();
      t.querySelector('tbody').appendChild(nueva);
      if (desborda(actual)) {
        t.querySelector('tbody').removeChild(nueva);
        if (!t.querySelector('tbody').children.length) t.parentNode.removeChild(t);
        saltarHoja();
        envoltorio().querySelector('tbody').appendChild(nueva);
      }
    });
  }

  function armarIndice(nav) {
    var niveles = (cfg.nivelesIndice || '2,3,4').split(',');
    var sel = niveles.map(function (n) { return 'h' + n.trim(); }).join(',');
    var frag = document.createDocumentFragment();
    Array.prototype.forEach.call(fuente.querySelectorAll(sel), function (h) {
      if (!h.id) return;
      var nivel = niveles.indexOf(h.tagName.slice(1)) + 1;
      var n = h.querySelector('.n');
      var texto = h.cloneNode(true);
      var nn = texto.querySelector('.n'); if (nn) nn.parentNode.removeChild(nn);
      var item = el('div', 'toc-i n' + nivel,
        '<span class="t">' + (n ? '<span class="n">' + n.textContent + '</span>' : '') + texto.innerHTML.trim() + '</span>' +
        '<span class="l"></span><span class="p">00</span>');
      item.setAttribute('data-ref', h.id);
      frag.appendChild(item);
    });
    return frag;
  }

  function armar() {
    actual = nuevaHoja();
    var hijos = Array.prototype.slice.call(fuente.children);
    hijos.forEach(function (b) {
      if (b.classList.contains('salto')) { if (actual.cont.children.length) saltarHoja(); return; }
      if (b.hasAttribute('data-nueva') && actual.cont.children.length) saltarHoja();
      if (b.matches('nav.toc')) {
        var idx = armarIndice(b);
        Array.prototype.slice.call(idx.children).forEach(function (it) { colocar(it); });   // copia: colocar() va sacando los nodos del fragmento
        return;
      }
      if (b.matches('ul,ol')) { colocarLista(b); return; }
      if (b.matches('table')) { colocarTabla(b); return; }
      var c = b.cloneNode(true);
      if (/:\s*$/.test(c.textContent) && c.tagName === 'P') c.setAttribute('data-sigue', '');
      colocar(c);
    });

    // numeración de hojas y números del índice
    var total = hojas.length;
    hojas.forEach(function (h, i) {
      Array.prototype.forEach.call(h.hoja.querySelectorAll('.pn'), function (s) { s.textContent = i + 1; });
      Array.prototype.forEach.call(h.hoja.querySelectorAll('.pt'), function (s) { s.textContent = total; });
    });
    var pagina = {};
    hojas.forEach(function (h, i) {
      Array.prototype.forEach.call(h.cont.querySelectorAll('[id]'), function (x) { if (!(x.id in pagina)) pagina[x.id] = i + 1; });
    });
    Array.prototype.forEach.call(document.querySelectorAll('.toc-i'), function (it) {
      var p = pagina[it.getAttribute('data-ref')];
      it.querySelector('.p').textContent = p || '';
    });
    fuente.parentNode.removeChild(fuente);
    window.__hojas = total;
    window.__listo = true;
  }

  function iniciar() {
    var esperar = [];
    if (document.fonts && document.fonts.load) {
      var muestra = (fuente.textContent || '') + ' áéíóúüñÁÉÍÓÚÑ¿¡°ªº';
      ['400 10pt Bitter', '700 10pt Bitter', 'italic 400 10pt Bitter', 'italic 700 10pt Bitter', '400 10pt Questrial'].forEach(function (f) {
        esperar.push(document.fonts.load(f, muestra).catch(function () {}));
      });
    }
    if (document.fonts && document.fonts.ready) esperar.push(document.fonts.ready);
    Array.prototype.forEach.call(document.images, function (im) {
      if (!im.complete) esperar.push(new Promise(function (r) { im.addEventListener('load', r); im.addEventListener('error', r); }));
    });
    Promise.all(esperar).then(function () { setTimeout(armar, 150); });
  }
  if (document.readyState === 'complete') iniciar(); else window.addEventListener('load', iniciar);
})();
