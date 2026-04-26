// Static reference data shared by engine and components.
// These don't change between clubs — the per-club bits live in club.json.

export const POS_LABELS = {
  GK: { es: "Portero",       en: "Goalkeeper",   esSent: "portero",            enSent: "goalkeeper",          group: "GK"  },
  CB: { es: "Central",       en: "Centre-back",  esSent: "central",            enSent: "centre-back",         group: "DEF" },
  RB: { es: "Lateral der.",  en: "Right-back",   esSent: "lateral derecho",    enSent: "right-back",          group: "DEF" },
  LB: { es: "Lateral izq.",  en: "Left-back",    esSent: "lateral izquierdo",  enSent: "left-back",           group: "DEF" },
  DM: { es: "Mediocentro",   en: "Defensive mid",esSent: "mediocentro",        enSent: "defensive midfielder",group: "MID" },
  CM: { es: "Centrocampista",en: "Central mid",  esSent: "centrocampista",     enSent: "central midfielder",  group: "MID" },
  AM: { es: "Mediapunta",    en: "Attacking mid",esSent: "mediapunta",         enSent: "attacking midfielder",group: "MID" },
  WG: { es: "Extremo",       en: "Winger",       esSent: "extremo",            enSent: "winger",              group: "FWD" },
  ST: { es: "Delantero",     en: "Striker",      esSent: "delantero",          enSent: "striker",             group: "FWD" },
};

export const POS_GROUP_LABELS = {
  GK:  { es: "portero",            en: "goalkeeper" },
  DEF: { es: "defensa",            en: "defender" },
  MID: { es: "centrocampista",     en: "midfielder" },
  FWD: { es: "delantero o extremo",en: "forward or winger" },
};

export const ERA_SHORT = { classic: "Cl", nineties: "90s", "2000s": "00s", "2010s": "10s", modern: "Mod" };

export const ERA_LABELS = {
  classic:  { es: "antes de los 90", en: "pre-1990s" },
  nineties: { es: "los años 90",     en: "the 1990s" },
  "2000s":  { es: "los 2000",        en: "the 2000s" },
  "2010s":  { es: "los 2010",        en: "the 2010s" },
  modern:   { es: "la era moderna",  en: "the modern era" },
};

export const FLAG = {
  ESP:"🇪🇸",ARG:"🇦🇷",BRA:"🇧🇷",URU:"🇺🇾",POR:"🇵🇹",ITA:"🇮🇹",
  NED:"🇳🇱",FRA:"🇫🇷",POL:"🇵🇱",UKR:"🇺🇦",CMR:"🇨🇲",MEX:"🇲🇽",
  CHI:"🇨🇱",PAR:"🇵🇾",BEL:"🇧🇪",SVN:"🇸🇮",MAR:"🇲🇦",GER:"🇩🇪",
  MLI:"🇲🇱",NGA:"🇳🇬",CRO:"🇭🇷",BIH:"🇧🇦",USA:"🇺🇸",DEN:"🇩🇰",
  ALG:"🇩🇿",SEN:"🇸🇳",DOM:"🇩🇴",JPN:"🇯🇵",ISL:"🇮🇸",CRC:"🇨🇷",COL:"🇨🇴",
};

export const COUNTRY_NAMES = {
  ESP:{es:"España",en:"Spain"}, ARG:{es:"Argentina",en:"Argentina"}, BRA:{es:"Brasil",en:"Brazil"},
  URU:{es:"Uruguay",en:"Uruguay"}, POR:{es:"Portugal",en:"Portugal"}, ITA:{es:"Italia",en:"Italy"},
  NED:{es:"Países Bajos",en:"Netherlands"}, FRA:{es:"Francia",en:"France"}, POL:{es:"Polonia",en:"Poland"},
  UKR:{es:"Ucrania",en:"Ukraine"}, CMR:{es:"Camerún",en:"Cameroon"}, MEX:{es:"México",en:"Mexico"},
  CHI:{es:"Chile",en:"Chile"}, BEL:{es:"Bélgica",en:"Belgium"}, SVN:{es:"Eslovenia",en:"Slovenia"},
  MAR:{es:"Marruecos",en:"Morocco"}, GER:{es:"Alemania",en:"Germany"}, NGA:{es:"Nigeria",en:"Nigeria"},
  CRO:{es:"Croacia",en:"Croatia"}, BIH:{es:"Bosnia",en:"Bosnia"}, USA:{es:"Estados Unidos",en:"USA"},
  DEN:{es:"Dinamarca",en:"Denmark"}, ALG:{es:"Argelia",en:"Algeria"}, SEN:{es:"Senegal",en:"Senegal"},
  DOM:{es:"República Dominicana",en:"Dominican Republic"}, JPN:{es:"Japón",en:"Japan"},
  ISL:{es:"Islandia",en:"Iceland"}, CRC:{es:"Costa Rica",en:"Costa Rica"}, PAR:{es:"Paraguay",en:"Paraguay"},
  COL:{es:"Colombia",en:"Colombia"},
};

const CONTINENTS = {
  EU: ["ESP","POR","FRA","ITA","NED","GER","BEL","POL","UKR","CRO","BIH","DEN","SVN","ISL"],
  SA: ["ARG","BRA","URU","CHI","PAR","COL"],
  NA: ["MEX","USA","CRC","DOM"],
  AF: ["CMR","MAR","MLI","NGA","ALG","SEN"],
  AS: ["JPN"],
};

export const CONTINENT_LABELS = {
  EU: { es: "Europa", en: "Europe" },
  SA: { es: "Sudamérica", en: "South America" },
  NA: { es: "Norteamérica/Caribe", en: "North America/Caribbean" },
  AF: { es: "África", en: "Africa" },
  AS: { es: "Asia", en: "Asia" },
};

export function continent(code) {
  for (const [c, list] of Object.entries(CONTINENTS)) if (list.includes(code)) return c;
  return null;
}

// Game constants
export const MAX_GUESSES = 6;
