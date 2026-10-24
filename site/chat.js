/* Chat assistant. Asks the AI endpoint (/api/chat, Netlify function) and falls back to a
   built-in trilingual assistant (rules below) when the endpoint is not configured or offline.
   Whenever the patient's need is clear it offers a booking; "yes" opens the calendar in the chat. */
(function () {
  const C = window.CLINIC;
  const L = () => window.I18N[window.LANG || "fr"];
  const KEY = "chraibi.chat";
  const API = "/api/chat";

  let history = [];           // [{role:"user"|"assistant", content}]
  let aiAvailable = true;     // set to false after the endpoint fails once
  let triage = null;          // local fallback: waiting for details about pain
  let busy = false;
  let started = false;

  const $ = s => document.querySelector(s);
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const icon = id => `<svg class="ic"><use href="#i-${id}"/></svg>`;

  /* ---------- UI ---------- */
  function open(prefill) {
    const el = $("#chat");
    el.hidden = false;
    document.body.classList.add("chat-open");
    if (window.matchMedia("(max-width: 859px)").matches) document.body.classList.add("lock");
    if (!started) start();
    if (prefill) send(prefill);
    else setTimeout(() => { if (window.matchMedia("(min-width: 860px)").matches) $("#chatInput").focus(); }, 300);
    history_push_state();
  }
  function close() {
    $("#chat").hidden = true;
    document.body.classList.remove("chat-open", "lock");
  }
  // Android back button closes the chat instead of leaving the page
  function history_push_state() {
    try { if (!window.history.state || !window.history.state.chat) window.history.pushState({ chat: 1 }, ""); } catch (e) {}
  }
  window.addEventListener("popstate", () => { if (!$("#chat").hidden) close(); });

  function start() {
    started = true;
    try {
      const saved = JSON.parse(sessionStorage.getItem(KEY));
      if (saved && saved.length) {
        history = saved;
        history.forEach(m => bubble(m.role === "user" ? "me" : "bot", m.content));
        renderChips();
        return;
      }
    } catch (e) {}
    bubble("bot", L().cHello);
    renderChips();
  }

  function persist() {
    try { sessionStorage.setItem(KEY, JSON.stringify(history.slice(-20))); } catch (e) {}
  }

  function bubble(who, text) {
    const div = document.createElement("div");
    div.className = "msg " + who;
    div.textContent = text;
    div.dir = "auto";
    $("#chatLog").appendChild(div);
    scrollDown();
    return div;
  }

  function scrollDown() {
    const log = $("#chatLog");
    requestAnimationFrame(() => log.scrollTo({ top: log.scrollHeight, behavior: "smooth" }));
  }

  function typing(on) {
    let t = $("#chatTyping");
    if (on && !t) {
      t = document.createElement("div");
      t.id = "chatTyping"; t.className = "msg bot";
      t.setAttribute("aria-label", L().cTyping);
      t.innerHTML = '<span class="typing"><i></i><i></i><i></i></span>';
      $("#chatLog").appendChild(t); scrollDown();
    } else if (!on && t) t.remove();
  }

  function renderChips(list) {
    const box = $("#chatChips");
    const chips = list || L().cChips;
    box.innerHTML = chips.map(c => `<button type="button">${esc(c)}</button>`).join("");
    box.querySelectorAll("button").forEach(b => b.onclick = () => send(b.textContent));
  }

  function actions(html) {
    const div = document.createElement("div");
    div.className = "msg-actions";
    div.innerHTML = html;
    $("#chatLog").appendChild(div);
    scrollDown();
    return div;
  }

  function offerBooking(service) {
    const t = L();
    const a = actions(`
      <button type="button" class="btn btn-dark btn-sm" data-yes>${icon("calendar")}${esc(t.cYes)}</button>
      <button type="button" class="btn btn-glass btn-sm" data-no>${esc(t.cNo)}</button>`);
    a.querySelector("[data-yes]").onclick = () => { a.remove(); bubble("me", t.cYes); showCalendar(service); };
    a.querySelector("[data-no]").onclick = () => { a.remove(); bubble("me", t.cNo); bubble("bot", t.cNoProblem); renderChips(); };
  }

  function showCalendar(service) {
    const t = L();
    bubble("bot", t.cPick);
    const w = document.createElement("div");
    w.className = "msg widget";
    $("#chatLog").appendChild(w);
    const note = history.filter(m => m.role === "user").slice(-3).map(m => m.content).join(" / ").slice(0, 240);
    window.Booking.mount(w, { service: service || "consultation", note, allowServiceChange: true });
    $("#chatChips").innerHTML = "";
    setTimeout(() => w.scrollIntoView({ block: "start", behavior: "smooth" }), 60);
  }

  function handoff() {
    const t = L();
    const text = t.waGeneric + "\n" + history.filter(m => m.role === "user").slice(-3).map(m => "• " + m.content).join("\n");
    actions(`<a class="btn btn-wa btn-sm" target="_blank" rel="noopener" href="${window.Booking.waLink(text)}">${icon("wa")}${esc(t.cHuman)}</a>`);
  }

  /* ---------- sending ---------- */
  async function send(text) {
    text = (text || "").trim();
    if (!text || busy) return;
    busy = true;
    $("#chatChips").innerHTML = "";
    bubble("me", text);
    history.push({ role: "user", content: text.slice(0, 800) });
    persist();
    typing(true);

    let res = null;
    if (aiAvailable) res = await askAI();
    if (!res) res = LocalBot.reply(text);
    await new Promise(r => setTimeout(r, res.local ? 550 : 0));

    typing(false);
    bubble("bot", res.reply);
    history.push({ role: "assistant", content: res.reply });
    persist();
    if (res.action === "open_booking") showCalendar(res.service);
    else if (res.action === "offer_booking") offerBooking(res.service);
    else if (res.action === "handoff") { handoff(); renderChips(); }
    else renderChips(res.chips);
    busy = false;
  }

  async function askAI() {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 25000);
    try {
      const r = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history.slice(-16), lang: window.LANG }),
        signal: ctrl.signal
      });
      if (!r.ok) throw new Error("status " + r.status);
      const data = await r.json();
      if (!data || typeof data.reply !== "string" || !data.reply) throw new Error("empty");
      return data;
    } catch (e) {
      aiAvailable = false;     // use the built-in assistant for the rest of the visit
      return null;
    } finally {
      clearTimeout(timer);
    }
  }

  /* ---------- built-in assistant (no server needed) ---------- */
  const LocalBot = (function () {
    const R = {
      emergency: /gonfl|enfl|abc[eè]s|fi[eè]vre|pus|saigne beaucoup|accident|cass[ée]e?|chute|swell|abscess|fever|broken|knocked|bleeding a lot|انتفاخ|منفوخ|خراج|حمى|سخانة|مكسور|تكسر|tnfekh|mnfou5|mhrres/i,
      pain: /mal|douleur|rage|souffr|sensib|lanc|pain|hurt|ache|sore|sensitiv|ألم|وجع|يوجع|كيوجع|كيضر|تيضر|ضرني|يؤلم|حساسية|kayderni|kaywja3|tayderni|dorss|dars|derss/i,
      hygiene: /d[ée]tartr|nettoy|tartre|hygi[eè]ne|haleine|gencive|saign|propre|polish|clean|scal|tartar|plaque|gum|breath|floss|تنظيف|جير|الجير|لثة|اللثة|رائحة|ريحة|نظافة|كتنزف|tnadif|jir/i,
      esthetique: /blanch|jaune|tache|facette|esth[ée]t|sourire|white|yellow|stain|veneer|cosmetic|smile|تبييض|تبيض|أصفر|صفر|بقع|فينير|ابتسامة|تجميل|tbyid|tbyed/i,
      implants: /implant|manquant|perdu|couronne|bridge|proth[eè]se|dentier|missing|lost a tooth|crown|denture|زرع|زراعة|تركيب|ناقص|طاح|سقط|تاج|طقم|implon/i,
      ortho: /ortho|appareil|aligneur|goutti[eè]re|travers|bagues|brace|aligner|crooked|straighten|invisalign|تقويم|معوج|مصفف|معوجة|t9wim|tqwim/i,
      enfants: /enfant|b[ée]b[ée]|fils|fille|petit|gamin|child|kid|son|daughter|baby|طفل|أطفال|ولدي|بنتي|الدراري|صغير|weldi|bniti|drari/i,
      chirurgie: /sagesse|extract|arrach|enlever|d[ée]vital|nerf|canal|wisdom|pull|remove a tooth|root canal|nerve|ضرس العقل|قلع|نحيد|نقلع|العصب|عصب|9le3|qla3/i,
      soins: /carie|trou|plomb|obtur|composite|noir|cavit|hole|filling|decay|تسوس|مسوس|حفرة|حشوة|تحشية|msous|mssous/i,
      hours: /horaire|heure|ouvert|ferm|quand|samedi|dimanche|aujourd|demain|hour|open|close|when|saturday|sunday|today|tomorrow|وقت|أوقات|مواعيد|مفتوح|مسدود|ساعة|السبت|الأحد|اليوم|غدا|غدوة|imta|w9t|wqt/i,
      address: /adresse|o[uù] (est|se trouve|êtes)|situ|localis|acc[eè]s|parking|where|address|location|direction|map|عنوان|فين|أين|موقع|كاين|الطريق|fin kayn|fine/i,
      price: /prix|tarif|co[uû]t|combien|cher|devis|price|cost|how much|quote|expensive|ثمن|تمن|بشحال|بكم|كم|سعر|غالي|chhal|bchhal|taman/i,
      insurance: /mutuelle|assurance|cnss|amo|cnops|rembours|insurance|تأمين|التعاضدية|تعاضدية|ضمان|راميد|رميد/i,
      booking: /rdv|rendez|r[ée]serv|prendre|disponib|cr[ée]neau|appointment|book|schedule|slot|available|موعد|حجز|نحجز|بغيت نجي|متاح|maw3id|nhjez/i,
      greet: /^(bonjour|bonsoir|salut|slt|coucou|hello|hi|hey|salam|slm|السلام|سلام|مرحبا|أهلا|صباح|مساء)\b/i,
      thanks: /merci|thank|thx|شكرا|شكرًا|بارك الله|choukran|chokran|chkran/i
    };

    const EN_HINT = /\b(the|my|i|i'm|is|are|have|hello|hi|tooth|teeth|pain|how|what|when|where|price|appointment|book|please|need|want)\b/i;
    const FR_HINT = /\b(je|j'ai|mon|ma|mes|le|la|les|une?|bonjour|dent|dents|est|avez|vous|quand|où|prix|rendez|merci|pour)\b/i;

    function langOf(text) {
      if (/[؀-ۿ]/.test(text)) return "ar";
      const en = EN_HINT.test(text), fr = FR_HINT.test(text);
      if (en && !fr) return "en";
      if (fr && !en) return "fr";
      return window.LANG || "fr";
    }

    function hoursText(lang) {
      const t = window.I18N[lang];
      const fmt = d => (C.hours[d] || []).map(r => r.join("–")).join(", ") || t.closed;
      const wk = fmt(1), sat = fmt(6);
      return {
        fr: `Le cabinet est ouvert du lundi au vendredi de ${wk}, le samedi de ${sat}, et fermé le dimanche.`,
        en: `The clinic is open Monday to Friday ${wk}, Saturday ${sat}, and closed on Sunday.`,
        ar: `العيادة مفتوحة من الإثنين إلى الجمعة من ${wk}، ويوم السبت من ${sat}، ومغلقة يوم الأحد.`
      }[lang];
    }

    const S = {
      emergency: {
        fr: "Ça ressemble à une urgence dentaire. Si vous avez du mal à respirer ou à avaler, ou une forte fièvre, allez aux urgences tout de suite. Sinon, le Dr Chraibi peut vous recevoir rapidement : appelez le " + C.phone + " ou réservez le premier créneau disponible.",
        en: "This sounds like a dental emergency. If you have trouble breathing or swallowing, or a high fever, go to the emergency room now. Otherwise Dr. Chraibi can see you quickly: call " + C.phone + " or book the first available slot.",
        ar: "يبدو أنها حالة مستعجلة. إذا كانت لديك صعوبة في التنفس أو البلع أو حمى قوية، توجه فورًا إلى المستعجلات. وإلا يمكن للدكتور الشرايبي استقبالك بسرعة: اتصل على " + C.phone + " أو احجز أقرب موعد متاح."
      },
      painAsk: {
        fr: "Je suis désolé pour cette douleur. Pour bien vous orienter : depuis quand avez-vous mal, et est-ce que ça réagit au chaud/froid, ou y a-t-il un gonflement de la joue ?",
        en: "Sorry about the pain. To guide you well: how long has it hurt, does it react to hot/cold, and is there any swelling of the cheek?",
        ar: "سلامتك. لكي أوجهك جيدًا: منذ متى بدأ الألم؟ هل يزيد مع الساخن أو البارد؟ وهل يوجد انتفاخ في الخد؟"
      },
      painOffer: {
        fr: "Merci. Une douleur dentaire vient souvent d'une carie ou d'une inflammation du nerf, et il vaut mieux la traiter vite avant qu'elle ne s'aggrave. En attendant : évitez le très chaud/très froid et mâchez de l'autre côté. Le Dr Chraibi doit examiner la dent.",
        en: "Thanks. Tooth pain usually comes from a cavity or an inflamed nerve, and it's best treated quickly before it gets worse. Meanwhile, avoid very hot/cold food and chew on the other side. Dr. Chraibi needs to examine the tooth.",
        ar: "شكرًا. ألم الأسنان غالبًا سببه تسوس أو التهاب في العصب، والأفضل علاجه بسرعة قبل أن يتفاقم. في الانتظار: تجنب الساخن والبارد جدًا وامضغ من الجهة الأخرى. يجب أن يفحص الدكتور الشرايبي السن."
      },
      hygiene: {
        fr: "Un détartrage avec polissage enlève le tartre, calme les gencives qui saignent et rafraîchit l'haleine. On le conseille tous les 6 mois. La séance est rapide et indolore, et le Dr Chraibi vous donne des conseils de brossage adaptés.",
        en: "A scaling and polishing removes tartar, calms bleeding gums and freshens breath. We recommend it every 6 months. It's quick and painless, and Dr. Chraibi gives you brushing tips suited to you.",
        ar: "إزالة الجير مع التلميع تزيل الترسبات وتهدئ اللثة التي تنزف وتنعش النفس. ننصح بها كل 6 أشهر. الجلسة سريعة وبدون ألم، ويقدم لك الدكتور الشرايبي نصائح تنظيف مناسبة لك."
      },
      esthetique: {
        fr: "Pour un sourire plus lumineux, plusieurs options existent : blanchiment, facettes ou simples retouches esthétiques. Le Dr Chraibi vérifie d'abord la santé des dents et des gencives, puis vous propose la solution la plus naturelle.",
        en: "For a brighter smile there are several options: whitening, veneers or simple aesthetic touch-ups. Dr. Chraibi first checks your teeth and gums, then suggests the most natural solution.",
        ar: "لابتسامة أكثر إشراقًا هناك عدة حلول: التبييض، القشور التجميلية (فينير) أو لمسات تجميلية بسيطة. يفحص الدكتور الشرايبي أولًا صحة الأسنان واللثة ثم يقترح الحل الأكثر طبيعية."
      },
      implants: {
        fr: "Une dent manquante peut être remplacée par un implant, une couronne, un bridge ou une prothèse. Le choix dépend de l'os et des dents voisines : une consultation avec radiographie permet d'établir un plan et un devis clairs.",
        en: "A missing tooth can be replaced with an implant, a crown, a bridge or a denture. The choice depends on the bone and neighbouring teeth: a consultation with an X-ray gives you a clear plan and quote.",
        ar: "يمكن تعويض السن المفقود بزرعة أو تاج أو جسر أو تركيبة. يعتمد الاختيار على العظم والأسنان المجاورة: استشارة مع صورة أشعة تمكن من وضع خطة وعرض سعر واضحين."
      },
      ortho: {
        fr: "Les dents de travers peuvent être alignées avec des gouttières transparentes ou un appareil, chez l'enfant comme chez l'adulte. Un premier bilan permet de voir la solution adaptée et la durée du traitement.",
        en: "Crooked teeth can be straightened with clear aligners or braces, for children and adults. A first check-up shows the right solution and how long treatment takes.",
        ar: "يمكن تقويم الأسنان المعوجة بمصففات شفافة أو بجهاز تقويم، للأطفال والكبار. فحص أولي يحدد الحل المناسب ومدة العلاج."
      },
      enfants: {
        fr: "Le Dr Chraibi reçoit les enfants dès les premières dents, avec une approche douce pour les mettre en confiance. Une visite de contrôle tous les 6 mois aide à prévenir les caries.",
        en: "Dr. Chraibi sees children from their first teeth, with a gentle approach to put them at ease. A check-up every 6 months helps prevent cavities.",
        ar: "يستقبل الدكتور الشرايبي الأطفال منذ ظهور أسنانهم الأولى، بطريقة لطيفة لطمأنتهم. زيارة مراقبة كل 6 أشهر تساعد على الوقاية من التسوس."
      },
      chirurgie: {
        fr: "Dévitalisation, extraction ou dent de sagesse : ces soins se font sous anesthésie locale douce. Le Dr Chraibi examine d'abord la dent (souvent avec une radio) pour choisir la meilleure option et garder la dent quand c'est possible.",
        en: "Root canal, extraction or wisdom tooth: these are done under gentle local anaesthesia. Dr. Chraibi first examines the tooth (often with an X-ray) to choose the best option and save the tooth when possible.",
        ar: "علاج العصب أو القلع أو ضرس العقل: تتم تحت تخدير موضعي لطيف. يفحص الدكتور الشرايبي السن أولًا (غالبًا بالأشعة) لاختيار الحل الأفضل والحفاظ على السن متى أمكن."
      },
      soins: {
        fr: "Une carie se soigne d'autant plus simplement qu'elle est prise tôt : nettoyage de la carie puis obturation esthétique couleur dent, en général en une séance.",
        en: "The earlier a cavity is treated, the simpler it is: the decay is cleaned and the tooth filled with a tooth-coloured filling, usually in one visit.",
        ar: "كلما عولج التسوس مبكرًا كان العلاج أبسط: تنظيف التسوس ثم حشوة تجميلية بلون السن، عادة في جلسة واحدة."
      },
      address: {
        fr: "Le cabinet se trouve à Saada, Marrakech (Google Maps : " + C.plusCode + "). Itinéraire : " + C.mapsUrl,
        en: "The clinic is in Saada, Marrakech (Google Maps: " + C.plusCode + "). Directions: " + C.mapsUrl,
        ar: "توجد العيادة في حي السعادة، مراكش (خرائط Google: " + C.plusCode + "). الاتجاهات: " + C.mapsUrl
      },
      price: {
        fr: "Le tarif dépend de votre situation, c'est pourquoi le Dr Chraibi vous remet un devis clair après l'examen, avant tout traitement.",
        en: "The cost depends on your situation, so Dr. Chraibi gives you a clear quote after the exam, before any treatment.",
        ar: "التكلفة تختلف حسب حالتك، لذلك يقدم لك الدكتور الشرايبي عرض سعر واضحًا بعد الفحص وقبل أي علاج."
      },
      insurance: {
        fr: "Pour la mutuelle ou l'AMO (feuille de soins, prise en charge), le plus simple est de poser la question directement au cabinet sur WhatsApp : il vous répondra pour votre cas précis.",
        en: "For insurance (AMO, mutuelle, claim forms), the easiest is to ask the clinic directly on WhatsApp: they will answer for your specific case.",
        ar: "بالنسبة للتأمين (AMO أو التعاضدية وورقة العلاج)، الأسهل أن تسأل العيادة مباشرة على واتساب لتجيبك حسب حالتك."
      },
      booking: {
        fr: "Avec plaisir ! Choisissez le soin, puis le jour et l'heure qui vous conviennent :",
        en: "With pleasure! Choose the treatment, then the day and time that suit you:",
        ar: "بكل سرور! اختر العلاج ثم اليوم والساعة المناسبين لك:"
      },
      greet: {
        fr: "Bonjour ! Comment puis-je vous aider ? Vous pouvez me décrire votre problème (douleur, gencives, blanchiment…) ou demander un rendez-vous.",
        en: "Hello! How can I help? You can describe your problem (pain, gums, whitening…) or ask for an appointment.",
        ar: "مرحبًا! كيف يمكنني مساعدتك؟ يمكنك أن تصف مشكلتك (ألم، لثة، تبييض…) أو تطلب موعدًا."
      },
      thanks: {
        fr: "Avec plaisir ! N'hésitez pas si vous avez une autre question. À bientôt au cabinet.",
        en: "You're welcome! Feel free to ask anything else. See you soon at the clinic.",
        ar: "العفو! لا تتردد إذا كان عندك سؤال آخر. نراك قريبًا في العيادة."
      },
      unknown: {
        fr: "Je n'ai pas bien compris. Pouvez-vous décrire votre problème en quelques mots (par exemple « mal à une dent », « gencives qui saignent », « dent manquante ») ? Vous pouvez aussi écrire directement au cabinet.",
        en: "I didn't quite get that. Could you describe your problem in a few words (e.g. “toothache”, “bleeding gums”, “missing tooth”)? You can also message the clinic directly.",
        ar: "لم أفهم جيدًا. هل يمكنك وصف مشكلتك ببضع كلمات (مثلًا «ألم في السن»، «اللثة تنزف»، «سن ناقص»)؟ يمكنك أيضًا مراسلة العيادة مباشرة."
      }
    };

    function offerLine(lang, service) {
      const name = window.SERVICES.find(s => s.id === service).name[lang];
      return "\n\n" + window.I18N[lang].cOffer + " « " + name + " » ?";
    }

    function reply(text) {
      const lang = langOf(text);
      const out = (key, action, service, extra) => ({
        local: true,
        reply: S[key][lang] + (extra || "") + (action === "offer_booking" ? offerLine(lang, service) : ""),
        action: action || "none", service
      });

      if (triage === "pain") {
        triage = null;
        if (R.emergency.test(text)) return out("emergency", "offer_booking", "urgence");
        return out("painOffer", "offer_booking", /fort|insupport|nuit|strong|unbearable|night|بزاف|قوي|الليل|bzaf/i.test(text) ? "urgence" : "soins");
      }
      if (R.emergency.test(text)) return out("emergency", "offer_booking", "urgence");
      if (R.booking.test(text) && !R.pain.test(text)) return { local: true, reply: S.booking[lang], action: "open_booking", service: null };
      if (R.chirurgie.test(text)) return out("chirurgie", "offer_booking", "chirurgie");
      if (R.soins.test(text)) return out("soins", "offer_booking", "soins");
      if (R.pain.test(text)) { triage = "pain"; return { local: true, reply: S.painAsk[lang], action: "none", chips: painChips(lang) }; }
      if (R.enfants.test(text)) return out("enfants", "offer_booking", "enfants");
      if (R.ortho.test(text)) return out("ortho", "offer_booking", "ortho");
      if (R.implants.test(text)) return out("implants", "offer_booking", "implants");
      if (R.esthetique.test(text)) return out("esthetique", "offer_booking", "esthetique");
      if (R.hygiene.test(text)) return out("hygiene", "offer_booking", "hygiene");
      if (R.insurance.test(text)) return out("insurance", "handoff");
      if (R.price.test(text)) return out("price", "offer_booking", "consultation");
      if (R.hours.test(text)) return { local: true, reply: hoursText(lang) + "\n\n" + S.address[lang] + offerLine(lang, "consultation"), action: "offer_booking", service: "consultation" };
      if (R.address.test(text)) return out("address", "offer_booking", "consultation");
      if (R.thanks.test(text)) return out("thanks");
      if (R.greet.test(text)) return out("greet");
      return out("unknown", "handoff");
    }

    function painChips(lang) {
      return {
        fr: ["Depuis quelques jours, au froid", "Douleur forte la nuit", "La joue est gonflée"],
        en: ["A few days, with cold", "Strong pain at night", "My cheek is swollen"],
        ar: ["منذ أيام، مع البارد", "ألم قوي في الليل", "الخد منتفخ"]
      }[lang];
    }

    return { reply };
  })();

  /* ---------- wiring ---------- */
  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("[data-open-chat]").forEach(b => b.addEventListener("click", () => open()));
    document.querySelectorAll("[data-close-chat]").forEach(b => b.addEventListener("click", () => {
      close();
      try { if (window.history.state && window.history.state.chat) window.history.back(); } catch (e) {}
    }));
    const input = $("#chatInput");
    $("#chatForm").addEventListener("submit", e => { e.preventDefault(); const v = input.value; input.value = ""; autosize(); send(v); });
    input.addEventListener("keydown", e => {
      if (e.key === "Enter" && !e.shiftKey && !e.isComposing) { e.preventDefault(); $("#chatForm").requestSubmit(); }
    });
    const autosize = () => { input.style.height = "auto"; input.style.height = Math.min(input.scrollHeight, 130) + "px"; };
    input.addEventListener("input", autosize);
  });

  window.Chat = {
    open, close,
    onLangChange() { if (started && !busy && !history.length) { $("#chatLog").innerHTML = ""; bubble("bot", L().cHello); } if (started && !busy) renderChips(); }
  };
})();
