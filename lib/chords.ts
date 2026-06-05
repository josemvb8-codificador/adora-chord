import { Chord, Note, Interval } from "tonal";

export const CHROMATIC_AMERICAN = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
export const CHROMATIC_FLAT =     ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];

export const SOLFEGE_MAP: Record<string, string> = {
  C: "Do", "C#": "Do#", Db: "Reb", D: "Re", "D#": "Re#", Eb: "Mib",
  E: "Mi", F: "Fa", "F#": "Fa#", Gb: "Solb", G: "Sol", "G#": "Sol#",
  Ab: "Lab", A: "La", "A#": "La#", Bb: "Sib", B: "Si",
};

// Keys that prefer flats
const FLAT_KEYS = new Set(["F", "Bb", "Eb", "Ab", "Db", "Gb", "Dm", "Gm", "Cm", "Fm", "Bbm", "Ebm"]);

export function transposeChord(chord: string, semitones: number): string {
  if (!chord || chord === "%") return chord;
  if (semitones === 0) return chord;
  const parsed = Chord.get(chord);
  if (!parsed.tonic) return chord;
  const newTonic = Note.transpose(parsed.tonic, Interval.fromSemitones(semitones));
  const simplified = Note.simplify(newTonic) || newTonic;
  const suffix = chord.slice(parsed.tonic.length);

  // Up → sharps (#);  Down → flats (b)
  const goingUp = semitones > 0;
  let tonic = simplified;
  if (goingUp && tonic.includes("b")) {
    tonic = Note.enharmonic(tonic) || tonic; // Db→C#, Eb→D#, Gb→F#, Ab→G#, Bb→A#
  } else if (!goingUp && tonic.includes("#")) {
    tonic = Note.enharmonic(tonic) || tonic; // C#→Db, D#→Eb, F#→Gb, G#→Ab, A#→Bb
  }

  return tonic + suffix;
}

export function chordToNotation(chord: string, notation: "american" | "solfege"): string {
  if (notation === "american") return chord;
  const parsed = Chord.get(chord);
  if (!parsed.tonic) return chord;
  const solfegeRoot = SOLFEGE_MAP[parsed.tonic] || parsed.tonic;
  const suffix = chord.slice(parsed.tonic.length);
  return solfegeRoot + suffix;
}

export function getChordNotes(chord: string): string[] {
  const parsed = Chord.get(chord);
  return parsed.notes || [];
}

// Piano keyboard positions (C4 octave)
export const PIANO_KEYS: { note: string; isBlack: boolean; index: number }[] = [
  { note: "C",  isBlack: false, index: 0 },
  { note: "C#", isBlack: true,  index: 1 },
  { note: "D",  isBlack: false, index: 2 },
  { note: "D#", isBlack: true,  index: 3 },
  { note: "E",  isBlack: false, index: 4 },
  { note: "F",  isBlack: false, index: 5 },
  { note: "F#", isBlack: true,  index: 6 },
  { note: "G",  isBlack: false, index: 7 },
  { note: "G#", isBlack: true,  index: 8 },
  { note: "A",  isBlack: false, index: 9 },
  { note: "A#", isBlack: true,  index: 10 },
  { note: "B",  isBlack: false, index: 11 },
];

// Guitar chord fingerings for common chords
// [string1(low E), string2(A), string3(D), string4(G), string5(B), string6(high E)]
// -1 = muted, 0 = open
type Fingering = { frets: number[]; fingers?: number[]; barre?: number; barreString?: number };

