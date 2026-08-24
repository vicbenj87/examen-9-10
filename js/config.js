/* ==========================================================================
   config.js — Ajustes generales
   Este es el único archivo que necesitas tocar para poner el examen en marcha.
   ========================================================================== */

window.EX = window.EX || {};

EX.CONFIG = {
  /* Título corto usado en la pantalla de resultados */
  tituloCorto: 'Capítulos 9 y 10',

  /* --- Registro en Google Sheets ---
     Deja urlAppsScript vacía ('') para que el examen funcione solo con
     guardado local (localStorage + CSV descargable).
     Para conectarlo a tu hoja: sigue las instrucciones de apps-script/Codigo.gs
     y pega aquí la URL que termina en /exec. */
  urlAppsScript: 'https://script.google.com/macros/s/AKfycbykOhvWCbviUnXmL6kNIlpvEmmvwY1i2bgyymEJXt5ZxGb6sBMoHInNq64nQxpfP-Cu/exec', 
  hojaCalculo: { hoja: 'RE0910' },

  /* --- Tiempos (milisegundos) --- */
  segundosPorPregunta: 40,
  segundosExplicacion: 15,
  msRevelacion: 3400,        // cuánto se ve la respuesta correcta antes de avanzar
  msRevelacionLarga: 5200,   // para preguntas con varias partes

  /* --- Comportamiento --- */
  mezclarSecciones: true,    // el orden de las secciones cambia en cada intento
  mezclarPreguntas: true,    // el orden dentro de cada sección cambia
  mezclarOpciones: true,     // el orden de las alternativas cambia
  aprobadoDesde: 70,         // porcentaje mínimo para aprobar
  sonidoInicial: true,

  /* --- Textos del resultado según el porcentaje --- */
  veredictos: [
    { desde: 90, titulo: 'Dominio del reino y el exilio', nota: 'Conoces con claridad la caída del reino unido, la división, y el destino de Israel y Judá. Enseña esto a alguien más: es la mejor forma de fijarlo.' },
    { desde: 70, titulo: 'Aprobado con solvencia', nota: 'Tienes la estructura de ambas eras. Repasa los puntos marcados en rojo y quedará redondo.' },
    { desde: 50, titulo: 'Vas por buen camino', nota: 'Reconoces las ideas grandes —reino dividido, Asiria, Babilonia, Persia—, pero los detalles y las fechas se te escapan. Vuelve a leer los capítulos 9 y 10.' },
    { desde: 0,  titulo: 'Toca releer los capítulos', nota: 'No te desanimes: son dos capítulos con muchos reyes, profetas e imperios. Léelos otra vez, especialmente los mapas y las listas de reyes, y vuelve a intentarlo.' }
  ]
};
