"use client";

import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";

type Props = {
  distance: number | null;
  threshold?: number;       // default 10 cm
  soundUrl?: string;        // ej: "/sounds/alarm.mp3"
  volume?: number;          // 0..1
};

export function AlertSound({
  distance,
  threshold = 10,
  soundUrl = "/sounds/alarm.mp3",
  volume = 0.6,
}: Props) {
  const [enabled, setEnabled] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const inAlert = distance != null && distance > 0 && distance < threshold;

  function ensureAudio() {
    if (typeof window === "undefined") return;

    // Prepara <audio>
    if (!audioRef.current) {
      const a = new Audio(soundUrl);
      a.preload = "auto";
      a.loop = true;
      a.volume = Math.min(1, Math.max(0, volume));
      audioRef.current = a;
    } else {
      audioRef.current.volume = Math.min(1, Math.max(0, volume));
    }

    // También “despierta” AudioContext por compatibilidad (iOS/Chrome)
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    audioCtxRef.current.resume?.();
  }

  function stopAlarm() {
    const a = audioRef.current;
    if (!a) return;
    a.pause();
    a.currentTime = 0;
  }

  async function startAlarm() {
    const a = audioRef.current;
    if (!a) return;

    try {
      // Reinicia para que suene inmediato
      a.currentTime = 0;
      await a.play();
    } catch {
      // Fallback beep si el navegador bloquea el play o falla el audio
      beep(880, 160);
    }
  }

  function beep(freq = 880, ms = 160) {
    const ctx = audioCtxRef.current;
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.value = freq;

    const now = ctx.currentTime;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.2, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + ms / 1000);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + ms / 1000);
  }

  // Arranca / detiene audio según estado
  useEffect(() => {
    if (!enabled) {
      stopAlarm();
      return;
    }

    if (inAlert) startAlarm();
    else stopAlarm();

    return () => stopAlarm();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, inAlert]);

  // Si cambias el archivo de audio o volumen, actualiza el elemento
  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.src = soundUrl;
    audioRef.current.loop = true;
    audioRef.current.volume = Math.min(1, Math.max(0, volume));
  }, [soundUrl, volume]);

  // Limpieza general
  useEffect(() => {
    return () => stopAlarm();
  }, []);

  return (
    <button
      type="button"
      onClick={() => {
        const next = !enabled;
        setEnabled(next);
        if (next) ensureAudio(); // user gesture -> permite audio
        else stopAlarm();
      }}
      className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-card px-3 py-2 text-sm shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary transition"
      aria-pressed={enabled}
      aria-label={enabled ? "Desactivar alarma" : "Activar alarma"}
      title={enabled ? "Alarma activada" : "Alarma desactivada"}
    >
      {enabled ? (
        <Volume2 className="h-4 w-4 text-fg" aria-hidden="true" />
      ) : (
        <VolumeX className="h-4 w-4 text-fg" aria-hidden="true" />
      )}
      <span className="text-fg">{enabled ? "Alarma" : "Silencio"}</span>
    </button>
  );
}