const GUITAR_CHORDS: Record<string, Fingering> = {
  // ── MAJOR ────────────────────────────────────────────────────────────────
  "C":   { frets: [-1, 3, 2, 0, 1, 0] },
  "D":   { frets: [-1, -1, 0, 2, 3, 2] },
  "E":   { frets: [0, 2, 2, 1, 0, 0] },
  "G":   { frets: [3, 2, 0, 0, 0, 3] },
  "A":   { frets: [-1, 0, 2, 2, 2, 0] },
  "F":   { frets: [1, 3, 3, 2, 1, 1], barre: 1, barreString: 6 },
  "B":   { frets: [-1, 2, 4, 4, 4, 2], barre: 2, barreString: 5 },
  "F#":  { frets: [2, 4, 4, 3, 2, 2], barre: 2, barreString: 6 },
  "Gb":  { frets: [2, 4, 4, 3, 2, 2], barre: 2, barreString: 6 },
  "G#":  { frets: [4, 6, 6, 5, 4, 4], barre: 4, barreString: 6 },
  "Ab":  { frets: [4, 6, 6, 5, 4, 4], barre: 4, barreString: 6 },
  "C#":  { frets: [-1, 4, 6, 6, 6, 4], barre: 4, barreString: 5 },
  "Db":  { frets: [-1, 4, 6, 6, 6, 4], barre: 4, barreString: 5 },
  "A#":  { frets: [-1, 1, 3, 3, 3, 1], barre: 1, barreString: 5 },
  "Bb":  { frets: [-1, 1, 3, 3, 3, 1], barre: 1, barreString: 5 },
  "D#":  { frets: [-1, 6, 8, 8, 8, 6], barre: 6, barreString: 5 },
  "Eb":  { frets: [-1, 6, 8, 8, 8, 6], barre: 6, barreString: 5 },
  // ── MINOR ────────────────────────────────────────────────────────────────
  "Am":  { frets: [-1, 0, 2, 2, 1, 0] },
  "Em":  { frets: [0, 2, 2, 0, 0, 0] },
  "Dm":  { frets: [-1, -1, 0, 2, 3, 1] },
  "Bm":  { frets: [-1, 2, 4, 4, 3, 2], barre: 2, barreString: 5 },
  "Fm":  { frets: [1, 3, 3, 1, 1, 1], barre: 1, barreString: 6 },
  "Cm":  { frets: [-1, 3, 5, 5, 4, 3], barre: 3, barreString: 5 },
  "Gm":  { frets: [3, 5, 5, 3, 3, 3], barre: 3, barreString: 6 },
  "F#m": { frets: [2, 4, 4, 2, 2, 2], barre: 2, barreString: 6 },
  "Gbm": { frets: [2, 4, 4, 2, 2, 2], barre: 2, barreString: 6 },
  "C#m": { frets: [-1, 4, 6, 6, 5, 4], barre: 4, barreString: 5 },
  "Dbm": { frets: [-1, 4, 6, 6, 5, 4], barre: 4, barreString: 5 },
  "G#m": { frets: [4, 6, 6, 4, 4, 4], barre: 4, barreString: 6 },
  "Abm": { frets: [4, 6, 6, 4, 4, 4], barre: 4, barreString: 6 },
  "A#m": { frets: [-1, 1, 3, 3, 2, 1], barre: 1, barreString: 5 },
  "Bbm": { frets: [-1, 1, 3, 3, 2, 1], barre: 1, barreString: 5 },
  "D#m": { frets: [-1, 6, 8, 8, 7, 6], barre: 6, barreString: 5 },
  "Ebm": { frets: [-1, 6, 8, 8, 7, 6], barre: 6, barreString: 5 },
  // ── DOMINANT 7th ─────────────────────────────────────────────────────────
  "G7":  { frets: [3, 2, 0, 0, 0, 1] },
  "D7":  { frets: [-1, -1, 0, 2, 1, 2] },
  "E7":  { frets: [0, 2, 0, 1, 0, 0] },
  "A7":  { frets: [-1, 0, 2, 0, 2, 0] },
  "C7":  { frets: [-1, 3, 2, 3, 1, 0] },
  "B7":  { frets: [-1, 2, 1, 2, 0, 2] },
  "F7":  { frets: [1, 3, 1, 2, 1, 1], barre: 1, barreString: 6 },
  "F#7": { frets: [2, 4, 2, 3, 2, 2], barre: 2, barreString: 6 },
  "Gb7": { frets: [2, 4, 2, 3, 2, 2], barre: 2, barreString: 6 },
  "G#7": { frets: [4, 6, 4, 5, 4, 4], barre: 4, barreString: 6 },
  "Ab7": { frets: [4, 6, 4, 5, 4, 4], barre: 4, barreString: 6 },
  "C#7": { frets: [-1, 4, 6, 4, 6, 4], barre: 4, barreString: 5 },
  "Db7": { frets: [-1, 4, 6, 4, 6, 4], barre: 4, barreString: 5 },
  // ── MINOR 7th ────────────────────────────────────────────────────────────
  "Am7": { frets: [-1, 0, 2, 0, 1, 0] },
  "Dm7": { frets: [-1, -1, 0, 2, 1, 1] },
  "Em7": { frets: [0, 2, 2, 0, 3, 0] },
  "Bm7": { frets: [-1, 2, 4, 2, 3, 2], barre: 2, barreString: 5 },
  "Fm7": { frets: [1, 3, 1, 1, 1, 1], barre: 1, barreString: 6 },
  "Cm7": { frets: [-1, 3, 5, 3, 4, 3], barre: 3, barreString: 5 },
  "Gm7": { frets: [3, 5, 3, 3, 3, 3], barre: 3, barreString: 6 },
  "F#m7":{ frets: [2, 4, 2, 2, 2, 2], barre: 2, barreString: 6 },
  "Gbm7":{ frets: [2, 4, 2, 2, 2, 2], barre: 2, barreString: 6 },
  "C#m7":{ frets: [-1, 4, 6, 4, 5, 4], barre: 4, barreString: 5 },
  "Dbm7":{ frets: [-1, 4, 6, 4, 5, 4], barre: 4, barreString: 5 },
  "G#m7":{ frets: [4, 6, 4, 4, 4, 4], barre: 4, barreString: 6 },
  "Abm7":{ frets: [4, 6, 4, 4, 4, 4], barre: 4, barreString: 6 },
  // ── MAJOR 7th ────────────────────────────────────────────────────────────
  "Cmaj7":  { frets: [-1, 3, 2, 0, 0, 0] },
  "Fmaj7":  { frets: [-1, -1, 3, 2, 1, 0] },
  "Gmaj7":  { frets: [3, 2, 0, 0, 0, 2] },
  "Amaj7":  { frets: [-1, 0, 2, 1, 2, 0] },
  "Dmaj7":  { frets: [-1, -1, 0, 2, 2, 2] },
  "Emaj7":  { frets: [0, 2, 1, 1, 0, 0] },
  "Bmaj7":  { frets: [-1, 2, 4, 3, 4, 2], barre: 2, barreString: 5 },
  "F#maj7": { frets: [2, 4, 3, 3, 2, 2], barre: 2, barreString: 6 },
  "Gbmaj7": { frets: [2, 4, 3, 3, 2, 2], barre: 2, barreString: 6 },
  "C#maj7": { frets: [-1, 4, 6, 5, 6, 4], barre: 4, barreString: 5 },
  "Abmaj7": { frets: [4, 6, 5, 5, 4, 4], barre: 4, barreString: 6 },
  // ── SUS 2 & SUS 4 ────────────────────────────────────────────────────────
  "Csus2":  { frets: [-1, 3, 0, 0, 1, 3] },
  "Csus4":  { frets: [-1, 3, 3, 0, 1, 1] },
  "Dsus2":  { frets: [-1, -1, 0, 2, 3, 0] },
  "Dsus4":  { frets: [-1, -1, 0, 2, 3, 3] },
  "Esus4":  { frets: [0, 2, 2, 2, 0, 0] },
  "Asus2":  { frets: [-1, 0, 2, 2, 0, 0] },
  "Asus4":  { frets: [-1, 0, 2, 2, 3, 0] },
  "Gsus4":  { frets: [3, 3, 0, 0, 1, 3] },
  "Bsus4":  { frets: [-1, 2, 4, 4, 5, 2], barre: 2, barreString: 5 },
  "Fsus2":  { frets: [1, 3, 3, 0, 1, 1], barre: 1, barreString: 6 },
  "F#sus2": { frets: [2, 4, 4, 1, 2, 2], barre: 2, barreString: 6 },
  "F#sus4": { frets: [2, 4, 4, 4, 2, 2], barre: 2, barreString: 6 },
  // ── ADD 9 ─────────────────────────────────────────────────────────────────
  "Cadd9":  { frets: [-1, 3, 2, 0, 3, 0] },
  "Gadd9":  { frets: [3, 2, 0, 2, 0, 3] },
  "Dadd9":  { frets: [-1, -1, 0, 2, 3, 0] },
  "Eadd9":  { frets: [0, 2, 2, 1, 0, 2] },
  "Aadd9":  { frets: [-1, 0, 2, 4, 2, 0] },
  "Fadd9":  { frets: [1, 3, 3, 2, 1, 3], barre: 1, barreString: 6 },
  "Badd9":  { frets: [-1, 2, 4, 3, 5, 2], barre: 2, barreString: 5 },
  "F#add9": { frets: [2, 4, 4, 3, 2, 4], barre: 2, barreString: 6 },
  // ── 9th CHORDS ────────────────────────────────────────────────────────────
  "Cmaj9":  { frets: [-1, 3, 2, 0, 3, 0] },     // same as Cadd9 — common voicing
  "Gmaj9":  { frets: [3, 2, 0, 2, 0, 2] },
  "Amaj9":  { frets: [-1, 0, 2, 1, 0, 0] },
  "Dmaj9":  { frets: [-1, -1, 0, 2, 2, 0] },
  "Am9":    { frets: [-1, 0, 2, 0, 1, 0] },      // Am7 no 5th + 9th feel
  "Em9":    { frets: [0, 2, 0, 0, 0, 0] },
  "Dm9":    { frets: [-1, -1, 0, 2, 1, 0] },
  "Bm9":    { frets: [-1, 2, 0, 2, 0, 2] },
  "F#m9":   { frets: [2, 4, 2, 2, 0, 0], barre: 2, barreString: 4 },
  "C9":     { frets: [-1, 3, 2, 3, 3, 3] },
  "G9":     { frets: [3, 2, 0, 2, 0, 1] },
  "D9":     { frets: [-1, -1, 0, 2, 1, 0] },
  "A9":     { frets: [-1, 0, 2, 0, 2, 2] },
  "E9":     { frets: [0, 2, 0, 1, 3, 0] },
  // ── DIMINISHED ────────────────────────────────────────────────────────────
  "Cdim":   { frets: [-1, 3, 4, 5, 4, -1] },
  "Ddim":   { frets: [-1, -1, 0, 1, 0, 1] },
  "Edim":   { frets: [0, 1, 2, 3, 2, -1] },
  "Fdim":   { frets: [1, 2, 3, 4, 3, -1] },
  "Gdim":   { frets: [3, 4, 5, 6, 5, -1] },
  "Adim":   { frets: [-1, 0, 1, 2, 1, -1] },
  "Bdim":   { frets: [-1, 2, 3, 4, 3, -1] },
  "F#dim":  { frets: [2, 3, 4, 5, 4, -1] },
  "Cdim7":  { frets: [-1, 3, 4, 2, 4, 2] },
  "Ddim7":  { frets: [-1, -1, 0, 1, 0, 1] },
  "Edim7":  { frets: [0, 1, 2, 0, 2, 0] },
  "Adim7":  { frets: [-1, 0, 1, 2, 1, 2] },
  "Bdim7":  { frets: [-1, 2, 3, 1, 3, 1] },
  "F#dim7": { frets: [2, 3, 1, 3, 1, 2] },
  // ── AUGMENTED ─────────────────────────────────────────────────────────────
  "Caug":  { frets: [-1, 3, 2, 1, 1, 0] },
  "Daug":  { frets: [-1, -1, 0, 3, 3, 2] },
  "Eaug":  { frets: [0, 3, 2, 1, 1, 0] },
  "Faug":  { frets: [1, 0, 3, 2, 2, 1] },
  "Gaug":  { frets: [3, 2, 1, 0, 0, 3] },
  "Aaug":  { frets: [-1, 0, 3, 2, 2, 1] },
  "Baug":  { frets: [-1, 2, 1, 0, 0, 3] },
  // ── HALF-DIMINISHED (m7b5) ────────────────────────────────────────────────
  "Bm7b5": { frets: [-1, 2, 3, 2, 3, -1] },
  "Em7b5": { frets: [0, 1, 2, 0, 3, 0] },
  "Am7b5": { frets: [-1, 0, 1, 2, 1, -1] },
  "Dm7b5": { frets: [-1, -1, 0, 1, 0, 1] },
  "F#m7b5":{ frets: [2, 3, 2, 2, -1, -1] },
};

