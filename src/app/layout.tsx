import type { Metadata } from "next";
import { Inter, Fustat } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const fustat = Fustat({ subsets: ["latin"], variable: "--font-fustat" });

export const metadata: Metadata = {
  title: "Boiler™ | Ultimate Universal Substrate",
  description: "The professional foundation for modern innovation. High-performance, cross-platform boilerplates for Next.js, iOS, Linux, and more.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${fustat.variable} font-sans bg-black text-white antialiased`}>
        {children}
      </body>
    </html>
  );
}
