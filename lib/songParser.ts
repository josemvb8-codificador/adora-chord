import { Section, SongLine } from "@/types";

// Chord detection — matches: G, Am, F#m7, Bb, Cmaj7, D/F#, sus4, add9, dim, aug, etc.
const CHORD_RE = /^[A-G][b#]?(maj|min|m|M|dim|aug|sus|add)?[0-9]?(\/[A-G][b#]?)?[0-9]?$/;

export function isChord(word: string): boolean {
  return CHORD_RE.test(word.trim());
}

export function isChordLine(line: string): boolean {
  const trimmed = line.trim();
  if (!trimmed) return false;
  // Chord lines have isolated chord tokens separated by spaces
  const tokens = trimmed.split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return false;
  const chordCount = tokens.filter(isChord).length;
  // >50% of tokens are chords AND line has multiple spaces (chords spread out)
  return chordCount >= 1 && chordCount / tokens.length >= 0.5 && tokens.length <= 8;
}

export function isSectionHeader(line: string): boolean {
  const low = line.trim().toLowerCase();
  return (
    /^(verso|verse|coro|chorus|puente|bridge|intro|final|outro|solo|pre.?coro|pre.?chorus|interludio|interlude)\s*\d*[:\-]?\s*$/i.test(low) ||
    /^\[.+\]$/.test(low.trim())
  );
}

export function parseSectionType(line: string) {
  const low = line.trim().toLowerCase().replace(/[\[\]:]/g, "");
  if (/verso|verse/.test(low)) return { type: "verse" as const, name: line.trim() };
  if (/pre.?coro|pre.?chorus/.test(low)) return { type: "prechorus" as const, name: line.trim() };
  if (/coro|chorus/.test(low)) return { type: "chorus" as const, name: line.trim() };
  if (/puente|bridge/.test(low)) return { type: "bridge" as const, name: line.trim() };
  if (/intro/.test(low)) return { type: "intro" as const, name: line.trim() };
  if (/final|outro/.test(low)) return { type: "outro" as const, name: line.trim() };
  if (/solo/.test(low)) return { type: "solo" as const, name: line.trim() };
  if (/interludio|interlude/.test(low)) return { type: "interlude" as const, name: line.trim() };
  return { type: "verse" as const, name: line.trim() };
}

function uid() { return Math.random().toString(36).slice(2); }

export interface ParsedSong {
  title: string;
  artist: string;
  key: string;
  sections: Section[];
  rawText: string;
}

export function parseSongText(text: string, filename = ""): ParsedSong {
  const lines = text.split("\n").map((l) => l.trimEnd());

  // Try to extract title/artist from first lines
  let titleLine = "";
  let artistLine = "";
  let startIndex = 0;

  // Look for title in first 5 non-empty lines
  const firstNonEmpty = lines.filter(Boolean).slice(0, 5);
  if (firstNonEmpty.length > 0 && !isSectionHeader(firstNonEmpty[0]) && !isChordLine(firstNonEmpty[0])) {
    titleLine = firstNonEmpty[0];
    if (firstNonEmpty.length > 1 && !isSectionHeader(firstNonEmpty[1]) && !isChordLine(firstNonEmpty[1])) {
      artistLine = firstNonEmpty[1];
    }
  }
  // Skip past the title/artist lines
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim() === titleLine || lines[i].trim() === artistLine) {
      startIndex = Math.max(startIndex, i + 1);
    }
  }

  const sections: Section[] = [];
  let currentSection: Section = { id: uid(), type: "verse", name: "Verso 1", lines: [] };
  let pendingChordLine: string | null = null;
  let sectionCount = 0;

  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      pendingChordLine = null;
      continue;
    }

    if (isSectionHeader(trimmed)) {
      if (currentSection.lines.length > 0) {
        sections.push(currentSection);
      }
      const { type, name } = parseSectionType(trimmed);
      currentSection = { id: uid(), type, name, lines: [] };
      sectionCount++;
      pendingChordLine = null;
      continue;
    }

    if (isChordLine(trimmed)) {
      pendingChordLine = trimmed;
      continue;
    }

    // It's a lyrics line
    const songLine: SongLine = { lyrics: trimmed, chords: [] };

    if (pendingChordLine) {
      // Parse chord positions relative to the lyrics line
      songLine.chords = parseChordsWithPositions(pendingChordLine, trimmed);
      pendingChordLine = null;
    }

    currentSection.lines.push(songLine);
  }

  if (currentSection.lines.length > 0) {
    sections.push(currentSection);
  }

  // If no sections found, create one default section with all lines
  if (sections.length === 0 && currentSection.lines.length === 0) {
    sections.push({ id: uid(), type: "verse", name: "Verso 1", lines: [] });
  }

  // Detect key from chords
  const allChords = sections.flatMap((s) => s.lines.flatMap((l) => l.chords.map((c) => c.chord)));
  const key = guessKey(allChords);

  const title = titleLine || filename.replace(/\.(pdf|docx?)$/i, "").replace(/[-_]/g, " ");

  return { title, artist: artistLine, key, sections, rawText: text };
}

function parseChordsWithPositions(chordLine: string, lyricLine: string): { chord: string; beat?: number }[] {
  const result: { chord: string; beat?: number }[] = [];
  const re = /(\S+)/g;
  let match;
  while ((match = re.exec(chordLine)) !== null) {
    const token = match[1];
    if (isChord(token)) {
      result.push({ chord: token });
    }
  }
  return result;
}

// Very rough key detection: most common root note
function guessKey(chords: string[]): string {
  if (!chords.length) return "G";
  const roots: Record<string, number> = {};
  for (const chord of chords) {
    const m = chord.match(/^([A-G][b#]?)/);
    if (m) roots[m[1]] = (roots[m[1]] || 0) + 1;
  }
  const sorted = Object.entries(roots).sort((a, b) => b[1] - a[1]);
  return sorted[0]?.[0] || "G";
}
