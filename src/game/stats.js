const KEY = "scrmbled_stats";

export function loadStats() {
  const raw = localStorage.getItem(KEY);
  if (!raw) return { played: 0, wins: 0, streak: 0, best: 0, lastPlayed: null };

  try {
    return JSON.parse(raw);
  } catch {
    return { played: 0, wins: 0, streak: 0, best: 0, lastPlayed: null };
  }
}

export function saveStats(stats) {
  localStorage.setItem(KEY, JSON.stringify(stats));
}
