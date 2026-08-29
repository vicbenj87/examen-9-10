/**
 * ============================================================================
 *  Examen Capítulo 8: Los Jueces — registro en Google Sheets
 * ============================================================================
 *  CÓMO PONERLO EN MARCHA
 *  1. Abre la hoja de cálculo:
 *     https://docs.google.com/spreadsheets/d/1xtsQyxeNEno3EJ8s-7o0RqXdHr3HORiRuI5vUCOv-gE/edit
 *  2. Menú  Extensiones ▸ Apps Script.
 *  3. Borra lo que haya y pega TODO este archivo. Guarda.
 *  4. Implementar ▸ Nueva implementación ▸ tipo «Aplicación web».
 *       · Descripción:        Examen RC8
 *       · Ejecutar como:      Yo
 *       · Quién tiene acceso: Cualquier persona
 *  5. Autoriza cuando lo pida (aparecerá un aviso de app no verificada:
 *     entra en «Configuración avanzada» ▸ «Ir a … (no seguro)». Es tu propio
 *     script, y solo toca esta hoja).
 *  6. Copia la URL que termina en /exec y pégala en js/config.js,
 *     en el campo urlAppsScript.
 *
 *  Si cambias el código, recuerda crear una NUEVA versión de la implementación.
 * ============================================================================
 */

var ID_HOJA_CALCULO = '1xtsQyxeNEno3EJ8s-7o0RqXdHr3HORiRuI5vUCOv-gE';
var NOMBRE_HOJA     = 'RC8';
var ENCABEZADOS     = ['nombre', 'apellido', 'puntaje', 'total', 'porcentaje', 'id', 'fecha'];

function doGet(e)  { return atender(e); }
function doPost(e) { return atender(e); }

function atender(e) {
  var p = (e && e.parameter) ? e.parameter : {};
  var salida;

  try {
    var hoja = obtenerHoja(p.hoja || NOMBRE_HOJA);

    if (p.accion === 'inicio') {
      salida = registrarInicio(hoja, p);
    } else if (p.accion === 'final') {
      salida = registrarFinal(hoja, p);
    } else if (p.accion === 'ping') {
      salida = { ok: true, hoja: hoja.getName(), filas: hoja.getLastRow() };
    } else {
      salida = { ok: false, error: 'Acción desconocida: ' + p.accion };
    }
  } catch (error) {
    salida = { ok: false, error: String(error) };
  }

  return responder(salida, p.callback);
}

/** Devuelve JSONP si viene callback (necesario al abrir el examen desde el disco). */
function responder(objeto, callback) {
  var json = JSON.stringify(objeto);
  if (callback) {
    return ContentService
      .createTextOutput(callback + '(' + json + ');')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService.createTextOutput(json).setMimeType(ContentService.MimeType.JSON);
}

/** Busca la hoja RC8; si no existe, la crea con sus encabezados. */
function obtenerHoja(nombre) {
  var libro = SpreadsheetApp.openById(ID_HOJA_CALCULO);
  var hoja = libro.getSheetByName(nombre);
  if (!hoja) {
    hoja = libro.insertSheet(nombre);
  }
  if (hoja.getLastRow() === 0) {
    hoja.getRange(1, 1, 1, ENCABEZADOS.length).setValues([ENCABEZADOS]);
    hoja.getRange(1, 1, 1, ENCABEZADOS.length)
        .setFontWeight('bold')
        .setBackground('#0A0F1F')
        .setFontColor('#F0B45C');
    hoja.setFrozenRows(1);
  }
  return hoja;
}

/** Al empezar: crea la fila del alumno con nombre y apellido. */
function registrarInicio(hoja, p) {
  var candado = LockService.getScriptLock();
  candado.waitLock(20000);
  try {
    var id = p.id || Utilities.getUuid();
    hoja.appendRow([
      p.nombre || '',
      p.apellido || '',
      '', '', '',
      id,
      new Date()
    ]);
    return { ok: true, id: id, fila: hoja.getLastRow() };
  } finally {
    candado.releaseLock();
  }
}

/** Al terminar: completa puntaje, total y porcentaje de esa misma fila. */
function registrarFinal(hoja, p) {
  var candado = LockService.getScriptLock();
  candado.waitLock(20000);
  try {
    var fila = buscarFilaPorId(hoja, p.id);

    if (!fila) {                       // por si se perdió la fila inicial
      hoja.appendRow([
        p.nombre || '', p.apellido || '',
        Number(p.puntaje), Number(p.total), Number(p.porcentaje),
        p.id || '', new Date()
      ]);
      return { ok: true, fila: hoja.getLastRow(), creada: true };
    }

    hoja.getRange(fila, 3, 1, 3).setValues([[
      Number(p.puntaje), Number(p.total), Number(p.porcentaje)
    ]]);
    hoja.getRange(fila, 5).setNumberFormat('0.0"%"');
    return { ok: true, fila: fila };
  } finally {
    candado.releaseLock();
  }
}

function buscarFilaPorId(hoja, id) {
  if (!id) return null;
  var ultima = hoja.getLastRow();
  if (ultima < 2) return null;
  var ids = hoja.getRange(2, 6, ultima - 1, 1).getValues();
  for (var i = ids.length - 1; i >= 0; i--) {      // de abajo hacia arriba: es la más reciente
    if (String(ids[i][0]) === String(id)) return i + 2;
  }
  return null;
}

/**
 * Ejecuta esta función una sola vez desde el editor para comprobar que
 * el script tiene permiso sobre la hoja y que los encabezados quedan puestos.
 */
function probar() {
  var hoja = obtenerHoja(NOMBRE_HOJA);
  Logger.log('Hoja lista: ' + hoja.getName() + ' · filas: ' + hoja.getLastRow());
}
