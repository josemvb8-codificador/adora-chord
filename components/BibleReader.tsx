"use client";
import { useEffect, useState, useRef } from "react";
import { BIBLE_BOOKS, BIBLE_VERSIONS, fetchChapter, Verse, BibleVersion } from "@/lib/bibleBooks";
import { X, ChevronLeft, ChevronRight, BookOpen, Loader2, Search } from "lucide-react";

interface Props { onClose: () => void; }

export default function BibleReader({ onClose }: Props) {
  const [versionId, setVersionId] = useState("rvr1960");
  const [bookNum, setBookNum]     = useState(19);   // Salmos por defecto
  const [chapter, setChapter]     = useState(23);   // Salmo 23
  const [verses, setVerses]       = useState<Verse[]>([]);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");
  const [showBooks, setShowBooks] = useState(false);
  const [search, setSearch]       = useState("");
  const versesRef = useRef<HTMLDivElement>(null);

  const version   = BIBLE_VERSIONS.find((v) => v.id === versionId)!;
  const book      = BIBLE_BOOKS.find((b) => b.num === bookNum)!;
  const chapters  = Array.from({ length: book.chapters }, (_, i) => i + 1);

  useEffect(() => { loadChapter(); }, [versionId, bookNum, chapter]);

  async function loadChapter() {
    setLoading(true);
    setError("");
    setVerses([]);
    try {
      const data = await fetchChapter(version, bookNum, chapter);
      setVerses(data);
      versesRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e: any) {
      setError(e.message || "No se pudo cargar el capítulo. Intenta otra versión.");
    } finally {
      setLoading(false);
    }
  }

  function goChapter(delta: number) {
    const next = chapter + delta;
    if (next < 1) {
      const prevBook = BIBLE_BOOKS.find((b) => b.num === bookNum - 1);
      if (prevBook) { setBookNum(prevBook.num); setChapter(prevBook.chapters); }
    } else if (next > book.chapters) {
      const nextBook = BIBLE_BOOKS.find((b) => b.num === bookNum + 1);
      if (nextBook) { setBookNum(nextBook.num); setChapter(1); }
    } else {
      setChapter(next);
    }
  }

  function selectBook(num: number) {
    setBookNum(num);
    setChapter(1);
    setShowBooks(false);
    setSearch("");
  }

  const otBooks = BIBLE_BOOKS.filter((b) => b.testament === "OT");
  const ntBooks = BIBLE_BOOKS.filter((b) => b.testament === "NT");
  const filteredBooks = search
    ? BIBLE_BOOKS.filter((b) => b.es.toLowerCase().includes(search.toLowerCase()))
    : null;

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 60,
      backgroundColor: "var(--c-bg)",
      display: "flex", flexDirection: "column",
    }}>
      {/* ── Top bar ── */}
      <div style={{
        display: "flex", alignItems: "center", gap: 12,
        padding: "10px 16px",
        borderBottom: "1px solid var(--c-border)",
        flexShrink: 0,
      }}>
        <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--c-text3)", padding: 4 }}>
          <X size={20} />
        </button>

        <BookOpen size={16} style={{ color: "var(--c-indigo)" }} />
        <span style={{ fontWeight: 700, fontSize: 15, color: "var(--c-text)" }}>Biblia</span>

        <div style={{ flex: 1 }} />

        {/* Version selector */}
        <select
          value={versionId}
          onChange={(e) => setVersionId(e.target.value)}
          style={{
            background: "var(--c-elevated)", border: "1px solid var(--c-border)",
            borderRadius: 8, padding: "4px 10px", fontSize: 12,
            color: "var(--c-text)", cursor: "pointer", outline: "none",
          }}
        >
          <optgroup label="Español">
            {BIBLE_VERSIONS.filter((v) => v.lang === "es").map((v) => (
              <option key={v.id} value={v.id}>{v.label}</option>
            ))}
          </optgroup>
          <optgroup label="English">
            {BIBLE_VERSIONS.filter((v) => v.lang === "en").map((v) => (
              <option key={v.id} value={v.id}>{v.label}</option>
            ))}
          </optgroup>
        </select>
      </div>

      {/* ── Navigation bar ── */}
      <div style={{
        display: "flex", alignItems: "center", gap: 8,
        padding: "8px 16px",
        borderBottom: "1px solid var(--c-border)",
        background: "var(--c-surface)",
        flexShrink: 0, flexWrap: "wrap",
      }}>
        {/* Book button */}
        <button
          onClick={() => setShowBooks(!showBooks)}
          style={{
            background: showBooks ? "var(--c-indigo)" : "var(--c-elevated)",
            border: "1px solid var(--c-border)", borderRadius: 8,
            padding: "5px 12px", cursor: "pointer",
            color: showBooks ? "#fff" : "var(--c-text)", fontSize: 13, fontWeight: 600,
          }}
        >
          {book.es}
        </button>

        {/* Chapter selector */}
        <select
          value={chapter}
          onChange={(e) => setChapter(Number(e.target.value))}
          style={{
            background: "var(--c-elevated)", border: "1px solid var(--c-border)",
            borderRadius: 8, padding: "5px 10px", fontSize: 13,
            color: "var(--c-text)", cursor: "pointer", outline: "none",
          }}
        >
          {chapters.map((c) => (
            <option key={c} value={c}>Capítulo {c}</option>
          ))}
        </select>

        <div style={{ flex: 1 }} />

        {/* Prev / Next chapter */}
        <button onClick={() => goChapter(-1)} style={{ background: "none", border: "1px solid var(--c-border)", borderRadius: 8, padding: "5px 8px", cursor: "pointer", color: "var(--c-text2)" }}>
          <ChevronLeft size={16} />
        </button>
        <button onClick={() => goChapter(1)} style={{ background: "none", border: "1px solid var(--c-border)", borderRadius: 8, padding: "5px 8px", cursor: "pointer", color: "var(--c-text2)" }}>
          <ChevronRight size={16} />
        </button>
      </div>

      {/* ── Body ── */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>

        {/* Book selector panel */}
        {showBooks && (
          <div style={{
            width: 220, flexShrink: 0, borderRight: "1px solid var(--c-border)",
            display: "flex", flexDirection: "column",
            background: "var(--c-surface)", overflowY: "auto",
          }}>
            {/* Search */}
            <div style={{ padding: "10px 12px", borderBottom: "1px solid var(--c-border)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--c-elevated)", borderRadius: 8, padding: "6px 10px" }}>
                <Search size={12} style={{ color: "var(--c-text3)", flexShrink: 0 }} />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar libro…"
                  style={{ background: "none", border: "none", outline: "none", fontSize: 12, color: "var(--c-text)", width: "100%" }}
                />
              </div>
            </div>

            {/* Book list */}
            <div style={{ overflowY: "auto", flex: 1 }}>
              {(filteredBooks ?? []).map((b) => (
                <button key={b.num} onClick={() => selectBook(b.num)}
                  style={{
                    width: "100%", textAlign: "left", padding: "7px 14px",
                    background: b.num === bookNum ? "var(--c-indigo-bg)" : "none",
                    border: "none", cursor: "pointer",
                    color: b.num === bookNum ? "var(--c-indigo2)" : "var(--c-text2)",
                    fontSize: 13,
                  }}>
                  {b.es}
                </button>
              ))}

              {!filteredBooks && (
                <>
                  <p style={{ padding: "8px 14px 4px", fontSize: 10, fontWeight: 700, color: "var(--c-text4)", letterSpacing: "0.1em", textTransform: "uppercase" }}>Antiguo Testamento</p>
                  {otBooks.map((b) => (
                    <button key={b.num} onClick={() => selectBook(b.num)}
                      style={{
                        width: "100%", textAlign: "left", padding: "7px 14px",
                        background: b.num === bookNum ? "var(--c-indigo-bg)" : "none",
                        border: "none", cursor: "pointer",
                        color: b.num === bookNum ? "var(--c-indigo2)" : "var(--c-text2)",
                        fontSize: 13,
                      }}>
                      {b.es}
                    </button>
                  ))}
                  <p style={{ padding: "8px 14px 4px", fontSize: 10, fontWeight: 700, color: "var(--c-text4)", letterSpacing: "0.1em", textTransform: "uppercase" }}>Nuevo Testamento</p>
                  {ntBooks.map((b) => (
                    <button key={b.num} onClick={() => selectBook(b.num)}
                      style={{
                        width: "100%", textAlign: "left", padding: "7px 14px",
                        background: b.num === bookNum ? "var(--c-indigo-bg)" : "none",
                        border: "none", cursor: "pointer",
                        color: b.num === bookNum ? "var(--c-indigo2)" : "var(--c-text2)",
                        fontSize: 13,
                      }}>
                      {b.es}
                    </button>
                  ))}
                </>
              )}
            </div>
          </div>
        )}

        {/* Verses */}
        <div ref={versesRef} style={{ flex: 1, overflowY: "auto", padding: "20px 16px" }}>
          <div style={{ maxWidth: 680, margin: "0 auto" }}>
            {/* Chapter heading */}
            <h2 style={{ fontSize: 22, fontWeight: 700, color: "var(--c-text)", marginBottom: 20 }}>
              {book.es} {chapter}
              <span style={{ fontSize: 12, fontWeight: 400, color: "var(--c-text4)", marginLeft: 10 }}>
                {version.label}
              </span>
            </h2>

            {/* Loading */}
            {loading && (
              <div style={{ display: "flex", alignItems: "center", gap: 10, color: "var(--c-text3)", padding: "20px 0" }}>
                <Loader2 size={16} className="animate-spin" />
                <span style={{ fontSize: 14 }}>Cargando {book.es} {chapter}…</span>
              </div>
            )}

            {/* Error */}
            {error && !loading && (
              <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 10, padding: "12px 16px", color: "#fca5a5", fontSize: 13 }}>
                {error}
              </div>
            )}

            {/* Verses */}
            {!loading && !error && verses.map((v) => (
              <div key={v.num} style={{ display: "flex", gap: 12, marginBottom: 14, lineHeight: 1.7 }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: "var(--c-indigo)", minWidth: 22, paddingTop: 4, flexShrink: 0, textAlign: "right" }}>
                  {v.num}
                </span>
                <p style={{ fontSize: 15, color: "var(--c-text)", margin: 0 }}>
                  {v.text}
                </p>
              </div>
            ))}

            {/* Bottom nav */}
            {!loading && verses.length > 0 && (
              <div style={{ display: "flex", gap: 12, marginTop: 32, paddingTop: 20, borderTop: "1px solid var(--c-border)" }}>
                <button onClick={() => goChapter(-1)}
                  style={{ flex: 1, padding: "10px", borderRadius: 10, background: "var(--c-elevated)", border: "1px solid var(--c-border)", cursor: "pointer", color: "var(--c-text2)", fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                  <ChevronLeft size={15} /> Capítulo anterior
                </button>
                <button onClick={() => goChapter(1)}
                  style={{ flex: 1, padding: "10px", borderRadius: 10, background: "var(--c-elevated)", border: "1px solid var(--c-border)", cursor: "pointer", color: "var(--c-text2)", fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                  Siguiente capítulo <ChevronRight size={15} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
