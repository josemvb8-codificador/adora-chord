"use client";
import { useRef, useState } from "react";
import { parseSongText, ParsedSong } from "@/lib/songParser";
import { useSongsStore } from "@/store/songs";
import { Song, Section, SectionType } from "@/types";
import { Upload, FileText, X, Check, AlertCircle, Pencil, Plus, Trash2 } from "lucide-react";
import { ALL_ROOTS } from "@/lib/chords";

function uid() { return Math.random().toString(36).slice(2); }

const SECTION_TYPES: SectionType[] = ["intro", "verse", "prechorus", "chorus", "bridge", "interlude", "solo", "outro"];
const SECTION_LABELS: Record<SectionType, string> = {
  intro: "Intro", verse: "Verso", prechorus: "Pre-Coro", chorus: "Coro",
  bridge: "Puente", interlude: "Interludio", solo: "Solo", outro: "Final",
};

interface Props { onClose: () => void; }

type Step = "upload" | "review" | "done";

export default function ImportSong({ onClose }: Props) {
  const { addSong, setActiveSong } = useSongsStore();
  const fileRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<Step>("upload");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [parsed, setParsed] = useState<ParsedSong | null>(null);
  // editable fields
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [key, setKey] = useState("G");
  const [sections, setSections] = useState<Section[]>([]);

  async function handleFile(file: File) {
    setLoading(true);
    setError("");
    try {
      let text = "";
      if (file.name.endsWith(".pdf")) {
        text = await extractPdfText(file);
      } else if (file.name.match(/\.docx?$/i)) {
        text = await extractWordText(file);
      } else if (file.name.endsWith(".txt")) {
        text = await file.text();
      } else {
        throw new Error("Formato no soportado. Usa PDF, Word o TXT.");
      }
      const result = parseSongText(text, file.name);
      setParsed(result);
      setTitle(result.title);
      setArtist(result.artist);
      setKey(result.key);
      setSections(result.sections.length ? result.sections : [
        { id: uid(), type: "verse", name: "Verso 1", lines: [{ lyrics: "", chords: [] }] }
      ]);
      setStep("review");
    } catch (e: any) {
      setError(e.message || "Error al procesar el archivo.");
    } finally {
      setLoading(false);
    }
  }

  async function extractPdfText(file: File): Promise<string> {
    const pdfjsLib = await import("pdfjs-dist");
    // Use local worker served from /public to avoid CDN failures
    pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

    const buffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: buffer });

    // Timeout after 15s so it never hangs indefinitely
    const pdf = await Promise.race([
      loadingTask.promise,
      new Promise<never>((_, reject) =>
        setTimeout(() => { loadingTask.destroy(); reject(new Error("El PDF tardó demasiado. Intenta con un archivo más pequeño o usa el área de texto.")); }, 15000)
      ),
    ]);

    let fullText = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();

      // Group text items by Y coordinate to reconstruct lines
      const byY: Map<number, { x: number; str: string }[]> = new Map();
      for (const item of content.items) {
        if ("str" in item && (item as any).str.trim()) {
          const y = Math.round((item as any).transform[5]);
          const x = Math.round((item as any).transform[4]);
          if (!byY.has(y)) byY.set(y, []);
          byY.get(y)!.push({ x, str: (item as any).str });
        }
      }

      // Sort Y descending (top of page first), X ascending within each line
      const sortedYs = [...byY.keys()].sort((a, b) => b - a);
      for (const y of sortedYs) {
        const items = byY.get(y)!.sort((a, b) => a.x - b.x);
        fullText += items.map((i) => i.str).join(" ").trim() + "\n";
      }
      fullText += "\n";
    }
    return fullText;
  }

  async function extractWordText(file: File): Promise<string> {
    const mammoth = await import("mammoth");
    const buffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer: buffer });
    return result.value;
  }

  function updateSection(sid: string, updates: Partial<Section>) {
    setSections((prev) => prev.map((s) => s.id === sid ? { ...s, ...updates } : s));
  }

  function updateChordInLine(sid: string, li: number, ci: number, chord: string) {
    setSections((prev) => prev.map((s) => {
      if (s.id !== sid) return s;
      const lines = s.lines.map((line, idx) => {
        if (idx !== li) return line;
        const chords = line.chords.map((c, i) => i === ci ? { ...c, chord } : c);
        return { ...line, chords };
      });
      return { ...s, lines };
    }));
  }

  function removeChordFromLine(sid: string, li: number, ci: number) {
    setSections((prev) => prev.map((s) => {
      if (s.id !== sid) return s;
      const lines = s.lines.map((line, idx) => {
        if (idx !== li) return line;
        return { ...line, chords: line.chords.filter((_, i) => i !== ci) };
      });
      return { ...s, lines };
    }));
  }

  function addChordToLine(sid: string, li: number) {
    setSections((prev) => prev.map((s) => {
      if (s.id !== sid) return s;
      const lines = s.lines.map((line, idx) => {
        if (idx !== li) return line;
        return { ...line, chords: [...line.chords, { chord: "G" }] };
      });
      return { ...s, lines };
    }));
  }

  function save() {
    const song: Song = {
      id: uid(),
      title: title.trim() || "Sin título",
      artist: artist.trim(),
      key,
      mode: "major",
      capo: 0,
      tempo: 75,
      timeSignature: "4/4",
      tuning: "standard",
      notation: "american",
      showGuitarTab: false,
      showPianoTab: false,
      sections,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    addSong(song);
    setActiveSong(song.id);
    setStep("done");
  }

  return (
    <div className="fixed inset-0 z-50 bg-zinc-950/95 overflow-y-auto">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-white">Importar canción</h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-white"><X size={22} /></button>
        </div>

        {/* STEP: Upload */}
        {step === "upload" && (
          <div>
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
              onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed border-zinc-700 hover:border-indigo-500 rounded-2xl p-12 text-center cursor-pointer transition-colors group"
            >
              <Upload size={40} className="mx-auto mb-4 text-zinc-600 group-hover:text-indigo-400 transition-colors" />
              <p className="text-zinc-300 font-medium mb-1">Arrastra tu archivo aquí</p>
              <p className="text-zinc-500 text-sm">PDF, Word (.docx) o texto (.txt)</p>
              <input ref={fileRef} type="file" accept=".pdf,.doc,.docx,.txt" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
            </div>
            {loading && <p className="text-center text-indigo-400 mt-6 animate-pulse">Procesando archivo...</p>}
            {error && (
              <div className="mt-4 flex items-center gap-2 text-rose-400 bg-rose-400/10 rounded-lg px-4 py-3">
                <AlertCircle size={16} /> <span className="text-sm">{error}</span>
              </div>
            )}
            <div className="mt-6">
              <p className="text-zinc-600 text-xs text-center mb-3">O pega el texto directamente</p>
              <textarea
                rows={8}
                placeholder={"Coro\nG        Am      F      C\nSanto, Santo, Santo es el Señor\n\nVerso 1\nD        G\nDios Todopoderoso"}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-zinc-200 text-sm font-mono placeholder-zinc-600 focus:outline-none focus:border-indigo-500 resize-none"
                onBlur={(e) => {
                  if (e.target.value.trim()) {
                    const result = parseSongText(e.target.value, "Canción pegada");
                    setParsed(result);
                    setTitle(result.title);
                    setArtist(result.artist);
                    setKey(result.key);
                    setSections(result.sections.length ? result.sections : [
                      { id: uid(), type: "verse", name: "Verso 1", lines: [{ lyrics: "", chords: [] }] }
                    ]);
                    setStep("review");
                  }
                }}
              />
            </div>
          </div>
        )}

        {/* STEP: Review & Edit */}
        {step === "review" && (
          <div className="space-y-5">
            <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-xl px-4 py-3 flex items-center gap-2">
              <FileText size={16} className="text-indigo-400" />
              <span className="text-indigo-300 text-sm">Revisa y corrige antes de guardar</span>
            </div>

            {/* Metadata */}
            <div className="space-y-2">
              <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Título *"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500" />
              <div className="flex gap-2">
                <input value={artist} onChange={(e) => setArtist(e.target.value)} placeholder="Artista"
                  className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-indigo-500" />
                <select value={key} onChange={(e) => setKey(e.target.value)}
                  className="bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none">
                  {ALL_ROOTS.map((r) => <option key={r}>{r}</option>)}
                </select>
              </div>
            </div>

            {/* Sections editor */}
            {sections.map((section) => (
              <div key={section.id} className="bg-zinc-800/50 border border-zinc-700 rounded-xl overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-2 bg-zinc-800 border-b border-zinc-700">
                  <select value={section.type}
                    onChange={(e) => updateSection(section.id, { type: e.target.value as SectionType, name: SECTION_LABELS[e.target.value as SectionType] })}
                    className="bg-zinc-700 rounded-md px-2 py-1 text-white text-xs focus:outline-none">
                    {SECTION_TYPES.map((t) => <option key={t} value={t}>{SECTION_LABELS[t]}</option>)}
                  </select>
                  <input value={section.name} onChange={(e) => updateSection(section.id, { name: e.target.value })}
                    className="flex-1 bg-zinc-700 rounded-md px-2 py-1 text-white text-xs focus:outline-none" />
                </div>
                <div className="p-3 space-y-3">
                  {section.lines.map((line, li) => (
                    <div key={li} className="space-y-1">
                      {/* Chords row */}
                      <div className="flex flex-wrap gap-1 items-center min-h-[24px]">
                        {line.chords.map((cp, ci) => (
                          <div key={ci} className="flex items-center gap-0.5">
                            <input
                              value={cp.chord}
                              onChange={(e) => updateChordInLine(section.id, li, ci, e.target.value)}
                              className="w-14 bg-indigo-900/40 border border-indigo-700/50 rounded px-1.5 py-0.5 text-indigo-300 text-xs font-mono focus:outline-none focus:border-indigo-400"
                            />
                            <button onClick={() => removeChordFromLine(section.id, li, ci)}
                              className="text-zinc-600 hover:text-rose-400 p-0.5">
                              <X size={10} />
                            </button>
                          </div>
                        ))}
                        <button onClick={() => addChordToLine(section.id, li)}
                          className="text-zinc-600 hover:text-indigo-400 p-1">
                          <Plus size={12} />
                        </button>
                      </div>
                      {/* Lyrics */}
                      <input
                        value={line.lyrics}
                        onChange={(e) => {
                          setSections((prev) => prev.map((s) => {
                            if (s.id !== section.id) return s;
                            const lines = s.lines.map((l, i) => i === li ? { ...l, lyrics: e.target.value } : l);
                            return { ...s, lines };
                          }));
                        }}
                        className="w-full bg-transparent text-zinc-200 text-sm focus:outline-none border-b border-transparent focus:border-zinc-600 py-0.5"
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <div className="flex gap-3 pt-2">
              <button onClick={() => setStep("upload")} className="flex-1 border border-zinc-700 text-zinc-400 rounded-xl py-2.5 text-sm hover:text-white transition-colors">
                ← Volver
              </button>
              <button onClick={save} className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl py-2.5 text-sm transition-colors">
                Guardar canción
              </button>
            </div>
          </div>
        )}

        {/* STEP: Done */}
        {step === "done" && (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check size={32} className="text-emerald-400" />
            </div>
            <h3 className="text-white text-xl font-bold mb-2">¡Canción importada!</h3>
            <p className="text-zinc-400 text-sm mb-6">Ya puedes verla en tu biblioteca</p>
            <button onClick={onClose} className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-2.5 rounded-xl font-medium transition-colors">
              Ver canción
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
