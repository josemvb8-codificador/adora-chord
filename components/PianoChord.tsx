"use client";
import { getChordNotes, PIANO_KEYS } from "@/lib/chords";
import { Note } from "tonal";

interface Props {
  chord: string;
  size?: "sm" | "md" | "lg";
}

const WHITE_KEYS = PIANO_KEYS.filter((k) => !k.isBlack);
const KEY_W = { sm: 18, md: 24, lg: 32 };
const KEY_H = { sm: 60, md: 80, lg: 100 };

export default function PianoChord({ chord, size = "md" }: Props) {
  const notes = getChordNotes(chord);
  const noteNames = notes.map((n) => {
    const pc = Note.pitchClass(n) || n;
    return Note.simplify(pc + "4")?.replace("4", "") || pc;
  });

  const isActive = (keyNote: string) =>
    noteNames.some((n) => n === keyNote || Note.enharmonic(n + "4")?.replace("4", "") === keyNote);

  const w = KEY_W[size];
  const h = KEY_H[size];
  const totalWidth = WHITE_KEYS.length * w;
  const blackH = h * 0.62;
  const blackW = w * 0.6;

  return (
    <svg width={totalWidth} height={h} viewBox={`0 0 ${totalWidth} ${h}`} className="block">
      {/* White keys */}
      {WHITE_KEYS.map((key, i) => (
        <rect
          key={key.note}
          x={i * w}
          y={0}
          width={w - 1}
          height={h}
          rx={2}
          fill={isActive(key.note) ? "#6366f1" : "#ffffff"}
          stroke="#d1d5db"
          strokeWidth={1}
        />
      ))}
      {/* Black keys */}
      {PIANO_KEYS.filter((k) => k.isBlack).map((key) => {
        const whiteIndex = WHITE_KEYS.findIndex((wk) => wk.index === key.index - 1);
        if (whiteIndex < 0) return null;
        const x = whiteIndex * w + w - blackW / 2;
        return (
          <rect
            key={key.note}
            x={x}
            y={0}
            width={blackW}
            height={blackH}
            rx={2}
            fill={isActive(key.note) ? "#818cf8" : "#1f2937"}
          />
        );
      })}
      {/* Root note label */}
      {WHITE_KEYS.map((key, i) => {
        if (!isActive(key.note)) return null;
        return (
          <text key={`lbl-${key.note}`} x={i * w + w / 2} y={h - 6} textAnchor="middle" fontSize={9} fill="white" fontWeight="bold">
            {key.note}
          </text>
        );
      })}
    </svg>
  );
}
