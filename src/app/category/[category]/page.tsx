import CatalogViewer from "@/components/catalog/CatalogViewer";
import { Category } from "@/data/hardware";
import { notFound } from "next/navigation";

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

  return <CatalogViewer initialCategory={category} />;
}
