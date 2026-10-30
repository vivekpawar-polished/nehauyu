/* ============================================================
   scroll.js — Cinematic full-screen section navigation
   ============================================================ */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var main = document.querySelector("main");
  var sections = Array.prototype.slice.call(document.querySelectorAll("main > section"));
  if (!main || sections.length < 2) return;

  var current = 0;
  var animating = false;
  var DURATION = reduceMotion ? 0 : 900;
  var wheelAccum = 0;
  var wheelLocked = false;
  var wheelTimer = null;
  var lastWheelAt = 0;
  var WHEEL_THRESHOLD = 45;
  var WHEEL_QUIET_PERIOD = 220;
  var touchStartY = 0;
  var touchStartX = 0;
  var touchActive = false;

  var dotNav = document.createElement("nav");
  dotNav.className = "snap-dots";
  dotNav.setAttribute("aria-label", "Section navigation");
  sections.forEach(function (sec, i) {
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "snap-dot" + (i === 0 ? " active" : "");
    btn.setAttribute("aria-label", "Go to section " + (i + 1));
    btn.addEventListener("click", function () { goTo(i); });
    dotNav.appendChild(btn);
  });
  document.body.appendChild(dotNav);

  var petalLayer = document.createElement("div");
  petalLayer.className = "snap-petals";
  petalLayer.setAttribute("aria-hidden", "true");
  main.appendChild(petalLayer);

  function updateDots(idx) {
    Array.prototype.forEach.call(dotNav.querySelectorAll(".snap-dot"), function (dot, i) {
      dot.classList.toggle("active", i === idx);
    });
  }

  function triggerReveal(section) {
    Array.prototype.forEach.call(section.querySelectorAll(".reveal"), function (el, i) {
      el.classList.remove("in");
      window.setTimeout(function () { el.classList.add("in"); }, 100 + i * 70);
    });
    Array.prototype.forEach.call(section.querySelectorAll(".reveal-hero"), function (el) {
      el.style.animationPlayState = "running";
    });
  }

  function triggerPetals() {
    if (reduceMotion) return;
    for (var i = 0; i < 5; i++) {
      var petal = document.createElement("span");
      petal.className = "snap-petal";
      petal.style.left = (12 + Math.random() * 76) + "%";
      petal.style.animationDelay = (i * 45) + "ms";
      petal.style.setProperty("--petal-drift", (Math.random() * 90 - 45) + "px");
      petalLayer.appendChild(petal);
      window.setTimeout(function (node) {
        return function () {
          if (node.parentNode) node.parentNode.removeChild(node);
        };
      }(petal), 1500);
    }
  }

  function setSectionState(next, direction) {
    sections.forEach(function (section) {
      section.classList.remove("sec-active", "sec-exit-up", "sec-exit-down", "sec-enter-up", "sec-enter-down");
    });

    sections[current].classList.add(direction > 0 ? "sec-exit-up" : "sec-exit-down");
    sections[next].classList.add(direction > 0 ? "sec-enter-up" : "sec-enter-down");

    if (reduceMotion) {
      sections[next].classList.remove("sec-enter-up", "sec-enter-down");
      sections[next].classList.add("sec-active");
      triggerReveal(sections[next]);
      return;
    }

    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        sections[next].classList.remove("sec-enter-up", "sec-enter-down");
        sections[next].classList.add("sec-active");
        triggerReveal(sections[next]);
      });
    });
  }

  function goTo(idx) {
    if (!document.body.classList.contains("snap-ready")) return;
    if (animating || idx < 0 || idx >= sections.length) return;
    if (idx === current && sections[current].classList.contains("sec-active")) return;

    var direction = idx > current ? 1 : -1;
    animating = !reduceMotion;
    document.body.classList.add("transitioning");
    window.setTimeout(function () {
      document.body.classList.remove("transitioning");
    }, reduceMotion ? 0 : 500);

    setSectionState(idx, direction);
    triggerPetals();
    updateDots(idx);

    var footer = document.querySelector(".footer");
    if (footer) footer.classList.toggle("footer-visible", idx === sections.length - 1);

    var id = sections[idx].id;
    if (id && history.replaceState) history.replaceState(null, "", "#" + id);

    Array.prototype.forEach.call(document.querySelectorAll("#navLinks a"), function (link) {
      link.classList.toggle("active", link.getAttribute("href") === "#" + id);
    });

    var nav = document.querySelector("#nav");
    if (nav) nav.classList.toggle("solid", idx > 0);

    current = idx;
    sections[current].scrollTop = 0;

    if (!reduceMotion) {
      window.setTimeout(function () {
        animating = false;
        if (Date.now() - lastWheelAt >= WHEEL_QUIET_PERIOD) wheelLocked = false;
      }, DURATION);
    }
  }

  sections.forEach(function (section, i) {
    if (i === 0) section.classList.add("sec-active");
  });

  function armWheelUnlock() {
    window.clearTimeout(wheelTimer);
    wheelTimer = window.setTimeout(function () {
      wheelAccum = 0;
      if (!animating) wheelLocked = false;
    }, WHEEL_QUIET_PERIOD);
  }

  window.addEventListener("wheel", function (event) {
    if (!document.body.classList.contains("snap-ready") || event.ctrlKey || event.deltaY === 0) return;
    event.preventDefault();
    lastWheelAt = Date.now();
    armWheelUnlock();

    if (animating || wheelLocked) return;
    wheelAccum += event.deltaY;
    if (Math.abs(wheelAccum) < WHEEL_THRESHOLD) return;

    var direction = wheelAccum > 0 ? 1 : -1;
    wheelAccum = 0;
    wheelLocked = true;
    goTo(current + direction);
  }, { passive: false });

  window.addEventListener("touchstart", function (event) {
    if (event.touches.length !== 1) {
      touchActive = false;
      return;
    }
    touchActive = true;
    touchStartY = event.touches[0].clientY;
    touchStartX = event.touches[0].clientX;
  }, { passive: true });

  window.addEventListener("touchend", function (event) {
    if (!touchActive || animating || !event.changedTouches.length) return;
    touchActive = false;

    var deltaY = touchStartY - event.changedTouches[0].clientY;
    var deltaX = Math.abs(touchStartX - event.changedTouches[0].clientX);
    if (deltaX > Math.abs(deltaY) * 1.5 || Math.abs(deltaY) < 50) return;
    goTo(current + (deltaY > 0 ? 1 : -1));
  }, { passive: true });

  window.addEventListener("touchcancel", function () { touchActive = false; }, { passive: true });

  document.addEventListener("keydown", function (event) {
    if (animating) return;
    if (event.key === "ArrowDown" || event.key === "PageDown") {
      event.preventDefault();
      goTo(current + 1);
    } else if (event.key === "ArrowUp" || event.key === "PageUp") {
      event.preventDefault();
      goTo(current - 1);
    } else if (event.key === "Home") {
      event.preventDefault();
      goTo(0);
    } else if (event.key === "End") {
      event.preventDefault();
      goTo(sections.length - 1);
    }
  });

  window.WeddingScroll = {
    goTo: goTo,
    getCurrent: function () { return current; }
  };

  window.setTimeout(function () { triggerReveal(sections[0]); }, 300);
})();
