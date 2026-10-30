/* Touch / click: firecracker burst + marigold flowers flying up. */
(function () {
  "use strict";
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  var cv = document.getElementById("fx");
  if (!cv) return;
  var c = cv.getContext("2d"), dpr = Math.min(window.devicePixelRatio || 1, 2);
  var W, H, parts = [], running = false;
  var SPARK = ["#FFD36B", "#E89A35", "#FF6B6B", "#FFF8EC", "#C9A45C", "#FF9ECF", "#9BE37A"];
  var MAX = window.innerWidth < 700 ? 320 : 600;

  function resize() {
    W = window.innerWidth; H = window.innerHeight;
    cv.width = W * dpr; cv.height = H * dpr;
    cv.style.width = W + "px"; cv.style.height = H + "px";
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  window.addEventListener("resize", resize);

  function rnd(a, b) { return a + Math.random() * (b - a); }

  function burst(x, y) {
    if (parts.length > MAX) parts.splice(0, parts.length - MAX + 80);
    var col = SPARK[(Math.random() * SPARK.length) | 0], i, a, s;
    // flash
    parts.push({ k: "flash", x: x, y: y, life: 14, max: 14 });
    // firecracker sparks
    for (i = 0; i < 34; i++) {
      a = (Math.PI * 2 * i) / 34 + rnd(-.08, .08); s = rnd(2.2, 6.2);
      parts.push({ k: "spark", x: x, y: y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: rnd(45, 80), max: 80,
        c: Math.random() < .6 ? col : SPARK[(Math.random() * SPARK.length) | 0], r: rnd(1.4, 2.6) });
    }
    // glitter
    for (i = 0; i < 12; i++) {
      a = rnd(0, Math.PI * 2); s = rnd(.5, 2.4);
      parts.push({ k: "spark", x: x, y: y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 1, life: rnd(70, 110), max: 110, c: "#FFF8EC", r: 1.1 });
    }
    // flowers flying up
    for (i = 0; i < 9; i++) {
      a = rnd(-Math.PI * .95, -Math.PI * .05); s = rnd(2.5, 7);
      parts.push({ k: "flower", x: x, y: y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: rnd(110, 170), max: 170,
        size: rnd(9, 17), rot: rnd(0, 6.28), vr: rnd(-.12, .12), hue: Math.random() < .75 ? 0 : 1, sw: rnd(0, 6.28) });
    }
    if (window.WeddingMusic) window.WeddingMusic.pop();
    if (!running) { running = true; requestAnimationFrame(loop); }
  }

  function flower(p, alpha) {
    var r = p.size, n = 8, i;
    c.save(); c.translate(p.x, p.y); c.rotate(p.rot); c.globalAlpha = alpha;
    c.fillStyle = p.hue ? "#F2B548" : "#E89A35";
    for (i = 0; i < n; i++) {
      var a = (Math.PI * 2 * i) / n;
      c.beginPath(); c.arc(Math.cos(a) * r * .55, Math.sin(a) * r * .55, r * .42, 0, 6.283); c.fill();
    }
    c.fillStyle = "#C9742A"; c.beginPath(); c.arc(0, 0, r * .4, 0, 6.283); c.fill();
    c.fillStyle = "#781F35"; c.beginPath(); c.arc(0, 0, r * .16, 0, 6.283); c.fill();
    c.restore();
  }

  function loop() {
    c.clearRect(0, 0, W, H);
    for (var i = parts.length - 1; i >= 0; i--) {
      var p = parts[i];
      p.life--;
      if (p.life <= 0) { parts.splice(i, 1); continue; }
      var f = p.life / p.max;
      if (p.k === "flash") {
        var g = c.createRadialGradient(p.x, p.y, 0, p.x, p.y, 70 * (1.2 - f));
        g.addColorStop(0, "rgba(255,240,190," + f + ")"); g.addColorStop(1, "rgba(255,200,90,0)");
        c.fillStyle = g; c.beginPath(); c.arc(p.x, p.y, 70, 0, 6.283); c.fill();
      } else if (p.k === "spark") {
        p.vx *= .965; p.vy = p.vy * .965 + .07; p.x += p.vx; p.y += p.vy;
        c.globalAlpha = Math.min(1, f * 1.6); c.fillStyle = p.c;
        c.beginPath(); c.arc(p.x, p.y, p.r, 0, 6.283); c.fill();
        c.globalAlpha = c.globalAlpha * .35; // tail
        c.beginPath(); c.arc(p.x - p.vx, p.y - p.vy, p.r * .8, 0, 6.283); c.fill();
      } else {
        p.sw += .05; p.vx *= .985; p.vy = p.vy * .985 + .035; // slow, floating fall
        p.x += p.vx + Math.sin(p.sw) * .6; p.y += p.vy; p.rot += p.vr;
        flower(p, Math.min(1, f * 2));
      }
    }
    c.globalAlpha = 1;
    if (parts.length) requestAnimationFrame(loop);
    else { running = false; c.clearRect(0, 0, W, H); }
  }

  var last = 0;
  document.addEventListener("pointerdown", function (e) {
    var now = Date.now();
    if (now - last < 120) return; // avoid double-fire
    last = now;
    burst(e.clientX, e.clientY);
  }, { passive: true });

  window.WeddingFX = { burst: burst };
})();
