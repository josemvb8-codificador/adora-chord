export type Notation = "american" | "solfege";
export type Instrument = "guitar" | "piano" | "bass";
export type SectionType = "intro" | "verse" | "prechorus" | "chorus" | "bridge" | "outro" | "solo" | "interlude";
export type Tuning = "standard" | "dropD" | "dadgad" | "openG" | "openD";

export interface ChordPosition {
  chord: string;
  pos?: number;   // character index in the lyrics line (0-based)
  beat?: number;
}

export interface SongLine {
  lyrics: string;
  chords: ChordPosition[];
}

export interface Section {
  id: string;
  type: SectionType;
  name: string;
  lines: SongLine[];
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  key: string;
  mode: "major" | "minor";
  capo: number;
  tempo: number;
  timeSignature: "4/4" | "3/4" | "6/8" | "2/4";
  tuning: Tuning;
  notation: Notation;
  showGuitarTab: boolean;
  showPianoTab: boolean;
  sections: Section[];
  createdAt: number;
  updatedAt: number;
}
