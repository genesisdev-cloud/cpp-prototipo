/*!
 * Formulario de postulación (solo interfaz). Valida los campos, muestra u oculta los campos condicionales
 * y administra la carga de archivos con vista previa. En esta versión de prueba no se envía nada:
 * al terminar se muestra una referencia de ejemplo. Los nombres (name) de los campos ya están pensados
 * para conectarlos después con el servidor.
 *
 * Mensajes: se escriben en español y pasan por window.cppT() para traducirse (i18n/i18n.js).
 * El ciclo se elige con ?ciclo=inicial|primero|segundo|tercero|medio.
 */
(function () {
  'use strict';

  var MAX_MB = 5;
  var CICLOS = ['inicial', 'primero', 'segundo', 'tercero', 'medio'];

  function T(s) { return typeof window.cppT === 'function' ? window.cppT(s) : s; }

  var form = document.getElementById('postForm');
  if (!form) return;

  /* ---- 1. ciclo elegido: solo se muestra lo que le corresponde ---------------------------------- */
  var ciclo = new URLSearchParams(location.search).get('ciclo');
  if (CICLOS.indexOf(ciclo) < 0) ciclo = 'inicial';
  document.getElementById('cicloVal').value = ciclo;

  Array.prototype.forEach.call(document.querySelectorAll('[data-ciclo]'), function (el) {
    var activo = el.getAttribute('data-ciclo') === ciclo;
    if (el.tagName === 'OPTGROUP') {                       // los grados del ciclo pasan a ser opciones directas del selector
      if (activo) { var sel = el.parentNode; while (el.firstChild) sel.insertBefore(el.firstChild, el); }
      el.parentNode.removeChild(el);
    } else el.hidden = !activo;
  });
  Array.prototype.forEach.call(document.querySelectorAll('.post-ciclos a'), function (a) {
    a.setAttribute('aria-current', a.getAttribute('data-c') === ciclo ? 'true' : 'false');
  });

  var hoy = new Date().toISOString().slice(0, 10);
  Array.prototype.forEach.call(form.querySelectorAll('input[type="date"]'), function (d) { d.max = hoy; });

  /* ---- 2. campos condicionales ------------------------------------------------------------------ */
  function condiciones() {
    Array.prototype.forEach.call(form.querySelectorAll('.pf-cond'), function (w) {
      var marcado = form.querySelector('input[name="' + w.getAttribute('data-if') + '"]:checked');
      var on = !!marcado && marcado.value === w.getAttribute('data-val');
      w.hidden = !on;
      Array.prototype.forEach.call(w.querySelectorAll('input,textarea,select'), function (c) { c.disabled = !on; });
    });
  }
  condiciones();

  /* ---- 3. mensajes de error --------------------------------------------------------------------- */
  function msgEl(w) { return w.querySelector('.pf-err') || w.querySelector('.up-err'); }
  function setErr(w, clave) {
    var m = msgEl(w);
    w.classList.add('err');
    if (m) { m.setAttribute('data-k', clave); m.textContent = T(clave); }
    var c = w.querySelector('input,select,textarea');
    if (c) c.setAttribute('aria-invalid', 'true');
  }
  function clearErr(w) {
    var m = msgEl(w);
    w.classList.remove('err');
    if (m) { m.removeAttribute('data-k'); m.textContent = ''; }
    Array.prototype.forEach.call(w.querySelectorAll('[aria-invalid]'), function (c) { c.removeAttribute('aria-invalid'); });
  }
  function refrescarMensajes() {
    Array.prototype.forEach.call(document.querySelectorAll('[data-k]'), function (m) { m.textContent = T(m.getAttribute('data-k')); });
    Array.prototype.forEach.call(document.querySelectorAll('.up-rm'), function (b) { b.setAttribute('aria-label', T('Quitar archivo')); });
  }

  /* ---- 4. validación de campos ------------------------------------------------------------------ */
  var RE_MAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  function checkPf(w) {
    if (w.closest('.pf-cond[hidden]')) { clearErr(w); return null; }
    var radios = w.querySelectorAll('input[type="radio"]');
    if (radios.length) {
      if (!radios[0].required) return null;
      var hay = Array.prototype.some.call(radios, function (r) { return r.checked; });
      if (!hay) { setErr(w, 'Elegí una opción.'); return radios[0]; }
      clearErr(w); return null;
    }
    var c = w.querySelector('input,select,textarea');
    if (!c || c.disabled || !c.required) return null;
    var v = c.value.trim();
    if (!v) { setErr(w, c.tagName === 'SELECT' ? 'Elegí una opción.' : 'Este campo es obligatorio.'); return c; }
    if (c.type === 'email' && !RE_MAIL.test(v)) { setErr(w, 'Ingresá un correo electrónico válido.'); return c; }
    if (c.type === 'tel' && v.replace(/\D/g, '').length < 6) { setErr(w, 'Ingresá un número de teléfono válido.'); return c; }
    if (c.type === 'date' && (v > hoy || v < '1990-01-01')) { setErr(w, 'Ingresá una fecha válida.'); return c; }
    clearErr(w); return null;
  }

  function checkUp(u) {
    var inputs = u.querySelectorAll('input[type="file"]');
    var proviene = (document.getElementById('proviene') || {}).value || '';
    var falta = null;
    Array.prototype.forEach.call(inputs, function (i) {
      var req = i.hasAttribute('data-req') || (i.getAttribute('data-req-if') === 'proviene' && proviene.trim());
      if (req && !i.files.length && !falta) falta = i;
    });
    if (falta) { setErr(u, inputs.length > 1 ? 'Adjuntá las dos caras: frente y dorso.' : 'Adjuntá el archivo.'); return falta; }
    // si hay un error de formato o tamaño de una carga anterior, se mantiene hasta que se cambie el archivo
    if (u.classList.contains('err') && u.getAttribute('data-bad')) return inputs[0];
    clearErr(u); return null;
  }

  function checkDecl() {
    var d = document.getElementById('declaracion'), e = document.getElementById('declErr');
    if (!d.checked) { e.setAttribute('data-k', 'Tenés que aceptar la declaración para enviar.'); e.textContent = T('Tenés que aceptar la declaración para enviar.'); return d; }
    e.removeAttribute('data-k'); e.textContent = ''; return null;
  }

  function validar() {
    var malos = [];
    Array.prototype.forEach.call(form.querySelectorAll('.pf'), function (w) { var r = checkPf(w); if (r) malos.push(r); });
    Array.prototype.forEach.call(form.querySelectorAll('.up'), function (u) { var r = checkUp(u); if (r) malos.push(r); });
    var d = checkDecl(); if (d) malos.push(d);
    return malos;
  }

  // al corregir un campo con error, se revisa de nuevo enseguida
  form.addEventListener('input', function (e) {
    var w = e.target.closest('.pf');
    if (w && w.classList.contains('err')) checkPf(w);
  });
  form.addEventListener('change', function (e) {
    condiciones();
    var w = e.target.closest('.pf');
    if (w && w.classList.contains('err')) checkPf(w);
    if (e.target.id === 'declaracion' && e.target.checked) checkDecl();
  });

  /* ---- 5. carga de archivos --------------------------------------------------------------------- */
  function tamano(bytes) {
    var lang = document.documentElement.lang || 'es';
    if (bytes < 1024 * 1024) return Math.max(1, Math.round(bytes / 1024)).toLocaleString(lang) + ' KB';
    return (bytes / 1048576).toLocaleString(lang, { maximumFractionDigits: 1 }) + ' MB';
  }
  function esPdf(f) { return f.type === 'application/pdf' || /\.pdf$/i.test(f.name); }
  function esImg(f) { return f.type.indexOf('image/') === 0 || /\.(jpe?g|png|webp)$/i.test(f.name); }   // sin HEIC: el iPhone convierte a JPG solo cuando el formulario no lo acepta

  function revisarTipo(input, f) {
    var acc = input.accept, pdf = acc.indexOf('pdf') >= 0, img = acc.indexOf('image') >= 0;
    if ((pdf && esPdf(f)) || (img && esImg(f))) return '';
    if (pdf && img) return 'Formato no permitido. Usá PDF, JPG o PNG.';
    return pdf ? 'Formato no permitido. Usá un archivo PDF.' : 'Formato no permitido. Usá una foto JPG o PNG.';
  }
  function revisarArchivo(input, f) {
    if (f.size > MAX_MB * 1048576) return 'El archivo supera los 5 MB.';
    return revisarTipo(input, f);
  }

  /* Las fotos de un celular moderno pesan 5 a 12 MB. Se reducen al elegirlas (lado máximo 1800 px, JPG) para que
     el envío sea rápido y entren en el límite. Los PDF no se tocan. */
  var MAX_LADO = 1800, CALIDAD = 0.82, UMBRAL = 1.2 * 1048576, MAX_ORIGINAL = 30 * 1048576;
  function reducirFoto(f) {
    return new Promise(function (resolver) {
      if (!window.createImageBitmap) return resolver(f);
      function hecho(bm) {
        var w = bm.width, h = bm.height, k = Math.min(1, MAX_LADO / Math.max(w, h));
        if (k === 1 && f.size <= UMBRAL && f.type === 'image/jpeg') { if (bm.close) bm.close(); return resolver(f); }
        var c = document.createElement('canvas');
        c.width = Math.round(w * k); c.height = Math.round(h * k);
        var ctx = c.getContext('2d');
        ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, c.width, c.height);     // fondo blanco por si la foto era PNG con transparencia
        ctx.drawImage(bm, 0, 0, c.width, c.height);
        if (bm.close) bm.close();
        c.toBlob(function (b) {
          if (!b || (k === 1 && b.size >= f.size)) return resolver(f);
          resolver(new File([b], f.name.replace(/\.[^.]+$/, '') + '.jpg', { type: 'image/jpeg', lastModified: Date.now() }));
        }, 'image/jpeg', CALIDAD);
      }
      createImageBitmap(f, { imageOrientation: 'from-image' }).then(hecho, function () {
        createImageBitmap(f).then(hecho, function () { resolver(f); });
      });
    });
  }

  function limpiarSlot(slot) {
    var f = slot.querySelector('.up-file');
    if (f) {
      var im = f.querySelector('img');
      if (im && im.src.indexOf('blob:') === 0) URL.revokeObjectURL(im.src);
      f.parentNode.removeChild(f);
    }
    slot.classList.remove('has-file');
    Array.prototype.forEach.call(slot.querySelectorAll('.up-ico,.up-txt'), function (x) { x.hidden = false; });
  }

  function mostrarArchivo(slot, input, f) {
    limpiarSlot(slot);
    slot.classList.add('has-file');
    Array.prototype.forEach.call(slot.querySelectorAll('.up-ico,.up-txt'), function (x) { x.hidden = true; });
    var box = document.createElement('div');
    box.className = 'up-file';
    box.style.cssText = 'display:flex;align-items:center;gap:13px;min-width:0;flex:1';
    var vista;
    if (esImg(f)) {
      vista = document.createElement('img'); vista.className = 'up-thumb'; vista.alt = ''; vista.src = URL.createObjectURL(f);
    } else {
      vista = document.createElement('div'); vista.className = 'up-pdf'; vista.textContent = esPdf(f) ? 'PDF' : 'IMG';
    }
    var info = document.createElement('div');
    info.style.cssText = 'min-width:0;flex:1';
    var n = document.createElement('span'); n.className = 'up-name'; n.textContent = f.name;
    var m = document.createElement('span'); m.className = 'up-meta'; m.textContent = tamano(f.size);
    info.appendChild(n); info.appendChild(m);
    var rm = document.createElement('button');
    rm.type = 'button'; rm.className = 'up-rm'; rm.setAttribute('aria-label', T('Quitar archivo'));
    rm.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>';
    rm.addEventListener('click', function (e) {
      e.preventDefault(); e.stopPropagation();
      input.value = ''; limpiarSlot(slot);
      var up = slot.closest('.up'); up.removeAttribute('data-bad'); clearErr(up);
    });
    box.appendChild(vista); box.appendChild(info); box.appendChild(rm);
    slot.appendChild(box);
  }

  Array.prototype.forEach.call(form.querySelectorAll('.up-slot'), function (slot) {
    var input = slot.querySelector('input[type="file"]');
    var up = slot.closest('.up');

    function rechazar(err) { input.value = ''; limpiarSlot(slot); up.setAttribute('data-bad', '1'); setErr(up, err); }
    function aceptar(f) { mostrarArchivo(slot, input, f); }

    input.addEventListener('change', function () {
      var f = input.files[0];
      up.removeAttribute('data-bad'); clearErr(up);
      if (!f) { limpiarSlot(slot); return; }
      var errTipo = revisarTipo(input, f);
      if (errTipo) return rechazar(errTipo);
      if (!esImg(f)) {                                   // PDF: se controla tal cual
        var errTam = revisarArchivo(input, f);
        return errTam ? rechazar(errTam) : aceptar(f);
      }
      if (f.size > MAX_ORIGINAL) return rechazar('El archivo supera los 5 MB.');
      slot.classList.add('procesando');
      reducirFoto(f).then(function (nf) {
        slot.classList.remove('procesando');
        if (nf !== f) {                                  // la foto reducida reemplaza a la original en el campo
          try { var dt = new DataTransfer(); dt.items.add(nf); input.files = dt.files; } catch (x) { nf = f; }
        }
        var err = revisarArchivo(input, nf);
        err ? rechazar(err) : aceptar(nf);
      });
    });

    ['dragenter', 'dragover'].forEach(function (ev) {
      slot.addEventListener(ev, function (e) { e.preventDefault(); slot.classList.add('drag'); });
    });
    ['dragleave', 'drop'].forEach(function (ev) {
      slot.addEventListener(ev, function (e) { e.preventDefault(); slot.classList.remove('drag'); });
    });
    slot.addEventListener('drop', function (e) {
      if (e.dataTransfer && e.dataTransfer.files.length) {
        try { input.files = e.dataTransfer.files; input.dispatchEvent(new Event('change', { bubbles: true })); } catch (x) {}
      }
    });
  });

  /* ---- 6. envío (solo interfaz) ----------------------------------------------------------------- */
  var resumen = document.getElementById('resumen');
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var malos = validar();
    if (malos.length) {
      resumen.setAttribute('data-k', 'Revisá los campos marcados: faltan datos o archivos.');
      resumen.textContent = T('Revisá los campos marcados: faltan datos o archivos.');
      var primero = malos[0], caja = primero.closest('.pf,.up,.ps-decl') || primero;
      caja.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(function () { try { primero.focus({ preventScroll: true }); } catch (x) {} }, 350);
      return;
    }
    resumen.removeAttribute('data-k'); resumen.textContent = '';
    document.getElementById('postRef').textContent = 'POST-2027-' + (Math.floor(Math.random() * 9000) + 1000);
    form.hidden = true;
    var nota = document.querySelector('.ph-nota'); if (nota) nota.hidden = true;
    document.getElementById('postOk').hidden = false;
    document.querySelector('.ph').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  document.addEventListener('cpp:lang', refrescarMensajes);
})();
