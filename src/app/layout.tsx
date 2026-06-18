import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Progres Rumah Yayu — 360°",
  description:
    "Foto panorama 360° dokumentasi progres rumah Yayu. Putar dan jelajahi setiap sudut.",
  keywords: [
    "progres rumah yayu",
    "foto 360",
    "panorama",
    "dokumentasi pembangunan",
    "virtual tour",
  ],
  authors: [{ name: "Yayu" }],
  openGraph: {
    title: "Progres Rumah Yayu — 360°",
    description:
      "Foto panorama 360° dokumentasi progres rumah Yayu. Putar dan jelajahi setiap sudut.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Progres Rumah Yayu — 360°",
    description:
      "Foto panorama 360° dokumentasi progres rumah Yayu. Putar dan jelajahi setiap sudut.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className="antialiased bg-black text-white overflow-hidden">
        {children}
      </body>
    </html>
  );
}
