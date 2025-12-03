"use client";

import { useEffect, useState } from "react";
import { ThemeToggle } from "@/components/theme-toggle";

export default function Page() {
  const [distance, setDistance] = useState<number | null>(null);
  const [button, setButton] = useState<boolean | null>(null);
  const [online, setOnline] = useState(false);

  useEffect(() => {
    const es = new EventSource("/api/iot/stream");

    es.addEventListener("status", (e) => {
      const data = JSON.parse((e as MessageEvent).data);
      setOnline(!!data.online);
    });

    es.addEventListener("distance", (e) => {
      const data = JSON.parse((e as MessageEvent).data);
      if (typeof data.distance === "number") setDistance(data.distance);
    });

    es.addEventListener("button", (e) => {
      const data = JSON.parse((e as MessageEvent).data);
      if (typeof data.button === "boolean") setButton(data.button);
    });

    es.addEventListener("error", () => setOnline(false));

    return () => es.close();
  }, []);

  return (
    <main className="mx-auto max-w-6xl p-4 md:p-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">IoT Dashboard</h1>
          <p className="text-sm text-muted">
            Estado: <span className="font-semibold">{online ? "ONLINE" : "OFFLINE"}</span>
          </p>
        </div>
        <ThemeToggle />
      </header>

      <section className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-4">
          <h2 className="text-sm font-semibold text-muted">Distancia (cm)</h2>
          <div className="mt-3 text-4xl font-bold tabular-nums">
            {distance ?? "—"}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4">
          <h2 className="text-sm font-semibold text-muted">Botón</h2>
          <div className="mt-3 text-2xl font-bold">
            {button === null ? "—" : button ? "Presionado" : "Libre"}
          </div>
        </div>
      </section>
    </main>
  );
}
