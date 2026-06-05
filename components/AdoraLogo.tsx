"use client";
import { useEffect, useState } from "react";
import { useThemeStore } from "@/store/theme";

interface Props {
  size?: number;
  showText?: boolean;
  className?: string;
}

export default function AdoraLogo({ size = 28, showText = true, className = "" }: Props) {
  const { theme } = useThemeStore();
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    if (theme === "system") {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      setIsDark(mq.matches);
      const h = (e: MediaQueryListEvent) => setIsDark(e.matches);
      mq.addEventListener("change", h);
      return () => mq.removeEventListener("change", h);
    } else {
      setIsDark(theme === "dark");
    }
  }, [theme]);

  // Icon-only: flame extracted from the logo design
  if (!showText) {
    return (
      <div className={className}>
        <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
          <defs>
            <linearGradient id="flo" x1="16" y1="30" x2="16" y2="2" gradientUnits="userSpaceOnUse">
              <stop stopColor="#6d28d9" />
              <stop offset="0.45" stopColor="#ec4899" />
              <stop offset="0.85" stopColor="#fb7185" />
              <stop offset="1" stopColor="#ffe4e6" />
            </linearGradient>
            <linearGradient id="fli" x1="16" y1="28" x2="16" y2="10" gradientUnits="userSpaceOnUse">
              <stop stopColor="#f0abfc" />
              <stop offset="1" stopColor="#ffffff" />
            </linearGradient>
          </defs>
          {/* Outer flame — gota con dos lenguas */}
          <path
            d="M16 30 C19.5 30 22 27.5 22 24 C22 20.5 20 16.5 17.5 14 C16.8 15.5 16 17 15 17.5 C15.3 15 15 12 14 8 C12 12 10 16.5 10 24 C10 27.5 12.5 30 16 30Z"
            fill="url(#flo)"
          />
          {/* Lengua derecha */}
          <path
            d="M15 17.5 C15.5 15.5 17 13 18.5 11.5 C19.5 10 20 9 19 11 C20 13 21 16 21 19 C20 16.5 19 14 17.5 14 C16.8 15.5 16 17 15 17.5Z"
            fill="url(#flo)"
            opacity="0.9"
          />
          {/* Núcleo brillante */}
          <path
            d="M16 27 C18 27 19.5 25.5 19.5 23.5 C19.5 21.5 18 18.5 16 16.5 C14 18.5 12.5 21.5 12.5 23.5 C12.5 25.5 14 27 16 27Z"
            fill="url(#fli)"
            opacity="0.82"
          />
        </svg>
      </div>
    );
  }

  // Full logo: image switches between dark/light version
  const logoSrc = isDark ? "/adora-logo-dark.svg" : "/adora-logo-light.svg";
  const logoH = Math.round(size * 1.15);
  const logoW = Math.round(logoH * (400 / 230));

  return (
    <div className={`flex items-center ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={logoSrc}
        alt="Adora"
        width={logoW}
        height={logoH}
        style={{ display: "block", objectFit: "contain" }}
      />
    </div>
  );
}
