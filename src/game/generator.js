import { RULES } from "./rules.js";
import { WORDS } from "./words.js";
import { getPuzzleNumber } from "./dailyseed.js";

// Simple deterministic PRNG from a number seed
function mulberry32(seed) {
  let t = seed >>> 0;
  return function () {
    t += 0x6D2B79F5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function pickN(rng, arr, n) {
  const copy = [...arr];
  const out = [];
  while (out.length < n && copy.length) {
    const idx = Math.floor(rng() * copy.length);
    out.push(copy.splice(idx, 1)[0]);
  }
  return out;
}

export function generateDailyPuzzle() {
  const puzzleNumber = getPuzzleNumber();
  const rng = mulberry32(puzzleNumber);

  const rule = RULES[Math.floor(rng() * RULES.length)];
  const pickedWords = pickN(rng, WORDS, 3);

  const examples = pickedWords.map((w) => ({
    input: w,
    output: rule.apply(w)
  }));

  return { puzzleNumber, rule };
}

export function getExamplesForPuzzle(puzzleNumber, revealCount) {
  const rng = mulberry32(puzzleNumber);
  const rule = RULES[Math.floor(rng() * RULES.length)];
  const pickedWords = pickN(rng, WORDS, 6);

  const examples = pickedWords.map((w) => ({ input: w, output: rule.apply(w) }));
  return { rule, examples: examples.slice(0, revealCount) };
}
