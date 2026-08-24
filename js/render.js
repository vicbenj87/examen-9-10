/* ==========================================================================
   render.js — Dibuja cada tipo de pregunta y la corrige
   Cada constructor devuelve un objeto con la misma forma:
     { elemento, necesitaConfirmar, listo(), responder() }
   responder() marca la tarjeta en pantalla y devuelve el resultado.
   ========================================================================== */

window.EX = window.EX || {};

EX.Render = (function () {
  'use strict';

  var U = EX.U;

  /* Puntuación neta: los aciertos suman, los errores restan.
     Marcarlo todo no sirve de nada. */
  function neto(marcadas, correctas, maxPuntos) {
    var buenas = marcadas.filter(function (m) { return correctas.indexOf(m) >= 0; }).length;
    var malas = marcadas.length - buenas;
    var bruto = Math.max(0, buenas - malas);
    return U.redondear(maxPuntos * (bruto / correctas.length), 2);
  }

  function estadoDe(obtenidos, maximo) {
    if (obtenidos >= maximo - 0.001) return 'acierto';
    if (obtenidos > 0) return 'parcial';
    return 'fallo';
  }

  function botonOpcion(op, indice, alPulsar, extra) {
    return U.crear('button', {
      clase: 'opcion' + (extra ? ' ' + extra : ''),
      type: 'button',
      datos: { id: op.id },
      onclick: alPulsar
    }, [
      U.crear('span', { clase: 'opcion__letra', texto: U.letra(indice) }),
      U.crear('span', { texto: op.texto })
    ]);
  }

  function bloquear(lista) {
    lista.forEach(function (b) { b.disabled = true; });
  }

  /* =====================================================================
     1. Una sola alternativa
     ===================================================================== */
  function unaAlternativa(p, cb) {
    var opciones = EX.CONFIG.mezclarOpciones ? U.mezclar(p.opciones) : p.opciones;
    var elegida = null;
    var botones = [];

    var caja = U.crear('div', { clase: 'opciones' });
    opciones.forEach(function (op, i) {
      var b = botonOpcion(op, i, function () {
        if (elegida) return;
        elegida = op.id;
        EX.Audio.reproducir('toque');
        cb.alConfirmar();
      });
      botones.push(b);
      caja.appendChild(b);
    });

    return {
      elemento: caja,
      necesitaConfirmar: false,
      listo: function () { return elegida !== null; },
      responder: function () {
        bloquear(botones);
        botones.forEach(function (b) {
          var id = b.dataset.id;
          if (id === p.correcta) b.classList.add('es-correcta');
          else if (id === elegida) b.classList.add('es-incorrecta');
        });
        var bien = elegida === p.correcta;
        var texto = p.opciones.filter(function (o) { return o.id === p.correcta; })[0].texto;
        return {
          obtenidos: bien ? p.puntos : 0,
          maximo: p.puntos,
          estado: bien ? 'acierto' : 'fallo',
          detalle: 'Respuesta correcta: ' + texto
        };
      }
    };
  }

  /* =====================================================================
     2. Varias alternativas correctas
     ===================================================================== */
  function variasAlternativas(p, cb) {
    var opciones = EX.CONFIG.mezclarOpciones ? U.mezclar(p.opciones) : p.opciones;
    var marcadas = [];
    var botones = [];

    var caja = U.crear('div', { clase: 'opciones' });
    opciones.forEach(function (op, i) {
      var b = botonOpcion(op, i, function () {
        var k = marcadas.indexOf(op.id);
        if (k >= 0) marcadas.splice(k, 1); else marcadas.push(op.id);
        b.classList.toggle('esta-marcada');
        EX.Audio.reproducir('toque');
        cb.alCambiar();
      });
      botones.push(b);
      caja.appendChild(b);
    });

    var pista = U.crear('p', {
      clase: 'tarjeta__pista',
      texto: 'Marca ' + p.correctas.length + ' opciones y confirma con «Responder».'
    });

    return {
      elemento: U.crear('div', {}, [pista, caja]),
      necesitaConfirmar: true,
      listo: function () { return marcadas.length > 0; },
      responder: function () {
        bloquear(botones);
        botones.forEach(function (b) {
          var id = b.dataset.id;
          b.classList.remove('esta-marcada');
          if (p.correctas.indexOf(id) >= 0) b.classList.add('es-correcta');
          else if (marcadas.indexOf(id) >= 0) b.classList.add('es-incorrecta');
        });
        var obtenidos = neto(marcadas, p.correctas, p.puntos);
        var textos = p.opciones
          .filter(function (o) { return p.correctas.indexOf(o.id) >= 0; })
          .map(function (o) { return o.texto.replace(/\.$/, ''); });
        return {
          obtenidos: obtenidos,
          maximo: p.puntos,
          estado: estadoDe(obtenidos, p.puntos),
          detalle: 'Correctas: ' + textos.join(' · ')
        };
      }
    };
  }

  /* =====================================================================
     3. Verdadero o falso
     ===================================================================== */
  function verdaderoFalso(p, cb) {
    var elegida = null;
    var botones = [];
    var caja = U.crear('div', { clase: 'opciones opciones--par' });

    [{ id: 'v', texto: 'Verdadero' }, { id: 'f', texto: 'Falso' }].forEach(function (op) {
      var b = U.crear('button', {
        clase: 'opcion', type: 'button', datos: { id: op.id },
        onclick: function () {
          if (elegida) return;
          elegida = op.id;
          EX.Audio.reproducir('toque');
          cb.alConfirmar();
        }
      }, [op.texto]);
      botones.push(b);
      caja.appendChild(b);
    });

    return {
      elemento: caja,
      necesitaConfirmar: false,
      listo: function () { return elegida !== null; },
      responder: function () {
        bloquear(botones);
        var idCorrecto = p.correcta ? 'v' : 'f';
        botones.forEach(function (b) {
          if (b.dataset.id === idCorrecto) b.classList.add('es-correcta');
          else if (b.dataset.id === elegida) b.classList.add('es-incorrecta');
        });
        var bien = elegida === idCorrecto;
        return {
          obtenidos: bien ? p.puntos : 0,
          maximo: p.puntos,
          estado: bien ? 'acierto' : 'fallo',
          detalle: 'La afirmación es ' + (p.correcta ? 'verdadera' : 'falsa') + '.'
        };
      }
    };
  }

  /* =====================================================================
     4. Completar el texto
     ===================================================================== */
  function completar(p, cb) {
    var entradas = [];
    var frase = U.crear('p', { clase: 'tarjeta__enunciado' });

    p.partes.forEach(function (trozo, i) {
      frase.appendChild(document.createTextNode(trozo));
      if (i < p.huecos.length) {
        var h = p.huecos[i];
        var input = U.crear('input', {
          clase: 'hueco', type: 'text', autocomplete: 'off', autocapitalize: 'off',
          spellcheck: 'false',
          size: h.ancho || 10,
          'aria-label': 'Hueco ' + (i + 1),
          oninput: cb.alCambiar,
          onkeydown: function (e) { if (e.key === 'Enter') cb.alConfirmar(); }
        });
        entradas.push(input);
        frase.appendChild(input);
      }
    });

    setTimeout(function () { if (entradas[0]) entradas[0].focus(); }, 60);

    return {
      elemento: frase,
      necesitaConfirmar: true,
      reemplazaEnunciado: true,
      listo: function () { return entradas.some(function (e) { return e.value.trim() !== ''; }); },
      responder: function () {
        var aciertos = 0;
        entradas.forEach(function (input, i) {
          input.disabled = true;
          var bien = U.coincide(input.value, p.huecos[i].acepta);
          if (bien) { aciertos++; input.classList.add('es-correcta'); }
          else {
            input.classList.add('es-incorrecta');
            if (!input.value.trim()) input.value = '—';
          }
        });
        var obtenidos = U.redondear(p.puntos * (aciertos / p.huecos.length), 2);
        var solucion = p.huecos.map(function (h) { return h.acepta[0]; }).join(' / ');
        return {
          obtenidos: obtenidos,
          maximo: p.puntos,
          estado: estadoDe(obtenidos, p.puntos),
          detalle: (p.huecos.length > 1 ? 'Respuestas: ' : 'Respuesta: ') + solucion
        };
      }
    };
  }

  /* =====================================================================
     5. Respuesta corta
     ===================================================================== */
  function corta(p, cb) {
    var input = U.crear('input', {
      clase: 'respuesta-corta', type: 'text', autocomplete: 'off',
      placeholder: p.marcador || 'Escribe tu respuesta',
      'aria-label': 'Tu respuesta',
      oninput: cb.alCambiar,
      onkeydown: function (e) { if (e.key === 'Enter') cb.alConfirmar(); }
    });

    setTimeout(function () { input.focus(); }, 60);

    return {
      elemento: input,
      necesitaConfirmar: true,
      listo: function () { return input.value.trim() !== ''; },
      responder: function () {
        input.disabled = true;
        var bien = U.coincide(input.value, p.acepta);
        input.classList.add(bien ? 'es-correcta' : 'es-incorrecta');
        input.style.borderColor = bien ? 'var(--olivo)' : 'var(--granate)';
        if (!input.value.trim()) input.value = '(sin respuesta)';
        return {
          obtenidos: bien ? p.puntos : 0,
          maximo: p.puntos,
          estado: bien ? 'acierto' : 'fallo',
          detalle: 'Respuesta correcta: ' + p.acepta[0]
        };
      }
    };
  }

  /* =====================================================================
     6. Ordenar una secuencia
     ===================================================================== */
  function orden(p, cb) {
    var items = EX.CONFIG.mezclarOpciones ? U.mezclar(p.items) : p.items;
    var secuencia = [];        // ids en el orden elegido
    var botones = {};

    var caja = U.crear('div', { clase: 'opciones secuencia' });
    items.forEach(function (it) {
      var badge = U.crear('span', { clase: 'secuencia__orden', texto: '·' });
      var b = U.crear('button', {
        clase: 'opcion', type: 'button', datos: { id: it.id },
        onclick: function () {
          var k = secuencia.indexOf(it.id);
          if (k >= 0) secuencia.splice(k, 1); else secuencia.push(it.id);
          EX.Audio.reproducir('toque');
          pintar();
          cb.alCambiar();
        }
      }, [badge, U.crear('span', { texto: it.texto })]);
      botones[it.id] = { boton: b, badge: badge };
      caja.appendChild(b);
    });

    function pintar() {
      Object.keys(botones).forEach(function (id) {
        var k = secuencia.indexOf(id);
        botones[id].boton.classList.toggle('esta-marcada', k >= 0);
        botones[id].badge.textContent = k >= 0 ? String(k + 1) : '·';
      });
    }

    var pista = U.crear('p', {
      clase: 'tarjeta__pista',
      texto: 'Toca los pasos en orden, del primero al último. Vuelve a tocar uno para quitarlo.'
    });

    return {
      elemento: U.crear('div', {}, [pista, caja]),
      necesitaConfirmar: true,
      listo: function () { return secuencia.length === p.items.length; },
      responder: function () {
        var aciertos = 0;
        p.items.forEach(function (it) {
          var b = botones[it.id];
          b.boton.disabled = true;
          b.boton.classList.remove('esta-marcada');
          var puesto = secuencia.indexOf(it.id) + 1;
          if (puesto === it.posicion) { aciertos++; b.boton.classList.add('es-correcta'); }
          else b.boton.classList.add('es-incorrecta');
          b.badge.textContent = String(it.posicion);
        });
        /* Deja la lista en el orden real, para que se lea como una secuencia */
        p.items.slice().sort(function (a, b) { return a.posicion - b.posicion; })
          .forEach(function (it) { caja.appendChild(botones[it.id].boton); });

        var obtenidos = U.redondear(p.puntos * (aciertos / p.items.length), 2);
        return {
          obtenidos: obtenidos,
          maximo: p.puntos,
          estado: estadoDe(obtenidos, p.puntos),
          detalle: 'Este es el orden real del ciclo.'
        };
      }
    };
  }

  /* =====================================================================
     7. Emparejar dos columnas
     ===================================================================== */
  function emparejar(p, cb) {
    var izq = EX.CONFIG.mezclarOpciones ? U.mezclar(p.izquierda) : p.izquierda;
    var der = EX.CONFIG.mezclarOpciones ? U.mezclar(p.derecha) : p.derecha;
    var uniones = {};       // idIzquierda -> idDerecha
    var activa = null;
    var fichasIzq = {}, fichasDer = {};

    function etiquetaDer(id) {
      var i = 0;
      der.forEach(function (d, k) { if (d.id === id) i = k; });
      return U.letra(i).toUpperCase();
    }

    function pintar() {
      Object.keys(fichasIzq).forEach(function (id) {
        var f = fichasIzq[id];
        f.boton.classList.toggle('esta-activa', activa === id);
        f.boton.classList.toggle('esta-unida', !!uniones[id]);
        f.enlace.textContent = uniones[id] ? etiquetaDer(uniones[id]) : '—';
      });
      Object.keys(fichasDer).forEach(function (id) {
        var usada = Object.keys(uniones).some(function (k) { return uniones[k] === id; });
        fichasDer[id].boton.classList.toggle('esta-unida', usada);
      });
    }

    var colIzq = U.crear('div', { clase: 'emparejar__columna' }, [
      U.crear('span', { clase: 'emparejar__titulo', texto: 'Personaje' })
    ]);
    var colDer = U.crear('div', { clase: 'emparejar__columna' }, [
      U.crear('span', { clase: 'emparejar__titulo', texto: 'Descripción' })
    ]);

    izq.forEach(function (it) {
      var enlace = U.crear('span', { clase: 'ficha__enlace', texto: '—' });
      var b = U.crear('button', {
        clase: 'ficha', type: 'button',
        onclick: function () {
          EX.Audio.reproducir('toque');
          if (uniones[it.id]) { delete uniones[it.id]; activa = null; }
          else activa = (activa === it.id) ? null : it.id;
          pintar(); cb.alCambiar();
        }
      }, [U.crear('span', { texto: it.texto }), enlace]);
      fichasIzq[it.id] = { boton: b, enlace: enlace };
      colIzq.appendChild(b);
    });

    der.forEach(function (it, i) {
      var b = U.crear('button', {
        clase: 'ficha', type: 'button',
        onclick: function () {
          EX.Audio.reproducir('toque');
          if (!activa) {
            /* Al tocar una descripción ya usada, se libera */
            Object.keys(uniones).forEach(function (k) { if (uniones[k] === it.id) delete uniones[k]; });
          } else {
            Object.keys(uniones).forEach(function (k) { if (uniones[k] === it.id) delete uniones[k]; });
            uniones[activa] = it.id;
            activa = null;
          }
          pintar(); cb.alCambiar();
        }
      }, [
        U.crear('span', { clase: 'opcion__letra', texto: U.letra(i).toUpperCase() }),
        U.crear('span', { texto: it.texto })
      ]);
      fichasDer[it.id] = { boton: b };
      colDer.appendChild(b);
    });

    var pista = U.crear('p', {
      clase: 'tarjeta__pista',
      texto: 'Toca un personaje y después su descripción.'
    });

    return {
      elemento: U.crear('div', {}, [pista, U.crear('div', { clase: 'emparejar' }, [colIzq, colDer])]),
      necesitaConfirmar: true,
      listo: function () { return Object.keys(uniones).length === p.izquierda.length; },
      responder: function () {
        var aciertos = 0;
        Object.keys(fichasIzq).forEach(function (id) {
          var f = fichasIzq[id];
          f.boton.disabled = true;
          f.boton.classList.remove('esta-activa', 'esta-unida');
          var bien = uniones[id] === p.pares[id];
          if (bien) aciertos++;
          f.boton.classList.add(bien ? 'es-correcta' : 'es-incorrecta');
          f.enlace.textContent = etiquetaDer(p.pares[id]);
        });
        Object.keys(fichasDer).forEach(function (id) {
          fichasDer[id].boton.disabled = true;
          fichasDer[id].boton.classList.remove('esta-unida');
        });
        var obtenidos = U.redondear(p.puntos * (aciertos / p.izquierda.length), 2);
        var solucion = p.izquierda.map(function (it) {
          var d = p.derecha.filter(function (x) { return x.id === p.pares[it.id]; })[0];
          return it.texto + ' → ' + d.texto.replace(/\.$/, '');
        }).join(' · ');
        return {
          obtenidos: obtenidos,
          maximo: p.puntos,
          estado: estadoDe(obtenidos, p.puntos),
          detalle: solucion
        };
      }
    };
  }

  /* =====================================================================
     8. Eliminar intrusos
     ===================================================================== */
  function intrusos(p, cb) {
    var opciones = EX.CONFIG.mezclarOpciones ? U.mezclar(p.opciones) : p.opciones;
    var tachadas = [];
    var botones = [];

    var caja = U.crear('div', { clase: 'opciones' });
    opciones.forEach(function (op, i) {
      var b = botonOpcion(op, i, function () {
        var k = tachadas.indexOf(op.id);
        if (k >= 0) tachadas.splice(k, 1); else tachadas.push(op.id);
        b.classList.toggle('esta-tachada');
        EX.Audio.reproducir('toque');
        cb.alCambiar();
      });
      botones.push(b);
      caja.appendChild(b);
    });

    var pista = U.crear('p', {
      clase: 'tarjeta__pista',
      texto: 'Sobran ' + p.intrusos.length + ' opciones. Táchalas y confirma con «Responder».'
    });

    return {
      elemento: U.crear('div', {}, [pista, caja]),
      necesitaConfirmar: true,
      listo: function () { return tachadas.length > 0; },
      responder: function () {
        bloquear(botones);
        botones.forEach(function (b) {
          var id = b.dataset.id;
          var esIntruso = p.intrusos.indexOf(id) >= 0;
          var tachada = tachadas.indexOf(id) >= 0;
          if (esIntruso) b.classList.add('esta-tachada', tachada ? 'es-correcta' : 'es-incorrecta');
          else if (tachada) b.classList.add('es-incorrecta');
          else b.classList.add('es-correcta');
        });
        var obtenidos = neto(tachadas, p.intrusos, p.puntos);
        var sobran = p.opciones.filter(function (o) { return p.intrusos.indexOf(o.id) >= 0; })
          .map(function (o) { return o.texto; }).join(', ');
        return {
          obtenidos: obtenidos,
          maximo: p.puntos,
          estado: estadoDe(obtenidos, p.puntos),
          detalle: 'Sobraban: ' + sobran
        };
      }
    };
  }

  /* =====================================================================
     9. Mapa
     ===================================================================== */
  function mapa(p, cb) {
    var etiquetas = EX.CONFIG.mezclarOpciones ? U.mezclar(p.etiquetas) : p.etiquetas;
    var widget = EX.Mapa.construir({
      etiquetas: etiquetas,
      alCambiar: function () { cb.alCambiar(); }
    });

    return {
      elemento: widget.elemento,
      necesitaConfirmar: true,
      listo: function () { return widget.colocadas() === EX.Mapa.zonas().length; },
      responder: function () {
        var aciertos = widget.revelar();
        var total = EX.Mapa.zonas().length;
        var obtenidos = U.redondear(p.puntos * (aciertos / total), 2);
        return {
          obtenidos: obtenidos,
          maximo: p.puntos,
          estado: estadoDe(obtenidos, p.puntos),
          detalle: aciertos + ' de ' + total + ' regiones bien ubicadas.'
        };
      }
    };
  }

  /* --------------------------------------------------------------- */
  var constructores = {
    mc: unaAlternativa,
    multi: variasAlternativas,
    vf: verdaderoFalso,
    completar: completar,
    corta: corta,
    orden: orden,
    emparejar: emparejar,
    intrusos: intrusos,
    mapa: mapa
  };

  var nombresTipo = {
    mc: 'Selección múltiple',
    multi: 'Varias respuestas',
    vf: 'Verdadero o falso',
    completar: 'Completar',
    corta: 'Respuesta corta',
    orden: 'Secuencia',
    emparejar: 'Emparejar',
    intrusos: 'Elimina los intrusos',
    mapa: 'Ubicar en el mapa'
  };

  function construir(pregunta, cb) {
    return constructores[pregunta.tipo](pregunta, cb);
  }

  return { construir: construir, nombresTipo: nombresTipo };
})();
