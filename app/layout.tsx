import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Brand My Mac — Let your brand travel",
  description:
    "Ten sticker spots on a MacBook Pro lid, sold by live auction. Your logo travels to cafés, coworking spaces and every video I post.",
  openGraph: {
    title: "Brand My Mac — Let your brand travel",
    description:
      "Ten sticker spots on a MacBook Pro lid, sold by live auction.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
