"use client";
/**
 * Renders one lyric line with chord tokens positioned above specific characters.
 * In edit mode: clicking above any character opens a chord picker at that position.
 * Dragging a chord token moves it to a new position.
 */
import { useRef, useState, useEffect } from "react";
import { ChordPosition } from "@/types";
import { ALL_ROOTS, CHORD_TYPES, chordToNotation } from "@/lib/chords";
import { Check, X, Trash2 } from "lucide-react";

interface Props {
  lyrics: string;
  chords: ChordPosition[];
  notation: "american" | "solfege";
  editMode: boolean;
  onChange?: (chords: ChordPosition[]) => void;
  onChordClick?: (chord: string) => void; // view mode: open diagram modal
}

const CHAR_W = 9.6;   // approximate px per character in 16px monospace-ish font
const CHORD_ROW_H = 22;

interface MiniPickerProps {
  chord: string;
  x: number;
  onSave: (c: string) => void;
  onDelete: () => void;
  onClose: () => void;
}

function MiniPicker({ chord, x, onSave, onDelete, onClose }: MiniPickerProps) {
  const parsed = chord.match(/^([A-G][b#]?)(.*)?$/);
  const [root, setRoot] = useState(parsed?.[1] || "G");
  const [type, setType] = useState(parsed?.[2] || "");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function h(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [onClose]);

  return (
    <div
      ref={ref}
      className="absolute z-50 w-52 rounded-xl shadow-2xl p-3 border"
      style={{
        left: Math.max(0, x - 90),
        top: -134,
        backgroundColor: "var(--c-surface)",
        borderColor: "var(--c-border)",
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <span style={{ color: "var(--c-indigo2)", fontWeight: 700, fontSize: 14 }}>{root + type}</span>
        <div className="flex gap-1">
          <button onClick={onDelete} style={{ color: "var(--c-text3)" }} className="hover:text-red-400 p-0.5"><Trash2 size={12} /></button>
          <button onClick={() => onSave(root + type)} style={{ color: "var(--c-text3)" }} className="hover:text-emerald-400 p-0.5"><Check size={12} /></button>
          <button onClick={onClose} style={{ color: "var(--c-text3)" }} className="hover:text-white p-0.5"><X size={12} /></button>
        </div>
      </div>
      <div className="grid grid-cols-6 gap-0.5 mb-2">
        {ALL_ROOTS.map((r) => (
          <button key={r} onClick={() => setRoot(r)}
            style={{
              fontSize: 10, padding: "2px 0", borderRadius: 4, transition: "all 0.1s",
              background: root === r ? "var(--c-indigo)" : "var(--c-elevated)",
              color: root === r ? "#fff" : "var(--c-text2)",
            }}>
            {r}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-0.5">
        {CHORD_TYPES.map((ct) => (
          <button key={ct.suffix} onClick={() => setType(ct.suffix)}
            style={{
              fontSize: 10, padding: "2px 6px", borderRadius: 4, transition: "all 0.1s",
              background: type === ct.suffix ? "var(--c-indigo)" : "var(--c-elevated)",
              color: type === ct.suffix ? "#fff" : "var(--c-text3)",
            }}>
            {ct.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function LyricLineEditor({ lyrics, chords, notation, editMode, onChange, onChordClick }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [picker, setPicker] = useState<{ pos: number; chord: string; isNew: boolean } | null>(null);
  const [dragging, setDragging] = useState<number | null>(null); // index of chord being dragged

  // Compute pixel x for a character position
  function posToX(pos: number) {
    return Math.round(pos * CHAR_W);
  }

  // Compute character position from pixel x click
  function xToPos(clientX: number) {
    if (!containerRef.current) return 0;
    const rect = containerRef.current.getBoundingClientRect();
    const relX = clientX - rect.left;
    return Math.max(0, Math.min(lyrics.length, Math.round(relX / CHAR_W)));
  }

  function handleChordRowClick(e: React.MouseEvent) {
    if (!editMode) return;
    const pos = xToPos(e.clientX);
    // Check if clicking on existing chord (within 1.5 chars)
    const existing = chords.findIndex((c) => Math.abs((c.pos ?? 0) - pos) < 2);
    if (existing >= 0) {
      setPicker({ pos: chords[existing].pos ?? 0, chord: chords[existing].chord, isNew: false });
    } else {
      setPicker({ pos, chord: "G", isNew: true });
    }
  }

  function savePicker(newChord: string) {
    if (!picker || !onChange) return;
    let newChords: ChordPosition[];
    if (picker.isNew) {
      newChords = [...chords, { chord: newChord, pos: picker.pos }]
        .sort((a, b) => (a.pos ?? 0) - (b.pos ?? 0));
    } else {
      newChords = chords.map((c) =>
        (c.pos ?? 0) === picker.pos ? { ...c, chord: newChord } : c
      );
    }
    onChange(newChords);
    setPicker(null);
  }

  function deletePicker() {
    if (!picker || !onChange) return;
    onChange(chords.filter((c) => (c.pos ?? 0) !== picker.pos));
    setPicker(null);
  }

  // Drag handlers
  function onDragStart(e: React.DragEvent, idx: number) {
    setDragging(idx);
    e.dataTransfer.effectAllowed = "move";
  }

  function onChordRowDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }

  function onChordRowDrop(e: React.DragEvent) {
    e.preventDefault();
    if (dragging === null || !onChange) return;
    const pos = xToPos(e.clientX);
    const newChords = chords.map((c, i) =>
      i === dragging ? { ...c, pos } : c
    ).sort((a, b) => (a.pos ?? 0) - (b.pos ?? 0));
    onChange(newChords);
    setDragging(null);
  }

  const charWidth = CHAR_W;
  const totalWidth = Math.max(lyrics.length * charWidth, 200);

  return (
    <div className="relative select-none" style={{ fontFamily: "var(--font-geist-mono, monospace)" }}>
      {/* Chord row */}
      <div
        ref={containerRef}
        style={{
          height: CHORD_ROW_H,
          position: "relative",
          width: totalWidth,
          cursor: editMode ? "crosshair" : "default",
          minWidth: "100%",
        }}
        onClick={handleChordRowClick}
        onDragOver={editMode ? onChordRowDragOver : undefined}
        onDrop={editMode ? onChordRowDrop : undefined}
      >
        {editMode && (
          <div style={{
            position: "absolute", inset: 0,
            background: "var(--c-indigo-bg)",
            borderRadius: 4,
            opacity: 0.5,
          }} />
        )}
        {chords.map((cp, idx) => {
          const x = posToX(cp.pos ?? 0);
          return (
            <span
              key={idx}
              draggable={editMode}
              onDragStart={editMode ? (e) => onDragStart(e, idx) : undefined}
              onClick={(e) => {
                e.stopPropagation();
                if (!editMode && onChordClick) onChordClick(cp.chord);
                if (editMode) setPicker({ pos: cp.pos ?? 0, chord: cp.chord, isNew: false });
              }}
              style={{
                position: "absolute",
                left: x,
                top: 2,
                color: "var(--c-indigo)",
                fontWeight: 700,
                fontSize: 13,
                whiteSpace: "nowrap",
                lineHeight: 1,
                cursor: editMode ? "grab" : "pointer",
                userSelect: "none",
                padding: "1px 3px",
                borderRadius: 3,
                background: editMode ? "var(--c-indigo-bg)" : "transparent",
              }}
            >
              {chordToNotation(cp.chord, notation)}
            </span>
          );
        })}

        {/* Picker */}
        {picker && (
          <MiniPicker
            chord={picker.chord}
            x={posToX(picker.pos)}
            onSave={savePicker}
            onDelete={deletePicker}
            onClose={() => setPicker(null)}
          />
        )}
      </div>

      {/* Lyrics */}
      <div
        style={{
          fontSize: 15,
          color: "var(--c-text)",
          letterSpacing: "0.01em",
          lineHeight: 1.6,
          whiteSpace: "pre",
          minWidth: "100%",
        }}
      >
        {lyrics || " "}
      </div>
    </div>
  );
}
