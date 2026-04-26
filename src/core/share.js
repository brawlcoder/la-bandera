import { compare } from "./compare.js";
import { MAX_GUESSES } from "./constants.js";

const STATUS_EMOJI = { hit: "🟢", partial: "🟡", miss: "⬜" };

// Build the shareable text result. Keep it club-agnostic by reading
// the emoji + short name from club config.
export function buildShareText({ guesses, target, status, difficulty, club, t }) {
  const grid = guesses.map(g => {
    const c = compare(g, target);
    return STATUS_EMOJI[c.posStatus] +
           STATUS_EMOJI[c.countryStatus] +
           STATUS_EMOJI[c.eraStatus] +
           STATUS_EMOJI[c.yearStatus] +
           STATUS_EMOJI[c.goalsStatus] +
           STATUS_EMOJI[c.trophyStatus];
  }).join("\n");

  const score = status === "won" ? guesses.length : "X";
  const header = `${club.shareEmoji} ${club.siteNameShort} · ${t[difficulty]} · ${score}/${MAX_GUESSES}`;
  return `${header}\n\n${grid}`;
}
