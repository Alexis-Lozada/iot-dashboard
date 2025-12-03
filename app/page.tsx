"use client";

import { useEffect, useState } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { DistanceChart, type DistancePoint } from "@/components/distance-chart";
import { CommandPanel } from "@/components/command-panel";
import { AlertSound } from "@/components/alert-sound";

const MAX_POINTS = 60; // ~60 segundos si recibes 1 dato/seg

function formatLocalTime(ms: number) {
  return new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true, // cámbialo a false si quieres 24h
  }).format(new Date(ms));
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl bg-card p-4 shadow-sm">
      <h2 className="text-sm font-semibold text-muted">{title}</h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

export default function Page() {
  const [distance, setDistance] = useState<number | null>(null);
  const [button, setButton] = useState<boolean | null>(null);
  const [online, setOnline] = useState(false);

  const [series, setSeries] = useState<DistancePoint[]>([]);

  useEffect(() => {
    const es = new EventSource("/api/iot/stream");

    es.addEventListener("status", (e) => {
      const data = JSON.parse((e as MessageEvent).data);
      setOnline(!!data.online);
    });

    es.addEventListener("distance", (e) => {
      const data = JSON.parse((e as MessageEvent).data);
      if (typeof data.distance !== "number") return;

      const d = data.distance as number;
      setDistance(d);

      const now = Date.now();
      const point: DistancePoint = {
        t: now,
        label: formatLocalTime(now),
        distance: d,
      };

      setSeries((prev) => {
        const next = [...prev, point];
        return next.length > MAX_POINTS ? next.slice(next.length - MAX_POINTS) : next;
      });
    });

    es.addEventListener("button", (e) => {
      const data = JSON.parse((e as MessageEvent).data);
      if (typeof data.button === "boolean") setButton(data.button);
    });

    es.addEventListener("error", () => setOnline(false));

    return () => es.close();
  }, []);

  const distanceState =
    distance == null
      ? { label: "Sin datos", cls: "bg-border text-muted" }
      : distance > 0 && distance < 10
      ? { label: "ALERTA (<10 cm)", cls: "bg-danger/15 text-danger" }
      : { label: "NORMAL", cls: "bg-success/15 text-success" };

  return (
    <main className="mx-auto max-w-6xl p-4 md:p-6">
      <header className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="truncate text-xl font-bold">IoT Dashboard</h1>
          <p className="text-sm text-muted">
            Estado:{" "}
            <span className={`font-semibold ${online ? "text-success" : "text-warning"}`}>
              {online ? "ONLINE" : "OFFLINE"}
            </span>
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <AlertSound distance={5} threshold={10} />
          <ThemeToggle />
        </div>
      </header>

      <section className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card title="Distancia (cm)">
          <div className="flex items-end justify-between">
            <div className="text-4xl font-bold tabular-nums">{distance ?? "—"}</div>

            <span className={`rounded-full px-3 py-1 text-xs font-medium ${distanceState.cls}`}>
              {distanceState.label}
            </span>
          </div>
          <p className="mt-2 text-sm text-muted">Topic: /distance</p>
        </Card>

        <Card title="Botón">
          <div className="text-2xl font-bold">
            {button === null ? "—" : button ? "Presionado" : "Libre"}
          </div>
          <p className="mt-2 text-sm text-muted">GPIO 21 • Topic: /button</p>
        </Card>
      </section>

      <section className="mt-4">
        <Card title={`Gráfica de distancia (últimos ${MAX_POINTS} puntos)`}>
          <DistanceChart data={series} height={260} />
          <p className="mt-2 text-xs text-muted">
            Nota: se agrega un punto por cada mensaje recibido en /distance.
          </p>
        </Card>
      </section>

      <section className="mt-4">
        <CommandPanel disabled={!online} />
      </section>
    </main>
  );
}
