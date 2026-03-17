const STORAGE_KEY = "rosary-algorithmic-progress";
const SETTINGS_KEY = "rosary-algorithmic-settings";
const UI_LANG_KEY = "rosary-ui-language";
const PRAYER_LANG_KEY = "rosary-prayer-language";

const mysteryNameEl = document.getElementById("mysteryName");
const prayerTitleEl = document.getElementById("prayerTitle");
const sectionLabelEl = document.getElementById("sectionLabel");
const progressLabelEl = document.getElementById("progressLabel");

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

const uiLangEnBtn = document.getElementById("uiLangEnBtn");
const uiLangDeBtn = document.getElementById("uiLangDeBtn");

const prayerLangEnBtn = document.getElementById("prayerLangEnBtn");
const prayerLangDeBtn = document.getElementById("prayerLangDeBtn");
const prayerLangLaBtn = document.getElementById("prayerLangLaBtn");

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
    ui: "UI",
    prayer: "Prayer"
  },
  de: {
    appTitle: "Rosenkranz",
    mysteryOfDay: "Tagesmysterium",
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
    ui: "UI",
    prayer: "Gebet"
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
      apostlesCreed:
        "test",
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
      pauseBeforeDecades: "Pause before entering the decades.",
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
        {
          title: "The Annunciation",
          insert: "Jesus, whom thou, O Virgin, didst conceive by the Holy Spirit."
        },
        {
          title: "The Visitation",
          insert: "Jesus, whom thou, O Virgin, didst carry to Elizabeth."
        },
        {
          title: "The Nativity",
          insert: "Jesus, whom thou, O Virgin, didst bring forth."
        },
        {
          title: "The Presentation in the Temple",
          insert: "Jesus, whom thou, O Virgin, didst present in the Temple."
        },
        {
          title: "The Finding in the Temple",
          insert: "Jesus, whom thou, O Virgin, didst find in the Temple."
        }
      ],
      sorrowful: [
        {
          title: "The Agony in the Garden",
          insert: "Jesus, who for us did sweat blood in the garden."
        },
        {
          title: "The Scourging at the Pillar",
          insert: "Jesus, who for us was scourged at the pillar."
        },
        {
          title: "The Crowning with Thorns",
          insert: "Jesus, who for us was crowned with thorns."
        },
        {
          title: "The Carrying of the Cross",
          insert: "Jesus, who for us carried the heavy cross."
        },
        {
          title: "The Crucifixion",
          insert: "Jesus, who for us was crucified."
        }
      ],
      glorious: [
        {
          title: "The Resurrection",
          insert: "Jesus, who rose glorious from the dead."
        },
        {
          title: "The Ascension",
          insert: "Jesus, who ascended into heaven."
        },
        {
          title: "The Descent of the Holy Spirit",
          insert: "Jesus, who sent us the Holy Spirit."
        },
        {
          title: "The Assumption",
          insert: "Jesus, who took thee up into heaven."
        },
        {
          title: "The Coronation of Mary",
          insert: "Jesus, who crowned thee Queen of heaven and earth."
        }
      ],
      luminous: [
        {
          title: "The Baptism of Jesus",
          insert: "Jesus, who was baptized in the Jordan."
        },
        {
          title: "The Wedding at Cana",
          insert: "Jesus, who revealed His glory at Cana."
        },
        {
          title: "The Proclamation of the Kingdom",
          insert: "Jesus, who proclaimed the Kingdom of God."
        },
        {
          title: "The Transfiguration",
          insert: "Jesus, who was transfigured on the mountain."
        },
        {
          title: "The Institution of the Eucharist",
          insert: "Jesus, who gave us His Body and Blood in the Eucharist."
        }
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
      apostlesCreed:
        "test",
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
      beginSlowly: "Beginne langsam. Sammle deine Aufmerksamkeit.",
      enterPrayer: "Tritt mit innerer Sammlung ins Gebet ein.",
      openingHailMary: (i) => `Einleitendes Gegrüßet seist du, Maria ${i} von 3.`,
      pauseBeforeDecades: "Halte kurz inne, bevor die Gesätze beginnen.",
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
        {
          title: "Die Verkündigung des Herrn",
          insert: "Jesus, den du, o Jungfrau, vom Heiligen Geist empfangen hast."
        },
        {
          title: "Die Heimsuchung Mariens",
          insert: "Jesus, den du, o Jungfrau, zu Elisabet getragen hast."
        },
        {
          title: "Die Geburt Jesu",
          insert: "Jesus, den du, o Jungfrau, geboren hast."
        },
        {
          title: "Die Darstellung Jesu im Tempel",
          insert: "Jesus, den du, o Jungfrau, im Tempel aufgeopfert hast."
        },
        {
          title: "Die Wiederfindung Jesu im Tempel",
          insert: "Jesus, den du, o Jungfrau, im Tempel wiedergefunden hast."
        }
      ],
      sorrowful: [
        {
          title: "Jesus, der für uns Blut geschwitzt hat",
          insert: "der für uns Blut geschwitzt hat."
        },
        {
          title: "Jesus, der für uns gegeißelt worden ist",
          insert: "der für uns gegeißelt worden ist."
        },
        {
          title: "Jesus, der für uns mit Dornen gekrönt worden ist",
          insert: "der für uns mit Dornen gekrönt worden ist."
        },
        {
          title: "Jesus, der für uns das schwere Kreuz getragen hat",
          insert: "der für uns das schwere Kreuz getragen hat."
        },
        {
          title: "Jesus, der für uns gekreuzigt worden ist",
          insert: "der für uns gekreuzigt worden ist."
        }
      ],
      glorious: [
        {
          title: "Jesus, der von den Toten auferstanden ist",
          insert: "der von den Toten auferstanden ist."
        },
        {
          title: "Jesus, der in den Himmel aufgefahren ist",
          insert: "der in den Himmel aufgefahren ist."
        },
        {
          title: "Jesus, der uns den Heiligen Geist gesandt hat",
          insert: "der uns den Heiligen Geist gesandt hat."
        },
        {
          title: "Jesus, der dich, o Jungfrau, in den Himmel aufgenommen hat",
          insert: "der dich, o Jungfrau, in den Himmel aufgenommen hat."
        },
        {
          title: "Jesus, der dich, o Jungfrau, im Himmel gekrönt hat",
          insert: "der dich, o Jungfrau, im Himmel gekrönt hat."
        }
      ],
      luminous: [
        {
          title: "Jesus, der von Johannes getauft worden ist",
          insert: "der von Johannes getauft worden ist."
        },
        {
          title: "Jesus, der sich bei der Hochzeit in Kana offenbart hat",
          insert: "der sich bei der Hochzeit in Kana offenbart hat."
        },
        {
          title: "Jesus, der uns das Reich Gottes verkündet hat",
          insert: "der uns das Reich Gottes verkündet hat."
        },
        {
          title: "Jesus, der auf dem Berg verklärt worden ist",
          insert: "der auf dem Berg verklärt worden ist."
        },
        {
          title: "Jesus, der uns die Eucharistie geschenkt hat",
          insert: "der uns die Eucharistie geschenkt hat."
        }
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
      apostlesCreed:
        "test",
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
      beginSlowly: "Incipe lente. Animum compone.",
      enterPrayer: "Intentione in orationem ingredere.",
      openingHailMary: (i) => `Ave Maria initii ${i} ex 3.`,
      pauseBeforeDecades: "Siste paulisper ante decadas.",
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
        {
          title: "Annuntiatio",
          insert: "Iesus, quem Virgo per Spiritum Sanctum concepisti."
        },
        {
          title: "Visitatio",
          insert: "Iesus, quem Virgo Elisabeth portasti."
        },
        {
          title: "Nativitas",
          insert: "Iesus, quem Virgo genuisti."
        },
        {
          title: "Praesentatio in Templo",
          insert: "Iesus, quem Virgo in templo praesentasti."
        },
        {
          title: "Inventio in Templo",
          insert: "Iesus, quem Virgo in templo invenisti."
        }
      ],
      sorrowful: [
        {
          title: "Agonia in horto",
          insert: "Iesus, qui pro nobis sanguinem sudavit."
        },
        {
          title: "Flagellatio",
          insert: "Iesus, qui pro nobis flagellatus est."
        },
        {
          title: "Coronatio spinea",
          insert: "Iesus, qui pro nobis spinis coronatus est."
        },
        {
          title: "Baiulatio crucis",
          insert: "Iesus, qui pro nobis crucem baiulavit."
        },
        {
          title: "Crucifixio",
          insert: "Iesus, qui pro nobis crucifixus est."
        }
      ],
      glorious: [
        {
          title: "Resurrectio",
          insert: "Iesus, qui a mortuis resurrexit."
        },
        {
          title: "Ascensio",
          insert: "Iesus, qui in caelum ascendit."
        },
        {
          title: "Descensus Spiritus Sancti",
          insert: "Iesus, qui nobis Spiritum Sanctum misit."
        },
        {
          title: "Assumptio",
          insert: "Iesus, qui te, Virgo, in caelum assumpsit."
        },
        {
          title: "Coronatio Mariae",
          insert: "Iesus, qui te, Virgo, in caelo coronavit."
        }
      ],
      luminous: [
        {
          title: "Baptisma in Iordane",
          insert: "Iesus, qui in Iordane baptizatus est."
        },
        {
          title: "Nuptiae Canae",
          insert: "Iesus, qui apud Canense matrimonium se manifestavit."
        },
        {
          title: "Proclamatio Regni Dei",
          insert: "Iesus, qui Regnum Dei annuntiavit."
        },
        {
          title: "Transfiguratio",
          insert: "Iesus, qui in monte transfiguratus est."
        },
        {
          title: "Institutio Eucharistiae",
          insert: "Iesus, qui nobis Eucharistiam dedit."
        }
      ]
    }
  }
};

