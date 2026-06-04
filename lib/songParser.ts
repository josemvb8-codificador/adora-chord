import { Section, SongLine } from "@/types";

// Chord token: G, Am, F#m7, Bb, Cmaj7, D/F#, Dsus4, Cadd9, etc.
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
  // A chord line: majority are chord tokens AND no long words (lyrics tend to be longer)
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

function uid() { return Math.random().toString(36).slice(2); }

export interface ParsedSong {
  title: string;
  artist: string;
  key: string;
  sections: Section[];
  rawText: string;
}

export function parseSongText(rawText: string, filename = ""): ParsedSong {
  // Normalize line endings and remove page-break artifacts
  const text = rawText
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/\f/g, "\n\n") // form feed → blank line
    .replace(/[ \t]+$/gm, ""); // trailing spaces

  const lines = text.split("\n");

  // ── Detect title / artist from first non-empty, non-chord, non-section lines ──
  let titleLine = "";
  let artistLine = "";
  let startIndex = 0;

  const contentLines = lines.map((l, i) => ({ l, i })).filter(({ l }) => l.trim());
  for (let n = 0; n < Math.min(5, contentLines.length); n++) {
    const { l, i } = contentLines[n];
    if (!isSectionHeader(l) && !isChordLine(l)) {
      if (!titleLine) { titleLine = l.trim(); startIndex = i + 1; }
      else if (!artistLine && n === 1) { artistLine = l.trim(); startIndex = i + 1; }
      else break;
    } else break;
  }

  const sections: Section[] = [];
  let current: Section = { id: uid(), type: "verse", name: "Verso 1", lines: [] };
  let pendingChords: { chord: string }[] = [];
  let sectionCount = 0;

  for (let i = startIndex; i < lines.length; i++) {
    const raw = lines[i];
    const trimmed = raw.trimEnd();

    // Blank line: flush pending chords as empty lyric line if any
    if (!trimmed.trim()) {
      if (pendingChords.length) {
        current.lines.push({ lyrics: "", chords: pendingChords });
        pendingChords = [];
      }
      continue;
    }

    if (isSectionHeader(trimmed)) {
      if (pendingChords.length) {
        current.lines.push({ lyrics: "", chords: pendingChords });
        pendingChords = [];
      }
      if (current.lines.length) sections.push(current);
      const { type, name } = parseSectionType(trimmed);
      sectionCount++;
      const label = name || `Sección ${sectionCount}`;
      current = { id: uid(), type, name: label, lines: [] };
      continue;
    }

    if (isChordLine(trimmed)) {
      // Flush any previous pending chord line that had no lyric follow-up
      if (pendingChords.length) {
        current.lines.push({ lyrics: "", chords: pendingChords });
      }
      pendingChords = trimmed.split(/\s+/).filter(isChord).map((c) => ({ chord: c }));
      continue;
    }

    // Lyrics line
    const lyricLine: SongLine = {
      lyrics: trimmed.trim(),
      chords: pendingChords,
    };
    pendingChords = [];
    current.lines.push(lyricLine);
  }

  // Flush leftovers
  if (pendingChords.length) current.lines.push({ lyrics: "", chords: pendingChords });
  if (current.lines.length) sections.push(current);

  // If nothing was parsed into sections, put everything as a single verse
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
