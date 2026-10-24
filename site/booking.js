/* Booking: calendar of time slots built from the opening hours in data.js, sent to WhatsApp.
   Booking.mount(el, {service, note, startAt}) renders the widget into any container
   (the booking sheet, or a message inside the chat). */
(function () {
  const C = window.CLINIC;
  const L = () => window.I18N[window.LANG || "fr"];
  const STORE = "chraibi.patient";

  /* ---------- time helpers (always in the clinic's time zone) ---------- */
  const TZ = "Africa/Casablanca";
  function clinicNow() {
    try {
      const p = Object.fromEntries(new Intl.DateTimeFormat("en-GB", {
        timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false
      }).formatToParts(new Date()).map(x => [x.type, x.value]));
      return { y: +p.year, m: +p.month - 1, d: +p.day, min: (+p.hour % 24) * 60 + +p.minute };
    } catch (e) {
      const n = new Date();
      return { y: n.getFullYear(), m: n.getMonth(), d: n.getDate(), min: n.getHours() * 60 + n.getMinutes() };
    }
  }
  const toMin = s => { const [h, m] = s.split(":").map(Number); return h * 60 + m; };
  const toHHMM = m => String(Math.floor(m / 60)).padStart(2, "0") + ":" + String(m % 60).padStart(2, "0");
  const ymd = d => d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");

  function slotsFor(date, isToday, nowMin) {
    const ranges = C.hours[date.getDay()] || [];
    const out = [];
    const breaks = (C.breaks || []).map(([a, b]) => [toMin(a), toMin(b)]);
    for (const [o, c] of ranges) {
      for (let t = toMin(o); t + C.slotMinutes <= toMin(c); t += C.slotMinutes) {
        if (isToday && t < nowMin + C.leadMinutes) continue;
        if (breaks.some(([a, b]) => t < b && t + C.slotMinutes > a)) continue;
        out.push(toHHMM(t));
      }
    }
    return out;
  }

  function days() {
    const n = clinicNow();
    const list = [];
    for (let i = 0; i < C.daysAhead; i++) {
      const d = new Date(n.y, n.m, n.d + i);
      list.push({ date: d, key: ymd(d), today: i === 0, slots: slotsFor(d, i === 0, n.min) });
    }
    return list;
  }

  function openState() {
    const n = clinicNow();
    const today = new Date(n.y, n.m, n.d);
    const ranges = C.hours[today.getDay()] || [];
    for (const [o, c] of ranges) {
      if (n.min >= toMin(o) && n.min < toMin(c)) return { open: true, until: c };
    }
    for (let i = 0; i < 8; i++) {
      const d = new Date(n.y, n.m, n.d + i);
      for (const [o] of (C.hours[d.getDay()] || [])) {
        if (i > 0 || toMin(o) > n.min) return { open: false, day: d.getDay(), at: o, today: i === 0, tomorrow: i === 1 };
      }
    }
    return { open: false };
  }

  function fmtDate(d, long) {
    const t = L();
    return (long ? t.days[d.getDay()] : t.daysShort[d.getDay()]) + " " + d.getDate() + " " + t.months[d.getMonth()];
  }

  function serviceName(id) {
    const s = window.SERVICES.find(x => x.id === id);
    return s ? s.name[window.LANG || "fr"] : id;
  }

  function waLink(text) {
    return "https://wa.me/" + C.whatsapp + "?text=" + encodeURIComponent(text);
  }

  function buildMessage(b) {
    const t = L();
    const lines = [
      t.waHello, "",
      "• " + t.waService + " : " + serviceName(b.service),
      "• " + t.waDate + " : " + fmtDate(b.date, true),
      "• " + t.waTime + " : " + b.time,
      "• " + t.waName + " : " + b.name,
      "• " + t.waPhone + " : " + b.phone,
      "• " + t.waPatient + " : " + (b.existing ? t.bExisting : t.bNew)
    ];
    if (b.note) lines.push("• " + t.waNote + " : " + b.note);
    lines.push("", t.waThanks);
    return lines.join("\n");
  }

  const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const icon = id => `<svg><use href="#i-${id}"/></svg>`;

  function loadPatient() {
    try { return JSON.parse(localStorage.getItem(STORE)) || {}; } catch (e) { return {}; }
  }
  function savePatient(p) {
    try { localStorage.setItem(STORE, JSON.stringify(p)); } catch (e) { /* private mode */ }
  }

  /* ---------- widget ---------- */
  function mount(el, opts) {
    opts = opts || {};
    const saved = loadPatient();
    const state = {
      step: opts.service ? 1 : 0,
      service: opts.service || null,
      dayKey: null, time: null,
      name: saved.name || "", phone: saved.phone || "", existing: !!saved.existing,
      note: opts.note || ""
    };
    const allDays = days();
    const firstOpen = allDays.find(d => d.slots.length);
    state.dayKey = firstOpen ? firstOpen.key : allDays[0].key;

    function render() {
      const t = L();
      const bar = `<div class="bk-steps">${[0, 1, 2].map(i => `<span class="${i <= state.step ? "on" : ""}"></span>`).join("")}</div>`;
      let body = "";
      if (state.step === 0) body = stepService(t);
      else if (state.step === 1) body = stepTime(t);
      else if (state.step === 2) body = stepDetails(t);
      else body = stepDone(t);
      el.innerHTML = (state.step < 3 ? bar : "") + body;
      bind();
    }

    function stepService(t) {
      return `<p class="bk-q">${t.bWhat}</p>
        <div class="bk-services">${window.SERVICES.map(s => `
          <button type="button" class="bk-svc" data-svc="${s.id}" aria-pressed="${state.service === s.id}">
            ${icon(s.icon)}<span>${esc(s.name[window.LANG])}</span></button>`).join("")}
        </div>`;
    }

    function stepTime(t) {
      const day = allDays.find(d => d.key === state.dayKey);
      const am = day.slots.filter(s => toMin(s) < 13 * 60);
      const pm = day.slots.filter(s => toMin(s) >= 13 * 60);
      const slotBtns = list => `<div class="bk-slots">${list.map(s => `<button type="button" class="bk-slot" data-time="${s}" aria-pressed="${state.time === s}">${s}</button>`).join("")}</div>`;
      return `<p class="bk-q">${t.bWhen}</p>
        <div class="bk-days">${allDays.map(d => `
          <button type="button" class="bk-day" data-day="${d.key}" aria-pressed="${d.key === state.dayKey}" ${d.slots.length ? "" : "disabled"}>
            <small>${d.today ? t.today : t.daysShort[d.date.getDay()]}</small><b>${d.date.getDate()}</b><small>${t.months[d.date.getMonth()]}</small>
          </button>`).join("")}
        </div>
        <p class="bk-q" style="margin-top:12px">${t.bTime}</p>
        ${day.slots.length ? `
          ${am.length ? `<p class="bk-period">${t.bMorning}</p>${slotBtns(am)}` : ""}
          ${pm.length ? `<p class="bk-period">${t.bAfternoon}</p>${slotBtns(pm)}` : ""}
        ` : `<div class="bk-empty">${t.bNoSlots}</div>`}
        <div class="bk-nav">
          ${opts.service && !opts.allowServiceChange ? "" : `<button type="button" class="btn btn-back" data-back>${t.bBack}</button>`}
          <button type="button" class="btn btn-dark" data-next ${state.time ? "" : "disabled style=\"opacity:.45\""}>${t.bNext}</button>
        </div>`;
    }

    function stepDetails(t) {
      const day = allDays.find(d => d.key === state.dayKey);
      return `<p class="bk-q">${t.bWho}</p>
        <div class="bk-field"><label for="bkName">${t.bName}</label>
          <input id="bkName" name="name" autocomplete="name" value="${esc(state.name)}" required><span class="err" id="errName"></span></div>
        <div class="bk-field"><label for="bkPhone">${t.bPhone}</label>
          <input id="bkPhone" name="tel" type="tel" inputmode="tel" autocomplete="tel" dir="ltr" placeholder="06 12 34 56 78" value="${esc(state.phone)}" required><span class="err" id="errPhone"></span></div>
        <span class="bk-label">${t.bPatient}</span>
        <div class="bk-seg" style="margin-top:6px">
          <button type="button" data-existing="0" aria-pressed="${!state.existing}">${t.bNew}</button>
          <button type="button" data-existing="1" aria-pressed="${state.existing}">${t.bExisting}</button>
        </div>
        <div class="bk-field"><label for="bkNote">${t.bNote}</label>
          <textarea id="bkNote" rows="2" placeholder="${esc(t.bNotePh)}">${esc(state.note)}</textarea></div>
        <p class="bk-label">${t.bSummary}</p>
        <div class="bk-summary">
          <div><span>${t.waService}</span><b>${esc(serviceName(state.service))}</b><button type="button" data-goto="0">${t.bChange}</button></div>
          <div><span>${t.waDate}</span><b>${fmtDate(day.date, true)} · <bdi>${state.time}</bdi></b><button type="button" data-goto="1">${t.bChange}</button></div>
        </div>
        <div class="bk-nav">
          <button type="button" class="btn btn-back" data-back>${t.bBack}</button>
          <button type="button" class="btn btn-wa" data-send>${icon("wa")}${t.bSend}</button>
        </div>
        <p class="bk-info">${icon("check")}<span>${t.bInfo}</span></p>`;
    }

    function stepDone(t) {
      return `<div class="bk-done"><div class="big">${icon("check")}</div><p>${t.bSent}</p>
        <a class="btn btn-wa" href="${state.link}" target="_blank" rel="noopener">${icon("wa")}${t.bSend}</a></div>`;
    }

    function readFields() {
      const n = el.querySelector("#bkName"), p = el.querySelector("#bkPhone"), no = el.querySelector("#bkNote");
      if (n) state.name = n.value.trim();
      if (p) state.phone = p.value.trim();
      if (no) state.note = no.value.trim();
    }

    function bind() {
      el.querySelectorAll("[data-svc]").forEach(b => b.onclick = () => {
        state.service = b.dataset.svc; state.step = 1; render(); scrollTop();
      });
      el.querySelectorAll("[data-day]").forEach(b => b.onclick = () => {
        state.dayKey = b.dataset.day; state.time = null; render();
        const sel = el.querySelector(`[data-day="${state.dayKey}"]`);
        if (sel) sel.scrollIntoView({ inline: "nearest", block: "nearest" });
      });
      el.querySelectorAll("[data-time]").forEach(b => b.onclick = () => {
        state.time = b.dataset.time; render();
        const next = el.querySelector("[data-next]");
        if (next) next.scrollIntoView({ block: "nearest", behavior: "smooth" });
      });
      el.querySelectorAll("[data-existing]").forEach(b => b.onclick = () => {
        readFields(); state.existing = b.dataset.existing === "1"; render();
      });
      el.querySelectorAll("[data-goto]").forEach(b => b.onclick = () => {
        readFields(); state.step = +b.dataset.goto; render(); scrollTop();
      });
      const back = el.querySelector("[data-back]");
      if (back) back.onclick = () => { readFields(); state.step = Math.max(0, state.step - 1); render(); scrollTop(); };
      const next = el.querySelector("[data-next]");
      if (next) next.onclick = () => { if (state.time) { state.step = 2; render(); scrollTop(); } };
      const send = el.querySelector("[data-send]");
      if (send) send.onclick = submit;
      // initial scroll of the day strip to the selected day
      const sel = el.querySelector('.bk-day[aria-pressed="true"]');
      if (sel && sel.parentElement) sel.parentElement.scrollLeft = sel.offsetLeft - sel.parentElement.offsetLeft - 4;
    }

    function scrollTop() {
      const sc = el.closest(".sheet-body, .chat-log");
      if (sc && sc.classList.contains("sheet-body")) sc.scrollTop = 0;
      else el.scrollIntoView({ block: "start", behavior: "smooth" });
    }

    function submit() {
      const t = L();
      readFields();
      const digits = state.phone.replace(/\D/g, "");
      el.querySelector("#errName").textContent = state.name.length < 2 ? t.bNeedName : "";
      el.querySelector("#errPhone").textContent = digits.length < 9 ? t.bNeedPhone : "";
      if (state.name.length < 2) return el.querySelector("#bkName").focus();
      if (digits.length < 9) return el.querySelector("#bkPhone").focus();
      savePatient({ name: state.name, phone: state.phone, existing: state.existing });
      const day = allDays.find(d => d.key === state.dayKey);
      const text = buildMessage({ ...state, date: day.date });
      state.link = waLink(text);
      window.open(state.link, "_blank", "noopener");
      state.step = 3; render();
      if (opts.onSent) opts.onSent(state);
    }

    render();
    return { rerender: render };
  }

  window.Booking = { mount, days, openState, fmtDate, serviceName, waLink, clinicNow };
})();
