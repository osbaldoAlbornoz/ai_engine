"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Con datos frescos por 5 minutos antes de considerarlos "stale"
            staleTime: 5 * 60 * 1000,
            // Caché por 10 minutos antes de eliminar
            gcTime: 10 * 60 * 1000,
            // Reintentar 3 veces en caso de error
            retry: 3,
            // Mostrar loading global mientras se cargan datos
            placeholderData: (prev: unknown) => prev,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}