import { CompareClientLoader } from "@/components/compare/CompareClientLoader";

// Static metadata - no Supabase calls on the server to avoid Turbopack reload loops in dev.
// Dynamic title updates are handled client-side by CompareTool when products are selected.
export const metadata = {
  title: "Comparar Productos | AI Engine",
  description: "Herramienta interactiva para comparar componentes y laptops para IA.",
};

export default async function ComparePage({ params }: { params: Promise<{ slug?: string[] }> }) {
  const resolvedParams = await params;
  const slugString = resolvedParams.slug?.[0] ?? undefined;

  return (
    <div className="flex flex-col w-full min-h-[calc(100vh-64px)] relative">
      {/* Ambient Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px] -z-20 mix-blend-screen opacity-60 pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[30rem] h-[30rem] bg-accent/20 rounded-full blur-[150px] -z-20 mix-blend-screen opacity-50 pointer-events-none"></div>
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:40px_40px] -z-10 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>

      <CompareClientLoader slugString={slugString} />
    </div>
  );
}
