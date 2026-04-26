import { POS_LABELS, continent } from "./constants.js";

// Days since fixed epoch, used to pick the daily target deterministically.
export function dayIndex() {
  const start = new Date("2024-01-01T00:00:00").getTime();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.floor((today.getTime() - start) / (1000 * 60 * 60 * 24));
}

// Pick today's target player for a given difficulty.
// `offset` is for the manual reroll button — kept for now, can be removed
// before public launch to enforce one-play-per-day.
export function pickTarget(players, difficulty, offset = 0) {
  const pool = players.filter(p => p.difficulty === difficulty);
  if (pool.length === 0) return null;
  const salt = { easy: 1, medium: 2, hard: 3 }[difficulty] || 0;
  return pool[(dayIndex() + salt * 7 + offset) % pool.length];
}

// Build every plausible single-attribute clue for the target,
// each annotated with how many players from the full pool match it.
function buildAttributeClues(target, pool, t) {
  const count = (filter) => pool.filter(filter).length;
  const clues = [];

  clues.push({ type: "country", text: t.clueCountry(target.country),
    candidates: count(p => p.country === target.country) });

  const cont = continent(target.country);
  if (cont) clues.push({ type: "continent", text: t.clueContinent(cont),
    candidates: count(p => continent(p.country) === cont) });

  clues.push({ type: "position", text: t.cluePosition(target.pos),
    candidates: count(p => p.pos === target.pos) });

  const group = POS_LABELS[target.pos].group;
  clues.push({ type: "positionGroup", text: t.cluePositionGroup(group),
    candidates: count(p => POS_LABELS[p.pos].group === group) });

  for (const era of target.era) {
    clues.push({ type: "era", text: t.clueEra(era),
      candidates: count(p => p.era.includes(era)) });
  }

  clues.push({ type: "year", text: t.clueYear(target.yearJoined),
    candidates: count(p => p.yearJoined === target.yearJoined) });

  // ±2 year window
  {
    const lo = target.yearJoined - 2, hi = target.yearJoined + 2;
    clues.push({ type: "yearRange", text: t.clueYearRange(lo, hi),
      candidates: count(p => p.yearJoined >= lo && p.yearJoined <= hi) });
  }
  // ±5 year window
  {
    const lo = target.yearJoined - 5, hi = target.yearJoined + 5;
    clues.push({ type: "yearRangeWide", text: t.clueYearRange(lo, hi),
      candidates: count(p => p.yearJoined >= lo && p.yearJoined <= hi) });
  }

  for (const tn of target.trophy || []) {
    clues.push({ type: "trophy", text: t.clueTrophy(tn),
      candidates: count(p => (p.trophy || []).includes(tn)) });
  }

  // Goals bucket
  {
    const g = target.goals;
    let lo, hi;
    if (g >= 100) { lo = 100; hi = 200; }
    else if (g >= 50) { lo = 50; hi = 99; }
    else if (g >= 20) { lo = 20; hi = 49; }
    else if (g >= 5) { lo = 5; hi = 19; }
    else { lo = 0; hi = 4; }
    clues.push({ type: "goalsRange", text: t.clueGoalsRange(lo, hi),
      candidates: count(p => p.goals >= lo && p.goals <= hi) });
  }

  return clues;
}

// Pick the starter clue for the day. Easy = narrative; medium/hard = attribute reveal.
export function pickClue(target, players, difficulty, lang, T) {
  const t = T[lang];

  if (difficulty === "easy" && target.clue) {
    return { kind: "narrative", text: target.clue[lang] };
  }

  const allClues = buildAttributeClues(target, players, t);

  let lo, hi;
  if (difficulty === "medium") { lo = 4; hi = 8; }
  else                          { lo = 8; hi = 16; }

  let band = allClues.filter(c => c.candidates >= lo && c.candidates <= hi);
  if (band.length === 0) {
    const mid = (lo + hi) / 2;
    band = [...allClues].sort((a, b) => Math.abs(a.candidates - mid) - Math.abs(b.candidates - mid)).slice(0, 3);
  }

const day = dayIndex();
  const salt = { easy: 5, medium: 11, hard: 17 }[difficulty] ?? 0;
  const pick = band.length > 0 ? band[(day + salt) % band.length] : null;
  if (!pick) return { kind: "attribute", text: "" };
  return { kind: "attribute", text: pick.text, candidateCount: pick.candidates };
}
