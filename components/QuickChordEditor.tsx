"use client";
import { useState } from "react";
import { useSongsStore } from "@/store/songs";
import { Section, ChordPosition } from "@/types";
import { Check, X } from "lucide-react";
import LyricLineEditor from "./LyricLineEditor";

interface Props { onClose: () => void; }

const SECTION_LABELS: Record<string, string> = {
  intro: "Intro", verse: "Verso", prechorus: "Pre-Coro", chorus: "Coro",
  bridge: "Puente", interlude: "Interludio", solo: "Solo", outro: "Final",
};

const SECTION_COLORS: Record<string, string> = {
  intro: "#38bdf8", verse: "var(--c-text3)", prechorus: "#fbbf24",
  chorus: "var(--c-indigo2)", bridge: "#fb7185", outro: "var(--c-text4)",
  solo: "#34d399", interlude: "#c084fc",
};

export default function QuickChordEditor({ onClose }: Props) {
  const { songs, activeSongId, updateSong, notation } = useSongsStore();
  const song = songs.find((s) => s.id === activeSongId);
  const [sections, setSections] = useState<Section[]>(song?.sections || []);
  const [saved, setSaved] = useState(false);

  if (!song) return null;

  function updateLineChords(sid: string, li: number, chords: ChordPosition[]) {
    setSections((prev) => prev.map((s) => {
      if (s.id !== sid) return s;
      return {
        ...s,
        lines: s.lines.map((line, i) => i === li ? { ...line, chords } : line),
      };
    }));
  }

  function saveAll() {
    updateSong(song!.id, { sections });
    setSaved(true);
    setTimeout(onClose, 700);
  }

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 40,
      backgroundColor: "var(--c-bg)",
      overflowY: "auto",
    }}>
      <div style={{ maxWidth: 700, margin: "0 auto", padding: "0 16px 40px" }}>
        {/* Header */}
        <div style={{
          position: "sticky", top: 0,
          backgroundColor: "var(--c-bg)",
          borderBottom: "1px solid var(--c-border)",
          padding: "14px 0",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          zIndex: 5,
        }}>
          <div>
            <h2 style={{ color: "var(--c-text)", fontWeight: 700, fontSize: 16 }}>Editor rápido de acordes</h2>
            <p style={{ color: "var(--c-text3)", fontSize: 12, marginTop: 2 }}>
              Toca encima de una letra para agregar acorde · Arrastra para mover
            </p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={onClose} style={{
              background: "var(--c-elevated)", border: "none", borderRadius: 8,
              color: "var(--c-text2)", padding: "6px 14px", fontSize: 13, cursor: "pointer",
            }}>Cancelar</button>
            <button onClick={saveAll} style={{
              background: saved ? "#059669" : "var(--c-indigo)",
              border: "none", borderRadius: 8,
              color: "#fff", padding: "6px 14px", fontSize: 13,
              fontWeight: 600, cursor: "pointer",
              transition: "background 0.2s",
            }}>
              {saved ? "✓ Guardado" : "Guardar"}
            </button>
          </div>
        </div>

        {/* Hint */}
        <div style={{
          margin: "16px 0",
          padding: "10px 14px",
          background: "var(--c-indigo-bg)",
          borderRadius: 10,
          borderLeft: "3px solid var(--c-indigo)",
          fontSize: 12,
          color: "var(--c-text2)",
        }}>
          <strong style={{ color: "var(--c-indigo2)" }}>Modo edición activo</strong> —
          La zona azul encima de cada letra es clickeable. Toca donde quieres poner un acorde,
          elige raíz y tipo, y guarda. Arrastra los acordes existentes para moverlos.
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
          {sections.map((section) => (
            <div key={section.id}>
              <p style={{
                fontSize: 11, fontWeight: 600, textTransform: "uppercase",
                letterSpacing: "0.12em", marginBottom: 12,
                color: SECTION_COLORS[section.type] || "var(--c-text3)",
              }}>
                {SECTION_LABELS[section.type] || section.name} — {section.name}
              </p>
              <div style={{
                background: "var(--c-surface)",
                borderRadius: 12,
                border: "1px solid var(--c-border)",
                padding: 16,
                display: "flex",
                flexDirection: "column",
                gap: 16,
              }}>
                {section.lines.map((line, li) => (
                  <LyricLineEditor
                    key={li}
                    lyrics={line.lyrics}
                    chords={line.chords}
                    notation={notation}
                    editMode={true}
                    onChange={(chords) => updateLineChords(section.id, li, chords)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
