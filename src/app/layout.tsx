import type { Metadata } from "next";
import { JetBrains_Mono, Orbitron } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/lib/QueryProvider";
import { Suspense } from "react";
import { LayoutContent } from "@/components/layout/LayoutContent";
import { AnalyticsTracker } from "@/components/analytics/AnalyticsTracker";

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
  metadataBase: new URL("https://theaienginelab.com"),
  title: "The AI Engine Lab | High-Performance AI Hardware",
  description: "Discover and compare the best GPUs, AI Laptops, and NPU Processors for your Artificial Intelligence workloads.",
  openGraph: {
    title: "The AI Engine Lab | High-Performance AI Hardware",
    description: "Discover and compare the best GPUs, AI Laptops, and NPU Processors for your Artificial Intelligence workloads.",
    url: "/",
    siteName: "The AI Engine Lab",
    images: [
      {
        url: "/og-image.jpg", // placeholder image for social sharing
        width: 1200,
        height: 630,
        alt: "The AI Engine Lab Cover Image",
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
        <AnalyticsTracker />
        
        {/* Premium DeFi Yield Grid Background - Global */}
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
          {/* Glow 1 */}
          <div className="absolute top-20 left-1/4 w-[500px] h-[500px] rounded-full bg-primary/10 blur-[150px]"></div>
          {/* Glow 2 */}
          <div className="absolute bottom-20 right-1/4 w-[400px] h-[400px] rounded-full bg-accent/10 blur-[150px]"></div>
          {/* Grid Pattern */}
          <div 
            className="absolute inset-0 opacity-10" 
            style={{ 
              backgroundImage: "linear-gradient(var(--primary) 1px, transparent 1px), linear-gradient(90deg, var(--primary) 1px, transparent 1px)", 
              backgroundSize: "50px 50px" 
            }}
          ></div>
        </div>

        <div className="relative z-10 flex-1 flex flex-col w-full">
          <QueryProvider>
          <Suspense fallback={null}>
            <LayoutContent>{children}</LayoutContent>
          </Suspense>
        </QueryProvider>
        </div>
      </body>
    </html>
  );
}