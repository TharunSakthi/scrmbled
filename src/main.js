import "./style.css";
import { loadStats, saveStats } from "./game/stats.js";
import { loadGame, saveGame } from "./game/storage.js";
import { getPuzzleNumber } from "./game/dailySeed.js";
import { getDailyPuzzle } from "./game/generator.js";

/* ---------------- DOM ---------------- */

const examplesDiv = document.getElementById("examples");
const input = document.getElementById("guessInput");
const btn = document.getElementById("submitGuess");
const feedback = document.getElementById("feedback");
const statsDiv = document.getElementById("stats");
const shareBtn = document.getElementById("shareBtn");

const helpBtn = document.getElementById("helpBtn");
const helpModal = document.getElementById("helpModal");
const closeHelp = document.getElementById("closeHelp");

/* ---------------- Help modal ---------------- */

helpBtn.addEventListener("click", () => helpModal.classList.remove("hidden"));

function closeHelpModal() {
  helpModal.classList.add("hidden");
  beginRun(); // <-- timer starts here
}

closeHelp.addEventListener("click", closeHelpModal);

helpModal.addEventListener("click", e => {
  if (e.target === helpModal) closeHelpModal();
});


if (!localStorage.getItem("seenHelp")) {
  helpModal.classList.remove("hidden");
  localStorage.setItem("seenHelp", "1");
} else {
  beginRun(); // returning player → timer starts immediately
}


/* ---------------- Puzzle ---------------- */

const puzzleNumber = getPuzzleNumber();
const puzzle = getDailyPuzzle();

let saved = loadGame(puzzleNumber);

let attempts = saved?.attempts ?? 0;
let finished = saved?.finished ?? false;
let won = saved?.won ?? false;
let phase = saved?.phase ?? "rule"; // rule -> repair
let startTime = saved?.startTime ?? null;
let gameStarted = saved?.startTime != null;

function beginRun() {
  if (gameStarted || finished) return;

  gameStarted = true;
  startTimer();
  persist();
}


/* ---------------- Timer ---------------- */

let timerInterval = null;

const timerEl = document.createElement("div");
timerEl.className = "timer";
timerEl.textContent = "Time: 0:00";
document.getElementById("app").prepend(timerEl);

function persist() {
  saveGame({ puzzleNumber, attempts, finished, won, phase, startTime });
}

function startTimer() {
  if (!startTime) {
    startTime = Date.now();
    persist(); // <-- add this so startTime is saved
  }

  if (timerInterval) return;

  timerInterval = setInterval(() => {
    const s = Math.floor((Date.now() - startTime) / 1000);
    const m = Math.floor(s / 60);
    const sec = (s % 60).toString().padStart(2, "0");
    timerEl.textContent = `Time: ${m}:${sec}`;
  }, 1000);
}


function stopTimer() {
  clearInterval(timerInterval);
}

/* ---------------- Rendering ---------------- */

function render() {
  if (phase === "rule") {
    examplesDiv.innerHTML = `
      <div class="card">
        <div class="mono">${puzzle.exampleA}</div>
        <div class="mono">${puzzle.exampleB}</div>
      </div>
      <p>What rule transforms the first word into the second?</p>
    `;
  } else {
    examplesDiv.innerHTML = `
      <div class="card">
        <div class="mono">${puzzle.corrupted}</div>
      </div>
      <p>Repair this word by reversing the transformation. Type the real word.</p>
    `;
  }

  examplesDiv.innerHTML += `<p class="small">Attempts: ${attempts}/6</p>`;

  if (finished) {
    input.disabled = true;
    btn.disabled = true;
    shareBtn.style.display = "inline-block";
  }
}


/* ---------------- Guess checking ---------------- */

function normalize(s) {
  return s.toLowerCase().trim();
}

function endGame(message) {
  finished = true;
  persist();
  stopTimer();

  feedback.textContent = message;
  input.disabled = true;
  btn.disabled = true;

  updateStats();
  renderStats();
  shareBtn.style.display = "inline-block";
}

btn.addEventListener("click", () => {
  if (finished) return;

  const guess = normalize(input.value);
  if (!guess) return;

  startTimer();

  attempts++;
  persist();
  render();


  if (phase === "rule") {
    if (guess.includes(puzzle.ruleKeyword)) {
      phase = "repair";
      feedback.textContent = "Correct rule! Now repair the word.";
      input.value = "";
      persist();
      render();
      return;
    } else {
      feedback.textContent = "That doesn't seem right.";
    }
  }

  else if (phase === "repair") {
    if (guess === normalize(puzzle.solution)) {
      won = true;
      persist();
      endGame("Machine repaired!");
      return;
    } else {
      feedback.textContent = "Incorrect repair.";
    }
  }

  if (attempts >= 6) {
    won = false;
    persist();
    endGame(`Out of attempts. Repair answer: ${puzzle.solution}`);
  }

  input.value = "";
});

input.addEventListener("keydown", e => {
  if (e.key === "Enter") btn.click();
});

/* ---------------- Stats ---------------- */

function updateStats() {
  let stats = loadStats();
  if (stats.lastPlayed === puzzleNumber) return;

  stats.played++;

  if (won) {
    stats.wins++;
    stats.streak++;
    stats.best = Math.max(stats.best, stats.streak);
  } else {
    stats.streak = 0;
  }

  stats.lastPlayed = puzzleNumber;
  saveStats(stats);
}

function renderStats() {
  const s = loadStats();
  statsDiv.innerHTML = `
    <div class="card" style="margin-top:14px;">
      <div><b>Stats</b></div>
      <div class="row" style="justify-content:space-between;">
        <div>Played: <b>${s.played}</b></div>
        <div>Wins: <b>${s.wins}</b></div>
        <div>Streak: <b>${s.streak}</b></div>
        <div>Best: <b>${s.best}</b></div>
      </div>
    </div>
  `;
}

/* ---------------- Share ---------------- */

shareBtn.addEventListener("click", async () => {
  const result = won ? "🟩" : "⬛";
  const row = result.repeat(attempts) + "⬜".repeat(6 - attempts);
  const text = `Scrmbled #${puzzleNumber}\n${row}\n${won ? attempts + "/6" : "X/6"}`;

  await navigator.clipboard.writeText(text);
  shareBtn.textContent = "Copied!";
});

/* ---------------- Init ---------------- */

render();
renderStats();

