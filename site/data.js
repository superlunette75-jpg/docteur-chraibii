/* Cabinet dentaire Dr. Chraibi: all content lives here (clinic info, services, texts in FR / EN / AR).
   Edit this file to change hours, phone, services or wording. No build step. */

window.CLINIC = {
  name: "Cabinet dentaire Dr. Chraibi",
  short: "Dr. Chraibi",
  // WhatsApp number in international format, digits only (no +, no spaces)
  whatsapp: "212602828763",
  phone: "+212 6 02 82 87 63",
  phoneHref: "tel:+212602828763",
  plusCode: "MXGJ+7C",
  city: "Saada, Marrakech",
  mapsUrl: "https://maps.app.goo.gl/1Mx5HhFjTWWTVUW79",
  mapsEmbed: "https://www.google.com/maps?q=31.6756871,-8.0191237&z=16&output=embed",
  rating: 5.0,
  reviewsCount: 44,
  // Opening hours per weekday (0 = Sunday). Each range is [open, close] in "HH:MM".
  hours: {
    0: [],
    1: [["09:00", "19:00"]],
    2: [["09:00", "19:00"]],
    3: [["09:00", "19:00"]],
    4: [["09:00", "19:00"]],
    5: [["09:00", "19:00"]],
    6: [["09:00", "13:00"]]
  },
  slotMinutes: 30,       // length of one appointment slot
  leadMinutes: 60,       // earliest slot today = now + this
  daysAhead: 21,         // how far ahead patients can pick a date
  // Slots the clinic never offers (e.g. a lunch break): ["13:00", "14:00"]
  breaks: []
};

/* Services. `id` is used by the booking form and the chatbot. */
window.SERVICES = [
  {
    id: "hygiene", img: "hygiene", icon: "sparkle", featured: true,
    name: { fr: "Hygiène & détartrage", en: "Hygiene & scaling", ar: "النظافة وإزالة الجير" },
    desc: {
      fr: "Détartrage, polissage et conseils d'hygiène bucco-dentaire pour des gencives saines et une haleine fraîche.",
      en: "Scaling, polishing and oral-hygiene coaching for healthy gums and fresh breath.",
      ar: "إزالة الجير والتلميع ونصائح نظافة الفم من أجل لثة سليمة ونَفَس منعش."
    }
  },
  {
    id: "soins", img: "cabinet", icon: "tooth",
    name: { fr: "Soins & caries", en: "Fillings & cavities", ar: "علاج التسوس" },
    desc: {
      fr: "Bilan, radiographie et soins des caries avec des composites esthétiques couleur dent.",
      en: "Check-up, X-ray and cavity treatment with tooth-coloured aesthetic fillings.",
      ar: "فحص وأشعة وعلاج التسوس بحشوات تجميلية بلون الأسنان."
    }
  },
  {
    id: "esthetique", img: "sourire", icon: "smile",
    name: { fr: "Esthétique & blanchiment", en: "Aesthetics & whitening", ar: "تجميل وتبييض الأسنان" },
    desc: {
      fr: "Blanchiment, facettes et retouches pour un sourire lumineux et naturel.",
      en: "Whitening, veneers and touch-ups for a bright, natural smile.",
      ar: "تبييض وقشور تجميلية (فينير) لابتسامة مشرقة وطبيعية."
    }
  },
  {
    id: "implants", img: "implant", icon: "implant",
    name: { fr: "Implants & prothèses", en: "Implants & crowns", ar: "الزرع والتركيبات" },
    desc: {
      fr: "Remplacer une dent manquante : implants, couronnes, bridges et prothèses sur mesure.",
      en: "Replace a missing tooth: implants, crowns, bridges and custom dentures.",
      ar: "تعويض الأسنان المفقودة: زرع، تيجان، جسور وتركيبات حسب المقاس."
    }
  },
  {
    id: "ortho", img: "aligneurs", icon: "align",
    name: { fr: "Orthodontie & aligneurs", en: "Orthodontics & aligners", ar: "تقويم الأسنان" },
    desc: {
      fr: "Aligner les dents en douceur, avec des gouttières transparentes ou un appareil adapté.",
      en: "Gently straighten teeth with clear aligners or a suitable brace.",
      ar: "تقويم الأسنان بلطف بواسطة مصففات شفافة أو جهاز مناسب."
    }
  },
  {
    id: "enfants", img: "enfants", icon: "child",
    name: { fr: "Dents des enfants", en: "Children's dentistry", ar: "أسنان الأطفال" },
    desc: {
      fr: "Premières visites rassurantes, prévention et soins adaptés aux plus petits.",
      en: "Reassuring first visits, prevention and gentle care for little ones.",
      ar: "زيارات أولى مطمئنة ووقاية وعلاجات مناسبة للصغار."
    }
  },
  {
    id: "urgence", icon: "bolt",
    name: { fr: "Urgence dentaire", en: "Dental emergency", ar: "حالة مستعجلة" },
    desc: {
      fr: "Rage de dent, abcès, dent cassée : nous vous recevons au plus vite.",
      en: "Toothache, abscess or broken tooth: we see you as soon as possible.",
      ar: "ألم شديد، خراج أو سن مكسور: نستقبلك في أقرب وقت."
    }
  },
  {
    id: "chirurgie", icon: "shield",
    name: { fr: "Dévitalisation & extraction", en: "Root canal & extraction", ar: "علاج العصب والقلع" },
    desc: {
      fr: "Traitement de canal, extraction et dents de sagesse, avec une anesthésie douce.",
      en: "Root canal treatment, extractions and wisdom teeth, with gentle anaesthesia.",
      ar: "علاج قناة العصب، القلع وضرس العقل، مع تخدير لطيف."
    }
  },
  {
    id: "consultation", icon: "chat",
    name: { fr: "Consultation / bilan", en: "Consultation / check-up", ar: "استشارة / فحص" },
    desc: {
      fr: "Un premier rendez-vous pour faire le point et établir un plan de traitement clair.",
      en: "A first appointment to assess your teeth and plan clear treatment.",
      ar: "موعد أول للفحص ووضع خطة علاج واضحة."
    }
  }
];