let cancelActiveLongPress = null;
let currentUILang = loadUiLanguage();
let currentPrayerLang = loadPrayerLanguage();
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
updateLanguageButtons();

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

uiLangEnBtn.addEventListener("click", () => setUiLanguage("en"));
uiLangDeBtn.addEventListener("click", () => setUiLanguage("de"));

prayerLangEnBtn.addEventListener("click", () => setPrayerLanguage("en"));
prayerLangDeBtn.addEventListener("click", () => setPrayerLanguage("de"));
prayerLangLaBtn.addEventListener("click", () => setPrayerLanguage("la"));

setupSwipeNavigation();

function ui() {
  return UI_TEXT[currentUILang] || UI_TEXT.en;
}

function liturgy() {
  return LITURGY[currentPrayerLang] || LITURGY.en;
}

function setUiLanguage(lang) {
  currentUILang = lang;
  localStorage.setItem(UI_LANG_KEY, lang);
  applyUIText();
  renderCurrent();
  updateLanguageButtons();
}

function setPrayerLanguage(lang) {
  currentPrayerLang = lang;
  localStorage.setItem(PRAYER_LANG_KEY, lang);

  rosaryNodes = buildRosaryData();

  if (currentIndex >= rosaryNodes.length) {
    currentIndex = 0;
  }

  renderCurrent();
  renderRosary();
  updateLanguageButtons();
}

