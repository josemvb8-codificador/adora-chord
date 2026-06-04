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

// Lines to skip — ministry headers, metadata, etc.
const SKIP_PREFIXES = /^(autor|author|compositor|arreglos?|tempo|intro drums|todos|www\.|http|©|copyright|\d{3,}-)/i;

export function isMetadataLine(line: string): boolean {
  const t = line.trim();
  return SKIP_PREFIXES.test(t);
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

// Lines that look like the ministry/organization name (all caps, no chords)
function isOrgHeader(line: string): boolean {
  const t = line.trim();
  return t === t.toUpperCase() && t.length > 10 && !isChordLine(t) && /[AEIOU]{1}/i.test(t);
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

  // ── Smart title/artist detection ──
  // Skip: all-caps org headers, metadata lines, blank lines
  let titleLine = "";
  let artistLine = "";
  let startIndex = 0;

  const candidates = lines
    .map((l, i) => ({ l: l.trim(), i }))
    .filter(({ l }) => l && !isChordLine(l) && !isSectionHeader(l) && !isMetadataLine(l));

  for (const { l, i } of candidates.slice(0, 8)) {
    if (isOrgHeader(l)) { startIndex = Math.max(startIndex, i + 1); continue; }
    if (!titleLine) { titleLine = l; startIndex = i + 1; }
    else if (!artistLine && !isChordLine(l)) { artistLine = l; startIndex = i + 1; break; }
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
