"use client";
import { useRef, useState } from "react";
import { parseSongText, ParsedSong } from "@/lib/songParser";
import { useSongsStore } from "@/store/songs";
import { useAuthStore } from "@/store/auth";
import { Song, Section, SectionType } from "@/types";
import { Upload, FileText, X, Check, AlertCircle, Plus, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { ALL_ROOTS } from "@/lib/chords";

function uid() { return crypto.randomUUID(); }

const SECTION_TYPES: SectionType[] = ["intro", "verse", "prechorus", "chorus", "bridge", "interlude", "solo", "outro"];
const SECTION_LABELS: Record<SectionType, string> = {
  intro: "Intro", verse: "Verso", prechorus: "Pre-Coro", chorus: "Coro",
  bridge: "Puente", interlude: "Interludio", solo: "Solo", outro: "Final",
};

interface Props { onClose: () => void; }

type Step = "upload" | "review" | "batch" | "done";

interface BatchItem {
  file: File;
  status: "pending" | "processing" | "done" | "error";
  error?: string;
  title?: string;
}

export default function ImportSong({ onClose }: Props) {
  const { addSong, setActiveSong } = useSongsStore();
  const { user } = useAuthStore();
  const fileRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<Step>("upload");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [parsed, setParsed] = useState<ParsedSong | null>(null);

  // single-file edit fields
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [key, setKey] = useState("G");
  const [sections, setSections] = useState<Section[]>([]);

  // batch state
  const [batchItems, setBatchItems] = useState<BatchItem[]>([]);
  const [batchDone, setBatchDone] = useState(0);
  const [batchTotal, setBatchTotal] = useState(0);

  // ── File handling ──────────────────────────────────────────────

  async function handleFiles(files: File[]) {
    const valid = files.filter((f) => f.name.match(/\.(pdf|docx?|txt)$/i));
    if (!valid.length) {
      setError("Sube archivos PDF, Word (.docx) o TXT.");
      return;
    }

    if (valid.length === 1) {
      // single: review flow
      await processSingle(valid[0]);
    } else {
      // batch: auto-import all
      await processBatch(valid);
    }
  }

  async function processSingle(file: File) {
    setLoading(true);
    setError("");
    try {
      const text = await extractFileText(file);
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

  async function processBatch(files: File[]) {
    if (!user?.id) { setError("Debes iniciar sesión para importar canciones."); return; }
    const items: BatchItem[] = files.map((f) => ({ file: f, status: "pending" }));
    setBatchItems(items);
    setBatchTotal(files.length);
    setBatchDone(0);
    setStep("batch");

    let done = 0;
    for (let i = 0; i < files.length; i++) {
      setBatchItems((prev) => prev.map((it, idx) => idx === i ? { ...it, status: "processing" } : it));
      try {
        const text = await extractFileText(files[i]);
        const result = parseSongText(text, files[i].name);
        const song: Song = {
          id: uid(),
          title: result.title || files[i].name.replace(/\.[^.]+$/, ""),
          artist: result.artist,
          key: result.key || "G",
          mode: "major",
          capo: 0,
          tempo: 75,
          timeSignature: "4/4",
          tuning: "standard",
          notation: "american",
          showGuitarTab: false,
          showPianoTab: false,
          sections: result.sections.length ? result.sections : [
            { id: uid(), type: "verse", name: "Verso 1", lines: [{ lyrics: "", chords: [] }] }
          ],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        await addSong(song, user.id);
        done++;
        setBatchDone(done);
        setBatchItems((prev) => prev.map((it, idx) =>
          idx === i ? { ...it, status: "done", title: song.title } : it
        ));
      } catch (e: any) {
        setBatchItems((prev) => prev.map((it, idx) =>
          idx === i ? { ...it, status: "error", error: e.message || "Error" } : it
        ));
      }
    }
    setStep("done");
  }

  async function extractFileText(file: File): Promise<string> {
    const form = new FormData();
    form.append("file", file);
    const res = await Promise.race([
      fetch("/api/parse-pdf", { method: "POST", body: form }),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("El archivo tardó demasiado.")), 25000)
      ),
    ]);
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "Error desconocido" }));
      throw new Error(err.error || "Error procesando el archivo");
    }
    const { text } = await res.json();
    return text;
  }

  // ── Single review helpers ──────────────────────────────────────

  function updateSection(sid: string, updates: Partial<Section>) {
    setSections((prev) => prev.map((s) => s.id === sid ? { ...s, ...updates } : s));
  }
  function updateChordInLine(sid: string, li: number, ci: number, chord: string) {
    setSections((prev) => prev.map((s) => {
      if (s.id !== sid) return s;
      return { ...s, lines: s.lines.map((line, idx) => idx !== li ? line : { ...line, chords: line.chords.map((c, i) => i === ci ? { ...c, chord } : c) }) };
    }));
  }
  function removeChordFromLine(sid: string, li: number, ci: number) {
    setSections((prev) => prev.map((s) => {
      if (s.id !== sid) return s;
      return { ...s, lines: s.lines.map((line, idx) => idx !== li ? line : { ...line, chords: line.chords.filter((_, i) => i !== ci) }) };
    }));
  }
  function addChordToLine(sid: string, li: number) {
    setSections((prev) => prev.map((s) => {
      if (s.id !== sid) return s;
      return { ...s, lines: s.lines.map((line, idx) => idx !== li ? line : { ...line, chords: [...line.chords, { chord: "G" }] }) };
    }));
  }

  async function save() {
    if (!user?.id) { setSaveError("Debes iniciar sesión."); return; }
    setSaveError(""); setSaving(true);
    try {
      const song: Song = {
        id: uid(), title: title.trim() || "Sin título", artist: artist.trim(), key,
        mode: "major", capo: 0, tempo: 75, timeSignature: "4/4", tuning: "standard",
        notation: "american", showGuitarTab: false, showPianoTab: false, sections,
        createdAt: Date.now(), updatedAt: Date.now(),
      };
      await addSong(song, user.id);
      setActiveSong(song.id);
      setStep("done");
    } catch (e: any) {
      setSaveError(e.message || "No se pudo guardar.");
    } finally {
      setSaving(false);
    }
  }

  // ── Progress bar % ─────────────────────────────────────────────
  const progress = batchTotal > 0 ? Math.round((batchDone / batchTotal) * 100) : 0;
  const batchErrors = batchItems.filter((i) => i.status === "error").length;

  return (
    <div className="fixed inset-0 z-50 bg-zinc-950/95 overflow-y-auto">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-white">
            {step === "batch" ? "Importando canciones…" : "Importar canción"}
          </h2>
          {step !== "batch" && (
            <button onClick={onClose} className="text-zinc-500 hover:text-white"><X size={22} /></button>
          )}
        </div>

        {/* ── STEP: Upload ── */}
        {step === "upload" && (
          <div>
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => { e.preventDefault(); handleFiles(Array.from(e.dataTransfer.files)); }}
              onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed border-zinc-700 hover:border-indigo-500 rounded-2xl p-12 text-center cursor-pointer transition-colors group"
            >
              <Upload size={40} className="mx-auto mb-4 text-zinc-600 group-hover:text-indigo-400 transition-colors" />
              <p className="text-zinc-300 font-medium mb-1">Arrastra tus archivos aquí</p>
              <p className="text-zinc-500 text-sm mb-1">PDF, Word (.docx) o texto (.txt)</p>
              <p className="text-indigo-400 text-xs font-medium">Puedes seleccionar varios archivos a la vez</p>
              <input
                ref={fileRef} type="file" multiple
                accept=".pdf,.doc,.docx,.txt" className="hidden"
                onChange={(e) => { if (e.target.files?.length) handleFiles(Array.from(e.target.files)); }}
              />
            </div>

            {loading && <p className="text-center text-indigo-400 mt-6 animate-pulse">Procesando archivo…</p>}
            {error && (
              <div className="mt-4 flex items-center gap-2 text-rose-400 bg-rose-400/10 rounded-lg px-4 py-3">
                <AlertCircle size={16} /><span className="text-sm">{error}</span>
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
                    setParsed(result); setTitle(result.title); setArtist(result.artist); setKey(result.key);
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

        {/* ── STEP: Batch processing ── */}
        {step === "batch" && (
          <div className="space-y-5">
            {/* Progress bar */}
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-zinc-400">{batchDone} de {batchTotal} canciones</span>
                <span className="text-indigo-400 font-medium">{progress}%</span>
              </div>
              <div className="w-full bg-zinc-800 rounded-full h-2.5">
                <div
                  className="bg-indigo-500 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* File list */}
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {batchItems.map((item, i) => (
                <div key={i} className="flex items-center gap-3 bg-zinc-800/60 rounded-xl px-4 py-3">
                  <div className="flex-shrink-0">
                    {item.status === "pending"    && <div className="w-4 h-4 rounded-full border-2 border-zinc-600" />}
                    {item.status === "processing" && <Loader2 size={16} className="text-indigo-400 animate-spin" />}
                    {item.status === "done"       && <CheckCircle2 size={16} className="text-emerald-400" />}
                    {item.status === "error"      && <XCircle size={16} className="text-rose-400" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-zinc-200 text-sm truncate font-medium">
                      {item.title || item.file.name.replace(/\.[^.]+$/, "")}
                    </p>
                    {item.status === "error" && (
                      <p className="text-rose-400 text-xs truncate">{item.error}</p>
                    )}
                    {item.status === "processing" && (
                      <p className="text-indigo-400 text-xs">Procesando…</p>
                    )}
                  </div>
                  <span className="text-zinc-600 text-xs flex-shrink-0">
                    {(item.file.size / 1024).toFixed(0)} KB
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── STEP: Review (single file) ── */}
        {step === "review" && (
          <div className="space-y-5">
            <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-xl px-4 py-3 flex items-center gap-2">
              <FileText size={16} className="text-indigo-400" />
              <span className="text-indigo-300 text-sm">Revisa y corrige antes de guardar</span>
            </div>
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
                      <div className="flex flex-wrap gap-1 items-center min-h-[24px]">
                        {line.chords.map((cp, ci) => (
                          <div key={ci} className="flex items-center gap-0.5">
                            <input value={cp.chord} onChange={(e) => updateChordInLine(section.id, li, ci, e.target.value)}
                              style={{ width: `${Math.max(2, cp.chord.length) * 8 + 12}px` }}
                              className="bg-indigo-900/40 border border-indigo-700/50 rounded px-1 py-0.5 text-indigo-300 text-xs font-mono focus:outline-none focus:border-indigo-400 min-w-0" />
                            <button onClick={() => removeChordFromLine(section.id, li, ci)} className="text-zinc-600 hover:text-rose-400 p-0.5"><X size={10} /></button>
                          </div>
                        ))}
                        <button onClick={() => addChordToLine(section.id, li)} className="text-zinc-600 hover:text-indigo-400 p-1"><Plus size={12} /></button>
                      </div>
                      <input value={line.lyrics}
                        onChange={(e) => setSections((prev) => prev.map((s) => s.id !== section.id ? s : { ...s, lines: s.lines.map((l, i) => i === li ? { ...l, lyrics: e.target.value } : l) }))}
                        className="w-full bg-transparent text-zinc-200 text-sm focus:outline-none border-b border-transparent focus:border-zinc-600 py-0.5" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
            {saveError && (
              <div className="flex items-center gap-2 text-rose-400 bg-rose-400/10 rounded-lg px-4 py-3 text-sm">
                <AlertCircle size={14} /> {saveError}
              </div>
            )}
            <div className="flex gap-3 pt-2">
              <button onClick={() => setStep("upload")} className="flex-1 border border-zinc-700 text-zinc-400 rounded-xl py-2.5 text-sm hover:text-white transition-colors">← Volver</button>
              <button onClick={save} disabled={saving} className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold rounded-xl py-2.5 text-sm transition-colors">
                {saving ? "Guardando…" : "Guardar canción"}
              </button>
            </div>
          </div>
        )}

        {/* ── STEP: Done ── */}
        {step === "done" && (
          <div className="text-center py-12">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${batchErrors > 0 ? "bg-amber-500/20" : "bg-emerald-500/20"}`}>
              <Check size={32} className={batchErrors > 0 ? "text-amber-400" : "text-emerald-400"} />
            </div>

            {batchTotal > 1 ? (
              <>
                <h3 className="text-white text-xl font-bold mb-1">
                  {batchDone} {batchDone === 1 ? "canción importada" : "canciones importadas"}
                </h3>
                {batchErrors > 0 && (
                  <p className="text-amber-400 text-sm mb-2">{batchErrors} archivo{batchErrors > 1 ? "s" : ""} con error</p>
                )}
                <p className="text-zinc-400 text-sm mb-6">Ya puedes verlas en tu biblioteca</p>
              </>
            ) : (
              <>
                <h3 className="text-white text-xl font-bold mb-2">¡Canción importada!</h3>
                <p className="text-zinc-400 text-sm mb-6">Ya puedes verla en tu biblioteca</p>
              </>
            )}

            <button onClick={onClose} className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-2.5 rounded-xl font-medium transition-colors">
              Ver biblioteca
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
