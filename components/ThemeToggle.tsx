"use client";
import { useThemeStore } from "@/store/theme";
import { Sun, Moon, Monitor } from "lucide-react";

export default function ThemeToggle() {
  const { theme, setTheme } = useThemeStore();

  const options = [
    { key: "light" as const, icon: <Sun size={13} />, label: "Claro" },
    { key: "system" as const, icon: <Monitor size={13} />, label: "Sistema" },
    { key: "dark" as const, icon: <Moon size={13} />, label: "Oscuro" },
  ];

  return (
    <div style={{
      display: "flex",
      gap: 2,
      background: "var(--c-elevated)",
      borderRadius: 8,
      padding: 3,
    }}>
      {options.map((opt) => (
        <button
          key={opt.key}
          onClick={() => setTheme(opt.key)}
          title={opt.label}
          style={{
            padding: "4px 6px",
            borderRadius: 5,
            border: "none",
            cursor: "pointer",
            transition: "all 0.15s",
            background: theme === opt.key ? "var(--c-surface)" : "transparent",
            color: theme === opt.key ? "var(--c-indigo)" : "var(--c-text3)",
            boxShadow: theme === opt.key ? "0 1px 3px rgba(0,0,0,0.2)" : "none",
            display: "flex",
            alignItems: "center",
          }}
        >
          {opt.icon}
        </button>
      ))}
    </div>
  );
}
