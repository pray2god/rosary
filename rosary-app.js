const STORAGE_KEY = "rosary-algorithmic-progress";
const SETTINGS_KEY = "rosary-algorithmic-settings";
const UI_LANG_KEY = "rosary-ui-language";
const PRAYER_LANG_KEY = "rosary-prayer-language";
const MYSTERY_CHOICE_KEY = "rosary-mystery-choice";

const mysteryPickerEl = document.getElementById("mysteryPicker");
const mysteryAutoBtn = document.getElementById("mysteryAutoBtn");
const mysteryJoyfulBtn = document.getElementById("mysteryJoyfulBtn");
const mysterySorrowfulBtn = document.getElementById("mysterySorrowfulBtn");
const mysteryGloriousBtn = document.getElementById("mysteryGloriousBtn");
const mysteryLuminousBtn = document.getElementById("mysteryLuminousBtn");

const languageMenuBtn = document.getElementById("languageMenuBtn");
const languageMenuEl = document.getElementById("languageMenu");
const uiLanguageSelect = document.getElementById("uiLanguageSelect");
const prayerLanguageSelect = document.getElementById("prayerLanguageSelect");

const mysteryNameEl = document.getElementById("mysteryName");
const prayerTitleEl = document.getElementById("prayerTitle");
const sectionLabelEl = document.getElementById("sectionLabel");
const progressLabelEl = document.getElementById("progressLabel");

const panelPrevBtn = document.getElementById("panelPrevBtn");
const panelNextBtn = document.getElementById("panelNextBtn");

const appTitleEl = document.getElementById("appTitle");
const heroLabelEl = document.getElementById("heroLabel");
const swipeHintEl = document.getElementById("swipeHint");

const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const resetBtn = document.getElementById("resetBtn");
const resumeBtn = document.getElementById("resumeBtn");

const infoToggleBtn = document.getElementById("infoToggleBtn");
const settingsPanel = document.getElementById("settingsPanel");
const settingsBackdrop = document.getElementById("settingsBackdrop");

const focusModeToggle = document.getElementById("focusModeToggle");
const showTextToggle = document.getElementById("showTextToggle");
const vibrationToggle = document.getElementById("vibrationToggle");

const focusModeLabelEl = document.getElementById("focusModeLabel");
const showTextLabelEl = document.getElementById("showTextLabel");
const vibrationLabelEl = document.getElementById("vibrationLabel");

const prayerViewTitleEl = document.getElementById("prayerViewTitle");
const prayerDetailsTitleEl = document.getElementById("prayerDetailsTitle");
const actionsTitleEl = document.getElementById("actionsTitle");

const panelPrayerTitle = document.getElementById("panelPrayerTitle");
const panelPrayerText = document.getElementById("panelPrayerText");

const uiLangLabelEl = document.getElementById("uiLangLabel");
const prayerLangLabelEl = document.getElementById("prayerLangLabel");

const gestureArea = document.getElementById("gestureArea");
const beadLayer = document.getElementById("beadLayer");
const hitLayer = document.getElementById("hitLayer");
const cordLayer = document.getElementById("cordLayer");

const SVG_NS = "http://www.w3.org/2000/svg";

const SUPABASE_URL = "https://kmmzybkxjrfvnfzylelf.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_zjjrwaPtIqGq2yK5t6JIGg_gkVwzHr7";

const rosarySupabaseClient =
  window.supabase && typeof window.supabase.createClient === "function"
    ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    : null;

async function ensureAnonymousSession() {
  if (!rosarySupabaseClient) {
    console.error("Supabase client not available.");
    return null;
  }

  const {
    data: { session }
  } = await rosarySupabaseClient.auth.getSession();

  if (session) return session;

  const { data, error } = await rosarySupabaseClient.auth.signInAnonymously();

  if (error) {
    console.error("Anonymous sign-in failed:", error);
    return null;
  }

  return data.session;
}

function getTodayDateKey() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

async function trackVisit() {
  const session = await ensureAnonymousSession();
  if (!session?.user?.id) return;

  const userId = session.user.id;
  const dateKey = getTodayDateKey();

  const { error } = await rosarySupabaseClient
    .from("daily_visits")
    .upsert([{ date_key: dateKey, user_id: userId }], {
      onConflict: "date_key,user_id",
      ignoreDuplicates: true
    });

  if (error) {
    console.error("trackVisit failed:", error);
  }
}

async function trackRosaryCompleted() {
  const session = await ensureAnonymousSession();
  if (!session?.user?.id) return;

  const userId = session.user.id;
  const dateKey = getTodayDateKey();

  const { error } = await rosarySupabaseClient
    .from("rosary_completions")
    .insert([{ date_key: dateKey, user_id: userId }]);

  if (error) {
    console.error("trackRosaryCompleted failed:", error);
  }
}

async function loadTodayStats() {
  const session = await ensureAnonymousSession();
  if (!session?.user?.id) return;

  const dateKey = getTodayDateKey();

  const { count: visitorsCount, error: visitorsError } = await rosarySupabaseClient
    .from("daily_visits")
    .select("*", { count: "exact", head: true })
    .eq("date_key", dateKey);

  const { count: rosariesCount, error: rosariesError } = await rosarySupabaseClient
    .from("rosary_completions")
    .select("*", { count: "exact", head: true })
    .eq("date_key", dateKey);

  if (visitorsError) {
    console.error("loadTodayStats visitors failed:", visitorsError);
  }

  if (rosariesError) {
    console.error("loadTodayStats rosaries failed:", rosariesError);
  }

  const visitorsEl = document.getElementById("visitorsToday");
  const rosariesEl = document.getElementById("rosariesToday");

  if (visitorsEl) {
    visitorsEl.textContent = `Visitors today (estimate): ${visitorsCount ?? 0}`;
  }

  if (rosariesEl) {
    rosariesEl.textContent = `Rosaries prayed today: ${rosariesCount ?? 0}`;
  }
}

