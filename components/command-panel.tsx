"use client";

import { useState } from "react";

type Props = {
  disabled?: boolean;
};

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl bg-card p-4 shadow-sm">
      <h2 className="text-sm font-semibold text-muted">{title}</h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

export function CommandPanel({ disabled = false }: Props) {
  const [cmdStatus, setCmdStatus] = useState<string>("");

  async function sendCommand(action: string) {
    try {
      setCmdStatus(`Enviando: ${action}...`);

      const res = await fetch("/api/iot/command", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        setCmdStatus(`Error: ${data.error ?? "No se pudo enviar"}`);
        return;
      }

      setCmdStatus(`✅ Enviado: ${action}`);
    } catch (e: any) {
      setCmdStatus(`Error: ${e?.message ?? "Fallo desconocido"}`);
    }
  }

  const baseBtn =
    "rounded-xl border border-border bg-bg/40 px-3 py-2 text-sm hover:bg-bg/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <Card title="Comandos (MQTT)">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        <button
          className={baseBtn}
          onClick={() => sendCommand("led_on")}
          aria-label="Encender LED"
          disabled={disabled}
          title={disabled ? "Conéctate al dispositivo para enviar comandos" : "Enviar comando"}
        >
          LED ON
        </button>

        <button
          className={baseBtn}
          onClick={() => sendCommand("led_off")}
          aria-label="Apagar LED"
          disabled={disabled}
          title={disabled ? "Conéctate al dispositivo para enviar comandos" : "Enviar comando"}
        >
          LED OFF
        </button>

        <button
          className={baseBtn}
          onClick={() => sendCommand("buzzer_on")}
          aria-label="Encender buzzer"
          disabled={disabled}
          title={disabled ? "Conéctate al dispositivo para enviar comandos" : "Enviar comando"}
        >
          BUZZER ON
        </button>

        <button
          className={baseBtn}
          onClick={() => sendCommand("buzzer_off")}
          aria-label="Apagar buzzer"
          disabled={disabled}
          title={disabled ? "Conéctate al dispositivo para enviar comandos" : "Enviar comando"}
        >
          BUZZER OFF
        </button>

        <button
          className={baseBtn}
          onClick={() => sendCommand("alert_on")}
          aria-label="Activar alerta (LED y buzzer)"
          disabled={disabled}
          title={disabled ? "Conéctate al dispositivo para enviar comandos" : "Enviar comando"}
        >
          ALERT ON
        </button>

        <button
          className={baseBtn}
          onClick={() => sendCommand("alert_off")}
          aria-label="Desactivar alerta"
          disabled={disabled}
          title={disabled ? "Conéctate al dispositivo para enviar comandos" : "Enviar comando"}
        >
          ALERT OFF
        </button>

        <button
          className={
            "col-span-2 sm:col-span-3 rounded-xl border border-border bg-warning/15 px-3 py-2 text-sm font-medium text-warning hover:bg-warning/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
          }
          onClick={() => {
            const ok = confirm("¿Seguro que quieres iniciar OTA Update?");
            if (ok) sendCommand("ota_update");
          }}
          aria-label="Iniciar actualización OTA"
          disabled={disabled}
          title={disabled ? "Conéctate al dispositivo para enviar comandos" : "Enviar comando OTA"}
        >
          OTA UPDATE
        </button>
      </div>

      <p className="mt-3 text-xs text-muted" aria-live="polite">
        {cmdStatus ||
          (disabled ? "Dispositivo OFFLINE: comandos deshabilitados." : "Listo para enviar comandos.")}
      </p>
    </Card>
  );
}
