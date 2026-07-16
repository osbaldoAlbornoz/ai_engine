"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

/**
 * Componente que redirige al splash screen en la página principal
 * Solo para usuarios que no han entrado antes
 */
export function SplashRedirect() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Solo redirigir en la página principal
    if (pathname !== "/") return;

    const hasEntered = localStorage.getItem("aiEngineEntered");

    if (!hasEntered) {
      // Usuario nuevo: redirigir al splash page de Next.js
      router.push("/splash");
    }
    // Si ya entró, no hacer nada (deja que la página se renderice normal)
  }, [pathname, router]);

  return null;
}
