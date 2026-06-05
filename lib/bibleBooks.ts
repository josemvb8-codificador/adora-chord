export interface BibleBook {
  num: number;    // 1-66 (número en la API getbible.net)
  es: string;     // Nombre en español
  en: string;     // Nombre en inglés
  abbr: string;   // Abreviatura
  chapters: number;
  testament: "OT" | "NT";
}

export const BIBLE_BOOKS: BibleBook[] = [
  // ── Antiguo Testamento ────────────────────────────────────────
  { num: 1,  es: "Génesis",         en: "Genesis",         abbr: "Gn",  chapters: 50, testament: "OT" },
  { num: 2,  es: "Éxodo",           en: "Exodus",          abbr: "Ex",  chapters: 40, testament: "OT" },
  { num: 3,  es: "Levítico",        en: "Leviticus",       abbr: "Lv",  chapters: 27, testament: "OT" },
  { num: 4,  es: "Números",         en: "Numbers",         abbr: "Nm",  chapters: 36, testament: "OT" },
  { num: 5,  es: "Deuteronomio",    en: "Deuteronomy",     abbr: "Dt",  chapters: 34, testament: "OT" },
  { num: 6,  es: "Josué",           en: "Joshua",          abbr: "Jos", chapters: 24, testament: "OT" },
  { num: 7,  es: "Jueces",          en: "Judges",          abbr: "Jue", chapters: 21, testament: "OT" },
  { num: 8,  es: "Rut",             en: "Ruth",            abbr: "Rt",  chapters: 4,  testament: "OT" },
  { num: 9,  es: "1 Samuel",        en: "1 Samuel",        abbr: "1S",  chapters: 31, testament: "OT" },
  { num: 10, es: "2 Samuel",        en: "2 Samuel",        abbr: "2S",  chapters: 24, testament: "OT" },
  { num: 11, es: "1 Reyes",         en: "1 Kings",         abbr: "1R",  chapters: 22, testament: "OT" },
  { num: 12, es: "2 Reyes",         en: "2 Kings",         abbr: "2R",  chapters: 25, testament: "OT" },
  { num: 13, es: "1 Crónicas",      en: "1 Chronicles",   abbr: "1Cr", chapters: 29, testament: "OT" },
  { num: 14, es: "2 Crónicas",      en: "2 Chronicles",   abbr: "2Cr", chapters: 36, testament: "OT" },
  { num: 15, es: "Esdras",          en: "Ezra",            abbr: "Esd", chapters: 10, testament: "OT" },
  { num: 16, es: "Nehemías",        en: "Nehemiah",        abbr: "Neh", chapters: 13, testament: "OT" },
  { num: 17, es: "Ester",           en: "Esther",          abbr: "Est", chapters: 10, testament: "OT" },
  { num: 18, es: "Job",             en: "Job",             abbr: "Job", chapters: 42, testament: "OT" },
  { num: 19, es: "Salmos",          en: "Psalms",          abbr: "Sal", chapters: 150, testament: "OT" },
  { num: 20, es: "Proverbios",      en: "Proverbs",        abbr: "Pr",  chapters: 31, testament: "OT" },
  { num: 21, es: "Eclesiastés",     en: "Ecclesiastes",   abbr: "Ec",  chapters: 12, testament: "OT" },
  { num: 22, es: "Cantares",        en: "Song of Solomon", abbr: "Cnt", chapters: 8,  testament: "OT" },
  { num: 23, es: "Isaías",          en: "Isaiah",          abbr: "Is",  chapters: 66, testament: "OT" },
  { num: 24, es: "Jeremías",        en: "Jeremiah",        abbr: "Jr",  chapters: 52, testament: "OT" },
  { num: 25, es: "Lamentaciones",   en: "Lamentations",   abbr: "Lm",  chapters: 5,  testament: "OT" },
  { num: 26, es: "Ezequiel",        en: "Ezekiel",         abbr: "Ez",  chapters: 48, testament: "OT" },
  { num: 27, es: "Daniel",          en: "Daniel",          abbr: "Dn",  chapters: 12, testament: "OT" },
  { num: 28, es: "Oseas",           en: "Hosea",           abbr: "Os",  chapters: 14, testament: "OT" },
  { num: 29, es: "Joel",            en: "Joel",            abbr: "Jl",  chapters: 3,  testament: "OT" },
  { num: 30, es: "Amós",            en: "Amos",            abbr: "Am",  chapters: 9,  testament: "OT" },
  { num: 31, es: "Abdías",          en: "Obadiah",         abbr: "Abd", chapters: 1,  testament: "OT" },
  { num: 32, es: "Jonás",           en: "Jonah",           abbr: "Jon", chapters: 4,  testament: "OT" },
  { num: 33, es: "Miqueas",         en: "Micah",           abbr: "Mi",  chapters: 7,  testament: "OT" },
  { num: 34, es: "Nahúm",           en: "Nahum",           abbr: "Nah", chapters: 3,  testament: "OT" },
  { num: 35, es: "Habacuc",         en: "Habakkuk",        abbr: "Hab", chapters: 3,  testament: "OT" },
  { num: 36, es: "Sofonías",        en: "Zephaniah",       abbr: "Sof", chapters: 3,  testament: "OT" },
  { num: 37, es: "Hageo",           en: "Haggai",          abbr: "Hag", chapters: 2,  testament: "OT" },
  { num: 38, es: "Zacarías",        en: "Zechariah",       abbr: "Zac", chapters: 14, testament: "OT" },
  { num: 39, es: "Malaquías",       en: "Malachi",         abbr: "Mal", chapters: 4,  testament: "OT" },
  // ── Nuevo Testamento ─────────────────────────────────────────
  { num: 40, es: "Mateo",           en: "Matthew",         abbr: "Mt",  chapters: 28, testament: "NT" },
  { num: 41, es: "Marcos",          en: "Mark",            abbr: "Mr",  chapters: 16, testament: "NT" },
  { num: 42, es: "Lucas",           en: "Luke",            abbr: "Lc",  chapters: 24, testament: "NT" },
  { num: 43, es: "Juan",            en: "John",            abbr: "Jn",  chapters: 21, testament: "NT" },
  { num: 44, es: "Hechos",          en: "Acts",            abbr: "Hch", chapters: 28, testament: "NT" },
  { num: 45, es: "Romanos",         en: "Romans",          abbr: "Ro",  chapters: 16, testament: "NT" },
  { num: 46, es: "1 Corintios",     en: "1 Corinthians",  abbr: "1Co", chapters: 16, testament: "NT" },
  { num: 47, es: "2 Corintios",     en: "2 Corinthians",  abbr: "2Co", chapters: 13, testament: "NT" },
  { num: 48, es: "Gálatas",         en: "Galatians",       abbr: "Gá",  chapters: 6,  testament: "NT" },
  { num: 49, es: "Efesios",         en: "Ephesians",       abbr: "Ef",  chapters: 6,  testament: "NT" },
  { num: 50, es: "Filipenses",      en: "Philippians",    abbr: "Fil", chapters: 4,  testament: "NT" },
  { num: 51, es: "Colosenses",      en: "Colossians",     abbr: "Col", chapters: 4,  testament: "NT" },
  { num: 52, es: "1 Tesalonicenses",en: "1 Thessalonians",abbr: "1Ts", chapters: 5,  testament: "NT" },
  { num: 53, es: "2 Tesalonicenses",en: "2 Thessalonians",abbr: "2Ts", chapters: 3,  testament: "NT" },
  { num: 54, es: "1 Timoteo",       en: "1 Timothy",       abbr: "1Ti", chapters: 6,  testament: "NT" },
  { num: 55, es: "2 Timoteo",       en: "2 Timothy",       abbr: "2Ti", chapters: 4,  testament: "NT" },
  { num: 56, es: "Tito",            en: "Titus",           abbr: "Tit", chapters: 3,  testament: "NT" },
  { num: 57, es: "Filemón",         en: "Philemon",        abbr: "Flm", chapters: 1,  testament: "NT" },
  { num: 58, es: "Hebreos",         en: "Hebrews",         abbr: "Heb", chapters: 13, testament: "NT" },
  { num: 59, es: "Santiago",        en: "James",           abbr: "Stg", chapters: 5,  testament: "NT" },
  { num: 60, es: "1 Pedro",         en: "1 Peter",         abbr: "1P",  chapters: 5,  testament: "NT" },
  { num: 61, es: "2 Pedro",         en: "2 Peter",         abbr: "2P",  chapters: 3,  testament: "NT" },
  { num: 62, es: "1 Juan",          en: "1 John",          abbr: "1Jn", chapters: 5,  testament: "NT" },
  { num: 63, es: "2 Juan",          en: "2 John",          abbr: "2Jn", chapters: 1,  testament: "NT" },
  { num: 64, es: "3 Juan",          en: "3 John",          abbr: "3Jn", chapters: 1,  testament: "NT" },
  { num: 65, es: "Judas",           en: "Jude",            abbr: "Jud", chapters: 1,  testament: "NT" },
  { num: 66, es: "Apocalipsis",     en: "Revelation",      abbr: "Ap",  chapters: 22, testament: "NT" },
];

