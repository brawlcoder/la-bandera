import { POS_LABELS, continent } from "./constants.js";

// Compare a guess against the secret target across all 6 attributes.
// Returns per-attribute status: "hit" | "partial" | "miss"
// Plus directional arrows for year and goals.
export function compare(guess, target) {
  // Position
  let posStatus = "miss";
  if (guess.pos === target.pos) posStatus = "hit";
  else if (POS_LABELS[guess.pos].group === POS_LABELS[target.pos].group) posStatus = "partial";

  // Country
  let countryStatus = "miss";
  if (guess.country === target.country) countryStatus = "hit";
  else if (continent(guess.country) === continent(target.country)) countryStatus = "partial";

  // Era — multi-valued (a player can span eras), so check overlap
  const tEras = new Set(target.era);
  const gEras = new Set(guess.era);
  const overlap = [...gEras].filter(e => tEras.has(e));
  let eraStatus = "miss";
  if (overlap.length === gEras.size && overlap.length === tEras.size) eraStatus = "hit";
  else if (overlap.length > 0) eraStatus = "partial";

  // Year — exact = hit, within ±5 = partial
  const yearDiff = guess.yearJoined - target.yearJoined;
  let yearStatus = "miss";
  if (yearDiff === 0) yearStatus = "hit";
  else if (Math.abs(yearDiff) <= 5) yearStatus = "partial";
  const yearArrow = yearStatus === "hit" ? null : (yearDiff > 0 ? "down" : "up");

  // Goals — within 5 = hit, within 25 = partial
  const goalsDiff = guess.goals - target.goals;
  let goalsStatus = "miss";
  if (Math.abs(goalsDiff) <= 5) goalsStatus = "hit";
  else if (Math.abs(goalsDiff) <= 25) goalsStatus = "partial";
  const goalsArrow = goalsStatus === "hit" ? null : (goalsDiff > 0 ? "down" : "up");

  // Trophies — full match = hit, any overlap = partial, both empty = hit
  const tg = new Set(guess.trophy || []);
  const tt = new Set(target.trophy || []);
  let trophyStatus = "miss";
  const tOverlap = [...tg].filter(t => tt.has(t));
  if (tg.size === 0 && tt.size === 0) trophyStatus = "hit";
  else if (tg.size === tt.size && tOverlap.length === tg.size) trophyStatus = "hit";
  else if (tOverlap.length > 0) trophyStatus = "partial";

  return { posStatus, countryStatus, eraStatus, yearStatus, yearArrow, goalsStatus, goalsArrow, trophyStatus };
}

// Human-readable summary of which cells matched, for the under-row caption.
export function explainStatus(c, t) {
  const parts = [];
  if (c.posStatus === "hit") parts.push(t.explainSamePos);
  else if (c.posStatus === "partial") parts.push(t.explainSameZone);
  if (c.countryStatus === "hit") parts.push(t.explainSameCountry);
  else if (c.countryStatus === "partial") parts.push(t.explainSameContinent);
  if (c.eraStatus === "hit") parts.push(t.explainSameEra);
  else if (c.eraStatus === "partial") parts.push(t.explainOverlapEra);
  if (c.yearStatus === "hit") parts.push(t.explainSameYear);
  else if (c.yearStatus === "partial") parts.push(t.explainCloseYear);
  return parts.length > 0 ? parts.slice(0, 3).join(" · ") : null;
}
