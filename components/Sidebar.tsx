"use client";
import { useSongsStore } from "@/store/songs";
import { useAuthStore } from "@/store/auth";
import { Plus, Search, Upload, LogOut } from "lucide-react";
import { useState } from "react";
import AdoraLogo from "./AdoraLogo";
import ThemeToggle from "./ThemeToggle";

interface Props {
  onNewSong: () => void;
  onImport: () => void;
}

export default function Sidebar({ onNewSong, onImport }: Props) {
  const { songs, activeSongId, setActiveSong, syncing } = useSongsStore();
  const { user, signOut } = useAuthStore();
  const [query, setQuery] = useState("");

  const filtered = songs.filter((s) =>
    s.title.toLowerCase().includes(query.toLowerCase()) ||
    s.artist.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <aside style={{
      width: 256,
      flexShrink: 0,
      backgroundColor: "var(--c-surface)",
      borderRight: "1px solid var(--c-border)",
      display: "flex",
      flexDirection: "column",
      height: "100%",
    }}>
      {/* Brand */}
      <div style={{
        padding: "14px 18px",
        borderBottom: "1px solid var(--c-border)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <AdoraLogo size={42} />
        <ThemeToggle />
      </div>

      {/* Search */}
      <div style={{ padding: "10px 12px", borderBottom: "1px solid var(--c-border)" }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          backgroundColor: "var(--c-elevated)",
          borderRadius: 8,
          padding: "6px 12px",
        }}>
          <Search size={13} style={{ color: "var(--c-text3)", flexShrink: 0 }} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar canción..."
            style={{
              flex: 1,
              background: "transparent",
              border: "none",
              outline: "none",
              color: "var(--c-text)",
              fontSize: 13,
            }}
          />
        </div>
      </div>

      {/* Count */}
      <div style={{ padding: "6px 16px" }}>
        <p style={{ fontSize: 11, color: "var(--c-text4)" }}>
          {songs.length} {songs.length === 1 ? "canción" : "canciones"}
        </p>
      </div>

      {/* Song list */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        {filtered.length === 0 && (
          <p style={{ fontSize: 12, color: "var(--c-text4)", textAlign: "center", paddingTop: 32 }}>
            No hay canciones
          </p>
        )}
        {filtered.map((song) => {
          const active = activeSongId === song.id;
          return (
            <button
              key={song.id}
              onClick={() => setActiveSong(song.id)}
              style={{
                width: "100%",
                textAlign: "left",
                padding: "10px 16px",
                background: active ? "var(--c-indigo-bg)" : "transparent",
                borderRight: active ? "2px solid var(--c-indigo)" : "2px solid transparent",
                border: "none",
                borderLeft: "none",
                cursor: "pointer",
                transition: "all 0.12s",
              }}
            >
              <p style={{ fontSize: 13, fontWeight: 500, color: active ? "var(--c-indigo2)" : "var(--c-text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {song.title}
              </p>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 2 }}>
                <span style={{ fontSize: 11, color: "var(--c-text3)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {song.artist || "Sin artista"}
                </span>
                <span style={{ fontSize: 11, color: "var(--c-text4)", flexShrink: 0, marginLeft: 8 }}>{song.key}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* User info */}
      {user && (
        <div style={{ padding: "8px 14px", borderTop: "1px solid var(--c-border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <p style={{ fontSize: 11, color: "var(--c-text2)", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 160 }}>
              {user.user_metadata?.full_name || user.email}
            </p>
            {syncing && <p style={{ fontSize: 10, color: "var(--c-indigo2)" }}>Sincronizando…</p>}
          </div>
          <button onClick={signOut} title="Cerrar sesión"
            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--c-text4)", padding: 4 }}>
            <LogOut size={14} />
          </button>
        </div>
      )}

      {/* Actions */}
      <div style={{ padding: 12, borderTop: "1px solid var(--c-border)", display: "flex", flexDirection: "column", gap: 8 }}>
        <button
          onClick={onImport}
          style={{
            width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            background: "var(--c-elevated)", border: "1px solid var(--c-border)",
            borderRadius: 10, color: "var(--c-text2)", fontSize: 13,
            padding: "8px 0", cursor: "pointer", transition: "all 0.15s",
          }}
        >
          <Upload size={14} /> Importar PDF / Word
        </button>
        <button
          onClick={onNewSong}
          style={{
            width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            background: "var(--c-indigo)", border: "none",
            borderRadius: 10, color: "#fff", fontSize: 13, fontWeight: 600,
            padding: "10px 0", cursor: "pointer", transition: "all 0.15s",
          }}
        >
          <Plus size={16} /> Nueva canción
        </button>
      </div>
    </aside>
  );
}
