import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getProduct,
  getProductParams,
  getProductView,
  isCollection,
} from "@/lib/products";
import { SITE_URL } from "@/lib/seo";
import ProductView from "@/components/Product/ProductView";

type RouteParams = { section: string; product: string };

export function generateStaticParams() {
  return getProductParams();
}

function plainText(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<RouteParams>;
}): Promise<Metadata> {
  const { section, product: slug } = await params;
  const product = getProduct(slug);
  if (!product || !isCollection(section)) return {};

  const description = plainText(product.description).slice(0, 200);
  const image = product.collections[section]?.main?.desktop?.[0]?.src;

  return {
    title: product.title,
    description,
    alternates: { canonical: `/product/${section}/${slug}` },
    openGraph: {
      title: product.title,
      description,
      url: `/product/${section}/${slug}`,
      type: "website",
      ...(image ? { images: [{ url: image, alt: product.title }] } : {}),
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<RouteParams>;
}) {
  const { section, product: slug } = await params;

  if (!isCollection(section)) notFound();

  const product = getProduct(slug);
  if (!product || !product.collections[section]?.main?.desktop?.length) notFound();

  // No commerce on the page, so this describes the entry rather than an offer.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: product.title,
    description: plainText(product.description),
    url: `${SITE_URL}/product/${section}/${slug}`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductView key={`${section}/${slug}`} product={getProductView(product, section)} />
    </>
  );
}
