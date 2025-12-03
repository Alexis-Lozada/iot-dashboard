"use client";

import { useTheme } from "next-themes";
import { useEffect, useMemo, useState } from "react";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  const { theme, setTheme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const current = useMemo(() => {
    if (!mounted) return "system";
    return theme === "system" ? (systemTheme ?? "light") : theme;
  }, [mounted, theme, systemTheme]);

  const isDark = current === "dark";
  const nextTheme = isDark ? "light" : "dark";

  const base =
    "inline-flex cursor-pointer items-center gap-2 rounded-xl bg-card px-1 py-1 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary transition";

  const pillActive = "bg-bg/70";
  const pillInactive = "bg-transparent";

  return (
    <button
      type="button"
      onClick={() => setTheme(nextTheme)}
      className={base}
      aria-label={`Cambiar a tema ${nextTheme === "dark" ? "oscuro" : "claro"}`}
      title={`Cambiar a ${nextTheme === "dark" ? "oscuro" : "claro"}`}
    >
      <span
        className={`inline-flex h-9 items-center justify-center rounded-xl px-4 ${
          !isDark ? pillActive : pillInactive
        }`}
        aria-hidden="true"
      >
        <Sun className="h-4 w-4 text-fg" />
      </span>

      <span
        className={`inline-flex h-9 items-center justify-center rounded-xl px-4 ${
          isDark ? pillActive : pillInactive
        }`}
        aria-hidden="true"
      >
        <Moon className="h-4 w-4 text-fg" />
      </span>
    </button>
  );
}
