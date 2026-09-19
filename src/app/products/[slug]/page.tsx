import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductBySlug, getRelatedProducts } from "@/lib/product/service";
import { ProductDetailPage } from "@/components/pdp/ProductDetailPage";

interface ProductPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) {
    return {
      title: "محصول یافت نشد | مپوشام",
      description: "محصول مورد نظر یافت نشد.",
    };
  }

  return {
    title: `${product.title} | فروشگاه مپوشام`,
    description: product.description || `خرید اینترنتی ${product.title} با بهترین قیمت و ارسال سریع`,
    openGraph: {
      title: product.title,
      description: product.description,
      images: product.images.map((img) => ({ url: img.url, alt: img.alt })),
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = getProductBySlug(slug, { isHydrated: false });
  const relatedProducts = product ? getRelatedProducts(product, 8, { isHydrated: false }) : [];

  return (
    <ProductDetailPage
      initialProduct={product ?? undefined}
      initialRelatedProducts={relatedProducts}
      slug={slug}
    />
  );
}
