import type { Metadata } from "next";
import { JetBrains_Mono, Orbitron } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/lib/QueryProvider";
import { Suspense } from "react";
import { LayoutContent } from "@/components/layout/LayoutContent";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

const orbitron = Orbitron({
  subsets: ["latin"],
  variable: "--font-orbitron",
  display: "swap",
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://aiengine.example.com"),
  title: "AiEngine | High-Performance AI Hardware",
  description: "Discover and compare the best GPUs, AI Laptops, and NPU Processors for your Artificial Intelligence workloads.",
  openGraph: {
    title: "AiEngine | High-Performance AI Hardware",
    description: "Discover and compare the best GPUs, AI Laptops, and NPU Processors for your Artificial Intelligence workloads.",
    url: "/",
    siteName: "AiEngine",
    images: [
      {
        url: "/og-image.jpg", // placeholder image for social sharing
        width: 1200,
        height: 630,
        alt: "AiEngine Cover Image",
      }
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AiEngine | High-Performance AI Hardware",
    description: "Discover and compare the best GPUs, AI Laptops, and NPU Processors for your Artificial Intelligence workloads.",
    images: ["/og-image.jpg"],
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`h-full antialiased ${jetbrainsMono.variable} ${orbitron.variable}`}
      suppressHydrationWarning
    >
      <body 
        className="min-h-full flex flex-col relative bg-background text-foreground font-sans"
        suppressHydrationWarning
      >
        <QueryProvider>
          <Suspense fallback={null}>
            <LayoutContent>{children}</LayoutContent>
          </Suspense>
        </QueryProvider>
      </body>
    </html>
  );
}