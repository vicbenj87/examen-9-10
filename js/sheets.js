/* ==========================================================================
   sheets.js — Registro en la hoja de cálculo
   Se comunica con una implementación de Google Apps Script mediante JSONP,
   que es lo único que funciona cuando el examen se abre desde el disco
   (origen "null", donde fetch se topa con CORS) o desde GitHub Pages.
   Si no hay URL configurada en config.js, todo se guarda solo en este
   dispositivo (localStorage + CSV) y el examen sigue funcionando normal.
   ========================================================================== */

window.EX = window.EX || {};

EX.Sheets = (function () {
  'use strict';

  var CFG = EX.CONFIG;

  function disponible() {
    return typeof CFG.urlAppsScript === 'string' && /^https:\/\//.test(CFG.urlAppsScript);
  }

  function consulta(objeto) {
    return Object.keys(objeto).map(function (k) {
      return encodeURIComponent(k) + '=' + encodeURIComponent(objeto[k]);
    }).join('&');
  }

  function jsonp(parametros, msLimite) {
    return new Promise(function (resolver, rechazar) {
      var nombre = 'exRespuesta' + Date.now() + Math.floor(Math.random() * 100000);
      var script = document.createElement('script');
      var reloj;

      function limpiar() {
        try { delete window[nombre]; } catch (e) { window[nombre] = undefined; }
        if (script.parentNode) script.parentNode.removeChild(script);
        clearTimeout(reloj);
      }

      window[nombre] = function (datos) { limpiar(); resolver(datos || {}); };
      script.onerror = function () { limpiar(); rechazar(new Error('No se pudo contactar con la hoja.')); };
      reloj = setTimeout(function () { limpiar(); rechazar(new Error('La hoja tardó demasiado en responder.')); },
        msLimite || 12000);

      parametros.callback = nombre;
      parametros.hoja = CFG.hojaCalculo.hoja;
      script.src = CFG.urlAppsScript + '?' + consulta(parametros);
      document.head.appendChild(script);
    });
  }

  /* Se llama al empezar: crea la fila con nombre y apellido. */
  function registrarInicio(nombre, apellido) {
    var id = 're910-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 7);
    if (!disponible()) return Promise.resolve({ ok: false, id: id, motivo: 'sin-configurar' });
    return jsonp({ accion: 'inicio', nombre: nombre, apellido: apellido, id: id })
      .then(function (r) { return { ok: r.ok !== false, id: r.id || id, fila: r.fila }; })
      .catch(function (e) { return { ok: false, id: id, motivo: e.message }; });
  }

  /* Se llama al terminar: completa puntaje, total y porcentaje de esa fila. */
  function registrarFinal(datos) {
    if (!disponible()) return Promise.resolve({ ok: false, motivo: 'sin-configurar' });
    return jsonp({
      accion: 'final',
      id: datos.id,
      nombre: datos.nombre,
      apellido: datos.apellido,
      puntaje: datos.puntaje,
      total: datos.total,
      porcentaje: datos.porcentaje
    })
      .then(function (r) { return { ok: r.ok !== false, motivo: r.error }; })
      .catch(function (e) { return { ok: false, motivo: e.message }; });
  }

  return { disponible: disponible, registrarInicio: registrarInicio, registrarFinal: registrarFinal };
})();
