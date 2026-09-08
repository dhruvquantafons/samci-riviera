import type { Metadata } from "next";
import { Cormorant_Garamond, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Hotel Samci Riviera | Luxury Hotel & Dining • Srinagar",
  description: "Experience warm hospitality, refined deluxe rooms, authentic Kashmiri dining, and peaceful valley charm at Hotel Samci Riviera, Srinagar.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${plusJakarta.variable} h-full antialiased scroll-smooth`}
    >
      <body className="min-h-full flex flex-col bg-[#f9f8f5] text-[#1c1b1a] font-sans selection:bg-[#d9c3a3] selection:text-black">
        {children}
      </body>
    </html>
  );
}

