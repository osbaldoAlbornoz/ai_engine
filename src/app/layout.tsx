import type { Metadata } from "next";
import { JetBrains_Mono, Orbitron } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ThreeColumnLayout } from "@/components/layout/ThreeColumnLayout";

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

import { NewSplashScreen } from "@/components/ui/NewSplashScreen";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`h-full antialiased ${jetbrainsMono.variable} ${orbitron.variable}`}
    >
      <body className="min-h-full flex flex-col relative bg-background text-foreground font-sans">
        <NewSplashScreen />
        {/* Optional background glow effect */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
          <div className="absolute -top-[40%] -left-[10%] w-[70%] h-[70%] rounded-full bg-primary/5 blur-[120px]" />
          <div className="absolute top-[60%] -right-[10%] w-[60%] h-[60%] rounded-full bg-accent/5 blur-[120px]" />
        </div>

        <ThreeColumnLayout>
          <Navbar />
          <main className="flex-grow flex flex-col">
            {children}
          </main>
          <Footer />
        </ThreeColumnLayout>
      </body>
    </html>
  );
}
