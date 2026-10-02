
const PRAYER_LANG_KEY = "rosary-prayer-language";
const setKey = document.body.dataset.set || "joyful";
const content = window.MYSTERY_CONTENT;
const langSelect = document.getElementById("pageLanguage");
const MYSTERY_IMAGE_FILES = {
  joyful: [
    "01-annunciation.jpg",
    "02-visitation.jpg",
    "03-nativity.jpg",
    "04-presentation.jpg",
    "05-finding-in-the-temple.jpg"
  ],
  luminous: [
    "01-baptism-in-the-jordan.jpg",
    "02-wedding-at-cana.jpg",
    "03-proclamation-of-the-kingdom.jpg",
    "04-transfiguration.jpg",
    "05-institution-of-the-eucharist.jpg"
  ],
  sorrowful: [
    "01-agony-in-the-garden.jpg",
    "02-flagellation.jpg",
    "03-crowning-with-thorns.jpg",
    "04-carrying-the-cross.jpg",
    "05-crucifixion.jpg"
  ],
  glorious: [
    "01-resurrection.jpg",
    "02-ascension.jpg",
    "03-descent-of-the-holy-spirit.jpg",
    "04-assumption-of-mary.jpg",
    "05-coronation-of-mary.jpg"
  ]
};


const IMAGE_CREDITS = {
  joyful: [
    { credit: "Leonardo da Vinci · Public Domain · via Wikimedia Commons", url: "https://commons.wikimedia.org/w/index.php?curid=165344934" },
    { credit: "Jacques Daret · Public Domain · via Wikimedia Commons", url: "https://commons.wikimedia.org/w/index.php?curid=6411177" },
    { credit: "Jean-Baptiste Marie Pierre · Public Domain · via Wikimedia Commons" },
    { credit: "Fra Bartolomeo · Public Domain · via Wikimedia Commons" },
    { credit: "Paolo Veronese · Public Domain · via Wikimedia Commons" }
  ],
  luminous: [
    { credit: "Lambert Sustris · Public Domain · via Wikimedia Commons", url: "https://commons.wikimedia.org/w/index.php?curid=3714766" },
    { credit: "Paolo Veronese · Public Domain · via Wikimedia Commons", url: "https://commons.wikimedia.org/w/index.php?curid=160027" },
    { credit: "Rudolf Yelin · Public Domain · via Wikimedia Commons" },
    { credit: "Titian · Public Domain · via Wikimedia Commons" },
    { credit: "Juan de Juanes · Public Domain · via Wikimedia Commons", url: "https://commons.wikimedia.org/w/index.php?curid=23065137" }
  ],
  sorrowful: [
    { credit: "El Greco and workshop · Public Domain · via Wikimedia Commons", url: "https://commons.wikimedia.org/w/index.php?curid=152171" },
    { credit: "William-Adolphe Bouguereau · Public Domain · via Wikimedia Commons", url: "https://commons.wikimedia.org/w/index.php?curid=118722" },
    { credit: "Caravaggio · Public Domain · via Wikimedia Commons" },
    { credit: "Raphael · Public Domain · via Wikimedia Commons", url: "https://commons.wikimedia.org/w/index.php?curid=157685" },
    { credit: "Pedro Orrente · Public Domain · via Wikimedia Commons" }
  ],
  glorious: [
    { credit: "Russian Museum · Public Domain · via Wikimedia Commons" },
    { credit: "Dulwich Picture Gallery · Public Domain · via Wikimedia Commons" },
    { credit: "Titian · Public Domain · via Wikimedia Commons" },
    { credit: "Matthias Stom · Public Domain · via Wikimedia Commons" },
    { credit: "Diego Velázquez · Public Domain · via Museo del Prado / Wikimedia Commons", url: "https://commons.wikimedia.org/w/index.php?curid=159927" }
  ]
};

