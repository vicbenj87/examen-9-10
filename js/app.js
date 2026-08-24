/* ==========================================================================
   app.js — Arranque, pantallas y resultado final
   ========================================================================== */

window.EX = window.EX || {};

EX.App = (function () {
  'use strict';

  var U = EX.U;
  var CFG = EX.CONFIG;

  function mostrarPantalla(id) {
    U.$$('.pantalla').forEach(function (s) { s.classList.toggle('activa', s.id === id); });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /* ------------------------------------------------------------------
     Pantalla de inicio
     ------------------------------------------------------------------ */
  function prepararInicio() {
    var nombre = U.$('#campo-nombre');
    var apellido = U.$('#campo-apellido');
    var aviso = U.$('#aviso-inicio');
    var boton = U.$('#boton-comenzar');
    var registro = U.$('#estado-registro');
    var etiquetaRegistro = U.$('#estado-registro-texto');

    /* Recuerda al alumno entre intentos, para no volver a escribirlo */
    try {
      var previo = JSON.parse(localStorage.getItem('examen-reino-exilio-alumno') || 'null');
      if (previo) { nombre.value = previo.nombre || ''; apellido.value = previo.apellido || ''; }
    } catch (e) {}

    etiquetaRegistro.textContent = EX.Sheets.disponible()
      ? 'Se registrará en tu hoja de cálculo'
      : 'Tus resultados se guardan en este dispositivo';

    U.$('#total-preguntas').textContent = EX.PREGUNTAS.length;
    U.$('#total-puntos').textContent = EX.PREGUNTAS.reduce(function (s, p) { return s + p.puntos; }, 0);

    function comenzar() {
      var n = U.capitalizar(nombre.value);
      var a = U.capitalizar(apellido.value);
      if (!n || !a) {
        aviso.textContent = 'Escribe tu nombre y tu apellido para empezar.';
        (!n ? nombre : apellido).focus();
        return;
      }
      aviso.textContent = '';
      boton.disabled = true;
      boton.textContent = 'Preparando…';

      EX.Audio.iniciar();
      try { localStorage.setItem('examen-reino-exilio-alumno', JSON.stringify({ nombre: n, apellido: a })); } catch (e) {}

      registro.className = 'registro esta-enviando';
      etiquetaRegistro.textContent = EX.Sheets.disponible() ? 'Registrando en la hoja…' : 'Guardando en este dispositivo';

      EX.Sheets.registrarInicio(n, a).then(function (r) {
        registro.className = 'registro' + (r.ok ? ' es-ok' : r.motivo === 'sin-configurar' ? '' : ' es-error');
        etiquetaRegistro.textContent = r.ok
          ? 'Registrado en la hoja de cálculo'
          : 'Guardando en este dispositivo';

        mostrarPantalla('pantalla-examen');
        EX.Quiz.iniciar({ nombre: n, apellido: a }, r.id);
        boton.disabled = false;
        boton.textContent = 'Comenzar el examen';
      });
    }

    boton.addEventListener('click', comenzar);
    [nombre, apellido].forEach(function (campo) {
      campo.addEventListener('keydown', function (e) { if (e.key === 'Enter') comenzar(); });
    });
  }

  /* ------------------------------------------------------------------
     Pantalla de resultados
     ------------------------------------------------------------------ */
  function mostrarResultado(datos) {
    var contenedor = U.$('#resultado');
    U.vaciar(contenedor);

    var veredicto = CFG.veredictos.filter(function (v) { return datos.porcentaje >= v.desde; })[0];
    var radio = 90;
    var perimetro = 2 * Math.PI * radio;

    var aro = U.crear('div', {
      clase: 'resultado__aro',
      html: '<svg viewBox="0 0 200 200">' +
        '<circle class="aro-fondo" cx="100" cy="100" r="' + radio + '"></circle>' +
        '<circle class="aro-avance" cx="100" cy="100" r="' + radio +
        '" stroke-dasharray="' + perimetro + '" stroke-dashoffset="' + perimetro + '"></circle></svg>'
    });
    aro.appendChild(U.crear('div', { clase: 'resultado__centro' }, [
      U.crear('span', { clase: 'resultado__porcentaje', texto: datos.porcentaje + '%' }),
      U.crear('span', { clase: 'resultado__fraccion', texto: datos.puntaje + ' / ' + datos.total + ' puntos' })
    ]));

    contenedor.appendChild(U.crear('span', {
      clase: 'eyebrow',
      texto: datos.alumno.nombre + ' ' + datos.alumno.apellido + ' · ' + CFG.tituloCorto
    }));
    contenedor.appendChild(aro);
    contenedor.appendChild(U.crear('h2', { clase: 'resultado__veredicto', texto: veredicto.titulo }));
    contenedor.appendChild(U.crear('p', { clase: 'resultado__nota', texto: veredicto.nota }));

    var estadoEnvio = U.crear('span', { clase: 'registro esta-enviando' }, [
      U.crear('span', { clase: 'registro__luz' }),
      U.crear('span', { texto: EX.Sheets.disponible() ? 'Enviando el resultado a la hoja…' : 'Resultado guardado en este dispositivo' })
    ]);
    contenedor.appendChild(estadoEnvio);

    /* Repaso pregunta por pregunta */
    var repaso = U.crear('div', { clase: 'repaso' });
    repaso.appendChild(U.crear('span', { clase: 'eyebrow', texto: 'Repaso' }));
    datos.resultados.forEach(function (r) {
      var marca = r.estado === 'acierto' ? '◆' : r.estado === 'parcial' ? '◈' : '◇';
      repaso.appendChild(U.crear('div', { clase: 'repaso__fila es-' + r.estado }, [
        U.crear('span', { clase: 'repaso__marca', texto: marca }),
        U.crear('div', { clase: 'repaso__texto' }, [
          U.crear('strong', { texto: r.seccion + '.' + r.n + ' · ' + recortar(r.enunciado, 92) }),
          U.crear('span', { texto: r.detalle }),
          U.crear('span', { clase: 'mono', texto: '  (' + r.obtenidos + '/' + r.maximo + ')' })
        ])
      ]));
    });
    contenedor.appendChild(repaso);

    contenedor.appendChild(U.crear('div', { clase: 'acciones' }, [
      U.crear('button', {
        clase: 'boton boton--llama', type: 'button',
        onclick: function () { location.reload(); }
      }, ['Volver a intentarlo']),
      U.crear('button', {
        clase: 'boton boton--linea', type: 'button',
        onclick: function () { descargarRespaldo(); }
      }, ['Descargar mis resultados'])
    ]));

    mostrarPantalla('pantalla-final');

    /* Anima el aro cuando la pantalla ya es visible */
    setTimeout(function () {
      var anillo = aro.querySelector('.aro-avance');
      anillo.setAttribute('stroke-dashoffset', String(perimetro * (1 - datos.porcentaje / 100)));
      if (datos.porcentaje < CFG.aprobadoDesde) anillo.style.stroke = 'var(--granate)';
      else if (datos.porcentaje >= 90) anillo.style.stroke = 'var(--olivo)';
    }, 260);

    /* Guarda el resultado en este dispositivo (respaldo descargable en CSV)
       y, si hay una hoja configurada, también lo envía allá. */
    U.guardarLocal({
      fecha: new Date().toISOString(),
      nombre: datos.alumno.nombre, apellido: datos.alumno.apellido,
      puntaje: datos.puntaje, total: datos.total, porcentaje: datos.porcentaje
    });

    EX.Sheets.registrarFinal({
      id: datos.idRegistro,
      nombre: datos.alumno.nombre, apellido: datos.alumno.apellido,
      puntaje: datos.puntaje, total: datos.total, porcentaje: datos.porcentaje
    }).then(function (r) {
      var luz = estadoEnvio.querySelector('span:last-child');
      if (r.ok) {
        estadoEnvio.className = 'registro es-ok';
        luz.textContent = 'Registrado en la hoja de cálculo';
      } else {
        estadoEnvio.className = 'registro' + (r.motivo === 'sin-configurar' ? '' : ' es-error');
        luz.textContent = 'Resultado guardado en este dispositivo';
      }
    });
  }

  function recortar(txt, n) {
    txt = String(txt || '');
    return txt.length > n ? txt.slice(0, n - 1).trim() + '…' : txt;
  }

  function descargarRespaldo() {
    var filas = [['nombre', 'apellido', 'puntaje', 'total', 'porcentaje', 'fecha']];
    U.leerLocal().forEach(function (r) {
      filas.push([r.nombre, r.apellido, r.puntaje, r.total, r.porcentaje, r.fecha]);
    });
    U.descargarCSV('resultados-reino-y-exilio.csv', filas);
    U.brindis('CSV descargado con todos tus intentos guardados en este dispositivo.');
  }

  /* ------------------------------------------------------------------
     Sonido
     ------------------------------------------------------------------ */
  function prepararSonido() {
    var boton = U.$('#boton-sonido');
    boton.classList.toggle('esta-activo', CFG.sonidoInicial);
    boton.addEventListener('click', function () {
      EX.Audio.iniciar();
      var activo = EX.Audio.alternar();
      boton.classList.toggle('esta-activo', activo);
      boton.setAttribute('aria-pressed', String(activo));
      boton.title = activo ? 'Silenciar' : 'Activar sonido';
      U.brindis(activo ? 'Sonido activado' : 'Sonido silenciado', 1600);
    });
  }

  function arrancar() {
    prepararInicio();
    prepararSonido();
  }

  return { arrancar: arrancar, mostrarResultado: mostrarResultado, mostrarPantalla: mostrarPantalla };
})();

document.addEventListener('DOMContentLoaded', function () { EX.App.arrancar(); });
