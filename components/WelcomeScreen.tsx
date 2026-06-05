"use client";
import { useState, useMemo } from "react";
import AdoraLogo from "./AdoraLogo";
import DailyVerse from "./DailyVerse";
import { useSongsStore } from "@/store/songs";
import { BookOpen, Search, Music2, X } from "lucide-react";

interface Props { onOpenBible: () => void; }

export default function WelcomeScreen({ onOpenBible }: Props) {
  const { songs, setActiveSong } = useSongsStore();
  const [query, setQuery] = useState("");

  // Búsqueda inteligente: título, artista, tonalidad, acordes dentro de las secciones
  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase().trim();
    return songs
      .map((s) => {
        let score = 0;
        const title  = s.title.toLowerCase();
        const artist = s.artist?.toLowerCase() ?? "";
        const key    = s.key.toLowerCase();

        if (title.startsWith(q))          score += 10;
        else if (title.includes(q))        score += 7;
        if (artist.includes(q))            score += 5;
        if (key === q || key.startsWith(q)) score += 4;

        // Buscar en letras
        const lyricMatch = s.sections.some((sec) =>
          sec.lines.some((line) => line.lyrics.toLowerCase().includes(q))
        );
        if (lyricMatch) score += 2;

        // Buscar acordes
        const chordMatch = s.sections.some((sec) =>
          sec.lines.some((line) =>
            line.chords.some((c) => c.chord.toLowerCase().includes(q))
          )
        );
        if (chordMatch) score += 1;

        return { song: s, score };
      })
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8)
      .map((r) => r.song);
  }, [query, songs]);

  function openSong(id: string) {
    setActiveSong(id);
    setQuery("");
  }

  return (
    <div style={{
      flex: 1, display: "flex", flexDirection: "column",
      alignItems: "center", padding: "28px 20px",
      minHeight: 0, overflowY: "auto",
    }}>
      {/* Logo */}
      <AdoraLogo size={160} showText className="mx-auto" />

      {/* Tagline */}
      <p style={{ fontSize: 22, fontWeight: 700, color: "var(--c-text)", marginTop: 4, marginBottom: 4, letterSpacing: "-0.01em", textAlign: "center" }}>
        Listo para Adorar
      </p>
      <p style={{ fontSize: 13, color: "var(--c-text3)", marginBottom: 24, textAlign: "center" }}>
        {songs.length > 0
          ? `Tienes ${songs.length} canción${songs.length !== 1 ? "es" : ""} en tu biblioteca`
          : "Importa o crea tu primera canción"}
      </p>

      {/* ── Buscador inteligente ── */}
      <div style={{ width: "100%", maxWidth: 520, marginBottom: 20, position: "relative" }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          background: "var(--c-elevated)", border: "1px solid var(--c-border)",
          borderRadius: 14, padding: "10px 16px",
          boxShadow: query ? "0 0 0 2px var(--c-indigo)" : "none",
          transition: "box-shadow 0.15s",
        }}>
          <Search size={16} style={{ color: "var(--c-text3)", flexShrink: 0 }} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por título, artista, tonalidad o letra…"
            style={{
              flex: 1, background: "none", border: "none", outline: "none",
              fontSize: 14, color: "var(--c-text)",
            }}
          />
          {query && (
            <button onClick={() => setQuery("")} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--c-text4)", padding: 2 }}>
              <X size={14} />
            </button>
          )}
        </div>

        {/* Resultados */}
        {query && (
          <div style={{
            position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0, zIndex: 20,
            background: "var(--c-surface)", border: "1px solid var(--c-border)",
            borderRadius: 14, overflow: "hidden",
            boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
          }}>
            {results.length === 0 ? (
              <p style={{ fontSize: 13, color: "var(--c-text4)", padding: "14px 16px", textAlign: "center" }}>
                Sin resultados para "{query}"
              </p>
            ) : (
              results.map((s) => (
                <button
                  key={s.id}
                  onClick={() => openSong(s.id)}
                  style={{
                    width: "100%", textAlign: "left", padding: "10px 16px",
                    background: "none", border: "none", cursor: "pointer",
                    borderBottom: "1px solid var(--c-border)",
                    display: "flex", alignItems: "center", gap: 12,
                    transition: "background 0.1s",
                  }}
                  onMouseOver={(e) => { e.currentTarget.style.background = "var(--c-elevated)"; }}
                  onMouseOut={(e)  => { e.currentTarget.style.background = "none"; }}
                >
                  <Music2 size={14} style={{ color: "var(--c-indigo)", flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: "var(--c-text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {s.title}
                    </p>
                    {s.artist && (
                      <p style={{ fontSize: 11, color: "var(--c-text3)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {s.artist}
                      </p>
                    )}
                  </div>
                  <span style={{ fontSize: 11, color: "var(--c-text4)", flexShrink: 0 }}>
                    {s.key}{s.mode === "minor" ? "m" : ""}
                  </span>
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {/* Accesos rápidos */}
      <div style={{ display: "flex", gap: 10, marginBottom: 28, flexWrap: "wrap", justifyContent: "center" }}>
        <button
          onClick={onOpenBible}
          style={{
            display: "flex", alignItems: "center", gap: 8,
            background: "var(--c-indigo)", color: "#fff",
            border: "none", borderRadius: 12, padding: "9px 18px",
            fontSize: 13, fontWeight: 600, cursor: "pointer",
          }}
        >
          <BookOpen size={15} /> Leer la Biblia
        </button>
      </div>

      {/* Divider */}
      <div style={{ width: 40, height: 2, borderRadius: 2, background: "var(--c-indigo)", opacity: 0.35, marginBottom: 28 }} />

      {/* Versículo del día */}
      <DailyVerse />
    </div>
  );
}
