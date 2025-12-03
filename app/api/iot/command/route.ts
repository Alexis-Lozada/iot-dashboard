import * as mqtt from "mqtt";
import fs from "node:fs";
import path from "node:path";

export const runtime = "nodejs";

const CMD_TOPIC = "/class/idgs12/evaluacion2/2023171015/cmd";

// Lista blanca de comandos permitidos (seguridad básica)
const ALLOWED_ACTIONS = new Set([
  "led_on",
  "led_off",
  "buzzer_on",
  "buzzer_off",
  "alert_on",
  "alert_off",
  "ota_update",
]);

type Body = { action?: string };

export async function POST(req: Request) {
  let body: Body;
  try {
    body = await req.json();
  } catch {
    return Response.json({ ok: false, error: "JSON inválido" }, { status: 400 });
  }

  const action = body.action?.trim();
  if (!action || !ALLOWED_ACTIONS.has(action)) {
    return Response.json(
      { ok: false, error: "Acción no permitida" },
      { status: 400 }
    );
  }

  const host = process.env.MQTT_HOST!;
  const port = Number(process.env.MQTT_PORT ?? "8883");
  const username = process.env.MQTT_USERNAME!;
  const password = process.env.MQTT_PASSWORD!;

  const caPath = path.join(process.cwd(), "certs", "emqxsl_ca.pem");
  const ca = fs.existsSync(caPath) ? fs.readFileSync(caPath) : undefined;

  // Conectar -> publicar -> cerrar (simple y compatible con serverless)
  return await new Promise<Response>((resolve) => {
    const client = mqtt.connect(`mqtts://${host}:${port}`, {
      username,
      password,
      ca,
      rejectUnauthorized: true,
      connectTimeout: 10_000,
      reconnectPeriod: 0, // no reintentar aquí
    });

    const timeout = setTimeout(() => {
      try { client.end(true); } catch {}
      resolve(Response.json({ ok: false, error: "Timeout MQTT" }, { status: 504 }));
    }, 12_000);

    client.on("connect", () => {
      const payload = JSON.stringify({ action });

      client.publish(CMD_TOPIC, payload, { qos: 1 }, (err) => {
        clearTimeout(timeout);
        try { client.end(true); } catch {}

        if (err) {
          resolve(Response.json({ ok: false, error: err.message }, { status: 500 }));
          return;
        }

        resolve(Response.json({ ok: true, action }));
      });
    });

    client.on("error", (err) => {
      clearTimeout(timeout);
      try { client.end(true); } catch {}
      resolve(Response.json({ ok: false, error: err.message }, { status: 500 }));
    });
  });
}
