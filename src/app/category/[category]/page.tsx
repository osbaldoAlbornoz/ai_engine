import CatalogViewer from "@/components/catalog/CatalogViewer";
import { Category } from "@/types/product";
import { notFound } from "next/navigation";
import dynamic from "next/dynamic";

const CategorySeoBlock = dynamic(() => import("@/components/seo/CategorySeoBlock").then(mod => mod.CategorySeoBlock), {
  loading: () => <div className="w-full min-h-[150px] mt-20 flex items-center justify-center animate-pulse bg-zinc-900/20 text-zinc-500 font-heading text-sm rounded-xl">Loading Guide...</div>
});

export function generateStaticParams() {
  return [
    { category: 'gpus' },
    { category: 'laptops' },
    { category: 'npus' },
    { category: 'workstations' },
  ];
}

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const resolvedParams = await params;
  const category = resolvedParams.category as Category;

  const validCategories = ['gpus', 'laptops', 'npus', 'workstations'];
  if (!validCategories.includes(category)) {
    notFound();
  }

  return (
    <>
      <CatalogViewer initialCategory={category} />
      <div className="bg-[#020202] pb-20 px-4 sm:px-6 lg:px-8 relative z-10 -mt-12">
        <CategorySeoBlock category={category} />
      </div>
    </>
  );
}
