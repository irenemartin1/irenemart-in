/* Irene Martin — small enhancements only; the page works fully without JavaScript. */
(function () {
  "use strict";
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  Array.prototype.forEach.call(document.querySelectorAll("[data-year]"), function (el) {
    el.textContent = new Date().getFullYear();
  });

  /* Screenshot lightbox: native <dialog> gives Esc-to-close and focus containment */
  var box = document.getElementById("lightbox");
  if (box && typeof box.showModal === "function") {
    var big = box.querySelector(".lightbox__img"), opener = null;
    Array.prototype.forEach.call(document.querySelectorAll(".phone__btn"), function (btn) {
      btn.addEventListener("click", function () {
        opener = btn;
        big.src = btn.getAttribute("data-full");
        big.alt = btn.getAttribute("data-alt");
        box.showModal();
        box.querySelector(".lightbox__close").focus();
      });
    });
    box.querySelector(".lightbox__close").addEventListener("click", function () { box.close(); });
    box.addEventListener("keydown", function (e) {
      if (e.key === "Tab") { e.preventDefault(); box.querySelector(".lightbox__close").focus(); }
    });
    box.addEventListener("click", function (e) { if (e.target === box) box.close(); });
    box.addEventListener("close", function () { big.removeAttribute("src"); if (opener) opener.focus(); });
  }

  /* Screenshot rows: counter + prev/next buttons when a row scrolls sideways */
  Array.prototype.forEach.call(document.querySelectorAll(".gallery__row"), function (row) {
    var items = row.querySelectorAll(".phone");
    var label = row.closest("[aria-label]") ? row.closest("[aria-label]").getAttribute("aria-label") : "Screenshots";
    var ctrl = document.createElement("div");
    ctrl.className = "gallery__ctrl";
    ctrl.hidden = true;
    ctrl.innerHTML = '<button type="button" data-dir="-1" aria-label="Previous screenshot">\u2039</button>' +
      '<span class="gallery__count" aria-live="polite"></span>' +
      '<button type="button" data-dir="1" aria-label="Next screenshot">\u203A</button>';
    row.parentNode.insertBefore(ctrl, row.nextSibling);
    var count = ctrl.querySelector(".gallery__count"), prev = ctrl.children[0], next = ctrl.children[2];
    var current = function () {
      var start = row.getBoundingClientRect().left + parseFloat(getComputedStyle(row).scrollPaddingLeft || 0);
      var best = 0, dist = Infinity;
      Array.prototype.forEach.call(items, function (it, i) {
        var d = Math.abs(it.getBoundingClientRect().left - start);
        if (d < dist) { dist = d; best = i; }
      });
      if (row.scrollLeft + row.clientWidth >= row.scrollWidth - 2) best = items.length - 1;
      return best;
    };
    var update = function () {
      var scrollable = row.scrollWidth > row.clientWidth + 24;
      ctrl.hidden = !scrollable;
      if (!scrollable) return;
      var i = current();
      count.textContent = (i + 1) + " / " + items.length;
      prev.disabled = row.scrollLeft <= 1;
      next.disabled = row.scrollLeft + row.clientWidth >= row.scrollWidth - 2;
    };
    ctrl.addEventListener("click", function (e) {
      var btn = e.target.closest("button");
      if (!btn) return;
      var i = Math.max(0, Math.min(items.length - 1, current() + Number(btn.getAttribute("data-dir"))));
      var pad = parseFloat(getComputedStyle(row).scrollPaddingLeft) || 0;
      row.scrollTo({ left: row.scrollLeft + items[i].getBoundingClientRect().left - row.getBoundingClientRect().left - pad, behavior: reduceMotion ? "auto" : "smooth" });
    });
    var raf = 0;
    row.addEventListener("scroll", function () { cancelAnimationFrame(raf); raf = requestAnimationFrame(update); }, { passive: true });
    window.addEventListener("resize", update);
    window.addEventListener("load", update);
    var det = row.closest("details");
    if (det) det.addEventListener("toggle", update);
    update();
  });

  /* In-page links: move keyboard focus to the target section */
  document.addEventListener("click", function (e) {
    var a = e.target.closest('a[href^="#"]');
    if (!a) return;
    var t = document.getElementById(a.getAttribute("href").slice(1));
    if (!t) return;
    if (!t.hasAttribute("tabindex")) t.setAttribute("tabindex", "-1");
    setTimeout(function () { t.focus({ preventScroll: true }); }, reduceMotion ? 0 : 400);
  });

  /* Mark the section currently in view in the nav */
  if (!("IntersectionObserver" in window)) return;
  var links = Array.prototype.slice.call(document.querySelectorAll(".nav a"));
  var spy = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (!en.isIntersecting) return;
      links.forEach(function (l) {
        if (l.getAttribute("href") === "#" + en.target.id) l.setAttribute("aria-current", "true");
        else l.removeAttribute("aria-current");
      });
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  ["hero", "skills", "work", "contact"].forEach(function (id) {
    var s = document.getElementById(id);
    if (s) spy.observe(s);
  });
})();
