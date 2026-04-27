import React, { useState, useEffect, useMemo, useRef } from "react";
import { Globe2, X, RotateCcw, Share2, Check, HelpCircle, ArrowUp, ArrowDown, Sparkles } from "lucide-react";
import { track } from "@vercel/analytics";

import club from "../data/club.json";
import playersData from "../data/players.json";

import { POS_LABELS, ERA_SHORT, FLAG, MAX_GUESSES } from "../core/constants.js";
import { compare, explainStatus } from "../core/compare.js";
import { pickTarget, pickClue } from "../core/daily.js";
import { T } from "../core/i18n.js";
import { buildTheme } from "../core/theme.js";
import { buildShareText } from "../core/share.js";

const PLAYERS = playersData;
const C = buildTheme(club);

// =====================================================================
// Helpers
// =====================================================================

function FontInjector() {
  useEffect(() => {
    if (document.getElementById("bandera-fonts")) return;
    const link = document.createElement("link");
    link.id = "bandera-fonts";
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Geist:wght@300;400;500;600;700&family=Geist+Mono:wght@400;500;600&display=swap";
    document.head.appendChild(link);
  }, []);
  return null;
}

function statusColor(status) {
  if (status === "hit") return { bg: C.accentSoft, fg: C.accentDark, border: C.accent };
  if (status === "partial") return { bg: C.yellowSoft, fg: C.yellowInk, border: C.yellow };
  return { bg: C.graySoft, fg: C.textDim, border: C.gray };
}

function Cell({ status, children, mono = true, arrow = null }) {
  const s = statusColor(status);
  return (
    <div
      className="flex items-center justify-center px-1 py-2 text-center relative"
      style={{
        backgroundColor: s.bg, color: s.fg,
        borderTop: `2px solid ${s.border}`,
        fontFamily: mono ? "'Geist Mono', monospace" : "'Geist', sans-serif",
        fontSize: "11px",
        fontWeight: status === "hit" ? 600 : 500,
        lineHeight: 1.15,
        minHeight: 44,
      }}
    >
      <span className="flex items-center gap-0.5">
        {children}
        {arrow === "up" && <ArrowUp size={11} strokeWidth={2.5} />}
        {arrow === "down" && <ArrowDown size={11} strokeWidth={2.5} />}
      </span>
    </div>
  );
}

// =====================================================================
// Sub-components
// =====================================================================

function Header({ lang, setLang, onShowRules, t }) {
  return (
    <header className="mb-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h1 style={{
            fontFamily: "'Instrument Serif', serif", fontStyle: "italic",
            fontSize: "clamp(1.6rem, 5vw, 2.8rem)", color: C.text,
            letterSpacing: "-0.02em", lineHeight: 1,
          }}>
            {club.siteName}
          </h1>
          <p className="text-sm mt-1.5" style={{ color: C.textDim, fontFamily: "'Geist', sans-serif" }}>
            {club.subtitle[lang === "es" ? "es" : "en"]}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={onShowRules} aria-label="rules"
            className="p-1.5 rounded-full transition-colors"
            style={{ backgroundColor: C.surface, border: `1px solid ${C.border}` }}>
            <HelpCircle size={14} style={{ color: C.textDim }} />
          </button>
          <div className="flex items-center gap-1" style={{ fontFamily: "'Geist Mono', monospace" }}>
            <Globe2 size={12} style={{ color: C.textMute }} />
            <button onClick={() => setLang("es")}
              className="text-[11px] tracking-wider px-1.5 py-1 transition-colors"
              style={{ color: lang === "es" ? C.accent : C.textDim }}>ES</button>
            <span style={{ color: C.textMute }}>/</span>
            <button onClick={() => setLang("en")}
              className="text-[11px] tracking-wider px-1.5 py-1 transition-colors"
              style={{ color: lang === "en" ? C.accent : C.textDim }}>EN</button>
          </div>
        </div>
      </div>
    </header>
  );
}

