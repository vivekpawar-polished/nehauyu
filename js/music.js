/* Original soft shehnai-style melody generated in the browser (Web Audio API).
   No audio file and no copyrighted song needed. Starts only after a user tap.
   To use a real song instead, set musicSrc in js/config.js. */
(function () {
  "use strict";
  var AC = window.AudioContext || window.webkitAudioContext;
  var ctx, master, delay, timer, nextTime = 0, step = 0, playing = false, nodes = [];
  var BEAT = 0.72, ROOT = 293.66; // D4
  var A = [[4,1],[7,1],[9,1],[12,2],[9,1],[7,1],[4,2],[2,1],[0,1],[2,1],[4,3],[-99,1]];
  var B = [[7,1],[9,1],[12,1],[14,2],[16,2],[14,1],[12,1],[9,2],[7,1],[9,1],[7,1],[4,1],[2,1],[0,3],[-99,1]];
  var SONG = A.concat(A, B, A);
  var TABLA = ["dha","ge","na","ti","na","ka","dhi","na"];

  function hz(semi) { return ROOT * Math.pow(2, semi / 12); }

  function init() {
    if (ctx || !AC) return;
    ctx = new AC();
    master = ctx.createGain(); master.gain.value = 0;
    delay = ctx.createDelay(1); delay.delayTime.value = 0.28;
    var fb = ctx.createGain(); fb.gain.value = 0.32;
    var wet = ctx.createGain(); wet.gain.value = 0.35;
    delay.connect(fb); fb.connect(delay); delay.connect(wet); wet.connect(master);
    master.connect(ctx.destination);
  }

  function drone() {
    [[ROOT / 2, 0.10], [ROOT * 0.75, 0.07], [ROOT, 0.045]].forEach(function (p) {
      var o = ctx.createOscillator(), g = ctx.createGain(), l = ctx.createOscillator(), lg = ctx.createGain();
      o.type = "triangle"; o.frequency.value = p[0];
      l.frequency.value = 0.18; lg.gain.value = p[1] * 0.35; l.connect(lg); lg.connect(g.gain);
      g.gain.value = p[1]; o.connect(g); g.connect(master);
      o.start(); l.start(); nodes.push(o, l);
    });
  }

  function note(semi, t, dur) {
    var o = ctx.createOscillator(), o2 = ctx.createOscillator(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    var v = ctx.createOscillator(), vg = ctx.createGain();
    o.type = "sawtooth"; o2.type = "square";
    o.frequency.value = hz(semi); o2.frequency.value = hz(semi) * 1.004;
    v.frequency.value = 5.4; vg.gain.value = hz(semi) * 0.008; v.connect(vg); vg.connect(o.frequency); vg.connect(o2.frequency);
    f.type = "lowpass"; f.frequency.value = 1700; f.Q.value = 3;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(0.16, t + 0.07);
    g.gain.setTargetAtTime(0.1, t + 0.1, 0.25);
    g.gain.setTargetAtTime(0.0001, t + dur * 0.92, 0.07);
    o.connect(f); o2.connect(f); f.connect(g); g.connect(master); g.connect(delay);
    var end = t + dur + 0.5;
    o.start(t); o2.start(t); v.start(t); o.stop(end); o2.stop(end); v.stop(end);
  }

  function noiseBuf() {
    var b = ctx.createBuffer(1, ctx.sampleRate * 0.12, ctx.sampleRate), d = b.getChannelData(0);
    for (var i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    return b;
  }
  var nb;
  function tabla(kind, t) {
    var g = ctx.createGain(), o;
    if (kind === "dha" || kind === "ge" || kind === "dhi") {
      o = ctx.createOscillator(); o.type = "sine";
      o.frequency.setValueAtTime(kind === "ge" ? 170 : 150, t);
      o.frequency.exponentialRampToValueAtTime(70, t + 0.22);
      g.gain.setValueAtTime(kind === "ge" ? 0.22 : 0.3, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
      o.connect(g); g.connect(master); o.start(t); o.stop(t + 0.32);
    }
    if (kind !== "ge" && kind !== "ka") {
      nb = nb || noiseBuf();
      var s = ctx.createBufferSource(), hp = ctx.createBiquadFilter(), g2 = ctx.createGain();
      s.buffer = nb; hp.type = "highpass"; hp.frequency.value = 3200;
      g2.gain.setValueAtTime(0.09, t); g2.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
      s.connect(hp); hp.connect(g2); g2.connect(master); s.start(t);
    }
  }

  var tIdx = 0, tPos = 0;
  function schedule() {
    var ahead = ctx.currentTime + 0.35;
    // melody
    while (nextTime < ahead) {
      var n = SONG[step % SONG.length], d = n[1] * BEAT;
      if (n[0] > -90) note(n[0], nextTime, d);
      nextTime += d; step++;
    }
    // rhythm (8 beat cycle, tempo follows BEAT/2 per stroke)
    while (tPos < ahead) {
      tabla(TABLA[tIdx % 8], tPos);
      tPos += BEAT / 2; tIdx++;
    }
  }

  function fade(to, secs) {
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.setValueAtTime(master.gain.value, ctx.currentTime);
    master.gain.linearRampToValueAtTime(to, ctx.currentTime + secs);
  }

  window.WeddingMusic = {
    supported: !!AC,
    get playing() { return playing; },
    start: function () {
      if (!AC || playing) return;
      init();
      if (ctx.state === "suspended") ctx.resume();
      if (!nodes.length) drone();
      nextTime = tPos = ctx.currentTime + 0.1;
      timer = setInterval(schedule, 120);
      fade(0.55, 2.5);
      playing = true;
    },
    stop: function () {
      if (!playing) return;
      fade(0, 1);
      var c = ctx;
      setTimeout(function () { clearInterval(timer); if (c.state === "running") c.suspend(); }, 1100);
      playing = false;
    },
    pop: function () { // soft cracker sound on touch (only if music context is awake)
      if (!ctx || ctx.state !== "running" || !playing) return;
      nb = nb || noiseBuf();
      var s = ctx.createBufferSource(), g = ctx.createGain(), f = ctx.createBiquadFilter(), t = ctx.currentTime;
      s.buffer = nb; f.type = "bandpass"; f.frequency.value = 1400;
      g.gain.setValueAtTime(0.25, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
      s.connect(f); f.connect(g); g.connect(master); s.start(t);
    }
  };
})();
