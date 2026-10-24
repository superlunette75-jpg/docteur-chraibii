/* Page logic: language switch, rendering of sections from data.js, motion, booking sheet. */
(function () {
  const $ = s => document.querySelector(s);
  const $$ = s => Array.from(document.querySelectorAll(s));
  const LANG_KEY = "chraibi.lang";

  /* ---------- language ----------
     Each language has its own address (/ = French, /en/, /ar/) so Google can index all three.
     On the home page, a first-time visitor gets the language of their phone when it is
     French, English or Arabic; any other phone language gets English. A language picked
     by hand is remembered and always wins. */
  const PAGE_LANG = document.documentElement.getAttribute("lang") || "fr";
  const BOT = /bot|crawl|spider|slurp|lighthouse|headless|preview|facebookexternalhit|whatsapp|gptbot|claude|perplexity/i;

  function phoneLang() {
    const list = (navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || ""]);
    for (const l of list) {
      const code = String(l).toLowerCase().slice(0, 2);
      if (window.I18N[code]) return code;
    }
    return "en";
  }

  function initialLang() {
    const q = new URLSearchParams(location.search).get("lang");
    if (q && window.I18N[q]) return q;
    let saved = null;
    try { saved = localStorage.getItem(LANG_KEY); } catch (e) {}
    if (saved && window.I18N[saved]) return saved;
    if (location.pathname === "/" && !BOT.test(navigator.userAgent)) return phoneLang();
    return PAGE_LANG;
  }

  function setLang(lang, manual) {
    window.LANG = lang;
    const t = window.I18N[lang];
    if (manual) { try { localStorage.setItem(LANG_KEY, lang); } catch (e) {} }
    let done = [];
    try { done = JSON.parse(localStorage.getItem("chraibi.routine")) || []; } catch (e) {}
    const now = window.Booking.clinicNow();
    window.Render.apply(document, lang, { done, todayIdx: new Date(now.y, now.m, now.d).getDay() });
    document.title = t.seoTitle;
    const md = $('meta[name="description"]');
    if (md) md.setAttribute("content", t.seoDesc);
    // keep the address bar on the page of the chosen language
    const path = window.Render.PATHS[lang];
    if (location.pathname !== path && /^\/(en\/|ar\/)?(index\.html)?$/.test(location.pathname)) {
      try { history.replaceState(history.state, "", path + location.search.replace(/([?&])lang=\w+&?/, "$1").replace(/[?&]$/, "") + location.hash); } catch (e) {}
    }
    bindRoutine();
    renderHours();
    renderHeroDays();
    timerLabel();
    observe();
    if (window.Chat) window.Chat.onLangChange();
    if (bookingWidget && !$("#bookingSheet").hidden) bookingWidget.rerender();
  }

  function bindRoutine() {
    $$("#routine li").forEach(li => {
      const toggle = () => {
        li.classList.toggle("done");
        li.setAttribute("aria-checked", String(li.classList.contains("done")));
        const now = $$("#routine li.done").map(x => +x.dataset.r);
        try { localStorage.setItem("chraibi.routine", JSON.stringify(now)); } catch (e) {}
      };
      li.onclick = toggle;
      li.onkeydown = e => { if (e.key === " " || e.key === "Enter") { e.preventDefault(); toggle(); } };
    });
  }

  function renderHours() {
    const t = window.I18N[window.LANG];
    const now = window.Booking.clinicNow();
    const todayIdx = new Date(now.y, now.m, now.d).getDay();
    $$("#hoursList li").forEach((li, i) => li.classList.toggle("today", [1, 2, 3, 4, 5, 6, 0][i] === todayIdx));

    const st = window.Booking.openState();
    const el = $("#openStatus");
    el.classList.toggle("open", !!st.open);
    if (st.open) el.textContent = `${t.openNow} · ${t.closesAt} ${st.until}`;
    else if (st.at) el.textContent = `${t.closedNow} · ${t.opensAt} ${st.today ? "" : t.days[st.day].toLowerCase() + " "}${st.at}`;
    else el.textContent = t.closedNow;
  }

  function renderHeroDays() {
    const t = window.I18N[window.LANG];
    const list = window.Booking.days().filter(d => d.slots.length).slice(0, 5);
    $("#heroDays").innerHTML = list.map(d => `<span>${d.today ? t.today : t.daysShort[d.date.getDay()]}<b>${d.date.getDate()}</b><i>${d.slots.length}</i></span>`).join("");
  }

  /* ---------- motion ---------- */
  let io;
  function observe() {
    if (!("IntersectionObserver" in window)) { $$(".reveal, .split").forEach(e => e.classList.add("in")); return; }
    if (!io) io = new IntersectionObserver(entries => entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
    }), { rootMargin: "0px 0px -8% 0px", threshold: .08 });
    $$(".reveal:not(.in), .split:not(.in)").forEach(e => io.observe(e));
  }

  let lastY = 0;
  function onScroll() {
    const y = window.scrollY;
    $("#nav").classList.toggle("hide", y > 140 && y > lastY + 4);
    if (y < lastY - 4 || y < 140) $("#nav").classList.remove("hide");
    lastY = y;
  }

  /* ---------- brushing timer ---------- */
  let timerId = null, left = 120;
  function timerLabel() {
    const t = window.I18N[window.LANG];
    $("#timerBtn").textContent = timerId ? t.timerStop : t.timerStart;
    $("#timerZone").textContent = timerId ? t.timerZones[Math.min(3, Math.floor((120 - left) / 30))] : (left === 0 ? "✓" : "");
  }
  function timerTick() {
    const m = Math.floor(left / 60), s = left % 60;
    $("#timerTime").textContent = m + ":" + String(s).padStart(2, "0");
    $("#timerRing").style.strokeDashoffset = String(326.7 * (1 - left / 120));
    timerLabel();
  }
  function toggleTimer() {
    if (timerId) { clearInterval(timerId); timerId = null; left = 120; timerTick(); return; }
    left = 120; timerTick();
    timerId = setInterval(() => {
      left--;
      if (left % 30 === 0 && navigator.vibrate) navigator.vibrate(120);
      if (left <= 0) { clearInterval(timerId); timerId = null; left = 0; timerTick(); toast(window.I18N[window.LANG].timerDone); return; }
      timerTick();
    }, 1000);
    timerTick();
  }

  function toast(msg) {
    const el = $("#toast");
    el.textContent = msg; el.hidden = false;
    clearTimeout(toast.t); toast.t = setTimeout(() => el.hidden = true, 3200);
  }

  /* ---------- booking sheet ---------- */
  let bookingWidget = null;
  function openBooking(service) {
    if (window.Chat) window.Chat.close();
    const sheet = $("#bookingSheet");
    sheet.hidden = false;
    document.body.classList.add("lock");
    bookingWidget = window.Booking.mount($("#bookingMount"), { service: service || null, allowServiceChange: true });
    $("#bookingMount").scrollTop = 0;
    try { if (!history.state || !history.state.sheet) history.pushState({ sheet: 1 }, ""); } catch (e) {}
  }
  function closeBooking() {
    $("#bookingSheet").hidden = true;
    document.body.classList.remove("lock");
  }

  /* ---------- start ---------- */
  document.addEventListener("DOMContentLoaded", () => {
    $("#year").textContent = new Date().getFullYear();
    $$("[data-lang]").forEach(b => b.addEventListener("click", e => { e.preventDefault(); setLang(b.dataset.lang, true); }));
    document.addEventListener("click", e => {
      const b = e.target.closest("[data-open-booking]");
      if (b) { e.preventDefault(); openBooking(b.dataset.openBooking || null); }
    });
    $$("#bookingSheet [data-close]").forEach(b => b.addEventListener("click", () => {
      closeBooking();
      try { if (history.state && history.state.sheet) history.back(); } catch (e) {}
    }));
    window.addEventListener("popstate", () => { if (!$("#bookingSheet").hidden) closeBooking(); });
    document.addEventListener("keydown", e => {
      if (e.key !== "Escape") return;
      if (!$("#bookingSheet").hidden) closeBooking();
      else if (!$("#chat").hidden) window.Chat.close();
    });
    $("#timerBtn").addEventListener("click", toggleTimer);
    window.addEventListener("scroll", onScroll, { passive: true });

    // WhatsApp links carry a short greeting
    const hello = () => window.Booking.waLink(window.I18N[window.LANG].waGeneric);
    ["#qaWhatsApp", "#contactWa", "#dockWa"].forEach(id => $(id).addEventListener("click", function () { this.href = hello(); }));

    // load the map only when it comes close to the screen
    const map = $(".map iframe");
    if ("IntersectionObserver" in window) {
      const mo = new IntersectionObserver(es => { if (es[0].isIntersecting) { map.src = map.dataset.src; mo.disconnect(); } }, { rootMargin: "400px" });
      mo.observe(map);
    } else map.src = map.dataset.src;

    // the phone dock reserves space at the bottom
    const dock = $("#dock");
    const setDock = () => document.body.style.setProperty("--dock-h", getComputedStyle(dock).display === "none" ? "0px" : (dock.offsetHeight + 20) + "px");
    window.addEventListener("resize", setDock);

    setLang(initialLang());
    setDock();
    requestAnimationFrame(() => $$(".hero .reveal, .hero .split").forEach(e => e.classList.add("in")));
    setInterval(() => { renderHours(); renderHeroDays(); }, 60000);

    // deep links: #reserver opens the booking, #assistant opens the chat
    if (location.hash === "#reserver") openBooking();
    if (location.hash === "#assistant") window.Chat.open();

  });
})();
