"use client";
import { useState } from "react";
import { useSongsStore } from "@/store/songs";
import { useAuthStore } from "@/store/auth";
import { Song, Section, SongLine, SectionType } from "@/types";
import { X, Plus, Trash2 } from "lucide-react";
import { ALL_ROOTS } from "@/lib/chords";

function uid() { return Math.random().toString(36).slice(2); }

const SECTION_TYPES: SectionType[] = ["intro", "verse", "prechorus", "chorus", "bridge", "interlude", "solo", "outro"];
const SECTION_LABELS: Record<SectionType, string> = {
  intro: "Intro", verse: "Verso", prechorus: "Pre-Coro", chorus: "Coro",
  bridge: "Puente", interlude: "Interludio", solo: "Solo", outro: "Final",
};

interface Props { onClose: () => void; editId?: string; }

export default function SongEditor({ onClose, editId }: Props) {
  const { addSong, updateSong, songs } = useSongsStore();
  const { user } = useAuthStore();
  const existing = editId ? songs.find((s) => s.id === editId) : undefined;

  const [title, setTitle] = useState(existing?.title || "");
  const [artist, setArtist] = useState(existing?.artist || "");
  const [key, setKey] = useState(existing?.key || "G");
  const [mode, setMode] = useState<"major" | "minor">(existing?.mode || "major");
  const [capo, setCapo] = useState(existing?.capo ?? 0);
  const [tempo, setTempo] = useState(existing?.tempo ?? 75);
  const [sections, setSections] = useState<Section[]>(
    existing?.sections || [
      { id: uid(), type: "verse", name: "Verso 1", lines: [{ lyrics: "", chords: [] }] },
    ]
  );

  // Parse a chord+lyrics line like "[G]Santo [D]es el Señor"
  function parseLine(raw: string): SongLine {
    const chordRegex = /\[([^\]]+)\]/g;
    const chords: { chord: string }[] = [];
    let match;
    while ((match = chordRegex.exec(raw)) !== null) chords.push({ chord: match[1] });
    const lyrics = raw.replace(/\[[^\]]+\]/g, "").trim();
    return { lyrics, chords };
  }

  function addSection() {
    setSections((prev) => [
      ...prev,
      { id: uid(), type: "verse", name: `Verso ${prev.length + 1}`, lines: [{ lyrics: "", chords: [] }] },
    ]);
  }

  function removeSection(sid: string) {
    setSections((prev) => prev.filter((s) => s.id !== sid));
  }

  function updateSection(sid: string, updates: Partial<Section>) {
    setSections((prev) => prev.map((s) => s.id === sid ? { ...s, ...updates } : s));
  }

  function setSectionText(sid: string, text: string) {
    const rawLines = text.split("\n");
    const result: { lyrics: string; chords: { chord: string }[] }[] = [];
    let i = 0;
    while (i < rawLines.length) {
      const parsed = parseLine(rawLines[i]);
      // A chord-only line should merge with the next lyrics line
      if (parsed.chords.length > 0 && !parsed.lyrics.trim() && i + 1 < rawLines.length) {
        const nextParsed = parseLine(rawLines[i + 1]);
        result.push({ lyrics: nextParsed.lyrics, chords: [...parsed.chords, ...nextParsed.chords] });
        i += 2;
      } else {
        result.push(parsed);
        i++;
      }
    }
    updateSection(sid, { lines: result.filter((l) => l.lyrics || l.chords.length > 0) });
  }

  function getSectionText(section: Section) {
    return section.lines
      .map((line) => {
        const chordStr = line.chords.map((c) => `[${c.chord}]`).join(" ");
        // Put chords inline: [G]Santo [D]es el Señor
        return chordStr ? `${chordStr}\n${line.lyrics}` : line.lyrics;
      })
      .join("\n");
  }

  function save() {
    if (!title.trim()) return;
    const songData: Omit<Song, "id" | "createdAt" | "updatedAt"> = {
      title: title.trim(),
      artist: artist.trim(),
      key,
      mode,
      capo,
      tempo,
      timeSignature: "4/4",
      tuning: "standard",
      notation: "american",
      showGuitarTab: false,
      showPianoTab: false,
      sections,
    };
    if (editId) {
      updateSong(editId, songData, user?.id);
    } else {
      addSong({ ...songData, id: uid(), createdAt: Date.now(), updatedAt: Date.now() }, user?.id ?? "");
    }
    onClose();
  }

  return (
    <div className="fixed inset-0 z-40 bg-zinc-950 overflow-y-auto">
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-white">{editId ? "Editar canción" : "Nueva canción"}</h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-white"><X size={22} /></button>
        </div>

        {/* Metadata */}
        <div className="space-y-3 mb-6">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Título de la canción *"
            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 text-base focus:outline-none focus:border-indigo-500"
          />
          <input
            value={artist}
            onChange={(e) => setArtist(e.target.value)}
            placeholder="Artista / Ministerio"
            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-indigo-500"
          />
          <div className="flex gap-2 flex-wrap">
            {/* Key */}
            <select
              value={key}
              onChange={(e) => setKey(e.target.value)}
              className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
            >
              {ALL_ROOTS.map((r) => <option key={r}>{r}</option>)}
            </select>
            {/* Mode */}
            <button
              onClick={() => setMode(mode === "major" ? "minor" : "major")}
              className={`px-3 py-2 rounded-lg text-sm transition-colors ${mode === "major" ? "bg-indigo-600 text-white" : "bg-zinc-800 text-zinc-300"}`}
            >
              {mode === "major" ? "Mayor" : "Menor"}
            </button>
            {/* Capo */}
            <div className="flex items-center gap-2 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2">
              <span className="text-zinc-400 text-sm">Cejilla</span>
              <input
                type="number" min={0} max={11} value={capo}
                onChange={(e) => setCapo(Number(e.target.value))}
                className="w-8 bg-transparent text-white text-sm text-center focus:outline-none"
              />
            </div>
            {/* Tempo */}
            <div className="flex items-center gap-2 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2">
              <span className="text-zinc-400 text-sm">BPM</span>
              <input
                type="number" min={40} max={240} value={tempo}
                onChange={(e) => setTempo(Number(e.target.value))}
                className="w-12 bg-transparent text-white text-sm text-center focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-4 mb-6">
          <div className="flex items-center justify-between">
            <h3 className="text-zinc-300 text-sm font-medium">Secciones</h3>
            <p className="text-zinc-600 text-xs">Usa [G] [Am] para acordes inline</p>
          </div>
          {sections.map((section) => (
            <div key={section.id} className="bg-zinc-800/60 border border-zinc-700 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2">
                <select
                  value={section.type}
                  onChange={(e) => updateSection(section.id, {
                    type: e.target.value as SectionType,
                    name: SECTION_LABELS[e.target.value as SectionType],
                  })}
                  className="bg-zinc-700 border border-zinc-600 rounded-lg px-2 py-1.5 text-white text-xs focus:outline-none"
                >
                  {SECTION_TYPES.map((t) => <option key={t} value={t}>{SECTION_LABELS[t]}</option>)}
                </select>
                <input
                  value={section.name}
                  onChange={(e) => updateSection(section.id, { name: e.target.value })}
                  className="flex-1 bg-zinc-700 border border-zinc-600 rounded-lg px-2 py-1.5 text-white text-xs focus:outline-none"
                />
                <button onClick={() => removeSection(section.id)} className="text-zinc-600 hover:text-rose-400">
                  <Trash2 size={15} />
                </button>
              </div>
              <textarea
                value={getSectionText(section)}
                onChange={(e) => setSectionText(section.id, e.target.value)}
                rows={6}
                placeholder={"[G]Santo, [D]Santo\nSanto es el Señor"}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-200 text-sm font-mono placeholder-zinc-600 focus:outline-none focus:border-indigo-500 resize-none"
              />
            </div>
          ))}
          <button
            onClick={addSection}
            className="w-full border border-dashed border-zinc-700 rounded-xl py-3 text-zinc-500 hover:text-zinc-300 hover:border-zinc-500 transition-colors text-sm flex items-center justify-center gap-2"
          >
            <Plus size={16} /> Agregar sección
          </button>
        </div>

        {/* Save */}
        <button
          onClick={save}
          disabled={!title.trim()}
          className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-xl py-3 transition-colors"
        >
          {editId ? "Guardar cambios" : "Crear canción"}
        </button>
      </div>
    </div>
  );
}
