"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

export type DistancePoint = {
  t: number;          // timestamp ms
  label: string;      // etiqueta corta (mm:ss)
  distance: number;   // cm
};

function formatTooltipLabel(label: string) {
  return `Tiempo: ${label}`;
}

export function DistanceChart({
  data,
  height = 180,
}: {
  data: DistancePoint[];
  height?: number;
}) {
  return (
    <div
      className="rounded-xl border border-border bg-bg/40 p-2"
      role="img"
      aria-label="Gráfica de distancia en centímetros a lo largo del tiempo"
    >
      <div className="sr-only">
        Gráfica de distancia en centímetros, mostrando el historial más reciente.
      </div>

      <div style={{ width: "100%", height }}>
        <ResponsiveContainer>
          <LineChart data={data} margin={{ top: 8, right: 12, bottom: 8, left: 0 }}>
            <CartesianGrid stroke="rgb(var(--border))" strokeDasharray="4 4" />
            <XAxis
              dataKey="label"
              tick={{ fill: "rgb(var(--muted))", fontSize: 12 }}
              interval="preserveStartEnd"
              minTickGap={18}
            />
            <YAxis
              tick={{ fill: "rgb(var(--muted))", fontSize: 12 }}
              width={40}
              domain={["auto", "auto"]}
              unit="cm"
            />
            <Tooltip
              contentStyle={{
                background: "rgb(var(--card))",
                border: "1px solid rgb(var(--border))",
                borderRadius: 12,
                color: "rgb(var(--fg))",
              }}
              labelFormatter={formatTooltipLabel}
              formatter={(value) => [`${Number(value).toFixed(2)} cm`, "Distancia"]}
            />
            <Line
              type="monotone"
              dataKey="distance"
              stroke="rgb(var(--primary))"
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
