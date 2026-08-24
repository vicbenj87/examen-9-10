/* ==========================================================================
   audio.js — Sonido generado en el navegador (sin archivos externos)
   Paleta sonora: pad grave y cálido + campanas suaves con reverberación.
   ========================================================================== */

window.EX = window.EX || {};

EX.Audio = (function () {
  'use strict';

  var ctx = null;
  var maestro = null;      // volumen general
  var reverb = null;       // envío a reverberación
  var pad = null;          // capa ambiental
  var activo = true;
  var iniciado = false;

  /* Impulso sintético para el convolver: ruido con caída exponencial */
  function impulso(segundos, caida) {
    var n = Math.floor(ctx.sampleRate * segundos);
    var buffer = ctx.createBuffer(2, n, ctx.sampleRate);
    for (var c = 0; c < 2; c++) {
      var datos = buffer.getChannelData(c);
      for (var i = 0; i < n; i++) {
        datos[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, caida);
      }
    }
    return buffer;
  }

  function iniciar() {
    if (iniciado) { if (ctx.state === 'suspended') ctx.resume(); return; }
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) { activo = false; return; }

    ctx = new AC();
    maestro = ctx.createGain();
    maestro.gain.value = activo ? 0.9 : 0;
    maestro.connect(ctx.destination);

    var conv = ctx.createConvolver();
    conv.buffer = impulso(3.2, 2.6);
    reverb = ctx.createGain();
    reverb.gain.value = 0.34;
    reverb.connect(conv);
    conv.connect(maestro);

    iniciado = true;
    ambiente(true);
  }

  /* --- Capa ambiental: dos ondas desafinadas + filtro que respira --- */
  function ambiente(encender) {
    if (!iniciado) return;
    if (encender && !pad) {
      var salida = ctx.createGain();
      salida.gain.value = 0;
      var filtro = ctx.createBiquadFilter();
      filtro.type = 'lowpass';
      filtro.frequency.value = 620;
      filtro.Q.value = 0.7;

      var osc = [];
      [55, 82.41, 110.5, 164.81].forEach(function (f, i) {
        var o = ctx.createOscillator();
        o.type = i % 2 ? 'sine' : 'triangle';
        o.frequency.value = f;
        o.detune.value = (i - 1.5) * 6;
        var g = ctx.createGain();
        g.gain.value = i === 0 ? 0.5 : 0.18;
        o.connect(g); g.connect(filtro);
        o.start();
        osc.push(o);
      });

      /* Movimiento lento del filtro: sensación de respiración */
      var lfo = ctx.createOscillator();
      lfo.frequency.value = 0.05;
      var lfoG = ctx.createGain();
      lfoG.gain.value = 220;
      lfo.connect(lfoG); lfoG.connect(filtro.frequency);
      lfo.start();

      filtro.connect(salida);
      salida.connect(maestro);
      salida.connect(reverb);
      salida.gain.linearRampToValueAtTime(0.055, ctx.currentTime + 4);

      pad = { salida: salida, osc: osc, lfo: lfo };
    } else if (!encender && pad) {
      var p = pad; pad = null;
      p.salida.gain.cancelScheduledValues(ctx.currentTime);
      p.salida.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.2);
      setTimeout(function () {
        p.osc.forEach(function (o) { try { o.stop(); } catch (e) {} });
        try { p.lfo.stop(); } catch (e) {}
      }, 1400);
    }
  }

  /* --- Una nota con ataque suave --- */
  function nota(frecuencia, retraso, duracion, volumen, tipo) {
    if (!iniciado || !activo) return;
    var t = ctx.currentTime + (retraso || 0);
    var o = ctx.createOscillator();
    var g = ctx.createGain();
    o.type = tipo || 'sine';
    o.frequency.setValueAtTime(frecuencia, t);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(volumen, t + 0.03);
    g.gain.exponentialRampToValueAtTime(0.0001, t + duracion);
    o.connect(g);
    g.connect(maestro);
    g.connect(reverb);
    o.start(t);
    o.stop(t + duracion + 0.1);
  }

  /* --- Efectos --- */
  var efectos = {
    acierto: function () {                    // arpegio mayor ascendente
      nota(523.25, 0.00, 1.1, 0.16, 'triangle');
      nota(659.25, 0.09, 1.1, 0.14, 'triangle');
      nota(783.99, 0.18, 1.4, 0.13, 'sine');
    },
    parcial: function () {                    // dos notas, sin resolver
      nota(523.25, 0.00, 0.9, 0.14, 'triangle');
      nota(587.33, 0.11, 1.1, 0.12, 'sine');
    },
    fallo: function () {                      // descenso grave y amable
      nota(293.66, 0.00, 0.9, 0.13, 'sine');
      nota(233.08, 0.13, 1.2, 0.11, 'sine');
    },
    toque: function () { nota(880, 0, 0.16, 0.05, 'sine'); },        // clic
    tic: function () { nota(1174.66, 0, 0.09, 0.035, 'sine'); },     // últimos segundos
    pasar: function () { nota(392, 0, 0.5, 0.07, 'triangle'); },     // cambio de pregunta
    abrir: function () {                       // aparece la explicación
      nota(392.00, 0.00, 1.4, 0.10, 'sine');
      nota(587.33, 0.16, 1.6, 0.08, 'sine');
    },
    final: function () {                       // acorde de cierre
      nota(261.63, 0.00, 2.6, 0.13, 'triangle');
      nota(329.63, 0.10, 2.6, 0.11, 'triangle');
      nota(392.00, 0.20, 2.8, 0.10, 'sine');
      nota(523.25, 0.32, 3.2, 0.09, 'sine');
    }
  };

  function reproducir(nombre) {
    if (!iniciado || !activo) return;
    if (ctx.state === 'suspended') ctx.resume();
    if (efectos[nombre]) efectos[nombre]();
  }

  function alternar() {
    activo = !activo;
    if (!iniciado) { if (activo) iniciar(); return activo; }
    maestro.gain.cancelScheduledValues(ctx.currentTime);
    maestro.gain.linearRampToValueAtTime(activo ? 0.9 : 0, ctx.currentTime + 0.4);
    return activo;
  }

  function estaActivo() { return activo; }

  return {
    iniciar: iniciar,
    reproducir: reproducir,
    alternar: alternar,
    estaActivo: estaActivo,
    ambiente: ambiente
  };
})();
