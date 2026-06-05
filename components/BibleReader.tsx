"use client";
import { useEffect, useRef, useState } from "react";
import { X, ChevronLeft, ChevronRight, BookOpen, Loader2, Search } from "lucide-react";

// ── Bible data (self-contained) ─────────────────────────────────
const OT = [
  ["Génesis",1,50],["Éxodo",2,40],["Levítico",3,27],["Números",4,36],
  ["Deuteronomio",5,34],["Josué",6,24],["Jueces",7,21],["Rut",8,4],
  ["1 Samuel",9,31],["2 Samuel",10,24],["1 Reyes",11,22],["2 Reyes",12,25],
  ["1 Crónicas",13,29],["2 Crónicas",14,36],["Esdras",15,10],["Nehemías",16,13],
  ["Ester",17,10],["Job",18,42],["Salmos",19,150],["Proverbios",20,31],
  ["Eclesiastés",21,12],["Cantares",22,8],["Isaías",23,66],["Jeremías",24,52],
  ["Lamentaciones",25,5],["Ezequiel",26,48],["Daniel",27,12],["Oseas",28,14],
  ["Joel",29,3],["Amós",30,9],["Abdías",31,1],["Jonás",32,4],
  ["Miqueas",33,7],["Nahúm",34,3],["Habacuc",35,3],["Sofonías",36,3],
  ["Hageo",37,2],["Zacarías",38,14],["Malaquías",39,4],
] as [string,number,number][];

const NT = [
  ["Mateo",40,28],["Marcos",41,16],["Lucas",42,24],["Juan",43,21],
  ["Hechos",44,28],["Romanos",45,16],["1 Corintios",46,16],["2 Corintios",47,13],
  ["Gálatas",48,6],["Efesios",49,6],["Filipenses",50,4],["Colosenses",51,4],
  ["1 Tesalonicenses",52,5],["2 Tesalonicenses",53,3],["1 Timoteo",54,6],
  ["2 Timoteo",55,4],["Tito",56,3],["Filemón",57,1],["Hebreos",58,13],
  ["Santiago",59,5],["1 Pedro",60,5],["2 Pedro",61,3],["1 Juan",62,5],
  ["2 Juan",63,1],["3 Juan",64,1],["Judas",65,1],["Apocalipsis",66,22],
] as [string,number,number][];

const ALL_BOOKS = [...OT, ...NT];

const VERSIONS = [
  { id: "valera",       label: "RV 1909",          lang: "es" },
  { id: "sse",          label: "Sagradas Escrituras 1569", lang: "es" },
  { id: "rv1858",       label: "RV 1858 (NT)",       lang: "es" },
  { id: "kjv",          label: "KJV",                lang: "en" },
  { id: "akjv",         label: "American KJV",       lang: "en" },
  { id: "asv",          label: "ASV 1901",           lang: "en" },
  { id: "web",          label: "WEB",                lang: "en" },
  { id: "basicenglish", label: "Basic English",      lang: "en" },
  { id: "ylt",          label: "Young's Literal",    lang: "en" },
  { id: "douayrheims",  label: "Douay-Rheims",       lang: "en" },
];

interface Verse { num: number; text: string; }
interface Props { onClose: () => void; }