function updateLanguageButtons() {
  uiLangEnBtn.classList.toggle("active", currentUILang === "en");
  uiLangDeBtn.classList.toggle("active", currentUILang === "de");

  prayerLangEnBtn.classList.toggle("active", currentPrayerLang === "en");
  prayerLangDeBtn.classList.toggle("active", currentPrayerLang === "de");
  prayerLangLaBtn.classList.toggle("active", currentPrayerLang === "la");
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
  resumeBtn.textContent = t.resumePrayer;
  resetBtn.textContent = t.resetProgress;
  swipeHintEl.textContent = t.swipeHint;

  uiLangLabelEl.textContent = t.ui;
  prayerLangLabelEl.textContent = t.prayer;
  infoToggleBtn.setAttribute("aria-label", t.prayerDetails);

  renderMysteryName();
  updatePanelForCurrentBead();
}

function stripLeadingJesus(insert) {
  return insert
    .replace(/^Jesus,\s*/i, "")
    .replace(/^Iesus,\s*/i, "")
    .trim();
}

function buildInsertedHailMary(basePrayer, insert) {
  const cleanInsert = stripLeadingJesus(insert);

  if (basePrayer.includes("Iesus.")) {
    return basePrayer.replace("Iesus.", `Iesus, ${cleanInsert}`);
  }

  return basePrayer.replace("Jesus.", `Jesus, ${cleanInsert}`);
}