const UI_TEXT = {
  en: {
    appTitle: "Rosary",
    mysteryOfDay: "Mystery of the day",
    mysteryLabel: "Mystery",
    mysteryTodayDefault: "Use today's mystery",
    mysteryManualSuffix: "manual",
    currentPrayer: "Current prayer",
    opening: "Opening",
    decade: "Decade",
    stepOf: (current, total) => `Step ${current} of ${total}`,
    prayerView: "Prayer View",
    focusMode: "Focus mode",
    showPrayerText: "Show prayer text",
    vibration: "Vibration",
    prayerDetails: "Prayer Details",
    actions: "Actions",
    resumePrayer: "Resume Prayer",
    resetProgress: "Reset Progress",
    previous: "Previous",
    next: "Next",
    swipeHint: "Swipe left/right to move • Tap or hold a bead for details",
    mysteryOfThisBead: "Mystery of this bead",
    addAfterJesus: 'Add after "Jesus"',
    ui: "UI Language",
    prayer: "Prayer Language",
    languageMenuAria: "Open language settings",
    joyfulMysteries: "Joyful Mysteries",
    sorrowfulMysteries: "Sorrowful Mysteries",
    gloriousMysteries: "Glorious Mysteries",
    luminousMysteries: "Luminous Mysteries"
  },
  de: {
    appTitle: "Rosenkranz",
    mysteryOfDay: "Tagesmysterium",
    mysteryLabel: "Geheimnis",
    mysteryTodayDefault: "Tagesmysterium verwenden",
    mysteryManualSuffix: "manuell",
    currentPrayer: "Aktuelles Gebet",
    opening: "Einleitung",
    decade: "Gesätz",
    stepOf: (current, total) => `Schritt ${current} von ${total}`,
    prayerView: "Gebetsansicht",
    focusMode: "Fokusmodus",
    showPrayerText: "Gebetstext anzeigen",
    vibration: "Vibration",
    prayerDetails: "Gebetsdetails",
    actions: "Aktionen",
    resumePrayer: "Zum Gebet zurück",
    resetProgress: "Fortschritt zurücksetzen",
    previous: "Zurück",
    next: "Weiter",
    swipeHint: "Links/rechts wischen • Perle tippen oder halten für Details",
    mysteryOfThisBead: "Geheimnis dieser Perle",
    addAfterJesus: 'Nach „Jesus“ einfügen',
    ui: "UI-Sprache",
    prayer: "Gebetssprache",
    languageMenuAria: "Spracheinstellungen öffnen",
    joyfulMysteries: "Freudenreicher Rosenkranz",
    sorrowfulMysteries: "Schmerzhafter Rosenkranz",
    gloriousMysteries: "Glorreicher Rosenkranz",
    luminousMysteries: "Lichtreicher Rosenkranz"
  },
  it: {
    appTitle: "Rosario",
    mysteryOfDay: "Mistero del giorno",
    mysteryLabel: "Mistero",
    mysteryTodayDefault: "Usa il mistero di oggi",
    mysteryManualSuffix: "manuale",
    currentPrayer: "Preghiera corrente",
    opening: "Introduzione",
    decade: "Decina",
    stepOf: (current, total) => `Passo ${current} di ${total}`,
    prayerView: "Vista della preghiera",
    focusMode: "Modalità concentrazione",
    showPrayerText: "Mostra testo della preghiera",
    vibration: "Vibrazione",
    prayerDetails: "Dettagli della preghiera",
    actions: "Azioni",
    resumePrayer: "Riprendi preghiera",
    resetProgress: "Reimposta progresso",
    previous: "Precedente",
    next: "Successivo",
    swipeHint: "Scorri a sinistra/destra per muoverti • Tocca o tieni premuta una perlina per i dettagli",
    mysteryOfThisBead: "Mistero di questa perlina",
    addAfterJesus: 'Aggiungi dopo "Gesù"',
    ui: "Lingua UI",
    prayer: "Lingua della preghiera",
    languageMenuAria: "Apri impostazioni lingua",
    joyfulMysteries: "Misteri Gaudiosi",
    sorrowfulMysteries: "Misteri Dolorosi",
    gloriousMysteries: "Misteri Gloriosi",
    luminousMysteries: "Misteri Luminosi"
  },
  es: {
    appTitle: "Rosario",
    mysteryOfDay: "Misterio del día",
    mysteryLabel: "Misterio",
    mysteryTodayDefault: "Usar el misterio de hoy",
    mysteryManualSuffix: "manual",
    currentPrayer: "Oración actual",
    opening: "Inicio",
    decade: "Decena",
    stepOf: (current, total) => `Paso ${current} de ${total}`,
    prayerView: "Vista de oración",
    focusMode: "Modo concentración",
    showPrayerText: "Mostrar texto de la oración",
    vibration: "Vibración",
    prayerDetails: "Detalles de la oración",
    actions: "Acciones",
    resumePrayer: "Reanudar oración",
    resetProgress: "Restablecer progreso",
    previous: "Anterior",
    next: "Siguiente",
    swipeHint: "Desliza izquierda/derecha para avanzar • Toca o mantén una cuenta para ver detalles",
    mysteryOfThisBead: "Misterio de esta cuenta",
    addAfterJesus: 'Añadir después de "Jesús"',
    ui: "Idioma de la interfaz",
    prayer: "Idioma de la oración",
    languageMenuAria: "Abrir ajustes de idioma",
    joyfulMysteries: "Misterios Gozosos",
    sorrowfulMysteries: "Misterios Dolorosos",
    gloriousMysteries: "Misterios Gloriosos",
    luminousMysteries: "Misterios Luminosos"
  }
};

