"use client";
import { useState } from "react";
import { useSongsStore, getTransposedSong } from "@/store/songs";
import { chordToNotation, getChordComplexity } from "@/lib/chords";
import { ChevronUp, ChevronDown, Download, FileText, FileType2 } from "lucide-react";
import GuitarChord from "./GuitarChord";
import PianoChord from "./PianoChord";
import LyricLineEditor from "./LyricLineEditor";
import { exportToPdf, exportToWord } from "@/lib/exportSong";

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

  const [showExport, setShowExport] = useState(false);
  const [exporting, setExporting] = useState<"pdf" | "word" | null>(null);

  const rawSong = songs.find((s) => s.id === activeSongId);
  if (!rawSong) return null; // WelcomeScreen is rendered by the parent

  const song = getTransposedSong(rawSong, transposeSemitones);

  async function handleExport(format: "pdf" | "word") {
    setExporting(format);
    setShowExport(false);
    try {
      if (format === "pdf") await exportToPdf(rawSong!, transposeSemitones, notation);
      else await exportToWord(rawSong!, transposeSemitones, notation);
    } finally {
      setExporting(null);
    }
  }
  const allChords = Array.from(
    new Set(song.sections.flatMap((s) => s.lines.flatMap((l) => l.chords.map((c) => c.chord))))
  ).sort((a, b) => getChordComplexity(a) - getChordComplexity(b));

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
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
            <div style={{ minWidth: 0, flex: 1 }}>
              <h1 style={{ fontSize: "clamp(15px, 4vw, 20px)", fontWeight: 700, color: "var(--c-text)", lineHeight: 1.2, wordBreak: "break-word" }}>{rawSong.title}</h1>
              <p style={{ fontSize: 13, color: "var(--c-text3)", marginTop: 2 }}>{rawSong.artist}</p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 4, flexWrap: "wrap", justifyContent: "flex-end", flexShrink: 0, marginTop: 2 }}>
              {[
                `${song.key}${song.mode === "minor" ? "m" : ""}`,
                rawSong.capo > 0 ? `Cejilla ${rawSong.capo}` : null,
                `${rawSong.tempo} BPM`,
              ].filter(Boolean).map((label) => (
                <span key={label} style={{ fontSize: 10, padding: "2px 7px", borderRadius: 6, background: "var(--c-elevated)", color: "var(--c-text3)", whiteSpace: "nowrap" }}>
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
              {notation === "american" ? "ABC → Do Re Mi" : "Do Re Mi → ABC"}
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

            {/* Export */}
            <div style={{ position: "relative" }}>
              <button
                onClick={() => setShowExport((v) => !v)}
                style={{
                  ...btnBase,
                  background: "var(--c-elevated)",
                  color: exporting ? "var(--c-indigo2)" : "var(--c-text2)",
                  display: "flex", alignItems: "center", gap: 5,
                }}
              >
                <Download size={13} />
                {exporting ? "Descargando…" : "Descargar"}
              </button>
              {showExport && (
                <div style={{
                  position: "absolute", top: "calc(100% + 6px)", right: 0, zIndex: 20,
                  backgroundColor: "var(--c-surface)",
                  border: "1px solid var(--c-border)",
                  borderRadius: 10,
                  boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
                  overflow: "hidden",
                  minWidth: 160,
                }}>
                  <button
                    onClick={() => handleExport("pdf")}
                    style={{
                      width: "100%", display: "flex", alignItems: "center", gap: 10,
                      padding: "10px 14px", background: "none", border: "none",
                      cursor: "pointer", color: "var(--c-text)",
                      fontSize: 13, textAlign: "left",
                      borderBottom: "1px solid var(--c-border)",
                    }}
                  >
                    <FileType2 size={15} style={{ color: "#ef4444" }} />
                    Descargar PDF
                  </button>
                  <button
                    onClick={() => handleExport("word")}
                    style={{
                      width: "100%", display: "flex", alignItems: "center", gap: 10,
                      padding: "10px 14px", background: "none", border: "none",
                      cursor: "pointer", color: "var(--c-text)",
                      fontSize: 13, textAlign: "left",
                    }}
                  >
                    <FileText size={15} style={{ color: "#2563eb" }} />
                    Descargar Word
                  </button>
                </div>
              )}
            </div>
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
