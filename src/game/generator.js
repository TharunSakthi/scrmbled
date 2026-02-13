import { getPuzzleNumber } from "./dailySeed.js";

// small deterministic RNG
function mulberry32(a) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick(rng, arr) {
  return arr[Math.floor(rng() * arr.length)];
}

const WORDS = [
  "planet","silver","marble","garden","rocket","castle","signal","puzzle",
  "button","animal","stream","flight","memory","shadow","circle","random",
  "candle","wallet","winter","summer","coffee","mountain","picture","friend"
];

// keep rules simple + explainable
const RULES = [
  { label: "rotate left 1", keyword: "rotate left 1", apply: (w) => w.slice(1) + w[0] },
  { label: "rotate right 1", keyword: "rotate right 1", apply: (w) => w.at(-1) + w.slice(0, -1) },
  { label: "reverse", keyword: "reverse", apply: (w) => w.split("").reverse().join("") },
  {
    label: "swap halves",
    keyword: "swap halves",
    apply: (w) => {
      const mid = Math.floor(w.length / 2);
      return w.slice(mid) + w.slice(0, mid);
    }
  }
];

export function getDailyPuzzle() {
  const puzzleNumber = getPuzzleNumber();
  const rng = mulberry32(1337 + puzzleNumber);

  const rule = pick(rng, RULES);

  // pick 2 example words (different)
  let w1 = pick(rng, WORDS);
  let w2 = pick(rng, WORDS);
  while (w2 === w1) w2 = pick(rng, WORDS);

  // choose repair word (different)
  let repair = pick(rng, WORDS);
  while (repair === w1 || repair === w2) repair = pick(rng, WORDS);

  const exA = `${w1.toUpperCase()} → ${rule.apply(w1).toUpperCase()}`;
  const exB = `${w2.toUpperCase()} → ${rule.apply(w2).toUpperCase()}`;

  const corrupted = rule.apply(repair).toUpperCase(); // broken output shown to user
  const solution = repair.toUpperCase();              // real word they must type

  return {
    exampleA: exA,
    exampleB: exB,
    corrupted,
    solution,
    ruleKeyword: rule.keyword,
    ruleLabel: rule.label
  };

}
