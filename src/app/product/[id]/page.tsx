import { ProductClientLoader } from "@/components/product/ProductClientLoader";

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return <ProductClientLoader id={id} />;
}
