/* Fills the page with the texts of one language. Used in the browser (app.js) and by
   scripts/prerender.mjs, which writes the same HTML into /, /en/ and /ar/ so that Google
   and AI crawlers read the full content without running JavaScript. */
(function (root) {
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const PATHS = { fr: "/", en: "/en/", ar: "/ar/" };

  function splitWords(el, text) {
    el.setAttribute("aria-label", text);
    el.innerHTML = text.split(" ").map((w, i) => `<span class="w" aria-hidden="true"><span style="--i:${i}">${esc(w)}</span></span>`).join(" ");
  }

  // opts: { done: [routine indexes ticked], todayIdx: weekday to highlight or -1 }
  function apply(doc, lang, opts) {
    opts = opts || {};
    const I18N = root.I18N, SERVICES = root.SERVICES, C = root.CLINIC;
    const t = I18N[lang];
    const $ = s => doc.querySelector(s);
    const $$ = s => Array.from(doc.querySelectorAll(s));
    const html = doc.documentElement;
    html.setAttribute("lang", lang);
    html.setAttribute("dir", t.dir);

    $$("[data-i18n]").forEach(el => {
      const v = t[el.getAttribute("data-i18n")];
      if (typeof v !== "string") return;
      if (el.classList.contains("split")) splitWords(el, v);
      else el.textContent = v;
    });
    $$("[data-i18n-ph]").forEach(el => el.setAttribute("placeholder", t[el.getAttribute("data-i18n-ph")]));
    $$("[data-i18n-alt]").forEach(el => el.setAttribute("alt", t[el.getAttribute("data-i18n-alt")]));
    $$("[data-lang]").forEach(el => {
      const on = el.getAttribute("data-lang") === lang;
      if (el.tagName === "A") { if (on) el.setAttribute("aria-current", "page"); else el.removeAttribute("aria-current"); }
      else el.setAttribute("aria-pressed", String(on));
    });

    const services = SERVICES.filter(s => s.id !== "consultation");
    $("#services").innerHTML = services.map(s => `
      <article class="svc ${s.featured ? "featured" : ""} ${s.img ? "" : "compact"} reveal" id="soin-${s.id}">
        ${s.img ? `<div class="svc-img"><img src="/images/${s.img}-640.webp" srcset="/images/${s.img}-640.webp 640w, /images/${s.img}.webp 1200w" sizes="(max-width: 600px) 92vw, (max-width: 860px) 46vw, 31vw" alt="${esc(s.name[lang] + " " + t.cityIn)}" loading="lazy" width="640" height="480"></div>` : ""}
        <div class="svc-body">
          <span class="svc-icon"><svg><use href="#i-${s.icon}"/></svg></span>
          <h3>${esc(s.name[lang])}</h3>
          <p>${esc(s.desc[lang])}</p>
          <button type="button" class="svc-book" data-open-booking="${s.id}">${esc(t.bookThis)}<svg class="ic"><use href="#i-arrow"/></svg></button>
        </div>
      </article>`).join("");

    const words = services.map(s => `<span>${esc(s.name[lang])}</span>`).join("");
    $("#marquee").innerHTML = words + words;

    const done = opts.done || [];
    $("#routine").innerHTML = t.routine.map((r, i) => `
      <li class="${done.includes(i) ? "done" : ""}" data-r="${i}" role="checkbox" aria-checked="${done.includes(i)}" tabindex="0">
        <span class="tick"><svg class="ic"><use href="#i-check"/></svg></span><span>${esc(r)}</span></li>`).join("");

    $("#values").innerHTML = t.values.map(([a, b]) => `<div class="value reveal"><b>${esc(a)}</b><span>${esc(b)}</span></div>`).join("");
    $("#steps").innerHTML = t.steps.map(([a, b]) => `<li class="reveal"><b>${esc(a)}</b><span>${esc(b)}</span></li>`).join("");
    $("#reviews").innerHTML = root.REVIEWS.map(r => `
      <figure class="review reveal">
        <span class="stars" aria-label="5/5">${'<svg><use href="#i-star"/></svg>'.repeat(5)}</span>
        <blockquote><q lang="fr">${esc(r)}</q></blockquote>
        <figcaption><svg class="ic"><use href="#i-check"/></svg>${esc(t.reviewsSource)}</figcaption>
      </figure>`).join("");
    $("#faq").innerHTML = faqList(t).map(([q, a]) => `<details class="reveal"><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join("");

    const order = [1, 2, 3, 4, 5, 6, 0];
    const todayIdx = opts.todayIdx == null ? -1 : opts.todayIdx;
    $("#hoursList").innerHTML = order.map(d => {
      const r = (C.hours[d] || []).map(x => x.join(" – ")).join(", ");
      return `<li class="${d === todayIdx ? "today" : ""}"><span data-today="${esc(t.today)}">${t.days[d]}</span><span dir="ltr">${r || t.closed}</span></li>`;
    }).join("");
  }

  const faqList = t => t.faq.concat(t.faqMore || []);

  root.Render = { apply, faqList, PATHS, esc };
})(typeof window !== "undefined" ? window : globalThis);
