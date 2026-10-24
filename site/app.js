/* Page logic: language switch, rendering of sections from data.js, motion, booking sheet. */
(function () {
  const C = window.CLINIC;
  const $ = s => document.querySelector(s);
  const $$ = s => Array.from(document.querySelectorAll(s));
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const LANG_KEY = "chraibi.lang";

  /* ---------- language ---------- */
  function initialLang() {
    const q = new URLSearchParams(location.search).get("lang");
    if (q && window.I18N[q]) return q;
    try { const s = localStorage.getItem(LANG_KEY); if (s && window.I18N[s]) return s; } catch (e) {}
    const n = (navigator.language || "fr").slice(0, 2);
    return window.I18N[n] ? n : "fr";
  }

  function setLang(lang) {
    window.LANG = lang;
    const t = window.I18N[lang];
    document.documentElement.lang = lang;
    document.documentElement.dir = t.dir;
    try { localStorage.setItem(LANG_KEY, lang); } catch (e) {}
    $$("[data-i18n]").forEach(el => {
      const v = t[el.dataset.i18n];
      if (typeof v !== "string") return;
      if (el.classList.contains("split")) splitWords(el, v);
      else el.textContent = v;
    });
    $$("[data-i18n-ph]").forEach(el => el.placeholder = t[el.dataset.i18nPh]);
    $$("[data-lang]").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.lang === lang)));
    renderAll();
    if (window.Chat) window.Chat.onLangChange();
    if (bookingWidget && !$("#bookingSheet").hidden) bookingWidget.rerender();
  }

  function splitWords(el, text) {
    el.setAttribute("aria-label", text);
    el.innerHTML = text.split(" ").map((w, i) => `<span class="w" aria-hidden="true"><span style="--i:${i}">${esc(w)}</span></span>`).join(" ");
  }

  /* ---------- sections ---------- */
  function renderAll() {
    const t = window.I18N[window.LANG];
    const L = window.LANG;

    // services
    $("#services").innerHTML = window.SERVICES.filter(s => s.id !== "consultation").map(s => `
      <article class="svc ${s.featured ? "featured" : ""} ${s.img ? "" : "compact"} reveal">
        ${s.img ? `<div class="svc-img"><img src="images/${s.img}-640.webp" srcset="images/${s.img}-640.webp 640w, images/${s.img}.webp 1200w" sizes="(max-width: 600px) 92vw, (max-width: 860px) 46vw, 31vw" alt="" loading="lazy" width="640" height="480"></div>` : ""}
        <div class="svc-body">
          <span class="svc-icon"><svg><use href="#i-${s.icon}"/></svg></span>
          <h3>${esc(s.name[L])}</h3>
          <p>${esc(s.desc[L])}</p>
          <button type="button" class="svc-book" data-open-booking="${s.id}">${esc(t.bookThis)}<svg class="ic"><use href="#i-arrow"/></svg></button>
        </div>
      </article>`).join("");

    // marquee (duplicated for a seamless loop)
    const words = window.SERVICES.filter(s => s.id !== "consultation").map(s => `<span>${esc(s.name[L])}</span>`).join("");
    $("#marquee").innerHTML = words + words;

    // hygiene routine (tap to tick)
    let done = [];
    try { done = JSON.parse(localStorage.getItem("chraibi.routine")) || []; } catch (e) {}
    $("#routine").innerHTML = t.routine.map((r, i) => `
      <li class="${done.includes(i) ? "done" : ""}" data-r="${i}" role="checkbox" aria-checked="${done.includes(i)}" tabindex="0">
        <span class="tick"><svg class="ic"><use href="#i-check"/></svg></span><span>${esc(r)}</span></li>`).join("");
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

    $("#values").innerHTML = t.values.map(([a, b]) => `<div class="value reveal"><b>${esc(a)}</b><span>${esc(b)}</span></div>`).join("");
    $("#steps").innerHTML = t.steps.map(([a, b]) => `<li class="reveal"><b>${esc(a)}</b><span>${esc(b)}</span></li>`).join("");
    $("#reviews").innerHTML = window.REVIEWS.map(r => `
      <figure class="review reveal">
        <span class="stars" aria-label="5/5">${'<svg><use href="#i-star"/></svg>'.repeat(5)}</span>
        <q>${esc(r)}</q>
        <small><svg class="ic"><use href="#i-check"/></svg>${esc(t.reviewsSource)}</small>
      </figure>`).join("");
    $("#faq").innerHTML = t.faq.map(([q, a]) => `<details class="reveal"><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join("");

    renderHours();
    renderHeroDays();
    timerLabel();
    observe();
  }

  function renderHours() {
    const t = window.I18N[window.LANG];
    const now = window.Booking.clinicNow();
    const todayIdx = new Date(now.y, now.m, now.d).getDay();
    const order = [1, 2, 3, 4, 5, 6, 0];
    $("#hoursList").innerHTML = order.map(d => {
      const r = (C.hours[d] || []).map(x => x.join(" – ")).join(", ");
      return `<li class="${d === todayIdx ? "today" : ""}"><span data-today="${esc(t.today)}">${t.days[d]}</span><span dir="ltr">${r || t.closed}</span></li>`;
    }).join("");

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
    $$("[data-lang]").forEach(b => b.addEventListener("click", () => setLang(b.dataset.lang)));
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
