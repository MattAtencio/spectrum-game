import { DM_Serif_Display, Outfit } from "next/font/google";
import "./globals.css";

const dmSerif = DM_Serif_Display({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-dm-serif",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata = {
  title: "Spectrum — Daily Word Puzzle",
  description: "Sort words into the right order along a gradient. New puzzle every day.",
  manifest: "/manifest.json",
  icons: {
    icon: "/icon-192.png",
    apple: "/icon-192.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Spectrum",
  },
  openGraph: {
    title: "Spectrum — Daily Word Puzzle",
    description: "Sort words into the right order along a gradient. New puzzle every day.",
    type: "website",
    siteName: "Spectrum",
  },
  twitter: {
    card: "summary",
    title: "Spectrum — Daily Word Puzzle",
    description: "Sort words into the right order along a gradient.",
  },
};

export const viewport = {
  themeColor: "#6d28d9",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${dmSerif.variable} ${outfit.variable}`}>
        {children}
      </body>
    </html>
  );
}