export default function BibleReader({ onClose }: Props) {
  const [versionId, setVersionId] = useState("valera");
  const [bookIdx,   setBookIdx]   = useState(18);   // Salmos (índice en ALL_BOOKS)
  const [chapter,   setChapter]   = useState(23);
  const [verses,    setVerses]    = useState<Verse[]>([]);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState("");
  const [showBooks, setShowBooks] = useState(false);
  const [search,    setSearch]    = useState("");
  const bodyRef = useRef<HTMLDivElement>(null);

  const book    = ALL_BOOKS[bookIdx];
  const bookNum = book[1];
  const bookEs  = book[0];
  const maxCh   = book[2];

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError("");
      setVerses([]);
      try {
        const url = `https://api.getbible.net/v2/${versionId}/${bookNum}/${chapter}.json`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Error ${res.status}`);
        const data = await res.json();
        if (!cancelled) {
          const arr: Verse[] = (data.verses as any[])
            .sort((a, b) => a.verse - b.verse)
            .map((v) => ({ num: v.verse as number, text: (v.text as string).trim() }));
          setVerses(arr);
          bodyRef.current?.scrollTo({ top: 0, behavior: "smooth" });
        }
      } catch (e: any) {
        if (!cancelled) setError(e?.message ?? "No se pudo cargar. Verifica tu conexión.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [versionId, bookNum, chapter]);

  function pickBook(idx: number) {
    setBookIdx(idx);
    setChapter(1);
    setShowBooks(false);
    setSearch("");
  }

  function goChapter(delta: number) {
    const next = chapter + delta;
    if (next < 1) {
      const prev = bookIdx - 1;
      if (prev >= 0) { setBookIdx(prev); setChapter(ALL_BOOKS[prev][2]); }
    } else if (next > maxCh) {
      const nxt = bookIdx + 1;
      if (nxt < ALL_BOOKS.length) { setBookIdx(nxt); setChapter(1); }
    } else {
      setChapter(next);
    }
  }

  const filtered = search
    ? ALL_BOOKS.map((b, i) => [b, i] as [[string,number,number], number])
        .filter(([b]) => b[0].toLowerCase().includes(search.toLowerCase()))
    : null;

  const ver = VERSIONS.find((v) => v.id === versionId);

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 60,
      backgroundColor: "var(--c-bg)",
      display: "flex", flexDirection: "column",
      fontFamily: "inherit",
    }}>

      {/* ── Top bar ── */}
      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "10px 14px", borderBottom: "1px solid var(--c-border)",
        flexShrink: 0, background: "var(--c-surface)",
      }}>
        <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--c-text3)", padding: 4, display: "flex" }}>
          <X size={20} />
        </button>
        <BookOpen size={15} style={{ color: "var(--c-indigo)" }} />
        <span style={{ fontWeight: 700, fontSize: 15, color: "var(--c-text)", flex: 1 }}>Biblia</span>

        <select
          value={versionId}
          onChange={(e) => setVersionId(e.target.value)}
          style={{
            background: "var(--c-elevated)", border: "1px solid var(--c-border)",
            borderRadius: 8, padding: "4px 8px", fontSize: 12,
            color: "var(--c-text)", cursor: "pointer", outline: "none",
          }}
        >
          <optgroup label="Español">
            {VERSIONS.filter(v => v.lang === "es").map(v => <option key={v.id} value={v.id}>{v.label}</option>)}
          </optgroup>
          <optgroup label="English">
            {VERSIONS.filter(v => v.lang === "en").map(v => <option key={v.id} value={v.id}>{v.label}</option>)}
          </optgroup>
        </select>
      </div>

      {/* ── Nav bar ── */}
      <div style={{
        display: "flex", alignItems: "center", gap: 8,
        padding: "8px 14px", borderBottom: "1px solid var(--c-border)",
        background: "var(--c-surface)", flexShrink: 0, flexWrap: "wrap",
      }}>
        <button
          onClick={() => setShowBooks(v => !v)}
          style={{
            background: showBooks ? "var(--c-indigo)" : "var(--c-elevated)",
            border: "1px solid var(--c-border)", borderRadius: 8,
            padding: "5px 12px", cursor: "pointer",
            color: showBooks ? "#fff" : "var(--c-text)",
            fontSize: 13, fontWeight: 600,
          }}
        >
          {bookEs}
        </button>

        <select
          value={chapter}
          onChange={(e) => setChapter(Number(e.target.value))}
          style={{
            background: "var(--c-elevated)", border: "1px solid var(--c-border)",
            borderRadius: 8, padding: "5px 8px", fontSize: 13,
            color: "var(--c-text)", cursor: "pointer", outline: "none",
          }}
        >
          {Array.from({ length: maxCh }, (_, i) => i + 1).map(c =>
            <option key={c} value={c}>Cap. {c}</option>
          )}
        </select>

        <div style={{ flex: 1 }} />

        <button onClick={() => goChapter(-1)} style={{ background: "none", border: "1px solid var(--c-border)", borderRadius: 8, padding: "5px 8px", cursor: "pointer", color: "var(--c-text2)", display: "flex" }}>
          <ChevronLeft size={16} />
        </button>
        <button onClick={() => goChapter(1)} style={{ background: "none", border: "1px solid var(--c-border)", borderRadius: 8, padding: "5px 8px", cursor: "pointer", color: "var(--c-text2)", display: "flex" }}>
          <ChevronRight size={16} />
        </button>
      </div>

      {/* ── Body ── */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>

        {/* Book panel */}
        {showBooks && (
          <div style={{
            width: 210, flexShrink: 0,
            borderRight: "1px solid var(--c-border)",
            display: "flex", flexDirection: "column",
            background: "var(--c-surface)", overflowY: "auto",
          }}>
            <div style={{ padding: "8px 10px", borderBottom: "1px solid var(--c-border)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, background: "var(--c-elevated)", borderRadius: 8, padding: "5px 10px" }}>
                <Search size={12} style={{ color: "var(--c-text3)" }} />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Buscar libro…"
                  style={{ background: "none", border: "none", outline: "none", fontSize: 12, color: "var(--c-text)", width: "100%" }}
                />
              </div>
            </div>
            <div style={{ overflowY: "auto", flex: 1 }}>
              {(filtered
                ? filtered.map(([b, i]) => ({ name: b[0], idx: i }))
                : [
                    { name: "── Antiguo Testamento ──", idx: -1 },
                    ...OT.map((b, i) => ({ name: b[0], idx: i })),
                    { name: "── Nuevo Testamento ──", idx: -1 },
                    ...NT.map((b, i) => ({ name: b[0], idx: OT.length + i })),
                  ]
              ).map((item, key) =>
                item.idx === -1
                  ? <p key={key} style={{ padding: "6px 12px 2px", fontSize: 9, fontWeight: 700, color: "var(--c-text4)", letterSpacing: "0.1em", textTransform: "uppercase" }}>{item.name}</p>
                  : <button
                      key={key}
                      onClick={() => pickBook(item.idx)}
                      style={{
                        width: "100%", textAlign: "left", padding: "7px 12px",
                        background: item.idx === bookIdx ? "var(--c-indigo-bg)" : "none",
                        border: "none", cursor: "pointer",
                        color: item.idx === bookIdx ? "var(--c-indigo2)" : "var(--c-text2)",
                        fontSize: 13,
                      }}
                    >
                      {item.name}
                    </button>
              )}
            </div>
          </div>
        )}

        {/* Verses */}
        <div ref={bodyRef} style={{ flex: 1, overflowY: "auto", padding: "20px 16px" }}>
          <div style={{ maxWidth: 680, margin: "0 auto" }}>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: "var(--c-text)", marginBottom: 20 }}>
              {bookEs} {chapter}
              <span style={{ fontSize: 12, fontWeight: 400, color: "var(--c-text4)", marginLeft: 10 }}>
                {ver?.label}
              </span>
            </h2>

            {loading && (
              <div style={{ display: "flex", alignItems: "center", gap: 10, color: "var(--c-text3)", padding: "20px 0" }}>
                <Loader2 size={16} className="animate-spin" />
                <span style={{ fontSize: 14 }}>Cargando {bookEs} {chapter}…</span>
              </div>
            )}

            {error && !loading && (
              <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 10, padding: "12px 16px", color: "#fca5a5", fontSize: 13, marginBottom: 16 }}>
                ⚠ {error}
              </div>
            )}

            {!loading && verses.map(v => (
              <div key={v.num} style={{ display: "flex", gap: 12, marginBottom: 14, lineHeight: 1.75 }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: "var(--c-indigo)", minWidth: 20, paddingTop: 4, flexShrink: 0, textAlign: "right" }}>{v.num}</span>
                <p style={{ fontSize: 15, color: "var(--c-text)", margin: 0 }}>{v.text}</p>
              </div>
            ))}

            {!loading && verses.length > 0 && (
              <div style={{ display: "flex", gap: 10, marginTop: 32, paddingTop: 20, borderTop: "1px solid var(--c-border)" }}>
                <button onClick={() => goChapter(-1)} style={{ flex: 1, padding: 10, borderRadius: 10, background: "var(--c-elevated)", border: "1px solid var(--c-border)", cursor: "pointer", color: "var(--c-text2)", fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                  <ChevronLeft size={14} /> Capítulo anterior
                </button>
                <button onClick={() => goChapter(1)} style={{ flex: 1, padding: 10, borderRadius: 10, background: "var(--c-elevated)", border: "1px solid var(--c-border)", cursor: "pointer", color: "var(--c-text2)", fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                  Siguiente capítulo <ChevronRight size={14} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
