"use client";
import { useSongsStore } from "@/store/songs";
import GuitarChord from "./GuitarChord";
import PianoChord from "./PianoChord";
import { getChordNotes, chordToNotation, CHORD_TYPES, ALL_ROOTS } from "@/lib/chords";
import { useState } from "react";
import { X } from "lucide-react";

export default function ChordModal() {
  const { chordModalChord, setChordModal, notation, instrument } = useSongsStore();
  const [selectedRoot, setSelectedRoot] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState("");

  if (!chordModalChord && selectedRoot === null) return null;

  const displayChord = selectedRoot !== null ? selectedRoot + selectedType : chordModalChord!;
  const notes = getChordNotes(displayChord);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={() => { setChordModal(null); setSelectedRoot(null); }}
    >
      <div
        className="bg-zinc-900 border border-zinc-700 rounded-t-2xl sm:rounded-2xl w-full max-w-sm p-5 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">{chordToNotation(displayChord, notation)}</h2>
            <p className="text-zinc-400 text-xs mt-0.5">{notes.join(" – ")}</p>
          </div>
          <button onClick={() => { setChordModal(null); setSelectedRoot(null); }} className="text-zinc-500 hover:text-white">
            <X size={20} />
          </button>
        </div>

        {/* Chord explorer */}
        <div>
          <p className="text-zinc-500 text-xs mb-2">Explorar acorde</p>
          <div className="grid grid-cols-6 gap-1 mb-2">
            {ALL_ROOTS.map((root) => (
              <button
                key={root}
                onClick={() => setSelectedRoot(root)}
                className={`text-xs py-1 rounded-md transition-colors ${
                  (selectedRoot || chordModalChord?.replace(/m.*|7.*|maj.*|sus.*|dim.*|aug.*|add.*/g, "")) === root
                    ? "bg-indigo-600 text-white"
                    : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                }`}
              >
                {root}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-1">
            {CHORD_TYPES.map((ct) => (
              <button
                key={ct.suffix}
                onClick={() => setSelectedType(ct.suffix)}
                className={`text-xs px-2 py-1 rounded-md transition-colors ${
                  selectedType === ct.suffix ? "bg-indigo-600 text-white" : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                }`}
              >
                {ct.label}
              </button>
            ))}
          </div>
        </div>

        {/* Diagrams */}
        <div className="flex flex-col items-center gap-4">
          {(instrument === "guitar" || instrument === "bass") && (
            <div>
              <p className="text-zinc-500 text-xs mb-2 text-center">Guitarra</p>
              <GuitarChord chord={displayChord} size="md" />
            </div>
          )}
          {instrument === "piano" && (
            <div>
              <p className="text-zinc-500 text-xs mb-2 text-center">Piano</p>
              <PianoChord chord={displayChord} size="md" />
            </div>
          )}
        </div>

        {/* Show both option */}
        <div className="flex gap-2 pt-1">
          <button
            onClick={() => useSongsStore.setState({ instrument: "guitar" })}
            className={`flex-1 text-xs py-2 rounded-lg transition-colors ${instrument === "guitar" ? "bg-indigo-600 text-white" : "bg-zinc-800 text-zinc-400"}`}
          >
            Guitarra
          </button>
          <button
            onClick={() => useSongsStore.setState({ instrument: "piano" })}
            className={`flex-1 text-xs py-2 rounded-lg transition-colors ${instrument === "piano" ? "bg-indigo-600 text-white" : "bg-zinc-800 text-zinc-400"}`}
          >
            Piano
          </button>
          <button
            onClick={() => useSongsStore.setState({ instrument: "bass" })}
            className={`flex-1 text-xs py-2 rounded-lg transition-colors ${instrument === "bass" ? "bg-indigo-600 text-white" : "bg-zinc-800 text-zinc-400"}`}
          >
            Bajo
          </button>
        </div>
      </div>
    </div>
  );
}
