/* ==========================================================================
   quiz.js — El motor del examen
   Arma la cola de preguntas, controla la mecha de 40 segundos,
   muestra la explicación de cada sección y corrige sobre la marcha.
   ========================================================================== */

window.EX = window.EX || {};

EX.Quiz = (function () {
  'use strict';

  var U = EX.U;
  var CFG = EX.CONFIG;

  var estado = {
    alumno: null,
    idRegistro: null,
    cola: [],
    indice: -1,
    seccionActual: null,
    obtenidos: 0,
    maximo: 0,
    resultados: [],
    vista: null,          // objeto devuelto por EX.Render
    respondida: false
  };

  var reloj = { id: null, fin: 0, restante: 0, ultimoTic: 99 };
  var relojRevelado = null;
  var relojModal = null;

  var dom = {};

  function cachearDom() {
    dom.escenario = U.$('#escenario');
    dom.seccion = U.$('#etiqueta-seccion');
    dom.conteo = U.$('#conteo-preguntas');
    dom.marcador = U.$('#marcador-valor');
    dom.marcadorTotal = U.$('#marcador-total');
    dom.progreso = U.$('#progreso');
    dom.mecha = U.$('#mecha');
    dom.llama = U.$('#mecha-llama');
    dom.segundos = U.$('#mecha-segundos');
    dom.modal = U.$('#modal-seccion');
  }

  /* ------------------------------------------------------------------
     Preparación
     ------------------------------------------------------------------ */
  function armarCola() {
    var secciones = CFG.mezclarSecciones ? U.mezclar(EX.SECCIONES) : EX.SECCIONES.slice();
    var cola = [];
    secciones.forEach(function (sec) {
      var preguntas = EX.PREGUNTAS.filter(function (p) { return p.seccion === sec.id; });
      if (CFG.mezclarPreguntas) preguntas = U.mezclar(preguntas);
      preguntas.forEach(function (p) { cola.push({ seccion: sec, pregunta: p }); });
    });
    return cola;
  }

  function iniciar(alumno, idRegistro) {
    cachearDom();
    estado.alumno = alumno;
    estado.idRegistro = idRegistro;
    estado.cola = armarCola();
    estado.indice = -1;
    estado.obtenidos = 0;
    estado.resultados = [];
    estado.seccionActual = null;
    estado.maximo = estado.cola.reduce(function (s, e) { return s + e.pregunta.puntos; }, 0);

    dom.marcadorTotal.textContent = '/ ' + estado.maximo;
    dom.marcador.textContent = '0';

    U.vaciar(dom.progreso);
    estado.cola.forEach(function () {
      dom.progreso.appendChild(U.crear('span', { clase: 'progreso__punto' }));
    });

    siguiente();
  }

  /* ------------------------------------------------------------------
     Avance
     ------------------------------------------------------------------ */
  function siguiente() {
    clearTimeout(relojRevelado);
    estado.indice++;
    if (estado.indice >= estado.cola.length) { terminar(); return; }

    var entrada = estado.cola[estado.indice];
    if (!estado.seccionActual || estado.seccionActual.id !== entrada.seccion.id) {
      estado.seccionActual = entrada.seccion;
      abrirExplicacion(entrada.seccion, function () { pintarPregunta(entrada); });
    } else {
      pintarPregunta(entrada);
    }
  }

  /* ------------------------------------------------------------------
     Ventana de explicación (15 segundos)
     ------------------------------------------------------------------ */
  function abrirExplicacion(seccion, alCerrar) {
    var caja = U.$('#modal-caja');
    U.vaciar(caja);

    var quedan = CFG.segundosExplicacion;
    var perimetro = 2 * Math.PI * 18;

    var svgHtml =
      '<svg viewBox="0 0 44 44" width="44" height="44">' +
      '<circle class="aro-fondo" cx="22" cy="22" r="18"></circle>' +
      '<circle class="aro-avance" cx="22" cy="22" r="18" stroke-dasharray="' + perimetro +
      '" stroke-dashoffset="0"></circle></svg>';

    var aro = U.crear('div', { clase: 'modal__aro', html: svgHtml });
    aro.appendChild(U.crear('span', { texto: String(quedan) }));

    var boton = U.crear('button', {
      clase: 'boton boton--llama', type: 'button',
      onclick: function () { cerrar(); }
    }, ['Empezar la sección']);

    caja.appendChild(U.crear('div', { clase: 'modal__romano', texto: seccion.id }));
    caja.appendChild(U.crear('h2', { clase: 'modal__titulo', texto: seccion.titulo }));
    caja.appendChild(U.crear('p', { clase: 'modal__texto', texto: seccion.resumen }));
    var lista = U.crear('ul', { clase: 'modal__lista' });
    seccion.pasos.forEach(function (paso) { lista.appendChild(U.crear('li', {}, [paso])); });
    caja.appendChild(lista);
    caja.appendChild(U.crear('div', { clase: 'modal__pie' }, [
      aro, boton,
      U.crear('span', { clase: 'modal__reloj', texto: 'se cierra sola' })
    ]));

    dom.modal.classList.add('esta-abierto');
    EX.Audio.reproducir('abrir');
    setTimeout(function () { boton.focus(); }, 80);

    var anillo = aro.querySelector('.aro-avance');
    var numero = aro.querySelector('span');
    var cerrada = false;

    relojModal = setInterval(function () {
      quedan--;
      numero.textContent = String(Math.max(0, quedan));
      anillo.setAttribute('stroke-dashoffset',
        String(perimetro * (1 - quedan / CFG.segundosExplicacion)));
      if (quedan <= 0) cerrar();
    }, 1000);

    function cerrar() {
      if (cerrada) return;
      cerrada = true;
      clearInterval(relojModal);
      dom.modal.classList.remove('esta-abierto');
      EX.Audio.reproducir('pasar');
      setTimeout(alCerrar, 220);
    }
  }

  /* ------------------------------------------------------------------
     Dibujar una pregunta
     ------------------------------------------------------------------ */
  function pintarPregunta(entrada) {
    var p = entrada.pregunta;
    estado.respondida = false;

    dom.seccion.textContent = entrada.seccion.id + ' · ' + entrada.seccion.titulo;
    dom.conteo.textContent = 'Pregunta ' + (estado.indice + 1) + ' de ' + estado.cola.length;

    U.$$('.progreso__punto').forEach(function (punto, i) {
      punto.classList.toggle('es-actual', i === estado.indice);
    });

    var tarjeta = U.crear('article', { clase: 'tarjeta' });
    tarjeta.appendChild(U.crear('span', {
      clase: 'tarjeta__tipo',
      texto: EX.Render.nombresTipo[p.tipo] + ' · ' + p.puntos + (p.puntos === 1 ? ' punto' : ' puntos')
    }));

    var cuerpo;
    var vista = EX.Render.construir(p, {
      alConfirmar: function () { responder(false); },
      alCambiar: function () { refrescarBotonResponder(); }
    });
    estado.vista = vista;

    if (!vista.reemplazaEnunciado) {
      tarjeta.appendChild(U.crear('h2', { clase: 'tarjeta__enunciado', texto: p.enunciado }));
    }
    tarjeta.appendChild(vista.elemento);

    if (vista.necesitaConfirmar) {
      dom.botonResponder = U.crear('button', {
        clase: 'boton boton--llama', type: 'button', disabled: 'disabled',
        style: 'margin-top:24px',
        onclick: function () { responder(false); }
      }, ['Responder']);
      tarjeta.appendChild(dom.botonResponder);
    } else {
      dom.botonResponder = null;
    }

    U.vaciar(dom.escenario).appendChild(tarjeta);
    dom.tarjeta = tarjeta;

    arrancarMecha();
  }

  function refrescarBotonResponder() {
    if (!dom.botonResponder || estado.respondida) return;
    dom.botonResponder.disabled = !estado.vista.listo();
  }

  /* ------------------------------------------------------------------
     La mecha de 40 segundos
     ------------------------------------------------------------------ */
  function arrancarMecha() {
    detenerMecha();
    var total = CFG.segundosPorPregunta * 1000;
    reloj.fin = performance.now() + total;
    reloj.ultimoTic = 99;
    dom.mecha.classList.remove('esta-urgente', 'esta-detenida');
    dom.llama.style.width = '100%';
    dom.segundos.textContent = CFG.segundosPorPregunta + 's';

    function paso(ahora) {
      var restante = Math.max(0, reloj.fin - ahora);
      var proporcion = restante / total;
      dom.llama.style.width = (proporcion * 100).toFixed(2) + '%';

      var seg = Math.ceil(restante / 1000);
      if (seg !== reloj.ultimoTic) {
        reloj.ultimoTic = seg;
        dom.segundos.textContent = seg + 's';
        if (seg <= 10 && seg > 0) EX.Audio.reproducir('tic');
      }
      dom.mecha.classList.toggle('esta-urgente', restante <= 10000);

      if (restante <= 0) { detenerMecha(); responder(true); return; }
      reloj.id = requestAnimationFrame(paso);
    }
    reloj.id = requestAnimationFrame(paso);
  }

  function detenerMecha() {
    if (reloj.id) cancelAnimationFrame(reloj.id);
    reloj.id = null;
    if (dom.mecha) dom.mecha.classList.add('esta-detenida');
  }

  /* ------------------------------------------------------------------
     Corrección y revelación
     ------------------------------------------------------------------ */
  function responder(porTiempo) {
    if (estado.respondida) return;
    estado.respondida = true;
    detenerMecha();

    var p = estado.cola[estado.indice].pregunta;
    var r = estado.vista.responder();

    estado.obtenidos += r.obtenidos;
    estado.resultados.push({
      n: p.n,
      seccion: p.seccion,
      enunciado: p.enunciado || (p.partes ? p.partes.join('____') : ''),
      obtenidos: r.obtenidos,
      maximo: r.maximo,
      estado: porTiempo && r.obtenidos === 0 ? 'fallo' : r.estado,
      detalle: r.detalle
    });

    dom.marcador.textContent = String(U.redondear(estado.obtenidos, 2));
    var punto = U.$$('.progreso__punto')[estado.indice];
    punto.classList.remove('es-actual');
    punto.classList.add('es-' + r.estado);

    if (dom.botonResponder) dom.botonResponder.remove();

    EX.Audio.reproducir(r.estado === 'acierto' ? 'acierto' : r.estado === 'parcial' ? 'parcial' : 'fallo');

    /* Veredicto */
    var titulos = {
      acierto: porTiempo ? 'Correcto, justo a tiempo' : '¡Correcto!',
      parcial: 'Casi',
      fallo: porTiempo ? 'Se acabó el tiempo' : 'No era esa'
    };
    var clases = { acierto: 'veredicto--bien', parcial: 'veredicto--parcial', fallo: 'veredicto--mal' };
    var iconos = { acierto: '◆', parcial: '◈', fallo: '◇' };

    var textoDetalle = r.detalle + (p.nota ? ' — ' + p.nota : '');

    var veredicto = U.crear('div', { clase: 'veredicto ' + clases[r.estado] }, [
      U.crear('span', { clase: 'veredicto__icono', texto: iconos[r.estado] }),
      U.crear('div', {}, [
        U.crear('p', {
          clase: 'veredicto__titulo',
          texto: titulos[r.estado] + '  ·  ' + U.redondear(r.obtenidos, 2) + ' / ' + r.maximo
        }),
        U.crear('p', { clase: 'veredicto__texto', html: escaparConNegritas(textoDetalle) })
      ])
    ]);
    dom.tarjeta.appendChild(veredicto);
    setTimeout(function () {
      veredicto.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 60);

    /* Cuenta atrás para pasar a la siguiente */
    var espera = r.maximo > 2 ? CFG.msRevelacionLarga : CFG.msRevelacion;
    var quedan = Math.round(espera / 1000);
    var esUltima = estado.indice === estado.cola.length - 1;

    var aviso = U.crear('span', { texto: (esUltima ? 'Resultados en ' : 'Siguiente en ') + quedan + ' s' });
    var botonYa = U.crear('button', {
      clase: 'boton boton--fantasma', type: 'button',
      onclick: function () { clearInterval(cuenta); siguiente(); }
    }, [esUltima ? 'Ver resultados →' : 'Continuar ahora →']);

    dom.tarjeta.appendChild(U.crear('div', { clase: 'cuenta-atras' }, [aviso, botonYa]));

    var cuenta = setInterval(function () {
      quedan--;
      aviso.textContent = (esUltima ? 'Resultados en ' : 'Siguiente en ') + Math.max(0, quedan) + ' s';
      if (quedan <= 0) clearInterval(cuenta);
    }, 1000);

    relojRevelado = setTimeout(function () { clearInterval(cuenta); siguiente(); }, espera);
  }

  function escaparConNegritas(texto) {
    var div = document.createElement('div');
    div.textContent = texto;
    return div.innerHTML.replace(/(Respuestas?:|Correctas:|Sobraban:)/, '<strong>$1</strong>');
  }

  /* ------------------------------------------------------------------
     Final
     ------------------------------------------------------------------ */
  function terminar() {
    detenerMecha();
    var puntaje = U.redondear(estado.obtenidos, 2);
    var porcentaje = U.redondear(puntaje / estado.maximo * 100, 1);
    EX.Audio.reproducir('final');
    EX.App.mostrarResultado({
      alumno: estado.alumno,
      idRegistro: estado.idRegistro,
      puntaje: puntaje,
      total: estado.maximo,
      porcentaje: porcentaje,
      resultados: estado.resultados
    });
  }

  return { iniciar: iniciar };
})();
