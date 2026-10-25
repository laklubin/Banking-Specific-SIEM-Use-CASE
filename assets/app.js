(function () {
  "use strict";

  var DATA = (window.USE_CASES || []).slice().sort(function (a, b) {
    return a.id.localeCompare(b.id);
  });

  var els = {
    q: document.getElementById("q"),
    sev: document.getElementById("sevSel"),
    cats: document.getElementById("cats"),
    grid: document.getElementById("results"),
    count: document.getElementById("count"),
    empty: document.getElementById("empty"),
    reset: document.getElementById("resetBtn"),
    exportBtn: document.getElementById("exportBtn"),
    themeBtn: document.getElementById("themeBtn")
  };

  var state = { q: "", cat: "", sev: "" };

  /* ---------------------------------------------------------- helpers */
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function highlight(html, term) {
    if (!term) return html;
    var re = new RegExp("(" + term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + ")", "gi");
    return html.replace(re, "<mark>$1</mark>");
  }

  function haystack(u) {
    return (u.id + " " + u.name + " " + u.cat + " " + u.src + " " + u.sev + " " + u.mitre + " " + u.desc + " " + u.log).toLowerCase();
  }

  /* ---------------------------------------------------------- stats */
  function initStats() {
    var cats = {}, srcs = {}, crit = 0;
    DATA.forEach(function (u) {
      cats[u.cat] = (cats[u.cat] || 0) + 1;
      if (u.sev === "Critical" || u.sev === "High") crit++;
      u.src.split(/,\s*/).forEach(function (s) { srcs[s.trim().toLowerCase()] = 1; });
    });
    document.getElementById("statTotal").textContent = DATA.length;
    document.getElementById("statDomains").textContent = Object.keys(cats).length;
    document.getElementById("statCrit").textContent = crit;
    document.getElementById("statSources").textContent = Object.keys(srcs).length;
    return cats;
  }

  /* ---------------------------------------------------------- filters */
  function buildChips(cats) {
    var order = ["Core Banking", "SWIFT", "Payments", "ATM", "Internet Banking",
      "Mobile Banking", "Card Systems", "Database", "Fraud & AML", "Insider & Privileged"];
    Object.keys(cats).forEach(function (c) { if (order.indexOf(c) === -1) order.push(c); });

    var html = '<button class="chip" type="button" data-cat="" aria-pressed="true">All domains <b>' + DATA.length + "</b></button>";
    order.forEach(function (c) {
      if (!cats[c]) return;
      html += '<button class="chip" type="button" data-cat="' + esc(c) + '" aria-pressed="false">' +
        esc(c) + " <b>" + cats[c] + "</b></button>";
    });
    els.cats.innerHTML = html;

    els.cats.addEventListener("click", function (e) {
      var btn = e.target.closest(".chip");
      if (!btn) return;
      state.cat = btn.dataset.cat;
      Array.prototype.forEach.call(els.cats.children, function (c) {
        c.setAttribute("aria-pressed", c === btn ? "true" : "false");
      });
      render();
    });
  }

  function filtered() {
    var term = state.q.trim().toLowerCase();
    return DATA.filter(function (u) {
      if (state.cat && u.cat !== state.cat) return false;
      if (state.sev && u.sev !== state.sev) return false;
      if (term && haystack(u).indexOf(term) === -1) return false;
      return true;
    });
  }

  /* ---------------------------------------------------------- render */
  function card(u, term) {
    return '<article class="uc">' +
      '<div class="uc-head"><div><span class="uc-id">' + esc(u.id) + "</span>" +
      "<h2>" + highlight(esc(u.name), term) + "</h2></div>" +
      '<span class="sev ' + esc(u.sev) + '">' + esc(u.sev) + "</span></div>" +
      '<div class="tags"><span class="tag cat">' + esc(u.cat) + "</span>" +
      '<span class="tag">' + esc(u.mitre) + "</span></div>" +
      '<div class="field"><span class="k">Log source</span>' +
      '<span class="v">' + highlight(esc(u.src), term) + "</span></div>" +
      '<div class="field"><span class="k">Description</span>' +
      '<p class="desc">' + highlight(esc(u.desc), term) + "</p></div>" +
      '<details class="log"><summary>Sample log</summary>' +
      '<div class="logbox"><button class="copy" type="button">Copy</button>' +
      "<pre>" + highlight(esc(u.log), term) + "</pre></div></details>" +
      "</article>";
  }

  function render() {
    var list = filtered();
    var term = state.q.trim();
    els.grid.innerHTML = list.map(function (u) { return card(u, term); }).join("");
    els.empty.hidden = list.length !== 0;
    els.count.textContent = list.length === DATA.length
      ? "Showing all " + DATA.length + " use cases"
      : "Showing " + list.length + " of " + DATA.length + " use cases";
  }

  /* ---------------------------------------------------------- actions */
  function toCSV(rows) {
    var head = ["ID", "Use Case Name", "Domain", "Log Source", "Severity", "MITRE ATT&CK", "Description", "Sample Log"];
    var q = function (v) { return '"' + String(v).replace(/"/g, '""') + '"'; };
    return [head.map(q).join(",")].concat(rows.map(function (u) {
      return [u.id, u.name, u.cat, u.src, u.sev, u.mitre, u.desc, u.log].map(q).join(",");
    })).join("\r\n");
  }

  function wire() {
    var t;
    els.q.addEventListener("input", function () {
      clearTimeout(t);
      t = setTimeout(function () { state.q = els.q.value; render(); }, 120);
    });

    els.sev.addEventListener("change", function () { state.sev = els.sev.value; render(); });

    els.reset.addEventListener("click", function () {
      state = { q: "", cat: "", sev: "" };
      els.q.value = ""; els.sev.value = "";
      Array.prototype.forEach.call(els.cats.children, function (c, i) {
        c.setAttribute("aria-pressed", i === 0 ? "true" : "false");
      });
      render();
    });

    els.grid.addEventListener("click", function (e) {
      var btn = e.target.closest(".copy");
      if (!btn) return;
      var pre = btn.parentNode.querySelector("pre");
      var done = function () { btn.textContent = "Copied"; setTimeout(function () { btn.textContent = "Copy"; }, 1400); };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(pre.textContent).then(done, function () { btn.textContent = "Press Ctrl+C"; });
      } else {
        var r = document.createRange(); r.selectNodeContents(pre);
        var sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(r);
        try { document.execCommand("copy"); done(); } catch (err) { btn.textContent = "Press Ctrl+C"; }
      }
    });

    els.exportBtn.addEventListener("click", function () {
      var blob = new Blob(["﻿" + toCSV(filtered())], { type: "text/csv;charset=utf-8" });
      var a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "banking-siem-use-cases.csv";
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      setTimeout(function () { URL.revokeObjectURL(a.href); }, 2000);
    });

    els.themeBtn.addEventListener("click", function () {
      var next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
      document.documentElement.dataset.theme = next;
      try { localStorage.setItem("siem-theme", next); } catch (e) {}
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "/" && document.activeElement !== els.q) { e.preventDefault(); els.q.focus(); }
      if (e.key === "Escape" && document.activeElement === els.q) { els.q.blur(); }
    });
  }

  function initTheme() {
    var saved = null;
    try { saved = localStorage.getItem("siem-theme"); } catch (e) {}
    if (!saved && window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches) saved = "light";
    document.documentElement.dataset.theme = saved || "dark";
  }

  initTheme();
  buildChips(initStats());
  wire();
  render();
})();
