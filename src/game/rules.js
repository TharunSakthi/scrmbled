export const RULES = [
  {
    id: "REVERSE",
    label: "Reverse",
    accepted: ["reverse", "backwards", "reversed", "mirror"],
    apply: (w) => w.split("").reverse().join("")
  },
  {
    id: "SORT",
    label: "Alphabetical sort",
    accepted: ["sort", "alphabetical", "alphabetize", "alphabetical sort", "sort letters"],
    apply: (w) => w.split("").sort().join("")
  },
  {
    id: "ROTATE_LEFT_1",
    label: "Rotate left by 1",
    accepted: ["rotate left", "shift left", "move first letter to end", "left rotate", "rotate left 1"],
    apply: (w) => w.slice(1) + w[0]
  },
  {
    id: "REMOVE_VOWELS",
    label: "Remove vowels",
    accepted: ["remove vowels", "no vowels", "strip vowels", "delete vowels"],
    apply: (w) => w.replace(/[AEIOU]/g, "")
  },
  {
    id: "DOUBLE_LAST",
    label: "Double last letter",
    accepted: ["double last", "repeat last", "duplicate last letter"],
    apply: (w) => w + w[w.length - 1]
  }
];