const LITURGY = {
  en: {
    prayerTitles: {
      signOfCross: "Sign of the Cross",
      apostlesCreed: "Apostles’ Creed",
      hailMary: "Hail Mary",
      ourFather: "Our Father",
      gloryBe: "Glory Be",
      fatimaPrayer: "Fatima Prayer"
    },
    prayers: {
      signOfCross:
        "In the name of the Father, and of the Son, and of the Holy Spirit. Amen.",
      apostlesCreed: "I believe in God, the Father almighty, Creator of heaven and earth, and in Jesus Christ, his only Son, our Lord, who was conceived by the Holy Spirit, born of the Virgin Mary, suffered under Pontius Pilate, was crucified, died and was buried; he descended into hell; on the third day he rose again from the dead; he ascended into heaven, and is seated at the right hand of God the Father almighty; from there he will come to judge the living and the dead. I believe in the Holy Spirit, the holy catholic Church, the communion of saints, the forgiveness of sins, the resurrection of the body, and life everlasting. Amen.",
      hailMary:
        "Hail Mary, full of grace, the Lord is with thee. Blessed art thou among women, and blessed is the fruit of thy womb, Jesus. Holy Mary, Mother of God, pray for us sinners, now and at the hour of our death. Amen.",
      ourFather:
        "Our Father, who art in heaven, hallowed be thy name; thy kingdom come; thy will be done on earth as it is in heaven. Give us this day our daily bread, and forgive us our trespasses, as we forgive those who trespass against us. And lead us not into temptation, but deliver us from evil. Amen.",
      gloryBe:
        "Glory be to the Father, and to the Son, and to the Holy Spirit. As it was in the beginning, is now, and ever shall be, world without end. Amen.",
      fatima:
        "O my Jesus, forgive us our sins, save us from the fires of hell, and lead all souls to heaven, especially those most in need of Thy mercy."
    },
    meditations: {
      beginSlowly: "Begin slowly. Settle your attention.",
      enterPrayer: "Enter prayer with intention.",
      openingHailMary: (i) => `Opening Hail Mary ${i} of 3.`,
      pauseBeforeDecades: "Pause for a moment, and turn your heart in prayer and intention toward God.",
      hailMaryOf10: (mysteryTitle, i) => `${mysteryTitle} • Hail Mary ${i} of 10`,
      mysteryNumber: (decade, mysteryTitle) => `Mystery ${decade}: ${mysteryTitle}`
    },
    openingInsertions: [
      "increase our faith.",
      "strengthen our hope.",
      "enkindle our charity."
    ],
    mysteries: {
      joyfulSetName: "Joyful Mysteries",
      sorrowfulSetName: "Sorrowful Mysteries",
      gloriousSetName: "Glorious Mysteries",
      luminousSetName: "Luminous Mysteries",
      joyful: [
        { title: "The Annunciation", insert: "Jesus, whom thou, O Virgin, didst conceive by the Holy Spirit." },
        { title: "The Visitation", insert: "Jesus, whom thou, O Virgin, didst carry to Elizabeth." },
        { title: "The Nativity", insert: "Jesus, whom thou, O Virgin, didst bring forth." },
        { title: "The Presentation in the Temple", insert: "Jesus, whom thou, O Virgin, didst present in the Temple." },
        { title: "The Finding in the Temple", insert: "Jesus, whom thou, O Virgin, didst find in the Temple." }
      ],
      sorrowful: [
        { title: "The Agony in the Garden", insert: "Jesus, who for us did sweat blood in the garden." },
        { title: "The Scourging at the Pillar", insert: "Jesus, who for us was scourged at the pillar." },
        { title: "The Crowning with Thorns", insert: "Jesus, who for us was crowned with thorns." },
        { title: "The Carrying of the Cross", insert: "Jesus, who for us carried the heavy cross." },
        { title: "The Crucifixion", insert: "Jesus, who for us was crucified." }
      ],
      glorious: [
        { title: "The Resurrection", insert: "Jesus, who rose glorious from the dead." },
        { title: "The Ascension", insert: "Jesus, who ascended into heaven." },
        { title: "The Descent of the Holy Spirit", insert: "Jesus, who sent us the Holy Spirit." },
        { title: "The Assumption", insert: "Jesus, who took thee up into heaven." },
        { title: "The Coronation of Mary", insert: "Jesus, who crowned thee Queen of heaven and earth." }
      ],
      luminous: [
        { title: "The Baptism of Jesus", insert: "Jesus, who was baptized in the Jordan." },
        { title: "The Wedding at Cana", insert: "Jesus, who revealed His glory at Cana." },
        { title: "The Proclamation of the Kingdom", insert: "Jesus, who proclaimed the Kingdom of God." },
        { title: "The Transfiguration", insert: "Jesus, who was transfigured on the mountain." },
        { title: "The Institution of the Eucharist", insert: "Jesus, who gave us His Body and Blood in the Eucharist." }
      ]
    }
  },

  de: {
    prayerTitles: {
      signOfCross: "Kreuzzeichen",
      apostlesCreed: "Apostolisches Glaubensbekenntnis",
      hailMary: "Gegrüßet seist du, Maria",
      ourFather: "Vaterunser",
      gloryBe: "Ehre sei dem Vater",
      fatimaPrayer: "Fatima-Gebet"
    },
    prayers: {
      signOfCross:
        "Im Namen des Vaters und des Sohnes und des Heiligen Geistes. Amen.",
      apostlesCreed:  "Ich glaube an Gott den Vater, den Allmächtigen, den Schöpfer des Himmels und der Erde. Und an Jesus Christus, seinen eingeborenen Sohn, unsern Herrn, empfangen durch den Heiligen Geist, geboren aus der Jungfrau Maria, gelitten unter Pontius Pilatus, gekreuzigt, gestorben und begraben, hinabgestiegen in das Reich des Todes, am dritten Tag auferstanden von den Toten, aufgefahren in den Himmel; er sitzt zur Rechten Gottes, des allmächtigen Vaters; von dort wird er kommen, zu richten die Lebenden und die Toten. Ich glaube an den Heiligen Geist, die heilige katholische Kirche, Gemeinschaft der Heiligen, Vergebung der Sünden, Auferstehung der Toten und das ewige Leben. Amen.",
      hailMary:
        "Gegrüßet seist du, Maria, voll der Gnade, der Herr ist mit dir. Du bist gebenedeit unter den Frauen und gebenedeit ist die Frucht deines Leibes, Jesus. Heilige Maria, Mutter Gottes, bitte für uns Sünder jetzt und in der Stunde unseres Todes. Amen.",
      ourFather:
        "Vater unser im Himmel, geheiligt werde dein Name. Dein Reich komme. Dein Wille geschehe, wie im Himmel so auf Erden. Unser tägliches Brot gib uns heute und vergib uns unsere Schuld, wie auch wir vergeben unseren Schuldigern. Und führe uns nicht in Versuchung, sondern erlöse uns von dem Bösen. Amen.",
      gloryBe:
        "Ehre sei dem Vater und dem Sohn und dem Heiligen Geist, wie im Anfang, so auch jetzt und alle Zeit und in Ewigkeit. Amen.",
      fatima:
        "O mein Jesus, verzeih uns unsere Sünden! Bewahre uns vor dem Feuer der Hölle! Führe alle Seelen in den Himmel, besonders jene, die deiner Barmherzigkeit am meisten bedürfen. Amen."
    },
    meditations: {
      beginSlowly: "",
      enterPrayer: "",
      openingHailMary: (i) => `Einleitendes Gegrüßet seist du, Maria ${i} von 3.`,
      pauseBeforeDecades: "Halte kurz inne und richte Dich mit Deinen Gebeten und Anliegen an Gott.",
      hailMaryOf10: (mysteryTitle, i) => `${mysteryTitle} • Ave Maria ${i} von 10`,
      mysteryNumber: (decade, mysteryTitle) => `${decade}. Geheimnis: ${mysteryTitle}`
    },
    openingInsertions: [
      "der in uns den Glauben vermehre.",
      "der in uns die Hoffnung stärke.",
      "der in uns die Liebe entzünde."
    ],
    mysteries: {
      joyfulSetName: "Freudenreicher Rosenkranz",
      sorrowfulSetName: "Schmerzhafter Rosenkranz",
      gloriousSetName: "Glorreicher Rosenkranz",
      luminousSetName: "Lichtreicher Rosenkranz",
      joyful: [
        { title: "Die Verkündigung des Herrn", insert: "Jesus, den du, o Jungfrau, vom Heiligen Geist empfangen hast." },
        { title: "Die Heimsuchung Mariens", insert: "Jesus, den du, o Jungfrau, zu Elisabet getragen hast." },
        { title: "Die Geburt Jesu", insert: "Jesus, den du, o Jungfrau, geboren hast." },
        { title: "Die Darstellung Jesu im Tempel", insert: "Jesus, den du, o Jungfrau, im Tempel aufgeopfert hast." },
        { title: "Die Wiederfindung Jesu im Tempel", insert: "Jesus, den du, o Jungfrau, im Tempel wiedergefunden hast." }
      ],
      sorrowful: [
        { title: "Jesus, der für uns Blut geschwitzt hat", insert: "der für uns Blut geschwitzt hat." },
        { title: "Jesus, der für uns gegeißelt worden ist", insert: "der für uns gegeißelt worden ist." },
        { title: "Jesus, der für uns mit Dornen gekrönt worden ist", insert: "der für uns mit Dornen gekrönt worden ist." },
        { title: "Jesus, der für uns das schwere Kreuz getragen hat", insert: "der für uns das schwere Kreuz getragen hat." },
        { title: "Jesus, der für uns gekreuzigt worden ist", insert: "der für uns gekreuzigt worden ist." }
      ],
      glorious: [
        { title: "Jesus, der von den Toten auferstanden ist", insert: "der von den Toten auferstanden ist." },
        { title: "Jesus, der in den Himmel aufgefahren ist", insert: "der in den Himmel aufgefahren ist." },
        { title: "Jesus, der uns den Heiligen Geist gesandt hat", insert: "der uns den Heiligen Geist gesandt hat." },
        { title: "Jesus, der dich, o Jungfrau, in den Himmel aufgenommen hat", insert: "der dich, o Jungfrau, in den Himmel aufgenommen hat." },
        { title: "Jesus, der dich, o Jungfrau, im Himmel gekrönt hat", insert: "der dich, o Jungfrau, im Himmel gekrönt hat." }
      ],
      luminous: [
        { title: "Jesus, der von Johannes getauft worden ist", insert: "der von Johannes getauft worden ist." },
        { title: "Jesus, der sich bei der Hochzeit in Kana offenbart hat", insert: "der sich bei der Hochzeit in Kana offenbart hat." },
        { title: "Jesus, der uns das Reich Gottes verkündet hat", insert: "der uns das Reich Gottes verkündet hat." },
        { title: "Jesus, der auf dem Berg verklärt worden ist", insert: "der auf dem Berg verklärt worden ist." },
        { title: "Jesus, der uns die Eucharistie geschenkt hat", insert: "der uns die Eucharistie geschenkt hat." }
      ]
    }
  },

  la: {
    prayerTitles: {
      signOfCross: "Signum Crucis",
      apostlesCreed: "Symbolum Apostolorum",
      hailMary: "Ave Maria",
      ourFather: "Pater Noster",
      gloryBe: "Gloria Patri",
      fatimaPrayer: "Oratio Fatimae"
    },
    prayers: {
      signOfCross:
        "In nomine Patris, et Filii, et Spiritus Sancti. Amen.",
      apostlesCreed: "Credo in Deum Patrem omnipotentem, Creatorem caeli et terrae. Et in Iesum Christum, Filium eius unicum, Dominum nostrum, qui conceptus est de Spiritu Sancto, natus ex Maria Virgine, passus sub Pontio Pilato, crucifixus, mortuus, et sepultus, descendit ad inferos, tertia die resurrexit a mortuis, ascendit ad caelos, sedet ad dexteram Dei Patris omnipotentis, inde venturus est iudicare vivos et mortuos. Credo in Spiritum Sanctum, sanctam Ecclesiam catholicam, sanctorum communionem, remissionem peccatorum, carnis resurrectionem, vitam aeternam. Amen.",
      hailMary:
        "Ave Maria, gratia plena, Dominus tecum. Benedicta tu in mulieribus, et benedictus fructus ventris tui, Iesus. Sancta Maria, Mater Dei, ora pro nobis peccatoribus nunc et in hora mortis nostrae. Amen.",
      ourFather:
        "Pater noster, qui es in caelis, sanctificetur nomen tuum. Adveniat regnum tuum. Fiat voluntas tua sicut in caelo et in terra. Panem nostrum quotidianum da nobis hodie et dimitte nobis debita nostra sicut et nos dimittimus debitoribus nostris. Et ne nos inducas in tentationem sed libera nos a malo. Amen.",
      gloryBe:
        "Gloria Patri, et Filio, et Spiritui Sancto. Sicut erat in principio, et nunc, et semper, et in saecula saeculorum. Amen.",
      fatima:
        "O mi Iesu, dimitte nobis debita nostra, libera nos ab igne inferni, conduc in caelum omnes animas, praesertim illas quae maxime indigent misericordia tua."
    },
    meditations: {
      beginSlowly: "",
      enterPrayer: "",
      openingHailMary: (i) => `Ave Maria initii ${i} ex 3.`,
      pauseBeforeDecades: "",
      hailMaryOf10: (mysteryTitle, i) => `${mysteryTitle} • Ave Maria ${i} ex 10`,
      mysteryNumber: (decade, mysteryTitle) => `Mysterium ${decade}: ${mysteryTitle}`
    },
    openingInsertions: [
      "qui adaugeat nobis fidem.",
      "qui corroboret nobis spem.",
      "qui perficiat in nobis caritatem."
    ],
    mysteries: {
      joyfulSetName: "Mysteria Gaudiosa",
      sorrowfulSetName: "Mysteria Dolorosa",
      gloriousSetName: "Mysteria Gloriosa",
      luminousSetName: "Mysteria Luminosa",
      joyful: [
        { title: "Annuntiatio", insert: "Iesus, quem Virgo per Spiritum Sanctum concepisti." },
        { title: "Visitatio", insert: "Iesus, quem Virgo Elisabeth portasti." },
        { title: "Nativitas", insert: "Iesus, quem Virgo genuisti." },
        { title: "Praesentatio in Templo", insert: "Iesus, quem Virgo in templo praesentasti." },
        { title: "Inventio in Templo", insert: "Iesus, quem Virgo in templo invenisti." }
      ],
      sorrowful: [
        { title: "Agonia in horto", insert: "Iesus, qui pro nobis sanguinem sudavit." },
        { title: "Flagellatio", insert: "Iesus, qui pro nobis flagellatus est." },
        { title: "Coronatio spinea", insert: "Iesus, qui pro nobis spinis coronatus est." },
        { title: "Baiulatio crucis", insert: "Iesus, qui pro nobis crucem baiulavit." },
        { title: "Crucifixio", insert: "Iesus, qui pro nobis crucifixus est." }
      ],
      glorious: [
        { title: "Resurrectio", insert: "Iesus, qui a mortuis resurrexit." },
        { title: "Ascensio", insert: "Iesus, qui in caelum ascendit." },
        { title: "Descensus Spiritus Sancti", insert: "Iesus, qui nobis Spiritum Sanctum misit." },
        { title: "Assumptio", insert: "Iesus, qui te, Virgo, in caelum assumpsit." },
        { title: "Coronatio Mariae", insert: "Iesus, qui te, Virgo, in caelo coronavit." }
      ],
      luminous: [
        { title: "Baptisma in Iordane", insert: "Iesus, qui in Iordane baptizatus est." },
        { title: "Nuptiae Canae", insert: "Iesus, qui apud Canense matrimonium se manifestavit." },
        { title: "Proclamatio Regni Dei", insert: "Iesus, qui Regnum Dei annuntiavit." },
        { title: "Transfiguratio", insert: "Iesus, qui in monte transfiguratus est." },
        { title: "Institutio Eucharistiae", insert: "Iesus, qui nobis Eucharistiam dedit." }
      ]
    }
  },

  it: {
    prayerTitles: {
      signOfCross: "Segno della Croce",
      apostlesCreed: "Credo degli Apostoli",
      hailMary: "Ave Maria",
      ourFather: "Padre Nostro",
      gloryBe: "Gloria al Padre",
      fatimaPrayer: "Preghiera di Fatima"
    },
    prayers: {
      signOfCross:
        "Nel nome del Padre e del Figlio e dello Spirito Santo. Amen.",
      apostlesCreed: "Credo in Dio, Padre onnipotente, Creatore del cielo e della terra. E in Gesù Cristo, Suo Figlio unigenito, Signore nostro; il quale fu concepito di Spirito Santo, nato dalla vergine Maria; soffrì sotto Ponzio Pilato, fu crocifisso, morì e fu sepolto; discese agli inferi; il terzo giorno risuscitò dai morti; ascese al cielo; siede alla destra di Dio Padre onnipotente; da dove verrà per giudicare i vivi ed i morti. Io credo nello Spirito Santo; la santa Chiesa universale; la comunione dei santi; la remissione dei peccati; la risurrezione della carne; la vita eterna. Amen.",
      hailMary:
        "Ave Maria, piena di grazia, il Signore è con te. Tu sei benedetta fra le donne e benedetto è il frutto del tuo seno, Gesù. Santa Maria, Madre di Dio, prega per noi peccatori, adesso e nell'ora della nostra morte. Amen.",
      ourFather:
        "Padre nostro che sei nei cieli, sia santificato il tuo nome, venga il tuo regno, sia fatta la tua volontà, come in cielo così in terra. Dacci oggi il nostro pane quotidiano e rimetti a noi i nostri debiti come anche noi li rimettiamo ai nostri debitori, e non abbandonarci alla tentazione, ma liberaci dal male. Amen.",
      gloryBe:
        "Gloria al Padre e al Figlio e allo Spirito Santo. Come era nel principio, ora e sempre, nei secoli dei secoli. Amen.",
      fatima:
        "Gesù mio, perdona le nostre colpe, preservaci dal fuoco dell'inferno, porta in cielo tutte le anime, specialmente le più bisognose della tua misericordia."
    },
    meditations: {
      beginSlowly: "Inizia lentamente. Raccogli la tua attenzione.",
      enterPrayer: "Entra nella preghiera con intenzione.",
      openingHailMary: (i) => `Ave Maria iniziale ${i} di 3.`,
      pauseBeforeDecades: "Fermati un momento e rivolgi il cuore a Dio con la tua preghiera e le tue intenzioni.",
      hailMaryOf10: (mysteryTitle, i) => `${mysteryTitle} • Ave Maria ${i} di 10`,
      mysteryNumber: (decade, mysteryTitle) => `Mistero ${decade}: ${mysteryTitle}`
    },
    openingInsertions: [
      "accresca in noi la fede.",
      "rafforzi in noi la speranza.",
      "infiammi in noi la carità."
    ],
    mysteries: {
      joyfulSetName: "Misteri Gaudiosi",
      sorrowfulSetName: "Misteri Dolorosi",
      gloriousSetName: "Misteri Gloriosi",
      luminousSetName: "Misteri Luminosi",
      joyful: [
        { title: "L'Annunciazione", insert: "Gesù, che tu, o Vergine, hai concepito per opera dello Spirito Santo." },
        { title: "La Visitazione", insert: "Gesù, che tu, o Vergine, hai portato a Elisabetta." },
        { title: "La Natività", insert: "Gesù, che tu, o Vergine, hai dato alla luce." },
        { title: "La Presentazione al Tempio", insert: "Gesù, che tu, o Vergine, hai presentato al Tempio." },
        { title: "Il Ritrovamento di Gesù nel Tempio", insert: "Gesù, che tu, o Vergine, hai ritrovato nel Tempio." }
      ],
      sorrowful: [
        { title: "L'Agonia di Gesù nell'orto", insert: "Gesù, che per noi sudò sangue nell'orto." },
        { title: "La Flagellazione di Gesù", insert: "Gesù, che per noi fu flagellato." },
        { title: "L'Incoronazione di spine", insert: "Gesù, che per noi fu coronato di spine." },
        { title: "Gesù porta la croce al Calvario", insert: "Gesù, che per noi portò la croce." },
        { title: "La Crocifissione e morte di Gesù", insert: "Gesù, che per noi fu crocifisso." }
      ],
      glorious: [
        { title: "La Risurrezione di Gesù", insert: "Gesù, che è risorto dai morti." },
        { title: "L'Ascensione di Gesù al cielo", insert: "Gesù, che è asceso al cielo." },
        { title: "La Discesa dello Spirito Santo", insert: "Gesù, che ci ha mandato lo Spirito Santo." },
        { title: "L'Assunzione di Maria", insert: "Gesù, che ti ha assunto in cielo." },
        { title: "L'Incoronazione di Maria", insert: "Gesù, che ti ha incoronata Regina del cielo e della terra." }
      ],
      luminous: [
        { title: "Il Battesimo di Gesù al Giordano", insert: "Gesù, che fu battezzato nel Giordano." },
        { title: "Le Nozze di Cana", insert: "Gesù, che manifestò la sua gloria a Cana." },
        { title: "L'Annuncio del Regno di Dio", insert: "Gesù, che annunciò il Regno di Dio." },
        { title: "La Trasfigurazione di Gesù", insert: "Gesù, che si trasfigurò sul monte." },
        { title: "L'Istituzione dell'Eucaristia", insert: "Gesù, che ci donò il suo Corpo e il suo Sangue nell'Eucaristia." }
      ]
    }
  },

  es: {
    prayerTitles: {
      signOfCross: "Señal de la Cruz",
      apostlesCreed: "Credo de los Apóstoles",
      hailMary: "Dios te salve, María",
      ourFather: "Padre Nuestro",
      gloryBe: "Gloria",
      fatimaPrayer: "Oración de Fátima"
    },
    prayers: {
      signOfCross:
        "En el nombre del Padre, y del Hijo, y del Espíritu Santo. Amén.",
      apostlesCreed: "Creo en Dios Padre, Todopoderoso, Creador del cielo y de la tierra. Y en Jesucristo, su único Hijo, Nuestro Señor, que fue concebido por obra y gracia del Espíritu Santo, nació de Santa María Virgen, padeció bajo el poder de Poncio Pilato, fue crucificado, muerto y sepultado, descendió a los infiernos, al tercer día resucitó entre los muertos, subió a los cielos y está sentado a la derecha de Dios Padre, Todopoderoso. Desde allí vendrá a juzgar a vivos y a muertos. Creo en el Espíritu Santo, la Santa Iglesia Cristiana, la comunión de los santos, el perdón de los pecados, la resurrección de la carne y la vida perdurable.  Amén.",
      hailMary:
        "Dios te salve, María, llena eres de gracia, el Señor es contigo. Bendita tú eres entre todas las mujeres y bendito es el fruto de tu vientre, Jesús. Santa María, Madre de Dios, ruega por nosotros pecadores, ahora y en la hora de nuestra muerte. Amén.",
      ourFather:
        "Padre nuestro, que estás en el cielo, santificado sea tu nombre; venga a nosotros tu reino; hágase tu voluntad en la tierra como en el cielo. Danos hoy nuestro pan de cada día; perdona nuestras ofensas, como también nosotros perdonamos a los que nos ofenden; no nos dejes caer en la tentación, y líbranos del mal. Amén.",
      gloryBe:
        "Gloria al Padre, y al Hijo, y al Espíritu Santo. Como era en el principio, ahora y siempre, por los siglos de los siglos. Amén.",
      fatima:
        "Oh Jesús mío, perdona nuestros pecados, líbranos del fuego del infierno, lleva al cielo a todas las almas, especialmente a las más necesitadas de tu misericordia."
    },
    meditations: {
      beginSlowly: "Comienza despacio. Recoge tu atención.",
      enterPrayer: "Entra en la oración con intención.",
      openingHailMary: (i) => `Dios te salve, María inicial ${i} de 3.`,
      pauseBeforeDecades: "Haz una pausa y dirige tu corazón a Dios con tu oración y tus intenciones.",
      hailMaryOf10: (mysteryTitle, i) => `${mysteryTitle} • Ave María ${i} de 10`,
      mysteryNumber: (decade, mysteryTitle) => `Misterio ${decade}: ${mysteryTitle}`
    },
    openingInsertions: [
      "aumente en nosotros la fe.",
      "fortalezca en nosotros la esperanza.",
      "encienda en nosotros la caridad."
    ],
    mysteries: {
      joyfulSetName: "Misterios Gozosos",
      sorrowfulSetName: "Misterios Dolorosos",
      gloriousSetName: "Misterios Gloriosos",
      luminousSetName: "Misterios Luminosos",
      joyful: [
        { title: "La Anunciación", insert: "Jesús, a quien tú, Virgen, concebiste por obra del Espíritu Santo." },
        { title: "La Visitación", insert: "Jesús, a quien tú, Virgen, llevaste a Isabel." },
        { title: "El Nacimiento de Jesús", insert: "Jesús, a quien tú, Virgen, diste a luz." },
        { title: "La Presentación en el Templo", insert: "Jesús, a quien tú, Virgen, presentaste en el Templo." },
        { title: "El Niño Jesús perdido y hallado en el Templo", insert: "Jesús, a quien tú, Virgen, hallaste en el Templo." }
      ],
      sorrowful: [
        { title: "La Agonía de Jesús en el Huerto", insert: "Jesús, que por nosotros sudó sangre en el huerto." },
        { title: "La Flagelación de Jesús", insert: "Jesús, que por nosotros fue azotado." },
        { title: "La Coronación de espinas", insert: "Jesús, que por nosotros fue coronado de espinas." },
        { title: "Jesús con la Cruz a cuestas", insert: "Jesús, que por nosotros llevó la cruz." },
        { title: "La Crucifixión y Muerte de Jesús", insert: "Jesús, que por nosotros fue crucificado." }
      ],
      glorious: [
        { title: "La Resurrección del Señor", insert: "Jesús, que resucitó de entre los muertos." },
        { title: "La Ascensión del Señor", insert: "Jesús, que subió al cielo." },
        { title: "La Venida del Espíritu Santo", insert: "Jesús, que nos envió el Espíritu Santo." },
        { title: "La Asunción de María", insert: "Jesús, que te llevó al cielo." },
        { title: "La Coronación de María", insert: "Jesús, que te coronó Reina del cielo y de la tierra." }
      ],
      luminous: [
        { title: "El Bautismo de Jesús en el Jordán", insert: "Jesús, que fue bautizado en el Jordán." },
        { title: "Las Bodas de Caná", insert: "Jesús, que manifestó su gloria en Caná." },
        { title: "El Anuncio del Reino de Dios", insert: "Jesús, que proclamó el Reino de Dios." },
        { title: "La Transfiguración", insert: "Jesús, que se transfiguró en el monte." },
        { title: "La Institución de la Eucaristía", insert: "Jesús, que nos dio su Cuerpo y su Sangre en la Eucaristía." }
      ]
    }
  }
};