function buildRosaryData() {
  const beads = [];
  const lit = liturgy();
  const mysterySet = getMysterySetForToday();

  beads.push({
    type: "cross",
    sectionKey: "opening",
    prayerTitle: lit.prayerTitles.signOfCross,
    prayerText: lit.prayers.signOfCross,
    mysteryTitle: "",
    mysteryInsert: "",
    mysteryText: lit.meditations.beginSlowly
  });

  beads.push({
    type: "large",
    sectionKey: "opening",
    prayerTitle: lit.prayerTitles.apostlesCreed,
    prayerText: lit.prayers.apostlesCreed,
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
    prayerTitle: lit.prayerTitles.ourFather,
    prayerText: lit.prayers.ourFather,
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

  nodes.push({ x: 200, y: 664, kind: "cross" }); // 0
  nodes.push({ x: 200, y: 600, kind: "large" }); // 1
  nodes.push({ x: 200, y: 560, kind: "small" }); // 2
  nodes.push({ x: 200, y: 520, kind: "small" }); // 3
  nodes.push({ x: 200, y: 480, kind: "small" }); // 4
  nodes.push({ x: 200, y: 440, kind: "large" }); // 5

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
  const day = new Date().getDay();
  const mysteries = liturgy().mysteries;

  if (day === 1 || day === 6) return mysteries.joyful;
  if (day === 2 || day === 5) return mysteries.sorrowful;
  if (day === 4) return mysteries.luminous;
  return mysteries.glorious;
}

function getMysteryNameForToday() {
  const day = new Date().getDay();
  const mysteries = liturgy().mysteries;

  if (day === 1 || day === 6) return mysteries.joyfulSetName;
  if (day === 2 || day === 5) return mysteries.sorrowfulSetName;
  if (day === 4) return mysteries.luminousSetName;
  return mysteries.gloriousSetName;
}

function getSectionLabel(bead) {
  const t = ui();

  if (bead.sectionKey === "opening") {
    return t.opening;
  }

  return `${t.decade} ${bead.decadeNumber}`;
}

function renderMysteryName() {
  mysteryNameEl.textContent = `${ui().mysteryOfDay}: ${getMysteryNameForToday()}`;
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
  prayerTitleEl.textContent = bead.prayerTitle;
  sectionLabelEl.textContent = getSectionLabel(bead);
  progressLabelEl.textContent = ui().stepOf(currentIndex + 1, rosaryNodes.length);
  renderMysteryName();
  updatePanelForCurrentBead();
}

function updatePanelForCurrentBead(index = currentIndex) {
  const bead = getDisplayBead(index);
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
  return value === "de" ? "de" : "en";
}

function loadPrayerLanguage() {
  const value = localStorage.getItem(PRAYER_LANG_KEY);
  return value === "de" || value === "la" ? value : "en";
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