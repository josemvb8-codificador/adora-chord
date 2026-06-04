import { Section, SongLine, ChordPosition } from "@/types";

// ─── Solfège roots (ordenados de más largo a más corto para evitar match parcial) ───
const SOLFEGE_ROOTS_ORDERED = ["sol", "do", "re", "mi", "fa", "la", "si"];

// Solfège → American
export const SOLFEGE_TO_AMERICAN: Record<string, string> = {
  do: "C", "do#": "C#", dob: "Cb",
  re: "D", "re#": "D#", reb: "Db",
  mi: "E", mib: "Eb",
  fa: "F", "fa#": "F#",
  sol: "G", "sol#": "G#", solb: "Gb",
  la: "A", "la#": "A#", lab: "Ab",
  si: "B", sib: "Bb",
};

function parseSolfegeRoot(word: string): { root: string; suffix: string } | null {
  const lower = word.toLowerCase();
  for (const root of SOLFEGE_ROOTS_ORDERED) {
    if (lower.startsWith(root)) {
      const suffix = word.slice(root.length); // preserve original case for suffix
      return { root, suffix };
    }
  }
  return null;
}

// American notation: G, Am, F#m7, Bb, Cmaj7, D/F#, etc.
const CHORD_AMERICAN = /^[A-G][b#]?(maj|min|m|M|dim|aug|sus|add)?[2-9]?(\/[A-G][b#]?)?$/;
// Solfège suffix pattern (after the root)
const SOLFEGE_SUFFIX = /^[b#]?(maj|min|m|M|dim|aug|sus|add)?[2-9]?(\/[a-zA-Z]+)?$/;

export function isChord(word: string): boolean {
  const w = word.trim();
  if (!w) return false;
  if (CHORD_AMERICAN.test(w)) return true;
  // Solfège check (case-insensitive)
  const parsed = parseSolfegeRoot(w);
  if (!parsed) return false;
  return SOLFEGE_SUFFIX.test(parsed.suffix);
}

export function normalizeSolfege(chord: string): string {
  const w = chord.trim();
  if (CHORD_AMERICAN.test(w)) return w; // already American
  const parsed = parseSolfegeRoot(w);
  if (!parsed) return w;
  const american = SOLFEGE_TO_AMERICAN[parsed.root + parsed.suffix.toLowerCase().replace(/m$/, "")]
    || SOLFEGE_TO_AMERICAN[parsed.root];
  if (!american) return w;
  // Reconstruct: keep suffix modifiers (m, maj7, sus4, etc.)
  const suffix = parsed.suffix;
  return american + suffix;
}

// Lines with author/composer — extract name after the colon
const AUTHOR_PREFIX = /^(autor|author|compositor|arregl[ao]|letra|música|musica)[:\s]+/i;

// Lines to skip entirely (not title, not lyric, not chord)
const SKIP_PREFIXES = /^(tempo|bpm|intro drums|compás|todos|www\.|http|©|copyright|\(c\)|key:|tono:)/i;

export function isMetadataLine(line: string): boolean {
  return SKIP_PREFIXES.test(line.trim());
}

export function extractAuthor(line: string): string | null {
  const t = line.trim();
  const m = t.match(AUTHOR_PREFIX);
  if (!m) return null;
  return t.slice(m[0].length).trim();
}

export function isChordLine(line: string): boolean {
  const trimmed = line.trim();
  if (!trimmed || trimmed.length > 150) return false;
  const tokens = trimmed.split(/\s+/).filter(Boolean);
  if (!tokens.length) return false;
  const chordCount = tokens.filter(isChord).length;
  // A chord line: most tokens are chords, no very long non-chord word
  const hasLongLyricWord = tokens.some((t) => t.length > 9 && !isChord(t));
  return chordCount >= 1 && chordCount / tokens.length >= 0.55 && !hasLongLyricWord;
}

export function isSectionHeader(line: string): boolean {
  const t = line.trim();
  return /^(verso|verse|coro|chorus|puente|bridge|intro|final|outro|solo|pre.?coro|pre.?chorus|interludio|interlude)\s*\d*[:\-.]?\s*$/i.test(t) ||
    /^\[.+\]$/.test(t);
}

export function parseSectionType(line: string): { type: Section["type"]; name: string } {
  const low = line.trim().toLowerCase().replace(/[\[\]:.-]/g, "").trim();
  if (/pre.?coro|pre.?chorus/.test(low)) return { type: "prechorus", name: line.trim() };
  if (/coro|chorus/.test(low))           return { type: "chorus",    name: line.trim() };
  if (/verso|verse/.test(low))           return { type: "verse",     name: line.trim() };
  if (/puente|bridge/.test(low))         return { type: "bridge",    name: line.trim() };
  if (/intro/.test(low))                 return { type: "intro",     name: line.trim() };
  if (/final|outro/.test(low))           return { type: "outro",     name: line.trim() };
  if (/solo/.test(low))                  return { type: "solo",      name: line.trim() };
  if (/interludio|interlude/.test(low))  return { type: "interlude", name: line.trim() };
  return { type: "verse", name: line.trim() };
}

function parseChordsWithPositions(chordLine: string, lyricLine: string): ChordPosition[] {
  const result: ChordPosition[] = [];
  const re = /(\S+)/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(chordLine)) !== null) {
    const token = match[1];
    if (!isChord(token)) continue;
    const col = match.index;
    const pos = lyricLine.length > 0 ? Math.min(col, Math.max(0, lyricLine.length - 1)) : col;
    result.push({ chord: normalizeSolfege(token), pos });
  }
  return result;
}

