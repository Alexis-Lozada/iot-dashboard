import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import type { Metadata } from "next";
import { Poppins } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  title: "IoT Dashboard",
  description: "Dashboard de monitoreo IoT (MQTT/WSS) con tema y WCAG básico",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" suppressHydrationWarning className={poppins.variable}>
      <body className="min-h-screen bg-bg text-fg font-sans">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
