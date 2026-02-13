import "./style.css";
import { loadStats, saveStats } from "./game/stats.js";
import { loadGame, saveGame } from "./game/storage.js";
import { getPuzzleNumber } from "./game/dailySeed.js";
import { getExamplesForPuzzle } from "./game/generator.js";

const shareBtn = document.getElementById("shareBtn");
const examplesDiv = document.getElementById("examples");
const input = document.getElementById("guessInput");
const btn = document.getElementById("submitGuess");
const feedback = document.getElementById("feedback");
const statsDiv = document.getElementById("stats");

const helpBtn = document.getElementById("helpBtn");
const helpModal = document.getElementById("helpModal");
const closeHelp = document.getElementById("closeHelp");

helpBtn.addEventListener("click", () => helpModal.classList.remove("hidden"));
closeHelp.addEventListener("click", () => helpModal.classList.add("hidden"));
helpModal.addEventListener("click", (e) => {
  if (e.target === helpModal) helpModal.classList.add("hidden");
});

// show once on first visit
if (!localStorage.getItem("seenHelp")) {
  helpModal.classList.remove("hidden");
  localStorage.setItem("seenHelp", "1");
}


const puzzleNumber = getPuzzleNumber();

let saved = loadGame(puzzleNumber);

let attempts = saved?.attempts ?? 0;
let revealCount = saved?.revealCount ?? 2;
let finished = saved?.finished ?? false;
let won = saved?.won ?? false;

const maxAttempts = 6;

function showShare() {
  shareBtn.style.display = "inline-block";
}


function persist() {
  saveGame({ puzzleNumber, attempts, revealCount, finished, won });
}

function normalize(s) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function render() {
  const { examples } = getExamplesForPuzzle(puzzleNumber, revealCount);

  examplesDiv.innerHTML = `
    <p>Puzzle #${puzzleNumber}</p>
    <div>
      ${examples
        .map(
          (ex) => `<div style="font-family: monospace; margin: 6px 0;">
            <b>${ex.input}</b> → <b>${ex.output}</b>
          </div>`
        )
        .join("")}
    </div>
    <p>Attempts: ${attempts}/${maxAttempts}</p>
  `;

  if (finished) {
    input.disabled = true;
    btn.disabled = true;
    feedback.textContent = won
      ? "You already solved today's Scrmbled!"
      : "You already attempted today's Scrmbled!";
  }
}

function checkGuess(guessRaw) {
  const { rule } = getExamplesForPuzzle(puzzleNumber, revealCount);
  const guess = normalize(guessRaw);

  const accepted = rule.accepted.map(normalize);
  const hit = accepted.some((a) => guess === a || guess.includes(a) || a.includes(guess));

  return { hit, rule };
}

function endGame(message) {
  feedback.textContent = message;
  input.disabled = true;
  btn.disabled = true;

  updateStats();
  renderStats();   // ADD THIS
  showShare();
}


function updateStats() {
  let stats = loadStats();

  const today = puzzleNumber;

  if (stats.lastPlayed === today) return;

  stats.played += 1;

  if (won) {
    stats.wins += 1;
    stats.streak += 1;
    stats.best = Math.max(stats.best, stats.streak);
  } else {
    stats.streak = 0;
  }

  stats.lastPlayed = today;

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


function buildShareText() {
  let result = won ? "🟩" : "⬛";
  let row = result.repeat(attempts) + "⬜".repeat(6 - attempts);

  return `Scrmbled #${puzzleNumber}\n${row}\n${won ? attempts + "/6" : "X/6"}`;
}


btn.addEventListener("click", () => {
  if (input.disabled) return;

  const val = input.value;
  if (!val.trim()) return;

  attempts += 1;
  persist();

  const { hit, rule } = checkGuess(val);

  if (hit) {
    finished = true;
    won = true;
    persist();
    endGame(`Correct! Rule was: ${rule.label}`);
    return;
  }

  // wrong
  feedback.textContent = "Not quite. Another example revealed.";
  input.value = "";

  revealCount = Math.min(revealCount + 1, 6);
  persist();

  if (attempts >= maxAttempts) {
    finished = true;
    won = false;
    persist();
    endGame(`Out of tries. Rule was: ${rule.label}`);
    return;
  }

  render();
});

input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") btn.click();
});

shareBtn.style.display = finished ? "inline-block" : "none";

shareBtn.addEventListener("click", async () => {
  const text = buildShareText();
  await navigator.clipboard.writeText(text);
  shareBtn.textContent = "Copied!";
});

// Initial render
persist();
render();
renderStats();