const CREDIT_UI = {
  en: { title: "Image source", hint: "Hold image or tap ⓘ", open: "Open source", close: "Close" },
  de: { title: "Bildquelle", hint: "Bild halten oder ⓘ tippen", open: "Quelle öffnen", close: "Schließen" },
  it: { title: "Fonte dell’immagine", hint: "Tieni premuta l’immagine o tocca ⓘ", open: "Apri fonte", close: "Chiudi" },
  es: { title: "Fuente de la imagen", hint: "Mantén pulsada la imagen o toca ⓘ", open: "Abrir fuente", close: "Cerrar" },
  la: { title: "Fons imaginis", hint: "Imaginem tene aut ⓘ tange", open: "Fontem aperire", close: "Claudere" }
};

let activeCredit = null;

function ensureCreditModal() {
  let modal = document.getElementById("imageCreditModal");
  if (modal) return modal;

  modal = document.createElement("div");
  modal.id = "imageCreditModal";
  modal.className = "credit-modal hidden-credit-modal";
  modal.setAttribute("aria-hidden", "true");
  modal.innerHTML = `
    <div class="credit-backdrop" data-credit-close></div>
    <div class="credit-card" role="dialog" aria-modal="true" aria-labelledby="creditModalTitle">
      <div class="credit-grip"></div>
      <div class="credit-kicker" id="creditModalTitle"></div>
      <h3 id="creditMysteryTitle"></h3>
      <p id="creditText" class="credit-text"></p>
      <div class="credit-actions">
        <a id="creditSourceLink" class="credit-link" target="_blank" rel="noopener noreferrer"></a>
        <button id="creditCloseBtn" class="credit-close" type="button"></button>
      </div>
    </div>`;
  document.body.appendChild(modal);

  modal.querySelectorAll("[data-credit-close]").forEach(el => el.addEventListener("click", closeCreditModal));
  modal.querySelector("#creditCloseBtn").addEventListener("click", closeCreditModal);
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !modal.classList.contains("hidden-credit-modal")) closeCreditModal();
  });
  return modal;
}

function openCreditModal(index, mysteryTitle) {
  const credit = IMAGE_CREDITS[setKey] && IMAGE_CREDITS[setKey][index];
  if (!credit) return;
  activeCredit = { index, mysteryTitle };

  const lang = getLang();
  const labels = CREDIT_UI[lang] || CREDIT_UI.en;
  const modal = ensureCreditModal();
  modal.querySelector("#creditModalTitle").textContent = labels.title;
  modal.querySelector("#creditMysteryTitle").textContent = mysteryTitle;
  modal.querySelector("#creditText").textContent = credit.credit;

  const link = modal.querySelector("#creditSourceLink");
  if (credit.url) {
    link.href = credit.url;
    link.textContent = labels.open;
    link.style.display = "inline-flex";
  } else {
    link.removeAttribute("href");
    link.style.display = "none";
  }

  modal.querySelector("#creditCloseBtn").textContent = labels.close;
  modal.classList.remove("hidden-credit-modal");
  modal.setAttribute("aria-hidden", "false");
  document.body.classList.add("credit-modal-open");
}

function closeCreditModal() {
  const modal = document.getElementById("imageCreditModal");
  if (!modal) return;
  modal.classList.add("hidden-credit-modal");
  modal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("credit-modal-open");
  activeCredit = null;
}

