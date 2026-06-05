"use client";
import AdoraLogo from "./AdoraLogo";
import DailyVerse from "./DailyVerse";

export default function WelcomeScreen() {
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
        fontSize: 22,
        fontWeight: 700,
        color: "var(--c-text)",
        marginBottom: 6,
        letterSpacing: "-0.01em",
        textAlign: "center",
      }}>
        Listo para Adorar
      </p>
      <p style={{
        fontSize: 13,
        color: "var(--c-text3)",
        marginBottom: 36,
        textAlign: "center",
      }}>
        Selecciona una canción del panel lateral para comenzar
      </p>

      {/* Divider */}
      <div style={{
        width: 40,
        height: 2,
        borderRadius: 2,
        background: "var(--c-indigo)",
        opacity: 0.4,
        marginBottom: 32,
      }} />

      {/* Versículo del día */}
      <DailyVerse />
    </div>
  );
}
