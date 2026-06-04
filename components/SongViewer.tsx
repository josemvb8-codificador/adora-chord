"use client";
import { useSongsStore, getTransposedSong } from "@/store/songs";
import { chordToNotation } from "@/lib/chords";
import { ChevronUp, ChevronDown, Guitar } from "lucide-react";
import GuitarChord from "./GuitarChord";
import PianoChord from "./PianoChord";
import LyricLineEditor from "./LyricLineEditor";
import { Section } from "@/types";

const SECTION_COLORS: Record<string, string> = {
  intro:      "#38bdf8",
  verse:      "var(--c-text3)",
  prechorus:  "#fbbf24",
  chorus:     "var(--c-indigo2)",
  bridge:     "#fb7185",
  outro:      "var(--c-text4)",
  solo:       "#34d399",
  interlude:  "#c084fc",
};

export default function SongViewer() {
  const {
    songs, activeSongId, transposeSemitones, notation, instrument,
    setTranspose, setNotation, setInstrument, setChordModal, updateSong,
  } = useSongsStore();

  const rawSong = songs.find((s) => s.id === activeSongId);
  if (!rawSong) return (
    <div className="flex-1 flex items-center justify-center text-sm" style={{ color: "var(--c-text4)" }}>
      Selecciona o agrega una canción
    </div>
  );

  const song = getTransposedSong(rawSong, transposeSemitones);
  const allChords = Array.from(
    new Set(song.sections.flatMap((s) => s.lines.flatMap((l) => l.chords.map((c) => c.chord))))
  );

  const btnBase: React.CSSProperties = {
    fontSize: 12,
    padding: "4px 10px",
    borderRadius: 8,
    cursor: "pointer",
    border: "none",
    transition: "all 0.15s",
  };

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Sticky header */}
      <div style={{
        position: "sticky", top: 0, zIndex: 10,
        backgroundColor: "var(--c-bg)",
        borderBottom: "1px solid var(--c-border)",
        padding: "12px 16px",
        backdropFilter: "blur(8px)",
      }}>
        <div style={{ maxWidth: 680, margin: "0 auto" }}>
          <div className="flex items-start justify-between">
            <div>
              <h1 style={{ fontSize: 20, fontWeight: 700, color: "var(--c-text)", lineHeight: 1.2 }}>{rawSong.title}</h1>
              <p style={{ fontSize: 13, color: "var(--c-text3)", marginTop: 2 }}>{rawSong.artist}</p>
            </div>
            <div className="flex items-center gap-1 flex-wrap justify-end" style={{ marginTop: 4 }}>
              {[
                `${song.key}${song.mode === "minor" ? "m" : ""}`,
                rawSong.capo > 0 ? `Cejilla ${rawSong.capo}` : null,
                `${rawSong.tempo} BPM`,
              ].filter(Boolean).map((label) => (
                <span key={label} style={{ fontSize: 11, padding: "2px 8px", borderRadius: 6, background: "var(--c-elevated)", color: "var(--c-text3)" }}>
                  {label}
                </span>
              ))}
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap gap-2 mt-3">
            {/* Transpose */}
            <div style={{ display: "flex", alignItems: "center", gap: 4, background: "var(--c-elevated)", borderRadius: 8, padding: "2px 8px" }}>
              <span style={{ fontSize: 11, color: "var(--c-text3)", marginRight: 2 }}>Tono</span>
              <button onClick={() => setTranspose(transposeSemitones - 1)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--c-text2)", padding: 2 }}>
                <ChevronDown size={16} />
              </button>
              <span style={{ fontSize: 13, fontFamily: "monospace", color: "var(--c-indigo2)", width: 28, textAlign: "center" }}>
                {transposeSemitones > 0 ? `+${transposeSemitones}` : transposeSemitones}
              </span>
              <button onClick={() => setTranspose(transposeSemitones + 1)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--c-text2)", padding: 2 }}>
                <ChevronUp size={16} />
              </button>
              {transposeSemitones !== 0 && (
                <button onClick={() => setTranspose(0)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 11, color: "var(--c-text4)", marginLeft: 2 }}>✕</button>
              )}
            </div>

            {/* Notation */}
            <button
              onClick={() => setNotation(notation === "american" ? "solfege" : "american")}
              style={{ ...btnBase, background: "var(--c-elevated)", color: "var(--c-text2)" }}
            >
              {notation === "american" ? "A B C → Do Re Mi" : "Do Re Mi → A B C"}
            </button>

            {/* Instrument */}
            <div style={{ display: "flex", gap: 2, background: "var(--c-elevated)", borderRadius: 8, padding: 3 }}>
              {(["guitar", "piano", "bass"] as const).map((inst) => (
                <button
                  key={inst}
                  onClick={() => setInstrument(inst)}
                  style={{
                    ...btnBase, padding: "2px 8px",
                    background: instrument === inst ? "var(--c-indigo)" : "transparent",
                    color: instrument === inst ? "#fff" : "var(--c-text3)",
                  }}
                >
                  {inst === "guitar" ? "Guitarra" : inst === "piano" ? "Piano" : "Bajo"}
                </button>
              ))}
            </div>

            {/* Diagrams toggle */}
            <button
              onClick={() => updateSong(rawSong.id, { showPianoTab: !rawSong.showPianoTab })}
              style={{
                ...btnBase,
                background: rawSong.showPianoTab ? "var(--c-indigo)" : "var(--c-elevated)",
                color: rawSong.showPianoTab ? "#fff" : "var(--c-text3)",
              }}
            >
              Diagramas
            </button>
          </div>
        </div>
      </div>

      {/* Chord diagrams bar */}
      {rawSong.showPianoTab && (
        <div style={{ borderBottom: "1px solid var(--c-border)", padding: "16px", overflowX: "auto" }}>
          <div style={{ display: "flex", gap: 24, width: "max-content", maxWidth: "100%" }}>
            {allChords.map((chord) => (
              <div key={chord} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 11, color: "var(--c-text3)" }}>{chordToNotation(chord, notation)}</span>
                {instrument === "piano"
                  ? <PianoChord chord={chord} size="sm" />
                  : <GuitarChord chord={chord} size="sm" />
                }
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Song body */}
      <div style={{ maxWidth: 680, margin: "0 auto", padding: "24px 16px", display: "flex", flexDirection: "column", gap: 32 }}>
        {song.sections.map((section) => (
          <div key={section.id}>
            <p style={{
              fontSize: 11, fontWeight: 600, textTransform: "uppercase",
              letterSpacing: "0.12em", marginBottom: 12,
              color: SECTION_COLORS[section.type] || "var(--c-text3)",
            }}>
              {section.name}
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {section.lines.map((line, li) => (
                <LyricLineEditor
                  key={li}
                  lyrics={line.lyrics}
                  chords={line.chords}
                  notation={notation}
                  editMode={false}
                  onChordClick={(chord) => setChordModal(chord)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