function uid() { return crypto.randomUUID(); }

function cleanText(text: string): string {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/\f/g, "\n\n")
    .replace(/[ \t]+$/gm, "")
    .replace(/\n{3,}/g, "\n\n");
}

// Lines that look like the ministry/organization name (all caps, no chords, no leading number)
function isOrgHeader(line: string): boolean {
  const t = line.trim();
  if (/^\d/.test(t)) return false; // "006- SONG TITLE" is a title, not an org header
  return t === t.toUpperCase() && t.length > 15 && !isChordLine(t) && /[AEIOU]/i.test(t);
}

export interface ParsedSong {
  title: string;
  artist: string;
  key: string;
  sections: Section[];
  rawText: string;
}

export function parseSongText(rawText: string, filename = ""): ParsedSong {
  const text = cleanText(rawText);
  const lines = text.split("\n");

  // ── Header detection: title, artist, skip org/metadata ──
  let titleLine = "";
  let artistLine = "";
  let startIndex = 0;

  for (let i = 0; i < Math.min(lines.length, 15); i++) {
    const l = lines[i].trim();
    if (!l) continue;

    // Once we hit a chord line or section header, stop header scanning
    if (isChordLine(l) || isSectionHeader(l)) {
      startIndex = i;
      break;
    }

    // Skip tempo/copyright metadata entirely
    if (isMetadataLine(l)) {
      startIndex = i + 1;
      continue;
    }

    // Extract author from "Autor: Vicente Mendoza" style lines
    const author = extractAuthor(l);
    if (author) {
      if (!artistLine) artistLine = author;
      startIndex = i + 1;
      continue;
    }

    // Skip all-caps org/ministry headers (e.g. "MINISTERIO EVANGELÍSTICO...")
    if (isOrgHeader(l)) {
      startIndex = i + 1;
      continue;
    }

    // First real content line = title
    if (!titleLine) {
      titleLine = l;
      startIndex = i + 1;
    }
    // Second non-empty, non-metadata, non-chord line could be an artist
    // but only if it's short and doesn't look like a lyric
    else if (!artistLine && l.length < 60 && !l.includes("¿") && !l.includes("?")) {
      artistLine = l;
      startIndex = i + 1;
    } else {
      // Reached actual song content
      startIndex = i;
      break;
    }
  }

  const sections: Section[] = [];
  let current: Section = { id: uid(), type: "verse", name: "Verso 1", lines: [] };
  let pendingChordLine: string | null = null;

  for (let i = startIndex; i < lines.length; i++) {
    const raw = lines[i];
    const trimmed = raw.trimEnd();

    if (!trimmed.trim()) {
      if (pendingChordLine !== null) {
        current.lines.push({ lyrics: "", chords: parseChordsWithPositions(pendingChordLine, "") });
        pendingChordLine = null;
      }
      continue;
    }

    // Skip metadata lines inside the body
    if (isMetadataLine(trimmed)) continue;

    if (isSectionHeader(trimmed)) {
      if (pendingChordLine !== null) {
        current.lines.push({ lyrics: "", chords: parseChordsWithPositions(pendingChordLine, "") });
        pendingChordLine = null;
      }
      if (current.lines.length) sections.push(current);
      const { type, name } = parseSectionType(trimmed);
      current = { id: uid(), type, name, lines: [] };
      continue;
    }

    if (isChordLine(trimmed)) {
      if (pendingChordLine !== null) {
        current.lines.push({ lyrics: "", chords: parseChordsWithPositions(pendingChordLine, "") });
      }
      pendingChordLine = trimmed;
      continue;
    }

    // Lyric line
    const chords = pendingChordLine !== null
      ? parseChordsWithPositions(pendingChordLine, trimmed.trim())
      : [];
    pendingChordLine = null;
    current.lines.push({ lyrics: trimmed.trim(), chords });
  }

  if (pendingChordLine !== null) {
    current.lines.push({ lyrics: "", chords: parseChordsWithPositions(pendingChordLine, "") });
  }
  if (current.lines.length) sections.push(current);

  if (!sections.length) {
    sections.push({ id: uid(), type: "verse", name: "Verso 1", lines: [{ lyrics: rawText.trim(), chords: [] }] });
  }

  const allChords = sections.flatMap((s) => s.lines.flatMap((l) => l.chords.map((c) => c.chord)));
  const key = guessKey(allChords);

  // Clean song title: remove leading number codes like "006- "
  const rawTitle = titleLine || filename.replace(/\.(pdf|docx?|txt)$/i, "").replace(/[-_]/g, " ").trim();
  const cleanTitle = rawTitle.replace(/^\d+[-.\s]+/, "").replace(/\([^)]+\)\s*$/, "").trim();

  return { title: cleanTitle || rawTitle, artist: artistLine, key, sections, rawText };
}

function guessKey(chords: string[]): string {
  if (!chords.length) return "G";
  const roots: Record<string, number> = {};
  for (const chord of chords) {
    const m = chord.match(/^([A-G][b#]?)/);
    if (m) roots[m[1]] = (roots[m[1]] || 0) + 1;
  }
  return Object.entries(roots).sort((a, b) => b[1] - a[1])[0]?.[0] || "G";
}
