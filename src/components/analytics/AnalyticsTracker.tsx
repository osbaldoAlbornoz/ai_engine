"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";

export function AnalyticsTracker() {
  const pathname = usePathname();
  const hasTracked = useRef(false);

  useEffect(() => {
    // Only track once per page load to prevent spam in dev mode or double-fires
    if (!hasTracked.current) {
      hasTracked.current = true;
      
      const trackVisit = async () => {
        try {
          await supabase.rpc('increment_site_visits');
        } catch (error) {
          console.error('Error tracking visit:', error);
        }
      };
      
      trackVisit();
    }
  }, []);

  return null;
}
