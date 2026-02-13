const KEY = "scrmbled_save";

export function loadGame(puzzleNumber) {
  const raw = localStorage.getItem(KEY);
  if (!raw) return null;

  try {
    const data = JSON.parse(raw);
    if (data.puzzleNumber === puzzleNumber) return data;
    return null;
  } catch {
    return null;
  }
}

export function saveGame(state) {
  localStorage.setItem(KEY, JSON.stringify(state));
}