function setupImageCreditInteraction(card, index, mysteryTitle) {
  const wrap = card.querySelector(".mystery-image-wrap");
  const infoButton = card.querySelector(".image-credit-button");
  if (!wrap || !infoButton) return;

  infoButton.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    openCreditModal(index, mysteryTitle);
  });

  let timer = null;
  let startX = 0;
  let startY = 0;
  let fired = false;

  const cancel = () => {
    if (timer) window.clearTimeout(timer);
    timer = null;
    wrap.classList.remove("is-credit-holding");
  };

  wrap.addEventListener("pointerdown", (event) => {
    if (event.target.closest(".image-credit-button")) return;
    if (event.pointerType === "mouse" && event.button !== 0) return;
    startX = event.clientX;
    startY = event.clientY;
    fired = false;
    wrap.classList.add("is-credit-holding");
    timer = window.setTimeout(() => {
      fired = true;
      wrap.classList.remove("is-credit-holding");
      openCreditModal(index, mysteryTitle);
      if (navigator.vibrate) navigator.vibrate(18);
    }, 550);
  });

  wrap.addEventListener("pointermove", (event) => {
    if (!timer) return;
    if (Math.hypot(event.clientX - startX, event.clientY - startY) > 12) cancel();
  });
  wrap.addEventListener("pointerup", cancel);
  wrap.addEventListener("pointercancel", cancel);
  wrap.addEventListener("pointerleave", cancel);
  wrap.addEventListener("contextmenu", (event) => event.preventDefault());
  wrap.addEventListener("dragstart", (event) => event.preventDefault());
}

function getLang(){ const l=localStorage.getItem(PRAYER_LANG_KEY)||"en"; return content[l]?l:"en"; }

function buildImageMarkup(setName, index, altText, imageLabel) {
  const files = MYSTERY_IMAGE_FILES[setName];
  const filename = files && files[index];
  const lang = getLang();
  const labels = CREDIT_UI[lang] || CREDIT_UI.en;

  if (!filename) {
    return `<div class="image-placeholder"><div><div class="image-symbol">✦</div><div class="image-label">${imageLabel}</div></div></div>`;
  }

  return `<div class="mystery-image-wrap" title="${labels.hint}">
      <img class="mystery-image" src="images/${setName}/${filename}" alt="${altText}" loading="lazy" draggable="false" />
      <button class="image-credit-button" type="button" aria-label="${labels.title}" title="${labels.title}">ⓘ</button>
      <div class="image-placeholder image-fallback hidden-image-fallback"><div><div class="image-symbol">✦</div><div class="image-label">${imageLabel}</div></div></div>
    </div>`;
}

function render(){
  const lang=getLang(), d=content[lang], ui=d.ui, items=d[setKey];
  document.documentElement.lang=lang;
  document.title=`${ui.sets[setKey]} · Rosary`;
  document.getElementById("pageEyebrow").textContent="Rosary Meditation";
  document.getElementById("pageTitle").textContent=ui.sets[setKey];
  document.getElementById("pageIntro").textContent=ui.intro;
  document.getElementById("pageDay").textContent=ui.days[setKey];
  document.getElementById("backLink").textContent=`← ${ui.back}`;
  langSelect.value=lang;
  const cards=document.getElementById("cards"); cards.innerHTML="";

  items.forEach((m,i)=>{
    const card=document.createElement("article"); card.className="mystery-card"; card.id=`m${i+1}`;
    const imageMarkup = buildImageMarkup(setKey, i, m[0], ui.image);

    card.innerHTML=`${imageMarkup}<div class="card-body"><div class="number">${i+1}. ${ui.sets[setKey]}</div><h2>${m[0]}</h2><span class="reference">${m[1]}</span><div class="block"><h3>${ui.bib}</h3><p>${m[2]}</p></div><div class="block meditation"><h3>${ui.med}</h3><p>${m[3]}</p></div></div>`;

    const img = card.querySelector(".mystery-image");
    const fallback = card.querySelector(".image-fallback");
    if (img && fallback) {
      img.addEventListener("error", () => {
        img.style.display = "none";
        fallback.classList.remove("hidden-image-fallback");
      });
    }

    setupImageCreditInteraction(card, i, m[0]);
    cards.appendChild(card);
  });
  document.getElementById("sourceLabel").textContent=ui.source;
  if (activeCredit) openCreditModal(activeCredit.index, activeCredit.mysteryTitle);
}
langSelect.addEventListener("change",()=>{localStorage.setItem(PRAYER_LANG_KEY,langSelect.value);render();});
render();
