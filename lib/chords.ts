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
  "C":   { frets: [-1, 3, 2, 0, 1, 0] },
  "Cm":  { frets: [-1, 3, 5, 5, 4, 3], barre: 3, barreString: 5 },
  "D":   { frets: [-1, -1, 0, 2, 3, 2] },
  "Dm":  { frets: [-1, -1, 0, 2, 3, 1] },
  "E":   { frets: [0, 2, 2, 1, 0, 0] },
  "Em":  { frets: [0, 2, 2, 0, 0, 0] },
  "F":   { frets: [1, 3, 3, 2, 1, 1], barre: 1, barreString: 6 },
  "Fm":  { frets: [1, 3, 3, 1, 1, 1], barre: 1, barreString: 6 },
  "G":   { frets: [3, 2, 0, 0, 0, 3] },
  "Gm":  { frets: [3, 5, 5, 3, 3, 3], barre: 3, barreString: 6 },
  "A":   { frets: [-1, 0, 2, 2, 2, 0] },
  "Am":  { frets: [-1, 0, 2, 2, 1, 0] },
  "A#":  { frets: [-1, 1, 3, 3, 3, 1], barre: 1, barreString: 5 },
  "Bb":  { frets: [-1, 1, 3, 3, 3, 1], barre: 1, barreString: 5 },
  "B":   { frets: [-1, 2, 4, 4, 4, 2], barre: 2, barreString: 5 },
  "Bm":  { frets: [-1, 2, 4, 4, 3, 2], barre: 2, barreString: 5 },
  "G7":  { frets: [3, 2, 0, 0, 0, 1] },
  "C7":  { frets: [-1, 3, 2, 3, 1, 0] },
  "D7":  { frets: [-1, -1, 0, 2, 1, 2] },
  "E7":  { frets: [0, 2, 0, 1, 0, 0] },
  "A7":  { frets: [-1, 0, 2, 0, 2, 0] },
  "B7":  { frets: [-1, 2, 1, 2, 0, 2] },
  "F7":  { frets: [1, 3, 1, 2, 1, 1], barre: 1, barreString: 6 },
  "Dm7": { frets: [-1, -1, 0, 2, 1, 1] },
  "Em7": { frets: [0, 2, 2, 0, 3, 0] },
  "Am7": { frets: [-1, 0, 2, 0, 1, 0] },
  "Cmaj7": { frets: [-1, 3, 2, 0, 0, 0] },
  "Fmaj7": { frets: [-1, -1, 3, 2, 1, 0] },
  "Gmaj7": { frets: [3, 2, 0, 0, 0, 2] },
  "Amaj7": { frets: [-1, 0, 2, 1, 2, 0] },
  "Dsus2": { frets: [-1, -1, 0, 2, 3, 0] },
  "Dsus4": { frets: [-1, -1, 0, 2, 3, 3] },
  "Gsus4": { frets: [3, 3, 0, 0, 1, 3] },
  "Asus2": { frets: [-1, 0, 2, 2, 0, 0] },
  "Asus4": { frets: [-1, 0, 2, 2, 3, 0] },
  "Esus4": { frets: [0, 2, 2, 2, 0, 0] },
  "Cadd9": { frets: [-1, 3, 2, 0, 3, 0] },
  "Gadd9": { frets: [3, 2, 0, 2, 0, 3] },
};

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
