import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "OpenPages Dummy Policy RAG",
  description: "Dummy RAG vs MD testing app"
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}