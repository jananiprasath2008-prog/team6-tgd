const $ = (selector) => document.querySelector(selector);

const state = {
  level: 0,
  total: 0,
  awareness: 0,
  cooperation: 0,
  sound: true,
  choices: [],
  timer: null
};

const levels = [
  {
    title: "THE CLIMATE ALERT",
    broadcast: "Heat is rising, rivers are swelling, and taps are running dry. The town needs an Environmental Guardian.",
    prompt: "Explore the town and fix the first urgent problem.",
    choices: [
      { icon:"☀", title:"Shade & cool the school", detail:"Plant trees and protect the hottest community space.", points:10, awareness:10, cooperation:5 },
      { icon:"💧", title:"Report water leakage", detail:"Alert the community crew and start a repair.", points:10, awareness:10, cooperation:5 },
      { icon:"♻", title:"Clear the blocked drain", detail:"Volunteer with neighbours to prevent flooding.", points:10, awareness:5, cooperation:10 }
    ]
  },
  {
    title: "THE PEOPLE'S CHOICE",
    broadcast: "A normal morning reveals three choices. Remember: small habits change the shape of tomorrow.",
    prompt: "Choose how you respond to everyday life.",
    choices: [
      { icon:"🚿", title:"Save water", detail:"Reuse and repair before turning on the tap.", points:10, awareness:10, cooperation:5 },
      { icon:"♻", title:"Reduce household waste", detail:"Separate waste and refuse unnecessary plastic.", points:10, awareness:10, cooperation:5 },
      { icon:"💡", title:"Switch off the unused city lights", detail:"Protect energy and night-time wildlife.", points:10, awareness:10, cooperation:5 }
    ],
    timed: true
  },
  {
    title: "WHO IS RESPONSIBLE?",
    broadcast: "Individuals, industries and government shape one climate. No one can solve the crisis alone.",
    prompt: "Choose a shared solution for all three groups.",
    choices: [
      { icon:"👥", title:"Public: community action", detail:"Citizens join clean-ups and demand fair resources.", points:5, awareness:5, cooperation:10 },
      { icon:"🏭", title:"Industry: clean production", detail:"Reduce emissions and adopt circular resources.", points:5, awareness:5, cooperation:10 },
      { icon:"🏛", title:"Government: climate policy", detail:"Fund transit, protect forests and regulate pollution.", points:5, awareness:5, cooperation:10 }
    ]
  },
  {
    title: "STORIES OF TOMORROW",
    broadcast: "Every river, street and home holds a story. Listen before deciding the town's future.",
    prompt: "Which character's story will guide your plan?",
    choices: [
      { icon:"🌾", title:"Mira, the riverside farmer", detail:"Protect floods' harvest and restore the soil.", points:10, awareness:10, cooperation:5 },
      { icon:"📚", title:"Kabir, the young storyteller", detail:"Create a living archive of local climate history.", points:5, awareness:10, cooperation:5 },
      { icon:"🧑‍🔧", title:"Asha, the neighbourhood technician", detail:"Build a shared solar and rainwater system.", points:10, awareness:5, cooperation:10 }
    ]
  },
  {
    title: "THE FINAL PLANET CHALLENGE",
    broadcast: "Make the final plan count. Your decisions will determine whether tomorrow thrives.",
    prompt: "Choose the action that completes the town's recovery.",
    choices: [
      { icon:"💧", title:"Water security plan", detail:"Rainwater harvesting, repair and fair sharing.", points:10, awareness:10, cooperation:5 },
      { icon:"🌱", title:"Zero-waste neighbourhood", detail:"Compost, reuse and hold polluters accountable.", points:10, awareness:10, cooperation:5 },
      { icon:"🤝", title:"Community climate alliance", detail:"Link citizens, industry and government.", points:10, awareness:5, cooperation:10 }
    ],
    timed: true
  }
];

function playTone(frequency = 420) {
  if (!state.sound) return;
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = frequency;
    osc.connect(gain); gain.connect(ctx.destination);
    gain.gain.setValueAtTime(.04, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(.001, ctx.currentTime + .18);
    osc.start(); osc.stop(ctx.currentTime + .18);
  } catch (_) {}
}

function showScreen(id) {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  $(id).classList.add("active");
}

function updateStats() {
  $("#scoreTop").textContent = state.total;
  $("#awarenessScore").textContent = state.awareness;
  $("#cooperationScore").textContent = state.cooperation;
  $("#totalScore").textContent = state.total;
}

function renderSteps() {
  $("#levelSteps").innerHTML = levels.map((_, i) =>
    `<div class="step-dot ${i < state.level ? "done" : i === state.level ? "active" : ""}">${i < state.level ? "✓" : i + 1}</div>`
  ).join("");
}

