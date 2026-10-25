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

  /* Only show the "swipe" hint when a gallery actually scrolls */
  var galleries = Array.prototype.slice.call(document.querySelectorAll(".gallery"));
  var checkGalleries = function () {
    galleries.forEach(function (g) {
      var row = g.querySelector(".gallery__row");
      g.classList.toggle("is-static", row.scrollWidth <= row.clientWidth + 1);
    });
  };
  checkGalleries();
  window.addEventListener("resize", checkGalleries);
  window.addEventListener("load", checkGalleries);

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
  ["hero", "why", "work", "contact"].forEach(function (id) {
    var s = document.getElementById(id);
    if (s) spy.observe(s);
  });
})();
