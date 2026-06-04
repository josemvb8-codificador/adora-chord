"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Song, Section, SongLine, Notation, Instrument } from "@/types";
import { transposeChord } from "@/lib/chords";

interface SongsState {
  songs: Song[];
  activeSongId: string | null;
  transposeSemitones: number;
  notation: Notation;
  instrument: Instrument;
  chordModalChord: string | null;

  addSong: (song: Song) => void;
  updateSong: (id: string, updates: Partial<Song>) => void;
  deleteSong: (id: string) => void;
  setActiveSong: (id: string | null) => void;
  setTranspose: (semitones: number) => void;
  setNotation: (n: Notation) => void;
  setInstrument: (i: Instrument) => void;
  setChordModal: (chord: string | null) => void;
}

const DEMO_SONG: Song = {
  id: "demo-1",
  title: "Santo",
  artist: "Marcos Witt",
  key: "G",
  mode: "major",
  capo: 0,
  tempo: 72,
  timeSignature: "4/4",
  tuning: "standard",
  notation: "american",
  showGuitarTab: false,
  showPianoTab: false,
  sections: [
    {
      id: "s1",
      type: "verse",
      name: "Verso 1",
      lines: [
        {
          lyrics: "Santo, Santo, Santo es el Señor",
          chords: [
            { chord: "G", beat: 1 },
            { chord: "D", beat: 3 },
          ],
        },
        {
          lyrics: "Dios Todopoderoso",
          chords: [
            { chord: "Em", beat: 1 },
            { chord: "C", beat: 3 },
          ],
        },
      ],
    },
    {
      id: "s2",
      type: "chorus",
      name: "Coro",
      lines: [
        {
          lyrics: "Santo, Santo, Santo",
          chords: [
            { chord: "G", beat: 1 },
            { chord: "Cmaj7", beat: 3 },
          ],
        },
        {
          lyrics: "El Señor de los ejércitos",
          chords: [
            { chord: "D", beat: 1 },
            { chord: "G", beat: 4 },
          ],
        },
      ],
    },
  ],
  createdAt: Date.now(),
  updatedAt: Date.now(),
};

export const useSongsStore = create<SongsState>()(
  persist(
    (set, get) => ({
      songs: [DEMO_SONG],
      activeSongId: "demo-1",
      transposeSemitones: 0,
      notation: "american",
      instrument: "guitar",
      chordModalChord: null,

      addSong: (song) => set((s) => ({ songs: [...s.songs, song] })),
      updateSong: (id, updates) =>
        set((s) => ({
          songs: s.songs.map((song) =>
            song.id === id ? { ...song, ...updates, updatedAt: Date.now() } : song
          ),
        })),
      deleteSong: (id) =>
        set((s) => ({
          songs: s.songs.filter((song) => song.id !== id),
          activeSongId: s.activeSongId === id ? null : s.activeSongId,
        })),
      setActiveSong: (id) => set({ activeSongId: id, transposeSemitones: 0 }),
      setTranspose: (semitones) => set({ transposeSemitones: semitones }),
      setNotation: (n) => set({ notation: n }),
      setInstrument: (i) => set({ instrument: i }),
      setChordModal: (chord) => set({ chordModalChord: chord }),
    }),
    { name: "adora-songs" }
  )
);

export function getTransposedSong(song: Song, semitones: number): Song {
  if (semitones === 0) return song;
  return {
    ...song,
    sections: song.sections.map((section) => ({
      ...section,
      lines: section.lines.map((line) => ({
        ...line,
        chords: line.chords.map((cp) => ({
          ...cp,
          chord: transposeChord(cp.chord, semitones),
        })),
      })),
    })),
  };
}
