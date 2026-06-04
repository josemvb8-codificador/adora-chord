import { Section, SongLine, ChordPosition } from "@/types";

// Chord token regex: G, Am, F#m7, Bb/D, Dsus4, Cadd9, etc.
const CHORD_TOKEN = /^[A-G][b#]?(maj|min|m|M|dim|aug|sus|add)?[2-9]?(\/[A-G][b#]?)?$/;

export function isChord(word: string): boolean {
  return CHORD_TOKEN.test(word.trim());
}

export function isChordLine(line: string): boolean {
  const trimmed = line.trim();
  if (!trimmed || trimmed.length > 120) return false;
  const tokens = trimmed.split(/\s+/).filter(Boolean);
  if (!tokens.length) return false;
  const chordCount = tokens.filter(isChord).length;
  const hasLongNonChordWord = tokens.some((t) => t.length > 7 && !isChord(t));
  return chordCount >= 1 && chordCount / tokens.length >= 0.6 && !hasLongNonChordWord;
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
 * Given a raw chord line (e.g. "G        Am    F     C")
 * and the lyric line below it, compute the character position
 * of each chord relative to the lyric string.
 */
function parseChordsWithPositions(chordLine: string, lyricLine: string): ChordPosition[] {
  const result: ChordPosition[] = [];
  const re = /(\S+)/g;
  let match: RegExpExecArray | null;

  while ((match = re.exec(chordLine)) !== null) {
    const token = match[1];
    if (!isChord(token)) continue;
    // Column position in the chord line
    const col = match.index;
    // Map column to a character position in the lyric (clamp to lyric length)
    const pos = lyricLine.length > 0 ? Math.min(col, lyricLine.length) : col;
    result.push({ chord: token, pos });
  }
  return result;
}

function uid() { return crypto.randomUUID(); }

// Clean PDF artifacts: remove // separators, form feeds, etc.
function cleanText(text: string): string {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/\f/g, "\n\n")
    .replace(/\/\//g, "")          // // artifacts from some PDF exporters
    .replace(/[ \t]+$/gm, "")      // trailing spaces per line
    .replace(/\n{3,}/g, "\n\n");   // collapse 3+ blank lines to 2
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

  // ── Detect title / artist ──
  let titleLine = "";
  let artistLine = "";
  let startIndex = 0;

  const nonEmpty = lines.map((l, i) => ({ l, i })).filter(({ l }) => l.trim());
  for (let n = 0; n < Math.min(4, nonEmpty.length); n++) {
    const { l, i } = nonEmpty[n];
    if (!isSectionHeader(l) && !isChordLine(l)) {
      if (!titleLine) { titleLine = l.trim(); startIndex = i + 1; }
      else if (!artistLine) { artistLine = l.trim(); startIndex = i + 1; }
      else break;
    } else break;
  }

  const sections: Section[] = [];
  let current: Section = { id: uid(), type: "verse", name: "Verso 1", lines: [] };
  let pendingChordLine: string | null = null;

  for (let i = startIndex; i < lines.length; i++) {
    const raw = lines[i];
    const trimmed = raw.trimEnd();

    // Blank line: flush pending chords as standalone line
    if (!trimmed.trim()) {
      if (pendingChordLine !== null) {
        const chords = parseChordsWithPositions(pendingChordLine, "");
        current.lines.push({ lyrics: "", chords });
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
      // Flush previous chord line that had no lyric
      if (pendingChordLine !== null) {
        current.lines.push({ lyrics: "", chords: parseChordsWithPositions(pendingChordLine, "") });
      }
      pendingChordLine = trimmed;
      continue;
    }

    // Lyric line — pair with pending chords if any
    const lyric = trimmed.trim();
    const chords = pendingChordLine !== null
      ? parseChordsWithPositions(pendingChordLine, lyric)
      : [];
    pendingChordLine = null;
    current.lines.push({ lyrics: lyric, chords });
  }

  // Flush leftovers
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