let cancelActiveLongPress = null;
let currentUILang = loadUiLanguage();
let currentPrayerLang = loadPrayerLanguage();
let currentMysteryChoice = loadMysteryChoice();
let settings = loadSettings();
let previousIndex = null;

settings.focusMode = false;
saveSettings();

let rosaryNodes = buildRosaryData();
const rosaryGeometry = buildGeometry();
let currentIndex = loadProgress();

if (currentIndex >= rosaryNodes.length) {
  currentIndex = 0;
}

applySettings();
applyUIText();
renderCurrent();
renderRosary();
updateLanguageControls();
updateMysteryPickerButtons();
closeMysteryPicker();
closeLanguageMenu();

if (rosarySupabaseClient) {
  ensureAnonymousSession().then(async () => {
    await trackVisit();
    await loadTodayStats();
  });
} else {
  console.error("Supabase failed to initialize.");
}

prevBtn.addEventListener("click", () => moveTo(getPreviousIndex(currentIndex)));
nextBtn.addEventListener("click", () => moveTo(getNextIndex(currentIndex)));

panelPrevBtn.addEventListener("click", () => {
  moveTo(getPreviousIndex(currentIndex));
  openPanel();
});

panelNextBtn.addEventListener("click", () => {
  moveTo(getNextIndex(currentIndex));
  openPanel();
});

