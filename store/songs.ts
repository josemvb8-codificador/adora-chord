"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Song, Notation, Instrument } from "@/types";
import { transposeChord } from "@/lib/chords";
import { supabase, DbSong } from "@/lib/supabase";

// ── helpers ────────────────────────────────────────────────────────────────
function toDb(song: Song, userId: string): Omit<DbSong, "id" | "created_at" | "updated_at"> {
  return {
    user_id: userId,
    title: song.title,
    artist: song.artist,
    key: song.key,
    mode: song.mode,
    capo: song.capo,
    tempo: song.tempo,
    time_signature: song.timeSignature,
    tuning: song.tuning,
    sections: song.sections as any,
    is_shared: false,
  };
}

function fromDb(row: DbSong): Song {
  return {
    id: row.id,
    title: row.title,
    artist: row.artist,
    key: row.key,
    mode: row.mode as "major" | "minor",
    capo: row.capo,
    tempo: row.tempo,
    timeSignature: row.time_signature as Song["timeSignature"],
    tuning: row.tuning as Song["tuning"],
    notation: "american",
    showGuitarTab: false,
    showPianoTab: false,
    sections: row.sections,
    createdAt: new Date(row.created_at).getTime(),
    updatedAt: new Date(row.updated_at).getTime(),
  };
}

// ── store ──────────────────────────────────────────────────────────────────
interface SongsState {
  songs: Song[];
  activeSongId: string | null;
  transposeSemitones: number;
  notation: Notation;
  instrument: Instrument;
  chordModalChord: string | null;
  syncing: boolean;

  // local UI
  setActiveSong: (id: string | null) => void;
  setTranspose: (n: number) => void;
  setNotation: (n: Notation) => void;
  setInstrument: (i: Instrument) => void;
  setChordModal: (c: string | null) => void;

  // cloud CRUD
  fetchSongs: (userId: string) => Promise<void>;
  addSong: (song: Song, userId: string) => Promise<void>;
  updateSong: (id: string, updates: Partial<Song>, userId?: string) => Promise<void>;
  deleteSong: (id: string) => Promise<void>;
  syncShared: () => Promise<void>;
}

export const useSongsStore = create<SongsState>()(
  persist(
    (set, get) => ({
      songs: [],
      activeSongId: null,
      transposeSemitones: 0,
      notation: "american",
      instrument: "guitar",
      chordModalChord: null,
      syncing: false,

      setActiveSong: (id) => set({ activeSongId: id, transposeSemitones: 0 }),
      setTranspose: (n) => set({ transposeSemitones: n }),
      setNotation: (n) => set({ notation: n }),
      setInstrument: (i) => set({ instrument: i }),
      setChordModal: (c) => set({ chordModalChord: c }),

      fetchSongs: async (userId) => {
        set({ syncing: true });
        const { data: own } = await supabase
          .from("songs")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false });

        const { data: shared } = await supabase
          .from("songs")
          .select("*")
          .eq("is_shared", true)
          .neq("user_id", userId)
          .order("created_at", { ascending: false });

        const all = [...(own ?? []), ...(shared ?? [])].map(fromDb);
        set({ songs: all, syncing: false });
        // No auto-select: el usuario elige desde la pantalla de bienvenida
      },

      addSong: async (song, userId) => {
        const { data, error } = await supabase
          .from("songs")
          .insert(toDb(song, userId))
          .select()
          .single();
        if (error) {
          console.error("Error saving song:", error.message);
          throw new Error(error.message);
        }
        if (data) {
          set((s) => ({ songs: [fromDb(data), ...s.songs], activeSongId: data.id }));
        }
      },

      updateSong: async (id, updates, userId) => {
        // optimistic update
        set((s) => ({
          songs: s.songs.map((song) =>
            song.id === id ? { ...song, ...updates, updatedAt: Date.now() } : song
          ),
        }));
        const song = get().songs.find((s) => s.id === id);
        if (!song || !userId) return;
        await supabase
          .from("songs")
          .update({
            title: song.title,
            artist: song.artist,
            key: song.key,
            mode: song.mode,
            capo: song.capo,
            tempo: song.tempo,
            sections: song.sections,
          })
          .eq("id", id);
      },

      deleteSong: async (id) => {
        set((s) => ({
          songs: s.songs.filter((song) => song.id !== id),
          activeSongId: s.activeSongId === id
            ? (s.songs.find((s) => s.id !== id)?.id ?? null)
            : s.activeSongId,
        }));
        await supabase.from("songs").delete().eq("id", id);
      },

      syncShared: async () => {
        const { data } = await supabase
          .from("songs")
          .select("*")
          .eq("is_shared", true)
          .order("created_at", { ascending: false });
        if (data) {
          const shared = data.map(fromDb);
          set((s) => {
            const own = s.songs.filter((song) =>
              !shared.some((sh) => sh.id === song.id)
            );
            return { songs: [...own, ...shared] };
          });
        }
      },
    }),
    {
      name: "adora-ui",
      // only persist UI preferences, not songs (those come from Supabase)
      partialize: (s) => ({
        notation: s.notation,
        instrument: s.instrument,
        transposeSemitones: s.transposeSemitones,
      }),
    }
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
