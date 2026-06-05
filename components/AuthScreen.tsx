"use client";
import { useState } from "react";
import { useAuthStore } from "@/store/auth";
import AdoraLogo from "./AdoraLogo";

export default function AuthScreen() {
  const { signIn, signUp } = useAuthStore();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      let err: string | null = null;
      if (mode === "login") {
        err = await signIn(email, password);
      } else {
        err = await signUp(email, password, name);
        if (!err) { setDone(true); setLoading(false); return; }
      }
      if (err) setError(err);
    } finally {
      setLoading(false);
    }
  }

  if (done) return (
    <div style={{ minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "var(--c-bg)" }}>
      <div style={{ textAlign: "center", padding: 32 }}>
        <AdoraLogo size={48} showText={false} className="mx-auto mb-6" />
        <h2 style={{ fontSize: 22, fontWeight: 700, color: "var(--c-text)", marginBottom: 8 }}>¡Revisa tu correo!</h2>
        <p style={{ color: "var(--c-text2)", fontSize: 14, maxWidth: 300 }}>
          Te enviamos un enlace de confirmación a <strong>{email}</strong>. Ábrelo y luego vuelve para iniciar sesión.
        </p>
        <button onClick={() => { setDone(false); setMode("login"); }}
          style={{ marginTop: 24, background: "var(--c-indigo)", color: "#fff", border: "none", borderRadius: 10, padding: "10px 24px", fontSize: 14, cursor: "pointer" }}>
          Ir a iniciar sesión
        </button>
      </div>
    </div>
  );

  return (
    <div style={{
      minHeight: "100dvh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "var(--c-bg)",
      padding: "24px 16px",
    }}>
      {/* Logo centrado exactamente en la mitad superior */}
      <div style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-end",
        paddingBottom: 24,
        width: "100%",
      }}>
        <AdoraLogo size={130} className="mx-auto" />
      </div>

      {/* Formulario en la mitad inferior */}
      <div style={{ flex: 1, width: "100%", maxWidth: 380, display: "flex", flexDirection: "column", justifyContent: "flex-start", paddingTop: 8 }}>
        <p style={{ color: "var(--c-text3)", fontSize: 14, marginBottom: 24, textAlign: "center" }}>
          {mode === "login" ? "Inicia sesión para continuar" : "Crea tu cuenta en Adora"}
        </p>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {mode === "register" && (
            <input
              value={name} onChange={(e) => setName(e.target.value)}
              placeholder="Tu nombre"
              required
              style={inputStyle}
            />
          )}
          <input
            type="email" value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder="Correo electrónico"
            required
            style={inputStyle}
          />
          <input
            type="password" value={password} onChange={(e) => setPassword(e.target.value)}
            placeholder="Contraseña"
            required minLength={6}
            style={inputStyle}
          />

          {error && (
            <p style={{ color: "#ef4444", fontSize: 13, padding: "8px 12px", background: "rgba(239,68,68,0.08)", borderRadius: 8 }}>
              {error}
            </p>
          )}

          <button
            type="submit" disabled={loading}
            style={{
              marginTop: 4,
              background: loading ? "var(--c-elevated)" : "var(--c-indigo)",
              color: loading ? "var(--c-text3)" : "#fff",
              border: "none", borderRadius: 12,
              padding: "13px", fontSize: 15, fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
              transition: "all 0.15s",
            }}
          >
            {loading ? "Cargando…" : mode === "login" ? "Iniciar sesión" : "Crear cuenta"}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: 20, fontSize: 13, color: "var(--c-text3)" }}>
          {mode === "login" ? "¿No tienes cuenta? " : "¿Ya tienes cuenta? "}
          <button
            onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}
            style={{ background: "none", border: "none", color: "var(--c-indigo2)", cursor: "pointer", fontWeight: 600, fontSize: 13 }}
          >
            {mode === "login" ? "Regístrate" : "Inicia sesión"}
          </button>
        </p>
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  padding: "12px 14px",
  borderRadius: 10,
  border: "1px solid var(--c-border)",
  background: "var(--c-elevated)",
  color: "var(--c-text)",
  fontSize: 14,
  outline: "none",
  width: "100%",
};