export interface BibleVersion {
  id: string;
  label: string;
  lang: "es" | "en";
  api: "getbible" | "bibleapi";
  apiKey: string;  // translation key for the chosen API
}

export const BIBLE_VERSIONS: BibleVersion[] = [
  // ── Español (getbible.net — traducciones libres disponibles) ──
  // RVR1960 y NVI son copyright — usamos las versiones libres más cercanas
  { id: "valera",  label: "RV 1909",              lang: "es", api: "getbible", apiKey: "valera"  },
  { id: "sse",     label: "Sagradas Escrituras 1569", lang: "es", api: "getbible", apiKey: "sse" },
  { id: "rv1858",  label: "RV 1858 (NT)",          lang: "es", api: "getbible", apiKey: "rv1858" },
  // ── English (getbible.net) ────────────────────────────────────
  { id: "kjv",     label: "KJV",                   lang: "en", api: "getbible", apiKey: "kjv"         },
  { id: "akjv",    label: "American KJV",           lang: "en", api: "getbible", apiKey: "akjv"        },
  { id: "asv",     label: "ASV (1901)",             lang: "en", api: "getbible", apiKey: "asv"         },
  { id: "web",     label: "WEB",                    lang: "en", api: "getbible", apiKey: "web"         },
  { id: "ylt",     label: "Young's Literal",        lang: "en", api: "getbible", apiKey: "ylt"         },
  { id: "basicenglish", label: "Basic English",     lang: "en", api: "getbible", apiKey: "basicenglish"},
  { id: "douay",   label: "Douay-Rheims",           lang: "en", api: "getbible", apiKey: "douayrheims" },
];

