const STORAGE_KEY = "rosary-algorithmic-progress";
const SETTINGS_KEY = "rosary-algorithmic-settings";

const mysteryNameEl = document.getElementById("mysteryName");
const prayerTitleEl = document.getElementById("prayerTitle");
const sectionLabelEl = document.getElementById("sectionLabel");
const progressLabelEl = document.getElementById("progressLabel");

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

const panelPrayerTitle = document.getElementById("panelPrayerTitle");
const panelPrayerText = document.getElementById("panelPrayerText");

const gestureArea = document.getElementById("gestureArea");
const beadLayer = document.getElementById("beadLayer");
const hitLayer = document.getElementById("hitLayer");
const cordLayer = document.getElementById("cordLayer");

const SVG_NS = "http://www.w3.org/2000/svg";

const rosaryNodes = buildRosaryData();
const rosaryGeometry = buildGeometry();

let currentIndex = loadProgress();
let settings = loadSettings();

applySettings();
renderMysteryName();
renderCurrent();
renderRosary();

prevBtn.addEventListener("click", () => moveTo(currentIndex - 1));
nextBtn.addEventListener("click", () => moveTo(currentIndex + 1));

resetBtn.addEventListener("click", () => {
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

setupSwipeNavigation();

function buildRosaryData() {
  const beads = [];
  const mysterySet = getMysterySetForToday();

  // 0 cross
  beads.push({
    type: "cross",
    section: "Opening",
    prayerTitle: "Sign of the Cross",
    prayerText: "In the name of the Father, and of the Son, and of the Holy Spirit. Amen.",
    mysteryText: "Begin slowly. Settle your attention."
  });

  // Hanging section: large -> 3 small -> large
  beads.push({
    type: "large",
    section: "Opening",
    prayerTitle: "Apostles’ Creed",
    prayerText:
      "I believe in God, the Father almighty, Creator of heaven and earth, and in Jesus Christ, His only Son, our Lord...",
    mysteryText: "Enter prayer with intention."
  });

  for (let i = 1; i <= 3; i++) {
    beads.push({
      type: "small",
      section: "Opening",
      prayerTitle: "Hail Mary",
      prayerText:
        "Hail Mary, full of grace, the Lord is with thee. Blessed art thou among women, and blessed is the fruit of thy womb, Jesus. Holy Mary, Mother of God, pray for us sinners, now and at the hour of our death. Amen.",
      mysteryText: `Opening Hail Mary ${i} of 3.`
    });
  }

  beads.push({
    type: "large",
    section: "Opening",
    prayerTitle: "Our Father",
    prayerText:
      "Our Father, who art in heaven, hallowed be thy name; thy kingdom come; thy will be done on earth as it is in heaven. Give us this day our daily bread, and forgive us our trespasses, as we forgive those who trespass against us. And lead us not into temptation, but deliver us from evil. Amen.",
    mysteryText: "Pause before entering the decades."
  });

  // Main loop: exactly 5 decades of 10 small, separated by 5 large
// Main loop: 5 groups of 10 small beads, but only 4 large beads in the loop,
// because the top hanging large bead already serves as the 5th separator.
for (let decade = 1; decade <= 5; decade++) {
  for (let i = 1; i <= 10; i++) {
    beads.push({
      type: "small",
      section: `Decade ${decade}`,
      prayerTitle: "Hail Mary",
      prayerText:
        "Hail Mary, full of grace, the Lord is with thee. Blessed art thou among women, and blessed is the fruit of thy womb, Jesus. Holy Mary, Mother of God, pray for us sinners, now and at the hour of our death. Amen.",
      mysteryText: `${mysterySet[decade - 1]} • Hail Mary ${i} of 10`
    });
  }

  // Only add a large separator after decades 1–4.
  if (decade < 5) {
    beads.push({
      type: "large",
      section: `Decade ${decade}`,
      prayerTitle: "Our Father",
      prayerText:
        "Our Father, who art in heaven, hallowed be thy name; thy kingdom come; thy will be done on earth as it is in heaven. Give us this day our daily bread, and forgive us our trespasses, as we forgive those who trespass against us. And lead us not into temptation, but deliver us from evil. Amen.",
      mysteryText: `Mystery ${decade}: ${mysterySet[decade - 1]}`
    });
  }
}
  return beads;
}

function buildGeometry() {
  const nodes = [];

  // SVG viewBox is 400 x 760
  // Hanging section coordinates
  nodes.push({ x: 200, y: 664, kind: "cross" }); // 0
  nodes.push({ x: 200, y: 600, kind: "large" }); // 1
  nodes.push({ x: 200, y: 560, kind: "small" }); // 2
  nodes.push({ x: 200, y: 520, kind: "small" }); // 3
  nodes.push({ x: 200, y: 480, kind: "small" }); // 4
  nodes.push({ x: 200, y: 440, kind: "large" }); // 5

// Loop geometry
// 54 loop positions: 50 small + 4 large
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

  const joyful = [
    "The Annunciation",
    "The Visitation",
    "The Nativity",
    "The Presentation in the Temple",
    "The Finding in the Temple"
  ];

  const sorrowful = [
    "The Agony in the Garden",
    "The Scourging at the Pillar",
    "The Crowning with Thorns",
    "The Carrying of the Cross",
    "The Crucifixion"
  ];

  const glorious = [
    "The Resurrection",
    "The Ascension",
    "The Descent of the Holy Spirit",
    "The Assumption",
    "The Coronation of Mary"
  ];

  const luminous = [
    "The Baptism of Jesus",
    "The Wedding at Cana",
    "The Proclamation of the Kingdom",
    "The Transfiguration",
    "The Institution of the Eucharist"
  ];

  if (day === 1 || day === 6) return joyful;
  if (day === 2 || day === 5) return sorrowful;
  if (day === 4) return luminous;
  return glorious;
}

function getMysteryNameForToday() {
  const day = new Date().getDay();
  if (day === 1 || day === 6) return "Joyful Mysteries";
  if (day === 2 || day === 5) return "Sorrowful Mysteries";
  if (day === 4) return "Luminous Mysteries";
  return "Glorious Mysteries";
}

function renderMysteryName() {
  mysteryNameEl.textContent = `Mystery of the day: ${getMysteryNameForToday()}`;
}

function renderCurrent() {
  const bead = rosaryNodes[currentIndex];
  prayerTitleEl.textContent = bead.prayerTitle;
  sectionLabelEl.textContent = bead.section;
  progressLabelEl.textContent = `Step ${currentIndex + 1} of ${rosaryNodes.length}`;
  updatePanelForCurrentBead();
}

function updatePanelForCurrentBead(index = currentIndex) {
  const bead = rosaryNodes[index];
  panelPrayerTitle.textContent = bead.prayerTitle;
  panelPrayerText.textContent = settings.showText
    ? `${bead.prayerText}\n\nMeditation: ${bead.mysteryText}`
    : bead.mysteryText;
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

  // ---------------------------
  // 1) Main loop cord
  // ---------------------------
  const loopPoints = pts.slice(6).map((p) => `${p.x},${p.y}`).join(" ");
  const loopPolyline = makeSvg("polyline", {
    points: loopPoints,
    class: "cord-path"
  });
  cordLayer.appendChild(loopPolyline);

  // ---------------------------
  // 2) Curved connectors from top large bead to loop ends
  // ---------------------------
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

  // ---------------------------
  // 3) One continuous middle cord
  // ---------------------------
  const cross = pts[0];

const hangingCord = makeSvg("line", {
  x1: topLarge.x ,
  y1: topLarge.y + beadRadiusForIndex(5),
  x2: cross.x,
  y2: cross.y
});

hangingCord.setAttribute("stroke", "#5a4334");
hangingCord.setAttribute("stroke-width", "3");
hangingCord.setAttribute("stroke-linecap", "round");
hangingCord.setAttribute("opacity", "0.95");

cordLayer.appendChild(hangingCord);

  // ---------------------------
  // 4) Visible bead-to-bead vertical segments
  //    These make the cord visibly pass through all 5 vertical beads
  // ---------------------------

  // top large -> small 3
  cordLayer.appendChild(
    makeSvg("line", {
      x1: pts[5].x,
      y1: pts[5].y + beadRadiusForIndex(5),
      x2: pts[4].x,
      y2: pts[4].y - beadRadiusForIndex(4),
      class: "cross-link"
    })
  );

  // small 3 -> small 2
  cordLayer.appendChild(
    makeSvg("line", {
      x1: pts[4].x,
      y1: pts[4].y + beadRadiusForIndex(4),
      x2: pts[3].x,
      y2: pts[3].y - beadRadiusForIndex(3),
      class: "cross-link"
    })
  );

  // small 2 -> small 1
  cordLayer.appendChild(
    makeSvg("line", {
      x1: pts[3].x,
      y1: pts[3].y + beadRadiusForIndex(3),
      x2: pts[2].x,
      y2: pts[2].y - beadRadiusForIndex(2),
      class: "cross-link"
    })
  );

  // small 1 -> lower large
  cordLayer.appendChild(
    makeSvg("line", {
      x1: pts[2].x,
      y1: pts[2].y + beadRadiusForIndex(2),
      x2: pts[1].x,
      y2: pts[1].y - beadRadiusForIndex(1),
      class: "cross-link"
    })
  );

  // lower large -> cross
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
    y: node.y-14,
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

  const start = () => {
    longPressed = false;
    clearTimeout(timer);
    timer = setTimeout(() => {
      longPressed = true;
      moveTo(index, false);
      openPanel();
    }, 420);
  };

  const cancel = () => {
    clearTimeout(timer);
  };

  el.addEventListener("pointerdown", start);
  el.addEventListener("pointerup", () => {
    if (!longPressed) {
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

function moveTo(index, useVibration = true) {
  if (index < 0 || index >= rosaryNodes.length) return;
  currentIndex = index;
  saveProgress();
  renderCurrent();
  renderRosary();

  if (useVibration) {
    vibrateForBead(rosaryNodes[currentIndex]);
  }
}

function vibrateForBead(bead) {
  if (!settings.vibration) return;
  if (!("vibrate" in navigator)) return;

  if (bead.type === "cross") {
    navigator.vibrate([140, 70, 140]);
    return;
  }

  if (bead.type === "large") {
    navigator.vibrate(500);
    return;
  }

  navigator.vibrate(30);
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
  return Number.isInteger(value) && value >= 0 && value < rosaryNodes.length ? value : 0;
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
    "touchend",
    (e) => {
      if (!isTouching || !e.changedTouches.length) return;

      const touch = e.changedTouches[0];
      const dx = touch.clientX - startX;
      const dy = touch.clientY - startY;
      isTouching = false;

      if (Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(dy)) return;

      if (dx < 0) {
        moveTo(currentIndex + 1);
      } else {
        moveTo(currentIndex - 1);
      }
    },
    { passive: true }
  );
}
