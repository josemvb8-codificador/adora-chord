"use client";
import { useState, useRef, useEffect } from "react";
import { useSongsStore } from "@/store/songs";
import { useAuthStore } from "@/store/auth";
import { Song, Section, SongLine, SectionType, SongCategory } from "@/types";
import { X, Plus, Trash2 } from "lucide-react";
import { ALL_ROOTS } from "@/lib/chords";

function AutoTextarea({ value, onChange, placeholder, className }: {
  value: string; onChange: (v: string) => void; placeholder?: string; className?: string;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    if (ref.current) {
      ref.current.style.height = "auto";
      ref.current.style.height = `${ref.current.scrollHeight}px`;
    }
  }, [value]);
  return (
    <textarea
      ref={ref}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={6}
      className={className}
      style={{ resize: "none", overflow: "hidden", minHeight: "160px" }}
    />
  );
}

function uid() { return crypto.randomUUID(); }

const SECTION_TYPES: SectionType[] = ["intro", "verse", "prechorus", "chorus", "bridge", "interlude", "solo", "outro"];

const CATEGORIES: { value: SongCategory; label: string; emoji: string }[] = [
  { value: "alabanza", label: "Alabanza", emoji: "🎤" },
  { value: "himno",    label: "Himno",    emoji: "📖" },
  { value: "coro",     label: "Coro",     emoji: "🎵" },
  { value: "otro",     label: "Otro",     emoji: "🎸" },
];
const SECTION_LABELS: Record<SectionType, string> = {
  intro: "Intro", verse: "Verso", prechorus: "Pre-Coro", chorus: "Coro",
  bridge: "Puente", interlude: "Interludio", solo: "Solo", outro: "Final",
};

interface Props { onClose: () => void; editId?: string; }

