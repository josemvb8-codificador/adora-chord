"use client";
import { useSongsStore } from "@/store/songs";
import { useAuthStore } from "@/store/auth";
import { Plus, Upload, LogOut, Home, BookOpen, Music2, ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";
import AdoraLogo from "./AdoraLogo";
import ThemeToggle from "./ThemeToggle";

interface Props {
  onNewSong:  () => void;
  onImport:   () => void;
  onHome:     () => void;
  onBible:    () => void;
}

export default function Sidebar({ onNewSong, onImport, onHome, onBible }: Props) {
  const { songs, activeSongId, setActiveSong, syncing } = useSongsStore();
  const { user, signOut } = useAuthStore();
  const [songsOpen, setSongsOpen] = useState(true);
  const [query, setQuery] = useState("");

  const filtered = songs.filter((s) =>
    s.title.toLowerCase().includes(query.toLowerCase()) ||
    s.artist.toLowerCase().includes(query.toLowerCase())
  );

  const navBtn: React.CSSProperties = {
    width: "100%", display: "flex", alignItems: "center", gap: 10,
    padding: "9px 16px", background: "none", border: "none",
    cursor: "pointer", fontSize: 13, textAlign: "left",
    borderRadius: 8, transition: "background 0.12s",
  };

  return (
    <aside style={{
      width: 256, flexShrink: 0,
      backgroundColor: "var(--c-surface)",
      borderRight: "1px solid var(--c-border)",
      display: "flex", flexDirection: "column",
      height: "100%",
    }}>
      {/* ── Brand ── */}
      <div style={{ padding: "14px 16px 10px", borderBottom: "1px solid var(--c-border)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
          <AdoraLogo size={110} />
          <ThemeToggle />
        </div>
      </div>

      {/* ── Nav items ── */}
      <div style={{ padding: "8px 8px 0" }}>
        {/* Home */}
        <button
          onClick={onHome}
          style={{
            ...navBtn,
            background: !activeSongId ? "var(--c-indigo-bg)" : "none",
            color: !activeSongId ? "var(--c-indigo2)" : "var(--c-text2)",
          }}
          onMouseOver={(e) => { if (activeSongId) e.currentTarget.style.background = "var(--c-elevated)"; }}
          onMouseOut={(e)  => { if (activeSongId) e.currentTarget.style.background = "none"; }}
        >
          <Home size={15} />
          Inicio
        </button>

        {/* Biblia */}
        <button
          onClick={onBible}
          style={{ ...navBtn, color: "var(--c-text2)" }}
          onMouseOver={(e) => { e.currentTarget.style.background = "var(--c-elevated)"; }}
          onMouseOut={(e)  => { e.currentTarget.style.background = "none"; }}
        >
          <BookOpen size={15} />
          Biblia
        </button>

        {/* Canciones (collapsible) */}
        <button
          onClick={() => setSongsOpen((v) => !v)}
          style={{ ...navBtn, color: "var(--c-text2)", justifyContent: "space-between" }}
          onMouseOver={(e) => { e.currentTarget.style.background = "var(--c-elevated)"; }}
          onMouseOut={(e)  => { e.currentTarget.style.background = "none"; }}
        >
          <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Music2 size={15} />
            Canciones
            {syncing && <span style={{ fontSize: 10, color: "var(--c-text4)" }}>•••</span>}
          </span>
          {songsOpen
            ? <ChevronDown size={13} style={{ color: "var(--c-text4)" }} />
            : <ChevronRight size={13} style={{ color: "var(--c-text4)" }} />
          }
        </button>
      </div>

      {/* ── Song list (inside Canciones) ── */}
      {songsOpen && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {/* Search */}
          <div style={{ padding: "6px 10px 4px" }}>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar..."
              style={{
                width: "100%", background: "var(--c-elevated)",
                border: "1px solid var(--c-border)", borderRadius: 8,
                padding: "6px 12px", fontSize: 12,
                color: "var(--c-text)", outline: "none",
              }}
            />
          </div>

          {/* Songs */}
          <div style={{ flex: 1, overflowY: "auto", padding: "4px 8px" }}>
            {filtered.length === 0 && (
              <p style={{ fontSize: 12, color: "var(--c-text4)", padding: "8px 8px", textAlign: "center" }}>
                {query ? "Sin resultados" : "No hay canciones aún"}
              </p>
            )}
            {filtered.map((s) => (
              <button
                key={s.id}
                onClick={() => setActiveSong(s.id)}
                style={{
                  width: "100%", textAlign: "left",
                  padding: "8px 10px", borderRadius: 8,
                  border: "none", cursor: "pointer",
                  background: s.id === activeSongId ? "var(--c-indigo-bg)" : "none",
                  transition: "background 0.1s",
                  marginBottom: 1,
                }}
                onMouseOver={(e) => { if (s.id !== activeSongId) e.currentTarget.style.background = "var(--c-elevated)"; }}
                onMouseOut={(e)  => { if (s.id !== activeSongId) e.currentTarget.style.background = "none"; }}
              >
                <p style={{
                  fontSize: 13, fontWeight: 500,
                  color: s.id === activeSongId ? "var(--c-indigo2)" : "var(--c-text)",
                  whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                }}>
                  {s.title}
                </p>
                {s.artist && (
                  <p style={{
                    fontSize: 11, color: "var(--c-text3)",
                    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                    marginTop: 1,
                  }}>
                    {s.artist}
                  </p>
                )}
                <span style={{ fontSize: 10, color: "var(--c-text4)" }}>{s.key}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Spacer */}
      {!songsOpen && <div style={{ flex: 1 }} />}

      {/* ── Footer ── */}
      <div style={{ borderTop: "1px solid var(--c-border)", padding: "10px 8px" }}>
        {user && (
          <p style={{ fontSize: 11, color: "var(--c-text4)", padding: "4px 8px 6px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {user.email}
          </p>
        )}
        <button
          onClick={onImport}
          style={{ ...navBtn, color: "var(--c-text3)", padding: "7px 10px" }}
          onMouseOver={(e) => { e.currentTarget.style.background = "var(--c-elevated)"; }}
          onMouseOut={(e)  => { e.currentTarget.style.background = "none"; }}
        >
          <Upload size={14} /> Importar PDF / Word
        </button>
        <button
          onClick={onNewSong}
          style={{
            width: "calc(100% - 4px)", margin: "4px 2px 0",
            padding: "9px 12px", borderRadius: 10,
            background: "var(--c-indigo)", border: "none",
            cursor: "pointer", color: "#fff", fontSize: 13, fontWeight: 600,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
          }}
        >
          <Plus size={15} /> Nueva canción
        </button>
        <button
          onClick={signOut}
          style={{ ...navBtn, color: "var(--c-text4)", marginTop: 4, padding: "6px 10px" }}
          onMouseOver={(e) => { e.currentTarget.style.background = "var(--c-elevated)"; }}
          onMouseOut={(e)  => { e.currentTarget.style.background = "none"; }}
        >
          <LogOut size={13} /> Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
