import * as mqtt from "mqtt";
import fs from "node:fs";
import path from "node:path";

export const runtime = "nodejs";

const TOPIC_DISTANCE = "/class/idgs12/evaluacion2/2023171015/distance";
const TOPIC_BUTTON = "/class/idgs12/evaluacion2/2023171015/button";

export async function GET() {
  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const host = process.env.MQTT_HOST!;
      const port = Number(process.env.MQTT_PORT ?? "8883");
      const username = process.env.MQTT_USERNAME!;
      const password = process.env.MQTT_PASSWORD!;

      const caPath = path.join(process.cwd(), "certs", "emqxsl_ca.pem");
      const ca = fs.existsSync(caPath) ? fs.readFileSync(caPath) : undefined;

      const client = mqtt.connect(`mqtts://${host}:${port}`, {
        username,
        password,
        ca,
        rejectUnauthorized: true,
        reconnectPeriod: 2000,
        connectTimeout: 10_000,
      });

      const send = (event: string, payload: unknown) => {
        controller.enqueue(
          encoder.encode(
            `event: ${event}\ndata: ${JSON.stringify(payload)}\n\n`
          )
        );
      };

      client.on("connect", () => {
        send("status", { online: true });
        client.subscribe([TOPIC_DISTANCE, TOPIC_BUTTON], { qos: 1 });
      });

      client.on("close", () => send("status", { online: false }));
      client.on("error", (err) => send("error", { message: err.message }));

      client.on("message", (topic, msg) => {
        const text = msg.toString("utf-8");
        try {
          const data = JSON.parse(text);
          if (topic === TOPIC_DISTANCE) send("distance", data);
          if (topic === TOPIC_BUTTON) send("button", data);
        } catch {
          send("raw", { topic, text });
        }
      });

      // Cierre cuando el navegador corte
      const close = () => {
        try { client.end(true); } catch {}
        try { controller.close(); } catch {}
      };

      // @ts-ignore (ReadableStream cancellation)
      this.cancel = close;
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
