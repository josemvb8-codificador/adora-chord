"use client";
import { useEffect } from "react";
import { useThemeStore } from "@/store/theme";

// Injected inline script runs before React hydration to avoid flash
const THEME_SCRIPT = `
(function() {
  try {
    var stored = localStorage.getItem('adora-theme');
    var theme = stored ? JSON.parse(stored).state?.theme : 'system';
    var dark = theme === 'dark' || (theme !== 'light' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
  } catch(e) {
    document.documentElement.setAttribute('data-theme', 'dark');
  }
})();
`;

export function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />;
}

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme } = useThemeStore();

  useEffect(() => {
    const root = document.documentElement;

    function apply(dark: boolean) {
      root.setAttribute("data-theme", dark ? "dark" : "light");
    }

    if (theme === "system") {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      apply(mq.matches);
      const handler = (e: MediaQueryListEvent) => apply(e.matches);
      mq.addEventListener("change", handler);
      return () => mq.removeEventListener("change", handler);
    } else {
      apply(theme === "dark");
    }
  }, [theme]);

  return <>{children}</>;
}