export default function SongEditor({ onClose, editId }: Props) {
  const { addSong, updateSong, songs } = useSongsStore();
  const { user } = useAuthStore();
  const existing = editId ? songs.find((s) => s.id === editId) : undefined;
  const [saveError, setSaveError] = useState("");
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState(existing?.title || "");
  const [artist, setArtist] = useState(existing?.artist || "");
  const [key, setKey] = useState(existing?.key || "G");
  const [mode, setMode] = useState<"major" | "minor">(existing?.mode || "major");
  const [capo, setCapo] = useState(existing?.capo ?? 0);
  const [tempo, setTempo] = useState(existing?.tempo ?? 75);
  const [category, setCategory] = useState<SongCategory>(existing?.category ?? "alabanza");
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

  async function save() {
    if (!title.trim()) return;
    setSaveError("");
    setSaving(true);
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
      category,
    };
    try {
    if (editId) {
      await updateSong(editId, songData, user?.id);
    } else {
      await addSong({ ...songData, id: uid(), createdAt: Date.now(), updatedAt: Date.now() }, user?.id ?? "");
    }
      onClose();
    } catch (e: any) {
      setSaveError(e.message || "No se pudo guardar. Verifica tu conexión.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-40 bg-white overflow-y-auto">
      <div className="max-w-7xl mx-auto px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-zinc-900">{editId ? "Editar canción" : "Nueva canción"}</h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-700"><X size={22} /></button>
        </div>

        <div className="flex gap-10 items-start">
          {/* Left column: Metadata + Category + Save */}
          <div className="w-88 shrink-0 sticky top-8 space-y-6" style={{width: "22rem"}}>
            {/* Metadata */}
            <div className="space-y-3">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Título de la canción *"
                className="w-full bg-white border border-zinc-300 rounded-xl px-4 py-3.5 text-zinc-900 placeholder-zinc-400 text-lg focus:outline-none focus:border-indigo-500"
              />
              <input
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                placeholder="Artista / Ministerio"
                className="w-full bg-white border border-zinc-300 rounded-xl px-4 py-3.5 text-zinc-900 placeholder-zinc-400 text-base focus:outline-none focus:border-indigo-500"
              />
              <div className="flex gap-2 flex-wrap">
                <select
                  value={key}
                  onChange={(e) => setKey(e.target.value)}
                  className="bg-white border border-zinc-300 rounded-lg px-4 py-2.5 text-zinc-900 text-base focus:outline-none focus:border-indigo-500"
                >
                  {ALL_ROOTS.map((r) => <option key={r}>{r}</option>)}
                </select>
                <button
                  onClick={() => setMode(mode === "major" ? "minor" : "major")}
                  className={`px-4 py-2.5 rounded-lg text-base transition-colors ${mode === "major" ? "bg-indigo-600 text-white" : "bg-zinc-100 text-zinc-700 border border-zinc-300"}`}
                >
                  {mode === "major" ? "Mayor" : "Menor"}
                </button>
                <div className="flex items-center gap-2 bg-white border border-zinc-300 rounded-lg px-4 py-2.5">
                  <span className="text-zinc-500 text-base">Cejilla</span>
                  <input
                    type="number" min={0} max={11} value={capo}
                    onChange={(e) => setCapo(Number(e.target.value))}
                    className="w-10 bg-transparent text-zinc-900 text-base text-center focus:outline-none"
                  />
                </div>
                <div className="flex items-center gap-2 bg-white border border-zinc-300 rounded-lg px-4 py-2.5">
                  <span className="text-zinc-500 text-base">BPM</span>
                  <input
                    type="number" min={40} max={240} value={tempo}
                    onChange={(e) => setTempo(Number(e.target.value))}
                    className="w-14 bg-transparent text-zinc-900 text-base text-center focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Category */}
            <div>
              <p className="text-zinc-500 text-xs mb-3 font-medium uppercase tracking-wider">Categoría</p>
              <div className="flex gap-2 flex-wrap">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.value}
                    onClick={() => setCategory(cat.value)}
                    className={`flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-base font-medium transition-colors ${
                      category === cat.value
                        ? "bg-indigo-600 text-white"
                        : "bg-zinc-100 text-zinc-600 border border-zinc-200 hover:text-zinc-900"
                    }`}
                  >
                    <span>{cat.emoji}</span> {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Error */}
            {saveError && (
              <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                {saveError}
              </div>
            )}

            {/* Save */}
            <button
              onClick={save}
              disabled={!title.trim() || saving}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-xl py-4 text-base transition-colors"
            >
              {saving ? "Guardando…" : editId ? "Guardar cambios" : "Crear canción"}
            </button>
          </div>

          {/* Right column: Sections */}
          <div className="flex-1 min-w-0 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-zinc-700 text-sm font-medium">Secciones</h3>
              <p className="text-zinc-400 text-xs">Usa [G] [Am] para acordes inline</p>
            </div>
            {sections.map((section) => (
              <div key={section.id} className="bg-zinc-50 border border-zinc-200 rounded-xl p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <select
                    value={section.type}
                    onChange={(e) => updateSection(section.id, {
                      type: e.target.value as SectionType,
                      name: SECTION_LABELS[e.target.value as SectionType],
                    })}
                    className="bg-white border border-zinc-300 rounded-lg px-4 py-2.5 text-zinc-900 text-base focus:outline-none"
                  >
                    {SECTION_TYPES.map((t) => <option key={t} value={t}>{SECTION_LABELS[t]}</option>)}
                  </select>
                  <input
                    value={section.name}
                    onChange={(e) => updateSection(section.id, { name: e.target.value })}
                    className="flex-1 bg-white border border-zinc-300 rounded-lg px-4 py-2.5 text-zinc-900 text-base focus:outline-none"
                  />
                  <button onClick={() => removeSection(section.id)} className="text-zinc-400 hover:text-rose-500 p-1.5">
                    <Trash2 size={18} />
                  </button>
                </div>
                <AutoTextarea
                  value={getSectionText(section)}
                  onChange={(v) => setSectionText(section.id, v)}
                  placeholder={"[G]Santo, [D]Santo\nSanto es el Señor"}
                  className="w-full bg-white border border-zinc-300 rounded-lg px-5 py-4 text-zinc-800 text-base font-mono placeholder-zinc-400 focus:outline-none focus:border-indigo-500"
                />
              </div>
            ))}
            <button
              onClick={addSection}
              className="w-full border border-dashed border-zinc-300 rounded-xl py-5 text-zinc-400 hover:text-zinc-700 hover:border-zinc-400 transition-colors text-base flex items-center justify-center gap-2"
            >
              <Plus size={16} /> Agregar sección
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