// ── Chord complexity score (1 = simplest, 5 = most complex) ──────────────
export function getChordComplexity(chord: string): number {
  const fingering = GUITAR_CHORDS[chord];

  // Base score by chord type suffix
  const suffixScore: [string, number][] = [
    ["dim7",  5], ["m7b5", 5],
    ["maj9",  5], ["maj11",5], ["maj13",5],
    ["m9",    5], ["m11",  5], ["m13",  5],
    ["9",     5], ["11",   5], ["13",   5],
    ["dim",   4], ["aug",  4],
    ["maj7",  4], ["add9", 4],
    ["m7",    3], ["7",    3],
    ["sus2",  3], ["sus4", 3],
    ["m",     2],
    ["",      1],
  ];

  // Detect suffix
  const parsed = Chord.get(chord);
  const suffix = parsed.tonic ? chord.slice(parsed.tonic.length) : chord;
  let typeScore = 2;
  for (const [s, sc] of suffixScore) {
    if (suffix === s || suffix.endsWith(s)) { typeScore = sc; break; }
  }

  // Add points for barre at high fret positions
  if (fingering?.barre) {
    if (fingering.barre >= 5) typeScore = Math.max(typeScore, 4);
    else if (fingering.barre >= 3) typeScore = Math.max(typeScore, 3);
  }

  // Open string chords (low complexity boost)
  const isOpen = fingering && !fingering.barre && fingering.frets.some(f => f === 0);
  if (isOpen && typeScore <= 2) typeScore = 1;

  return typeScore;
}

export function getGuitarFingering(chord: string): Fingering | null {
  // Try exact match first
  if (GUITAR_CHORDS[chord]) return GUITAR_CHORDS[chord];
  // Try with enharmonic
  const parsed = Chord.get(chord);
  if (parsed.tonic) {
    const simplified = Note.simplify(parsed.tonic + "4")?.replace("4", "") || parsed.tonic;
    const altKey = simplified + chord.slice(parsed.tonic.length);
    if (GUITAR_CHORDS[altKey]) return GUITAR_CHORDS[altKey];
  }
  return null;
}

export const CHORD_TYPES = [
  { label: "Mayor", suffix: "" },
  { label: "Menor", suffix: "m" },
  { label: "Dom 7", suffix: "7" },
  { label: "Maj 7", suffix: "maj7" },
  { label: "Menor 7", suffix: "m7" },
  { label: "Sus 2", suffix: "sus2" },
  { label: "Sus 4", suffix: "sus4" },
  { label: "Add 9", suffix: "add9" },
  { label: "Dim", suffix: "dim" },
  { label: "Aug", suffix: "aug" },
  { label: "m7b5", suffix: "m7b5" },
];

export const ALL_ROOTS = ["C", "C#", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B"];
