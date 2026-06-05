"use client";
import AdoraLogo from "./AdoraLogo";
import DailyVerse from "./DailyVerse";
import { BookOpen } from "lucide-react";

interface Props { onOpenBible: () => void; }

export default function WelcomeScreen({ onOpenBible }: Props) {
  return (
    <div style={{
      flex: 1,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "32px 20px",
      minHeight: 0,
      overflowY: "auto",
    }}>
      {/* Logo grande */}
      <div style={{ marginBottom: 8 }}>
        <AdoraLogo size={160} showText={true} className="mx-auto" />
      </div>

      {/* Tagline */}
      <p style={{
        fontSize: 22, fontWeight: 700,
        color: "var(--c-text)", marginBottom: 6,
        letterSpacing: "-0.01em", textAlign: "center",
      }}>
        Listo para Adorar
      </p>
      <p style={{ fontSize: 13, color: "var(--c-text3)", marginBottom: 24, textAlign: "center" }}>
        Selecciona una canción del panel lateral para comenzar
      </p>

      {/* Botón Biblia */}
      <button
        onClick={onOpenBible}
        style={{
          display: "flex", alignItems: "center", gap: 8,
          background: "var(--c-indigo)", color: "#fff",
          border: "none", borderRadius: 12, padding: "10px 20px",
          fontSize: 13, fontWeight: 600, cursor: "pointer",
          marginBottom: 32, transition: "opacity 0.15s",
        }}
        onMouseOver={(e) => (e.currentTarget.style.opacity = "0.85")}
        onMouseOut={(e) => (e.currentTarget.style.opacity = "1")}
      >
        <BookOpen size={16} />
        Leer la Biblia
      </button>

      {/* Divider */}
      <div style={{
        width: 40, height: 2, borderRadius: 2,
        background: "var(--c-indigo)", opacity: 0.35,
        marginBottom: 28,
      }} />

      {/* Versículo del día */}
      <DailyVerse />
    </div>
  );
}
