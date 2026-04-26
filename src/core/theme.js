// Builds the theme palette. Most values are constant across clubs;
// the `accent` colours come from club.json so each club gets its own.

export function buildTheme(club) {
  return {
    bg:        "#fafaf8",
    surface:   "#ffffff",
    surface2:  "#efefec",
    border:    "#e3e3df",
    text:      "#0c0d10",
    textDim:   "#5b5d63",
    textMute:  "#9a9ba0",
    accent:    club.themeColor || "#0bb363",
    accentDark: club.themeColorDark || "#08864b",
    accentSoft: club.themeColorSoft || "#e7f5ed",
    yellow:    "#e8b80a",
    yellowSoft:"#fef5d0",
    yellowInk: "#7d6500",
    gray:      "#d9d9d4",
    graySoft:  "#f3f3f0",
    red:       "#c8102e",
    clueBg:    "#fff8e6",
    clueBorder:"#e8d28a",
  };
}
