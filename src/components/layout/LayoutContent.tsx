"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { ThreeColumnLayout } from "./ThreeColumnLayout";
import { GoToTopButton } from "@/components/ui/GoToTopButton";

export function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isSplashRoute = pathname === "/splash";

  // No mostrar navbar/footer en la ruta del splash
  if (isSplashRoute) {
    return children;
  }

  return (
    <>
      {/* Optional background glow effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-[40%] -left-[10%] w-[70%] h-[70%] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute top-[60%] -right-[10%] w-[60%] h-[60%] rounded-full bg-accent/5 blur-[120px]" />
      </div>

      <ThreeColumnLayout>
        <Navbar />
        <main className="flex-grow flex flex-col">
          {children}
          <GoToTopButton />
        </main>
        <Footer />
      </ThreeColumnLayout>
    </>
  );
}