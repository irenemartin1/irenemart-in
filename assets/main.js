/* Irene Martin — portfolio interactions. No dependencies. */
(function () {
  "use strict";
  document.documentElement.classList.add("js");
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  /* ---------- Year ---------- */
  $$("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* ---------- Mobile nav ---------- */
  var toggle = $(".nav__toggle"), list = $("#nav-list");
  if (toggle && list) {
    toggle.addEventListener("click", function () {
      var open = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!open));
      list.classList.toggle("is-open", !open);
    });
    list.addEventListener("click", function (e) {
      if (e.target.closest("a")) { toggle.setAttribute("aria-expanded", "false"); list.classList.remove("is-open"); }
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && list.classList.contains("is-open")) {
        toggle.setAttribute("aria-expanded", "false"); list.classList.remove("is-open"); toggle.focus();
      }
    });
  }

  /* ---------- Move focus to anchor targets for keyboard / screen-reader users ---------- */
  document.addEventListener("click", function (e) {
    var a = e.target.closest('a[href^="#"]');
    if (!a) return;
    var id = a.getAttribute("href").slice(1);
    var target = id ? document.getElementById(id) : null;
    if (!target) return;
    if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
    setTimeout(function () { target.focus({ preventScroll: true }); }, reduceMotion ? 0 : 400);
  });

  /* ---------- Reveal on scroll + active nav ---------- */
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("is-visible"); io.unobserve(en.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    $$(".reveal").forEach(function (el) { io.observe(el); });

    var navLinks = $$(".nav__list a");
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        navLinks.forEach(function (l) {
          var on = l.getAttribute("href") === "#" + en.target.id;
          if (on) l.setAttribute("aria-current", "true"); else l.removeAttribute("aria-current");
        });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    ["systems", "cases", "capabilities", "troubleshooting", "operations", "contact"].forEach(function (id) {
      var s = document.getElementById(id); if (s) spy.observe(s);
    });
  } else {
    $$(".reveal").forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---------- Generic pressed-button group ---------- */
  function pressGroup(buttons, active) {
    buttons.forEach(function (b) { b.setAttribute("aria-pressed", String(b === active)); });
  }

  /* ---------- B: system layers ---------- */
  var LAYERS = {
    user: { t: "L1 · User", dep: "A working device, browser and network connection, and an account that exists.", fail: "Outdated browser, cached session, Wi-Fi or VPN issue, wrong account, unclear instructions.", q: "Is it just this person, or everyone doing the same task?" },
    identity: { t: "L2 · Identity & access", dep: "The sign-in provider, the user’s account status, and the roles or groups that grant permissions.", fail: "Disabled or locked account, expired credentials, misconfigured sign-in, missing or excessive role.", q: "Can they sign in — and once in, are they allowed to do this specific thing?" },
    app: { t: "L3 · Application", dep: "Hosting, configuration, environment settings, the current release, and the domain/DNS that points to it.", fail: "A recent release or config change, an expired certificate, DNS misconfiguration, a service outage.", q: "What changed recently, and does the problem start at the same time?" },
    data: { t: "L4 · Database / integrations", dep: "The database, its access rules, and every external service the workflow calls.", fail: "Access rules blocking legitimate reads, bad or missing records, an integration that is down or rejecting requests.", q: "Is the data there and readable by this role? Is the external service responding?" },
    outcome: { t: "L5 · Operational outcome", dep: "Every layer above, working together for the person doing the work.", fail: "Everything is “up”, but the task still can’t be completed — the most important failure to notice.", q: "Can the affected person now actually finish their work?" }
  };
  var layerWrap = $("[data-layers]");
  if (layerWrap) {
    var layerBtns = $$(".layer", layerWrap), panel = $("[data-layer-panel]", layerWrap);
    layerBtns.forEach(function (b) {
      b.addEventListener("click", function () {
        var d = LAYERS[b.dataset.layer];
        pressGroup(layerBtns, b);
        panel.innerHTML = '<div class="lp"><h3 class="lp__title">' + esc(d.t) + '</h3><div class="lp__cols">' +
          '<div><p class="lp__k mono">Depends on</p><p>' + esc(d.dep) + "</p></div>" +
          '<div><p class="lp__k mono">Can fail as</p><p>' + esc(d.fail) + "</p></div>" +
          '<div><p class="lp__k mono">First question</p><p>' + esc(d.q) + "</p></div></div></div>";
      });
    });
  }

  /* ---------- C1: architecture roles ---------- */
  var ROLES = {
    admin: { sees: "The whole operation: loads, drivers, customers and status across the business.", does: "Manages users and roles, oversees dispatch, reviews operational status.", not: "Bypass sign-in — even full access is tied to a named, individual account." },
    dispatch: { sees: "Open and active loads, driver assignments and live status.", does: "Reviews requests, assigns drivers, updates and follows up on loads.", not: "Change user roles or company-level settings." },
    driver: { sees: "Only the loads assigned to them, on a phone-friendly view.", does: "Accepts assignments and records status as the load moves.", not: "See other drivers’ work, customer accounts or business-wide data." },
    customer: { sees: "Only their own shipments and the current status of each.", does: "Submits requests and follows progress.", not: "See other customers, drivers’ details or internal operations." }
  };
  var arch = $("[data-arch]");
  if (arch) {
    var roleBtns = $$(".seg button", arch), detail = $("[data-arch-detail]", arch);
    var setRole = function (role) {
      var r = ROLES[role];
      $$("[data-node]", arch).forEach(function (n) {
        n.classList.toggle("is-on", n.dataset.node === role || n.dataset.node === "views");
      });
      detail.innerHTML =
        '<div><p class="lp__k mono">Sees</p><p>' + esc(r.sees) + "</p></div>" +
        '<div><p class="lp__k mono">Can do</p><p>' + esc(r.does) + "</p></div>" +
        '<div><p class="lp__k mono">Cannot</p><p>' + esc(r.not) + "</p></div>";
    };
    roleBtns.forEach(function (b) {
      b.addEventListener("click", function () { pressGroup(roleBtns, b); setRole(b.dataset.role); });
    });
    setRole("admin");
  }

  /* ---------- C2: booking pipeline ---------- */
  var STAGES = [
    { side: "Customer side", t: "Discover", d: "Clear service information so the customer knows what is offered — and what the business needs from them — before asking." },
    { side: "Customer side", t: "Request", d: "The booking form collects the service and dates in a structured way, so nothing has to be reconstructed from a message thread." },
    { side: "Customer side", t: "Logistics", d: "Pickup and drop-off requirements are captured with the booking, because they decide whether the service can actually be delivered." },
    { side: "Business side", t: "Admin review", d: "The request arrives in the admin portal as one complete record the owner can review, confirm and manage." },
    { side: "Business side", t: "Service", d: "The booking carries a clear status through delivery, so the owner always knows what is pending, confirmed and done." }
  ];
  var pipe = $("[data-pipe]");
  if (pipe) {
    var stageBtns = $$(".pipe__track button", pipe), pd = $("[data-pipe-detail]", pipe);
    var setStage = function (i) {
      var s = STAGES[i];
      $$(".pipe__track li", pipe).forEach(function (li, j) { li.classList.toggle("is-past", j < i); });
      pd.innerHTML = '<p class="lp__k mono">' + esc(s.side) + " · stage " + (i + 1) + " of 5</p><p><b>" + esc(s.t) + ".</b> " + esc(s.d) + "</p>";
    };
    stageBtns.forEach(function (b) {
      b.addEventListener("click", function () { pressGroup(stageBtns, b); setStage(+b.dataset.stage); });
    });
    setStage(0);
  }

  /* ---------- E: troubleshooting walkthrough ---------- */
  var N = {
    scope: {
      step: 1, label: "Scope",
      q: "How far does the problem reach?",
      body: ["Before touching anything, establish scope. One user, several users of one application, or the whole environment are three different investigations."],
      checks: ["How many users?", "Which application(s)?", "Same location or network?", "When did it start?"],
      choices: [
        { t: "Only one user is affected", s: "Others doing the same task are fine", to: "one", trail: "Scope: one user" },
        { t: "Several users, one application", s: "Other systems work normally", to: "symptom", trail: "Scope: several users, one app" },
        { t: "Many users, several systems", s: "Looks environment-wide", to: "env", trail: "Scope: environment-wide" }
      ]
    },
    one: {
      step: 3, label: "Layers",
      q: "Investigate that user’s access and configuration.",
      body: ["A single affected user usually points to something specific to them — their account, their role, or their device — not the shared service."],
      checks: ["Account active, not locked", "Password / MFA status", "Role or group membership", "Different browser or device", "Can they reach other apps?"],
      choices: [
        { t: "Their account or role is wrong", s: "e.g. role removed after a change", to: "hRole", trail: "Evidence: account/role issue" },
        { t: "It works on another device", s: "Device, browser or local network", to: "hDevice", trail: "Evidence: device-specific" }
      ]
    },
    env: {
      step: 1, label: "Scope",
      q: "Widespread impact — assess and escalate first.",
      body: ["When many people and systems are affected, the first job is impact: what work has stopped, and who needs to know. In a larger team, this is where I follow the escalation path rather than working alone."],
      alert: "<b>Production risk.</b> Notify the right people early, open an incident record, and give users an honest status update — even if it’s only “we’re investigating.”",
      checks: ["Who and what is impacted", "Escalation contact notified", "Status message to users", "Shared dependencies: network, DNS, sign-in provider"],
      choices: [
        { t: "Sites won’t resolve or connect", s: "Network or DNS layer", to: "hNetwork", trail: "Evidence: network/DNS" },
        { t: "Apps load, but nobody can sign in anywhere", s: "Shared identity provider", to: "hIdp", trail: "Evidence: sign-in provider" }
      ]
    },
    symptom: {
      step: 2, label: "Symptoms",
      q: "What exactly do the affected users see?",
      body: ["Collect the exact error message, the time it started, and what changed recently. The symptom tells you which layer to check first."],
      checks: ["Exact error text / screenshot", "First report time", "Recent releases or config changes", "Common factor between users"],
      choices: [
        { t: "The application doesn’t load", s: "Timeout, error page or unreachable", to: "reach", trail: "Symptom: unreachable" },
        { t: "It loads, but login fails", s: "Error at or after sign-in", to: "auth", trail: "Symptom: login fails" },
        { t: "Login works, but actions fail or data is missing", s: "Specific features or records", to: "perm", trail: "Symptom: actions/data fail" }
      ]
    },
    reach: {
      step: 3, label: "Layers",
      q: "Check reachability and service health.",
      body: ["If the application can’t be reached, check the path to it before the application itself."],
      checks: ["DNS resolves correctly", "Certificate valid", "Hosting / service status", "Recent deployment or config change", "Relevant logs"],
      choices: [
        { t: "A change went out just before reports started", s: "Release, DNS or config", to: "hChange", trail: "Evidence: recent change" },
        { t: "No recent change; the service is unhealthy", s: "Hosting or provider issue", to: "hService", trail: "Evidence: service unhealthy" }
      ]
    },
    auth: {
      step: 3, label: "Layers",
      q: "Application reachable, login failing — investigate authentication and authorization.",
      body: ["Separate the two questions: can the system confirm who they are (authentication), and is that identity allowed in (authorization)?"],
      checks: ["Error at provider or in app?", "Sign-in configuration / redirect URLs", "Expired secrets or certificates", "Account status for affected users", "Recent auth-related change"],
      choices: [
        { t: "Auth settings were changed recently", s: "Configuration drift", to: "hAuthChange", trail: "Evidence: auth config changed" },
        { t: "A credential or secret has expired", s: "Fails for everyone using that path", to: "hExpired", trail: "Evidence: expired credential" }
      ]
    },
    perm: {
      step: 3, label: "Layers",
      q: "Signed in, but blocked — check permissions, data and integrations.",
      body: ["The user is who they say they are. Now the question is what they are allowed to read and change, and whether the services behind the feature respond."],
      checks: ["Affected users’ roles", "Access rules on the data", "Integration / API responses", "Application logs for denied requests"],
      choices: [
        { t: "All affected users share one role", s: "Role or policy problem", to: "hRole", trail: "Evidence: shared role" },
        { t: "Only features using one external service fail", s: "Integration problem", to: "hIntegration", trail: "Evidence: integration failing" }
      ]
    },
    /* hypotheses (step 4) */
    hRole: { step: 4, label: "Hypothesis", hyp: "The role or access rule no longer grants what these users need.", test: "Compare an affected user’s role with a working user’s, and review recent permission changes.", change: "Restore the correct role or rule — granting only what the job requires, not broader access to make the error go away.", back: "perm" },
    hDevice: { step: 4, label: "Hypothesis", hyp: "Something local to the user’s device or browser is interfering.", test: "Have the user try a private window or another device on the same account.", change: "Clear the affected session or cache, or update the browser — then confirm on their usual device.", back: "one" },
    hNetwork: { step: 4, label: "Hypothesis", hyp: "A shared network or DNS dependency is failing.", test: "Test name resolution and connectivity from more than one location.", change: "Coordinate the fix with whoever owns that layer; if a recent DNS change caused it, revert to the last known-good record.", back: "env" },
    hIdp: { step: 4, label: "Hypothesis", hyp: "The shared sign-in provider is down or misconfigured.", test: "Check the provider’s status and try a sign-in with a test account.", change: "If it’s an outage, communicate and wait or fail over per policy; if it’s config, revert the last change.", back: "env" },
    hChange: { step: 4, label: "Hypothesis", hyp: "The recent release or configuration change made the application unreachable.", test: "Line up the change time with the first report, then reproduce in a safe environment if possible.", change: "Roll back to the last known-good version using version history, rather than patching forward under pressure.", back: "symptom" },
    hAuthChange: { step: 4, label: "Hypothesis", hyp: "The recent sign-in configuration change broke login.", test: "Compare the current sign-in settings (redirect URLs, allowed domains, client settings) with the last known-good configuration.", change: "Restore the previous configuration from the change record, then re-apply the intended change correctly and test it with a non-admin account.", back: "auth" },
    hService: { step: 4, label: "Hypothesis", hyp: "The hosting service or provider is degraded.", test: "Check provider status and the application’s health and error logs.", change: "Restart or redeploy only if it is safe and documented; otherwise escalate to the provider and keep users informed.", back: "reach" },
    hExpired: { step: 4, label: "Hypothesis", hyp: "An expired secret or certificate is breaking sign-in.", test: "Check expiry dates on the credentials the sign-in flow uses.", change: "Rotate the credential through the proper process and store it securely — never paste it into a ticket or chat.", back: "auth" },
    hIntegration: { step: 4, label: "Hypothesis", hyp: "One external integration is failing or rejecting requests.", test: "Check that service’s status and the error responses in the logs.", change: "Fix the configuration if it’s ours; if it’s theirs, contact the vendor and tell users which features are affected.", back: "perm" },
    change: {
      step: 5, label: "Change",
      q: "Make one controlled change.",
      choices: [
        { t: "Change touches production during working hours", s: "Higher user impact", to: "verify", trail: "Change: scheduled & communicated", note: "Communicated before changing; escalation path confirmed." },
        { t: "Low-risk change, easily reversed", s: "Rollback ready", to: "verify", trail: "Change: low-risk, rollback ready", note: "Low-risk change with rollback ready." }
      ]
    },
    verify: {
      step: 6, label: "Verify",
      q: "Did it work — for the people who reported it?",
      body: ["“Fixed” means the affected users can complete their task, confirmed with them, and that no other role or workflow broke in the process."],
      checks: ["Affected user confirms", "Other roles still work", "Logs are clean", "No new related reports"],
      choices: [
        { t: "Yes — users confirm it works", s: "Close out properly", to: "doc", trail: "Verified with users" },
        { t: "No — the problem remains", s: "Undo the change and go back", to: "BACK", trail: "Not fixed — rolled back" }
      ]
    },
    doc: { step: 7, label: "Document" }
  };

  var ts = $("[data-ts]");
  if (ts) {
    var card = $("[data-ts-card]", ts), trailEl = $("[data-ts-trail]", ts);
    var backBtn = $("[data-ts-back]", ts), resetBtn = $("[data-ts-reset]", ts);
    var rail = $$(".ts__rail li", ts);
    var history = [], current = "scope", ctx = {};

    var checksHtml = function (arr) {
      return arr ? '<ul class="ts__checks">' + arr.map(function (c) { return "<li>" + esc(c) + "</li>"; }).join("") + "</ul>" : "";
    };
    var choicesHtml = function (arr) {
      return '<div class="ts__choices" role="group" aria-label="Choose what the evidence shows">' + arr.map(function (c, i) {
        return '<button type="button" class="ts__choice" data-i="' + i + '"><span class="mono">' + String.fromCharCode(65 + i) + "</span><span>" + esc(c.t) + (c.s ? "<small>" + esc(c.s) + "</small>" : "") + "</span></button>";
      }).join("") + "</div>";
    };

    var render = function (focus) {
      var n = N[current], html = "";
      if (n.hyp) {
        ctx.hyp = n; ctx.backTo = n.back;
        html = '<p class="ts__step">Step 4 · Hypothesis &amp; test</p>' +
          '<h3 class="ts__q">' + esc(n.hyp) + "</h3>" +
          '<p class="ts__body"><span class="mono ts__lbl">Test one thing:</span> ' + esc(n.test) + "</p>" +
          '<p class="ts__body">If the test doesn’t support the hypothesis, go back to the evidence rather than changing several things at once.</p>' +
          choicesHtml([{ t: "Test supports the hypothesis", s: "Plan a controlled change", to: "change", trail: "Hypothesis confirmed" }, { t: "Test doesn’t support it", s: "Return to the layer checks", to: "BACK", trail: "Hypothesis rejected" }]);
        n.choices = [{ to: "change", trail: "Hypothesis confirmed" }, { to: "BACK", trail: "Hypothesis rejected" }];
      } else if (current === "change") {
        html = '<p class="ts__step">Step 5 · Controlled change</p><h3 class="ts__q">' + esc(n.q) + "</h3>" +
          '<p class="ts__body">' + esc(ctx.hyp ? ctx.hyp.change : "") + "</p>" +
          '<p class="ts__body">Before changing anything: note the current state, know how to undo it, and consider who is affected while it happens.</p>' +
          choicesHtml(n.choices);
      } else if (current === "doc") {
        var lastReject = -1, ruledOut = [];
        history.forEach(function (h, idx) {
          if (N[h.from] && N[h.from].hyp && h.trail === "Hypothesis rejected") { lastReject = idx; ruledOut.push(N[h.from].hyp); }
          if (h.from === "verify" && h.trail === "Not fixed — rolled back") { lastReject = idx; }
        });
        var path = history.filter(function (h, idx) { return (idx > lastReject || N[h.from].step === 1) && N[h.from] && N[h.from].step <= 3; }).map(function (h) { return h.trail; }).filter(Boolean);
        html = '<p class="ts__step">Step 7 · Document</p><h3 class="ts__q">Write it down so the next person doesn’t start from zero.</h3>' +
          '<p class="ts__body">A short record of cause, fix and follow-up — generated below from the path you took through this illustrative scenario.</p>' +
          '<div class="ts__note"><dl>' +
          '<div><dt>Reported</dt><dd>Several users cannot access an application.</dd></div>' +
          '<div><dt>Scope &amp; evidence</dt><dd>' + esc(path.join(" → ") || "—") + "</dd></div>" +
          (ruledOut.length ? '<div><dt>Ruled out</dt><dd>' + esc(ruledOut.join(" · ")) + "</dd></div>" : "") +
          '<div><dt>Cause</dt><dd>' + esc(ctx.hyp ? ctx.hyp.hyp : "—") + "</dd></div>" +
          '<div><dt>Resolution</dt><dd>' + esc(ctx.hyp ? ctx.hyp.change : "—") + " " + esc(ctx.changeNote || "") + "</dd></div>" +
          "<div><dt>Verified</dt><dd>Confirmed with affected users; other roles and workflows re-checked.</dd></div>" +
          "<div><dt>Follow-up</dt><dd>Prevent recurrence (e.g. review the change process, add a check or expiry reminder) and update the runbook.</dd></div>" +
          "</dl></div>" +
          choicesHtml([{ t: "Run the scenario again with different evidence", to: "RESET" }]);
        n.choices = [{ to: "RESET" }];
      } else {
        html = '<p class="ts__step">Step ' + n.step + " · " + esc(n.label) + "</p>" +
          '<h3 class="ts__q">' + esc(n.q) + "</h3>" +
          (n.body || []).map(function (b) { return '<p class="ts__body">' + esc(b) + "</p>"; }).join("") +
          (n.alert ? '<p class="ts__alert">' + n.alert + "</p>" : "") +
          checksHtml(n.checks) + choicesHtml(n.choices);
      }
      card.innerHTML = '<div class="ts__anim">' + html + "</div>";

      rail.forEach(function (li) {
        var s = +li.dataset.rail;
        li.classList.toggle("is-current", s === n.step);
        li.classList.toggle("is-done", s < n.step);
        if (s === n.step) li.setAttribute("aria-current", "step"); else li.removeAttribute("aria-current");
      });
      trailEl.innerHTML = history.length
        ? history.map(function (h) { return h.trail ? "<li>" + esc(h.trail) + "</li>" : ""; }).join("")
        : '<li>Start: ticket received</li>';
      backBtn.disabled = history.length === 0;

      $$(".ts__choice", card).forEach(function (b) {
        b.addEventListener("click", function () { choose(+b.dataset.i); });
      });
      if (focus) card.focus({ preventScroll: true });
    };

    var choose = function (i) {
      var c = N[current].choices[i];
      if (c.to === "RESET") { reset(true); return; }
      var to = c.to;
      if (to === "BACK") to = ctx.backTo || "symptom";
      if (c.note) ctx.changeNote = c.note;
      history.push({ from: current, trail: c.trail, ctx: JSON.parse(JSON.stringify({ backTo: ctx.backTo, changeNote: ctx.changeNote })), hyp: ctx.hyp });
      current = to;
      render(true);
    };

    var reset = function (focus) { history = []; current = "scope"; ctx = {}; render(focus); };

    backBtn.addEventListener("click", function () {
      var h = history.pop();
      if (!h) return;
      current = h.from; ctx = { backTo: h.ctx.backTo, changeNote: h.ctx.changeNote, hyp: h.hyp };
      render(true);
    });
    resetBtn.addEventListener("click", function () { reset(true); });
    render(false);
  }
})();
