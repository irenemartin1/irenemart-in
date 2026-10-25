/* Irene Martin — small enhancements only; the page works fully without JavaScript. */
(function () {
  "use strict";
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  Array.prototype.forEach.call(document.querySelectorAll("[data-year]"), function (el) {
    el.textContent = new Date().getFullYear();
  });

  /* Screenshot slots: show a placeholder until the image file exists */
  Array.prototype.forEach.call(document.querySelectorAll("[data-shot] img"), function (img) {
    var miss = function () { img.parentNode.classList.add("is-missing"); };
    if (img.complete && img.naturalWidth === 0) miss();
    img.addEventListener("error", miss);
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
  ["hero", "why", "work", "contact"].forEach(function (id) {
    var s = document.getElementById(id);
    if (s) spy.observe(s);
  });
})();
