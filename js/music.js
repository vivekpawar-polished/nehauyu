/* Beautiful romantic love melody — Web Audio API, no file needed.
   Raga Yaman-inspired slow melody with lush harmonics and gentle tabla.
   Starts only after first user gesture. */
(function () {
  "use strict";
  var AC = window.AudioContext || window.webkitAudioContext;
  var ctx, master, reverb, delay, timer, nextTime = 0, step = 0, playing = false, nodes = [];

  // Raga Yaman: Sa Re Ga Ma(#) Pa Dha Ni Sa — romantic, evening raga
  // Semitones from C4 (261.63 Hz). Using D4 (293.66) as Sa for warmth.
  var ROOT = 293.66; // D4 = Sa
  var BEAT = 0.9;    // slow, romantic tempo

  // Melody: [semitone, beats]. -99 = rest. Yaman phrases.
  var A = [
    [0,2],[4,1],[6,1],[7,2],[6,1],[4,1],
    [2,1],[4,2],[0,3],[-99,1]
  ];
  var B = [
    [7,1],[9,1],[11,1],[12,2],[11,1],[9,1],
    [7,2],[6,1],[4,1],[2,1],[0,3],[-99,1]
  ];
  var C = [
    [12,1],[11,1],[9,1],[7,1],[6,2],[4,1],
    [6,1],[7,2],[4,1],[2,1],[0,4],[-99,2]
  ];
  var D = [
    [4,1],[6,1],[7,1],[9,1],[11,2],[12,1],
    [11,1],[9,1],[7,2],[6,1],[4,1],[2,1],[0,4],[-99,2]
  ];
  var SONG = A.concat(B, A, C, D, B, A);

  var TABLA = ["dha","ge","na","ti","na","ka","dhi","na"];

  function hz(semi) { return ROOT * Math.pow(2, semi / 12); }

  function makeReverb(c) {
    var len = c.sampleRate * 2.8, buf = c.createBuffer(2, len, c.sampleRate);
    for (var ch = 0; ch < 2; ch++) {
      var d = buf.getChannelData(ch);
      for (var i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.2);
    }
    var conv = c.createConvolver(); conv.buffer = buf; return conv;
  }

  function init() {
    if (ctx || !AC) return;
    ctx = new AC();
    master = ctx.createGain(); master.gain.value = 0;

    // Reverb
    reverb = makeReverb(ctx);
    var revGain = ctx.createGain(); revGain.gain.value = 0.38;
    reverb.connect(revGain); revGain.connect(master);

    // Delay (echo)
    delay = ctx.createDelay(1.2); delay.delayTime.value = 0.36;
    var fb = ctx.createGain(); fb.gain.value = 0.28;
    var wet = ctx.createGain(); wet.gain.value = 0.22;
    delay.connect(fb); fb.connect(delay); delay.connect(wet); wet.connect(master);

    master.connect(ctx.destination);
  }

  // Tanpura drone — Sa Pa Sa (tonic + fifth)
  function drone() {
    [[ROOT / 2, 0.08], [ROOT * 0.75, 0.055], [ROOT, 0.04], [ROOT * 1.5, 0.025]].forEach(function (p) {
      var o = ctx.createOscillator(), g = ctx.createGain();
      var lfo = ctx.createOscillator(), lfog = ctx.createGain();
      o.type = "triangle"; o.frequency.value = p[0];
      lfo.frequency.value = 0.12; lfog.gain.value = p[0] * 0.004;
      lfo.connect(lfog); lfog.connect(o.frequency);
      g.gain.value = p[1]; o.connect(g); g.connect(master);
      o.start(); lfo.start(); nodes.push(o, lfo);
    });
  }

  // Bansuri-like note: breathy flute with harmonics
  function note(semi, t, dur) {
    var freq = hz(semi);
    // Main oscillator (sine + slight triangle for warmth)
    var o1 = ctx.createOscillator(), o2 = ctx.createOscillator();
    var o3 = ctx.createOscillator(); // harmonic
    var f = ctx.createBiquadFilter(), g = ctx.createGain();
    // Vibrato
    var vib = ctx.createOscillator(), vibg = ctx.createGain();
    vib.frequency.value = 5.2; vibg.gain.value = freq * 0.012;
    vib.connect(vibg); vibg.connect(o1.frequency); vibg.connect(o2.frequency);

    o1.type = "sine"; o1.frequency.value = freq;
    o2.type = "triangle"; o2.frequency.value = freq * 1.003; // slight detune
    o3.type = "sine"; o3.frequency.value = freq * 2.01; // octave harmonic

    f.type = "lowpass"; f.frequency.value = 2200; f.Q.value = 1.8;

    var g3 = ctx.createGain(); g3.gain.value = 0.06;
    o3.connect(g3); g3.connect(f);

    // Envelope: slow attack for flute feel
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(0.18, t + 0.18);
    g.gain.setTargetAtTime(0.13, t + 0.22, 0.3);
    g.gain.setTargetAtTime(0.0001, t + dur * 0.88, 0.1);

    o1.connect(f); o2.connect(f); f.connect(g);
    g.connect(master); g.connect(delay); g.connect(reverb);

    var end = t + dur + 0.8;
    o1.start(t); o2.start(t); o3.start(t); vib.start(t);
    o1.stop(end); o2.stop(end); o3.stop(end); vib.stop(end);
  }

  var nb;
  function noiseBuf() {
    var b = ctx.createBuffer(1, ctx.sampleRate * 0.15, ctx.sampleRate), d = b.getChannelData(0);
    for (var i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    return b;
  }

  function tabla(kind, t) {
    var g = ctx.createGain(), o;
    if (kind === "dha" || kind === "dhi" || kind === "ge") {
      o = ctx.createOscillator(); o.type = "sine";
      o.frequency.setValueAtTime(kind === "ge" ? 160 : 140, t);
      o.frequency.exponentialRampToValueAtTime(65, t + 0.28);
      g.gain.setValueAtTime(kind === "ge" ? 0.18 : 0.24, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
      o.connect(g); g.connect(master); o.start(t); o.stop(t + 0.38);
    }
    if (kind !== "ge" && kind !== "ka") {
      nb = nb || noiseBuf();
      var s = ctx.createBufferSource(), hp = ctx.createBiquadFilter(), g2 = ctx.createGain();
      s.buffer = nb; hp.type = "highpass"; hp.frequency.value = 3000;
      g2.gain.setValueAtTime(0.07, t); g2.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
      s.connect(hp); hp.connect(g2); g2.connect(master); s.start(t);
    }
  }

  var tIdx = 0, tPos = 0;
  function schedule() {
    var ahead = ctx.currentTime + 0.4;
    while (nextTime < ahead) {
      var n = SONG[step % SONG.length], d = n[1] * BEAT;
      if (n[0] > -90) note(n[0], nextTime, d);
      nextTime += d; step++;
    }
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
      fade(0.6, 3.5);
      playing = true;
    },
    stop: function () {
      if (!playing) return;
      fade(0, 1.2);
      var c = ctx;
      setTimeout(function () { clearInterval(timer); if (c.state === "running") c.suspend(); }, 1300);
      playing = false;
    },
    pop: function () {
      if (!ctx || ctx.state !== "running" || !playing) return;
      nb = nb || noiseBuf();
      var s = ctx.createBufferSource(), g = ctx.createGain(), f = ctx.createBiquadFilter(), t = ctx.currentTime;
      s.buffer = nb; f.type = "bandpass"; f.frequency.value = 1200;
      g.gain.setValueAtTime(0.2, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
      s.connect(f); f.connect(g); g.connect(master); s.start(t);
    }
  };
})();