/* Real Google reviews of the clinic (Google Maps listing). */
window.REVIEWS = [
  "Ce cabinet reflète parfaitement la personne qui est derrière : sérieux, passionné et profondément humain. Chaque détail est pensé pour mettre à l’aise et offrir des soins de qualité, avec douceur et précision.",
  "Meilleur dentiste de Marrakech. Hyper professionnel et sympathique. Allez-y les yeux fermés.",
  "Un dentiste très compétent et humain, à l’écoute de ses patients, tarif très correct. Je recommande vivement Dr Chraibi.",
  "Dentiste très professionnel, doux et à l’écoute. Cabinet propre. Je recommande sans hésitation.",
  "Très bon dentiste, professionnel et à l’écoute. Je suis très satisfaite de ma visite. Je recommande !"
];

window.I18N = {
  fr: {
    dir: "ltr", label: "FR", locale: "fr-FR",
    heroEyebrowShort: "Dentiste · Marrakech",
    navServices: "Soins", navHygiene: "Hygiène", navClinic: "Le cabinet", navContact: "Contact",
    book: "Réserver", bookLong: "Réserver un rendez-vous", chat: "Parler à l'assistant", chatShort: "Assistant",
    heroEyebrow: "Cabinet dentaire · Saada, Marrakech",
    heroTitle: "Un sourire sain, soigné avec douceur.",
    heroSub: "Soins dentaires, hygiène bucco-dentaire et esthétique du sourire. Choisissez votre créneau en 30 secondes, confirmation directe sur WhatsApp.",
    heroReviews: "avis Google",
    heroCard: "Créneaux disponibles cette semaine",
    openNow: "Ouvert maintenant", closedNow: "Fermé", opensAt: "Ouvre", closesAt: "Ferme à",
    qaCall: "Appeler", qaWhatsApp: "WhatsApp", qaRoute: "Itinéraire", qaHours: "Horaires",
    servicesEyebrow: "Nos soins", servicesTitle: "Tout votre sourire, au même endroit.",
    servicesSub: "De la simple visite de contrôle au sourire refait, chaque soin est expliqué avant d'être réalisé.",
    bookThis: "Réserver ce soin",
    hygieneEyebrow: "Hygiène bucco-dentaire", hygieneTitle: "La prévention, c'est le meilleur des soins.",
    hygieneSub: "Un détartrage tous les 6 mois et une bonne routine à la maison évitent la plupart des caries et des problèmes de gencives.",
    routineTitle: "Votre routine du quotidien",
    routine: [
      "Brossage 2 minutes, matin et soir",
      "Fil dentaire ou brossettes chaque soir",
      "Brosser aussi la langue",
      "Limiter le sucre et les sodas entre les repas",
      "Détartrage et contrôle tous les 6 mois"
    ],
    timerTitle: "Minuteur de brossage", timerStart: "Lancer 2 minutes", timerStop: "Arrêter",
    timerDone: "Bravo, brossage terminé !",
    timerZones: ["Haut droite", "Haut gauche", "Bas gauche", "Bas droite"],
    bookHygiene: "Réserver un détartrage",
    clinicEyebrow: "Le cabinet", clinicTitle: "Un lieu calme, des soins précis.",
    clinicSub: "Le Dr Chraibi vous reçoit dans un cabinet lumineux et rassurant, au cœur de Saada. Une approche simple : écouter, expliquer, soigner sans douleur.",
    values: [
      ["Douceur", "Anesthésie douce et gestes précis, même pour les patients anxieux."],
      ["Écoute", "Le temps de comprendre votre besoin et de répondre à vos questions."],
      ["Hygiène stricte", "Stérilisation et matériel à usage unique à chaque patient."],
      ["Transparence", "Un plan de traitement et un devis clairs avant de commencer."]
    ],
    stepsEyebrow: "Comment ça marche", stepsTitle: "Votre rendez-vous en 3 étapes",
    steps: [
      ["Choisissez", "Un soin, un jour et une heure dans le calendrier, ou décrivez votre problème à l'assistant."],
      ["Envoyez", "Votre demande part sur WhatsApp, déjà rédigée. Rien à télécharger."],
      ["Confirmé", "Le cabinet vous confirme le rendez-vous directement sur WhatsApp."]
    ],
    reviewsEyebrow: "Ils nous font confiance", reviewsTitle: "Ce que disent nos patients",
    reviewsSource: "Avis Google",
    faqEyebrow: "Questions fréquentes", faqTitle: "Vous vous demandez…",
    faq: [
      ["Comment prendre rendez-vous ?", "Cliquez sur « Réserver », choisissez le soin, le jour et l'heure, puis envoyez votre demande sur WhatsApp. Le cabinet vous confirme rapidement."],
      ["Recevez-vous les urgences ?", "Oui. En cas de douleur forte, d'abcès ou de dent cassée, choisissez « Urgence dentaire » ou appelez directement le cabinet."],
      ["Combien coûte un soin ?", "Le tarif dépend de votre situation. Après l'examen, le Dr Chraibi vous remet un devis clair avant tout traitement."],
      ["À quelle fréquence faire un détartrage ?", "En général tous les 6 mois, parfois plus souvent si vos gencives saignent ou si vous fumez."],
      ["Soignez-vous les enfants ?", "Oui, dès les premières dents, avec des visites adaptées pour les mettre en confiance."],
      ["Quelles langues parlez-vous ?", "Arabe, darija, français et anglais."]
    ],
    contactEyebrow: "Nous trouver", contactTitle: "Au cœur de Saada, Marrakech",
    hoursTitle: "Horaires", closed: "Fermé", today: "Aujourd'hui",
    days: ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"],
    daysShort: ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"],
    months: ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."],
    openMaps: "Ouvrir dans Google Maps",
    footer: "Cabinet dentaire Dr. Chraibi · Saada, Marrakech",
    // booking
    bTitle: "Prendre rendez-vous", bStep1: "Motif", bStep2: "Date", bStep3: "Heure", bStep4: "Vos infos",
    bWhat: "Pour quel soin ?", bWhen: "Quel jour ?", bTime: "Quelle heure ?", bWho: "Vos coordonnées",
    bMorning: "Matin", bAfternoon: "Après-midi", bNoSlots: "Plus de créneau ce jour-là. Choisissez un autre jour.",
    bName: "Nom et prénom", bPhone: "Téléphone", bPatient: "Vous êtes", bNew: "Nouveau patient", bExisting: "Déjà patient",
    bNote: "Un mot sur votre besoin (facultatif)", bNotePh: "Ex. : douleur en bas à droite depuis 2 jours",
    bSummary: "Récapitulatif", bSend: "Envoyer sur WhatsApp", bBack: "Retour", bNext: "Continuer",
    bSent: "WhatsApp s'est ouvert avec votre demande. Appuyez sur « Envoyer » dans WhatsApp : le cabinet vous confirme le rendez-vous.",
    bInfo: "Le créneau est réservé dès que le cabinet vous le confirme sur WhatsApp.",
    bNeedName: "Indiquez votre nom.", bNeedPhone: "Indiquez un numéro valide.",
    bChange: "Modifier",
    waHello: "Bonjour Dr Chraibi, je souhaite prendre rendez-vous :",
    waService: "Soin", waDate: "Date", waTime: "Heure", waName: "Nom", waPhone: "Téléphone", waPatient: "Patient", waNote: "Message",
    waThanks: "Merci de me confirmer ce créneau.",
    waGeneric: "Bonjour Dr Chraibi, j'ai une question :",
    // chat
    cTitle: "Assistant du cabinet", cStatus: "Répond en français, عربية, English",
    cHello: "Bonjour 👋 Je suis l'assistant du cabinet du Dr Chraibi. Décrivez-moi votre problème ou posez votre question, je vous aide à trouver le bon soin et un créneau.",
    cPlaceholder: "Écrivez votre message…", cSend: "Envoyer",
    cChips: ["J'ai mal à une dent", "Détartrage", "Blanchiment", "Horaires et adresse", "Prendre rendez-vous"],
    cYes: "Oui, réserver", cNo: "Non merci", cOffer: "Voulez-vous réserver un rendez-vous pour",
    cPick: "Parfait. Choisissez un jour et une heure :", cHuman: "Écrire au cabinet sur WhatsApp",
    cError: "Je n'arrive pas à répondre pour le moment. Vous pouvez écrire directement au cabinet sur WhatsApp.",
    cTyping: "L'assistant écrit…", cDisclaimer: "L'assistant oriente et aide à réserver ; il ne remplace pas un examen par le dentiste.",
    cNoProblem: "Pas de souci. Avez-vous une autre question ?"
  },

  en: {
    dir: "ltr", label: "EN", locale: "en-GB",
    heroEyebrowShort: "Dentist · Marrakech",
    navServices: "Treatments", navHygiene: "Hygiene", navClinic: "The clinic", navContact: "Contact",
    book: "Book", bookLong: "Book an appointment", chat: "Talk to the assistant", chatShort: "Assistant",
    heroEyebrow: "Dental clinic · Saada, Marrakech",
    heroTitle: "A healthy smile, cared for gently.",
    heroSub: "Dental care, oral hygiene and smile aesthetics. Pick your time slot in 30 seconds and get it confirmed on WhatsApp.",
    heroReviews: "Google reviews",
    heroCard: "Slots available this week",
    openNow: "Open now", closedNow: "Closed", opensAt: "Opens", closesAt: "Closes at",
    qaCall: "Call", qaWhatsApp: "WhatsApp", qaRoute: "Directions", qaHours: "Hours",
    servicesEyebrow: "Our treatments", servicesTitle: "Your whole smile, in one place.",
    servicesSub: "From a simple check-up to a full smile makeover, every treatment is explained before it starts.",
    bookThis: "Book this",
    hygieneEyebrow: "Oral hygiene", hygieneTitle: "Prevention is the best treatment.",
    hygieneSub: "Scaling every 6 months and a good routine at home prevent most cavities and gum problems.",
    routineTitle: "Your daily routine",
    routine: [
      "Brush for 2 minutes, morning and night",
      "Floss or use interdental brushes every night",
      "Brush your tongue too",
      "Limit sugar and soft drinks between meals",
      "Scaling and check-up every 6 months"
    ],
    timerTitle: "Brushing timer", timerStart: "Start 2 minutes", timerStop: "Stop",
    timerDone: "Well done, brushing complete!",
    timerZones: ["Upper right", "Upper left", "Lower left", "Lower right"],
    bookHygiene: "Book a scaling",
    clinicEyebrow: "The clinic", clinicTitle: "A calm place, precise care.",
    clinicSub: "Dr. Chraibi welcomes you in a bright, reassuring clinic in Saada. A simple approach: listen, explain, treat without pain.",
    values: [
      ["Gentle", "Soft anaesthesia and precise care, even for anxious patients."],
      ["Listening", "Time to understand your needs and answer your questions."],
      ["Strict hygiene", "Sterilisation and single-use equipment for every patient."],
      ["Transparency", "A clear treatment plan and quote before we start."]
    ],
    stepsEyebrow: "How it works", stepsTitle: "Your appointment in 3 steps",
    steps: [
      ["Choose", "A treatment, a day and a time in the calendar, or describe your problem to the assistant."],
      ["Send", "Your request goes out on WhatsApp, already written. Nothing to download."],
      ["Confirmed", "The clinic confirms your appointment directly on WhatsApp."]
    ],
    reviewsEyebrow: "They trust us", reviewsTitle: "What our patients say",
    reviewsSource: "Google review (French)",
    faqEyebrow: "FAQ", faqTitle: "You may be wondering…",
    faq: [
      ["How do I book?", "Tap “Book”, choose the treatment, day and time, then send your request on WhatsApp. The clinic confirms quickly."],
      ["Do you see emergencies?", "Yes. For strong pain, an abscess or a broken tooth, choose “Dental emergency” or call the clinic directly."],
      ["How much does treatment cost?", "It depends on your situation. After the exam, Dr. Chraibi gives you a clear quote before any treatment."],
      ["How often should I have a scaling?", "Usually every 6 months, sometimes more often if your gums bleed or if you smoke."],
      ["Do you treat children?", "Yes, from their very first teeth, with visits designed to put them at ease."],
      ["Which languages do you speak?", "Arabic, Darija, French and English."]
    ],
    contactEyebrow: "Find us", contactTitle: "In the heart of Saada, Marrakech",
    hoursTitle: "Opening hours", closed: "Closed", today: "Today",
    days: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    daysShort: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    openMaps: "Open in Google Maps",
    footer: "Dr. Chraibi dental clinic · Saada, Marrakech",
    bTitle: "Book an appointment", bStep1: "Reason", bStep2: "Date", bStep3: "Time", bStep4: "Details",
    bWhat: "Which treatment?", bWhen: "Which day?", bTime: "What time?", bWho: "Your details",
    bMorning: "Morning", bAfternoon: "Afternoon", bNoSlots: "No slots left that day. Please choose another day.",
    bName: "Full name", bPhone: "Phone", bPatient: "You are", bNew: "New patient", bExisting: "Existing patient",
    bNote: "A word about your needs (optional)", bNotePh: "E.g. pain lower right for 2 days",
    bSummary: "Summary", bSend: "Send on WhatsApp", bBack: "Back", bNext: "Continue",
    bSent: "WhatsApp opened with your request. Tap “Send” in WhatsApp and the clinic will confirm your appointment.",
    bInfo: "Your slot is booked once the clinic confirms it on WhatsApp.",
    bNeedName: "Please enter your name.", bNeedPhone: "Please enter a valid number.",
    bChange: "Change",
    waHello: "Hello Dr. Chraibi, I would like to book an appointment:",
    waService: "Treatment", waDate: "Date", waTime: "Time", waName: "Name", waPhone: "Phone", waPatient: "Patient", waNote: "Message",
    waThanks: "Please confirm this slot. Thank you.",
    waGeneric: "Hello Dr. Chraibi, I have a question:",
    cTitle: "Clinic assistant", cStatus: "Replies in English, Français, عربية",
    cHello: "Hello 👋 I'm Dr. Chraibi's clinic assistant. Tell me about your problem or ask me anything, and I'll help you find the right treatment and a time slot.",
    cPlaceholder: "Type your message…", cSend: "Send",
    cChips: ["I have a toothache", "Scaling / cleaning", "Whitening", "Hours & address", "Book an appointment"],
    cYes: "Yes, book", cNo: "No thanks", cOffer: "Would you like to book an appointment for",
    cPick: "Great. Choose a day and a time:", cHuman: "Message the clinic on WhatsApp",
    cError: "I can't answer right now. You can message the clinic directly on WhatsApp.",
    cTyping: "The assistant is typing…", cDisclaimer: "The assistant guides you and helps you book; it does not replace an exam by the dentist.",
    cNoProblem: "No problem. Anything else I can help with?"
  },

  ar: {
    dir: "rtl", label: "ع", locale: "ar-MA",
    heroEyebrowShort: "طبيب أسنان · مراكش",
    navServices: "العلاجات", navHygiene: "النظافة", navClinic: "العيادة", navContact: "اتصل بنا",
    book: "احجز", bookLong: "احجز موعدًا", chat: "تحدث مع المساعد", chatShort: "المساعد",
    heroEyebrow: "عيادة طب الأسنان · السعادة، مراكش",
    heroTitle: "ابتسامة صحية، بعناية ولطف.",
    heroSub: "علاج الأسنان، نظافة الفم وتجميل الابتسامة. اختر موعدك في 30 ثانية، والتأكيد مباشرة عبر واتساب.",
    heroReviews: "تقييم على Google",
    heroCard: "مواعيد متاحة هذا الأسبوع",
    openNow: "مفتوح الآن", closedNow: "مغلق", opensAt: "يفتح", closesAt: "يغلق على",
    qaCall: "اتصال", qaWhatsApp: "واتساب", qaRoute: "الاتجاهات", qaHours: "الأوقات",
    servicesEyebrow: "علاجاتنا", servicesTitle: "كل ما تحتاجه ابتسامتك في مكان واحد.",
    servicesSub: "من الفحص البسيط إلى تجميل الابتسامة بالكامل، نشرح لك كل علاج قبل البدء.",
    bookThis: "احجز هذا العلاج",
    hygieneEyebrow: "نظافة الفم والأسنان", hygieneTitle: "الوقاية هي أفضل علاج.",
    hygieneSub: "إزالة الجير كل 6 أشهر وروتين جيد في المنزل يجنبانك معظم التسوسات ومشاكل اللثة.",
    routineTitle: "روتينك اليومي",
    routine: [
      "تنظيف الأسنان لمدة دقيقتين صباحًا ومساءً",
      "خيط الأسنان أو الفرشاة البينية كل مساء",
      "تنظيف اللسان أيضًا",
      "التقليل من السكر والمشروبات الغازية بين الوجبات",
      "إزالة الجير والفحص كل 6 أشهر"
    ],
    timerTitle: "مؤقت تنظيف الأسنان", timerStart: "ابدأ دقيقتين", timerStop: "إيقاف",
    timerDone: "أحسنت، انتهى التنظيف!",
    timerZones: ["أعلى اليمين", "أعلى اليسار", "أسفل اليسار", "أسفل اليمين"],
    bookHygiene: "احجز إزالة الجير",
    clinicEyebrow: "العيادة", clinicTitle: "مكان هادئ وعلاج دقيق.",
    clinicSub: "يستقبلكم الدكتور الشرايبي في عيادة مشرقة ومريحة في قلب حي السعادة. منهج بسيط: نستمع، نشرح، ونعالج بدون ألم.",
    values: [
      ["اللطف", "تخدير لطيف وحركات دقيقة، حتى للمرضى القلقين."],
      ["الإنصات", "نأخذ الوقت لفهم حاجتك والإجابة عن أسئلتك."],
      ["نظافة صارمة", "تعقيم وأدوات تُستعمل مرة واحدة لكل مريض."],
      ["الشفافية", "خطة علاج وعرض سعر واضحان قبل البدء."]
    ],
    stepsEyebrow: "كيف يعمل", stepsTitle: "موعدك في 3 خطوات",
    steps: [
      ["اختر", "العلاج واليوم والساعة من الرزنامة، أو صف مشكلتك للمساعد."],
      ["أرسل", "يُرسل طلبك عبر واتساب مكتوبًا مسبقًا. لا حاجة لأي تطبيق إضافي."],
      ["تم التأكيد", "تؤكد لك العيادة الموعد مباشرة على واتساب."]
    ],
    reviewsEyebrow: "يثقون بنا", reviewsTitle: "ماذا يقول مرضانا",
    reviewsSource: "تقييم Google (بالفرنسية)",
    faqEyebrow: "أسئلة شائعة", faqTitle: "قد تتساءل…",
    faq: [
      ["كيف أحجز موعدًا؟", "اضغط على «احجز»، اختر العلاج واليوم والساعة، ثم أرسل طلبك عبر واتساب. تؤكد لك العيادة بسرعة."],
      ["هل تستقبلون الحالات المستعجلة؟", "نعم. في حالة ألم شديد أو خراج أو سن مكسور، اختر «حالة مستعجلة» أو اتصل بالعيادة مباشرة."],
      ["كم تكلفة العلاج؟", "تختلف حسب حالتك. بعد الفحص، يقدم لك الدكتور الشرايبي عرض سعر واضحًا قبل أي علاج."],
      ["كل كم يجب إزالة الجير؟", "عادة كل 6 أشهر، وأحيانًا أكثر إذا كانت اللثة تنزف أو إذا كنت مدخنًا."],
      ["هل تعالجون الأطفال؟", "نعم، منذ ظهور الأسنان الأولى، بزيارات مصممة لطمأنتهم."],
      ["ما اللغات التي تتحدثونها؟", "العربية، الدارجة، الفرنسية والإنجليزية."]
    ],
    contactEyebrow: "موقعنا", contactTitle: "في قلب حي السعادة، مراكش",
    hoursTitle: "أوقات العمل", closed: "مغلق", today: "اليوم",
    days: ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"],
    daysShort: ["أحد", "إثنين", "ثلاثاء", "أربعاء", "خميس", "جمعة", "سبت"],
    months: ["يناير", "فبراير", "مارس", "أبريل", "ماي", "يونيو", "يوليوز", "غشت", "شتنبر", "أكتوبر", "نونبر", "دجنبر"],
    openMaps: "افتح في خرائط Google",
    footer: "عيادة الدكتور الشرايبي لطب الأسنان · السعادة، مراكش",
    bTitle: "حجز موعد", bStep1: "السبب", bStep2: "اليوم", bStep3: "الساعة", bStep4: "معلوماتك",
    bWhat: "أي علاج؟", bWhen: "أي يوم؟", bTime: "أي ساعة؟", bWho: "معلوماتك",
    bMorning: "صباحًا", bAfternoon: "بعد الظهر", bNoSlots: "لا توجد مواعيد متبقية في هذا اليوم. اختر يومًا آخر.",
    bName: "الاسم الكامل", bPhone: "الهاتف", bPatient: "أنت", bNew: "مريض جديد", bExisting: "مريض سابق",
    bNote: "كلمة عن حاجتك (اختياري)", bNotePh: "مثال: ألم في الأسفل على اليمين منذ يومين",
    bSummary: "ملخص", bSend: "أرسل عبر واتساب", bBack: "رجوع", bNext: "متابعة",
    bSent: "فُتح واتساب مع طلبك. اضغط «إرسال» في واتساب وستؤكد لك العيادة الموعد.",
    bInfo: "يُحجز الموعد بمجرد أن تؤكده العيادة على واتساب.",
    bNeedName: "أدخل اسمك.", bNeedPhone: "أدخل رقمًا صحيحًا.",
    bChange: "تعديل",
    waHello: "السلام عليكم دكتور الشرايبي، أريد حجز موعد:",
    waService: "العلاج", waDate: "التاريخ", waTime: "الساعة", waName: "الاسم", waPhone: "الهاتف", waPatient: "المريض", waNote: "رسالة",
    waThanks: "المرجو تأكيد هذا الموعد. شكرًا.",
    waGeneric: "السلام عليكم دكتور الشرايبي، عندي سؤال:",
    cTitle: "مساعد العيادة", cStatus: "يجيب بالعربية والدارجة، Français، English",
    cHello: "مرحبًا 👋 أنا مساعد عيادة الدكتور الشرايبي. صف لي مشكلتك أو اطرح سؤالك، وسأساعدك في اختيار العلاج المناسب وموعد.",
    cPlaceholder: "اكتب رسالتك…", cSend: "إرسال",
    cChips: ["عندي ألم في السن", "إزالة الجير", "تبييض الأسنان", "الأوقات والعنوان", "حجز موعد"],
    cYes: "نعم، احجز", cNo: "لا، شكرًا", cOffer: "هل تريد حجز موعد لـ",
    cPick: "ممتاز. اختر اليوم والساعة:", cHuman: "راسل العيادة على واتساب",
    cError: "لا أستطيع الإجابة الآن. يمكنك مراسلة العيادة مباشرة على واتساب.",
    cTyping: "المساعد يكتب…", cDisclaimer: "المساعد يوجهك ويساعدك على الحجز، ولا يعوض فحص الطبيب.",
    cNoProblem: "لا مشكلة. هل عندك سؤال آخر؟"
  }
};
