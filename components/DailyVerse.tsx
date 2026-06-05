"use client";
import { useEffect, useState } from "react";
import { getDailyVerse, VerseEntry } from "@/lib/verseData";
import { BookOpen, RefreshCw } from "lucide-react";

interface BibleVersion {
  id: string;
  label: string;
  lang: "es" | "en";
  apiId?: string; // bible-api.com translation id
  embedded?: "rvr1960" | "nvi";
}

const VERSIONS: BibleVersion[] = [
  { id: "rvr1960",  label: "RVR 1960 (embed)", lang: "es", embedded: "rvr1960" },
  { id: "nvi",      label: "NVI (embed)",       lang: "es", embedded: "nvi"     },
  { id: "kjv",      label: "KJV",               lang: "en", apiId: "kjv"        },
  { id: "web",      label: "WEB",               lang: "en", apiId: "web"        },
  { id: "asv",      label: "ASV (1901)",         lang: "en", apiId: "asv"        },
  { id: "bbe",      label: "BBE",               lang: "en", apiId: "bbe"        },
  { id: "darby",    label: "Darby",             lang: "en", apiId: "darby"      },
  { id: "ylt",      label: "Young's Literal",   lang: "en", apiId: "ylt"        },
];

export default function DailyVerse() {
  const [verse, setVerse] = useState<VerseEntry | null>(null);
  const [versionId, setVersionId] = useState("rvr1960");
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    setVerse(getDailyVerse());
  }, []);

  useEffect(() => {
    if (!verse) return;
    loadVerse(verse, versionId);
  }, [verse, versionId]);

  async function loadVerse(v: VerseEntry, vid: string) {
    const version = VERSIONS.find((vv) => vv.id === vid);
    if (!version) return;

    // Versiones embebidas (sin API)
    if (version.embedded === "rvr1960") { setText(v.rvr1960); setError(false); return; }
    if (version.embedded === "nvi")     { setText(v.nvi);     setError(false); return; }

    // Fetch desde bible-api.com
    setLoading(true);
    setError(false);
    try {
      const apiId = version.apiId || "kjv";
      const res = await fetch(`https://bible-api.com/${encodeURIComponent(v.apiRef)}?translation=${apiId}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setText(data.text?.trim() || "");
    } catch {
      setError(true);
      setText(v.rvr1960); // fallback a RVR1960
    } finally {
      setLoading(false);
    }
  }

  if (!verse) return null;

  const currentVersion = VERSIONS.find((v) => v.id === versionId);

  return (
    <div style={{
      background: "var(--c-surface)",
      border: "1px solid var(--c-border)",
      borderRadius: 16,
      padding: "20px 24px",
      maxWidth: 560,
      width: "100%",
      textAlign: "left",
    }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <BookOpen size={14} style={{ color: "var(--c-indigo)" }} />
          <span style={{ fontSize: 11, fontWeight: 600, color: "var(--c-indigo)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
            Versículo del día
          </span>
        </div>

        {/* Version selector */}
        <select
          value={versionId}
          onChange={(e) => setVersionId(e.target.value)}
          style={{
            background: "var(--c-elevated)",
            border: "1px solid var(--c-border)",
            borderRadius: 8,
            padding: "3px 8px",
            fontSize: 11,
            color: "var(--c-text2)",
            cursor: "pointer",
            outline: "none",
          }}
        >
          <optgroup label="Español">
            {VERSIONS.filter((v) => v.lang === "es").map((v) => (
              <option key={v.id} value={v.id}>{v.label}</option>
            ))}
          </optgroup>
          <optgroup label="English">
            {VERSIONS.filter((v) => v.lang === "en").map((v) => (
              <option key={v.id} value={v.id}>{v.label}</option>
            ))}
          </optgroup>
        </select>
      </div>

      {/* Verse text */}
      <div style={{ position: "relative", minHeight: 60 }}>
        {loading && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--c-text3)" }}>
            <RefreshCw size={13} className="animate-spin" />
            <span style={{ fontSize: 13 }}>Cargando…</span>
          </div>
        )}
        {!loading && (
          <>
            <p style={{
              fontSize: 15,
              lineHeight: 1.65,
              color: "var(--c-text)",
              fontStyle: "italic",
              margin: 0,
            }}>
              "{text}"
            </p>
            {error && (
              <p style={{ fontSize: 11, color: "var(--c-text4)", marginTop: 4 }}>
                * No se pudo cargar esta versión, mostrando RVR1960
              </p>
            )}
          </>
        )}
      </div>

      {/* Reference */}
      <p style={{
        marginTop: 12,
        fontSize: 12,
        fontWeight: 600,
        color: "var(--c-indigo2)",
        letterSpacing: "0.03em",
      }}>
        — {verse.ref} · {currentVersion?.label}
      </p>
    </div>
  );
}
