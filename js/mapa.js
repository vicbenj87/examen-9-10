/* ==========================================================================
   mapa.js — Ejercicio de ubicación geográfica
   Las coordenadas están en porcentaje sobre la imagen original (973 × 591),
   así el mapa se adapta a cualquier tamaño de pantalla. Cada zona fue
   verificada píxel a píxel para caer sobre tierra firme (no sobre el mar
   ni sobre los ríos) en el mapa mudo del Cercano Oriente Antiguo.
   ========================================================================== */

window.EX = window.EX || {};

EX.Mapa = (function () {
  'use strict';

  var U = EX.U;

  /* Cada zona guarda el nombre que le corresponde y su punto en el mapa */
  var ZONAS = [
    { nombre: 'Israel',    x: 32.7, y: 24.5, pista: 'Reino del norte, junto a la costa mediterránea' },
    { nombre: 'Jerusalén', x: 34.0, y: 50.0, pista: 'Capital del reino del sur, cerca del mar Muerto' },
    { nombre: 'Asiria',    x: 49.0, y: 8.8,  pista: 'Al norte, entre las cabeceras del Tigris y el Éufrates' },
    { nombre: 'Babilonia', x: 65.2, y: 37.7, pista: 'En Mesopotamia, entre el Tigris y el Éufrates' },
    { nombre: 'Persia',    x: 93.8, y: 65.8, pista: 'Al oriente, junto al golfo Pérsico' },
    { nombre: 'Egipto',    x: 12.9, y: 67.5, pista: 'Al suroeste, más allá del golfo de Aqaba' }
  ];

  function zonas() { return ZONAS.slice(); }

  /* ------------------------------------------------------------------
     Construye el ejercicio.
     opciones = { etiquetas: [...], alResponder: fn, bloqueado: bool }
     Devuelve { elemento, obtenerColocaciones, revelar }
     ------------------------------------------------------------------ */
  function construir(opciones) {
    var colocaciones = {};     // nombreDeZona -> etiqueta colocada
    var etiquetaActiva = null;
    var bloqueado = false;

    var lienzo = U.crear('div', { clase: 'mapa__lienzo' }, [
      U.crear('img', {
        clase: 'mapa__imagen',
        src: EX.MAPA_IMAGEN,
        alt: 'Mapa mudo del Cercano Oriente Antiguo',
        draggable: 'false'
      })
    ]);

    var desplazable = U.crear('div', { clase: 'mapa__desplazable' }, [lienzo]);

    var listaEtiquetas = U.crear('div', {
      clase: 'mapa__etiquetas',
      role: 'listbox',
      'aria-label': 'Nombres por colocar'
    });

    var botonesZona = {};
    var botonesEtiqueta = {};

    /* --- Zonas --- */
    ZONAS.forEach(function (z, i) {
      var b = U.crear('button', {
        clase: 'mapa__zona',
        type: 'button',
        style: 'left:' + z.x + '%; top:' + z.y + '%;',
        title: z.pista,
        'aria-label': 'Casilla ' + (i + 1) + ': ' + z.pista,
        datos: { zona: z.nombre },
        onclick: function () { tocarZona(z.nombre); }
      }, [U.crear('span', { texto: String(i + 1) })]);
      botonesZona[z.nombre] = b;
      lienzo.appendChild(b);
    });

    /* --- Etiquetas --- */
    opciones.etiquetas.forEach(function (nombre) {
      var b = U.crear('button', {
        clase: 'etiqueta',
        type: 'button',
        datos: { etiqueta: nombre },
        onclick: function () { tocarEtiqueta(nombre); }
      }, [nombre]);
      arrastrable(b, nombre);
      botonesEtiqueta[nombre] = b;
      listaEtiquetas.appendChild(b);
    });

    var ayuda = U.crear('p', {
      clase: 'tarjeta__pista',
      texto: 'Toca un nombre y después su círculo en el mapa. También puedes arrastrarlo.'
    });

    var contenedor = U.crear('div', { clase: 'mapa' }, [listaEtiquetas, desplazable, ayuda]);

    /* ------------------------- Interacción ------------------------- */

    function tocarEtiqueta(nombre) {
      if (bloqueado) return;
      EX.Audio.reproducir('toque');
      etiquetaActiva = (etiquetaActiva === nombre) ? null : nombre;
      pintar();
    }

    function tocarZona(nombreZona) {
      if (bloqueado) return;
      var ocupante = colocaciones[nombreZona];

      if (etiquetaActiva) {
        soltarEtiqueta(etiquetaActiva);          // por si ya estaba en otra zona
        colocaciones[nombreZona] = etiquetaActiva;
        etiquetaActiva = null;
        EX.Audio.reproducir('pasar');
      } else if (ocupante) {
        delete colocaciones[nombreZona];         // devolver a la lista
        EX.Audio.reproducir('toque');
      }
      pintar();
      avisarCambio();
    }

    function soltarEtiqueta(nombre) {
      Object.keys(colocaciones).forEach(function (z) {
        if (colocaciones[z] === nombre) delete colocaciones[z];
      });
    }

    function colocarEn(nombreZona, nombreEtiqueta) {
      soltarEtiqueta(nombreEtiqueta);
      colocaciones[nombreZona] = nombreEtiqueta;
      etiquetaActiva = null;
      pintar();
      avisarCambio();
    }

    function avisarCambio() {
      if (opciones.alCambiar) opciones.alCambiar(Object.keys(colocaciones).length, ZONAS.length);
    }

    /* --- Arrastre con puntero (funciona con ratón y con el dedo) --- */
    function arrastrable(elemento, nombre) {
      var fantasma = null, arrastrando = false, x0 = 0, y0 = 0;

      elemento.addEventListener('pointerdown', function (ev) {
        if (bloqueado || ev.button === 2) return;
        x0 = ev.clientX; y0 = ev.clientY;
        elemento.setPointerCapture(ev.pointerId);

        function mover(e) {
          if (!arrastrando && Math.hypot(e.clientX - x0, e.clientY - y0) > 7) {
            arrastrando = true;
            fantasma = U.crear('div', { clase: 'etiqueta esta-activa etiqueta--fantasma', texto: nombre });
            document.body.appendChild(fantasma);
          }
          if (!arrastrando) return;
          fantasma.style.left = e.clientX + 'px';
          fantasma.style.top = e.clientY + 'px';
          var z = zonaCercana(e.clientX, e.clientY);
          ZONAS.forEach(function (o) {
            botonesZona[o.nombre].classList.toggle('esta-apuntada', !!z && z.nombre === o.nombre);
          });
        }

        function soltar(e) {
          elemento.removeEventListener('pointermove', mover);
          elemento.removeEventListener('pointerup', soltar);
          elemento.removeEventListener('pointercancel', soltar);
          ZONAS.forEach(function (o) { botonesZona[o.nombre].classList.remove('esta-apuntada'); });
          if (fantasma) { fantasma.remove(); fantasma = null; }
          if (!arrastrando) return;                 // fue un toque, no un arrastre
          arrastrando = false;
          var z = zonaCercana(e.clientX, e.clientY);
          if (z) { colocarEn(z.nombre, nombre); EX.Audio.reproducir('pasar'); }
          ev.preventDefault();
        }

        elemento.addEventListener('pointermove', mover);
        elemento.addEventListener('pointerup', soltar);
        elemento.addEventListener('pointercancel', soltar);
      });
    }

    function zonaCercana(clientX, clientY) {
      var caja = lienzo.getBoundingClientRect();
      var mejor = null, mejorD = Infinity;
      var tolerancia = Math.max(46, caja.width * 0.075);
      ZONAS.forEach(function (z) {
        var zx = caja.left + caja.width * z.x / 100;
        var zy = caja.top + caja.height * z.y / 100;
        var d = Math.hypot(clientX - zx, clientY - zy);
        if (d < mejorD) { mejorD = d; mejor = z; }
      });
      return mejorD <= tolerancia ? mejor : null;
    }

    /* --- Pintado --- */
    function pintar() {
      ZONAS.forEach(function (z) {
        var b = botonesZona[z.nombre];
        var puesta = colocaciones[z.nombre];
        b.classList.toggle('esta-ocupada', !!puesta);
        var indice = ZONAS.indexOf(z) + 1;
        b.firstChild.textContent = puesta || String(indice);
      });
      Object.keys(botonesEtiqueta).forEach(function (nombre) {
        var usada = Object.keys(colocaciones).some(function (z) { return colocaciones[z] === nombre; });
        botonesEtiqueta[nombre].classList.toggle('esta-usada', usada);
        botonesEtiqueta[nombre].classList.toggle('esta-activa', etiquetaActiva === nombre);
      });
      listaEtiquetas.dataset.vacia = Object.keys(botonesEtiqueta).every(function (n) {
        return botonesEtiqueta[n].classList.contains('esta-usada');
      }) ? 'si' : 'no';
    }

    /* --- Corrección --- */
    function revelar() {
      bloqueado = true;
      var aciertos = 0;
      ZONAS.forEach(function (z) {
        var b = botonesZona[z.nombre];
        b.disabled = true;
        var puesta = colocaciones[z.nombre];
        if (puesta === z.nombre) {
          aciertos++;
          b.classList.add('es-correcta');
        } else {
          b.classList.add('es-incorrecta');
          if (!puesta) b.firstChild.textContent = '—';
          lienzo.appendChild(U.crear('span', {
            clase: 'mapa__solucion',
            style: 'left:' + z.x + '%; top:' + z.y + '%;',
            texto: z.nombre
          }));
        }
      });
      Object.keys(botonesEtiqueta).forEach(function (n) { botonesEtiqueta[n].disabled = true; });
      return aciertos;
    }

    pintar();

    return {
      elemento: contenedor,
      colocadas: function () { return Object.keys(colocaciones).length; },
      revelar: revelar,
      bloquear: function () { bloqueado = true; }
    };
  }

  return { construir: construir, zonas: zonas };
})();
