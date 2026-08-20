import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Workout Coach",
  description: "Entrenador personal inteligente",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className="bg-zinc-950 text-white antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