resetBtn.addEventListener("click", () => {
  previousIndex = null;
  currentIndex = 0;
  saveProgress();
  renderCurrent();
  renderRosary();
});

resumeBtn.addEventListener("click", closePanel);
infoToggleBtn.addEventListener("click", openPanel);
settingsBackdrop.addEventListener("click", closePanel);

focusModeToggle.addEventListener("change", () => {
  settings.focusMode = focusModeToggle.checked;
  saveSettings();
  applySettings();
});

showTextToggle.addEventListener("change", () => {
  settings.showText = showTextToggle.checked;
  saveSettings();
  updatePanelForCurrentBead();
});

vibrationToggle.addEventListener("change", () => {
  settings.vibration = vibrationToggle.checked;
  saveSettings();
});

languageMenuBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  toggleLanguageMenu();
});

uiLanguageSelect.addEventListener("change", () => {
  setUiLanguage(uiLanguageSelect.value);
});

prayerLanguageSelect.addEventListener("change", () => {
  setPrayerLanguage(prayerLanguageSelect.value);
});

mysteryNameEl.addEventListener("click", (e) => {
  e.stopPropagation();
  toggleMysteryPicker();
});

mysteryAutoBtn.addEventListener("click", () => setMysteryChoice("auto"));
mysteryJoyfulBtn.addEventListener("click", () => setMysteryChoice("joyful"));
mysterySorrowfulBtn.addEventListener("click", () => setMysteryChoice("sorrowful"));
mysteryGloriousBtn.addEventListener("click", () => setMysteryChoice("glorious"));
mysteryLuminousBtn.addEventListener("click", () => setMysteryChoice("luminous"));

document.addEventListener("click", (e) => {
  if (
    mysteryPickerEl &&
    !mysteryPickerEl.classList.contains("hidden") &&
    !mysteryPickerEl.contains(e.target) &&
    e.target !== mysteryNameEl
  ) {
    closeMysteryPicker();
  }

  if (
    languageMenuEl &&
    !languageMenuEl.classList.contains("hidden") &&
    !languageMenuEl.contains(e.target) &&
    e.target !== languageMenuBtn
  ) {
    closeLanguageMenu();
  }
});

setupSwipeNavigation();
setupPanelSwipeNavigation();

function ui() {
  return UI_TEXT[currentUILang] || UI_TEXT.en;
}

function liturgy() {
  return LITURGY[currentPrayerLang] || LITURGY.en;
}

function setUiLanguage(lang) {
  currentUILang = ["en", "de", "it", "es"].includes(lang) ? lang : "en";
  localStorage.setItem(UI_LANG_KEY, currentUILang);
  applyUIText();
  renderCurrent();
  updateLanguageControls();
}

