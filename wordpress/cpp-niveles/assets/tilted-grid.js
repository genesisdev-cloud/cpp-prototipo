/*!
 * Carrusel curvo (Tilted Grid) en JavaScript puro, sin dependencias.
 * Una fila de imágenes corre de derecha a izquierda por el interior de un
 * cilindro: el centro se ve plano, los extremos se curvan hacia el visitante
 * y se desvanecen. Cada imagen se corta en 16 tiras verticales (facetas del
 * cilindro) que giran juntas con CSS; el JS solo mide el espacio y le entrega
 * a cada tile su siguiente imagen cuando da la vuelta, fuera de la vista.
 * Cada tile lleva su nombre (por ejemplo "Nivel Inicial") debajo de la imagen.
 */
(function () {
  'use strict';

  var SLICES = 16;       // tiras por imagen
  var CAMERA = 1.6;      // distancia de la cámara, en radios del cilindro
  var MAX_WIDTH = 55;    // un tile nunca ocupa más de este % del ancho (en pantallas angostas, más: ver maxFor)

  function maxFor(width) { return width < 700 ? 74 : MAX_WIDTH; }

  function arc(bend) {
    return (CAMERA - 1 + Math.cos(bend)) / (2 * CAMERA * Math.sin(bend));
  }

  function measure(width, height, tile, aspect, gap, bend) {
    var h = Math.min((tile / 100) * height, ((maxFor(width) / 100) * width) / aspect);
    var radius = width * arc(bend);
    if (!(h > 0) || !(radius > 0)) return { columns: 2, sweep: 0, unit: 0, limit: 0 };
    var deg = function (rad) { return (rad * 180) / Math.PI; };
    var unit = deg(h / radius);
    var pitch = (aspect + gap / 100) * unit;
    var limit = deg(bend) + (aspect * unit) / 2;
    var columns = Math.min(60, Math.max(2, Math.ceil((2 * limit) / pitch)));
    var round = function (n) { return +n.toFixed(4); };
    var sweep = round((columns * pitch) / 2);
    return { columns: columns, sweep: sweep, unit: round(unit), limit: round(Math.min(sweep, limit)) };
  }

  function num(v, d) { v = parseFloat(v); return isNaN(v) ? d : v; }

  function init(root) {
    var cfg;
    try { cfg = JSON.parse(root.getAttribute('data-config') || '{}'); } catch (e) { return; }
    var images = cfg.images || [];
    var band = root.querySelector('.tgh-band');
    if (!images.length || !band) return;

    var speed = num(cfg.speed, 4);
    var tileHeight = num(cfg.tileHeight, 34);
    var aspect = num(cfg.aspectRatio, 16 / 9);
    var gap = num(cfg.gap, 8);
    var axis = num(cfg.axis, 50);
    var curve = num(cfg.curve, 80);
    var fade = num(cfg.fade, 12);
    var bend = (Math.min(85, Math.max(5, curve)) * Math.PI) / 180;

    var uid = 'tgh' + Math.random().toString(36).slice(2, 8);
    var styleEl = document.createElement('style');
    root.appendChild(styleEl);
    var shown = {};      // imagen de cada tile, como posición en la lista
    var refreshers = [];  // para volver a escribir los nombres si cambia el idioma
    var layout = null;
    var maxW = MAX_WIDTH;

    // Punto de fuga común en el centro de la fila y fundido en los extremos.
    var r = 100 * arc(bend);
    var mask = 'linear-gradient(90deg,transparent,#000 ' + fade + '%,#000 ' + (100 - fade) + '%,transparent)';
    band.style.perspective = (+(r * CAMERA).toFixed(3)) + 'cqw';
    band.style.perspectiveOrigin = '50% ' + axis + '%';
    band.style.webkitMaskImage = mask;
    band.style.maskImage = mask;

    // Se piden todas las imágenes de entrada: un tile toma la siguiente justo antes de entrar.
    images.forEach(function (im) { var i = new Image(); i.src = im.src; });

    function build(L) {
      var columns = L.columns, sweep = L.sweep, unit = L.unit, limit = L.limit;
      // Toda medida es múltiplo del alto del tile (limitado por MAX_WIDTH en pantallas angostas).
      var u = function (n) {
        return 'calc(' + (+n.toFixed(4)) + ' * min(' + tileHeight + 'cqh, ' + (+(maxW / aspect).toFixed(4)) + 'cqw))';
      };
      var radius = (+r.toFixed(3)) + 'cqw';
      var turn = function (d) {
        return 'translateZ(' + radius + ') rotateY(' + (+d.toFixed(4)) + 'deg) translateZ(-' + radius + ')';
      };
      var hide = +(((sweep - limit) / (2 * (sweep || 1))) * 100).toFixed(4);
      var orbit = uid + 'o', tileCls = uid + 't';

      styleEl.textContent =
        '@keyframes ' + orbit + '{' +
        'from{transform:' + turn(-sweep) + '}to{transform:' + turn(sweep) + '}' +
        '0%,' + hide + '%,' + (100 - hide) + '%,100%{visibility:hidden}' +
        (hide + 0.001) + '%,' + (100 - hide - 0.001) + '%{visibility:visible}}' +
        // con "reducir movimiento" la fila queda quieta, como una imagen fija
        '@media(prefers-reduced-motion:reduce){.' + tileCls + '{animation-play-state:paused}}';

      band.innerHTML = '';
      refreshers.length = 0;
      var share = aspect / SLICES;
      var duration = columns * speed;

      for (var t = 0; t < columns; t++) {
        (function (t) {
          var first = columns - 1 - t;          // orden en que los tiles van entrando
          var tile = document.createElement('div');
          tile.className = tileCls + ' tgh-tile';
          tile.style.cssText =
            'position:absolute;' +
            'left:calc(50% - ' + u(aspect / 2) + ');' +
            'top:calc(' + axis + '% - ' + u(0.5) + ');' +
            'width:' + u(aspect) + ';height:' + u(1) + ';' +
            'transform-style:preserve-3d;' +
            'animation:' + orbit + ' ' + duration + 's linear ' + (-t * speed) + 's infinite';

          var imgs = [];
          for (var k = 0; k < SLICES; k++) {
            var s = document.createElement('div');
            s.className = 'tgh-slice';
            s.style.cssText =
              'left:' + u((aspect - share) / 2) + ';' +
              'width:' + (k === SLICES - 1 ? u(share) : 'calc(' + u(share) + ' + 1px)') + ';' +   // se solapa 1px: sin líneas entre facetas
              'height:' + u(1) + ';' +
              'transform:' + turn((aspect / 2 - (k + 0.5) * share) * unit) + ';' +
              (k === 0 ? 'border-radius:10px 0 0 10px;' : '') +
              (k === SLICES - 1 ? 'border-radius:0 10px 10px 0;' : '');
            var img = document.createElement('img');
            img.alt = '';
            img.draggable = false;
            img.style.cssText =
              'position:absolute;top:0;max-width:none;object-fit:cover;' +
              'left:' + u(-k * share) + ';width:' + u(aspect) + ';height:' + u(1);
            s.appendChild(img);
            tile.appendChild(s);
            imgs.push(img);
          }

          var cap = document.createElement('div');
          cap.className = 'tgh-cap';
          cap.setAttribute('translate', 'no');   // el nombre ya sale traducido desde el script
          tile.appendChild(cap);

          var shownNow = shown[t] !== undefined ? shown[t] : first;
          function show(pos) {
            var im = images[pos % images.length];
            for (var i = 0; i < imgs.length; i++) { if (imgs[i].getAttribute('src') !== im.src) imgs[i].src = im.src; }
            cap.textContent = im.label ? (window.cppT ? window.cppT(im.label) : im.label) : '';
            shownNow = pos;
          }
          show(shownNow);
          refreshers.push(function () { show(shownNow); });

          // Al dar la vuelta (fuera de la vista) el tile toma su siguiente imagen y su nombre.
          tile.addEventListener('animationiteration', function (e) {
            if (e.target !== tile) return;
            var lap = Math.round(e.elapsedTime / duration);   // vueltas completas, aunque se pierda algún evento
            var next = lap * columns + first;
            if (shown[t] !== next) { shown[t] = next; show(next); }
          });

          band.appendChild(tile);
        })(t);
      }
    }

    function onSize(w, h) {
      maxW = maxFor(w);
      var next = measure(w, h, tileHeight, aspect, gap, bend);
      if (layout && layout.columns === next.columns && layout.sweep === next.sweep && layout.unit === next.unit && layout.maxW === maxW) return;
      next.maxW = maxW;
      layout = next;
      build(next);
      band.style.opacity = 1;
    }

    // si el visitante cambia de idioma, los nombres bajo cada imagen se actualizan
    document.addEventListener('cpp:lang', function () { refreshers.forEach(function (f) { f(); }); });

    if ('ResizeObserver' in window) {
      new ResizeObserver(function (entries) {
        var cr = entries[0].contentRect;
        if (cr.width > 0 && cr.height > 0) onSize(cr.width, cr.height);
      }).observe(root);
    } else {
      onSize(root.clientWidth || 1200, root.clientHeight || 560);
    }

    // Pausa la animación cuando el carrusel no está a la vista.
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) {
        root.classList.toggle('is-off', !es[0].isIntersecting);
      }).observe(root);
    }
  }

  function boot() {
    var list = document.querySelectorAll('.tgh');
    for (var i = 0; i < list.length; i++) init(list[i]);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
