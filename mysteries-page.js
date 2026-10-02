
const PRAYER_LANG_KEY = "rosary-prayer-language";
const setKey = document.body.dataset.set || "joyful";
const content = window.MYSTERY_CONTENT;
const langSelect = document.getElementById("pageLanguage");
function getLang(){ const l=localStorage.getItem(PRAYER_LANG_KEY)||"en"; return content[l]?l:"en"; }
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
  const sorrowfulImages = [
    "01-agony-in-the-garden.jpg",
    "02-flagellation.jpg",
    "03-crowning-with-thorns.jpg",
    "04-carrying-the-cross.jpg",
    "05-crucifixion.jpg"
  ];

  items.forEach((m,i)=>{
    const card=document.createElement("article"); card.className="mystery-card"; card.id=`m${i+1}`;

    const imageMarkup = setKey === "sorrowful"
      ? `<div class="mystery-image-wrap">
          <img class="mystery-image" src="images/sorrowful/${sorrowfulImages[i]}" alt="${m[0]}" loading="lazy" />
          <div class="image-placeholder image-fallback hidden-image-fallback"><div><div class="image-symbol">✦</div><div class="image-label">${ui.image}</div></div></div>
        </div>`
      : `<div class="image-placeholder"><div><div class="image-symbol">✦</div><div class="image-label">${ui.image}</div></div></div>`;

    card.innerHTML=`${imageMarkup}<div class="card-body"><div class="number">${i+1}. ${ui.sets[setKey]}</div><h2>${m[0]}</h2><span class="reference">${m[1]}</span><div class="block"><h3>${ui.bib}</h3><p>${m[2]}</p></div><div class="block meditation"><h3>${ui.med}</h3><p>${m[3]}</p></div></div>`;

    if (setKey === "sorrowful") {
      const img = card.querySelector(".mystery-image");
      const fallback = card.querySelector(".image-fallback");
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