function setPrayerLanguage(lang) {
  currentPrayerLang = ["en", "de", "la", "it", "es"].includes(lang) ? lang : "en";
  localStorage.setItem(PRAYER_LANG_KEY, currentPrayerLang);

  rosaryNodes = buildRosaryData();

  if (currentIndex >= rosaryNodes.length) {
    currentIndex = 0;
  }

  renderCurrent();
  renderRosary();
  updateLanguageControls();
}

function updateLanguageControls() {
  uiLanguageSelect.value = currentUILang;
  prayerLanguageSelect.value = currentPrayerLang;
}

function applyUIText() {
  const t = ui();

  document.documentElement.lang = currentUILang;
  document.title = t.appTitle;

  appTitleEl.textContent = t.appTitle;
  heroLabelEl.textContent = t.currentPrayer;
  prayerViewTitleEl.textContent = t.prayerView;
  prayerDetailsTitleEl.textContent = t.prayerDetails;
  actionsTitleEl.textContent = t.actions;

  focusModeLabelEl.textContent = t.focusMode;
  showTextLabelEl.textContent = t.showPrayerText;
  vibrationLabelEl.textContent = t.vibration;

  prevBtn.textContent = t.previous;
  nextBtn.textContent = t.next;
  panelPrevBtn.textContent = t.previous;
  panelNextBtn.textContent = t.next;
  resumeBtn.textContent = t.resumePrayer;
  resetBtn.textContent = t.resetProgress;
  swipeHintEl.textContent = t.swipeHint;

  uiLangLabelEl.textContent = t.ui;
  prayerLangLabelEl.textContent = t.prayer;

  infoToggleBtn.setAttribute("aria-label", t.prayerDetails);
  languageMenuBtn.setAttribute("aria-label", t.languageMenuAria);

  mysteryAutoBtn.textContent = t.mysteryTodayDefault;
  mysteryJoyfulBtn.textContent = t.joyfulMysteries;
  mysterySorrowfulBtn.textContent = t.sorrowfulMysteries;
  mysteryGloriousBtn.textContent = t.gloriousMysteries;
  mysteryLuminousBtn.textContent = t.luminousMysteries;

  updateLanguageControls();
  updateMysteryPickerButtons();
  renderMysteryName();
  updatePanelForCurrentBead();
}

function stripLeadingJesus(insert) {
  return insert
    .replace(/^Jesus,\s*/i, "")
    .replace(/^Iesus,\s*/i, "")
    .replace(/^Gesù,\s*/i, "")
    .replace(/^Jesús,\s*/i, "")
    .trim();
}

function buildInsertedHailMary(basePrayer, insert) {
  const cleanInsert = stripLeadingJesus(insert);

  if (basePrayer.includes("Iesus.")) {
    return basePrayer.replace("Iesus.", `Iesus, ${cleanInsert}`);
  }

  if (basePrayer.includes("Gesù.")) {
    return basePrayer.replace("Gesù.", `Gesù, ${cleanInsert}`);
  }

  if (basePrayer.includes("Jesús.")) {
    return basePrayer.replace("Jesús.", `Jesús, ${cleanInsert}`);
  }

  return basePrayer.replace("Jesus.", `Jesus, ${cleanInsert}`);
}

function loadMysteryChoice() {
  const value = localStorage.getItem(MYSTERY_CHOICE_KEY);
  return ["auto", "joyful", "sorrowful", "glorious", "luminous"].includes(value)
    ? value
    : "auto";
}

function saveMysteryChoice() {
  localStorage.setItem(MYSTERY_CHOICE_KEY, currentMysteryChoice);
}

function getDefaultMysteryKeyForToday() {
  const day = new Date().getDay();

  if (day === 1 || day === 6) return "joyful";
  if (day === 2 || day === 5) return "sorrowful";
  if (day === 4) return "luminous";
  return "glorious";
}

function getActiveMysteryKey() {
  return currentMysteryChoice === "auto"
    ? getDefaultMysteryKeyForToday()
    : currentMysteryChoice;
}

function getMysterySetByKey(key) {
  const mysteries = liturgy().mysteries;
  return mysteries[key] || mysteries.glorious;
}

function getMysterySetNameByKey(key) {
  const mysteries = liturgy().mysteries;

  if (key === "joyful") return mysteries.joyfulSetName;
  if (key === "sorrowful") return mysteries.sorrowfulSetName;
  if (key === "luminous") return mysteries.luminousSetName;
  return mysteries.gloriousSetName;
}

function setMysteryChoice(choice) {
  currentMysteryChoice = choice;
  saveMysteryChoice();

  rosaryNodes = buildRosaryData();

  if (currentIndex >= rosaryNodes.length) {
    currentIndex = 0;
  }

  previousIndex = null;
  saveProgress();
  renderMysteryName();
  renderCurrent();
  renderRosary();
  updateMysteryPickerButtons();
  closeMysteryPicker();
}

function toggleMysteryPicker() {
  const isHidden = mysteryPickerEl.classList.contains("hidden");

  if (isHidden) {
    mysteryPickerEl.classList.remove("hidden");
    mysteryPickerEl.setAttribute("aria-hidden", "false");
    closeLanguageMenu();
  } else {
    closeMysteryPicker();
  }
}

function closeMysteryPicker() {
  mysteryPickerEl.classList.add("hidden");
  mysteryPickerEl.setAttribute("aria-hidden", "true");
}

function updateMysteryPickerButtons() {
  mysteryAutoBtn.classList.toggle("active", currentMysteryChoice === "auto");
  mysteryJoyfulBtn.classList.toggle("active", currentMysteryChoice === "joyful");
  mysterySorrowfulBtn.classList.toggle("active", currentMysteryChoice === "sorrowful");
  mysteryGloriousBtn.classList.toggle("active", currentMysteryChoice === "glorious");
  mysteryLuminousBtn.classList.toggle("active", currentMysteryChoice === "luminous");
}

function toggleLanguageMenu() {
  const isHidden = languageMenuEl.classList.contains("hidden");

  if (isHidden) {
    languageMenuEl.classList.remove("hidden");
    languageMenuEl.setAttribute("aria-hidden", "false");
    closeMysteryPicker();
  } else {
    closeLanguageMenu();
  }
}

function closeLanguageMenu() {
  languageMenuEl.classList.add("hidden");
  languageMenuEl.setAttribute("aria-hidden", "true");
}

function buildRosaryData() {
  const beads = [];
  const lit = liturgy();
  const mysterySet = getMysterySetForToday();

  beads.push({
    type: "cross",
    sectionKey: "opening",
    prayerTitle: `${lit.prayerTitles.signOfCross} • ${lit.prayerTitles.apostlesCreed}`,
    prayerText: `${lit.prayers.signOfCross}\n\n${lit.prayers.apostlesCreed}`,
    mysteryTitle: "",
    mysteryInsert: "",
    mysteryText: lit.meditations.beginSlowly
  });

  beads.push({
    type: "large",
    sectionKey: "opening",
    prayerTitle: lit.prayerTitles.ourFather,
    prayerText: lit.prayers.ourFather,
    mysteryTitle: "",
    mysteryInsert: "",
    mysteryText: lit.meditations.enterPrayer
  });

  for (let i = 1; i <= 3; i++) {
    const openingInsert = lit.openingInsertions[i - 1];

    beads.push({
      type: "small",
      sectionKey: "opening",
      prayerTitle: lit.prayerTitles.hailMary,
      prayerText: buildInsertedHailMary(lit.prayers.hailMary, openingInsert),
      mysteryTitle: "",
      mysteryInsert: openingInsert,
      mysteryText: lit.meditations.openingHailMary(i)
    });
  }

  beads.push({
    type: "large",
    sectionKey: "opening",
    prayerTitle: lit.prayerTitles.gloryBe,
    prayerText: lit.prayers.gloryBe,
    mysteryTitle: "",
    mysteryInsert: "",
    mysteryText: lit.meditations.pauseBeforeDecades
  });

  for (let decade = 1; decade <= 5; decade++) {
    const mystery = mysterySet[decade - 1];

    for (let i = 1; i <= 10; i++) {
      beads.push({
        type: "small",
        sectionKey: "decade",
        decadeNumber: decade,
        prayerTitle: lit.prayerTitles.hailMary,
        prayerText: buildInsertedHailMary(lit.prayers.hailMary, mystery.insert),
        mysteryTitle: mystery.title,
        mysteryInsert: mystery.insert,
        mysteryText: lit.meditations.hailMaryOf10(mystery.title, i)
      });
    }

    if (decade < 5) {
      beads.push({
        type: "large",
        sectionKey: "decade",
        decadeNumber: decade,
        prayerTitle: lit.prayerTitles.ourFather,
        prayerText: lit.prayers.ourFather,
        mysteryTitle: mystery.title,
        mysteryInsert: mystery.insert,
        mysteryText: lit.meditations.mysteryNumber(decade, mystery.title)
      });
    }
  }

  return beads;
}

