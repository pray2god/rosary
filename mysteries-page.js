
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

function getLang(){ const l=localStorage.getItem(PRAYER_LANG_KEY)||"en"; return content[l]?l:"en"; }

function buildImageMarkup(setName, index, altText, imageLabel) {
  const files = MYSTERY_IMAGE_FILES[setName];
  const filename = files && files[index];

  if (!filename) {
    return `<div class="image-placeholder"><div><div class="image-symbol">✦</div><div class="image-label">${imageLabel}</div></div></div>`;
  }

  return `<div class="mystery-image-wrap">
      <img class="mystery-image" src="images/${setName}/${filename}" alt="${altText}" loading="lazy" />
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

    cards.appendChild(card);
  });
  document.getElementById("sourceLabel").textContent=ui.source;
}
langSelect.addEventListener("change",()=>{localStorage.setItem(PRAYER_LANG_KEY,langSelect.value);render();});
render();
