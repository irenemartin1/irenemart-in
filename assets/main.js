/* Irene Martin — site interactions. No dependencies. */
(function () {
  "use strict";
  var root = document.documentElement;
  root.classList.add("js");
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function press(btns, on) { btns.forEach(function (b) { b.setAttribute("aria-pressed", String(b === on)); }); }

  $$("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* Anchor links: move focus to the target for keyboard and screen-reader users */
  document.addEventListener("click", function (e) {
    var a = e.target.closest('a[href^="#"]');
    if (!a) return;
    var t = document.getElementById(a.getAttribute("href").slice(1));
    if (!t) return;
    if (!t.hasAttribute("tabindex")) t.setAttribute("tabindex", "-1");
    setTimeout(function () { t.focus({ preventScroll: true }); }, reduceMotion ? 0 : 400);
  });

  /* Gentle reveal + current-section nav */
  $$(".project, .figure, .ts, .exp, .contact, .closing").forEach(function (el) { el.classList.add("reveal"); });
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("is-visible"); io.unobserve(en.target); } });
    }, { rootMargin: "0px 0px -6% 0px", threshold: 0.05 });
    $$(".reveal").forEach(function (el) { io.observe(el); });

    var links = $$(".nav a");
    var spy = new IntersectionObserver(function (es) {
      es.forEach(function (en) {
        if (!en.isIntersecting) return;
        links.forEach(function (l) {
          if (l.getAttribute("href") === "#" + en.target.id) l.setAttribute("aria-current", "true"); else l.removeAttribute("aria-current");
        });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    ["work", "approach", "experience", "contact"].forEach(function (id) { var s = document.getElementById(id); if (s) spy.observe(s); });
  } else {
    $$(".reveal").forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* M.D. Sky OS — role view */
  var ROLES = {
    admin: ["Owner", "sees the whole operation — loads, drivers, customers and status — and manages who has which role."],
    dispatch: ["Dispatcher", "sees open and active loads, assigns drivers and follows up. Cannot change roles or company settings."],
    driver: ["Driver", "sees only the loads assigned to them, on a phone, and records status as each load moves."],
    customer: ["Customer", "sees only their own shipments and where each one stands — nothing about other customers or internal work."]
  };
  var arch = $("[data-arch]");
  if (arch) {
    var rb = $$(".seg button", arch), rd = $("[data-arch-detail]", arch);
    var setRole = function (k) {
      $$("[data-node]", arch).forEach(function (n) { n.classList.toggle("is-on", n.dataset.node === k); });
      rd.innerHTML = "<b>" + esc(ROLES[k][0]) + "</b> " + esc(ROLES[k][1]);
    };
    rb.forEach(function (b) { b.addEventListener("click", function () { press(rb, b); setRole(b.dataset.role); }); });
    setRole("admin");
  }

  /* My Sweet Pawtner — booking flow */
  var STAGES = [
    ["Service info", "Customers see what’s offered and what the business will need from them before they ask."],
    ["Booking", "Service and dates are collected in a structured form instead of a message thread."],
    ["Pickup & drop-off", "Transport details are captured with the booking, because they decide whether the service can happen."],
    ["Admin portal", "The request arrives as one complete record the owner can review, confirm and manage."]
  ];
  var pipe = $("[data-pipe]");
  if (pipe) {
    var pb = $$(".pipe button", pipe), pd = $("[data-pipe-detail]", pipe);
    var setStage = function (i) { pd.innerHTML = "<b>" + esc(STAGES[i][0]) + ".</b> " + esc(STAGES[i][1]); };
    pb.forEach(function (b) { b.addEventListener("click", function () { press(pb, b); setStage(+b.dataset.stage); }); });
    setStage(0);
  }

  /* Troubleshooting walkthrough — Scope → Investigate → Test → Resolve → Verify */
  var N = {
    scope: { stage: 1, q: "First: how far does it reach?",
      body: "One person, several people on one application, or everything at once — each is a different investigation.",
      choices: [
        { t: "Just one user", s: "Colleagues on the same app are fine", to: "one" },
        { t: "Several users, one application", s: "Everything else works", to: "several" },
        { t: "Many users, several systems", s: "Looks environment-wide", to: "wide" }
      ] },
    one: { stage: 2, q: "Look at what’s specific to that person.",
      body: "When only one person is affected, the shared service is usually fine — the difference is in their account or their device.",
      checks: "Account active and unlocked · password and MFA · role or group membership · another browser or device",
      choices: [
        { t: "Their role changed recently", to: "hRole" },
        { t: "It works on another device", to: "hDevice" }
      ] },
    several: { stage: 2, q: "What exactly do they see?",
      body: "Collect the error text, when it started, and what changed around that time. The symptom points to the layer.",
      checks: "Exact error message · first report time · recent releases or settings changes · what the affected users share",
      choices: [
        { t: "The app loads, but sign-in fails", s: "Authentication or authorization", to: "hAuth" },
        { t: "The app won’t load at all", s: "Connectivity, DNS or hosting", to: "hReach" }
      ] },
    wide: { stage: 2, q: "Assess impact and escalate before digging in.",
      body: "When many systems fail together, the cause is usually something they share — network, DNS or the sign-in provider.",
      alert: "Notify the right people early and tell users honestly what’s known. In a larger team, I follow the established escalation path.",
      checks: "What work has stopped · who has been told · status of shared network, DNS and sign-in",
      choices: [
        { t: "Names won’t resolve or connections time out", to: "hNetwork" },
        { t: "Systems load, but no one can sign in anywhere", to: "hIdp" }
      ] },

    hRole: { stage: 3, hyp: "Their role no longer grants what the job needs.", test: "Compare their role with a colleague who can get in, and check the change history.", fix: "Restore the correct role — only what the job requires, not broader access to make the error go away.", back: "one" },
    hDevice: { stage: 3, hyp: "Something local to their browser or device is interfering.", test: "Have them try a private window or a second device on the same account.", fix: "Clear the stale session or update the browser, then confirm on their usual device.", back: "one" },
    hAuth: { stage: 3, hyp: "A recent sign-in setting change — or an expired credential — is rejecting logins.", test: "Compare current sign-in settings with the last known-good version and check credential expiry dates.", fix: "Restore the previous setting or rotate the expired credential through the proper process, then test with a non-admin account.", back: "several" },
    hReach: { stage: 3, hyp: "A release or DNS change just before the first report made it unreachable.", test: "Line up the change time with the first report; check DNS resolution and the hosting status.", fix: "Roll back to the last known-good version from version history rather than patching forward under pressure.", back: "several" },
    hNetwork: { stage: 3, hyp: "A shared network or DNS dependency is failing.", test: "Test name resolution and connectivity from more than one location.", fix: "Work with whoever owns that layer; if a DNS change caused it, restore the previous record.", back: "wide" },
    hIdp: { stage: 3, hyp: "The shared sign-in provider is down or misconfigured.", test: "Check the provider’s status page and try a test account.", fix: "If it’s an outage, keep users informed and follow the documented fallback; if it’s configuration, revert the last change.", back: "wide" },

    resolve: { stage: 4 },
    verify: { stage: 5 },
    done: { stage: 5 }
  };

  var ts = $("[data-ts]");
  if (ts) {
    var card = $("[data-ts-card]", ts), backBtn = $("[data-ts-back]", ts), resetBtn = $("[data-ts-reset]", ts), rail = $$(".ts__rail li", ts);
    var hist = [], cur = "scope", hyp = null, ruled = [];

    var choicesHtml = function (arr) {
      return '<div class="ts__choices" role="group" aria-label="What does the evidence show?">' + arr.map(function (c, i) {
        return '<button type="button" class="ts__choice" data-i="' + i + '">' + esc(c.t) + (c.s ? "<small>" + esc(c.s) + "</small>" : "") + "</button>";
      }).join("") + "</div>";
    };

    var view = function () {
      var n = N[cur];
      if (n.hyp) {
        hyp = n;
        n.choices = [{ t: "The test confirms it", to: "resolve" }, { t: "It doesn’t — back to the evidence", to: n.back, reject: true }];
        return '<h3 class="ts__q">' + esc(n.hyp) + '</h3><p class="ts__body"><b>Test one thing:</b> ' + esc(n.test) + "</p>" + choicesHtml(n.choices);
      }
      if (cur === "resolve") {
        n.choices = [{ t: "Make the change", s: "Current state noted, rollback ready", to: "verify" }];
        return '<h3 class="ts__q">Make one controlled change.</h3><p class="ts__body">' + esc(hyp.fix) + '</p><p class="ts__body">Before it happens: note the current state, know how to undo it, and tell the people it affects.</p>' + choicesHtml(n.choices);
      }
      if (cur === "verify") {
        n.choices = [{ t: "Yes — confirmed by the people who reported it", to: "done" }, { t: "No — undo the change", s: "Return to the evidence", to: hyp.back, reject: true }];
        return '<h3 class="ts__q">Does it work for the people who reported it?</h3><p class="ts__body">Fixed means they can finish their work — and that no other role or workflow broke along the way.</p>' + choicesHtml(n.choices);
      }
      if (cur === "done") {
        n.choices = [{ t: "Try a different path", to: "RESET" }];
        return '<h3 class="ts__q">Closed — and written down.</h3><p class="ts__body">A short record so the next person doesn’t start from zero:</p>' +
          '<dl class="ts__note">' +
          "<div><dt>Cause</dt><dd>" + esc(hyp.hyp) + "</dd></div>" +
          (ruled.length ? "<div><dt>Ruled out</dt><dd>" + esc(ruled.join(" · ")) + "</dd></div>" : "") +
          "<div><dt>Fix</dt><dd>" + esc(hyp.fix) + "</dd></div>" +
          "<div><dt>Verified</dt><dd>Confirmed with the affected users; other roles re-checked.</dd></div>" +
          "<div><dt>Follow-up</dt><dd>Prevent a repeat — a review step, an expiry reminder, an updated runbook.</dd></div>" +
          "</dl>" + choicesHtml(n.choices);
      }
      return '<h3 class="ts__q">' + esc(n.q) + '</h3><p class="ts__body">' + esc(n.body) + "</p>" +
        (n.alert ? '<p class="ts__alert">' + esc(n.alert) + "</p>" : "") +
        (n.checks ? '<p class="ts__checks"><b>Check:</b> ' + esc(n.checks) + "</p>" : "") + choicesHtml(n.choices);
    };

    var render = function (focus) {
      card.innerHTML = '<div class="ts__in">' + view() + "</div>";
      var st = N[cur].stage;
      rail.forEach(function (li) {
        var s = +li.dataset.rail;
        li.classList.toggle("is-current", s === st);
        li.classList.toggle("is-done", s < st || cur === "done");
        if (s === st) li.setAttribute("aria-current", "step"); else li.removeAttribute("aria-current");
      });
      backBtn.disabled = hist.length === 0;
      $$(".ts__choice", card).forEach(function (b) { b.addEventListener("click", function () { choose(+b.dataset.i); }); });
      if (focus) card.focus({ preventScroll: true });
    };

    var choose = function (i) {
      var c = N[cur].choices[i];
      if (c.to === "RESET") { reset(); return; }
      hist.push({ cur: cur, hyp: hyp, ruled: ruled.slice() });
      if (c.reject && hyp) ruled.push(hyp.hyp);
      cur = c.to;
      render(true);
    };
    var reset = function () { hist = []; cur = "scope"; hyp = null; ruled = []; render(true); };

    backBtn.addEventListener("click", function () {
      var h = hist.pop(); if (!h) return;
      cur = h.cur; hyp = h.hyp; ruled = h.ruled; render(true);
    });
    resetBtn.addEventListener("click", reset);
    render(false);
  }
})();
