"use client";
import { getGuitarFingering } from "@/lib/chords";

interface Props {
  chord: string;
  size?: "sm" | "md" | "lg";
}

const SIZES = {
  sm: { cellW: 22, cellH: 18, dotR: 6, fontSize: 9, frets: 4 },
  md: { cellW: 30, cellH: 24, dotR: 8, fontSize: 11, frets: 5 },
  lg: { cellW: 38, cellH: 30, dotR: 10, fontSize: 13, frets: 5 },
};

export default function GuitarChord({ chord, size = "md" }: Props) {
  const fingering = getGuitarFingering(chord);
  const { cellW, cellH, dotR, fontSize, frets } = SIZES[size];

  const strings = 6;
  const width = (strings - 1) * cellW + 40;
  const height = frets * cellH + 50;

  if (!fingering) {
    return (
      <div className="flex items-center justify-center bg-zinc-800 rounded-lg text-zinc-500 text-xs" style={{ width, height }}>
        sin diagrama
      </div>
    );
  }

  const { frets: fretsArr, barre, barreString } = fingering;
  const minFret = Math.min(...fretsArr.filter((f) => f > 0));
  const offset = minFret > 4 ? minFret - 1 : 0;
  const nutY = 20;
  const paddingLeft = 30;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="block">
      {/* Nut */}
      <rect x={paddingLeft} y={nutY - (offset === 0 ? 3 : 0)} width={(strings - 1) * cellW} height={offset === 0 ? 4 : 1} fill="#e5e7eb" />
      {/* Fret position label */}
      {offset > 0 && (
        <text x={paddingLeft - 6} y={nutY + cellH / 2 + 4} fontSize={fontSize - 2} fill="#9ca3af" textAnchor="end">
          {offset + 1}fr
        </text>
      )}
      {/* Fret lines */}
      {Array.from({ length: frets }).map((_, fi) => (
        <line
          key={fi}
          x1={paddingLeft}
          y1={nutY + (fi + 1) * cellH}
          x2={paddingLeft + (strings - 1) * cellW}
          y2={nutY + (fi + 1) * cellH}
          stroke="#374151"
          strokeWidth={1}
        />
      ))}
      {/* String lines */}
      {Array.from({ length: strings }).map((_, si) => (
        <line
          key={si}
          x1={paddingLeft + si * cellW}
          y1={nutY}
          x2={paddingLeft + si * cellW}
          y2={nutY + frets * cellH}
          stroke="#4b5563"
          strokeWidth={1}
        />
      ))}
      {/* Barre */}
      {barre && barreString && (
        <rect
          x={paddingLeft}
          y={nutY + (barre - offset - 1) * cellH + cellH / 2 - dotR}
          width={(strings - 1) * cellW}
          height={dotR * 2}
          rx={dotR}
          fill="#6366f1"
          opacity={0.85}
        />
      )}
      {/* Dots */}
      {fretsArr.map((fret, si) => {
        const x = paddingLeft + si * cellW;
        if (fret === -1) {
          // Muted
          return (
            <text key={si} x={x} y={nutY - 6} textAnchor="middle" fontSize={fontSize} fill="#6b7280">
              ×
            </text>
          );
        }
        if (fret === 0) {
          return (
            <circle key={si} cx={x} cy={nutY - 7} r={dotR - 2} fill="none" stroke="#9ca3af" strokeWidth={1.5} />
          );
        }
        const cy = nutY + (fret - offset - 0.5) * cellH;
        return (
          <circle key={si} cx={x} cy={cy} r={dotR} fill="#6366f1" />
        );
      })}
      {/* Chord name */}
      <text x={width / 2} y={height - 4} textAnchor="middle" fontSize={fontSize} fill="#9ca3af">
        {chord}
      </text>
    </svg>
  );
}