function renderLevel() {
  clearInterval(state.timer);
  const level = levels[state.level];
  $("#levelNumber").textContent = `LEVEL ${state.level + 1} / 5`;
  $("#levelTitle").textContent = level.title;
  $("#broadcastText").textContent = level.broadcast;
  $("#worldArt").className = `world-art level${state.level + 1}`;
  renderSteps();
  updateStats();

  $("#challenge").innerHTML = `
    <h3>${level.prompt}</h3>
    <div class="choice-grid">
      ${level.choices.map((choice, i) => `
        <button class="choice-card" data-choice="${i}">
          <span class="icon">${choice.icon}</span>
          <strong>${choice.title}</strong>
          <small>${choice.detail}</small>
        </button>
      `).join("")}
    </div>`;

  document.querySelectorAll(".choice-card").forEach(button =>
    button.addEventListener("click", () => choose(parseInt(button.dataset.choice)))
  );

  const timerBox = $("#timerBox");
  timerBox.hidden = !level.timed;
  if (level.timed) startTimer();
  saveProgress();
}

function startTimer() {
  let seconds = 30;
  $("#timer").textContent = seconds;
  state.timer = setInterval(() => {
    seconds--;
    $("#timer").textContent = seconds;
    if (seconds <= 0) {
      clearInterval(state.timer);
      choose(0, true);
    }
  }, 1000);
}

function choose(index, timedOut = false) {
  clearInterval(state.timer);
  const level = levels[state.level];
  const choice = level.choices[index];
  state.total += timedOut ? 0 : choice.points;
  state.awareness += timedOut ? 0 : choice.awareness;
  state.cooperation += timedOut ? 0 : choice.cooperation;
  state.choices.push({ level: state.level, choice: index, points: timedOut ? 0 : choice.points });
  updateStats();

  const message = timedOut
    ? "Time ran out. A delayed response gives the town no immediate protection. +0 points."
    : choice.points === 10
      ? `Responsible choice! ${choice.title} strengthens the town. +10 points.`
      : `Shared responsibility matters. ${choice.title} makes progress. +5 points.`;
  showToast(message);
  playTone(choice.points === 10 ? 620 : 420);

  document.querySelectorAll(".choice-card").forEach(card => card.disabled = true);
  setTimeout(() => {
    state.level++;
    if (state.level < levels.length) renderLevel();
    else finishGame();
  }, 1700);
}

function showToast(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2500);
}

function finishGame() {
  clearInterval(state.timer);
  showScreen("#endingScreen");
  const percentage = Math.round((state.total / 50) * 100);
  const condition = percentage >= 80 ? "THRIVING" : percentage >= 50 ? "RECOVERING" : "VULNERABLE";
  $("#townCondition").textContent = condition;
  $("#finalScore").textContent = `${state.total} / 50`;
  $("#townResult").className = `town-result ${percentage >= 70 ? "good" : "bad"}`;
  $("#endingTitle").textContent = condition === "THRIVING" ? "THE FUTURE IS OURS" : "THE FUTURE NEEDS US";
  const badges = [];
  if (state.awareness >= 35) badges.push("Climate Mind");
  if (state.cooperation >= 35) badges.push("Community Ally");
  if (state.total >= 45) badges.push("Guardian of Tomorrow");
  if (!badges.length) badges.push("Young Guardian");
  $("#badges").innerHTML = badges.map(b => `<span class="badge">✦ ${b}</span>`).join("");
  localStorage.removeItem("derangementSave");
  playTone(760);
}

function saveProgress() {
  if (state.level < levels.length) {
    localStorage.setItem("derangementSave", JSON.stringify(state));
  }
}

function loadProgress() {
  const saved = localStorage.getItem("derangementSave");
  if (!saved) return false;
  try {
    const data = JSON.parse(saved);
    Object.assign(state, data);
    state.timer = null;
    return true;
  } catch (_) { return false; }
}

function startGame() {
  Object.assign(state, { level:0, total:0, awareness:0, cooperation:0, choices:[] });
  showScreen("#gameScreen");
  renderLevel();
  playTone();
}

$("#startBtn").addEventListener("click", startGame);
$("#continueBtn").addEventListener("click", () => { showScreen("#gameScreen"); renderLevel(); });
$("#restartBtn").addEventListener("click", startGame);
$("#homeBtn").addEventListener("click", () => { clearInterval(state.timer); showScreen("#menuScreen"); });
$("#soundBtn").addEventListener("click", () => {
  state.sound = !state.sound;
  $("#soundBtn").textContent = state.sound ? "♫" : "×";
  if (state.sound) playTone();
});
$("#actionBtn").addEventListener("click", () => showToast("Today: save water, reduce waste, use less energy, and act with your community."));

if (loadProgress()) $("#continueBtn").hidden = false;
