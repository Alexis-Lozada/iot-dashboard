"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) {
    return (
      <button
        className="rounded-full border border-border bg-card px-3 py-2 text-sm text-muted"
        aria-label="Cambiar tema"
      >
        Tema
      </button>
    );
  }

  const current = theme === "system" ? systemTheme : theme;
  const next = current === "dark" ? "light" : "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(next ?? "light")}
      className="rounded-full border border-border bg-card px-3 py-2 text-sm hover:bg-bg/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      aria-label={`Cambiar a tema ${next === "dark" ? "oscuro" : "claro"}`}
    >
      Tema: <span className="font-semibold">{current}</span>
    </button>
  );
}
