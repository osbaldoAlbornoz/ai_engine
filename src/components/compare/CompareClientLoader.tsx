"use client";

import { CompareTool } from "@/components/compare/CompareTool";

export function CompareClientLoader({ slugString }: { slugString?: string }) {
  return <CompareTool slugString={slugString} />;
}