function DifficultyTabs({ value, onChange, t }) {
  const opts = [
    { key: "easy",   label: t.easy,   hint: t.easyHint },
    { key: "medium", label: t.medium, hint: t.mediumHint },
    { key: "hard",   label: t.hard,   hint: t.hardHint },
  ];
  return (
    <div className="mb-5">
      <div className="text-[10px] tracking-[0.2em] uppercase mb-2" style={{ color: C.textMute, fontFamily: "'Geist Mono', monospace" }}>
        {t.difficulty}
      </div>
      <div className="grid grid-cols-3 gap-1.5">
        {opts.map(o => {
          const sel = o.key === value;
          return (
            <button key={o.key} onClick={() => onChange(o.key)}
              className="p-2.5 text-left transition-all"
              style={{
                backgroundColor: sel ? C.accent : C.surface,
                color: sel ? "#fff" : C.text,
                border: `1px solid ${sel ? C.accent : C.border}`,
              }}>
              <div className="text-sm" style={{ fontFamily: "'Geist', sans-serif", fontWeight: 600 }}>{o.label}</div>
              <div className="text-[10px] mt-0.5 leading-tight" style={{ color: sel ? "rgba(255,255,255,0.85)" : C.textDim, fontFamily: "'Geist', sans-serif" }}>
                {o.hint}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function StarterCluePanel({ clue, t }) {
  if (!clue) return null;
  return (
    <div className="mb-4 p-4 flex gap-3 items-start"
      style={{ backgroundColor: C.clueBg, border: `1px solid ${C.clueBorder}` }}>
      <Sparkles size={14} style={{ color: C.yellowInk, marginTop: 3, flexShrink: 0 }} />
      <div className="flex-1 min-w-0">
        <div className="text-[10px] tracking-[0.2em] uppercase mb-1"
          style={{ color: C.yellowInk, fontFamily: "'Geist Mono', monospace", fontWeight: 600 }}>
          {t.starterClue}
        </div>
        <p style={{
          fontFamily: "'Instrument Serif', serif", fontStyle: "italic",
          fontSize: "1rem", color: C.text, lineHeight: 1.45, wordBreak: "break-word",
        }}>{clue.text}</p>
      </div>
    </div>
  );
}

function GuessCounter({ used, max, status }) {
  return (
    <div className="flex items-center gap-1.5 mb-3">
      {Array.from({ length: max }).map((_, i) => (
        <div key={i} className="h-1.5 flex-1 transition-colors"
          style={{
            backgroundColor: i < used
              ? (status === "won" ? C.accent : status === "lost" ? C.red : C.text)
              : C.gray,
          }} />
      ))}
    </div>
  );
}

function GuessInput({ value, setValue, suggestions, onPick, disabled, t }) {
  const inputRef = useRef(null);
  const [focused, setFocused] = useState(false);
  const filtered = useMemo(() => {
    if (!value.trim()) return [];
    const q = value.toLowerCase().trim();
    return suggestions.filter(p => p.name.toLowerCase().includes(q)).slice(0, 6);
  }, [value, suggestions]);

  return (
    <div className="relative mb-4">
      <input ref={inputRef} type="text" value={value}
        onChange={(e) => setValue(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setTimeout(() => setFocused(false), 150)}
        placeholder={t.typeName} disabled={disabled}
        className="w-full px-3 py-3 outline-none transition-colors"
        style={{
          backgroundColor: disabled ? C.graySoft : C.surface,
          border: `1px solid ${focused ? C.accent : C.border}`,
          color: C.text, fontFamily: "'Geist', sans-serif", fontSize: "14px",
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" && filtered.length > 0) { onPick(filtered[0]); setValue(""); }
        }} />
      {focused && value.trim() && (
        <div className="absolute top-full left-0 right-0 mt-1 z-20 max-h-72 overflow-y-auto"
          style={{ backgroundColor: C.surface, border: `1px solid ${C.border}`, boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
          {filtered.length === 0 ? (
            <div className="px-3 py-3 text-sm" style={{ color: C.textMute, fontFamily: "'Geist', sans-serif" }}>{t.noResults}</div>
          ) : (
            filtered.map(p => (
              <button key={p.name} onClick={() => { onPick(p); setValue(""); }}
                className="w-full text-left px-3 py-2 transition-colors hover:bg-[#f3f3f0] flex items-center gap-2"
                style={{ fontFamily: "'Geist', sans-serif" }}>
                <span className="text-base">{FLAG[p.country] || "🏳️"}</span>
                <span className="text-sm flex-1" style={{ color: C.text }}>{p.name}</span>
                <span className="text-[10px] tracking-wider uppercase"
                  style={{ color: C.textMute, fontFamily: "'Geist Mono', monospace" }}>
                  {p.pos} · {p.yearJoined}
                </span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function GridHeader({ t }) {
  const cols = [
    { short: "", long: "" },
    { short: t.columnPos,      long: t.columnPosLong },
    { short: t.columnCountry,  long: t.columnCountryLong },
    { short: t.columnEra,      long: t.columnEraLong },
    { short: t.columnYear,     long: t.columnYearLong },
    { short: t.columnGoals,    long: t.columnGoalsLong },
    { short: t.columnTrophies, long: t.columnTrophiesLong },
  ];
  return (
    <div className="grid items-center gap-px mb-1.5 text-[9px] tracking-[0.15em] uppercase"
      style={{
        gridTemplateColumns: "minmax(110px, 1.4fr) 50px 60px 60px 60px 60px 60px",
        color: C.textMute, fontFamily: "'Geist Mono', monospace",
      }}>
      {cols.map((c, i) => (
        <div key={i} className="text-center px-1" title={c.long}>{c.short}</div>
      ))}
    </div>
  );
}

function GuessRow({ guess, target, t }) {
  const c = compare(guess, target);
  const explain = explainStatus(c, t);
  return (
    <div className="mb-1">
      <div className="grid items-stretch gap-px"
        style={{
          gridTemplateColumns: "minmax(110px, 1.4fr) 50px 60px 60px 60px 60px 60px",
          backgroundColor: C.surface, border: `1px solid ${C.border}`,
        }}>
        <div className="flex items-center px-2.5 py-2 gap-1.5" style={{ minHeight: 44 }}>
          <span className="text-base shrink-0">{FLAG[guess.country] || "🏳️"}</span>
          <span className="text-sm truncate"
            style={{ color: C.text, fontFamily: "'Geist', sans-serif", fontWeight: 500 }}>
            {guess.name}
          </span>
        </div>
        <Cell status={c.posStatus}>{guess.pos}</Cell>
        <Cell status={c.countryStatus} mono={false}>
          <span className="text-base">{FLAG[guess.country] || "🏳️"}</span>
        </Cell>
        <Cell status={c.eraStatus}>
          <span className="text-[10px] leading-tight">{guess.era.map(e => ERA_SHORT[e]).join("·")}</span>
        </Cell>
        <Cell status={c.yearStatus} arrow={c.yearArrow}>{guess.yearJoined}</Cell>
        <Cell status={c.goalsStatus} arrow={c.goalsArrow}>{guess.goals}</Cell>
        <Cell status={c.trophyStatus}>
          {(guess.trophy && guess.trophy.length > 0) ? `${guess.trophy.length}` : "—"}
        </Cell>
      </div>
      {explain && (
        <div className="text-[10px] mt-1 px-1"
          style={{ color: C.textDim, fontFamily: "'Geist', sans-serif", fontStyle: "italic" }}>
          {explain}
        </div>
      )}
    </div>
  );
}

function ResultPanel({ status, target, lang, t, onShare, copied, onReset }) {
  const isWin = status === "won";
  return (
    <section className="p-5 mt-2"
      style={{ backgroundColor: C.surface, border: `2px solid ${isWin ? C.accent : C.red}` }}>
      <div className="mb-3">
        <div style={{
          fontFamily: "'Instrument Serif', serif", fontStyle: "italic",
          fontSize: "1.5rem", color: isWin ? C.accentDark : C.red, fontWeight: 600, lineHeight: 1.1,
        }}>
          {isWin ? club.winLabel[lang] : `${t.lose} ${target.name}`}
        </div>
        {isWin && (
          <div className="text-sm mt-1" style={{ color: C.textDim, fontFamily: "'Geist', sans-serif" }}>
            {club.winSubtitle[lang]}: <span style={{ color: C.text, fontWeight: 500 }}>{FLAG[target.country]} {target.name}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4 text-sm">
        <div>
          <div className="text-[9px] tracking-[0.2em] uppercase mb-0.5" style={{ color: C.textMute, fontFamily: "'Geist Mono', monospace" }}>{t.position}</div>
          <div style={{ color: C.text, fontFamily: "'Geist', sans-serif" }}>{POS_LABELS[target.pos][lang]}</div>
        </div>
        <div>
          <div className="text-[9px] tracking-[0.2em] uppercase mb-0.5" style={{ color: C.textMute, fontFamily: "'Geist Mono', monospace" }}>{t.nationality}</div>
          <div style={{ color: C.text, fontFamily: "'Geist', sans-serif" }}>
            <span className="mr-1">{FLAG[target.country]}</span>{target.country}
          </div>
        </div>
        <div>
          <div className="text-[9px] tracking-[0.2em] uppercase mb-0.5" style={{ color: C.textMute, fontFamily: "'Geist Mono', monospace" }}>{t.spell}</div>
          <div style={{ color: C.text, fontFamily: "'Geist Mono', monospace", fontSize: "12px" }}>{target.mainSpell}</div>
        </div>
        <div>
          <div className="text-[9px] tracking-[0.2em] uppercase mb-0.5" style={{ color: C.textMute, fontFamily: "'Geist Mono', monospace" }}>{t.apps}</div>
          <div style={{ color: C.text, fontFamily: "'Geist Mono', monospace" }}>{target.apps}</div>
        </div>
        <div>
          <div className="text-[9px] tracking-[0.2em] uppercase mb-0.5" style={{ color: C.textMute, fontFamily: "'Geist Mono', monospace" }}>{t.goals}</div>
          <div style={{ color: C.accent, fontFamily: "'Geist Mono', monospace", fontWeight: 600 }}>{target.goals}</div>
        </div>
        <div>
          <div className="text-[9px] tracking-[0.2em] uppercase mb-0.5" style={{ color: C.textMute, fontFamily: "'Geist Mono', monospace" }}>{t.trophies}</div>
          <div style={{ color: C.text, fontFamily: "'Geist', sans-serif", fontSize: "12px", lineHeight: 1.3 }}>
            {target.trophy.length > 0 ? target.trophy.join(" · ") : <span style={{ color: C.textMute, fontStyle: "italic" }}>{t.none}</span>}
          </div>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        <button onClick={onShare}
          className="flex items-center gap-1.5 px-3 py-2 text-sm transition-colors"
          style={{
            backgroundColor: copied ? C.accentDark : C.accent, color: "#fff",
            fontFamily: "'Geist', sans-serif", fontWeight: 500,
          }}>
          {copied ? <Check size={13} /> : <Share2 size={13} />}
          {copied ? t.shared : t.share}
        </button>
        <button onClick={onReset}
          className="flex items-center gap-1.5 px-3 py-2 text-sm transition-colors"
          style={{
            backgroundColor: C.surface, color: C.text,
            border: `1px solid ${C.border}`,
            fontFamily: "'Geist', sans-serif", fontWeight: 500,
          }}>
          <RotateCcw size={13} />
          {t.playAgain}
        </button>
      </div>
    </section>
  );
}

function ColorChip({ color, bg, label }) {
  return (
    <div className="flex items-center gap-1.5 p-2"
      style={{ backgroundColor: bg, border: `1.5px solid ${color}` }}>
      <div className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: color }} />
      <span className="text-[10px] leading-tight"
        style={{ color: C.text, fontFamily: "'Geist', sans-serif", fontWeight: 500 }}>{label}</span>
    </div>
  );
}

function RulesModal({ open, onClose, lang, t }) {
  if (!open) return null;
  const target = PLAYERS.find(p => p.name === "Joaquín") || PLAYERS[0];
  const guess = PLAYERS.find(p => p.name === "Rubén Castro") || PLAYERS[1];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
      style={{ backgroundColor: "rgba(12,13,16,0.5)" }} onClick={onClose}>
      <div className="max-w-lg w-full p-5 my-6 relative"
        style={{ backgroundColor: C.surface, border: `1px solid ${C.border}`, maxHeight: "calc(100vh - 3rem)", overflowY: "auto" }}
        onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} aria-label="close" className="absolute top-3 right-3 p-1">
          <X size={16} style={{ color: C.textDim }} />
        </button>

        <h2 className="mb-1" style={{
          fontFamily: "'Instrument Serif', serif", fontStyle: "italic",
          fontSize: "1.7rem", color: C.text, lineHeight: 1.05,
        }}>{club.siteName}</h2>
        <p className="text-xs mb-4 italic" style={{ color: C.textDim, fontFamily: "'Geist', sans-serif", lineHeight: 1.5 }}>
          {club.rulesSubtitle[lang]}
        </p>

        <p className="text-sm mb-3" style={{ color: C.text, fontFamily: "'Geist', sans-serif", lineHeight: 1.55 }}>
          {t.rulesIntro}
        </p>

        <div className="grid grid-cols-3 gap-1.5 mb-4">
          <ColorChip color={C.accent} bg={C.accentSoft} label={t.matchColor} />
          <ColorChip color={C.yellow} bg={C.yellowSoft} label={t.closeColor} />
          <ColorChip color={C.gray}   bg={C.graySoft}   label={t.noColor} />
        </div>

        <div className="mb-4">
          <p className="text-xs mb-2" style={{ color: C.textDim, fontFamily: "'Geist', sans-serif", fontStyle: "italic" }}>{t.rulesExample}</p>
          <GridHeader t={t} />
          <GuessRow guess={guess} target={target} t={t} />
        </div>

        <p className="text-xs mb-3" style={{ color: C.textDim, fontFamily: "'Geist', sans-serif", lineHeight: 1.55 }}>{t.rulesArrows}</p>
        <p className="text-xs mb-4" style={{ color: C.textDim, fontFamily: "'Geist', sans-serif", lineHeight: 1.55 }}>{t.rulesClue}</p>

        <button onClick={onClose} className="w-full py-2.5 text-sm"
          style={{ backgroundColor: C.accent, color: "#fff", fontFamily: "'Geist', sans-serif", fontWeight: 500 }}>
          {t.closeRules}
        </button>
      </div>
    </div>
  );
}

// =====================================================================
// Main game
// =====================================================================
export default function Game() {
  const [lang, setLang] = useState("es");
  const [difficulty, setDifficulty] = useState("medium");
  const [target, setTarget] = useState(() => pickTarget(PLAYERS, "medium"));
  const [guesses, setGuesses] = useState([]);
  const [input, setInput] = useState("");
  const [status, setStatus] = useState("playing");
  const [copied, setCopied] = useState(false);
  const [showRules, setShowRules] = useState(true);
  const [rerolls, setRerolls] = useState(0);

  const t = T[lang];
  const clue = useMemo(() => pickClue(target, PLAYERS, difficulty, lang, T), [target, difficulty, lang]);

  useEffect(() => {
    setTarget(pickTarget(PLAYERS, difficulty));
    setGuesses([]);
    setStatus("playing");
    setRerolls(0);
    track("game_started", { difficulty });
  }, [difficulty]);

  const onPick = (player) => {
    if (status !== "playing") return;
    if (guesses.find(g => g.name === player.name)) return;
    const next = [...guesses, player];
    setGuesses(next);
    if (player.name === target.name) {
      setStatus("won");
      track("game_won", { difficulty, guesses: next.length });
    } else if (next.length >= MAX_GUESSES) {
      setStatus("lost");
      track("game_lost", { difficulty });
    }
  };

  const onShare = async () => {
    const text = buildShareText({ guesses, target, status, difficulty, club, t });
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      track("share_clicked", { difficulty, outcome: status });
    } catch {}
  };

  const onReset = () => {
    const newReroll = rerolls + 1;
    setTarget(pickTarget(PLAYERS, difficulty, newReroll));
    setGuesses([]);
    setStatus("playing");
    setRerolls(newReroll);
  };

  const suggestionPool = useMemo(() => [...PLAYERS].sort((a, b) => a.name.localeCompare(b.name)), []);

  return (
    <>
      <FontInjector />
      <div className="min-h-screen p-5 sm:p-7"
        style={{
          backgroundColor: C.bg, color: C.text,
          backgroundImage: `radial-gradient(ellipse 80% 50% at 50% -10%, ${club.themeColor}0a, transparent 60%)`,
          fontFamily: "'Geist', sans-serif",
        }}>
        <div className="max-w-3xl mx-auto">
          <Header lang={lang} setLang={setLang} onShowRules={() => setShowRules(true)} t={t} />
          <DifficultyTabs value={difficulty} onChange={setDifficulty} t={t} />
          <StarterCluePanel clue={clue} t={t} />
          <GuessCounter used={guesses.length} max={MAX_GUESSES} status={status} />
          <GuessInput value={input} setValue={setInput}
            suggestions={suggestionPool} onPick={onPick}
            disabled={status !== "playing"} t={t} />

          {guesses.length > 0 && (
            <div className="flex items-center gap-3 flex-wrap mb-2 text-[10px]" style={{ fontFamily: "'Geist', sans-serif", color: C.textDim }}>
              <span className="text-[9px] tracking-[0.15em] uppercase" style={{ color: C.textMute, fontFamily: "'Geist Mono', monospace" }}>{t.legendTitle}:</span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: C.accentSoft, border: `1.5px solid ${C.accent}` }} />
                {t.legendMatch}
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: C.yellowSoft, border: `1.5px solid ${C.yellow}` }} />
                {t.legendClose}
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: C.graySoft, border: `1.5px solid ${C.gray}` }} />
                {t.legendNo}
              </span>
              <span className="flex items-center gap-0.5">
                <ArrowUp size={10} strokeWidth={2.5} /><ArrowDown size={10} strokeWidth={2.5} />
                <span className="ml-0.5">{t.legendDirection}</span>
              </span>
            </div>
          )}

          {guesses.length > 0 && (
            <>
              <GridHeader t={t} />
              <div>{guesses.map((g, i) => <GuessRow key={i} guess={g} target={target} t={t} />)}</div>
            </>
          )}

          {status !== "playing" && (
            <ResultPanel status={status} target={target} lang={lang} t={t}
              onShare={onShare} copied={copied} onReset={onReset} />
          )}

          <footer className="mt-10 pt-5 border-t" style={{ borderColor: C.border }}>
            <p className="text-xs" style={{ color: C.textDim, fontFamily: "'Geist', sans-serif", lineHeight: 1.5 }}>
              {club.footer[lang]}
            </p>
          </footer>
        </div>

        <RulesModal open={showRules} onClose={() => setShowRules(false)} lang={lang} t={t} />
      </div>
    </>
  );
}
