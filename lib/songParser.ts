import { Section, SongLine, ChordPosition } from "@/types";

// ─── Chord detection ────────────────────────────────────────────────────────

// American notation: G, Am, F#m7, Bb/D, Dsus4, Cadd9, G7, Cmaj7, etc.
const CHORD_AMERICAN = /^[A-G][b#]?(maj|min|m|M|dim|aug|sus|add)?[2-9]?(\/[A-G][b#]?)?$/;

// Solfège notation (Spanish/Latin American): Do, Re, Mi, Fa, Sol, La, Si
// + variations: Dom, Rem, Solm, Lam, etc. + modifiers
const SOLFEGE_ROOTS = "(?:Do|Re|Mi|Fa|Sol|La|Si)";
const CHORD_SOLFEGE = new RegExp(
  `^${SOLFEGE_ROOTS}[b#]?(maj|min|m|M|dim|aug|sus|add)?[2-9]?(\\/${SOLFEGE_ROOTS}[b#]?)?$`,
  "i"
);

export function isChord(word: string): boolean {
  const w = word.trim();
  return CHORD_AMERICAN.test(w) || CHORD_SOLFEGE.test(w);
}

// Solfège → American mapping for display/transposition
export const SOLFEGE_TO_AMERICAN: Record<string, string> = {
  do: "C", "do#": "C#", dob: "Cb",
  re: "D", "re#": "D#", reb: "Db",
  mi: "E", mib: "Eb",
  fa: "F", "fa#": "F#",
  sol: "G", "sol#": "G#", solb: "Gb",
  la: "A", "la#": "A#", lab: "Ab",
  si: "B", sib: "Bb",
};

export function normalizeSolfege(chord: string): string {
  // Convert solfège chord to American notation if needed
  const lower = chord.toLowerCase();
  for (const [sol, amer] of Object.entries(SOLFEGE_TO_AMERICAN)) {
    if (lower.startsWith(sol)) {
      const suffix = chord.slice(sol.length);
      return amer + suffix;
    }
  }
  return chord;
}

export function isChordLine(line: string): boolean {
  const trimmed = line.trim();
  if (!trimmed || trimmed.length > 150) return false;
  const tokens = trimmed.split(/\s+/).filter(Boolean);
  if (!tokens.length) return false;
  const chordCount = tokens.filter(isChord).length;
  // Reject if there's a long non-chord word (likely a lyric line)
  const hasLongWord = tokens.some((t) => t.length > 8 && !isChord(t));
  return chordCount >= 1 && chordCount / tokens.length >= 0.55 && !hasLongWord;
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

/**
 * Parse chord tokens from a chord line, preserving their column positions
 * so they can be displayed above the correct syllable in the lyric line.
 */
function parseChordsWithPositions(chordLine: string, lyricLine: string): ChordPosition[] {
  const result: ChordPosition[] = [];
  const re = /(\S+)/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(chordLine)) !== null) {
    const token = match[1];
    if (!isChord(token)) continue;
    const col = match.index;
    const pos = lyricLine.length > 0 ? Math.min(col, Math.max(0, lyricLine.length - 1)) : col;
    // Normalize solfège to American for storage
    result.push({ chord: normalizeSolfege(token), pos });
  }
  return result;
}

function uid() { return crypto.randomUUID(); }

function cleanText(text: string): string {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/\f/g, "\n\n")      // form feed → blank line
    .replace(/[ \t]+$/gm, "")    // trailing spaces
    .replace(/\n{3,}/g, "\n\n"); // max 2 consecutive blank lines
  // Note: we keep // in text since it can be a lyric repeat marker
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

  // ── Title / artist detection ──
  let titleLine = "";
  let artistLine = "";
  let startIndex = 0;

  const nonEmpty = lines.map((l, i) => ({ l, i })).filter(({ l }) => l.trim());
  for (let n = 0; n < Math.min(4, nonEmpty.length); n++) {
    const { l, i } = nonEmpty[n];
    if (!isSectionHeader(l) && !isChordLine(l)) {
      if (!titleLine) { titleLine = l.trim(); startIndex = i + 1; }
      else if (!artistLine && n <= 2) { artistLine = l.trim(); startIndex = i + 1; }
      else break;
    } else break;
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
  const title = titleLine || filename.replace(/\.(pdf|docx?|txt)$/i, "").replace(/[-_]/g, " ").trim();

  return { title, artist: artistLine, key, sections, rawText };
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