export interface Verse { num: number; text: string; }

// Fetch a chapter from the best available API
// Todas las llamadas pasan por /api/bible (proxy Next.js → evita CORS)
export async function fetchChapter(
  version: BibleVersion,
  bookNum: number,
  chapter: number
): Promise<Verse[]> {
  if (version.api === "getbible") {
    const url = `/api/bible?provider=getbible&translation=${version.apiKey}&book=${bookNum}&chapter=${chapter}`;
    const res = await fetch(url);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error ?? `Error ${res.status}`);
    }
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    // getbible.net v2 returns verses as an array: [{verse, text, ...}]
    const versesArr: { verse: number; text: string }[] = Array.isArray(data.verses)
      ? data.verses
      : Object.values(data.verses ?? {});
    return versesArr
      .sort((a, b) => a.verse - b.verse)
      .map((v) => ({ num: v.verse, text: v.text.trim() }));
  } else {
    const book = BIBLE_BOOKS.find((b) => b.num === bookNum);
    if (!book) throw new Error("Libro no encontrado");
    const ref = `${book.en} ${chapter}`;
    const url = `/api/bible?provider=bibleapi&translation=${version.apiKey}&ref=${encodeURIComponent(ref)}`;
    const res = await fetch(url);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error ?? `Error ${res.status}`);
    }
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    return (data.verses ?? []).map((v: { verse: number; text: string }) => ({
      num: v.verse,
      text: v.text.trim(),
    }));
  }
}
