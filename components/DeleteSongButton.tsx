"use client";
import { useState } from "react";
import { useSongsStore } from "@/store/songs";
import { Trash2, X } from "lucide-react";

interface Props { songId: string; songTitle: string; onDeleted: () => void; }

export default function DeleteSongButton({ songId, songTitle, onDeleted }: Props) {
  const { deleteSong } = useSongsStore();
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    await deleteSong(songId);
    setDeleting(false);
    setShowConfirm(false);
    onDeleted();
  }

  return (
    <>
      <button
        onClick={() => setShowConfirm(true)}
        style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "var(--c-text4)" }}
        className="hover:text-red-400 transition-colors"
      >
        <Trash2 size={13} /> Eliminar
      </button>

      {showConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => setShowConfirm(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: "var(--c-surface)",
              border: "1px solid var(--c-border)",
              borderRadius: 16,
              padding: 24,
              width: "100%",
              maxWidth: 360,
              margin: 16,
            }}
          >
            <div className="flex items-start justify-between mb-3">
              <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(239,68,68,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Trash2 size={18} style={{ color: "#ef4444" }} />
              </div>
              <button onClick={() => setShowConfirm(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--c-text4)" }}>
                <X size={18} />
              </button>
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--c-text)", marginBottom: 6 }}>
              ¿Eliminar canción?
            </h3>
            <p style={{ fontSize: 13, color: "var(--c-text3)", marginBottom: 20 }}>
              <strong style={{ color: "var(--c-text2)" }}>"{songTitle}"</strong> se eliminará permanentemente de tu biblioteca. Esta acción no se puede deshacer.
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => setShowConfirm(false)}
                style={{
                  flex: 1, padding: "10px", borderRadius: 10,
                  background: "var(--c-elevated)", border: "1px solid var(--c-border)",
                  color: "var(--c-text2)", fontSize: 14, cursor: "pointer",
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                style={{
                  flex: 1, padding: "10px", borderRadius: 10,
                  background: "#ef4444", border: "none",
                  color: "#fff", fontSize: 14, fontWeight: 600,
                  cursor: deleting ? "not-allowed" : "pointer",
                  opacity: deleting ? 0.6 : 1,
                }}
              >
                {deleting ? "Eliminando…" : "Sí, eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