function buildGeometry() {
  const nodes = [];

  nodes.push({ x: 200, y: 664, kind: "cross" });
  nodes.push({ x: 200, y: 600, kind: "large" });
  nodes.push({ x: 200, y: 560, kind: "small" });
  nodes.push({ x: 200, y: 520, kind: "small" });
  nodes.push({ x: 200, y: 480, kind: "small" });
  nodes.push({ x: 200, y: 440, kind: "large" });

  const loopNodes = [];
  const cx = 200;
  const cy = 240;
  const rx = 120;
  const ry = 200;

  const startDeg = 120;
  const endDeg = 420;

  for (let i = 0; i < 54; i++) {
    const t = i / 53;
    const deg = startDeg + (endDeg - startDeg) * t;
    const rad = (deg * Math.PI) / 180;

    let x = cx + rx * Math.cos(rad);
    let y = cy + ry * Math.sin(rad);

    if (deg < 155 || deg > 385) {
      x = cx + (x - cx) * 1;
      y += 0;
    }

    loopNodes.push({ x, y });
  }

  return {
    nodes: nodes.concat(loopNodes),
    loopStartIndex: 6,
    loopEndIndex: 59
  };
}

function getMysterySetForToday() {
  return getMysterySetByKey(getActiveMysteryKey());
}

function getMysteryNameForToday() {
  return getMysterySetNameByKey(getActiveMysteryKey());
}

function getSectionLabel(bead) {
  const t = ui();

  if (bead.sectionKey === "opening") {
    return t.opening;
  }

  return `${t.decade} ${bead.decadeNumber}`;
}

function renderMysteryName() {
  const label = ui().mysteryLabel || ui().mysteryOfDay;
  const name = getMysteryNameForToday();
  const suffix = currentMysteryChoice === "auto" ? "" : ` • ${ui().mysteryManualSuffix}`;

  mysteryNameEl.textContent = `${label}: ${name}${suffix}`;
}

function getDisplayBead(index = currentIndex) {
  const lit = liturgy();
  const bead = rosaryNodes[index];

  if (!bead) return null;

  if (index === 5) {
    if (previousIndex === 59) {
      const finalMystery = getMysterySetForToday()[4];

      return {
        ...bead,
        prayerTitle: `${lit.prayerTitles.gloryBe} • ${lit.prayerTitles.fatimaPrayer}`,
        prayerText: `${lit.prayers.gloryBe}\n\n${lit.prayers.fatima}`,
        sectionKey: "decade",
        decadeNumber: 5,
        mysteryTitle: finalMystery.title,
        mysteryInsert: finalMystery.insert,
        mysteryText: lit.meditations.mysteryNumber(5, finalMystery.title)
      };
    }

    return {
      ...bead,
      prayerTitle: `${lit.prayerTitles.gloryBe} • ${lit.prayerTitles.ourFather}`,
      prayerText: `${lit.prayers.gloryBe}\n\n${lit.prayers.ourFather}`
    };
  }

  if (bead.type === "large" && bead.sectionKey === "decade") {
    return {
      ...bead,
      prayerTitle: `${lit.prayerTitles.gloryBe} • ${lit.prayerTitles.fatimaPrayer} • ${lit.prayerTitles.ourFather}`,
      prayerText: `${lit.prayers.gloryBe}\n\n${lit.prayers.fatima}\n\n${lit.prayers.ourFather}`
    };
  }

  return bead;
}

function renderCurrent() {
  const bead = getDisplayBead(currentIndex);
  if (!bead) return;

  prayerTitleEl.textContent = bead.prayerTitle;
  sectionLabelEl.textContent = getSectionLabel(bead);
  progressLabelEl.textContent = ui().stepOf(currentIndex + 1, rosaryNodes.length);
  renderMysteryName();
  updatePanelForCurrentBead();
}

function updatePanelForCurrentBead(index = currentIndex) {
  const bead = getDisplayBead(index);
  if (!bead) return;

  const t = ui();

  panelPrayerTitle.textContent = bead.prayerTitle;

  let details = bead.mysteryText || "";

  if (bead.mysteryTitle && bead.mysteryInsert) {
    details += `${details ? "\n\n" : ""}${t.mysteryOfThisBead}:
${bead.mysteryTitle}

${t.addAfterJesus}:
${bead.mysteryInsert}`;
  }

  panelPrayerText.textContent = settings.showText
    ? `${bead.prayerText}${details ? `\n\n${details}` : ""}`
    : details;
}

function renderRosary() {
  beadLayer.innerHTML = "";
  hitLayer.innerHTML = "";
  cordLayer.innerHTML = "";

  drawCord();
  drawBeads();
  drawHitTargets();
}

function drawCord() {
  const pts = rosaryGeometry.nodes;
  cordLayer.innerHTML = "";

  const loopPoints = pts.slice(6).map((p) => `${p.x},${p.y}`).join(" ");
  const loopPolyline = makeSvg("polyline", {
    points: loopPoints,
    class: "cord-path"
  });
  cordLayer.appendChild(loopPolyline);

  const topLarge = pts[5];
  const leftLoopStart = pts[6];
  const rightLoopEnd = pts[59];

  const leftCurve = makeSvg("path", {
    d: `M ${topLarge.x - 6} ${topLarge.y - 6}
        C ${topLarge.x - 24} ${topLarge.y - 20},
          ${leftLoopStart.x + 18} ${leftLoopStart.y + 10},
          ${leftLoopStart.x} ${leftLoopStart.y}`,
    class: "connector-path"
  });

  const rightCurve = makeSvg("path", {
    d: `M ${topLarge.x + 6} ${topLarge.y - 6}
        C ${topLarge.x + 24} ${topLarge.y - 20},
          ${rightLoopEnd.x - 18} ${rightLoopEnd.y + 10},
          ${rightLoopEnd.x} ${rightLoopEnd.y}`,
    class: "connector-path"
  });

  cordLayer.appendChild(leftCurve);
  cordLayer.appendChild(rightCurve);

  const cross = pts[0];

  const hangingCord = makeSvg("line", {
    x1: topLarge.x,
    y1: topLarge.y + beadRadiusForIndex(5),
    x2: cross.x,
    y2: cross.y
  });

  hangingCord.setAttribute("stroke", "#5a4334");
  hangingCord.setAttribute("stroke-width", "3");
  hangingCord.setAttribute("stroke-linecap", "round");
  hangingCord.setAttribute("opacity", "0.95");

  cordLayer.appendChild(hangingCord);

  cordLayer.appendChild(
    makeSvg("line", {
      x1: pts[5].x,
      y1: pts[5].y + beadRadiusForIndex(5),
      x2: pts[4].x,
      y2: pts[4].y - beadRadiusForIndex(4),
      class: "cross-link"
    })
  );

  cordLayer.appendChild(
    makeSvg("line", {
      x1: pts[4].x,
      y1: pts[4].y + beadRadiusForIndex(4),
      x2: pts[3].x,
      y2: pts[3].y - beadRadiusForIndex(3),
      class: "cross-link"
    })
  );

  cordLayer.appendChild(
    makeSvg("line", {
      x1: pts[3].x,
      y1: pts[3].y + beadRadiusForIndex(3),
      x2: pts[2].x,
      y2: pts[2].y - beadRadiusForIndex(2),
      class: "cross-link"
    })
  );

  cordLayer.appendChild(
    makeSvg("line", {
      x1: pts[2].x,
      y1: pts[2].y + beadRadiusForIndex(2),
      x2: pts[1].x,
      y2: pts[1].y - beadRadiusForIndex(1),
      class: "cross-link"
    })
  );

  cordLayer.appendChild(
    makeSvg("line", {
      x1: pts[1].x,
      y1: pts[1].y + beadRadiusForIndex(1),
      x2: pts[0].x,
      y2: pts[0].y - 34,
      class: "cross-link"
    })
  );
}

