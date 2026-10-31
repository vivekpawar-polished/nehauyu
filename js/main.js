(function () {
  "use strict";
  var W = window.WEDDING, T = window.I18N;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var lang = "en";

  /* ---------- Language ---------- */
  function t(key) { return (T[lang] && T[lang][key]) || T.en[key] || key; }

  function applyLang(l) {
    lang = l;
    document.documentElement.lang = l === "mr" ? "mr" : "en";
    document.body.setAttribute("data-lang", l);
    $$("[data-i18n]").forEach(function (el) {
      var v = t(el.getAttribute("data-i18n"));
      if (v) el.textContent = v;
    });
    // Secondary Marathi line shown only in English mode
    $$("[data-i18n-alt]").forEach(function (el) {
      var k = el.getAttribute("data-i18n-alt");
      el.textContent = T.mr[k] || "";
      el.hidden = l === "mr";
    });
    $$(".lang-btn").forEach(function (b) {
      b.setAttribute("aria-pressed", String(b.getAttribute("data-lang") === l));
    });
    document.title = l === "mr"
      ? "नेहा आणि जिग्नेश | शुभविवाह निमंत्रण | ५ डिसेंबर २०२६"
      : "Neha & Jignesh | Wedding Invitation | 5 December 2026";
    updateMusicLabel();
    try { localStorage.setItem("wedding-lang", l); } catch (e) {}
  }

  $$(".lang-btn").forEach(function (b) {
    b.addEventListener("click", function () { applyLang(b.getAttribute("data-lang")); });
  });

  /* ---------- Links from config ---------- */
  $$(".js-maps").forEach(function (a) {
    a.href = W.mapsUrl;
    if (a.hasAttribute("data-i18n") === false && !a.querySelector("[data-i18n]")) return;
  });
  var map = $("#mapFrame");
  if (map) map.src = "https://www.google.com/maps?q=" + W.lat + "," + W.lng + "&z=17&output=embed";

  /* Optional event times (only if confirmed in config) */
  function addTime(selector, time) {
    if (!time) return;
    var d = $(selector);
    if (d) d.insertAdjacentHTML("afterend", '<p class="card-time">' + time + "</p>");
  }
  addTime('[data-i18n="ev1_date"]', W.haldiTime);
  addTime('[data-i18n="ev2_date"]', W.weddingTime);

  /* ---------- WhatsApp share ---------- */
  $$(".js-share").forEach(function (b) {
    b.addEventListener("click", function () {
      var url = location.href.split("#")[0];
      var msg = t("share_msg") + (url.indexOf("http") === 0 ? "\n" + url : "");
      window.open("https://wa.me/?text=" + encodeURIComponent(msg), "_blank", "noopener");
    });
  });

  /* ---------- Navigation ---------- */
  var nav = $("#nav"), burger = $("#burger"), links = $("#navLinks");
  // nav solid state handled by scroll.js on desktop; fallback for mobile
  function onScroll() { nav.classList.toggle("solid", window.scrollY > 60); }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  function closeMenu() {
    links.classList.remove("open");
    nav.classList.remove("menu-open");
    burger.classList.remove("open");
    burger.setAttribute("aria-expanded", "false");
  }
  burger.addEventListener("click", function () {
    var open = links.classList.toggle("open");
    burger.classList.toggle("open", open);
    nav.classList.toggle("menu-open", open);
    burger.setAttribute("aria-expanded", String(open));
  });

  // Route in-page anchors through the section controller when it is active.
  $$('a[href^="#"]').forEach(function (a) {
    a.addEventListener("click", function (e) {
      var id = a.getAttribute("href");
      if (id.length < 2) return;
      var target = $(id);
      if (!target) return;
      e.preventDefault();
      closeMenu();
      var sections = $$("main > section");
      var index = sections.indexOf(target);
      if (window.WeddingScroll && index >= 0) {
        window.WeddingScroll.goTo(index);
      } else {
        target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
        if (history.replaceState) history.replaceState(null, "", id);
      }
    });
  });

  // Active link highlight
  if (!window.WeddingScroll && "IntersectionObserver" in window) {
    var secs = $$("main section[id]");
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          $$("#navLinks a").forEach(function (a) {
            a.classList.toggle("active", a.getAttribute("href") === "#" + en.target.id);
          });
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    secs.forEach(function (s) { spy.observe(s); });
  }

  /* ---------- Reveal on scroll ---------- */
  var reveals = $$(".reveal");
  if (!window.WeddingScroll && "IntersectionObserver" in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { threshold: 0.15 });
    reveals.forEach(function (el, i) {
      el.style.transitionDelay = (i % 3) * 90 + "ms";
      io.observe(el);
    });
  } else if (!window.WeddingScroll) {
    reveals.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- Toran (mango leaves + marigolds) ---------- */
  $$("[data-toran]").forEach(function (row) {
    var html = "";
    for (var i = 0; i < 40; i++) {
      html += '<svg class="tl" viewBox="0 0 24 60"><use href="#leaf"/></svg>';
      if (i % 3 === 1) html += '<svg class="tm" viewBox="0 0 48 48"><use href="#marigold"/></svg>';
    }
    row.innerHTML = html;
  });
  // Garlands (CSS-driven, filled with marigold SVG)
  $$(".card-garland, .footer-garland").forEach(function (g) {
    var h = "";
    for (var i = 0; i < 24; i++) h += '<svg viewBox="0 0 48 48"><use href="#marigold"/></svg>';
    g.innerHTML = h;
  });
  var cdDeco = $(".cd-deco");
  if (cdDeco) {
    var d = "";
    for (var j = 0; j < 14; j++) d += '<svg class="cd-f cd-f' + (j % 4) + '" viewBox="0 0 48 48"><use href="#marigold"/></svg>';
    cdDeco.innerHTML = d;
  }

  /* ---------- Falling rose petals (hero) ---------- */
  var ROSE_PETALS = [
    "radial-gradient(ellipse at 40% 30%,#e8527a,#c0183a)",
    "radial-gradient(ellipse at 40% 30%,#f4a0b8,#d4607a)",
    "radial-gradient(ellipse at 40% 30%,#d4507a,#8b0e26)",
    "radial-gradient(ellipse at 40% 30%,#ff8fab,#c0183a)",
    "radial-gradient(ellipse at 40% 30%,#ffc2d4,#e8527a)"
  ];
  var pet = $("#petals");
  if (pet && !reduceMotion) {
    var count = window.innerWidth < 700 ? 12 : 22;
    for (var p = 0; p < count; p++) {
      var s = document.createElement("span");
      var pw = 10 + Math.random() * 12;
      s.style.left = Math.random() * 100 + "%";
      s.style.width  = pw + "px";
      s.style.height = (pw * 0.7) + "px";
      s.style.background = ROSE_PETALS[Math.floor(Math.random() * ROSE_PETALS.length)];
      s.style.borderRadius = Math.random() > 0.5 ? "50% 0 50% 50%" : "0 50% 50% 50%";
      s.style.animationDuration = 8 + Math.random() * 10 + "s";
      s.style.animationDelay = -Math.random() * 14 + "s";
      pet.appendChild(s);
    }
  }

  /* ---------- Parallax (hero image) ---------- */
  var ticking = false;
  var heroImg = $("#heroImg");
  if (!reduceMotion && heroImg) {
    window.addEventListener("scroll", function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        var y = window.scrollY;
        if (y < window.innerHeight * 1.2) heroImg.style.transform = "translate3d(0," + y * 0.25 + "px,0) scale(1.08)";
        ticking = false;
      });
    }, { passive: true });
  }

  /* ---------- Images: graceful fallback if file is missing ---------- */
  function guardImg(img) {
    img.addEventListener("error", function () {
      var wrap = img.closest(".hero-media, .frame, .g-item");
      if (wrap) wrap.classList.add("no-img");
      img.style.display = "none";
    });
    img.addEventListener("load", function () { img.classList.add("loaded"); });
    if (img.complete && img.naturalWidth > 0) img.classList.add("loaded");
  }
  // Set couple photo from config (photos/ folder)
  var storyImg = $("#storyImg");
  if (W.couplePhoto) {
    if (heroImg) heroImg.src = W.couplePhoto;
    if (storyImg) storyImg.src = W.couplePhoto2;
  }
  $$("#heroImg, #storyImg").forEach(guardImg);

  /* ---------- Gallery + Lightbox ---------- */
  var grid = $("#galleryGrid"), items = W.gallery || [], cur = 0;
  items.forEach(function (it, i) {
    var b = document.createElement("button");
    b.type = "button";
    b.className = "g-item" + (i === 0 ? " featured" : "");
    b.setAttribute("aria-label", "Open photo " + (i + 1));
    var im = document.createElement("img");
    im.src = it.src; im.alt = it.alt || ""; im.loading = "lazy";
    b.appendChild(im);
    guardImg(im);
    b.addEventListener("click", function () { openLb(i); });
    grid.appendChild(b);
  });
  if (items.length < 2) grid.classList.add("single");

  var lb = $("#lightbox"), lbImg = $("#lbImg"), lastFocus = null;
  function showLb() { lbImg.src = items[cur].src; lbImg.alt = items[cur].alt || ""; }
  function openLb(i) {
    cur = i; lastFocus = document.activeElement; showLb();
    lb.hidden = false; document.body.style.overflow = "hidden";
    $(".lb-close", lb).focus();
  }
  function closeLb() {
    lb.hidden = true; document.body.style.overflow = "";
    if (lastFocus) lastFocus.focus();
  }
  function step(d) { cur = (cur + d + items.length) % items.length; showLb(); }
  $(".lb-close", lb).addEventListener("click", closeLb);
  $(".lb-prev", lb).addEventListener("click", function () { step(-1); });
  $(".lb-next", lb).addEventListener("click", function () { step(1); });
  lb.addEventListener("click", function (e) { if (e.target === lb) closeLb(); });
  document.addEventListener("keydown", function (e) {
    if (lb.hidden) return;
    if (e.key === "Escape") closeLb();
    else if (e.key === "ArrowLeft") step(-1);
    else if (e.key === "ArrowRight") step(1);
    else if (e.key === "Tab") { // simple focus trap
      var f = $$("button", lb);
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
  if (items.length < 2) { $(".lb-prev", lb).style.display = "none"; $(".lb-next", lb).style.display = "none"; }

  /* ---------- Countdown (target defined in config.js, Asia/Kolkata offset) ---------- */
  var target = new Date(W.countdownTarget).getTime();
  var els = { d: $("#cdDays"), h: $("#cdHours"), m: $("#cdMins"), s: $("#cdSecs") };
  var prev = {};
  function pad(n) { return n < 10 ? "0" + n : String(n); }
  function localize(str) {
    if (lang !== "mr") return str;
    return str.replace(/\d/g, function (c) { return "०१२३४५६७८९"[+c]; });
  }
  function setNum(key, val) {
    var el = els[key], txt = pad(val);
    if (prev[key] === txt) return;
    prev[key] = txt;
    el.textContent = localize(txt);
    el.dataset.v = txt;
    if (!reduceMotion) { el.classList.remove("tick"); void el.offsetWidth; el.classList.add("tick"); }
  }
  function tick() {
    var diff = target - Date.now();
    var grid = $("#cdGrid"), done = $("#cdDone");
    if (isNaN(target)) return;
    if (diff <= 0) {
      grid.hidden = true; done.hidden = false;
      clearInterval(timer);
      return;
    }
    var sec = Math.floor(diff / 1000);
    setNum("d", Math.floor(sec / 86400));
    setNum("h", Math.floor((sec % 86400) / 3600));
    setNum("m", Math.floor((sec % 3600) / 60));
    setNum("s", sec % 60);
  }
  var timer = setInterval(tick, 1000);
  tick();
  // re-render digits when language changes
  $$(".lang-btn").forEach(function (b) {
    b.addEventListener("click", function () {
      Object.keys(els).forEach(function (k) { if (els[k].dataset.v) els[k].textContent = localize(els[k].dataset.v); });
    });
  });

  /* ---------- Music (song file if set in config, else built-in melody) ---------- */
  var mBtn = $("#musicBtn"), audio = $("#bgAudio"), useFile = !!W.musicSrc;
  if (useFile) audio.src = W.musicSrc;
  function isPlaying() { return useFile ? !audio.paused : (window.WeddingMusic && window.WeddingMusic.playing); }
  function updateMusicLabel() {
    if (!mBtn) return;
    mBtn.setAttribute("aria-label", isPlaying() ? t("music_pause") : t("music_play"));
    mBtn.setAttribute("aria-pressed", String(!!isPlaying()));
    mBtn.classList.toggle("playing", !!isPlaying());
  }
  function musicOn() {
    if (useFile) { audio.play().then(updateMusicLabel).catch(function () {}); }
    else if (window.WeddingMusic) { window.WeddingMusic.start(); }
    updateMusicLabel();
  }
  function musicOff() {
    if (useFile) audio.pause(); else if (window.WeddingMusic) window.WeddingMusic.stop();
    updateMusicLabel();
  }
  if (mBtn) {
    if (!useFile && !(window.WeddingMusic && window.WeddingMusic.supported)) mBtn.hidden = true;
    mBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      if (isPlaying()) musicOff(); else musicOn();
    });
  }

  /* ---------- Init ---------- */
  var saved = "en";
  try { saved = localStorage.getItem("wedding-lang") || "en"; } catch (e) {}
  applyLang(saved === "mr" ? "mr" : "en");

  /* ---------- Gate welcome screen ---------- */
  var gate     = $("#welcomeGate");
  var gateBtn  = $("#gateBtn");
  var gateContent = $(".gate-content");
  var gatePetals  = $("#gatePetals");
  var gateOpened  = false;

  // Spawn falling rose petals inside the gate
  if (gatePetals && !reduceMotion) {
    var GATE_ROSE = ["#c0183a","#e8527a","#f4a0b8","#d4507a","#ff8fab","#ffc2d4","#8b0e26"];
    var petalCount = window.innerWidth < 600 ? 16 : 28;
    for (var gp = 0; gp < petalCount; gp++) {
      var ps  = document.createElement("span");
      var pc  = GATE_ROSE[Math.floor(Math.random() * GATE_ROSE.length)];
      var pw  = 8 + Math.random() * 11;
      var br  = Math.random() > 0.5 ? "50% 0 50% 50%" : "0 50% 50% 50%";
      ps.style.cssText =
        "left:"              + (Math.random() * 100)        + "%;" +
        "width:"             + pw                            + "px;" +
        "height:"            + (pw * 0.65)                   + "px;" +
        "background:"        + pc                            + ";" +
        "border-radius:"     + br                            + ";" +
        "opacity:"           + (0.55 + Math.random() * 0.45) + ";" +
        "animation-duration:" + (7 + Math.random() * 9)     + "s;" +
        "animation-delay:-"  + (Math.random() * 14)          + "s";
      gatePetals.appendChild(ps);
    }
  }

  function openGate() {
    if (!gate || gateOpened) return;
    gateOpened = true;

    // start music — this IS the user gesture
    musicOn();

    // hide the text content immediately
    if (gateContent) gateContent.classList.add("hide");

    // STEP 1 — doors slide in from both sides
    gate.classList.add("closing");

    // STEP 2 — after doors fully meet (500ms), swing them open
    setTimeout(function () {
      gate.classList.remove("closing");
      gate.classList.add("opening");

      // flower bursts as doors swing open
      if (window.WeddingFX && !reduceMotion) {
        var w = window.innerWidth, h = window.innerHeight;
        window.WeddingFX.burst(w * 0.2,  h * 0.45);
        window.WeddingFX.burst(w * 0.8,  h * 0.45);
        window.WeddingFX.burst(w * 0.5,  h * 0.5);
      }
    }, 520);

    // STEP 3 — hero page becomes visible (doors are ~halfway open)
    setTimeout(function () {
      document.body.classList.add("ready");
      document.body.classList.add("snap-ready");
      // trigger first section reveal via scroll engine
      if (window.WeddingScroll) window.WeddingScroll.goTo(0);
    }, 900);

    // STEP 4 — fully remove gate overlay
    setTimeout(function () {
      gate.classList.add("done");
    }, 1550);
  }

  if (gateBtn) {
    gateBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      openGate();
    });
    if (reduceMotion) {
      gateOpened = true;
      document.body.classList.add("ready", "snap-ready");
      if (window.WeddingScroll) window.WeddingScroll.goTo(0);
    }
  } else {
    document.body.classList.add("ready", "snap-ready");
    if (window.WeddingScroll) window.WeddingScroll.goTo(0);
  }
})();
