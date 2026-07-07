import { ProductFormView } from "@/components/products/product-form-view";

export default async function ProductEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ProductFormView mode="edit" productId={Number(id)} />;
}
