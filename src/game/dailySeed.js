export function getPuzzleNumber() {
  const startDate = new Date("2025-01-01");
  const today = new Date();

  const diff = today - startDate;
  const day = Math.floor(diff / (1000 * 60 * 60 * 24));

  return day;
}