function drawBeads() {
  rosaryGeometry.nodes.forEach((node, index) => {
    if (index === 0) {
      drawCross(node, index === currentIndex);
      return;
    }

    if (index === currentIndex) {
      const glowRadius = rosaryNodes[index].type === "large" ? 26 : 18;
      beadLayer.appendChild(
        makeSvg("circle", {
          cx: node.x,
          cy: node.y,
          r: glowRadius,
          class: "active-glow"
        })
      );
    }

    const radius = rosaryNodes[index].type === "large" ? 12 : 7.2;
    const circle = makeSvg("circle", {
      cx: node.x,
      cy: node.y,
      r: radius,
      class: `bead-shape ${rosaryNodes[index].type === "large" ? "bead-large" : "bead-small"}`
    });

    beadLayer.appendChild(circle);
  });
}

function drawCross(node, isActive) {
  if (isActive) {
    beadLayer.appendChild(
      makeSvg("rect", {
        x: node.x - 24,
        y: node.y - 40,
        width: 48,
        height: 80,
        rx: 16,
        class: "active-glow"
      })
    );
  }

  const vertical = makeSvg("rect", {
    x: node.x - 10,
    y: node.y - 34,
    width: 20,
    height: 68,
    rx: 4,
    class: "cross-wood"
  });

  const horizontal = makeSvg("rect", {
    x: node.x - 28,
    y: node.y - 14,
    width: 56,
    height: 16,
    rx: 4,
    class: "cross-wood"
  });

  beadLayer.appendChild(vertical);
  beadLayer.appendChild(horizontal);
}

function drawHitTargets() {
  rosaryGeometry.nodes.forEach((node, index) => {
    let target;

    if (index === 0) {
      target = makeSvg("rect", {
        x: node.x - 28,
        y: node.y - 38,
        width: 56,
        height: 76,
        rx: 10,
        class: "hit-target"
      });
    } else {
      target = makeSvg("circle", {
        cx: node.x,
        cy: node.y,
        r: rosaryNodes[index].type === "large" ? 18 : 14,
        class: "hit-target"
      });
    }

    attachPointerHandlers(target, index);
    hitLayer.appendChild(target);
  });
}

function attachPointerHandlers(el, index) {
  let timer = null;
  let longPressed = false;
  let startX = 0;
  let startY = 0;
  let trackingPointerId = null;
  const MOVE_CANCEL_THRESHOLD = 12;

  const clearPressTimer = () => {
    clearTimeout(timer);
    timer = null;

    if (cancelActiveLongPress === cancel) {
      cancelActiveLongPress = null;
    }
  };

  const start = (e) => {
    longPressed = false;
    trackingPointerId = e.pointerId;
    startX = e.clientX;
    startY = e.clientY;

    clearPressTimer();
    cancelActiveLongPress = cancel;

    timer = setTimeout(() => {
      longPressed = true;
      moveTo(index, false);
      openPanel();
      timer = null;
    }, 420);
  };

  const cancel = () => {
    clearPressTimer();
    trackingPointerId = null;
  };

  const move = (e) => {
    if (trackingPointerId !== e.pointerId || !timer) return;

    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    const distance = Math.hypot(dx, dy);

    if (distance > MOVE_CANCEL_THRESHOLD) {
      cancel();
    }
  };

  el.addEventListener("pointerdown", start);
  el.addEventListener("pointermove", move);

  el.addEventListener("pointerup", (e) => {
    if (trackingPointerId !== e.pointerId) return;

    if (!longPressed && timer) {
      moveTo(index);
    }

    cancel();
  });

  el.addEventListener("pointerleave", cancel);
  el.addEventListener("pointercancel", cancel);
}

function beadRadiusForIndex(index) {
  if (index === 0) return 18;
  return rosaryNodes[index].type === "large" ? 12 : 7.2;
}

function makeSvg(tag, attrs) {
  const el = document.createElementNS(SVG_NS, tag);
  for (const [key, value] of Object.entries(attrs)) {
    el.setAttribute(key, String(value));
  }
  return el;
}

function getNextIndex(index) {
  if (index === 59) return 5;
  if (index < rosaryNodes.length - 1) return index + 1;
  return index;
}

function getPreviousIndex(index) {
  if (index === 5) return 59;
  if (index > 0) return index - 1;
  return index;
}

function moveTo(index, useVibration = true) {
  if (index < 0 || index >= rosaryNodes.length) return;

  const oldIndex = currentIndex;
  previousIndex = currentIndex;
  currentIndex = index;

  if (oldIndex === 59 && index === 5) {
    trackRosaryCompleted().then(() => {
      loadTodayStats();
    });
  }

  saveProgress();
  renderCurrent();
  renderRosary();

  if (useVibration) {
    vibrateForBead(rosaryNodes[currentIndex]);
  }
}

function vibrateForBead(bead) {
  if (!settings.vibration) return;
  if (typeof navigator.vibrate !== "function") return;

  navigator.vibrate(0);

  if (bead.type === "cross") {
    navigator.vibrate([180, 60, 180, 60, 180]);
    return;
  }

  if (bead.type === "large") {
    navigator.vibrate([180, 60, 180, 60, 180]);
    return;
  }

  navigator.vibrate(40);
}

function openPanel() {
  settingsPanel.classList.remove("hidden");
  settingsPanel.setAttribute("aria-hidden", "false");
  updatePanelForCurrentBead();
}

function closePanel() {
  settingsPanel.classList.add("hidden");
  settingsPanel.setAttribute("aria-hidden", "true");
}

function applySettings() {
  document.body.classList.toggle("focus-mode", settings.focusMode);
  focusModeToggle.checked = settings.focusMode;
  showTextToggle.checked = settings.showText;
  vibrationToggle.checked = settings.vibration;
  updatePanelForCurrentBead();
}

function saveProgress() {
  localStorage.setItem(STORAGE_KEY, String(currentIndex));
}

function loadProgress() {
  const raw = localStorage.getItem(STORAGE_KEY);
  const value = Number(raw);
  return Number.isInteger(value) && value >= 0 ? value : 0;
}

function saveSettings() {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

function loadSettings() {
  const fallback = {
    focusMode: true,
    showText: false,
    vibration: true
  };

  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return fallback;
    return { ...fallback, ...JSON.parse(raw) };
  } catch {
    return fallback;
  }
}

function loadUiLanguage() {
  const value = localStorage.getItem(UI_LANG_KEY);
  return ["en", "de", "it", "es"].includes(value) ? value : "en";
}

function loadPrayerLanguage() {
  const value = localStorage.getItem(PRAYER_LANG_KEY);
  return ["en", "de", "la", "it", "es"].includes(value) ? value : "en";
}

function setupSwipeNavigation() {
  let startX = 0;
  let startY = 0;
  let isTouching = false;

  gestureArea.addEventListener(
    "touchstart",
    (e) => {
      if (!e.touches.length) return;
      const touch = e.touches[0];
      startX = touch.clientX;
      startY = touch.clientY;
      isTouching = true;
    },
    { passive: true }
  );

  gestureArea.addEventListener(
    "touchmove",
    (e) => {
      if (!isTouching || !e.touches.length) return;

      const touch = e.touches[0];
      const dx = touch.clientX - startX;
      const dy = touch.clientY - startY;

      if (Math.abs(dx) > 10 || Math.abs(dy) > 10) {
        if (cancelActiveLongPress) {
          cancelActiveLongPress();
        }
      }
    },
    { passive: true }
  );

  gestureArea.addEventListener(
    "touchend",
    (e) => {
      if (!isTouching || !e.changedTouches.length) return;

      const touch = e.changedTouches[0];
      const dx = touch.clientX - startX;
      const dy = touch.clientY - startY;
      isTouching = false;

      if (Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(dy)) return;

      if (dx < 0) {
        moveTo(getNextIndex(currentIndex));
      } else {
        moveTo(getPreviousIndex(currentIndex));
      }
    },
    { passive: true }
  );
}

function setupPanelSwipeNavigation() {
  const sheet = document.querySelector(".settings-sheet");
  if (!sheet) return;

  let startX = 0;
  let startY = 0;
  let isTouching = false;

  sheet.addEventListener(
    "touchstart",
    (e) => {
      if (!e.touches.length) return;
      const touch = e.touches[0];
      startX = touch.clientX;
      startY = touch.clientY;
      isTouching = true;
    },
    { passive: true }
  );

  sheet.addEventListener(
    "touchend",
    (e) => {
      if (!isTouching || !e.changedTouches.length) return;

      const touch = e.changedTouches[0];
      const dx = touch.clientX - startX;
      const dy = touch.clientY - startY;
      isTouching = false;

      if (Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(dy)) return;

      if (dx < 0) {
        moveTo(getNextIndex(currentIndex));
      } else {
        moveTo(getPreviousIndex(currentIndex));
      }

      openPanel();
    },
    { passive: true }
  );
}
