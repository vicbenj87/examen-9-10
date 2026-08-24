/* ==========================================================================
   utils.js — Ayudas pequeñas y sin dependencias
   ========================================================================== */

window.EX = window.EX || {};

EX.U = (function () {
  'use strict';

  /* --- DOM --- */
  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }

  function crear(etiqueta, props, hijos) {
    var el = document.createElement(etiqueta);
    props = props || {};
    Object.keys(props).forEach(function (k) {
      if (k === 'clase') el.className = props[k];
      else if (k === 'html') el.innerHTML = props[k];
      else if (k === 'texto') el.textContent = props[k];
      else if (k === 'datos') Object.keys(props[k]).forEach(function (d) { el.dataset[d] = props[k][d]; });
      else if (k.indexOf('on') === 0) el.addEventListener(k.slice(2).toLowerCase(), props[k]);
      else if (props[k] !== null && props[k] !== undefined && props[k] !== false) el.setAttribute(k, props[k]);
    });
    (hijos || []).forEach(function (h) {
      if (h === null || h === undefined) return;
      el.appendChild(typeof h === 'string' ? document.createTextNode(h) : h);
    });
    return el;
  }

  function vaciar(el) { while (el.firstChild) el.removeChild(el.firstChild); return el; }

  /* --- Azar --- */
  function mezclar(lista) {           // Fisher–Yates sobre una copia
    var a = lista.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  /* --- Texto --- */
  function normalizar(txt) {
    return String(txt == null ? '' : txt)
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')   // quita tildes
      .replace(/[^a-z0-9ñ\s]/g, ' ')                       // quita puntuación
      .replace(/\s+/g, ' ')
      .trim();
  }

  function coincide(escrito, aceptadas) {
    var n = normalizar(escrito);
    if (!n) return false;
    return aceptadas.some(function (r) { return normalizar(r) === n; });
  }

  function capitalizar(txt) {
    txt = String(txt || '').trim();
    return txt ? txt.charAt(0).toUpperCase() + txt.slice(1) : '';
  }

  function letra(i) { return 'abcdefghijklmnopqrstuvwxyz'[i] || String(i + 1); }

  /* --- Números --- */
  function limitar(v, min, max) { return Math.min(max, Math.max(min, v)); }
  function redondear(v, dec) { var f = Math.pow(10, dec || 0); return Math.round(v * f) / f; }

  /* --- Almacenamiento local (respaldo si no hay hoja de cálculo) --- */
  var CLAVE = 'examen-reino-exilio-re910';

  function guardarLocal(registro) {
    try {
      var previos = JSON.parse(localStorage.getItem(CLAVE) || '[]');
      previos.push(registro);
      localStorage.setItem(CLAVE, JSON.stringify(previos));
      return true;
    } catch (e) { return false; }
  }

  function leerLocal() {
    try { return JSON.parse(localStorage.getItem(CLAVE) || '[]'); }
    catch (e) { return []; }
  }

  function descargarCSV(nombreArchivo, filas) {
    var csv = filas.map(function (f) {
      return f.map(function (c) {
        var s = String(c == null ? '' : c);
        return /[",\n;]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
      }).join(',');
    }).join('\n');
    var blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    var a = crear('a', { href: URL.createObjectURL(blob), download: nombreArchivo });
    document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 200);
  }

  /* --- Mensaje flotante --- */
  var temporizadorBrindis = null;
  function brindis(texto, ms) {
    var caja = $('#brindis');
    if (!caja) return;
    caja.textContent = texto;
    caja.classList.add('esta-visible');
    clearTimeout(temporizadorBrindis);
    temporizadorBrindis = setTimeout(function () {
      caja.classList.remove('esta-visible');
    }, ms || 3200);
  }

  return {
    $: $, $$: $$, crear: crear, vaciar: vaciar,
    mezclar: mezclar, normalizar: normalizar, coincide: coincide,
    capitalizar: capitalizar, letra: letra,
    limitar: limitar, redondear: redondear,
    guardarLocal: guardarLocal, leerLocal: leerLocal, descargarCSV: descargarCSV,
    brindis: brindis
  };
})();
